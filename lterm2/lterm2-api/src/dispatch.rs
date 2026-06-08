use crate::sessions::{self, make_session_id};
use crate::{
    activate_request, activate_response, client_originated_message, create_tab_response,
    send_text_response, server_originated_message, split_pane_request, split_pane_response,
    ActivateRequest, ActivateResponse, ClientOriginatedMessage, CreateTabRequest,
    CreateTabResponse, ListSessionsResponse, SendTextRequest, SendTextResponse,
    ServerOriginatedMessage, SplitPaneRequest, SplitPaneResponse,
};
use anyhow::{anyhow, Context};
use config::keyassignment::SpawnTabDomain;
use flume::{Receiver, Sender};
use mux::domain::SplitSource;
use mux::tab::{SplitRequest, SplitSize};
use mux::Mux;
use promise::spawn::spawn_into_main_thread;
use std::io::Write;

pub async fn handle_message(
    msg: ClientOriginatedMessage,
) -> anyhow::Result<ServerOriginatedMessage> {
    let id = msg.id;
    let response = match msg.submessage {
        Some(client_originated_message::Submessage::ListSessionsRequest(_)) => {
            ServerOriginatedMessage {
                id,
                submessage: Some(
                    server_originated_message::Submessage::ListSessionsResponse(
                        run_on_main(build_list_sessions).await?,
                    ),
                ),
                ..Default::default()
            }
        }
        Some(client_originated_message::Submessage::SendTextRequest(req)) => {
            ServerOriginatedMessage {
                id,
                submessage: Some(server_originated_message::Submessage::SendTextResponse(
                    run_on_main(move || handle_send_text(req)).await?,
                )),
                ..Default::default()
            }
        }
        Some(client_originated_message::Submessage::SplitPaneRequest(req)) => {
            ServerOriginatedMessage {
                id,
                submessage: Some(server_originated_message::Submessage::SplitPaneResponse(
                    run_on_main(move || handle_split_pane(req)).await?,
                )),
                ..Default::default()
            }
        }
        Some(client_originated_message::Submessage::CreateTabRequest(req)) => {
            ServerOriginatedMessage {
                id,
                submessage: Some(server_originated_message::Submessage::CreateTabResponse(
                    run_on_main(move || handle_create_tab(req)).await?,
                )),
                ..Default::default()
            }
        }
        Some(client_originated_message::Submessage::ActivateRequest(req)) => {
            ServerOriginatedMessage {
                id,
                submessage: Some(server_originated_message::Submessage::ActivateResponse(
                    run_on_main(move || handle_activate(req)).await?,
                )),
                ..Default::default()
            }
        }
        Some(client_originated_message::Submessage::FocusRequest(_)) => ServerOriginatedMessage {
            id,
            submessage: Some(server_originated_message::Submessage::ListSessionsResponse(
                run_on_main(build_list_sessions).await?,
            )),
            ..Default::default()
        },
        Some(_) => ServerOriginatedMessage {
            id,
            submessage: Some(server_originated_message::Submessage::Error(
                "unimplemented".to_string(),
            )),
            ..Default::default()
        },
        None => ServerOriginatedMessage {
            id,
            submessage: Some(server_originated_message::Submessage::Error(
                "malformed request".to_string(),
            )),
            ..Default::default()
        },
    };
    Ok(response)
}

async fn run_on_main<T: Send + 'static>(
    f: impl FnOnce() -> anyhow::Result<T> + Send + 'static,
) -> anyhow::Result<T>
where
    T: Send + 'static,
{
    let (tx, rx): (Sender<anyhow::Result<T>>, Receiver<anyhow::Result<T>>) = flume::bounded(1);
    spawn_into_main_thread(async move {
        let _ = tx.send(f());
    })
    .detach();
    rx.recv_async()
        .await
        .map_err(|_| anyhow!("main thread dropped lTerm2 API response"))?
}

fn build_list_sessions() -> anyhow::Result<ListSessionsResponse> {
    Ok(sessions::build_list_sessions_response())
}

fn handle_send_text(req: SendTextRequest) -> anyhow::Result<SendTextResponse> {
    let session = req.session.as_deref().unwrap_or("active");
    let text = req.text.as_deref().unwrap_or("");
    let pane_id = sessions::resolve_pane_id(session).ok_or_else(|| anyhow!("no such session"))?;
    let mux = Mux::get();
    let pane = mux
        .get_pane(pane_id)
        .ok_or_else(|| anyhow!("pane not found"))?;
    pane.writer().write_all(text.as_bytes())?;
    Ok(SendTextResponse {
        status: Some(send_text_response::Status::Ok as i32),
    })
}

fn handle_split_pane(req: SplitPaneRequest) -> anyhow::Result<SplitPaneResponse> {
    let session = req.session.as_deref().unwrap_or("active");
    let pane_id = sessions::resolve_pane_id(session).ok_or_else(|| anyhow!("no such session"))?;

    let vertical = req.split_direction.unwrap_or(0)
        == split_pane_request::SplitDirection::Vertical as i32;
    let before = req.before.unwrap_or(false);
    let (direction, _) = sessions::split_direction_to_mux(vertical, before);

    let mux = Mux::get();
    let request = SplitRequest {
        direction,
        size: SplitSize::Percent(50),
        top_level: false,
        target_is_second: !before,
    };

    let result = promise::spawn::block_on(async {
        mux.split_pane(
            pane_id,
            request,
            SplitSource::Spawn {
                command: None,
                command_dir: None,
            },
            SpawnTabDomain::CurrentPaneDomain,
        )
        .await
    });

    match result {
        Ok((pane, _size)) => {
            let (_, window_id, tab_id) = mux.resolve_pane_id(pane.pane_id()).unwrap();
            Ok(SplitPaneResponse {
                status: Some(split_pane_response::Status::Ok as i32),
                session_id: vec![make_session_id(window_id, tab_id, pane.pane_id())],
            })
        }
        Err(err) => {
            log::error!("split_pane failed: {:#}", err);
            Ok(SplitPaneResponse {
                status: Some(split_pane_response::Status::CannotSplit as i32),
                session_id: vec![],
            })
        }
    }
}

fn handle_create_tab(req: CreateTabRequest) -> anyhow::Result<CreateTabResponse> {
    let mux = Mux::get();
    let window_id: Option<usize> = req
        .window_id
        .as_deref()
        .map(|s| s.parse())
        .transpose()
        .context("parse window_id")?;

    let config = config::configuration();
    let dpi = config.dpi.unwrap_or(96.0) as u32;
    let size = config.initial_size(dpi, None);

    let result = promise::spawn::block_on(async {
        mux.spawn_tab_or_window(
            window_id,
            SpawnTabDomain::DefaultDomain,
            None,
            None,
            size,
            None,
            mux.active_workspace().to_string(),
            None,
        )
        .await
    });

    match result {
        Ok((tab, pane, window_id)) => {
            let tab_id = tab.tab_id();
            Ok(CreateTabResponse {
                status: Some(create_tab_response::Status::Ok as i32),
                window_id: Some(window_id.to_string()),
                tab_id: Some(tab_id as i32),
                session_id: Some(make_session_id(window_id, tab_id, pane.pane_id())),
            })
        }
        Err(err) => {
            log::error!("create_tab failed: {:#}", err);
            Ok(CreateTabResponse {
                status: Some(create_tab_response::Status::InvalidWindowId as i32),
                window_id: None,
                tab_id: None,
                session_id: None,
            })
        }
    }
}

fn handle_activate(req: ActivateRequest) -> anyhow::Result<ActivateResponse> {
    let mux = Mux::get();
    if let Some(activate_request::Identifier::SessionId(session)) = req.identifier {
        if let Some(pane_id) = sessions::resolve_pane_id(&session) {
            if let Some((_, window_id, tab_id)) = mux.resolve_pane_id(pane_id) {
                if let Some(mut window) = mux.get_window_mut(window_id) {
                    let idx = window.iter().position(|t| t.tab_id() == tab_id);
                    if let Some(idx) = idx {
                        window.save_and_then_set_active(idx);
                    }
                }
                if let Some(tab) = mux.get_tab(tab_id) {
                    if let Some(pane) = mux.get_pane(pane_id) {
                        tab.set_active_pane(&pane);
                    }
                }
            }
        }
    }
    Ok(ActivateResponse {
        status: Some(activate_response::Status::Ok as i32),
    })
}

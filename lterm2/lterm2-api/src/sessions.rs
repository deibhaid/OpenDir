use crate::{list_sessions_response, ListSessionsResponse, SessionSummary, Size, SplitTreeNode};
use mux::pane::PaneId;
use mux::tab::{PositionedPane, SplitDirection, TabId};
use mux::window::WindowId;
use mux::Mux;

pub fn make_session_id(window_id: WindowId, tab_id: TabId, pane_id: PaneId) -> String {
    format!("w{}t{}p{}", window_id, tab_id, pane_id)
}

pub fn parse_session_id(session: &str) -> Option<(WindowId, TabId, PaneId)> {
    let session = session.strip_prefix('p').unwrap_or(session);
    if let Some(rest) = session.strip_prefix('w') {
        let (w, rest) = rest.split_once('t')?;
        let (t, p) = rest.split_once('p')?;
        return Some((w.parse().ok()?, t.parse().ok()?, p.parse().ok()?));
    }
    if let Ok(pane_id) = session.parse::<PaneId>() {
        let mux = Mux::get();
        let (_domain_id, window_id, tab_id) = mux.resolve_pane_id(pane_id)?;
        return Some((window_id, tab_id, pane_id));
    }
    None
}

pub fn resolve_pane_id(session: &str) -> Option<PaneId> {
    if session == "active" {
        return active_pane_id();
    }
    if session == "all" {
        return None;
    }
    parse_session_id(session).map(|(_, _, pane_id)| pane_id)
}

pub fn active_pane_id() -> Option<PaneId> {
    let mux = Mux::get();
    for window_id in mux.iter_windows() {
        if let Some(tab) = mux.get_active_tab_for_window(window_id) {
            if let Some(pane) = tab.get_active_pane() {
                return Some(pane.pane_id());
            }
        }
    }
    None
}

pub fn build_list_sessions_response() -> ListSessionsResponse {
    let mux = Mux::get();
    let mut windows = vec![];

    for (win_idx, window_id) in mux.iter_windows().into_iter().enumerate() {
        let Some(window) = mux.get_window(window_id) else {
            continue;
        };
        let mut tabs = vec![];
        for tab in window.iter() {
            let tab_id = tab.tab_id();
            let positioned = tab.iter_panes();
            let root = build_split_tree(&positioned, window_id, tab_id);
            tabs.push(list_sessions_response::Tab {
                tab_id: Some(tab_id.to_string()),
                root,
                tmux_window_id: None,
                tmux_connection_id: None,
                minimized_sessions: vec![],
            });
        }
        windows.push(list_sessions_response::Window {
            tabs,
            window_id: Some(window_id.to_string()),
            frame: None,
            number: Some(win_idx as i32),
        });
    }

    ListSessionsResponse {
        windows,
        buried_sessions: vec![],
    }
}

fn build_split_tree(
    panes: &[PositionedPane],
    window_id: WindowId,
    tab_id: TabId,
) -> Option<SplitTreeNode> {
    if panes.is_empty() {
        return None;
    }
    if panes.len() == 1 {
        return Some(leaf_node(&panes[0], window_id, tab_id));
    }
    let links = panes
        .iter()
        .map(|p| crate::split_tree_node::SplitTreeLink {
            child: Some(crate::split_tree_node::split_tree_link::Child::Session(
                session_summary_for_pane(p, window_id, tab_id),
            )),
        })
        .collect();
    Some(SplitTreeNode {
        vertical: Some(true),
        links,
    })
}

fn leaf_node(pane: &PositionedPane, window_id: WindowId, tab_id: TabId) -> SplitTreeNode {
    SplitTreeNode {
        vertical: Some(false),
        links: vec![crate::split_tree_node::SplitTreeLink {
            child: Some(crate::split_tree_node::split_tree_link::Child::Session(
                session_summary_for_pane(pane, window_id, tab_id),
            )),
        }],
    }
}

fn session_summary_for_pane(
    pane: &PositionedPane,
    window_id: WindowId,
    tab_id: TabId,
) -> SessionSummary {
    let dims = pane.pane.get_dimensions();
    SessionSummary {
        unique_identifier: Some(make_session_id(window_id, tab_id, pane.pane.pane_id())),
        frame: None,
        grid_size: Some(Size {
            width: Some(dims.cols as i32),
            height: Some(dims.viewport_rows as i32),
        }),
        title: Some(pane.pane.get_title()),
    }
}

pub fn split_direction_to_mux(vertical: bool, before: bool) -> (SplitDirection, bool) {
    if vertical {
        (SplitDirection::Vertical, before)
    } else {
        (SplitDirection::Horizontal, before)
    }
}

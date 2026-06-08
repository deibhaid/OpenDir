use crate::auth::AuthManager;
use crate::dispatch;
use crate::ClientOriginatedMessage;
use anyhow::Context;
use futures_util::{SinkExt, StreamExt};
use prost::Message;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::io::{AsyncRead, AsyncWrite};
use tokio::net::UnixListener;
use tokio_tungstenite::tungstenite::handshake::server::{Callback, ErrorResponse, Request, Response};
use tokio_tungstenite::tungstenite::http::HeaderValue;
use tokio_tungstenite::accept_hdr_async;

const SUBPROTOCOL: &str = "api.iterm2.com";

pub async fn run(socket_path: PathBuf, auth: Arc<AuthManager>) -> anyhow::Result<()> {
    let listener = UnixListener::bind(&socket_path)
        .with_context(|| format!("binding lTerm2 API socket {}", socket_path.display()))?;
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        std::fs::set_permissions(&socket_path, std::fs::Permissions::from_mode(0o600))?;
    }

    loop {
        let (stream, _) = listener.accept().await?;
        let auth = Arc::clone(&auth);
        tokio::spawn(async move {
            if let Err(err) = handle_connection(stream, auth).await {
                log::debug!("lTerm2 API connection ended: {:#}", err);
            }
        });
    }
}

async fn handle_connection<S>(stream: S, auth: Arc<AuthManager>) -> anyhow::Result<()>
where
    S: AsyncRead + AsyncWrite + Unpin + Send + 'static,
{
    let auth_cb = AuthCallback { auth };
    let mut ws = accept_hdr_async(stream, auth_cb).await?;

    while let Some(frame) = ws.next().await {
        let frame = frame?;
        if !frame.is_binary() {
            continue;
        }
        let data: Vec<u8> = frame.into_data().into();
        let req = ClientOriginatedMessage::decode(data.as_slice())?;
        let resp = dispatch::handle_message(req).await?;
        let bytes = resp.encode_to_vec();
        ws.send(tokio_tungstenite::tungstenite::Message::Binary(bytes.into()))
            .await?;
    }
    Ok(())
}

struct AuthCallback {
    auth: Arc<AuthManager>,
}

impl Callback for AuthCallback {
    fn on_request(self, request: &Request, response: Response) -> Result<Response, ErrorResponse> {
        let cookie = request
            .headers()
            .get("x-iterm2-cookie")
            .and_then(|v| v.to_str().ok());

        let authorized = self.auth.allow_unauthenticated()
            || cookie
                .map(|c| self.auth.validate_cookie(c))
                .unwrap_or(false);

        if !authorized {
            return Err(ErrorResponse::new(Some(
                "401 Unauthorized: run `lterm2 request-cookie` to obtain a cookie".into(),
            )));
        }

        let mut response = response;
        response
            .headers_mut()
            .insert("Sec-WebSocket-Protocol", HeaderValue::from_static(SUBPROTOCOL));
        response.headers_mut().insert(
            "X-iTerm2-Protocol-Version",
            HeaderValue::from_static("1.0"),
        );
        Ok(response)
    }
}

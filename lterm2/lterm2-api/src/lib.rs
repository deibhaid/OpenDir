//! lTerm2 API — iTerm2-compatible protobuf/WebSocket scripting server.
//!
//! Implements the wire protocol used by the official `iterm2` Python package so
//! existing iTerm2 automation scripts can run against lTerm2 on Linux.

mod auth;
mod dispatch;
mod paths;
mod sessions;

pub use auth::AuthManager;
pub use paths::{api_enabled_marker_path, socket_path};

include!(concat!(env!("OUT_DIR"), "/iterm2.rs"));

use std::sync::Arc;
use std::thread;

/// Start the iTerm2-compatible API server on a background thread.
pub fn start_api_server() -> anyhow::Result<()> {
    if !api_enabled() {
        log::info!("lTerm2 Python API is disabled (unset LTERM2_DISABLE_PYTHON_API to enable)");
        return Ok(());
    }

    let socket = socket_path();
    if let Some(parent) = socket.parent() {
        std::fs::create_dir_all(parent)?;
    }
    if socket.exists() {
        std::fs::remove_file(&socket)?;
    }

    let auth = Arc::new(AuthManager::new());
    thread::Builder::new()
        .name("lterm2-api".into())
        .spawn(move || {
            let rt = tokio::runtime::Builder::new_multi_thread()
                .enable_all()
                .thread_name("lterm2-api-tokio")
                .build()
                .expect("tokio runtime");
            if let Err(err) = rt.block_on(server::run(socket, auth)) {
                log::error!("lTerm2 API server exited: {:#}", err);
            }
        })?;

    log::info!(
        "lTerm2 Python API listening on {} (iTerm2 protocol compatible)",
        socket_path().display()
    );
    Ok(())
}

/// Whether the Python API is enabled. lTerm2 enables it by default; set
/// `LTERM2_DISABLE_PYTHON_API=1` to turn it off.
pub fn api_enabled() -> bool {
    !std::env::var_os("LTERM2_DISABLE_PYTHON_API").is_some()
}

mod server;

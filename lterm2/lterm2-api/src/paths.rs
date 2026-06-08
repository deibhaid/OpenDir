use std::path::PathBuf;

/// XDG config dir marker: `~/.config/lterm2/enable-python-api`
pub fn api_enabled_marker_path() -> PathBuf {
    config::DATA_DIR.join("lterm2").join("enable-python-api")
}

/// Unix socket for the iTerm2 Python API: `~/.local/share/wezterm/lterm2/private/socket`
/// (uses WezTerm data dir for co-installation compatibility).
pub fn socket_path() -> PathBuf {
    config::DATA_DIR
        .join("lterm2")
        .join("private")
        .join("socket")
}

/// Directory for user Python scripts.
pub fn scripts_dir() -> PathBuf {
    config::DATA_DIR.join("lterm2").join("Scripts")
}

/// Directory for autolaunch daemon scripts.
pub fn autolaunch_scripts_dir() -> PathBuf {
    scripts_dir().join("AutoLaunch")
}

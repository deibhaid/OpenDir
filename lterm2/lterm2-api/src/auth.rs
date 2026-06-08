use parking_lot::Mutex;
use rand::Rng;
use std::collections::HashSet;

const COOKIE_BYTES: usize = 16;

/// Manages single-use authentication cookies for API clients.
pub struct AuthManager {
    cookies: Mutex<HashSet<String>>,
}

impl AuthManager {
    pub fn new() -> Self {
        Self {
            cookies: Mutex::new(HashSet::new()),
        }
    }

    /// Issue a fresh cookie and optional script-console key for a launched script.
    pub fn issue_cookie_and_key(&self, script_name: &str) -> (String, String) {
        let cookie = Self::random_hex(COOKIE_BYTES);
        self.cookies.lock().insert(cookie.clone());
        let key = format!("{}:{}", script_name, Self::random_hex(8));
        (cookie, key)
    }

    /// Validate and consume a cookie (single use, matching iTerm2 semantics).
    pub fn validate_cookie(&self, cookie: &str) -> bool {
        self.cookies.lock().remove(cookie)
    }

    /// Allow connections without a cookie when explicitly disabled for development.
    pub fn allow_unauthenticated(&self) -> bool {
        std::env::var_os("LTERM2_API_INSECURE").is_some()
    }

    fn random_hex(nbytes: usize) -> String {
        let mut rng = rand::thread_rng();
        let bytes: Vec<u8> = (0..nbytes).map(|_| rng.gen()).collect();
        bytes.iter().map(|b| format!("{:02x}", b)).collect()
    }
}


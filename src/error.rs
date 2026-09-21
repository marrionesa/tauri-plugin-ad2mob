//! Typed errors for the `tauri-plugin-ad2mob` plugin.
//!
//! Every error carries a stable machine readable [`Error::code`] that matches the
//! `AdMobErrorCode` union exposed by the TypeScript bindings, so guest code can
//! branch on errors without parsing messages.

use serde::{ser::Serializer, Serialize};

/// Convenient result alias used across the plugin.
pub type Result<T> = std::result::Result<T, Error>;

/// The error type of every plugin command.
#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
pub enum Error {
    #[error("the plugin is not initialized yet; call `AdMob.initialize()` first")]
    NotInitialized,
    #[error("invalid configuration: {0}")]
    InvalidConfiguration(String),
    #[error("invalid argument: {0}")]
    InvalidArgument(String),
    #[error("the ad is not ready yet; load it first and wait for it to resolve")]
    AdNotReady,
    #[error(
        "consent is required before ads can be requested; call `AdMob.requestConsent()` first"
    )]
    ConsentRequired,
    #[error("failed to load the ad: {0}")]
    LoadFailed(String),
    #[error("failed to show the ad: {0}")]
    ShowFailed(String),
    #[error("this API is not supported on {0}")]
    UnsupportedPlatform(String),
    #[error("native error: {0}")]
    Native(String),
}

impl Error {
    /// Stable machine readable code shared with the TypeScript bindings
    /// (`AdMobErrorCode` in `guest-js/errors.ts`).
    pub fn code(&self) -> &'static str {
        match self {
            Error::NotInitialized => "NOT_INITIALIZED",
            Error::InvalidConfiguration(_) => "INVALID_CONFIGURATION",
            Error::InvalidArgument(_) => "INVALID_ARGUMENT",
            Error::AdNotReady => "AD_NOT_READY",
            Error::ConsentRequired => "CONSENT_REQUIRED",
            Error::LoadFailed(_) => "LOAD_FAILED",
            Error::ShowFailed(_) => "SHOW_FAILED",
            Error::UnsupportedPlatform(_) => "UNSUPPORTED_PLATFORM",
            Error::Native(_) => "NATIVE_ERROR",
        }
    }

    /// Helper for building the platform error with a human readable platform name.
    pub(crate) fn unsupported_current_platform() -> Self {
        Error::UnsupportedPlatform(crate::models::Platform::current().as_str().to_string())
    }

    /// Maps an error response coming from the native (Kotlin/Swift) side into a
    /// typed error. Native rejections use the same stable codes as this enum.
    #[cfg_attr(not(mobile), allow(dead_code))]
    pub(crate) fn from_error_response(code: Option<&String>, message: Option<&String>) -> Self {
        let message = message.cloned().unwrap_or_default();
        match code.map(String::as_str) {
            Some("NOT_INITIALIZED") => Error::NotInitialized,
            Some("AD_NOT_READY") => Error::AdNotReady,
            Some("CONSENT_REQUIRED") => Error::ConsentRequired,
            Some("INVALID_CONFIGURATION") => Error::InvalidConfiguration(message),
            Some("INVALID_ARGUMENT") => Error::InvalidArgument(message),
            Some("LOAD_FAILED") => Error::LoadFailed(message),
            Some("SHOW_FAILED") => Error::ShowFailed(message),
            Some("UNSUPPORTED_PLATFORM") => Error::unsupported_current_platform(),
            Some("NATIVE_ERROR") | None => Error::Native(message),
            Some(other) => Error::Native(format!("[{other}] {message}")),
        }
    }
}

#[cfg(mobile)]
impl From<tauri::plugin::mobile::PluginInvokeError> for Error {
    fn from(error: tauri::plugin::mobile::PluginInvokeError) -> Self {
        use tauri::plugin::mobile::PluginInvokeError as E;
        match error {
            E::InvokeRejected(response) => {
                Error::from_error_response(response.code.as_ref(), response.message.as_ref())
            }
            other => Error::Native(other.to_string()),
        }
    }
}

impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        // Serialized as `{ code, message }` so the guest bindings can rebuild a
        // typed `AdMobError` instance from any rejected invoke.
        use serde::ser::SerializeStruct;
        let mut state = serializer.serialize_struct("AdMobError", 2)?;
        state.serialize_field("code", self.code())?;
        state.serialize_field("message", &self.to_string())?;
        state.end()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn codes_are_stable() {
        assert_eq!(Error::NotInitialized.code(), "NOT_INITIALIZED");
        assert_eq!(
            Error::InvalidConfiguration("bad".into()).code(),
            "INVALID_CONFIGURATION"
        );
        assert_eq!(
            Error::InvalidArgument("bad".into()).code(),
            "INVALID_ARGUMENT"
        );
        assert_eq!(Error::AdNotReady.code(), "AD_NOT_READY");
        assert_eq!(Error::ConsentRequired.code(), "CONSENT_REQUIRED");
        assert_eq!(Error::LoadFailed("x".into()).code(), "LOAD_FAILED");
        assert_eq!(Error::ShowFailed("x".into()).code(), "SHOW_FAILED");
        assert_eq!(
            Error::UnsupportedPlatform("desktop".into()).code(),
            "UNSUPPORTED_PLATFORM"
        );
        assert_eq!(Error::Native("x".into()).code(), "NATIVE_ERROR");
    }

    #[test]
    fn serializes_to_code_and_message() {
        let value = serde_json::to_value(Error::AdNotReady).unwrap();
        assert_eq!(value["code"], "AD_NOT_READY");
        assert!(value["message"].as_str().unwrap().contains("not ready"));
    }

    #[test]
    fn maps_error_responses_from_native() {
        let code = Some("LOAD_FAILED".to_string());
        let message = Some("no fill".to_string());
        match Error::from_error_response(code.as_ref(), message.as_ref()) {
            Error::LoadFailed(message) => assert_eq!(message, "no fill"),
            other => panic!("unexpected error: {other:?}"),
        }
    }

    #[test]
    fn maps_unknown_codes_to_native_error() {
        let code = Some("SOMETHING_NEW".to_string());
        match Error::from_error_response(code.as_ref(), None) {
            Error::Native(_) => {}
            other => panic!("unexpected error: {other:?}"),
        }
    }
}

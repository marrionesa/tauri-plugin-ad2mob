//! Google AdMob (Mobile Ads) integration for Tauri v2 apps on Android and iOS.
//!
//! `tauri-plugin-ad2mob` is an independent community plugin that bridges the
//! Google Mobile Ads SDK, Google UMP (consent) and iOS App Tracking
//! Transparency into a single strongly typed TypeScript API.
//!
//! # Getting started
//!
//! Register the plugin in your Tauri builder:
//!
//! ```rust,ignore
//! fn main() {
//!     tauri::Builder::default()
//!         .plugin(tauri_plugin_ad2mob::init())
//!         .run(tauri::generate_context!())
//!         .expect("error while running tauri application");
//! }
//! ```
//!
//! # Cargo features
//!
//! The plugin compiles for desktop targets as well; every mobile-only command
//! returns a controlled `UNSUPPORTED_PLATFORM` error there (see the README for
//! details).
//!
//! # Module overview
//!
//! - [`models`]: public data types and event names.
//! - [`state`]: pure state machine, validation helpers and Google test IDs.
//! - [`error`]: typed error model shared with the TypeScript bindings.

use tauri::{plugin::Builder as PluginBuilder, Manager, Runtime};

mod commands;
mod error;
mod models;
mod state;

#[cfg(desktop)]
mod desktop;
#[cfg(mobile)]
mod mobile;

pub use error::{Error, Result};
pub use models::*;
pub use state::{
    test_ids, validate, AdSlot, AdSlotState, BannerSlot, BannerState, InnerState, SharedState,
};

#[cfg(desktop)]
pub use desktop::Admob;
#[cfg(mobile)]
pub use mobile::Admob;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`], [`tauri::Window`] and
/// [`tauri::Webview`] to access the native AdMob transport.
pub trait AdMobExt<R: Runtime> {
    fn admob(&self) -> &Admob<R>;
}

impl<R: Runtime, T: Manager<R>> AdMobExt<R> for T {
    fn admob(&self) -> &Admob<R> {
        self.state::<Admob<R>>().inner()
    }
}

/// Initializes the plugin.
///
/// ```rust,ignore
/// fn main() {
///     tauri::Builder::default()
///         .plugin(tauri_plugin_ad2mob::init())
///         .run(tauri::generate_context!())
///         .expect("error while running tauri application");
/// }
/// ```
pub fn init<R: Runtime>() -> tauri::plugin::TauriPlugin<R, serde_json::Value> {
    build_plugin(None)
}

/// Initializes the plugin with inline configuration.
///
/// This is the typed alternative to the `plugins > ad2mob` section of
/// `tauri.conf.json`. Runtime calls to `AdMob.initialize()` still take
/// precedence over this configuration.
///
/// ```rust,ignore
/// tauri::Builder::default()
///     .plugin(tauri_plugin_ad2mob::init_with_config(serde_json::json!({
///         "isTesting": true,
///         "initializeOnStartup": true,
///     })))
///     .run(tauri::generate_context!())
///     .expect("error while running tauri application");
/// ```
pub fn init_with_config<R: Runtime>(
    config: serde_json::Value,
) -> tauri::plugin::TauriPlugin<R, serde_json::Value> {
    build_plugin(Some(config.to_string()))
}

fn build_plugin<R: Runtime>(
    raw_config: Option<String>,
) -> tauri::plugin::TauriPlugin<R, serde_json::Value> {
    PluginBuilder::<R, serde_json::Value>::new("ad2mob")
        .invoke_handler(tauri::generate_handler![
            commands::initialize,
            commands::configure,
            commands::is_supported,
            commands::get_status,
            commands::request_consent,
            commands::get_consent_status,
            commands::request_tracking_authorization,
            commands::get_tracking_authorization_status,
            commands::load_interstitial,
            commands::show_interstitial,
            commands::is_interstitial_ready,
            commands::destroy_interstitial,
            commands::load_rewarded,
            commands::show_rewarded,
            commands::is_rewarded_ready,
            commands::destroy_rewarded,
            commands::show_banner,
            commands::hide_banner,
            commands::is_banner_visible,
            commands::set_banner_position,
            commands::destroy_banner,
            commands::destroy,
        ])
        .setup(move |app, api| {
            let raw_config = raw_config.clone().unwrap_or_else(|| {
                serde_json::to_string(api.config()).unwrap_or_else(|_| "null".to_string())
            });
            let config: AdMobConfig = serde_json::from_str(&raw_config).unwrap_or_default();

            #[cfg(mobile)]
            let admob = mobile::init(app, api)?;
            #[cfg(desktop)]
            let admob = desktop::init(app, api)?;
            app.manage(admob);
            app.manage(SharedState::with_config(config.clone()));

            if config.initialize_on_startup {
                let handle = app.clone();
                tauri::async_runtime::spawn(async move {
                    commands::initialize_on_startup(handle).await;
                });
            }

            Ok(())
        })
        .build()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn startup_config_is_parsed_from_json() {
        let raw = serde_json::json!({
            "androidAppId": "ca-app-pub-3940256099942544~3347511713",
            "isTesting": true,
            "initializeOnStartup": true
        });
        let config: AdMobConfig = serde_json::from_str(&raw.to_string()).unwrap();
        assert!(config.initialize_on_startup);
        assert!(config.is_testing);

        // a null/missing configuration yields defaults
        let empty: AdMobConfig = serde_json::from_str("null").unwrap_or_default();
        assert!(!empty.initialize_on_startup);
    }
}

const COMMANDS: &[&str] = &[
    "initialize",
    "configure",
    "is_supported",
    "get_status",
    "request_consent",
    "get_consent_status",
    "request_tracking_authorization",
    "get_tracking_authorization_status",
    "load_interstitial",
    "show_interstitial",
    "is_interstitial_ready",
    "destroy_interstitial",
    "load_rewarded",
    "show_rewarded",
    "is_rewarded_ready",
    "destroy_rewarded",
    "show_banner",
    "hide_banner",
    "is_banner_visible",
    "set_banner_position",
    "destroy_banner",
    "destroy",
    // commands implemented by the Tauri mobile `Plugin` base classes, required by
    // `addPluginListener` on the guest side. Without an ACL entry these calls are
    // rejected by the runtime authority before they ever reach the native plugin.
    "register_listener",
    "remove_listener",
];

fn main() {
    let result = tauri_plugin::Builder::new(COMMANDS)
        .android_path("android")
        .ios_path("ios")
        .ios_frameworks(["GoogleMobileAds", "GoogleUserMessagingPlatform"])
        .try_build();

    // when building documentation for Android the plugin build result is always Err() and is irrelevant to the crate documentation build
    if !(cfg!(docsrs) && std::env::var("TARGET").unwrap().contains("android")) {
        result.unwrap();
    }
}

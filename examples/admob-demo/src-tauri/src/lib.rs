// Prevents an additional console window on Windows in release builds.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // The plugin reads its configuration from the `plugins > ad2mob` section
        // of `tauri.conf.json` (isTesting: true, debug: true). `AdMob.initialize()`
        // without arguments reuses exactly that configuration.
        .plugin(tauri_plugin_ad2mob::init())
        .run(tauri::generate_context!())
        .expect("error while running the admob-demo application");
}
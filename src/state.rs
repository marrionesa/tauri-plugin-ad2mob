//! Plugin state and pure state-machine logic.
//!
//! Everything in this module is platform independent and unit tested: the
//! `SharedState` guard only wraps a `Mutex` around [`InnerState`], whose
//! transition methods enforce the invariants documented in the README
//! (no `show` without a loaded ad, no corrupted states under concurrent
//! commands, explicit `Failed`/`Destroyed` states).

use std::sync::Mutex;

use serde::{Deserialize, Serialize};

use crate::error::Result;
use crate::models::{
    AdFormat, AdMobConfig, AdUnitIds, BannerPosition, BannerSize, ConsentStatus, Platform,
    TrackingAuthorizationStatus,
};
use crate::Error;

/// Official Google test IDs. Used automatically while `isTesting` is enabled so
/// development builds can never serve real ads or violate AdMob policies.
///
/// See <https://developers.google.com/admob/android/test-ads> and
/// <https://developers.google.com/admob/ios/test-ads>.
pub mod test_ids {
    use crate::models::{AdFormat, Platform};

    pub const ANDROID_APP_ID: &str = "ca-app-pub-3940256099942544~3347511713";
    pub const IOS_APP_ID: &str = "ca-app-pub-3940256099942544~1458002511";

    pub const ANDROID_BANNER: &str = "ca-app-pub-3940256099942544/6300978111";
    pub const ANDROID_INTERSTITIAL: &str = "ca-app-pub-3940256099942544/1033173712";
    pub const ANDROID_REWARDED: &str = "ca-app-pub-3940256099942544/5224354917";

    pub const IOS_BANNER: &str = "ca-app-pub-3940256099942544/2934735716";
    pub const IOS_INTERSTITIAL: &str = "ca-app-pub-3940256099942544/441146891";
    pub const IOS_REWARDED: &str = "ca-app-pub-3940256099942544/1717083536";

    /// Official Google test app ID for the given platform.
    pub fn app_id(platform: Platform) -> &'static str {
        match platform {
            Platform::Ios => IOS_APP_ID,
            _ => ANDROID_APP_ID,
        }
    }

    /// Official Google test ad unit ID for the given platform and format.
    pub fn ad_unit_id(platform: Platform, format: AdFormat) -> &'static str {
        match (platform, format) {
            (Platform::Ios, AdFormat::Banner) => IOS_BANNER,
            (Platform::Ios, AdFormat::Interstitial) => IOS_INTERSTITIAL,
            (Platform::Ios, AdFormat::Rewarded) => IOS_REWARDED,
            (_, AdFormat::Banner) => ANDROID_BANNER,
            (_, AdFormat::Interstitial) => ANDROID_INTERSTITIAL,
            (_, AdFormat::Rewarded) => ANDROID_REWARDED,
        }
    }
}

/// Validates an AdMob App ID (`ca-app-pub-<publisher id>~<app id>`).
pub fn validate_app_id(id: &str) -> Result<()> {
    if validate_admob_id(id, b'~') {
        Ok(())
    } else {
        Err(Error::InvalidConfiguration(format!(
            "`{id}` is not a valid AdMob App ID; expected the `ca-app-pub-<publisher id>~<app id>` \
             shape from the AdMob console"
        )))
    }
}

/// Validates an Ad Unit ID (`ca-app-pub-<publisher id>/<ad unit id>`).
pub fn validate_ad_unit_id(id: &str) -> Result<()> {
    if validate_admob_id(id, b'/') {
        Ok(())
    } else {
        Err(Error::InvalidConfiguration(format!(
            "`{id}` is not a valid Ad Unit ID; expected the `ca-app-pub-<publisher id>/<ad unit id>` \
             shape from the AdMob console"
        )))
    }
}

/// AdMob IDs share the shape `ca-app-pub-<9..16 digits><separator><9..16 digits>`.
fn validate_admob_id(id: &str, separator: u8) -> bool {
    const MIN: usize = 9;
    const MAX: usize = 16;
    let is_digit = |bytes: &[u8]| bytes.iter().all(|b| b.is_ascii_digit());

    let Some(rest) = id.strip_prefix("ca-app-pub-") else {
        return false;
    };
    let Some(separator_index) = rest.bytes().position(|b| b == separator) else {
        return false;
    };
    let (publisher, unit) = rest.split_at(separator_index);
    // skip the separator byte itself
    let unit = &unit[1..];

    (MIN..=MAX).contains(&publisher.len())
        && (MIN..=MAX).contains(&unit.len())
        && is_digit(publisher.as_bytes())
        && is_digit(unit.as_bytes())
}

/// Public validation helpers, re-exported at the crate root so applications
/// can pre-validate IDs before handing them to the plugin.
pub mod validate {
    pub use super::{validate_ad_unit_id as ad_unit_id, validate_app_id as app_id};
}

/// Lifecycle of a full-screen ad slot (interstitial / rewarded).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum AdSlotState {
    Idle,
    Loading,
    Ready,
    Showing,
    Failed,
    Destroyed,
}

/// A full-screen ad slot plus the ad unit used to load it.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AdSlot {
    pub state: AdSlotState,
    pub ad_unit_id: Option<String>,
}

impl Default for AdSlot {
    fn default() -> Self {
        AdSlot {
            state: AdSlotState::Idle,
            ad_unit_id: None,
        }
    }
}

impl AdSlot {
    /// Starts a load. Loading again while a load is in flight is allowed: each
    /// command resolves against its own native load, so concurrent
    /// `loadInterstitial()` calls never corrupt the state.
    pub fn begin_load(&mut self) {
        self.state = AdSlotState::Loading;
    }

    /// A native load completed. Only a `Loading` slot transitions to `Ready`,
    /// which keeps the state correct when loads are superseded by destroy or
    /// by a show that is still running.
    pub fn on_loaded(&mut self, ad_unit_id: String) {
        if self.state == AdSlotState::Loading {
            self.state = AdSlotState::Ready;
            self.ad_unit_id = Some(ad_unit_id);
        }
    }

    /// A native load failed. Ignored when the slot left the `Loading` state in
    /// the meantime.
    pub fn on_load_failed(&mut self) {
        if self.state == AdSlotState::Loading {
            self.state = AdSlotState::Failed;
        }
    }

    /// Starts showing the ad. Only allowed while the slot is `Ready`.
    pub fn begin_show(&mut self) -> Result<()> {
        if self.state != AdSlotState::Ready {
            return Err(Error::AdNotReady);
        }
        self.state = AdSlotState::Showing;
        Ok(())
    }

    /// The ad was dismissed; the slot must be reloaded before the next show.
    /// Ignored when a concurrent load already moved the slot out of `Showing`.
    pub fn on_dismissed(&mut self) {
        if self.state == AdSlotState::Showing {
            self.state = AdSlotState::Idle;
        }
    }

    /// The native show failed. Ignored when the slot is no longer `Showing`.
    pub fn on_show_failed(&mut self) {
        if self.state == AdSlotState::Showing {
            self.state = AdSlotState::Failed;
        }
    }

    pub fn destroy(&mut self) {
        self.state = AdSlotState::Destroyed;
        self.ad_unit_id = None;
    }

    pub fn is_ready(&self) -> bool {
        self.state == AdSlotState::Ready
    }
}

/// Lifecycle of the native banner slot.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum BannerState {
    Idle,
    Loading,
    Visible,
    Hidden,
    Failed,
    Destroyed,
}

/// The native banner slot: view state, placement and active ad unit.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct BannerSlot {
    pub state: BannerState,
    pub ad_unit_id: Option<String>,
    pub position: BannerPosition,
    pub size: BannerSize,
}

impl Default for BannerSlot {
    fn default() -> Self {
        BannerSlot {
            state: BannerState::Idle,
            ad_unit_id: None,
            position: BannerPosition::default(),
            size: BannerSize::default(),
        }
    }
}

impl BannerSlot {
    pub fn begin_load(&mut self) {
        self.state = BannerState::Loading;
    }

    /// A native banner load completed and the view is attached.
    pub fn on_loaded(&mut self, ad_unit_id: String) {
        if self.state == BannerState::Loading {
            self.state = BannerState::Visible;
            self.ad_unit_id = Some(ad_unit_id);
        }
    }

    /// A native banner load failed (banners only fail while loading).
    pub fn on_load_failed(&mut self) {
        if self.state == BannerState::Loading {
            self.state = BannerState::Failed;
        }
    }

    pub fn hide(&mut self) {
        if self.state == BannerState::Visible {
            self.state = BannerState::Hidden;
        }
    }

    pub fn destroy(&mut self) {
        self.state = BannerState::Destroyed;
        self.ad_unit_id = None;
    }

    pub fn is_visible(&self) -> bool {
        self.state == BannerState::Visible
    }
}

/// Interior state of the plugin, guarded by a `Mutex`.
#[derive(Debug, Default)]
pub struct InnerState {
    pub initialized: bool,
    pub config: AdMobConfig,
    pub ad_unit_ids: AdUnitIds,
    pub consent_status: ConsentStatus,
    pub tracking_status: TrackingAuthorizationStatus,
    pub interstitial: AdSlot,
    pub rewarded: AdSlot,
    pub banner: BannerSlot,
}

impl InnerState {
    /// Resolves the effective Ad Unit ID for `format`:
    /// explicit argument > configured ID > official Google test ID (test mode).
    pub fn resolve_ad_unit_id(
        &self,
        explicit: Option<String>,
        format: AdFormat,
        platform: Platform,
    ) -> Result<String> {
        if let Some(explicit) = explicit.as_deref() {
            validate_ad_unit_id(explicit)?;
            return Ok(explicit.to_string());
        }
        if let Some(configured) = self.ad_unit_ids.get(format) {
            validate_ad_unit_id(configured)?;
            return Ok(configured.to_string());
        }
        if self.config.is_testing {
            return Ok(test_ids::ad_unit_id(platform, format).to_string());
        }
        Err(Error::InvalidConfiguration(format!(
            "no Ad Unit ID available for the {format:?} format: pass `adUnitId`, call \
             `AdMob.configure()` or enable `isTesting` to use Google's official test IDs"
        )))
    }

    /// Guards every ad operation: the plugin must be initialized.
    pub fn ensure_initialized(&self) -> Result<()> {
        if self.initialized {
            Ok(())
        } else {
            Err(Error::NotInitialized)
        }
    }

    /// Guards ad operations against an unfinished consent flow. When the UMP
    /// state is `required` the developer must complete `requestConsent()` (or
    /// let `initialize()` do it) before requesting ads.
    pub fn ensure_consent_allows_ads(&self) -> Result<()> {
        if self.consent_status == ConsentStatus::Required {
            Err(Error::ConsentRequired)
        } else {
            Ok(())
        }
    }
}

/// `tauri::State` managed guard around [`InnerState`].
#[derive(Debug, Default)]
pub struct SharedState(pub Mutex<InnerState>);

impl SharedState {
    pub fn new() -> Self {
        SharedState(Mutex::new(InnerState::default()))
    }

    pub fn with_config(config: AdMobConfig) -> Self {
        SharedState(Mutex::new(InnerState {
            config,
            ..InnerState::default()
        }))
    }

    /// Locks the inner state. A poisoned lock (only possible after a panic in
    /// another command) is recovered instead of propagating panics to callers.
    pub fn lock(&self) -> std::sync::MutexGuard<'_, InnerState> {
        self.0
            .lock()
            .unwrap_or_else(std::sync::PoisonError::into_inner)
    }
}

#[cfg(test)]
pub(crate) mod test_util {
    use super::*;

    pub fn testing_config() -> AdMobConfig {
        AdMobConfig {
            is_testing: true,
            ..AdMobConfig::default()
        }
    }

    pub fn initialized_state() -> InnerState {
        InnerState {
            initialized: true,
            config: testing_config(),
            ..InnerState::default()
        }
    }
}

#[cfg(test)]
mod tests {
    use super::test_util::*;
    use super::*;

    #[test]
    fn validates_app_ids() {
        assert!(validate_app_id("ca-app-pub-3940256099942544~3347511713").is_ok());
        assert!(validate_app_id("ca-app-pub-1234567890~1234567890").is_ok());
        assert!(validate_app_id("ca-app-pub-3940256099942544/3347511713").is_err());
        assert!(validate_app_id("not-an-app-id").is_err());
        assert!(validate_app_id("ca-app-pub-3940256099942544~abc").is_err());
        assert!(validate_app_id("ca-app-pub-3940256~3347").is_err());
    }

    #[test]
    fn validates_ad_unit_ids() {
        assert!(validate_ad_unit_id("ca-app-pub-3940256099942544/6300978111").is_ok());
        assert!(validate_ad_unit_id("ca-app-pub-3940256099942544~6300978111").is_err());
        assert!(validate_ad_unit_id("").is_err());
        assert!(validate_ad_unit_id("ca-app-pub-/6300978111").is_err());
    }

    #[test]
    fn test_ids_are_valid_ids() {
        for platform in [Platform::Android, Platform::Ios] {
            validate_app_id(test_ids::app_id(platform)).expect("test app id must be valid");
            for format in [AdFormat::Banner, AdFormat::Interstitial, AdFormat::Rewarded] {
                validate_ad_unit_id(test_ids::ad_unit_id(platform, format))
                    .expect("test ad unit id must be valid");
            }
        }
    }

    #[test]
    fn resolves_explicit_over_configured_over_test_ids() {
        let mut state = initialized_state();
        state.ad_unit_ids.banner = Some("ca-app-pub-1111111111/2222222222".to_string());

        // explicit argument wins
        assert_eq!(
            state
                .resolve_ad_unit_id(
                    Some("ca-app-pub-3333333333/4444444444".to_string()),
                    AdFormat::Banner,
                    Platform::Android
                )
                .unwrap(),
            "ca-app-pub-3333333333/4444444444"
        );
        // configured id next
        assert_eq!(
            state
                .resolve_ad_unit_id(None, AdFormat::Banner, Platform::Android)
                .unwrap(),
            "ca-app-pub-1111111111/2222222222"
        );
        // google test id while testing
        assert_eq!(
            state
                .resolve_ad_unit_id(None, AdFormat::Interstitial, Platform::Android)
                .unwrap(),
            test_ids::ANDROID_INTERSTITIAL
        );
        assert_eq!(
            state
                .resolve_ad_unit_id(None, AdFormat::Interstitial, Platform::Ios)
                .unwrap(),
            test_ids::IOS_INTERSTITIAL
        );

        // no source available outside test mode: falls back to the configured
        // banner id, and errors for formats with no configured id
        state.config.is_testing = false;
        assert_eq!(
            state
                .resolve_ad_unit_id(None, AdFormat::Banner, Platform::Android)
                .unwrap(),
            "ca-app-pub-1111111111/2222222222"
        );
        assert!(matches!(
            state.resolve_ad_unit_id(None, AdFormat::Interstitial, Platform::Android),
            Err(Error::InvalidConfiguration(_))
        ));
    }

    #[test]
    fn rejects_invalid_explicit_ids() {
        let state = initialized_state();
        assert!(matches!(
            state.resolve_ad_unit_id(
                Some("nope".to_string()),
                AdFormat::Banner,
                Platform::Android
            ),
            Err(Error::InvalidConfiguration(_)) | Err(Error::InvalidArgument(_))
        ));
    }

    #[test]
    fn interstitial_state_machine() {
        let mut slot = AdSlot::default();

        // show without load
        assert!(matches!(slot.begin_show(), Err(Error::AdNotReady)));
        assert_eq!(slot.state, AdSlotState::Idle);

        slot.begin_load();
        assert_eq!(slot.state, AdSlotState::Loading);
        // a concurrent load does not corrupt the state
        slot.begin_load();
        assert_eq!(slot.state, AdSlotState::Loading);

        slot.on_load_failed();
        assert_eq!(slot.state, AdSlotState::Failed);

        slot.begin_load();
        slot.on_loaded("ca-app-pub-3940256099942544/1033173712".into());
        assert_eq!(slot.state, AdSlotState::Ready);
        assert_eq!(
            slot.ad_unit_id.as_deref(),
            Some("ca-app-pub-3940256099942544/1033173712")
        );

        slot.begin_show().unwrap();
        assert_eq!(slot.state, AdSlotState::Showing);
        // cannot show twice
        assert!(matches!(slot.begin_show(), Err(Error::AdNotReady)));

        slot.on_dismissed();
        assert_eq!(slot.state, AdSlotState::Idle);
        assert!(!slot.is_ready());

        slot.destroy();
        assert_eq!(slot.state, AdSlotState::Destroyed);
        assert!(slot.ad_unit_id.is_none());
    }

    #[test]
    fn banner_state_machine() {
        let mut banner = BannerSlot::default();
        assert!(!banner.is_visible());

        banner.begin_load();
        assert_eq!(banner.state, BannerState::Loading);

        banner.on_loaded("ca-app-pub-3940256099942544/6300978111".into());
        assert_eq!(banner.state, BannerState::Visible);
        assert!(banner.is_visible());

        banner.hide();
        assert_eq!(banner.state, BannerState::Hidden);
        // hiding again stays hidden
        banner.hide();
        assert_eq!(banner.state, BannerState::Hidden);

        banner.begin_load();
        banner.on_loaded("ca-app-pub-3940256099942544/6300978111".into());
        assert!(banner.is_visible());

        // a failed load only applies while loading
        banner.begin_load();
        banner.on_load_failed();
        assert_eq!(banner.state, BannerState::Failed);
        assert!(!banner.is_visible());

        // a load failure while not loading is ignored (defensive transitions)
        banner.on_load_failed();
        assert_eq!(banner.state, BannerState::Failed);

        banner.destroy();
        assert_eq!(banner.state, BannerState::Destroyed);
    }

    #[test]
    fn consent_gate_only_blocks_required_state() {
        let mut state = initialized_state();
        assert!(state.ensure_consent_allows_ads().is_ok());

        state.consent_status = ConsentStatus::Required;
        assert!(matches!(
            state.ensure_consent_allows_ads(),
            Err(Error::ConsentRequired)
        ));

        state.consent_status = ConsentStatus::Obtained;
        assert!(state.ensure_consent_allows_ads().is_ok());
        state.consent_status = ConsentStatus::NotRequired;
        assert!(state.ensure_consent_allows_ads().is_ok());
    }

    #[test]
    fn config_resolves_platform_app_ids() {
        let config = AdMobConfig {
            app_id: Some("ca-app-pub-1111111111~2222222222".to_string()),
            android_app_id: Some("ca-app-pub-3333333333~4444444444".to_string()),
            is_testing: false,
            ..AdMobConfig::default()
        };
        assert_eq!(
            config.app_id_for(Platform::Android),
            Some("ca-app-pub-3333333333~4444444444")
        );
        assert_eq!(
            config.app_id_for(Platform::Ios),
            Some("ca-app-pub-1111111111~2222222222")
        );
        assert!(config.validate(Platform::Ios).is_ok());

        // no ids and not testing -> configuration error on mobile
        let empty = AdMobConfig::default();
        assert!(matches!(
            empty.validate(Platform::Android),
            Err(Error::InvalidConfiguration(_))
        ));

        // testing mode falls back to the official test app id
        let testing = AdMobConfig {
            is_testing: true,
            ..AdMobConfig::default()
        };
        assert_eq!(
            testing.effective_app_id(Platform::Ios).as_deref(),
            Some(test_ids::IOS_APP_ID)
        );
        assert!(testing.validate(Platform::Android).is_ok());
    }

    #[test]
    fn config_serializes_camel_case() {
        let json = serde_json::json!({
            "androidAppId": "ca-app-pub-3940256099942544~3347511713",
            "isTesting": true,
            "initializeOnStartup": false,
            "requestTrackingAuthorization": true,
            "automaticallyRequestConsent": true,
            "debug": true
        });
        let config: AdMobConfig = serde_json::from_value(json).unwrap();
        assert!(config.is_testing);
        assert!(config.request_tracking_authorization);
        assert_eq!(
            config.android_app_id.as_deref(),
            Some("ca-app-pub-3940256099942544~3347511713")
        );

        let serialized = serde_json::to_value(&config).unwrap();
        assert!(serialized.get("androidAppId").is_some());
        assert!(serialized.get("android_app_id").is_none());
    }

    #[test]
    fn ad_unit_ids_merge_keeps_existing_values() {
        let mut ids = AdUnitIds {
            banner: Some("ca-app-pub-1111111111/2222222222".into()),
            ..AdUnitIds::default()
        };
        ids.merge(AdUnitIds {
            interstitial: Some("ca-app-pub-3333333333/4444444444".into()),
            ..AdUnitIds::default()
        });
        assert_eq!(
            ids.banner.as_deref(),
            Some("ca-app-pub-1111111111/2222222222")
        );
        assert_eq!(
            ids.interstitial.as_deref(),
            Some("ca-app-pub-3333333333/4444444444")
        );
        assert!(ids.rewarded.is_none());
    }
}

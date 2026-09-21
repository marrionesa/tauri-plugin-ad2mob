// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

package com.plugin.admob

/**
 * This file holds every piece of pure (platform independent) logic of the
 * Android implementation: normalized status strings, reject code constants and
 * the parsing of wire-format banner arguments.
 *
 * It MUST NOT import Android classes so it stays unit-testable on the JVM
 * (see `AdmobMappersTest`).
 */

/** Consent status reported when the UMP state is not known yet (raw value 0). */
const val CONSENT_STATUS_UNKNOWN = "unknown"

/** Consent status reported when consent is still required (raw value 1). */
const val CONSENT_STATUS_REQUIRED = "required"

/** Consent status reported when consent is not required (raw value 2). */
const val CONSENT_STATUS_NOT_REQUIRED = "notRequired"

/** Consent status reported when the user answered the consent form (raw value 3). */
const val CONSENT_STATUS_OBTAINED = "obtained"

/** Tracking status reported on platforms without App Tracking Transparency. */
const val TRACKING_STATUS_NOT_AVAILABLE = "notAvailable"

/** Platform identifier reported in the `admob://initialized` event. */
const val PLATFORM_ANDROID = "android"

/**
 * Reject codes emitted through `Invoke.reject(message, code)`. They are part
 * of the stable contract and MUST match `docs/native-contract.md` exactly.
 */
object AdmobRejectCodes {
    const val NOT_INITIALIZED = "NOT_INITIALIZED"
    const val AD_NOT_READY = "AD_NOT_READY"
    const val LOAD_FAILED = "LOAD_FAILED"
    const val SHOW_FAILED = "SHOW_FAILED"
    const val INVALID_CONFIGURATION = "INVALID_CONFIGURATION"
    const val INVALID_ARGUMENT = "INVALID_ARGUMENT"
    const val CONSENT_REQUIRED = "CONSENT_REQUIRED"
    const val UNSUPPORTED_PLATFORM = "UNSUPPORTED_PLATFORM"
    const val NATIVE_ERROR = "NATIVE_ERROR"
}

/**
 * Maps a raw Google UMP consent status integer
 * (`ConsentInformation.ConsentStatus`: UNKNOWN=0, REQUIRED=1, NOT_REQUIRED=2,
 * OBTAINED=3) to the normalized string of the contract. Any unknown value
 * falls back to [CONSENT_STATUS_UNKNOWN].
 *
 * The constants are matched numerically on purpose: this keeps the file free
 * of Android/UMP imports so the mapping can be unit tested on the JVM.
 */
fun mapConsentStatus(consentStatus: Int?): String = when (consentStatus) {
    0 -> CONSENT_STATUS_UNKNOWN
    1 -> CONSENT_STATUS_REQUIRED
    2 -> CONSENT_STATUS_NOT_REQUIRED
    3 -> CONSENT_STATUS_OBTAINED
    else -> CONSENT_STATUS_UNKNOWN
}

/** Position of the banner relative to the WebView. */
enum class BannerPosition {
    TOP,
    BOTTOM,
}

/**
 * Parses the wire-format banner position sent by the Rust core.
 * A missing value defaults to [BannerPosition.BOTTOM] (the Rust default);
 * any non-null value outside `top`/`bottom` yields `null` so the caller can
 * reject with `INVALID_ARGUMENT`.
 */
fun parseBannerPosition(raw: String?): BannerPosition? = when (raw) {
    null -> BannerPosition.BOTTOM
    "top" -> BannerPosition.TOP
    "bottom" -> BannerPosition.BOTTOM
    else -> null
}

/** Logical banner sizes understood by the native layer. */
enum class BannerSize {
    BANNER,
    LARGE_BANNER,
    MEDIUM_RECTANGLE,
    FULL_BANNER,
    LEADERBOARD,
    ADAPTIVE,
}

/**
 * Fixed dp dimensions of a non-adaptive banner size. `ADAPTIVE` has no fixed
 * descriptor; its concrete `AdSize` is computed at runtime from the screen
 * width (`AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize`).
 */
data class BannerSizeSpec(val widthDp: Int, val heightDp: Int)

/**
 * Returns the fixed dp descriptor of [size], or `null` for
 * [BannerSize.ADAPTIVE]. The actual `AdSize` construction lives in a thin
 * Android-only wrapper inside `BannerManager`.
 */
fun bannerSizeSpec(size: BannerSize): BannerSizeSpec? = when (size) {
    BannerSize.BANNER -> BannerSizeSpec(320, 50)
    BannerSize.LARGE_BANNER -> BannerSizeSpec(320, 100)
    BannerSize.MEDIUM_RECTANGLE -> BannerSizeSpec(300, 250)
    BannerSize.FULL_BANNER -> BannerSizeSpec(468, 60)
    BannerSize.LEADERBOARD -> BannerSizeSpec(728, 90)
    BannerSize.ADAPTIVE -> null
}

/**
 * Parses the wire-format banner size sent by the Rust core. A missing value
 * defaults to [BannerSize.ADAPTIVE] (the Rust default); any non-null value
 * outside the six documented names yields `null` so the caller can reject
 * with `INVALID_ARGUMENT`.
 */
fun parseBannerSize(raw: String?): BannerSize? = when (raw) {
    null -> BannerSize.ADAPTIVE
    "banner" -> BannerSize.BANNER
    "largeBanner" -> BannerSize.LARGE_BANNER
    "mediumRectangle" -> BannerSize.MEDIUM_RECTANGLE
    "fullBanner" -> BannerSize.FULL_BANNER
    "leaderboard" -> BannerSize.LEADERBOARD
    "adaptive" -> BannerSize.ADAPTIVE
    else -> null
}

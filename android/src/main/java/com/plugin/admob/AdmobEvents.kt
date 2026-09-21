// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

package com.plugin.admob

/**
 * Event names triggered natively through the plugin event channel and observed
 * from JS via `addPluginListener("admob", event, ...)`.
 *
 * These strings are stable public API and MUST match `docs/native-contract.md`
 * exactly. They are asserted literally in `AdmobMappersTest`.
 */
object AdmobEvents {
    const val INITIALIZED = "admob://initialized"
    const val CONSENT_CHANGED = "admob://consent-changed"
    const val TRACKING_AUTHORIZATION_CHANGED = "admob://tracking-authorization-changed"

    const val BANNER_LOADED = "admob://banner-loaded"
    const val BANNER_FAILED = "admob://banner-failed"
    const val BANNER_OPENED = "admob://banner-opened"
    const val BANNER_CLICKED = "admob://banner-clicked"
    const val BANNER_IMPRESSION = "admob://banner-impression"
    const val BANNER_CLOSED = "admob://banner-closed"

    const val INTERSTITIAL_LOADED = "admob://interstitial-loaded"
    const val INTERSTITIAL_FAILED = "admob://interstitial-failed"
    const val INTERSTITIAL_OPENED = "admob://interstitial-opened"
    const val INTERSTITIAL_IMPRESSION = "admob://interstitial-impression"
    const val INTERSTITIAL_CLICKED = "admob://interstitial-clicked"
    const val INTERSTITIAL_CLOSED = "admob://interstitial-closed"

    const val REWARDED_LOADED = "admob://rewarded-loaded"
    const val REWARDED_FAILED = "admob://rewarded-failed"
    const val REWARDED_OPENED = "admob://rewarded-opened"
    const val REWARDED_IMPRESSION = "admob://rewarded-impression"
    const val REWARDED_CLICKED = "admob://rewarded-clicked"
    const val REWARDED_EARNED = "admob://rewarded-earned"
    const val REWARDED_CLOSED = "admob://rewarded-closed"
}

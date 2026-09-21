// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

package com.plugin.admob

import android.app.Activity
import android.content.res.Resources
import android.graphics.Color
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import app.tauri.plugin.Invoke
import app.tauri.plugin.JSObject
import com.google.android.gms.ads.AdListener
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.AdView
import com.google.android.gms.ads.LoadAdError

/**
 * Owns the native banner: creates the `AdView`, wraps it in a container
 * `FrameLayout` inserted into the activity content root (the same root that
 * hosts the Tauri WebView), applies safe-area padding and reports SDK events.
 *
 * All methods must be called from the UI thread (the AdMob SDK delivers its
 * callbacks on the main thread, and the plugin hops to the UI thread before
 * entering this class), so no synchronization is required.
 *
 * Safe areas: for `bottom` banners the navigation-bar bottom inset is applied
 * as padding so edge-to-edge mode never covers the ad; for `top` banners the
 * status-bar top inset is applied instead. Insets are read through
 * `ViewCompat.setOnApplyWindowInsetsListener` and re-applied live when the
 * position changes.
 *
 * @param activity the foreground activity whose content root hosts the banner
 * @param notifyEvent called with (event name, payload) for every SDK event
 */
internal class BannerManager(
    private val activity: Activity,
    private val notifyEvent: (event: String, payload: JSObject) -> Unit
) {
    private var container: FrameLayout? = null
    private var adView: AdView? = null
    private var position: BannerPosition = BannerPosition.BOTTOM

    /**
     * `true` while the user hid the banner through `hideBanner`. A load that
     * completes while hidden must not reveal the view again.
     */
    private var isHidden = false

    /**
     * Bumped on every teardown ([destroyView]). Load callbacks created with
     * an older epoch are stale (superseded by a newer `showBanner` or a
     * destroy) and complete their own invoke exactly once without touching
     * the current state.
     */
    private var loadEpoch = 0L

    /** Last insets dispatched to the container, re-applied on position change. */
    private var lastInsets: WindowInsetsCompat? = null

    /**
     * Android-only thin wrapper that turns a parsed [BannerSize] into a
     * concrete `AdSize`. Fixed sizes map to the SDK constants; `ADAPTIVE` is
     * computed from the current screen width in dp for the current
     * orientation. Returns `null` when the SDK cannot compute the adaptive
     * size (screen too narrow), which the caller reports as
     * `INVALID_ARGUMENT`.
     */
    private fun resolveAdSize(size: BannerSize): AdSize? = when (size) {
        BannerSize.BANNER -> AdSize.BANNER
        BannerSize.LARGE_BANNER -> AdSize.LARGE_BANNER
        BannerSize.MEDIUM_RECTANGLE -> AdSize.MEDIUM_RECTANGLE
        BannerSize.FULL_BANNER -> AdSize.FULL_BANNER
        BannerSize.LEADERBOARD -> AdSize.LEADERBOARD
        BannerSize.ADAPTIVE -> {
            val metrics = Resources.getSystem().displayMetrics
            val widthDp = (metrics.widthPixels / metrics.density).toInt()
            AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(activity, widthDp)
        }
    }

    /**
     * Creates a fresh banner for the given arguments and starts loading it.
     * Any previous banner is destroyed first (a new `showBanner` always
     * replaces the old one). The container is attached hidden and revealed
     * only when the ad loads, so a failed load never leaves anything visible.
     *
     * The [Invoke] is resolved/rejected exactly once — from the load
     * callbacks of THIS banner (stale callbacks from a superseded banner
     * resolve their own invoke silently).
     */
    fun show(adUnitId: String, newPosition: BannerPosition, size: BannerSize, invoke: Invoke) {
        val adSize = resolveAdSize(size)
        if (adSize == null) {
            invoke.reject(
                "unable to compute the adaptive banner size for the current screen",
                AdmobRejectCodes.INVALID_ARGUMENT
            )
            return
        }

        // destroyView() already bumps the epoch, invalidating the callbacks
        // of the previous banner (if any).
        destroyView()
        val epoch = loadEpoch
        position = newPosition
        isHidden = false

        val newContainer = FrameLayout(activity)
        newContainer.setBackgroundColor(Color.TRANSPARENT)

        val newAdView = AdView(activity)
        newAdView.setAdSize(adSize)
        newAdView.adUnitId = adUnitId
        newContainer.addView(
            newAdView,
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.WRAP_CONTENT,
                FrameLayout.LayoutParams.WRAP_CONTENT
            )
        )

        container = newContainer
        adView = newAdView

        ViewCompat.setOnApplyWindowInsetsListener(newContainer) { _, insets ->
            lastInsets = insets
            applyInsetsPadding()
            insets
        }

        newAdView.adListener = object : AdListener() {
            override fun onAdLoaded() {
                if (epoch != loadEpoch) {
                    // Superseded by a newer showBanner/destroy: this command
                    // still needs its response, but the state must not change.
                    invoke.resolve()
                    return
                }
                newContainer.visibility = if (isHidden) View.GONE else View.VISIBLE
                notifyEvent(AdmobEvents.BANNER_LOADED, JSObject().put("adUnitId", adUnitId))
                invoke.resolve()
            }

            override fun onAdFailedToLoad(loadError: LoadAdError) {
                if (epoch != loadEpoch) {
                    invoke.resolve()
                    return
                }
                destroyView()
                notifyEvent(
                    AdmobEvents.BANNER_FAILED,
                    JSObject()
                        .put("adUnitId", adUnitId)
                        .put("code", loadError.code.toString())
                        .put("message", loadError.message)
                        .put("domain", loadError.domain)
                )
                invoke.reject(
                    "banner load failed: ${loadError.message}",
                    AdmobRejectCodes.LOAD_FAILED
                )
            }

            override fun onAdOpened() {
                notifyEvent(AdmobEvents.BANNER_OPENED, JSObject().put("adUnitId", adUnitId))
            }

            override fun onAdClicked() {
                notifyEvent(AdmobEvents.BANNER_CLICKED, JSObject().put("adUnitId", adUnitId))
            }

            override fun onAdImpression() {
                notifyEvent(AdmobEvents.BANNER_IMPRESSION, JSObject().put("adUnitId", adUnitId))
            }

            override fun onAdClosed() {
                notifyEvent(AdmobEvents.BANNER_CLOSED, JSObject().put("adUnitId", adUnitId))
            }
        }

        val contentRoot = activity.findViewById<ViewGroup>(android.R.id.content)
        contentRoot.addView(newContainer, makeLayoutParams())
        applyInsetsPadding()
        newContainer.visibility = View.GONE

        newAdView.loadAd(AdRequest.Builder().build())
    }

    /**
     * Hides the banner while keeping the view alive for a re-show. When no
     * banner exists this is a no-op (the contract resolves unconditionally).
     */
    fun hide() {
        isHidden = true
        container?.visibility = View.GONE
    }

    /**
     * Repositions the live banner (gravity + safe-area padding). No-op when
     * no banner exists.
     */
    fun setPosition(newPosition: BannerPosition) {
        position = newPosition
        val currentContainer = container ?: return
        val params = currentContainer.layoutParams as? FrameLayout.LayoutParams ?: return
        params.gravity = gravityFor(position)
        currentContainer.layoutParams = params
        applyInsetsPadding()
    }

    /**
     * Removes the banner from the hierarchy and destroys the `AdView`. Any
     * in-flight load callback becomes stale and completes its own invoke
     * without touching state.
     */
    fun destroy() {
        destroyView()
    }

    private fun gravityFor(position: BannerPosition): Int = when (position) {
        BannerPosition.TOP -> Gravity.TOP or Gravity.CENTER_HORIZONTAL
        BannerPosition.BOTTOM -> Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL
    }

    private fun makeLayoutParams(): FrameLayout.LayoutParams {
        val params = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.WRAP_CONTENT,
            FrameLayout.LayoutParams.WRAP_CONTENT
        )
        params.gravity = gravityFor(position)
        return params
    }

    /**
     * Applies the safe-area padding for the current position using the last
     * dispatched insets: status-bar top inset for `top` banners,
     * navigation-bar bottom inset for `bottom` banners (edge-to-edge safety).
     */
    private fun applyInsetsPadding() {
        val currentContainer = container ?: return
        val insets = lastInsets ?: return
        val statusBarTop = insets.getInsets(WindowInsetsCompat.Type.statusBars()).top
        val navigationBarBottom = insets.getInsets(WindowInsetsCompat.Type.navigationBars()).bottom
        when (position) {
            BannerPosition.TOP -> currentContainer.setPadding(0, statusBarTop, 0, 0)
            BannerPosition.BOTTOM -> currentContainer.setPadding(0, 0, 0, navigationBarBottom)
        }
    }

    /** Tears down the current banner (if any) and bumps the staleness epoch. */
    private fun destroyView() {
        loadEpoch += 1
        val currentContainer = container
        val currentAdView = adView
        container = null
        adView = null
        isHidden = false
        lastInsets = null
        if (currentAdView != null) {
            currentAdView.destroy()
        }
        if (currentContainer != null) {
            (currentContainer.parent as? ViewGroup)?.removeView(currentContainer)
        }
    }
}

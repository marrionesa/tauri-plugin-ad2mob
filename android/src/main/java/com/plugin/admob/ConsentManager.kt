// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

package com.plugin.admob

import android.app.Activity
import com.google.android.ump.ConsentForm
import com.google.android.ump.ConsentInformation
import com.google.android.ump.ConsentRequestParameters
import com.google.android.ump.FormError
import com.google.android.ump.UserMessagingPlatform

/**
 * Google UMP (User Messaging Platform) consent flow.
 *
 * Wraps `requestConsentInfoUpdate` followed by
 * `loadAndShowConsentFormIfRequired`, which is the full flow required to be
 * allowed to serve ads in the EEA/UK.
 *
 * All methods must be called from the UI thread; UMP delivers its callbacks
 * on the main thread as well.
 *
 * @param activity the foreground activity hosting the consent form
 */
internal class ConsentManager(private val activity: Activity) {

    /**
     * Per-device consent information backed by the UMP SDK's own storage.
     * Created lazily so the plugin can be constructed before any consent
     * configuration exists.
     */
    private val consentInformation: ConsentInformation by lazy {
        UserMessagingPlatform.getConsentInformation(activity)
    }

    /**
     * Raw UMP consent status (`ConsentInformation.ConsentStatus` int), mapped
     * to a normalized string by [mapConsentStatus] at the call site.
     */
    fun currentStatus(): Int = consentInformation.consentStatus

    /**
     * Runs the complete UMP flow: consent info update, then the consent form
     * when one is required.
     *
     * @param onResult invoked exactly once, with the resulting raw status
     *   (or `null` when the flow failed) and the `FormError` on failure.
     */
    fun request(onResult: (consentStatus: Int?, formError: FormError?) -> Unit) {
        consentInformation.requestConsentInfoUpdate(
            activity,
            ConsentRequestParameters.Builder().build(),
            ConsentInformation.OnConsentInfoUpdateSuccessListener {
                // The form is only presented when one is required for the
                // current region; the listener fires either way.
                UserMessagingPlatform.loadAndShowConsentFormIfRequired(
                    activity,
                    ConsentForm.OnConsentFormDismissedListener { formError ->
                        onResult(consentInformation.consentStatus, formError)
                    }
                )
            },
            ConsentInformation.OnConsentInfoUpdateFailureListener { formError ->
                onResult(null, formError)
            }
        )
    }
}

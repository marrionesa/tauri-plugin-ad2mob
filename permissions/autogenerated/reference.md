## Default Permission

This permission set configures the full AdMob surface of the plugin.

#### Granted Permissions

All commands are allowed by default: initialization, configuration, consent
(UMP), App Tracking Transparency (iOS), interstitial, rewarded and native
banner ads, plus the plugin event listeners used by `AdMob.on()`.

Ads are not a security-sensitive surface: the plugin never exposes filesystem,
network or device capabilities to the webview, so granting everything by
default keeps the consumer setup to a single `ad2mob:default` entry.

#### This default permission set includes the following:

- `allow-initialize`
- `allow-configure`
- `allow-is-supported`
- `allow-get-status`
- `allow-request-consent`
- `allow-get-consent-status`
- `allow-request-tracking-authorization`
- `allow-get-tracking-authorization-status`
- `allow-load-interstitial`
- `allow-show-interstitial`
- `allow-is-interstitial-ready`
- `allow-destroy-interstitial`
- `allow-load-rewarded`
- `allow-show-rewarded`
- `allow-is-rewarded-ready`
- `allow-destroy-rewarded`
- `allow-show-banner`
- `allow-hide-banner`
- `allow-is-banner-visible`
- `allow-set-banner-position`
- `allow-destroy-banner`
- `allow-destroy`
- `allow-register-listener`
- `allow-remove-listener`

## Permission Table

<table>
<tr>
<th>Identifier</th>
<th>Description</th>
</tr>


<tr>
<td>

`ad2mob:allow-configure`

</td>
<td>

Enables the configure command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:deny-configure`

</td>
<td>

Denies the configure command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:allow-destroy`

</td>
<td>

Enables the destroy command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:deny-destroy`

</td>
<td>

Denies the destroy command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:allow-destroy-banner`

</td>
<td>

Enables the destroy_banner command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:deny-destroy-banner`

</td>
<td>

Denies the destroy_banner command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:allow-destroy-interstitial`

</td>
<td>

Enables the destroy_interstitial command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:deny-destroy-interstitial`

</td>
<td>

Denies the destroy_interstitial command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:allow-destroy-rewarded`

</td>
<td>

Enables the destroy_rewarded command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:deny-destroy-rewarded`

</td>
<td>

Denies the destroy_rewarded command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:allow-get-consent-status`

</td>
<td>

Enables the get_consent_status command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:deny-get-consent-status`

</td>
<td>

Denies the get_consent_status command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:allow-get-status`

</td>
<td>

Enables the get_status command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:deny-get-status`

</td>
<td>

Denies the get_status command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:allow-get-tracking-authorization-status`

</td>
<td>

Enables the get_tracking_authorization_status command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:deny-get-tracking-authorization-status`

</td>
<td>

Denies the get_tracking_authorization_status command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:allow-hide-banner`

</td>
<td>

Enables the hide_banner command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:deny-hide-banner`

</td>
<td>

Denies the hide_banner command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:allow-initialize`

</td>
<td>

Enables the initialize command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:deny-initialize`

</td>
<td>

Denies the initialize command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:allow-is-banner-visible`

</td>
<td>

Enables the is_banner_visible command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:deny-is-banner-visible`

</td>
<td>

Denies the is_banner_visible command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:allow-is-interstitial-ready`

</td>
<td>

Enables the is_interstitial_ready command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:deny-is-interstitial-ready`

</td>
<td>

Denies the is_interstitial_ready command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:allow-is-rewarded-ready`

</td>
<td>

Enables the is_rewarded_ready command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:deny-is-rewarded-ready`

</td>
<td>

Denies the is_rewarded_ready command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:allow-is-supported`

</td>
<td>

Enables the is_supported command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:deny-is-supported`

</td>
<td>

Denies the is_supported command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:allow-load-interstitial`

</td>
<td>

Enables the load_interstitial command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:deny-load-interstitial`

</td>
<td>

Denies the load_interstitial command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:allow-load-rewarded`

</td>
<td>

Enables the load_rewarded command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:deny-load-rewarded`

</td>
<td>

Denies the load_rewarded command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:allow-register-listener`

</td>
<td>

Enables the register_listener command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:deny-register-listener`

</td>
<td>

Denies the register_listener command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:allow-remove-listener`

</td>
<td>

Enables the remove_listener command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:deny-remove-listener`

</td>
<td>

Denies the remove_listener command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:allow-request-consent`

</td>
<td>

Enables the request_consent command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:deny-request-consent`

</td>
<td>

Denies the request_consent command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:allow-request-tracking-authorization`

</td>
<td>

Enables the request_tracking_authorization command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:deny-request-tracking-authorization`

</td>
<td>

Denies the request_tracking_authorization command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:allow-set-banner-position`

</td>
<td>

Enables the set_banner_position command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:deny-set-banner-position`

</td>
<td>

Denies the set_banner_position command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:allow-show-banner`

</td>
<td>

Enables the show_banner command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:deny-show-banner`

</td>
<td>

Denies the show_banner command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:allow-show-interstitial`

</td>
<td>

Enables the show_interstitial command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:deny-show-interstitial`

</td>
<td>

Denies the show_interstitial command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:allow-show-rewarded`

</td>
<td>

Enables the show_rewarded command without any pre-configured scope.

</td>
</tr>

<tr>
<td>

`ad2mob:deny-show-rewarded`

</td>
<td>

Denies the show_rewarded command without any pre-configured scope.

</td>
</tr>
</table>

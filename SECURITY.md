# Security Policy

## Supported versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Use GitHub's private vulnerability reporting:
<https://github.com/marrionesa/tauri-plugin-ad2mob/security/advisories/new>

Include:

- Affected version(s) and platform (Android / iOS / desktop).
- A minimal reproduction or PoC.
- The impact you believe it enables.

You will receive an initial response within **7 days**. Fixes are released as
soon as practical, and credit is given in the advisory and the changelog
unless you prefer to remain anonymous.

## Scope notes

The plugin is a thin bridge to the Google Mobile Ads SDK. Areas of particular
interest for review:

- The IPC surface: every command in `build.rs` is exposed to the webview and
  gated by the Tauri ACL (`permissions/`).
- Event payloads: nothing from the webview is trusted when re-parsed natively;
  argument decoding rejects unknown shapes with `INVALID_ARGUMENT`.
- The plugin never reads files, never performs network requests of its own
  (all networking is the Google SDK's) and never exposes device capabilities
  beyond ad display.
- Configuration values (App IDs, Ad Unit IDs) are validated before use;
  test IDs are resolved only when `isTesting: true`.

Reports about the Google Mobile Ads SDK itself should go to Google
(<https://support.google.com/admob/troubleshooter/9048739>).

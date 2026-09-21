/**
 * Typed errors for `tauri-plugin-ad2mob`.
 *
 * Rust commands reject invokes with `{ code, message }`; these helpers turn
 * any rejection into an `AdMobError` with a stable `AdMobErrorCode`.
 */

/** Stable error codes shared with the Rust `Error` enum. */
export type AdMobErrorCode =
  | 'NOT_INITIALIZED'
  | 'AD_NOT_READY'
  | 'LOAD_FAILED'
  | 'SHOW_FAILED'
  | 'INVALID_CONFIGURATION'
  | 'INVALID_ARGUMENT'
  | 'CONSENT_REQUIRED'
  | 'UNSUPPORTED_PLATFORM'
  | 'NATIVE_ERROR'

/** Error thrown by every `AdMob.*` method when a command is rejected. */
export class AdMobError extends Error {
  /** Stable machine readable error code. */
  readonly code: AdMobErrorCode

  constructor(code: AdMobErrorCode, message: string) {
    super(message)
    this.name = 'AdMobError'
    this.code = code
  }
}

/** Type guard for `AdMobError` instances. */
export function isAdMobError(error: unknown): error is AdMobError {
  return error instanceof AdMobError
}

/** Normalizes unknown rejection values into an `AdMobError`. */
export function toAdMobError(error: unknown): AdMobError {
  if (error instanceof AdMobError) {
    return error
  }

  if (typeof error === 'object' && error !== null) {
    const candidate = error as { code?: unknown; message?: unknown }
    if (typeof candidate.code === 'string') {
      return new AdMobError(
        candidate.code as AdMobErrorCode,
        typeof candidate.message === 'string' ? candidate.message : String(error),
      )
    }
    if (typeof candidate.message === 'string') {
      return new AdMobError('NATIVE_ERROR', candidate.message)
    }
  }

  if (typeof error === 'string' && error.length > 0) {
    return new AdMobError('NATIVE_ERROR', error)
  }

  return new AdMobError('NATIVE_ERROR', 'unknown AdMob plugin error')
}

// admob-demo — demonstrates the full tauri-plugin-ad2mob surface.
//
// The imported module is a bundled copy of the plugin's guest-js API
// (regenerate with `bun run build:example` from the repository root).
import { AdMob } from './tauri-plugin-ad2mob.js'

const ALL_EVENTS = [
  'admob://initialized',
  'admob://consent-changed',
  'admob://tracking-authorization-changed',
  'admob://banner-loaded',
  'admob://banner-failed',
  'admob://banner-opened',
  'admob://banner-clicked',
  'admob://banner-impression',
  'admob://banner-closed',
  'admob://interstitial-loaded',
  'admob://interstitial-failed',
  'admob://interstitial-opened',
  'admob://interstitial-impression',
  'admob://interstitial-clicked',
  'admob://interstitial-closed',
  'admob://rewarded-loaded',
  'admob://rewarded-failed',
  'admob://rewarded-opened',
  'admob://rewarded-impression',
  'admob://rewarded-clicked',
  'admob://rewarded-earned',
  'admob://rewarded-closed',
]

const logEl = document.getElementById('log')
const badgesEl = document.getElementById('status-badges')
let unlistenFns = []

function log(kind, name, detail) {
  const entry = document.createElement('div')
  entry.className = 'entry'
  const time = document.createElement('time')
  time.textContent = new Date().toLocaleTimeString()
  const label = document.createElement('span')
  label.className = kind === 'error' ? 'error' : 'event'
  label.textContent = kind === 'error' ? `✗ ${name}` : name
  entry.appendChild(time)
  entry.appendChild(label)
  if (detail !== undefined) {
    const payload = document.createElement('span')
    payload.className = 'payload'
    payload.textContent = ` ${JSON.stringify(detail)}`
    entry.appendChild(payload)
  }
  logEl.appendChild(entry)
  logEl.scrollTop = logEl.scrollHeight
}

async function refreshStatus() {
  try {
    const status = await AdMob.getStatus()
    const supported = await AdMob.isSupported()
    badgesEl.replaceChildren(
      ...[
        `platform: ${status.platform}`,
        `initialized: ${status.initialized}`,
        `testing: ${status.testing}`,
        `consent: ${status.consentStatus}`,
        `tracking: ${status.trackingStatus}`,
        `interstitial ready: ${status.interstitialReady}`,
        `rewarded ready: ${status.rewardedReady}`,
        `banner visible: ${status.bannerVisible}`,
        `ads supported: ${supported}`,
      ].map((text) => {
        const badge = document.createElement('span')
        badge.className = 'badge'
        badge.textContent = text
        return badge
      }),
    )
  } catch (error) {
    log('error', 'getStatus', { code: error.code, message: error.message })
  }
}

async function run(name, action) {
  try {
    const result = await action()
    log('ok', name, result === undefined ? 'ok' : result)
  } catch (error) {
    log('error', name, { code: error.code, message: error.message })
  }
  await refreshStatus()
}

function bind(id, name, action) {
  document.getElementById(id).addEventListener('click', () => run(name, action))
}

async function start() {
  // Subscribe to every event BEFORE initialize so nothing is missed.
  for (const event of ALL_EVENTS) {
    try {
      const unlisten = await AdMob.on(event, (payload) => {
        log('ok', event, payload)
        refreshStatus()
      })
      unlistenFns.push(unlisten)
    } catch (error) {
      log('error', `on(${event})`, { code: error.code, message: error.message })
    }
  }

  bind('btn-initialize', 'initialize', () =>
    AdMob.initialize({
      // Empty on purpose: the configuration comes from the `plugins > ad2mob`
      // section of tauri.conf.json (isTesting: true). Per-platform IDs can be
      // passed here instead:
      //   androidAppId: 'ca-app-pub-XXXX~XXXX',
      //   iosAppId: 'ca-app-pub-XXXX~XXXX',
      //   isTesting: true,
    }),
  )
  bind('btn-status', 'getStatus', () => AdMob.getStatus())
  bind('btn-consent', 'requestConsent', () => AdMob.requestConsent())
  bind('btn-att', 'requestTrackingAuthorization', () => AdMob.requestTrackingAuthorization())

  bind('btn-banner-show', 'showBanner', () =>
    AdMob.showBanner({ position: 'bottom', size: 'adaptive' }),
  )
  bind('btn-banner-hide', 'hideBanner', () => AdMob.hideBanner())
  bind('btn-banner-top', 'setBannerPosition(top)', () =>
    AdMob.setBannerPosition({ position: 'top' }),
  )
  bind('btn-banner-bottom', 'setBannerPosition(bottom)', () =>
    AdMob.setBannerPosition({ position: 'bottom' }),
  )
  bind('btn-banner-visible', 'isBannerVisible', () => AdMob.isBannerVisible())
  bind('btn-banner-destroy', 'destroyBanner', () => AdMob.destroyBanner())

  bind('btn-interstitial-load', 'loadInterstitial', () => AdMob.loadInterstitial())
  bind('btn-interstitial-show', 'showInterstitial', () => AdMob.showInterstitial())

  bind('btn-rewarded-load', 'loadRewarded', () => AdMob.loadRewarded())
  bind('btn-rewarded-show', 'showRewarded', () => AdMob.showRewarded())

  bind('btn-destroy', 'destroy', () => AdMob.destroy())

  await refreshStatus()
  log('ok', 'demo ready', 'subscribe → initialize → try the ads')
}

start()

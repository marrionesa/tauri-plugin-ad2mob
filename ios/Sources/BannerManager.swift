// Copyright 2026 tauri-plugin-ad2mob contributors
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

import Foundation
import GoogleMobileAds
import Tauri
import UIKit

/// Lifecycle of the banner slot: creation, constraint-based insertion into the
/// Tauri root view (respecting safe areas: notch / Dynamic Island / home
/// indicator), position changes, hide and teardown.
///
/// Threading: every command from `AdmobPlugin` arrives on the main queue and
/// every SDK callback hops to the main queue before touching state, so all
/// fields are main-queue-confined. The `showBanner` invoke is settled exactly
/// once: resolved when the SDK reports the ad and the view was revealed,
/// rejected with `LOAD_FAILED` otherwise (a failed banner never stays
/// attached to the view hierarchy).
final class BannerManager: NSObject, GADBannerViewDelegate {
  private weak var plugin: AdmobPlugin?
  /// The live banner view, if any. A new `show` replaces it.
  private var bannerView: GADBannerView?
  /// Active Auto Layout constraints, deactivated/rebuilt on position changes.
  private var bannerConstraints: [NSLayoutConstraint] = []
  /// Ad unit of the current banner, used for event payloads.
  private var adUnitId: String?
  /// The `showBanner` invoke, settled exactly once on load success or failure.
  private var pendingShowInvoke: Invoke?

  init(plugin: AdmobPlugin) {
    self.plugin = plugin
    super.init()
  }

  /// Creates (replacing any previous banner), loads and attaches the banner.
  /// Inputs are already validated and parsed by the plugin. Called on the
  /// main queue.
  func show(
    adUnitId: String,
    position: AdmobMappers.BannerPositionDescriptor,
    size: AdmobMappers.BannerSizeDescriptor,
    invoke: Invoke
  ) {
    guard let container = plugin?.containerView() else {
      invoke.reject("no container view available to attach the banner", code: "NATIVE_ERROR")
      return
    }

    // One banner slot at a time: settle a superseded pending show and tear the
    // previous banner down before building the new one.
    if let pending = pendingShowInvoke {
      pendingShowInvoke = nil
      pending.reject("showBanner superseded by a new showBanner call", code: "LOAD_FAILED")
    }
    teardownBannerView()

    self.adUnitId = adUnitId
    pendingShowInvoke = invoke

    let adSize = resolvedAdSize(for: size, container: container)
    let banner = GADBannerView(adSize: adSize)
    banner.translatesAutoresizingMaskIntoConstraints = false
    banner.adUnitID = adUnitId
    banner.rootViewController = plugin?.rootViewController()
    banner.delegate = self
    banner.isHidden = true  // revealed when the SDK reports the ad
    container.addSubview(banner)
    bannerView = banner
    applyConstraints(for: banner, in: container, position: position, height: adSize.size.height)

    plugin?.logDebug("banner loading (\(adUnitId), \(position.rawValue), \(size))")
    banner.load(GADRequest())
  }

  /// Hides the banner while keeping its constraints for a later re-show.
  /// No-op when there is no banner. Called on the main queue.
  func hide() {
    bannerView?.isHidden = true
  }

  /// Rebuilds the placement constraints of a live banner. No-op when there is
  /// none (the caller still resolves). Called on the main queue.
  func setPosition(_ position: String) {
    guard let parsed = AdmobMappers.parseBannerPosition(position),
      let banner = bannerView,
      let container = banner.superview
    else {
      return
    }
    NSLayoutConstraint.deactivate(bannerConstraints)
    applyConstraints(for: banner, in: container, position: parsed, height: banner.adSize.size.height)
  }

  /// Removes the banner from the hierarchy and clears every reference. Safe
  /// when nothing was created. Called on the main queue.
  func destroy() {
    teardownBannerView()
    adUnitId = nil
    if let pending = pendingShowInvoke {
      pendingShowInvoke = nil
      pending.reject("banner destroyed while loading", code: "LOAD_FAILED")
    }
  }

  // MARK: - GADBannerViewDelegate

  func bannerViewDidReceiveAd(_ bannerView: GADBannerView) {
    DispatchQueue.main.async { [weak self] in
      guard let self, bannerView === self.bannerView else { return }
      bannerView.isHidden = false  // reveal
      self.plugin?.logDebug("banner loaded")
      self.plugin?.trigger(AdmobEvents.BANNER_LOADED, data: self.eventPayload())
      self.pendingShowInvoke?.resolve()
      self.pendingShowInvoke = nil
    }
  }

  func bannerView(_ bannerView: GADBannerView, didFailToReceiveAdWithError error: Error) {
    DispatchQueue.main.async { [weak self] in
      guard let self, bannerView === self.bannerView else { return }
      let nsError = error as NSError
      var payload = self.eventPayload()
      payload["code"] = "\(nsError.code)"
      payload["message"] = error.localizedDescription
      payload["domain"] = nsError.domain
      self.plugin?.trigger(AdmobEvents.BANNER_FAILED, data: payload)
      self.pendingShowInvoke?.reject(
        "banner failed to load: \(error.localizedDescription)", code: "LOAD_FAILED")
      self.pendingShowInvoke = nil
      // Do not keep a failed banner attached to the view hierarchy.
      self.teardownBannerView()
      self.adUnitId = nil
    }
  }

  func bannerViewDidRecordImpression(_ bannerView: GADBannerView) {
    DispatchQueue.main.async { [weak self] in
      guard let self, bannerView === self.bannerView else { return }
      self.plugin?.trigger(AdmobEvents.BANNER_IMPRESSION, data: self.eventPayload())
    }
  }

  func bannerViewDidRecordClick(_ bannerView: GADBannerView) {
    DispatchQueue.main.async { [weak self] in
      guard let self, bannerView === self.bannerView else { return }
      self.plugin?.trigger(AdmobEvents.BANNER_CLICKED, data: self.eventPayload())
    }
  }

  func bannerViewWillPresentScreen(_ bannerView: GADBannerView) {
    DispatchQueue.main.async { [weak self] in
      guard let self, bannerView === self.bannerView else { return }
      self.plugin?.trigger(AdmobEvents.BANNER_OPENED, data: self.eventPayload())
    }
  }

  func bannerViewDidDismissScreen(_ bannerView: GADBannerView) {
    DispatchQueue.main.async { [weak self] in
      guard let self, bannerView === self.bannerView else { return }
      self.plugin?.trigger(AdmobEvents.BANNER_CLOSED, data: self.eventPayload())
    }
  }

  // MARK: - Private

  /// Maps a parsed size descriptor to the concrete `GADAdSize`. Adaptive
  /// banners are anchored to the current orientation and sized from the
  /// container width.
  private func resolvedAdSize(
    for descriptor: AdmobMappers.BannerSizeDescriptor,
    container: UIView
  ) -> GADAdSize {
    switch descriptor {
    case .banner:
      return GADAdSizeBanner
    case .largeBanner:
      return GADAdSizeLargeBanner
    case .mediumRectangle:
      return GADAdSizeMediumRectangle
    case .fullBanner:
      return GADAdSizeFullBanner
    case .leaderboard:
      return GADAdSizeLeaderboard
    case .adaptive:
      return GADCurrentOrientationAnchoredAdaptiveBannerAdSizeWithWidth(adaptiveWidth(for: container))
    }
  }

  /// Width used for anchored adaptive banners: the container width when it is
  /// laid out, otherwise the screen width of the hosting window.
  private func adaptiveWidth(for container: UIView) -> CGFloat {
    if container.bounds.width > 0 {
      return container.bounds.width
    }
    if let window = container.window, let scene = window.windowScene {
      return scene.screen.bounds.width
    }
    return UIScreen.main.bounds.width
  }

  /// Pins the banner to the leading/trailing edges and the requested edge of
  /// the container's `safeAreaLayoutGuide`, so notch / Dynamic Island / home
  /// indicator are respected.
  private func applyConstraints(
    for banner: GADBannerView,
    in container: UIView,
    position: AdmobMappers.BannerPositionDescriptor,
    height: CGFloat
  ) {
    var constraints: [NSLayoutConstraint] = [
      banner.leadingAnchor.constraint(equalTo: container.leadingAnchor),
      banner.trailingAnchor.constraint(equalTo: container.trailingAnchor),
      banner.heightAnchor.constraint(equalToConstant: height),
    ]
    switch position {
    case .bottom:
      constraints.append(
        banner.bottomAnchor.constraint(equalTo: container.safeAreaLayoutGuide.bottomAnchor))
    case .top:
      constraints.append(
        banner.topAnchor.constraint(equalTo: container.safeAreaLayoutGuide.topAnchor))
    }
    NSLayoutConstraint.activate(constraints)
    bannerConstraints = constraints
  }

  /// Detaches the current banner view: nils the delegate, deactivates its
  /// constraints and removes it from the superview.
  private func teardownBannerView() {
    NSLayoutConstraint.deactivate(bannerConstraints)
    bannerConstraints = []
    if let banner = bannerView {
      banner.delegate = nil
      banner.removeFromSuperview()
    }
    bannerView = nil
  }

  /// Base payload for banner events: the current ad unit.
  private func eventPayload() -> JSObject {
    var payload: JSObject = [:]
    if let adUnitId {
      payload["adUnitId"] = adUnitId
    }
    return payload
  }
}

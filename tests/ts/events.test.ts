import { beforeEach, describe, expect, it, vi } from 'vitest'

const invokeMock = vi.fn()
const addPluginListenerMock = vi.fn()
const listenMock = vi.fn()

vi.mock('@tauri-apps/api/core', () => ({
  invoke: (...args: unknown[]) => invokeMock(...args),
  addPluginListener: (...args: unknown[]) => addPluginListenerMock(...args),
}))

vi.mock('@tauri-apps/api/event', () => ({
  listen: (...args: unknown[]) => listenMock(...args),
}))

import { AdMob } from '../../guest-js'
import { __resetEventChannelCache } from '../../guest-js/events'

beforeEach(() => {
  __resetEventChannelCache()
  invokeMock.mockReset()
  addPluginListenerMock.mockReset()
  listenMock.mockReset()
})

describe('AdMob.on', () => {
  it('subscribes through the plugin event channel on mobile', async () => {
    invokeMock.mockResolvedValue(true) // is_supported
    const unregister = vi.fn().mockResolvedValue(undefined)
    addPluginListenerMock.mockResolvedValue({ unregister })

    const handler = vi.fn()
    const unlisten = await AdMob.on('admob://rewarded-earned', (payload) => handler(payload))

    expect(addPluginListenerMock).toHaveBeenCalledWith(
      'admob',
      'admob://rewarded-earned',
      expect.any(Function),
    )
    expect(listenMock).not.toHaveBeenCalled()

    await unlisten()
    expect(unregister).toHaveBeenCalledTimes(1)
  })

  it('subscribes through the global event system on desktop', async () => {
    invokeMock.mockResolvedValue(false) // is_supported
    const sdkUnlisten = vi.fn()
    listenMock.mockResolvedValue(sdkUnlisten)

    let received: { amount: number; type: string } | undefined
    const unlisten = await AdMob.on('admob://rewarded-earned', (payload) => {
      received = payload
    })

    expect(listenMock).toHaveBeenCalledWith(
      'admob://initialized'.replace('initialized', 'rewarded-earned'),
      expect.any(Function),
    )
    expect(addPluginListenerMock).not.toHaveBeenCalled()

    const registeredHandler = listenMock.mock.calls[0][1] as (event: {
      payload: unknown
    }) => void
    registeredHandler({ payload: { adUnitId: 'test', amount: 5, type: 'coins' } })
    expect(received).toEqual({ adUnitId: 'test', amount: 5, type: 'coins' })

    await unlisten()
    expect(sdkUnlisten).toHaveBeenCalledTimes(1)
  })

  it('caches the platform detection between subscriptions', async () => {
    invokeMock.mockResolvedValue(true)
    addPluginListenerMock.mockResolvedValue({ unregister: vi.fn().mockResolvedValue(undefined) })

    await AdMob.on('admob://banner-loaded', () => {})
    await AdMob.on('admob://banner-failed', () => {})

    expect(invokeMock).toHaveBeenCalledTimes(1) // only is_supported
    expect(addPluginListenerMock).toHaveBeenCalledTimes(2)
  })

  it('treats platform detection failures as desktop', async () => {
    invokeMock.mockRejectedValue({ code: 'NATIVE_ERROR', message: 'no runtime' })
    const sdkUnlisten = vi.fn()
    listenMock.mockResolvedValue(sdkUnlisten)

    const unlisten = await AdMob.on('admob://initialized', () => {})
    expect(listenMock).toHaveBeenCalled()
    expect(addPluginListenerMock).not.toHaveBeenCalled()
    await unlisten()
  })
})

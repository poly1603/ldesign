import { describe, it, expect } from 'vitest'
import { createBrowserCache, createSSRCache, createNodeCache, createOfflineCache, getPresetOptions, createCache } from '../src'

async function basicSetGetWorks(factory: () => any) {
  const cache = factory()
  await cache.set('p', 'v')
  const v = await cache.get<string>('p')
  expect(v).toBe('v')
}

describe('presets', () => {
  it('createBrowserCache: should set/get', async () => {
    await basicSetGetWorks(() => createBrowserCache())
  })

  it('createSSRCache: should set/get and use memory by default', async () => {
    const cache = createSSRCache()
    await cache.set('p', 'v')
    const v = await cache.get<string>('p')
    expect(v).toBe('v')
    const keys = await cache.keys('memory')
    expect(keys).toContain('p')
  })

  it('createNodeCache: should set/get', async () => {
    await basicSetGetWorks(() => createNodeCache())
  })

  it('createOfflineCache: should set/get', async () => {
    await basicSetGetWorks(() => createOfflineCache())
  })

  it('getPresetOptions: returns expected presets', () => {
    const browser = getPresetOptions('browser')
    expect(browser.strategy?.enabled).toBe(true)
    const ssr = getPresetOptions('ssr')
    expect(ssr.defaultEngine).toBe('memory')
    const node = getPresetOptions('node')
    expect(node.defaultEngine).toBe('memory')
    const offline = getPresetOptions('offline')
    expect(offline.strategy?.enabled).toBe(true)
  })

  it('createCache(): auto detects browser preset in jsdom', async () => {
    const cache = createCache()
    await cache.set('auto', 'yes')
    const v = await cache.get<string>('auto')
    expect(v).toBe('yes')
    const k = await cache.keys('localStorage')
    expect(k).toContain('auto')
  })

  it('createCache({ preset }): should honor preset override', async () => {
    const cache = createCache({ preset: 'node' })
    await cache.set('x', 'y')
    const k = await cache.keys('memory')
    expect(k).toContain('x')
  })
})


/**
 * 加载器功能测试
 * 测试各种语言包加载器
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DefaultLoader, HttpLoader, StaticLoader } from '../src/core/loader'

describe('defaultLoader', () => {
  let loader: DefaultLoader

  beforeEach(() => {
    loader = new DefaultLoader(['zh-CN', 'en'])
  })

  it('应该正确创建 DefaultLoader 实例', () => {
    expect(loader).toBeInstanceOf(DefaultLoader)
  })

  it('应该正确获取可用语言列表', () => {
    const availableLocales = loader.getAvailableLocales()
    expect(availableLocales).toContain('zh-CN')
    expect(availableLocales).toContain('en')
  })

  it('应该在加载不存在的语言时返回空包', async () => {
    const result = await loader.load('nonexistent')
    expect(result).toBeDefined()
    expect(result.info.code).toBe('nonexistent')
    expect(result.translations).toEqual({})
  })
})

describe('staticLoader', () => {
  let loader: StaticLoader

  const testPackages = {
    'zh-CN': {
      info: {
        name: '中文',
        nativeName: '中文',
        code: 'zh-CN',
        direction: 'ltr',
        dateFormat: 'YYYY-MM-DD',
      },
      translations: {
        hello: '你好',
        welcome: '欢迎使用 {name}',
      },
    },
    'en': {
      info: {
        name: 'English',
        nativeName: 'English',
        code: 'en',
        direction: 'ltr',
        dateFormat: 'YYYY-MM-DD',
      },
      translations: {
        hello: 'Hello',
        welcome: 'Welcome to {name}',
      },
    },
  }

  beforeEach(() => {
    loader = new StaticLoader()
    loader.registerPackages(testPackages)
  })

  it('应该正确创建 StaticLoader 实例', () => {
    expect(loader).toBeInstanceOf(StaticLoader)
  })

  it('应该正确加载静态语言包', async () => {
    await loader.load('zh-CN')
    expect(loader.isLoaded('zh-CN')).toBe(true)
  })

  it('应该在加载不存在的语言时抛出错误', async () => {
    await expect(loader.load('nonexistent')).rejects.toThrow()
  })

  it('应该正确获取可用语言列表', () => {
    const availableLocales = loader.getAvailableLocales()
    expect(availableLocales).toContain('zh-CN')
    expect(availableLocales).toContain('en')
  })

  it('应该正确预加载语言包', async () => {
    await loader.preload('zh-CN')
    expect(loader.isLoaded('zh-CN')).toBe(true)
  })
})

describe('httpLoader', () => {
  let loader: HttpLoader

  beforeEach(() => {
    loader = new HttpLoader('/locales')
    // Mock fetch
    global.fetch = vi.fn()
  })

  it('应该正确创建 HttpLoader 实例', () => {
    expect(loader).toBeInstanceOf(HttpLoader)
  })

  it('应该正确处理基础功能', () => {
    expect(loader).toBeInstanceOf(HttpLoader)
    expect(typeof loader.load).toBe('function')
  })
})

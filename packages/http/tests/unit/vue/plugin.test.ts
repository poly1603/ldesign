import type { HttpClient } from '@/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, getCurrentInstance } from 'vue'
import { HttpPlugin, HttpProvider } from '@/vue/plugin'

// Mock getCurrentInstance
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    getCurrentInstance: vi.fn(),
  }
})

// 创建模拟 HTTP 客户端
function createMockClient(): HttpClient {
  return {
    request: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    head: vi.fn(),
    options: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn(), clear: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn(), clear: vi.fn() },
      error: { use: vi.fn(), eject: vi.fn(), clear: vi.fn() },
    },
    cancelAll: vi.fn(),
    getActiveRequestCount: vi.fn().mockReturnValue(0),
    updateRetryConfig: vi.fn(),
    getConfig: vi.fn().mockReturnValue({}),
    clearCache: vi.fn(),
    getConcurrencyStatus: vi.fn().mockReturnValue({
      activeCount: 0,
      queuedCount: 0,
      maxConcurrent: 10,
      maxQueueSize: 100,
    }),
    cancelQueue: vi.fn(),
  }
}

describe('httpPlugin', () => {
  let app: ReturnType<typeof createApp>
  let mockClient: HttpClient

  beforeEach(() => {
    app = createApp({})
    mockClient = createMockClient()
  })

  describe('install', () => {
    it('should install plugin with default options', () => {
      expect(() => {
        app.use(HttpPlugin)
      }).not.toThrow()
    })

    it('should install plugin with custom client', () => {
      expect(() => {
        app.use(HttpPlugin, { client: mockClient })
      }).not.toThrow()
    })

    it('should install plugin with global config', () => {
      const globalConfig = {
        baseURL: 'https://api.example.com',
        timeout: 5000,
      }

      expect(() => {
        app.use(HttpPlugin, { globalConfig })
      }).not.toThrow()
    })

    it('should install plugin with custom global property name', () => {
      expect(() => {
        app.use(HttpPlugin, {
          client: mockClient,
          globalProperty: '$api',
        })
      }).not.toThrow()
    })

    it('should register global property', () => {
      app.use(HttpPlugin, { client: mockClient })

      // 检查全局属性是否注册
      expect((app.config.globalProperties as any).$http).toBe(mockClient)
    })

    it('should register custom global property name', () => {
      app.use(HttpPlugin, {
        client: mockClient,
        globalProperty: '$api',
      })

      expect((app.config.globalProperties as any).$api).toBe(mockClient)
    })
  })
})

describe('httpProvider', () => {
  it('should have correct name', () => {
    expect(HttpProvider.name).toBe('HttpProvider')
  })

  it('should have correct props definition', () => {
    expect(HttpProvider.props).toHaveProperty('client')
    expect(HttpProvider.props).toHaveProperty('config')

    expect(HttpProvider.props.client.required).toBe(false)
    expect(HttpProvider.props.config.required).toBe(false)
  })

  it('should render slots', () => {
    const mockSlots = {
      default: vi.fn(() => 'test content'),
    }

    // 模拟Vue组件上下文
    const mockApp = {
      provide: vi.fn(),
    }

    // 在模拟的Vue应用上下文中运行
    vi.mocked(getCurrentInstance).mockReturnValue({
      appContext: {
        app: mockApp,
      },
    } as any)

    const setupResult = HttpProvider.setup(
      { client: createMockClient() },
      { slots: mockSlots },
    )

    // 调用渲染函数
    const result = setupResult()

    expect(mockSlots.default).toHaveBeenCalled()
    expect(result).toBe('test content')

    // 清理mock
    vi.mocked(getCurrentInstance).mockReturnValue(null)
  })
})

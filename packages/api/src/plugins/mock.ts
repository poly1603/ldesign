/**
 * Mock数据插件
 * 用于开发和测试环境模拟API响应
 */
import type { ApiPlugin, RequestMiddleware } from '../types'

/**
 * Mock响应配置
 */
export interface MockResponse {
  /** 响应数据 */
  data?: any
  /** HTTP状态码 */
  status?: number
  /** 响应头 */
  headers?: Record<string, string>
  /** 延迟时间（毫秒） */
  delay?: number
  /** 错误配置 */
  error?: {
    message: string
    code?: string
    status?: number
  }
}

/**
 * Mock规则
 */
export interface MockRule {
  /** 匹配模式：方法名、URL正则、或自定义函数 */
  match: string | RegExp | ((methodName: string, url: string) => boolean)
  /** Mock响应（可以是函数动态生成） */
  response: MockResponse | ((params: any, config: any) => MockResponse | Promise<MockResponse>)
  /** 是否启用 */
  enabled?: boolean
}

/**
 * Mock插件配置
 */
export interface MockPluginOptions {
  /** 是否启用Mock */
  enabled?: boolean
  /** Mock规则列表 */
  rules?: MockRule[]
  /** 默认延迟（毫秒） */
  defaultDelay?: number
  /** 是否打印Mock日志 */
  logging?: boolean
  /** 全局Mock开关（用于快速禁用所有Mock） */
  globalSwitch?: boolean
}

/**
 * 检查URL是否匹配规则
 */
function matchRule(rule: MockRule, methodName: string, url: string): boolean {
  if (rule.enabled === false) {
    return false
  }

  if (typeof rule.match === 'string') {
    // 精确匹配方法名或URL
    return rule.match === methodName || url.includes(rule.match)
  }

  if (rule.match instanceof RegExp) {
    // 正则匹配URL
    return rule.match.test(url)
  }

  if (typeof rule.match === 'function') {
    // 自定义函数匹配
    return rule.match(methodName, url)
  }

  return false
}

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 创建Mock插件
 */
export function createMockPlugin(options: MockPluginOptions = {}): ApiPlugin {
  const config = {
    enabled: true,
    rules: [],
    defaultDelay: 300,
    logging: true,
    globalSwitch: true,
    ...options,
  }

  const log = (...args: any[]) => {
    if (config.logging) {
      console.info('[Mock]', ...args)
    }
  }

  const requestMiddleware: RequestMiddleware = async (reqConfig, ctx) => {
    // 检查是否启用
    if (!config.enabled || !config.globalSwitch) {
      return reqConfig
    }

    const methodName = ctx.methodName
    const url = reqConfig.url || ''

    // 查找匹配的规则
    const rule = config.rules.find(r => matchRule(r, methodName, url))

    if (!rule) {
      return reqConfig
    }

    // 标记为Mock请求
    ;(reqConfig as any).__isMock = true
    ;(reqConfig as any).__mockRule = rule

    return reqConfig
  }

  const plugin: ApiPlugin & {
    addRule: (rule: MockRule) => void
    removeRule: (match: string | RegExp) => void
    clearRules: () => void
    setEnabled: (enabled: boolean) => void
    setGlobalSwitch: (enabled: boolean) => void
  } = {
    name: 'mock',
    version: '1.0.0',
    install(engine) {
      // 注册请求中间件
      engine.config.middlewares ||= {}
      engine.config.middlewares.request ||= []
      engine.config.middlewares.response ||= []

      // 在请求阶段标记Mock
      engine.config.middlewares.request.unshift(requestMiddleware)

      // 在响应阶段返回Mock数据
      engine.config.middlewares.response.unshift(async (response, ctx) => {
        const reqConfig = (ctx as any).request

        if (!(reqConfig as any).__isMock) {
          return response
        }

        const rule: MockRule = (reqConfig as any).__mockRule

        // 生成Mock响应
        let mockResponse: MockResponse
        if (typeof rule.response === 'function') {
          mockResponse = await Promise.resolve(
            rule.response(ctx.params, reqConfig),
          )
        }
        else {
          mockResponse = rule.response
        }

        // 延迟响应
        const delayTime = mockResponse.delay ?? config.defaultDelay
        if (delayTime > 0) {
          await delay(delayTime)
        }

        // 如果配置了错误，抛出错误
        if (mockResponse.error) {
          log('Mock Error:', ctx.methodName, mockResponse.error)
          const error: any = new Error(mockResponse.error.message)
          error.code = mockResponse.error.code
          error.response = {
            status: mockResponse.error.status || 500,
            data: { message: mockResponse.error.message },
          }
          throw error
        }

        // 构造Mock响应对象
        const mockedResponse = {
          data: mockResponse.data ?? null,
          status: mockResponse.status ?? 200,
          statusText: 'OK',
          headers: mockResponse.headers || {},
          config: reqConfig,
        }

        log('Mock Success:', ctx.methodName, '→', mockedResponse.data)

        return mockedResponse
      })

      // 将插件API存储到引擎
      ;(engine as any).__mockPlugin = plugin
    },

    uninstall() {
      // 清理mock规则
      config.rules = []
    },

    /**
     * 动态添加Mock规则
     */
    addRule(rule: MockRule) {
      config.rules.push(rule)
    },

    /**
     * 移除Mock规则
     */
    removeRule(match: string | RegExp) {
      const index = config.rules.findIndex((r) => {
        if (typeof match === 'string') {
          return typeof r.match === 'string' && r.match === match
        }
        if (match instanceof RegExp) {
          return r.match instanceof RegExp && r.match.source === match.source
        }
        return false
      })
      if (index > -1) {
        config.rules.splice(index, 1)
      }
    },

    /**
     * 清空所有Mock规则
     */
    clearRules() {
      config.rules = []
    },

    /**
     * 启用/禁用Mock
     */
    setEnabled(enabled: boolean) {
      config.enabled = enabled
    },

    /**
     * 全局开关
     */
    setGlobalSwitch(enabled: boolean) {
      config.globalSwitch = enabled
    },
  }

  return plugin
}

/**
 * Mock数据生成辅助函数
 */
export const MockHelpers = {
  /**
   * 生成分页数据
   */
  paginate<T>(data: T[], page: number = 1, pageSize: number = 10) {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return {
      data: data.slice(start, end),
      total: data.length,
      page,
      pageSize,
      totalPages: Math.ceil(data.length / pageSize),
    }
  },

  /**
   * 生成随机数
   */
  random(min: number = 0, max: number = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  },

  /**
   * 生成随机布尔值
   */
  randomBool(): boolean {
    return Math.random() > 0.5
  },

  /**
   * 从数组中随机选择
   */
  randomPick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
  },

  /**
   * 生成随机字符串
   */
  randomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
    return result
  },

  /**
   * 生成随机日期
   */
  randomDate(start?: Date, end?: Date): string {
    const startTime = start ? start.getTime() : Date.now() - 365 * 24 * 60 * 60 * 1000
    const endTime = end ? end.getTime() : Date.now()
    const timestamp = startTime + Math.random() * (endTime - startTime)
    return new Date(timestamp).toISOString()
  },

  /**
   * 模拟加载延迟
   */
  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  },
}

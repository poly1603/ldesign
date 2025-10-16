/**
 * 日志与性能插件
 * - 请求前后打印日志（debug 环境）
 * - 计算耗时
 * - 可注入 X-Request-Id
 */
import type { ApiPlugin } from '../types'
import { generateShortId } from '../utils/IdGenerator'

export interface LoggingPluginOptions {
  enabled?: boolean
  requestIdHeader?: string
  requestIdFactory?: () => string
  logLevel?: 'info' | 'debug' | 'warn' | 'error'
  /** 是否包含时间戳 */
  includeTimestamp?: boolean
  /** 是否包含请求数据 */
  includeRequestData?: boolean
  /** 是否包含响应数据 */
  includeResponseData?: boolean
}

export function createLoggingPlugin(options: LoggingPluginOptions = {}): ApiPlugin {
  const enabled = options.enabled ?? true
  const requestIdHeader = options.requestIdHeader ?? 'X-Request-Id'
  const requestIdFactory = options.requestIdFactory ?? (() => generateShortId(12))
  const level = options.logLevel ?? 'info'
  const includeTimestamp = options.includeTimestamp ?? true
  const includeRequestData = options.includeRequestData ?? true
  const includeResponseData = options.includeResponseData ?? false

  const log = (logLevel: string, ...args: unknown[]) => {
    if (!enabled)
      return

    const timestamp = includeTimestamp ? new Date().toISOString() : null
    const prefix = timestamp ? `[API ${timestamp}]` : '[API]'

    switch (logLevel) {
      case 'debug':
        
        break
      case 'warn':
        console.warn(prefix, ...args)
        break
      case 'error':
        console.error(prefix, ...args)
        break
      default:
        console.info(prefix, ...args)
    }
  }

  return {
    name: 'logging',
    version: '1.0.0',
    install(engine) {
      engine.config.middlewares ||= {}
      engine.config.middlewares.request ||= []
      engine.config.middlewares.response ||= []
      engine.config.middlewares.error ||= []

      const reqMw = async (cfg: any, ctx: any) => {
        const id = requestIdFactory()
        cfg.headers = { ...(cfg.headers || {}), [requestIdHeader]: id }
        ;(cfg as any).__start = Date.now()
        ;(cfg as any).__rid = id

        const logData: any = { id }
        if (includeRequestData) {
          logData.params = cfg.params
          logData.data = cfg.data
        }

        log(level, '→', ctx.methodName, cfg.method, cfg.url, logData)
        return cfg
      }

      const resMw = async (res: any, ctx: any) => {
        const start = (res?.config as any)?.__start
        const id = (res?.config as any)?.__rid
        const cost = start ? (Date.now() - start) : undefined

        const logData: any = { id, cost }
        if (includeResponseData) {
          logData.data = res?.data
        }

        log(level, '←', ctx.methodName, res?.status, logData)
        return res
      }

      const errMw = async (err: any, ctx: any) => {
        const start = (err?.config as any)?.__start
        const id = (err?.config as any)?.__rid
        const cost = start ? (Date.now() - start) : undefined
        log('error', '×', ctx.methodName, err?.response?.status ?? 'ERR', {
          id,
          cost,
          error: String(err),
          message: err?.message,
        })
      }

      engine.config.middlewares.request.push(reqMw as any)
      engine.config.middlewares.response.push(resMw as any)
      engine.config.middlewares.error.push(errMw as any)
    },
  }
}

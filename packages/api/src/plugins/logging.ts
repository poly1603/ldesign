/**
 * 日志与性能插件
 * - 请求前后打印日志（debug 环境）
 * - 计算耗时
 * - 可注入 X-Request-Id
 */
import type { ApiPlugin } from '../types'

export interface LoggingPluginOptions {
  enabled?: boolean
  requestIdHeader?: string
  requestIdFactory?: () => string
  logLevel?: 'info' | 'debug'
}

export function createLoggingPlugin(options: LoggingPluginOptions = {}): ApiPlugin {
  const enabled = options.enabled ?? true
  const requestIdHeader = options.requestIdHeader ?? 'X-Request-Id'
  const requestIdFactory = options.requestIdFactory ?? (() => Math.random().toString(36).slice(2))
  const level = options.logLevel ?? 'info'

  const log = (...args: unknown[]) => {
    if (!enabled)
      return
    if (level === 'debug')
      console.debug('[API]', ...args)
    else console.info('[API]', ...args)
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
        log('→', ctx.methodName, cfg.method, cfg.url, { params: cfg.params, data: cfg.data, id })
        return cfg
      }

      const resMw = async (res: any, ctx: any) => {
        const start = (res?.config as any)?.__start
        const id = (res?.config as any)?.__rid
        const cost = start ? (Date.now() - start) : undefined
        log('←', ctx.methodName, res?.status, { id, cost })
        return res
      }

      const errMw = async (err: any, ctx: any) => {
        const start = (err?.config as any)?.__start
        const id = (err?.config as any)?.__rid
        const cost = start ? (Date.now() - start) : undefined
        log('×', ctx.methodName, err?.response?.status ?? 'ERR', { id, cost, error: String(err) })
      }

      engine.config.middlewares.request.push(reqMw as any)
      engine.config.middlewares.response.push(resMw as any)
      engine.config.middlewares.error.push(errMw as any)
    },
  }
}

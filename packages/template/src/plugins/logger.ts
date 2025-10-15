/**
 * 日志插件
 */

import type { TemplateManager } from '../runtime/manager'
import type { LoggerPluginConfig, Plugin } from '../types'
import { getGlobalEmitter } from '../core/events'
import { PLUGIN_VERSION } from '../utils/constants'

export function createLoggerPlugin(config: LoggerPluginConfig = {}): Plugin {
  const {
    level = 'info',
    prefix = '[Template]',
    colors = true,
    timestamp = true,
  } = config

  const levels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  }

  const currentLevel = levels[level]

  const log = (logLevel: string, message: string, ...args: any[]) => {
    if (levels[logLevel as keyof typeof levels] < currentLevel)
return

    const time = timestamp ? `[${new Date().toLocaleTimeString()}]` : ''
    const fullPrefix = `${time} ${prefix}`.trim()

    if (config.handler) {
      config.handler(logLevel, message, ...args)
    }
 else {
      console[logLevel as 'log' | 'info' | 'warn' | 'error'](fullPrefix, message, ...args)
    }
  }

  return {
    name: 'logger',
    version: PLUGIN_VERSION,

    install(manager: TemplateManager) {
      const emitter = getGlobalEmitter()

      // 监听事件并记录日志
      emitter.on('template:registered', ({ id }) => {
        log('info', `Template registered: ${id}`)
      })

      emitter.on('template:loading', ({ id }) => {
        log('debug', `Loading template: ${id}`)
      })

      emitter.on('template:loaded', ({ id, loadTime }) => {
        log('info', `Template loaded: ${id} (${loadTime}ms)`)
      })

      emitter.on('template:error', ({ id, error }) => {
        log('error', `Template error: ${id}`, error)
      })

      emitter.on('cache:hit', ({ key }) => {
        log('debug', `Cache hit: ${key}`)
      })

      emitter.on('cache:miss', ({ key }) => {
        log('debug', `Cache miss: ${key}`)
      })

      emitter.on('device:changed', ({ from, to }) => {
        log('info', `Device changed: ${from} → ${to}`)
      })
    },
  }
}

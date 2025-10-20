/**
 * Crypto Engine 插件
 *
 * 将 Crypto 功能集成到 LDesign Engine 中，提供统一的加密解密管理体验
 */

import type { Plugin } from '@ldesign/engine/types'

import { CryptoPlugin, type CryptoPluginOptions } from '../adapt/vue/plugin'
import {
  aes,
  base64,
  cryptoManager,
  decrypt,
  digitalSignature,
  encoding,
  encrypt,
  hash,
  hex,
  hmac,
  keyGenerator,
  rsa,
} from '../core'

/**
 * Crypto Engine 插件配置选项
 */
export interface CryptoEnginePluginOptions extends CryptoPluginOptions {
  /** 插件名称 */
  name?: string
  /** 插件版本 */
  version?: string
  /** 插件描述 */
  description?: string
  /** 插件依赖 */
  dependencies?: string[]
  /** 是否自动安装到 Vue 应用 */
  autoInstall?: boolean
  /** 是否启用性能监控 */
  enablePerformanceMonitoring?: boolean
  /** 是否启用调试模式 */
  debug?: boolean
}

/**
 * 默认配置
 */
const defaultConfig: Partial<CryptoEnginePluginOptions> = {
  name: 'crypto',
  version: '1.0.0',
  description: 'LDesign Crypto Engine Plugin',
  dependencies: [],
  autoInstall: true,
  enablePerformanceMonitoring: false,
  debug: false,
  globalPropertyName: '$crypto',
  registerComposables: true,
  config: {
    defaultAESKeySize: 256,
    defaultRSAKeySize: 2048,
    defaultHashAlgorithm: 'SHA256',
    defaultEncoding: 'base64',
  },
}

/**
 * 创建全局 Crypto 实例
 */
interface EngineLike {
  logger?: { info?: (...args: unknown[]) => void; error?: (...args: unknown[]) => void }
  events?: { once?: (event: string, cb: () => void) => void; emit?: (event: string, payload?: unknown) => void }
  getApp?: () => unknown
  state?: { set?: (k: string, v: unknown) => void; delete?: (k: string) => void }
  performance?: { mark?: (label: string) => void }
}

function createGlobalCryptoInstance(options?: CryptoEnginePluginOptions) {
  return {
    // 核心功能
    encrypt,
    decrypt,
    hash,
    hmac,
    keyGenerator,
    digitalSignature,

    // 算法实现
    aes,
    rsa,
    encoding,
    base64,
    hex,

    // 管理器
    manager: cryptoManager,

    // 配置
    config: options?.config || defaultConfig.config,
  }
}

/**
 * 创建 Crypto Engine 插件
 *
 * 将 Crypto 功能集成到 LDesign Engine 中，提供统一的加密解密管理体验
 *
 * @param options 插件配置选项
 * @returns Engine 插件实例
 *
 * @example
 * ```typescript
 * import { createCryptoEnginePlugin } from '@ldesign/crypto'
 *
 * const cryptoPlugin = createCryptoEnginePlugin({
 *   config: {
 *     defaultAESKeySize: 256,
 *     defaultRSAKeySize: 2048,
 *     defaultHashAlgorithm: 'SHA256'
 *   },
 *   globalPropertyName: '$crypto',
 *   enablePerformanceMonitoring: true
 * })
 *
 * await engine.use(cryptoPlugin)
 * ```
 */
export function createCryptoEnginePlugin(
  options: CryptoEnginePluginOptions = {},
): Plugin {
  // 合并配置
  const config = { ...defaultConfig, ...options }

  const {
    name = 'crypto',
    version = '1.0.0',
    // description = 'LDesign Crypto Engine Plugin', // 未使用
    dependencies = [],
    autoInstall = true,
    enablePerformanceMonitoring = false,
    debug = false,
  } = config

  if (debug) {
     
    console.info('[Crypto Plugin] createCryptoEnginePlugin called with options:', options)
  }

  return {
    name,
    version,
    dependencies,

    async install(context: EngineLike | { engine?: EngineLike }) {
      try {
        if (debug) {
           
          console.info('[Crypto Plugin] install method called with context:', context)
        }

        // 从上下文中获取引擎实例
        const engine = (context as { engine?: EngineLike }).engine || (context as EngineLike)

        if (debug) {
           
          console.info('[Crypto Plugin] engine instance:', !!engine)
        }

        // 定义实际的安装逻辑
        const performInstall = async () => {
          engine.logger?.info('[Crypto Plugin] performInstall called')

          // 获取 Vue 应用实例
          const vueApp = engine.getApp()
          if (!vueApp) {
            throw new Error(
              'Vue app not found. Make sure the engine has created a Vue app before installing crypto plugin.',
            )
          }

          engine.logger?.info('[Crypto Plugin] Vue app found, proceeding with installation')

          // 记录插件安装开始
          engine.logger?.info(`Installing ${name} plugin...`, {
            version,
            enablePerformanceMonitoring,
          })

          // 创建全局 Crypto 实例
          const globalCrypto = createGlobalCryptoInstance(config)

          // 注册到 Engine 状态管理
          if (engine.state) {
            engine.state.set('crypto:instance', globalCrypto)
            engine.state.set('crypto:config', config.config)
            engine.state.set('crypto:manager', cryptoManager)
          }

          // 安装 Vue 插件
          if (autoInstall) {
            vueApp.use(CryptoPlugin, {
              globalPropertyName: config.globalPropertyName,
              registerComposables: config.registerComposables,
              config: config.config,
            })

            if (debug) {
               
              console.info('[Crypto Plugin] Vue plugin installed successfully')
            }
          } else {
            // 如果不自动安装 Vue 插件，则手动注册全局提供者
            vueApp.provide('crypto', globalCrypto)
            vueApp.provide('cryptoConfig', config.config)
          }

          // 注册管理器（不会重复）
          vueApp.provide('cryptoManager', cryptoManager)

          // 性能监控
          if (enablePerformanceMonitoring && engine.performance) {
            engine.performance.mark('crypto-plugin-installed')
          }

          // 注册事件监听器
          if (engine.events) {
            engine.events.emit('plugin:installed', {
              name,
              version,
              type: 'crypto',
            })
          }

          engine.logger?.info(`${name} plugin installed successfully`)
        }

        // 检查 Vue 应用是否已经创建
        const vueApp = engine.getApp()
        if (vueApp) {
          engine.logger?.info('[Crypto Plugin] Vue app found, installing immediately')
          await performInstall()
        } else {
          engine.logger?.info('[Crypto Plugin] Vue app not found, registering event listener')
          // 如果 Vue 应用还没有创建，等待 app:created 事件
          await new Promise<void>((resolve, reject) => {
            engine.events?.once('app:created', async () => {
              try {
                engine.logger?.info('[Crypto Plugin] app:created event received, installing now')
                await performInstall()
                resolve()
              } catch (error) {
                engine.logger?.error('[Crypto Plugin] Failed to install after app creation:', error)
                reject(error)
              }
            })

            engine.logger?.info(`${name} plugin registered, waiting for Vue app creation...`)
          })
        }
      } catch (error) {
        // 使用engine.logger记录错误，如果不可用则使用console.error
        if (context.engine?.logger) {
          context.engine.logger.error('[Crypto Plugin] Installation failed:', error)
        } else {
          console.error('[Crypto Plugin] Installation failed:', error)
        }
        throw error
      }
    },

    async uninstall(context: EngineLike | { engine?: EngineLike }) {
      try {
        const engine = (context as { engine?: EngineLike }).engine || (context as EngineLike)

        engine.logger?.info(`Uninstalling ${name} plugin...`)

        // 清理状态
        if (engine.state) {
          engine.state.delete('crypto:instance')
          engine.state.delete('crypto:config')
          engine.state.delete('crypto:manager')
        }

        // 发送卸载事件
        if (engine.events) {
          engine.events.emit('plugin:uninstalled', {
            name,
            version,
            type: 'crypto',
          })
        }

        engine.logger?.info(`${name} plugin uninstalled successfully`)
      } catch (error) {
        const engine = context.engine || context
        if (
          engine
          && engine.logger
          && typeof engine.logger.error === 'function'
        ) {
          engine.logger.error(`Failed to uninstall ${name} plugin:`, error)
        } else {
          console.error(`Failed to uninstall ${name} plugin:`, error)
        }
        throw error
      }
    },
  }
}

// ==================== 便捷工厂函数 ====================

/**
 * 创建默认 Crypto 插件
 */
export function createDefaultCryptoEnginePlugin(): Plugin {
  return createCryptoEnginePlugin(defaultConfig)
}

/**
 * 创建高性能 Crypto 插件
 */
export function createPerformanceCryptoEnginePlugin(
  options?: Partial<CryptoEnginePluginOptions>,
): Plugin {
  return createCryptoEnginePlugin({
    ...defaultConfig,
    enablePerformanceMonitoring: true,
    config: {
      ...defaultConfig.config,
      defaultAESKeySize: 256,
      defaultRSAKeySize: 4096,
    },
    ...options,
  })
}

/**
 * 创建调试模式 Crypto 插件
 */
export function createDebugCryptoEnginePlugin(
  options?: Partial<CryptoEnginePluginOptions>,
): Plugin {
  return createCryptoEnginePlugin({
    ...defaultConfig,
    debug: true,
    enablePerformanceMonitoring: true,
    ...options,
  })
}

// ==================== 默认导出 ====================

export default {
  createCryptoEnginePlugin,
  createDefaultCryptoEnginePlugin,
  createPerformanceCryptoEnginePlugin,
  createDebugCryptoEnginePlugin,
}

/**
 * 向后兼容的导出
 */
export { createCryptoEnginePlugin as cryptoEnginePlugin }

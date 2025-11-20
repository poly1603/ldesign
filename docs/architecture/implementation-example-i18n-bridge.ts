/**
 * I18n 桥接插件实现示例
 * 
 * 这个文件展示如何将 I18nAdapter 改为 Engine 插件
 * 
 * 位置: packages/engine/packages/plugins/i18n-bridge/src/index.ts
 */

import type { Plugin, PluginContext } from '@ldesign/engine-core'
import type { OptimizedI18n } from '@ldesign/i18n-core'

/**
 * I18n 桥接插件选项
 */
export interface I18nBridgeOptions {
  /**
   * i18n 实例（可选）
   * 如果不提供，会尝试从 engine.api.get('i18n') 获取
   */
  i18n?: OptimizedI18n
  
  /**
   * 状态键前缀（默认 'i18n'）
   */
  statePrefix?: string
  
  /**
   * 是否发布初始状态（默认 true）
   */
  publishInitialState?: boolean
}

/**
 * I18n 状态类型定义
 */
export interface I18nLocaleState {
  locale: string
  oldLocale: string | null
  timestamp: number
}

export interface I18nMessagesState {
  locale: string
  messages: Record<string, any>
  timestamp: number
}

/**
 * 创建 I18n 桥接插件
 * 
 * 功能:
 * 1. 监听 i18n 的 localeChanged 和 loaded 事件
 * 2. 将状态同步到 engine.state
 * 3. 触发 engine.events 事件
 * 4. 注册 i18n 实例到 engine.api
 * 
 * @example
 * ```typescript
 * import { createVueEngine } from '@ldesign/engine-vue3'
 * import { createI18nEnginePlugin } from '@ldesign/i18n-vue/plugins'
 * import { createI18nBridgePlugin } from '@ldesign/engine-plugins/i18n-bridge'
 * 
 * const engine = createVueEngine({
 *   plugins: [
 *     createI18nEnginePlugin({ locale: 'zh-CN' }),
 *     createI18nBridgePlugin(), // 自动从 engine.api 获取 i18n
 *   ]
 * })
 * 
 * // 在组件中使用
 * const locale = useEngineState<I18nLocaleState>('i18n.locale')
 * ```
 */
export function createI18nBridgePlugin(
  options: I18nBridgeOptions = {}
): Plugin<I18nBridgeOptions> {
  const {
    statePrefix = 'i18n',
    publishInitialState = true,
  } = options
  
  // 状态键
  const LOCALE_KEY = `${statePrefix}.locale`
  const MESSAGES_KEY = `${statePrefix}.messages`
  
  // 事件名
  const LOCALE_CHANGED_EVENT = `${statePrefix}:localeChanged`
  const MESSAGES_LOADED_EVENT = `${statePrefix}:messagesLoaded`
  
  return {
    name: 'i18n-bridge',
    version: '1.0.0',
    
    // 依赖 i18n 插件（如果使用 engine 插件系统）
    dependencies: ['i18n'],
    
    install(ctx: PluginContext, opts?: I18nBridgeOptions) {
      // 获取 i18n 实例
      const i18n = opts?.i18n || options.i18n || ctx.engine.api.get<OptimizedI18n>('i18n')
      
      if (!i18n) {
        throw new Error(
          '[I18nBridgePlugin] i18n instance not found. ' +
          'Please provide i18n option or install i18n plugin first.'
        )
      }
      
      // 监听语言变化事件
      const unsubLocale = i18n.on('localeChanged', ({ locale, oldLocale }) => {
        const state: I18nLocaleState = {
          locale,
          oldLocale: oldLocale || null,
          timestamp: Date.now(),
        }
        
        // 同步到 engine.state
        ctx.engine.state.set(LOCALE_KEY, state)
        
        // 触发 engine.events
        ctx.engine.events.emit(LOCALE_CHANGED_EVENT, state)
        
        if (ctx.config?.debug) {
          console.log(`[I18nBridgePlugin] Locale changed: ${oldLocale} -> ${locale}`)
        }
      })
      
      // 监听消息加载事件
      const unsubLoaded = i18n.on('loaded', ({ locale }) => {
        const messages = i18n.getMessages(locale) || {}
        const state: I18nMessagesState = {
          locale,
          messages,
          timestamp: Date.now(),
        }
        
        // 同步到 engine.state
        ctx.engine.state.set(MESSAGES_KEY, state)
        
        // 触发 engine.events
        ctx.engine.events.emit(MESSAGES_LOADED_EVENT, state)
        
        if (ctx.config?.debug) {
          console.log(`[I18nBridgePlugin] Messages loaded for locale: ${locale}`)
        }
      })
      
      // 保存取消订阅函数（用于 uninstall）
      ctx.engine.state.set('__i18n_bridge_unsubs__', [unsubLocale, unsubLoaded])
      
      // 发布初始状态
      if (publishInitialState) {
        const initialLocaleState: I18nLocaleState = {
          locale: i18n.locale,
          oldLocale: null,
          timestamp: Date.now(),
        }
        ctx.engine.state.set(LOCALE_KEY, initialLocaleState)
        
        const messages = i18n.getMessages(i18n.locale)
        if (messages) {
          const initialMessagesState: I18nMessagesState = {
            locale: i18n.locale,
            messages,
            timestamp: Date.now(),
          }
          ctx.engine.state.set(MESSAGES_KEY, initialMessagesState)
        }
      }
    },
    
    uninstall(ctx: PluginContext) {
      // 取消订阅
      const unsubs = ctx.engine.state.get<Array<() => void>>('__i18n_bridge_unsubs__')
      if (unsubs) {
        unsubs.forEach(unsub => unsub())
      }
      
      // 清理状态
      ctx.engine.state.delete(LOCALE_KEY)
      ctx.engine.state.delete(MESSAGES_KEY)
      ctx.engine.state.delete('__i18n_bridge_unsubs__')
      
      if (ctx.config?.debug) {
        console.log('[I18nBridgePlugin] Uninstalled')
      }
    },
  }
}


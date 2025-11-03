/**
 * i18n 插件
 * 
 * 提供国际化功能,支持多语言切换和消息翻译
 * 
 * @module plugins/i18n
 */

import type { Plugin, PluginContext } from '../../types'

/**
 * i18n 插件配置
 */
export interface I18nPluginConfig {
  /** 当前语言 */
  locale: string
  /** 回退语言 */
  fallbackLocale: string
  /** 语言消息 */
  messages: Record<string, Record<string, string>>
  /** 是否启用警告 */
  warnOnMissing?: boolean
  /** 缺失消息时的回退行为 */
  missingHandler?: (locale: string, key: string) => string
}

/**
 * i18n 插件扩展的引擎方法
 */
export interface I18nEngineExtensions {
  /**
   * 切换语言
   * @param locale - 语言代码
   */
  setLocale(locale: string): void

  /**
   * 获取当前语言
   */
  getLocale(): string

  /**
   * 翻译消息
   * @param key - 消息键
   * @param params - 消息参数
   */
  t(key: string, params?: Record<string, any>): string

  /**
   * 添加语言消息
   * @param locale - 语言代码
   * @param messages - 消息对象
   */
  addMessages(locale: string, messages: Record<string, string>): void

  /**
   * 检查语言是否可用
   * @param locale - 语言代码
   */
  hasLocale(locale: string): boolean
}

/**
 * 处理消息占位符
 * @param message - 消息模板
 * @param params - 参数对象
 * @returns 处理后的消息
 */
function interpolate(message: string, params?: Record<string, any>): string {
  if (!params) return message

  return message.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match
  })
}

/**
 * 根据路径获取嵌套对象的值
 * @param obj - 对象
 * @param path - 路径(用 . 分隔)
 * @returns 值
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

/**
 * 创建 i18n 插件
 * 
 * @param config - 插件配置
 * @returns 插件对象
 * 
 * @example
 * ```typescript
 * const i18nPlugin = createI18nPlugin({
 *   locale: 'zh-CN',
 *   fallbackLocale: 'en-US',
 *   messages: {
 *     'zh-CN': {
 *       'hello': '你好',
 *       'welcome': '欢迎, {name}!'
 *     },
 *     'en-US': {
 *       'hello': 'Hello',
 *       'welcome': 'Welcome, {name}!'
 *     }
 *   }
 * })
 * 
 * // 在引擎中使用
 * await engine.use(i18nPlugin)
 * engine.t('hello') // '你好'
 * engine.t('welcome', { name: 'Tom' }) // '欢迎, Tom!'
 * engine.setLocale('en-US')
 * engine.t('hello') // 'Hello'
 * ```
 */
export function createI18nPlugin(config: I18nPluginConfig): Plugin {
  const {
    locale,
    fallbackLocale,
    messages,
    warnOnMissing = true,
    missingHandler,
  } = config

  return {
    name: 'i18n',
    version: '1.0.0',

    install(context: PluginContext) {
      const { state, events, logger } = context
      const engine = context.engine as any

      // 初始化 i18n 状态
      state.setState('i18n', {
        currentLocale: locale,
        fallbackLocale,
        messages: { ...messages },
      })

      logger.debug(`[i18n] Plugin installed with locale: ${locale}`)

      /**
       * 切换语言
       */
      engine.setLocale = (newLocale: string) => {
        const availableLocales = Object.keys(state.getState('i18n.messages') || {})
        
        if (!availableLocales.includes(newLocale)) {
          logger.warn(`[i18n] Locale "${newLocale}" not found, available locales:`, availableLocales)
          return
        }

        const oldLocale = state.getState('i18n.currentLocale')
        state.setState('i18n.currentLocale', newLocale)
        
        events.emit('locale:changed', {
          from: oldLocale,
          to: newLocale,
        })

        logger.debug(`[i18n] Locale changed: ${oldLocale} -> ${newLocale}`)
      }

      /**
       * 获取当前语言
       */
      engine.getLocale = (): string => {
        return state.getState('i18n.currentLocale') || locale
      }

      /**
       * 翻译消息
       */
      engine.t = (key: string, params?: Record<string, any>): string => {
        const currentLocale = state.getState('i18n.currentLocale')
        const allMessages = state.getState('i18n.messages') || {}
        
        // 尝试从当前语言获取
        let message = getNestedValue(allMessages[currentLocale], key)
        
        // 如果没找到,尝试从回退语言获取
        if (message === undefined && currentLocale !== fallbackLocale) {
          message = getNestedValue(allMessages[fallbackLocale], key)
          
          if (warnOnMissing && message === undefined) {
            logger.warn(`[i18n] Message not found for key "${key}" in locales: ${currentLocale}, ${fallbackLocale}`)
          }
        }

        // 如果还是没找到,使用自定义处理器或返回键本身
        if (message === undefined) {
          if (missingHandler) {
            message = missingHandler(currentLocale, key)
          } else {
            message = key
          }
        }

        // 处理占位符
        return interpolate(String(message), params)
      }

      /**
       * 添加语言消息
       */
      engine.addMessages = (targetLocale: string, newMessages: Record<string, string>) => {
        const allMessages = state.getState('i18n.messages') || {}
        const existingMessages = allMessages[targetLocale] || {}
        
        state.setState(`i18n.messages.${targetLocale}`, {
          ...existingMessages,
          ...newMessages,
        })

        events.emit('locale:messages-added', {
          locale: targetLocale,
          count: Object.keys(newMessages).length,
        })

        logger.debug(`[i18n] Added ${Object.keys(newMessages).length} messages for locale: ${targetLocale}`)
      }

      /**
       * 检查语言是否可用
       */
      engine.hasLocale = (targetLocale: string): boolean => {
        const allMessages = state.getState('i18n.messages') || {}
        return targetLocale in allMessages
      }

      // 发射初始化事件
      events.emit('locale:initialized', {
        locale,
        fallbackLocale,
        availableLocales: Object.keys(messages),
      })
    },

    uninstall(context: PluginContext) {
      const { state, logger } = context
      const engine = context.engine as any

      // 清理状态
      state.setState('i18n', undefined)

      // 移除扩展方法
      delete engine.setLocale
      delete engine.getLocale
      delete engine.t
      delete engine.addMessages
      delete engine.hasLocale

      logger.debug('[i18n] Plugin uninstalled')
    },
  }
}

/**
 * 预设的语言代码
 */
export const LOCALE_CODES = {
  /** 简体中文 */
  ZH_CN: 'zh-CN',
  /** 繁体中文 */
  ZH_TW: 'zh-TW',
  /** 英语(美国) */
  EN_US: 'en-US',
  /** 英语(英国) */
  EN_GB: 'en-GB',
  /** 日语 */
  JA_JP: 'ja-JP',
  /** 韩语 */
  KO_KR: 'ko-KR',
  /** 法语 */
  FR_FR: 'fr-FR',
  /** 德语 */
  DE_DE: 'de-DE',
  /** 西班牙语 */
  ES_ES: 'es-ES',
  /** 意大利语 */
  IT_IT: 'it-IT',
  /** 葡萄牙语 */
  PT_BR: 'pt-BR',
  /** 俄语 */
  RU_RU: 'ru-RU',
  /** 阿拉伯语 */
  AR_SA: 'ar-SA',
} as const

export type LocaleCode = typeof LOCALE_CODES[keyof typeof LOCALE_CODES]

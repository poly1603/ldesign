import type { Engine } from '@ldesign/engine'
import type { App } from 'vue'
import { createI18n } from '@ldesign/i18n'
import type { I18nOptions } from '@ldesign/i18n'
import { zhCN } from './locales/zh-CN'
import { enUS } from './locales/en-US'

/**
 * 设置国际化系统
 */
export async function setupI18n(engine: Engine, app: App) {
  try {
    // 国际化配置
    const i18nConfig: I18nOptions = {
      locale: 'zh-CN',
      fallbackLocale: 'en-US',
      messages: {
        'zh-CN': zhCN,
        'en-US': enUS
      },

      // 启用复数规则
      pluralizationRules: {
        'zh-CN': (choice: number) => choice === 0 ? 0 : 1,
        'en-US': (choice: number) => choice === 1 ? 0 : 1
      },

      // 数字格式化
      numberFormats: {
        'zh-CN': {
          currency: {
            style: 'currency',
            currency: 'CNY',
            currencyDisplay: 'symbol'
          },
          decimal: {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }
        },
        'en-US': {
          currency: {
            style: 'currency',
            currency: 'USD',
            currencyDisplay: 'symbol'
          },
          decimal: {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }
        }
      },

      // 日期时间格式化
      datetimeFormats: {
        'zh-CN': {
          short: {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          },
          long: {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
            hour: 'numeric',
            minute: 'numeric'
          }
        },
        'en-US': {
          short: {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          },
          long: {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
            hour: 'numeric',
            minute: 'numeric'
          }
        }
      }
    }

    // 创建国际化实例
    const i18n = createI18n(i18nConfig)

    // 安装到Vue应用
    app.use(i18n)

    // 注册到引擎状态
    engine.state.set('i18n', i18n)

    // 监听语言变化事件
    engine.events.on('i18n:locale:change', (data: any) => {
      engine.logger.info('Locale changed', { locale: data.locale })

      // 可以在这里处理语言变化后的逻辑
      // 比如重新加载某些数据、更新页面标题等
    })

    // 从本地存储恢复语言设置
    const savedLocale = localStorage.getItem('app-locale')
    if (savedLocale && i18nAdapter.getAvailableLocales().includes(savedLocale)) {
      i18nAdapter.setLocale(savedLocale)
    }

    engine.logger.info('I18n setup completed')
  } catch (error) {
    engine.logger.error('Failed to setup i18n:', error)
    throw error
  }
}

// 导出国际化相关的工具
export * from './locales/zh-CN'
export * from './locales/en-US'

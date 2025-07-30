import { createApp } from 'vue'
import App from './App.vue'
import { createI18nWithBuiltinLocales } from '../../es/index.js'
import { createI18n } from '../../es/vue/index.js'

async function bootstrap() {
  try {
    // 创建 I18n 实例
    const i18nInstance = await createI18nWithBuiltinLocales({
      defaultLocale: 'en',
      fallbackLocale: 'en',
      autoDetect: true,
      storage: 'localStorage',
      storageKey: 'vue-i18n-locale',
      cache: {
        enabled: true,
        maxSize: 1000
      },
      onLanguageChanged: (locale) => {
        console.log('Language changed to:', locale)
        document.documentElement.lang = locale
      },
      onLoadError: (locale, error) => {
        console.error(`Failed to load language '${locale}':`, error)
      }
    })

    // 创建 Vue I18n 插件
    const vueI18nPlugin = createI18n(i18nInstance)

    // 创建 Vue 应用
    const app = createApp(App)

    // 安装 I18n 插件
    app.use(vueI18nPlugin, {
      globalInjection: true,
      globalPropertyName: '$t'
    })

    // 添加一些示例翻译键到语言包中
    const exampleTranslations = {
      examples: {
        basic: 'Basic Translation',
        interpolation: 'Interpolation',
        pluralization: 'Pluralization',
        directive: 'Vue Directive',
        nested: 'Nested Keys',
        batch: 'Batch Translation',
        conditional: 'Conditional Translation',
        info: 'Language Information',
        status: 'Status'
      }
    }

    // 为每种语言添加示例翻译
    const languages = ['en', 'zh-CN', 'ja']
    const exampleTranslationsLocalized = {
      en: {
        examples: {
          basic: 'Basic Translation',
          interpolation: 'Interpolation',
          pluralization: 'Pluralization',
          directive: 'Vue Directive',
          nested: 'Nested Keys',
          batch: 'Batch Translation',
          conditional: 'Conditional Translation',
          info: 'Language Information',
          status: 'Status'
        }
      },
      'zh-CN': {
        examples: {
          basic: '基础翻译',
          interpolation: '插值翻译',
          pluralization: '复数翻译',
          directive: 'Vue 指令',
          nested: '嵌套键',
          batch: '批量翻译',
          conditional: '条件翻译',
          info: '语言信息',
          status: '状态'
        }
      },
      ja: {
        examples: {
          basic: '基本翻訳',
          interpolation: '補間翻訳',
          pluralization: '複数翻訳',
          directive: 'Vue ディレクティブ',
          nested: 'ネストされたキー',
          batch: 'バッチ翻訳',
          conditional: '条件翻訳',
          info: '言語情報',
          status: 'ステータス'
        }
      }
    }

    // 扩展语言包（这里只是示例，实际项目中应该在语言包文件中定义）
    for (const lang of languages) {
      if (i18nInstance.isLanguageLoaded(lang)) {
        const packageData = i18nInstance.loader?.getLoadedPackage?.(lang)
        if (packageData) {
          Object.assign(packageData.translations, exampleTranslationsLocalized[lang])
        }
      }
    }

    // 挂载应用
    app.mount('#app')

    console.log('Vue I18n example app started successfully')
    console.log('Current language:', i18nInstance.getCurrentLanguage())
    console.log('Available languages:', i18nInstance.getAvailableLanguages())

  } catch (error) {
    console.error('Failed to bootstrap Vue I18n example:', error)
    
    // 显示错误信息
    document.body.innerHTML = `
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 600px;
        margin: 50px auto;
        padding: 20px;
        text-align: center;
      ">
        <h1 style="color: #dc3545;">Failed to Load I18n Example</h1>
        <p style="color: #666; margin-bottom: 20px;">
          There was an error initializing the internationalization system:
        </p>
        <pre style="
          background: #f8f9fa;
          padding: 15px;
          border-radius: 4px;
          text-align: left;
          color: #dc3545;
          overflow-x: auto;
        ">${error.message}</pre>
        <p style="color: #666; margin-top: 20px;">
          Please check the console for more details.
        </p>
      </div>
    `
  }
}

// 启动应用
bootstrap()

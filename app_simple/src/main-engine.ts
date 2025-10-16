/**
 * 应用入口 - 使用 Engine 统一状态管理
 * 通过 Engine 的响应式状态管理系统统一管理语言切换
 */

import { createEngineApp, createI18nEnginePlugin } from '@ldesign/engine'
import { createColorEnginePlugin } from '@ldesign/color'
import { createSizeEnginePlugin, SizeManager } from '@ldesign/size'
import { createTemplatePlugin } from '@ldesign/template'
import App from './App.vue'
import { createRouter } from './router'
import { engineConfig } from './config/app.config'
import { auth } from './composables/useAuth'
import { createI18n } from 'vue-i18n'

/**
 * 启动应用
 */
async function bootstrap() {
  try {
    console.log('🚀 启动应用...')

    // 初始化认证状态
    auth.initAuth()

    // 创建路由器插件
    const routerPlugin = createRouter()

    // 创建 vue-i18n 实例
    const i18n = createI18n({
      legacy: false,
      locale: 'zh-CN',
      fallbackLocale: 'en-US',
      messages: {
        'zh-CN': {
          app: { name: 'LDesign 演示' },
          home: { title: '首页', welcome: '欢迎使用 LDesign' },
          color: { title: '颜色系统' },
          size: { title: '尺寸系统' },
          i18n: { title: '国际化测试' }
        },
        'en-US': {
          app: { name: 'LDesign Demo' },
          home: { title: 'Home', welcome: 'Welcome to LDesign' },
          color: { title: 'Color System' },
          size: { title: 'Size System' },
          i18n: { title: 'i18n Test' }
        }
      }
    })

    // 创建增强的 i18n 插件，支持语言变更钩子
    const i18nPlugin = createI18nEnginePlugin({
      adapter: {
        getCurrentLocale: () => i18n.global.locale.value,
        setLocale: (locale: string) => {
          i18n.global.locale.value = locale
        },
        getSupportedLocales: () => ['zh-CN', 'en-US'],
        t: (key: string, params?: Record<string, any>) => i18n.global.t(key, params),
        tc: (key: string, choice: number, params?: Record<string, any>) => i18n.global.t(key, choice, params),
        te: (key: string) => i18n.global.te(key),
        d: (value: Date, format?: string) => i18n.global.d(value, format || 'short'),
        n: (value: number, format?: string) => i18n.global.n(value, format || 'decimal')
      },
      defaultLocale: 'zh-CN',
      onLocaleChange: async (newLocale, oldLocale) => {
        console.log(`[Engine] 语言切换: ${oldLocale} -> ${newLocale}`)
      }
    })

    // 创建 Color Engine 插件
    const colorPlugin = createColorEnginePlugin({
      prefix: 'ld',
      storageKey: 'ldesign-theme',
      persistence: true,
      presets: 'all',
      autoApply: true,
      defaultTheme: 'blue',
      includeSemantics: true,
      includeGrays: true,
      syncLocale: true, // 同步 engine 的语言状态
      customThemes: [
        {
          name: 'sunset',
          label: 'Sunset Orange',
          color: '#ff6b35',
          custom: true,
          order: 100
        },
        {
          name: 'forest',
          label: 'Forest Green',
          color: '#2d6a4f',
          custom: true,
          order: 101
        }
      ],
      hooks: {
        afterChange: (theme) => {
          if (import.meta.env.DEV) {
            console.log('[Theme] 主题变更 ->', theme.themeName || theme.primaryColor)
          }
        }
      }
    })

    // 创建 Size Engine 插件
    const sizePlugin = createSizeEnginePlugin({
      defaultSize: 'medium',
      storageKey: 'ldesign-size',
      syncLocale: true, // 同步 engine 的语言状态
      presets: [
        {
          name: 'extra-small',
          label: 'Extra Small',
          description: 'Very compact size',
          baseSize: 12,
          category: 'high-density'
        },
        {
          name: 'small',
          label: 'Small',
          description: 'Compact size',
          baseSize: 14,
          category: 'high-density'
        },
        {
          name: 'medium',
          label: 'Medium',
          description: 'Default size',
          baseSize: 16,
          category: 'normal'
        },
        {
          name: 'large',
          label: 'Large',
          description: 'Comfortable size',
          baseSize: 18,
          category: 'low-density'
        },
        {
          name: 'extra-large',
          label: 'Extra Large',
          description: 'Spacious size',
          baseSize: 20,
          category: 'low-density'
        }
      ]
    })

    // 创建模板插件
    const templatePlugin = createTemplatePlugin({
      autoInit: true,
      autoDetect: true,
      defaultDevice: 'desktop',
      cache: {
        enabled: true,
        ttl: 600000,
        maxSize: 100
      },
      rememberPreferences: true,
      preferencesKey: 'app-template-prefs'
    })

    // 创建应用引擎
    const engine = await createEngineApp({
      // 根组件和挂载点
      rootComponent: App,
      mountElement: '#app',

      // 使用配置文件
      config: engineConfig,

      // 插件（包含所有 engine 插件）
      plugins: [
        routerPlugin,
        i18nPlugin,
        colorPlugin,
        sizePlugin
      ],

      // Vue应用配置
      setupApp: async (app) => {
        // 安装 vue-i18n
        app.use(i18n)
        
        // 安装模板插件
        app.use(templatePlugin)

        console.log('✅ 应用设置完成')
      },

      // 错误处理
      onError: (error, context) => {
        console.error(`[应用错误] ${context}:`, error)
      },

      // 引擎就绪
      onReady: (engine) => {
        console.log('✅ 引擎已就绪')
        
        // 设置初始语言
        engine.state.set('i18n.locale', 'zh-CN')

        // 监听路由变化，更新页面标题
        if (engine.router) {
          engine.router.afterEach((to) => {
            const titleKey = to.meta?.titleKey as string
            if (titleKey && engine.i18n) {
              document.title = `${engine.i18n.t(titleKey)} - ${engine.i18n.t('app.name')}`
            }
          })
        }

        // 监听语言变化，更新页面标题
        engine.state.watch('i18n.locale', (newLocale: string) => {
          if (engine.router && engine.i18n) {
            const current = engine.router.currentRoute.value
            const titleKey = current.meta?.titleKey as string
            if (titleKey) {
              document.title = `${engine.i18n.t(titleKey)} - ${engine.i18n.t('app.name')}`
            }
          }
        })

        if (import.meta.env.DEV) {
          // 开发环境暴露引擎实例
          ;(window as any).__ENGINE__ = engine
        }
      },

      // 应用挂载完成
      onMounted: () => {
        console.log('✅ 应用已挂载')
        
        // 提供全局方法切换语言
        const app = (engine as any).app
        if (app) {
          app.config.globalProperties.$setLocale = (locale: string) => {
            engine.state.set('i18n.locale', locale)
          }
          app.config.globalProperties.$getLocale = () => {
            return engine.state.get('i18n.locale') || 'zh-CN'
          }
        }
      }
    })

    return engine

  } catch (error) {
    console.error('❌ 应用启动失败:', error)
    throw error
  }
}

// 启动应用
bootstrap().catch(error => {
  console.error('❌ 应用启动失败:', error)

  // 在页面上显示错误信息
  const errorMessage = error.message || '未知错误'
  document.body.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-family: system-ui;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      padding: 20px;
    ">
      <h1 style="font-size: 48px; margin: 0 0 20px 0;">😔</h1>
      <h2 style="font-size: 24px; margin: 0 0 10px 0;">应用启动失败</h2>
      <p style="font-size: 16px; margin: 0 0 20px 0; opacity: 0.9;">${errorMessage}</p>
      <button 
        onclick="location.reload()" 
        style="
          padding: 12px 24px;
          font-size: 16px;
          border: 2px solid white;
          background: transparent;
          color: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        "
        onmouseover="this.style.background='white'; this.style.color='#667eea';"
        onmouseout="this.style.background='transparent'; this.style.color='white';"
      >
        重新加载
      </button>
    </div>
  `
})
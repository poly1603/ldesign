/**
 * 应用入口
 * 使用模块化的项目结构
 */

import { createEngineApp } from '@ldesign/engine'
import { createI18nEnginePlugin } from './i18n'
import App from './App.vue'
import { createRouter } from './router'
import { engineConfig } from './config/app.config'
import { auth } from './composables/useAuth'
import { createColorPlugin } from '@ldesign/color'

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
    
    // 创建 i18n 插件
    const i18nPlugin = createI18nEnginePlugin({
      locale: 'zh-CN',
      fallbackLocale: 'en-US',
      detectBrowserLanguage: true,
      persistLanguage: true,
      showMissingKeys: import.meta.env.DEV
    })

    // 创建 Color 插件（主题系统）
    const colorPlugin = createColorPlugin({
      prefix: 'ld',
      storageKey: 'ldesign-theme',
      persistence: true,
      presets: 'all',
      autoApply: true,
      defaultTheme: 'blue',
      includeSemantics: true,
      includeGrays: true,
      // 自定义主题配置
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
        },
        {
          name: 'midnight',
          label: 'Midnight Blue',
          color: '#1a1b41',
          custom: true,
          order: 102
        },
        {
          name: 'lavender',
          label: 'Lavender Dream',
          color: '#9b59b6',
          custom: true,
          order: 103
        },
        {
          name: 'coral',
          label: 'Coral Reef',
          color: '#ff7f50',
          custom: true,
          order: 104
        }
      ],
      hooks: {
        afterChange: (theme) => {
          if (import.meta.env.DEV) {
            console.log('[theme] changed ->', theme.themeName || theme.primaryColor)
          }
        }
      }
    })
    
    // 创建应用引擎
    const engine = await createEngineApp({
      // 根组件和挂载点
      rootComponent: App,
      mountElement: '#app',
      
      // 使用配置文件
      config: engineConfig,
      
      // 插件（路由器和国际化）
      plugins: [routerPlugin, i18nPlugin],
      
    // Vue应用配置
    setupApp: async (app) => {
      // 安装 Color 主题插件（提供全局主题管理和持久化）
      app.use(colorPlugin)

      // 手动安装 i18n Vue 插件
      if (i18nPlugin.setupVueApp) {
        i18nPlugin.setupVueApp(app);
      }
      console.log('✅ 应用设置完成')
    },
      
      // 错误处理
      onError: (error, context) => {
        console.error(`[应用错误] ${context}:`, error)
      },
      
      // 引擎就绪
      onReady: (engine) => {
        console.log('✅ 引擎已就绪')

        // 语言切换时同步更新页面标题
        try {
          const api = (engine as any).api
          const router = (engine as any).router
          const i18n = api?.i18n
          if (i18n && router && typeof i18n.on === 'function') {
            i18n.on('localeChanged', () => {
              try {
                const current = typeof router.getCurrentRoute === 'function' ? router.getCurrentRoute().value : null
                const titleKey = current?.meta?.titleKey
                const t = typeof api?.t === 'function' ? api.t.bind(api) : ((k: string) => k)
                if (titleKey) {
                  document.title = `${t(titleKey)} - ${t('app.name')}`
                } else {
                  document.title = t('app.name')
                }
              } catch (e) {
                console.warn('Failed to update title on locale change:', e)
              }
            })
          }
        } catch (e) {
          console.warn('i18n title sync setup failed:', e)
        }
        
        if (import.meta.env.DEV) {
          // 开发环境暴露引擎实例
          ;(window as any).__ENGINE__ = engine
        }
      },
      
      // 应用挂载完成
      onMounted: () => {
        console.log('✅ 应用已挂载')
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

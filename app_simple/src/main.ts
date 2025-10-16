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
import { createTemplatePlugin } from '@ldesign/template'
import { sizePlugin } from '@ldesign/size/vue'

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

    // 创建模板插件 - 规范化配置
    const templatePlugin = createTemplatePlugin({
      // 基础配置
      autoInit: true,                      // 自动初始化
      autoDetect: true,                    // 自动检测设备类型
      defaultDevice: 'desktop',             // 默认设备类型

      // 缓存配置
      cache: {
        enabled: true,                     // 启用组件缓存
        ttl: 600000,                       // 缓存有效期 10分钟
        maxSize: 100                       // 最大缓存数量
      },

      // 用户偏好持久化
      rememberPreferences: true,            // 记住用户选择的模板
      preferencesKey: 'app-template-prefs', // 存储键名

      // 预加载策略
      preload: false,                      // 禁用预加载（避免初始化错误）
      preloadStrategy: 'lazy',             // 懒加载策略

      // UI 配置 - 模板选择器的显示样式
      ui: {
        defaultStyle: 'cards',              // 默认使用列表样式

        // 显示选项
        display: {
          preview: true,                   // 显示预览图
          description: true,               // 显示描述文本
          metadata: true,                  // 显示元数据（版本、作者）
          aspectRatio: '3/2'               // 预览图宽高比
        },

        // 按分类自定义显示样式
        styleByCategory: {
          'login': 'cards',                // 登录页面使用卡片样式
          'dashboard': 'grid',             // 仪表板使用网格样式
          'profile': 'list',               // 个人资料使用列表样式
          'settings': 'compact'            // 设置页面使用紧凑样式
        },

        // 未来功能（已预留接口）
        features: {
          search: false,                   // 搜索功能
          filter: false,                   // 过滤功能
          groupBy: 'none'                  // 分组方式
        }
      },

      // 动画配置 - 模板切换动画效果
      animation: {
        defaultAnimation: 'fade-slide',    // 默认动画效果
        transitionMode: 'out-in',          // 动画模式：先出后进
        duration: 300,                     // 动画时长（毫秒）

        // 特定模板切换的自定义动画
        customAnimations: {
          'login/default->login/split': 'flip',        // 登录页切换使用翻转效果
          'login/split->login/default': 'flip',        // 反向也使用翻转
          'dashboard/default->dashboard/sidebar': 'slide', // 仪表板布局切换使用滑动
          'dashboard/sidebar->dashboard/tabs': 'fade'      // 标签页切换使用淡入淡出
        },

        // 按分类设置动画
        animationByCategory: {
          'login': 'scale',                // 登录分类使用缩放动画
          'dashboard': 'slide',            // 仪表板分类使用滑动动画
          'profile': 'fade',               // 个人资料分类使用淡入淡出
          'settings': 'none'               // 设置页面无动画（快速切换）
        },

        // 按设备类型设置动画
        animationByDevice: {
          'mobile': 'slide',               // 移动端使用滑动（贴合手势）
          'tablet': 'fade-slide',          // 平板使用淡入淡出+滑动
          'desktop': 'fade'                // 桌面端使用简单淡入淡出
        }
      },

      // 钩子函数
      hooks: {
        // 模板加载前
        beforeLoad: async (templatePath) => {
          if (import.meta.env.DEV) {
            console.log(`[Template] Loading: ${templatePath}`)
          }
        },

        // 模板加载后
        afterLoad: async (templatePath, component) => {
          if (import.meta.env.DEV) {
            console.log(`[Template] Loaded: ${templatePath}`, component)
          }
        },

        // 切换动画前
        beforeTransition: (from, to) => {
          if (import.meta.env.DEV) {
            console.log(`[Template] Transition: ${from} -> ${to}`)
          }
        },

        // 切换动画后
        afterTransition: (from, to) => {
          if (import.meta.env.DEV) {
            console.log(`[Template] Transitioned: ${from} -> ${to}`)
          }
        },

        // 错误处理
        onError: (error) => {
          console.error('[Template] Error:', error)
          // 可以在这里添加错误上报逻辑
        }
      },

      // 性能监控
      performance: import.meta.env.DEV    // 开发环境开启性能监控
    })

    // Size 插件配置（尺寸管理系统）
    const sizeOptions = {
      storageKey: 'ldesign-size',
      presets: [
        {
          name: 'extra-compact',
          label: 'Extra Compact',
          description: 'Very high density for maximum content',
          baseSize: 12,
          scale: 0.85,
          category: 'high-density'
        },
        {
          name: 'extra-spacious',
          label: 'Extra Spacious',
          description: 'Very low density for enhanced readability',
          baseSize: 18,
          scale: 1.25,
          category: 'low-density'
        }
      ]
    }

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
        // 安装模板插件 - 一行代码完成所有配置
        app.use(templatePlugin)

        // 安装 Color 主题插件（提供全局主题管理和持久化）
        app.use(colorPlugin)

        // 安装 Size 尺寸插件（提供响应式尺寸管理）
        app.use(sizePlugin, sizeOptions)

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
          ; (window as any).__ENGINE__ = engine
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
      background: linear-gradient(135deg, var(--ld-color-primary-500, #667eea) 0%, var(--ld-color-primary-700, #764ba2) 100%);
      color: var(--ld-color-gray-50, white);
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
          border: 2px solid var(--ld-color-gray-50, white);
          background: transparent;
          color: var(--ld-color-gray-50, white);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        "
        onmouseover="this.style.background='var(--ld-color-gray-50, white)'; this.style.color='var(--ld-color-primary-500, #667eea)';"
        onmouseout="this.style.background='transparent'; this.style.color='var(--ld-color-gray-50, white)';"
      >
        重新加载
      </button>
    </div>
  `
})

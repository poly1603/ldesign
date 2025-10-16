/**
 * LDesign 多语言国际化集成示例
 * 
 * 本示例展示如何在 app_simple 中集成 i18n、color 和 size 包，
 * 实现跨包的响应式多语言支持
 */

import { createApp } from 'vue'
import { createEngine } from '@ldesign/engine'
import { createI18nEnginePlugin } from '@ldesign/i18n'
import { createColorEnginePlugin } from '@ldesign/color/plugin'
import { createSizeEnginePlugin } from '@ldesign/size/vue'
import App from './App.vue'

// ============================================
// 1. 准备语言包
// ============================================

const messages = {
  'zh-CN': {
    // 应用级翻译
    app: {
      title: 'LDesign 示例应用',
      welcome: '欢迎使用 LDesign',
      description: '这是一个演示多语言国际化的示例应用',
      language: '语言',
      theme: '主题',
      size: '尺寸',
      settings: '设置'
    },
    // 按钮文本
    buttons: {
      switchLang: '切换语言',
      save: '保存',
      cancel: '取消',
      reset: '重置'
    }
  },
  'en-US': {
    // Application level translations
    app: {
      title: 'LDesign Example App',
      welcome: 'Welcome to LDesign',
      description: 'This is a demo app showcasing multi-language internationalization',
      language: 'Language',
      theme: 'Theme',
      size: 'Size',
      settings: 'Settings'
    },
    // Button texts
    buttons: {
      switchLang: 'Switch Language',
      save: 'Save',
      cancel: 'Cancel',
      reset: 'Reset'
    }
  }
}

// ============================================
// 2. 创建并配置 Engine
// ============================================

const engine = createEngine({
  debug: import.meta.env.DEV, // 开发环境启用调试
  logger: {
    level: 'info'
  },
  performance: {
    enabled: true
  }
})

// ============================================
// 3. 创建 I18n 插件（第一个！）
// ============================================

const i18nPlugin = createI18nEnginePlugin({
  // 默认语言
  locale: 'zh-CN',
  
  // 回退语言
  fallbackLocale: 'en-US',
  
  // 语言包
  messages,
  
  // 自动检测浏览器语言
  detectBrowserLanguage: true,
  
  // 持久化语言设置
  persistLanguage: true,
  
  // 存储键名
  storageKey: 'ldesign-app-locale'
})

// ============================================
// 4. 创建 Color 插件
// ============================================

const colorPlugin = createColorEnginePlugin({
  // 使用与 i18n 相同的默认语言
  defaultLocale: 'zh-CN',
  
  // 默认主题
  defaultTheme: 'blue',
  
  // 启用主题持久化
  persistence: true,
  
  // 自动应用
  autoApply: true,
  
  // 包含语义色
  includeSemantics: true,
  
  // 钩子函数
  hooks: {
    afterChange: (theme) => {
      console.log('主题已切换:', theme.themeName)
    },
    onError: (error) => {
      console.error('主题切换错误:', error)
    }
  }
})

// ============================================
// 5. 创建 Size 插件
// ============================================

const sizePlugin = createSizeEnginePlugin({
  // 使用与 i18n 相同的默认语言
  defaultLocale: 'zh-CN',
  
  // 存储键名
  storageKey: 'ldesign-app-size',
  
  // 自定义预设（可选）
  presets: [
    { name: 'compact', baseSize: 14, description: '紧凑模式' },
    { name: 'default', baseSize: 16, description: '默认模式' },
    { name: 'comfortable', baseSize: 18, description: '舒适模式' },
    { name: 'spacious', baseSize: 20, description: '宽松模式' }
  ]
})

// ============================================
// 6. 初始化应用
// ============================================

async function initApp() {
  try {
    // 按顺序注册插件（顺序很重要！）
    console.log('📦 开始注册插件...')
    
    // 6.1 先注册 i18n（它会设置 engine.state.locale）
    console.log('  ✓ 注册 I18n 插件')
    await engine.use(i18nPlugin)
    
    // 6.2 再注册 color 和 size（它们会监听 engine.state.locale）
    console.log('  ✓ 注册 Color 插件')
    await engine.use(colorPlugin)
    
    console.log('  ✓ 注册 Size 插件')
    await engine.use(sizePlugin)
    
    console.log('✅ 所有插件注册完成')
    
    // 6.3 创建 Vue 应用
    console.log('🎨 创建 Vue 应用...')
    const app = engine.createApp(App)
    
    // 6.4 设置各插件的 Vue 集成
    console.log('🔗 集成插件到 Vue...')
    i18nPlugin.setupVueApp(app)
    colorPlugin.setupVueApp(app)
    sizePlugin.setupVueApp(app)
    
    // 6.5 添加全局方法（可选）
    app.config.globalProperties.$changeLocale = async (locale: string) => {
      await engine.i18n?.setLocale(locale)
    }
    
    // 6.6 挂载应用
    console.log('🚀 挂载应用...')
    await engine.mount('#app')
    
    console.log('✨ 应用启动成功！')
    
    // 输出当前状态
    console.log('📊 当前状态:')
    console.log('  - 语言:', engine.state.get('locale'))
    console.log('  - 主题:', engine.color?.getCurrentTheme()?.themeName)
    console.log('  - 尺寸:', engine.size?.getCurrentPreset())
    
  } catch (error) {
    console.error('❌ 应用启动失败:', error)
    throw error
  }
}

// ============================================
// 7. 导出工具函数
// ============================================

/**
 * 切换语言
 */
export async function changeLocale(locale: 'zh-CN' | 'en-US') {
  try {
    await engine.i18n?.setLocale(locale)
    console.log('✓ 语言已切换:', locale)
    // color 和 size 组件会自动更新！
  } catch (error) {
    console.error('✗ 语言切换失败:', error)
  }
}

/**
 * 获取当前语言
 */
export function getCurrentLocale(): string {
  return engine.state.get('locale') || 'zh-CN'
}

/**
 * 监听语言变化
 */
export function onLocaleChange(callback: (locale: string) => void): () => void {
  return engine.state.watch('locale', callback)
}

/**
 * 获取所有可用语言
 */
export function getAvailableLocales(): string[] {
  return engine.i18n?.getAvailableLocales() || ['zh-CN', 'en-US']
}

/**
 * 翻译函数（快捷方式）
 */
export function t(key: string, params?: Record<string, any>): string {
  return engine.i18n?.t(key, params) || key
}

// ============================================
// 8. 启动应用
// ============================================

// 在浏览器环境中自动启动
if (typeof window !== 'undefined') {
  // 等待 DOM 加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp)
  } else {
    initApp()
  }
}

// 导出 engine 实例（用于调试）
export { engine }

// ============================================
// 9. 类型声明增强
// ============================================

declare module 'vue' {
  interface ComponentCustomProperties {
    $engine: typeof engine
    $changeLocale: typeof changeLocale
    $sizeManager: any
    $color: any
  }
}

declare module '@ldesign/engine' {
  interface Engine {
    i18n?: any
    color?: any
    size?: any
  }
}

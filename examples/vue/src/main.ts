import { createApp } from 'vue'
import { createEngine } from '@ldesign/engine-core'
import { VueEnginePlugin } from '@ldesign/engine-vue'
import { createI18nPlugin } from '@ldesign/engine-core/plugins/i18n'
import { createThemePlugin } from '@ldesign/engine-core/plugins/theme'
import { createSizePlugin } from '@ldesign/engine-core/plugins/size'
import App from './App.vue'
import './style.css'

// 创建引擎实例
const engine = createEngine({
  name: 'vue-example',
  version: '0.1.0',
  logger: {
    level: 'debug'
  }
})

// 注册插件
engine.use(createI18nPlugin({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {
      app: {
        title: 'Vue Engine Example',
        description: 'A demo application showcasing @ldesign/engine integration with Vue',
        welcome: 'Welcome to Vue + Engine'
      },
      features: {
        i18n: 'Internationalization',
        theme: 'Theme Switching',
        size: 'Size Control',
        state: 'State Management',
        events: 'Event System'
      },
      actions: {
        switchTheme: 'Switch Theme',
        switchLocale: 'Switch Language',
        changeSize: 'Change Size'
      },
      status: {
        initialized: 'Initialized',
        running: 'Running',
        stopped: 'Stopped',
        error: 'Error'
      }
    },
    zh: {
      app: {
        title: 'Vue 引擎示例',
        description: '展示 @ldesign/engine 与 Vue 集成的演示应用',
        welcome: '欢迎使用 Vue + Engine'
      },
      features: {
        i18n: '国际化',
        theme: '主题切换',
        size: '尺寸控制',
        state: '状态管理',
        events: '事件系统'
      },
      actions: {
        switchTheme: '切换主题',
        switchLocale: '切换语言',
        changeSize: '改变尺寸'
      },
      status: {
        initialized: '已初始化',
        running: '运行中',
        stopped: '已停止',
        error: '错误'
      }
    }
  }
}))

engine.use(createThemePlugin({
  defaultTheme: 'light',
  themes: {
    light: {
      colors: {
        primary: '#1890ff',
        background: '#ffffff',
        text: '#000000'
      }
    },
    dark: {
      colors: {
        primary: '#177ddc',
        background: '#1f1f1f',
        text: '#ffffff'
      }
    }
  }
}))

engine.use(createSizePlugin({
  defaultSize: 'medium',
  sizes: {
    small: { scale: 0.875 },
    medium: { scale: 1 },
    large: { scale: 1.125 }
  }
}))

// 初始化引擎并启动应用
engine.initialize().then(() => {
  const app = createApp(App)
  app.use(VueEnginePlugin, { engine })
  app.mount('#app')
})

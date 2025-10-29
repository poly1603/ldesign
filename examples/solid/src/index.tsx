/* @refresh reload */
import { render } from 'solid-js/web'
import { createEngine } from '@ldesign/engine-core'
import { setEngine } from '@ldesign/engine-solid'
import { createI18nPlugin } from '@ldesign/engine-core/plugins/i18n'
import { createThemePlugin } from '@ldesign/engine-core/plugins/theme'
import { createSizePlugin } from '@ldesign/engine-core/plugins/size'
import App from './App'
import './index.css'

// 创建引擎实例
const engine = createEngine({
  name: 'solid-example',
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
        title: 'Solid Engine Example',
        description: 'A demo application showcasing @ldesign/engine integration with Solid.js',
        welcome: 'Welcome to Solid + Engine'
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
      }
    },
    zh: {
      app: {
        title: 'Solid 引擎示例',
        description: '展示 @ldesign/engine 与 Solid.js 集成的演示应用',
        welcome: '欢迎使用 Solid + Engine'
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

// 初始化引擎
await engine.initialize()

// 设置引擎实例供 Solid 使用
setEngine(engine)

const root = document.getElementById('root')

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  )
}

render(() => <App />, root!)

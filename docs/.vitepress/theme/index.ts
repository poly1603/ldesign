import DefaultTheme from 'vitepress/theme'
import { defineCustomElements } from '@ldesign/webcomponent/loader'
import { checkStyleIsolation } from './style-check.js'
import './custom.css'
import './style-isolation.css'

export default {
  extends: DefaultTheme,
  async enhanceApp({ app }) {
    // 注册 Stencil 组件
    if (typeof window !== 'undefined') {
      defineCustomElements(window)
      
      // 在开发环境中检查样式隔离
      if (process.env.NODE_ENV === 'development') {
        checkStyleIsolation()
      }
    }
  }
}

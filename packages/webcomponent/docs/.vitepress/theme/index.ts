import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import './custom.css'
// 直接导入组件库CSS
import '../../../dist/ldesign-webcomponent/ldesign-webcomponent.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router, siteData }) {
    // 注册 Web Components
    if (typeof window !== 'undefined') {
      // 直接导入组件库的ESM版本
      import('../../../dist/ldesign-webcomponent/ldesign-webcomponent.esm.js')
        .then(() => {
          console.log('LDesign WebComponent 组件库已加载')
        })
        .catch(err => {
          console.warn('Failed to load LDesign WebComponent:', err)
        })
    }
  }
} satisfies Theme

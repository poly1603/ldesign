import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router, siteData }) {
    // 注册 Web Components
    if (typeof window !== 'undefined') {
      // 动态导入组件库
      import('../../../loader/index.js').then(({ defineCustomElements }) => {
        defineCustomElements(window)
        console.log('LDesign WebComponent 组件库已加载')
      }).catch(err => {
        console.warn('Failed to load LDesign WebComponent:', err)
      })


    }
  }
} satisfies Theme

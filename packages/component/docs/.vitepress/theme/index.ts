/**
 * VitePress 主题配置
 * 注册 LDesign 组件库
 */

import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'

// 导入组件库
import LDesignComponent, { LButton } from '../../../src/index'

// 导入样式
import '../../../src/styles/index.less'

// 自定义样式
import './custom.css'



const theme: Theme = {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app, router, siteData }) {
    // 注册组件库
    app.use(LDesignComponent)

    // 全局属性
    app.config.globalProperties.$message = (msg: string) => {
      console.log(`[LDesign Message]: ${msg}`)
    }
  }
}

export default theme

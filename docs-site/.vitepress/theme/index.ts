import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './styles/vars.css'
import './styles/custom.css'
import Layout from './Layout.vue'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, router, siteData }) {
    // 注册全局组件
    // app.component('DemoBlock', DemoBlock)

    // 添加路由钩子
    router.onAfterRouteChanged = (to) => {
      // 路由变化后的处理
    }
  }
} satisfies Theme

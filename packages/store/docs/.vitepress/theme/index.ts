import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'

// 导入交互式组件
import CounterDemo from '../components/CounterDemo.vue'
import TodoDemo from '../components/TodoDemo.vue'
import ShoppingCartDemo from '../components/ShoppingCartDemo.vue'

// 导入样式
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app, router, siteData }) {
    // 注册全局组件
    app.component('CounterDemo', CounterDemo)
    app.component('TodoDemo', TodoDemo)
    app.component('ShoppingCartDemo', ShoppingCartDemo)
  }
} satisfies Theme

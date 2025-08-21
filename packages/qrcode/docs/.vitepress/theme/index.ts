import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'
import QRCode from '../../../src/vue/QRCode.vue'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('LQRCode', QRCode)
  }
} satisfies Theme



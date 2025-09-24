import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import QRCode from '../../../src/vue/QRCode.vue'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('LQRCode', QRCode)
  },
} satisfies Theme

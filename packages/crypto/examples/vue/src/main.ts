import { createApp } from 'vue'
import { CryptoPlugin } from '../../../src/adapt/vue'
import App from './App.vue'
import './style.css'

const app = createApp(App)

// 安装 Crypto 插件
app.use(CryptoPlugin, {
  globalPropertyName: '$crypto',
  registerComposables: true,
  config: {
    defaultAESKeySize: 256,
    defaultRSAKeySize: 2048,
    defaultHashAlgorithm: 'SHA256',
    defaultEncoding: 'hex',
  },
})

app.mount('#app')

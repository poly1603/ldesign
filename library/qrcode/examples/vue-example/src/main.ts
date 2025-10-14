import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Import the QR Code plugin
import { QRCodePlugin } from '@qrcode-lib/adapters/vue'

const app = createApp(App)

// Use the QRCode plugin globally
app.use(QRCodePlugin, {
  componentName: 'QRCode',
  directiveName: 'qrcode'
})

app.mount('#app')
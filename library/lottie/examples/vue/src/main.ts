import { createApp } from 'vue'
import App from './App.vue'
import LottiePlugin from '../../../src/adapters/vue'

const app = createApp(App)
app.use(LottiePlugin)
app.mount('#app')

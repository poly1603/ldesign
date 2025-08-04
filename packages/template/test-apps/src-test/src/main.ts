import { createApp } from 'vue'
import App from '../../shared/App.vue'

// 全局声明
declare global {
  const __TEMPLATE_ENV__: string
}

const app = createApp(App)

app.mount('#app')

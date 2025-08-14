import { createApp } from 'vue'
import TemplateDemo from './TemplateDemo.vue'

// 全局声明
declare global {
  const __TEMPLATE_ENV__: string
}

const app = createApp(TemplateDemo)

app.mount('#app')

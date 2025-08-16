import { createApp } from 'vue'
// 在示例项目中，直接从源码导入
import { VueSizePlugin } from '../../../src/vue'
import App from './App.vue'
import './styles/main.css'

const app = createApp(App)

// 安装尺寸插件
app.use(VueSizePlugin, {
  defaultMode: 'medium',
  prefix: '--ls',
  autoInject: true,
})

app.mount('#app')

import { httpPlugin } from '@ldesign/http'
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 安装HTTP插件
app.use(httpPlugin, {
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

app.mount('#app')

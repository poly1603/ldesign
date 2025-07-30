import { createApp } from 'vue'
import App from './App.vue'

// 模拟 HTTP 客户端（在实际项目中应该导入真实的库）
// import { HttpPlugin, createHttpClient } from '@ldesign/http'

const app = createApp(App)

// 在实际项目中的用法：
// const httpClient = createHttpClient({
//   baseURL: 'https://jsonplaceholder.typicode.com'
// })
// 
// app.use(HttpPlugin, {
//   client: httpClient
// })

app.mount('#app')

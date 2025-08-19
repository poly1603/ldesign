import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

console.log('🚀 LDesign Template Examples 启动中...')

const app = createApp(App)

app.use(router)

app.mount('#app')

console.log('✅ LDesign Template Examples 启动完成')

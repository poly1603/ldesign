import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'

// 导入样式
import './styles/main.less'

const app = createApp(App)

// 状态管理
const pinia = createPinia()
app.use(pinia)

// 路由

app.mount('#app')

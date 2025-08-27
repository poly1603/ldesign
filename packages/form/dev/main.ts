/**
 * 开发环境入口文件
 * 用于本地开发和测试
 */

import { createApp } from 'vue'
import App from './App.vue'
import DynamicFormPlugin from '../src'
import '../src/styles/index.less'

const app = createApp(App)

// 注册 LemonForm 插件
app.use(DynamicFormPlugin, {
  // 全局配置
  theme: 'light',
  size: 'medium',
  debug: true
})

app.mount('#app')

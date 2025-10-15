import { createApp } from 'vue'
import App from './App.vue'
import { TemplateManager } from '../../src'
import { registerBuiltinTemplates } from '../../src/templates'

// 创建模板管理器
const manager = new TemplateManager({
  debug: true
})

// 注册所有内置模板
registerBuiltinTemplates(manager)

// 将管理器挂载到全局
const app = createApp(App)
app.provide('templateManager', manager)
app.mount('#app')

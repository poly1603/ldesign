import { createApp } from 'vue'
import { TemplateManager } from '../../src'
import { registerBuiltinTemplates } from '../../src/templates'
import App from './App.vue'

// 创建模板管理器
const manager = new TemplateManager({
  debug: true,
})

// 注册所有内置模板
registerBuiltinTemplates(manager)

// 调试：查看注册的模板
console.log('[Main] Registered templates:')
const allTemplates = manager.query({})
allTemplates.forEach((t) => {
  console.log(`  - ${t.id}: ${t.metadata.displayName} (${t.metadata.device})`)
})

// 查看每个设备的模板数量
const devices = ['desktop', 'tablet', 'mobile'] as const
devices.forEach((device) => {
  const templates = manager.query({ category: 'login', device })
  console.log(`[Main] Login templates for ${device}: ${templates.length}`)
})

// 将管理器挂载到全局
const app = createApp(App)
app.provide('templateManager', manager)
app.mount('#app')

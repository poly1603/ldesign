import { createApp } from 'vue'
import App from './App.vue'
import { TemplateManager } from '../../src'
import LoginDesktop from './templates/LoginDesktop.vue'
import LoginTablet from './templates/LoginTablet.vue'
import LoginMobile from './templates/LoginMobile.vue'

// 创建模板管理器
const manager = new TemplateManager({
  debug: true
})

// 注册登录模板
manager.register('login', 'desktop', 'default', {
  displayName: '桌面登录',
  description: '桌面端登录页面',
  version: '1.0.0',
  isDefault: true
}, LoginDesktop)

manager.register('login', 'tablet', 'default', {
  displayName: '平板登录',
  description: '平板端登录页面',
  version: '1.0.0',
  isDefault: true
}, LoginTablet)

manager.register('login', 'mobile', 'default', {
  displayName: '移动登录',
  description: '移动端登录页面',
  version: '1.0.0',
  isDefault: true
}, LoginMobile)

// 将管理器挂载到全局
const app = createApp(App)
app.provide('templateManager', manager)
app.mount('#app')

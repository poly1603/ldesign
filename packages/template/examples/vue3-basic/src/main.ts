import { createApp } from 'vue'
import App from './App.vue'

// 创建应用实例
const app = createApp(App)

// 安装模板插件
// app.use(TemplatePlugin, {
//   scanner: {
//     scanPaths: ['src/templates/**/*.vue']
//   },
//   loader: {
//     enableCache: true,
//     preloadStrategy: 'critical'
//   },
//   deviceAdapter: {
//     autoDetect: true,
//     watchDeviceChange: true
//   }
// })

app.mount('#app')

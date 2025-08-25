import { createApp } from 'vue'
import App from './App.vue'
import CompleteTemplateDemo from './CompleteTemplateDemo.vue'
// import { TemplatePlugin } from '@ldesign/template/vue'

// 使用完整的模板演示组件
const app = createApp(CompleteTemplateDemo)

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

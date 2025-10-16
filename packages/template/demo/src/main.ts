import { createTemplatePlugin } from '@ldesign/template'
import { createApp } from 'vue'
import App from './App.vue'
// 导入样式 - 用户只需要这样导入即可
import '@ldesign/template/index.css'

// 创建 Vue 应用
const app = createApp(App)

// 创建并安装模板插件
const templatePlugin = createTemplatePlugin({
  autoInit: true,  // 自动初始化
  autoDetect: true, // 自动检测设备
  cache: {
    enabled: true,  // 启用组件缓存
  },
  rememberPreferences: true, // 启用用户偏好记忆
})

app.use(templatePlugin)
app.mount('#app')

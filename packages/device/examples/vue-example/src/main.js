import { createDevicePlugin } from '@ldesign/device/vue'
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 安装设备检测插件
app.use(
  createDevicePlugin({
    enableResize: true,
    enableOrientation: true,
    debounceDelay: 300,
  }),
)

// 挂载应用
app.mount('#app')

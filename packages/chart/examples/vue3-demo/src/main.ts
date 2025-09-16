import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 导入图表插件
import LDesignChart from '@ldesign/chart/vue'

// 导入样式
import './style.css'

const app = createApp(App)

// 安装路由
app.use(router)

// 安装图表插件
app.use(LDesignChart, {
  prefix: 'L', // 组件前缀
  directive: true // 启用 v-chart 指令
})

app.mount('#app')

import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
// 导入日历组件的CSS
import '../../../dist/index.css'

const app = createApp(App)

app.mount('#app')

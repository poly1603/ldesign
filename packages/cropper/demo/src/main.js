import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 导入裁剪器样式
// import '../../src/styles/index.less'

// 导入并注册 Vue 指令
import { vSimpleCropper } from './utils/SimpleCropper.js'

const app = createApp(App)

app.use(router)

// 全局注册裁剪器指令
app.directive('cropper', vSimpleCropper)

app.mount('#app')

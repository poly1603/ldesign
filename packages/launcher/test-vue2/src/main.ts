import Vue from 'vue'
import App from './App.vue'

console.log('🚀 Vue 2 应用启动中...')

// Vue 2 配置
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')

console.log('✅ Vue 2 应用已挂载到 #app')

// 添加一些开发时的调试信息
if (import.meta.env.DEV) {
  console.log('🔧 开发模式已启用')
  console.log('📦 Vue 版本:', Vue.version)
  console.log('🎯 环境变量:', import.meta.env)
}

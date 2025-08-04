import { AdaptiveFormPlugin } from '@ldesign/form/vue'
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 安装自适应表单插件
app.use(AdaptiveFormPlugin, {
  // 全局配置
  theme: {
    primaryColor: '#667eea',
    borderRadius: 6,
    spacing: 16,
  },
  locale: {
    expandText: '展开更多',
    collapseText: '收起',
    confirmText: '确定',
    cancelText: '取消',
    requiredMessage: '此字段为必填项',
  },
  development: {
    enableDebug: true,
    showPerformanceMetrics: true,
  },
})

app.mount('#app')

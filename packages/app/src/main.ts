import { createApp } from 'vue'
import { createEngine, presets } from '@ldesign/engine'
import App from './App'

// 创建 Vue 应用
async function bootstrap() {
  try {
    // 创建引擎实例
    const engine = createEngine({
      ...presets.development(),
      config: {
        debug: true,
        appName: 'LDesign Engine Demo',
        version: '0.1.0',
      },
    })

    // 创建 Vue 应用
    const app = createApp(App)

    // 安装引擎到 Vue 应用
    engine.install(app)

    // 全局属性，方便在组件中访问引擎
    app.config.globalProperties.$engine = engine

    // 挂载应用
    app.mount('#app')

    console.log('🚀 LDesign Engine Demo 启动成功!')
  } catch (error) {
    console.error('应用启动失败:', error)
  }
}

// 启动应用
bootstrap()

/**
 * 简化的 Source 模式入口文件
 * 只使用基本功能，跳过复杂的插件配置
 */

import { createApp, defineComponent } from 'vue'
import './styles/index.less'

console.log('🚀 启动简化版 LDesign 应用...')

// 创建一个简单的组件，不依赖路由
const SimpleApp = defineComponent({
  name: 'SimpleApp',
  template: `
    <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
      <h1 style="color: #646cff; margin-bottom: 20px;">🎨 LDesign Engine</h1>
      <p style="font-size: 18px; margin-bottom: 30px;">简化源码模式 - 正常运行！</p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 600px; margin: 0 auto;">
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
          <h3>🔧 引擎信息</h3>
          <p>版本: {{ engineInfo.version }}</p>
          <p>模式: {{ engineInfo.mode }}</p>
          <p>调试: {{ engineInfo.debug ? '开启' : '关闭' }}</p>
        </div>

        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
          <h3>📱 设备信息</h3>
          <p>类型: {{ deviceInfo.type }}</p>
          <p>方向: {{ deviceInfo.orientation }}</p>
          <p>尺寸: {{ deviceInfo.width }} × {{ deviceInfo.height }}</p>
        </div>
      </div>

      <div style="margin-top: 30px; padding: 15px; background: #e8f5e8; border-radius: 8px;">
        <p>✅ 简化模式启动成功！</p>
        <p>这个模式不依赖复杂的插件和路由，可以用于基础开发和调试。</p>
      </div>
    </div>
  `,
  setup() {
    return {
      engineInfo: {
        version: '1.0.0',
        mode: 'source-simple',
        debug: true,
      },
      deviceInfo: {
        type: 'desktop',
        orientation: 'landscape',
        width: window.innerWidth,
        height: window.innerHeight,
      },
    }
  },
})

async function bootstrap() {
  try {
    // 创建 Vue 应用
    const vueApp = createApp(SimpleApp)

    // 添加全局属性（模拟引擎功能）
    vueApp.config.globalProperties.$engine = {
      version: '1.0.0',
      mode: 'source-simple',
      debug: true,
    }

    vueApp.config.globalProperties.$device = {
      type: 'desktop',
      orientation: 'landscape',
      width: window.innerWidth,
      height: window.innerHeight,
    }

    // 挂载应用
    vueApp.mount('#app')

    console.log('✅ 简化版 LDesign 应用启动成功!')
    console.log('📱 设备信息:', vueApp.config.globalProperties.$device)
    console.log('🔧 引擎信息:', vueApp.config.globalProperties.$engine)
  } catch (error) {
    console.error('❌ 应用启动失败:', error)
  }
}

// 启动应用
bootstrap()

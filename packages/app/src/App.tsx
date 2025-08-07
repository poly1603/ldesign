import { defineComponent, onMounted, getCurrentInstance } from 'vue'
import type { Engine } from '@ldesign/engine'

export default defineComponent({
  name: 'App',
  setup() {
    const instance = getCurrentInstance()
    const engine = instance?.appContext.config.globalProperties
      .$engine as Engine

    onMounted(() => {
      // 记录应用启动
      engine?.logger.info('LDesign Engine 演示应用已启动!')
    })

    return () => (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '3rem',
              marginBottom: '1rem',
              fontWeight: '600',
            }}
          >
            🚀 LDesign Engine
          </h1>
          <p style={{ fontSize: '1.5rem', marginBottom: '2rem', opacity: 0.9 }}>
            演示应用已成功启动！
          </p>
          <p style={{ fontSize: '1rem', opacity: 0.8 }}>
            基于 Vue 3 + TypeScript + TSX 构建
          </p>
        </div>
      </div>
    )
  },
})

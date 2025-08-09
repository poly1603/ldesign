import type { EngineImpl } from '/@fs/D:/User/Document/WorkSpace/ldesign/packages/engine/es/index.js'
import {
  useRoute,
  useRouter,
} from '/@fs/D:/User/Document/WorkSpace/ldesign/packages/router/es/index.js'
import { defineComponent, getCurrentInstance } from 'vue'

export default defineComponent({
  name: 'Home',
  setup() {
    // 获取 Engine 实例
    const instance = getCurrentInstance()
    const engine = instance?.appContext.config.globalProperties
      .$engine as EngineImpl

    const router = useRouter()
    const route = useRoute()

    const handleGoToLogin = () => {
      router.push('/login')
      engine?.logger.info('导航到登录页')
    }

    return () => (
      <div
        style={{
          padding: '2rem',
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        <h1>🏠 首页</h1>
        <p>欢迎使用 LDesign Engine + Router 演示应用！</p>

        <div
          style={{
            background: '#f5f5f5',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
          }}
        >
          <h3>📍 当前路由</h3>
          <p>
            <strong>路径:</strong> {route.value.path}
          </p>
          <p>
            <strong>名称:</strong> {route.value.name}
          </p>
        </div>

        <div
          style={{
            marginBottom: '2rem',
          }}
        >
          <button
            onClick={handleGoToLogin}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            🔑 去登录页
          </button>
        </div>

        <div
          style={{
            padding: '1rem',
            background: '#e7f3ff',
            borderRadius: '8px',
          }}
        >
          <h3>✨ 功能特性</h3>
          <ul>
            <li>🛣️ 基本路由导航</li>
            <li>⚙️ Engine 集成</li>
            <li>🔔 通知系统</li>
            <li>📝 日志记录</li>
          </ul>
        </div>
      </div>
    )
  },
})

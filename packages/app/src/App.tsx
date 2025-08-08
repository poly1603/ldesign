import { defineComponent, getCurrentInstance } from 'vue'
import type { Engine } from '@ldesign/engine'

export default defineComponent({
  name: 'App',
  setup() {
    console.log('App 组件 setup 执行')

    // 获取 Engine 实例
    const instance = getCurrentInstance()
    const engine = instance?.appContext.config.globalProperties
      .$engine as Engine
    console.log('获取到 Engine 实例:', engine)

    const navigateTo = (path: string) => {
      // 使用 Engine 的路由器
      engine?.router?.push(path)
      engine?.logger.info(`导航到页面: ${path}`)
    }

    const showNotification = (
      type: 'success' | 'info' | 'warning' | 'error'
    ) => {
      engine?.notifications.show({
        type,
        title: `${type.toUpperCase()} 通知`,
        message: `这是一个 ${type} 类型的通知演示`,
        duration: 3000,
      })
    }

    return () => {
      console.log('App 组件渲染函数执行')
      return (
        <div id='app'>
          <h1>🚀 LDesign Engine + Router 演示</h1>
          <p>简化的 Engine 与 Router 集成演示</p>

          {/* 简化的导航栏 */}
          <nav
            style={{
              padding: '1rem',
              background: '#f5f5f5',
              borderBottom: '1px solid #ddd',
              marginBottom: '1rem',
              display: 'flex',
              gap: '0.5rem',
            }}
          >
            <button onClick={() => navigateTo('/')}>🏠 首页</button>
            <button onClick={() => navigateTo('/login')}>🔑 登录</button>
          </nav>

          {/* 通知测试按钮 */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              marginBottom: '1rem',
            }}
          >
            <button
              onClick={() => showNotification('success')}
              style={{ background: '#28a745' }}
            >
              ✅ 成功通知
            </button>
            <button
              onClick={() => showNotification('info')}
              style={{ background: '#17a2b8' }}
            >
              ℹ️ 信息通知
            </button>
            <button
              onClick={() => showNotification('warning')}
              style={{ background: '#ffc107', color: '#000' }}
            >
              ⚠️ 警告通知
            </button>
            <button
              onClick={() => showNotification('error')}
              style={{ background: '#dc3545' }}
            >
              ❌ 错误通知
            </button>
          </div>

          {/* 路由状态显示 */}
          <div
            style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <h3>📍 路由状态</h3>
            <p>当前路径: {window.location.pathname}</p>
            <p>点击上方导航按钮测试路由功能</p>
          </div>

          <div
            style={{
              background: '#e7f3ff',
              padding: '1rem',
              borderRadius: '8px',
            }}
          >
            <h3>✨ 基本功能</h3>
            <ul>
              <li>✅ Engine 快速创建</li>
              <li>✅ 基本路由导航</li>
              <li>✅ 通知系统</li>
              <li>✅ 日志记录</li>
            </ul>
          </div>

          <style>{`
            #app {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              margin: 0;
              padding: 1rem;
              min-height: 100vh;
              background: #f9f9f9;
            }

            button {
              padding: 0.5rem 1rem;
              background: #007bff;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
            }

            button:hover {
              opacity: 0.9;
              transform: translateY(-1px);
            }

            button:active {
              transform: translateY(0);
            }

            h1 {
              color: #333;
              margin-bottom: 0.5rem;
            }

            h3 {
              color: #555;
              margin: 0 0 1rem 0;
            }

            p {
              color: #666;
              margin: 0.5rem 0;
            }

            ul {
              color: #666;
            }

            li {
              margin-bottom: 0.5rem;
            }
          `}</style>
        </div>
      )
    }
  },
})

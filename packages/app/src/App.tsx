import type { EngineImpl } from '@ldesign/engine'
import { RouterLink, RouterView } from '@ldesign/router'
import { defineComponent, getCurrentInstance } from 'vue'

export default defineComponent({
  name: 'App',
  setup() {
    // eslint-disable-next-line no-console
    console.log('App 组件 setup 执行')

    // 获取 Engine 实例
    const instance = getCurrentInstance()
    const engine = instance?.appContext.config.globalProperties
      .$engine as EngineImpl
    // eslint-disable-next-line no-console
    console.log('获取到 Engine 实例:', engine)

    const navigateTo = (path: string) => {
      // 直接使用 engine 的路由器进行导航
      if (engine?.router) {
        engine.router.push(path)
        engine.logger.info(`导航到页面: ${path}`)
      } else {
        console.warn('路由器尚未准备好')
        window.location.hash = path
      }
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
      // eslint-disable-next-line no-console
      console.log('App 组件渲染函数执行')
      return (
        <div class='app-container'>
          <h1>🚀 LDesign Engine + Router 演示</h1>
          <p>简化的 Engine 与 Router 集成演示</p>

          {/* 简单的导航栏 */}
          <nav
            style={{
              padding: '1rem',
              background: '#f5f5f5',
              borderBottom: '1px solid #ddd',
              marginBottom: '1rem',
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            <RouterLink to='/' variant='tab'>
              🏠 首页
            </RouterLink>
            <RouterLink to='/login' variant='tab'>
              🔑 登录
            </RouterLink>
            <RouterLink to='/dashboard' variant='tab'>
              📊 仪表板
            </RouterLink>
            <RouterLink to='/help' variant='tab'>
              ❓ 帮助
            </RouterLink>
          </nav>

          {/* 简单的内容区域 */}
          <div
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <h2>✅ 应用启动成功！</h2>
            <p>LDesign Engine 已经成功启动，路由系统正在工作。</p>
            <p>
              当前路径:
              {window.location.hash || '/'}
            </p>
          </div>

          {/* 通知测试区域 */}
          <div
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <h3>🔔 通知测试</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={() => showNotification('success')}>
                成功通知
              </button>
              <button onClick={() => showNotification('info')}>信息通知</button>
              <button onClick={() => showNotification('warning')}>
                警告通知
              </button>
              <button onClick={() => showNotification('error')}>
                错误通知
              </button>
            </div>
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
            <p>
              当前路径:
              {window.location.pathname}
            </p>
            <p>
              当前URL:
              {window.location.href}
            </p>
            <p>点击上方导航按钮测试路由功能</p>
          </div>

          {/* 路由视图 */}
          <div
            style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <h3>📄 路由内容</h3>
            <RouterView />
          </div>

          {/* 基本功能展示 */}
          <div
            style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <h3>✨ 基本功能</h3>
            <ul>
              <li>✅ Engine 快速创建</li>
              <li>✅ 基本路由导航</li>
              <li>✅ 通知系统</li>
              <li>✅ 日志记录</li>
              <li>✅ RouterView 组件</li>
            </ul>
          </div>

          <style>
            {`
            .app-container {
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
          `}
          </style>
        </div>
      )
    }
  },
})

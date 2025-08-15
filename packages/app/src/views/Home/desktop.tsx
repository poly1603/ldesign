import { useDevice } from '@ldesign/device'
import { useRouter, useDeviceRoute } from '@ldesign/router'
import { defineComponent, getCurrentInstance } from 'vue'

export default defineComponent({
  name: 'HomeDesktop',
  setup() {
    const instance = getCurrentInstance()
    const router = useRouter()
    const { deviceInfo } = useDevice()
    const { currentDeviceName, isRouteSupported } = useDeviceRoute()

    const $i18n = instance?.appContext.config.globalProperties.$i18n

    const handleGoToLogin = () => {
      router.push('/login')
    }

    const handleGoToAdmin = () => {
      router.push('/admin')
    }

    const handleGoToEditor = () => {
      router.push('/editor')
    }

    const handleGoToMobileApp = () => {
      router.push('/mobile-app')
    }

    return () => (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            padding: '48px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          }}
        >
          {/* 头部区域 */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '48px',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '32px',
            }}
          >
            <h1
              style={{
                fontSize: '48px',
                margin: '0 0 16px 0',
                color: '#2d3748',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              🖥️ LDesign 桌面端
            </h1>
            <p
              style={{
                fontSize: '20px',
                color: '#718096',
                margin: '0',
                fontWeight: '500',
              }}
            >
              专业级桌面应用体验，功能完整，性能卓越
            </p>
          </div>

          {/* 信息面板 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
              marginBottom: '48px',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
                color: 'white',
                padding: '24px',
                borderRadius: '16px',
                textAlign: 'center',
              }}
            >
              <h3
                style={{
                  fontSize: '18px',
                  margin: '0 0 12px 0',
                  fontWeight: '600',
                }}
              >
                设备信息
              </h3>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                <p style={{ margin: '8px 0' }}>类型: {currentDeviceName}</p>
                <p style={{ margin: '8px 0' }}>
                  分辨率: {deviceInfo.value?.screenSize || '未知'}
                </p>
                {$i18n && (
                  <p style={{ margin: '8px 0' }}>
                    语言: {$i18n.getCurrentLanguage()}
                  </p>
                )}
              </div>
            </div>

            <div
              style={{
                background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                color: 'white',
                padding: '24px',
                borderRadius: '16px',
                textAlign: 'center',
              }}
            >
              <h3
                style={{
                  fontSize: '18px',
                  margin: '0 0 12px 0',
                  fontWeight: '600',
                }}
              >
                桌面特性
              </h3>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                <p style={{ margin: '8px 0' }}>🖱️ 精确鼠标操作</p>
                <p style={{ margin: '8px 0' }}>⌨️ 完整键盘支持</p>
                <p style={{ margin: '8px 0' }}>🖥️ 大屏幕优化</p>
                <p style={{ margin: '8px 0' }}>⚡ 高性能处理</p>
              </div>
            </div>

            <div
              style={{
                background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
                color: 'white',
                padding: '24px',
                borderRadius: '16px',
                textAlign: 'center',
              }}
            >
              <h3
                style={{
                  fontSize: '18px',
                  margin: '0 0 12px 0',
                  fontWeight: '600',
                }}
              >
                集成组件
              </h3>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                <p style={{ margin: '8px 0' }}>📱 设备检测</p>
                <p style={{ margin: '8px 0' }}>🛣️ 智能路由</p>
                <p style={{ margin: '8px 0' }}>🌐 HTTP 客户端</p>
                <p style={{ margin: '8px 0' }}>🎨 模板系统</p>
              </div>
            </div>
          </div>

          {/* 功能导航 */}
          <div style={{ marginBottom: '48px' }}>
            <h3
              style={{
                fontSize: '28px',
                margin: '0 0 24px 0',
                color: '#2d3748',
                textAlign: 'center',
                fontWeight: '700',
              }}
            >
              功能中心
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '20px',
              }}
            >
              <button
                onClick={handleGoToLogin}
                style={{
                  padding: '20px 32px',
                  fontSize: '18px',
                  backgroundColor: '#4299e1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  fontWeight: '600',
                }}
              >
                🔑 <span>用户登录</span>
              </button>

              {isRouteSupported('/admin') && (
                <button
                  onClick={handleGoToAdmin}
                  style={{
                    padding: '20px 32px',
                    fontSize: '18px',
                    backgroundColor: '#e53e3e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    fontWeight: '600',
                  }}
                >
                  ⚙️ <span>管理后台</span>
                </button>
              )}

              {isRouteSupported('/editor') && (
                <button
                  onClick={handleGoToEditor}
                  style={{
                    padding: '20px 32px',
                    fontSize: '18px',
                    backgroundColor: '#48bb78',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    fontWeight: '600',
                  }}
                >
                  ✏️ <span>内容编辑器</span>
                </button>
              )}

              <button
                onClick={handleGoToMobileApp}
                style={{
                  padding: '20px 32px',
                  fontSize: '18px',
                  backgroundColor: isRouteSupported('/mobile-app')
                    ? '#805ad5'
                    : '#a0aec0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  cursor: isRouteSupported('/mobile-app')
                    ? 'pointer'
                    : 'not-allowed',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  fontWeight: '600',
                }}
                disabled={!isRouteSupported('/mobile-app')}
              >
                📱 <span>移动应用</span>
                {!isRouteSupported('/mobile-app') && (
                  <span style={{ fontSize: '14px', opacity: 0.8 }}>
                    (仅移动端)
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* 底部信息 */}
          <div
            style={{
              background: 'linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%)',
              padding: '24px',
              borderRadius: '16px',
              textAlign: 'center',
            }}
          >
            <h4
              style={{
                margin: '0 0 12px 0',
                color: '#2d3748',
                fontSize: '18px',
                fontWeight: '600',
              }}
            >
              💡 桌面端优势
            </h4>
            <p
              style={{
                margin: '0',
                fontSize: '16px',
                color: '#4a5568',
                lineHeight: '1.6',
              }}
            >
              桌面端提供完整的功能体验，包括管理后台、高级编辑器等专业功能。
              支持复杂的键盘快捷键、多窗口操作和高性能数据处理。
            </p>
          </div>
        </div>
      </div>
    )
  },
})

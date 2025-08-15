import { useDevice } from '@ldesign/device'
import { useRouter, useDeviceRoute } from '@ldesign/router'
import { defineComponent, getCurrentInstance } from 'vue'

export default defineComponent({
  name: 'HomeMobile',
  setup() {
    const instance = getCurrentInstance()
    const router = useRouter()
    const { deviceInfo } = useDevice()
    const { currentDeviceName, isRouteSupported } = useDeviceRoute()

    const $i18n = instance?.appContext.config.globalProperties.$i18n

    const handleGoToLogin = () => {
      router.push('/login')
    }

    const handleGoToMobileApp = () => {
      router.push('/mobile-app')
    }

    return () => (
      <div
        style={{
          padding: '16px',
          textAlign: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '20px',
            margin: '20px 0',
            backdropFilter: 'blur(10px)',
          }}
        >
          <h1 style={{ fontSize: '24px', margin: '0 0 16px 0' }}>
            📱 LDesign 移动端
          </h1>

          <div style={{ margin: '16px 0' }}>
            <p style={{ fontSize: '16px', margin: '8px 0' }}>
              欢迎使用移动端应用
            </p>
            <p style={{ fontSize: '14px', margin: '8px 0', opacity: 0.9 }}>
              当前设备: {currentDeviceName}
            </p>
            {$i18n && (
              <p style={{ fontSize: '14px', margin: '8px 0', opacity: 0.9 }}>
                语言: {$i18n.getCurrentLanguage()}
              </p>
            )}
          </div>

          <div style={{ margin: '20px 0' }}>
            <h3 style={{ fontSize: '18px', margin: '16px 0' }}>移动端特性</h3>
            <div
              style={{
                display: 'grid',
                gap: '12px',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '12px',
                  borderRadius: '8px',
                }}
              >
                <strong>📱 触摸优化</strong>
                <p
                  style={{
                    margin: '4px 0 0 0',
                    fontSize: '14px',
                    opacity: 0.9,
                  }}
                >
                  专为触摸操作设计的界面
                </p>
              </div>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '12px',
                  borderRadius: '8px',
                }}
              >
                <strong>🚀 快速加载</strong>
                <p
                  style={{
                    margin: '4px 0 0 0',
                    fontSize: '14px',
                    opacity: 0.9,
                  }}
                >
                  优化的移动端性能
                </p>
              </div>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '12px',
                  borderRadius: '8px',
                }}
              >
                <strong>🎨 响应式设计</strong>
                <p
                  style={{
                    margin: '4px 0 0 0',
                    fontSize: '14px',
                    opacity: 0.9,
                  }}
                >
                  适配各种屏幕尺寸
                </p>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              margin: '20px 0',
            }}
          >
            <button
              onClick={handleGoToLogin}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              🔑 登录
            </button>

            {isRouteSupported('/mobile-app') && (
              <button
                onClick={handleGoToMobileApp}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                📱 移动应用
              </button>
            )}
          </div>

          <div
            style={{
              fontSize: '12px',
              opacity: 0.8,
              marginTop: '20px',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
            }}
          >
            <p style={{ margin: '0' }}>💡 提示: 这是专为移动设备优化的页面</p>
          </div>
        </div>
      </div>
    )
  },
})

import { useDevice } from '@ldesign/device'
import { useRouter, useDeviceRoute } from '@ldesign/router'
import { defineComponent, getCurrentInstance } from 'vue'

export default defineComponent({
  name: 'HomeTablet',
  setup() {
    const instance = getCurrentInstance()
    const router = useRouter()
    const { deviceInfo } = useDevice()
    const { currentDeviceName, isRouteSupported } = useDeviceRoute()

    const $i18n = instance?.appContext.config.globalProperties.$i18n

    const handleGoToLogin = () => {
      router.push('/login')
    }

    const handleGoToEditor = () => {
      router.push('/editor')
    }

    const handleGoToAdmin = () => {
      router.push('/admin')
    }

    return () => (
      <div
        style={{
          padding: '24px',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1
              style={{
                fontSize: '32px',
                margin: '0 0 16px 0',
                color: '#2d3748',
                fontWeight: '700',
              }}
            >
              📱 LDesign 平板端
            </h1>
            <p
              style={{
                fontSize: '18px',
                color: '#718096',
                margin: '0',
              }}
            >
              为平板设备优化的用户体验
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
              marginBottom: '32px',
            }}
          >
            <div
              style={{
                background: '#f7fafc',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}
            >
              <h3
                style={{
                  fontSize: '20px',
                  margin: '0 0 12px 0',
                  color: '#2d3748',
                }}
              >
                设备信息
              </h3>
              <div style={{ fontSize: '14px', color: '#4a5568' }}>
                <p style={{ margin: '8px 0' }}>
                  <strong>设备类型:</strong> {currentDeviceName}
                </p>
                <p style={{ margin: '8px 0' }}>
                  <strong>屏幕尺寸:</strong>{' '}
                  {deviceInfo.value?.screenSize || '未知'}
                </p>
                {$i18n && (
                  <p style={{ margin: '8px 0' }}>
                    <strong>语言:</strong> {$i18n.getCurrentLanguage()}
                  </p>
                )}
              </div>
            </div>

            <div
              style={{
                background: '#f7fafc',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}
            >
              <h3
                style={{
                  fontSize: '20px',
                  margin: '0 0 12px 0',
                  color: '#2d3748',
                }}
              >
                平板特性
              </h3>
              <ul
                style={{
                  margin: '0',
                  padding: '0 0 0 16px',
                  fontSize: '14px',
                  color: '#4a5568',
                }}
              >
                <li style={{ margin: '8px 0' }}>触摸与键盘双重支持</li>
                <li style={{ margin: '8px 0' }}>中等屏幕优化布局</li>
                <li style={{ margin: '8px 0' }}>横竖屏自适应</li>
                <li style={{ margin: '8px 0' }}>手势操作支持</li>
              </ul>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3
              style={{
                fontSize: '24px',
                margin: '0 0 20px 0',
                color: '#2d3748',
                textAlign: 'center',
              }}
            >
              功能导航
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
              }}
            >
              <button
                onClick={handleGoToLogin}
                style={{
                  padding: '16px 24px',
                  fontSize: '16px',
                  backgroundColor: '#4299e1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                🔑 <span>登录系统</span>
              </button>

              {isRouteSupported('/editor') && (
                <button
                  onClick={handleGoToEditor}
                  style={{
                    padding: '16px 24px',
                    fontSize: '16px',
                    backgroundColor: '#48bb78',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  ✏️ <span>编辑器</span>
                </button>
              )}

              <button
                onClick={handleGoToAdmin}
                style={{
                  padding: '16px 24px',
                  fontSize: '16px',
                  backgroundColor: isRouteSupported('/admin')
                    ? '#ed8936'
                    : '#a0aec0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: isRouteSupported('/admin')
                    ? 'pointer'
                    : 'not-allowed',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
                disabled={!isRouteSupported('/admin')}
              >
                ⚙️ <span>管理后台</span>
                {!isRouteSupported('/admin') && (
                  <span style={{ fontSize: '12px' }}>(仅桌面端)</span>
                )}
              </button>
            </div>
          </div>

          <div
            style={{
              background: '#edf2f7',
              padding: '16px',
              borderRadius: '12px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                margin: '0',
                fontSize: '14px',
                color: '#4a5568',
              }}
            >
              💡 这是专为平板设备优化的界面，提供了平衡的功能性和易用性
            </p>
          </div>
        </div>
      </div>
    )
  },
})

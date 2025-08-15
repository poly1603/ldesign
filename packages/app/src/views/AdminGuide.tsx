import { useRouter, useDeviceRoute } from '@ldesign/router'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AdminGuide',
  setup() {
    const router = useRouter()
    const { currentDeviceName } = useDeviceRoute()

    const handleGoBack = () => {
      router.push('/')
    }

    const handleTryAgain = () => {
      router.push('/admin')
    }

    return () => (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '600px',
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            textAlign: 'center',
          }}
        >
          <div style={{ marginBottom: '32px' }}>
            <div
              style={{
                fontSize: '64px',
                marginBottom: '16px',
              }}
            >
              🖥️
            </div>
            <h1
              style={{
                fontSize: '32px',
                margin: '0 0 16px 0',
                color: '#2d3748',
                fontWeight: '700',
              }}
            >
              管理后台使用指南
            </h1>
            <p
              style={{
                fontSize: '18px',
                color: '#718096',
                margin: '0',
              }}
            >
              管理后台需要在桌面设备上使用
            </p>
          </div>

          <div
            style={{
              background: '#fed7d7',
              border: '1px solid #feb2b2',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '32px',
              textAlign: 'left',
            }}
          >
            <h3
              style={{
                color: '#c53030',
                margin: '0 0 12px 0',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              ⚠️ 设备不兼容
            </h3>
            <p
              style={{
                color: '#742a2a',
                margin: '0',
                fontSize: '14px',
                lineHeight: '1.6',
              }}
            >
              当前设备：<strong>{currentDeviceName}</strong>
              <br />
              管理后台包含复杂的数据表格、图表和管理功能，需要较大的屏幕空间和精确的鼠标操作，因此仅支持桌面设备访问。
            </p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3
              style={{
                fontSize: '20px',
                margin: '0 0 16px 0',
                color: '#2d3748',
              }}
            >
              如何访问管理后台？
            </h3>

            <div
              style={{
                display: 'grid',
                gap: '16px',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  background: '#e6fffa',
                  border: '1px solid #81e6d9',
                  borderRadius: '8px',
                  padding: '16px',
                }}
              >
                <h4
                  style={{
                    color: '#234e52',
                    margin: '0 0 8px 0',
                    fontSize: '16px',
                  }}
                >
                  1. 使用桌面电脑或笔记本
                </h4>
                <p
                  style={{
                    color: '#285e61',
                    margin: '0',
                    fontSize: '14px',
                  }}
                >
                  在 Windows、macOS 或 Linux 系统的桌面浏览器中访问
                </p>
              </div>

              <div
                style={{
                  background: '#e6fffa',
                  border: '1px solid #81e6d9',
                  borderRadius: '8px',
                  padding: '16px',
                }}
              >
                <h4
                  style={{
                    color: '#234e52',
                    margin: '0 0 8px 0',
                    fontSize: '16px',
                  }}
                >
                  2. 确保屏幕分辨率足够
                </h4>
                <p
                  style={{
                    color: '#285e61',
                    margin: '0',
                    fontSize: '14px',
                  }}
                >
                  建议最小分辨率：1200 × 800 像素
                </p>
              </div>

              <div
                style={{
                  background: '#e6fffa',
                  border: '1px solid #81e6d9',
                  borderRadius: '8px',
                  padding: '16px',
                }}
              >
                <h4
                  style={{
                    color: '#234e52',
                    margin: '0 0 8px 0',
                    fontSize: '16px',
                  }}
                >
                  3. 使用现代浏览器
                </h4>
                <p
                  style={{
                    color: '#285e61',
                    margin: '0',
                    fontSize: '14px',
                  }}
                >
                  推荐 Chrome、Firefox、Safari 或 Edge 最新版本
                </p>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={handleGoBack}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: '#4299e1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              ← 返回首页
            </button>

            <button
              onClick={handleTryAgain}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: '#48bb78',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              🔄 重新尝试
            </button>
          </div>

          <div
            style={{
              marginTop: '24px',
              padding: '16px',
              background: '#f7fafc',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#718096',
            }}
          >
            💡 提示：这是 LDesign Router 设备适配功能的演示。
            系统会自动检测您的设备类型并提供相应的用户体验。
          </div>
        </div>
      </div>
    )
  },
})

import { useRouter, useDeviceRoute } from '@ldesign/router'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Admin',
  setup() {
    const router = useRouter()
    const { currentDeviceName } = useDeviceRoute()

    const handleGoBack = () => {
      router.push('/')
    }

    return () => (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
          color: 'white',
          padding: '40px',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            padding: '40px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              marginBottom: '40px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              paddingBottom: '24px',
            }}
          >
            <h1
              style={{
                fontSize: '36px',
                margin: '0 0 16px 0',
                fontWeight: '700',
              }}
            >
              ⚙️ 管理后台
            </h1>
            <p
              style={{
                fontSize: '18px',
                opacity: 0.8,
                margin: '0',
              }}
            >
              专业的桌面端管理界面
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                background: 'rgba(66, 153, 225, 0.1)',
                border: '1px solid rgba(66, 153, 225, 0.3)',
                padding: '24px',
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <h3
                style={{
                  fontSize: '20px',
                  margin: '0 0 12px 0',
                  color: '#63b3ed',
                }}
              >
                用户管理
              </h3>
              <p
                style={{
                  margin: '0',
                  fontSize: '14px',
                  opacity: 0.8,
                }}
              >
                管理系统用户和权限
              </p>
            </div>

            <div
              style={{
                background: 'rgba(72, 187, 120, 0.1)',
                border: '1px solid rgba(72, 187, 120, 0.3)',
                padding: '24px',
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <h3
                style={{
                  fontSize: '20px',
                  margin: '0 0 12px 0',
                  color: '#68d391',
                }}
              >
                系统配置
              </h3>
              <p
                style={{
                  margin: '0',
                  fontSize: '14px',
                  opacity: 0.8,
                }}
              >
                配置系统参数和设置
              </p>
            </div>

            <div
              style={{
                background: 'rgba(237, 137, 54, 0.1)',
                border: '1px solid rgba(237, 137, 54, 0.3)',
                padding: '24px',
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <h3
                style={{
                  fontSize: '20px',
                  margin: '0 0 12px 0',
                  color: '#f6ad55',
                }}
              >
                数据分析
              </h3>
              <p
                style={{
                  margin: '0',
                  fontSize: '14px',
                  opacity: 0.8,
                }}
              >
                查看系统数据和报表
              </p>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '24px',
              borderRadius: '12px',
              marginBottom: '32px',
            }}
          >
            <h3
              style={{
                fontSize: '24px',
                margin: '0 0 16px 0',
                color: '#e2e8f0',
              }}
            >
              设备信息
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
              }}
            >
              <div>
                <strong>当前设备:</strong> {currentDeviceName}
              </div>
              <div>
                <strong>访问时间:</strong> {new Date().toLocaleString()}
              </div>
              <div>
                <strong>屏幕分辨率:</strong> {window.screen.width} ×{' '}
                {window.screen.height}
              </div>
              <div>
                <strong>浏览器:</strong> {navigator.userAgent.split(' ')[0]}
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(72, 187, 120, 0.1)',
              border: '1px solid rgba(72, 187, 120, 0.3)',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '32px',
            }}
          >
            <h4
              style={{
                margin: '0 0 12px 0',
                color: '#68d391',
                fontSize: '18px',
              }}
            >
              ✅ 设备适配成功
            </h4>
            <p
              style={{
                margin: '0',
                fontSize: '14px',
                opacity: 0.9,
              }}
            >
              管理后台已成功检测到桌面设备，所有高级功能均可正常使用。
              移动设备和平板设备将被自动重定向到适合的页面。
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
            }}
          >
            <button
              onClick={handleGoBack}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              ← 返回首页
            </button>
          </div>
        </div>
      </div>
    )
  },
})

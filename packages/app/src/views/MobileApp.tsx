import { useDeviceRoute, useRouter } from '@ldesign/router'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MobileApp',
  setup() {
    const router = useRouter()
    const { currentDeviceName } = useDeviceRoute()

    const handleGoBack = () => {
      router.push('/')
    }

    const features = [
      { icon: '📱', title: '触摸优化', desc: '专为触摸操作设计' },
      { icon: '🚀', title: '快速响应', desc: '优化的移动端性能' },
      { icon: '🔄', title: '离线支持', desc: '支持离线使用' },
      { icon: '📍', title: '位置服务', desc: '基于位置的功能' },
      { icon: '📷', title: '相机集成', desc: '直接调用设备相机' },
      { icon: '🔔', title: '推送通知', desc: '实时消息推送' },
    ]

    return () => (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '16px',
        }}
      >
        <div
          style={{
            maxWidth: '400px',
            margin: '0 auto',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '24px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              marginBottom: '32px',
            }}
          >
            <h1
              style={{
                fontSize: '28px',
                margin: '0 0 12px 0',
                fontWeight: '700',
              }}
            >
              📱 移动应用
            </h1>
            <p
              style={{
                fontSize: '16px',
                opacity: 0.9,
                margin: '0',
              }}
            >
              专为移动设备打造的应用体验
            </p>
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '24px',
              textAlign: 'center',
            }}
          >
            <h3
              style={{
                fontSize: '18px',
                margin: '0 0 8px 0',
              }}
            >
              设备信息
            </h3>
            <p
              style={{
                margin: '0',
                fontSize: '14px',
                opacity: 0.8,
              }}
            >
              当前设备:
              {' '}
              {currentDeviceName}
            </p>
            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: '14px',
                opacity: 0.8,
              }}
            >
              屏幕尺寸:
              {' '}
              {window.innerWidth}
              {' '}
              ×
              {' '}
              {window.innerHeight}
            </p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3
              style={{
                fontSize: '20px',
                margin: '0 0 16px 0',
                textAlign: 'center',
              }}
            >
              移动端特性
            </h3>

            <div
              style={{
                display: 'grid',
                gap: '12px',
              }}
            >
              {features.map((feature, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '16px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '24px',
                      minWidth: '32px',
                      textAlign: 'center',
                    }}
                  >
                    {feature.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4
                      style={{
                        margin: '0 0 4px 0',
                        fontSize: '16px',
                        fontWeight: '600',
                      }}
                    >
                      {feature.title}
                    </h4>
                    <p
                      style={{
                        margin: '0',
                        fontSize: '14px',
                        opacity: 0.8,
                      }}
                    >
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: 'rgba(72, 187, 120, 0.2)',
              border: '1px solid rgba(72, 187, 120, 0.4)',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '24px',
            }}
          >
            <h4
              style={{
                margin: '0 0 8px 0',
                color: '#68d391',
                fontSize: '16px',
                textAlign: 'center',
              }}
            >
              ✅ 移动端专属功能
            </h4>
            <p
              style={{
                margin: '0',
                fontSize: '14px',
                opacity: 0.9,
                textAlign: 'center',
              }}
            >
              此页面仅在移动设备上可访问，提供专为小屏幕优化的用户体验。
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <button
              onClick={handleGoBack}
              style={{
                padding: '14px 24px',
                fontSize: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontWeight: '600',
              }}
            >
              ← 返回首页
            </button>

            <button
              style={{
                padding: '14px 24px',
                fontSize: '16px',
                backgroundColor: 'rgba(72, 187, 120, 0.3)',
                color: 'white',
                border: '1px solid rgba(72, 187, 120, 0.5)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontWeight: '600',
              }}
            >
              📱 下载移动应用
            </button>
          </div>

          <div
            style={{
              marginTop: '24px',
              textAlign: 'center',
              fontSize: '12px',
              opacity: 0.7,
            }}
          >
            <p style={{ margin: '0' }}>
              💡 提示: 在其他设备上访问此页面将被重定向
            </p>
          </div>
        </div>
      </div>
    )
  },
})

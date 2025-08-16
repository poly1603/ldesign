import { useDeviceRoute, useRoute, useRouter } from '@ldesign/router'
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'DeviceUnsupported',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const { currentDeviceName } = useDeviceRoute()

    // 从查询参数获取信息
    const device = computed(() => (route.query.device as string) || 'unknown')
    const from = computed(() => (route.query.from as string) || '/')
    const message = computed(
      () => (route.query.message as string) || '当前系统不支持在此设备上查看'
    )

    // 设备友好名称映射
    const deviceNames: Record<string, string> = {
      mobile: '移动设备',
      tablet: '平板设备',
      desktop: '桌面设备',
    }

    const deviceName = computed(() => deviceNames[device.value] || device.value)

    const handleGoBack = () => {
      if (window.history.length > 1) {
        window.history.back()
      } else {
        router.push('/')
      }
    }

    const handleGoHome = () => {
      router.push('/')
    }

    const handleRefresh = () => {
      window.location.reload()
    }

    // 根据来源路由提供建议
    const suggestions = computed(() => {
      const fromPath = from.value
      if (fromPath.includes('/admin')) {
        return [
          '请使用桌面电脑或笔记本电脑访问',
          '确保屏幕分辨率至少为 1200×800',
          '使用现代浏览器（Chrome、Firefox、Safari、Edge）',
        ]
      } else if (fromPath.includes('/mobile-app')) {
        return [
          '请使用手机访问此功能',
          '确保使用移动端浏览器',
          '或下载我们的移动应用',
        ]
      } else if (fromPath.includes('/editor')) {
        return [
          '编辑器需要较大的屏幕空间',
          '请使用平板或桌面设备',
          '确保有足够的屏幕分辨率',
        ]
      }
      return ['请使用合适的设备访问此功能', '联系技术支持获取更多帮助']
    })

    return () => (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: '500px',
            width: '100%',
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            textAlign: 'center',
            animation: 'slideUp 0.6s ease-out',
          }}
        >
          {/* 图标区域 */}
          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                fontSize: '64px',
                marginBottom: '8px',
              }}
            >
              📱⚠️
            </div>
          </div>

          {/* 标题 */}
          <h1
            style={{
              fontSize: '28px',
              margin: '0 0 16px 0',
              color: '#2d3748',
              fontWeight: '700',
            }}
          >
            设备不支持
          </h1>

          {/* 消息内容 */}
          <div style={{ marginBottom: '32px' }}>
            <p
              style={{
                fontSize: '16px',
                color: '#4a5568',
                margin: '0 0 24px 0',
                lineHeight: '1.6',
              }}
            >
              {message.value}
            </p>

            <div
              style={{
                background: '#f7fafc',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
                textAlign: 'left',
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#2d3748' }}>当前设备：</strong>
                <span
                  style={{
                    color: '#e53e3e',
                    fontWeight: '600',
                    marginLeft: '8px',
                  }}
                >
                  {deviceName.value}
                </span>
              </div>

              {from.value !== '/' && (
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#2d3748' }}>来源页面：</strong>
                  <span
                    style={{
                      color: '#4a5568',
                      marginLeft: '8px',
                      fontFamily: 'monospace',
                    }}
                  >
                    {from.value}
                  </span>
                </div>
              )}
            </div>

            {/* 建议 */}
            <div
              style={{
                background: '#edf2f7',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'left',
              }}
            >
              <h3
                style={{
                  margin: '0 0 12px 0',
                  color: '#2d3748',
                  fontSize: '16px',
                }}
              >
                💡 解决建议：
              </h3>
              <ul
                style={{
                  margin: '0',
                  paddingLeft: '20px',
                  color: '#4a5568',
                }}
              >
                {suggestions.value.map((suggestion, index) => (
                  <li
                    key={index}
                    style={{
                      marginBottom: '8px',
                      lineHeight: '1.5',
                    }}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 操作按钮 */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={handleGoBack}
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                backgroundColor: '#edf2f7',
                color: '#4a5568',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                minWidth: '120px',
              }}
            >
              ← 返回上页
            </button>

            <button
              onClick={handleGoHome}
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                backgroundColor: '#4299e1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                minWidth: '120px',
              }}
            >
              🏠 回到首页
            </button>

            <button
              onClick={handleRefresh}
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                backgroundColor: '#48bb78',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                minWidth: '120px',
              }}
            >
              🔄 刷新页面
            </button>
          </div>

          {/* 底部信息 */}
          <div
            style={{
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid #e2e8f0',
              fontSize: '12px',
              color: '#718096',
            }}
          >
            LDesign Router 设备适配功能演示
          </div>
        </div>
      </div>
    )
  },
})

// 添加动画样式
const style = document.createElement('style')
style.textContent = `
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`
document.head.appendChild(style)

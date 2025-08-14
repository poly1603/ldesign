import { useDevice } from '@ldesign/device'
import { useRouter } from '@ldesign/router'
import { defineComponent, getCurrentInstance } from 'vue'

export default defineComponent({
  name: 'Home',
  setup() {
    // 获取基本实例
    const instance = getCurrentInstance()
    const router = useRouter()

    // 使用设备检测
    const { deviceInfo } = useDevice()

    // 使用 i18n
    const $t = instance?.appContext.config.globalProperties.$t
    const $i18n = instance?.appContext.config.globalProperties.$i18n

    // 基本操作
    const handleGoToLogin = () => {
      router.push('/login')
    }

    return () => (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>🏠 LDesign 应用演示</h1>

        <div style={{ margin: '20px 0' }}>
          <p>欢迎使用 LDesign Engine 生态系统</p>
          <p>
            当前设备类型:
            {deviceInfo.value?.type || 'unknown'}
          </p>
          {$i18n && (
            <p>
              当前语言:
              {$i18n.getCurrentLanguage()}
            </p>
          )}
        </div>

        <div style={{ margin: '20px 0' }}>
          <h3>集成的包:</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>📱 @ldesign/device - 设备检测</li>
            <li>🛣️ @ldesign/router - 路由管理</li>
            <li>🌐 @ldesign/http - HTTP 请求</li>
            <li>🌍 @ldesign/i18n - 国际化</li>
            <li>🎨 @ldesign/template - 模板系统</li>
            <li>⚙️ @ldesign/engine - 应用引擎</li>
          </ul>
        </div>

        <div style={{ margin: '20px 0' }}>
          <button
            onClick={handleGoToLogin}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            🔑 前往登录页
          </button>
        </div>
      </div>
    )
  },
})

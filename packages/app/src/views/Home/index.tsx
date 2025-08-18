import { useTheme } from '@ldesign/color/vue'
import { useCrypto, useHash } from '@ldesign/crypto/vue'
import { useDevice } from '@ldesign/device'
import { useRouter } from '@ldesign/router'
import { useSize } from '@ldesign/size/vue'
import { defineComponent, getCurrentInstance, inject, ref } from 'vue'

export default defineComponent({
  name: 'Home',
  setup() {
    // 获取基本实例
    const instance = getCurrentInstance()
    const router = useRouter()

    // 使用设备检测
    const { deviceInfo } = useDevice()

    // 使用 i18n
    // const $t = instance?.appContext.config.globalProperties.$t
    const $i18n = instance?.appContext.config.globalProperties.$i18n

    // 使用新集成的功能 - 添加错误处理
    let themeApi
    try {
      themeApi = useTheme()
    } catch (error) {
      console.warn('主题管理器不可用，使用降级方案:', error)
      themeApi = {
        currentTheme: ref('default'),
        setTheme: () => Promise.resolve(),
        availableThemes: ref(['default']),
      }
    }
    const { currentTheme, setTheme, availableThemes } = themeApi

    const { currentMode, setMode } = useSize()
    const { encryptAES } = useCrypto()
    const { sha256 } = useHash()
    const cache = inject('cache')

    // 演示数据
    const demoText = ref('Hello LDesign!')
    const encryptedText = ref('')
    const hashedText = ref('')
    const cacheKey = 'demo-data'

    // 基本操作
    const handleGoToLogin = () => {
      router.push('/login')
    }

    // 主题切换演示
    const handleThemeChange = () => {
      const themes = availableThemes.value || ['default', 'dark', 'blue']
      const currentIndex = themes.indexOf(currentTheme.value || 'default')
      const nextIndex = (currentIndex + 1) % themes.length
      setTheme(themes[nextIndex])
    }

    // 尺寸切换演示
    const handleSizeChange = () => {
      const sizes = ['small', 'medium', 'large', 'extra-large']
      const currentIndex = sizes.indexOf(currentMode.value || 'medium')
      const nextIndex = (currentIndex + 1) % sizes.length
      setMode(sizes[nextIndex] as any)
    }

    // 加密演示
    const handleEncrypt = async () => {
      try {
        const result = await encryptAES(demoText.value, 'demo-key')
        encryptedText.value = result?.data || ''
      } catch (error) {
        console.error('加密失败:', error)
      }
    }

    // 哈希演示
    const handleHash = async () => {
      try {
        const result = await sha256(demoText.value)
        hashedText.value = result || ''
      } catch (error) {
        console.error('哈希失败:', error)
      }
    }

    // 缓存演示
    const handleCacheDemo = () => {
      if (
        cache &&
        typeof cache === 'object' &&
        'set' in cache &&
        'get' in cache
      ) {
        const timestamp = new Date().toLocaleString()
        ;(cache as any).set(cacheKey, `缓存数据: ${timestamp}`)
        const cached = (cache as any).get(cacheKey)
        alert(`缓存成功: ${cached}`)
      }
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
            <li>💾 @ldesign/cache - 缓存管理</li>
            <li>🎨 @ldesign/color - 颜色主题</li>
            <li>🔐 @ldesign/crypto - 加密功能</li>
            <li>📱 @ldesign/device - 设备检测</li>
            <li>⚙️ @ldesign/engine - 应用引擎</li>
            <li>🌐 @ldesign/http - HTTP 请求</li>
            <li>🌍 @ldesign/i18n - 国际化</li>
            <li>🛣️ @ldesign/router - 路由管理</li>
            <li>📏 @ldesign/size - 尺寸缩放</li>
            <li>🗃️ @ldesign/store - 状态管理</li>
            <li>🎭 @ldesign/template - 模板系统</li>
          </ul>
        </div>

        {/* 功能演示区域 */}
        <div
          style={{
            margin: '30px 0',
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '8px',
          }}
        >
          <h3>🚀 功能演示</h3>

          {/* 主题和尺寸控制 */}
          <div
            style={{
              margin: '15px 0',
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={handleThemeChange}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              🎨 切换主题 ({currentTheme.value || 'default'})
            </button>

            <button
              onClick={handleSizeChange}
              style={{
                padding: '8px 16px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              📏 切换尺寸 ({currentMode.value || 'medium'})
            </button>

            <button
              onClick={handleCacheDemo}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6f42c1',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              💾 缓存演示
            </button>
          </div>

          {/* 加密演示 */}
          <div
            style={{
              margin: '15px auto',
              textAlign: 'left',
              maxWidth: '600px',
            }}
          >
            <h4>🔐 加密功能演示</h4>
            <div style={{ margin: '10px 0' }}>
              <input
                value={demoText.value}
                onInput={e =>
                  (demoText.value = (e.target as HTMLInputElement).value)
                }
                placeholder='输入要加密的文本'
                style={{
                  padding: '8px',
                  width: '200px',
                  marginRight: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />
              <button
                onClick={handleEncrypt}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '10px',
                }}
              >
                🔒 AES加密
              </button>
              <button
                onClick={handleHash}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#fd7e14',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                # SHA256哈希
              </button>
            </div>

            {encryptedText.value && (
              <div
                style={{
                  margin: '10px 0',
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                }}
              >
                <strong>加密结果:</strong>{' '}
                <code style={{ wordBreak: 'break-all' }}>
                  {encryptedText.value}
                </code>
              </div>
            )}

            {hashedText.value && (
              <div
                style={{
                  margin: '10px 0',
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                }}
              >
                <strong>哈希结果:</strong>{' '}
                <code style={{ wordBreak: 'break-all' }}>
                  {hashedText.value}
                </code>
              </div>
            )}
          </div>
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

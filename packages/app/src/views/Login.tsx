import type { EngineImpl } from '/@fs/D:/User/Document/WorkSpace/ldesign/packages/engine/es/index.js'
import { useRouter } from '/@fs/D:/User/Document/WorkSpace/ldesign/packages/router/es/index.js'
import { defineComponent, getCurrentInstance, ref } from 'vue'

export default defineComponent({
  name: 'Login',
  setup() {
    // 获取 Engine 实例
    const instance = getCurrentInstance()
    const engine = instance?.appContext.config.globalProperties
      .$engine as EngineImpl

    const router = useRouter()
    const username = ref('')
    const password = ref('')
    const loading = ref(false)
    const error = ref('')

    const handleLogin = async () => {
      if (!username.value || !password.value) {
        error.value = '请输入用户名和密码'
        return
      }

      loading.value = true
      error.value = ''

      engine?.logger.info(`用户尝试登录: ${username.value}`)

      try {
        // 模拟登录请求
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 简单的登录验证（演示用）
        if (username.value === 'admin' && password.value === 'admin') {
          engine?.notifications.show({
            type: 'success',
            title: '登录成功',
            message: `欢迎回来，${username.value}！`,
            duration: 3000,
          })

          engine?.logger.info(`用户登录成功: ${username.value}`)

          // 跳转到首页
          router.push('/')
        } else {
          error.value = '用户名或密码错误'
          engine?.logger.warn('登录失败：用户名或密码错误')
        }
      } catch (err) {
        error.value = '登录失败，请重试'
        engine?.logger.error('登录错误:', err)
      } finally {
        loading.value = false
      }
    }

    return () => (
      <div
        style={{
          padding: '2rem',
          maxWidth: '400px',
          margin: '2rem auto',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <h1>🔑 登录</h1>
        <p>演示应用登录页面</p>

        <form
          onSubmit={e => {
            e.preventDefault()
            handleLogin()
          }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              用户名
            </label>
            <input
              type='text'
              value={username.value}
              onInput={e =>
                (username.value = (e.target as HTMLInputElement).value)
              }
              placeholder='请输入用户名 (admin)'
              disabled={loading.value}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              密码
            </label>
            <input
              type='password'
              value={password.value}
              onInput={e =>
                (password.value = (e.target as HTMLInputElement).value)
              }
              placeholder='请输入密码 (admin)'
              disabled={loading.value}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
              }}
            />
          </div>

          {error.value && (
            <div
              style={{
                background: '#fee',
                color: '#c53030',
                padding: '0.5rem',
                borderRadius: '4px',
                marginBottom: '1rem',
                fontSize: '14px',
              }}
            >
              {error.value}
            </div>
          )}

          <button
            type='submit'
            disabled={loading.value}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: loading.value ? 'not-allowed' : 'pointer',
              opacity: loading.value ? 0.6 : 1,
            }}
          >
            {loading.value ? '登录中...' : '登录'}
          </button>
        </form>

        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '4px',
            fontSize: '14px',
            textAlign: 'center',
          }}
        >
          <p>💡 提示：使用 admin/admin 登录</p>
          <p>🔧 这是一个演示应用，展示 LDesign Router 的基本功能</p>
        </div>
      </div>
    )
  },
})

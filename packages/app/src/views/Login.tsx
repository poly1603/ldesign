import type { EngineImpl } from '@ldesign/engine'
import { useRouter } from '@ldesign/router'
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

    // 处理登录事件
    const handleLogin = async () => {
      if (!username.value || !password.value) {
        engine?.notifications.show({
          type: 'error',
          title: '登录失败',
          message: '请输入用户名和密码',
          duration: 3000,
        })
        return
      }

      loading.value = true
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
          engine?.notifications.show({
            type: 'error',
            title: '登录失败',
            message: '用户名或密码错误',
            duration: 3000,
          })
          engine?.logger.warn('登录失败：用户名或密码错误')
        }
      } catch (err) {
        engine?.notifications.show({
          type: 'error',
          title: '登录失败',
          message: '登录失败，请重试',
          duration: 3000,
        })
        engine?.logger.error('登录错误:', err)
      } finally {
        loading.value = false
      }
    }

    return () => (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '2rem',
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow:
              '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#1a202c',
                margin: '0 0 0.5rem 0',
              }}
            >
              🔑 LDesign 登录
            </h1>
            <p
              style={{
                color: '#718096',
                margin: 0,
                fontSize: '1rem',
              }}
            >
              演示应用登录页面 - 使用 admin/admin 登录
            </p>
          </div>

          <form
            onSubmit={(e: Event) => {
              e.preventDefault()
              handleLogin()
            }}
          >
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#374151',
                  fontWeight: '500',
                }}
              >
                用户名
              </label>
              <input
                type='text'
                value={username.value}
                onInput={e =>
                  (username.value = (e.target as HTMLInputElement).value)
                }
                placeholder='请输入用户名'
                disabled={loading.value}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#374151',
                  fontWeight: '500',
                }}
              >
                密码
              </label>
              <input
                type='password'
                value={password.value}
                onInput={e =>
                  (password.value = (e.target as HTMLInputElement).value)
                }
                placeholder='请输入密码'
                disabled={loading.value}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type='submit'
              disabled={loading.value}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: loading.value
                  ? '#9ca3af'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading.value ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                transform: loading.value ? 'none' : 'translateY(0)',
              }}
              onMouseOver={e => {
                if (!loading.value) {
                  ;(e.target as HTMLElement).style.transform =
                    'translateY(-1px)'
                }
              }}
              onMouseOut={e => {
                if (!loading.value) {
                  ;(e.target as HTMLElement).style.transform = 'translateY(0)'
                }
              }}
            >
              {loading.value ? '登录中...' : '登录'}
            </button>
          </form>

          <div
            style={{
              marginTop: '2rem',
              padding: '1rem',
              background: '#f8fafc',
              borderRadius: '8px',
              fontSize: '14px',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: '0 0 0.5rem 0', color: '#4a5568' }}>
              💡 <strong>演示账号：</strong>admin / admin
            </p>
            <p style={{ margin: '0 0 0.5rem 0', color: '#4a5568' }}>
              🎨 <strong>模板系统：</strong>集成 @ldesign/template
            </p>
            <p style={{ margin: 0, color: '#4a5568' }}>
              🔧 <strong>集成功能：</strong>Engine 通知、日志、路由跳转
            </p>
          </div>
        </div>
      </div>
    )
  },
})

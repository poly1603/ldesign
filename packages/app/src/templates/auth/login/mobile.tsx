import { useRouter } from '@ldesign/router'
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'LoginMobileTemplate',
  setup() {
    const router = useRouter()
    const username = ref('')
    const password = ref('')
    const loading = ref(false)

    const handleLogin = async () => {
      if (!username.value || !password.value) {
        alert('请输入用户名和密码')
        return
      }

      loading.value = true

      // 模拟登录请求
      setTimeout(() => {
        loading.value = false
        alert('登录成功！')
        router.push('/')
      }, 1500)
    }

    const handleGoBack = () => {
      router.push('/')
    }

    return () => (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '360px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '32px 24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* 头部 */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '32px',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                marginBottom: '16px',
              }}
            >
              📱
            </div>
            <h1
              style={{
                fontSize: '24px',
                margin: '0 0 8px 0',
                color: '#2d3748',
                fontWeight: '700',
              }}
            >
              移动端登录
            </h1>
            <p
              style={{
                fontSize: '14px',
                color: '#718096',
                margin: '0',
              }}
            >
              专为移动设备优化的登录体验
            </p>
          </div>

          {/* 登录表单 */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#2d3748',
                  marginBottom: '8px',
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
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#2d3748',
                  marginBottom: '8px',
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
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading.value}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '600',
                backgroundColor: loading.value ? '#a0aec0' : '#4299e1',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: loading.value ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {loading.value ? (
                <>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  登录中...
                </>
              ) : (
                <>🔑 登录</>
              )}
            </button>
          </div>

          {/* 移动端特性 */}
          <div
            style={{
              background: '#f7fafc',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
            }}
          >
            <h4
              style={{
                margin: '0 0 8px 0',
                fontSize: '14px',
                color: '#2d3748',
                fontWeight: '600',
              }}
            >
              📱 移动端特性
            </h4>
            <ul
              style={{
                margin: '0',
                paddingLeft: '16px',
                fontSize: '12px',
                color: '#4a5568',
              }}
            >
              <li>触摸优化的输入框</li>
              <li>大按钮易于点击</li>
              <li>自动键盘适配</li>
              <li>快速登录体验</li>
            </ul>
          </div>

          {/* 底部操作 */}
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
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                backgroundColor: 'transparent',
                color: '#4a5568',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              ← 返回首页
            </button>

            <div
              style={{
                textAlign: 'center',
                fontSize: '12px',
                color: '#718096',
              }}
            >
              💡 这是移动端登录模板演示
            </div>
          </div>
        </div>
      </div>
    )
  },
})

// 添加旋转动画
const style = document.createElement('style')
style.textContent = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`
document.head.appendChild(style)

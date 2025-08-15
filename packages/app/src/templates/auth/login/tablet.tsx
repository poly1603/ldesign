import { useRouter } from '@ldesign/router'
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'LoginTabletTemplate',
  setup() {
    const router = useRouter()
    const username = ref('')
    const password = ref('')
    const rememberMe = ref(false)
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
        alert(`登录成功！${rememberMe.value ? '已记住登录状态' : ''}`)
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
          padding: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '600px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            padding: '48px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(10px)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '48px',
            alignItems: 'center',
          }}
        >
          {/* 左侧信息 */}
          <div>
            <div
              style={{
                fontSize: '64px',
                marginBottom: '24px',
                textAlign: 'center',
              }}
            >
              📱
            </div>
            <h1
              style={{
                fontSize: '32px',
                margin: '0 0 16px 0',
                color: '#2d3748',
                fontWeight: '700',
                textAlign: 'center',
              }}
            >
              平板端登录
            </h1>
            <p
              style={{
                fontSize: '16px',
                color: '#718096',
                margin: '0 0 24px 0',
                textAlign: 'center',
                lineHeight: '1.6',
              }}
            >
              为平板设备优化的登录界面，提供平衡的功能性和易用性
            </p>

            <div
              style={{
                background: '#f7fafc',
                borderRadius: '12px',
                padding: '20px',
              }}
            >
              <h4
                style={{
                  margin: '0 0 12px 0',
                  fontSize: '16px',
                  color: '#2d3748',
                  fontWeight: '600',
                }}
              >
                📱 平板端优势
              </h4>
              <ul
                style={{
                  margin: '0',
                  paddingLeft: '20px',
                  fontSize: '14px',
                  color: '#4a5568',
                  lineHeight: '1.6',
                }}
              >
                <li>触摸与键盘双重支持</li>
                <li>中等屏幕优化布局</li>
                <li>横竖屏自适应</li>
                <li>手势操作友好</li>
              </ul>
            </div>
          </div>

          {/* 右侧登录表单 */}
          <div>
            <div style={{ marginBottom: '32px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '16px',
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
                    padding: '16px',
                    fontSize: '16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'border-color 0.3s ease',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '16px',
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
                    padding: '16px',
                    fontSize: '16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'border-color 0.3s ease',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div
                style={{
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <input
                  type='checkbox'
                  id='remember'
                  checked={rememberMe.value}
                  onChange={e =>
                    (rememberMe.value = (e.target as HTMLInputElement).checked)
                  }
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                  }}
                />
                <label
                  htmlFor='remember'
                  style={{
                    fontSize: '14px',
                    color: '#4a5568',
                    cursor: 'pointer',
                  }}
                >
                  记住登录状态
                </label>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading.value}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '18px',
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
                        width: '18px',
                        height: '18px',
                        border: '2px solid transparent',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                    登录中...
                  </>
                ) : (
                  <>🔑 登录系统</>
                )}
              </button>
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
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
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
                💡 平板端登录模板 - 触摸优化
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
})

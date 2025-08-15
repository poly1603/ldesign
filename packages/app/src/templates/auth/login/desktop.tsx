import { useRouter } from '@ldesign/router'
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'LoginDesktopTemplate',
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

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleLogin()
      }
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
            maxWidth: '1000px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(10px)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            overflow: 'hidden',
          }}
        >
          {/* 左侧品牌区域 */}
          <div
            style={{
              background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
              color: 'white',
              padding: '60px 48px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '80px',
                marginBottom: '24px',
              }}
            >
              🖥️
            </div>
            <h1
              style={{
                fontSize: '36px',
                margin: '0 0 16px 0',
                fontWeight: '800',
              }}
            >
              LDesign
            </h1>
            <h2
              style={{
                fontSize: '24px',
                margin: '0 0 24px 0',
                fontWeight: '600',
                opacity: 0.9,
              }}
            >
              桌面端登录
            </h2>
            <p
              style={{
                fontSize: '16px',
                margin: '0 0 32px 0',
                opacity: 0.8,
                lineHeight: '1.6',
              }}
            >
              专业级桌面应用体验，功能完整，性能卓越。
              支持完整的键盘快捷键和高级功能。
            </p>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '20px',
                width: '100%',
              }}
            >
              <h4
                style={{
                  margin: '0 0 12px 0',
                  fontSize: '18px',
                  fontWeight: '600',
                }}
              >
                🖥️ 桌面端特性
              </h4>
              <ul
                style={{
                  margin: '0',
                  paddingLeft: '20px',
                  fontSize: '14px',
                  opacity: 0.9,
                  lineHeight: '1.6',
                  textAlign: 'left',
                }}
              >
                <li>完整的键盘快捷键支持</li>
                <li>高分辨率界面优化</li>
                <li>多窗口管理支持</li>
                <li>高性能数据处理</li>
                <li>专业级功能访问</li>
              </ul>
            </div>
          </div>

          {/* 右侧登录表单 */}
          <div style={{ padding: '60px 48px' }}>
            <div style={{ marginBottom: '40px' }}>
              <h3
                style={{
                  fontSize: '28px',
                  margin: '0 0 8px 0',
                  color: '#2d3748',
                  fontWeight: '700',
                }}
              >
                欢迎回来
              </h3>
              <p
                style={{
                  fontSize: '16px',
                  color: '#718096',
                  margin: '0',
                }}
              >
                请登录您的账户以继续使用
              </p>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <div style={{ marginBottom: '24px' }}>
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
                  onKeyPress={handleKeyPress}
                  placeholder='请输入用户名'
                  style={{
                    width: '100%',
                    padding: '16px 20px',
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
                  onKeyPress={handleKeyPress}
                  placeholder='请输入密码'
                  style={{
                    width: '100%',
                    padding: '16px 20px',
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
                  marginBottom: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{
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
                      (rememberMe.value = (
                        e.target as HTMLInputElement
                      ).checked)
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

                <a
                  href='#'
                  style={{
                    fontSize: '14px',
                    color: '#4299e1',
                    textDecoration: 'none',
                  }}
                >
                  忘记密码？
                </a>
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
                gap: '16px',
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
                💡 桌面端登录模板 - 支持键盘快捷键 (Enter 登录)
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
})

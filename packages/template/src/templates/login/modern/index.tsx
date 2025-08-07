import { defineComponent, ref, computed } from 'vue'
import './styles.less'

export interface ModernLoginTemplateProps {
  title?: string
  subtitle?: string
  logo?: string
  showRememberMe?: boolean
  showForgotPassword?: boolean
  showRegisterLink?: boolean
  allowThirdPartyLogin?: boolean
  loading?: boolean
}

export const ModernLoginTemplate = defineComponent({
  name: 'ModernLoginTemplate',
  props: {
    title: {
      type: String,
      default: 'LDesign 登录'
    },
    subtitle: {
      type: String,
      default: '欢迎回来'
    },
    logo: {
      type: String,
      default: '/logo.png'
    },
    showRememberMe: {
      type: Boolean,
      default: true
    },
    showForgotPassword: {
      type: Boolean,
      default: true
    },
    showRegisterLink: {
      type: Boolean,
      default: true
    },
    allowThirdPartyLogin: {
      type: Boolean,
      default: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['login', 'register', 'forgot-password', 'third-party-login'],
  setup(props, { emit }) {
    const username = ref('')
    const password = ref('')
    const rememberMe = ref(false)
    const isLoading = ref(false)

    const isFormValid = computed(() => {
      return username.value.trim() !== '' && password.value.trim() !== ''
    })

    const handleLogin = async () => {
      if (!isFormValid.value || isLoading.value) return

      isLoading.value = true
      try {
        emit('login', {
          username: username.value,
          password: password.value,
          rememberMe: rememberMe.value
        })
      } finally {
        isLoading.value = false
      }
    }

    const handleRegister = () => {
      emit('register')
    }

    const handleForgotPassword = () => {
      emit('forgot-password')
    }

    const handleThirdPartyLogin = (provider: string) => {
      emit('third-party-login', provider)
    }

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && isFormValid.value) {
        handleLogin()
      }
    }

    return () => (
      <div class="modern-login-template">
        <div class="background-decoration">
          <div class="decoration-circle circle-1"></div>
          <div class="decoration-circle circle-2"></div>
          <div class="decoration-circle circle-3"></div>
        </div>
        
        <div class="login-container">
          <div class="login-card">
            {/* Logo 和标题 */}
            <div class="login-header">
              {props.logo && (
                <div class="logo-container">
                  <img src={props.logo} alt="Logo" class="login-logo" />
                </div>
              )}
              <h1 class="login-title">{props.title}</h1>
              {props.subtitle && (
                <p class="login-subtitle">{props.subtitle}</p>
              )}
            </div>

            {/* 第三方登录 */}
            {props.allowThirdPartyLogin && (
              <div class="third-party-section">
                <div class="third-party-buttons">
                  <button
                    class="third-party-button github"
                    onClick={() => handleThirdPartyLogin('github')}
                  >
                    <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </button>
                  <button
                    class="third-party-button google"
                    onClick={() => handleThirdPartyLogin('google')}
                  >
                    <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </button>
                </div>
                
                <div class="divider">
                  <span class="divider-text">或使用邮箱登录</span>
                </div>
              </div>
            )}

            {/* 登录表单 */}
            <form class="login-form" onSubmit={(e) => { e.preventDefault(); handleLogin() }}>
              <div class="form-group">
                <div class="input-container">
                  <input
                    id="username"
                    type="text"
                    class="form-input"
                    placeholder="用户名或邮箱"
                    v-model={username.value}
                    onKeypress={handleKeyPress}
                    disabled={isLoading.value}
                  />
                  <div class="input-focus-border"></div>
                </div>
              </div>

              <div class="form-group">
                <div class="input-container">
                  <input
                    id="password"
                    type="password"
                    class="form-input"
                    placeholder="密码"
                    v-model={password.value}
                    onKeypress={handleKeyPress}
                    disabled={isLoading.value}
                  />
                  <div class="input-focus-border"></div>
                </div>
              </div>

              {/* 记住我和忘记密码 */}
              <div class="form-options">
                {props.showRememberMe && (
                  <label class="checkbox-container">
                    <input
                      type="checkbox"
                      v-model={rememberMe.value}
                      disabled={isLoading.value}
                    />
                    <span class="checkmark"></span>
                    <span class="checkbox-text">记住我</span>
                  </label>
                )}
                {props.showForgotPassword && (
                  <a
                    href="#"
                    class="forgot-password-link"
                    onClick={(e) => { e.preventDefault(); handleForgotPassword() }}
                  >
                    忘记密码？
                  </a>
                )}
              </div>

              {/* 登录按钮 */}
              <button
                type="submit"
                class={['login-button', { 'loading': isLoading.value }]}
                disabled={!isFormValid.value || isLoading.value}
              >
                <span class="button-text">
                  {isLoading.value ? '登录中...' : '登录'}
                </span>
                {isLoading.value && (
                  <div class="loading-spinner"></div>
                )}
              </button>
            </form>

            {/* 注册链接 */}
            {props.showRegisterLink && (
              <div class="register-section">
                <span class="register-text">还没有账户？</span>
                <a
                  href="#"
                  class="register-link"
                  onClick={(e) => { e.preventDefault(); handleRegister() }}
                >
                  立即注册
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
})

export default ModernLoginTemplate

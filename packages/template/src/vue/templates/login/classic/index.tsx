import { defineComponent, ref, computed } from 'vue'
import './styles.less'

export interface LoginTemplateProps {
  title?: string
  subtitle?: string
  logo?: string
  showRememberMe?: boolean
  showForgotPassword?: boolean
  showRegisterLink?: boolean
  allowThirdPartyLogin?: boolean
  loading?: boolean
}

export const ClassicLoginTemplate = defineComponent({
  name: 'ClassicLoginTemplate',
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
      default: false
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
      <div class="classic-login-template">
        <div class="login-container">
          <div class="login-card">
            {/* Logo 和标题 */}
            <div class="login-header">
              {props.logo && (
                <img src={props.logo} alt="Logo" class="login-logo" />
              )}
              <h1 class="login-title">{props.title}</h1>
              {props.subtitle && (
                <p class="login-subtitle">{props.subtitle}</p>
              )}
            </div>

            {/* 登录表单 */}
            <form class="login-form" onSubmit={(e) => { e.preventDefault(); handleLogin() }}>
              <div class="form-group">
                <label for="username" class="form-label">用户名</label>
                <input
                  id="username"
                  type="text"
                  class="form-input"
                  placeholder="请输入用户名"
                  v-model={username.value}
                  onKeypress={handleKeyPress}
                  disabled={isLoading.value}
                />
              </div>

              <div class="form-group">
                <label for="password" class="form-label">密码</label>
                <input
                  id="password"
                  type="password"
                  class="form-input"
                  placeholder="请输入密码"
                  v-model={password.value}
                  onKeypress={handleKeyPress}
                  disabled={isLoading.value}
                />
              </div>

              {/* 记住我和忘记密码 */}
              <div class="form-options">
                {props.showRememberMe && (
                  <label class="checkbox-label">
                    <input
                      type="checkbox"
                      v-model={rememberMe.value}
                      disabled={isLoading.value}
                    />
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
                {isLoading.value ? '登录中...' : '登录'}
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

            {/* 第三方登录 */}
            {props.allowThirdPartyLogin && (
              <div class="third-party-section">
                <div class="divider">
                  <span class="divider-text">或</span>
                </div>
                <div class="third-party-buttons">
                  <button
                    class="third-party-button github"
                    onClick={() => handleThirdPartyLogin('github')}
                  >
                    GitHub
                  </button>
                  <button
                    class="third-party-button google"
                    onClick={() => handleThirdPartyLogin('google')}
                  >
                    Google
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
})

export default ClassicLoginTemplate

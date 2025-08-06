import { defineComponent, reactive, ref } from 'vue'
import './index.less'

export default defineComponent({
  name: 'ModernLoginTemplate',
  props: {
    title: {
      type: String,
      default: '欢迎登录',
    },
    subtitle: {
      type: String,
      default: '开始您的数字化之旅',
    },
    logo: {
      type: String,
      default: '',
    },
    showRememberMe: {
      type: Boolean,
      default: true,
    },
    showForgotPassword: {
      type: Boolean,
      default: true,
    },
    showThirdPartyLogin: {
      type: Boolean,
      default: true,
    },
    thirdPartyProviders: {
      type: Array as () => string[],
      default: () => ['github', 'google', 'wechat'],
    },
  },
  emits: ['login', 'register', 'forgotPassword', 'thirdPartyLogin'],
  setup(props, { emit }) {
    const loading = ref(false)
    const form = reactive({
      username: '',
      password: '',
      remember: false,
    })

    const handleLogin = async () => {
      if (!form.username || !form.password) {
        console.warn('请输入用户名和密码')
        return
      }

      loading.value = true
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        emit('login', { ...form })
      }
      catch (error) {
        console.error('Login failed:', error)
      }
      finally {
        loading.value = false
      }
    }

    const handleRegister = () => {
      emit('register')
    }

    const handleForgotPassword = () => {
      emit('forgotPassword', { username: form.username })
    }

    const handleThirdPartyLogin = (provider: string) => {
      emit('thirdPartyLogin', { provider })
    }

    return () => (
      <div class="modern-login">
        <div class="modern-login__background">
          <div class="modern-login__particles">
            {Array.from({ length: 50 }).map((_, i) => (
              <div key={i} class="modern-login__particle"></div>
            ))}
          </div>
        </div>

        <div class="modern-login__container">
          <div class="modern-login__card">
            <div class="modern-login__header">
              {props.logo && (
                <div class="modern-login__logo">
                  <img src={props.logo} alt="Logo" />
                </div>
              )}
              <h1 class="modern-login__title">{props.title}</h1>
              <p class="modern-login__subtitle">{props.subtitle}</p>
            </div>

            <form class="modern-login__form" onSubmit={(e: Event) => { e.preventDefault(); handleLogin() }}>
              <div class="modern-login__form-group">
                <div class="modern-login__input-wrapper">
                  <svg class="modern-login__input-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" />
                    <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" />
                  </svg>
                  <input
                    type="text"
                    placeholder="用户名或邮箱"
                    v-model={form.username}
                    class="modern-login__input"
                  />
                </div>
              </div>

              <div class="modern-login__form-group">
                <div class="modern-login__input-wrapper">
                  <svg class="modern-login__input-icon" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2" />
                    <circle cx="12" cy="16" r="1" fill="currentColor" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2" />
                  </svg>
                  <input
                    type="password"
                    placeholder="密码"
                    v-model={form.password}
                    class="modern-login__input"
                  />
                </div>
              </div>

              <div class="modern-login__form-options">
                {props.showRememberMe && (
                  <label class="modern-login__checkbox">
                    <input
                      type="checkbox"
                      v-model={form.remember}
                    />
                    <span class="modern-login__checkbox-mark"></span>
                    记住我
                  </label>
                )}
                {props.showForgotPassword && (
                  <a href="#" onClick={handleForgotPassword} class="modern-login__forgot">
                    忘记密码？
                  </a>
                )}
              </div>

              <button
                type="submit"
                class={['modern-login__submit', { 'modern-login__submit--loading': loading.value }]}
                disabled={loading.value}
              >
                <span class="modern-login__submit-text">
                  {loading.value ? '登录中...' : '登录'}
                </span>
                {loading.value && (
                  <div class="modern-login__submit-spinner"></div>
                )}
              </button>
            </form>

            {props.showThirdPartyLogin && (
              <div class="modern-login__third-party">
                <div class="modern-login__divider">
                  <span>或使用以下方式登录</span>
                </div>
                <div class="modern-login__third-party-buttons">
                  {props.thirdPartyProviders.map(provider => (
                    <button
                      key={provider}
                      type="button"
                      class={`modern-login__third-party-btn modern-login__third-party-btn--${provider}`}
                      onClick={() => handleThirdPartyLogin(provider)}
                    >
                      <span class={`modern-login__third-party-icon modern-login__third-party-icon--${provider}`}></span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div class="modern-login__footer">
              <span>还没有账号？</span>
              <a href="#" onClick={handleRegister}>立即注册</a>
            </div>
          </div>
        </div>
      </div>
    )
  },
})

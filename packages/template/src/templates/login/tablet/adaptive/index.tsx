import { defineComponent, reactive, ref } from 'vue'
import './index.less'

export default defineComponent({
  name: 'TabletAdaptiveLoginTemplate',
  props: {
    title: {
      type: String,
      default: '用户登录',
    },
    subtitle: {
      type: String,
      default: '请输入您的账户信息',
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
      default: () => ['github', 'google', 'wechat', 'apple'],
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
        alert('请输入用户名和密码')
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
      <div class="tablet-adaptive-login">
        <div class="tablet-adaptive-login__background">
          <div class="tablet-adaptive-login__pattern"></div>
        </div>

        <div class="tablet-adaptive-login__container">
          <div class="tablet-adaptive-login__sidebar">
            <div class="tablet-adaptive-login__brand">
              {props.logo && (
                <div class="tablet-adaptive-login__logo">
                  <img src={props.logo} alt="Logo" />
                </div>
              )}
              <h1 class="tablet-adaptive-login__title">{props.title}</h1>
              <p class="tablet-adaptive-login__subtitle">{props.subtitle}</p>
            </div>

            <div class="tablet-adaptive-login__illustration">
              <div class="tablet-adaptive-login__shapes">
                <div class="tablet-adaptive-login__shape tablet-adaptive-login__shape--1"></div>
                <div class="tablet-adaptive-login__shape tablet-adaptive-login__shape--2"></div>
                <div class="tablet-adaptive-login__shape tablet-adaptive-login__shape--3"></div>
              </div>
            </div>
          </div>

          <div class="tablet-adaptive-login__main">
            <div class="tablet-adaptive-login__form-container">
              <form class="tablet-adaptive-login__form" onSubmit={(e: Event) => { e.preventDefault(); handleLogin() }}>
                <div class="tablet-adaptive-login__form-header">
                  <h2>登录您的账户</h2>
                  <p>输入您的凭据以访问您的账户</p>
                </div>

                <div class="tablet-adaptive-login__form-group">
                  <label class="tablet-adaptive-login__label">用户名或邮箱</label>
                  <div class="tablet-adaptive-login__input-wrapper">
                    <svg class="tablet-adaptive-login__input-icon" viewBox="0 0 24 24" fill="none">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" />
                      <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" />
                    </svg>
                    <input
                      type="text"
                      placeholder="请输入用户名或邮箱"
                      v-model={form.username}
                      class="tablet-adaptive-login__input"
                    />
                  </div>
                </div>

                <div class="tablet-adaptive-login__form-group">
                  <label class="tablet-adaptive-login__label">密码</label>
                  <div class="tablet-adaptive-login__input-wrapper">
                    <svg class="tablet-adaptive-login__input-icon" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2" />
                      <circle cx="12" cy="16" r="1" fill="currentColor" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2" />
                    </svg>
                    <input
                      type="password"
                      placeholder="请输入密码"
                      v-model={form.password}
                      class="tablet-adaptive-login__input"
                    />
                  </div>
                </div>

                <div class="tablet-adaptive-login__form-options">
                  {props.showRememberMe && (
                    <label class="tablet-adaptive-login__checkbox">
                      <input
                        type="checkbox"
                        v-model={form.remember}
                      />
                      <span class="tablet-adaptive-login__checkbox-mark"></span>
                      记住我
                    </label>
                  )}
                  {props.showForgotPassword && (
                    <a href="#" onClick={handleForgotPassword} class="tablet-adaptive-login__forgot">
                      忘记密码？
                    </a>
                  )}
                </div>

                <button
                  type="submit"
                  class={['tablet-adaptive-login__submit', { 'tablet-adaptive-login__submit--loading': loading.value }]}
                  disabled={loading.value}
                >
                  <span class="tablet-adaptive-login__submit-text">
                    {loading.value ? '登录中...' : '登录'}
                  </span>
                  {loading.value && (
                    <div class="tablet-adaptive-login__submit-spinner"></div>
                  )}
                </button>
              </form>

              {props.showThirdPartyLogin && (
                <div class="tablet-adaptive-login__third-party">
                  <div class="tablet-adaptive-login__divider">
                    <span>或使用以下方式登录</span>
                  </div>
                  <div class="tablet-adaptive-login__third-party-grid">
                    {props.thirdPartyProviders.map((provider) => (
                      <button
                        key={provider}
                        type="button"
                        class={`tablet-adaptive-login__third-party-btn tablet-adaptive-login__third-party-btn--${provider}`}
                        onClick={() => handleThirdPartyLogin(provider)}
                      >
                        <span class={`tablet-adaptive-login__third-party-icon tablet-adaptive-login__third-party-icon--${provider}`}></span>
                        <span class="tablet-adaptive-login__third-party-text">
                          {provider === 'github' && 'GitHub'}
                          {provider === 'google' && 'Google'}
                          {provider === 'wechat' && '微信'}
                          {provider === 'apple' && 'Apple'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div class="tablet-adaptive-login__footer">
                <span>还没有账号？</span>
                <a href="#" onClick={handleRegister}>立即注册</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
})

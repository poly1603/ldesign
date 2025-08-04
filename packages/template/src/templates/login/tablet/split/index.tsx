import { defineComponent, reactive, ref } from 'vue'
import './index.less'

export default defineComponent({
  name: 'TabletSplitLoginTemplate',
  props: {
    title: {
      type: String,
      default: '用户登录',
    },
    subtitle: {
      type: String,
      default: '欢迎使用我们的平台',
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
      default: () => ['github', 'google', 'microsoft', 'apple'],
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
      <div class="tablet-split-login">
        <div class="tablet-split-login__left">
          <div class="tablet-split-login__brand-section">
            <div class="tablet-split-login__brand-content">
              {props.logo && (
                <div class="tablet-split-login__logo">
                  <img src={props.logo} alt="Logo" />
                </div>
              )}
              <h1 class="tablet-split-login__brand-title">{props.title}</h1>
              <p class="tablet-split-login__brand-subtitle">{props.subtitle}</p>

              <div class="tablet-split-login__features">
                <div class="tablet-split-login__feature">
                  <div class="tablet-split-login__feature-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" />
                    </svg>
                  </div>
                  <div class="tablet-split-login__feature-text">
                    <h3>安全可靠</h3>
                    <p>企业级安全保障</p>
                  </div>
                </div>

                <div class="tablet-split-login__feature">
                  <div class="tablet-split-login__feature-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" stroke-width="2" />
                    </svg>
                  </div>
                  <div class="tablet-split-login__feature-text">
                    <h3>高效便捷</h3>
                    <p>快速响应，流畅体验</p>
                  </div>
                </div>

                <div class="tablet-split-login__feature">
                  <div class="tablet-split-login__feature-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" stroke-width="2" />
                    </svg>
                  </div>
                  <div class="tablet-split-login__feature-text">
                    <h3>专业服务</h3>
                    <p>7x24小时技术支持</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="tablet-split-login__decoration">
              <div class="tablet-split-login__circle tablet-split-login__circle--1"></div>
              <div class="tablet-split-login__circle tablet-split-login__circle--2"></div>
              <div class="tablet-split-login__circle tablet-split-login__circle--3"></div>
            </div>
          </div>
        </div>

        <div class="tablet-split-login__right">
          <div class="tablet-split-login__form-section">
            <div class="tablet-split-login__form-header">
              <h2>登录您的账户</h2>
              <p>请输入您的登录凭据</p>
            </div>

            <form class="tablet-split-login__form" onSubmit={(e: Event) => { e.preventDefault(); handleLogin() }}>
              <div class="tablet-split-login__form-group">
                <label class="tablet-split-login__label">用户名或邮箱</label>
                <div class="tablet-split-login__input-wrapper">
                  <svg class="tablet-split-login__input-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="currentColor" stroke-width="2" />
                  </svg>
                  <input
                    type="text"
                    placeholder="请输入用户名或邮箱"
                    v-model={form.username}
                    class="tablet-split-login__input"
                  />
                </div>
              </div>

              <div class="tablet-split-login__form-group">
                <label class="tablet-split-login__label">密码</label>
                <div class="tablet-split-login__input-wrapper">
                  <svg class="tablet-split-login__input-icon" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2" />
                    <circle cx="12" cy="16" r="1" fill="currentColor" />
                    <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" stroke-width="2" />
                  </svg>
                  <input
                    type="password"
                    placeholder="请输入密码"
                    v-model={form.password}
                    class="tablet-split-login__input"
                  />
                </div>
              </div>

              <div class="tablet-split-login__form-options">
                {props.showRememberMe && (
                  <label class="tablet-split-login__checkbox">
                    <input
                      type="checkbox"
                      v-model={form.remember}
                    />
                    <span class="tablet-split-login__checkbox-mark"></span>
                    记住我
                  </label>
                )}
                {props.showForgotPassword && (
                  <a href="#" onClick={handleForgotPassword} class="tablet-split-login__forgot">
                    忘记密码？
                  </a>
                )}
              </div>

              <button
                type="submit"
                class={['tablet-split-login__submit', { 'tablet-split-login__submit--loading': loading.value }]}
                disabled={loading.value}
              >
                <span class="tablet-split-login__submit-text">
                  {loading.value ? '登录中...' : '登录'}
                </span>
                {loading.value && (
                  <div class="tablet-split-login__submit-spinner"></div>
                )}
              </button>
            </form>

            {props.showThirdPartyLogin && (
              <div class="tablet-split-login__third-party">
                <div class="tablet-split-login__divider">
                  <span>或使用以下方式登录</span>
                </div>
                <div class="tablet-split-login__third-party-grid">
                  {props.thirdPartyProviders.map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      class={`tablet-split-login__third-party-btn tablet-split-login__third-party-btn--${provider}`}
                      onClick={() => handleThirdPartyLogin(provider)}
                    >
                      <span class={`tablet-split-login__third-party-icon tablet-split-login__third-party-icon--${provider}`}></span>
                      <span class="tablet-split-login__third-party-text">
                        {provider === 'github' && 'GitHub'}
                        {provider === 'google' && 'Google'}
                        {provider === 'microsoft' && 'Microsoft'}
                        {provider === 'apple' && 'Apple'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div class="tablet-split-login__footer">
              <span>还没有账号？</span>
              <a href="#" onClick={handleRegister}>立即注册</a>
            </div>
          </div>
        </div>
      </div>
    )
  },
})

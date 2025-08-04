import { defineComponent, reactive, ref } from 'vue'
import './index.less'

export default defineComponent({
  name: 'ClassicLoginTemplate',
  props: {
    title: {
      type: String,
      default: '用户登录',
    },
    subtitle: {
      type: String,
      default: '欢迎回来',
    },
    logo: {
      type: String,
      default: '',
    },
    backgroundImage: {
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
        alert('请输入用户名和密码')
        return
      }

      loading.value = true
      try {
        // 模拟登录请求
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
      <div class="classic-login">
        <div class="classic-login__background">
          <img src={props.backgroundImage} alt="Background" />
        </div>

        <div class="classic-login__container">
          <div class="classic-login__left">
            <div class="classic-login__brand">
              <img src={props.logo} alt="Logo" class="classic-login__logo" />
              <h1 class="classic-login__title">{props.title}</h1>
            </div>
            <div class="classic-login__illustration">
              <div class="classic-login__browser">
                <div class="classic-login__browser-header">
                  <div class="classic-login__browser-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                <div class="classic-login__browser-content">
                  <div class="classic-login__chart">
                    <div class="classic-login__chart-bar" style="height: 60%"></div>
                    <div class="classic-login__chart-bar" style="height: 80%"></div>
                    <div class="classic-login__chart-bar" style="height: 40%"></div>
                    <div class="classic-login__chart-bar" style="height: 90%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="classic-login__right">
            <div class="classic-login__form-container">
              <div class="classic-login__form-header">
                <h2>{props.subtitle}</h2>
                <p>短账乐</p>
              </div>

              <form class="classic-login__form" onSubmit={(e: Event) => { e.preventDefault(); handleLogin() }}>
                <div class="classic-login__form-group">
                  <div class="classic-login__input-wrapper">
                    <span class="classic-login__input-icon">👤</span>
                    <input
                      type="text"
                      placeholder="短账乐"
                      v-model={form.username}
                      class="classic-login__input"
                    />
                  </div>
                </div>

                <div class="classic-login__form-group">
                  <div class="classic-login__input-wrapper">
                    <span class="classic-login__input-icon">🔒</span>
                    <input
                      type="password"
                      placeholder="•"
                      v-model={form.password}
                      class="classic-login__input"
                    />
                    <span class="classic-login__input-toggle">👁️</span>
                  </div>
                </div>

                <div class="classic-login__form-group classic-login__form-options">
                  {props.showRememberMe && (
                    <label class="classic-login__checkbox">
                      <input
                        type="checkbox"
                        v-model={form.remember}
                      />
                      <span class="classic-login__checkbox-mark"></span>
                      记住密码
                    </label>
                  )}
                  {props.showForgotPassword && (
                    <a href="#" onClick={handleForgotPassword} class="classic-login__forgot">
                      忘记密码？
                    </a>
                  )}
                </div>

                <button
                  type="submit"
                  class={['classic-login__submit', { 'classic-login__submit--loading': loading.value }]}
                  disabled={loading.value}
                >
                  {loading.value ? '登录中...' : '登录'}
                </button>
              </form>

              {props.showThirdPartyLogin && (
                <div class="classic-login__third-party">
                  <div class="classic-login__divider">
                    <span>或</span>
                  </div>
                  <div class="classic-login__third-party-buttons">
                    {props.thirdPartyProviders.map((provider) => (
                      <button
                        key={provider}
                        type="button"
                        class={`classic-login__third-party-btn classic-login__third-party-btn--${provider}`}
                        onClick={() => handleThirdPartyLogin(provider)}
                      >
                        <span class={`classic-login__third-party-icon classic-login__third-party-icon--${provider}`}></span>
                        {provider === 'github' && 'GitHub'}
                        {provider === 'google' && 'Google'}
                        {provider === 'wechat' && '微信'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div class="classic-login__footer">
                <span>没有账号？</span>
                <a href="#" onClick={handleRegister}>立即注册</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
})

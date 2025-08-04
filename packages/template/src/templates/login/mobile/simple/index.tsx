import { defineComponent, reactive, ref } from 'vue'
import './index.less'

export default defineComponent({
  name: 'MobileSimpleLoginTemplate',
  props: {
    title: {
      type: String,
      default: '登录',
    },
    subtitle: {
      type: String,
      default: '欢迎回来',
    },
    logo: {
      type: String,
      default: '',
    },
    showRememberMe: {
      type: Boolean,
      default: false,
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
      default: () => ['wechat', 'qq', 'weibo'],
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
      <div class="mobile-simple-login">
        <div class="mobile-simple-login__header">
          {props.logo && (
            <div class="mobile-simple-login__logo">
              <img src={props.logo} alt="Logo" />
            </div>
          )}
          <h1 class="mobile-simple-login__title">{props.title}</h1>
          <p class="mobile-simple-login__subtitle">{props.subtitle}</p>
        </div>

        <div class="mobile-simple-login__content">
          <form class="mobile-simple-login__form" onSubmit={(e: Event) => { e.preventDefault(); handleLogin() }}>
            <div class="mobile-simple-login__form-group">
              <input
                type="text"
                placeholder="手机号/邮箱"
                v-model={form.username}
                class="mobile-simple-login__input"
              />
            </div>

            <div class="mobile-simple-login__form-group">
              <input
                type="password"
                placeholder="密码"
                v-model={form.password}
                class="mobile-simple-login__input"
              />
            </div>

            <div class="mobile-simple-login__form-options">
              {props.showRememberMe && (
                <label class="mobile-simple-login__checkbox">
                  <input
                    type="checkbox"
                    v-model={form.remember}
                  />
                  <span class="mobile-simple-login__checkbox-mark"></span>
                  记住密码
                </label>
              )}
              {props.showForgotPassword && (
                <a href="#" onClick={handleForgotPassword} class="mobile-simple-login__forgot">
                  忘记密码？
                </a>
              )}
            </div>

            <button
              type="submit"
              class={['mobile-simple-login__submit', { 'mobile-simple-login__submit--loading': loading.value }]}
              disabled={loading.value}
            >
              {loading.value ? '登录中...' : '登录'}
            </button>
          </form>

          {props.showThirdPartyLogin && (
            <div class="mobile-simple-login__third-party">
              <div class="mobile-simple-login__divider">
                <span>其他登录方式</span>
              </div>
              <div class="mobile-simple-login__third-party-buttons">
                {props.thirdPartyProviders.map((provider) => (
                  <button
                    key={provider}
                    type="button"
                    class={`mobile-simple-login__third-party-btn mobile-simple-login__third-party-btn--${provider}`}
                    onClick={() => handleThirdPartyLogin(provider)}
                  >
                    <span class={`mobile-simple-login__third-party-icon mobile-simple-login__third-party-icon--${provider}`}></span>
                    <span class="mobile-simple-login__third-party-text">
                      {provider === 'wechat' && '微信'}
                      {provider === 'qq' && 'QQ'}
                      {provider === 'weibo' && '微博'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div class="mobile-simple-login__footer">
            <span>还没有账号？</span>
            <a href="#" onClick={handleRegister}>立即注册</a>
          </div>
        </div>
      </div>
    )
  },
})

import { defineComponent, reactive, ref } from 'vue'
import './index.less'

export default defineComponent({
  name: 'MobileCardLoginTemplate',
  props: {
    title: {
      type: String,
      default: '登录账户',
    },
    subtitle: {
      type: String,
      default: '请输入您的登录信息',
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
      default: () => ['wechat', 'alipay', 'qq'],
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
      <div class="mobile-card-login">
        <div class="mobile-card-login__background">
          <div class="mobile-card-login__wave mobile-card-login__wave--1"></div>
          <div class="mobile-card-login__wave mobile-card-login__wave--2"></div>
          <div class="mobile-card-login__wave mobile-card-login__wave--3"></div>
        </div>

        <div class="mobile-card-login__container">
          <div class="mobile-card-login__header-card">
            {props.logo && (
              <div class="mobile-card-login__logo">
                <img src={props.logo} alt="Logo" />
              </div>
            )}
            <h1 class="mobile-card-login__title">{props.title}</h1>
            <p class="mobile-card-login__subtitle">{props.subtitle}</p>
          </div>

          <div class="mobile-card-login__form-card">
            <form class="mobile-card-login__form" onSubmit={(e: Event) => { e.preventDefault(); handleLogin() }}>
              <div class="mobile-card-login__form-group">
                <label class="mobile-card-login__label">用户名</label>
                <input
                  type="text"
                  placeholder="请输入手机号或邮箱"
                  v-model={form.username}
                  class="mobile-card-login__input"
                />
              </div>

              <div class="mobile-card-login__form-group">
                <label class="mobile-card-login__label">密码</label>
                <input
                  type="password"
                  placeholder="请输入密码"
                  v-model={form.password}
                  class="mobile-card-login__input"
                />
              </div>

              <div class="mobile-card-login__form-options">
                {props.showRememberMe && (
                  <label class="mobile-card-login__checkbox">
                    <input
                      type="checkbox"
                      v-model={form.remember}
                    />
                    <span class="mobile-card-login__checkbox-mark"></span>
                    记住密码
                  </label>
                )}
                {props.showForgotPassword && (
                  <a href="#" onClick={handleForgotPassword} class="mobile-card-login__forgot">
                    忘记密码？
                  </a>
                )}
              </div>

              <button
                type="submit"
                class={['mobile-card-login__submit', { 'mobile-card-login__submit--loading': loading.value }]}
                disabled={loading.value}
              >
                {loading.value ? '登录中...' : '立即登录'}
              </button>
            </form>
          </div>

          {props.showThirdPartyLogin && (
            <div class="mobile-card-login__third-party-card">
              <div class="mobile-card-login__divider">
                <span>快捷登录</span>
              </div>
              <div class="mobile-card-login__third-party-grid">
                {props.thirdPartyProviders.map((provider) => (
                  <button
                    key={provider}
                    type="button"
                    class={`mobile-card-login__third-party-item mobile-card-login__third-party-item--${provider}`}
                    onClick={() => handleThirdPartyLogin(provider)}
                  >
                    <div class={`mobile-card-login__third-party-icon mobile-card-login__third-party-icon--${provider}`}></div>
                    <span class="mobile-card-login__third-party-text">
                      {provider === 'wechat' && '微信'}
                      {provider === 'alipay' && '支付宝'}
                      {provider === 'qq' && 'QQ'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div class="mobile-card-login__footer-card">
            <span>还没有账号？</span>
            <a href="#" onClick={handleRegister}>免费注册</a>
          </div>
        </div>
      </div>
    )
  },
})

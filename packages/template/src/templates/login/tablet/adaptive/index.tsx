import { defineComponent } from 'vue'
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
    // 新增：LoginPanel 组件实例
    loginPanel: {
      type: Object,
      default: null,
    },
    // 新增：模板选择器组件
    templateSelector: {
      type: Object,
      default: null,
    },
  },
  emits: ['login', 'register', 'forgotPassword', 'thirdPartyLogin', 'template-change'],
  setup(props: any, { emit }: any) {
    // 处理登录（来自 LoginPanel 组件）
    const handleLogin = (loginData: any) => {
      emit('login', loginData)
    }

    // 处理忘记密码
    const handleForgotPassword = (data?: any) => {
      emit('forgotPassword', data)
    }

    // 处理第三方登录
    const handleThirdPartyLogin = (data: any) => {
      emit('thirdPartyLogin', data)
    }

    // 处理注册
    const handleRegister = () => {
      emit('register')
    }

    return () => (
      <div class="tablet-adaptive-login">
        {/* 使用传递进来的模板选择器 */}
        {props.templateSelector && <div class="tablet-adaptive-login__selector">{props.templateSelector}</div>}

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
            {/* 使用传递进来的 LoginPanel 组件，如果没有则显示默认内容 */}
            <div class="login-panel-wrapper">
              {props.loginPanel ? (
                <props.loginPanel
                  title={props.title}
                  subtitle={props.subtitle}
                  showRememberMe={props.showRememberMe}
                  showForgotPassword={props.showForgotPassword}
                  showThirdPartyLogin={props.showThirdPartyLogin}
                  thirdPartyProviders={props.thirdPartyProviders}
                  isLoading={props.isLoading}
                  error={props.error}
                  onLogin={handleLogin}
                  onRegister={handleRegister}
                  onForgotPassword={handleForgotPassword}
                  onThirdPartyLogin={handleThirdPartyLogin}
                />
              ) : (
                <div class="tablet-adaptive-login__default-panel">
                  <div class="tablet-adaptive-login__header">
                    <h1 class="tablet-adaptive-login__title">{props.title}</h1>
                    <p class="tablet-adaptive-login__subtitle">{props.subtitle}</p>
                  </div>

                  <div class="tablet-adaptive-login__form">
                    <div class="tablet-adaptive-login__field">
                      <input type="text" placeholder="用户名" class="tablet-adaptive-login__input" />
                    </div>
                    <div class="tablet-adaptive-login__field">
                      <input type="password" placeholder="密码" class="tablet-adaptive-login__input" />
                    </div>

                    {props.showRememberMe && (
                      <div class="tablet-adaptive-login__options">
                        <label class="tablet-adaptive-login__checkbox">
                          <input type="checkbox" />
                          <span>记住密码</span>
                        </label>
                        {props.showForgotPassword && (
                          <a href="#" class="tablet-adaptive-login__forgot">
                            忘记密码？
                          </a>
                        )}
                      </div>
                    )}

                    <button class="tablet-adaptive-login__submit">登录</button>

                    {props.showThirdPartyLogin && (
                      <div class="tablet-adaptive-login__third-party">
                        <div class="tablet-adaptive-login__divider">
                          <span>或</span>
                        </div>
                        <div class="tablet-adaptive-login__providers">
                          {props.thirdPartyProviders.map((provider: string) => (
                            <button
                              key={provider}
                              class={`tablet-adaptive-login__provider tablet-adaptive-login__provider--${provider}`}
                            >
                              {provider === 'github' && '🐙'}
                              {provider === 'google' && '🔍'}
                              {provider === 'wechat' && '💬'}
                              {provider === 'apple' && '🍎'}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  },
})

import { defineComponent } from 'vue'
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
      <div class="classic-login">
        {/* 使用传递进来的模板选择器 */}
        {props.templateSelector && <div class="classic-login__selector">{props.templateSelector}</div>}

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
            {/* 使用传递进来的 LoginPanel 组件，如果没有则显示默认内容 */}
            <div class="login-panel-wrapper">
              {props.loginPanel ? (
                <props.loginPanel
                  onLogin={handleLogin}
                  onForgotPassword={handleForgotPassword}
                  onThirdPartyLogin={handleThirdPartyLogin}
                />
              ) : (
                <div class="classic-login__default-panel">
                  <div class="classic-login__header">
                    <h1 class="classic-login__title">{props.title}</h1>
                    <p class="classic-login__subtitle">{props.subtitle}</p>
                  </div>

                  <div class="classic-login__form">
                    <div class="classic-login__field">
                      <input type="text" placeholder="用户名" class="classic-login__input" />
                    </div>
                    <div class="classic-login__field">
                      <input type="password" placeholder="密码" class="classic-login__input" />
                    </div>

                    {props.showRememberMe && (
                      <div class="classic-login__options">
                        <label class="classic-login__checkbox">
                          <input type="checkbox" />
                          <span>记住密码</span>
                        </label>
                        {props.showForgotPassword && (
                          <a href="#" class="classic-login__forgot">
                            忘记密码？
                          </a>
                        )}
                      </div>
                    )}

                    <button class="classic-login__submit">登录</button>

                    {props.showThirdPartyLogin && (
                      <div class="classic-login__third-party">
                        <div class="classic-login__divider">
                          <span>或</span>
                        </div>
                        <div class="classic-login__providers">
                          {props.thirdPartyProviders.map((provider: string) => (
                            <button
                              key={provider}
                              class={`classic-login__provider classic-login__provider--${provider}`}
                            >
                              {provider === 'github' && '🐙'}
                              {provider === 'google' && '🔍'}
                              {provider === 'wechat' && '💬'}
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

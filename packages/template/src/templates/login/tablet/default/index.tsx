import { defineComponent } from 'vue'
import './index.less'

export default defineComponent({
  name: 'TabletDefaultLoginTemplate',
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
      default: () => ['wechat', 'qq', 'weibo'],
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
      <div class="tablet-default-login">
        {/* 使用传递进来的模板选择器 */}
        {props.templateSelector && <div class="tablet-default-login__selector">{props.templateSelector}</div>}

        <div class="tablet-default-login__container">
          <div class="tablet-default-login__content">
            <div class="tablet-default-login__header">
              {props.logo && (
                <div class="tablet-default-login__logo">
                  <img src={props.logo} alt="Logo" />
                </div>
              )}
              <h1 class="tablet-default-login__title">{props.title}</h1>
              <p class="tablet-default-login__subtitle">{props.subtitle}</p>
            </div>

            {/* 使用传递进来的 LoginPanel 组件，如果没有则显示默认内容 */}
            <div class="tablet-default-login__panel">
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
                <div class="tablet-default-login__default-panel">
                  <div class="tablet-default-login__form">
                    <div class="tablet-default-login__field">
                      <input type="text" placeholder="用户名" class="tablet-default-login__input" />
                    </div>
                    <div class="tablet-default-login__field">
                      <input type="password" placeholder="密码" class="tablet-default-login__input" />
                    </div>

                    {props.showRememberMe && (
                      <div class="tablet-default-login__options">
                        <label class="tablet-default-login__checkbox">
                          <input type="checkbox" />
                          <span>记住密码</span>
                        </label>
                        {props.showForgotPassword && (
                          <a href="#" class="tablet-default-login__forgot">
                            忘记密码？
                          </a>
                        )}
                      </div>
                    )}

                    <button class="tablet-default-login__submit">登录</button>

                    {props.showThirdPartyLogin && (
                      <div class="tablet-default-login__third-party">
                        <div class="tablet-default-login__divider">
                          <span>其他登录方式</span>
                        </div>
                        <div class="tablet-default-login__providers">
                          {props.thirdPartyProviders.map((provider: string) => (
                            <button
                              key={provider}
                              class={`tablet-default-login__provider tablet-default-login__provider--${provider}`}
                            >
                              {provider === 'wechat' && '💬'}
                              {provider === 'qq' && '🐧'}
                              {provider === 'weibo' && '📱'}
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

import { defineComponent } from 'vue'
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
      <div class="mobile-simple-login">
        {/* 使用传递进来的模板选择器 */}
        {props.templateSelector && <div class="mobile-simple-login__selector">{props.templateSelector}</div>}

        <div class="mobile-simple-login__container">
          <div class="mobile-simple-login__header">
            {props.logo && (
              <div class="mobile-simple-login__logo">
                <img src={props.logo} alt="Logo" />
              </div>
            )}
            <h1 class="mobile-simple-login__title">{props.title}</h1>
            <p class="mobile-simple-login__subtitle">{props.subtitle}</p>
          </div>

          {/* 使用传递进来的 LoginPanel 组件，如果没有则显示默认内容 */}
          <div class="mobile-simple-login__panel">
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
              <div class="mobile-simple-login__default-panel">
                <div class="mobile-simple-login__form">
                  <div class="mobile-simple-login__field">
                    <input type="text" placeholder="手机号" class="mobile-simple-login__input" />
                  </div>
                  <div class="mobile-simple-login__field">
                    <input type="password" placeholder="密码" class="mobile-simple-login__input" />
                  </div>

                  <button class="mobile-simple-login__submit">登录</button>

                  {props.showForgotPassword && (
                    <div class="mobile-simple-login__options">
                      <a href="#" class="mobile-simple-login__forgot">
                        忘记密码？
                      </a>
                    </div>
                  )}

                  {props.showThirdPartyLogin && (
                    <div class="mobile-simple-login__third-party">
                      <div class="mobile-simple-login__divider">
                        <span>快速登录</span>
                      </div>
                      <div class="mobile-simple-login__providers">
                        {props.thirdPartyProviders.map((provider: string) => (
                          <button
                            key={provider}
                            class={`mobile-simple-login__provider mobile-simple-login__provider--${provider}`}
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
    )
  },
})

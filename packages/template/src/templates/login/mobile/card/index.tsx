import { defineComponent } from 'vue'
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
      <div class="mobile-card-login">
        {/* 使用传递进来的模板选择器 */}
        {props.templateSelector && <div class="mobile-card-login__selector">{props.templateSelector}</div>}

        <div class="mobile-card-login__background">
          <div class="mobile-card-login__wave mobile-card-login__wave--1"></div>
          <div class="mobile-card-login__wave mobile-card-login__wave--2"></div>
          <div class="mobile-card-login__wave mobile-card-login__wave--3"></div>
        </div>

        <div class="mobile-card-login__container">
          {/* 使用传递进来的 LoginPanel 组件，如果没有则显示默认内容 */}
          <div class="mobile-card-login__panel">
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
              <div class="mobile-card-login__default-panel">
                <div class="mobile-card-login__header">
                  {props.logo && (
                    <div class="mobile-card-login__logo">
                      <img src={props.logo} alt="Logo" />
                    </div>
                  )}
                  <h1 class="mobile-card-login__title">{props.title}</h1>
                  <p class="mobile-card-login__subtitle">{props.subtitle}</p>
                </div>

                <div class="mobile-card-login__form">
                  <div class="mobile-card-login__field">
                    <input type="text" placeholder="手机号" class="mobile-card-login__input" />
                  </div>
                  <div class="mobile-card-login__field">
                    <input type="password" placeholder="密码" class="mobile-card-login__input" />
                  </div>

                  {props.showRememberMe && (
                    <div class="mobile-card-login__options">
                      <label class="mobile-card-login__checkbox">
                        <input type="checkbox" />
                        <span>记住密码</span>
                      </label>
                      {props.showForgotPassword && (
                        <a href="#" class="mobile-card-login__forgot">
                          忘记密码？
                        </a>
                      )}
                    </div>
                  )}

                  <button class="mobile-card-login__submit">登录</button>

                  {props.showThirdPartyLogin && (
                    <div class="mobile-card-login__third-party">
                      <div class="mobile-card-login__divider">
                        <span>快捷登录</span>
                      </div>
                      <div class="mobile-card-login__providers">
                        {props.thirdPartyProviders.map((provider: string) => (
                          <button
                            key={provider}
                            class={`mobile-card-login__provider mobile-card-login__provider--${provider}`}
                          >
                            {provider === 'wechat' && '💬'}
                            {provider === 'alipay' && '💰'}
                            {provider === 'qq' && '🐧'}
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

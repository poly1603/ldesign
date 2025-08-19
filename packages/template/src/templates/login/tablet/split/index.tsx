import { defineComponent } from 'vue'
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
      <div class="tablet-split-login">
        {/* 使用传递进来的模板选择器 */}
        {props.templateSelector && <div class="tablet-split-login__selector">{props.templateSelector}</div>}

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
                      <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        stroke="currentColor"
                        stroke-width="2"
                      />
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
              <div class="tablet-split-login__default-panel">
                <div class="tablet-split-login__header">
                  <h1 class="tablet-split-login__title">{props.title}</h1>
                  <p class="tablet-split-login__subtitle">{props.subtitle}</p>
                </div>

                <div class="tablet-split-login__form">
                  <div class="tablet-split-login__field">
                    <input type="text" placeholder="用户名" class="tablet-split-login__input" />
                  </div>
                  <div class="tablet-split-login__field">
                    <input type="password" placeholder="密码" class="tablet-split-login__input" />
                  </div>

                  {props.showRememberMe && (
                    <div class="tablet-split-login__options">
                      <label class="tablet-split-login__checkbox">
                        <input type="checkbox" />
                        <span>记住密码</span>
                      </label>
                      {props.showForgotPassword && (
                        <a href="#" class="tablet-split-login__forgot">
                          忘记密码？
                        </a>
                      )}
                    </div>
                  )}

                  <button class="tablet-split-login__submit">登录</button>

                  {props.showThirdPartyLogin && (
                    <div class="tablet-split-login__third-party">
                      <div class="tablet-split-login__divider">
                        <span>或</span>
                      </div>
                      <div class="tablet-split-login__providers">
                        {props.thirdPartyProviders.map((provider: string) => (
                          <button
                            key={provider}
                            class={`tablet-split-login__provider tablet-split-login__provider--${provider}`}
                          >
                            {provider === 'github' && '🐙'}
                            {provider === 'google' && '🔍'}
                            {provider === 'microsoft' && '🪟'}
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
    )
  },
})

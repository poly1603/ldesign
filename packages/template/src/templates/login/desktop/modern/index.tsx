import { defineComponent } from 'vue'
import './index.less'

export default defineComponent({
  name: 'ModernLoginTemplate',
  props: {
    title: {
      type: String,
      default: '欢迎登录',
    },
    subtitle: {
      type: String,
      default: '开始您的数字化之旅',
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
  setup(props: any) {
    return () => (
      <div class="modern-login">
        {/* 使用传递进来的模板选择器 */}
        {props.templateSelector && <div class="modern-login__selector">{props.templateSelector}</div>}

        <div class="modern-login__background">
          <div class="modern-login__particles">
            {Array.from({ length: 50 }).map((_, i) => (
              <div key={i} class="modern-login__particle"></div>
            ))}
          </div>
        </div>

        <div class="modern-login__container">
          <div class="modern-login__card">
            {/* 使用传递进来的 LoginPanel 组件，如果没有则显示默认内容 */}
            <div class="login-panel-wrapper">
              {props.loginPanel || (
                <div class="modern-login__default-panel">
                  <div class="modern-login__header">
                    {props.logo && (
                      <div class="modern-login__logo">
                        <img src={props.logo} alt="Logo" />
                      </div>
                    )}
                    <h1 class="modern-login__title">{props.title}</h1>
                    <p class="modern-login__subtitle">{props.subtitle}</p>
                  </div>

                  <div class="modern-login__form">
                    <div class="modern-login__field">
                      <input type="text" placeholder="用户名" class="modern-login__input" />
                    </div>
                    <div class="modern-login__field">
                      <input type="password" placeholder="密码" class="modern-login__input" />
                    </div>

                    {props.showRememberMe && (
                      <div class="modern-login__options">
                        <label class="modern-login__checkbox">
                          <input type="checkbox" />
                          <span>记住密码</span>
                        </label>
                        {props.showForgotPassword && (
                          <a href="#" class="modern-login__forgot">
                            忘记密码？
                          </a>
                        )}
                      </div>
                    )}

                    <button class="modern-login__submit">登录</button>

                    {props.showThirdPartyLogin && (
                      <div class="modern-login__third-party">
                        <div class="modern-login__divider">
                          <span>或</span>
                        </div>
                        <div class="modern-login__providers">
                          {props.thirdPartyProviders.map((provider: string) => (
                            <button key={provider} class={`modern-login__provider modern-login__provider--${provider}`}>
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

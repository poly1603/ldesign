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
  setup(props) {
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
          {/* 使用传递进来的 LoginPanel 组件 */}
          <div class="login-panel-wrapper">{props.loginPanel}</div>
        </div>
      </div>
    )
  },
})

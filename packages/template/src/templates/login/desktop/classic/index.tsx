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
  setup(props) {
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
            {/* 使用传递进来的 LoginPanel 组件 */}
            <div class="login-panel-wrapper">{props.loginPanel}</div>
          </div>
        </div>
      </div>
    )
  },
})

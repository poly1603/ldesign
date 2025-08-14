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
  setup(props) {
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
            {/* 使用传递进来的 LoginPanel 组件 */}
            <div class="login-panel-wrapper">{props.loginPanel}</div>
          </div>
        </div>
      </div>
    )
  },
})

import { defineComponent } from 'vue'
import './index.less'

export default defineComponent({
  name: 'MobileDefaultLoginTemplate',
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
  setup(props) {
    return () => (
      <div class="mobile-default-login">
        {/* 使用传递进来的模板选择器 */}
        {props.templateSelector && <div class="mobile-default-login__selector">{props.templateSelector}</div>}

        <div class="mobile-default-login__container">
          <div class="mobile-default-login__header">
            {props.logo && (
              <div class="mobile-default-login__logo">
                <img src={props.logo} alt="Logo" />
              </div>
            )}
            <h1 class="mobile-default-login__title">{props.title}</h1>
            <p class="mobile-default-login__subtitle">{props.subtitle}</p>
          </div>

          {/* 使用传递进来的 LoginPanel 组件 */}
          <div class="mobile-default-login__panel">{props.loginPanel}</div>
        </div>
      </div>
    )
  },
})

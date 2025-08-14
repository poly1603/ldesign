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
  setup(props) {
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
          {/* 使用传递进来的 LoginPanel 组件 */}
          <div class="mobile-card-login__panel">{props.loginPanel}</div>
        </div>
      </div>
    )
  },
})

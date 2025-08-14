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
  setup(props) {
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
            {/* 使用传递进来的 LoginPanel 组件 */}
            <div class="login-panel-wrapper">{props.loginPanel}</div>
          </div>
        </div>
      </div>
    )
  },
})

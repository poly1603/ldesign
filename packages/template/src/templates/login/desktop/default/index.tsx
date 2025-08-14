import { defineComponent } from 'vue'
import './index.less'

export default defineComponent({
  name: 'DefaultLoginTemplate',
  props: {
    title: {
      type: String,
      default: '登录',
    },
    subtitle: {
      type: String,
      default: '请输入您的账号信息',
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
  emits: ['login', 'register', 'forgotPassword', 'template-change'],
  setup(props: any) {
    return () => (
      <div class="default-login">
        {/* 使用传递进来的模板选择器 */}
        {props.templateSelector && <div class="default-login__selector">{props.templateSelector}</div>}

        <div class="default-login__container">
          <div class="default-login__header">
            {props.logo && (
              <div class="default-login__logo">
                <img src={props.logo} alt="Logo" />
              </div>
            )}
            <h1 class="default-login__title">{props.title}</h1>
            <p class="default-login__subtitle">{props.subtitle}</p>
          </div>

          {/* 使用传递进来的 LoginPanel 组件 */}
          <div class="default-login__panel">{props.loginPanel}</div>
        </div>
      </div>
    )
  },
})

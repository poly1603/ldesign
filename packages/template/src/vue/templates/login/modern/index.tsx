import { defineComponent, ref } from 'vue'
import './styles.less'

export interface ModernLoginTemplateProps {
  title?: string
  subtitle?: string
  logo?: string
  showRememberMe?: boolean
  showForgotPassword?: boolean
  showRegisterLink?: boolean
  allowThirdPartyLogin?: boolean
  loading?: boolean
  loginPanel?: any // LoginPanel 组件实例
}

export const ModernLoginTemplate = defineComponent({
  name: 'ModernLoginTemplate',
  props: {
    title: {
      type: String,
      default: 'LDesign 登录',
    },
    subtitle: {
      type: String,
      default: '欢迎回来',
    },
    logo: {
      type: String,
      default: '/logo.png',
    },
    showRememberMe: {
      type: Boolean,
      default: true,
    },
    showForgotPassword: {
      type: Boolean,
      default: true,
    },
    showRegisterLink: {
      type: Boolean,
      default: true,
    },
    allowThirdPartyLogin: {
      type: Boolean,
      default: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    loginPanel: {
      type: Object,
      default: null,
    },
  },
  emits: ['login', 'register', 'forgot-password', 'third-party-login', 'template-change'],
  setup(props, { emit }) {
    // 当前选中的模板
    const currentTemplate = ref('modern')

    // 可用的模板列表
    const availableTemplates = [
      { id: 'classic', name: '经典模板', description: '简洁优雅的经典登录界面' },
      { id: 'modern', name: '现代模板', description: '现代化的登录界面设计' },
    ]

    // 模板切换处理
    const handleTemplateChange = (templateId: string) => {
      currentTemplate.value = templateId
      emit('template-change', templateId)
    }

    return () => (
      <div class="modern-login-template">
        {/* 背景装饰 */}
        <div class="background-decoration">
          <div class="decoration-circle circle-1"></div>
          <div class="decoration-circle circle-2"></div>
          <div class="decoration-circle circle-3"></div>
        </div>

        {/* 模板切换器 */}
        <div class="template-selector">
          <div class="template-selector__header">
            <span class="template-selector__title">选择模板</span>
          </div>
          <div class="template-selector__options">
            {availableTemplates.map(template => (
              <button
                key={template.id}
                class={[
                  'template-selector__option',
                  currentTemplate.value === template.id && 'template-selector__option--active',
                ]}
                onClick={() => handleTemplateChange(template.id)}
              >
                <div class="template-selector__option-name">{template.name}</div>
                <div class="template-selector__option-desc">{template.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 登录容器 */}
        <div class="login-container">
          <div class="login-card">
            {/* 如果有传递 LoginPanel 组件，则使用它 */}
            {props.loginPanel ? (
              <div class="login-panel-wrapper">{props.loginPanel}</div>
            ) : (
              /* 否则显示默认的简单登录表单 */
              <div class="fallback-login">
                <div class="login-header">
                  {props.logo && (
                    <div class="logo-container">
                      <img src={props.logo} alt="Logo" class="login-logo" />
                    </div>
                  )}
                  <h1 class="login-title">{props.title}</h1>
                  {props.subtitle && <p class="login-subtitle">{props.subtitle}</p>}
                </div>

                <div class="login-form">
                  <div class="form-group">
                    <input type="text" class="form-input" placeholder="用户名或邮箱" />
                  </div>

                  <div class="form-group">
                    <input type="password" class="form-input" placeholder="密码" />
                  </div>

                  <button
                    type="button"
                    class="login-button"
                    onClick={() => emit('login', { username: 'demo', password: 'demo' })}
                  >
                    登录
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  },
})

export default ModernLoginTemplate

import { defineComponent, ref } from 'vue'
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
  },
  emits: ['login', 'register', 'forgotPassword', 'thirdPartyLogin', 'template-change'],
  setup(props, { emit }) {
    // 当前选中的模板
    const currentTemplate = ref('classic')

    // 可用的模板列表
    const availableTemplates = [
      { id: 'classic', name: '经典模板', description: '简洁优雅的经典登录界面' },
      { id: 'default', name: '默认模板', description: '标准的登录界面设计' },
      { id: 'modern', name: '现代模板', description: '现代化的登录界面设计' },
    ]

    // 模板切换处理
    const handleTemplateChange = (templateId: string) => {
      currentTemplate.value = templateId
      emit('template-change', templateId)
    }

    return () => (
      <div class="classic-login">
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

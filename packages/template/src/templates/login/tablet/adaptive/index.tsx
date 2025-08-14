import { defineComponent, ref } from 'vue'
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
  },
  emits: ['login', 'register', 'forgotPassword', 'thirdPartyLogin', 'template-change'],
  setup(props, { emit }) {
    // 当前选中的模板
    const currentTemplate = ref('adaptive')

    // 可用的模板列表
    const availableTemplates = [
      { id: 'adaptive', name: '自适应模板', description: '平板端自适应登录界面' },
      { id: 'split', name: '分屏模板', description: '平板端分屏登录界面' },
    ]

    // 模板切换处理
    const handleTemplateChange = (templateId: string) => {
      currentTemplate.value = templateId
      emit('template-change', templateId)
    }

    return () => (
      <div class="tablet-adaptive-login">
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

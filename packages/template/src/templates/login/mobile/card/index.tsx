import { defineComponent, ref } from 'vue'
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
  },
  emits: ['login', 'register', 'forgotPassword', 'thirdPartyLogin', 'template-change'],
  setup(props, { emit }) {
    // 当前选中的模板
    const currentTemplate = ref('card')

    // 可用的模板列表
    const availableTemplates = [
      { id: 'card', name: '卡片模板', description: '移动端卡片式登录界面' },
      { id: 'simple', name: '简洁模板', description: '移动端简洁登录界面' },
    ]

    // 模板切换处理
    const handleTemplateChange = (templateId: string) => {
      currentTemplate.value = templateId
      emit('template-change', templateId)
    }

    return () => (
      <div class="mobile-card-login">
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

        <div class="mobile-card-login__background">
          <div class="mobile-card-login__wave mobile-card-login__wave--1"></div>
          <div class="mobile-card-login__wave mobile-card-login__wave--2"></div>
          <div class="mobile-card-login__wave mobile-card-login__wave--3"></div>
        </div>

        <div class="mobile-card-login__container">
          {/* 使用传递进来的 LoginPanel 组件 */}
          <div class="login-panel-wrapper">{props.loginPanel}</div>
        </div>
      </div>
    )
  },
})

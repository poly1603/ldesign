import { defineComponent, ref } from 'vue'
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
  },
  emits: ['login', 'register', 'forgotPassword', 'template-change'],
  setup(props: any, { emit }: any) {
    // 当前选中的模板
    const currentTemplate = ref('default')

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
      <div class="default-login">
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

        <div class="default-login__container">
          {/* 使用传递进来的 LoginPanel 组件 */}
          <div class="login-panel-wrapper">{props.loginPanel}</div>
        </div>
      </div>
    )
  },
})

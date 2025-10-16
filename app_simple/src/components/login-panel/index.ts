// 导出主组件
export { default as LoginPanel } from './LoginPanel.vue'
export { default as LoginPanelV2 } from './LoginPanelV2.vue'

// 导出子组件
export { default as BaseInput } from './components/BaseInput.vue'
export { default as ImageCaptcha } from './components/ImageCaptcha.vue'
export { default as SmsCaptcha } from './components/SmsCaptcha.vue'
export { default as RememberCheckbox } from './components/RememberCheckbox.vue'
export { default as LoginTabs } from './components/LoginTabs.vue'
export { default as UsernameLoginForm } from './components/UsernameLoginForm.vue'
export { default as PhoneLoginForm } from './components/PhoneLoginForm.vue'
export { default as SocialLogin } from './components/SocialLogin.vue'
export { default as MessageToast } from './components/MessageToast.vue'
export { default as LucideIcon } from './components/LucideIcon.vue'

// 导出类型定义
export * from './types'

// 导出工具函数
export * from './utils/validators'

// 导出组合式函数
export { useMessage, setGlobalMessage } from './composables/useMessage'
export type { MessageApi } from './composables/useMessage'

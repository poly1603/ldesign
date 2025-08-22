/**
 * Vue 组件导出
 */

// 核心组件 (使用TSX版本以确保构建兼容性)
export { default as LanguageSwitcher } from './LanguageSwitcher'

// 注意：其他Vue SFC 组件暂时注释掉，等修复构建配置后再启用
// export { default as TranslationText } from './TranslationText.vue'
// export { default as TranslationProvider } from './TranslationProvider.vue'
// export { default as TranslationForm } from './TranslationForm.vue'
// export { default as LanguageButton } from './LanguageButton.vue'
// export { default as LanguageDetector } from './LanguageDetector.vue'

// 临时导出空对象以避免构建错误
export const TranslationText = {}
export const TranslationProvider = {}
export const TranslationForm = {}
export const LanguageButton = {}
export const LanguageDetector = {}

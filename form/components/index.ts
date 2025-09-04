/**
 * 自主可控表单组件库
 * 完全移除对 tdesign-vue-next 的依赖
 */

export { default as FormInput } from './FormInput.vue'
export { default as FormSelect } from './FormSelect.vue'
export { default as FormCheckbox } from './FormCheckbox.vue'
export { default as FormRadio } from './FormRadio.vue'
export { default as FormTextarea } from './FormTextarea.vue'
export { default as FormDatePicker } from './FormDatePicker.vue'
export { default as FormSwitch } from './FormSwitch.vue'
export { default as FormSlider } from './FormSlider.vue'
export { default as FormUpload } from './FormUpload.vue'

// 组件映射表
export const COMPONENT_MAP = {
  input: 'FormInput',
  select: 'FormSelect',
  checkbox: 'FormCheckbox',
  radio: 'FormRadio',
  textarea: 'FormTextarea',
  'date-picker': 'FormDatePicker',
  switch: 'FormSwitch',
  slider: 'FormSlider',
  upload: 'FormUpload'
} as const

export type ComponentType = keyof typeof COMPONENT_MAP
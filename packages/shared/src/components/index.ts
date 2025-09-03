/**
 * 通用 UI 组件导出
 * 
 * 提供可复用的基础 UI 组件，包括：
 * - Select: 美化的选择器组件
 * - Popup: 弹出层组件
 * - Dialog: 对话框组件
 */

export { default as LSelect } from './select/LSelect.vue'
export { default as LPopup } from './popup/LPopup.vue'
export { default as LDialog } from './dialog/LDialog.vue'

// 导出组件类型
export type { SelectProps, SelectOption } from './select/types'
export type { PopupProps, PopupPlacement } from './popup/types'
export type { DialogProps } from './dialog/types'

// 导出安装函数
export { installComponents } from './install'

/**
 * @ldesign/theme - Vue 指令导出
 *
 * 统一导出所有 Vue 指令
 */

export {
  vThemeDecoration,
  getElementDecoration,
  hasElementDecoration,
  clearAllDecorations,
  default as themeDecoration,
} from './theme-decoration'

export {
  vThemeAnimation,
  getElementAnimation,
  hasElementAnimation,
  triggerElementAnimation,
  stopElementAnimation,
  pauseElementAnimation,
  resumeElementAnimation,
  clearAllAnimations,
  default as themeAnimation,
} from './theme-animation'

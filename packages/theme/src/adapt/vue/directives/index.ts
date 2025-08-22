/**
 * @ldesign/theme - Vue 指令导出
 *
 * 统一导出所有 Vue 指令
 */

export {
  clearAllAnimations,
  getElementAnimation,
  hasElementAnimation,
  pauseElementAnimation,
  resumeElementAnimation,
  stopElementAnimation,
  default as themeAnimation,
  triggerElementAnimation,
  vThemeAnimation,
} from './theme-animation'

export {
  clearAllDecorations,
  getElementDecoration,
  hasElementDecoration,
  default as themeDecoration,
  vThemeDecoration,
} from './theme-decoration'

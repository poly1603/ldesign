import { Directive } from 'vue'
import { VThemeAnimationBinding } from '../types.js'

/**
 * @ldesign/theme - v-theme-animation 指令
 *
 * 为元素添加主题动画效果
 */

/**
 * v-theme-animation 指令实现
 */
declare const vThemeAnimation: Directive<HTMLElement, VThemeAnimationBinding>
/**
 * 获取元素的动画实例
 */
declare function getElementAnimation(el: HTMLElement): any
/**
 * 检查元素是否有动画
 */
declare function hasElementAnimation(el: HTMLElement): boolean
/**
 * 手动触发元素动画
 */
declare function triggerElementAnimation(el: HTMLElement): void
/**
 * 停止元素动画
 */
declare function stopElementAnimation(el: HTMLElement): void
/**
 * 暂停元素动画
 */
declare function pauseElementAnimation(el: HTMLElement): void
/**
 * 恢复元素动画
 */
declare function resumeElementAnimation(el: HTMLElement): void
/**
 * 清除所有动画
 */
declare function clearAllAnimations(): void

export {
  clearAllAnimations,
  vThemeAnimation as default,
  getElementAnimation,
  hasElementAnimation,
  pauseElementAnimation,
  resumeElementAnimation,
  stopElementAnimation,
  triggerElementAnimation,
  vThemeAnimation,
}

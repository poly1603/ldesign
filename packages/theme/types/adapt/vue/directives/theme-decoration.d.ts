import { Directive } from 'vue'
import { VThemeDecorationBinding } from '../types.js'

/**
 * @ldesign/theme - v-theme-decoration 指令
 *
 * 为元素添加主题装饰效果
 */

/**
 * v-theme-decoration 指令实现
 */
declare const vThemeDecoration: Directive<HTMLElement, VThemeDecorationBinding>
/**
 * 获取元素的装饰实例
 */
declare function getElementDecoration(el: HTMLElement): any
/**
 * 检查元素是否有装饰
 */
declare function hasElementDecoration(el: HTMLElement): boolean
/**
 * 清除所有装饰
 */
declare function clearAllDecorations(): void

export {
  clearAllDecorations,
  vThemeDecoration as default,
  getElementDecoration,
  hasElementDecoration,
  vThemeDecoration,
}

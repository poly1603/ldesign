import { Styles } from '../types/common.js';

/**
 * 为 HTML 元素设置样式
 *
 * @description
 * 该函数用于批量设置 HTML 元素的样式属性。
 * 支持所有有效的 CSS 属性，包括 kebab-case 和 camelCase 格式。
 *
 * @param el - 目标 HTML 元素
 * @param styles - 样式对象，键为 CSS 属性名，值为对应的样式值
 *
 * @example
 * ```typescript
 * const element = document.getElementById('myElement')
 * if (element) {
 *   setStyle(element, {
 *     color: 'red',
 *     fontSize: '16px',
 *     backgroundColor: '#f0f0f0',
 *     'margin-top': '10px'
 *   })
 * }
 * ```
 *
 * @example
 * ```typescript
 * // 动态样式设置
 * const styles: Styles = {
 *   width: `${width}px`,
 *   height: `${height}px`,
 *   transform: `translate(${x}px, ${y}px)`
 * }
 * setStyle(element, styles)
 * ```
 */
declare function setStyle(el: HTMLElement, styles: Styles): void;
/**
 * 获取元素的计算样式值
 *
 * @param el - 目标 HTML 元素
 * @param property - CSS 属性名
 * @returns 计算后的样式值
 *
 * @example
 * ```typescript
 * const element = document.getElementById('myElement')
 * if (element) {
 *   const color = getComputedStyle(element, 'color')
 *   const fontSize = getComputedStyle(element, 'font-size')
 * }
 * ```
 */
declare function getComputedStyleValue(el: HTMLElement, property: string): string;
/**
 * 移除元素的指定样式属性
 *
 * @param el - 目标 HTML 元素
 * @param properties - 要移除的 CSS 属性名数组
 *
 * @example
 * ```typescript
 * const element = document.getElementById('myElement')
 * if (element) {
 *   removeStyle(element, ['color', 'font-size', 'background-color'])
 * }
 * ```
 */
declare function removeStyle(el: HTMLElement, properties: string[]): void;
/**
 * 切换元素的样式类
 *
 * @param el - 目标 HTML 元素
 * @param className - 要切换的类名
 * @param force - 强制添加或移除（可选）
 * @returns 切换后是否包含该类名
 *
 * @example
 * ```typescript
 * const element = document.getElementById('myElement')
 * if (element) {
 *   // 切换类名
 *   toggleClass(element, 'active')
 *
 *   // 强制添加类名
 *   toggleClass(element, 'visible', true)
 *
 *   // 强制移除类名
 *   toggleClass(element, 'hidden', false)
 * }
 * ```
 */
declare function toggleClass(el: HTMLElement, className: string, force?: boolean): boolean;

export { setStyle as default, getComputedStyleValue, removeStyle, setStyle, toggleClass };

import { Styles } from '../types/common.js';

/**
 * 用于为节点增加styles
 * @param el HTMLElement
 * @param style Styles
 */
declare function setStyle(el: HTMLElement, styles: Styles): void;

export { setStyle as default };

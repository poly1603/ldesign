import { VNode, ComponentPublicInstance } from 'vue';
import { ScrollContainer, ScrollContainerElement } from '../types/common.js';
import { EasingFunction } from './easing.js';

/**
 * Thanks to https://spothero.com/static/main/uniform/docs-js/module-DOMUtils.html
 */

declare const isServer: boolean;
declare const on: any;
declare const off: any;
declare function once(element: Node, event: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
declare function hasClass(el: Element, cls: string): any;
declare function addClass(el: Element, cls: string): any;
declare function removeClass(el: Element, cls: string): any;
declare function getAttach(node: any, triggerNode?: any): HTMLElement | Element | null;
/**
 * 获取滚动容器
 * 因为document不存在scroll等属性, 因此排除document
 * window | HTMLElement
 * @param {ScrollContainerElement} [container]
 * @returns {ScrollContainer}
 */
declare function getScrollContainer(container?: ScrollContainer): ScrollContainerElement;
type ScrollTarget = HTMLElement | Window | Document;
/**
 * 获取滚动距离
 *
 * @export
 * @param {ScrollTarget} target
 * @param {boolean} isLeft true为获取scrollLeft, false为获取scrollTop
 * @returns {number}
 */
declare function getScroll(target: ScrollTarget, isLeft?: boolean): number;
interface ScrollTopOptions {
    container?: ScrollTarget;
    duration?: number;
    easing?: EasingFunction;
}
declare type ScrollToResult<T = any> = T | {
    default: T;
};
declare function scrollTo(target: number, opt: ScrollTopOptions): Promise<ScrollToResult>;
declare function clickOut(els: VNode | Element | Iterable<any> | ArrayLike<any>, cb: () => void): void;
declare function isTextEllipsis(ele: ComponentPublicInstance | Element | ComponentPublicInstance[] | Element[]): boolean;
declare function scrollSelectedIntoView(parentEle: HTMLElement, selected: HTMLElement): void;
declare function requestSubmit(target: HTMLFormElement): void;
/**
 * 检查元素是否在父元素视图
 * http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
 * @param elm 元素
 * @param parent
 * @returns boolean
 */
declare function elementInViewport(elm: HTMLElement, parent?: HTMLElement): boolean;
/**
 * 获取元素某个 css 对应的值
 * @param element 元素
 * @param propName css 名
 * @returns string
 */
declare function getElmCssPropValue(element: HTMLElement, propName: string): string;
/**
 * 判断元素是否处在 position fixed 中
 * @param element 元素
 * @returns boolean
 */
declare function isFixed(element: HTMLElement): boolean;
/**
 * 获取当前视图滑动的距离
 * @returns { scrollTop: number, scrollLeft: number }
 */
declare function getWindowScroll(): {
    scrollTop: number;
    scrollLeft: number;
};
/**
 * 获取当前视图的大小
 * @returns { width: number, height: number }
 */
declare function getWindowSize(): {
    width: number;
    height: number;
};
/**
 * 判断一个 VNode 是否是注释节点（Comment）
 * Vue 3 中注释节点的 type 是 Comment
 *
 * @param node - 任意节点
 * @returns 是否为注释类型的 VNode
 */
declare function isCommentVNode(node: unknown): node is VNode;

export { addClass, clickOut, elementInViewport, getAttach, getElmCssPropValue, getScroll, getScrollContainer, getWindowScroll, getWindowSize, hasClass, isCommentVNode, isFixed, isServer, isTextEllipsis, off, on, once, removeClass, requestSubmit, scrollSelectedIntoView, scrollTo };

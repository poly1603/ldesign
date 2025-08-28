/**
 * Thanks to https://spothero.com/static/main/uniform/docs-js/module-DOMUtils.html
 */
import type { ComponentPublicInstance, VNode } from 'vue';
import type { ScrollContainer, ScrollContainerElement } from '../types';
import type { EasingFunction } from './easing';
export declare const isServer: boolean;
export declare const on: any;
export declare const off: any;
export declare function once(element: Node, event: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
export declare function hasClass(el: Element, cls: string): any;
export declare function addClass(el: Element, cls: string): any;
export declare function removeClass(el: Element, cls: string): any;
export declare function getAttach(node: any, triggerNode?: any): HTMLElement | Element | null;
/**
 * 获取滚动容器
 * 因为document不存在scroll等属性, 因此排除document
 * window | HTMLElement
 * @param {ScrollContainerElement} [container]
 * @returns {ScrollContainer}
 */
export declare function getScrollContainer(container?: ScrollContainer): ScrollContainerElement;
type ScrollTarget = HTMLElement | Window | Document;
/**
 * 获取滚动距离
 *
 * @export
 * @param {ScrollTarget} target
 * @param {boolean} isLeft true为获取scrollLeft, false为获取scrollTop
 * @returns {number}
 */
export declare function getScroll(target: ScrollTarget, isLeft?: boolean): number;
interface ScrollTopOptions {
    container?: ScrollTarget;
    duration?: number;
    easing?: EasingFunction;
}
declare type ScrollToResult<T = any> = T | {
    default: T;
};
export declare function scrollTo(target: number, opt: ScrollTopOptions): Promise<ScrollToResult>;
export declare function clickOut(els: VNode | Element | Iterable<any> | ArrayLike<any>, cb: () => void): void;
export declare function isTextEllipsis(ele: ComponentPublicInstance | Element | ComponentPublicInstance[] | Element[]): boolean;
export declare function scrollSelectedIntoView(parentEle: HTMLElement, selected: HTMLElement): void;
export declare function requestSubmit(target: HTMLFormElement): void;
/**
 * 检查元素是否在父元素视图
 * http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
 * @param elm 元素
 * @param parent
 * @returns boolean
 */
export declare function elementInViewport(elm: HTMLElement, parent?: HTMLElement): boolean;
/**
 * 获取元素某个 css 对应的值
 * @param element 元素
 * @param propName css 名
 * @returns string
 */
export declare function getElmCssPropValue(element: HTMLElement, propName: string): string;
/**
 * 判断元素是否处在 position fixed 中
 * @param element 元素
 * @returns boolean
 */
export declare function isFixed(element: HTMLElement): boolean;
/**
 * 获取当前视图滑动的距离
 * @returns { scrollTop: number, scrollLeft: number }
 */
export declare function getWindowScroll(): {
    scrollTop: number;
    scrollLeft: number;
};
/**
 * 获取当前视图的大小
 * @returns { width: number, height: number }
 */
export declare function getWindowSize(): {
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
export declare function isCommentVNode(node: unknown): node is VNode;
export {};
//# sourceMappingURL=dom.d.ts.map
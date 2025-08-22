import '../node_modules/.pnpm/@vue_runtime-dom@3.5.18/node_modules/@vue/runtime-dom/dist/runtime-dom.d.js';
import { AppContext as AppContext$1, VNode as VNode$1, h } from '../node_modules/.pnpm/@vue_runtime-core@3.5.18/node_modules/@vue/runtime-core/dist/runtime-core.d.js';

/** Vue3 特有全局类型 */
type VNode = VNode$1;
type AppContext = AppContext$1;
type ScopedSlot = () => SlotReturnValue;
type SlotReturnValue = VNode | string | boolean | null | undefined | SlotReturnArray;
type SlotReturnArray = Array<SlotReturnValue>;
interface TVNode extends VNode {
    name: string;
}
type TNodeReturnValue = SlotReturnValue;
type TNode<T = undefined> = T extends undefined ? (h: typeof h) => TNodeReturnValue : (h: typeof h, props: T) => TNodeReturnValue;
type AttachNodeReturnValue = HTMLElement | Element | Document;
type AttachNode = CSSSelector | ((triggerNode?: HTMLElement) => AttachNodeReturnValue);
type ScrollContainerElement = Window | HTMLElement;
type ScrollContainer = (() => ScrollContainerElement) | CSSSelector;
type ComponentType = any;
type FormResetEvent = Event;
type FormSubmitEvent = Event;
interface Styles {
    [css: string]: string | number;
}
interface UploadDisplayDragEvents {
    onDrop?: (event: DragEvent) => void;
    onDragenter?: (event: DragEvent) => void;
    onDragover?: (event: DragEvent) => void;
    onDragleave?: (event: DragEvent) => void;
}
type ImageEvent = Event;
/**
 * 通用全局类型
 */
interface PlainObject {
    [key: string]: any;
}
type OptionData = {
    label?: string;
    value?: string | number;
} & PlainObject;
type TreeOptionData<T = string | number> = {
    children?: Array<TreeOptionData<T>> | boolean;
    /** option label content */
    label?: string | TNode;
    /** option search text */
    text?: string;
    /** option value */
    value?: T;
    /** option node content */
    content?: string | TNode;
} & PlainObject;
type SizeEnum = 'small' | 'medium' | 'large';
type ShapeEnum = 'circle' | 'round';
type HorizontalAlignEnum = 'left' | 'center' | 'right';
type VerticalAlignEnum = 'top' | 'middle' | 'bottom';
type LayoutEnum = 'vertical' | 'horizontal';
type ClassName = {
    [className: string]: any;
} | ClassName[] | string;
type CSSSelector = string;
interface KeysType {
    value?: string;
    label?: string;
    disabled?: string;
}
interface TreeKeysType extends KeysType {
    children?: string;
}
interface HTMLElementAttributes {
    [attribute: string]: string;
}
interface TScroll {
    /**
     * 表示除可视区域外，额外渲染的行数，避免快速滚动过程中，新出现的内容来不及渲染从而出现空白
     * @default 20
     */
    bufferSize?: number;
    /**
     * 表示每行内容是否同一个固定高度，仅在 `scroll.type` 为 `virtual` 时有效，该属性设置为 `true` 时，可用于简化虚拟滚动内部计算逻辑，提升性能，此时则需要明确指定 `scroll.rowHeight` 属性的值
     * @default false
     */
    isFixedRowHeight?: boolean;
    /**
     * 行高，不会给元素添加样式高度，仅作为滚动时的行高参考。一般情况不需要设置该属性。如果设置，可尽量将该属性设置为每行平均高度，从而使得滚动过程更加平滑
     */
    rowHeight?: number;
    /**
     * 启动虚拟滚动的阈值。为保证组件收益最大化，当数据量小于阈值 `scroll.threshold` 时，无论虚拟滚动的配置是否存在，组件内部都不会开启虚拟滚动
     * @default 100
     */
    threshold?: number;
    /**
     * 滚动加载类型，有两种：懒加载和虚拟滚动。<br />值为 `lazy` ，表示滚动时会进行懒加载，非可视区域内的内容将不会默认渲染，直到该内容可见时，才会进行渲染，并且已渲染的内容滚动到不可见时，不会被销毁；<br />值为`virtual`时，表示会进行虚拟滚动，无论滚动条滚动到哪个位置，同一时刻，仅渲染该可视区域内的内容，当需要展示的数据量较大时，建议开启该特性
     */
    type: 'lazy' | 'virtual';
}
/**
 * @deprecated use TScroll instead
 */
type InfinityScroll = TScroll;
interface ScrollToElementParams {
    /** 跳转元素下标 */
    index?: number;
    /** 跳转元素距离顶部的距离 */
    top?: number;
    /** 单个元素高度非固定场景下，即 isFixedRowHeight = false。延迟设置元素位置，一般用于依赖不同高度异步渲染等场景，单位：毫秒 */
    time?: number;
    behavior?: 'auto' | 'smooth';
}
interface ComponentScrollToElementParams extends ScrollToElementParams {
    key?: string | number;
}

export type { AppContext, AttachNode, AttachNodeReturnValue, CSSSelector, ClassName, ComponentScrollToElementParams, ComponentType, FormResetEvent, FormSubmitEvent, HTMLElementAttributes, HorizontalAlignEnum, ImageEvent, InfinityScroll, KeysType, LayoutEnum, OptionData, PlainObject, ScopedSlot, ScrollContainer, ScrollContainerElement, ScrollToElementParams, ShapeEnum, SizeEnum, SlotReturnArray, SlotReturnValue, Styles, TNode, TNodeReturnValue, TScroll, TVNode, TreeKeysType, TreeOptionData, UploadDisplayDragEvents, VerticalAlignEnum };

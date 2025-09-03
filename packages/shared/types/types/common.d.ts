/** Vue3 特有全局类型 */
type VNode = import('vue').VNode;
export type AppContext = import('vue').AppContext;
export type ScopedSlot = () => SlotReturnValue;
export type SlotReturnValue = VNode | string | boolean | null | undefined | SlotReturnArray;
export type SlotReturnArray = Array<SlotReturnValue>;
export interface TVNode extends VNode {
    name: string;
}
export type TNodeReturnValue = SlotReturnValue;
export type TNode<T = undefined> = T extends undefined ? (h: typeof import('vue').h) => TNodeReturnValue : (h: typeof import('vue').h, props: T) => TNodeReturnValue;
export type AttachNodeReturnValue = HTMLElement | Element | Document;
export type AttachNode = CSSSelector | ((triggerNode?: HTMLElement) => AttachNodeReturnValue);
export type ScrollContainerElement = Window | HTMLElement;
export type ScrollContainer = (() => ScrollContainerElement) | CSSSelector;
export type ComponentType = any;
export type FormResetEvent = Event;
export type FormSubmitEvent = Event;
export interface Styles {
    [css: string]: string | number;
}
export interface UploadDisplayDragEvents {
    onDrop?: (event: DragEvent) => void;
    onDragenter?: (event: DragEvent) => void;
    onDragover?: (event: DragEvent) => void;
    onDragleave?: (event: DragEvent) => void;
}
export type ImageEvent = Event;
/**
 * 通用全局类型
 */
export interface PlainObject {
    [key: string]: any;
}
export type OptionData = {
    label?: string;
    value?: string | number;
} & PlainObject;
export type TreeOptionData<T = string | number> = {
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
export type SizeEnum = 'small' | 'medium' | 'large';
export type ShapeEnum = 'circle' | 'round';
export type HorizontalAlignEnum = 'left' | 'center' | 'right';
export type VerticalAlignEnum = 'top' | 'middle' | 'bottom';
export type LayoutEnum = 'vertical' | 'horizontal';
export type ClassName = {
    [className: string]: any;
} | ClassName[] | string;
export type CSSSelector = string;
export interface KeysType {
    value?: string;
    label?: string;
    disabled?: string;
}
export interface TreeKeysType extends KeysType {
    children?: string;
}
export interface HTMLElementAttributes {
    [attribute: string]: string;
}
/**
 * 深度可选类型
 * 将对象的所有属性（包括嵌套属性）设为可选
 */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
/**
 * 深度必需类型
 * 将对象的所有属性（包括嵌套属性）设为必需
 */
export type DeepRequired<T> = {
    [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};
/**
 * 深度只读类型
 * 将对象的所有属性（包括嵌套属性）设为只读
 */
export type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
/**
 * 提取对象中指定键的类型
 */
export type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
/**
 * 排除对象中指定键的类型
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/**
 * 可为空的类型
 */
export type Nullable<T> = T | null;
/**
 * 可为未定义的类型
 */
export type Optional<T> = T | undefined;
/**
 * 可为空或未定义的类型
 */
export type Maybe<T> = T | null | undefined;
/**
 * 非空类型
 */
export type NonNullable<T> = T extends null | undefined ? never : T;
/**
 * 函数类型
 */
export type AnyFunction = (...args: any[]) => any;
/**
 * 异步函数类型
 */
export type AsyncFunction<T = any> = (...args: any[]) => Promise<T>;
/**
 * 构造函数类型
 */
export type Constructor<T = {}> = new (...args: any[]) => T;
/**
 * 抽象构造函数类型
 */
export type AbstractConstructor<T = {}> = abstract new (...args: any[]) => T;
/**
 * 值或函数类型
 */
export type ValueOrFunction<T> = T | (() => T);
/**
 * 值或 Promise 类型
 */
export type ValueOrPromise<T> = T | Promise<T>;
/**
 * 数组或单个值类型
 */
export type ArrayOrSingle<T> = T | T[];
/**
 * 字符串字面量联合类型
 */
export type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never;
/**
 * 数字字面量联合类型
 */
export type NumberLiteral<T> = T extends number ? (number extends T ? never : T) : never;
/**
 * 获取对象值的类型
 */
export type ValueOf<T> = T[keyof T];
/**
 * 获取数组元素的类型
 */
export type ElementOf<T> = T extends (infer U)[] ? U : never;
/**
 * 获取 Promise 解析值的类型
 */
export type PromiseValue<T> = T extends Promise<infer U> ? U : T;
/**
 * 获取函数返回值的类型
 */
export type ReturnTypeOf<T> = T extends (...args: any[]) => infer R ? R : never;
/**
 * 获取函数参数的类型
 */
export type ParametersOf<T> = T extends (...args: infer P) => any ? P : never;
/**
 * 联合类型转交叉类型
 */
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
/**
 * 扁平化对象类型
 */
export type Flatten<T> = T extends object ? {
    [K in keyof T]: T[K];
} : T;
/**
 * 美化类型显示
 */
export type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
/**
 * 条件类型
 */
export type If<C extends boolean, T, F> = C extends true ? T : F;
/**
 * 相等类型判断
 */
export type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false;
/**
 * 包含类型判断
 */
export type Includes<T extends readonly any[], U> = T extends readonly [infer H, ...infer R] ? Equals<H, U> extends true ? true : Includes<R, U> : false;
/**
 * 字符串长度类型
 */
export type Length<T extends readonly any[]> = T['length'];
/**
 * 元组转联合类型
 */
export type TupleToUnion<T extends readonly any[]> = T[number];
/**
 * 对象键转联合类型
 */
export type KeysToUnion<T> = keyof T;
/**
 * 递归数组类型
 */
export type RecursiveArray<T> = (T | RecursiveArray<T>)[];
/**
 * 递归对象类型
 */
export type RecursiveObject<T> = {
    [K in keyof T]: T[K] | RecursiveObject<T[K]>;
};
export interface TScroll {
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
export type InfinityScroll = TScroll;
export interface ScrollToElementParams {
    /** 跳转元素下标 */
    index?: number;
    /** 跳转元素距离顶部的距离 */
    top?: number;
    /** 单个元素高度非固定场景下，即 isFixedRowHeight = false。延迟设置元素位置，一般用于依赖不同高度异步渲染等场景，单位：毫秒 */
    time?: number;
    behavior?: 'auto' | 'smooth';
}
export interface ComponentScrollToElementParams extends ScrollToElementParams {
    key?: string | number;
}
export {};
//# sourceMappingURL=common.d.ts.map
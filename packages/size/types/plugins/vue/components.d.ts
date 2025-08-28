/**
 * Size Vue 组件
 */
import type { SizeMode } from '../../types';
/**
 * 尺寸切换器组件
 */
export declare const SizeSwitcher: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    /** 显示样式 */
    style: {
        type: () => "button" | "select" | "radio" | "segmented";
        default: string;
    };
    /** 是否显示标签 */
    showLabels: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** 可选的尺寸模式 */
    modes: {
        type: () => SizeMode[];
        default: () => string[];
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    /** 显示样式 */
    style: {
        type: () => "button" | "select" | "radio" | "segmented";
        default: string;
    };
    /** 是否显示标签 */
    showLabels: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** 可选的尺寸模式 */
    modes: {
        type: () => SizeMode[];
        default: () => string[];
    };
}>> & Readonly<{}>, {
    style: "button" | "select" | "radio" | "segmented";
    modes: SizeMode[];
    showLabels: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
//# sourceMappingURL=components.d.ts.map
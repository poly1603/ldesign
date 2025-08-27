import * as vue from 'vue';
import { SizeMode } from '../../types/index.js';

/**
 * 尺寸切换器组件
 */
declare const SizeSwitcher: vue.DefineComponent<vue.ExtractPropTypes<{
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
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}> | null, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
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
    showLabels: boolean;
    modes: SizeMode[];
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;

export { SizeSwitcher };

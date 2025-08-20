import { JSX } from '../node_modules/vue/jsx-runtime/index.d.js';
import * as vue from 'vue';
import { PropType } from 'vue';
import { SizeMode } from '../types/index.js';

/**
 * 尺寸切换器组件
 */
declare const SizeSwitcher: vue.DefineComponent<vue.ExtractPropTypes<{
    mode: {
        type: PropType<SizeMode>;
        default: undefined;
    };
    showSwitcher: {
        type: BooleanConstructor;
        default: boolean;
    };
    switcherStyle: {
        type: PropType<"button" | "select" | "radio">;
        default: string;
    };
    className: {
        type: StringConstructor;
        default: string;
    };
}>, () => JSX.Element | null, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, ("change" | "update:mode")[], "change" | "update:mode", vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    mode: {
        type: PropType<SizeMode>;
        default: undefined;
    };
    showSwitcher: {
        type: BooleanConstructor;
        default: boolean;
    };
    switcherStyle: {
        type: PropType<"button" | "select" | "radio">;
        default: string;
    };
    className: {
        type: StringConstructor;
        default: string;
    };
}>> & Readonly<{
    onChange?: ((...args: any[]) => any) | undefined;
    "onUpdate:mode"?: ((...args: any[]) => any) | undefined;
}>, {
    mode: SizeMode;
    showSwitcher: boolean;
    switcherStyle: "button" | "select" | "radio";
    className: string;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
/**
 * 尺寸指示器组件
 */
declare const SizeIndicator: vue.DefineComponent<vue.ExtractPropTypes<{
    showMode: {
        type: BooleanConstructor;
        default: boolean;
    };
    showScale: {
        type: BooleanConstructor;
        default: boolean;
    };
    className: {
        type: StringConstructor;
        default: string;
    };
}>, () => JSX.Element, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    showMode: {
        type: BooleanConstructor;
        default: boolean;
    };
    showScale: {
        type: BooleanConstructor;
        default: boolean;
    };
    className: {
        type: StringConstructor;
        default: string;
    };
}>> & Readonly<{}>, {
    className: string;
    showMode: boolean;
    showScale: boolean;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
/**
 * 尺寸控制面板组件
 */
declare const SizeControlPanel: vue.DefineComponent<vue.ExtractPropTypes<{
    showSwitcher: {
        type: BooleanConstructor;
        default: boolean;
    };
    showIndicator: {
        type: BooleanConstructor;
        default: boolean;
    };
    switcherStyle: {
        type: PropType<"button" | "select" | "radio">;
        default: string;
    };
    className: {
        type: StringConstructor;
        default: string;
    };
}>, () => JSX.Element, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, "change"[], "change", vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    showSwitcher: {
        type: BooleanConstructor;
        default: boolean;
    };
    showIndicator: {
        type: BooleanConstructor;
        default: boolean;
    };
    switcherStyle: {
        type: PropType<"button" | "select" | "radio">;
        default: string;
    };
    className: {
        type: StringConstructor;
        default: string;
    };
}>> & Readonly<{
    onChange?: ((...args: any[]) => any) | undefined;
}>, {
    showSwitcher: boolean;
    switcherStyle: "button" | "select" | "radio";
    className: string;
    showIndicator: boolean;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;

export { SizeControlPanel, SizeIndicator, SizeSwitcher, SizeSwitcher as default };

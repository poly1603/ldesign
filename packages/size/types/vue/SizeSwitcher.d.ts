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
    modes: {
        type: PropType<SizeMode[]>;
        default: () => string[];
    };
    showSwitcher: {
        type: BooleanConstructor;
        default: boolean;
    };
    switcherStyle: {
        type: PropType<"button" | "select" | "radio" | "slider" | "segmented">;
        default: string;
    };
    showLabels: {
        type: BooleanConstructor;
        default: boolean;
    };
    showIcons: {
        type: BooleanConstructor;
        default: boolean;
    };
    showDescriptions: {
        type: BooleanConstructor;
        default: boolean;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    size: {
        type: PropType<"small" | "medium" | "large">;
        default: string;
    };
    theme: {
        type: PropType<"light" | "dark" | "auto">;
        default: string;
    };
    responsive: {
        type: BooleanConstructor;
        default: boolean;
    };
    animated: {
        type: BooleanConstructor;
        default: boolean;
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
    modes: {
        type: PropType<SizeMode[]>;
        default: () => string[];
    };
    showSwitcher: {
        type: BooleanConstructor;
        default: boolean;
    };
    switcherStyle: {
        type: PropType<"button" | "select" | "radio" | "slider" | "segmented">;
        default: string;
    };
    showLabels: {
        type: BooleanConstructor;
        default: boolean;
    };
    showIcons: {
        type: BooleanConstructor;
        default: boolean;
    };
    showDescriptions: {
        type: BooleanConstructor;
        default: boolean;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    size: {
        type: PropType<"small" | "medium" | "large">;
        default: string;
    };
    theme: {
        type: PropType<"light" | "dark" | "auto">;
        default: string;
    };
    responsive: {
        type: BooleanConstructor;
        default: boolean;
    };
    animated: {
        type: BooleanConstructor;
        default: boolean;
    };
    className: {
        type: StringConstructor;
        default: string;
    };
}>> & Readonly<{
    onChange?: ((...args: any[]) => any) | undefined;
    "onUpdate:mode"?: ((...args: any[]) => any) | undefined;
}>, {
    theme: "light" | "dark" | "auto";
    size: "small" | "medium" | "large";
    showSwitcher: boolean;
    mode: SizeMode;
    modes: SizeMode[];
    switcherStyle: "button" | "select" | "radio" | "slider" | "segmented";
    showLabels: boolean;
    showIcons: boolean;
    showDescriptions: boolean;
    disabled: boolean;
    responsive: boolean;
    animated: boolean;
    className: string;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;

export { SizeSwitcher, SizeSwitcher as default };

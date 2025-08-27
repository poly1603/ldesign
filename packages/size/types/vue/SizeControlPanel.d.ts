import { JSX } from '../node_modules/vue/jsx-runtime/index.d.js';
import * as vue from 'vue';

declare const _default: vue.DefineComponent<vue.ExtractPropTypes<{
    showSwitcher: {
        type: BooleanConstructor;
        default: boolean;
    };
    showIndicator: {
        type: BooleanConstructor;
        default: boolean;
    };
    showPreview: {
        type: BooleanConstructor;
        default: boolean;
    };
    showRecommendation: {
        type: BooleanConstructor;
        default: boolean;
    };
    layout: {
        type: () => "vertical" | "horizontal" | "grid";
        default: string;
    };
    collapsible: {
        type: BooleanConstructor;
        default: boolean;
    };
    defaultCollapsed: {
        type: BooleanConstructor;
        default: boolean;
    };
    theme: {
        type: () => "light" | "dark" | "auto";
        default: string;
    };
    size: {
        type: () => "small" | "medium" | "large";
        default: string;
    };
}>, () => JSX.Element, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, ("size-change" | "collapse-change")[], "size-change" | "collapse-change", vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    showSwitcher: {
        type: BooleanConstructor;
        default: boolean;
    };
    showIndicator: {
        type: BooleanConstructor;
        default: boolean;
    };
    showPreview: {
        type: BooleanConstructor;
        default: boolean;
    };
    showRecommendation: {
        type: BooleanConstructor;
        default: boolean;
    };
    layout: {
        type: () => "vertical" | "horizontal" | "grid";
        default: string;
    };
    collapsible: {
        type: BooleanConstructor;
        default: boolean;
    };
    defaultCollapsed: {
        type: BooleanConstructor;
        default: boolean;
    };
    theme: {
        type: () => "light" | "dark" | "auto";
        default: string;
    };
    size: {
        type: () => "small" | "medium" | "large";
        default: string;
    };
}>> & Readonly<{
    "onSize-change"?: ((...args: any[]) => any) | undefined;
    "onCollapse-change"?: ((...args: any[]) => any) | undefined;
}>, {
    theme: "light" | "dark" | "auto";
    size: "small" | "medium" | "large";
    showSwitcher: boolean;
    showIndicator: boolean;
    showPreview: boolean;
    showRecommendation: boolean;
    layout: "vertical" | "horizontal" | "grid";
    collapsible: boolean;
    defaultCollapsed: boolean;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;

export { _default as default };

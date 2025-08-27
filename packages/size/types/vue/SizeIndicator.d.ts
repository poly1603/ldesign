import { JSX } from '../node_modules/vue/jsx-runtime/index.d.js';
import * as vue from 'vue';

declare const _default: vue.DefineComponent<vue.ExtractPropTypes<{
    showMode: {
        type: BooleanConstructor;
        default: boolean;
    };
    showScale: {
        type: BooleanConstructor;
        default: boolean;
    };
    showIcon: {
        type: BooleanConstructor;
        default: boolean;
    };
    format: {
        type: () => "text" | "badge" | "chip" | "minimal";
        default: string;
    };
    position: {
        type: () => "top-left" | "top-right" | "top-center" | "bottom-left" | "bottom-right" | "bottom-center" | "center-left" | "center-right" | "static";
        default: string;
    };
    theme: {
        type: () => "light" | "dark" | "auto";
        default: string;
    };
    size: {
        type: () => "small" | "medium" | "large";
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
    showIcon: {
        type: BooleanConstructor;
        default: boolean;
    };
    format: {
        type: () => "text" | "badge" | "chip" | "minimal";
        default: string;
    };
    position: {
        type: () => "top-left" | "top-right" | "top-center" | "bottom-left" | "bottom-right" | "bottom-center" | "center-left" | "center-right" | "static";
        default: string;
    };
    theme: {
        type: () => "light" | "dark" | "auto";
        default: string;
    };
    size: {
        type: () => "small" | "medium" | "large";
        default: string;
    };
}>> & Readonly<{}>, {
    showMode: boolean;
    showScale: boolean;
    showIcon: boolean;
    format: "text" | "badge" | "chip" | "minimal";
    position: "top-left" | "top-right" | "top-center" | "bottom-left" | "bottom-right" | "bottom-center" | "center-left" | "center-right" | "static";
    theme: "light" | "dark" | "auto";
    size: "small" | "medium" | "large";
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;

export { _default as default };

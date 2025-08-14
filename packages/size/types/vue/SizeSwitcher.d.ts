import { JSX } from '../node_modules/.pnpm/vue@3.5.18_typescript@5.8.3/node_modules/vue/jsx-runtime/index.d.js';
import '../node_modules/.pnpm/@vue_runtime-dom@3.5.18/node_modules/@vue/runtime-dom/dist/runtime-dom.d.js';
import { SizeMode } from '../types/index.js';
import { DefineComponent, ExtractPropTypes, PropType, ComponentOptionsMixin, PublicProps, ComponentProvideOptions } from '../node_modules/.pnpm/@vue_runtime-core@3.5.18/node_modules/@vue/runtime-core/dist/runtime-core.d.js';

/**
 * 尺寸切换器组件
 */
declare const SizeSwitcher: DefineComponent<ExtractPropTypes<{
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
}>, () => JSX.Element | null, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, ("change" | "update:mode")[], "change" | "update:mode", PublicProps, Readonly<ExtractPropTypes<{
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
}, {}, {}, {}, string, ComponentProvideOptions, true, {}, any>;
/**
 * 尺寸指示器组件
 */
declare const SizeIndicator: DefineComponent<ExtractPropTypes<{
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
}>, () => JSX.Element, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<ExtractPropTypes<{
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
}, {}, {}, {}, string, ComponentProvideOptions, true, {}, any>;
/**
 * 尺寸控制面板组件
 */
declare const SizeControlPanel: DefineComponent<ExtractPropTypes<{
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
}>, () => JSX.Element, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, "change"[], "change", PublicProps, Readonly<ExtractPropTypes<{
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
}, {}, {}, {}, string, ComponentProvideOptions, true, {}, any>;

export { SizeControlPanel, SizeIndicator, SizeSwitcher, SizeSwitcher as default };

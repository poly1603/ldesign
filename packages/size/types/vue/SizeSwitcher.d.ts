/**
 * 尺寸切换器组件
 */
import type { SizeMode } from '../types';
import { type PropType } from 'vue';
import './SizeSwitcher.less';
/**
 * 尺寸切换器组件属性
 */
export interface SizeSwitcherProps {
    /** 当前模式 */
    mode?: SizeMode;
    /** 可选的尺寸模式列表 */
    modes?: SizeMode[];
    /** 是否显示切换器 */
    showSwitcher?: boolean;
    /** 切换器样式 */
    switcherStyle?: 'button' | 'select' | 'radio' | 'slider' | 'segmented';
    /** 是否显示标签 */
    showLabels?: boolean;
    /** 是否显示图标 */
    showIcons?: boolean;
    /** 是否显示描述 */
    showDescriptions?: boolean;
    /** 是否禁用 */
    disabled?: boolean;
    /** 组件尺寸 */
    size?: 'small' | 'medium' | 'large';
    /** 主题 */
    theme?: 'light' | 'dark' | 'auto';
    /** 是否启用响应式 */
    responsive?: boolean;
    /** 是否启用动画 */
    animated?: boolean;
    /** 自定义类名 */
    className?: string;
}
/**
 * 尺寸切换器组件
 */
export declare const SizeSwitcher: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
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
}>, () => import("vue/jsx-runtime").JSX.Element | null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("change" | "update:mode")[], "change" | "update:mode", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
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
    disabled: boolean;
    responsive: boolean;
    size: "small" | "medium" | "large";
    mode: SizeMode;
    modes: SizeMode[];
    showSwitcher: boolean;
    switcherStyle: "button" | "select" | "radio" | "slider" | "segmented";
    showLabels: boolean;
    showIcons: boolean;
    showDescriptions: boolean;
    theme: "light" | "dark" | "auto";
    animated: boolean;
    className: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
/**
 * 尺寸指示器组件
 */
export declare const SizeIndicator: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
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
}>, () => import("vue/jsx-runtime").JSX.Element, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
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
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
/**
 * 尺寸控制面板组件
 */
export declare const SizeControlPanel: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
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
}>, () => import("vue/jsx-runtime").JSX.Element, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "change"[], "change", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
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
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default SizeSwitcher;
//# sourceMappingURL=SizeSwitcher.d.ts.map
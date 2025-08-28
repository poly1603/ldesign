/**
 * 尺寸模式枚举
 */
export type SizeMode = 'small' | 'medium' | 'large' | 'extra-large';
/**
 * CSS变量配置接口
 */
export interface CSSVariableConfig {
    /** 变量名 */
    name: string;
    /** 变量值 */
    value: string | number;
    /** 单位（如果值是数字） */
    unit?: string;
}
/**
 * 尺寸配置接口
 */
export interface SizeConfig {
    /** 字体大小配置 */
    fontSize: FontSizeConfig;
    /** 间距配置 */
    spacing: SpacingConfig;
    /** 组件尺寸配置 */
    component: ComponentSizeConfig;
    /** 边框圆角配置 */
    borderRadius: BorderRadiusConfig;
    /** 阴影配置 */
    shadow: ShadowConfig;
}
/**
 * 字体大小配置
 */
export interface FontSizeConfig {
    /** 超小字体 */
    xs: string;
    /** 小字体 */
    sm: string;
    /** 基础字体 */
    base: string;
    /** 大字体 */
    lg: string;
    /** 超大字体 */
    xl: string;
    /** 特大字体 */
    xxl: string;
    /** 标题字体 */
    h1: string;
    h2: string;
    h3: string;
    h4: string;
    h5: string;
    h6: string;
}
/**
 * 间距配置
 */
export interface SpacingConfig {
    /** 超小间距 */
    xs: string;
    /** 小间距 */
    sm: string;
    /** 基础间距 */
    base: string;
    /** 大间距 */
    lg: string;
    /** 超大间距 */
    xl: string;
    /** 特大间距 */
    xxl: string;
}
/**
 * 组件尺寸配置
 */
export interface ComponentSizeConfig {
    /** 按钮高度 */
    buttonHeight: {
        small: string;
        medium: string;
        large: string;
    };
    /** 输入框高度 */
    inputHeight: {
        small: string;
        medium: string;
        large: string;
    };
    /** 图标尺寸 */
    iconSize: {
        small: string;
        medium: string;
        large: string;
    };
    /** 头像尺寸 */
    avatarSize: {
        small: string;
        medium: string;
        large: string;
    };
}
/**
 * 边框圆角配置
 */
export interface BorderRadiusConfig {
    /** 无圆角 */
    none: string;
    /** 小圆角 */
    sm: string;
    /** 基础圆角 */
    base: string;
    /** 大圆角 */
    lg: string;
    /** 超大圆角 */
    xl: string;
    /** 完全圆角 */
    full: string;
}
/**
 * 阴影配置
 */
export interface ShadowConfig {
    /** 无阴影 */
    none: string;
    /** 小阴影 */
    sm: string;
    /** 基础阴影 */
    base: string;
    /** 大阴影 */
    lg: string;
    /** 超大阴影 */
    xl: string;
}
/**
 * 尺寸管理器选项
 */
export interface SizeManagerOptions {
    /** CSS变量前缀 */
    prefix?: string;
    /** 默认尺寸模式 */
    defaultMode?: SizeMode;
    /** 样式标签ID */
    styleId?: string;
    /** 目标选择器 */
    selector?: string;
    /** 是否自动注入样式 */
    autoInject?: boolean;
    /** 是否启用本地存储 */
    enableStorage?: boolean;
    /** 存储类型 */
    storageType?: 'localStorage' | 'sessionStorage' | 'memory';
    /** 是否启用动画过渡 */
    enableTransition?: boolean;
    /** 过渡持续时间 */
    transitionDuration?: string;
}
/**
 * 尺寸变化事件
 */
export interface SizeChangeEvent {
    /** 之前的尺寸模式 */
    previousMode: SizeMode;
    /** 当前的尺寸模式 */
    currentMode: SizeMode;
    /** 变化时间戳 */
    timestamp: number;
}
/**
 * 尺寸管理器接口
 */
export interface SizeManager {
    /** 获取当前尺寸模式 */
    getCurrentMode: () => SizeMode;
    /** 设置尺寸模式 */
    setMode: (mode: SizeMode) => void | Promise<void>;
    /** 获取尺寸配置 */
    getConfig: (mode?: SizeMode) => SizeConfig;
    /** 生成CSS变量 */
    generateCSSVariables: (mode?: SizeMode) => Record<string, string>;
    /** 注入CSS变量 */
    injectCSS: (mode?: SizeMode) => void;
    /** 移除CSS变量 */
    removeCSS: () => void;
    /** 监听尺寸变化 */
    onSizeChange: (callback: (event: SizeChangeEvent) => void) => () => void;
    /** 监听事件 */
    on: (event: string, callback: Function) => void;
    /** 移除事件监听 */
    off: (event: string, callback: Function) => void;
    /** 触发事件 */
    emit: (event: string, data?: any) => void;
    /** 初始化管理器 */
    init: () => void | Promise<void>;
    /** 销毁管理器 */
    destroy: () => void;
}
/**
 * Vue插件选项
 */
export interface VueSizePluginOptions extends SizeManagerOptions {
    /** 全局属性名 */
    globalPropertyName?: string;
}
/**
 * Vue组件属性
 */
export interface VueSizeComponentProps {
    /** 尺寸模式 */
    mode?: SizeMode;
    /** 是否显示切换器 */
    showSwitcher?: boolean;
    /** 切换器样式 */
    switcherStyle?: 'button' | 'select' | 'radio';
    /** 自定义类名 */
    className?: string;
}
//# sourceMappingURL=index.d.ts.map
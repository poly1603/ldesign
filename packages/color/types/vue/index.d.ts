import { Ref, Plugin, App } from 'vue';
import { ThemeManagerInstance, ColorMode, ThemeManagerOptions, ThemeConfig } from '../core/types.js';

/**
 * Vue 3 集成
 */

/**
 * Vue 插件选项
 */
interface VueThemePluginOptions extends ThemeManagerOptions {
    /** 注入键名 */
    injectKey?: string | symbol;
}
/**
 * 主题管理器注入键
 */
declare const THEME_MANAGER_KEY: unique symbol;
/**
 * Vue 主题管理器组合式 API
 */
interface UseThemeReturn {
    /** 主题管理器实例 */
    themeManager: ThemeManagerInstance;
    /** 当前主题名称 */
    currentTheme: Ref<string>;
    /** 当前颜色模式 */
    currentMode: Ref<ColorMode>;
    /** 是否为深色模式 */
    isDark: Ref<boolean>;
    /** 可用主题列表 */
    availableThemes: Ref<string[]>;
    /** 设置主题 */
    setTheme: (theme: string, mode?: ColorMode) => Promise<void>;
    /** 设置颜色模式 */
    setMode: (mode: ColorMode) => Promise<void>;
    /** 切换颜色模式 */
    toggleMode: () => Promise<void>;
    /** 注册主题 */
    registerTheme: (config: ThemeConfig) => void;
    /** 获取主题配置 */
    getThemeConfig: (name: string) => ThemeConfig | undefined;
}
/**
 * 使用主题管理器的组合式 API
 */
declare function useTheme(manager?: ThemeManagerInstance): UseThemeReturn;
/**
 * Vue 主题管理器插件
 */
declare const ThemePlugin: Plugin;
/**
 * 创建主题管理器提供者组合式 API
 */
declare function provideThemeManager(manager: ThemeManagerInstance, key?: string | symbol): void;
/**
 * 注入主题管理器组合式 API
 */
declare function injectThemeManager(key?: string | symbol): ThemeManagerInstance | undefined;
/**
 * 创建主题切换器组合式 API
 */
declare function useThemeToggle(manager?: ThemeManagerInstance): {
    currentMode: Ref<ColorMode>;
    toggle: () => Promise<void>;
    isLight: any;
    isDark: any;
};
/**
 * 创建主题选择器组合式 API
 */
declare function useThemeSelector(manager?: ThemeManagerInstance): {
    currentTheme: Ref<string>;
    availableThemes: Ref<string[]>;
    themeConfigs: any;
    selectTheme: (theme: string) => Promise<void>;
    setTheme: (theme: string, mode?: ColorMode) => Promise<void>;
};
/**
 * 创建系统主题同步组合式 API
 */
declare function useSystemThemeSync(manager?: ThemeManagerInstance): {
    systemTheme: any;
    syncWithSystem: () => Promise<void>;
    isSystemDark: any;
};
/**
 * 便捷的安装函数
 */
declare function installThemePlugin(app: App, options?: VueThemePluginOptions): void;
declare module 'vue' {
    interface ComponentCustomProperties {
        $themeManager: ThemeManagerInstance;
        $theme: {
            current: string;
            mode: ColorMode;
            setTheme: (theme: string, mode?: ColorMode) => Promise<void>;
            setMode: (mode: ColorMode) => Promise<void>;
        };
    }
}

export { THEME_MANAGER_KEY, ThemePlugin, injectThemeManager, installThemePlugin, provideThemeManager, useSystemThemeSync, useTheme, useThemeSelector, useThemeToggle };
export type { UseThemeReturn, VueThemePluginOptions };

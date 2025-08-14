import '../node_modules/.pnpm/@vue_runtime-dom@3.5.18/node_modules/@vue/runtime-dom/dist/runtime-dom.d.js';
import { SizeMode, SizeConfig, SizeManager, SizeChangeEvent } from '../types/index.js';
import { Ref, ComputedRef } from '../node_modules/.pnpm/@vue_reactivity@3.5.18/node_modules/@vue/reactivity/dist/reactivity.d.js';
import '../node_modules/.pnpm/@vue_runtime-core@3.5.18/node_modules/@vue/runtime-core/dist/runtime-core.d.js';

/**
 * useSize Hook 选项
 */
interface UseSizeOptions {
    /** 是否使用全局管理器 */
    global?: boolean;
    /** 初始尺寸模式 */
    initialMode?: SizeMode;
    /** 是否自动注入CSS */
    autoInject?: boolean;
}
/**
 * useSize Hook 返回值
 */
interface UseSizeReturn {
    /** 当前尺寸模式 */
    currentMode: Ref<SizeMode>;
    /** 当前尺寸配置 */
    currentConfig: Ref<SizeConfig>;
    /** 当前模式显示名称 */
    currentModeDisplayName: Ref<string>;
    /** 设置尺寸模式 */
    setMode: (mode: SizeMode) => void;
    /** 切换到下一个尺寸模式 */
    nextMode: () => void;
    /** 切换到上一个尺寸模式 */
    previousMode: () => void;
    /** 获取尺寸配置 */
    getConfig: (mode?: SizeMode) => SizeConfig;
    /** 生成CSS变量 */
    generateCSSVariables: (mode?: SizeMode) => Record<string, string>;
    /** 注入CSS */
    injectCSS: (mode?: SizeMode) => void;
    /** 移除CSS */
    removeCSS: () => void;
    /** 尺寸管理器实例 */
    sizeManager: SizeManager;
}
/**
 * 使用尺寸管理 Hook
 */
declare function useSize(options?: UseSizeOptions): UseSizeReturn;
/**
 * 使用全局尺寸管理 Hook
 */
declare function useGlobalSize(): UseSizeReturn;
/**
 * 使用尺寸切换器 Hook
 */
declare function useSizeSwitcher(options?: UseSizeOptions): {
    availableModes: SizeMode[];
    switchToMode: (mode: string) => void;
    getModeDisplayName: (mode: SizeMode) => string;
    /** 当前尺寸模式 */
    currentMode: Ref<SizeMode>;
    /** 当前尺寸配置 */
    currentConfig: Ref<SizeConfig>;
    /** 当前模式显示名称 */
    currentModeDisplayName: Ref<string>;
    /** 设置尺寸模式 */
    setMode: (mode: SizeMode) => void;
    /** 切换到下一个尺寸模式 */
    nextMode: () => void;
    /** 切换到上一个尺寸模式 */
    previousMode: () => void;
    /** 获取尺寸配置 */
    getConfig: (mode?: SizeMode) => SizeConfig;
    /** 生成CSS变量 */
    generateCSSVariables: (mode?: SizeMode) => Record<string, string>;
    /** 注入CSS */
    injectCSS: (mode?: SizeMode) => void;
    /** 移除CSS */
    removeCSS: () => void;
    /** 尺寸管理器实例 */
    sizeManager: SizeManager;
};
/**
 * 使用尺寸响应式 Hook
 */
declare function useSizeResponsive(breakpoints?: Partial<Record<SizeMode, boolean>>): {
    currentMode: Ref<SizeMode, SizeMode>;
    isSmall: ComputedRef<boolean>;
    isMedium: ComputedRef<boolean>;
    isLarge: ComputedRef<boolean>;
    isExtraLarge: ComputedRef<boolean>;
    isAtLeast: (mode: SizeMode) => boolean;
    isAtMost: (mode: SizeMode) => boolean;
};
/**
 * 使用尺寸监听器 Hook
 */
declare function useSizeWatcher(callback: (event: SizeChangeEvent) => void, options?: UseSizeOptions): {
    unsubscribe: () => void;
};

export { useGlobalSize, useSize, useSizeResponsive, useSizeSwitcher, useSizeWatcher };
export type { UseSizeOptions, UseSizeReturn };

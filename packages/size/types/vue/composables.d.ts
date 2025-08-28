/**
 * Vue Composition API Hooks
 */
import type { SizeChangeEvent, SizeConfig, SizeManager, SizeMode } from '../types';
import { type Ref } from 'vue';
/**
 * useSize Hook 选项
 */
export interface UseSizeOptions {
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
export interface UseSizeReturn {
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
export declare function useSize(options?: UseSizeOptions): UseSizeReturn;
/**
 * 使用全局尺寸管理 Hook
 */
export declare function useGlobalSize(): UseSizeReturn;
/**
 * 使用尺寸切换器 Hook
 */
export declare function useSizeSwitcher(options?: UseSizeOptions): {
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
export declare function useSizeResponsive(_breakpoints?: Partial<Record<SizeMode, boolean>>): {
    currentMode: Ref<SizeMode, SizeMode>;
    isSmall: import("vue").ComputedRef<boolean>;
    isMedium: import("vue").ComputedRef<boolean>;
    isLarge: import("vue").ComputedRef<boolean>;
    isExtraLarge: import("vue").ComputedRef<boolean>;
    isAtLeast: (mode: SizeMode) => boolean;
    isAtMost: (mode: SizeMode) => boolean;
};
/**
 * 使用尺寸监听器 Hook
 */
export declare function useSizeWatcher(callback: (event: SizeChangeEvent) => void, options?: UseSizeOptions): {
    unsubscribe: () => void;
};
/**
 * 使用智能尺寸管理 Hook
 * 自动检测用户偏好和设备特性
 */
export declare function useSmartSize(options?: UseSizeOptions & {
    /** 是否启用自动检测 */
    autoDetect?: boolean;
    /** 是否启用响应式 */
    responsive?: boolean;
    /** 是否记住用户选择 */
    remember?: boolean;
}): {
    recommendedMode: Ref<SizeMode, SizeMode>;
    userPreferredMode: Ref<SizeMode | null, SizeMode | null>;
    isUsingRecommended: import("vue").ComputedRef<boolean>;
    isUserOverride: import("vue").ComputedRef<boolean>;
    setMode: (mode: SizeMode, isUserChoice?: boolean) => void;
    resetToRecommended: () => void;
    /** 当前尺寸模式 */
    currentMode: Ref<SizeMode>;
    /** 当前尺寸配置 */
    currentConfig: Ref<SizeConfig>;
    /** 当前模式显示名称 */
    currentModeDisplayName: Ref<string>;
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
 * 使用尺寸动画 Hook
 */
export declare function useSizeAnimation(options?: {
    /** 动画持续时间 */
    duration?: string;
    /** 动画缓动函数 */
    easing?: string;
    /** 是否启用动画 */
    enabled?: boolean;
}): {
    currentMode: Ref<SizeMode, SizeMode>;
    isAnimating: Ref<boolean, boolean>;
    setMode: (mode: SizeMode) => Promise<void>;
    setModeInstant: (mode: SizeMode) => void;
};
/**
 * 使用尺寸状态管理 Hook
 * 提供完整的状态管理功能
 */
export declare function useSizeState(options?: UseSizeOptions & {
    /** 是否启用历史记录 */
    enableHistory?: boolean;
    /** 历史记录最大长度 */
    maxHistoryLength?: number;
}): {
    history: Ref<SizeMode[], SizeMode[]>;
    historyIndex: Ref<number, number>;
    setMode: (mode: SizeMode) => void;
    undo: () => void;
    redo: () => void;
    clearHistory: () => void;
    canUndo: Ref<boolean, boolean>;
    canRedo: Ref<boolean, boolean>;
    historyLength: Ref<number, number>;
    /** 当前尺寸模式 */
    currentMode: Ref<SizeMode>;
    /** 当前尺寸配置 */
    currentConfig: Ref<SizeConfig>;
    /** 当前模式显示名称 */
    currentModeDisplayName: Ref<string>;
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
//# sourceMappingURL=composables.d.ts.map
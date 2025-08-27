import { SizeMode, SizeManagerOptions, SizeManager } from '../types/index.js';
import { getRecommendedSizeMode } from '../utils/index.js';

/**
 * 快速设置全局尺寸模式
 */
declare function setGlobalSize(mode: SizeMode): void;
/**
 * 获取当前全局尺寸模式
 */
declare function getGlobalSize(): SizeMode;
/**
 * 切换到下一个尺寸模式
 */
declare function nextGlobalSize(): void;
/**
 * 切换到上一个尺寸模式
 */
declare function previousGlobalSize(): void;
/**
 * 在指定的尺寸模式之间循环切换
 */
declare function toggleGlobalSize(modes?: SizeMode[]): void;
/**
 * 重置为推荐的尺寸模式
 */
declare function resetToRecommendedSize(): void;
/**
 * 自动检测并设置最佳尺寸模式
 */
declare function autoDetectSize(): void;
/**
 * 监听全局尺寸变化
 */
declare function watchGlobalSize(callback: (mode: SizeMode) => void): () => void;
/**
 * 创建尺寸管理器的便捷函数
 */
declare function createSize(options?: SizeManagerOptions): SizeManager;
/**
 * 批量设置尺寸配置
 */
declare function configureSizes(_configs: Record<SizeMode, any>): void;
/**
 * 获取所有可用的尺寸模式
 */
declare function getAvailableSizes(): SizeMode[];
/**
 * 检查是否为有效的尺寸模式
 */
declare function isValidSize(mode: string): mode is SizeMode;
/**
 * 获取尺寸模式的显示名称
 */
declare function getSizeDisplayName(mode: SizeMode): string;
/**
 * 获取尺寸模式的描述
 */
declare function getSizeDescription(mode: SizeMode): string;
/**
 * 比较两个尺寸模式的大小
 */
declare function compareSizes(a: SizeMode, b: SizeMode): number;
/**
 * 获取比指定模式更大的模式
 */
declare function getLargerSize(mode: SizeMode): SizeMode | null;
/**
 * 获取比指定模式更小的模式
 */
declare function getSmallerSize(mode: SizeMode): SizeMode | null;
/**
 * 检查是否为最小尺寸
 */
declare function isSmallestSize(mode: SizeMode): boolean;
/**
 * 检查是否为最大尺寸
 */
declare function isLargestSize(mode: SizeMode): boolean;
/**
 * 获取尺寸范围内的所有模式
 */
declare function getSizeRange(from: SizeMode, to: SizeMode): SizeMode[];
/**
 * 创建尺寸切换器
 */
declare function createSizeToggler(modes?: SizeMode[]): {
    current: () => SizeMode;
    next: () => SizeMode;
    previous: () => SizeMode;
    set: (mode: SizeMode) => void;
    reset: () => void;
};
/**
 * 创建尺寸状态管理器
 */
declare function createSizeState(initialMode?: SizeMode): {
    get: () => SizeMode;
    set: (mode: SizeMode) => void;
    subscribe: (listener: (mode: SizeMode) => void) => () => void;
    destroy: () => void;
};
/**
 * 便捷的尺寸管理对象
 */
declare const Size: {
    get: typeof getGlobalSize;
    set: typeof setGlobalSize;
    next: typeof nextGlobalSize;
    previous: typeof previousGlobalSize;
    toggle: typeof toggleGlobalSize;
    auto: typeof autoDetectSize;
    reset: typeof resetToRecommendedSize;
    recommended: typeof getRecommendedSizeMode;
    watch: typeof watchGlobalSize;
    isValid: typeof isValidSize;
    compare: typeof compareSizes;
    displayName: typeof getSizeDisplayName;
    description: typeof getSizeDescription;
    larger: typeof getLargerSize;
    smaller: typeof getSmallerSize;
    range: typeof getSizeRange;
    isSmallest: typeof isSmallestSize;
    isLargest: typeof isLargestSize;
    createToggler: typeof createSizeToggler;
    createState: typeof createSizeState;
    createManager: typeof createSize;
    MODES: SizeMode[];
    SMALL: "small";
    MEDIUM: "medium";
    LARGE: "large";
};

export { Size, autoDetectSize, compareSizes, configureSizes, createSize, createSizeState, createSizeToggler, Size as default, getAvailableSizes, getGlobalSize, getLargerSize, getSizeDescription, getSizeDisplayName, getSizeRange, getSmallerSize, isLargestSize, isSmallestSize, isValidSize, nextGlobalSize, previousGlobalSize, resetToRecommendedSize, setGlobalSize, toggleGlobalSize, watchGlobalSize };

/**
 * 工具函数
 */
import type { SizeMode } from '../types';
/**
 * 检查是否为有效的尺寸模式
 */
export declare function isValidSizeMode(mode: string): mode is SizeMode;
/**
 * 获取下一个尺寸模式
 */
export declare function getNextSizeMode(currentMode: SizeMode): SizeMode;
/**
 * 获取上一个尺寸模式
 */
export declare function getPreviousSizeMode(currentMode: SizeMode): SizeMode;
/**
 * 比较两个尺寸模式的大小
 */
export declare function compareSizeModes(mode1: SizeMode, mode2: SizeMode): number;
/**
 * 获取尺寸模式的显示名称
 */
export declare function getSizeModeDisplayName(mode: SizeMode): string;
/**
 * 从字符串解析尺寸模式
 */
export declare function parseSizeMode(value: string): SizeMode | null;
/**
 * 计算尺寸缩放比例
 */
export declare function calculateSizeScale(fromMode: SizeMode, toMode: SizeMode): number;
/**
 * 格式化CSS值
 */
export declare function formatCSSValue(value: string | number, unit?: string): string;
/**
 * 解析CSS值
 */
export declare function parseCSSValue(value: string): {
    number: number;
    unit: string;
};
/**
 * 深度合并配置对象
 */
export declare function deepMergeConfig<T extends Record<string, any>>(target: T, source: Partial<T>): T;
/**
 * 防抖函数
 */
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * 节流函数
 */
export declare function throttle<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
export declare function isValidInput(input: unknown): boolean;
/**
 * 检测用户偏好的尺寸模式
 */
export declare function detectPreferredSizeMode(): SizeMode;
/**
 * 获取设备像素比
 */
export declare function getDevicePixelRatio(): number;
/**
 * 检查是否为移动设备
 */
export declare function isMobileDevice(): boolean;
/**
 * 获取视口尺寸
 */
export declare function getViewportSize(): {
    width: number;
    height: number;
};
/**
 * 根据视口尺寸推荐尺寸模式
 */
export declare function getRecommendedSizeMode(): SizeMode;
/**
 * 创建CSS变量名
 */
export declare function createCSSVariableName(prefix: string, name: string): string;
/**
 * 解析CSS变量名
 */
export declare function parseCSSVariableName(variableName: string): {
    prefix: string;
    name: string;
};
/**
 * 监听媒体查询变化
 */
export declare function watchMediaQuery(query: string, callback: (matches: boolean) => void): () => void;
/**
 * 监听视口尺寸变化
 */
export declare function watchViewportSize(callback: (size: {
    width: number;
    height: number;
}) => void): () => void;
/**
 * 创建响应式尺寸监听器
 */
export declare function createResponsiveSizeWatcher(callback: (recommendedMode: SizeMode) => void): () => void;
//# sourceMappingURL=index.d.ts.map
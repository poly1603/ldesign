/**
 * 尺寸配置预设
 */
import type { SizeConfig, SizeMode } from '../types';
/**
 * 小尺寸配置
 */
export declare const smallSizeConfig: SizeConfig;
/**
 * 中等尺寸配置（默认）
 */
export declare const mediumSizeConfig: SizeConfig;
/**
 * 大尺寸配置
 */
export declare const largeSizeConfig: SizeConfig;
/**
 * 超大尺寸配置
 */
export declare const extraLargeSizeConfig: SizeConfig;
/**
 * 所有尺寸配置的映射
 */
export declare const sizeConfigs: Record<SizeMode, SizeConfig>;
/**
 * 获取指定模式的尺寸配置
 */
export declare function getSizeConfig(mode: SizeMode): SizeConfig;
/**
 * 获取所有可用的尺寸模式
 */
export declare function getAvailableModes(): SizeMode[];
//# sourceMappingURL=presets.d.ts.map
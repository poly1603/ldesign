import { SizeConfig, SizeMode } from '../types/index.js'

/**
 * 尺寸配置预设
 */

/**
 * 小尺寸配置
 */
declare const smallSizeConfig: SizeConfig
/**
 * 中等尺寸配置（默认）
 */
declare const mediumSizeConfig: SizeConfig
/**
 * 大尺寸配置
 */
declare const largeSizeConfig: SizeConfig
/**
 * 超大尺寸配置
 */
declare const extraLargeSizeConfig: SizeConfig
/**
 * 所有尺寸配置的映射
 */
declare const sizeConfigs: Record<SizeMode, SizeConfig>
/**
 * 获取指定模式的尺寸配置
 */
declare function getSizeConfig(mode: SizeMode): SizeConfig
/**
 * 获取所有可用的尺寸模式
 */
declare function getAvailableModes(): SizeMode[]

export {
  extraLargeSizeConfig,
  getAvailableModes,
  getSizeConfig,
  largeSizeConfig,
  mediumSizeConfig,
  sizeConfigs,
  smallSizeConfig,
}

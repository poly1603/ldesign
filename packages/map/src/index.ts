/**
 * @ldesign/map 主入口文件
 * 基于 OpenLayers 的通用地图插件
 * 
 * @author LDesign Team
 * @version 1.0.0
 * @license MIT
 */

// 导出核心类
export { LDesignMap, MapConfigManager, DEFAULT_MAP_CONFIG } from './core';

// 导出所有类型定义
export type * from './types';

// 导出管理器
export * from './managers';

// 导出工具模块
export * from './tools';

// 导出主题模块
export * from './themes';

// 导出服务模块
export * from './services/MapServices';

// 导出枚举类型（需要单独导出）
export { LayerType, MapEventType, DrawType, DrawMode, ControlType, LogLevel, MeasureType } from './types';

// 导出版本信息
export const VERSION = '1.0.0';

// 导出默认实例创建函数
import { LDesignMap } from './core';
import type { MapConfig } from './types';

/**
 * 创建地图实例的便捷函数
 * @param config 地图配置
 * @returns 地图实例
 */
export function createMap(config: MapConfig): LDesignMap {
  return new LDesignMap(config);
}

/**
 * 默认导出
 */
export default LDesignMap;

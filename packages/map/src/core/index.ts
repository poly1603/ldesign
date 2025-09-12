/**
 * 核心模块入口文件
 * 导出核心地图类和配置管理器
 */

export { LDesignMap } from './LDesignMap';
export { MapConfigManager, DEFAULT_MAP_CONFIG } from './MapConfig';

// 重新导出类型定义
export type * from '../types';

/**
 * 地图配置管理类
 * 负责管理地图的所有配置选项，提供默认配置和配置验证功能
 */

import type { MapConfig, MapStyle, ValidationResult } from '../types';
import type { Coordinate } from 'ol/coordinate';

/**
 * 默认地图配置
 */
export const DEFAULT_MAP_CONFIG: Required<MapConfig> = {
  container: '',
  center: [116.404, 39.915], // 北京坐标
  zoom: 10,
  minZoom: 0,
  maxZoom: 20,
  projection: 'EPSG:3857', // Web Mercator 投影
  rotation: 0,
  extent: undefined as any,
  interactions: {
    dragPan: true,
    mouseWheelZoom: true,
    doubleClickZoom: true,
    keyboard: true,
    dragRotate: false,
    dragZoom: false
  },
  controls: {
    zoom: true,
    fullScreen: false,
    scaleLine: false,
    mousePosition: false,
    rotate: false,
    attribution: true
  },
  theme: 'default',
  style: {
    backgroundColor: '#f8f9fa',
    border: {
      width: 1,
      color: '#dee2e6',
      style: 'solid'
    },
    borderRadius: 4,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    className: 'ldesign-map'
  },
  performance: {
    enableTileCache: true,
    cacheSize: 100, // MB
    lazyLoad: true,
    viewportOptimization: true
  }
};

/**
 * 地图配置管理器类
 * 提供配置合并、验证、获取等功能
 */
export class MapConfigManager {
  private config: Required<MapConfig>;
  private originalConfig: MapConfig;

  /**
   * 构造函数
   * @param userConfig 用户提供的配置
   */
  constructor(userConfig: MapConfig) {
    // 不要使用展开运算符，因为它会序列化 DOM 元素
    this.originalConfig = userConfig;
    this.config = this.mergeConfig(userConfig);
    this.validateConfig();
  }

  /**
   * 合并用户配置和默认配置
   * @param userConfig 用户配置
   * @returns 合并后的完整配置
   */
  private mergeConfig(userConfig: MapConfig): Required<MapConfig> {
    const merged = { ...DEFAULT_MAP_CONFIG };

    // 合并基础配置
    Object.keys(userConfig).forEach(key => {
      const value = (userConfig as any)[key];
      if (value !== undefined) {
        if (key === 'container') {
          // 容器属性直接赋值，不要使用展开运算符
          (merged as any)[key] = value;
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // 深度合并对象类型的配置
          (merged as any)[key] = { ...(merged as any)[key], ...value };
        } else {
          // 直接赋值基础类型
          (merged as any)[key] = value;
        }
      }
    });

    return merged;
  }

  /**
   * 验证配置的有效性
   * @returns 验证结果
   */
  private validateConfig(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证容器
    if (!this.config.container) {
      errors.push('地图容器不能为空');
    }

    // 验证中心点坐标
    if (!Array.isArray(this.config.center) || this.config.center.length !== 2) {
      errors.push('地图中心点坐标格式不正确，应为 [经度, 纬度]');
    } else {
      const [lng, lat] = this.config.center;
      if (typeof lng !== 'number' || typeof lat !== 'number') {
        errors.push('地图中心点坐标必须为数字');
      } else {
        if (lng < -180 || lng > 180) {
          warnings.push('经度超出有效范围 (-180, 180)');
        }
        if (lat < -90 || lat > 90) {
          warnings.push('纬度超出有效范围 (-90, 90)');
        }
      }
    }

    // 验证缩放级别
    if (this.config.zoom < this.config.minZoom || this.config.zoom > this.config.maxZoom) {
      errors.push(`缩放级别 ${this.config.zoom} 超出范围 [${this.config.minZoom}, ${this.config.maxZoom}]`);
    }

    if (this.config.minZoom < 0) {
      warnings.push('最小缩放级别小于 0 可能导致性能问题');
    }

    if (this.config.maxZoom > 22) {
      warnings.push('最大缩放级别大于 22 可能导致瓦片加载问题');
    }

    // 验证旋转角度
    if (this.config.rotation < 0 || this.config.rotation >= 2 * Math.PI) {
      warnings.push('旋转角度建议在 [0, 2π) 范围内');
    }

    // 验证性能配置
    if (this.config.performance.cacheSize && this.config.performance.cacheSize > 500) {
      warnings.push('缓存大小过大可能导致内存问题');
    }

    const result: ValidationResult = {
      valid: errors.length === 0,
      errors,
      warnings
    };

    // 在开发模式下输出警告
    if (process.env.NODE_ENV === 'development') {
      if (warnings.length > 0) {
        console.warn('[LDesignMap] 配置警告:', warnings);
      }
      if (errors.length > 0) {
        console.error('[LDesignMap] 配置错误:', errors);
      }
    }

    return result;
  }

  /**
   * 获取完整配置
   * @returns 完整的地图配置
   */
  getConfig(): Required<MapConfig> {
    return { ...this.config };
  }

  /**
   * 获取原始用户配置
   * @returns 用户提供的原始配置
   */
  getOriginalConfig(): MapConfig {
    return { ...this.originalConfig };
  }

  /**
   * 更新配置
   * @param updates 要更新的配置项
   * @returns 是否更新成功
   */
  updateConfig(updates: Partial<MapConfig>): boolean {
    try {
      const newConfig = this.mergeConfig({ ...this.originalConfig, ...updates });
      const validation = this.validateConfig();

      if (validation.valid) {
        this.config = newConfig;
        this.originalConfig = { ...this.originalConfig, ...updates };
        return true;
      } else {
        console.error('[LDesignMap] 配置更新失败:', validation.errors);
        return false;
      }
    } catch (error) {
      console.error('[LDesignMap] 配置更新异常:', error);
      return false;
    }
  }

  /**
   * 获取特定配置项
   * @param key 配置项键名
   * @returns 配置项值
   */
  get<K extends keyof MapConfig>(key: K): Required<MapConfig>[K] {
    return this.config[key];
  }

  /**
   * 设置特定配置项
   * @param key 配置项键名
   * @param value 配置项值
   * @returns 是否设置成功
   */
  set<K extends keyof MapConfig>(key: K, value: MapConfig[K]): boolean {
    return this.updateConfig({ [key]: value } as Partial<MapConfig>);
  }

  /**
   * 重置配置为默认值
   */
  reset(): void {
    this.config = { ...DEFAULT_MAP_CONFIG };
    this.originalConfig = {};
  }

  /**
   * 获取容器元素
   * @returns DOM 元素或 null
   */
  getContainerElement(): HTMLElement | null {
    const container = this.config.container;

    console.log('[MapConfigManager] 容器类型检查:', typeof container);
    console.log('[MapConfigManager] 容器构造函数:', container?.constructor?.name);
    console.log('[MapConfigManager] 容器 nodeType:', container?.nodeType);
    console.log('[MapConfigManager] 是否为 HTMLElement:', container instanceof HTMLElement);
    console.log('[MapConfigManager] 是否为 Node:', container instanceof Node);
    console.log('[MapConfigManager] 容器对象:', container);

    if (typeof container === 'string') {
      const element = document.querySelector(container);
      console.log('[MapConfigManager] 通过选择器找到元素:', element);
      return element;
    } else if (container && typeof container === 'object' && container.nodeType === Node.ELEMENT_NODE) {
      // 更宽松的检查，不依赖 instanceof
      console.log('[MapConfigManager] 直接使用传入的元素:', container);
      return container as HTMLElement;
    }

    console.log('[MapConfigManager] 无法识别的容器类型');
    return null;
  }

  /**
   * 验证容器是否有效
   * @returns 容器是否有效
   */
  isContainerValid(): boolean {
    const element = this.getContainerElement();
    const isValid = element !== null && element.nodeType === Node.ELEMENT_NODE;

    // 添加调试信息
    if (!isValid) {
      console.error('[MapConfigManager] 容器验证失败:', {
        element,
        nodeType: element?.nodeType,
        expectedNodeType: Node.ELEMENT_NODE,
        containerConfig: this.config.container
      });
    } else {
      console.log('[MapConfigManager] 容器验证成功:', {
        element: element.tagName,
        size: `${element.offsetWidth}x${element.offsetHeight}`
      });
    }

    return isValid;
  }

  /**
   * 获取地图样式配置
   * @returns 地图样式配置
   */
  getMapStyle(): Required<MapStyle> {
    return this.config.style;
  }

  /**
   * 获取性能配置
   * @returns 性能配置
   */
  getPerformanceConfig() {
    return this.config.performance;
  }

  /**
   * 获取交互配置
   * @returns 交互配置
   */
  getInteractionConfig() {
    return this.config.interactions;
  }

  /**
   * 获取控件配置
   * @returns 控件配置
   */
  getControlConfig() {
    return this.config.controls;
  }

  /**
   * 导出配置为 JSON 字符串
   * @returns JSON 字符串
   */
  toJSON(): string {
    return JSON.stringify(this.originalConfig, null, 2);
  }

  /**
   * 从 JSON 字符串导入配置
   * @param json JSON 字符串
   * @returns 是否导入成功
   */
  fromJSON(json: string): boolean {
    try {
      const config = JSON.parse(json);
      return this.updateConfig(config);
    } catch (error) {
      console.error('[LDesignMap] 配置导入失败:', error);
      return false;
    }
  }

  /**
   * 克隆配置管理器
   * @returns 新的配置管理器实例
   */
  clone(): MapConfigManager {
    return new MapConfigManager(this.originalConfig);
  }
}

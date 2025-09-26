/**
 * @ldesign/cropper 配置管理器
 * 
 * 负责管理裁剪器的配置，包括验证、合并、持久化等功能
 */

import type { CropperConfig } from '../types';
import { isValidConfig } from '../utils/validation';
import { globalPerformanceMonitor } from '../utils/performance';

// ============================================================================
// 配置管理器接口
// ============================================================================

/**
 * 配置变更事件接口
 */
export interface ConfigChangeEvent {
  /** 事件类型 */
  type: 'config-change';
  /** 变更的配置键 */
  changedKeys: string[];
  /** 旧配置 */
  oldConfig: Partial<CropperConfig>;
  /** 新配置 */
  newConfig: Partial<CropperConfig>;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 配置管理器选项接口
 */
export interface ConfigManagerOptions {
  /** 是否启用配置验证 */
  enableValidation: boolean;
  /** 是否启用配置持久化 */
  enablePersistence: boolean;
  /** 持久化存储键名 */
  storageKey: string;
  /** 是否启用深度合并 */
  enableDeepMerge: boolean;
  /** 是否启用配置变更事件 */
  enableChangeEvents: boolean;
}

/**
 * 默认配置管理器选项
 */
export const DEFAULT_CONFIG_MANAGER_OPTIONS: ConfigManagerOptions = {
  enableValidation: true,
  enablePersistence: false,
  storageKey: 'ldesign-cropper-config',
  enableDeepMerge: true,
  enableChangeEvents: true
};

// ============================================================================
// 配置管理器类
// ============================================================================

/**
 * 配置管理器类
 * 负责管理裁剪器的配置系统
 */
export class ConfigManager {
  private config: CropperConfig;
  private options: ConfigManagerOptions;
  private eventListeners: Map<string, Set<(event: ConfigChangeEvent) => void>> = new Map();
  private configHistory: CropperConfig[] = [];
  private maxHistorySize: number = 10;

  constructor(
    initialConfig: CropperConfig,
    options: Partial<ConfigManagerOptions> = {}
  ) {
    this.options = { ...DEFAULT_CONFIG_MANAGER_OPTIONS, ...options };
    
    // 验证初始配置
    if (this.options.enableValidation && !isValidConfig(initialConfig)) {
      throw new Error('Invalid initial configuration');
    }

    // 尝试从存储加载配置
    const storedConfig = this.loadFromStorage();
    this.config = storedConfig ? this.mergeConfigs(initialConfig, storedConfig) : initialConfig;
    
    // 保存到历史记录
    this.saveToHistory(this.config);
  }

  // ============================================================================
  // 公共API - 配置操作
  // ============================================================================

  /**
   * 获取当前配置
   * @returns 当前配置的副本
   */
  getConfig(): CropperConfig {
    return this.deepClone(this.config);
  }

  /**
   * 获取配置项
   * @param key 配置键
   * @returns 配置值
   */
  get<K extends keyof CropperConfig>(key: K): CropperConfig[K] {
    return this.config[key];
  }

  /**
   * 设置配置项
   * @param key 配置键
   * @param value 配置值
   */
  set<K extends keyof CropperConfig>(key: K, value: CropperConfig[K]): void {
    const oldConfig = this.deepClone(this.config);
    this.config[key] = value;

    // 验证配置
    if (this.options.enableValidation && !isValidConfig(this.config)) {
      this.config = oldConfig; // 回滚
      throw new Error(`Invalid configuration value for key: ${String(key)}`);
    }

    // 触发变更事件
    if (this.options.enableChangeEvents) {
      this.emitConfigChange([String(key)], { [key]: oldConfig[key] }, { [key]: value });
    }

    // 保存到存储和历史
    this.saveToStorage();
    this.saveToHistory(this.config);
  }

  /**
   * 更新配置
   * @param updates 配置更新
   */
  update(updates: Partial<CropperConfig>): void {
    const startTime = performance.now();

    try {
      const oldConfig = this.deepClone(this.config);
      const newConfig = this.options.enableDeepMerge 
        ? this.mergeConfigs(this.config, updates)
        : { ...this.config, ...updates };

      // 验证新配置
      if (this.options.enableValidation && !isValidConfig(newConfig)) {
        throw new Error('Invalid configuration update');
      }

      this.config = newConfig;

      // 获取变更的键
      const changedKeys = this.getChangedKeys(oldConfig, newConfig);

      // 触发变更事件
      if (this.options.enableChangeEvents && changedKeys.length > 0) {
        this.emitConfigChange(changedKeys, oldConfig, updates);
      }

      // 保存到存储和历史
      this.saveToStorage();
      this.saveToHistory(this.config);

      globalPerformanceMonitor.record('config-update', performance.now() - startTime);
    } catch (error) {
      globalPerformanceMonitor.record('config-update-error', performance.now() - startTime);
      throw error;
    }
  }

  /**
   * 重置配置
   * @param config 新配置（可选）
   */
  reset(config?: CropperConfig): void {
    const oldConfig = this.deepClone(this.config);
    
    if (config) {
      if (this.options.enableValidation && !isValidConfig(config)) {
        throw new Error('Invalid reset configuration');
      }
      this.config = config;
    } else {
      // 重置为默认配置
      this.config = this.getDefaultConfig();
    }

    // 触发变更事件
    if (this.options.enableChangeEvents) {
      const changedKeys = Object.keys(this.config) as (keyof CropperConfig)[];
      this.emitConfigChange(changedKeys.map(String), oldConfig, this.config);
    }

    // 保存到存储和历史
    this.saveToStorage();
    this.saveToHistory(this.config);
  }

  // ============================================================================
  // 公共API - 历史记录
  // ============================================================================

  /**
   * 撤销配置变更
   * @returns 是否成功撤销
   */
  undo(): boolean {
    if (this.configHistory.length < 2) {
      return false;
    }

    // 移除当前配置
    this.configHistory.pop();
    
    // 获取上一个配置
    const previousConfig = this.configHistory[this.configHistory.length - 1];
    const oldConfig = this.deepClone(this.config);
    
    this.config = this.deepClone(previousConfig);

    // 触发变更事件
    if (this.options.enableChangeEvents) {
      const changedKeys = this.getChangedKeys(oldConfig, this.config);
      this.emitConfigChange(changedKeys, oldConfig, this.config);
    }

    // 保存到存储
    this.saveToStorage();

    return true;
  }

  /**
   * 获取配置历史
   * @returns 配置历史数组
   */
  getHistory(): CropperConfig[] {
    return this.configHistory.map(config => this.deepClone(config));
  }

  /**
   * 清除配置历史
   */
  clearHistory(): void {
    this.configHistory = [this.deepClone(this.config)];
  }

  // ============================================================================
  // 公共API - 事件系统
  // ============================================================================

  /**
   * 添加配置变更监听器
   * @param listener 监听器函数
   */
  onConfigChange(listener: (event: ConfigChangeEvent) => void): void {
    if (!this.eventListeners.has('config-change')) {
      this.eventListeners.set('config-change', new Set());
    }
    this.eventListeners.get('config-change')!.add(listener);
  }

  /**
   * 移除配置变更监听器
   * @param listener 监听器函数
   */
  offConfigChange(listener: (event: ConfigChangeEvent) => void): void {
    const listeners = this.eventListeners.get('config-change');
    if (listeners) {
      listeners.delete(listener);
    }
  }

  // ============================================================================
  // 公共API - 持久化
  // ============================================================================

  /**
   * 导出配置
   * @returns 配置JSON字符串
   */
  export(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * 导入配置
   * @param configJson 配置JSON字符串
   */
  import(configJson: string): void {
    try {
      const importedConfig = JSON.parse(configJson) as CropperConfig;
      
      if (this.options.enableValidation && !isValidConfig(importedConfig)) {
        throw new Error('Invalid imported configuration');
      }

      this.update(importedConfig);
    } catch (error) {
      throw new Error(`Failed to import configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 销毁配置管理器
   */
  destroy(): void {
    this.eventListeners.clear();
    this.configHistory = [];
  }

  // ============================================================================
  // 私有方法
  // ============================================================================

  /**
   * 深度克隆对象
   * @param obj 要克隆的对象
   * @returns 克隆后的对象
   */
  private deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item)) as unknown as T;
    }

    const cloned = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }

    return cloned;
  }

  /**
   * 深度合并配置
   * @param target 目标配置
   * @param source 源配置
   * @returns 合并后的配置
   */
  private mergeConfigs(target: CropperConfig, source: Partial<CropperConfig>): CropperConfig {
    const result = this.deepClone(target);

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const sourceValue = source[key];
        const targetValue = result[key];

        if (sourceValue !== undefined) {
          if (typeof sourceValue === 'object' && sourceValue !== null && 
              typeof targetValue === 'object' && targetValue !== null &&
              !Array.isArray(sourceValue) && !Array.isArray(targetValue)) {
            result[key] = this.mergeConfigs(targetValue as any, sourceValue as any);
          } else {
            result[key] = sourceValue as any;
          }
        }
      }
    }

    return result;
  }

  /**
   * 获取变更的配置键
   * @param oldConfig 旧配置
   * @param newConfig 新配置
   * @returns 变更的键数组
   */
  private getChangedKeys(oldConfig: CropperConfig, newConfig: CropperConfig): string[] {
    const changedKeys: string[] = [];

    for (const key in newConfig) {
      if (Object.prototype.hasOwnProperty.call(newConfig, key)) {
        if (JSON.stringify(oldConfig[key]) !== JSON.stringify(newConfig[key])) {
          changedKeys.push(key);
        }
      }
    }

    return changedKeys;
  }

  /**
   * 发射配置变更事件
   * @param changedKeys 变更的键
   * @param oldConfig 旧配置
   * @param newConfig 新配置
   */
  private emitConfigChange(
    changedKeys: string[], 
    oldConfig: Partial<CropperConfig>, 
    newConfig: Partial<CropperConfig>
  ): void {
    const listeners = this.eventListeners.get('config-change');
    if (listeners) {
      const event: ConfigChangeEvent = {
        type: 'config-change',
        changedKeys,
        oldConfig,
        newConfig,
        timestamp: Date.now()
      };

      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in config change listener:', error);
        }
      });
    }
  }

  /**
   * 保存配置到历史记录
   * @param config 配置
   */
  private saveToHistory(config: CropperConfig): void {
    this.configHistory.push(this.deepClone(config));
    
    // 限制历史记录大小
    if (this.configHistory.length > this.maxHistorySize) {
      this.configHistory.shift();
    }
  }

  /**
   * 保存配置到存储
   */
  private saveToStorage(): void {
    if (!this.options.enablePersistence) {
      return;
    }

    try {
      const configJson = JSON.stringify(this.config);
      localStorage.setItem(this.options.storageKey, configJson);
    } catch (error) {
      console.warn('Failed to save configuration to storage:', error);
    }
  }

  /**
   * 从存储加载配置
   * @returns 加载的配置或null
   */
  private loadFromStorage(): CropperConfig | null {
    if (!this.options.enablePersistence) {
      return null;
    }

    try {
      const configJson = localStorage.getItem(this.options.storageKey);
      if (configJson) {
        return JSON.parse(configJson) as CropperConfig;
      }
    } catch (error) {
      console.warn('Failed to load configuration from storage:', error);
    }

    return null;
  }

  /**
   * 获取默认配置
   * @returns 默认配置
   */
  private getDefaultConfig(): CropperConfig {
    // 这里应该返回默认的裁剪器配置
    // 为了简化，我们返回一个基本的配置对象
    return {
      theme: 'light',
      language: 'zh-CN',
      responsive: true,
      shape: 'rectangle',
      aspectRatio: undefined,
      minCropSize: { width: 10, height: 10 },
      maxCropSize: undefined,
      minZoom: 0.1,
      maxZoom: 10,
      zoomStep: 0.1,
      enableRotation: true,
      rotationStep: 1,
      enableMouse: true,
      enableTouch: true,
      enableKeyboard: true,
      enableGestures: true,
      showGrid: true,
      showCenterLines: true,
      showRuleOfThirds: false,
      showToolbar: true,
      showControlPoints: true,
      exportFormat: 'png',
      exportQuality: 0.9,
      exportBackground: 'transparent'
    } as CropperConfig;
  }
}

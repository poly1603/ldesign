import { BaseProgressOptions } from '../types';

/**
 * 配置管理器
 */
export class ConfigManager<T extends BaseProgressOptions> {
  private config: T;
  private defaultConfig: Partial<T>;

  constructor(defaultConfig: Partial<T>) {
    this.defaultConfig = defaultConfig;
    this.config = { ...defaultConfig } as T;
  }

  /**
   * 获取配置
   */
  get<K extends keyof T>(key: K): T[K] {
    return this.config[key];
  }

  /**
   * 设置配置
   */
  set<K extends keyof T>(key: K, value: T[K]): void {
    this.config[key] = value;
  }

  /**
   * 批量设置配置
   */
  setMultiple(options: Partial<T>): void {
    Object.assign(this.config, options);
  }

  /**
   * 获取所有配置
   */
  getAll(): T {
    return { ...this.config };
  }

  /**
   * 重置为默认配置
   */
  reset(): void {
    this.config = { ...this.defaultConfig } as T;
  }

  /**
   * 合并配置
   */
  merge(options: Partial<T>): T {
    return { ...this.config, ...options };
  }

  /**
   * 验证配置值
   */
  validate(): boolean {
    const value = this.config.value ?? 0;
    const min = this.config.min ?? 0;
    const max = this.config.max ?? 100;

    return value >= min && value <= max && min < max;
  }

  /**
   * 标准化值（确保在min-max范围内）
   */
  normalizeValue(value: number): number {
    const min = this.config.min ?? 0;
    const max = this.config.max ?? 100;
    return Math.max(min, Math.min(max, value));
  }

  /**
   * 获取百分比值
   */
  getPercentage(value?: number): number {
    const val = value ?? this.config.value ?? 0;
    const min = this.config.min ?? 0;
    const max = this.config.max ?? 100;
    return ((val - min) / (max - min)) * 100;
  }
}



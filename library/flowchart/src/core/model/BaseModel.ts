/**
 * 基础模型类 - 所有模型的基类
 */

import { EventBus } from '../../utils/EventBus';
import { BaseModelConfig } from '../../types/model';

export abstract class BaseModel {
  /** 模型ID */
  public id: string;

  /** 事件总线 */
  protected eventBus: EventBus;

  /** 模型数据 */
  protected data: Record<string, any> = {};

  /** 是否已销毁 */
  protected destroyed = false;

  constructor(config: BaseModelConfig) {
    this.id = config.id;
    this.eventBus = new EventBus();

    // 存储额外数据
    const { id, ...rest } = config;
    this.data = rest;
  }

  /**
   * 获取模型数据
   */
  getData<T = any>(key?: string): T {
    if (key) {
      return this.data[key];
    }
    return { ...this.data } as T;
  }

  /**
   * 设置模型数据
   */
  setData(key: string | Record<string, any>, value?: any): void {
    if (this.destroyed) return;

    if (typeof key === 'string') {
      const oldValue = this.data[key];
      this.data[key] = value;
      this.eventBus.emit('change:data', { key, value, oldValue });
    } else {
      Object.keys(key).forEach(k => {
        const oldValue = this.data[k];
        this.data[k] = key[k];
        this.eventBus.emit('change:data', { key: k, value: key[k], oldValue });
      });
    }
  }

  /**
   * 监听事件
   */
  on(event: string, handler: (...args: any[]) => void): void {
    this.eventBus.on(event, handler);
  }

  /**
   * 监听一次事件
   */
  once(event: string, handler: (...args: any[]) => void): void {
    this.eventBus.once(event, handler);
  }

  /**
   * 移除事件监听
   */
  off(event: string, handler?: (...args: any[]) => void): void {
    this.eventBus.off(event, handler);
  }

  /**
   * 触发事件
   */
  protected emit(event: string, ...args: any[]): void {
    this.eventBus.emit(event, ...args);
  }

  /**
   * 克隆模型
   */
  abstract clone(): BaseModel;

  /**
   * 序列化为JSON
   */
  abstract toJSON(): Record<string, any>;

  /**
   * 销毁模型
   */
  destroy(): void {
    this.destroyed = true;
    this.eventBus.clear();
  }

  /**
   * 是否已销毁
   */
  isDestroyed(): boolean {
    return this.destroyed;
  }
}



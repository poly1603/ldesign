/**
 * 数据源管理器
 */

import type { DataSource, DataSourceResponse, DataSourceState } from '../types';
import { RestConnector } from './connectors/rest-connector';
import { deepClone } from '../utils';

/**
 * 数据源管理器类
 */
export class DataSourceManager {
  private datasources: Map<string, DataSource> = new Map();
  private dataCache: Map<string, any> = new Map();
  private stateMap: Map<string, DataSourceState> = new Map();
  private restConnector: RestConnector;

  constructor() {
    this.restConnector = new RestConnector();
  }

  /**
   * 注册数据源
   */
  register(datasource: DataSource): void {
    this.datasources.set(datasource.id, datasource);
    this.stateMap.set(datasource.id, 'idle');
  }

  /**
   * 获取数据源
   */
  get(id: string): DataSource | undefined {
    return this.datasources.get(id);
  }

  /**
   * 获取所有数据源
   */
  getAll(): DataSource[] {
    return Array.from(this.datasources.values());
  }

  /**
   * 执行数据源请求
   */
  async fetch(id: string): Promise<DataSourceResponse> {
    const datasource = this.datasources.get(id);

    if (!datasource) {
      return {
        data: null,
        success: false,
        error: new Error(`数据源 ${id} 不存在`)
      };
    }

    // 设置加载状态
    this.stateMap.set(id, 'loading');

    try {
      let data: any = null;

      switch (datasource.type) {
        case 'rest':
          data = await this.restConnector.fetch(datasource.config as any);
          break;
        case 'mock':
          // Mock 数据
          await this.delay(datasource.config.delay || 500);
          data = datasource.config.data;
          break;
        default:
          throw new Error(`不支持的数据源类型: ${datasource.type}`);
      }

      // 缓存数据
      this.dataCache.set(id, data);
      this.stateMap.set(id, 'success');

      return {
        data,
        success: true
      };
    } catch (error) {
      this.stateMap.set(id, 'error');

      return {
        data: null,
        success: false,
        error: error as Error
      };
    }
  }

  /**
   * 获取缓存的数据
   */
  getData(id: string): any {
    return deepClone(this.dataCache.get(id));
  }

  /**
   * 获取数据源状态
   */
  getState(id: string): DataSourceState {
    return this.stateMap.get(id) || 'idle';
  }

  /**
   * 清除缓存
   */
  clearCache(id?: string): void {
    if (id) {
      this.dataCache.delete(id);
    } else {
      this.dataCache.clear();
    }
  }

  /**
   * 移除数据源
   */
  remove(id: string): void {
    this.datasources.delete(id);
    this.dataCache.delete(id);
    this.stateMap.delete(id);
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}




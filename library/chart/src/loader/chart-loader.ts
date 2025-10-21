/**
 * 配置生成器按需加载
 */

import type { ChartType } from '../types';

/**
 * 图表配置生成器加载器
 */
export class ChartLoader {
  private generators = new Map<ChartType, any>();
  private loading = new Map<ChartType, Promise<any>>();

  /**
   * 加载配置生成器
   */
  async loadGenerator(type: ChartType): Promise<any> {
    // 如果已经加载，直接返回
    if (this.generators.has(type)) {
      return this.generators.get(type);
    }

    // 如果正在加载，等待加载完成
    if (this.loading.has(type)) {
      return this.loading.get(type);
    }

    // 开始加载
    const promise = this.importGenerator(type);
    this.loading.set(type, promise);

    try {
      const generator = await promise;
      this.generators.set(type, generator);
      this.loading.delete(type);
      return generator;
    } catch (error) {
      this.loading.delete(type);
      console.warn(`Failed to load generator for ${type}:`, error);
      // 返回默认生成器
      return this.getDefaultGenerator();
    }
  }

  /**
   * 动态导入生成器模块
   */
  private async importGenerator(type: ChartType): Promise<any> {
    try {
      const module = await import(`../config/generators/${type}`);
      return module.default || module;
    } catch (error) {
      // 如果模块不存在，使用默认生成器
      throw error;
    }
  }

  /**
   * 获取默认生成器
   */
  private getDefaultGenerator(): any {
    return {
      generate: (parsedData: any, config: any) => {
        return {
          xAxis: { type: 'category', data: parsedData.xData || [] },
          yAxis: { type: 'value' },
          series: parsedData.series.map((data: any[], index: number) => ({
            name: parsedData.seriesNames[index],
            type: config.type,
            data,
          })),
        };
      },
    };
  }

  /**
   * 预加载常用图表类型
   */
  async preload(types: ChartType[]): Promise<void> {
    await Promise.all(types.map((type) => this.loadGenerator(type)));
  }

  /**
   * 清除缓存
   */
  clear(): void {
    this.generators.clear();
    this.loading.clear();
  }

  /**
   * 获取已加载的生成器数量
   */
  getLoadedCount(): number {
    return this.generators.size;
  }
}

// 全局单例
export const chartLoader = new ChartLoader();


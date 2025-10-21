/**
 * @ldesign/chart - 企业级智能图表插件
 * 主入口文件
 */

// 导出核心类
export { Chart } from './core/chart';
export { ChartInstanceManager, instanceManager } from './core/instance-manager';

// 导出类型
export * from './types';

// 导出工具
export { DataParser } from './utils/data-parser';
export { validateConfig, isValidChartType } from './utils/validators';
export * from './utils/helpers';

// 导出主题
export * from './themes';

// 导出内存管理
export { chartCache, ChartCache } from './memory/cache';
export { ObjectPool, arrayPool, poolFactory } from './memory/pool';
export { cleanupManager, CleanupManager } from './memory/cleanup';

// 导出性能优化
export { VirtualRenderer } from './performance/virtual-render';
export { DataChunker, DataPipeline } from './performance/data-chunk';
export { ChartWorker, WorkerPool } from './performance/web-worker';

// 导出加载器
export { echartsLoader, EChartsLoader } from './loader/echarts-loader';
export { chartLoader, ChartLoader } from './loader/chart-loader';

// 导出配置生成器
export { SmartConfigGenerator } from './config/smart-config';

/**
 * 创建图表实例（便捷方法）
 */
import { Chart } from './core/chart';
import type { ChartConfig } from './types';

export function createChart(
  container: HTMLElement | string,
  config: ChartConfig
): Chart {
  const element =
    typeof container === 'string'
      ? document.querySelector(container) as HTMLElement
      : container;

  if (!element) {
    throw new Error('Container element not found');
  }

  return new Chart(element, config);
}

/**
 * 默认导出
 */
export default {
  Chart,
  createChart,
  instanceManager,
  chartCache,
  echartsLoader,
  chartLoader,
};


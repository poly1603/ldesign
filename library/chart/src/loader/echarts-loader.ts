/**
 * ECharts 模块按需加载器
 */

import type { ChartType } from '../types';

/**
 * ECharts 加载器
 */
export class EChartsLoader {
  private loadedModules = new Set<string>();
  private loading = new Map<string, Promise<any>>();

  /**
   * 动态加载 ECharts 核心
   */
  async loadCore(): Promise<any> {
    if (this.loadedModules.has('core')) {
      return;
    }

    const cacheKey = 'core';
    if (this.loading.has(cacheKey)) {
      return this.loading.get(cacheKey);
    }

    const promise = import('echarts/core').then((module) => {
      this.loadedModules.add('core');
      return module;
    });

    this.loading.set(cacheKey, promise);
    const result = await promise;
    this.loading.delete(cacheKey);
    return result;
  }

  /**
   * 按需加载图表类型
   */
  async loadChart(type: ChartType): Promise<void> {
    const moduleKey = `chart-${type}`;
    if (this.loadedModules.has(moduleKey)) return;

    if (this.loading.has(moduleKey)) {
      await this.loading.get(moduleKey);
      return;
    }

    const chartMap: Record<string, () => Promise<any>> = {
      line: () => import('echarts/charts').then((m) => m.LineChart),
      bar: () => import('echarts/charts').then((m) => m.BarChart),
      pie: () => import('echarts/charts').then((m) => m.PieChart),
      scatter: () => import('echarts/charts').then((m) => m.ScatterChart),
      radar: () => import('echarts/charts').then((m) => m.RadarChart),
      effectScatter: () => import('echarts/charts').then((m) => m.EffectScatterChart),
      candlestick: () => import('echarts/charts').then((m) => m.CandlestickChart),
      boxplot: () => import('echarts/charts').then((m) => m.BoxplotChart),
      heatmap: () => import('echarts/charts').then((m) => m.HeatmapChart),
      gauge: () => import('echarts/charts').then((m) => m.GaugeChart),
      funnel: () => import('echarts/charts').then((m) => m.FunnelChart),
      sankey: () => import('echarts/charts').then((m) => m.SankeyChart),
      graph: () => import('echarts/charts').then((m) => m.GraphChart),
      tree: () => import('echarts/charts').then((m) => m.TreeChart),
      treemap: () => import('echarts/charts').then((m) => m.TreemapChart),
      sunburst: () => import('echarts/charts').then((m) => m.SunburstChart),
      lines: () => import('echarts/charts').then((m) => m.LinesChart),
      pictorialBar: () => import('echarts/charts').then((m) => m.PictorialBarChart),
      themeRiver: () => import('echarts/charts').then((m) => m.ThemeRiverChart),
      custom: () => import('echarts/charts').then((m) => m.CustomChart),
    };

    const loader = chartMap[type];
    if (!loader) {
      console.warn(`Unsupported chart type: ${type}`);
      return;
    }

    const promise = loader().then((ChartClass) => {
      const echarts = require('echarts/core');
      echarts.use(ChartClass);
      this.loadedModules.add(moduleKey);
    });

    this.loading.set(moduleKey, promise);
    await promise;
    this.loading.delete(moduleKey);
  }

  /**
   * 按需加载组件
   */
  async loadComponents(components: string[]): Promise<void> {
    const componentMap: Record<string, () => Promise<any>> = {
      grid: () => import('echarts/components').then((m) => m.GridComponent),
      tooltip: () => import('echarts/components').then((m) => m.TooltipComponent),
      legend: () => import('echarts/components').then((m) => m.LegendComponent),
      title: () => import('echarts/components').then((m) => m.TitleComponent),
      dataZoom: () => import('echarts/components').then((m) => m.DataZoomComponent),
      toolbox: () => import('echarts/components').then((m) => m.ToolboxComponent),
      visualMap: () => import('echarts/components').then((m) => m.VisualMapComponent),
      markLine: () => import('echarts/components').then((m) => m.MarkLineComponent),
      markPoint: () => import('echarts/components').then((m) => m.MarkPointComponent),
      markArea: () => import('echarts/components').then((m) => m.MarkAreaComponent),
      polar: () => import('echarts/components').then((m) => m.PolarComponent),
      radar: () => import('echarts/components').then((m) => m.RadarComponent),
      geo: () => import('echarts/components').then((m) => m.GeoComponent),
      parallel: () => import('echarts/components').then((m) => m.ParallelComponent),
      calendar: () => import('echarts/components').then((m) => m.CalendarComponent),
    };

    const promises = components.map(async (comp) => {
      const moduleKey = `comp-${comp}`;
      if (this.loadedModules.has(moduleKey)) return;

      if (this.loading.has(moduleKey)) {
        await this.loading.get(moduleKey);
        return;
      }

      const loader = componentMap[comp];
      if (!loader) {
        console.warn(`Unsupported component: ${comp}`);
        return;
      }

      const promise = loader().then((ComponentClass) => {
        const echarts = require('echarts/core');
        echarts.use(ComponentClass);
        this.loadedModules.add(moduleKey);
      });

      this.loading.set(moduleKey, promise);
      await promise;
      this.loading.delete(moduleKey);
    });

    await Promise.all(promises);
  }

  /**
   * 按需加载渲染器
   */
  async loadRenderer(type: 'canvas' | 'svg'): Promise<void> {
    const moduleKey = `renderer-${type}`;
    if (this.loadedModules.has(moduleKey)) return;

    if (this.loading.has(moduleKey)) {
      await this.loading.get(moduleKey);
      return;
    }

    const promise = (async () => {
      const echarts = require('echarts/core');

      if (type === 'canvas') {
        const { CanvasRenderer } = await import('echarts/renderers');
        echarts.use(CanvasRenderer);
      } else {
        const { SVGRenderer } = await import('echarts/renderers');
        echarts.use(SVGRenderer);
      }

      this.loadedModules.add(moduleKey);
    })();

    this.loading.set(moduleKey, promise);
    await promise;
    this.loading.delete(moduleKey);
  }

  /**
   * 检查模块是否已加载
   */
  isLoaded(module: string): boolean {
    return this.loadedModules.has(module);
  }

  /**
   * 获取已加载的模块列表
   */
  getLoadedModules(): string[] {
    return Array.from(this.loadedModules);
  }

  /**
   * 清除加载状态（用于测试）
   */
  clear(): void {
    this.loadedModules.clear();
    this.loading.clear();
  }
}

// 全局单例
export const echartsLoader = new EChartsLoader();


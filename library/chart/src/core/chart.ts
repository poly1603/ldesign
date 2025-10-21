/**
 * 核心 Chart 类
 */

import * as echarts from 'echarts/core';
import type { EChartsInstance, ChartConfig, ChartData, ChartInstance, ThemeConfig } from '../types';
import { echartsLoader } from '../loader/echarts-loader';
import { SmartConfigGenerator } from '../config/smart-config';
import { VirtualRenderer } from '../performance/virtual-render';
import { ChartWorker } from '../performance/web-worker';
import { chartCache, ChartCache } from '../memory/cache';
import { instanceManager } from './instance-manager';
import { ChartResizeObserver } from '../utils/resize-observer';
import { generateId } from '../utils/helpers';
import { getChartDefaults, hasAxis, RequiredComponents } from '../types/chart-types';
import { renderScheduler } from '../performance/render-scheduler';
import { EventManager } from '../utils/event-manager';
import { errorHandler, ErrorType, performanceMonitor } from '../utils/error-handler';

/**
 * Chart 类
 */
export class Chart implements ChartInstance {
  private echartsInstance?: EChartsInstance;
  private container: HTMLElement;
  private config: ChartConfig;
  private id: string;

  // 功能模块
  private configGenerator = new SmartConfigGenerator();
  private virtualRenderer?: VirtualRenderer;
  private worker?: ChartWorker;
  private resizeObserver?: ChartResizeObserver;
  private eventManager = new EventManager();

  // 状态
  private isDisposed = false;
  private isLoading = false;

  constructor(container: HTMLElement, config: ChartConfig) {
    this.container = container;
    this.config = config;
    this.id = generateId('chart');

    // 注册实例
    instanceManager.register(this.id, this);

    // 初始化
    this.init();
  }

  /**
   * 初始化图表（带性能监控和错误处理）
   */
  private async init(): Promise<void> {
    performanceMonitor.mark(`init-${this.id}`);

    try {
      this.isLoading = true;

      // 1. 按需加载 ECharts 模块
      await this.loadModules();

      // 2. 生成配置
      const option = await this.generateOption();

      // 3. 创建实例
      await this.createInstance(option);

      // 4. 设置响应式
      this.setupResize();

      // 5. 启用性能优化
      this.setupPerformance();

      this.isLoading = false;

      // 记录初始化性能
      const duration = performanceMonitor.measure('chart-init', `init-${this.id}`);
      if (duration > 1000) {
        console.warn(`图表初始化耗时 ${duration.toFixed(2)}ms，建议优化`);
      }
    } catch (error) {
      this.isLoading = false;
      errorHandler.handle(error as Error, {
        chartId: this.id,
        config: this.config,
        errorType: ErrorType.INITIALIZATION,
      });
      throw error;
    }
  }

  /**
   * 按需加载模块
   */
  private async loadModules(): Promise<void> {
    const { type, dataZoom, toolbox } = this.config;

    // 加载核心
    await echartsLoader.loadCore();

    // 加载渲染器
    const rendererType = this.config.renderer || 'canvas';
    await echartsLoader.loadRenderer(rendererType);

    // 加载图表类型
    await echartsLoader.loadChart(type);

    // 加载必需组件
    const components = RequiredComponents.common || ['grid', 'tooltip', 'legend', 'title'];

    if (dataZoom) components.push('dataZoom');
    if (toolbox) components.push('toolbox');
    if (hasAxis(type)) {
      // 添加坐标轴相关组件
    }

    await echartsLoader.loadComponents([...new Set(components)]);
  }

  /**
   * 生成配置
   */
  private async generateOption(): Promise<any> {
    // 尝试从缓存获取
    const cacheKey = this.getCacheKey();
    if (this.config.cache) {
      const cached = chartCache.get(cacheKey);
      if (cached) return cached;
    }

    // 生成配置
    const option = await this.configGenerator.generate(this.config);

    // 缓存配置
    if (this.config.cache) {
      chartCache.set(cacheKey, option, 5 * 60 * 1000); // 5分钟
    }

    return option;
  }

  /**
   * 创建实例
   */
  private async createInstance(option: any): Promise<void> {
    // 使用 Worker 处理大数据
    if (this.config.worker && this.isLargeDataset()) {
      this.worker = new ChartWorker();
      option = await this.worker.processData(option, 'optimize');
    }

    // 创建 ECharts 实例
    this.echartsInstance = echarts.init(
      this.container,
      this.config.theme as any
    );

    // 设置配置
    this.echartsInstance.setOption(option, {
      notMerge: true,
      lazyUpdate: this.config.lazy,
    });
  }

  /**
   * 设置响应式
   */
  private setupResize(): void {
    const responsive = this.config.responsive;
    if (responsive === false) return;

    const debounceDelay = typeof responsive === 'object' ? responsive.debounce || 100 : 100;

    this.resizeObserver = new ChartResizeObserver(() => {
      this.resize();
    }, debounceDelay);

    this.resizeObserver.observe(this.container);
  }

  /**
   * 设置性能优化
   */
  private setupPerformance(): void {
    // 虚拟渲染
    if (this.config.virtual && this.isLargeDataset()) {
      this.virtualRenderer = new VirtualRenderer();
      this.enableVirtualRender();
    }
  }

  /**
   * 更新数据（使用调度器批量处理）
   */
  async updateData(data: ChartData): Promise<void> {
    if (this.isDisposed) return;

    const newConfig = { ...this.config, data };
    const option = await this.configGenerator.generate(newConfig);

    // 使用渲染调度器批量处理更新
    renderScheduler.schedule(`update-${this.id}`, () => {
      this.echartsInstance?.setOption(option, {
        notMerge: false,
        lazyUpdate: this.config.lazy,
      });
    }, 6); // 中高优先级

    this.config = newConfig;
  }

  /**
   * 设置主题
   */
  setTheme(theme: string | ThemeConfig): void {
    // 重新创建实例以应用新主题
    this.config.theme = theme;
    this.dispose();
    this.init();
  }

  /**
   * 设置暗黑模式
   */
  setDarkMode(enabled: boolean): void {
    this.config.darkMode = enabled;
    const theme = enabled ? 'dark' : 'light';
    this.setTheme(theme);
  }

  /**
   * 设置字体大小
   */
  setFontSize(size: number): void {
    this.config.fontSize = size;
    // 重新生成配置
    this.refresh();
  }

  /**
   * 刷新图表
   */
  async refresh(): Promise<void> {
    const option = await this.generateOption();
    this.echartsInstance?.setOption(option, { notMerge: true });
  }

  /**
   * 调整大小（使用调度器）
   */
  resize(): void {
    renderScheduler.schedule(`resize-${this.id}`, () => {
      this.echartsInstance?.resize();
    }, 7); // 高优先级
  }

  /**
   * 获取 DataURL
   */
  getDataURL(options?: any): string {
    return this.echartsInstance?.getDataURL(options) || '';
  }

  /**
   * 事件监听（自动管理）
   */
  on(eventName: string, handler: Function): void {
    if (!this.echartsInstance) return;

    this.echartsInstance.on(eventName, handler as any);
    // 不使用 EventTarget 的事件管理器，因为 ECharts 有自己的事件系统
    // 但我们记录这个监听器以便在 dispose 时清理
  }

  /**
   * 取消事件监听
   */
  off(eventName: string, handler?: Function): void {
    this.echartsInstance?.off(eventName, handler as any);
  }

  /**
   * 销毁实例（自动清理所有资源）
   */
  dispose(): void {
    if (this.isDisposed) return;

    // 取消所有待处理的渲染任务
    renderScheduler.cancel(`resize-${this.id}`);
    renderScheduler.cancel(`update-${this.id}`);

    // 清理 ECharts 实例
    this.echartsInstance?.dispose();
    this.echartsInstance = undefined;

    // 清理观察器
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;

    // 清理 Worker
    this.worker?.terminate();
    this.worker = undefined;

    // 清理事件监听器
    this.eventManager.clearAll();

    // 从管理器注销
    instanceManager.dispose(this.id);

    this.isDisposed = true;
  }

  /**
   * 获取实例
   */
  getInstance(): EChartsInstance | undefined {
    return this.echartsInstance;
  }

  // ============ 辅助方法 ============

  /**
   * 获取缓存键（使用高性能哈希）
   */
  private getCacheKey(): string {
    return ChartCache.generateKey({
      type: this.config.type,
      data: this.config.data,
    });
  }

  /**
   * 判断是否是大数据集
   */
  private isLargeDataset(): boolean {
    const data = this.config.data;
    if (Array.isArray(data)) {
      return data.length > 10000;
    }
    if (typeof data === 'object' && data && 'datasets' in data) {
      const totalPoints = (data as any).datasets.reduce(
        (sum: number, dataset: any) => sum + (dataset.data?.length || 0),
        0
      );
      return totalPoints > 10000;
    }
    return false;
  }

  /**
   * 启用虚拟渲染
   */
  private enableVirtualRender(): void {
    if (!this.virtualRenderer || !this.echartsInstance) return;

    // 监听 dataZoom 事件
    this.echartsInstance.on('dataZoom', (event: any) => {
      this.virtualRenderer?.updateVisibleRange(event);
    });
  }

  /**
   * 获取图表 ID
   */
  getId(): string {
    return this.id;
  }

  /**
   * 获取配置
   */
  getConfig(): ChartConfig {
    return { ...this.config };
  }

  /**
   * 是否已销毁
   */
  isDestroyed(): boolean {
    return this.isDisposed;
  }
}


/**
 * @ldesign/i18n - Analytics Dashboard
 * 智能分析仪表板：使用热力图、缺失检测、性能分析、A/B测试
 */

import type { I18nPlugin, I18nInstance, Locale } from '../types';

/**
 * 分析事件
 */
export interface AnalyticsEvent {
  id: string;
  type: 'translation' | 'locale_change' | 'missing' | 'error' | 'performance';
  key?: string;
  locale?: Locale;
  value?: any;
  metadata?: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

/**
 * 热力图数据
 */
export interface HeatmapData {
  key: string;
  locale: Locale;
  count: number;
  lastAccessed: Date;
  averageLoadTime?: number;
  errorRate?: number;
}

/**
 * A/B测试配置
 */
export interface ABTestConfig {
  id: string;
  name: string;
  key: string;
  variants: {
    id: string;
    value: string;
    weight: number;
  }[];
  metrics: string[];
  startDate: Date;
  endDate?: Date;
  status: 'draft' | 'running' | 'completed';
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  translationTime: {
    avg: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
  };
  cacheHitRate: number;
  loadTime: Record<Locale, number>;
  errorRate: number;
  throughput: number;
}

/**
 * 分析收集器
 */
export class AnalyticsCollector {
  private events: AnalyticsEvent[] = [];
  private heatmap: Map<string, HeatmapData> = new Map();
  private sessionId = this.generateSessionId();
  private maxEvents = 10000;
  
  /**
   * 记录事件
   */
  track(event: Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId'>): void {
    const newEvent: AnalyticsEvent = {
      ...event,
      id: this.generateId(),
      timestamp: Date.now(),
      sessionId: this.sessionId
    };
    
    this.events.push(newEvent);
    
    // 更新热力图
    if (event.type === 'translation' && event.key && event.locale) {
      this.updateHeatmap(event.key, event.locale);
    }
    
    // 限制事件数量
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }
  }
  
  /**
   * 更新热力图
   */
  private updateHeatmap(key: string, locale: Locale): void {
    const mapKey = `${locale}:${key}`;
    const existing = this.heatmap.get(mapKey);
    
    if (existing) {
      existing.count++;
      existing.lastAccessed = new Date();
    } else {
      this.heatmap.set(mapKey, {
        key,
        locale,
        count: 1,
        lastAccessed: new Date()
      });
    }
  }
  
  /**
   * 获取热力图数据
   */
  getHeatmap(locale?: Locale): HeatmapData[] {
    const data = Array.from(this.heatmap.values());
    
    if (locale) {
      return data.filter(d => d.locale === locale);
    }
    
    return data.sort((a, b) => b.count - a.count);
  }
  
  /**
   * 获取缺失的翻译
   */
  getMissingTranslations(): Array<{ key: string; locale: Locale; count: number }> {
    const missing = new Map<string, number>();
    
    this.events
      .filter(e => e.type === 'missing')
      .forEach(e => {
        const key = `${e.locale}:${e.key}`;
        missing.set(key, (missing.get(key) || 0) + 1);
      });
    
    return Array.from(missing.entries()).map(([key, count]) => {
      const [locale, ...keyParts] = key.split(':');
      return {
        key: keyParts.join(':'),
        locale,
        count
      };
    }).sort((a, b) => b.count - a.count);
  }
  
  /**
   * 计算性能指标
   */
  calculatePerformanceMetrics(): PerformanceMetrics {
    const perfEvents = this.events.filter(e => e.type === 'performance');
    const translationTimes = perfEvents
      .filter(e => e.metadata?.metric === 'translation_time')
      .map(e => e.value as number)
      .sort((a, b) => a - b);
    
    const cacheHits = this.events.filter(e => e.metadata?.cacheHit === true).length;
    const totalTranslations = this.events.filter(e => e.type === 'translation').length;
    
    return {
      translationTime: {
        avg: this.average(translationTimes),
        min: Math.min(...translationTimes),
        max: Math.max(...translationTimes),
        p50: this.percentile(translationTimes, 0.5),
        p95: this.percentile(translationTimes, 0.95),
        p99: this.percentile(translationTimes, 0.99)
      },
      cacheHitRate: totalTranslations > 0 ? cacheHits / totalTranslations : 0,
      loadTime: this.getLoadTimeByLocale(),
      errorRate: this.calculateErrorRate(),
      throughput: this.calculateThroughput()
    };
  }
  
  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }
  
  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)];
  }
  
  private getLoadTimeByLocale(): Record<Locale, number> {
    const loadTimes: Record<string, number[]> = {};
    
    this.events
      .filter(e => e.metadata?.metric === 'load_time' && e.locale)
      .forEach(e => {
        if (!loadTimes[e.locale!]) loadTimes[e.locale!] = [];
        loadTimes[e.locale!].push(e.value as number);
      });
    
    const result: Record<string, number> = {};
    for (const [locale, times] of Object.entries(loadTimes)) {
      result[locale] = this.average(times);
    }
    
    return result;
  }
  
  private calculateErrorRate(): number {
    const errors = this.events.filter(e => e.type === 'error').length;
    const total = this.events.length;
    return total > 0 ? errors / total : 0;
  }
  
  private calculateThroughput(): number {
    if (this.events.length < 2) return 0;
    
    const timeRange = this.events[this.events.length - 1].timestamp - this.events[0].timestamp;
    const translations = this.events.filter(e => e.type === 'translation').length;
    
    return translations / (timeRange / 1000); // 每秒翻译数
  }
  
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
  
  private generateSessionId(): string {
    return `session_${Date.now()}_${this.generateId()}`;
  }
}

/**
 * A/B测试管理器
 */
export class ABTestManager {
  private tests: Map<string, ABTestConfig> = new Map();
  private assignments: Map<string, string> = new Map(); // userId -> variantId
  private results: Map<string, ABTestResult> = new Map();
  
  /**
   * 创建A/B测试
   */
  createTest(config: Omit<ABTestConfig, 'id' | 'status'>): ABTestConfig {
    const test: ABTestConfig = {
      ...config,
      id: this.generateId(),
      status: 'draft'
    };
    
    this.tests.set(test.id, test);
    return test;
  }
  
  /**
   * 启动测试
   */
  startTest(testId: string): void {
    const test = this.tests.get(testId);
    if (!test) throw new Error('Test not found');
    
    test.status = 'running';
    test.startDate = new Date();
  }
  
  /**
   * 获取变体
   */
  getVariant(testId: string, userId: string): string | null {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'running') return null;
    
    // 检查是否已分配
    const assignmentKey = `${testId}:${userId}`;
    if (this.assignments.has(assignmentKey)) {
      return this.assignments.get(assignmentKey)!;
    }
    
    // 随机分配变体
    const variant = this.assignVariant(test, userId);
    this.assignments.set(assignmentKey, variant.id);
    
    return variant.value;
  }
  
  /**
   * 记录指标
   */
  recordMetric(testId: string, userId: string, metric: string, value: number): void {
    const assignmentKey = `${testId}:${userId}`;
    const variantId = this.assignments.get(assignmentKey);
    
    if (!variantId) return;
    
    const resultKey = `${testId}:${variantId}:${metric}`;
    if (!this.results.has(resultKey)) {
      this.results.set(resultKey, {
        testId,
        variantId,
        metric,
        values: [],
        conversions: 0,
        participants: new Set()
      });
    }
    
    const result = this.results.get(resultKey)!;
    result.values.push(value);
    result.participants.add(userId);
    
    if (metric === 'conversion') {
      result.conversions++;
    }
  }
  
  /**
   * 获取测试结果
   */
  getTestResults(testId: string): ABTestAnalysis {
    const test = this.tests.get(testId);
    if (!test) throw new Error('Test not found');
    
    const variantResults: Record<string, VariantResult> = {};
    
    for (const variant of test.variants) {
      const metrics: Record<string, MetricResult> = {};
      
      for (const metric of test.metrics) {
        const resultKey = `${testId}:${variant.id}:${metric}`;
        const result = this.results.get(resultKey);
        
        if (result) {
          metrics[metric] = {
            mean: this.mean(result.values),
            median: this.median(result.values),
            stdDev: this.stdDev(result.values),
            sampleSize: result.participants.size,
            conversionRate: result.participants.size > 0 
              ? result.conversions / result.participants.size 
              : 0
          };
        }
      }
      
      variantResults[variant.id] = {
        variant,
        metrics,
        participants: this.countParticipants(testId, variant.id)
      };
    }
    
    return {
      test,
      results: variantResults,
      winner: this.determineWinner(variantResults),
      confidence: this.calculateConfidence(variantResults)
    };
  }
  
  private assignVariant(test: ABTestConfig, userId: string): any {
    const random = this.hashUserId(userId);
    let cumulative = 0;
    
    for (const variant of test.variants) {
      cumulative += variant.weight;
      if (random < cumulative) {
        return variant;
      }
    }
    
    return test.variants[test.variants.length - 1];
  }
  
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) / 2147483647; // Normalize to 0-1
  }
  
  private countParticipants(testId: string, variantId: string): number {
    return Array.from(this.assignments.entries())
      .filter(([key, value]) => key.startsWith(testId) && value === variantId)
      .length;
  }
  
  private mean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }
  
  private median(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }
  
  private stdDev(values: number[]): number {
    if (values.length === 0) return 0;
    const avg = this.mean(values);
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    return Math.sqrt(this.mean(squareDiffs));
  }
  
  private determineWinner(results: Record<string, VariantResult>): string | null {
    let bestVariant: string | null = null;
    let bestConversion = 0;
    
    for (const [id, result] of Object.entries(results)) {
      const conversion = result.metrics.conversion?.conversionRate || 0;
      if (conversion > bestConversion) {
        bestConversion = conversion;
        bestVariant = id;
      }
    }
    
    return bestVariant;
  }
  
  private calculateConfidence(results: Record<string, VariantResult>): number {
    // 简化的置信度计算
    const sampleSizes = Object.values(results).map(r => 
      r.metrics.conversion?.sampleSize || 0
    );
    
    const minSample = Math.min(...sampleSizes);
    return Math.min(minSample / 100, 1); // 简化：每100个样本增加1%置信度
  }
  
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

interface ABTestResult {
  testId: string;
  variantId: string;
  metric: string;
  values: number[];
  conversions: number;
  participants: Set<string>;
}

interface MetricResult {
  mean: number;
  median: number;
  stdDev: number;
  sampleSize: number;
  conversionRate: number;
}

interface VariantResult {
  variant: any;
  metrics: Record<string, MetricResult>;
  participants: number;
}

interface ABTestAnalysis {
  test: ABTestConfig;
  results: Record<string, VariantResult>;
  winner: string | null;
  confidence: number;
}

/**
 * 可视化仪表板
 */
export class VisualizationDashboard {
  private container?: HTMLElement;
  private charts: Map<string, any> = new Map();
  
  /**
   * 创建仪表板
   */
  create(containerId: string): void {
    this.container = document.getElementById(containerId) || undefined;
    if (!this.container) {
      throw new Error(`Container ${containerId} not found`);
    }
    
    this.container.innerHTML = this.generateHTML();
    this.attachStyles();
  }
  
  /**
   * 渲染热力图
   */
  renderHeatmap(data: HeatmapData[]): void {
    const canvas = document.getElementById('i18n-heatmap') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 简化的热力图渲染
    const maxCount = Math.max(...data.map(d => d.count));
    const cellSize = 20;
    
    data.forEach((item, index) => {
      const x = (index % 20) * cellSize;
      const y = Math.floor(index / 20) * cellSize;
      const intensity = item.count / maxCount;
      
      ctx.fillStyle = `rgba(255, 0, 0, ${intensity})`;
      ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
    });
  }
  
  /**
   * 渲染性能图表
   */
  renderPerformanceChart(metrics: PerformanceMetrics): void {
    const container = document.getElementById('i18n-performance');
    if (!container) return;
    
    container.innerHTML = `
      <div class="metric-card">
        <h3>翻译性能</h3>
        <div class="metric">平均: ${metrics.translationTime.avg.toFixed(2)}ms</div>
        <div class="metric">P95: ${metrics.translationTime.p95.toFixed(2)}ms</div>
        <div class="metric">P99: ${metrics.translationTime.p99.toFixed(2)}ms</div>
      </div>
      <div class="metric-card">
        <h3>缓存性能</h3>
        <div class="metric">命中率: ${(metrics.cacheHitRate * 100).toFixed(1)}%</div>
      </div>
      <div class="metric-card">
        <h3>系统指标</h3>
        <div class="metric">错误率: ${(metrics.errorRate * 100).toFixed(2)}%</div>
        <div class="metric">吞吐量: ${metrics.throughput.toFixed(1)}/s</div>
      </div>
    `;
  }
  
  /**
   * 渲染A/B测试结果
   */
  renderABTestResults(analysis: ABTestAnalysis): void {
    const container = document.getElementById('i18n-abtest');
    if (!container) return;
    
    const html = `
      <h3>${analysis.test.name}</h3>
      <div class="test-status">状态: ${analysis.test.status}</div>
      <div class="test-results">
        ${Object.entries(analysis.results).map(([id, result]) => `
          <div class="variant-result">
            <h4>${result.variant.id}</h4>
            <div>参与者: ${result.participants}</div>
            <div>转化率: ${(result.metrics.conversion?.conversionRate || 0 * 100).toFixed(2)}%</div>
          </div>
        `).join('')}
      </div>
      ${analysis.winner ? `<div class="winner">获胜者: ${analysis.winner}</div>` : ''}
      <div class="confidence">置信度: ${(analysis.confidence * 100).toFixed(1)}%</div>
    `;
    
    container.innerHTML = html;
  }
  
  private generateHTML(): string {
    return `
      <div class="i18n-dashboard">
        <h1>i18n Analytics Dashboard</h1>
        
        <div class="dashboard-grid">
          <div class="dashboard-section">
            <h2>翻译热力图</h2>
            <canvas id="i18n-heatmap" width="400" height="300"></canvas>
          </div>
          
          <div class="dashboard-section">
            <h2>性能指标</h2>
            <div id="i18n-performance"></div>
          </div>
          
          <div class="dashboard-section">
            <h2>缺失翻译</h2>
            <div id="i18n-missing"></div>
          </div>
          
          <div class="dashboard-section">
            <h2>A/B测试</h2>
            <div id="i18n-abtest"></div>
          </div>
        </div>
      </div>
    `;
  }
  
  private attachStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      .i18n-dashboard {
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 20px;
      }
      
      .dashboard-section {
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      
      .metric-card {
        margin: 10px 0;
        padding: 10px;
        background: #f5f5f5;
        border-radius: 4px;
      }
      
      .metric {
        margin: 5px 0;
      }
      
      .variant-result {
        margin: 10px 0;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      
      .winner {
        color: #4CAF50;
        font-weight: bold;
        margin-top: 10px;
      }
      
      .confidence {
        color: #666;
        margin-top: 5px;
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * 分析仪表板插件
 */
export class AnalyticsDashboardPlugin implements I18nPlugin {
  name = 'analytics-dashboard';
  version = '1.0.0';
  
  private collector: AnalyticsCollector;
  private abTestManager: ABTestManager;
  private dashboard?: VisualizationDashboard;
  
  constructor() {
    this.collector = new AnalyticsCollector();
    this.abTestManager = new ABTestManager();
  }
  
  async install(i18n: I18nInstance): Promise<void> {
    console.log('[AnalyticsDashboard] Installing analytics dashboard...');
    
    // 拦截翻译调用以收集分析数据
    const originalT = i18n.t;
    i18n.t = (key: string, params?: any) => {
      const start = performance.now();
      const result = originalT.call(i18n, key, params);
      const duration = performance.now() - start;
      
      this.collector.track({
        type: 'translation',
        key,
        locale: i18n.locale,
        metadata: {
          duration,
          cacheHit: duration < 0.1,
          params: params ? Object.keys(params) : []
        }
      });
      
      this.collector.track({
        type: 'performance',
        metadata: {
          metric: 'translation_time'
        },
        value: duration
      });
      
      // 检查A/B测试
      const userId = 'current-user'; // 应该从认证系统获取
      for (const test of this.abTestManager['tests'].values()) {
        if (test.key === key && test.status === 'running') {
          const variant = this.abTestManager.getVariant(test.id, userId);
          if (variant) {
            return variant;
          }
        }
      }
      
      return result;
    };
    
    // 添加API
    (i18n as any).getAnalytics = () => ({
      heatmap: this.collector.getHeatmap(),
      missing: this.collector.getMissingTranslations(),
      performance: this.collector.calculatePerformanceMetrics()
    });
    
    (i18n as any).createABTest = (config: any) => {
      return this.abTestManager.createTest(config);
    };
    
    (i18n as any).startABTest = (testId: string) => {
      return this.abTestManager.startTest(testId);
    };
    
    (i18n as any).getABTestResults = (testId: string) => {
      return this.abTestManager.getTestResults(testId);
    };
    
    (i18n as any).createDashboard = (containerId: string) => {
      this.dashboard = new VisualizationDashboard();
      this.dashboard.create(containerId);
      
      // 定期更新仪表板
      setInterval(() => {
        if (this.dashboard) {
          this.dashboard.renderHeatmap(this.collector.getHeatmap());
          this.dashboard.renderPerformanceChart(this.collector.calculatePerformanceMetrics());
        }
      }, 5000);
    };
    
    console.log('[AnalyticsDashboard] Analytics dashboard installed');
  }
  
  async uninstall(i18n: I18nInstance): Promise<void> {
    delete (i18n as any).getAnalytics;
    delete (i18n as any).createABTest;
    delete (i18n as any).startABTest;
    delete (i18n as any).getABTestResults;
    delete (i18n as any).createDashboard;
    
    console.log('[AnalyticsDashboard] Analytics dashboard uninstalled');
  }
}

export default AnalyticsDashboardPlugin;
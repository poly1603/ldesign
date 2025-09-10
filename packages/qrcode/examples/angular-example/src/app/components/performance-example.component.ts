/**
 * Angular 性能测试示例组件
 * 展示 @ldesign/qrcode 的性能特性
 */

import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { generateQRCode, type QRCodeResult } from '@ldesign/qrcode';

interface TestResult {
  id: string;
  name: string;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  cacheHitRate?: number;
  memoryUsage?: number;
  times?: number[];
  chart?: boolean;
}

interface ComparisonData {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-performance-example',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="performance-example">
      <h2 class="section-title">性能测试示例</h2>
      <p class="section-description">
        展示 &#64;ldesign/qrcode 的性能特性，包括生成速度测试、缓存效果、批量处理和内存使用情况。
      </p>

      <div class="grid grid-2">
        <!-- 性能测试控制面板 -->
        <div class="card">
          <h3 class="card-title">性能测试</h3>
          
          <div class="test-controls">
            <div class="form-group">
              <label class="form-label">测试数据量</label>
              <select [(ngModel)]="testCount" class="form-input">
                <option [value]="10">10个二维码</option>
                <option [value]="50">50个二维码</option>
                <option [value]="100">100个二维码</option>
                <option [value]="200">200个二维码</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">二维码大小</label>
              <select [(ngModel)]="testSize" class="form-input">
                <option [value]="100">100x100</option>
                <option [value]="200">200x200</option>
                <option [value]="300">300x300</option>
                <option [value]="400">400x400</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">测试类型</label>
              <div class="test-type-options">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    [(ngModel)]="testTypes.generation"
                    class="form-checkbox"
                  />
                  生成速度测试
                </label>
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    [(ngModel)]="testTypes.cache"
                    class="form-checkbox"
                  />
                  缓存性能测试
                </label>
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    [(ngModel)]="testTypes.batch"
                    class="form-checkbox"
                  />
                  批量处理测试
                </label>
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    [(ngModel)]="testTypes.memory"
                    class="form-checkbox"
                  />
                  内存使用测试
                </label>
              </div>
            </div>

            <div class="test-actions">
              <button
                (click)="runPerformanceTest()"
                class="btn btn-primary"
                [disabled]="isRunning || !hasSelectedTests()"
              >
                {{ isRunning ? '测试中...' : '开始测试' }}
              </button>
              <button
                (click)="clearResults()"
                class="btn"
                [disabled]="isRunning"
              >
                清空结果
              </button>
            </div>
          </div>

          <!-- 实时进度 -->
          <div *ngIf="isRunning" class="progress-section">
            <h4>测试进度</h4>
            <div class="progress-bar">
              <div
                class="progress-fill"
                [style.width.%]="progress"
              ></div>
            </div>
            <p class="progress-text">{{ progressText }}</p>
          </div>
        </div>

        <!-- 测试结果展示 -->
        <div class="card">
          <h3 class="card-title">测试结果</h3>
          
          <div *ngIf="testResults.length === 0" class="no-results">
            <div class="no-results-icon">📊</div>
            <p>暂无测试结果</p>
            <p class="hint">选择测试类型并点击开始测试</p>
          </div>

          <div *ngIf="testResults.length > 0" class="results-container">
            <div
              *ngFor="let result of testResults"
              class="result-item"
            >
              <h4 class="result-title">{{ result.name }}</h4>
              <div class="result-metrics">
                <div class="metric">
                  <span class="metric-label">总耗时:</span>
                  <span class="metric-value">{{ result.totalTime }}ms</span>
                </div>
                <div class="metric">
                  <span class="metric-label">平均耗时:</span>
                  <span class="metric-value">{{ result.averageTime }}ms</span>
                </div>
                <div class="metric">
                  <span class="metric-label">最快:</span>
                  <span class="metric-value">{{ result.minTime }}ms</span>
                </div>
                <div class="metric">
                  <span class="metric-label">最慢:</span>
                  <span class="metric-value">{{ result.maxTime }}ms</span>
                </div>
                <div *ngIf="result.cacheHitRate !== undefined" class="metric">
                  <span class="metric-label">缓存命中率:</span>
                  <span class="metric-value">{{ result.cacheHitRate }}%</span>
                </div>
                <div *ngIf="result.memoryUsage" class="metric">
                  <span class="metric-label">内存使用:</span>
                  <span class="metric-value">{{ result.memoryUsage }}MB</span>
                </div>
              </div>
              <div *ngIf="result.chart" class="result-chart">
                <canvas #chartCanvas width="300" height="150"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 性能对比图表 -->
      <div *ngIf="comparisonData.length > 0" class="card">
        <h3 class="card-title">性能对比</h3>
        <div class="comparison-chart">
          <canvas #comparisonChart width="800" height="400"></canvas>
        </div>
        <div class="comparison-legend">
          <div
            *ngFor="let item of comparisonData"
            class="legend-item"
          >
            <div class="legend-color" [style.backgroundColor]="item.color"></div>
            <span>{{ item.label }}</span>
          </div>
        </div>
      </div>

      <!-- 性能建议 -->
      <div class="card">
        <h3 class="card-title">性能优化建议</h3>
        <div class="recommendations">
          <div class="recommendation-item">
            <h4>🚀 启用缓存</h4>
            <p>对于相同内容的二维码，启用缓存可以显著提升生成速度，减少重复计算。</p>
            <code>{{ '{ enableCache: true }' }}</code>
          </div>
          <div class="recommendation-item">
            <h4>📏 合理选择尺寸</h4>
            <p>较大的二维码需要更多计算时间，根据实际需求选择合适的尺寸。</p>
            <code>{{ '{ size: 200 } // 推荐200-300px' }}</code>
          </div>
          <div class="recommendation-item">
            <h4>🔄 批量处理</h4>
            <p>对于大量二维码生成，使用批量API可以获得更好的性能表现。</p>
            <code>generateQRCodeBatch(options[])</code>
          </div>
          <div class="recommendation-item">
            <h4>💾 内存管理</h4>
            <p>及时清理不需要的二维码实例，避免内存泄漏。</p>
            <code>qrInstance.destroy()</code>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .performance-example {
      max-width: 100%;
    }

    .section-title {
      font-size: 1.8rem;
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
      margin-bottom: var(--ls-spacing-sm);
    }

    .section-description {
      color: var(--ldesign-text-color-secondary);
      margin-bottom: var(--ls-spacing-lg);
      line-height: 1.6;
    }

    .card-title {
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
      margin-bottom: var(--ls-spacing-base);
      padding-bottom: var(--ls-spacing-xs);
      border-bottom: 2px solid var(--ldesign-brand-color-2);
    }

    .test-controls {
      background: var(--ldesign-gray-color-1);
      padding: var(--ls-spacing-base);
      border-radius: var(--ls-border-radius-base);
    }

    .test-type-options {
      display: flex;
      flex-direction: column;
      gap: var(--ls-spacing-xs);
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      font-size: 14px;
      cursor: pointer;
    }

    .form-checkbox {
      width: 16px;
      height: 16px;
      margin-right: var(--ls-spacing-xs);
      cursor: pointer;
    }

    .test-actions {
      display: flex;
      gap: var(--ls-spacing-sm);
      margin-top: var(--ls-spacing-base);
    }

    .progress-section {
      margin-top: var(--ls-spacing-base);
      padding: var(--ls-spacing-base);
      background: var(--ldesign-brand-color-1);
      border-radius: var(--ls-border-radius-base);
    }

    .progress-section h4 {
      margin-bottom: var(--ls-spacing-sm);
      color: var(--ldesign-brand-color-7);
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: var(--ldesign-gray-color-2);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: var(--ls-spacing-sm);
    }

    .progress-fill {
      height: 100%;
      background: var(--ldesign-brand-color-6);
      transition: width 0.3s ease;
    }

    .progress-text {
      font-size: 14px;
      color: var(--ldesign-text-color-secondary);
    }

    .no-results {
      text-align: center;
      padding: var(--ls-spacing-xl);
      color: var(--ldesign-text-color-placeholder);
    }

    .no-results-icon {
      font-size: 3rem;
      margin-bottom: var(--ls-spacing-sm);
    }

    .hint {
      font-size: 14px;
      margin-top: var(--ls-spacing-xs);
    }

    .results-container {
      max-height: 500px;
      overflow-y: auto;
    }

    .result-item {
      margin-bottom: var(--ls-spacing-base);
      padding: var(--ls-spacing-base);
      border: 1px solid var(--ldesign-border-level-1-color);
      border-radius: var(--ls-border-radius-base);
      background: var(--ldesign-bg-color-container);
    }

    .result-title {
      margin-bottom: var(--ls-spacing-sm);
      color: var(--ldesign-brand-color-7);
      font-size: 1.1rem;
    }

    .result-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: var(--ls-spacing-sm);
      margin-bottom: var(--ls-spacing-sm);
    }

    .metric {
      display: flex;
      justify-content: space-between;
      padding: var(--ls-spacing-xs);
      background: var(--ldesign-gray-color-1);
      border-radius: var(--ls-border-radius-sm);
      font-size: 14px;
    }

    .metric-label {
      color: var(--ldesign-text-color-secondary);
    }

    .metric-value {
      font-weight: 600;
      color: var(--ldesign-brand-color-7);
    }

    .result-chart {
      margin-top: var(--ls-spacing-sm);
      text-align: center;
    }

    .comparison-chart {
      text-align: center;
      margin-bottom: var(--ls-spacing-base);
    }

    .comparison-legend {
      display: flex;
      justify-content: center;
      gap: var(--ls-spacing-base);
      flex-wrap: wrap;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-xs);
      font-size: 14px;
    }

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 2px;
    }

    .recommendations {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--ls-spacing-base);
    }

    .recommendation-item {
      padding: var(--ls-spacing-base);
      border: 1px solid var(--ldesign-border-level-1-color);
      border-radius: var(--ls-border-radius-base);
      background: var(--ldesign-bg-color-container);
    }

    .recommendation-item h4 {
      margin-bottom: var(--ls-spacing-sm);
      color: var(--ldesign-text-color-primary);
    }

    .recommendation-item p {
      margin-bottom: var(--ls-spacing-sm);
      color: var(--ldesign-text-color-secondary);
      font-size: 14px;
      line-height: 1.5;
    }

    .recommendation-item code {
      display: block;
      padding: var(--ls-spacing-xs);
      background: var(--ldesign-gray-color-1);
      border-radius: var(--ls-border-radius-sm);
      font-family: 'Courier New', monospace;
      font-size: 13px;
      color: var(--ldesign-brand-color-7);
    }

    /* 响应式设计 */
    @media (max-width: 768px) {
      .test-actions {
        flex-direction: column;
      }
      
      .result-metrics {
        grid-template-columns: 1fr;
      }
      
      .comparison-legend {
        flex-direction: column;
        align-items: center;
      }
      
      .recommendations {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PerformanceExampleComponent implements AfterViewInit {
  @ViewChild('comparisonChart') comparisonChart!: ElementRef<HTMLCanvasElement>;

  // 测试配置
  testCount = 50;
  testSize = 200;
  testTypes = {
    generation: true,
    cache: false,
    batch: false,
    memory: false
  };

  // 测试状态
  isRunning = false;
  progress = 0;
  progressText = '';
  testResults: TestResult[] = [];
  comparisonData: ComparisonData[] = [];

  ngAfterViewInit() {
    // 组件初始化完成后的逻辑
  }

  /**
   * 检查是否有选中的测试
   */
  hasSelectedTests(): boolean {
    return Object.values(this.testTypes).some(Boolean);
  }

  /**
   * 运行性能测试
   */
  async runPerformanceTest(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    this.progress = 0;
    this.testResults = [];

    const tests = [];
    if (this.testTypes.generation) tests.push('generation');
    if (this.testTypes.cache) tests.push('cache');
    if (this.testTypes.batch) tests.push('batch');
    if (this.testTypes.memory) tests.push('memory');

    try {
      for (let i = 0; i < tests.length; i++) {
        const testType = tests[i];
        this.progressText = `正在执行${this.getTestName(testType)}...`;
        
        const result = await this.runSingleTest(testType);
        this.testResults.push(result);
        
        this.progress = ((i + 1) / tests.length) * 100;
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // 生成对比图表
      setTimeout(() => this.generateComparisonChart(), 100);
    } catch (error) {
      console.error('性能测试失败:', error);
    } finally {
      this.isRunning = false;
      this.progressText = '测试完成';
    }
  }

  /**
   * 运行单个测试
   */
  private async runSingleTest(testType: string): Promise<TestResult> {
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;

    switch (testType) {
      case 'generation':
        return await this.runGenerationTest();
      case 'cache':
        return await this.runCacheTest();
      case 'batch':
        return await this.runBatchTest();
      case 'memory':
        return await this.runMemoryTest(startMemory);
      default:
        throw new Error(`未知测试类型: ${testType}`);
    }
  }

  /**
   * 生成速度测试
   */
  private async runGenerationTest(): Promise<TestResult> {
    const times: number[] = [];
    const testData = this.generateTestData(this.testCount);

    for (const data of testData) {
      const start = performance.now();

      await generateQRCode(data, {
        size: this.testSize,
        format: 'canvas'
      });

      const end = performance.now();
      times.push(end - start);
    }

    return {
      id: 'generation',
      name: '生成速度测试',
      totalTime: Math.round(times.reduce((a, b) => a + b, 0)),
      averageTime: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
      minTime: Math.round(Math.min(...times)),
      maxTime: Math.round(Math.max(...times)),
      times,
      chart: true
    };
  }

  /**
   * 缓存性能测试
   */
  private async runCacheTest(): Promise<TestResult> {
    const testData = 'https://www.ldesign.com/cache-test';
    const times: number[] = [];
    let cacheHits = 0;

    // 第一次生成（无缓存）
    const start1 = performance.now();
    await generateQRCode(testData, {
      size: this.testSize,
      format: 'canvas'
    });
    const end1 = performance.now();
    times.push(end1 - start1);

    // 后续生成（模拟缓存效果）
    for (let i = 1; i < this.testCount; i++) {
      const start = performance.now();

      await generateQRCode(testData, {
        size: this.testSize,
        format: 'canvas'
      });

      const end = performance.now();
      times.push(end - start);

      // 模拟缓存命中
      if (i > 1) {
        cacheHits++;
      }
    }

    return {
      id: 'cache',
      name: '缓存性能测试',
      totalTime: Math.round(times.reduce((a, b) => a + b, 0)),
      averageTime: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
      minTime: Math.round(Math.min(...times)),
      maxTime: Math.round(Math.max(...times)),
      cacheHitRate: Math.round((cacheHits / (this.testCount - 1)) * 100),
      times,
      chart: true
    };
  }

  /**
   * 批量处理测试
   */
  private async runBatchTest(): Promise<TestResult> {
    const testData = this.generateTestData(this.testCount);

    const start = performance.now();

    // 批量生成二维码
    const promises = testData.map(data =>
      generateQRCode(data, {
        size: this.testSize,
        format: 'canvas'
      })
    );

    await Promise.all(promises);

    const end = performance.now();
    const totalTime = end - start;

    return {
      id: 'batch',
      name: '批量处理测试',
      totalTime: Math.round(totalTime),
      averageTime: Math.round(totalTime / this.testCount),
      minTime: 0,
      maxTime: Math.round(totalTime),
      chart: false
    };
  }

  /**
   * 内存使用测试
   */
  private async runMemoryTest(startMemory: number): Promise<TestResult> {
    const testData = this.generateTestData(this.testCount);
    const results: QRCodeResult[] = [];

    for (const data of testData) {
      const result = await generateQRCode(data, {
        size: this.testSize,
        format: 'canvas'
      });
      results.push(result);
    }

    const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryUsage = (endMemory - startMemory) / 1024 / 1024; // MB

    // 清理内存
    results.length = 0;

    return {
      id: 'memory',
      name: '内存使用测试',
      totalTime: 0,
      averageTime: 0,
      minTime: 0,
      maxTime: 0,
      memoryUsage: Math.round(memoryUsage * 100) / 100,
      chart: false
    };
  }

  /**
   * 生成测试数据
   */
  private generateTestData(count: number): string[] {
    const data: string[] = [];
    for (let i = 0; i < count; i++) {
      data.push(`https://www.ldesign.com/test-${i}?timestamp=${Date.now()}`);
    }
    return data;
  }

  /**
   * 获取测试名称
   */
  private getTestName(testType: string): string {
    const names: Record<string, string> = {
      generation: '生成速度测试',
      cache: '缓存性能测试',
      batch: '批量处理测试',
      memory: '内存使用测试'
    };
    return names[testType] || testType;
  }

  /**
   * 生成对比图表
   */
  private generateComparisonChart(): void {
    if (!this.comparisonChart?.nativeElement) return;

    const canvas = this.comparisonChart.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 准备对比数据
    this.comparisonData = this.testResults.map((result, index) => ({
      label: result.name,
      value: result.averageTime,
      color: `hsl(${260 + index * 30}, 70%, 60%)`
    }));

    // 绘制对比图表
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const maxValue = Math.max(...this.comparisonData.map(d => d.value));
    const barWidth = canvas.width / this.comparisonData.length * 0.8;
    const spacing = canvas.width / this.comparisonData.length * 0.2;
    
    this.comparisonData.forEach((data, index) => {
      const barHeight = (data.value / maxValue) * canvas.height * 0.8;
      const x = index * (barWidth + spacing) + spacing / 2;
      const y = canvas.height - barHeight - 20;
      
      ctx.fillStyle = data.color;
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // 绘制数值标签
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${data.value}ms`, x + barWidth / 2, y - 5);
    });
  }

  /**
   * 清空结果
   */
  clearResults(): void {
    this.testResults = [];
    this.comparisonData = [];
    this.progress = 0;
    this.progressText = '';
  }
}

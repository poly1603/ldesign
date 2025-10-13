/**
 * @ldesign/i18n - A/B Testing System
 * 翻译A/B测试系统：测试不同翻译版本的效果
 */

import type { Locale } from '../types';

/**
 * A/B测试变体
 */
export interface ABTestVariant {
  id: string;
  name: string;
  description?: string;
  translations: Map<string, string>;
  weight: number; // 流量权重
  enabled: boolean;
}

/**
 * A/B测试实验
 */
export interface ABTestExperiment {
  id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: ABTestVariant[];
  targetKeys: string[]; // 测试的翻译键
  targetLocales: Locale[];
  targetAudience?: {
    percentage: number; // 参与测试的用户百分比
    segments?: string[]; // 用户分组
    conditions?: Record<string, any>;
  };
  metrics: ExperimentMetrics;
  winner?: string; // 获胜变体ID
}

/**
 * 实验指标
 */
export interface ExperimentMetrics {
  impressions: Map<string, number>; // 展示次数
  interactions: Map<string, number>; // 交互次数
  conversions: Map<string, number>; // 转化次数
  bounceRate: Map<string, number>; // 跳出率
  engagementTime: Map<string, number>; // 平均停留时间
  customMetrics: Map<string, Map<string, any>>; // 自定义指标
}

/**
 * 用户会话
 */
export interface UserSession {
  id: string;
  userId?: string;
  startTime: Date;
  assignedVariants: Map<string, string>; // experimentId -> variantId
  interactions: InteractionRecord[];
  attributes?: Record<string, any>;
}

/**
 * 交互记录
 */
export interface InteractionRecord {
  timestamp: Date;
  experimentId: string;
  variantId: string;
  key: string;
  action: 'view' | 'click' | 'hover' | 'conversion' | 'custom';
  value?: any;
  context?: Record<string, any>;
}

/**
 * 测试结果
 */
export interface TestResult {
  experimentId: string;
  variantId: string;
  confidence: number; // 置信度
  improvement: number; // 相对提升
  sampleSize: number;
  pValue: number;
  isSignificant: boolean;
}

/**
 * A/B测试管理器
 */
export class ABTestManager {
  private experiments: Map<string, ABTestExperiment> = new Map();
  private sessions: Map<string, UserSession> = new Map();
  private variantAssignments: Map<string, Map<string, string>> = new Map();
  private metricsCollector: MetricsCollector;
  private statisticalAnalyzer: StatisticalAnalyzer;

  constructor() {
    this.metricsCollector = new MetricsCollector();
    this.statisticalAnalyzer = new StatisticalAnalyzer();
    this.startMetricsCollection();
  }

  /**
   * 创建实验
   */
  createExperiment(config: Partial<ABTestExperiment>): ABTestExperiment {
    const experiment: ABTestExperiment = {
      id: config.id || this.generateId(),
      name: config.name || 'Unnamed Experiment',
      description: config.description,
      startDate: config.startDate || new Date(),
      endDate: config.endDate,
      status: config.status || 'draft',
      variants: config.variants || [],
      targetKeys: config.targetKeys || [],
      targetLocales: config.targetLocales || [],
      targetAudience: config.targetAudience,
      metrics: {
        impressions: new Map(),
        interactions: new Map(),
        conversions: new Map(),
        bounceRate: new Map(),
        engagementTime: new Map(),
        customMetrics: new Map()
      }
    };

    // 初始化指标
    experiment.variants.forEach(variant => {
      experiment.metrics.impressions.set(variant.id, 0);
      experiment.metrics.interactions.set(variant.id, 0);
      experiment.metrics.conversions.set(variant.id, 0);
      experiment.metrics.bounceRate.set(variant.id, 0);
      experiment.metrics.engagementTime.set(variant.id, 0);
      experiment.metrics.customMetrics.set(variant.id, new Map());
    });

    this.experiments.set(experiment.id, experiment);
    return experiment;
  }

  /**
   * 启动实验
   */
  startExperiment(experimentId: string): void {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    if (experiment.status === 'running') {
      console.warn(`Experiment ${experimentId} is already running`);
      return;
    }

    experiment.status = 'running';
    experiment.startDate = new Date();
    
    console.log(`✅ Experiment "${experiment.name}" started`);
  }

  /**
   * 暂停实验
   */
  pauseExperiment(experimentId: string): void {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    experiment.status = 'paused';
    console.log(`⏸️ Experiment "${experiment.name}" paused`);
  }

  /**
   * 结束实验
   */
  endExperiment(experimentId: string): TestResult[] {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    experiment.status = 'completed';
    experiment.endDate = new Date();

    // 分析结果
    const results = this.analyzeResults(experiment);
    
    // 确定获胜者
    const winner = this.determineWinner(results);
    if (winner) {
      experiment.winner = winner.variantId;
    }

    console.log(`🏁 Experiment "${experiment.name}" completed`);
    
    return results;
  }

  /**
   * 获取用户的变体
   */
  getVariant(
    sessionId: string,
    experimentId: string,
    key: string
  ): string | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') {
      return null;
    }

    // 检查键是否在测试范围内
    if (!experiment.targetKeys.includes(key)) {
      return null;
    }

    // 获取或分配变体
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = this.createSession(sessionId);
    }

    let variantId = session.assignedVariants.get(experimentId);
    if (!variantId) {
      variantId = this.assignVariant(experiment, session);
      session.assignedVariants.set(experimentId, variantId);
    }

    // 记录展示
    this.recordImpression(experimentId, variantId, key);

    // 获取翻译
    const variant = experiment.variants.find(v => v.id === variantId);
    if (!variant) {
      return null;
    }

    return variant.translations.get(key) || null;
  }

  /**
   * 记录交互
   */
  recordInteraction(
    sessionId: string,
    experimentId: string,
    action: InteractionRecord['action'],
    key?: string,
    value?: any
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.warn(`Session ${sessionId} not found`);
      return;
    }

    const variantId = session.assignedVariants.get(experimentId);
    if (!variantId) {
      console.warn(`No variant assigned for experiment ${experimentId}`);
      return;
    }

    const interaction: InteractionRecord = {
      timestamp: new Date(),
      experimentId,
      variantId,
      key: key || '',
      action,
      value
    };

    session.interactions.push(interaction);

    // 更新指标
    this.updateMetrics(experimentId, variantId, action, value);
  }

  /**
   * 记录转化
   */
  recordConversion(
    sessionId: string,
    experimentId: string,
    value?: number
  ): void {
    this.recordInteraction(sessionId, experimentId, 'conversion', undefined, value);
  }

  /**
   * 获取实验报告
   */
  getExperimentReport(experimentId: string): ExperimentReport {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    const results = this.analyzeResults(experiment);
    const winner = this.determineWinner(results);

    return {
      experiment,
      results,
      winner,
      summary: this.generateSummary(experiment, results),
      recommendations: this.generateRecommendations(experiment, results)
    };
  }

  /**
   * 分配变体
   */
  private assignVariant(
    experiment: ABTestExperiment,
    session: UserSession
  ): string {
    // 检查目标受众
    if (experiment.targetAudience) {
      const isInAudience = Math.random() * 100 < experiment.targetAudience.percentage;
      if (!isInAudience) {
        // 分配到控制组
        return experiment.variants[0].id;
      }
    }

    // 基于权重随机分配
    const enabledVariants = experiment.variants.filter(v => v.enabled);
    const totalWeight = enabledVariants.reduce((sum, v) => sum + v.weight, 0);
    
    let random = Math.random() * totalWeight;
    for (const variant of enabledVariants) {
      random -= variant.weight;
      if (random <= 0) {
        return variant.id;
      }
    }

    return enabledVariants[0].id;
  }

  /**
   * 分析结果
   */
  private analyzeResults(experiment: ABTestExperiment): TestResult[] {
    const results: TestResult[] = [];
    const controlVariant = experiment.variants[0];
    
    for (const variant of experiment.variants) {
      if (variant.id === controlVariant.id) {
        continue;
      }

      const controlMetrics = this.getVariantMetrics(experiment, controlVariant.id);
      const variantMetrics = this.getVariantMetrics(experiment, variant.id);

      const result = this.statisticalAnalyzer.analyze(
        controlMetrics,
        variantMetrics
      );

      results.push({
        experimentId: experiment.id,
        variantId: variant.id,
        confidence: result.confidence,
        improvement: result.improvement,
        sampleSize: result.sampleSize,
        pValue: result.pValue,
        isSignificant: result.isSignificant
      });
    }

    return results;
  }

  /**
   * 确定获胜者
   */
  private determineWinner(results: TestResult[]): TestResult | null {
    const significantResults = results.filter(r => r.isSignificant);
    
    if (significantResults.length === 0) {
      return null;
    }

    // 选择改进最大的变体
    return significantResults.reduce((best, current) => {
      return current.improvement > best.improvement ? current : best;
    });
  }

  /**
   * 获取变体指标
   */
  private getVariantMetrics(
    experiment: ABTestExperiment,
    variantId: string
  ): VariantMetrics {
    return {
      impressions: experiment.metrics.impressions.get(variantId) || 0,
      interactions: experiment.metrics.interactions.get(variantId) || 0,
      conversions: experiment.metrics.conversions.get(variantId) || 0,
      bounceRate: experiment.metrics.bounceRate.get(variantId) || 0,
      engagementTime: experiment.metrics.engagementTime.get(variantId) || 0
    };
  }

  /**
   * 记录展示
   */
  private recordImpression(
    experimentId: string,
    variantId: string,
    key: string
  ): void {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return;

    const current = experiment.metrics.impressions.get(variantId) || 0;
    experiment.metrics.impressions.set(variantId, current + 1);
  }

  /**
   * 更新指标
   */
  private updateMetrics(
    experimentId: string,
    variantId: string,
    action: string,
    value?: any
  ): void {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return;

    switch (action) {
      case 'click':
        const clicks = experiment.metrics.interactions.get(variantId) || 0;
        experiment.metrics.interactions.set(variantId, clicks + 1);
        break;
      
      case 'conversion':
        const conversions = experiment.metrics.conversions.get(variantId) || 0;
        experiment.metrics.conversions.set(variantId, conversions + 1);
        break;
      
      case 'custom':
        const customMetrics = experiment.metrics.customMetrics.get(variantId);
        if (customMetrics && value) {
          customMetrics.set(value.name, value.value);
        }
        break;
    }
  }

  /**
   * 创建会话
   */
  private createSession(sessionId: string): UserSession {
    const session: UserSession = {
      id: sessionId,
      startTime: new Date(),
      assignedVariants: new Map(),
      interactions: []
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * 生成ID
   */
  private generateId(): string {
    return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成总结
   */
  private generateSummary(
    experiment: ABTestExperiment,
    results: TestResult[]
  ): string {
    const winner = this.determineWinner(results);
    
    if (!winner) {
      return `No significant winner found after testing ${experiment.variants.length} variants.`;
    }

    const variant = experiment.variants.find(v => v.id === winner.variantId);
    return `Variant "${variant?.name}" won with ${winner.improvement.toFixed(2)}% improvement ` +
           `at ${winner.confidence.toFixed(1)}% confidence level.`;
  }

  /**
   * 生成建议
   */
  private generateRecommendations(
    experiment: ABTestExperiment,
    results: TestResult[]
  ): string[] {
    const recommendations: string[] = [];
    const winner = this.determineWinner(results);

    if (winner && winner.confidence >= 95) {
      recommendations.push('✅ Implement the winning variant in production');
      recommendations.push('📊 Continue monitoring performance post-implementation');
    } else if (winner && winner.confidence >= 90) {
      recommendations.push('⚠️ Consider running the test longer for higher confidence');
      recommendations.push('🔍 Analyze user segments for more insights');
    } else {
      recommendations.push('❌ No clear winner - consider revising test hypotheses');
      recommendations.push('🔄 Try testing more distinct variations');
    }

    // 样本量建议
    const minSampleSize = 1000;
    const totalSamples = Array.from(experiment.metrics.impressions.values())
      .reduce((sum, n) => sum + n, 0);
    
    if (totalSamples < minSampleSize) {
      recommendations.push(`📈 Increase sample size (current: ${totalSamples}, recommended: ${minSampleSize}+)`);
    }

    return recommendations;
  }

  /**
   * 开始收集指标
   */
  private startMetricsCollection(): void {
    // 定期清理过期会话
    setInterval(() => {
      const now = Date.now();
      const sessionTimeout = 30 * 60 * 1000; // 30分钟

      for (const [id, session] of this.sessions) {
        if (now - session.startTime.getTime() > sessionTimeout) {
          this.sessions.delete(id);
        }
      }
    }, 5 * 60 * 1000); // 每5分钟清理一次
  }
}

/**
 * 指标收集器
 */
class MetricsCollector {
  collect(event: any): void {
    // 收集各种指标
    console.log('Collecting metrics:', event);
  }
}

/**
 * 统计分析器
 */
class StatisticalAnalyzer {
  /**
   * 分析两个变体的差异
   */
  analyze(control: VariantMetrics, variant: VariantMetrics): {
    confidence: number;
    improvement: number;
    sampleSize: number;
    pValue: number;
    isSignificant: boolean;
  } {
    const controlRate = control.conversions / Math.max(control.impressions, 1);
    const variantRate = variant.conversions / Math.max(variant.impressions, 1);
    
    const improvement = ((variantRate - controlRate) / Math.max(controlRate, 0.001)) * 100;
    
    // 简化的统计显著性计算
    const sampleSize = control.impressions + variant.impressions;
    const pooledRate = (control.conversions + variant.conversions) / sampleSize;
    const standardError = Math.sqrt(
      pooledRate * (1 - pooledRate) * (1/control.impressions + 1/variant.impressions)
    );
    
    const zScore = (variantRate - controlRate) / Math.max(standardError, 0.001);
    const pValue = 2 * (1 - this.normalCDF(Math.abs(zScore)));
    const confidence = (1 - pValue) * 100;
    
    return {
      confidence,
      improvement,
      sampleSize,
      pValue,
      isSignificant: pValue < 0.05
    };
  }

  /**
   * 正态分布累积函数
   */
  private normalCDF(z: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = z < 0 ? -1 : 1;
    z = Math.abs(z) / Math.sqrt(2.0);

    const t = 1.0 / (1.0 + p * z);
    const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);

    return 0.5 * (1.0 + sign * y);
  }
}

/**
 * 变体指标
 */
interface VariantMetrics {
  impressions: number;
  interactions: number;
  conversions: number;
  bounceRate: number;
  engagementTime: number;
}

/**
 * 实验报告
 */
export interface ExperimentReport {
  experiment: ABTestExperiment;
  results: TestResult[];
  winner: TestResult | null;
  summary: string;
  recommendations: string[];
}

/**
 * 创建A/B测试管理器
 */
export function createABTestManager(): ABTestManager {
  return new ABTestManager();
}
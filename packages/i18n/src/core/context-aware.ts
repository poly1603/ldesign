/**
 * @ldesign/i18n - Context-Aware Translation
 * 上下文感知翻译：根据环境智能选择最合适的翻译变体
 */


/**
 * 上下文类型
 */
export interface TranslationContext {
  // 用户相关
  userRole?: 'admin' | 'user' | 'guest' | 'premium' | 'developer';
  userAge?: number;
  userGender?: 'male' | 'female' | 'other';
  userPreferences?: Record<string, any>;
  
  // 设备相关
  deviceType?: 'mobile' | 'tablet' | 'desktop' | 'watch' | 'tv';
  platform?: 'ios' | 'android' | 'windows' | 'mac' | 'linux' | 'web';
  screenSize?: 'small' | 'medium' | 'large' | 'xlarge';
  
  // 环境相关
  environment?: 'development' | 'staging' | 'production';
  region?: string;
  timezone?: string;
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  
  // 业务相关
  businessContext?: 'formal' | 'casual' | 'technical' | 'marketing';
  industry?: string;
  brand?: string;
  campaign?: string;
  
  // 页面相关
  pageType?: 'landing' | 'dashboard' | 'settings' | 'profile' | 'checkout';
  section?: string;
  feature?: string;
  
  // 文化相关
  culturalContext?: 'conservative' | 'moderate' | 'progressive';
  formality?: 'formal' | 'informal' | 'casual';
  tone?: 'friendly' | 'professional' | 'playful' | 'serious';
  
  // 辅助功能
  accessibility?: {
    screenReader?: boolean;
    highContrast?: boolean;
    reducedMotion?: boolean;
    fontSize?: 'small' | 'normal' | 'large' | 'xlarge';
  };
  
  // 自定义上下文
  custom?: Record<string, any>;
}

/**
 * 翻译变体
 */
export interface TranslationVariant {
  id: string;
  value: string;
  context: TranslationContext;
  priority: number;
  conditions?: ContextCondition[];
  metadata?: {
    author?: string;
    createdAt?: Date;
    updatedAt?: Date;
    usage?: number;
    rating?: number;
  };
}

/**
 * 上下文条件
 */
export interface ContextCondition {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'regex';
  value: any;
  weight?: number;
}

/**
 * 上下文规则
 */
export interface ContextRule {
  id: string;
  name: string;
  description?: string;
  conditions: ContextCondition[];
  variants: Map<string, string>;
  priority: number;
  enabled: boolean;
}

/**
 * 上下文感知翻译器
 */
export class ContextAwareTranslator {
  private readonly variants = new Map<string, TranslationVariant[]>();
  private readonly rules = new Map<string, ContextRule>();
  private currentContext: TranslationContext = {};
  private contextHistory: TranslationContext[] = [];
  private readonly cache = new Map<string, string>();
  private readonly performanceData = new Map<string, VariantPerformance>();
  private readonly MAX_HISTORY_SIZE = 50;
  private readonly MAX_CACHE_SIZE = 500;
  private readonly MAX_PERFORMANCE_DATA = 1000;

  constructor(initialContext?: TranslationContext) {
    if (initialContext) {
      this.setContext(initialContext);
    }
    this.initializeDefaultRules();
    this.detectContext();
  }

  /**
   * 设置当前上下文
   */
  setContext(context: TranslationContext): void {
    this.currentContext = { ...this.currentContext, ...context };
    this.contextHistory.push({ ...this.currentContext });
    
    // 限制历史记录大小
    if (this.contextHistory.length > this.MAX_HISTORY_SIZE) {
      this.contextHistory.shift();
    }
    
    // 清理缓存 - 只清理一半以保留热数据
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const halfSize = Math.floor(this.cache.size / 2);
      const keysToDelete = Array.from(this.cache.keys()).slice(0, halfSize);
      keysToDelete.forEach(key => this.cache.delete(key));
    }
  }

  /**
   * 获取当前上下文
   */
  getContext(): TranslationContext {
    return { ...this.currentContext };
  }

  /**
   * 自动检测上下文
   */
  private detectContext(): void {
    // 检测设备类型
    this.currentContext.deviceType = this.detectDeviceType();
    
    // 检测平台
    this.currentContext.platform = this.detectPlatform();
    
    // 检测屏幕大小
    this.currentContext.screenSize = this.detectScreenSize();
    
    // 检测时区
    this.currentContext.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // 检测时间段
    this.currentContext.timeOfDay = this.detectTimeOfDay();
    
    // 检测季节
    this.currentContext.season = this.detectSeason();
    
    // 检测环境
    this.currentContext.environment = this.detectEnvironment();
    
    // 检测辅助功能
    this.currentContext.accessibility = this.detectAccessibility();
  }

  /**
   * 注册翻译变体
   */
  registerVariant(key: string, variant: TranslationVariant): void {
    if (!this.variants.has(key)) {
      this.variants.set(key, []);
    }
    
    const variants = this.variants.get(key)!;
    
    // 检查是否已存在相同ID的变体
    const existingIndex = variants.findIndex(v => v.id === variant.id);
    if (existingIndex >= 0) {
      variants[existingIndex] = variant;
    } else {
      variants.push(variant);
    }
    
    // 按优先级排序
    variants.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 注册上下文规则
   */
  registerRule(rule: ContextRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * 获取最佳翻译变体
   */
  getBestVariant(key: string, fallback?: string): string {
    // 检查缓存
    const cacheKey = this.getCacheKey(key);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // 获取所有变体
    const variants = this.variants.get(key) || [];
    
    if (variants.length === 0) {
      return fallback || key;
    }

    // 计算每个变体的得分
    const scoredVariants = variants.map(variant => ({
      variant,
      score: this.calculateVariantScore(variant)
    }));

    // 按得分排序
    scoredVariants.sort((a, b) => b.score - a.score);

    // A/B测试支持
    const selected = this.applyABTesting(scoredVariants);
    
    // 记录性能数据
    this.recordPerformance(key, selected.variant.id);
    
    // 缓存结果
    this.cache.set(cacheKey, selected.variant.value);
    
    return selected.variant.value;
  }

  /**
   * 计算变体得分
   */
  private calculateVariantScore(variant: TranslationVariant): number {
    let score = variant.priority * 10;

    // 检查条件匹配
    if (variant.conditions) {
      for (const condition of variant.conditions) {
        if (this.evaluateCondition(condition)) {
          score += condition.weight || 1;
        } else {
          score -= (condition.weight || 1) * 2;
        }
      }
    }

    // 上下文匹配度
    score += this.calculateContextMatch(variant.context);

    // 性能历史
    const performance = this.performanceData.get(variant.id);
    if (performance) {
      score += performance.successRate * 5;
      score += Math.min(performance.usageCount / 100, 5);
    }

    // 元数据评分
    if (variant.metadata) {
      if (variant.metadata.rating) {
        score += variant.metadata.rating * 2;
      }
      if (variant.metadata.usage) {
        score += Math.log10(variant.metadata.usage + 1);
      }
    }

    return score;
  }

  /**
   * 计算上下文匹配度
   */
  private calculateContextMatch(variantContext: TranslationContext): number {
    let matchScore = 0;
    let totalFields = 0;

    for (const [key, value] of Object.entries(variantContext)) {
      totalFields++;
      
      if (this.currentContext[key as keyof TranslationContext] === value) {
        matchScore += 2;
      } else if (this.isPartialMatch(
        this.currentContext[key as keyof TranslationContext],
        value
      )) {
        matchScore += 1;
      }
    }

    return totalFields > 0 ? (matchScore / totalFields) * 10 : 0;
  }

  /**
   * 评估条件
   */
  private evaluateCondition(condition: ContextCondition): boolean {
    const contextValue = this.getNestedValue(this.currentContext, condition.field);

    switch (condition.operator) {
      case 'equals':
        return contextValue === condition.value;
      
      case 'contains':
        return String(contextValue).includes(String(condition.value));
      
      case 'gt':
        return Number(contextValue) > Number(condition.value);
      
      case 'lt':
        return Number(contextValue) < Number(condition.value);
      
      case 'gte':
        return Number(contextValue) >= Number(condition.value);
      
      case 'lte':
        return Number(contextValue) <= Number(condition.value);
      
      case 'in':
        return Array.isArray(condition.value) && 
               condition.value.includes(contextValue);
      
      case 'regex':
        try {
          return new RegExp(condition.value).test(String(contextValue));
        } catch {
          return false;
        }
      
      default:
        return false;
    }
  }

  /**
   * A/B测试
   */
  private applyABTesting(
    scoredVariants: Array<{ variant: TranslationVariant; score: number }>
  ): { variant: TranslationVariant; score: number } {
    // 简单的A/B测试实现
    const topVariants = scoredVariants.slice(0, 3);
    
    if (topVariants.length <= 1) {
      return topVariants[0];
    }

    // 基于得分的概率选择
    const totalScore = topVariants.reduce((sum, v) => sum + v.score, 0);
    const random = Math.random() * totalScore;
    
    let accumulated = 0;
    for (const variant of topVariants) {
      accumulated += variant.score;
      if (random <= accumulated) {
        return variant;
      }
    }

    return topVariants[0];
  }

  /**
   * 记录性能数据
   */
  private recordPerformance(key: string, variantId: string): void {
    // 限制性能数据大小
    if (this.performanceData.size >= this.MAX_PERFORMANCE_DATA && !this.performanceData.has(variantId)) {
      // 删除最旧的项
      const oldestKey = Array.from(this.performanceData.entries())
        .sort((a, b) => a[1].lastUsed.getTime() - b[1].lastUsed.getTime())[0]?.[0];
      if (oldestKey) {
        this.performanceData.delete(oldestKey);
      }
    }
    
    if (!this.performanceData.has(variantId)) {
      this.performanceData.set(variantId, {
        variantId,
        usageCount: 0,
        successCount: 0,
        successRate: 0,
        avgResponseTime: 0,
        lastUsed: new Date()
      });
    }

    const performance = this.performanceData.get(variantId)!;
    performance.usageCount++;
    performance.lastUsed = new Date();
  }

  /**
   * 批量翻译
   */
  translateBatch(keys: string[], fallbacks?: Record<string, string>): Record<string, string> {
    const results: Record<string, string> = {};
    
    for (const key of keys) {
      results[key] = this.getBestVariant(key, fallbacks?.[key]);
    }
    
    return results;
  }

  /**
   * 获取所有匹配的变体
   */
  getAllMatchingVariants(key: string): TranslationVariant[] {
    const variants = this.variants.get(key) || [];
    
    return variants
      .map(variant => ({
        variant,
        score: this.calculateVariantScore(variant)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.variant);
  }

  /**
   * 导出配置
   */
  exportConfiguration(): {
    variants: Array<[string, TranslationVariant[]]>;
    rules: Array<[string, ContextRule]>;
  } {
    return {
      variants: Array.from(this.variants.entries()),
      rules: Array.from(this.rules.entries())
    };
  }

  /**
   * 导入配置
   */
  importConfiguration(config: {
    variants: Array<[string, TranslationVariant[]]>;
    rules: Array<[string, ContextRule]>;
  }): void {
    // Reset existing collections instead of reassigning readonly fields
    this.variants.clear();
    for (const [k, arr] of config.variants) {
      this.variants.set(k, arr);
    }
    this.rules.clear();
    for (const [k, r] of config.rules) {
      this.rules.set(k, r);
    }
    this.cache.clear();
  }

  /**
   * 清理所有内部数据，释放内存
   */
  destroy(): void {
    this.variants.clear();
    this.rules.clear();
    this.cache.clear();
    this.performanceData.clear();
    this.contextHistory.length = 0;
    this.currentContext = {} as TranslationContext;
  }

  // ============= 检测辅助方法 =============

  private detectDeviceType(): TranslationContext['deviceType'] {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/mobile|android|iphone/i.test(userAgent)) return 'mobile';
    if (/ipad|tablet/i.test(userAgent)) return 'tablet';
    if (/tv|smart-tv|smarttv/i.test(userAgent)) return 'tv';
    if (/watch/i.test(userAgent)) return 'watch';
    
    return 'desktop';
  }

  private detectPlatform(): TranslationContext['platform'] {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/i.test(userAgent)) return 'ios';
    if (/android/i.test(userAgent)) return 'android';
    if (/windows/i.test(userAgent)) return 'windows';
    if (/mac/i.test(userAgent)) return 'mac';
    if (/linux/i.test(userAgent)) return 'linux';
    
    return 'web';
  }

  private detectScreenSize(): TranslationContext['screenSize'] {
    const width = window.innerWidth;
    
    if (width < 576) return 'small';
    if (width < 768) return 'medium';
    if (width < 1200) return 'large';
    
    return 'xlarge';
  }

  private detectTimeOfDay(): TranslationContext['timeOfDay'] {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    
    return 'night';
  }

  private detectSeason(): TranslationContext['season'] {
    const month = new Date().getMonth();
    
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    
    return 'winter';
  }

  private detectEnvironment(): TranslationContext['environment'] {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') return 'development';
    if (hostname.includes('staging') || hostname.includes('test')) return 'staging';
    
    return 'production';
  }

  private detectAccessibility(): TranslationContext['accessibility'] {
    return {
      screenReader: this.isScreenReaderActive(),
      highContrast: this.isHighContrastMode(),
      reducedMotion: this.isPrefersReducedMotion(),
      fontSize: this.detectFontSize()
    };
  }

  private isScreenReaderActive(): boolean {
    // 简化检测
    return document.body.getAttribute('aria-busy') !== null;
  }

  private isHighContrastMode(): boolean {
    if (window.matchMedia) {
      return window.matchMedia('(prefers-contrast: high)').matches;
    }
    return false;
  }

  private isPrefersReducedMotion(): boolean {
    if (window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  }

  private detectFontSize(): 'small' | 'normal' | 'large' | 'xlarge' {
    const fontSize = Number.parseFloat(
      window.getComputedStyle(document.body).fontSize
    );
    
    if (fontSize < 14) return 'small';
    if (fontSize < 18) return 'normal';
    if (fontSize < 24) return 'large';
    
    return 'xlarge';
  }

  // ============= 工具方法 =============

  private getCacheKey(key: string): string {
    // 优化缓存键生成 - 只使用关键属性
    const contextKey = [
      this.currentContext.userRole,
      this.currentContext.deviceType,
      this.currentContext.environment,
      this.currentContext.formality
    ].filter(Boolean).join(':');
    
    return `${key}:${contextKey}`;
  }

  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  private isPartialMatch(value1: any, value2: any): boolean {
    if (typeof value1 === 'string' && typeof value2 === 'string') {
      return value1.toLowerCase().includes(value2.toLowerCase()) ||
             value2.toLowerCase().includes(value1.toLowerCase());
    }
    
    return false;
  }

  private initializeDefaultRules(): void {
    // 添加一些默认规则
    
    // 移动端简短文本规则
    this.registerRule({
      id: 'mobile-short-text',
      name: 'Mobile Short Text',
      description: 'Use shorter text on mobile devices',
      conditions: [
        { field: 'deviceType', operator: 'equals', value: 'mobile', weight: 5 }
      ],
      variants: new Map([
        ['actions.save', 'Save'],
        ['actions.cancel', 'Cancel']
      ]),
      priority: 10,
      enabled: true
    });

    // 正式场合规则
    this.registerRule({
      id: 'formal-context',
      name: 'Formal Context',
      description: 'Use formal language in business context',
      conditions: [
        { field: 'businessContext', operator: 'equals', value: 'formal', weight: 10 }
      ],
      variants: new Map([
        ['greeting', 'Good day'],
        ['farewell', 'Best regards']
      ]),
      priority: 15,
      enabled: true
    });
  }
}

/**
 * 变体性能数据
 */
interface VariantPerformance {
  variantId: string;
  usageCount: number;
  successCount: number;
  successRate: number;
  avgResponseTime: number;
  lastUsed: Date;
}

// 单例模式
let contextAwareTranslatorInstance: ContextAwareTranslator | null = null;

/**
 * 创建上下文感知翻译器 - 单例模式
 */
export function createContextAwareTranslator(
  initialContext?: TranslationContext
): ContextAwareTranslator {
  if (!contextAwareTranslatorInstance) {
    contextAwareTranslatorInstance = new ContextAwareTranslator(initialContext);
  } else if (initialContext) {
    contextAwareTranslatorInstance.setContext(initialContext);
  }
  return contextAwareTranslatorInstance;
}

/**
 * 清理上下文翻译器
 */
export function clearContextAwareTranslator(): void {
  if (contextAwareTranslatorInstance) {
    contextAwareTranslatorInstance.destroy();
  }
  contextAwareTranslatorInstance = null;
}

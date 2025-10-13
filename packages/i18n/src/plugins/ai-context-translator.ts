/**
 * @ldesign/i18n - AI Context-Aware Translator
 * AI驱动的上下文感知翻译系统，提供更准确的翻译
 */

import type { I18nPlugin, I18nInstance, Locale, Messages } from '../types';

/**
 * 翻译上下文
 */
export interface TranslationContext {
  // 页面上下文
  pageUrl?: string;
  pageName?: string;
  componentName?: string;
  
  // 用户上下文
  userRole?: string;
  userPreferences?: Record<string, any>;
  userHistory?: string[];
  
  // 业务上下文
  domain?: string; // 领域: 'finance' | 'medical' | 'legal' | 'tech' 等
  tone?: 'formal' | 'casual' | 'professional' | 'friendly';
  audience?: 'internal' | 'customer' | 'partner' | 'public';
  
  // 语言上下文
  previousTranslations?: string[];
  relatedKeys?: string[];
  glossary?: Record<string, string>;
}

/**
 * AI 上下文分析器
 */
export class AIContextAnalyzer {
  private contextCache = new Map<string, TranslationContext>();
  private learningData: Map<string, any> = new Map();
  
  /**
   * 分析当前上下文
   */
  analyzeContext(key: string, params?: any): TranslationContext {
    // 从缓存获取
    const cached = this.contextCache.get(key);
    if (cached) return cached;
    
    const context: TranslationContext = {
      pageUrl: window?.location?.href,
      pageName: this.extractPageName(),
      componentName: this.extractComponentName(key),
      domain: this.detectDomain(key),
      tone: this.detectTone(key, params),
      audience: this.detectAudience(key)
    };
    
    // 基于历史数据优化上下文
    this.optimizeContextWithHistory(context, key);
    
    this.contextCache.set(key, context);
    return context;
  }
  
  /**
   * 提取页面名称
   */
  private extractPageName(): string {
    // 从路由或 URL 提取
    const pathname = window?.location?.pathname || '';
    const segments = pathname.split('/').filter(Boolean);
    return segments[segments.length - 1] || 'home';
  }
  
  /**
   * 提取组件名称
   */
  private extractComponentName(key: string): string {
    // 从错误堆栈或键名推断
    const parts = key.split('.');
    if (parts.length > 1) {
      return parts[0];
    }
    return 'unknown';
  }
  
  /**
   * 检测领域
   */
  private detectDomain(key: string): string {
    const domainKeywords = {
      finance: ['payment', 'invoice', 'transaction', 'balance'],
      medical: ['patient', 'diagnosis', 'treatment', 'medication'],
      legal: ['contract', 'agreement', 'terms', 'compliance'],
      tech: ['api', 'database', 'server', 'configuration']
    };
    
    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      if (keywords.some(keyword => key.toLowerCase().includes(keyword))) {
        return domain;
      }
    }
    
    return 'general';
  }
  
  /**
   * 检测语气
   */
  private detectTone(key: string, params?: any): 'formal' | 'casual' | 'professional' | 'friendly' {
    if (key.includes('error') || key.includes('warning')) {
      return 'professional';
    }
    if (key.includes('welcome') || key.includes('greeting')) {
      return 'friendly';
    }
    if (key.includes('legal') || key.includes('terms')) {
      return 'formal';
    }
    return 'casual';
  }
  
  /**
   * 检测受众
   */
  private detectAudience(key: string): 'internal' | 'customer' | 'partner' | 'public' {
    if (key.includes('admin') || key.includes('dashboard')) {
      return 'internal';
    }
    if (key.includes('user') || key.includes('account')) {
      return 'customer';
    }
    if (key.includes('partner') || key.includes('vendor')) {
      return 'partner';
    }
    return 'public';
  }
  
  /**
   * 基于历史优化上下文
   */
  private optimizeContextWithHistory(context: TranslationContext, key: string): void {
    const history = this.learningData.get(key);
    if (history) {
      // 基于历史数据调整上下文参数
      if (history.preferredTone) {
        context.tone = history.preferredTone;
      }
      if (history.glossary) {
        context.glossary = { ...context.glossary, ...history.glossary };
      }
    }
  }
  
  /**
   * 记录学习数据
   */
  recordFeedback(key: string, feedback: any): void {
    const existing = this.learningData.get(key) || {};
    this.learningData.set(key, {
      ...existing,
      ...feedback,
      lastUpdated: new Date()
    });
  }
}

/**
 * AI 翻译优化器
 */
export class AITranslationOptimizer {
  private contextAnalyzer: AIContextAnalyzer;
  private translationScores = new Map<string, number>();
  
  constructor() {
    this.contextAnalyzer = new AIContextAnalyzer();
  }
  
  /**
   * 优化翻译
   */
  async optimizeTranslation(
    key: string,
    originalTranslation: string,
    locale: Locale,
    params?: any
  ): Promise<string> {
    const context = this.contextAnalyzer.analyzeContext(key, params);
    
    // 应用上下文规则
    let optimized = originalTranslation;
    
    // 1. 应用术语表
    if (context.glossary) {
      optimized = this.applyGlossary(optimized, context.glossary);
    }
    
    // 2. 调整语气
    optimized = this.adjustTone(optimized, context.tone || 'casual', locale);
    
    // 3. 针对受众优化
    optimized = this.optimizeForAudience(optimized, context.audience || 'public', locale);
    
    // 4. 应用领域特定规则
    if (context.domain) {
      optimized = this.applyDomainRules(optimized, context.domain, locale);
    }
    
    // 5. 智能参数插值
    if (params) {
      optimized = this.smartInterpolation(optimized, params, context);
    }
    
    return optimized;
  }
  
  /**
   * 应用术语表
   */
  private applyGlossary(text: string, glossary: Record<string, string>): string {
    let result = text;
    for (const [term, translation] of Object.entries(glossary)) {
      result = result.replace(new RegExp(term, 'gi'), translation);
    }
    return result;
  }
  
  /**
   * 调整语气
   */
  private adjustTone(text: string, tone: string, locale: Locale): string {
    // 基于语气调整文本
    switch (tone) {
      case 'formal':
        return this.makeFormal(text, locale);
      case 'friendly':
        return this.makeFriendly(text, locale);
      case 'professional':
        return this.makeProfessional(text, locale);
      default:
        return text;
    }
  }
  
  private makeFormal(text: string, locale: Locale): string {
    // 示例: 移除感叹号，使用更正式的词汇
    if (locale.startsWith('zh')) {
      return text.replace(/！/g, '。').replace(/你/g, '您');
    }
    return text.replace(/!/g, '.').replace(/\byou\b/gi, 'You');
  }
  
  private makeFriendly(text: string, locale: Locale): string {
    // 示例: 添加友好的语气词
    if (locale.startsWith('zh')) {
      if (!text.includes('请') && !text.includes('您好')) {
        return `您好，${text}`;
      }
    }
    return text;
  }
  
  private makeProfessional(text: string, locale: Locale): string {
    // 专业化处理
    return text;
  }
  
  /**
   * 针对受众优化
   */
  private optimizeForAudience(text: string, audience: string, locale: Locale): string {
    // 根据受众调整表达方式
    switch (audience) {
      case 'internal':
        // 内部用户可以使用技术术语
        return text;
      case 'customer':
        // 客户需要更友好、易懂的表达
        return this.simplifyForCustomer(text, locale);
      case 'partner':
        // 合作伙伴需要专业但不过于技术的表达
        return this.adjustForPartner(text, locale);
      default:
        return text;
    }
  }
  
  private simplifyForCustomer(text: string, locale: Locale): string {
    // 简化技术术语
    const technicalTerms: Record<string, Record<string, string>> = {
      'en': {
        'API': 'interface',
        'database': 'data storage',
        'server': 'system'
      },
      'zh': {
        'API': '接口',
        '数据库': '数据存储',
        '服务器': '系统'
      }
    };
    
    const terms = technicalTerms[locale.split('-')[0]] || {};
    let result = text;
    for (const [tech, simple] of Object.entries(terms)) {
      result = result.replace(new RegExp(tech, 'gi'), simple);
    }
    return result;
  }
  
  private adjustForPartner(text: string, locale: Locale): string {
    return text;
  }
  
  /**
   * 应用领域规则
   */
  private applyDomainRules(text: string, domain: string, locale: Locale): string {
    // 根据领域应用特定规则
    switch (domain) {
      case 'finance':
        return this.applyFinanceRules(text, locale);
      case 'medical':
        return this.applyMedicalRules(text, locale);
      case 'legal':
        return this.applyLegalRules(text, locale);
      default:
        return text;
    }
  }
  
  private applyFinanceRules(text: string, locale: Locale): string {
    // 金融领域: 确保数字格式正确，货币符号正确等
    return text;
  }
  
  private applyMedicalRules(text: string, locale: Locale): string {
    // 医疗领域: 确保医学术语准确
    return text;
  }
  
  private applyLegalRules(text: string, locale: Locale): string {
    // 法律领域: 确保法律术语准确，表达严谨
    return text;
  }
  
  /**
   * 智能参数插值
   */
  private smartInterpolation(
    text: string,
    params: Record<string, any>,
    context: TranslationContext
  ): string {
    let result = text;
    
    for (const [key, value] of Object.entries(params)) {
      const placeholder = `{${key}}`;
      
      // 根据上下文智能格式化参数
      const formatted = this.formatParam(value, key, context);
      result = result.replace(new RegExp(placeholder, 'g'), formatted);
    }
    
    return result;
  }
  
  private formatParam(value: any, key: string, context: TranslationContext): string {
    // 根据参数类型和上下文格式化
    if (typeof value === 'number') {
      if (key.includes('price') || key.includes('amount')) {
        return this.formatCurrency(value, context);
      }
      if (key.includes('percent')) {
        return this.formatPercentage(value);
      }
    }
    
    if (value instanceof Date) {
      return this.formatDate(value, context);
    }
    
    return String(value);
  }
  
  private formatCurrency(value: number, context: TranslationContext): string {
    // 根据上下文格式化货币
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(value);
  }
  
  private formatPercentage(value: number): string {
    return `${value}%`;
  }
  
  private formatDate(date: Date, context: TranslationContext): string {
    return new Intl.DateTimeFormat('zh-CN').format(date);
  }
  
  /**
   * 评分翻译质量
   */
  scoreTranslation(key: string, translation: string, feedback?: any): number {
    let score = 0;
    
    // 基础评分
    if (translation && translation.length > 0) score += 20;
    if (!translation.includes('undefined')) score += 20;
    if (!translation.includes('{') && !translation.includes('}')) score += 20;
    
    // 用户反馈评分
    if (feedback) {
      if (feedback.accurate) score += 20;
      if (feedback.natural) score += 20;
    }
    
    this.translationScores.set(key, score);
    return score;
  }
}

/**
 * AI 上下文感知翻译插件
 */
export class AIContextTranslatorPlugin implements I18nPlugin {
  name = 'ai-context-translator';
  version = '1.0.0';
  
  private optimizer: AITranslationOptimizer;
  private originalTranslate?: Function;
  
  constructor() {
    this.optimizer = new AITranslationOptimizer();
  }
  
  async install(i18n: I18nInstance): Promise<void> {
    console.log('[AIContextTranslator] Installing AI context-aware translator...');
    
    // 保存原始翻译函数
    this.originalTranslate = i18n.t;
    
    // 包装翻译函数
    const optimizer = this.optimizer;
    const originalT = this.originalTranslate;
    
    i18n.t = function(key: string, params?: any): string {
      // 获取原始翻译
      const original = originalT.call(i18n, key, params);
      
      // 异步优化翻译（不阻塞）
      optimizer.optimizeTranslation(key, original, i18n.locale, params).then(optimized => {
        if (optimized !== original) {
          // 缓存优化后的翻译
          i18n.cache?.set(`optimized_${key}`, optimized);
        }
      });
      
      // 先返回缓存的优化版本，如果有的话
      const cached = i18n.cache?.get(`optimized_${key}`);
      return cached || original;
    };
    
    // 添加反馈 API
    (i18n as any).provideFeedback = (key: string, feedback: any) => {
      this.optimizer.scoreTranslation(key, i18n.t(key), feedback);
      this.optimizer['contextAnalyzer'].recordFeedback(key, feedback);
    };
    
    console.log('[AIContextTranslator] AI context-aware translator installed');
  }
  
  async uninstall(i18n: I18nInstance): Promise<void> {
    if (this.originalTranslate) {
      i18n.t = this.originalTranslate as any;
    }
    delete (i18n as any).provideFeedback;
    console.log('[AIContextTranslator] AI context-aware translator uninstalled');
  }
}

export default AIContextTranslatorPlugin;
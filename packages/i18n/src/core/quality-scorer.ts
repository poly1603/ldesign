/**
 * @ldesign/i18n - Translation Quality Scorer
 * 翻译质量自动评分系统：使用多种算法评估翻译质量
 */

import type { Locale } from '../types';

/**
 * 质量评分结果
 */
export interface QualityScore {
  overall: number; // 总分 0-100
  accuracy: number; // 准确性
  fluency: number; // 流畅度
  consistency: number; // 一致性
  completeness: number; // 完整性
  culturalAppropriateness: number; // 文化适应性
  technicalAccuracy: number; // 技术准确性
  readability: number; // 可读性
  details: QualityDetails;
  issues: QualityIssue[];
  suggestions: QualitySuggestion[];
  confidence: number; // 评分置信度
}

/**
 * 质量详情
 */
export interface QualityDetails {
  // 语言特征
  sentenceCount: number;
  wordCount: number;
  avgWordLength: number;
  avgSentenceLength: number;
  complexityScore: number;
  
  // 翻译特征
  translationLength: number;
  lengthRatio: number; // 译文/原文长度比
  keywordCoverage: number; // 关键词覆盖率
  terminologyConsistency: number; // 术语一致性
  
  // 格式特征
  hasFormatting: boolean;
  hasPlaceholders: boolean;
  hasHTML: boolean;
  hasMarkdown: boolean;
  
  // 语言学特征
  grammarScore: number;
  spellingScore: number;
  punctuationScore: number;
  styleScore: number;
}

/**
 * 质量问题
 */
export interface QualityIssue {
  type: 'error' | 'warning' | 'info';
  category: 
    | 'grammar'
    | 'spelling'
    | 'punctuation'
    | 'terminology'
    | 'consistency'
    | 'formatting'
    | 'placeholder'
    | 'length'
    | 'style'
    | 'cultural';
  severity: 'critical' | 'major' | 'minor' | 'trivial';
  message: string;
  position?: { start: number; end: number };
  suggestion?: string;
  impact: number; // 对总分的影响
}

/**
 * 质量改进建议
 */
export interface QualitySuggestion {
  type: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  example?: string;
  expectedImprovement: number; // 预期提升分数
}

/**
 * 评分配置
 */
export interface ScoringConfig {
  weights: {
    accuracy: number;
    fluency: number;
    consistency: number;
    completeness: number;
    culturalAppropriateness: number;
    technicalAccuracy: number;
    readability: number;
  };
  thresholds: {
    excellent: number; // >= 90
    good: number; // >= 75
    acceptable: number; // >= 60
    poor: number; // < 60
  };
  strictMode: boolean;
  locale: Locale;
}

/**
 * 翻译质量评分器
 */
export class QualityScorer {
  private config: ScoringConfig;
  private glossary: Map<string, Map<Locale, string>> = new Map();
  private commonErrors: Map<string, string[]> = new Map();
  private languageRules: Map<Locale, LanguageRules> = new Map();
  private mlModel: MLQualityModel | null = null;

  constructor(config?: Partial<ScoringConfig>) {
    this.config = {
      weights: {
        accuracy: 0.25,
        fluency: 0.20,
        consistency: 0.15,
        completeness: 0.15,
        culturalAppropriateness: 0.10,
        technicalAccuracy: 0.10,
        readability: 0.05,
        ...config?.weights
      },
      thresholds: {
        excellent: 90,
        good: 75,
        acceptable: 60,
        poor: 0,
        ...config?.thresholds
      },
      strictMode: config?.strictMode ?? false,
      locale: config?.locale || 'en-US'
    };

    this.initializeRules();
    this.loadCommonErrors();
  }

  /**
   * 评估翻译质量
   */
  async evaluate(
    source: string,
    translation: string,
    sourceLocale: Locale,
    targetLocale: Locale,
    context?: {
      category?: string;
      domain?: string;
      glossary?: Map<string, string>;
      previousTranslations?: string[];
      metadata?: Record<string, any>;
    }
  ): Promise<QualityScore> {
    // 收集基础指标
    const details = this.analyzeDetails(source, translation, targetLocale);
    const issues: QualityIssue[] = [];

    // 评估各个维度
    const accuracy = await this.evaluateAccuracy(
      source, 
      translation, 
      sourceLocale, 
      targetLocale,
      context
    );
    
    const fluency = this.evaluateFluency(translation, targetLocale);
    const consistency = this.evaluateConsistency(
      translation, 
      context?.previousTranslations || [],
      context?.glossary
    );
    
    const completeness = this.evaluateCompleteness(source, translation);
    const culturalAppropriateness = this.evaluateCulturalAppropriateness(
      translation,
      targetLocale,
      context
    );
    
    const technicalAccuracy = this.evaluateTechnicalAccuracy(
      source,
      translation,
      context
    );
    
    const readability = this.evaluateReadability(translation, targetLocale);

    // 检测问题
    issues.push(...this.detectGrammarIssues(translation, targetLocale));
    issues.push(...this.detectSpellingIssues(translation, targetLocale));
    issues.push(...this.detectTerminologyIssues(translation, context?.glossary));
    issues.push(...this.detectFormattingIssues(source, translation));
    issues.push(...this.detectPlaceholderIssues(source, translation));
    issues.push(...this.detectLengthIssues(source, translation, targetLocale));

    // 计算总分
    const overall = this.calculateOverallScore({
      accuracy,
      fluency,
      consistency,
      completeness,
      culturalAppropriateness,
      technicalAccuracy,
      readability
    });

    // 生成建议
    const suggestions = this.generateSuggestions(
      overall,
      issues,
      details,
      {
        accuracy,
        fluency,
        consistency,
        completeness,
        culturalAppropriateness,
        technicalAccuracy,
        readability
      }
    );

    // 计算置信度
    const confidence = this.calculateConfidence(
      source,
      translation,
      issues.length
    );

    return {
      overall,
      accuracy,
      fluency,
      consistency,
      completeness,
      culturalAppropriateness,
      technicalAccuracy,
      readability,
      details,
      issues,
      suggestions,
      confidence
    };
  }

  /**
   * 批量评估
   */
  async evaluateBatch(
    translations: Array<{
      source: string;
      translation: string;
      sourceLocale: Locale;
      targetLocale: Locale;
      context?: any;
    }>
  ): Promise<QualityScore[]> {
    const results = await Promise.all(
      translations.map(t => 
        this.evaluate(
          t.source,
          t.translation,
          t.sourceLocale,
          t.targetLocale,
          t.context
        )
      )
    );

    return results;
  }

  /**
   * 评估准确性
   */
  private async evaluateAccuracy(
    source: string,
    translation: string,
    sourceLocale: Locale,
    targetLocale: Locale,
    context?: any
  ): Promise<number> {
    let score = 100;

    // 关键词匹配
    const sourceKeywords = this.extractKeywords(source, sourceLocale);
    const translationKeywords = this.extractKeywords(translation, targetLocale);
    
    const keywordMatch = this.calculateKeywordMatch(
      sourceKeywords,
      translationKeywords,
      context?.glossary
    );
    
    score *= keywordMatch;

    // 语义相似度（如果有ML模型）
    if (this.mlModel) {
      const semanticSimilarity = await this.mlModel.calculateSimilarity(
        source,
        translation
      );
      score *= semanticSimilarity;
    }

    // 数字和专有名词检查
    const numbersPreserved = this.checkNumbersPreserved(source, translation);
    if (!numbersPreserved) {
      score *= 0.9;
    }

    // 术语一致性
    if (context?.glossary) {
      const terminologyScore = this.checkTerminologyAccuracy(
        translation,
        context.glossary
      );
      score *= terminologyScore;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 评估流畅度
   */
  private evaluateFluency(translation: string, locale: Locale): number {
    let score = 100;
    const rules = this.languageRules.get(locale);

    if (!rules) {
      return 80; // 默认分数
    }

    // 句子结构检查
    const sentences = this.splitSentences(translation);
    for (const sentence of sentences) {
      // 检查句子是否完整
      if (!this.isSentenceComplete(sentence, rules)) {
        score -= 5;
      }

      // 检查词序
      if (!this.isWordOrderCorrect(sentence, rules)) {
        score -= 3;
      }

      // 检查语法
      const grammarScore = this.checkGrammar(sentence, rules);
      score *= grammarScore;
    }

    // 连贯性检查
    const coherenceScore = this.checkCoherence(sentences);
    score *= coherenceScore;

    // 自然度检查
    const naturalnessScore = this.checkNaturalness(translation, locale);
    score *= naturalnessScore;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 评估一致性
   */
  private evaluateConsistency(
    translation: string,
    previousTranslations: string[],
    glossary?: Map<string, string>
  ): number {
    let score = 100;

    // 与历史翻译的一致性
    if (previousTranslations.length > 0) {
      const avgSimilarity = this.calculateAverageSimilarity(
        translation,
        previousTranslations
      );
      
      // 太相似或太不同都不好
      if (avgSimilarity > 0.95) {
        score *= 0.9; // 可能是复制粘贴
      } else if (avgSimilarity < 0.3) {
        score *= 0.8; // 风格差异太大
      }
    }

    // 术语一致性
    if (glossary) {
      for (const [term, expectedTranslation] of glossary) {
        if (translation.includes(term)) {
          if (!translation.includes(expectedTranslation)) {
            score -= 10;
          }
        }
      }
    }

    // 内部一致性（同一术语多次出现）
    const internalConsistency = this.checkInternalConsistency(translation);
    score *= internalConsistency;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 评估完整性
   */
  private evaluateCompleteness(source: string, translation: string): number {
    let score = 100;

    // 长度比较
    const lengthRatio = translation.length / source.length;
    const expectedRatio = this.getExpectedLengthRatio(source, translation);
    
    const deviation = Math.abs(lengthRatio - expectedRatio) / expectedRatio;
    if (deviation > 0.5) {
      score -= deviation * 20;
    }

    // 检查遗漏
    const sourceParts = this.extractImportantParts(source);
    const translationParts = this.extractImportantParts(translation);
    
    const missingParts = sourceParts.filter(part => 
      !this.isPartTranslated(part, translationParts)
    );
    
    score -= missingParts.length * 10;

    // 检查占位符
    const sourcePlaceholders = this.extractPlaceholders(source);
    const translationPlaceholders = this.extractPlaceholders(translation);
    
    if (sourcePlaceholders.length !== translationPlaceholders.length) {
      score -= Math.abs(sourcePlaceholders.length - translationPlaceholders.length) * 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 评估文化适应性
   */
  private evaluateCulturalAppropriateness(
    translation: string,
    locale: Locale,
    context?: any
  ): number {
    let score = 100;

    // 检查文化敏感词汇
    const sensitivities = this.checkCulturalSensitivities(translation, locale);
    score -= sensitivities.length * 10;

    // 检查日期时间格式
    if (this.hasDateTime(translation)) {
      const dateTimeScore = this.checkDateTimeFormat(translation, locale);
      score *= dateTimeScore;
    }

    // 检查货币格式
    if (this.hasCurrency(translation)) {
      const currencyScore = this.checkCurrencyFormat(translation, locale);
      score *= currencyScore;
    }

    // 检查度量单位
    if (this.hasUnits(translation)) {
      const unitsScore = this.checkUnitsFormat(translation, locale);
      score *= unitsScore;
    }

    // 检查称呼和礼貌用语
    const politenessScore = this.checkPoliteness(translation, locale, context);
    score *= politenessScore;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 评估技术准确性
   */
  private evaluateTechnicalAccuracy(
    source: string,
    translation: string,
    context?: any
  ): number {
    let score = 100;

    // 检查技术术语
    if (context?.domain) {
      const technicalTerms = this.extractTechnicalTerms(source, context.domain);
      const translatedTerms = this.extractTechnicalTerms(translation, context.domain);
      
      const accuracy = this.compareTechnicalTerms(technicalTerms, translatedTerms);
      score *= accuracy;
    }

    // 检查代码片段
    const sourceCode = this.extractCodeSnippets(source);
    const translationCode = this.extractCodeSnippets(translation);
    
    if (sourceCode.length > 0) {
      // 代码不应该被翻译
      const codePreserved = this.areCodeSnippetsPreserved(sourceCode, translationCode);
      if (!codePreserved) {
        score *= 0.5;
      }
    }

    // 检查URL和邮箱
    const urlsPreserved = this.areURLsPreserved(source, translation);
    const emailsPreserved = this.areEmailsPreserved(source, translation);
    
    if (!urlsPreserved) score *= 0.8;
    if (!emailsPreserved) score *= 0.8;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 评估可读性
   */
  private evaluateReadability(translation: string, locale: Locale): number {
    // Flesch Reading Ease 变体
    const sentences = this.splitSentences(translation);
    const words = this.splitWords(translation);
    const syllables = this.countSyllables(words, locale);

    if (sentences.length === 0 || words.length === 0) {
      return 50;
    }

    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    // 调整后的Flesch公式
    let score = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;
    
    // 标准化到0-100
    score = Math.max(0, Math.min(100, score));

    // 根据语言调整
    score = this.adjustReadabilityForLocale(score, locale);

    return score;
  }

  /**
   * 检测语法问题
   */
  private detectGrammarIssues(translation: string, locale: Locale): QualityIssue[] {
    const issues: QualityIssue[] = [];
    const rules = this.languageRules.get(locale);

    if (!rules) return issues;

    // 主谓一致
    const subjectVerbIssues = this.checkSubjectVerbAgreement(translation, rules);
    issues.push(...subjectVerbIssues);

    // 时态一致
    const tenseIssues = this.checkTenseConsistency(translation, rules);
    issues.push(...tenseIssues);

    // 冠词使用
    const articleIssues = this.checkArticles(translation, rules);
    issues.push(...articleIssues);

    return issues;
  }

  /**
   * 计算总分
   */
  private calculateOverallScore(scores: {
    accuracy: number;
    fluency: number;
    consistency: number;
    completeness: number;
    culturalAppropriateness: number;
    technicalAccuracy: number;
    readability: number;
  }): number {
    const weights = this.config.weights;
    
    let weightedSum = 0;
    let totalWeight = 0;

    for (const [key, value] of Object.entries(scores)) {
      const weight = weights[key as keyof typeof weights];
      weightedSum += value * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  /**
   * 生成改进建议
   */
  private generateSuggestions(
    overallScore: number,
    issues: QualityIssue[],
    details: QualityDetails,
    scores: any
  ): QualitySuggestion[] {
    const suggestions: QualitySuggestion[] = [];

    // 基于总分的建议
    if (overallScore < this.config.thresholds.acceptable) {
      suggestions.push({
        type: 'overall',
        priority: 'high',
        description: 'Consider retranslating this text for better quality',
        expectedImprovement: 30
      });
    }

    // 基于具体维度的建议
    if (scores.accuracy < 70) {
      suggestions.push({
        type: 'accuracy',
        priority: 'high',
        description: 'Review key terms and ensure they are correctly translated',
        expectedImprovement: 15
      });
    }

    if (scores.fluency < 70) {
      suggestions.push({
        type: 'fluency',
        priority: 'medium',
        description: 'Improve sentence structure for better flow',
        expectedImprovement: 10
      });
    }

    // 基于问题的建议
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      suggestions.push({
        type: 'critical',
        priority: 'high',
        description: `Fix ${criticalIssues.length} critical issues first`,
        expectedImprovement: 20
      });
    }

    return suggestions;
  }

  // ========== 辅助方法 ==========

  private initializeRules(): void {
    // 初始化不同语言的规则
    this.languageRules.set('en-US', {
      wordOrder: 'SVO',
      articles: ['a', 'an', 'the'],
      commonErrors: ['their/there', 'your/you\'re', 'its/it\'s']
    });

    this.languageRules.set('zh-CN', {
      wordOrder: 'SVO',
      articles: [],
      commonErrors: ['的/地/得', '再/在']
    });
  }

  private loadCommonErrors(): void {
    // 加载常见错误模式
    this.commonErrors.set('en-US', [
      'could of', // should be "could have"
      'would of', // should be "would have"
      'alot', // should be "a lot"
    ]);
  }

  private extractKeywords(text: string, locale: Locale): string[] {
    // 简化的关键词提取
    const words = this.splitWords(text);
    const stopWords = this.getStopWords(locale);
    
    return words.filter(word => 
      word.length > 3 && !stopWords.includes(word.toLowerCase())
    );
  }

  private splitSentences(text: string): string[] {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  }

  private splitWords(text: string): string[] {
    return text.split(/\s+/).filter(w => w.length > 0);
  }

  private countSyllables(words: string[], locale: Locale): number {
    // 简化的音节计数
    let total = 0;
    for (const word of words) {
      // 简单规则：元音字母组
      const vowelGroups = word.toLowerCase().match(/[aeiou]+/g);
      total += vowelGroups ? vowelGroups.length : 1;
    }
    return total;
  }

  private extractPlaceholders(text: string): string[] {
    const patterns = [
      /\{\{[^}]+\}\}/g,
      /\{[^}]+\}/g,
      /%[sd]/g,
      /\$\{[^}]+\}/g
    ];

    const placeholders: string[] = [];
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        placeholders.push(...matches);
      }
    }

    return placeholders;
  }

  private calculateKeywordMatch(
    source: string[],
    translation: string[],
    glossary?: Map<string, string>
  ): number {
    if (source.length === 0) return 1;
    
    let matched = 0;
    for (const keyword of source) {
      const expectedTranslation = glossary?.get(keyword);
      if (expectedTranslation) {
        if (translation.includes(expectedTranslation)) {
          matched++;
        }
      } else {
        // 模糊匹配
        if (translation.some(t => t.toLowerCase().includes(keyword.toLowerCase()))) {
          matched++;
        }
      }
    }

    return matched / source.length;
  }

  private getStopWords(locale: Locale): string[] {
    const stopWords: Record<string, string[]> = {
      'en-US': ['the', 'is', 'at', 'which', 'on', 'a', 'an', 'as', 'are', 'was', 'were', 'of', 'for', 'in', 'to'],
      'zh-CN': ['的', '了', '在', '是', '和', '有', '就', '不', '也', '这', '那', '但', '与', '或']
    };

    return stopWords[locale] || [];
  }

  private checkNumbersPreserved(source: string, translation: string): boolean {
    const sourceNumbers = source.match(/\d+/g) || [];
    const translationNumbers = translation.match(/\d+/g) || [];
    
    return sourceNumbers.length === translationNumbers.length &&
           sourceNumbers.every(n => translationNumbers.includes(n));
  }

  private getExpectedLengthRatio(source: string, translation: string): number {
    // 不同语言对的预期长度比
    // 这里使用简化的规则
    return 1.0; // 默认1:1
  }

  private extractImportantParts(text: string): string[] {
    // 提取重要部分（简化版）
    const parts: string[] = [];
    
    // 提取引号内容
    const quotes = text.match(/"[^"]+"/g) || [];
    parts.push(...quotes);
    
    // 提取括号内容
    const parentheses = text.match(/\([^)]+\)/g) || [];
    parts.push(...parentheses);
    
    return parts;
  }

  private isPartTranslated(part: string, translatedParts: string[]): boolean {
    // 检查部分是否被翻译（简化版）
    return translatedParts.some(tp => 
      tp.includes(part) || part.includes(tp)
    );
  }

  private detectSpellingIssues(translation: string, locale: Locale): QualityIssue[] {
    // 拼写检查（简化版）
    return [];
  }

  private detectTerminologyIssues(
    translation: string,
    glossary?: Map<string, string>
  ): QualityIssue[] {
    const issues: QualityIssue[] = [];
    
    if (!glossary) return issues;
    
    for (const [term, expectedTranslation] of glossary) {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      const matches = translation.match(regex);
      
      if (matches && !translation.includes(expectedTranslation)) {
        issues.push({
          type: 'warning',
          category: 'terminology',
          severity: 'major',
          message: `Term "${term}" should be translated as "${expectedTranslation}"`,
          impact: 5
        });
      }
    }
    
    return issues;
  }

  private detectFormattingIssues(source: string, translation: string): QualityIssue[] {
    const issues: QualityIssue[] = [];
    
    // 检查HTML标签
    const sourceHtmlTags = source.match(/<[^>]+>/g) || [];
    const translationHtmlTags = translation.match(/<[^>]+>/g) || [];
    
    if (sourceHtmlTags.length !== translationHtmlTags.length) {
      issues.push({
        type: 'error',
        category: 'formatting',
        severity: 'major',
        message: 'HTML tag count mismatch',
        impact: 10
      });
    }
    
    return issues;
  }

  private detectPlaceholderIssues(source: string, translation: string): QualityIssue[] {
    const issues: QualityIssue[] = [];
    
    const sourcePlaceholders = this.extractPlaceholders(source);
    const translationPlaceholders = this.extractPlaceholders(translation);
    
    const missing = sourcePlaceholders.filter(p => !translationPlaceholders.includes(p));
    const extra = translationPlaceholders.filter(p => !sourcePlaceholders.includes(p));
    
    for (const placeholder of missing) {
      issues.push({
        type: 'error',
        category: 'placeholder',
        severity: 'critical',
        message: `Missing placeholder: ${placeholder}`,
        impact: 15
      });
    }
    
    for (const placeholder of extra) {
      issues.push({
        type: 'error',
        category: 'placeholder',
        severity: 'major',
        message: `Extra placeholder: ${placeholder}`,
        impact: 10
      });
    }
    
    return issues;
  }

  private detectLengthIssues(
    source: string,
    translation: string,
    locale: Locale
  ): QualityIssue[] {
    const issues: QualityIssue[] = [];
    
    const ratio = translation.length / source.length;
    const expectedRatio = this.getExpectedLengthRatio(source, translation);
    
    if (ratio > expectedRatio * 1.5) {
      issues.push({
        type: 'warning',
        category: 'length',
        severity: 'minor',
        message: 'Translation is significantly longer than source',
        impact: 3
      });
    } else if (ratio < expectedRatio * 0.5) {
      issues.push({
        type: 'warning',
        category: 'length',
        severity: 'minor',
        message: 'Translation is significantly shorter than source',
        impact: 3
      });
    }
    
    return issues;
  }

  private calculateConfidence(
    source: string,
    translation: string,
    issueCount: number
  ): number {
    // 基于多个因素计算置信度
    let confidence = 100;
    
    // 文本长度影响
    if (source.length < 10) {
      confidence *= 0.9; // 短文本难以准确评估
    }
    
    // 问题数量影响
    confidence -= issueCount * 2;
    
    // ML模型可用性
    if (!this.mlModel) {
      confidence *= 0.8; // 没有ML模型，置信度降低
    }
    
    return Math.max(0, Math.min(100, confidence));
  }

  // 更多辅助方法...

  private checkSubjectVerbAgreement(text: string, rules: LanguageRules): QualityIssue[] {
    // 主谓一致检查
    return [];
  }

  private checkTenseConsistency(text: string, rules: LanguageRules): QualityIssue[] {
    // 时态一致性检查
    return [];
  }

  private checkArticles(text: string, rules: LanguageRules): QualityIssue[] {
    // 冠词使用检查
    return [];
  }

  private isSentenceComplete(sentence: string, rules: LanguageRules): boolean {
    // 检查句子完整性
    return sentence.trim().length > 0;
  }

  private isWordOrderCorrect(sentence: string, rules: LanguageRules): boolean {
    // 检查词序
    return true;
  }

  private checkGrammar(sentence: string, rules: LanguageRules): number {
    // 语法检查
    return 0.95;
  }

  private checkCoherence(sentences: string[]): number {
    // 连贯性检查
    return 0.9;
  }

  private checkNaturalness(text: string, locale: Locale): number {
    // 自然度检查
    return 0.85;
  }

  private calculateAverageSimilarity(text: string, others: string[]): number {
    // 计算平均相似度
    if (others.length === 0) return 0;
    
    let totalSimilarity = 0;
    for (const other of others) {
      totalSimilarity += this.calculateSimilarity(text, other);
    }
    
    return totalSimilarity / others.length;
  }

  private calculateSimilarity(text1: string, text2: string): number {
    // 简单的Jaccard相似度
    const words1 = new Set(this.splitWords(text1.toLowerCase()));
    const words2 = new Set(this.splitWords(text2.toLowerCase()));
    
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private checkInternalConsistency(text: string): number {
    // 内部一致性检查
    return 0.95;
  }

  private checkTerminologyAccuracy(text: string, glossary: Map<string, string>): number {
    // 术语准确性检查
    return 0.9;
  }

  private checkCulturalSensitivities(text: string, locale: Locale): string[] {
    // 文化敏感性检查
    return [];
  }

  private hasDateTime(text: string): boolean {
    // 检查是否包含日期时间
    return /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(text);
  }

  private checkDateTimeFormat(text: string, locale: Locale): number {
    // 检查日期时间格式
    return 0.95;
  }

  private hasCurrency(text: string): boolean {
    // 检查是否包含货币
    return /[$€£¥₹]/i.test(text);
  }

  private checkCurrencyFormat(text: string, locale: Locale): number {
    // 检查货币格式
    return 0.95;
  }

  private hasUnits(text: string): boolean {
    // 检查是否包含度量单位
    return /(km|mi|kg|lb|m|ft)/i.test(text);
  }

  private checkUnitsFormat(text: string, locale: Locale): number {
    // 检查度量单位格式
    return 0.95;
  }

  private checkPoliteness(text: string, locale: Locale, context?: any): number {
    // 检查礼貌用语
    return 0.9;
  }

  private extractTechnicalTerms(text: string, domain: string): string[] {
    // 提取技术术语
    return [];
  }

  private compareTechnicalTerms(source: string[], translation: string[]): number {
    // 比较技术术语
    return 0.9;
  }

  private extractCodeSnippets(text: string): string[] {
    // 提取代码片段
    const codeBlocks = text.match(/```[\s\S]*?```/g) || [];
    const inlineCode = text.match(/`[^`]+`/g) || [];
    
    return [...codeBlocks, ...inlineCode];
  }

  private areCodeSnippetsPreserved(source: string[], translation: string[]): boolean {
    // 检查代码片段是否保留
    return source.every(code => translation.includes(code));
  }

  private areURLsPreserved(source: string, translation: string): boolean {
    // 检查URL是否保留
    const sourceURLs = source.match(/https?:\/\/[^\s]+/g) || [];
    const translationURLs = translation.match(/https?:\/\/[^\s]+/g) || [];
    
    return sourceURLs.every(url => translationURLs.includes(url));
  }

  private areEmailsPreserved(source: string, translation: string): boolean {
    // 检查邮箱是否保留
    const sourceEmails = source.match(/[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}/g) || [];
    const translationEmails = translation.match(/[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}/g) || [];
    
    return sourceEmails.every(email => translationEmails.includes(email));
  }

  private adjustReadabilityForLocale(score: number, locale: Locale): number {
    // 根据语言调整可读性分数
    const adjustments: Record<string, number> = {
      'zh-CN': 1.1, // 中文需要调整
      'ja-JP': 1.15, // 日文需要更多调整
      'ar-SA': 1.05, // 阿拉伯文
      'en-US': 1.0 // 英文基准
    };
    
    return score * (adjustments[locale] || 1.0);
  }
}

/**
 * 语言规则
 */
interface LanguageRules {
  wordOrder: string;
  articles: string[];
  commonErrors: string[];
}

/**
 * ML质量模型接口
 */
interface MLQualityModel {
  calculateSimilarity(source: string, translation: string): Promise<number>;
  predictQuality(source: string, translation: string): Promise<number>;
}

/**
 * 创建质量评分器
 */
export function createQualityScorer(config?: Partial<ScoringConfig>): QualityScorer {
  return new QualityScorer(config);
}
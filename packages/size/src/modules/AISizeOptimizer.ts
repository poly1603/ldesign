/**
 * AI-Driven Size Optimization Module
 * Integrates with DeepSeek API for intelligent size recommendations
 */

import type { SizeScheme } from '../types';

/**
 * AI optimization configuration
 */
export interface AIOptimizationConfig {
  apiKey?: string;
  apiEndpoint?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  enableAutoOptimization?: boolean;
  cacheResponses?: boolean;
  cacheTTL?: number; // in seconds
}

/**
 * Size optimization suggestion
 */
export interface SizeOptimizationSuggestion {
  element: string;
  currentSize: string;
  suggestedSize: string;
  reason: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  category: 'performance' | 'accessibility' | 'aesthetics' | 'usability';
}

/**
 * Design context for optimization
 */
export interface DesignContext {
  viewport: {
    width: number;
    height: number;
    device: string;
  };
  userPreferences?: {
    fontSize?: 'small' | 'medium' | 'large';
    colorScheme?: 'light' | 'dark';
    reducedMotion?: boolean;
  };
  contentType?: 'article' | 'dashboard' | 'form' | 'gallery' | 'landing';
  targetAudience?: 'general' | 'elderly' | 'children' | 'professional';
  performance?: {
    fps?: number;
    loadTime?: number;
    memoryUsage?: number;
  };
}

/**
 * AI optimization result
 */
export interface OptimizationResult {
  suggestions: SizeOptimizationSuggestion[];
  summary: string;
  totalImpact: number;
  estimatedImprovement: {
    performance?: number;
    accessibility?: number;
    userExperience?: number;
  };
}

/**
 * AI Size Optimizer
 */
export class AISizeOptimizer {
  private config: AIOptimizationConfig;
  private cache: Map<string, { result: OptimizationResult; timestamp: number }>;
  private patterns: Map<string, SizeOptimizationSuggestion[]>;
  private learningData: Array<{
    context: DesignContext;
    applied: SizeOptimizationSuggestion[];
    feedback: number;
  }>;

  constructor(config: AIOptimizationConfig = {}) {
    this.config = {
      apiEndpoint: config.apiEndpoint || 'https://api.deepseek.com/v1',
      model: config.model || 'deepseek-chat',
      maxTokens: config.maxTokens || 2000,
      temperature: config.temperature || 0.7,
      enableAutoOptimization: config.enableAutoOptimization ?? false,
      cacheResponses: config.cacheResponses ?? true,
      cacheTTL: config.cacheTTL ?? 3600,
      ...config
    };
    
    this.cache = new Map();
    this.patterns = new Map();
    this.learningData = [];
    
    this.initializePatterns();
  }

  /**
   * Initialize common optimization patterns
   */
  private initializePatterns(): void {
    // Mobile optimization patterns
    this.patterns.set('mobile-touch', [
      {
        element: 'button',
        currentSize: '< 44px',
        suggestedSize: '44px',
        reason: 'Minimum touch target size for mobile devices',
        confidence: 0.95,
        impact: 'high',
        category: 'usability'
      },
      {
        element: 'link',
        currentSize: '< 44px',
        suggestedSize: '44px',
        reason: 'Improve tap accuracy on mobile',
        confidence: 0.9,
        impact: 'medium',
        category: 'usability'
      }
    ]);

    // Readability patterns
    this.patterns.set('readability', [
      {
        element: 'body-text',
        currentSize: '< 14px',
        suggestedSize: '16px',
        reason: 'Improve readability on screens',
        confidence: 0.85,
        impact: 'high',
        category: 'accessibility'
      },
      {
        element: 'line-height',
        currentSize: '< 1.4',
        suggestedSize: '1.5-1.6',
        reason: 'Optimal line height for readability',
        confidence: 0.8,
        impact: 'medium',
        category: 'accessibility'
      }
    ]);

    // Performance patterns
    this.patterns.set('performance', [
      {
        element: 'image',
        currentSize: '> viewport',
        suggestedSize: 'viewport-constrained',
        reason: 'Prevent unnecessary rendering overhead',
        confidence: 0.9,
        impact: 'high',
        category: 'performance'
      }
    ]);
  }

  /**
   * Analyze sizes using AI
   */
  async analyzeSizes(
    sizeConfig: SizeScheme,
    context: DesignContext
  ): Promise<OptimizationResult> {
    // Check cache first
    const cacheKey = this.getCacheKey(sizeConfig, context);
    if (this.config.cacheResponses) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < (this.config.cacheTTL! * 1000)) {
        return cached.result;
      }
    }

    // Prepare analysis prompt
    const prompt = this.buildAnalysisPrompt(sizeConfig, context);
    
    // Get AI recommendations
    const suggestions = await this.getAIRecommendations(prompt, context);
    
    // Apply learned patterns
    const enhancedSuggestions = this.applyLearnedPatterns(suggestions, context);
    
    // Calculate impact scores
    const result = this.calculateOptimizationResult(enhancedSuggestions, context);
    
    // Cache result
    if (this.config.cacheResponses) {
      this.cache.set(cacheKey, {
        result,
        timestamp: Date.now()
      });
    }
    
    return result;
  }

  /**
   * Build analysis prompt for AI
   */
  private buildAnalysisPrompt(
    sizeConfig: SizeScheme,
    context: DesignContext
  ): string {
    return `
Analyze the following size configuration for optimization opportunities:

Size Configuration:
${JSON.stringify(sizeConfig, null, 2)}

Context:
- Device: ${context.viewport.device} (${context.viewport.width}x${context.viewport.height})
- Content Type: ${context.contentType || 'general'}
- Target Audience: ${context.targetAudience || 'general'}
- User Preferences: ${JSON.stringify(context.userPreferences || {})}

Please provide specific size optimization suggestions focusing on:
1. Performance improvements
2. Accessibility enhancements
3. User experience optimization
4. Device-specific adjustments

For each suggestion, include:
- The specific element or property to change
- The current value and recommended value
- The reason for the change
- The expected impact (high/medium/low)
- The confidence level (0-1)
`;
  }

  /**
   * Get AI recommendations
   */
  private async getAIRecommendations(
    prompt: string,
    context: DesignContext
  ): Promise<SizeOptimizationSuggestion[]> {
    if (!this.config.apiKey) {
      // Fallback to rule-based recommendations
      return this.getRuleBasedRecommendations(context);
    }

    try {
      const response = await fetch(`${this.config.apiEndpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert UI/UX designer specializing in responsive design and size optimization.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return this.parseAIResponse(data);
    } catch (error) {
      console.error('AI optimization failed:', error);
      // Fallback to rule-based recommendations
      return this.getRuleBasedRecommendations(context);
    }
  }

  /**
   * Parse AI response into suggestions
   */
  private parseAIResponse(response: any): SizeOptimizationSuggestion[] {
    try {
      const content = response.choices[0]?.message?.content || '';
      // Parse structured response
      // This would need more sophisticated parsing in production
      const suggestions: SizeOptimizationSuggestion[] = [];
      
      // Simple parsing logic (would be more robust in production)
      const lines = content.split('\n');
      let currentSuggestion: Partial<SizeOptimizationSuggestion> = {};
      
      for (const line of lines) {
        if (line.includes('Element:')) {
          if (currentSuggestion.element) {
            suggestions.push(currentSuggestion as SizeOptimizationSuggestion);
          }
          currentSuggestion = {
            element: line.split(':')[1].trim(),
            confidence: 0.7,
            impact: 'medium',
            category: 'usability'
          };
        } else if (line.includes('Current:')) {
          currentSuggestion.currentSize = line.split(':')[1].trim();
        } else if (line.includes('Suggested:')) {
          currentSuggestion.suggestedSize = line.split(':')[1].trim();
        } else if (line.includes('Reason:')) {
          currentSuggestion.reason = line.split(':')[1].trim();
        } else if (line.includes('Impact:')) {
          const impact = line.split(':')[1].trim().toLowerCase();
          currentSuggestion.impact = impact as 'high' | 'medium' | 'low';
        } else if (line.includes('Confidence:')) {
          currentSuggestion.confidence = Number.parseFloat(line.split(':')[1].trim());
        }
      }
      
      if (currentSuggestion.element) {
        suggestions.push(currentSuggestion as SizeOptimizationSuggestion);
      }
      
      return suggestions;
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return [];
    }
  }

  /**
   * Get rule-based recommendations (fallback)
   */
  private getRuleBasedRecommendations(
    context: DesignContext
  ): SizeOptimizationSuggestion[] {
    const suggestions: SizeOptimizationSuggestion[] = [];
    
    // Apply device-specific rules
    if (context.viewport.device === 'mobile') {
      suggestions.push(...(this.patterns.get('mobile-touch') || []));
    }
    
    // Apply readability rules
    suggestions.push(...(this.patterns.get('readability') || []));
    
    // Apply performance rules if needed
    if (context.performance && context.performance.fps && context.performance.fps < 30) {
      suggestions.push(...(this.patterns.get('performance') || []));
    }
    
    // Apply accessibility rules for specific audiences
    if (context.targetAudience === 'elderly') {
      suggestions.push({
        element: 'all-text',
        currentSize: 'default',
        suggestedSize: '+20%',
        reason: 'Improve readability for elderly users',
        confidence: 0.9,
        impact: 'high',
        category: 'accessibility'
      });
    }
    
    return suggestions;
  }

  /**
   * Apply learned patterns from user feedback
   */
  private applyLearnedPatterns(
    suggestions: SizeOptimizationSuggestion[],
    context: DesignContext
  ): SizeOptimizationSuggestion[] {
    // Find similar contexts in learning data
    const similarContexts = this.learningData.filter(data => {
      return data.context.viewport.device === context.viewport.device &&
             data.context.contentType === context.contentType &&
             data.feedback > 0.7;
    });
    
    // Apply successful patterns
    for (const learned of similarContexts) {
      for (const appliedSuggestion of learned.applied) {
        // Check if suggestion already exists
        const exists = suggestions.some(s => 
          s.element === appliedSuggestion.element &&
          s.suggestedSize === appliedSuggestion.suggestedSize
        );
        
        if (!exists) {
          suggestions.push({
            ...appliedSuggestion,
            confidence: appliedSuggestion.confidence * learned.feedback,
            reason: `${appliedSuggestion.reason} (learned from similar context)`
          });
        }
      }
    }
    
    return suggestions;
  }

  /**
   * Calculate optimization result
   */
  private calculateOptimizationResult(
    suggestions: SizeOptimizationSuggestion[],
    _context: DesignContext
  ): OptimizationResult {
    // Calculate total impact
    const impactScores = { high: 3, medium: 2, low: 1 };
    const totalImpact = suggestions.reduce((sum, s) => 
      sum + (impactScores[s.impact] * s.confidence), 0
    );
    
    // Calculate category improvements
    const categoryScores = {
      performance: 0,
      accessibility: 0,
      userExperience: 0
    };
    
    for (const suggestion of suggestions) {
      const score = impactScores[suggestion.impact] * suggestion.confidence;
      if (suggestion.category === 'performance') {
        categoryScores.performance += score;
      } else if (suggestion.category === 'accessibility') {
        categoryScores.accessibility += score;
      } else {
        categoryScores.userExperience += score;
      }
    }
    
    // Normalize scores to percentages
    const maxScore = suggestions.length * 3; // max impact score per suggestion
    const estimatedImprovement = {
      performance: Math.min((categoryScores.performance / maxScore) * 100, 100),
      accessibility: Math.min((categoryScores.accessibility / maxScore) * 100, 100),
      userExperience: Math.min((categoryScores.userExperience / maxScore) * 100, 100)
    };
    
    // Generate summary
    const summary = this.generateSummary(suggestions, estimatedImprovement);
    
    return {
      suggestions,
      summary,
      totalImpact,
      estimatedImprovement
    };
  }

  /**
   * Generate optimization summary
   */
  private generateSummary(
    suggestions: SizeOptimizationSuggestion[],
    improvement: any
  ): string {
    const highImpact = suggestions.filter(s => s.impact === 'high').length;
    const categories = [...new Set(suggestions.map(s => s.category))];
    
    return `Found ${suggestions.length} optimization opportunities across ${categories.join(', ')}. ` +
           `${highImpact} high-impact changes recommended. ` +
           `Estimated improvements: Performance ${improvement.performance.toFixed(1)}%, ` +
           `Accessibility ${improvement.accessibility.toFixed(1)}%, ` +
           `UX ${improvement.userExperience.toFixed(1)}%.`;
  }

  /**
   * Apply suggestions automatically
   */
  async applySuggestions(
    suggestions: SizeOptimizationSuggestion[],
    threshold: number = 0.7
  ): Promise<Map<string, any>> {
    const applied = new Map<string, any>();
    
    for (const suggestion of suggestions) {
      if (suggestion.confidence >= threshold) {
        // Apply suggestion (implementation would depend on the system)
        applied.set(suggestion.element, {
          oldValue: suggestion.currentSize,
          newValue: suggestion.suggestedSize,
          reason: suggestion.reason
        });
      }
    }
    
    return applied;
  }

  /**
   * Learn from user feedback
   */
  learnFromFeedback(
    context: DesignContext,
    appliedSuggestions: SizeOptimizationSuggestion[],
    feedback: number
  ): void {
    this.learningData.push({
      context,
      applied: appliedSuggestions,
      feedback
    });
    
    // Keep only recent learning data (last 100 entries)
    if (this.learningData.length > 100) {
      this.learningData = this.learningData.slice(-100);
    }
  }

  /**
   * Get cache key for results
   */
  private getCacheKey(config: SizeScheme, context: DesignContext): string {
    return JSON.stringify({ config, context });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Export learning data
   */
  exportLearningData(): string {
    return JSON.stringify(this.learningData, null, 2);
  }

  /**
   * Import learning data
   */
  importLearningData(data: string): void {
    try {
      const imported = JSON.parse(data);
      if (Array.isArray(imported)) {
        this.learningData = imported;
      }
    } catch (error) {
      console.error('Failed to import learning data:', error);
    }
  }
}

/**
 * Create AI optimizer instance
 */
export function createAIOptimizer(config?: AIOptimizationConfig): AISizeOptimizer {
  return new AISizeOptimizer(config);
}
/**
 * @ldesign/size - AI-Powered Size Optimizer
 * 
 * Uses DeepSeek AI to optimize size configurations
 */

import { getDeviceDetector } from './DeviceDetector';
import { sizeManager } from './SizeManager';

export interface AIOptimizerConfig {
  apiKey: string;
  apiUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ReadabilityOptions {
  targetAudience?: 'children' | 'adults' | 'elderly';
  contentType?: 'article' | 'interface' | 'dashboard' | 'mobile-app';
  lightingConditions?: 'bright' | 'normal' | 'dim';
  viewingDistance?: 'close' | 'normal' | 'far';
}

export interface PageContext {
  url?: string;
  title?: string;
  contentLength?: number;
  hasImages?: boolean;
  hasTables?: boolean;
  hasCode?: boolean;
  userAge?: number;
  userPreferences?: Record<string, unknown>;
  contentType?: 'article' | 'interface' | 'dashboard' | 'mobile-app';
}

export interface UserBehavior {
  scrollPatterns: Array<{ position: number; duration: number }>;
  clickPatterns: Array<{ element: string; count: number }>;
  zoomLevel: number;
  sessionDuration: number;
  bounceRate: number;
}

export interface OptimizationSuggestion {
  property: string;
  currentValue: string;
  suggestedValue: string;
  confidence: number;
  reason: string;
}

export class AIOptimizer {
  private config: AIOptimizerConfig;
  private userBehaviorData: UserBehavior[] = [];
  private optimizationHistory: OptimizationSuggestion[] = [];
  private isLearning = false;
  private eventListeners: Array<{ element: EventTarget; event: string; handler: EventListener }> = [];
  private intervalIds: number[] = [];
  private timeoutIds: number[] = [];
  private isDestroyed = false;
  private static readonly MAX_HISTORY_SIZE = 50;
  private static readonly MAX_BEHAVIOR_DATA = 10;

  constructor(config: AIOptimizerConfig) {
    this.config = {
      apiUrl: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat',
      temperature: 0.7,
      maxTokens: 1000,
      ...config
    };

    if (!this.config.apiKey) {
      console.warn('[AIOptimizer] No API key provided, AI features will be limited');
    }
  }

  /**
   * Auto-adjust sizes based on content
   */
  async autoAdjustByContent(element: HTMLElement): Promise<void> {
    if (!this.config.apiKey) {
      console.warn('[AIOptimizer] API key required for AI features');
      return;
    }

    const content = this.analyzeContent(element);
    const suggestions = await this.getAISuggestions(content);
    
    if (suggestions.length > 0) {
      await this.applySuggestions(suggestions);
    }
  }

  /**
   * Analyze content structure
   */
  private analyzeContent(element: HTMLElement): PageContext {
    const text = element.textContent || '';
    const images = element.querySelectorAll('img');
    const tables = element.querySelectorAll('table');
    const code = element.querySelectorAll('code, pre');
    
    return {
      contentLength: text.length,
      hasImages: images.length > 0,
      hasTables: tables.length > 0,
      hasCode: code.length > 0,
      title: document.title,
      url: window.location.href
    };
  }

  /**
   * Get AI suggestions from DeepSeek
   */
  private async getAISuggestions(context: PageContext): Promise<OptimizationSuggestion[]> {
    const prompt = this.buildPrompt(context);
    
    try {
      const response = await fetch(`${this.config.apiUrl}/chat/completions`, {
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
              content: 'You are a UI/UX expert specializing in typography and sizing optimization. Provide specific size recommendations in pixels, rem, or em units.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseAIResponse(data);
    } catch (error) {
      console.error('[AIOptimizer] Failed to get AI suggestions:', error);
      return [];
    }
  }

  /**
   * Build prompt for AI
   */
  private buildPrompt(context: PageContext): string {
    const device = getDeviceDetector().getDevice();
    const viewport = getDeviceDetector().getViewport();
    const currentConfig = sizeManager.getConfig();
    
    return `
      Analyze the following page context and suggest optimal size configurations:
      
      Device: ${device}
      Viewport: ${viewport.width}x${viewport.height}
      Current Base Size: ${currentConfig.baseSize}px
      
      Page Context:
      - Content Length: ${context.contentLength} characters
      - Has Images: ${context.hasImages}
      - Has Tables: ${context.hasTables}
      - Has Code Blocks: ${context.hasCode}
      
      Please provide size optimization suggestions in JSON format:
      {
        "suggestions": [
          {
            "property": "baseSize",
            "currentValue": "${currentConfig.baseSize}px",
            "suggestedValue": "suggested_value",
            "confidence": 0.0-1.0,
            "reason": "explanation"
          }
        ]
      }
      
      Consider:
      1. Readability for the device type
      2. Content density
      3. User experience best practices
      4. Accessibility guidelines (WCAG)
    `;
  }

  /**
   * Parse AI response
   */
  private parseAIResponse(response: { choices: Array<{ message: { content: string } }> }): OptimizationSuggestion[] {
    try {
      const content = response.choices[0].message.content;
      const parsed = JSON.parse(content);
      
      if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
        return parsed.suggestions.filter((s: OptimizationSuggestion) =>
          s.property && 
          s.suggestedValue && 
          s.confidence >= 0.5
        );
      }
    } catch (error) {
      console.error('[AIOptimizer] Failed to parse AI response:', error);
    }
    
    return [];
  }

  /**
   * Apply AI suggestions
   */
  private async applySuggestions(suggestions: OptimizationSuggestion[]): Promise<void> {
    for (const suggestion of suggestions) {
      if (suggestion.confidence >= 0.7) {
        console.info(`[AIOptimizer] Applying suggestion: ${suggestion.property} = ${suggestion.suggestedValue} (${suggestion.reason})`);
        
        // Apply based on property type
        if (suggestion.property === 'baseSize') {
          const value = Number.parseFloat(suggestion.suggestedValue);
          if (!Number.isNaN(value) && value > 0 && value <= 32) {
            sizeManager.setBaseSize(value);
          }
        }
        
        // Store in history with size limit
        this.optimizationHistory.push(suggestion);
        
        // Limit history size to prevent memory growth
        if (this.optimizationHistory.length > AIOptimizer.MAX_HISTORY_SIZE) {
          this.optimizationHistory = this.optimizationHistory.slice(-AIOptimizer.MAX_HISTORY_SIZE);
        }
      }
    }
  }

  /**
   * Optimize for readability
   */
  async optimizeReadability(options: ReadabilityOptions = {}): Promise<void> {
    const {
      targetAudience = 'adults',
      contentType = 'article',
      lightingConditions = 'normal',
      viewingDistance = 'normal'
    } = options;

    // Calculate optimal sizes based on readability research
    let baseSizeMultiplier = 1;
    // let lineHeightMultiplier = 1;
    // let letterSpacingMultiplier = 1;

    // Adjust for target audience
    switch (targetAudience) {
      case 'children':
        baseSizeMultiplier *= 1.2;
        // lineHeightMultiplier *= 1.3;
        // letterSpacingMultiplier *= 1.1;
        break;
      case 'elderly':
        baseSizeMultiplier *= 1.3;
        // lineHeightMultiplier *= 1.4;
        // letterSpacingMultiplier *= 1.2;
        break;
    }

    // Adjust for content type
    switch (contentType) {
      case 'article':
        baseSizeMultiplier *= 1.1;
        // lineHeightMultiplier *= 1.2;
        break;
      case 'dashboard':
        baseSizeMultiplier *= 0.95;
        break;
      case 'mobile-app':
        baseSizeMultiplier *= 1.05;
        break;
    }

    // Adjust for lighting conditions
    switch (lightingConditions) {
      case 'bright':
        baseSizeMultiplier *= 0.95;
        break;
      case 'dim':
        baseSizeMultiplier *= 1.1;
        break;
    }

    // Adjust for viewing distance
    switch (viewingDistance) {
      case 'close':
        baseSizeMultiplier *= 0.9;
        break;
      case 'far':
        baseSizeMultiplier *= 1.2;
        break;
    }

    // Apply optimizations
    const currentConfig = sizeManager.getConfig();
    const optimizedBaseSize = Math.round(currentConfig.baseSize * baseSizeMultiplier);
    
    // Apply if significantly different
    if (Math.abs(optimizedBaseSize - currentConfig.baseSize) >= 1) {
      sizeManager.setBaseSize(optimizedBaseSize);
      
      console.info(`[AIOptimizer] Readability optimized: baseSize ${currentConfig.baseSize}px → ${optimizedBaseSize}px`);
    }

    // If AI is available, get additional suggestions
    if (this.config.apiKey) {
      const context: PageContext = {
        contentType,
        userPreferences: {
          targetAudience,
          lightingConditions,
          viewingDistance
        }
      };
      
      const suggestions = await this.getAISuggestions(context);
      await this.applySuggestions(suggestions);
    }
  }

  /**
   * Learn from user behavior
   */
  learnFromUserBehavior(): void {
    if (!this.isLearning) {
      this.isLearning = true;
      this.startBehaviorTracking();
    }
  }

  /**
   * Start behavior tracking
   */
  private startBehaviorTracking(): void {
    if (typeof window === 'undefined') return;

    const behavior: UserBehavior = {
      scrollPatterns: [],
      clickPatterns: [],
      zoomLevel: 1,
      sessionDuration: 0,
      bounceRate: 0
    };

    const startTime = Date.now();

    // Track scroll patterns with memory optimization
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;
    const scrollHandler = () => {
      if (this.isDestroyed) return;
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        // Limit scroll patterns to prevent memory growth
        if (behavior.scrollPatterns.length > 100) {
          behavior.scrollPatterns = behavior.scrollPatterns.slice(-50);
        }
        behavior.scrollPatterns.push({
          position: window.scrollY,
          duration: Date.now() - startTime
        });
      }, 100);
    };
    
    window.addEventListener('scroll', scrollHandler, { passive: true });
    this.eventListeners.push({ element: window, event: 'scroll', handler: scrollHandler });

    // Track click patterns with cleanup
    const clickHandler = (e: Event) => {
      if (this.isDestroyed) return;
      const target = e.target as HTMLElement;
      const selector = this.getElementSelector(target);
      
      const existing = behavior.clickPatterns.find(p => p.element === selector);
      if (existing) {
        existing.count++;
      } else {
        // Limit click patterns to prevent memory growth
        if (behavior.clickPatterns.length > 50) {
          behavior.clickPatterns = behavior.clickPatterns.slice(-25);
        }
        behavior.clickPatterns.push({ element: selector, count: 1 });
      }
    };
    
    document.addEventListener('click', clickHandler, { passive: true });
    this.eventListeners.push({ element: document, event: 'click', handler: clickHandler });

    // Track zoom level
    const checkZoom = () => {
      behavior.zoomLevel = (window.devicePixelRatio || 1);
    };
    
    const resizeHandler = () => {
      if (!this.isDestroyed) checkZoom();
    };
    window.addEventListener('resize', resizeHandler, { passive: true });
    this.eventListeners.push({ element: window, event: 'resize', handler: resizeHandler });
    checkZoom();

    // Analyze behavior periodically with cleanup
    const intervalId = setInterval(() => {
      if (this.isDestroyed) {
        clearInterval(intervalId);
        return;
      }
      behavior.sessionDuration = Date.now() - startTime;
      this.analyzeBehavior(behavior);
    }, 30000) as unknown as number; // Every 30 seconds
    this.intervalIds.push(intervalId);
  }

  /**
   * Get element selector
   */
  private getElementSelector(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  /**
   * Analyze user behavior
   */
  private async analyzeBehavior(behavior: UserBehavior): Promise<void> {
    // Clone behavior to prevent memory references
    const behaviorCopy = {
      ...behavior,
      scrollPatterns: [...behavior.scrollPatterns].slice(-20), // Keep only last 20 scroll patterns
      clickPatterns: [...behavior.clickPatterns].slice(-20) // Keep only last 20 click patterns
    };
    
    this.userBehaviorData.push(behaviorCopy);
    
    // Keep only recent data with proper limit
    if (this.userBehaviorData.length > AIOptimizer.MAX_BEHAVIOR_DATA) {
      this.userBehaviorData = this.userBehaviorData.slice(-AIOptimizer.MAX_BEHAVIOR_DATA);
    }

    // Analyze patterns
    const patterns = this.extractPatterns();
    
    // Generate recommendations
    if (patterns.needsLargerText) {
      console.info('[AIOptimizer] User behavior suggests larger text size needed');
      const currentSize = sizeManager.getConfig().baseSize;
      sizeManager.setBaseSize(Math.min(currentSize + 1, 24));
    }

    if (patterns.needsMoreSpacing) {
      console.info('[AIOptimizer] User behavior suggests more spacing needed');
      // Would need to implement spacing adjustment
    }

    // If AI is available, get personalized suggestions
    if (this.config.apiKey) {
      await this.getPersonalizedSuggestions(patterns);
    }
  }

  /**
   * Extract behavior patterns
   */
  private extractPatterns(): any {
    if (this.userBehaviorData.length === 0) return {};

    const avgZoom = this.userBehaviorData.reduce((sum, b) => sum + b.zoomLevel, 0) / this.userBehaviorData.length;
    const avgSessionDuration = this.userBehaviorData.reduce((sum, b) => sum + b.sessionDuration, 0) / this.userBehaviorData.length;
    
    return {
      needsLargerText: avgZoom > 1.1,
      needsMoreSpacing: avgSessionDuration < 60000, // Less than 1 minute suggests difficulty
      frequentlyClickedElements: this.getMostClicked(),
      scrollDepth: this.getAverageScrollDepth()
    };
  }

  /**
   * Get most clicked elements
   */
  private getMostClicked(): string[] {
    const allClicks: Record<string, number> = {};
    
    this.userBehaviorData.forEach(behavior => {
      behavior.clickPatterns.forEach(pattern => {
        allClicks[pattern.element] = (allClicks[pattern.element] || 0) + pattern.count;
      });
    });
    
    return Object.entries(allClicks)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([element]) => element);
  }

  /**
   * Get average scroll depth
   */
  private getAverageScrollDepth(): number {
    if (this.userBehaviorData.length === 0) return 0;
    
    const depths = this.userBehaviorData.flatMap(b => 
      b.scrollPatterns.map(p => p.position)
    );
    
    if (depths.length === 0) return 0;
    
    const maxScroll = Math.max(...depths);
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    return docHeight > 0 ? (maxScroll / docHeight) * 100 : 0;
  }

  /**
   * Get personalized suggestions based on patterns
   */
  private async getPersonalizedSuggestions(_patterns: any): Promise<void> {
    // Placeholder for AI prompt generation
    // const _prompt = `
    //   Based on user behavior patterns, suggest size optimizations:
    //   
    //   Patterns:
    //   - Needs larger text: ${patterns.needsLargerText}
    //   - Needs more spacing: ${patterns.needsMoreSpacing}
    //   - Average scroll depth: ${patterns.scrollDepth}%
    //   - Frequently clicked: ${patterns.frequentlyClickedElements?.join(', ')}
    //   
    //   Provide personalized size recommendations.
    // `;

    // Would make API call here
    console.info('[AIOptimizer] Analyzing user patterns for personalization');
  }

  /**
   * Recommend preset based on context
   */
  async recommendPreset(context: PageContext): Promise<string> {
    const device = getDeviceDetector().getDevice();
    const isTouch = getDeviceDetector().isTouch();
    
    // Simple heuristic-based recommendation
    if (device === 'mobile') {
      return isTouch ? 'comfortable' : 'compact';
    } else if (device === 'tablet') {
      return 'comfortable';
    } else if (device === 'desktop' || device === 'laptop') {
      if (context.contentType === 'dashboard') {
        return 'compact';
      } else if (context.contentType === 'article') {
        return 'spacious';
      }
      return 'default';
    } else {
      return 'spacious'; // For TV and widescreen
    }
  }

  /**
   * Get optimization history
   */
  getHistory(): OptimizationSuggestion[] {
    return [...this.optimizationHistory];
  }

  /**
   * Clear optimization history
   */
  clearHistory(): void {
    this.optimizationHistory = [];
  }

  /**
   * Stop learning
   */
  stopLearning(): void {
    this.isLearning = false;
    this.cleanup();
  }
  
  /**
   * Clean up resources
   */
  private cleanup(): void {
    // Remove all event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
    
    // Clear intervals
    this.intervalIds.forEach(id => clearInterval(id));
    this.intervalIds = [];
    
    // Clear timeouts
    this.timeoutIds.forEach(id => clearTimeout(id));
    this.timeoutIds = [];
  }
  
  /**
   * Destroy the optimizer
   */
  destroy(): void {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    this.stopLearning();
    
    // Clear data
    this.userBehaviorData = [];
    this.optimizationHistory = [];
  }

  /**
   * Export learned preferences
   */
  exportPreferences(): string {
    const preferences = {
      behaviorData: this.userBehaviorData,
      optimizationHistory: this.optimizationHistory,
      patterns: this.extractPatterns(),
      timestamp: new Date().toISOString()
    };
    
    return JSON.stringify(preferences, null, 2);
  }

  /**
   * Import learned preferences
   */
  importPreferences(json: string): void {
    try {
      const preferences = JSON.parse(json);
      this.userBehaviorData = preferences.behaviorData || [];
      this.optimizationHistory = preferences.optimizationHistory || [];
      console.info('[AIOptimizer] Preferences imported successfully');
    } catch (error) {
      console.error('[AIOptimizer] Failed to import preferences:', error);
    }
  }
}

// Singleton instance
let optimizer: AIOptimizer | null = null;

/**
 * Get AI optimizer instance
 */
export function getAIOptimizer(config?: AIOptimizerConfig): AIOptimizer {
  if (!optimizer && config) {
    optimizer = new AIOptimizer(config);
  } else if (!optimizer) {
    // Create with empty config (limited functionality)
    optimizer = new AIOptimizer({ apiKey: '' });
  }
  return optimizer;
}

/**
 * Quick access API
 */
export const ai = {
  /**
   * Initialize with API key
   */
  init: (apiKey: string) => getAIOptimizer({ apiKey }),
  
  /**
   * Auto-adjust by content
   */
  auto: (element: HTMLElement) => getAIOptimizer().autoAdjustByContent(element),
  
  /**
   * Optimize readability
   */
  readability: (options?: ReadabilityOptions) => getAIOptimizer().optimizeReadability(options),
  
  /**
   * Start learning
   */
  learn: () => getAIOptimizer().learnFromUserBehavior(),
  
  /**
   * Recommend preset
   */
  recommend: (context: PageContext) => getAIOptimizer().recommendPreset(context),
  
  /**
   * Get history
   */
  history: () => getAIOptimizer().getHistory()
};
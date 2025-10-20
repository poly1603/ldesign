/**
 * AI 智能配色系统
 * 集成 DeepSeek API 提供智能配色建议
 */

import type { ColorScheme, ColorSchemeType } from '../schemes';
import { Color } from '../core/Color';
import { ColorSchemeGenerator } from '../schemes';

/**
 * AI 配色请求选项
 */
export interface AIColorOptions {
  apiKey?: string;
  apiUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  language?: 'zh' | 'en';
}

/**
 * AI 配色建议结果
 */
export interface AIColorSuggestion {
  colors: Color[];
  scheme: ColorScheme;
  description: string;
  reasoning: string;
  tags: string[];
  confidence: number;
}

/**
 * 配色上下文
 */
export interface ColorContext {
  industry?: string;
  mood?: string[];
  target?: string;
  season?: string;
  style?: string;
  preferences?: {
    warm?: boolean;
    vibrant?: boolean;
    minimal?: boolean;
  };
}

/**
 * DeepSeek AI 配色助手
 */
export class ColorAI {
  private apiKey: string;
  private apiUrl: string;
  private model: string;
  private defaultOptions: AIColorOptions;
  
  constructor(options: AIColorOptions = {}) {
    this.apiKey = options.apiKey || 'sk-37b7e5f545814da1923cae055b498c9a';
    this.apiUrl = options.apiUrl || 'https://api.deepseek.com/v1/chat/completions';
    this.model = options.model || 'deepseek-chat';
    this.defaultOptions = {
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 500,
      language: options.language || 'zh'
    };
  }
  
  /**
   * 获取 AI 配色建议
   */
  async getSuggestions(
    context: ColorContext,
    count = 3
  ): Promise<AIColorSuggestion[]> {
    const prompt = this.buildPrompt(context);
    
    try {
      const response = await this.callAPI(prompt);
      const suggestions = this.parseResponse(response);
      
      // 生成配色方案
      const results: AIColorSuggestion[] = [];
      for (const suggestion of suggestions.slice(0, count)) {
        const colors = suggestion.colors.map((c: string) => new Color(c))
        const scheme = ColorSchemeGenerator.generate(
          colors[0],
          suggestion.schemeType as ColorSchemeType,
          { count: colors.length }
        );
        
        results.push({
          colors,
          scheme,
          description: suggestion.description,
          reasoning: suggestion.reasoning,
          tags: suggestion.tags || [],
          confidence: suggestion.confidence || 0.8
        });
      }
      
      return results;
    } catch (error) {
      console.error('AI color suggestion failed:', error);
      // 回退到本地算法
      return this.getFallbackSuggestions(context, count);
    }
  }
  
  /**
   * 分析现有配色
   */
  async analyzeColorScheme(
    colors: Color[],
    context?: ColorContext
  ): Promise<{
    analysis: string;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    score: number;
  }> {
    const colorHexes = colors.map(c => c.toHex());
    const prompt = this.buildAnalysisPrompt(colorHexes, context);
    
    try {
      const response = await this.callAPI(prompt);
      return this.parseAnalysisResponse(response);
    } catch (error) {
      console.error('AI color analysis failed:', error);
      // 回退到本地分析
      return this.getLocalAnalysis(colors);
    }
  }
  
  /**
   * 获取配色灵感
   */
  async getInspiration(
    keyword: string,
    style?: string
  ): Promise<{
    palette: Color[];
    description: string;
    keywords: string[];
  }> {
    const prompt = this.buildInspirationPrompt(keyword, style);
    
    try {
      const response = await this.callAPI(prompt);
      const result = this.parseInspirationResponse(response);
      
      return {
        palette: result.colors.map((c: string) => new Color(c)),
        description: result.description,
        keywords: result.keywords
      }
    } catch (error) {
      console.error('AI inspiration failed:', error);
      // 回退到预设灵感
      return this.getPresetInspiration(keyword);
    }
  }
  
  /**
   * 调用 DeepSeek API
   */
  private async callAPI(prompt: string): Promise<any> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: this.defaultOptions.language === 'zh'
              ? '你是一个专业的色彩设计师，精通色彩理论、设计心理学和品牌设计。请基于用户需求提供专业的配色建议。'
              : 'You are a professional color designer with expertise in color theory, design psychology, and brand design. Please provide professional color suggestions based on user needs.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: this.defaultOptions.temperature,
        max_tokens: this.defaultOptions.maxTokens,
        response_format: { type: "json_object" }
      })
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }
  
  /**
   * 构建提示词
   */
  private buildPrompt(context: ColorContext): string {
    const lang = this.defaultOptions.language;
    
    if (lang === 'zh') {
      return `
请根据以下需求生成配色方案：
- 行业：${context.industry || '通用'}
- 情绪：${context.mood?.join('、') || '专业、现代'}
- 目标用户：${context.target || '大众'}
- 季节：${context.season || '四季通用'}
- 风格：${context.style || '简约'}
- 偏好：${JSON.stringify(context.preferences || {})}

请返回JSON格式，包含3个配色方案：
{
  "suggestions": [
    {
      "colors": ["#hex1", "#hex2", "#hex3"],
      "schemeType": "monochromatic|analogous|complementary|triadic",
      "description": "方案描述",
      "reasoning": "选择理由",
      "tags": ["标签1", "标签2"],
      "confidence": 0.9
    }
  ]
}
      `.trim();
    } else {
      return `
Generate color schemes based on:
- Industry: ${context.industry || 'General'}
- Mood: ${context.mood?.join(', ') || 'Professional, Modern'}
- Target: ${context.target || 'General audience'}
- Season: ${context.season || 'All seasons'}
- Style: ${context.style || 'Minimalist'}
- Preferences: ${JSON.stringify(context.preferences || {})}

Return JSON with 3 color schemes:
{
  "suggestions": [
    {
      "colors": ["#hex1", "#hex2", "#hex3"],
      "schemeType": "monochromatic|analogous|complementary|triadic",
      "description": "Scheme description",
      "reasoning": "Reasoning",
      "tags": ["tag1", "tag2"],
      "confidence": 0.9
    }
  ]
}
      `.trim();
    }
  }
  
  /**
   * 构建分析提示词
   */
  private buildAnalysisPrompt(colors: string[], context?: ColorContext): string {
    const lang = this.defaultOptions.language;
    
    if (lang === 'zh') {
      return `
分析以下配色方案：
颜色：${colors.join(', ')}
${context ? `应用场景：${JSON.stringify(context)}` : ''}

请返回JSON格式的分析结果：
{
  "analysis": "整体分析",
  "strengths": ["优点1", "优点2"],
  "weaknesses": ["缺点1", "缺点2"],
  "suggestions": ["建议1", "建议2"],
  "score": 85
}
      `.trim();
    } else {
      return `
Analyze this color scheme:
Colors: ${colors.join(', ')}
${context ? `Context: ${JSON.stringify(context)}` : ''}

Return JSON analysis:
{
  "analysis": "Overall analysis",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "score": 85
}
      `.trim();
    }
  }
  
  /**
   * 构建灵感提示词
   */
  private buildInspirationPrompt(keyword: string, style?: string): string {
    const lang = this.defaultOptions.language;
    
    if (lang === 'zh') {
      return `
为"${keyword}"生成配色灵感${style ? `，风格：${style}` : ''}。

返回JSON格式：
{
  "colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "description": "配色描述和灵感来源",
  "keywords": ["关键词1", "关键词2", "关键词3"]
}
      `.trim();
    } else {
      return `
Generate color inspiration for "${keyword}"${style ? `, style: ${style}` : ''}.

Return JSON:
{
  "colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "description": "Color description and inspiration",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}
      `.trim();
    }
  }
  
  /**
   * 解析响应
   */
  private parseResponse(response: any): any[] {
    return response.suggestions || [];
  }
  
  /**
   * 解析分析响应
   */
  private parseAnalysisResponse(response: any): any {
    return {
      analysis: response.analysis || '',
      strengths: response.strengths || [],
      weaknesses: response.weaknesses || [],
      suggestions: response.suggestions || [],
      score: response.score || 70
    };
  }
  
  /**
   * 解析灵感响应
   */
  private parseInspirationResponse(response: any): any {
    return {
      colors: response.colors || [],
      description: response.description || '',
      keywords: response.keywords || []
    };
  }
  
  /**
   * 回退建议（当 API 不可用时）
   */
  private getFallbackSuggestions(
    context: ColorContext,
    count: number
  ): AIColorSuggestion[] {
    const suggestions: AIColorSuggestion[] = [];
    
    // 基于上下文生成基础颜色
    let baseHue = 210; // 默认蓝色
    
    if (context.mood?.includes('活力')) baseHue = 30;
    if (context.mood?.includes('自然')) baseHue = 120;
    if (context.mood?.includes('优雅')) baseHue = 270;
    if (context.preferences?.warm) baseHue = 20;
    
    for (let i = 0; i < count; i++) {
      const baseColor = Color.fromHSL(baseHue + i * 30, 70, 50);
      const schemeType: ColorSchemeType = ['analogous', 'complementary', 'triadic'][i] as ColorSchemeType;
      
      const scheme = ColorSchemeGenerator.generate(baseColor, schemeType, { count: 5 });
      
      suggestions.push({
        colors: scheme.colors,
        scheme,
        description: `基于${scheme.description}的配色方案`,
        reasoning: '根据您的需求自动生成',
        tags: context.mood || [],
        confidence: 0.6
      });
    }
    
    return suggestions;
  }
  
  /**
   * 本地分析
   */
  private getLocalAnalysis(colors: Color[]): any {
    const harmony = ColorSchemeGenerator.evaluateHarmony({
      type: 'custom' as ColorSchemeType,
      base: colors[0],
      colors,
      description: 'Custom scheme'
    });
    
    return {
      analysis: `配色和谐度：${harmony}%`,
      strengths: harmony > 70 ? ['色彩和谐', '视觉舒适'] : [],
      weaknesses: harmony < 50 ? ['色彩冲突', '缺乏统一性'] : [],
      suggestions: ['考虑使用更协调的色彩方案'],
      score: harmony
    };
  }
  
  /**
   * 预设灵感
   */
  private getPresetInspiration(keyword: string): any {
    const inspirations: Record<string, any> = {
      '海洋': {
        palette: ['#006994', '#00A8E8', '#00C9FF', '#7EC8E3', '#FFFFFF'].map((c: string) => new Color(c)),
        description: '深邃的海洋蓝配合清新的天空蓝，营造宁静致远的氛围',
        keywords: ['宁静', '深邃', '清新']
      },
      '森林': {
        palette: ['#2D5016', '#3A7D44', '#69B578', '#95D5B2', '#D5F2E3'].map((c: string) => new Color(c)),
        description: '从深绿到浅绿的自然渐变，展现生机勃勃的森林气息',
        keywords: ['自然', '生机', '和谐']
      },
      '日落': {
        palette: ['#FF6B35', '#F77825', '#FFB700', '#FFCB47', '#FFE5AD'].map((c: string) => new Color(c)),
        description: '温暖的橙黄色调，捕捉夕阳西下的美好瞬间',
        keywords: ['温暖', '浪漫', '希望']
      }
    };
    
    const defaultPalette = {
      palette: ColorSchemeGenerator.generate(
        new Color('#3498db'),
        'analogous',
        { count: 5 }
      ).colors,
      description: `基于"${keyword}"的配色灵感`,
      keywords: [keyword, '创意', '设计']
    };
    
    return inspirations[keyword] || defaultPalette;
  }
}

/**
 * 创建 AI 配色助手实例
 */
export function createColorAI(options?: AIColorOptions): ColorAI {
  return new ColorAI(options);
}

// 默认实例
export const colorAI = new ColorAI();
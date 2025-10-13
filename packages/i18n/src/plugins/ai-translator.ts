/**
 * @ldesign/i18n - AI Translator Plugin
 * AI辅助翻译插件，支持自动翻译和智能建议
 */

import type { I18nPlugin, I18nInstance, Locale, Messages } from '../types';

/**
 * AI翻译服务接口
 */
export interface AITranslationService {
  translate(text: string, from: string, to: string): Promise<string>;
  translateBatch(texts: string[], from: string, to: string): Promise<string[]>;
  detectLanguage(text: string): Promise<string>;
  suggest(text: string, context?: string): Promise<string[]>;
}

/**
 * AI翻译配置
 */
export interface AITranslatorConfig {
  service?: AITranslationService;
  apiKey?: string;
  apiUrl?: string;
  provider?: 'openai' | 'google' | 'azure' | 'custom';
  model?: string;
  autoTranslate?: boolean;
  cacheTranslations?: boolean;
  fallbackLocale?: Locale;
  customPrompt?: string;
  maxRetries?: number;
  timeout?: number;
}

/**
 * 内置的OpenAI翻译服务
 */
class OpenAITranslationService implements AITranslationService {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor(apiKey: string, apiUrl = 'https://api.openai.com/v1', model = 'gpt-3.5-turbo') {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
    this.model = model;
  }

  async translate(text: string, from: string, to: string): Promise<string> {
    const prompt = `Translate the following text from ${from} to ${to}. 
    Keep the same tone and style. Preserve any placeholders like {name} or {count}.
    Only return the translated text without any explanation.
    
    Text: ${text}`;

    try {
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
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
              content: 'You are a professional translator. Translate accurately while preserving formatting and placeholders.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Translation failed:', error);
      throw error;
    }
  }

  async translateBatch(texts: string[], from: string, to: string): Promise<string[]> {
    // 批量翻译以提高效率
    const prompt = `Translate the following texts from ${from} to ${to}. 
    Keep the same tone and style for each. Preserve any placeholders like {name} or {count}.
    Return a JSON array with the translated texts in the same order.
    
    Texts:
    ${JSON.stringify(texts, null, 2)}`;

    try {
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
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
              content: 'You are a professional translator. Return only a JSON array of translations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      const data = await response.json();
      const result = data.choices[0].message.content.trim();
      return JSON.parse(result);
    } catch (error) {
      console.error('Batch translation failed:', error);
      // 失败时逐个翻译
      return Promise.all(texts.map(text => this.translate(text, from, to)));
    }
  }

  async detectLanguage(text: string): Promise<string> {
    const prompt = `Detect the language of the following text and return only the ISO 639-1 language code (e.g., 'en', 'zh', 'es').
    
    Text: ${text}`;

    try {
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0,
          max_tokens: 10
        })
      });

      const data = await response.json();
      return data.choices[0].message.content.trim().toLowerCase();
    } catch (error) {
      console.error('Language detection failed:', error);
      return 'en'; // 默认返回英语
    }
  }

  async suggest(text: string, context?: string): Promise<string[]> {
    const prompt = `Suggest 3 alternative translations or phrasings for the following text.
    ${context ? `Context: ${context}` : ''}
    
    Text: ${text}
    
    Return only a JSON array of suggestions.`;

    try {
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 200
        })
      });

      const data = await response.json();
      const result = data.choices[0].message.content.trim();
      return JSON.parse(result);
    } catch (error) {
      console.error('Suggestion generation failed:', error);
      return [];
    }
  }
}

/**
 * 模拟的AI翻译服务（用于演示）
 */
class MockAITranslationService implements AITranslationService {
  async translate(text: string, from: string, to: string): Promise<string> {
    // 简单的模拟翻译
    const translations: Record<string, Record<string, string>> = {
      'Hello': { 'zh': '你好', 'es': 'Hola', 'fr': 'Bonjour', 'de': 'Hallo', 'ja': 'こんにちは' },
      'Welcome': { 'zh': '欢迎', 'es': 'Bienvenido', 'fr': 'Bienvenue', 'de': 'Willkommen', 'ja': 'ようこそ' },
      'Thank you': { 'zh': '谢谢', 'es': 'Gracias', 'fr': 'Merci', 'de': 'Danke', 'ja': 'ありがとう' },
    };

    // 检查是否有预定义的翻译
    if (translations[text] && translations[text][to]) {
      return translations[text][to];
    }

    // 返回带有标记的文本以表示是自动翻译的
    return `[AI] ${text} (${to})`;
  }

  async translateBatch(texts: string[], from: string, to: string): Promise<string[]> {
    return Promise.all(texts.map(text => this.translate(text, from, to)));
  }

  async detectLanguage(text: string): Promise<string> {
    // 简单的语言检测逻辑
    if (/[\u4e00-\u9fa5]/.test(text)) return 'zh';
    if (/[ぁ-ん]|[ァ-ヴ]/.test(text)) return 'ja';
    if (/[가-힣]/.test(text)) return 'ko';
    if (/[а-яА-Я]/.test(text)) return 'ru';
    return 'en';
  }

  async suggest(text: string, context?: string): Promise<string[]> {
    // 返回一些模拟的建议
    return [
      `${text} (alternative 1)`,
      `${text} (alternative 2)`,
      `${text} (alternative 3)`
    ];
  }
}

/**
 * AI翻译插件
 */
export class AITranslatorPlugin implements I18nPlugin {
  name = 'ai-translator';
  version = '1.0.0';
  
  private config: AITranslatorConfig;
  private service: AITranslationService;
  private cache: Map<string, string> = new Map();
  private i18n?: I18nInstance;

  constructor(config: AITranslatorConfig = {}) {
    this.config = {
      autoTranslate: true,
      cacheTranslations: true,
      maxRetries: 3,
      timeout: 30000,
      ...config
    };

    // 初始化翻译服务
    if (config.service) {
      this.service = config.service;
    } else if (config.apiKey && config.provider === 'openai') {
      this.service = new OpenAITranslationService(
        config.apiKey,
        config.apiUrl,
        config.model
      );
    } else {
      // 使用模拟服务
      this.service = new MockAITranslationService();
      console.warn('[AI Translator] No API key provided, using mock service');
    }
  }

  async install(i18n: I18nInstance): Promise<void> {
    this.i18n = i18n;

    // 监听缺失键事件
    i18n.on('missingKey', async (event) => {
      if (!this.config.autoTranslate) return;

      const { key, locale } = event;
      if (!key || !locale) return;

      try {
        // 尝试从其他语言翻译
        const sourceLocale = this.config.fallbackLocale || i18n.fallbackLocale || 'en';
        const sourceMessage = this.getSourceMessage(i18n, key, sourceLocale);

        if (sourceMessage) {
          const translated = await this.translateMessage(
            sourceMessage,
            sourceLocale as string,
            locale
          );

          if (translated) {
            // 动态添加翻译
            this.addTranslation(i18n, locale, key, translated);
            console.log(`[AI Translator] Auto-translated "${key}" to ${locale}`);
          }
        }
      } catch (error) {
        console.error(`[AI Translator] Failed to translate "${key}":`, error);
      }
    });

    // 添加AI翻译方法到i18n实例
    (i18n as any).aiTranslate = this.translateText.bind(this);
    (i18n as any).aiTranslateBatch = this.translateBatch.bind(this);
    (i18n as any).aiDetectLanguage = this.detectLanguage.bind(this);
    (i18n as any).aiSuggest = this.suggest.bind(this);
    (i18n as any).aiTranslateAll = this.translateAllMissing.bind(this);
  }

  async uninstall(i18n: I18nInstance): Promise<void> {
    // 清理添加的方法
    delete (i18n as any).aiTranslate;
    delete (i18n as any).aiTranslateBatch;
    delete (i18n as any).aiDetectLanguage;
    delete (i18n as any).aiSuggest;
    delete (i18n as any).aiTranslateAll;
    
    // 清理缓存
    this.cache.clear();
  }

  /**
   * 翻译文本
   */
  async translateText(text: string, from: string, to: string): Promise<string> {
    const cacheKey = `${text}:${from}:${to}`;
    
    // 检查缓存
    if (this.config.cacheTranslations && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const translated = await this.service.translate(text, from, to);
      
      // 缓存结果
      if (this.config.cacheTranslations) {
        this.cache.set(cacheKey, translated);
      }
      
      return translated;
    } catch (error) {
      console.error('Translation failed:', error);
      throw error;
    }
  }

  /**
   * 批量翻译
   */
  async translateBatch(texts: string[], from: string, to: string): Promise<string[]> {
    return this.service.translateBatch(texts, from, to);
  }

  /**
   * 检测语言
   */
  async detectLanguage(text: string): Promise<string> {
    return this.service.detectLanguage(text);
  }

  /**
   * 获取建议
   */
  async suggest(text: string, context?: string): Promise<string[]> {
    return this.service.suggest(text, context);
  }

  /**
   * 翻译所有缺失的键
   */
  async translateAllMissing(targetLocale: Locale): Promise<Map<string, string>> {
    if (!this.i18n) {
      throw new Error('Plugin not installed');
    }

    const translations = new Map<string, string>();
    const sourceLocale = this.config.fallbackLocale || this.i18n.fallbackLocale || 'en';
    const sourceMessages = this.i18n.getMessages(sourceLocale as string);
    const targetMessages = this.i18n.getMessages(targetLocale) || {};

    if (!sourceMessages) {
      console.warn(`No messages found for source locale: ${sourceLocale}`);
      return translations;
    }

    // 收集所有需要翻译的文本
    const toTranslate: Array<{ key: string; text: string }> = [];
    this.collectMissingKeys(sourceMessages, targetMessages, toTranslate);

    if (toTranslate.length === 0) {
      console.log('No missing translations found');
      return translations;
    }

    // 批量翻译
    console.log(`Translating ${toTranslate.length} missing keys to ${targetLocale}...`);
    const texts = toTranslate.map(item => item.text);
    const translatedTexts = await this.translateBatch(
      texts,
      sourceLocale as string,
      targetLocale
    );

    // 构建翻译映射
    toTranslate.forEach((item, index) => {
      translations.set(item.key, translatedTexts[index]);
      this.addTranslation(this.i18n!, targetLocale, item.key, translatedTexts[index]);
    });

    console.log(`Successfully translated ${translations.size} keys`);
    return translations;
  }

  /**
   * 翻译消息
   */
  private async translateMessage(
    message: string,
    from: string,
    to: string
  ): Promise<string> {
    return this.translateText(message, from, to);
  }

  /**
   * 获取源消息
   */
  private getSourceMessage(
    i18n: I18nInstance,
    key: string,
    locale: Locale | Locale[]
  ): string | null {
    const locales = Array.isArray(locale) ? locale : [locale];
    
    for (const loc of locales) {
      const messages = i18n.getMessages(loc);
      if (messages) {
        const message = this.getNestedValue(messages, key);
        if (message && typeof message === 'string') {
          return message;
        }
      }
    }
    
    return null;
  }

  /**
   * 添加翻译
   */
  private addTranslation(
    i18n: I18nInstance,
    locale: Locale,
    key: string,
    value: string
  ): void {
    const messages = i18n.getMessages(locale) || {};
    this.setNestedValue(messages, key, value);
    i18n.mergeMessages(locale, messages);
  }

  /**
   * 收集缺失的键
   */
  private collectMissingKeys(
    source: any,
    target: any,
    result: Array<{ key: string; text: string }>,
    prefix = ''
  ): void {
    for (const [key, value] of Object.entries(source)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'string') {
        const targetValue = this.getNestedValue(target, fullKey);
        if (!targetValue) {
          result.push({ key: fullKey, text: value });
        }
      } else if (typeof value === 'object' && value !== null) {
        this.collectMissingKeys(value, target, result, fullKey);
      }
    }
  }

  /**
   * 获取嵌套值
   */
  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return null;
      }
    }
    
    return current;
  }

  /**
   * 设置嵌套值
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    let current = obj;
    
    for (const key of keys) {
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[lastKey] = value;
  }
}

/**
 * 创建AI翻译插件
 */
export function createAITranslator(config?: AITranslatorConfig): AITranslatorPlugin {
  return new AITranslatorPlugin(config);
}
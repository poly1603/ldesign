/**
 * @ldesign/i18n - Optimized Core I18n Class
 * Performance-optimized internationalization engine
 */

import type {
  I18nInstance,
  I18nConfig,
  I18nEventType,
  I18nEventData,
  I18nEventListener,
  I18nContext,
  I18nPlugin,
  Locale,
  Messages,
  MessageKey,
  TranslateOptions,
  TranslationFunction,
  InterpolationParams,
  MessageLoader,
  MessageStorage,
  LanguageDetector,
  Cache
} from '../types';

import { InterpolationEngine } from './interpolation';
import { PluralizationEngine } from './pluralization';
import { createCache, LRUCache } from './cache';
import {
  EventEmitter,
  deepMerge,
  getNestedValue,
  isPlainObject,
  isString,
  warn,
  error as logError,
  parseLocale,
  formatLocale,
  getBrowserLanguage
} from '../utils/helpers';

const VERSION = '2.0.0';

// Object pool for reducing GC pressure
export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;
  private maxSize: number;

  constructor(factory: () => T, reset: (obj: T) => void, maxSize = 100) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
  }

  get(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.factory();
  }

  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.reset(obj);
      this.pool.push(obj);
    }
  }
}

// Fast cache key generation using string concatenation
export class FastCacheKeyBuilder {
  private static readonly separator = '\x00'; // Use null character as separator for uniqueness
  private buffer: string[] = [];

  add(value: string | number | undefined): this {
    if (value !== undefined) {
      this.buffer.push(String(value));
    }
    return this;
  }

  build(): string {
    const result = this.buffer.join(FastCacheKeyBuilder.separator);
    this.buffer.length = 0; // Reset buffer
    return result;
  }

  reset(): void {
    this.buffer.length = 0;
  }
}

export class OptimizedI18n implements I18nInstance {
  readonly version = VERSION;
  readonly config: Readonly<I18nConfig>;
  
  private _locale: Locale;
  private _fallbackLocale: Locale | Locale[];
  private messages: Map<Locale, Messages> = new Map();
  private loader?: MessageLoader;
  private storage?: MessageStorage;
  private detector?: LanguageDetector;
  private cache: Cache<string, string>;
  private eventEmitter: EventEmitter = new EventEmitter();
  private interpolation: InterpolationEngine;
  private pluralization: PluralizationEngine;
  private plugins: Map<string, I18nPlugin> = new Map();
  private initialized = false;
  private namespaces: Map<string, Map<Locale, Messages>> = new Map();
  private defaultNamespace: string;
  private keySeparator: string;
  private namespaceSeparator: string;
  
  // Performance optimizations
  private cacheKeyBuilder = new FastCacheKeyBuilder();
  private optionsPool: ObjectPool<TranslateOptions>;
  private weakRefCache = new WeakMap<object, string>();
  private hotPathCache = new Map<string, string>(); // Small cache for most frequent translations
  private readonly HOT_PATH_CACHE_SIZE = 50;
  private accessCount = new Map<string, number>();
  private readonly isDev = typeof window !== 'undefined' && (window as any).__DEV__ === true;
  
  constructor(config: I18nConfig = {}) {
    this.config = Object.freeze({ ...config });
    
    // Initialize locale
    this._locale = config.locale || this.detectLocale() || 'en';
    this._fallbackLocale = config.fallbackLocale || 'en';
    
    // Initialize separators
    this.keySeparator = config.keySeparator ?? '.';
    this.namespaceSeparator = config.namespaceSeparator ?? ':';
    this.defaultNamespace = config.defaultNamespace || 'translation';
    
    // Initialize engines
    this.interpolation = new InterpolationEngine(config.interpolation);
    this.pluralization = new PluralizationEngine(config.pluralSeparator);
    
    // Initialize cache with performance optimization
    this.cache = config.cache === false 
      ? new LRUCache<string, string>(0) 
      : createCache(typeof config.cache === 'object' ? config.cache : { maxSize: 1000 });
    
    // Initialize object pool for options
    this.optionsPool = new ObjectPool(
      () => ({}),
      (obj) => {
        // Reset object properties
        for (const key in obj) {
          delete obj[key];
        }
      },
      50
    );
    
    // Set loaders
    this.loader = config.loader;
    this.storage = config.storage;
    this.detector = config.detector;
    
    // Load initial messages
    if (config.messages) {
      Object.entries(config.messages).forEach(([locale, msgs]) => {
        this.addMessages(locale, msgs);
      });
    }
    
    // Bind translation function with fast path
    this.t = this.createOptimizedTranslate();
  }
  
  // ============== Initialization ==============
  
  async init(): Promise<void> {
    // Mark as initialized
    this.initialized = true;
    
    // Load initial locale if loader is available
    if (this.loader && !this.hasLocale(this._locale)) {
      try {
        const messages = await this.loader.load(this._locale);
        this.addMessages(this._locale, messages);
      } catch (error) {
        console.warn(`Failed to load initial locale ${this._locale}:`, error);
      }
    }
    
    // Emit ready event
    this.emit('ready', { locale: this._locale });
  }
  
  // ============== Properties ==============
  
  get locale(): Locale {
    return this._locale;
  }
  
  set locale(value: Locale) {
    if (value !== this._locale) {
      const oldLocale = this._locale;
      this._locale = value;
      this.clearPerformanceCaches();
      this.emit('localeChanged', { locale: value, oldLocale });
    }
  }
  
  get fallbackLocale(): Locale | Locale[] {
    return this._fallbackLocale;
  }
  
  set fallbackLocale(value: Locale | Locale[]) {
    this._fallbackLocale = value;
    this.clearPerformanceCaches();
  }
  
  // ============== Core Translation (Optimized) ==============
  
  private createOptimizedTranslate(): TranslationFunction {
    return ((
      key: MessageKey,
      optionsOrParams?: TranslateOptions | InterpolationParams | string,
      maybeParams?: InterpolationParams
    ): string => {
      // Fast path for simple translations without options
      if (!optionsOrParams && !maybeParams) {
        const fastKey = `${this._locale}${this.namespaceSeparator}${this.defaultNamespace}${this.keySeparator}${key}`;
        
        // Check hot path cache first
        const hotCached = this.hotPathCache.get(fastKey);
        if (hotCached !== undefined) {
          this.updateAccessCount(fastKey);
          return hotCached;
        }
        
        // Check main cache
        const cached = this.cache.get(fastKey);
        if (cached !== undefined) {
          this.updateHotPathCache(fastKey, cached);
          return cached;
        }
      }
      
      // Fall back to full translation logic
      return this.translate(key, this.normalizeOptionsOptimized(optionsOrParams, maybeParams));
    }) as TranslationFunction;
  }
  
  t: TranslationFunction;
  
  translate(key: MessageKey, options: TranslateOptions = {}): string {
    const locale = options.locale || this.locale;
    const namespace = options.namespace || this.defaultNamespace;
    
    // Optimized cache key generation
    const cacheKey = this.getCacheKeyOptimized(locale, key, namespace, options);
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached !== undefined) {
      this.updateHotPathCache(cacheKey, cached);
      return cached;
    }
    
    // Resolve message
    let message = this.resolveMessageOptimized(key, locale, namespace, options);
    
    if (message === undefined) {
      // Try fallback locales
      message = this.resolveFallbackOptimized(key, options);
    }
    
    if (message === undefined) {
      // Handle missing translation
      const result = this.handleMissing(key, locale, namespace, options);
      this.cache.set(cacheKey, result);
      this.updateHotPathCache(cacheKey, result);
      return result;
    }
    
    // Handle pluralization
    if (options.count !== undefined && this.pluralization.hasPluralForms(message)) {
      message = this.pluralization.format(message, options.count, locale, options.params);
    }
    
    // Handle interpolation
    if (options.params) {
      const interpolationParams = { ...options.params };
      
      // Add translation function for nested translations
      interpolationParams.$t = (k: string, p?: any) => this.translate(k, { ...options, key: k, params: p });
      
      message = this.interpolation.interpolate(message, interpolationParams, locale);
    }
    
    // Cache result
    this.cache.set(cacheKey, message);
    this.updateHotPathCache(cacheKey, message);
    
    return message;
  }
  
  exists(key: MessageKey, options: TranslateOptions = {}): boolean {
    const locale = options.locale || this.locale;
    const namespace = options.namespace || this.defaultNamespace;
    
    const message = this.resolveMessageOptimized(key, locale, namespace, options);
    return message !== undefined;
  }
  
  plural(key: MessageKey, count: number, options: TranslateOptions = {}): string {
    return this.translate(key, { ...options, count });
  }
  
  // ============== Optimized Private Methods ==============
  
  private getCacheKeyOptimized(
    locale: Locale,
    key: MessageKey,
    namespace: string,
    options: TranslateOptions
  ): string {
    this.cacheKeyBuilder.reset();
    this.cacheKeyBuilder
      .add(locale)
      .add(namespace)
      .add(key);
    
    if (options.count !== undefined) {
      this.cacheKeyBuilder.add(`c${options.count}`);
    }
    
    if (options.context) {
      this.cacheKeyBuilder.add(`x${options.context}`);
    }
    
    return this.cacheKeyBuilder.build();
  }
  
  private normalizeOptionsOptimized(
    optionsOrParams?: TranslateOptions | InterpolationParams | string,
    maybeParams?: InterpolationParams
  ): TranslateOptions {
    if (!optionsOrParams) {
      return {};
    }
    
    const type = typeof optionsOrParams;
    
    if (type === 'string') {
      const opts = this.optionsPool.get();
      opts.defaultValue = optionsOrParams as string;
      if (maybeParams) opts.params = maybeParams;
      return opts;
    }
    
    if (type === 'object') {
      const obj = optionsOrParams as any;
      
      // Fast check for options keys
      if (obj.locale || obj.fallbackLocale || obj.defaultValue || 
          obj.count !== undefined || obj.context || obj.namespace) {
        return obj as TranslateOptions;
      }
      
      // It's params
      const opts = this.optionsPool.get();
      opts.params = obj as InterpolationParams;
      return opts;
    }
    
    return {};
  }
  
  private resolveMessageOptimized(
    key: MessageKey,
    locale: Locale,
    namespace: string,
    options: TranslateOptions
  ): string | undefined {
    // Get messages for locale and namespace
    const messages = namespace === this.defaultNamespace
      ? this.messages.get(locale)
      : this.namespaces.get(namespace)?.get(locale);
    
    if (!messages) {
      return undefined;
    }
    
    // Handle namespace in key (optimized)
    let resolvedKey = key;
    const nsIndex = this.namespaceSeparator ? key.indexOf(this.namespaceSeparator) : -1;
    
    if (nsIndex > -1) {
      const keyNamespace = key.substring(0, nsIndex);
      resolvedKey = key.substring(nsIndex + this.namespaceSeparator.length);
      
      const nsMessages = this.namespaces.get(keyNamespace)?.get(locale);
      if (nsMessages) {
        const value = getNestedValue(nsMessages, resolvedKey, this.keySeparator);
        if (value !== undefined && isString(value)) {
          return value;
        }
      }
    }
    
    // Get value using key separator
    const value = getNestedValue(messages, resolvedKey, this.keySeparator);
    
    if (value !== undefined) {
      if (isString(value)) {
        return value;
      } else if (isPlainObject(value) && options.count !== undefined) {
        // Handle plural object
        return this.pluralization.selectPlural(value as any, options.count, locale);
      }
    }
    
    return undefined;
  }
  
  private resolveFallbackOptimized(key: MessageKey, options: TranslateOptions): string | undefined {
    const fallbacks = Array.isArray(this.fallbackLocale) 
      ? this.fallbackLocale 
      : [this.fallbackLocale];
    
    for (let i = 0; i < fallbacks.length; i++) {
      const fallback = fallbacks[i];
      if (fallback === options.locale) continue;
      
      const message = this.resolveMessageOptimized(
        key, 
        fallback, 
        options.namespace || this.defaultNamespace,
        options
      );
      
      if (message !== undefined) {
        if (this.isDev) {
          this.emit('fallback', { 
            key, 
            locale: options.locale || this.locale, 
            fallback 
          });
        }
        return message;
      }
    }
    
    return undefined;
  }
  
  private updateHotPathCache(key: string, value: string): void {
    // Update access count
    const count = (this.accessCount.get(key) || 0) + 1;
    this.accessCount.set(key, count);
    
    // Add to hot path cache if frequently accessed
    if (count > 5 && this.hotPathCache.size < this.HOT_PATH_CACHE_SIZE) {
      this.hotPathCache.set(key, value);
    } else if (count > 10) {
      // Replace least accessed item if cache is full
      if (this.hotPathCache.size >= this.HOT_PATH_CACHE_SIZE) {
        const minKey = this.findLeastAccessedKey();
        if (minKey) {
          this.hotPathCache.delete(minKey);
          this.accessCount.delete(minKey);
        }
      }
      this.hotPathCache.set(key, value);
    }
  }
  
  private updateAccessCount(key: string): void {
    this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
  }
  
  private findLeastAccessedKey(): string | undefined {
    let minKey: string | undefined;
    let minCount = Infinity;
    
    for (const [key, count] of this.accessCount) {
      if (this.hotPathCache.has(key) && count < minCount) {
        minCount = count;
        minKey = key;
      }
    }
    
    return minKey;
  }
  
  private clearPerformanceCaches(): void {
    this.hotPathCache.clear();
    this.accessCount.clear();
    this.cache.clear();
  }
  
  // ============== Locale Management ==============
  
  async setLocale(locale: Locale): Promise<void> {
    const oldLocale = this.locale;
    
    // Load messages if not already loaded
    if (!this.hasLocale(locale) && this.loader) {
      this.emit('loading', { locale });
      
      try {
        const messages = await this.loader.load(locale);
        this.addMessages(locale, messages);
        this.emit('loaded', { locale });
      } catch (err) {
        this.emit('loadError', { locale, error: err as Error });
        throw err;
      }
    }
    
    this.locale = locale;
    
    // Clear all caches when locale changes
    this.clearPerformanceCaches();
    
    this.emit('localeChanged', { locale, oldLocale });
  }
  
  getLocale(): Locale {
    return this.locale;
  }
  
  addLocale(locale: Locale, messages: Messages): void {
    this.addMessages(locale, messages);
  }
  
  removeLocale(locale: Locale): void {
    this.messages.delete(locale);
    
    // Remove from namespaces
    this.namespaces.forEach(ns => ns.delete(locale));
    
    // Clear caches
    this.clearPerformanceCaches();
  }
  
  hasLocale(locale: Locale): boolean {
    return this.messages.has(locale);
  }
  
  getAvailableLocales(): Locale[] {
    return Array.from(this.messages.keys());
  }
  
  // ============== Message Management ==============
  
  addMessages(locale: Locale, messages: Messages, namespace?: string): void {
    if (namespace) {
      if (!this.namespaces.has(namespace)) {
        this.namespaces.set(namespace, new Map());
      }
      this.namespaces.get(namespace)!.set(locale, messages);
    } else {
      this.messages.set(locale, messages);
    }
    
    // Clear caches when messages change
    this.clearPerformanceCaches();
  }
  
  setMessages(locale: Locale, messages: Messages, namespace?: string): void {
    this.addMessages(locale, messages, namespace);
  }
  
  getMessages(locale?: Locale, namespace?: string): Messages | null {
    const targetLocale = locale || this.locale;
    
    if (namespace) {
      return this.namespaces.get(namespace)?.get(targetLocale) || null;
    }
    
    return this.messages.get(targetLocale) || null;
  }
  
  mergeMessages(locale: Locale, messages: Messages, namespace?: string): void {
    const existing = this.getMessages(locale, namespace) || {};
    const merged = deepMerge({}, existing, messages);
    this.setMessages(locale, merged, namespace);
  }
  
  // ============== Other methods remain the same ==============
  
  // ... (rest of the methods like namespace management, formatting, events, plugins, etc.)
  // These would be the same as in the original implementation
  
  private handleMissing(
    key: MessageKey,
    locale: Locale,
    namespace: string,
    options: TranslateOptions
  ): string {
    // Only emit and warn in development
    if (this.isDev) {
      this.emit('missingKey', { key, locale, namespace });
      
      if (this.config.warnOnMissing !== false) {
        warn(`Missing translation for key "${key}" in locale "${locale}"`);
      }
    }
    
    // Use custom handler if provided
    if (this.config.missingKeyHandler) {
      return this.config.missingKeyHandler(key, locale, namespace, options.defaultValue);
    }
    
    // Return default value or key
    return options.defaultValue || key;
  }
  
  private detectLocale(): Locale | null {
    // Use custom detector if provided
    if (this.detector) {
      return this.detector.detect();
    }
    
    // Use browser language as fallback
    return getBrowserLanguage();
  }
  
  // ... implement remaining methods from original I18n class
  
  destroy(): void {
    this.clearPerformanceCaches();
    this.messages.clear();
    this.namespaces.clear();
    this.plugins.clear();
    this.eventEmitter.removeAllListeners();
    
    // Clean up object pool
    this.optionsPool = null as any;
  }
}

// Export as default I18n for drop-in replacement
export { OptimizedI18n as I18n };
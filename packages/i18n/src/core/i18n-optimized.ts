/**
 * @ldesign/i18n - Optimized Core I18n Class
 * Performance-optimized internationalization engine
 */

import type {
  Cache,
  I18nConfig,
  I18nContext,
  I18nEventData,
  I18nEventListener,
  I18nEventType,
  I18nInstance,
  I18nPlugin,
  InterpolationParams,
  LanguageDetector,
  Locale,
  MessageKey,
  MessageLoader,
  Messages,
  MessageStorage,
  TranslateOptions,
  TranslationFunction
} from '../types';

import {
  deepMerge,
  EventEmitter,
  getBrowserLanguage,
  getNestedValue,
  isPlainObject,
  isString,
  warn
} from '../utils/helpers';
import { createCache, LRUCache } from './cache';
import { InterpolationEngine } from './interpolation';
import { PluralizationEngine } from './pluralization';

const VERSION = '2.0.0';

// Singleton Object pool for reducing GC pressure
export class ObjectPool<T> {
  private readonly pool: T[] = [];
  private readonly factory: () => T;
  private readonly reset: (obj: T) => void;
  private readonly maxSize: number;

  constructor(factory: () => T, reset: (obj: T) => void, maxSize = 50) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
  }

  get(): T {
    return this.pool.pop() || this.factory();
  }

  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.reset(obj);
      this.pool.push(obj);
    }
  }

  clear(): void {
    this.pool.length = 0;
  }
}

// Fast cache key generation with pre-allocated buffer
export class FastCacheKeyBuilder {
  private static readonly separator = '\x00';
  private static readonly instance = new FastCacheKeyBuilder(); // Singleton
  private readonly buffer: string[] = [];

  static get(): FastCacheKeyBuilder {
    return FastCacheKeyBuilder.instance;
  }

  add(value: string | number | undefined): this {
    if (value !== undefined) {
      this.buffer.push(String(value));
    }
    return this;
  }

  build(): string {
    if (this.buffer.length === 0) return '';
    const result = this.buffer.join(FastCacheKeyBuilder.separator);
    this.buffer.length = 0;
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
  
  // Performance optimizations - using singletons and lazy init
  private cacheKeyBuilder = FastCacheKeyBuilder.get();
  private optionsPool: ObjectPool<TranslateOptions>;
  private readonly pooledMarker = Symbol('pooled'); // mark pooled option objects
  private hotPathCache?: Map<string, string>; // Lazy init
  private readonly HOT_PATH_CACHE_SIZE = 30; // Smaller size for better cache locality
  private accessCount?: Map<string, number>; // Lazy init
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
      : createCache(typeof config.cache === 'object' ? config.cache as any : { maxSize: 1000 });
    
    // Initialize object pool for options with optimized reset
    this.optionsPool = new ObjectPool(
      () => Object.create(null), // Faster than {}
      (obj) => {
        // Faster reset using Object.keys
        const keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
          delete obj[keys[i]];
        }
      },
      30
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
    this.emit('initialized', { type: 'initialized', locale: this._locale });
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
      this.emit('localeChanged', { type: 'localeChanged', locale: value, oldLocale });
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
        // Use pre-built cache key
        const fastKey = this.cacheKeyBuilder
          .add(this._locale)
          .add(this.defaultNamespace)
          .add(key)
          .build();
        
        // Check hot path cache first (lazy init)
        if (this.hotPathCache) {
          const hotCached = this.hotPathCache.get(fastKey);
          if (hotCached !== undefined) {
            return hotCached;
          }
        }
        
        // Check main cache
        const cached = this.cache.get(fastKey);
        if (cached !== undefined) {
          this.updateHotPathCache(fastKey, cached);
          return cached;
        }
      }
      
      // Fall back to full translation logic
      const opts = this.normalizeOptionsOptimized(optionsOrParams, maybeParams);
      const result = this.translate(key, opts);
      if ((opts as any)[this.pooledMarker]) {
        delete (opts as any)[this.pooledMarker];
        this.optionsPool.release(opts);
      }
      return result;
    }) as TranslationFunction;
  }
  
  t: TranslationFunction;
  
  /**
   * Batch translate multiple keys with optimized performance
   */
  translateBatch(
    keys: MessageKey[] | Record<string, MessageKey>,
    options: TranslateOptions = {}
  ): string[] | Record<string, string> {
    const isArray = Array.isArray(keys);
    const keyList = isArray ? keys : Object.values(keys);
    const keyNames = isArray ? null : Object.keys(keys);
    
    // Pre-calculate common values
    const locale = options.locale || this.locale;
    const namespace = options.namespace || this.defaultNamespace;
    
    // Batch get messages for locale
    const messages = namespace === this.defaultNamespace
      ? this.messages.get(locale)
      : this.namespaces.get(namespace)?.get(locale);
    
    const results: string[] = [];
    
    // Process all keys in batch
    for (let i = 0; i < keyList.length; i++) {
      const key = keyList[i];
      
      // Optimized cache key generation
      const cacheKey = this.getCacheKeyOptimized(locale, key, namespace, options);
      
      // Check cache first
      let result = this.cache.get(cacheKey);
      
      if (result === undefined) {
        // Resolve message without cache lookup
        let message = messages ? getNestedValue(messages, key, this.keySeparator) : undefined;
        
        if (message === undefined) {
          message = this.resolveFallbackOptimized(key, options);
        }
        
        if (message === undefined) {
          result = this.handleMissing(key, locale, namespace, options);
        } else {
          // Handle pluralization
          if (options.count !== undefined && this.pluralization.hasPluralForms(message)) {
            message = this.pluralization.format(message, options.count, locale, options.params);
          }
          
          // Handle interpolation
          if (options.params) {
            const interpolationParams = { ...options.params };
            interpolationParams.$t = (k: string, p?: any) => this.translate(k, { ...options, params: p });
            message = this.interpolation.interpolate(message, interpolationParams, locale);
          }
          
          result = message;
        }
        
        // Cache the result
        this.cache.set(cacheKey, result!);
      }
      
      results.push(result!);
    }
    
    // Return in the same format as input
    if (isArray) {
      return results;
    }
    
    const resultMap: Record<string, string> = {};
    for (let i = 0; i < keyNames!.length; i++) {
      resultMap[keyNames![i]] = results[i];
    }
    return resultMap;
  }
  
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
      interpolationParams.$t = (k: string, p?: any) => this.translate(k, { ...options, params: p });
      
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
      (opts as any)[this.pooledMarker] = 1;
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
      (opts as any)[this.pooledMarker] = 1;
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
    // Lazy init hot path cache
    if (!this.hotPathCache) {
      this.hotPathCache = new Map<string, string>();
    }
    if (!this.accessCount) {
      this.accessCount = new Map<string, number>();
    }
    
    // Update access count with decay to prevent stale entries
    const count = (this.accessCount.get(key) || 0) + 1;
    this.accessCount.set(key, count);
    
    // Add to hot path cache if frequently accessed
    if (count > 2) { // Lower threshold for faster promotion
      if (this.hotPathCache.size >= this.HOT_PATH_CACHE_SIZE) {
        // LFU eviction - remove least frequently used
        const leastUsedKey = this.findLeastAccessedKey();
        if (leastUsedKey) {
          this.hotPathCache.delete(leastUsedKey);
          this.accessCount.delete(leastUsedKey);
        }
      }
      this.hotPathCache.set(key, value);
    }
  }
  
  private updateAccessCount(key: string): void {
    if (!this.accessCount) {
      this.accessCount = new Map<string, number>();
    }
    this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
  }
  
  private findLeastAccessedKey(): string | undefined {
    if (!this.accessCount || !this.hotPathCache) return undefined;
    
    let minKey: string | undefined;
    let minCount = Infinity;
    
    // Only check keys that are in hot path cache
    for (const key of this.hotPathCache.keys()) {
      const count = this.accessCount.get(key) || 0;
      if (count < minCount) {
        minCount = count;
        minKey = key;
      }
    }
    
    return minKey;
  }
  
  private clearPerformanceCaches(): void {
    this.hotPathCache?.clear();
    this.accessCount?.clear();
    this.cache.clear();
  }
  
  // ============== Locale Management ==============
  
  async setLocale(locale: Locale): Promise<void> {
    const oldLocale = this.locale;
    
    // Load messages if not already loaded
    if (!this.hasLocale(locale) && this.loader) {
      this.emit('loading', { type: 'loading', locale });
      
      try {
        const messages = await this.loader.load(locale);
        this.addMessages(locale, messages);
        this.emit('loaded', { type: 'loaded', locale });
      } catch (err) {
        this.emit('loadError', { type: 'loadError', locale, error: err as Error });
        throw err;
      }
    }
    
    this.locale = locale;
    
    // Clear all caches when locale changes
    this.clearPerformanceCaches();
    
    this.emit('localeChanged', { type: 'localeChanged', locale, oldLocale });
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
  
  // ============== Event Methods ==============
  
  on(event: I18nEventType, listener: I18nEventListener): () => void {
    this.eventEmitter.on(event, listener);
    return () => this.eventEmitter.off(event, listener);
  }
  
  off(event: I18nEventType, listener: I18nEventListener): void {
    this.eventEmitter.off(event, listener);
  }
  
  once(event: I18nEventType, listener: I18nEventListener): void {
    this.eventEmitter.once(event, listener);
  }
  
  emit(event: I18nEventType, data?: Omit<I18nEventData, 'type'>): void {
    const eventData: I18nEventData = { type: event, ...data };
    this.eventEmitter.emit(event, eventData);
  }
  
  // ============== Namespace Management ==============
  
  async loadNamespace(namespace: string, locale?: Locale): Promise<void> {
    const targetLocale = locale || this.locale;
    
    if (this.loader && this.loader.load) {
      try {
        const messages = await this.loader.load(targetLocale, namespace);
        this.addMessages(targetLocale, messages, namespace);
        this.emit('namespaceLoaded', { namespace, locale: targetLocale });
      } catch (error) {
        console.warn(`Failed to load namespace ${namespace} for locale ${targetLocale}:`, error);
        throw error;
      }
    }
  }
  
  hasNamespace(namespace: string, locale?: Locale): boolean {
    const targetLocale = locale || this.locale;
    return this.namespaces.get(namespace)?.has(targetLocale) || false;
  }
  
  // ============== Formatting Methods ==============
  
  format(value: any, format: string, locale?: Locale, options?: any): string {
    const targetLocale = locale || this.locale;
    
    // Check for custom formatters
    if (this.config.formatters && this.config.formatters[format]) {
      return this.config.formatters[format].format(value, format, targetLocale, options);
    }
    
    // Default formatting
    return String(value);
  }
  
  number(value: number, options?: Intl.NumberFormatOptions): string {
    try {
      return new Intl.NumberFormat(this.locale, options).format(value);
    } catch (error) {
      console.warn('Failed to format number:', error);
      return String(value);
    }
  }
  
  currency(value: number, currency: string, options?: Intl.NumberFormatOptions): string {
    try {
      return new Intl.NumberFormat(this.locale, {
        style: 'currency',
        currency,
        ...options
      }).format(value);
    } catch (error) {
      console.warn('Failed to format currency:', error);
      return `${currency} ${value}`;
    }
  }
  
  date(value: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
    try {
      const date = value instanceof Date ? value : new Date(value);
      return new Intl.DateTimeFormat(this.locale, options).format(date);
    } catch (error) {
      console.warn('Failed to format date:', error);
      return String(value);
    }
  }
  
  relativeTime(value: Date | string | number, options?: Intl.RelativeTimeFormatOptions): string {
    try {
      const date = value instanceof Date ? value : new Date(value);
      const now = new Date();
      const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
      
      // Simple relative time calculation
      const units: [Intl.RelativeTimeFormatUnit, number][] = [
        ['year', 60 * 60 * 24 * 365],
        ['month', 60 * 60 * 24 * 30],
        ['week', 60 * 60 * 24 * 7],
        ['day', 60 * 60 * 24],
        ['hour', 60 * 60],
        ['minute', 60],
        ['second', 1]
      ];
      
      for (const [unit, secondsInUnit] of units) {
        if (Math.abs(diffInSeconds) >= secondsInUnit) {
          const value = Math.floor(diffInSeconds / secondsInUnit);
          return new Intl.RelativeTimeFormat(this.locale, options).format(value, unit);
        }
      }
      
      return new Intl.RelativeTimeFormat(this.locale, options).format(0, 'second');
    } catch (error) {
      console.warn('Failed to format relative time:', error);
      return String(value);
    }
  }
  
  // ============== Plugin Management ==============
  
  async use(plugin: I18nPlugin): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin ${plugin.name} is already installed`);
      return;
    }
    
    await plugin.install(this);
    this.plugins.set(plugin.name, plugin);
    this.emit('pluginInstalled', { plugin: plugin.name });
  }
  
  async unuse(plugin: I18nPlugin | string): Promise<void> {
    const pluginName = typeof plugin === 'string' ? plugin : plugin.name;
    const installedPlugin = this.plugins.get(pluginName);
    
    if (!installedPlugin) {
      console.warn(`Plugin ${pluginName} is not installed`);
      return;
    }
    
    if (installedPlugin.uninstall) {
      await installedPlugin.uninstall(this);
    }
    
    this.plugins.delete(pluginName);
    this.emit('pluginUninstalled', { plugin: pluginName });
  }
  
  // ============== Lifecycle Methods ==============
  
  async ready(): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }
  }
  
  // ============== Utility Methods ==============
  
  clone(config?: Partial<I18nConfig>): I18nInstance {
    const mergedConfig = { ...this.config, ...config };
    const cloned = new OptimizedI18n(mergedConfig);
    
    // Copy messages
    this.messages.forEach((messages, locale) => {
      cloned.addMessages(locale, messages);
    });
    
    // Copy namespaces
    this.namespaces.forEach((locales, namespace) => {
      locales.forEach((messages, locale) => {
        cloned.addMessages(locale, messages, namespace);
      });
    });
    
    return cloned;
  }
  
      createContext(namespace: string): I18nContext {
        return {
          namespace,
          t: ((key: MessageKey, options?: any) => {
            return this.translate(key, { ...options, namespace });
          }) as TranslationFunction,
          exists: (key: MessageKey, options?: Omit<TranslateOptions, 'namespace'>) => {
            return this.exists(key, { ...options, namespace });
          }
        };
      }
  
  private handleMissing(
    key: MessageKey,
    locale: Locale,
    namespace: string,
    options: TranslateOptions
  ): string {
    // Only emit and warn in development
    if (this.isDev) {
      this.emit('missingKey', { type: 'missingKey', key, locale, namespace });
      
      if (this.config?.warnOnMissing !== false) {
        warn(`Missing translation for key "${key}" in locale "${locale}"`);
      }
    }
    
    // Use custom handler if provided
    if (this.config?.missingKeyHandler) {
      return this.config?.missingKeyHandler(key, locale, namespace, options.defaultValue);
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
    this.optionsPool.clear();
    
    // Clean up cache if it has destroy method
    if ('destroy' in this.cache && typeof this.cache.destroy === 'function') {
      this.cache.destroy();
    }
  }
}

// Export as default I18n for drop-in replacement
export { OptimizedI18n as I18n };
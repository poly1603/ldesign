/**
 * @ldesign/i18n - Core I18n Class
 * The main internationalization engine
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

const VERSION = '1.0.0';

export class I18n implements I18nInstance {
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
    
    // Initialize cache
    this.cache = config.cache === false 
      ? new LRUCache<string, string>(0) 
      : createCache(typeof config.cache === 'object' ? config.cache : {});
    
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
    
    // Bind translation function
    this.t = this.translate.bind(this);
  }
  
  // ============== Properties ==============
  
  get locale(): Locale {
    return this._locale;
  }
  
  set locale(value: Locale) {
    if (value !== this._locale) {
      const oldLocale = this._locale;
      this._locale = value;
      this.emit('localeChanged', { locale: value, oldLocale });
    }
  }
  
  get fallbackLocale(): Locale | Locale[] {
    return this._fallbackLocale;
  }
  
  set fallbackLocale(value: Locale | Locale[]) {
    this._fallbackLocale = value;
  }
  
  // ============== Core Translation ==============
  
  t: TranslationFunction = ((
    key: MessageKey,
    optionsOrParams?: TranslateOptions | InterpolationParams | string,
    maybeParams?: InterpolationParams
  ): string => {
    return this.translate(key, this.normalizeOptions(optionsOrParams, maybeParams));
  }) as TranslationFunction;
  
  translate(key: MessageKey, options: TranslateOptions = {}): string {
    const locale = options.locale || this.locale;
    const namespace = options.namespace || this.defaultNamespace;
    
    // Check cache
    const cacheKey = this.getCacheKey(locale, key, namespace, options);
    const cached = this.cache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }
    
    // Resolve message
    let message = this.resolveMessage(key, locale, namespace, options);
    
    if (message === undefined) {
      // Try fallback locales
      message = this.resolveFallback(key, options);
    }
    
    if (message === undefined) {
      // Handle missing translation
      const result = this.handleMissing(key, locale, namespace, options);
      this.cache.set(cacheKey, result);
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
    
    return message;
  }
  
  exists(key: MessageKey, options: TranslateOptions = {}): boolean {
    const locale = options.locale || this.locale;
    const namespace = options.namespace || this.defaultNamespace;
    
    const message = this.resolveMessage(key, locale, namespace, options);
    return message !== undefined;
  }
  
  plural(key: MessageKey, count: number, options: TranslateOptions = {}): string {
    return this.translate(key, { ...options, count });
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
    
    // Clear cache when locale changes
    this.cache.clear();
    
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
    
    // Clear cache
    this.cache.clear();
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
    
    // Clear cache when messages change
    this.cache.clear();
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
  
  // ============== Namespace Management ==============
  
  async loadNamespace(namespace: string, locale?: Locale): Promise<void> {
    const targetLocale = locale || this.locale;
    
    if (this.loader) {
      const messages = await this.loader.load(targetLocale, namespace);
      this.addMessages(targetLocale, messages, namespace);
      this.emit('namespaceLoaded', { namespace, locale: targetLocale });
    }
  }
  
  hasNamespace(namespace: string, locale?: Locale): boolean {
    const targetLocale = locale || this.locale;
    return this.namespaces.get(namespace)?.has(targetLocale) || false;
  }
  
  // ============== Formatting ==============
  
  format(value: any, format: string, locale?: Locale, options?: any): string {
    const targetLocale = locale || this.locale;
    
    // Check for custom formatters
    if (this.config.formatters && this.config.formatters[format]) {
      return this.config.formatters[format].format(value, format, targetLocale, options);
    }
    
    // Use default formatting
    return this.interpolation['defaultFormat'](value, format, targetLocale);
  }
  
  number(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.locale, options).format(value);
  }
  
  currency(value: number, currency: string, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency,
      ...options
    }).format(value);
  }
  
  date(value: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
    const date = value instanceof Date ? value : new Date(value);
    return new Intl.DateTimeFormat(this.locale, options).format(date);
  }
  
  relativeTime(value: Date | string | number, options?: Intl.RelativeTimeFormatOptions): string {
    const date = value instanceof Date ? value : new Date(value);
    const rtf = new Intl.RelativeTimeFormat(this.locale, options);
    
    const diff = date.getTime() - Date.now();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (Math.abs(days) > 0) {
      return rtf.format(days, 'day');
    } else if (Math.abs(hours) > 0) {
      return rtf.format(hours, 'hour');
    } else if (Math.abs(minutes) > 0) {
      return rtf.format(minutes, 'minute');
    } else {
      return rtf.format(seconds, 'second');
    }
  }
  
  // ============== Event Management ==============
  
  on(event: I18nEventType, listener: I18nEventListener): () => void {
    return this.eventEmitter.on(event, listener);
  }
  
  off(event: I18nEventType, listener: I18nEventListener): void {
    this.eventEmitter.off(event, listener);
  }
  
  once(event: I18nEventType, listener: I18nEventListener): void {
    this.eventEmitter.once(event, listener);
  }
  
  emit(event: I18nEventType, data?: Omit<I18nEventData, 'type'>): void {
    this.eventEmitter.emit(event, { type: event, ...data });
  }
  
  // ============== Plugin Management ==============
  
  async use(plugin: I18nPlugin): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      warn(`Plugin "${plugin.name}" is already installed`);
      return;
    }
    
    this.plugins.set(plugin.name, plugin);
    await plugin.install(this);
    this.emit('pluginInstalled', { plugin: plugin.name });
  }
  
  async unuse(plugin: I18nPlugin | string): Promise<void> {
    const name = typeof plugin === 'string' ? plugin : plugin.name;
    const p = this.plugins.get(name);
    
    if (!p) {
      warn(`Plugin "${name}" is not installed`);
      return;
    }
    
    if (p.uninstall) {
      await p.uninstall(this);
    }
    
    this.plugins.delete(name);
    this.emit('pluginUninstalled', { plugin: name });
  }
  
  // ============== Lifecycle ==============
  
  async init(config?: Partial<I18nConfig>): Promise<void> {
    if (this.initialized) {
      return;
    }
    
    // Merge additional config
    if (config) {
      Object.assign(this.config, config);
    }
    
    // Auto-detect locale if needed
    if (this.config.detection !== false && !this.config.locale) {
      const detected = this.detectLocale();
      if (detected) {
        this._locale = detected;
      }
    }
    
    // Preload messages if configured
    if (this.config.lazy === false && this.loader) {
      const locales = [this.locale];
      if (this.fallbackLocale) {
        const fallbacks = Array.isArray(this.fallbackLocale) 
          ? this.fallbackLocale 
          : [this.fallbackLocale];
        locales.push(...fallbacks);
      }
      
      if (this.loader.preload) {
        await this.loader.preload(locales);
      }
    }
    
    // Install plugins
    if (this.config.plugins) {
      for (const plugin of this.config.plugins) {
        await this.use(plugin);
      }
    }
    
    this.initialized = true;
    this.emit('initialized');
  }
  
  async ready(): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }
  }
  
  destroy(): void {
    this.cache.clear();
    this.messages.clear();
    this.namespaces.clear();
    this.plugins.clear();
    this.eventEmitter.removeAllListeners();
  }
  
  // ============== Utilities ==============
  
  clone(config?: Partial<I18nConfig>): I18nInstance {
    const cloneConfig = deepMerge({}, this.config, config || {});
    
    // Copy current messages
    cloneConfig.messages = {};
    this.messages.forEach((msgs, locale) => {
      cloneConfig.messages![locale] = deepMerge({}, msgs);
    });
    
    return new I18n(cloneConfig);
  }
  
  createContext(namespace: string): I18nContext {
    const t: TranslationFunction = ((
      key: MessageKey,
      optionsOrParams?: any,
      maybeParams?: InterpolationParams
    ): string => {
      const options = this.normalizeOptions(optionsOrParams, maybeParams);
      return this.translate(key, { ...options, namespace });
    }) as TranslationFunction;
    
    return {
      namespace,
      t,
      exists: (key: MessageKey, options?: Omit<TranslateOptions, 'namespace'>) => {
        return this.exists(key, { ...options, namespace });
      }
    };
  }
  
  // ============== Private Methods ==============
  
  private detectLocale(): Locale | null {
    // Use custom detector if provided
    if (this.detector) {
      return this.detector.detect();
    }
    
    // Use browser language as fallback
    return getBrowserLanguage();
  }
  
  private resolveMessage(
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
    
    // Handle namespace in key
    let resolvedKey = key;
    if (this.namespaceSeparator && key.includes(this.namespaceSeparator)) {
      const parts = key.split(this.namespaceSeparator);
      const keyNamespace = parts[0];
      resolvedKey = parts.slice(1).join(this.namespaceSeparator);
      
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
  
  private resolveFallback(key: MessageKey, options: TranslateOptions): string | undefined {
    const fallbacks = Array.isArray(this.fallbackLocale) 
      ? this.fallbackLocale 
      : [this.fallbackLocale];
    
    for (const fallback of fallbacks) {
      if (fallback === options.locale) continue;
      
      const message = this.resolveMessage(
        key, 
        fallback, 
        options.namespace || this.defaultNamespace,
        options
      );
      
      if (message !== undefined) {
        this.emit('fallback', { 
          key, 
          locale: options.locale || this.locale, 
          fallback 
        });
        return message;
      }
    }
    
    return undefined;
  }
  
  private handleMissing(
    key: MessageKey,
    locale: Locale,
    namespace: string,
    options: TranslateOptions
  ): string {
    // Emit missing event
    this.emit('missingKey', { key, locale, namespace });
    
    // Use custom handler if provided
    if (this.config.missingKeyHandler) {
      return this.config.missingKeyHandler(key, locale, namespace, options.defaultValue);
    }
    
    // Log warning in development
    if (this.config.warnOnMissing !== false) {
      warn(`Missing translation for key "${key}" in locale "${locale}"`);
    }
    
    // Return default value or key
    return options.defaultValue || key;
  }
  
  private getCacheKey(
    locale: Locale,
    key: MessageKey,
    namespace: string,
    options: TranslateOptions
  ): string {
    const parts = [locale, namespace, key];
    
    if (options.count !== undefined) {
      parts.push(`count:${options.count}`);
    }
    
    if (options.context) {
      parts.push(`context:${options.context}`);
    }
    
    return parts.join('|');
  }
  
  private normalizeOptions(
    optionsOrParams?: TranslateOptions | InterpolationParams | string,
    maybeParams?: InterpolationParams
  ): TranslateOptions {
    if (!optionsOrParams) {
      return {};
    }
    
    if (isString(optionsOrParams)) {
      // It's a default value
      return { defaultValue: optionsOrParams, params: maybeParams };
    }
    
    if (isPlainObject(optionsOrParams)) {
      // Check if it's options or params
      const hasOptionsKeys = ['locale', 'fallbackLocale', 'defaultValue', 'count', 'context', 'namespace'].some(
        key => key in optionsOrParams
      );
      
      if (hasOptionsKeys) {
        return optionsOrParams as TranslateOptions;
      } else {
        // It's params
        return { params: optionsOrParams as InterpolationParams };
      }
    }
    
    return {};
  }
}
/**
 * @ldesign/i18n - Interpolation Engine
 * Handles parameter replacement in translation messages
 */

import type { InterpolationParams, InterpolationOptions, Locale } from '../types';
import { isPlainObject, isString, escapeHtml, getNestedValue } from '../utils/helpers';

export class InterpolationEngine {
  private prefix: string;
  private suffix: string;
  private escapeValue: boolean;
  private nestingPrefix: string;
  private nestingSuffix: string;
  private formatSeparator: string;
  private formatter?: (value: any, format?: string, locale?: Locale) => string;
  
  constructor(options: InterpolationOptions = {}) {
    this.prefix = options.prefix || '{{';
    this.suffix = options.suffix || '}}';
    this.escapeValue = options.escapeValue !== false;
    this.nestingPrefix = options.nestingPrefix || '$t(';
    this.nestingSuffix = options.nestingSuffix || ')';
    this.formatSeparator = options.formatSeparator || ',';
    this.formatter = options.formatter;
  }
  
  /**
   * Interpolate parameters into a message
   */
  interpolate(
    message: string,
    params?: InterpolationParams,
    locale?: Locale
  ): string {
    if (!params || !isPlainObject(params)) {
      return message;
    }
    
    let result = message;
    
    // Handle nested translations first
    result = this.handleNesting(result, params, locale);
    
    // Handle parameter interpolation
    result = this.handleInterpolation(result, params, locale);
    
    return result;
  }
  
  /**
   * Handle parameter interpolation
   */
  private handleInterpolation(
    message: string,
    params: InterpolationParams,
    locale?: Locale
  ): string {
    const regex = new RegExp(
      `${this.escapeRegex(this.prefix)}([^${this.escapeRegex(this.suffix)}]+)${this.escapeRegex(this.suffix)}`,
      'g'
    );
    
    return message.replace(regex, (match, expression) => {
      const trimmedExpression = expression.trim();
      const [path, ...formats] = trimmedExpression.split(this.formatSeparator).map((s: string) => s.trim());
      
      // Get value from params (supports nested paths)
      let value = this.getValue(params, path);
      
      // Handle undefined values
      if (value === undefined) {
        return match; // Keep original placeholder if value not found
      }
      
      // Apply formatting
      if (formats.length > 0 && this.formatter) {
        for (const format of formats) {
          value = this.formatter(value, format, locale);
        }
      } else {
        // Default formatting for common types
        value = this.defaultFormat(value, formats[0], locale);
      }
      
      // Escape HTML if needed
      if (this.escapeValue && isString(value)) {
        value = escapeHtml(value);
      }
      
      return String(value);
    });
  }
  
  /**
   * Handle nested translations
   */
  private handleNesting(
    message: string,
    params: InterpolationParams,
    locale?: Locale
  ): string {
    const regex = new RegExp(
      `${this.escapeRegex(this.nestingPrefix)}([^${this.escapeRegex(this.nestingSuffix)}]+)${this.escapeRegex(this.nestingSuffix)}`,
      'g'
    );
    
    return message.replace(regex, (match, key) => {
      const trimmedKey = key.trim();
      
      // Check if we have a translation function in params
      if (params.$t && typeof params.$t === 'function') {
        return params.$t(trimmedKey, params);
      }
      
      // Otherwise, just return the key or a placeholder
      return `[${trimmedKey}]`;
    });
  }
  
  /**
   * Get value from params object (supports nested paths)
   */
  private getValue(params: InterpolationParams, path: string): any {
    // First try direct access
    if (params[path] !== undefined) {
      return params[path];
    }
    
    // Then try nested path
    return getNestedValue(params, path);
  }
  
  /**
   * Default formatting for common types
   */
  private defaultFormat(value: any, format?: string, locale?: Locale): string {
    if (!format) {
      return String(value);
    }
    
    // Number formatting
    if (typeof value === 'number') {
      switch (format.toLowerCase()) {
        case 'number':
          return new Intl.NumberFormat(locale).format(value);
        case 'percent':
          return new Intl.NumberFormat(locale, { style: 'percent' }).format(value);
        case 'currency':
          // Currency code should be in params, defaulting to USD
          return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'USD'
          }).format(value);
        default:
          // Check if it's a decimal precision format (e.g., "0.00")
          const precision = format.match(/^0\.0+$/);
          if (precision) {
            const decimals = precision[0].length - 2;
            return value.toFixed(decimals);
          }
          return String(value);
      }
    }
    
    // Date formatting
    if (value instanceof Date) {
      switch (format.toLowerCase()) {
        case 'short':
          return new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(value);
        case 'medium':
          return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(value);
        case 'long':
          return new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(value);
        case 'full':
          return new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(value);
        case 'time':
          return new Intl.DateTimeFormat(locale, { timeStyle: 'short' }).format(value);
        case 'datetime':
          return new Intl.DateTimeFormat(locale, {
            dateStyle: 'short',
            timeStyle: 'short'
          }).format(value);
        default:
          return new Intl.DateTimeFormat(locale).format(value);
      }
    }
    
    // Array formatting
    if (Array.isArray(value)) {
      switch (format.toLowerCase()) {
        case 'list':
          return new Intl.ListFormat(locale, { type: 'conjunction' }).format(value);
        case 'or':
          return new Intl.ListFormat(locale, { type: 'disjunction' }).format(value);
        case 'unit':
          return new Intl.ListFormat(locale, { type: 'unit' }).format(value);
        default:
          return value.join(', ');
      }
    }
    
    // String formatting
    if (typeof value === 'string') {
      switch (format.toLowerCase()) {
        case 'upper':
        case 'uppercase':
          return value.toUpperCase();
        case 'lower':
        case 'lowercase':
          return value.toLowerCase();
        case 'capitalize':
          return value.charAt(0).toUpperCase() + value.slice(1);
        case 'title':
          return value.replace(/\w\S*/g, txt => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          );
        default:
          return value;
      }
    }
    
    return String(value);
  }
  
  /**
   * Escape regex special characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  /**
   * Check if a message contains interpolation placeholders
   */
  hasPlaceholders(message: string): boolean {
    const regex = new RegExp(
      `${this.escapeRegex(this.prefix)}[^${this.escapeRegex(this.suffix)}]+${this.escapeRegex(this.suffix)}`
    );
    return regex.test(message);
  }
  
  /**
   * Extract placeholder keys from a message
   */
  extractPlaceholders(message: string): string[] {
    const regex = new RegExp(
      `${this.escapeRegex(this.prefix)}([^${this.escapeRegex(this.suffix)}]+)${this.escapeRegex(this.suffix)}`,
      'g'
    );
    
    const placeholders: string[] = [];
    let match: RegExpExecArray | null;
    
    while ((match = regex.exec(message)) !== null) {
      const expression = match[1].trim();
      const [path] = expression.split(this.formatSeparator).map(s => s.trim());
      placeholders.push(path);
    }
    
    return Array.from(new Set(placeholders));
  }
  
  /**
   * Validate that all required placeholders have values
   */
  validateParams(message: string, params?: InterpolationParams): boolean {
    if (!params) return !this.hasPlaceholders(message);
    
    const placeholders = this.extractPlaceholders(message);
    
    for (const placeholder of placeholders) {
      if (this.getValue(params, placeholder) === undefined) {
        return false;
      }
    }
    
    return true;
  }
}
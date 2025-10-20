/**
 * @ldesign/i18n - Pluralization Engine
 * Handles plural forms for different languages
 */

// import type { Locale, PluralRule } from '../types';
import { parseLocale } from '../utils/helpers';

// Type definitions
type Locale = string;
type PluralRule = (count: number, locale?: string) => string;

/**
 * Plural categories defined by CLDR
 */
export type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

/**
 * Plural rules for different languages
 * Based on Unicode CLDR plural rules
 */
const PLURAL_RULES: Record<string, PluralRule> = {
  // Chinese, Japanese, Korean - no plurals
  zh: () => 'other',
  ja: () => 'other',
  ko: () => 'other',
  
  // English, German, Dutch, Italian, Spanish, Portuguese
  en: (count: number) => count === 1 ? 'one' : 'other',
  de: (count: number) => count === 1 ? 'one' : 'other',
  nl: (count: number) => count === 1 ? 'one' : 'other',
  it: (count: number) => count === 1 ? 'one' : 'other',
  es: (count: number) => count === 1 ? 'one' : 'other',
  pt: (count: number) => count === 0 || count === 1 ? 'one' : 'other',
  
  // French
  fr: (count: number) => count === 0 || count === 1 ? 'one' : 'other',
  
  // Russian, Ukrainian, Serbian
  ru: (count: number) => {
    const mod10 = count % 10;
    const mod100 = count % 100;
    
    if (mod10 === 1 && mod100 !== 11) return 'one';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'few';
    return 'many';
  },
  uk: (count: number) => {
    const mod10 = count % 10;
    const mod100 = count % 100;
    
    if (mod10 === 1 && mod100 !== 11) return 'one';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'few';
    return 'many';
  },
  
  // Polish
  pl: (count: number) => {
    if (count === 1) return 'one';
    const mod10 = count % 10;
    const mod100 = count % 100;
    
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'few';
    return 'many';
  },
  
  // Czech, Slovak
  cs: (count: number) => {
    if (count === 1) return 'one';
    if (count >= 2 && count <= 4) return 'few';
    return 'other';
  },
  sk: (count: number) => {
    if (count === 1) return 'one';
    if (count >= 2 && count <= 4) return 'few';
    return 'other';
  },
  
  // Arabic
  ar: (count: number) => {
    if (count === 0) return 'zero';
    if (count === 1) return 'one';
    if (count === 2) return 'two';
    const mod100 = count % 100;
    if (mod100 >= 3 && mod100 <= 10) return 'few';
    if (mod100 >= 11 && mod100 <= 99) return 'many';
    return 'other';
  },
  
  // Hebrew
  he: (count: number) => {
    if (count === 1) return 'one';
    if (count === 2) return 'two';
    if (count > 10 && count % 10 === 0) return 'many';
    return 'other';
  },
  
  // Turkish, Azerbaijani
  tr: () => 'other',
  az: () => 'other',
  
  // Hindi
  hi: (count: number) => count === 0 || count === 1 ? 'one' : 'other',
};

export class PluralizationEngine {
  private readonly rules = new Map<string, PluralRule>();
  private readonly defaultRule: PluralRule = () => 'other';
  private readonly separator: string;
  
  // Cache compiled rules for performance
  private readonly categoryCache = new Map<string, PluralCategory>();
  private readonly CACHE_MAX_SIZE = 1000;
  
  constructor(separator = '_') {
    this.separator = separator;
    this.loadBuiltInRules();
  }
  
  /**
   * Load built-in plural rules
   */
  private loadBuiltInRules(): void {
    Object.entries(PLURAL_RULES).forEach(([locale, rule]) => {
      this.rules.set(locale, rule);
    });
  }
  
  /**
   * Add custom plural rule for a locale
   */
  addRule(locale: Locale, rule: PluralRule): void {
    const { language } = parseLocale(locale);
    this.rules.set(language, rule);
  }
  
  /**
   * Get plural rule for a locale
   */
  getRule(locale: Locale): PluralRule {
    const { language } = parseLocale(locale);
    return this.rules.get(language) || this.defaultRule;
  }
  
  /**
   * Get plural category for a count in a locale
   */
  getCategory(count: number, locale: Locale): PluralCategory {
    // Check cache first
    const cacheKey = `${locale}:${count}`;
    let category = this.categoryCache.get(cacheKey);
    
    if (category === undefined) {
      const rule = this.getRule(locale);
      category = rule(count, locale) as PluralCategory;
      
      // Add to cache with size limit
      if (this.categoryCache.size < this.CACHE_MAX_SIZE) {
        this.categoryCache.set(cacheKey, category);
      }
    }
    
    return category;
  }
  
  /**
   * Select the appropriate plural form from a message object
   */
  selectPlural(
    messages: Record<string, string> | string,
    count: number,
    locale: Locale
  ): string {
    // If it's a simple string, return it
    if (typeof messages === 'string') {
      return messages;
    }
    
    const category = this.getCategory(count, locale);
    
    // Try to find exact match
    if (messages[category]) {
      return messages[category];
    }
    
    // Try count-specific form (e.g., "0", "1", "2")
    if (messages[String(count)]) {
      return messages[String(count)];
    }
    
    // Fallback chain
    const fallbackChain: PluralCategory[] = ['other', 'many', 'few', 'two', 'one', 'zero'];
    for (const fallback of fallbackChain) {
      if (messages[fallback]) {
        return messages[fallback];
      }
    }
    
    // If nothing found, return the first available form
    const keys = Object.keys(messages);
    return keys.length > 0 ? messages[keys[0]] : '';
  }
  
  /**
   * Parse a plural message string into forms
   * Format: "one:item|few:items|many:items|other:items"
   * Or: "0:no items|1:one item|other:{{count}} items"
   */
  parsePluralString(message: string, separator = '|'): Record<string, string> {
    const forms: Record<string, string> = {};
    const parts = message.split(separator);
    
    for (const part of parts) {
      const colonIndex = part.indexOf(':');
      if (colonIndex > 0) {
        const key = part.substring(0, colonIndex).trim();
        const value = part.substring(colonIndex + 1).trim();
        forms[key] = value;
      } else {
        // If no key specified, treat as "other"
        forms.other = part.trim();
      }
    }
    
    return forms;
  }
  
  /**
   * Format a plural message with count
   */
  format(
    message: string | Record<string, string>,
    count: number,
    locale: Locale,
    params?: Record<string, any>
  ): string {
    // Parse if it's a string with plural forms
    const messages = typeof message === 'string' && message.includes('|')
      ? this.parsePluralString(message)
      : message;
    
    // Select the appropriate form
    const selected = this.selectPlural(messages, count, locale);
    
    // Replace count placeholder
    let result = selected.replace(/\{\{count\}\}/g, String(count));
    result = result.replace(/\{\{n\}\}/g, String(count));
    
    // Replace other parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        result = result.replace(regex, String(value));
      });
    }
    
    return result;
  }
  
  /**
   * Check if a message contains plural forms
   */
  hasPluralForms(message: string, separator = '|'): boolean {
    if (!message || typeof message !== 'string') return false;
    
    // Check for separator-based format
    if (message.includes(separator)) {
      const parts = message.split(separator);
      return parts.some(part => part.includes(':'));
    }
    
    return false;
  }
  
  /**
   * Extract all plural forms from a message
   */
  extractPluralForms(message: string, separator = '|'): string[] {
    if (!this.hasPluralForms(message, separator)) {
      return [message];
    }
    
    const forms = this.parsePluralString(message, separator);
    return Object.values(forms);
  }
  
  /**
   * Validate plural forms for a locale
   */
  validatePluralForms(
    message: string | Record<string, string>,
    locale: Locale
  ): boolean {
    const messages = typeof message === 'string'
      ? this.parsePluralString(message)
      : message;
    
    // Must have at least "other" form
    if (!messages.other && Object.keys(messages).length > 0) {
      // Check if we have numbered forms that can serve as fallback
      return Object.keys(messages).some(key => !Number.isNaN(Number(key)));
    }
    
    return true;
  }
  
  /**
   * Get supported plural categories for a locale
   */
  getSupportedCategories(locale: Locale): PluralCategory[] {
    const { language } = parseLocale(locale);
    
    // Special cases for languages with specific plural forms
    switch (language) {
      case 'zh':
      case 'ja':
      case 'ko':
      case 'tr':
      case 'az':
        return ['other'];
      
      case 'en':
      case 'de':
      case 'nl':
      case 'it':
      case 'es':
      case 'pt':
      case 'fr':
      case 'hi':
        return ['one', 'other'];
      
      case 'ru':
      case 'uk':
      case 'pl':
        return ['one', 'few', 'many'];
      
      case 'cs':
      case 'sk':
        return ['one', 'few', 'other'];
      
      case 'ar':
        return ['zero', 'one', 'two', 'few', 'many', 'other'];
      
      case 'he':
        return ['one', 'two', 'many', 'other'];
      
      default:
        return ['one', 'other'];
    }
  }
}
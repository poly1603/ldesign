/**
 * Simple i18n implementation
 * A lightweight internationalization solution
 */

import { ref, computed, reactive } from 'vue'

export interface I18nConfig {
  locale?: string
  fallbackLocale?: string
  messages?: Record<string, any>
}

export class I18n {
  private messages = reactive<Record<string, any>>({})
  private currentLocale = ref<string>('zh-CN')
  private fallbackLocale = 'zh-CN'
  
  constructor(config: I18nConfig = {}) {
    if (config.messages) {
      this.messages = reactive(config.messages)
    }
    if (config.locale) {
      this.currentLocale.value = config.locale
    }
    if (config.fallbackLocale) {
      this.fallbackLocale = config.fallbackLocale
    }
  }
  
  // Get current locale
  get locale() {
    return this.currentLocale.value
  }
  
  // Set current locale
  set locale(value: string) {
    this.currentLocale.value = value
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('ldesign_locale', value)
    }
  }
  
  // Get nested value from object
  private getNestedValue(obj: any, path: string): any {
    if (!obj) return undefined
    return path.split('.').reduce((current, key) => {
      return current?.[key]
    }, obj)
  }
  
  // Main translation function
  t(key: string, params?: Record<string, any>): string {
    // Try current locale first
    let translation = this.getNestedValue(this.messages[this.currentLocale.value], key)
    
    // If not found, try fallback locale
    if (translation === undefined && this.currentLocale.value !== this.fallbackLocale) {
      translation = this.getNestedValue(this.messages[this.fallbackLocale], key)
    }
    
    // If still not found, return key
    if (translation === undefined) {
      console.warn(`[i18n] Missing translation for key: ${key}`)
      return key
    }
    
    // If not a string, convert to string
    if (typeof translation !== 'string') {
      return String(translation)
    }
    
    // Replace parameters
    if (params) {
      return translation.replace(/{(\w+)}/g, (match, key) => {
        return params[key] !== undefined ? String(params[key]) : match
      })
    }
    
    return translation
  }
  
  // Get messages for a prefix
  tm(prefix: string): Record<string, any> {
    return this.getNestedValue(this.messages[this.currentLocale.value], prefix) || {}
  }
  
  // Pluralization
  tc(key: string, count: number, params?: Record<string, any>): string {
    const pluralKey = count === 1 ? `${key}.one` : `${key}.other`
    return this.t(pluralKey, { count, ...params })
  }
  
  // Date formatting
  d(date: Date | number | string, format?: string): string {
    const d = new Date(date)
    return d.toLocaleDateString(this.currentLocale.value)
  }
  
  // Number formatting
  n(number: number, format?: string): string {
    return number.toLocaleString(this.currentLocale.value)
  }
  
  // Change locale
  async changeLocale(locale: string): Promise<void> {
    this.currentLocale.value = locale
    if (typeof window !== 'undefined') {
      localStorage.setItem('ldesign_locale', locale)
    }
  }
  
  // Set locale (sync version)
  setLocale(locale: string): void {
    this.currentLocale.value = locale
    if (typeof window !== 'undefined') {
      localStorage.setItem('ldesign_locale', locale)
    }
  }
  
  // Get available locales
  getAvailableLocales(): string[] {
    return Object.keys(this.messages)
  }
  
  // Check if locale exists
  hasLocale(locale: string): boolean {
    return locale in this.messages
  }
  
  // Add messages for a locale
  setMessages(locale: string, messages: Record<string, any>): void {
    this.messages[locale] = messages
  }
  
  // Merge messages
  mergeMessages(locale: string, messages: Record<string, any>): void {
    if (!this.messages[locale]) {
      this.messages[locale] = {}
    }
    Object.assign(this.messages[locale], messages)
  }
}

// Factory function
export function createI18n(config: I18nConfig = {}): I18n {
  return new I18n(config)
}
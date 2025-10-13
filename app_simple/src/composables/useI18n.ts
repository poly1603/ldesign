/**
 * i18n Composable
 * 
 * Provides i18n functionality using @ldesign/i18n
 */

import { inject, computed, ref } from 'vue'
import { 
  getI18n,
  SUPPORTED_LOCALES,
  localeUtils,
  type SupportedLocale 
} from '../i18n'

// Global shared locale ref
let globalLocale: any = null

/**
 * Use i18n
 * 
 * @example
 * ```vue
 * <script setup>
 * const { t, locale, changeLocale } = useI18n()
 * </script>
 * 
 * <template>
 *   <div>{{ t('common.welcome') }}</div>
 *   <select @change="changeLocale($event.target.value)">
     <option value="zh-CN">Chinese</option>
 *     <option value="en-US">English</option>
 *   </select>
 * </template>
 * ```
 */
export function useI18n() {
  // Get i18n instance from injection or global
  let i18n = inject<any>('i18n')
  
  if (!i18n) {
    // Try to get global instance
    i18n = getI18n()
    if (!i18n) {
      throw new Error('i18n is not installed. Please make sure to install i18n plugin.')
    }
  }

  // Global shared locale ref, shared by all components
  if (!globalLocale) {
    globalLocale = ref(i18n.locale || 'zh-CN')
  }
  
  const locale = computed({
    get: () => globalLocale.value,
    set: (value: string) => {
      globalLocale.value = value
      i18n.locale = value
    }
  })

  // Translation function - needs to return translation results reactively
  const t = (key: string, params?: Record<string, any>) => {
    // Use locale.value to trigger reactive dependency
    const _ = locale.value
    return i18n.t(key, params)
  }

  // Batch translation
  const tm = (key: string) => {
    return i18n.tm(key)
  }

  // Plural translation
  const tc = (key: string, count: number, params?: Record<string, any>) => {
    return i18n.tc(key, count, params)
  }

  // Date formatting
  const d = (date: Date | number | string, format?: string) => {
    return i18n.d(date, format)
  }

  // Number formatting
  const n = (number: number, format?: string) => {
    return i18n.n(number, format)
  }

  // Change language
  const changeLocale = async (newLocale: SupportedLocale) => {
    if (newLocale === locale.value) return
    
    try {
      // Switch language
      if (i18n.changeLocale) {
        await i18n.changeLocale(newLocale)
      } else if (i18n.setLocale) {
        i18n.setLocale(newLocale)
      } else {
        i18n.locale = newLocale
      }
      // Update global locale ref to trigger re-render of all components
      globalLocale.value = newLocale
      // Save preference
      localeUtils.saveLocale(newLocale)
      console.log(`Language changed to: ${newLocale}`)
    } catch (error) {
      console.error(`Failed to change locale to ${newLocale}:`, error)
    }
  }

  // Check if a language is supported
  const isLocaleSupported = (locale: string): locale is SupportedLocale => {
    return SUPPORTED_LOCALES.some(l => l.code === locale)
  }

  // Get all supported languages
  const availableLocales = computed(() => {
    return SUPPORTED_LOCALES.map(l => l.code)
  })

  // Get language display name
  const getLocaleName = (locale: SupportedLocale) => {
    return localeUtils.getLocaleName(locale)
  }

  // Get language flag
  const getLocaleFlag = (locale: string) => {
    return localeUtils.getLocaleFlag(locale)
  }

  return {
    // Core functions
    t,
    tm,
    tc,
    d,
    n,
    
    // Language management
    locale,
    changeLocale,
    isLocaleSupported,
    availableLocales,
    getLocaleName,
    getLocaleFlag,
    
    // Raw i18n instance (for advanced usage)
    i18n,
  }
}

/**
 * For language switcher components
 */
export function useLocaleSelector() {
  const { locale, availableLocales, getLocaleName, changeLocale } = useI18n()
  
  const localeOptions = computed(() => {
    return availableLocales.value.map(locale => ({
      value: locale,
      label: getLocaleName(locale),
    }))
  })

  return {
    currentLocale: locale,
    localeOptions,
    changeLocale,
  }
}
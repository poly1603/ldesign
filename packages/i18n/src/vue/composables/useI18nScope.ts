/**
 * 作用域翻译组合式 API
 * 提供命名空间前缀功能，简化键名管理
 */

import { computed, inject } from 'vue'
import { I18nInjectionKey } from '../plugin'
import { useI18nEnhanced, type TranslationOptions, type TranslationResult } from './useI18nEnhanced'

/**
 * 作用域翻译选项
 */
export interface ScopeOptions {
  /** 命名空间前缀 */
  namespace: string
  /** 分隔符，默认为 '.' */
  separator?: string
  /** 是否启用自动降级到全局键名 */
  fallbackToGlobal?: boolean
  /** 是否在键名不存在时显示完整路径 */
  showFullPath?: boolean
}

/**
 * 作用域翻译返回类型
 */
export interface UseI18nScopeReturn {
  /** 作用域翻译函数 */
  t: (key: string, params?: Record<string, unknown>) => string
  /** 作用域键存在检查 */
  te: (key: string, locale?: string) => boolean
  /** 安全作用域翻译 */
  tSafe: (key: string, options?: TranslationOptions) => TranslationResult
  /** 获取完整键名 */
  getFullKey: (key: string) => string
  /** 获取当前命名空间 */
  getNamespace: () => string
  /** 创建子作用域 */
  createSubScope: (subNamespace: string) => UseI18nScopeReturn
}

/**
 * 作用域翻译组合式 API
 * 
 * @param options 作用域选项
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useI18nScope } from '@ldesign/i18n/vue'
 * 
 * // 创建用户模块的作用域
 * const userScope = useI18nScope({ namespace: 'user' })
 * 
 * // 翻译 'user.profile.name' 键
 * const profileName = userScope.t('profile.name')
 * 
 * // 创建子作用域
 * const profileScope = userScope.createSubScope('profile')
 * const name = profileScope.t('name') // 翻译 'user.profile.name'
 * </script>
 * ```
 */
export function useI18nScope(options: ScopeOptions): UseI18nScopeReturn {
  const {
    namespace,
    separator = '.',
    fallbackToGlobal = true,
    showFullPath = true
  } = options

  const i18n = inject(I18nInjectionKey)
  const enhanced = useI18nEnhanced()

  if (!i18n) {
    console.warn('useI18nScope: I18n plugin not found. Make sure to install the i18n plugin.')
    return createFallbackScope(options)
  }

  /**
   * 获取完整键名
   */
  const getFullKey = (key: string): string => {
    if (!key) return namespace
    return `${namespace}${separator}${key}`
  }

  /**
   * 获取当前命名空间
   */
  const getNamespace = (): string => namespace

  /**
   * 作用域翻译函数
   */
  const t = (key: string, params?: Record<string, unknown>): string => {
    const fullKey = getFullKey(key)
    
    // 首先尝试作用域键名
    if (enhanced.te(fullKey)) {
      return enhanced.t(fullKey, params)
    }
    
    // 如果启用全局降级，尝试原始键名
    if (fallbackToGlobal && enhanced.te(key)) {
      return enhanced.t(key, params)
    }
    
    // 都不存在，返回键名（显示完整路径或原始键名）
    return showFullPath ? fullKey : key
  }

  /**
   * 作用域键存在检查
   */
  const te = (key: string, locale?: string): boolean => {
    const fullKey = getFullKey(key)
    
    // 首先检查作用域键名
    if (enhanced.te(fullKey, locale)) {
      return true
    }
    
    // 如果启用全局降级，检查原始键名
    if (fallbackToGlobal && enhanced.te(key, locale)) {
      return true
    }
    
    return false
  }

  /**
   * 安全作用域翻译
   */
  const tSafe = (key: string, translationOptions: TranslationOptions = {}): TranslationResult => {
    const fullKey = getFullKey(key)
    
    // 首先尝试作用域键名
    const scopedResult = enhanced.tSafe(fullKey, {
      ...translationOptions,
      logWarning: false // 暂时不记录警告，等全局降级也失败再记录
    })
    
    if (scopedResult.exists) {
      return scopedResult
    }
    
    // 如果启用全局降级，尝试原始键名
    if (fallbackToGlobal) {
      const globalResult = enhanced.tSafe(key, {
        ...translationOptions,
        logWarning: false
      })
      
      if (globalResult.exists) {
        return {
          ...globalResult,
          fallback: true // 标记为使用了降级
        }
      }
    }
    
    // 都不存在，返回最终结果
    const finalKey = showFullPath ? fullKey : key
    return enhanced.tSafe(finalKey, {
      ...translationOptions,
      fallback: translationOptions.fallback || finalKey
    })
  }

  /**
   * 创建子作用域
   */
  const createSubScope = (subNamespace: string): UseI18nScopeReturn => {
    const newNamespace = `${namespace}${separator}${subNamespace}`
    return useI18nScope({
      namespace: newNamespace,
      separator,
      fallbackToGlobal,
      showFullPath
    })
  }

  return {
    t,
    te,
    tSafe,
    getFullKey,
    getNamespace,
    createSubScope
  }
}

/**
 * 创建降级的作用域翻译对象
 */
function createFallbackScope(options: ScopeOptions): UseI18nScopeReturn {
  const { namespace, separator = '.' } = options

  const getFullKey = (key: string): string => {
    if (!key) return namespace
    return `${namespace}${separator}${key}`
  }

  const getNamespace = (): string => namespace

  const t = (key: string, params?: Record<string, unknown>): string => {
    const fullKey = getFullKey(key)
    if (params) {
      let result = fullKey
      Object.keys(params).forEach(paramKey => {
        result = result.replace(`{${paramKey}}`, String(params[paramKey]))
      })
      return result
    }
    return fullKey
  }

  const te = (): boolean => false

  const tSafe = (key: string, translationOptions: TranslationOptions = {}): TranslationResult => {
    const fullKey = getFullKey(key)
    return {
      text: translationOptions.fallback || fullKey,
      exists: false,
      fallback: true
    }
  }

  const createSubScope = (subNamespace: string): UseI18nScopeReturn => {
    const newNamespace = `${namespace}${separator}${subNamespace}`
    return createFallbackScope({
      ...options,
      namespace: newNamespace
    })
  }

  return {
    t,
    te,
    tSafe,
    getFullKey,
    getNamespace,
    createSubScope
  }
}

/**
 * 便捷函数：创建常用的作用域
 */
export const createCommonScopes = () => {
  return {
    /** 用户界面相关 */
    ui: useI18nScope({ namespace: 'ui' }),
    /** 表单相关 */
    form: useI18nScope({ namespace: 'form' }),
    /** 错误消息相关 */
    error: useI18nScope({ namespace: 'error' }),
    /** 成功消息相关 */
    success: useI18nScope({ namespace: 'success' }),
    /** 按钮相关 */
    button: useI18nScope({ namespace: 'button' }),
    /** 菜单相关 */
    menu: useI18nScope({ namespace: 'menu' }),
    /** 页面标题相关 */
    page: useI18nScope({ namespace: 'page' }),
    /** 通用消息 */
    common: useI18nScope({ namespace: 'common' })
  }
}

/**
 * 导出类型
 */
export type {
  ScopeOptions,
  UseI18nScopeReturn
}

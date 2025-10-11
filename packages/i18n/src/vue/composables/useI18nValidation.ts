/**
 * useI18nValidation - 表单验证翻译组合式API
 *
 * 提供表单验证相关的翻译功能，包括：
 * - 验证错误消息翻译
 * - 字段标签翻译
 * - 验证规则描述翻译
 * - 动态验证消息生成
 */

import { computed, inject, reactive, ref } from 'vue'
import { I18nInjectionKey } from '../plugin'

/**
 * 验证规则类型
 */
export type ValidationRule =
  | 'required'
  | 'email'
  | 'url'
  | 'number'
  | 'integer'
  | 'min'
  | 'max'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'custom'

/**
 * 验证错误信息
 */
export interface ValidationError {
  field: string
  rule: ValidationRule
  message: string
  params?: Record<string, unknown>
}

/**
 * 字段配置
 */
export interface FieldConfig {
  /** 字段名称 */
  name: string
  /** 字段标签翻译键 */
  labelKey?: string
  /** 字段描述翻译键 */
  descriptionKey?: string
  /** 字段占位符翻译键 */
  placeholderKey?: string
  /** 验证规则 */
  rules?: ValidationRule[]
  /** 自定义验证消息键前缀 */
  messageKeyPrefix?: string
}

/**
 * 验证选项
 */
export interface ValidationOptions {
  /** 默认消息键前缀 */
  defaultMessagePrefix?: string
  /** 字段标签键前缀 */
  labelPrefix?: string
  /** 是否自动生成字段标签 */
  autoGenerateLabels?: boolean
  /** 是否使用字段名作为参数 */
  includeFieldName?: boolean
  /** 自定义消息生成器 */
  messageGenerator?: (field: string, rule: ValidationRule, params?: any) => string
}

/**
 * 表单验证翻译组合式API
 */
export function useI18nValidation(options: ValidationOptions = {}) {
  const i18n = inject(I18nInjectionKey)!
  if (!i18n) {
    console.warn('useI18nValidation: I18n plugin not found. Make sure to install the i18n plugin.')
    return createFallbackValidation()
  }

  const {
    defaultMessagePrefix = 'validation',
    labelPrefix = 'fields',
    autoGenerateLabels = true,
    includeFieldName = true,
    messageGenerator,
  } = options

  // 字段配置存储
  const fieldConfigs = reactive<Map<string, FieldConfig>>(new Map())

  // 验证错误存储
  const validationErrors = ref<ValidationError[]>([])

  /**
   * 注册字段配置
   */
  function registerField(config: FieldConfig) {
    fieldConfigs.set(config.name, config)
  }

  /**
   * 批量注册字段配置
   */
  function registerFields(configs: FieldConfig[]) {
    configs.forEach(config => registerField(config))
  }

  /**
   * 获取字段标签
   */
  function getFieldLabel(fieldName: string): string {
    const config = fieldConfigs.get(fieldName)

    if (config?.labelKey) {
      return i18n.t(config.labelKey)
    }

    if (autoGenerateLabels) {
      const labelKey = `${labelPrefix}.${fieldName}`
      const label = i18n.t(labelKey)

      // 如果翻译不存在，使用字段名的友好格式
      if (label === labelKey) {
        return fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
      }

      return label
    }

    return fieldName
  }

  /**
   * 获取字段描述
   */
  function getFieldDescription(fieldName: string): string {
    const config = fieldConfigs.get(fieldName)

    if (config?.descriptionKey) {
      return i18n.t(config.descriptionKey)
    }

    return ''
  }

  /**
   * 获取字段占位符
   */
  function getFieldPlaceholder(fieldName: string): string {
    const config = fieldConfigs.get(fieldName)

    if (config?.placeholderKey) {
      return i18n.t(config.placeholderKey)
    }

    // 自动生成占位符
    const label = getFieldLabel(fieldName)
    const placeholder = i18n.t('common.enter_field', { field: label })
    // 如果翻译不存在，使用默认值
    return placeholder === 'common.enter_field' ? `请输入${label}` : placeholder
  }

  /**
   * 获取验证错误消息
   */
  function getValidationMessage(
    fieldName: string,
    rule: ValidationRule,
    params: Record<string, unknown> = {},
  ): string {
    const config = fieldConfigs.get(fieldName)
    const fieldLabel = getFieldLabel(fieldName)

    // 构建消息参数
    const messageParams = {
      field: fieldLabel,
      fieldName,
      ...params,
      ...(includeFieldName ? { fieldName } : {}),
    }

    // 使用自定义消息生成器
    if (messageGenerator) {
      return messageGenerator(fieldName, rule, messageParams)
    }

    // 尝试字段特定的消息键
    if (config?.messageKeyPrefix) {
      const specificKey = `${config.messageKeyPrefix}.${rule}`
      const specificMessage = i18n.t(specificKey, messageParams)
      if (specificMessage !== specificKey) {
        return specificMessage
      }
    }

    // 使用默认消息键
    const defaultKey = `${defaultMessagePrefix}.${rule}`
    const defaultMessage = i18n.t(defaultKey, messageParams)
    if (defaultMessage !== defaultKey) {
      return defaultMessage
    }

    // 降级到内置消息
    return getBuiltinMessage(rule, messageParams)
  }

  /**
   * 获取内置验证消息
   */
  function getBuiltinMessage(rule: ValidationRule, params: Record<string, unknown>): string {
    const { field } = params

    switch (rule) {
      case 'required':
        return `${field}是必填项`
      case 'email':
        return `${field}必须是有效的邮箱地址`
      case 'url':
        return `${field}必须是有效的URL`
      case 'number':
        return `${field}必须是数字`
      case 'integer':
        return `${field}必须是整数`
      case 'min':
        return `${field}不能小于${params.min}`
      case 'max':
        return `${field}不能大于${params.max}`
      case 'minLength':
        return `${field}长度不能少于${params.minLength}个字符`
      case 'maxLength':
        return `${field}长度不能超过${params.maxLength}个字符`
      case 'pattern':
        return `${field}格式不正确`
      default:
        return `${field}验证失败`
    }
  }

  /**
   * 添加验证错误
   */
  function addValidationError(
    fieldName: string,
    rule: ValidationRule,
    params?: Record<string, unknown>,
  ) {
    const message = getValidationMessage(fieldName, rule, params)
    const error: ValidationError = {
      field: fieldName,
      rule,
      message,
      params,
    }

    // 移除同字段同规则的旧错误
    validationErrors.value = validationErrors.value.filter(
      err => !(err.field === fieldName && err.rule === rule),
    )

    validationErrors.value.push(error)
  }

  /**
   * 移除验证错误
   */
  function removeValidationError(fieldName: string, rule?: ValidationRule) {
    if (rule) {
      validationErrors.value = validationErrors.value.filter(
        err => !(err.field === fieldName && err.rule === rule),
      )
    }
    else {
      validationErrors.value = validationErrors.value.filter(
        err => err.field !== fieldName,
      )
    }
  }

  /**
   * 清除所有验证错误
   */
  function clearValidationErrors() {
    validationErrors.value = []
  }

  /**
   * 获取字段的验证错误
   */
  function getFieldErrors(fieldName: string): ValidationError[] {
    return validationErrors.value.filter(err => err.field === fieldName)
  }

  /**
   * 获取字段的第一个验证错误消息
   */
  function getFirstFieldError(fieldName: string): string {
    const errors = getFieldErrors(fieldName)
    return errors.length > 0 ? errors[0].message : ''
  }

  /**
   * 检查字段是否有错误
   */
  function hasFieldError(fieldName: string, rule?: ValidationRule): boolean {
    if (rule) {
      return validationErrors.value.some(err => err.field === fieldName && err.rule === rule)
    }
    return validationErrors.value.some(err => err.field === fieldName)
  }

  /**
   * 获取所有错误消息
   */
  const allErrors = computed(() => validationErrors.value)

  /**
   * 检查是否有任何错误
   */
  const hasErrors = computed(() => validationErrors.value.length > 0)

  /**
   * 获取错误统计
   */
  const errorStats = computed(() => {
    const stats = {
      total: validationErrors.value.length,
      byField: {} as Record<string, number>,
      byRule: {} as Record<string, number>,
    }

    validationErrors.value.forEach((error) => {
      stats.byField[error.field] = (stats.byField[error.field] || 0) + 1
      stats.byRule[error.rule] = (stats.byRule[error.rule] || 0) + 1
    })

    return stats
  })

  return {
    // 字段管理
    registerField,
    registerFields,

    // 字段信息获取
    getFieldLabel,
    getFieldDescription,
    getFieldPlaceholder,

    // 验证消息
    getValidationMessage,

    // 错误管理
    addValidationError,
    removeValidationError,
    clearValidationErrors,

    // 错误查询
    getFieldErrors,
    getFirstFieldError,
    hasFieldError,

    // 响应式状态
    allErrors,
    hasErrors,
    errorStats,

    // 字段配置
    fieldConfigs: computed(() => fieldConfigs),
  }
}

/**
 * 创建降级验证功能
 */
function createFallbackValidation() {
  const validationErrors = ref<ValidationError[]>([])

  return {
    registerField: () => {},
    registerFields: () => {},
    getFieldLabel: (fieldName: string) => fieldName,
    getFieldDescription: () => '',
    getFieldPlaceholder: (fieldName: string) => `请输入${fieldName}`,
    getValidationMessage: (fieldName: string, rule: ValidationRule) => `${fieldName}验证失败`,
    addValidationError: () => {},
    removeValidationError: () => {},
    clearValidationErrors: () => {},
    getFieldErrors: () => [],
    getFirstFieldError: () => '',
    hasFieldError: () => false,
    allErrors: computed(() => []),
    hasErrors: computed(() => false),
    errorStats: computed(() => ({ total: 0, byField: {}, byRule: {} })),
    fieldConfigs: computed(() => new Map()),
  }
}

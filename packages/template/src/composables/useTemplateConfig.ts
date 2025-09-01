/**
 * 模板配置管理组合式函数
 */

import type { TemplateSystemConfig } from '../types/config'
import { computed, type ComputedRef, onMounted, onUnmounted, ref, type Ref, watch } from 'vue'
import { TemplateConfigManager } from '../config/config-manager'
import { validationUtils } from '../utils/validation'

/**
 * 配置管理选项
 */
interface UseTemplateConfigOptions {
  initialConfig?: Partial<TemplateSystemConfig>
  autoSave?: boolean
  validateOnChange?: boolean
}

/**
 * 配置管理返回值
 */
interface UseTemplateConfigReturn {
  config: Ref<TemplateSystemConfig>
  loading: Ref<boolean>
  error: Ref<string | null>
  isValid: ComputedRef<boolean>
  validationErrors: ComputedRef<string[]>
  updateConfig: (updates: Partial<TemplateSystemConfig>) => void
  resetConfig: () => void
  validateConfig: () => boolean
  exportConfig: () => string
  importConfig: (configData: string) => boolean
}

/**
 * 模板配置管理组合式函数
 */
export function useTemplateConfig(options: UseTemplateConfigOptions = {}): UseTemplateConfigReturn {
  const config = ref<TemplateSystemConfig>({} as TemplateSystemConfig)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const { autoSave = true, validateOnChange = true } = options

  let configManager: TemplateConfigManager | null = null

  /**
   * 配置验证结果
   */
  const validationResult = computed(() => {
    if (!validateOnChange) {
      return { valid: true, errors: [] }
    }
    return validationUtils.validateConfig(config.value)
  })

  /**
   * 配置是否有效
   */
  const isValid = computed(() => validationResult.value.valid)

  /**
   * 验证错误列表
   */
  const validationErrors = computed(() => validationResult.value.errors)

  /**
   * 初始化配置管理器
   */
  const initConfigManager = () => {
    configManager = new TemplateConfigManager(options.initialConfig)
    config.value = configManager.getConfig()

    // 监听配置变化
    configManager.addListener('configChanged', (newConfig: TemplateSystemConfig) => {
      config.value = newConfig
    })
  }

  /**
   * 更新配置
   */
  const updateConfig = (updates: Partial<TemplateSystemConfig>) => {
    if (!configManager) {
      initConfigManager()
    }

    try {
      // 批量更新配置
      Object.entries(updates).forEach(([key, value]) => {
        configManager!.set(key, value)
      })

      error.value = null
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '配置更新失败'
      console.error('Config update failed:', err)
    }
  }

  /**
   * 重置配置
   */
  const resetConfig = () => {
    if (configManager) {
      configManager.reset()
      config.value = configManager.getConfig()
    }
    error.value = null
  }

  /**
   * 验证配置
   */
  const validateConfig = (): boolean => {
    const result = validationUtils.validateConfig(config.value)

    if (!result.valid) {
      error.value = `配置验证失败: ${result.errors.join(', ')}`
      return false
    }

    error.value = null
    return true
  }

  /**
   * 导出配置
   */
  const exportConfig = (): string => {
    try {
      return JSON.stringify(config.value, null, 2)
    }
    catch (err) {
      error.value = '配置导出失败'
      return ''
    }
  }

  /**
   * 导入配置
   */
  const importConfig = (configData: string): boolean => {
    try {
      const importedConfig = JSON.parse(configData)

      // 验证导入的配置
      const validationResult = validationUtils.validateConfig(importedConfig)
      if (!validationResult.valid) {
        error.value = `导入的配置无效: ${validationResult.errors.join(', ')}`
        return false
      }

      // 更新配置
      updateConfig(importedConfig)
      error.value = null
      return true
    }
    catch (err) {
      error.value = '配置导入失败: 无效的JSON格式'
      return false
    }
  }

  // 监听配置变化，自动保存
  if (autoSave) {
    watch(config, () => {
      // 这里可以实现自动保存逻辑
      // 例如保存到localStorage或发送到服务器
    }, { deep: true })
  }

  onMounted(() => {
    initConfigManager()
  })

  onUnmounted(() => {
    if (configManager) {
      configManager.removeAllListeners()
    }
  })

  return {
    config,
    loading,
    error,
    isValid,
    validationErrors,
    updateConfig,
    resetConfig,
    validateConfig,
    exportConfig,
    importConfig,
  }
}

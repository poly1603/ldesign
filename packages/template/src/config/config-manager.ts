/**
 * 配置管理器实现
 * 提供配置的加载、验证、更新和监听功能
 */

import type {
  ConfigListener,
  ConfigManager,
  ConfigUpdateEvent,
  ConfigValidationResult,
  TemplateSystemConfig,
} from '../types/config'
import { reactive, watch } from 'vue'
import { defaultConfig, mergeConfig } from './default.config'

/**
 * 配置管理器实现类
 */
export class TemplateConfigManager implements ConfigManager {
  private config: TemplateSystemConfig
  private listeners: Set<ConfigListener> = new Set()
  private watchStoppers: (() => void)[] = []

  constructor(initialConfig?: Partial<TemplateSystemConfig>) {
    try {
      // 合并初始配置
      this.config = reactive(mergeConfig(initialConfig || {}))
      
      // 设置深度监听
      this.setupConfigWatcher()
    }
    catch (error) {
      console.error('[TemplateConfigManager] Error in constructor:', error)
      throw error
    }
  }

  /**
   * 设置配置监听器
   */
  private setupConfigWatcher(): void {
    const stopWatcher = watch(
      () => this.config,
      (newConfig, oldConfig) => {
        // 深度比较配置变化
        this.notifyConfigChange('', oldConfig, newConfig)
      },
      { deep: true },
    )

    this.watchStoppers.push(stopWatcher)
  }

  /**
   * 通知配置变化
   */
  private notifyConfigChange(path: string, oldValue: unknown, newValue: unknown): void {
    const event: ConfigUpdateEvent = {
      path,
      oldValue,
      newValue,
      timestamp: Date.now(),
    }

    this.listeners.forEach((listener) => {
      try {
        listener(event)
      }
      catch (error) {
        console.error('配置监听器执行错误:', error)
      }
    })
  }

  /**
   * 获取当前配置
   */
  getConfig(): TemplateSystemConfig {
    return this.config
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<TemplateSystemConfig>): void {
    const oldConfig = { ...this.config }
    const mergedConfig = mergeConfig(newConfig)

    // 验证新配置
    const validation = this.validateConfig(mergedConfig)
    if (!validation.valid) {
      throw new Error(`配置验证失败: ${validation.errors.join(', ')}`)
    }

    // 更新配置
    Object.assign(this.config, mergedConfig)

    if (this.config.debug) {
      console.log('配置已更新:', { oldConfig, newConfig: this.config })
    }
  }

  /**
   * 重置为默认配置
   */
  resetConfig(): void {
    const oldConfig = { ...this.config }
    Object.assign(this.config, defaultConfig)

    if (this.config.debug) {
      console.log('配置已重置为默认值')
    }
  }

  /**
   * 验证配置
   */
  validateConfig(config: Partial<TemplateSystemConfig>): ConfigValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 验证基础配置
    if (config.templatesDir && typeof config.templatesDir !== 'string') {
      errors.push('templatesDir 必须是字符串类型')
    }

    if (config.defaultDevice && !['desktop', 'tablet', 'mobile'].includes(config.defaultDevice)) {
      errors.push('defaultDevice 必须是 desktop、tablet 或 mobile 之一')
    }

    // 验证扫描器配置
    if (config.scanner) {
      const { scanner } = config

      if (scanner.maxDepth !== undefined && (scanner.maxDepth < 1 || scanner.maxDepth > 20)) {
        errors.push('scanner.maxDepth 必须在 1-20 之间')
      }

      if (scanner.includeExtensions && !Array.isArray(scanner.includeExtensions)) {
        errors.push('scanner.includeExtensions 必须是数组类型')
      }

      if (scanner.debounceDelay !== undefined && scanner.debounceDelay < 0) {
        errors.push('scanner.debounceDelay 不能为负数')
      }
    }

    // 验证缓存配置
    if (config.cache) {
      const { cache } = config

      if (cache.maxSize !== undefined && cache.maxSize < 1) {
        errors.push('cache.maxSize 必须大于 0')
      }

      if (cache.ttl !== undefined && cache.ttl < 0) {
        errors.push('cache.ttl 不能为负数')
      }

      if (cache.strategy && !['lru', 'fifo', 'lfu', 'ttl'].includes(cache.strategy)) {
        errors.push('cache.strategy 必须是 lru、fifo、lfu 或 ttl 之一')
      }
    }

    // 验证设备检测配置
    if (config.deviceDetection?.breakpoints) {
      const { breakpoints } = config.deviceDetection

      if (breakpoints.mobile >= breakpoints.tablet) {
        errors.push('mobile 断点必须小于 tablet 断点')
      }

      if (breakpoints.tablet >= breakpoints.desktop) {
        errors.push('tablet 断点必须小于 desktop 断点')
      }

      if (breakpoints.mobile < 200 || breakpoints.mobile > 1000) {
        warnings.push('mobile 断点建议在 200-1000 之间')
      }
    }

    // 验证预加载配置
    if (config.preloadStrategy) {
      const { preloadStrategy } = config

      if (preloadStrategy.limit !== undefined && preloadStrategy.limit < 0) {
        errors.push('preloadStrategy.limit 不能为负数')
      }

      if (preloadStrategy.mode && !['eager', 'lazy', 'intersection', 'manual'].includes(preloadStrategy.mode)) {
        errors.push('preloadStrategy.mode 必须是 eager、lazy、intersection 或 manual 之一')
      }

      if (preloadStrategy.intersection?.threshold !== undefined) {
        const threshold = preloadStrategy.intersection.threshold
        if (threshold < 0 || threshold > 1) {
          errors.push('preloadStrategy.intersection.threshold 必须在 0-1 之间')
        }
      }
    }

    // 验证加载器配置
    if (config.loader) {
      const { loader } = config

      if (loader.timeout !== undefined && loader.timeout < 1000) {
        warnings.push('loader.timeout 建议不少于 1000ms')
      }

      if (loader.retryCount !== undefined && loader.retryCount < 0) {
        errors.push('loader.retryCount 不能为负数')
      }

      if (loader.maxConcurrent !== undefined && loader.maxConcurrent < 1) {
        errors.push('loader.maxConcurrent 必须大于 0')
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      fixedConfig: errors.length === 0 ? config as TemplateSystemConfig : undefined,
    }
  }

  /**
   * 监听配置变化
   */
  onConfigChange(listener: ConfigListener): () => void {
    this.listeners.add(listener)

    // 返回取消监听的函数
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * 从文件加载配置
   */
  async loadFromFile(filePath: string): Promise<void> {
    try {
      // 动态导入配置文件
      const configModule = await import(/* @vite-ignore */ filePath)
      const fileConfig = configModule.default || configModule

      // 验证并更新配置
      const validation = this.validateConfig(fileConfig)
      if (!validation.valid) {
        throw new Error(`配置文件验证失败: ${validation.errors.join(', ')}`)
      }

      this.updateConfig(fileConfig)

      if (this.config.debug) {
        console.log(`已从文件加载配置: ${filePath}`)
      }
    }
    catch (error) {
      throw new Error(`加载配置文件失败: ${error}`)
    }
  }

  /**
   * 保存配置到文件
   */
  async saveToFile(filePath: string): Promise<void> {
    try {
      const configContent = `// 自动生成的配置文件
export default ${JSON.stringify(this.config, null, 2)}
`

      // 在浏览器环境中，我们只能提供下载功能
      if (typeof window !== 'undefined') {
        const blob = new Blob([configContent], { type: 'application/javascript' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filePath.split('/').pop() || 'template.config.js'
        a.click()
        URL.revokeObjectURL(url)
      }
      else {
        // Node.js 环境中的文件写入逻辑
        const fs = await import(/* @vite-ignore */ 'node:fs/promises')
        await fs.writeFile(filePath, configContent, 'utf-8')
      }

      if (this.config.debug) {
        console.log(`配置已保存到文件: ${filePath}`)
      }
    }
    catch (error) {
      throw new Error(`保存配置文件失败: ${error}`)
    }
  }

  /**
   * 销毁配置管理器
   */
  destroy(): void {
    // 停止所有监听器
    this.watchStoppers.forEach(stop => stop())
    this.watchStoppers.length = 0

    // 清空监听器
    this.listeners.clear()

    if (this.config.debug) {
      console.log('配置管理器已销毁')
    }
  }
}

/**
 * 全局配置管理器实例
 */
let globalConfigManager: TemplateConfigManager | null = null

/**
 * 获取全局配置管理器
 */
export function getConfigManager(initialConfig?: Partial<TemplateSystemConfig>): TemplateConfigManager {
  if (!globalConfigManager) {
    try {
      globalConfigManager = new TemplateConfigManager(initialConfig)
    }
    catch (error) {
      console.error('[ConfigManager] Error creating TemplateConfigManager:', error)
      throw error
    }
  }

  return globalConfigManager
}

/**
 * 重置全局配置管理器
 */
export function resetConfigManager(): void {
  if (globalConfigManager) {
    globalConfigManager.destroy()
    globalConfigManager = null
  }
}

/**
 * 配置编辑器核心类
 * 
 * 提供统一的配置文件编辑接口
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { EventEmitter } from 'events'
import type {
  FilePath,
  OperationResult,
  ConfigFileType,
  EventListener,
  ConfigChangeEvent
} from '../types/common'
import type { LauncherConfig, AppConfig, PackageJsonConfig } from '../types/config'
import { LauncherConfigParser } from './parsers/LauncherConfigParser'
import { AppConfigParser } from './parsers/AppConfigParser'
import { PackageJsonParser } from './parsers/PackageJsonParser'
import { findConfigFile, detectConfigFileType } from '../utils/configUtils'
import { exists, getFileInfo } from '../utils/fileSystem'

/**
 * 配置编辑器选项
 */
export interface ConfigEditorOptions {
  /** 工作目录 */
  cwd?: FilePath
  /** 是否启用自动保存 */
  autoSave?: boolean
  /** 自动保存延迟（毫秒） */
  autoSaveDelay?: number
  /** 是否启用备份 */
  enableBackup?: boolean
  /** 是否启用验证 */
  enableValidation?: boolean
}

/**
 * 配置编辑器核心类
 * 
 * 提供统一的配置文件管理和编辑功能
 */
export class ConfigEditor extends EventEmitter {
  private readonly cwd: FilePath
  private readonly options: Required<ConfigEditorOptions>
  private readonly launcherParser: LauncherConfigParser
  private readonly appParser: AppConfigParser
  private readonly packageParser: PackageJsonParser

  // 缓存的配置对象
  private launcherConfig: LauncherConfig | null = null
  private appConfig: AppConfig | null = null
  private packageConfig: PackageJsonConfig | null = null

  // 自动保存定时器
  private autoSaveTimers: Map<ConfigFileType, NodeJS.Timeout> = new Map()

  constructor(options: ConfigEditorOptions = {}) {
    super()

    this.cwd = options.cwd || process.cwd()
    this.options = {
      cwd: this.cwd,
      autoSave: options.autoSave ?? false,
      autoSaveDelay: options.autoSaveDelay ?? 1000,
      enableBackup: options.enableBackup ?? true,
      enableValidation: options.enableValidation ?? true
    }

    // 初始化解析器
    this.launcherParser = new LauncherConfigParser()
    this.appParser = new AppConfigParser()
    this.packageParser = new PackageJsonParser()
  }

  /**
   * 初始化配置编辑器
   * @returns 初始化结果
   */
  async initialize(): Promise<OperationResult<void>> {
    try {
      // 加载所有配置文件
      await this.loadAllConfigs()

      return {
        success: true
      }
    } catch (error) {
      return {
        success: false,
        error: `初始化失败: ${error instanceof Error ? error.message : error}`
      }
    }
  }

  /**
   * 加载所有配置文件
   */
  private async loadAllConfigs(): Promise<void> {
    // 加载 launcher 配置
    const launcherFile = await findConfigFile(this.cwd, 'launcher')
    if (launcherFile) {
      const result = await this.launcherParser.parse(launcherFile)
      if (result.success && result.data) {
        this.launcherConfig = result.data
      }
    }

    // 加载 app 配置
    const appFile = await findConfigFile(this.cwd, 'app')
    if (appFile) {
      const result = await this.appParser.parse(appFile)
      if (result.success && result.data) {
        this.appConfig = result.data
      }
    }

    // 加载 package.json 配置
    const packageFile = await findConfigFile(this.cwd, 'package')
    if (packageFile) {
      const result = await this.packageParser.parse(packageFile)
      if (result.success && result.data) {
        this.packageConfig = result.data
      }
    }
  }

  /**
   * 解析 Launcher 配置文件
   * @param filePath 文件路径
   * @returns 解析结果
   */
  async parseLauncherConfig(filePath: FilePath): Promise<OperationResult<LauncherConfig>> {
    const result = await this.launcherParser.parseLauncherConfig(filePath)
    if (result.success && result.data) {
      this.launcherConfig = result.data
    }
    return result
  }

  /**
   * 解析 App 配置文件
   * @param filePath 文件路径
   * @returns 解析结果
   */
  async parseAppConfig(filePath: FilePath): Promise<OperationResult<AppConfig>> {
    const result = await this.appParser.parseAppConfig(filePath)
    if (result.success && result.data) {
      this.appConfig = result.data
    }
    return result
  }

  /**
   * 解析 Package.json 文件
   * @param filePath 文件路径
   * @returns 解析结果
   */
  async parsePackageJson(filePath: FilePath): Promise<OperationResult<PackageJsonConfig>> {
    const result = await this.packageParser.parsePackageJson(filePath)
    if (result.success && result.data) {
      this.packageConfig = result.data
    }
    return result
  }

  /**
   * 保存配置文件
   * @param type 配置类型
   * @param filePath 文件路径
   * @param config 配置对象
   * @returns 保存结果
   */
  async saveConfig<T>(
    type: ConfigFileType,
    filePath: FilePath,
    config: T
  ): Promise<OperationResult<void>> {
    try {
      let result: OperationResult<void>

      switch (type) {
        case 'launcher':
          result = await this.launcherParser.save(filePath, config as LauncherConfig, {
            backup: this.options.enableBackup
          })
          if (result.success) {
            this.launcherConfig = config as LauncherConfig
          }
          break

        case 'app':
          result = await this.appParser.save(filePath, config as AppConfig, {
            backup: this.options.enableBackup
          })
          if (result.success) {
            this.appConfig = config as AppConfig
          }
          break

        case 'package':
          result = await this.packageParser.save(filePath, config as PackageJsonConfig, {
            backup: this.options.enableBackup
          })
          if (result.success) {
            this.packageConfig = config as PackageJsonConfig
          }
          break

        default:
          return {
            success: false,
            error: `不支持的配置类型: ${type}`
          }
      }

      // 触发配置更改事件
      if (result.success) {
        this.emitConfigChange(type, filePath, config)
      }

      return result

    } catch (error) {
      return {
        success: false,
        error: `保存配置失败: ${error instanceof Error ? error.message : error}`
      }
    }
  }

  /**
   * 获取配置对象
   * @param type 配置类型
   * @returns 配置对象
   */
  getConfig<T>(type: ConfigFileType): T | null {
    switch (type) {
      case 'launcher':
        return this.launcherConfig as T
      case 'app':
        return this.appConfig as T
      case 'package':
        return this.packageConfig as T
      default:
        return null
    }
  }

  /**
   * 更新配置对象
   * @param type 配置类型
   * @param updates 更新内容
   * @returns 更新后的配置
   */
  updateConfig<T>(type: ConfigFileType, updates: Partial<T>): T | null {
    const currentConfig = this.getConfig<T>(type)
    if (!currentConfig) {
      return null
    }

    const updatedConfig = { ...currentConfig, ...updates }

    // 更新缓存
    switch (type) {
      case 'launcher':
        this.launcherConfig = updatedConfig as LauncherConfig
        break
      case 'app':
        this.appConfig = updatedConfig as unknown as AppConfig
        break
      case 'package':
        this.packageConfig = updatedConfig as unknown as PackageJsonConfig
        break
    }

    // 触发自动保存
    if (this.options.autoSave) {
      this.scheduleAutoSave(type)
    }

    return updatedConfig
  }

  /**
   * 验证配置对象
   * @param type 配置类型
   * @param config 配置对象
   * @returns 验证结果
   */
  async validateConfig(type: ConfigFileType, config: any): Promise<OperationResult<boolean>> {
    try {
      let validationResult

      switch (type) {
        case 'launcher':
          validationResult = await this.launcherParser.validate(config)
          break
        case 'app':
          validationResult = await this.appParser.validate(config)
          break
        case 'package':
          validationResult = await this.packageParser.validate(config)
          break
        default:
          return {
            success: false,
            error: `不支持的配置类型: ${type}`
          }
      }

      return {
        success: true,
        data: validationResult.valid,
        error: validationResult.valid ? undefined : validationResult.errors.join(', ')
      }

    } catch (error) {
      return {
        success: false,
        error: `验证配置失败: ${error instanceof Error ? error.message : error}`
      }
    }
  }

  /**
   * 计划自动保存
   * @param type 配置类型
   */
  private scheduleAutoSave(type: ConfigFileType): void {
    // 清除现有的定时器
    const existingTimer = this.autoSaveTimers.get(type)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // 设置新的定时器
    const timer = setTimeout(async () => {
      const config = this.getConfig(type)
      if (config) {
        const filePath = await findConfigFile(this.cwd, type)
        if (filePath) {
          await this.saveConfig(type, filePath, config)
        }
      }
    }, this.options.autoSaveDelay)

    this.autoSaveTimers.set(type, timer)
  }

  /**
   * 触发配置更改事件
   * @param type 配置类型
   * @param filePath 文件路径
   * @param config 配置对象
   */
  private emitConfigChange(type: ConfigFileType, filePath: FilePath, config: any): void {
    const event: ConfigChangeEvent = {
      type,
      path: filePath,
      oldValue: null, // 这里可以保存旧值用于比较
      newValue: config,
      timestamp: Date.now()
    }

    this.emit('change', event)
  }

  /**
   * 监听配置更改事件
   * @param listener 事件监听器
   */
  onChange(listener: EventListener<ConfigChangeEvent>): void {
    this.on('change', listener)
  }

  /**
   * 销毁配置编辑器
   */
  destroy(): void {
    // 清除所有自动保存定时器
    for (const timer of this.autoSaveTimers.values()) {
      clearTimeout(timer)
    }
    this.autoSaveTimers.clear()

    // 移除所有事件监听器
    this.removeAllListeners()
  }
}

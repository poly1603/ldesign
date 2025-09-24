/**
 * Package.json 解析器
 * 
 * 专门用于解析和处理 package.json 文件
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { FilePath, OperationResult, ValidationResult } from '../../types/common'
import type { PackageJsonConfig } from '../../types/config'
import type { PackageJsonParser as IPackageJsonParser } from '../../types/parser'
import { BaseConfigParser } from './BaseConfigParser'
import { DEFAULT_PACKAGE_CONFIG } from '../../constants/defaults'
import { validatePackageJsonConfig, validatePackageName, validateVersion } from '../../utils/validation'

/**
 * Package.json 解析器实现
 * 
 * 提供 package.json 文件的解析、验证和保存功能
 */
export class PackageJsonParser extends BaseConfigParser<PackageJsonConfig> implements IPackageJsonParser {
  
  /**
   * 解析 package.json 文件
   * @param filePath 文件路径
   * @returns 解析结果
   */
  async parsePackageJson(filePath: FilePath): Promise<OperationResult<PackageJsonConfig>> {
    return this.parse(filePath, { validate: true })
  }
  
  /**
   * 验证 Package.json 配置
   * @param config 配置对象
   * @returns 验证结果
   */
  async validate(config: PackageJsonConfig): Promise<ValidationResult> {
    const errors: string[] = []
    
    // 使用通用验证函数
    const baseValidation = validatePackageJsonConfig(config)
    errors.push(...baseValidation.errors)
    
    // 额外的自定义验证
    this.validateScripts(config, errors)
    this.validateDependencies(config, errors)
    this.validateEngines(config, errors)
    this.validateExports(config, errors)
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
  
  /**
   * 获取默认 Package.json 配置
   * @returns 默认配置对象
   */
  getDefaultConfig(): PackageJsonConfig {
    return { ...DEFAULT_PACKAGE_CONFIG }
  }
  
  /**
   * 获取配置类型
   * @returns 配置类型
   */
  protected getConfigType(): 'package' {
    return 'package'
  }
  
  /**
   * 添加依赖
   * @param packageName 包名
   * @param version 版本
   * @param type 依赖类型
   * @returns 操作结果
   */
  async addDependency(
    packageName: string, 
    version: string, 
    type: 'dependencies' | 'devDependencies' | 'peerDependencies' = 'dependencies'
  ): Promise<OperationResult<void>> {
    try {
      // 验证包名
      const nameValidation = validatePackageName(packageName)
      if (!nameValidation.valid) {
        return {
          success: false,
          error: `无效的包名: ${nameValidation.errors.join(', ')}`
        }
      }
      
      // 验证版本号
      const versionValidation = validateVersion(version)
      if (!versionValidation.valid) {
        return {
          success: false,
          error: `无效的版本号: ${versionValidation.errors.join(', ')}`
        }
      }
      
      return {
        success: true
      }
    } catch (error) {
      return {
        success: false,
        error: `添加依赖失败: ${error instanceof Error ? error.message : error}`
      }
    }
  }
  
  /**
   * 移除依赖
   * @param packageName 包名
   * @param type 依赖类型
   * @returns 操作结果
   */
  async removeDependency(
    packageName: string,
    type?: 'dependencies' | 'devDependencies' | 'peerDependencies'
  ): Promise<OperationResult<void>> {
    try {
      // 验证包名
      const nameValidation = validatePackageName(packageName)
      if (!nameValidation.valid) {
        return {
          success: false,
          error: `无效的包名: ${nameValidation.errors.join(', ')}`
        }
      }
      
      return {
        success: true
      }
    } catch (error) {
      return {
        success: false,
        error: `移除依赖失败: ${error instanceof Error ? error.message : error}`
      }
    }
  }
  
  /**
   * 更新依赖版本
   * @param packageName 包名
   * @param version 新版本
   * @param type 依赖类型
   * @returns 操作结果
   */
  async updateDependency(
    packageName: string,
    version: string,
    type?: 'dependencies' | 'devDependencies' | 'peerDependencies'
  ): Promise<OperationResult<void>> {
    try {
      // 验证包名
      const nameValidation = validatePackageName(packageName)
      if (!nameValidation.valid) {
        return {
          success: false,
          error: `无效的包名: ${nameValidation.errors.join(', ')}`
        }
      }
      
      // 验证版本号
      const versionValidation = validateVersion(version)
      if (!versionValidation.valid) {
        return {
          success: false,
          error: `无效的版本号: ${versionValidation.errors.join(', ')}`
        }
      }
      
      return {
        success: true
      }
    } catch (error) {
      return {
        success: false,
        error: `更新依赖失败: ${error instanceof Error ? error.message : error}`
      }
    }
  }
  
  /**
   * 验证脚本配置
   * @param config 配置对象
   * @param errors 错误列表
   */
  private validateScripts(config: PackageJsonConfig, errors: string[]): void {
    if (!config.scripts) return
    
    for (const [scriptName, scriptCommand] of Object.entries(config.scripts)) {
      if (typeof scriptCommand !== 'string' || scriptCommand.trim().length === 0) {
        errors.push(`scripts.${scriptName}: 脚本命令不能为空`)
      }
    }
  }
  
  /**
   * 验证依赖配置
   * @param config 配置对象
   * @param errors 错误列表
   */
  private validateDependencies(config: PackageJsonConfig, errors: string[]): void {
    const dependencyTypes = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']
    
    for (const depType of dependencyTypes) {
      const deps = config[depType as keyof PackageJsonConfig] as Record<string, string> | undefined
      if (!deps) continue
      
      for (const [packageName, version] of Object.entries(deps)) {
        // 验证包名
        const nameValidation = validatePackageName(packageName)
        if (!nameValidation.valid) {
          errors.push(`${depType}.${packageName}: 包名格式不正确`)
        }
        
        // 验证版本号（允许范围版本）
        if (typeof version !== 'string' || version.trim().length === 0) {
          errors.push(`${depType}.${packageName}: 版本号不能为空`)
        }
      }
    }
  }
  
  /**
   * 验证引擎配置
   * @param config 配置对象
   * @param errors 错误列表
   */
  private validateEngines(config: PackageJsonConfig, errors: string[]): void {
    if (!config.engines) return
    
    for (const [engineName, version] of Object.entries(config.engines)) {
      if (typeof version !== 'string' || version.trim().length === 0) {
        errors.push(`engines.${engineName}: 引擎版本不能为空`)
      }
    }
  }
  
  /**
   * 验证导出配置
   * @param config 配置对象
   * @param errors 错误列表
   */
  private validateExports(config: PackageJsonConfig, errors: string[]): void {
    if (!config.exports) return
    
    // 这里可以添加更复杂的导出配置验证逻辑
    // 例如检查文件路径是否存在、格式是否正确等
  }
  
  /**
   * 创建默认的 Package.json 配置
   * @param packageName 包名
   * @param options 其他选项
   * @returns 默认配置
   */
  createDefaultConfig(
    packageName: string,
    options: {
      version?: string
      description?: string
      author?: string
      license?: string
    } = {}
  ): PackageJsonConfig {
    const defaultConfig = this.getDefaultConfig()
    
    return {
      ...defaultConfig,
      name: packageName,
      version: options.version || '1.0.0',
      description: options.description || 'A new package',
      author: options.author || 'LDesign Team',
      license: options.license || 'MIT'
    }
  }
  
  /**
   * 添加脚本
   * @param config 当前配置
   * @param scriptName 脚本名称
   * @param scriptCommand 脚本命令
   * @returns 更新后的配置
   */
  addScript(config: PackageJsonConfig, scriptName: string, scriptCommand: string): PackageJsonConfig {
    return {
      ...config,
      scripts: {
        ...config.scripts,
        [scriptName]: scriptCommand
      }
    }
  }
  
  /**
   * 移除脚本
   * @param config 当前配置
   * @param scriptName 脚本名称
   * @returns 更新后的配置
   */
  removeScript(config: PackageJsonConfig, scriptName: string): PackageJsonConfig {
    const { [scriptName]: removed, ...remainingScripts } = config.scripts || {}
    
    return {
      ...config,
      scripts: remainingScripts
    }
  }
  
  /**
   * 添加关键词
   * @param config 当前配置
   * @param keyword 关键词
   * @returns 更新后的配置
   */
  addKeyword(config: PackageJsonConfig, keyword: string): PackageJsonConfig {
    const keywords = config.keywords || []
    
    if (!keywords.includes(keyword)) {
      keywords.push(keyword)
    }
    
    return {
      ...config,
      keywords
    }
  }
  
  /**
   * 移除关键词
   * @param config 当前配置
   * @param keyword 关键词
   * @returns 更新后的配置
   */
  removeKeyword(config: PackageJsonConfig, keyword: string): PackageJsonConfig {
    const keywords = config.keywords || []
    
    return {
      ...config,
      keywords: keywords.filter(k => k !== keyword)
    }
  }
}

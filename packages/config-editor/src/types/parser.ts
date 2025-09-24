/**
 * 解析器相关类型定义
 * 
 * 定义配置文件解析器的类型和接口
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { FilePath, OperationResult, ValidationResult } from './common'
import type { LauncherConfig, AppConfig, PackageJsonConfig } from './config'

/**
 * 解析器接口
 * 定义配置文件解析器的通用接口
 */
export interface ConfigParser<T = any> {
  /**
   * 解析配置文件
   * @param filePath 文件路径
   * @returns 解析结果
   */
  parse(filePath: FilePath): Promise<OperationResult<T>>
  
  /**
   * 序列化配置对象
   * @param config 配置对象
   * @returns 序列化结果
   */
  serialize(config: T): Promise<OperationResult<string>>
  
  /**
   * 保存配置文件
   * @param filePath 文件路径
   * @param config 配置对象
   * @returns 保存结果
   */
  save(filePath: FilePath, config: T): Promise<OperationResult<void>>
  
  /**
   * 验证配置对象
   * @param config 配置对象
   * @returns 验证结果
   */
  validate(config: T): Promise<ValidationResult>
  
  /**
   * 获取默认配置
   * @returns 默认配置对象
   */
  getDefaultConfig(): T
  
  /**
   * 合并配置对象
   * @param base 基础配置
   * @param override 覆盖配置
   * @returns 合并后的配置
   */
  merge(base: T, override: Partial<T>): T
}

/**
 * Launcher 配置解析器接口
 */
export interface LauncherConfigParser extends ConfigParser<LauncherConfig> {
  /**
   * 解析 launcher.config.ts 文件
   * @param filePath 文件路径
   * @returns 解析结果
   */
  parseLauncherConfig(filePath: FilePath): Promise<OperationResult<LauncherConfig>>
  
  /**
   * 生成 launcher.config.ts 文件内容
   * @param config 配置对象
   * @returns 生成的文件内容
   */
  generateConfigFile(config: LauncherConfig): string
}

/**
 * App 配置解析器接口
 */
export interface AppConfigParser extends ConfigParser<AppConfig> {
  /**
   * 解析 app.config.ts 文件
   * @param filePath 文件路径
   * @returns 解析结果
   */
  parseAppConfig(filePath: FilePath): Promise<OperationResult<AppConfig>>
  
  /**
   * 生成 app.config.ts 文件内容
   * @param config 配置对象
   * @returns 生成的文件内容
   */
  generateConfigFile(config: AppConfig): string
}

/**
 * Package.json 解析器接口
 */
export interface PackageJsonParser extends ConfigParser<PackageJsonConfig> {
  /**
   * 解析 package.json 文件
   * @param filePath 文件路径
   * @returns 解析结果
   */
  parsePackageJson(filePath: FilePath): Promise<OperationResult<PackageJsonConfig>>
  
  /**
   * 添加依赖
   * @param packageName 包名
   * @param version 版本
   * @param type 依赖类型
   * @returns 操作结果
   */
  addDependency(
    packageName: string, 
    version: string, 
    type?: 'dependencies' | 'devDependencies' | 'peerDependencies'
  ): Promise<OperationResult<void>>
  
  /**
   * 移除依赖
   * @param packageName 包名
   * @param type 依赖类型
   * @returns 操作结果
   */
  removeDependency(
    packageName: string,
    type?: 'dependencies' | 'devDependencies' | 'peerDependencies'
  ): Promise<OperationResult<void>>
  
  /**
   * 更新依赖版本
   * @param packageName 包名
   * @param version 新版本
   * @param type 依赖类型
   * @returns 操作结果
   */
  updateDependency(
    packageName: string,
    version: string,
    type?: 'dependencies' | 'devDependencies' | 'peerDependencies'
  ): Promise<OperationResult<void>>
}

/**
 * 解析选项接口
 */
export interface ParseOptions {
  /** 是否严格模式 */
  strict?: boolean
  /** 是否允许注释 */
  allowComments?: boolean
  /** 是否允许尾随逗号 */
  allowTrailingCommas?: boolean
  /** 编码格式 */
  encoding?: BufferEncoding
  /** 是否验证配置 */
  validate?: boolean
}

/**
 * 序列化选项接口
 */
export interface SerializeOptions {
  /** 缩进字符 */
  indent?: string | number
  /** 是否格式化 */
  format?: boolean
  /** 是否包含注释 */
  includeComments?: boolean
  /** 编码格式 */
  encoding?: BufferEncoding
}

/**
 * 解析错误接口
 */
export interface ParseError extends Error {
  /** 错误类型 */
  type: 'syntax' | 'validation' | 'file' | 'unknown'
  /** 文件路径 */
  filePath?: FilePath
  /** 行号 */
  line?: number
  /** 列号 */
  column?: number
  /** 错误详情 */
  details?: any
}

/**
 * 配置差异接口
 */
export interface ConfigDiff {
  /** 差异类型 */
  type: 'added' | 'removed' | 'modified'
  /** 字段路径 */
  path: string
  /** 旧值 */
  oldValue?: any
  /** 新值 */
  newValue?: any
}

/**
 * 配置比较结果接口
 */
export interface ConfigCompareResult {
  /** 是否有差异 */
  hasDifferences: boolean
  /** 差异列表 */
  differences: ConfigDiff[]
  /** 添加的字段数量 */
  addedCount: number
  /** 移除的字段数量 */
  removedCount: number
  /** 修改的字段数量 */
  modifiedCount: number
}

/**
 * 基础配置解析器
 * 
 * 提供配置文件解析的基础功能
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { FilePath, OperationResult, ValidationResult } from '../../types/common'
import type { ConfigParser, ParseOptions, SerializeOptions } from '../../types/parser'
import { readFile, writeFile, backupFile } from '../../utils/fileSystem'
import { 
  detectConfigFileFormat, 
  parseJsonConfig, 
  serializeJsonConfig,
  parseYamlConfig,
  serializeYamlConfig,
  parseJsConfig,
  generateTsConfigFile,
  deepMergeConfig
} from '../../utils/configUtils'

/**
 * 基础配置解析器抽象类
 * 
 * 提供配置文件解析的通用功能，具体的配置类型由子类实现
 */
export abstract class BaseConfigParser<T = any> implements ConfigParser<T> {
  /**
   * 解析配置文件
   * @param filePath 文件路径
   * @param options 解析选项
   * @returns 解析结果
   */
  async parse(filePath: FilePath, options: ParseOptions = {}): Promise<OperationResult<T>> {
    try {
      // 读取文件内容
      const readResult = await readFile(filePath, options.encoding)
      if (!readResult.success || !readResult.data) {
        return {
          success: false,
          error: readResult.error || '读取文件失败'
        }
      }
      
      // 检测文件格式
      const format = detectConfigFileFormat(filePath)
      
      // 根据格式解析内容
      let parseResult: OperationResult<T>
      
      switch (format) {
        case 'json':
          parseResult = parseJsonConfig<T>(readResult.data)
          break
        
        case 'yaml':
        case 'yml':
          parseResult = parseYamlConfig<T>(readResult.data)
          break
        
        case 'ts':
        case 'js':
          parseResult = parseJsConfig<T>(readResult.data)
          break
        
        default:
          return {
            success: false,
            error: `不支持的文件格式: ${format}`
          }
      }
      
      if (!parseResult.success) {
        return parseResult
      }
      
      // 验证配置（如果启用）
      if (options.validate && parseResult.data) {
        const validationResult = await this.validate(parseResult.data)
        if (!validationResult.valid) {
          return {
            success: false,
            error: `配置验证失败: ${validationResult.errors.join(', ')}`
          }
        }
      }
      
      return parseResult
      
    } catch (error) {
      return {
        success: false,
        error: `解析配置文件失败: ${error instanceof Error ? error.message : error}`
      }
    }
  }
  
  /**
   * 序列化配置对象
   * @param config 配置对象
   * @param options 序列化选项
   * @returns 序列化结果
   */
  async serialize(config: T, options: SerializeOptions = {}): Promise<OperationResult<string>> {
    try {
      const { format = true, indent = 2 } = options
      
      if (format) {
        const result = serializeJsonConfig(config, typeof indent === 'number' ? indent : 2)
        return result
      } else {
        const result = serializeJsonConfig(config, 0)
        return result
      }
      
    } catch (error) {
      return {
        success: false,
        error: `序列化配置失败: ${error instanceof Error ? error.message : error}`
      }
    }
  }
  
  /**
   * 保存配置文件
   * @param filePath 文件路径
   * @param config 配置对象
   * @param options 序列化选项
   * @returns 保存结果
   */
  async save(
    filePath: FilePath, 
    config: T, 
    options: SerializeOptions & { backup?: boolean } = {}
  ): Promise<OperationResult<void>> {
    try {
      // 创建备份（如果启用）
      if (options.backup) {
        const backupResult = await backupFile(filePath)
        if (!backupResult.success) {
          console.warn('创建备份失败:', backupResult.error)
        }
      }
      
      // 检测文件格式
      const format = detectConfigFileFormat(filePath)
      
      let content: string
      
      if (format === 'ts' || format === 'js') {
        // 生成 TypeScript/JavaScript 配置文件
        const configType = this.getConfigType()
        content = generateTsConfigFile(config, configType)
      } else {
        // 序列化为 JSON/YAML
        const serializeResult = await this.serialize(config, options)
        if (!serializeResult.success || !serializeResult.data) {
          return {
            success: false,
            error: serializeResult.error || '序列化失败'
          }
        }
        content = serializeResult.data
      }
      
      // 写入文件
      const writeResult = await writeFile(filePath, content, options.encoding)
      return writeResult
      
    } catch (error) {
      return {
        success: false,
        error: `保存配置文件失败: ${error instanceof Error ? error.message : error}`
      }
    }
  }
  
  /**
   * 合并配置对象
   * @param base 基础配置
   * @param override 覆盖配置
   * @returns 合并后的配置
   */
  merge(base: T, override: Partial<T>): T {
    return deepMergeConfig(base as any, override as any) as T
  }
  
  /**
   * 验证配置对象（抽象方法，由子类实现）
   * @param config 配置对象
   * @returns 验证结果
   */
  abstract validate(config: T): Promise<ValidationResult>
  
  /**
   * 获取默认配置（抽象方法，由子类实现）
   * @returns 默认配置对象
   */
  abstract getDefaultConfig(): T
  
  /**
   * 获取配置类型（抽象方法，由子类实现）
   * @returns 配置类型
   */
  protected abstract getConfigType(): 'launcher' | 'app' | 'package'
  
  /**
   * 规范化配置对象
   * @param config 原始配置对象
   * @returns 规范化后的配置对象
   */
  protected normalizeConfig(config: T): T {
    // 移除 undefined 值
    return JSON.parse(JSON.stringify(config))
  }
  
  /**
   * 验证配置字段
   * @param config 配置对象
   * @param fieldPath 字段路径
   * @param validator 验证函数
   * @returns 验证结果
   */
  protected validateField(
    config: any, 
    fieldPath: string, 
    validator: (value: any) => boolean,
    errorMessage: string
  ): string[] {
    const errors: string[] = []
    const keys = fieldPath.split('.')
    let value = config
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key]
      } else {
        return errors // 字段不存在，跳过验证
      }
    }
    
    if (!validator(value)) {
      errors.push(`${fieldPath}: ${errorMessage}`)
    }
    
    return errors
  }
}

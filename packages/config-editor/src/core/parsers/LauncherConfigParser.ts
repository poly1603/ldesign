/**
 * Launcher 配置解析器
 * 
 * 专门用于解析和处理 launcher.config.ts 文件
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { FilePath, OperationResult, ValidationResult } from '../../types/common'
import type { LauncherConfig } from '../../types/config'
import type { LauncherConfigParser as ILauncherConfigParser } from '../../types/parser'
import { BaseConfigParser } from './BaseConfigParser'
import { DEFAULT_LAUNCHER_CONFIG } from '../../constants/defaults'
import { validateLauncherConfig, validatePort } from '../../utils/validation'

/**
 * Launcher 配置解析器实现
 * 
 * 提供 launcher.config.ts 文件的解析、验证和保存功能
 */
export class LauncherConfigParser extends BaseConfigParser<LauncherConfig> implements ILauncherConfigParser {
  
  /**
   * 解析 launcher.config.ts 文件
   * @param filePath 文件路径
   * @returns 解析结果
   */
  async parseLauncherConfig(filePath: FilePath): Promise<OperationResult<LauncherConfig>> {
    return this.parse(filePath, { validate: true })
  }
  
  /**
   * 生成 launcher.config.ts 文件内容
   * @param config 配置对象
   * @returns 生成的文件内容
   */
  generateConfigFile(config: LauncherConfig): string {
    const configJson = JSON.stringify(config, null, 2)
    
    return `import { defineConfig } from '@ldesign/launcher'

export default defineConfig(${configJson})
`
  }
  
  /**
   * 验证 Launcher 配置
   * @param config 配置对象
   * @returns 验证结果
   */
  async validate(config: LauncherConfig): Promise<ValidationResult> {
    const errors: string[] = []
    
    // 使用通用验证函数
    const baseValidation = validateLauncherConfig(config)
    errors.push(...baseValidation.errors)
    
    // 额外的自定义验证
    this.validateServerConfig(config, errors)
    this.validateBuildConfig(config, errors)
    this.validatePluginsConfig(config, errors)
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
  
  /**
   * 获取默认 Launcher 配置
   * @returns 默认配置对象
   */
  getDefaultConfig(): LauncherConfig {
    return { ...DEFAULT_LAUNCHER_CONFIG }
  }
  
  /**
   * 获取配置类型
   * @returns 配置类型
   */
  protected getConfigType(): 'launcher' {
    return 'launcher'
  }
  
  /**
   * 验证服务器配置
   * @param config 配置对象
   * @param errors 错误列表
   */
  private validateServerConfig(config: LauncherConfig, errors: string[]): void {
    if (!config.server) return
    
    const { server } = config
    
    // 验证端口号
    if (server.port !== undefined) {
      const portValidation = validatePort(server.port)
      if (!portValidation.valid) {
        errors.push(...portValidation.errors.map(err => `server.port: ${err}`))
      }
    }
    
    // 验证主机地址
    if (server.host !== undefined) {
      if (typeof server.host !== 'string' || server.host.trim().length === 0) {
        errors.push('server.host: 主机地址不能为空')
      }
    }
    
    // 验证 HTTPS 配置
    if (server.https && typeof server.https === 'object') {
      if (!server.https.key || !server.https.cert) {
        errors.push('server.https: 必须同时提供 key 和 cert')
      }
    }
    
    // 验证代理配置
    if (server.proxy) {
      this.validateProxyConfig(server.proxy, errors)
    }
  }
  
  /**
   * 验证构建配置
   * @param config 配置对象
   * @param errors 错误列表
   */
  private validateBuildConfig(config: LauncherConfig, errors: string[]): void {
    if (!config.build) return
    
    const { build } = config
    
    // 验证输出目录
    if (build.outDir !== undefined) {
      if (typeof build.outDir !== 'string' || build.outDir.trim().length === 0) {
        errors.push('build.outDir: 输出目录不能为空')
      }
    }
    
    // 验证压缩选项
    if (build.minify !== undefined) {
      const validMinifyOptions = [true, false, 'terser', 'esbuild']
      if (!validMinifyOptions.includes(build.minify)) {
        errors.push('build.minify: 压缩选项必须是 true、false、"terser" 或 "esbuild"')
      }
    }
    
    // 验证构建目标
    if (build.target !== undefined) {
      if (typeof build.target === 'string') {
        if (build.target.trim().length === 0) {
          errors.push('build.target: 构建目标不能为空')
        }
      } else if (Array.isArray(build.target)) {
        if (build.target.length === 0) {
          errors.push('build.target: 构建目标数组不能为空')
        }
        for (const target of build.target) {
          if (typeof target !== 'string' || target.trim().length === 0) {
            errors.push('build.target: 构建目标必须是非空字符串')
            break
          }
        }
      }
    }
  }
  
  /**
   * 验证插件配置
   * @param config 配置对象
   * @param errors 错误列表
   */
  private validatePluginsConfig(config: LauncherConfig, errors: string[]): void {
    if (!config.plugins) return
    
    if (!Array.isArray(config.plugins)) {
      errors.push('plugins: 插件配置必须是数组')
      return
    }
    
    // 这里可以添加更多插件相关的验证逻辑
    // 例如检查插件是否存在、配置是否正确等
  }
  
  /**
   * 验证代理配置
   * @param proxy 代理配置
   * @param errors 错误列表
   */
  private validateProxyConfig(proxy: Record<string, any>, errors: string[]): void {
    for (const [path, config] of Object.entries(proxy)) {
      if (typeof config === 'string') {
        // 简单的字符串配置，应该是目标 URL
        if (!this.isValidUrl(config)) {
          errors.push(`server.proxy.${path}: 代理目标必须是有效的 URL`)
        }
      } else if (typeof config === 'object' && config !== null) {
        // 对象配置
        if (!config.target) {
          errors.push(`server.proxy.${path}: 代理配置必须包含 target 字段`)
        } else if (!this.isValidUrl(config.target)) {
          errors.push(`server.proxy.${path}.target: 代理目标必须是有效的 URL`)
        }
      } else {
        errors.push(`server.proxy.${path}: 代理配置格式不正确`)
      }
    }
  }
  
  /**
   * 检查是否为有效的 URL
   * @param url URL 字符串
   * @returns 是否有效
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
  
  /**
   * 创建默认的 Launcher 配置
   * @param projectName 项目名称
   * @param framework 框架类型
   * @returns 默认配置
   */
  createDefaultConfig(
    projectName?: string, 
    framework?: 'vue' | 'react' | 'lit' | 'vanilla'
  ): LauncherConfig {
    const defaultConfig = this.getDefaultConfig()
    
    if (projectName) {
      defaultConfig.projectName = projectName
    }
    
    if (framework) {
      defaultConfig.framework = framework
    }
    
    return defaultConfig
  }
  
  /**
   * 更新服务器配置
   * @param config 当前配置
   * @param serverConfig 新的服务器配置
   * @returns 更新后的配置
   */
  updateServerConfig(
    config: LauncherConfig, 
    serverConfig: Partial<LauncherConfig['server']>
  ): LauncherConfig {
    return {
      ...config,
      server: {
        ...config.server,
        ...serverConfig
      }
    }
  }
  
  /**
   * 更新构建配置
   * @param config 当前配置
   * @param buildConfig 新的构建配置
   * @returns 更新后的配置
   */
  updateBuildConfig(
    config: LauncherConfig, 
    buildConfig: Partial<LauncherConfig['build']>
  ): LauncherConfig {
    return {
      ...config,
      build: {
        ...config.build,
        ...buildConfig
      }
    }
  }
}

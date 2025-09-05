/**
 * 环境管理器
 * 负责多环境配置的管理和切换
 */

import type { Logger } from '../logger'
import { EventEmitter } from 'node:events'

/**
 * 环境配置
 */
export interface EnvironmentConfig {
  name: string
  description?: string
  variables?: Record<string, any>
  extends?: string
  active?: boolean
}

/**
 * 环境管理器选项
 */
export interface EnvironmentManagerOptions {
  environments: string[]
  defaultEnvironment: string
  logger?: Logger
}

/**
 * 环境管理器类
 */
export class EnvironmentManager extends EventEmitter {
  private options: EnvironmentManagerOptions
  private currentEnvironment: string
  private environmentConfigs = new Map<string, EnvironmentConfig>()
  private logger?: Logger

  constructor(options: EnvironmentManagerOptions) {
    super()
    this.options = options
    this.currentEnvironment = options.defaultEnvironment
    this.logger = options.logger
  }

  /**
   * 初始化环境管理器
   */
  async initialize(): Promise<void> {
    try {
      // 初始化默认环境配置
      this.initializeDefaultEnvironments()

      this.logger?.info(`环境管理器初始化完成，当前环境: ${this.currentEnvironment}`)
    }
    catch (error) {
      this.logger?.error('环境管理器初始化失败:', error)
      throw error
    }
  }

  /**
   * 获取当前环境
   */
  getCurrentEnvironment(): string {
    return this.currentEnvironment
  }

  /**
   * 设置当前环境
   */
  async setEnvironment(environment: string): Promise<void> {
    if (!this.options.environments.includes(environment)) {
      throw new Error(`不支持的环境: ${environment}`)
    }

    const oldEnvironment = this.currentEnvironment
    this.currentEnvironment = environment

    // 设置环境变量
    process.env.NODE_ENV = environment

    this.emit('environmentChanged', {
      from: oldEnvironment,
      to: environment,
    })

    this.logger?.info(`环境已切换: ${oldEnvironment} -> ${environment}`)
  }

  /**
   * 获取所有可用环境
   */
  getAvailableEnvironments(): string[] {
    return [...this.options.environments]
  }

  /**
   * 获取环境配置
   */
  getEnvironmentConfig(environment: string): EnvironmentConfig | null {
    return this.environmentConfigs.get(environment) || null
  }

  /**
   * 设置环境配置
   */
  setEnvironmentConfig(environment: string, config: EnvironmentConfig): void {
    if (!this.options.environments.includes(environment)) {
      throw new Error(`不支持的环境: ${environment}`)
    }

    this.environmentConfigs.set(environment, config)
    this.emit('environmentConfigChanged', { environment, config })
  }

  /**
   * 获取当前环境配置
   */
  getCurrentEnvironmentConfig(): EnvironmentConfig | null {
    return this.getEnvironmentConfig(this.currentEnvironment)
  }

  /**
   * 获取环境变量
   */
  getEnvironmentVariables(environment?: string): Record<string, any> {
    const env = environment || this.currentEnvironment
    const config = this.getEnvironmentConfig(env)

    if (!config) {
      return {}
    }

    let variables = { ...config.variables }

    // 如果有继承关系，合并父环境的变量
    if (config.extends) {
      const parentConfig = this.getEnvironmentConfig(config.extends)
      if (parentConfig) {
        variables = { ...parentConfig.variables, ...variables }
      }
    }

    return variables
  }

  /**
   * 设置环境变量
   */
  setEnvironmentVariable(key: string, value: any, environment?: string): void {
    const env = environment || this.currentEnvironment
    const config = this.getEnvironmentConfig(env) || {
      name: env,
      variables: {},
    }

    if (!config.variables) {
      config.variables = {}
    }

    config.variables[key] = value
    this.setEnvironmentConfig(env, config)
  }

  /**
   * 删除环境变量
   */
  deleteEnvironmentVariable(key: string, environment?: string): void {
    const env = environment || this.currentEnvironment
    const config = this.getEnvironmentConfig(env)

    if (config && config.variables) {
      delete config.variables[key]
      this.setEnvironmentConfig(env, config)
    }
  }

  /**
   * 检查环境是否存在
   */
  hasEnvironment(environment: string): boolean {
    return this.options.environments.includes(environment)
  }

  /**
   * 添加新环境
   */
  addEnvironment(environment: string, config?: Partial<EnvironmentConfig>): void {
    if (this.hasEnvironment(environment)) {
      throw new Error(`环境已存在: ${environment}`)
    }

    this.options.environments.push(environment)

    const environmentConfig: EnvironmentConfig = {
      name: environment,
      description: config?.description,
      variables: config?.variables || {},
      extends: config?.extends,
      active: config?.active !== false,
    }

    this.setEnvironmentConfig(environment, environmentConfig)
    this.emit('environmentAdded', { environment, config: environmentConfig })
  }

  /**
   * 删除环境
   */
  removeEnvironment(environment: string): void {
    if (!this.hasEnvironment(environment)) {
      throw new Error(`环境不存在: ${environment}`)
    }

    if (environment === this.currentEnvironment) {
      throw new Error('不能删除当前环境')
    }

    const index = this.options.environments.indexOf(environment)
    if (index > -1) {
      this.options.environments.splice(index, 1)
    }

    this.environmentConfigs.delete(environment)
    this.emit('environmentRemoved', { environment })
  }

  /**
   * 复制环境配置
   */
  cloneEnvironment(
    sourceEnvironment: string,
    targetEnvironment: string,
    overrides?: Partial<EnvironmentConfig>,
  ): void {
    if (!this.hasEnvironment(sourceEnvironment)) {
      throw new Error(`源环境不存在: ${sourceEnvironment}`)
    }

    if (this.hasEnvironment(targetEnvironment)) {
      throw new Error(`目标环境已存在: ${targetEnvironment}`)
    }

    const sourceConfig = this.getEnvironmentConfig(sourceEnvironment)
    if (!sourceConfig) {
      throw new Error(`源环境配置不存在: ${sourceEnvironment}`)
    }

    const targetConfig: EnvironmentConfig = {
      ...sourceConfig,
      name: targetEnvironment,
      ...overrides,
    }

    this.addEnvironment(targetEnvironment, targetConfig)
  }

  /**
   * 获取环境统计信息
   */
  getEnvironmentStats(): {
    total: number
    current: string
    available: string[]
    configured: string[]
  } {
    return {
      total: this.options.environments.length,
      current: this.currentEnvironment,
      available: this.getAvailableEnvironments(),
      configured: Array.from(this.environmentConfigs.keys()),
    }
  }

  /**
   * 验证环境配置
   */
  validateEnvironmentConfig(config: EnvironmentConfig): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (!config.name) {
      errors.push('环境名称不能为空')
    }

    if (config.extends && !this.hasEnvironment(config.extends)) {
      errors.push(`继承的环境不存在: ${config.extends}`)
    }

    // 检查循环继承
    if (config.extends && this.hasCircularInheritance(config.name, config.extends)) {
      errors.push('检测到循环继承')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * 导出环境配置
   */
  exportEnvironmentConfig(environment?: string): Record<string, any> {
    if (environment) {
      const config = this.getEnvironmentConfig(environment)
      return config ? { [environment]: config } : {}
    }

    const allConfigs: Record<string, any> = {}
    for (const [env, config] of this.environmentConfigs.entries()) {
      allConfigs[env] = config
    }

    return allConfigs
  }

  /**
   * 导入环境配置
   */
  importEnvironmentConfig(configs: Record<string, EnvironmentConfig>): void {
    for (const [environment, config] of Object.entries(configs)) {
      if (this.hasEnvironment(environment)) {
        this.setEnvironmentConfig(environment, config)
      }
      else {
        this.addEnvironment(environment, config)
      }
    }

    this.emit('environmentConfigImported', configs)
  }

  // 私有方法

  private initializeDefaultEnvironments(): void {
    const defaultConfigs: Record<string, EnvironmentConfig> = {
      development: {
        name: 'development',
        description: '开发环境',
        variables: {
          NODE_ENV: 'development',
          DEBUG: true,
          API_URL: 'http://localhost:3000/api',
        },
      },
      production: {
        name: 'production',
        description: '生产环境',
        variables: {
          NODE_ENV: 'production',
          DEBUG: false,
          API_URL: 'https://api.example.com',
        },
      },
      staging: {
        name: 'staging',
        description: '预发布环境',
        variables: {
          NODE_ENV: 'staging',
          DEBUG: false,
          API_URL: 'https://staging-api.example.com',
        },
      },
      test: {
        name: 'test',
        description: '测试环境',
        variables: {
          NODE_ENV: 'test',
          DEBUG: true,
          API_URL: 'http://localhost:3001/api',
        },
      },
    }

    for (const environment of this.options.environments) {
      if (defaultConfigs[environment]) {
        this.environmentConfigs.set(environment, defaultConfigs[environment])
      }
    }
  }

  private hasCircularInheritance(
    environment: string,
    parentEnvironment: string,
    visited = new Set<string>(),
  ): boolean {
    if (visited.has(parentEnvironment)) {
      return true
    }

    visited.add(parentEnvironment)

    const parentConfig = this.getEnvironmentConfig(parentEnvironment)
    if (parentConfig && parentConfig.extends) {
      return this.hasCircularInheritance(environment, parentConfig.extends, visited)
    }

    return false
  }

  /**
   * 创建环境管理器实例
   */
  static create(options: EnvironmentManagerOptions): EnvironmentManager {
    return new EnvironmentManager(options)
  }
}

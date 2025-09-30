/**
 * 服务器配置管理
 * 负责读取和保存服务器配置
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { homedir } from 'os'
import { logger } from '../utils/logger.js'

/**
 * 服务器配置接口
 */
export interface ServerConfig {
  /** 默认端口 */
  defaultPort: number
  /** 默认主机 */
  defaultHost: string
  /** 是否自动打开浏览器 */
  autoOpen: boolean
  /** 是否启用调试模式 */
  debug: boolean
}

/**
 * 运行时配置（包含当前实际使用的配置）
 */
export interface RuntimeConfig extends ServerConfig {
  /** 当前实际使用的端口 */
  currentPort: number
  /** 当前实际使用的主机 */
  currentHost: string
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: ServerConfig = {
  defaultPort: 3000,
  defaultHost: 'localhost',
  autoOpen: true,
  debug: false
}

/**
 * 配置文件路径
 */
const CONFIG_DIR = resolve(homedir(), '.ldesign-cli')
const CONFIG_FILE = resolve(CONFIG_DIR, 'config.json')

/**
 * 配置管理器类
 */
class ConfigManager {
  private config: ServerConfig
  private runtimeConfig: RuntimeConfig | null = null
  private configLogger = logger.withPrefix('Config')

  constructor() {
    this.config = this.loadConfig()
  }

  /**
   * 加载配置
   */
  private loadConfig(): ServerConfig {
    try {
      if (existsSync(CONFIG_FILE)) {
        const content = readFileSync(CONFIG_FILE, 'utf-8')
        const savedConfig = JSON.parse(content)
        this.configLogger.info('已加载配置文件')
        return { ...DEFAULT_CONFIG, ...savedConfig }
      }
    } catch (error) {
      this.configLogger.warn('加载配置文件失败，使用默认配置:', error)
    }
    return { ...DEFAULT_CONFIG }
  }

  /**
   * 保存配置
   */
  saveConfig(config: Partial<ServerConfig>): void {
    try {
      // 确保配置目录存在
      if (!existsSync(CONFIG_DIR)) {
        mkdirSync(CONFIG_DIR, { recursive: true })
      }

      // 合并配置
      this.config = { ...this.config, ...config }

      // 保存到文件
      writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2), 'utf-8')
      this.configLogger.success('配置已保存')
    } catch (error) {
      this.configLogger.error('保存配置失败:', error)
      throw error
    }
  }

  /**
   * 获取配置
   */
  getConfig(): ServerConfig {
    return { ...this.config }
  }

  /**
   * 设置运行时配置
   */
  setRuntimeConfig(port: number, host: string): void {
    this.runtimeConfig = {
      ...this.config,
      currentPort: port,
      currentHost: host
    }
  }

  /**
   * 获取运行时配置
   */
  getRuntimeConfig(): RuntimeConfig | null {
    return this.runtimeConfig ? { ...this.runtimeConfig } : null
  }

  /**
   * 重置配置为默认值
   */
  resetConfig(): void {
    this.config = { ...DEFAULT_CONFIG }
    this.saveConfig(this.config)
  }
}

/**
 * 全局配置管理器实例
 */
export const configManager = new ConfigManager()


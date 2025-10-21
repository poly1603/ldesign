/**
 * Config 命令实现
 * 
 * 配置管理命令（为后续 config 包预留）
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { Logger } from '../../utils/logger'
import { FileSystem } from '../../utils/file-system'
import { PathUtils } from '../../utils/path-utils'
import { validateConfig } from '../../utils/config'
import { ConfigManager } from '../../core/ConfigManager'
import type { CliCommandDefinition, CliContext } from '../../types'
import { DEFAULT_CONFIG_FILES } from '../../constants'

/**
 * Config 命令类
 */
export class ConfigCommand implements CliCommandDefinition {
  name = 'config'
  aliases = ['cfg']
  description = '配置管理工具'
  usage = 'launcher config <action> [options]'

  options = [
    {
      name: 'global',
      alias: 'g',
      description: '操作全局配置',
      type: 'boolean' as const,
      default: false
    },
    {
      name: 'json',
      alias: 'j',
      description: '以 JSON 格式输出',
      type: 'boolean' as const,
      default: false
    },
    {
      name: 'pretty',
      alias: 'p',
      description: '美化输出格式',
      type: 'boolean' as const,
      default: true
    }
  ]

  examples = [
    {
      description: '列出所有配置项',
      command: 'launcher config list'
    },
    {
      description: '获取指定配置项的值',
      command: 'launcher config get server.port'
    },
    {
      description: '设置指定配置项的值',
      command: 'launcher config set server.port 8080'
    },
    {
      description: '删除指定配置项',
      command: 'launcher config delete server.port'
    },
    {
      description: '验证配置文件',
      command: 'launcher config validate'
    },
    {
      description: '初始化配置文件',
      command: 'launcher config init'
    }
  ]

  /**
   * 验证命令参数
   * 
   * @param context - CLI 上下文
   * @returns 验证结果
   */
  validate(context: CliContext): boolean | string {
    const { args } = context

    if (args.length === 0) {
      return '请指定操作: list, get, set, delete, validate, init'
    }

    const action = args[0]
    const validActions = ['list', 'get', 'set', 'delete', 'validate', 'init']

    if (!validActions.includes(action)) {
      return `无效的操作: ${action}。有效操作: ${validActions.join(', ')}`
    }

    // 验证特定操作的参数
    switch (action) {
      case 'get':
        if (args.length < 2) {
          return 'get 操作需要指定配置项名称'
        }
        break

      case 'set':
        if (args.length < 3) {
          return 'set 操作需要指定配置项名称和值'
        }
        break

      case 'delete':
        if (args.length < 2) {
          return 'delete 操作需要指定配置项名称'
        }
        break
    }

    return true
  }

  /**
   * 执行命令
   * 
   * @param context - CLI 上下文
   */
  async handler(context: CliContext): Promise<void> {
    const logger = new Logger('config', {
      level: context.options.debug ? 'debug' : 'info',
      colors: context.terminal.supportsColor
    })

    try {
      const action = context.args[0]

      // 创建配置管理器
      const configManager = new ConfigManager({
        cwd: context.cwd,
        watch: false
      })

      switch (action) {
        case 'list':
          await this.handleList(configManager, context, logger)
          break

        case 'get':
          await this.handleGet(configManager, context, logger)
          break

        case 'set':
          await this.handleSet(configManager, context, logger)
          break

        case 'delete':
          await this.handleDelete(configManager, context, logger)
          break

        case 'validate':
          await this.handleValidate(configManager, context, logger)
          break

        case 'init':
          await this.handleInit(configManager, context, logger)
          break

        default:
          logger.error(`未知操作: ${action}`)
          process.exit(1)
      }

    } catch (error) {
      logger.error('配置操作失败', { error: (error as Error).message })

      if (context.options.debug) {
        console.error((error as Error).stack)
      }

      process.exit(1)
    }
  }

  /**
   * 处理 list 操作
   */
  private async handleList(
    configManager: ConfigManager,
    context: CliContext,
    logger: Logger
  ): Promise<void> {
    try {
      // 尝试加载配置
      await configManager.loadConfig(context.configFile)
      const config = configManager.getConfig()

      if (context.options.json) {
        console.log(JSON.stringify(config, null, context.options.pretty ? 2 : 0))
      } else {
        logger.info('当前配置:')
        this.printConfig(config, '', logger)
      }

    } catch (error) {
      logger.warn('无法加载配置文件，显示默认配置')
      const config = configManager.getConfig()

      if (context.options.json) {
        console.log(JSON.stringify(config, null, context.options.pretty ? 2 : 0))
      } else {
        logger.info('默认配置:')
        this.printConfig(config, '', logger)
      }
    }
  }

  /**
   * 处理 get 操作
   */
  private async handleGet(
    configManager: ConfigManager,
    context: CliContext,
    logger: Logger
  ): Promise<void> {
    const key = context.args[1]

    try {
      await configManager.loadConfig(context.configFile)
      const config = configManager.getConfig()
      const value = this.getNestedValue(config, key)

      if (value === undefined) {
        logger.warn(`配置项 "${key}" 不存在`)
        process.exit(1)
      }

      if (context.options.json) {
        console.log(JSON.stringify(value, null, context.options.pretty ? 2 : 0))
      } else {
        logger.info(`${key} = ${JSON.stringify(value)}`)
      }

    } catch (error) {
      logger.error(`获取配置项失败: ${(error as Error).message}`)
      process.exit(1)
    }
  }

  /**
   * 处理 set 操作
   */
  private async handleSet(
    configManager: ConfigManager,
    context: CliContext,
    logger: Logger
  ): Promise<void> {
    const key = context.args[1]
    const value = context.args[2]

    try {
      // 尝试解析值
      let parsedValue: any
      try {
        parsedValue = JSON.parse(value)
      } catch {
        parsedValue = value
      }

      // 加载现有配置
      try {
        await configManager.loadConfig(context.configFile)
      } catch {
        // 如果加载失败，使用默认配置
        logger.info('使用默认配置')
      }

      // 更新配置
      const updates = this.setNestedValue({}, key, parsedValue)
      configManager.updateConfig(updates)

      // 保存配置
      const configFile = context.configFile || await this.findOrCreateConfigFile(context.cwd)
      const updatedConfig = configManager.getConfig()
      await configManager.save(configFile, updatedConfig)

      logger.success(`配置项 "${key}" 已设置为 ${JSON.stringify(parsedValue)}`)

    } catch (error) {
      logger.error(`设置配置项失败: ${(error as Error).message}`)
      process.exit(1)
    }
  }

  /**
   * 处理 delete 操作
   */
  private async handleDelete(
    configManager: ConfigManager,
    context: CliContext,
    logger: Logger
  ): Promise<void> {
    const key = context.args[1]

    try {
      await configManager.loadConfig(context.configFile)
      const config = configManager.getConfig()

      if (this.getNestedValue(config, key) === undefined) {
        logger.warn(`配置项 "${key}" 不存在`)
        return
      }

      // 删除配置项
      const updates = this.deleteNestedValue({}, key)
      configManager.updateConfig(updates)

      // 保存配置
      const configFile = context.configFile || await this.findOrCreateConfigFile(context.cwd)
      const updatedConfig = configManager.getConfig()
      await configManager.save(configFile, updatedConfig)

      logger.success(`配置项 "${key}" 已删除`)

    } catch (error) {
      logger.error(`删除配置项失败: ${(error as Error).message}`)
      process.exit(1)
    }
  }

  /**
   * 处理 validate 操作
   */
  private async handleValidate(
    configManager: ConfigManager,
    context: CliContext,
    logger: Logger
  ): Promise<void> {
    try {
      const configFile = context.configFile || await this.findConfigFile(context.cwd)

      if (!configFile) {
        logger.error('未找到配置文件')
        process.exit(1)
      }

      await configManager.loadConfig(configFile)
      const config = configManager.getConfig()
      const validation = validateConfig(config)

      if (validation.valid) {
        logger.success('配置文件验证通过')
      } else {
        logger.error('配置文件验证失败:')
        validation.errors.forEach(error => logger.error(`  - ${error}`))
        process.exit(1)
      }

      if (validation.warnings.length > 0) {
        logger.warn('配置警告:')
        validation.warnings.forEach(warning => logger.warn(`  - ${warning}`))
      }

    } catch (error) {
      logger.error(`验证配置文件失败: ${(error as Error).message}`)
      process.exit(1)
    }
  }

  /**
   * 处理 init 操作
   */
  private async handleInit(
    configManager: ConfigManager,
    context: CliContext,
    logger: Logger
  ): Promise<void> {
    try {
      const configFile = PathUtils.join(context.cwd, 'launcher.config.ts')

      if (await FileSystem.exists(configFile)) {
        logger.warn('配置文件已存在', { path: configFile })
        return
      }

      const defaultConfig = configManager.getConfig()

      // 生成配置文件内容
      const configContent = this.generateConfigFile(defaultConfig)

      // 写入配置文件
      await FileSystem.writeFile(configFile, configContent)

      logger.success('配置文件已创建', { path: configFile })

    } catch (error) {
      logger.error(`初始化配置文件失败: ${(error as Error).message}`)
      process.exit(1)
    }
  }

  /**
   * 打印配置对象
   */
  private printConfig(obj: any, prefix: string, logger: Logger): void {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        logger.info(`${fullKey}:`)
        this.printConfig(value, fullKey, logger)
      } else {
        logger.info(`  ${fullKey} = ${JSON.stringify(value)}`)
      }
    }
  }

  /**
   * 获取嵌套值
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  /**
   * 设置嵌套值
   */
  private setNestedValue(obj: any, path: string, value: any): any {
    const keys = path.split('.')
    const result = { ...obj }
    let current = result

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }

    current[keys[keys.length - 1]] = value
    return result
  }

  /**
   * 删除嵌套值
   */
  private deleteNestedValue(obj: any, path: string): any {
    const keys = path.split('.')
    const result = { ...obj }
    let current = result

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current)) {
        return result
      }
      current = current[key]
    }

    delete current[keys[keys.length - 1]]
    return result
  }

  /**
   * 查找配置文件
   */
  private async findConfigFile(cwd: string): Promise<string | null> {
    for (const fileName of DEFAULT_CONFIG_FILES) {
      const filePath = PathUtils.join(cwd, fileName)
      if (await FileSystem.exists(filePath)) {
        return filePath
      }
    }
    return null
  }

  /**
   * 查找或创建配置文件
   */
  private async findOrCreateConfigFile(cwd: string): Promise<string> {
    const existing = await this.findConfigFile(cwd)
    if (existing) {
      return existing
    }

    return PathUtils.join(cwd, 'launcher.config.ts')
  }

  /**
   * 生成配置文件内容
   */
  private generateConfigFile(config: any): string {
    return `/**
 * Launcher 配置文件
 * 
 * @see https://github.com/ldesign/launcher
 */

import type { ViteLauncherConfig } from '@ldesign/launcher'

export default {
  // 服务器配置
  server: {
    host: '${config.server?.host || 'localhost'}',
    port: ${config.server?.port || 3000},
    open: ${config.server?.open || false},
    https: ${config.server?.https || false},
    cors: ${config.server?.cors !== false}
  },
  
  // 构建配置
  build: {
    outDir: '${config.build?.outDir || 'dist'}',
    sourcemap: ${config.build?.sourcemap || false},
    minify: ${config.build?.minify !== false},
    target: '${config.build?.target || 'modules'}'
  },
  
  // 预览配置
  preview: {
    host: '${config.preview?.host || 'localhost'}',
    port: ${config.preview?.port || 4173},
    open: ${config.preview?.open || false}
  },
  
  // Launcher 特有配置
  launcher: {
    logLevel: '${config.launcher?.logLevel || 'info'}',
    autoRestart: ${config.launcher?.autoRestart !== false},
    debug: ${config.launcher?.debug || false}
  }
} satisfies ViteLauncherConfig
`
  }
}

/**
 * 配置管理器
 * 管理用户配置和设置
 */

import Conf from 'conf'

/**
 * 配置接口
 */
export interface GitConfig {
  // 用户信息
  user: {
    name?: string
    email?: string
  }
  // 命令别名
  aliases: Record<string, string>
  // 默认值
  defaults: {
    branch?: string
    remote?: string
    editor?: string
  }
  // 工作流配置
  workflow: {
    type?: 'gitflow' | 'github-flow'
    branches?: {
      main?: string
      develop?: string
      feature?: string
      release?: string
      hotfix?: string
    }
  }
  // UI 配置
  ui: {
    theme?: 'default' | 'dark' | 'light'
    colors?: boolean
    animations?: boolean
    icons?: boolean
  }
  // 功能开关
  features: {
    autoCorrect?: boolean
    suggestions?: boolean
    autoUpdate?: boolean
    analytics?: boolean
  }
}

/**
 * 配置管理器类
 */
export class ConfigManager {
  private config: any
  private defaultConfig: GitConfig = {
    user: {},
    aliases: {
      'st': 'status',
      'ci': 'commit',
      'co': 'checkout',
      'br': 'branch',
      'ps': 'push',
      'pl': 'pull',
      'lg': 'log --oneline --graph',
      'last': 'log -1',
      'unstage': 'reset HEAD --',
      'amend': 'commit --amend',
      'undo': 'reset --soft HEAD~1'
    },
    defaults: {
      branch: 'main',
      remote: 'origin',
      editor: 'vim'
    },
    workflow: {
      type: 'gitflow',
      branches: {
        main: 'main',
        develop: 'develop',
        feature: 'feature/',
        release: 'release/',
        hotfix: 'hotfix/'
      }
    },
    ui: {
      theme: 'default',
      colors: true,
      animations: true,
      icons: true
    },
    features: {
      autoCorrect: true,
      suggestions: true,
      autoUpdate: true,
      analytics: false
    }
  }

  constructor() {
    this.config = new Conf({
      projectName: 'ldesign-git',
      projectVersion: '2.0.0',
      defaults: this.defaultConfig,
      schema: {
        user: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' }
          }
        },
        aliases: {
          type: 'object',
          additionalProperties: { type: 'string' }
        },
        defaults: {
          type: 'object',
          properties: {
            branch: { type: 'string' },
            remote: { type: 'string' },
            editor: { type: 'string' }
          }
        },
        workflow: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['gitflow', 'github-flow'] },
            branches: {
              type: 'object',
              properties: {
                main: { type: 'string' },
                develop: { type: 'string' },
                feature: { type: 'string' },
                release: { type: 'string' },
                hotfix: { type: 'string' }
              }
            }
          }
        },
        ui: {
          type: 'object',
          properties: {
            theme: { type: 'string', enum: ['default', 'dark', 'light'] },
            colors: { type: 'boolean' },
            animations: { type: 'boolean' },
            icons: { type: 'boolean' }
          }
        },
        features: {
          type: 'object',
          properties: {
            autoCorrect: { type: 'boolean' },
            suggestions: { type: 'boolean' },
            autoUpdate: { type: 'boolean' },
            analytics: { type: 'boolean' }
          }
        }
      }
    })
  }

  /**
   * 获取配置值
   */
  get(key: string): any {
    return this.config.get(key as keyof GitConfig)
  }

  /**
   * 设置配置值
   */
  set(key: string, value: any): void {
    this.config.set(key as keyof GitConfig, value)
  }

  /**
   * 获取所有配置
   */
  getAll(): GitConfig {
    return this.config.store
  }

  /**
   * 重置配置
   */
  reset(): void {
    this.config.clear()
    this.config.store = this.defaultConfig
  }

  /**
   * 获取配置文件路径
   */
  getConfigPath(): string {
    return this.config.path
  }

  /**
   * 获取别名
   */
  getAliases(): Record<string, string> {
    return this.config.get('aliases') || {}
  }

  /**
   * 设置别名
   */
  setAlias(name: string, command: string): void {
    const aliases = this.getAliases()
    aliases[name] = command
    this.config.set('aliases', aliases)
  }

  /**
   * 删除别名
   */
  removeAlias(name: string): void {
    const aliases = this.getAliases()
    delete aliases[name]
    this.config.set('aliases', aliases)
  }

  /**
   * 获取用户信息
   */
  getUser(): { name?: string; email?: string } {
    return this.config.get('user') || {}
  }

  /**
   * 设置用户信息
   */
  setUser(name?: string, email?: string): void {
    this.config.set('user', { name, email })
  }

  /**
   * 获取工作流配置
   */
  getWorkflow(): GitConfig['workflow'] {
    return this.config.get('workflow') || this.defaultConfig.workflow
  }

  /**
   * 设置工作流配置
   */
  setWorkflow(workflow: Partial<GitConfig['workflow']>): void {
    const current = this.getWorkflow()
    this.config.set('workflow', { ...current, ...workflow })
  }

  /**
   * 获取 UI 配置
   */
  getUI(): GitConfig['ui'] {
    return this.config.get('ui') || this.defaultConfig.ui
  }

  /**
   * 设置 UI 配置
   */
  setUI(ui: Partial<GitConfig['ui']>): void {
    const current = this.getUI()
    this.config.set('ui', { ...current, ...ui })
  }

  /**
   * 获取功能配置
   */
  getFeatures(): GitConfig['features'] {
    return this.config.get('features') || this.defaultConfig.features
  }

  /**
   * 设置功能配置
   */
  setFeatures(features: Partial<GitConfig['features']>): void {
    const current = this.getFeatures()
    this.config.set('features', { ...current, ...features })
  }

  /**
   * 导出配置
   */
  export(): string {
    return JSON.stringify(this.config.store, null, 2)
  }

  /**
   * 导入配置
   */
  import(configJson: string): void {
    try {
      const config = JSON.parse(configJson)
      this.config.store = config
    } catch (error) {
      throw new Error('Invalid configuration JSON')
    }
  }

  /**
   * 加载配置
   */
  load(): GitConfig {
    return this.config.store
  }

  /**
   * 验证配置
   */
  validate(): boolean {
    // TODO: 实现配置验证逻辑
    return true
  }
}

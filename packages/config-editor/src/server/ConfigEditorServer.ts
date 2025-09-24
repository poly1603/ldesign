/**
 * 配置编辑器服务器类
 * 
 * 提供配置文件的 CRUD API 接口
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { Router } from 'express'
import { ConfigEditor } from '../core/ConfigEditor'
import type { ConfigFileType } from '../types/common'
import type { LauncherConfig, AppConfig, PackageJsonConfig } from '../types/config'
import { findConfigFiles } from '../utils/fileSystem'
import path from 'path'

/**
 * 配置编辑器服务器类
 */
export class ConfigEditorServer {
  private router: Router
  private configEditor: ConfigEditor
  private configFilePaths: Record<string, string | null> = {}

  constructor() {
    this.router = Router()
    this.configEditor = new ConfigEditor({
      cwd: process.cwd(),
      enableValidation: true,
      enableBackup: true
    })
  }

  /**
   * 初始化服务器
   */
  async initialize(): Promise<void> {
    // 查找配置文件
    this.configFilePaths = await findConfigFiles(process.cwd())

    // 初始化配置编辑器
    const result = await this.configEditor.initialize()
    if (!result.success) {
      throw new Error(`初始化配置编辑器失败: ${result.error}`)
    }

    // 设置路由
    this.setupRoutes()
  }

  /**
   * 获取路由器
   */
  getRouter(): Router {
    return this.router
  }

  /**
   * 设置路由
   */
  private setupRoutes(): void {
    // 获取所有配置
    this.router.get('/configs', this.getAllConfigs.bind(this))

    // 获取特定类型的配置
    this.router.get('/configs/:type', this.getConfig.bind(this))

    // 更新配置
    this.router.put('/configs/:type', this.updateConfig.bind(this))

    // 保存配置
    this.router.post('/configs/:type/save', this.saveConfig.bind(this))

    // 验证配置
    this.router.post('/configs/:type/validate', this.validateConfig.bind(this))

    // 重置配置
    this.router.post('/configs/:type/reset', this.resetConfig.bind(this))

    // 获取工作目录
    this.router.get('/workspace', this.getWorkspace.bind(this))
  }

  /**
   * 获取所有配置
   */
  private async getAllConfigs(_req: any, res: any): Promise<void> {
    try {
      const configs = {
        launcher: this.configEditor.getConfig<LauncherConfig>('launcher'),
        app: this.configEditor.getConfig<AppConfig>('app'),
        package: this.configEditor.getConfig<PackageJsonConfig>('package')
      }

      res.json({
        success: true,
        data: configs
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取配置失败'
      })
    }
  }

  /**
   * 获取特定类型的配置
   */
  private async getConfig(req: any, res: any): Promise<void> {
    try {
      const { type } = req.params as { type: ConfigFileType }

      if (!this.isValidConfigType(type)) {
        res.status(400).json({
          success: false,
          error: '无效的配置类型'
        })
        return
      }

      const config = this.configEditor.getConfig(type)

      res.json({
        success: true,
        data: config
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取配置失败'
      })
    }
  }

  /**
   * 更新配置
   */
  private async updateConfig(req: any, res: any): Promise<void> {
    try {
      const { type } = req.params as { type: ConfigFileType }
      const updates = req.body

      if (!this.isValidConfigType(type)) {
        res.status(400).json({
          success: false,
          error: '无效的配置类型'
        })
        return
      }

      const updatedConfig = this.configEditor.updateConfig(type, updates)

      res.json({
        success: true,
        data: updatedConfig
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '更新配置失败'
      })
    }
  }

  /**
   * 保存配置
   */
  private async saveConfig(req: any, res: any): Promise<void> {
    try {
      const { type } = req.params as { type: ConfigFileType }

      if (!this.isValidConfigType(type)) {
        res.status(400).json({
          success: false,
          error: '无效的配置类型'
        })
        return
      }

      const config = this.configEditor.getConfig(type)
      if (!config) {
        res.status(404).json({
          success: false,
          error: '配置不存在'
        })
        return
      }

      // 这里需要找到配置文件路径
      const filePath = this.getConfigFilePath(type)
      const result = await this.configEditor.saveConfig(type, filePath, config)

      res.json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '保存配置失败'
      })
    }
  }

  /**
   * 验证配置
   */
  private async validateConfig(req: any, res: any): Promise<void> {
    try {
      const { type } = req.params as { type: ConfigFileType }
      const config = req.body

      if (!this.isValidConfigType(type)) {
        res.status(400).json({
          success: false,
          error: '无效的配置类型'
        })
        return
      }

      const result = await this.configEditor.validateConfig(type, config)

      res.json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '验证配置失败'
      })
    }
  }

  /**
   * 重置配置
   */
  private async resetConfig(req: any, res: any): Promise<void> {
    try {
      const { type } = req.params as { type: ConfigFileType }

      if (!this.isValidConfigType(type)) {
        res.status(400).json({
          success: false,
          error: '无效的配置类型'
        })
        return
      }

      // 重新加载配置文件
      const filePath = this.getConfigFilePath(type)
      let result

      switch (type) {
        case 'launcher':
          result = await this.configEditor.parseLauncherConfig(filePath)
          break
        case 'app':
          result = await this.configEditor.parseAppConfig(filePath)
          break
        case 'package':
          result = await this.configEditor.parsePackageJson(filePath)
          break
        default:
          throw new Error('不支持的配置类型')
      }

      res.json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '重置配置失败'
      })
    }
  }

  /**
   * 获取工作目录
   */
  private async getWorkspace(_req: any, res: any): Promise<void> {
    try {
      res.json({
        success: true,
        data: {
          cwd: process.cwd(),
          files: {
            launcher: this.getConfigFilePath('launcher'),
            app: this.getConfigFilePath('app'),
            package: this.getConfigFilePath('package')
          }
        }
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取工作目录失败'
      })
    }
  }

  /**
   * 检查是否为有效的配置类型
   */
  private isValidConfigType(type: string): type is ConfigFileType {
    return ['launcher', 'app', 'package'].includes(type)
  }

  /**
   * 获取配置文件路径
   */
  private getConfigFilePath(type: ConfigFileType): string {
    const cachedPath = this.configFilePaths[type]
    if (cachedPath) {
      return cachedPath
    }

    // 如果缓存中没有，使用默认路径
    const fileNames = {
      launcher: 'launcher.config.ts',
      app: 'app.config.ts',
      package: 'package.json'
    }

    return path.join(process.cwd(), fileNames[type])
  }
}

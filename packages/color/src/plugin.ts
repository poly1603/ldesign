import { BasePlugin } from '@ldesign/engine'
import type { IEngine } from '@ldesign/engine'
import type { ColorPluginConfig } from './types'
import { Color } from './core/color'
import { Palette } from './core/palette'
import { ColorConverter } from './core/converter'

/**
 * 颜色插件
 */
class ColorPlugin extends BasePlugin {
  public readonly name = 'color'
  public readonly version = '1.0.0'
  public readonly description = 'LDesign颜色处理插件'

  private config: ColorPluginConfig = {}

  protected async onInstall(engine: IEngine, options: ColorPluginConfig = {}): Promise<void> {
    this.config = {
      defaultFormat: 'hex',
      validation: true,
      themes: [],
      constants: {},
      ...options
    }

    // 注册颜色相关的全局方法
    this.registerColorMethods(engine)
    
    // 注册事件监听器
    this.registerEventListeners(engine)
    
    this.logger.info('Color plugin installed successfully')
  }

  protected async onUninstall(engine: IEngine): Promise<void> {
    // 清理资源
    this.logger.info('Color plugin uninstalled')
  }

  /**
   * 注册颜色方法
   */
  private registerColorMethods(engine: IEngine): void {
    // 在引擎上注册颜色工厂方法
    const colorAPI = {
      // 创建颜色实例
      create: (input: any) => new Color(input),
      
      // 颜色转换器
      converter: ColorConverter,
      
      // 调色板生成器
      palette: Palette,
      
      // 预设主题
      themes: this.config.themes || [],
      
      // 颜色常量
      constants: this.config.constants || {},
      
      // 工具方法
      utils: {
        isValid: Color.isValid,
        random: Color.random,
        fromHex: Color.fromHex,
        fromRgb: Color.fromRgb,
        fromHsl: Color.fromHsl,
        fromHsv: Color.fromHsv
      }
    }

    // 将API注册到引擎事件总线
    engine.eventBus.emit('plugin:api:register', {
      plugin: this.name,
      api: colorAPI
    })
  }

  /**
   * 注册事件监听器
   */
  private registerEventListeners(engine: IEngine): void {
    // 监听主题切换事件
    engine.eventBus.on('theme:change', (themeName: string) => {
      this.handleThemeChange(themeName)
    })

    // 监听颜色验证请求
    engine.eventBus.on('color:validate', (color: any) => {
      const isValid = Color.isValid(color)
      engine.eventBus.emit('color:validation:result', { color, isValid })
    })
  }

  /**
   * 处理主题切换
   */
  private handleThemeChange(themeName: string): void {
    const theme = this.config.themes?.find(t => t.name === themeName)
    if (theme) {
      this.getEngine().eventBus.emit('color:theme:applied', theme)
      this.logger.info(`Applied color theme: ${themeName}`)
    } else {
      this.logger.warn(`Color theme not found: ${themeName}`)
    }
  }

  /**
   * 获取颜色API
   */
  getColorAPI() {
    return {
      Color,
      ColorConverter,
      Palette,
      themes: this.config.themes,
      constants: this.config.constants
    }
  }

  /**
   * 添加主题
   */
  addTheme(theme: any): void {
    if (!this.config.themes) {
      this.config.themes = []
    }
    this.config.themes.push(theme)
    this.getEngine().eventBus.emit('color:theme:added', theme)
  }

  /**
   * 移除主题
   */
  removeTheme(themeName: string): void {
    if (this.config.themes) {
      const index = this.config.themes.findIndex(t => t.name === themeName)
      if (index !== -1) {
        const removed = this.config.themes.splice(index, 1)[0]
        this.getEngine().eventBus.emit('color:theme:removed', removed)
      }
    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): ColorPluginConfig {
    return { ...this.config }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<ColorPluginConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.getEngine().eventBus.emit('color:config:updated', this.config)
  }
}

export default new ColorPlugin()
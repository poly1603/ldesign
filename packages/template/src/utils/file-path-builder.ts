/**
 * 文件路径构建器
 * 提供配置化的模板文件路径构建功能
 */

import type { FileNamingConfig } from '../types/config'

/**
 * 文件路径构建器类
 */
export class FilePathBuilder {
  private config: FileNamingConfig

  constructor(config: FileNamingConfig) {
    this.config = config
  }

  /**
   * 根据配置文件路径构建组件文件路径
   */
  buildComponentPath(configPath: string): string {
    const basePath = this.getBasePath(configPath)
    return `${basePath}/${this.config.componentFile}`
  }

  /**
   * 根据配置文件路径构建样式文件路径
   */
  buildStylePath(configPath: string): string | null {
    const basePath = this.getBasePath(configPath)

    // 尝试查找匹配的样式文件
    const stylePattern = this.config.styleFile
    const extensions = this.config.allowedStyleExtensions

    // 如果样式文件配置包含扩展名模式
    if (stylePattern.includes('{') && stylePattern.includes('}')) {
      // 提取基础文件名
      const baseFileName = stylePattern.replace(/\{.*\}/, '')

      // 尝试每个允许的扩展名
      for (const ext of extensions) {
        const stylePath = `${basePath}/${baseFileName}${ext}`
        // 这里应该检查文件是否存在，但在构建阶段我们返回第一个匹配的模式
        return stylePath
      }
    }

    // 如果是固定文件名
    return `${basePath}/${stylePattern}`
  }

  /**
   * 根据配置文件路径构建预览图路径
   */
  buildPreviewPath(configPath: string): string | null {
    const basePath = this.getBasePath(configPath)

    const previewPattern = this.config.previewFile

    // 如果预览文件配置包含扩展名模式
    if (previewPattern.includes('{') && previewPattern.includes('}')) {
      // 提取基础文件名
      const baseFileName = previewPattern.replace(/\{.*\}/, '')

      // 默认使用 .png 扩展名
      return `${basePath}/${baseFileName}.png`
    }

    // 如果是固定文件名
    return `${basePath}/${previewPattern}`
  }

  /**
   * 验证配置文件路径是否符合命名约定
   */
  validateConfigPath(configPath: string): boolean {
    const configPattern = this.config.configFile
    const extensions = this.config.allowedConfigExtensions

    // 如果配置文件模式包含扩展名模式
    if (configPattern.includes('{') && configPattern.includes('}')) {
      const baseFileName = configPattern.replace(/\{.*\}/, '')

      // 检查是否匹配任何允许的扩展名
      return extensions.some((ext) => {
        const expectedPath = baseFileName + ext
        return configPath.endsWith(expectedPath)
      })
    }

    // 如果是固定文件名
    return configPath.endsWith(configPattern)
  }

  /**
   * 从配置文件路径提取基础路径
   */
  private getBasePath(configPath: string): string {
    const configPattern = this.config.configFile
    const extensions = this.config.allowedConfigExtensions

    // 如果配置文件模式包含扩展名模式
    if (configPattern.includes('{') && configPattern.includes('}')) {
      const baseFileName = configPattern.replace(/\{.*\}/, '')

      // 尝试每个允许的扩展名
      for (const ext of extensions) {
        const fullConfigName = baseFileName + ext
        if (configPath.endsWith(fullConfigName)) {
          return configPath.slice(0, -fullConfigName.length)
        }
      }
    }

    // 如果是固定文件名
    if (configPath.endsWith(configPattern)) {
      return configPath.slice(0, -configPattern.length)
    }

    // 降级处理：使用正则表达式移除配置文件名
    return configPath.replace(/\/config\.(js|ts)$/, '')
  }

  /**
   * 构建完整的模板文件路径集合
   */
  buildTemplatePaths(configPath: string): {
    basePath: string
    componentPath: string
    stylePath: string | null
    previewPath: string | null
    configPath: string
  } {
    const basePath = this.getBasePath(configPath)

    return {
      basePath,
      componentPath: this.buildComponentPath(configPath),
      stylePath: this.buildStylePath(configPath),
      previewPath: this.buildPreviewPath(configPath),
      configPath,
    }
  }

  /**
   * 更新文件命名配置
   */
  updateConfig(newConfig: Partial<FileNamingConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * 获取当前配置
   */
  getConfig(): FileNamingConfig {
    return { ...this.config }
  }
}

/**
 * 创建文件路径构建器实例
 */
export function createFilePathBuilder(config: FileNamingConfig): FilePathBuilder {
  return new FilePathBuilder(config)
}

/**
 * 默认文件路径构建器（使用默认配置）
 */
export const defaultFilePathBuilder = new FilePathBuilder({
  componentFile: 'index.vue',
  configFile: 'config.{js,ts}',
  styleFile: 'style.{css,less,scss}',
  previewFile: 'preview.{png,jpg,jpeg,webp}',
  allowedConfigExtensions: ['.js', '.ts'],
  allowedStyleExtensions: ['.css', '.less', '.scss'],
})

/**
 * 工具函数：快速构建模板路径
 */
export function buildTemplatePaths(
  configPath: string,
  config?: FileNamingConfig,
): ReturnType<FilePathBuilder['buildTemplatePaths']> {
  const builder = config ? createFilePathBuilder(config) : defaultFilePathBuilder
  return builder.buildTemplatePaths(configPath)
}

/**
 * 工具函数：验证配置文件路径
 */
export function validateConfigPath(
  configPath: string,
  config?: FileNamingConfig,
): boolean {
  const builder = config ? createFilePathBuilder(config) : defaultFilePathBuilder
  return builder.validateConfigPath(configPath)
}

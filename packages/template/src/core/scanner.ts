/**
 * 模板扫描器 - 重构版本
 *
 * 设计原则：
 * 1. 简洁可靠 - 专注于核心功能，避免过度复杂化
 * 2. Vite兼容 - 使用静态路径，确保与Vite完美兼容
 * 3. 双模式支持 - 同时支持Built和Source模式
 * 4. 调试友好 - 提供详细的调试信息
 */

import type { TemplateConfig, TemplateMetadata, TemplateScanResult } from '../types'
import { parseTemplateInfo } from '../utils/path'

/**
 * 简洁的模板扫描器
 */
export class TemplateScanner {
  private cache = new Map<string, TemplateMetadata[]>()
  private lastScanTime = 0
  private readonly cacheExpiration = 5 * 60 * 1000 // 5分钟

  /**
   * 扫描模板
   */
  async scanTemplates(): Promise<TemplateScanResult> {
    const startTime = Date.now()

    console.log('🔍 开始模板扫描...')

    try {
      // 检查缓存
      const cacheKey = 'templates'
      if (this.isCacheValid(cacheKey)) {
        const cached = this.cache.get(cacheKey)
        if (cached) {
          console.log('✅ 使用缓存的模板数据')
          return {
            count: cached.length,
            templates: cached,
            duration: Date.now() - startTime,
            scanMode: 'parent',
            debug: {
              scannedPaths: [],
              foundConfigs: cached.length,
              foundComponents: cached.length,
            },
          }
        }
      }

      // 尝试扫描模板
      const result = await this.performScan()

      // 缓存结果
      if (result.templates.length > 0) {
        this.cache.set(cacheKey, result.templates)
        this.lastScanTime = Date.now()
      }

      return {
        ...result,
        duration: Date.now() - startTime,
      }
    } catch (error) {
      console.error('❌ 模板扫描失败:', error)
      return this.getFallbackResult(startTime)
    }
  }

  /**
   * 执行实际的扫描
   */
  private async performScan(): Promise<Omit<TemplateScanResult, 'duration'>> {
    // 尝试Built模式路径（从 es/core/scanner.js 访问 es/templates/）
    try {
      console.log('🔍 尝试Built模式路径: ../templates/**/config.{ts,js}')

      const builtConfigModules = import.meta.glob('../templates/**/config.{ts,js}', { eager: false })
      const builtComponentModules = import.meta.glob('../templates/**/index.{ts,tsx,vue,js}', { eager: false })

      console.log(`   找到配置文件: ${Object.keys(builtConfigModules).length} 个`)
      console.log(`   找到组件文件: ${Object.keys(builtComponentModules).length} 个`)

      if (Object.keys(builtConfigModules).length > 0) {
        const templates = await this.parseModules(builtConfigModules, builtComponentModules)
        console.log(`✅ Built模式成功，解析出 ${templates.length} 个模板`)

        return {
          count: templates.length,
          templates,
          scanMode: 'Built模式 (相对路径)',
          debug: {
            scannedPaths: Object.keys(builtConfigModules),
            foundConfigs: Object.keys(builtConfigModules).length,
            foundComponents: Object.keys(builtComponentModules).length,
          },
        }
      }
    } catch (error) {
      console.warn('⚠️ Built模式失败:', error)
    }

    // 尝试Source模式路径（从 src/core/scanner.ts 访问 src/templates/）
    try {
      console.log('🔍 尝试Source模式路径: ./templates/**/config.{ts,js}')

      const sourceConfigModules = import.meta.glob('./templates/**/config.{ts,js}', { eager: false })
      const sourceComponentModules = import.meta.glob('./templates/**/index.{ts,tsx,vue,js}', { eager: false })

      console.log(`   找到配置文件: ${Object.keys(sourceConfigModules).length} 个`)
      console.log(`   找到组件文件: ${Object.keys(sourceComponentModules).length} 个`)

      if (Object.keys(sourceConfigModules).length > 0) {
        const templates = await this.parseModules(sourceConfigModules, sourceComponentModules)
        console.log(`✅ Source模式成功，解析出 ${templates.length} 个模板`)

        return {
          count: templates.length,
          templates,
          scanMode: 'Source模式 (相对路径)',
          debug: {
            scannedPaths: Object.keys(sourceConfigModules),
            foundConfigs: Object.keys(sourceConfigModules).length,
            foundComponents: Object.keys(sourceComponentModules).length,
          },
        }
      }
    } catch (error) {
      console.warn('⚠️ Source模式失败:', error)
    }

    // 如果都失败了，返回空结果
    console.warn('⚠️ 所有扫描模式都失败，未找到模板')
    return {
      count: 0,
      templates: [],
      scanMode: 'fallback',
      debug: {
        scannedPaths: [],
        foundConfigs: 0,
        foundComponents: 0,
      },
    }
  }

  /**
   * 解析模块为模板元数据
   */
  private async parseModules(
    configModules: Record<string, () => Promise<unknown>>,
    componentModules: Record<string, () => Promise<unknown>>
  ): Promise<TemplateMetadata[]> {
    const templates: TemplateMetadata[] = []

    for (const [configPath, configLoader] of Object.entries(configModules)) {
      try {
        const pathInfo = parseTemplateInfo(configPath, componentModules)
        if (!pathInfo || !pathInfo.isValid) {
          console.warn(`⚠️ 无效的模板路径: ${configPath}`)
          continue
        }

        // 加载配置
        const configModule = await configLoader()
        const config: TemplateConfig = (configModule as any).default || (configModule as TemplateConfig)

        const template: TemplateMetadata = {
          category: pathInfo.category,
          device: pathInfo.device,
          template: pathInfo.template,
          config: {
            ...config,
            id: config.id || `${pathInfo.category}-${pathInfo.device}-${pathInfo.template}`,
          },
          componentPath: pathInfo.componentPath,
          stylePath: pathInfo.stylePath,
        }

        templates.push(template)
        console.log(`✅ 解析模板: ${pathInfo.category}/${pathInfo.device}/${pathInfo.template}`)
        console.log(`   组件路径: ${pathInfo.componentPath}`)
      } catch (error) {
        console.warn(`⚠️ 解析模板失败 ${configPath}:`, error)
      }
    }

    return templates
  }

  /**
   * 获取回退结果
   */
  private getFallbackResult(startTime: number): TemplateScanResult {
    console.log('🔄 使用预定义模板列表')

    const fallbackTemplates = this.createFallbackTemplates()

    return {
      count: fallbackTemplates.length,
      templates: fallbackTemplates,
      duration: Date.now() - startTime,
      scanMode: 'fallback',
      debug: {
        scannedPaths: [],
        foundConfigs: 0,
        foundComponents: 0,
      },
    }
  }

  /**
   * 创建预定义模板列表
   */
  private createFallbackTemplates(): TemplateMetadata[] {
    const predefinedTemplates = [
      'login/desktop/classic',
      'login/desktop/default',
      'login/desktop/modern',
      'login/mobile/simple',
      'login/mobile/card',
      'login/tablet/adaptive',
      'login/tablet/split',
    ]

    return predefinedTemplates.map(path => {
      const parts = path.split('/')
      const [category, device, template] = parts

      return {
        category,
        device: device as any,
        template,
        config: {
          id: `${category}-${device}-${template}`,
          name: `${template} ${device} template`,
          description: `${template} template for ${device} devices`,
          version: '1.0.0',
          author: 'LDesign Team',
          tags: [category, device, template],
        },
        componentPath: `../templates/${path}/index.tsx`,
        stylePath: `../templates/${path}/index.less`,
      }
    })
  }

  /**
   * 检查缓存是否有效
   */
  private isCacheValid(key: string): boolean {
    if (!this.cache.has(key)) return false
    return Date.now() - this.lastScanTime < this.cacheExpiration
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cache.clear()
    this.lastScanTime = 0
  }

  /**
   * 获取所有模板
   */
  getAllTemplates(): TemplateMetadata[] {
    const cached = this.cache.get('templates')
    return cached || []
  }

  /**
   * 按分类获取模板
   */
  getTemplatesByCategory(category: string): TemplateMetadata[] {
    return this.getAllTemplates().filter(t => t.category === category)
  }

  /**
   * 按设备类型获取模板
   */
  getTemplatesByDevice(device: string): TemplateMetadata[] {
    return this.getAllTemplates().filter(t => t.device === device)
  }

  /**
   * 查找特定模板
   */
  findTemplate(category: string, device: string, template: string): TemplateMetadata | null {
    return (
      this.getAllTemplates().find(t => t.category === category && t.device === device && t.template === template) ||
      null
    )
  }
}

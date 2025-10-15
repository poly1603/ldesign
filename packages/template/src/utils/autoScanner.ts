/**
 * 自动模板扫描器
 * 自动扫描 templates 目录并注册所有模板
 */

import type { TemplateManager, TemplateMetadata } from '../types'

/**
 * 模板元数据文件格式
 */
export interface TemplateMetaFile {
  displayName: string
  description?: string
  version?: string
  author?: string
  tags?: string[]
  isDefault?: boolean
}

/**
 * 自动扫描并注册模板
 * 
 * @description
 * 扫描 templates 目录结构：
 * - templates/
 *   - {category}/
 *     - {device}/
 *       - {name}/
 *         - index.vue (模板组件)
 *         - meta.json (元数据文件)
 * 
 * @example
 * ```typescript
 * import { autoRegisterTemplates } from '@ldesign/template'
 * 
 * // 在插件中使用
 * autoRegisterTemplates(manager)
 * ```
 */
export async function autoRegisterTemplates(
  manager: TemplateManager,
  options: {
    baseDir?: string
    debug?: boolean
  } = {}
) {
  const { debug = false } = options
  
  // 使用 Vite 的 glob import 功能
  // 这会在构建时自动扫描所有匹配的文件
  const templateModules = import.meta.glob(
    '../templates/*/*/*/index.vue',
    { eager: false }
  )
  
  const metaModules = import.meta.glob(
    '../templates/*/*/*/meta.json',
    { eager: true }
  )
  
  if (debug) {
    console.log('[autoRegisterTemplates] 发现模板文件:', Object.keys(templateModules).length)
    console.log('[autoRegisterTemplates] 发现元数据文件:', Object.keys(metaModules).length)
  }
  
  // 解析路径并注册模板
  for (const [path, importFn] of Object.entries(templateModules)) {
    // 解析路径: ../templates/{category}/{device}/{name}/index.vue
    const pathMatch = path.match(/\.\.\/templates\/([^\/]+)\/([^\/]+)\/([^\/]+)\/index\.vue$/)
    
    if (!pathMatch) {
      console.warn(`[autoRegisterTemplates] 无法解析路径: ${path}`)
      continue
    }
    
    const [, category, device, name] = pathMatch
    
    // 获取对应的 meta.json
    const metaPath = path.replace('/index.vue', '/meta.json')
    const metaData = metaModules[metaPath] as TemplateMetaFile | undefined
    
    // 构建元数据
    const metadata: TemplateMetadata = {
      name,
      category,
      device: device as any,
      displayName: metaData?.displayName || `${category}-${device}-${name}`,
      description: metaData?.description,
      version: metaData?.version || '1.0.0',
      author: metaData?.author || 'Unknown',
      tags: metaData?.tags || [category, device, name],
      isDefault: metaData?.isDefault || false,
    }
    
    // 注册模板
    try {
      const id = manager.register(
        category,
        device as any,
        name,
        metadata,
        importFn as any
      )
      
      if (debug) {
        console.log(`[autoRegisterTemplates] 注册成功: ${id}`)
      }
    } catch (error) {
      console.error(`[autoRegisterTemplates] 注册失败 ${category}/${device}/${name}:`, error)
    }
  }
  
  if (debug) {
    const templates = manager.query({})
    console.log(`[autoRegisterTemplates] 共注册 ${templates.length} 个模板`)
  }
}

/**
 * 扩展的 registerBuiltinTemplates 函数
 * 支持自动扫描和手动注册的混合模式
 */
export async function registerBuiltinTemplatesAuto(
  manager: TemplateManager,
  options: {
    autoScan?: boolean
    debug?: boolean
    manualTemplates?: Array<{
      category: string
      device: string
      name: string
      metadata: TemplateMetadata
      component: any
    }>
  } = {}
) {
  const { 
    autoScan = true, 
    debug = false,
    manualTemplates = []
  } = options
  
  // 自动扫描注册
  if (autoScan) {
    await autoRegisterTemplates(manager, { debug })
  }
  
  // 手动注册
  for (const template of manualTemplates) {
    try {
      manager.register(
        template.category,
        template.device as any,
        template.name,
        template.metadata,
        template.component
      )
      
      if (debug) {
        console.log(`[registerBuiltinTemplatesAuto] 手动注册: ${template.category}/${template.device}/${template.name}`)
      }
    } catch (error) {
      console.error(`[registerBuiltinTemplatesAuto] 注册失败:`, error)
    }
  }
}

/**
 * 检查模板目录结构是否符合规范
 */
export function validateTemplateStructure(path: string): boolean {
  // 检查路径格式: templates/{category}/{device}/{name}/
  const pattern = /templates\/[^\/]+\/[^\/]+\/[^\/]+\//
  return pattern.test(path)
}

/**
 * 从路径提取模板信息
 */
export function extractTemplateInfo(path: string): {
  category: string
  device: string
  name: string
} | null {
  const match = path.match(/templates\/([^\/]+)\/([^\/]+)\/([^\/]+)/)
  
  if (!match) {
    return null
  }
  
  return {
    category: match[1],
    device: match[2],
    name: match[3],
  }
}
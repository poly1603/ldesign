/**
 * 模板路径解析工具
 *
 * 提供模板路径解析和构建的工具函数
 */

import type { DeviceType, TemplatePathInfo } from '../types'

/**
 * 解析模板路径
 * 路径格式: category/device/template
 * 例如: login/desktop/classic
 */
export function parseTemplatePath(path: string): TemplatePathInfo | null {
  const parts = path.split('/').filter(Boolean)

  if (parts.length < 3) {
    return null
  }

  const [category, device, template] = parts
  const validDevices: DeviceType[] = ['desktop', 'mobile', 'tablet']

  if (!validDevices.includes(device as DeviceType)) {
    return null
  }

  return {
    category,
    device: device as DeviceType,
    template,
    fullPath: path,
    isValid: true,
  }
}

/**
 * 构建模板路径
 */
export function buildTemplatePath(category: string, device: DeviceType, template: string): string {
  return `${category}/${device}/${template}`
}

/**
 * 验证模板路径格式
 */
export function validateTemplatePath(path: string): boolean {
  const info = parseTemplatePath(path)
  return info?.isValid ?? false
}

/**
 * 从模块路径中提取模板路径信息
 * 支持多种路径格式
 */
export function extractTemplatePathFromModulePath(modulePath: string): TemplatePathInfo | null {
  // 支持多种路径格式
  const patterns = [
    /\/templates\/(.+)\/config\.[tj]s$/, // 标准格式
    /\.\/templates\/(.+)\/config\.[tj]s$/, // 当前目录格式
    /\.\.\/templates\/(.+)\/config\.[tj]s$/, // 上级目录格式
  ]

  for (const pattern of patterns) {
    const match = modulePath.match(pattern)
    if (match) {
      return parseTemplatePath(match[1])
    }
  }

  return null
}

/**
 * 标准化模板路径
 * 移除多余的斜杠，确保路径格式正确
 */
export function normalizeTemplatePath(path: string): string {
  return path.split('/').filter(Boolean).join('/')
}

/**
 * 检查路径是否为模板配置文件
 */
export function isTemplateConfigPath(path: string): boolean {
  return /\/config\.[tj]s$/.test(path)
}

/**
 * 检查路径是否为模板组件文件
 */
export function isTemplateComponentPath(path: string): boolean {
  return /\/index\.(ts|tsx|vue|js)$/.test(path)
}

/**
 * 从配置文件路径生成对应的组件文件路径
 */
export function getComponentPathFromConfigPath(configPath: string): string {
  return configPath.replace(/\/config\.[tj]s$/, '/index.tsx')
}

/**
 * 从组件文件路径生成对应的配置文件路径
 */
export function getConfigPathFromComponentPath(componentPath: string): string {
  return componentPath.replace(/\/index\.(ts|tsx|vue|js)$/, '/config.ts')
}

/**
 * 获取模板的样式文件路径
 */
export function getStylePathFromConfigPath(configPath: string): string {
  return configPath.replace(/\/config\.[tj]s$/, '/index.less')
}

/**
 * 解析模板完整信息
 */
export function parseTemplateInfo(configPath: string, componentModules: Record<string, () => Promise<unknown>>) {
  const pathInfo = extractTemplatePathFromModulePath(configPath)
  if (!pathInfo || !pathInfo.isValid) {
    return null
  }

  // 查找对应的组件路径
  const basePath = configPath.replace(/\/config\.[tj]s$/, '')
  let componentPath = getComponentPathFromConfigPath(configPath)

  // 从 componentModules 中查找匹配的组件路径
  for (const path of Object.keys(componentModules)) {
    if (path.includes(basePath) && path.includes('/index.')) {
      componentPath = path
      break
    }
  }

  return {
    ...pathInfo,
    componentPath,
    stylePath: getStylePathFromConfigPath(configPath),
  }
}

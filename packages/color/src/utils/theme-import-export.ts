/**
 * 主题导入/导出工具
 * 支持主题的导入、导出、分享和备份
 */

import type { ThemeConfig } from '../core/types'

/**
 * 主题导出格式
 */
export interface ExportedTheme {
  /** 主题元数据 */
  metadata: {
    /** 主题名称 */
    name: string
    /** 主题版本 */
    version: string
    /** 创建时间 */
    createdAt: string
    /** 作者 */
    author?: string
    /** 描述 */
    description?: string
    /** 标签 */
    tags?: string[]
  }
  /** 主题配置 */
  theme: ThemeConfig
  /** 导出格式版本 */
  formatVersion: string
}

/**
 * 导出选项
 */
export interface ExportOptions {
  /** 是否包含元数据 */
  includeMetadata?: boolean
  /** 是否美化JSON */
  prettify?: boolean
  /** 作者信息 */
  author?: string
  /** 额外的标签 */
  tags?: string[]
}

/**
 * 导入选项
 */
export interface ImportOptions {
  /** 是否验证主题 */
  validate?: boolean
  /** 是否覆盖同名主题 */
  overwrite?: boolean
  /** 导入后的回调 */
  onImported?: (theme: ThemeConfig) => void
}

/**
 * 主题验证结果
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean
  /** 错误信息 */
  errors: string[]
  /** 警告信息 */
  warnings: string[]
}

/**
 * 导出主题为JSON
 */
export function exportTheme(
  theme: ThemeConfig,
  options: ExportOptions = {},
): string {
  const {
    includeMetadata = true,
    prettify = true,
    author,
    tags = [],
  } = options

  const exported: ExportedTheme = {
    metadata: {
      name: theme.name,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      author,
      description: theme.description,
      tags: [...((theme as any).tags || []), ...tags],
    },
    theme,
    formatVersion: '1.0.0',
  }

  if (!includeMetadata) {
    delete (exported as any).metadata
  }

  return prettify
    ? JSON.stringify(exported, null, 2)
    : JSON.stringify(exported)
}

/**
 * 导入主题从JSON
 */
export function importTheme(
  json: string,
  options: ImportOptions = {},
): ThemeConfig {
  const { validate = true, onImported } = options

  try {
    const data = JSON.parse(json) as ExportedTheme

    // 提取主题配置
    const theme = data.theme || (data as any)

    // 验证主题
    if (validate) {
      const validation = validateTheme(theme)
      if (!validation.valid) {
        throw new Error(`主题验证失败: ${validation.errors.join(', ')}`)
      }
    }

    // 触发回调
    if (onImported) {
      onImported(theme)
    }

    return theme
  }
  catch (error) {
    throw new Error(`导入主题失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * 验证主题配置
 */
export function validateTheme(theme: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // 检查必需字段
  if (!theme.name) {
    errors.push('缺少主题名称')
  }

  if (!theme.colors) {
    errors.push('缺少颜色配置')
  }
  else {
    // 检查主色调
    if (!theme.colors.primary) {
      errors.push('缺少主色调')
    }
    else if (!isValidColor(theme.colors.primary)) {
      errors.push('主色调格式无效')
    }

    // 检查其他颜色
    const colorKeys = ['success', 'warning', 'danger', 'info']
    for (const key of colorKeys) {
      if (theme.colors[key] && !isValidColor(theme.colors[key])) {
        warnings.push(`${key} 颜色格式可能无效`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * 验证颜色格式
 */
function isValidColor(color: string): boolean {
  // 简单的颜色格式验证
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  const rgbRegex = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/
  const rgbaRegex = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/

  return hexRegex.test(color) || rgbRegex.test(color) || rgbaRegex.test(color)
}

/**
 * 导出主题为文件
 */
export function exportThemeToFile(
  theme: ThemeConfig,
  filename?: string,
  options: ExportOptions = {},
): void {
  const json = exportTheme(theme, options)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename || `${theme.name}-theme.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 从文件导入主题
 */
export function importThemeFromFile(
  file: File,
  options: ImportOptions = {},
): Promise<ThemeConfig> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const json = e.target?.result as string
        const theme = importTheme(json, options)
        resolve(theme)
      }
      catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error('读取文件失败'))
    }

    reader.readAsText(file)
  })
}

/**
 * 批量导出主题
 */
export function exportThemes(
  themes: ThemeConfig[],
  options: ExportOptions = {},
): string {
  const exported = themes.map(theme => ({
    metadata: {
      name: theme.name,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      description: theme.description,
      tags: (theme as any).tags,
    },
    theme,
  }))

  return options.prettify
    ? JSON.stringify(exported, null, 2)
    : JSON.stringify(exported)
}

/**
 * 批量导入主题
 */
export function importThemes(
  json: string,
  options: ImportOptions = {},
): ThemeConfig[] {
  try {
    const data = JSON.parse(json)
    const themes = Array.isArray(data) ? data : [data]

    return themes.map((item: any) => {
      const theme = item.theme || item
      if (options.validate) {
        const validation = validateTheme(theme)
        if (!validation.valid) {
          console.warn(`主题 ${theme.name} 验证失败:`, validation.errors)
        }
      }
      return theme
    })
  }
  catch (error) {
    throw new Error(`批量导入主题失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * 分享主题（生成分享链接）
 */
export function shareTheme(theme: ThemeConfig): string {
  const json = exportTheme(theme, { prettify: false })
  const encoded = btoa(encodeURIComponent(json))
  return `${window.location.origin}?theme=${encoded}`
}

/**
 * 从分享链接导入主题
 */
export function importThemeFromUrl(url?: string): ThemeConfig | null {
  const urlObj = new URL(url || window.location.href)
  const encoded = urlObj.searchParams.get('theme')

  if (!encoded) {
    return null
  }

  try {
    const json = decodeURIComponent(atob(encoded))
    return importTheme(json)
  }
  catch (error) {
    console.error('从URL导入主题失败:', error)
    return null
  }
}

/**
 * 复制主题到剪贴板
 */
export async function copyThemeToClipboard(
  theme: ThemeConfig,
  options: ExportOptions = {},
): Promise<void> {
  const json = exportTheme(theme, options)

  if (navigator.clipboard) {
    await navigator.clipboard.writeText(json)
  }
  else {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = json
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
}

/**
 * 从剪贴板导入主题
 */
export async function importThemeFromClipboard(
  options: ImportOptions = {},
): Promise<ThemeConfig> {
  let json: string

  if (navigator.clipboard) {
    json = await navigator.clipboard.readText()
  }
  else {
    throw new Error('浏览器不支持剪贴板API')
  }

  return importTheme(json, options)
}


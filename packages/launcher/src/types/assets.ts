/**
 * 资源处理相关类型定义
 */

/**
 * 字体优化配置
 */
export interface FontOptimizationConfig {
  /** 是否启用字体子集化 */
  subset?: boolean
  /** 是否启用字体预加载 */
  preload?: boolean
  /** 字体显示策略 */
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional'
  /** 支持的字体格式 */
  formats?: ('woff2' | 'woff' | 'ttf' | 'otf' | 'eot')[]
  /** 字体子集化字符集 */
  subsetChars?: string | undefined
  /** 是否包含中文字符 */
  includeChinese?: boolean
  /** 中文字符集类型 */
  chineseCharset?: 'simplified' | 'traditional' | 'both'
  /** 自定义字符集文件路径 */
  customCharsetPath?: string
  /** 字体压缩级别 */
  compressionLevel?: 1 | 2 | 3 | 4 | 5
  /** 是否生成字体回退 */
  generateFallback?: boolean
}

/**
 * SVG 处理配置
 */
export interface SVGProcessingConfig {
  /** 是否启用 SVG 组件转换 */
  componentGeneration?: boolean
  /** 是否启用 SVG 优化 */
  optimization?: boolean
  /** 是否生成 SVG 精灵图 */
  sprite?: boolean
  /** SVG 优化选项 */
  optimizationOptions?: SVGOptimizationOptions
  /** 组件生成选项 */
  componentOptions?: SVGComponentOptions
  /** 精灵图生成选项 */
  spriteOptions?: SVGSpriteOptions
}

/**
 * SVG 优化选项
 */
export interface SVGOptimizationOptions {
  /** 是否移除注释 */
  removeComments?: boolean
  /** 是否移除元数据 */
  removeMetadata?: boolean
  /** 是否移除编辑器数据 */
  removeEditorsNSData?: boolean
  /** 是否移除未使用的命名空间 */
  removeUnusedNS?: boolean
  /** 是否移除空属性 */
  removeEmptyAttrs?: boolean
  /** 是否移除空文本 */
  removeEmptyText?: boolean
  /** 是否移除空容器 */
  removeEmptyContainers?: boolean
  /** 是否合并路径 */
  mergePaths?: boolean
  /** 是否转换颜色 */
  convertColors?: boolean
  /** 是否转换路径数据 */
  convertPathData?: boolean
  /** 是否转换变换 */
  convertTransform?: boolean
  /** 是否移除未知元素和属性 */
  removeUnknownsAndDefaults?: boolean
  /** 是否移除非继承的组属性 */
  removeNonInheritingGroupAttrs?: boolean
  /** 是否移除可用的视图框 */
  removeUselessStrokeAndFill?: boolean
  /** 是否移除不必要的定义 */
  removeUnusedDefs?: boolean
  /** 精度设置 */
  floatPrecision?: number
}

/**
 * SVG 组件生成选项
 */
export interface SVGComponentOptions {
  /** 目标框架 */
  framework: 'react' | 'vue' | 'lit' | 'svelte' | 'angular'
  /** 组件名称前缀 */
  prefix?: string
  /** 组件名称后缀 */
  suffix?: string
  /** 是否使用 TypeScript */
  typescript?: boolean
  /** 是否导出默认组件 */
  exportDefault?: boolean
  /** 是否添加 props 类型 */
  addPropsType?: boolean
  /** 自定义模板路径 */
  templatePath?: string
  /** 输出目录 */
  outputDir?: string
  /** 是否生成索引文件 */
  generateIndex?: boolean
}

/**
 * SVG 精灵图选项
 */
export interface SVGSpriteOptions {
  /** 精灵图文件名 */
  filename?: string
  /** 输出目录 */
  outputDir?: string
  /** 是否生成 CSS */
  generateCSS?: boolean
  /** CSS 文件名 */
  cssFilename?: string
  /** CSS 类名前缀 */
  cssPrefix?: string
  /** 是否内联精灵图 */
  inline?: boolean
  /** 图标尺寸 */
  iconSize?: {
    width?: number
    height?: number
  }
}

/**
 * 图片优化配置
 */
export interface ImageOptimizationConfig {
  /** 是否启用图片优化 */
  enabled?: boolean
  /** 支持的图片格式 */
  formats?: ('jpeg' | 'jpg' | 'png' | 'webp' | 'avif' | 'gif' | 'svg')[]
  /** 质量设置 */
  quality?: {
    jpeg?: number
    webp?: number
    avif?: number
    png?: number
  }
  /** 是否生成响应式图片 */
  responsive?: boolean
  /** 响应式断点 */
  breakpoints?: number[]
  /** 是否启用懒加载 */
  lazyLoading?: boolean
  /** 是否生成占位符 */
  placeholder?: boolean
  /** 占位符类型 */
  placeholderType?: 'blur' | 'color' | 'svg'
}

/**
 * 资源配置
 */
export interface AssetConfig {
  /** 字体优化配置 */
  fonts?: FontOptimizationConfig
  /** SVG 处理配置 */
  svg?: SVGProcessingConfig
  /** 图片优化配置 */
  images?: ImageOptimizationConfig
  /** 静态资源目录 */
  staticDir?: string
  /** 输出目录 */
  outputDir?: string
  /** 是否启用资源哈希 */
  hash?: boolean
  /** 资源大小限制（字节） */
  sizeLimit?: number
  /** 是否启用 CDN */
  cdn?: {
    enabled?: boolean
    baseUrl?: string
    domains?: string[]
  }
}

/**
 * 字体信息
 */
export interface FontInfo {
  /** 字体名称 */
  name: string
  /** 字体文件路径 */
  path: string
  /** 字体格式 */
  format: string
  /** 字体大小（字节） */
  size: number
  /** 字体权重 */
  weight?: string | number
  /** 字体样式 */
  style?: 'normal' | 'italic' | 'oblique'
  /** 字符集 */
  charset?: string
  /** 是否为子集字体 */
  isSubset?: boolean
}

/**
 * SVG 信息
 */
export interface SVGInfo {
  /** SVG 名称 */
  name: string
  /** SVG 文件路径 */
  path: string
  /** SVG 内容 */
  content: string
  /** SVG 尺寸 */
  dimensions: {
    width: number
    height: number
  }
  /** 是否已优化 */
  optimized: boolean
  /** 优化前大小 */
  originalSize: number
  /** 优化后大小 */
  optimizedSize?: number
}

/**
 * 资源处理结果
 */
export interface AssetProcessingResult {
  /** 是否成功 */
  success: boolean
  /** 处理的文件数量 */
  processedFiles: number
  /** 错误信息 */
  errors: string[]
  /** 警告信息 */
  warnings: string[]
  /** 处理详情 */
  details: {
    fonts?: FontProcessingResult[]
    svgs?: SVGProcessingResult[]
    images?: ImageProcessingResult[]
  }
  /** 总体统计 */
  stats: {
    /** 原始总大小 */
    originalSize: number
    /** 优化后总大小 */
    optimizedSize: number
    /** 压缩率 */
    compressionRatio: number
    /** 处理时间（毫秒） */
    processingTime: number
  }
}

/**
 * 字体处理结果
 */
export interface FontProcessingResult {
  /** 字体信息 */
  font: FontInfo
  /** 是否成功 */
  success: boolean
  /** 错误信息 */
  error?: string
  /** 生成的文件 */
  generatedFiles: string[]
  /** 压缩率 */
  compressionRatio?: number
}

/**
 * SVG 处理结果
 */
export interface SVGProcessingResult {
  /** SVG 信息 */
  svg: SVGInfo
  /** 是否成功 */
  success: boolean
  /** 错误信息 */
  error?: string
  /** 生成的组件文件 */
  componentFile?: string
  /** 是否包含在精灵图中 */
  inSprite?: boolean
}

/**
 * 图片处理结果
 */
export interface ImageProcessingResult {
  /** 原始文件路径 */
  originalPath: string
  /** 是否成功 */
  success: boolean
  /** 错误信息 */
  error?: string
  /** 生成的文件 */
  generatedFiles: string[]
  /** 压缩率 */
  compressionRatio?: number
}

/**
 * 资源管理器接口
 */
export interface IAssetManager {
  /** 优化字体 */
  optimizeFonts(config: FontOptimizationConfig): Promise<FontProcessingResult[]>

  /** 生成字体子集 */
  generateFontSubsets(fontPath: string, chars: string): Promise<string>

  /** 预加载字体 */
  preloadFonts(fonts: string[]): void

  /** 转换 SVG 为组件 */
  convertSVGToComponent(svgPath: string, framework: string): Promise<string>

  /** 优化 SVG */
  optimizeSVG(svgPath: string, options?: SVGOptimizationOptions): Promise<string>

  /** 生成 SVG 精灵图 */
  generateSVGSprite(svgPaths: string[], options?: SVGSpriteOptions): Promise<string>

  /** 优化图片 */
  optimizeImages(config: ImageOptimizationConfig): Promise<ImageProcessingResult[]>

  /** 处理所有资源 */
  processAssets(config: AssetConfig): Promise<AssetProcessingResult>

  /** 验证资源配置 */
  validateConfig(config: AssetConfig): boolean

  /** 获取资源统计 */
  getStats(): AssetStats

  /** 重置配置 */
  reset(): void
}

/**
 * 资源统计信息
 */
export interface AssetStats {
  /** 字体统计 */
  fonts: {
    /** 总数量 */
    total: number
    /** 已优化数量 */
    optimized: number
    /** 总大小 */
    totalSize: number
    /** 优化后大小 */
    optimizedSize: number
  }
  /** SVG 统计 */
  svgs: {
    /** 总数量 */
    total: number
    /** 已优化数量 */
    optimized: number
    /** 已转换为组件数量 */
    componentized: number
    /** 精灵图数量 */
    sprites: number
  }
  /** 图片统计 */
  images: {
    /** 总数量 */
    total: number
    /** 已优化数量 */
    optimized: number
    /** 总大小 */
    totalSize: number
    /** 优化后大小 */
    optimizedSize: number
  }
}

/**
 * 中文字符集类型
 */
export type ChineseCharsetType = 'simplified' | 'traditional' | 'both'

/**
 * 资源处理事件类型
 */
export type AssetEventType = 'font-optimized' | 'svg-converted' | 'image-optimized' | 'sprite-generated' | 'processing-complete'

/**
 * 资源处理事件数据
 */
export interface AssetEventData {
  /** 事件类型 */
  type: AssetEventType
  /** 文件路径 */
  filePath?: string
  /** 处理结果 */
  result?: any
  /** 错误信息 */
  error?: Error
  /** 时间戳 */
  timestamp: number
}

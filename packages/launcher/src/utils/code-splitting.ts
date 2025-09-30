/**
 * 智能代码分割工具
 * 
 * 自动优化代码分割策略，减少 chunk 大小
 * 
 * @author LDesign Team
 * @since 1.0.1
 */

import type { ManualChunksOption } from 'rollup'
import { Logger } from './logger'

/**
 * 代码分割配置接口
 */
export interface CodeSplittingConfig {
  /** 是否启用智能分割 */
  enabled?: boolean
  /** vendor chunk 最大大小（KB） */
  maxVendorSize?: number
  /** 是否分离 CSS */
  separateCSS?: boolean
  /** 自定义分割规则 */
  customChunks?: Record<string, string[]>
}

/**
 * 智能代码分割管理器
 */
export class CodeSplittingManager {
  private logger: Logger
  private config: Required<CodeSplittingConfig>

  constructor(config: CodeSplittingConfig = {}) {
    this.logger = new Logger('code-splitting')
    this.config = {
      enabled: config.enabled ?? true,
      maxVendorSize: config.maxVendorSize ?? 500,
      separateCSS: config.separateCSS ?? true,
      customChunks: config.customChunks ?? {}
    }
  }

  /**
   * 生成 manualChunks 配置
   */
  generateManualChunks(): ManualChunksOption | undefined {
    if (!this.config.enabled) {
      return undefined
    }

    return (id: string): string | undefined => {
      // 处理自定义分割规则
      for (const [chunkName, patterns] of Object.entries(this.config.customChunks)) {
        if (patterns.some(pattern => id.includes(pattern))) {
          return chunkName
        }
      }

      // node_modules 中的包
      if (id.includes('node_modules')) {
        // Vue 核心库
        if (id.includes('vue') || id.includes('@vue')) {
          return 'vendor-vue'
        }

        // UI 框架
        if (id.includes('element-plus') || id.includes('ant-design-vue')) {
          return 'vendor-ui'
        }

        // 图标库
        if (id.includes('lucide') || id.includes('@iconify')) {
          return 'vendor-icons'
        }

        // 工具库
        if (id.includes('lodash') || id.includes('dayjs') || id.includes('axios')) {
          return 'vendor-utils'
        }

        // 图表库
        if (id.includes('echarts') || id.includes('chart.js')) {
          return 'vendor-charts'
        }

        // 编辑器
        if (id.includes('monaco') || id.includes('codemirror')) {
          return 'vendor-editor'
        }

        // 其他第三方库
        return 'vendor-other'
      }

      // workspace 包
      if (id.includes('packages/')) {
        // 提取包名
        const match = id.match(/packages\/([^/]+)/)
        if (match) {
          const packageName = match[1]
          // 将相关的包分组
          if (['engine', 'core', 'utils'].includes(packageName)) {
            return 'ldesign-core'
          }
          if (['router', 'store', 'i18n'].includes(packageName)) {
            return 'ldesign-state'
          }
          if (['api', 'http', 'crypto', 'cache'].includes(packageName)) {
            return 'ldesign-api'
          }
          if (['device', 'size', 'color', 'template'].includes(packageName)) {
            return 'ldesign-ui'
          }
          return `ldesign-${packageName}`
        }
      }

      return undefined
    }
  }

  /**
   * 生成优化的 Rollup 配置
   */
  generateRollupOptions() {
    return {
      output: {
        manualChunks: this.generateManualChunks(),
        // 优化 chunk 文件名
        chunkFileNames: (chunkInfo: any) => {
          // vendor chunks 使用内容哈希
          if (chunkInfo.name.startsWith('vendor-')) {
            return 'assets/[name]-[hash].js'
          }
          // ldesign packages 使用内容哈希
          if (chunkInfo.name.startsWith('ldesign-')) {
            return 'assets/[name]-[hash].js'
          }
          // 其他 chunks
          return 'assets/[name]-[hash].js'
        },
        // 优化入口文件名
        entryFileNames: 'assets/[name]-[hash].js',
        // 优化资源文件名
        assetFileNames: (assetInfo: any) => {
          // CSS 文件
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/[name]-[hash].css'
          }
          // 图片文件
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name || '')) {
            return 'assets/images/[name]-[hash][extname]'
          }
          // 字体文件
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name || '')) {
            return 'assets/fonts/[name]-[hash][extname]'
          }
          // 其他资源
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  }

  /**
   * 分析构建产物
   */
  analyzeChunks(chunks: any[]): {
    totalSize: number
    largeChunks: Array<{ name: string; size: number }>
    recommendations: string[]
  } {
    let totalSize = 0
    const largeChunks: Array<{ name: string; size: number }> = []
    const recommendations: string[] = []

    for (const chunk of chunks) {
      const size = chunk.code?.length || 0
      totalSize += size

      // 检查大于 500KB 的 chunk
      if (size > 500 * 1024) {
        largeChunks.push({
          name: chunk.fileName || chunk.name,
          size: Math.round(size / 1024)
        })
      }
    }

    // 生成优化建议
    if (largeChunks.length > 0) {
      recommendations.push(
        `发现 ${largeChunks.length} 个大于 500KB 的 chunk，建议进一步分割`
      )

      for (const chunk of largeChunks) {
        recommendations.push(
          `  - ${chunk.name}: ${chunk.size}KB`
        )
      }
    }

    // 检查 vendor chunk 是否过大
    const vendorChunks = chunks.filter(c =>
      (c.fileName || c.name)?.includes('vendor')
    )
    const vendorSize = vendorChunks.reduce((sum, c) =>
      sum + (c.code?.length || 0), 0
    )

    if (vendorSize > this.config.maxVendorSize * 1024) {
      recommendations.push(
        `vendor chunks 总大小 ${Math.round(vendorSize / 1024)}KB，超过限制 ${this.config.maxVendorSize}KB`
      )
      recommendations.push('建议：')
      recommendations.push('  1. 使用动态导入延迟加载大型库')
      recommendations.push('  2. 考虑使用更轻量的替代库')
      recommendations.push('  3. 启用 tree-shaking 移除未使用的代码')
    }

    return {
      totalSize: Math.round(totalSize / 1024),
      largeChunks,
      recommendations
    }
  }

  /**
   * 获取推荐的分割策略
   */
  getRecommendedStrategy(dependencies: Record<string, string>): CodeSplittingConfig {
    const customChunks: Record<string, string[]> = {}

    // 根据依赖自动生成分割策略
    const deps = Object.keys(dependencies)

    // 检查是否有大型 UI 框架
    if (deps.some(d => d.includes('element-plus'))) {
      customChunks['vendor-element'] = ['element-plus']
    }
    if (deps.some(d => d.includes('ant-design-vue'))) {
      customChunks['vendor-antd'] = ['ant-design-vue']
    }

    // 检查是否有图表库
    if (deps.some(d => d.includes('echarts'))) {
      customChunks['vendor-echarts'] = ['echarts']
    }

    // 检查是否有编辑器
    if (deps.some(d => d.includes('monaco-editor'))) {
      customChunks['vendor-monaco'] = ['monaco-editor']
    }

    return {
      enabled: true,
      maxVendorSize: 500,
      separateCSS: true,
      customChunks
    }
  }

  /**
   * 记录分割结果
   */
  logSplittingResults(chunks: any[]): void {
    const analysis = this.analyzeChunks(chunks)

    this.logger.info(`代码分割完成，总大小: ${analysis.totalSize}KB`)

    if (analysis.largeChunks.length > 0) {
      this.logger.warn(`发现 ${analysis.largeChunks.length} 个大型 chunk:`)
      for (const chunk of analysis.largeChunks) {
        this.logger.warn(`  ${chunk.name}: ${chunk.size}KB`)
      }
    }

    if (analysis.recommendations.length > 0) {
      this.logger.info('优化建议:')
      for (const rec of analysis.recommendations) {
        this.logger.info(`  ${rec}`)
      }
    }
  }
}


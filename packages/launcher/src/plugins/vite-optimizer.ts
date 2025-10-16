/**
 * Vite 优化插件
 * 提供性能优化、缓存管理、构建分析等功能
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { Plugin, UserConfig } from 'vite'
import path from 'path'
import fs from 'fs'

// 动态导入 visualizer，避免类型错误
let visualizer: any
try {
  // @ts-ignore - 可选依赖
  const viz = require('rollup-plugin-visualizer')
  visualizer = viz.visualizer || viz.default || viz
} catch {
  visualizer = undefined
}

export interface ViteOptimizerOptions {
  /**
   * 是否启用构建分析
   * @default false
   */
  analyze?: boolean

  /**
   * 分析报告输出目录
   * @default 'dist/stats'
   */
  analyzeDir?: string

  /**
   * 是否启用智能代码分割
   * @default true
   */
  smartSplit?: boolean

  /**
   * 是否启用依赖预构建优化
   * @default true
   */
  optimizeDeps?: boolean

  /**
   * 是否启用增量构建
   * @default true
   */
  incremental?: boolean

  /**
   * chunk 大小限制 (KB)
   * @default 500
   */
  chunkSizeLimit?: number

  /**
   * 是否生成 gzip 压缩报告
   * @default true
   */
  gzipReport?: boolean
}

export interface BuildAnalysisReport {
  timestamp: string
  totalSize: number
  gzipSize?: number
  chunks: Array<{
    name: string
    size: number
    gzipSize?: number
    modules: number
  }>
  warnings: string[]
  recommendations: string[]
}

/**
 * 创建 Vite 优化插件
 */
export function createViteOptimizer(options: ViteOptimizerOptions = {}): Plugin[] {
  const {
    analyze = false,
    analyzeDir = 'dist/stats',
    smartSplit = true,
    optimizeDeps = true,
    incremental = true,
    chunkSizeLimit = 500,
    gzipReport = true
  } = options

  const plugins: Plugin[] = []

  // 添加构建分析插件
  if (analyze) {
    // 只有在 visualizer 可用时才添加
    if (visualizer) {
      plugins.push(
        visualizer({
          filename: path.join(analyzeDir, 'stats.html'),
          open: true,
          gzipSize: gzipReport,
          brotliSize: gzipReport,
          template: 'treemap', // sunburst, treemap, network
          title: 'Build Analysis Report'
        }) as Plugin
      )
    } else {
      console.warn('⚠️  rollup-plugin-visualizer is not installed. Install it for visual analysis: npm install -D rollup-plugin-visualizer')
    }

    // 添加自定义分析报告生成器
    plugins.push(createAnalysisReporter(analyzeDir, chunkSizeLimit))
  }

  // 添加智能代码分割优化
  if (smartSplit) {
    plugins.push(createSmartSplitPlugin(chunkSizeLimit))
  }

  return plugins
}

/**
 * 创建分析报告生成器
 */
function createAnalysisReporter(outputDir: string, chunkSizeLimit: number): Plugin {
  return {
    name: 'vite:analysis-reporter',
    apply: 'build',
    
    closeBundle() {
      // 在构建完成后生成详细报告
      generateDetailedReport(outputDir, chunkSizeLimit)
    }
  }
}

/**
 * 生成详细的构建分析报告
 */
async function generateDetailedReport(outputDir: string, chunkSizeLimit: number): Promise<void> {
  try {
    const distDir = path.resolve(process.cwd(), 'dist')
    const statsDir = path.resolve(process.cwd(), outputDir)
    
    // 确保统计目录存在
    if (!fs.existsSync(statsDir)) {
      fs.mkdirSync(statsDir, { recursive: true })
    }

    const report: BuildAnalysisReport = {
      timestamp: new Date().toISOString(),
      totalSize: 0,
      chunks: [],
      warnings: [],
      recommendations: []
    }

    // 分析 dist 目录
    if (fs.existsSync(distDir)) {
      await analyzeDirectory(distDir, report, chunkSizeLimit)
    }

    // 生成建议
    generateRecommendations(report, chunkSizeLimit)

    // 保存 JSON 报告
    fs.writeFileSync(
      path.join(statsDir, 'report.json'),
      JSON.stringify(report, null, 2)
    )

    // 生成 HTML 报告
    generateHTMLReport(report, statsDir)

    
  } catch (error) {
    console.error('Failed to generate analysis report:', error)
  }
}

/**
 * 分析目录
 */
async function analyzeDirectory(
  dir: string,
  report: BuildAnalysisReport,
  chunkSizeLimit: number
): Promise<void> {
  const files = fs.readdirSync(dir, { withFileTypes: true })

  for (const file of files) {
    const filePath = path.join(dir, file.name)
    
    if (file.isDirectory()) {
      await analyzeDirectory(filePath, report, chunkSizeLimit)
    } else if (file.isFile() && /\.(js|css|mjs)$/.test(file.name)) {
      const stats = fs.statSync(filePath)
      const size = stats.size
      const sizeInKB = size / 1024

      report.totalSize += size

      report.chunks.push({
        name: file.name,
        size: sizeInKB,
        modules: 0 // 需要通过 rollup stats 获取
      })

      // 检查是否超过大小限制
      if (sizeInKB > chunkSizeLimit) {
        report.warnings.push(
          `Chunk "${file.name}" (${sizeInKB.toFixed(2)}KB) exceeds size limit (${chunkSizeLimit}KB)`
        )
      }
    }
  }
}

/**
 * 生成优化建议
 */
function generateRecommendations(report: BuildAnalysisReport, chunkSizeLimit: number): void {
  // 检查总体积
  const totalSizeInMB = report.totalSize / (1024 * 1024)
  if (totalSizeInMB > 2) {
    report.recommendations.push(
      `Total bundle size (${totalSizeInMB.toFixed(2)}MB) is large. Consider code splitting and lazy loading.`
    )
  }

  // 检查大文件数量
  const largeChunks = report.chunks.filter(c => c.size > chunkSizeLimit)
  if (largeChunks.length > 0) {
    report.recommendations.push(
      `${largeChunks.length} chunk(s) exceed the size limit. Consider splitting them further.`
    )
  }

  // 检查 chunk 数量
  if (report.chunks.length > 50) {
    report.recommendations.push(
      `Too many chunks (${report.chunks.length}). Consider grouping related modules.`
    )
  }

  // 如果没有问题，添加正面反馈
  if (report.warnings.length === 0 && totalSizeInMB < 1) {
    report.recommendations.push('✅ Bundle size is optimal!')
  }
}

/**
 * 生成 HTML 报告
 */
function generateHTMLReport(report: BuildAnalysisReport, outputDir: string): void {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Build Analysis Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 30px;
    }
    h1 {
      color: #2c3e50;
      margin-bottom: 10px;
      font-size: 2em;
    }
    .timestamp {
      color: #7f8c8d;
      font-size: 0.9em;
      margin-bottom: 30px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .stat-label {
      font-size: 0.9em;
      opacity: 0.9;
      margin-bottom: 5px;
    }
    .stat-value {
      font-size: 2em;
      font-weight: bold;
    }
    .section {
      margin-bottom: 30px;
    }
    .section h2 {
      color: #2c3e50;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #ecf0f1;
    }
    .chunk-list {
      display: grid;
      gap: 10px;
    }
    .chunk-item {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #3498db;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .chunk-item.warning {
      border-left-color: #e74c3c;
      background: #ffebee;
    }
    .chunk-name {
      font-family: 'Courier New', monospace;
      font-weight: 500;
    }
    .chunk-size {
      color: #7f8c8d;
      font-weight: bold;
    }
    .warning-list, .recommendation-list {
      list-style: none;
    }
    .warning-list li {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 12px;
      margin-bottom: 10px;
      border-radius: 4px;
    }
    .recommendation-list li {
      background: #d1ecf1;
      border-left: 4px solid #17a2b8;
      padding: 12px;
      margin-bottom: 10px;
      border-radius: 4px;
    }
    .chart-container {
      margin-top: 20px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🏗️ Build Analysis Report</h1>
    <div class="timestamp">Generated at: ${report.timestamp}</div>
    
    <div class="summary">
      <div class="stat-card">
        <div class="stat-label">Total Size</div>
        <div class="stat-value">${(report.totalSize / (1024 * 1024)).toFixed(2)} MB</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
        <div class="stat-label">Total Chunks</div>
        <div class="stat-value">${report.chunks.length}</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
        <div class="stat-label">Warnings</div>
        <div class="stat-value">${report.warnings.length}</div>
      </div>
    </div>

    ${report.chunks.length > 0 ? `
    <div class="section">
      <h2>📦 Chunks</h2>
      <div class="chunk-list">
        ${report.chunks
          .sort((a, b) => b.size - a.size)
          .map(chunk => `
            <div class="chunk-item ${chunk.size > 500 ? 'warning' : ''}">
              <span class="chunk-name">${chunk.name}</span>
              <span class="chunk-size">${chunk.size.toFixed(2)} KB</span>
            </div>
          `).join('')}
      </div>
    </div>
    ` : ''}

    ${report.warnings.length > 0 ? `
    <div class="section">
      <h2>⚠️ Warnings</h2>
      <ul class="warning-list">
        ${report.warnings.map(w => `<li>${w}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    ${report.recommendations.length > 0 ? `
    <div class="section">
      <h2>💡 Recommendations</h2>
      <ul class="recommendation-list">
        ${report.recommendations.map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>
    ` : ''}
  </div>
</body>
</html>`

  fs.writeFileSync(path.join(outputDir, 'report.html'), html)
}

/**
 * 创建智能代码分割插件
 */
function createSmartSplitPlugin(chunkSizeLimit: number): Plugin {
  return {
    name: 'vite:smart-split',
    apply: 'build',
    
    config() {
      return {
        build: {
          rollupOptions: {
            output: {
              manualChunks(id) {
                // 将 node_modules 按包分割
                if (id.includes('node_modules')) {
                  // 大型库单独分割
                  if (id.includes('react') || id.includes('react-dom')) {
                    return 'vendor-react'
                  }
                  if (id.includes('vue')) {
                    return 'vendor-vue'
                  }
                  if (id.includes('lodash') || id.includes('moment')) {
                    return 'vendor-utils'
                  }
                  if (id.includes('@ant-design') || id.includes('antd')) {
                    return 'vendor-ui'
                  }
                  // 其他第三方库
                  return 'vendor'
                }
              },
              chunkFileNames: 'assets/js/[name]-[hash].js',
              entryFileNames: 'assets/js/[name]-[hash].js',
              assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
            }
          },
          // 设置 chunk 大小警告限制
          chunkSizeWarningLimit: chunkSizeLimit
        }
      } as UserConfig
    }
  }
}

/**
 * 创建优化的 Vite 配置
 */
export function createOptimizedViteConfig(options: ViteOptimizerOptions = {}): UserConfig {
  const {
    optimizeDeps = true,
    incremental = true
  } = options

  return {
    // 优化依赖预构建
    optimizeDeps: optimizeDeps ? {
      include: [
        'vue',
        'react',
        'react-dom',
        'lodash-es'
      ],
      exclude: ['@vueuse/core'],
      // 启用依赖预构建缓存
      force: false,
      esbuildOptions: {
        target: 'es2020'
      }
    } : undefined,

    // 构建优化
    build: {
      // 启用 CSS 代码分割
      cssCodeSplit: true,
      
      // 启用源码映射
      sourcemap: false,
      
      // 最小化
      minify: 'esbuild',
      
      // 目标环境
      target: 'es2020',
      
      // 增量构建
      write: true,
      
      // Rollup 选项
      rollupOptions: {
        output: {
          // 优化资源命名
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
        }
      }
    },

    // 服务器优化
    server: {
      // 启用文件系统缓存
      fs: {
        strict: true,
        allow: ['.']
      },
      
      // 预热常用文件
      warmup: {
        clientFiles: [
          './src/main.ts',
          './src/App.vue'
        ]
      }
    },

    // 缓存目录
    cacheDir: 'node_modules/.vite'
  }
}

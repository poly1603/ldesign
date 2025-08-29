/**
 * 构建分析插件
 * 提供构建产物分析和可视化
 */

import type { Plugin } from 'vite'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { BundleAnalyzerPluginConfig } from '../../types/plugins'

/**
 * 创建构建分析插件
 */
export function createBundleAnalyzerPlugin(config: BundleAnalyzerPluginConfig = {}): Plugin {
  const {
    enabled = true,
    options = {},
    apply = 'build',
    enforce,
  } = config

  const {
    mode = 'static',
    outputDir = 'dist/analysis',
    reportFilename = 'bundle-report.html',
    openAnalyzer = false,
    port = 8888,
    host = 'localhost',
  } = options

  let bundleData: BundleAnalysisData = {
    chunks: [],
    assets: [],
    modules: [],
    totalSize: 0,
    gzippedSize: 0,
  }

  return {
    name: 'ldesign:bundle-analyzer',
    apply,
    ...(enforce && { enforce }),

    generateBundle(_outputOptions, bundle) {
      if (!enabled) return

      // 分析构建产物
      bundleData = analyzeBundleData(bundle)

      console.log(`[Bundle Analyzer] Analyzed ${bundleData.chunks.length} chunks, ${bundleData.modules.length} modules`)
    },

    writeBundle(_outputOptions) {
      if (!enabled) return

      // 生成分析报告
      return generateAnalysisReport(bundleData, mode, outputDir, reportFilename, openAnalyzer, port, host)
    },
  }
}

/**
 * 构建分析数据
 */
interface BundleAnalysisData {
  chunks: ChunkInfo[]
  assets: AssetInfo[]
  modules: ModuleInfo[]
  totalSize: number
  gzippedSize: number
}

/**
 * 代码块信息
 */
interface ChunkInfo {
  name: string
  size: number
  gzippedSize: number
  modules: string[]
  isEntry: boolean
  isDynamic: boolean
}

/**
 * 资源信息
 */
interface AssetInfo {
  name: string
  size: number
  type: string
}

/**
 * 模块信息
 */
interface ModuleInfo {
  id: string
  size: number
  chunks: string[]
  dependencies: string[]
}

/**
 * 分析构建数据
 */
function analyzeBundleData(bundle: any): BundleAnalysisData {
  const chunks: ChunkInfo[] = []
  const assets: AssetInfo[] = []
  const modules: ModuleInfo[] = []
  let totalSize = 0
  let gzippedSize = 0

  for (const [fileName, chunk] of Object.entries(bundle)) {
    const chunkData = chunk as any

    if (chunkData.type === 'chunk') {
      const size = chunkData.code ? Buffer.byteLength(chunkData.code, 'utf8') : 0
      const estimatedGzippedSize = Math.floor(size * 0.3) // 估算 gzip 压缩后大小

      chunks.push({
        name: fileName,
        size,
        gzippedSize: estimatedGzippedSize,
        modules: chunkData.moduleIds || [],
        isEntry: chunkData.isEntry || false,
        isDynamic: chunkData.isDynamicEntry || false,
      })

      totalSize += size
      gzippedSize += estimatedGzippedSize

      // 分析模块
      if (chunkData.modules) {
        for (const [moduleId, moduleInfo] of Object.entries(chunkData.modules)) {
          modules.push({
            id: moduleId,
            size: (moduleInfo as any).renderedLength || 0,
            chunks: [fileName],
            dependencies: (moduleInfo as any).dependencies || [],
          })
        }
      }
    }
    else if (chunkData.type === 'asset') {
      const size = chunkData.source ?
        (typeof chunkData.source === 'string' ?
          Buffer.byteLength(chunkData.source, 'utf8') :
          chunkData.source.length) : 0

      assets.push({
        name: fileName,
        size,
        type: getAssetType(fileName),
      })

      totalSize += size
    }
  }

  return {
    chunks,
    assets,
    modules,
    totalSize,
    gzippedSize,
  }
}

/**
 * 获取资源类型
 */
function getAssetType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase()

  if (['.js', '.mjs', '.ts'].includes(ext)) return 'javascript'
  if (['.css', '.scss', '.less'].includes(ext)) return 'stylesheet'
  if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) return 'image'
  if (['.woff', '.woff2', '.ttf', '.otf', '.eot'].includes(ext)) return 'font'
  if (['.html', '.htm'].includes(ext)) return 'html'

  return 'other'
}

/**
 * 生成分析报告
 */
async function generateAnalysisReport(
  data: BundleAnalysisData,
  mode: string,
  outputDir: string,
  reportFilename: string,
  openAnalyzer: boolean,
  port: number,
  host: string
) {
  try {
    // 确保输出目录存在
    await fs.mkdir(outputDir, { recursive: true })

    switch (mode) {
      case 'static':
        await generateStaticReport(data, outputDir, reportFilename)
        break
      case 'json':
        await generateJSONReport(data, outputDir)
        break
      case 'server':
        await startAnalysisServer(data, port, host, openAnalyzer)
        break
    }

    console.log(`[Bundle Analyzer] Report generated in ${mode} mode`)
  }
  catch (error) {
    console.error('[Bundle Analyzer] Failed to generate report:', error)
  }
}

/**
 * 生成静态 HTML 报告
 */
async function generateStaticReport(
  data: BundleAnalysisData,
  outputDir: string,
  reportFilename: string
) {
  const htmlContent = generateHTMLReport(data)
  const reportPath = path.join(outputDir, reportFilename)

  await fs.writeFile(reportPath, htmlContent)
  console.log(`[Bundle Analyzer] Static report saved to: ${reportPath}`)
}

/**
 * 生成 JSON 报告
 */
async function generateJSONReport(data: BundleAnalysisData, outputDir: string) {
  const jsonContent = JSON.stringify(data, null, 2)
  const reportPath = path.join(outputDir, 'bundle-analysis.json')

  await fs.writeFile(reportPath, jsonContent)
  console.log(`[Bundle Analyzer] JSON report saved to: ${reportPath}`)
}

/**
 * 启动分析服务器
 */
async function startAnalysisServer(
  _data: BundleAnalysisData,
  port: number,
  host: string,
  openAnalyzer: boolean
) {
  // 简化实现，实际应该启动一个 HTTP 服务器
  console.log(`[Bundle Analyzer] Analysis server would start at http://${host}:${port}`)

  if (openAnalyzer) {
    console.log('[Bundle Analyzer] Opening analyzer in browser...')
    // 这里应该打开浏览器
  }
}

/**
 * 生成 HTML 报告内容
 */
function generateHTMLReport(data: BundleAnalysisData): string {
  const chunksTable = data.chunks.map(chunk => `
    <tr>
      <td>${chunk.name}</td>
      <td>${formatBytes(chunk.size)}</td>
      <td>${formatBytes(chunk.gzippedSize)}</td>
      <td>${chunk.modules.length}</td>
      <td>${chunk.isEntry ? 'Yes' : 'No'}</td>
      <td>${chunk.isDynamic ? 'Yes' : 'No'}</td>
    </tr>
  `).join('')

  const assetsTable = data.assets.map(asset => `
    <tr>
      <td>${asset.name}</td>
      <td>${asset.type}</td>
      <td>${formatBytes(asset.size)}</td>
    </tr>
  `).join('')

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bundle Analysis Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .summary h2 { margin-top: 0; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
    .stat { background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #007acc; }
    .stat-value { font-size: 24px; font-weight: bold; color: #007acc; }
    .stat-label { color: #666; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f8f9fa; font-weight: 600; }
    .section { margin: 30px 0; }
    .section h3 { color: #333; border-bottom: 2px solid #007acc; padding-bottom: 10px; }
  </style>
</head>
<body>
  <h1>Bundle Analysis Report</h1>
  
  <div class="summary">
    <h2>Summary</h2>
    <div class="stats">
      <div class="stat">
        <div class="stat-value">${formatBytes(data.totalSize)}</div>
        <div class="stat-label">Total Size</div>
      </div>
      <div class="stat">
        <div class="stat-value">${formatBytes(data.gzippedSize)}</div>
        <div class="stat-label">Gzipped Size</div>
      </div>
      <div class="stat">
        <div class="stat-value">${data.chunks.length}</div>
        <div class="stat-label">Chunks</div>
      </div>
      <div class="stat">
        <div class="stat-value">${data.assets.length}</div>
        <div class="stat-label">Assets</div>
      </div>
      <div class="stat">
        <div class="stat-value">${data.modules.length}</div>
        <div class="stat-label">Modules</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h3>Chunks</h3>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Size</th>
          <th>Gzipped</th>
          <th>Modules</th>
          <th>Entry</th>
          <th>Dynamic</th>
        </tr>
      </thead>
      <tbody>
        ${chunksTable}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h3>Assets</h3>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Size</th>
        </tr>
      </thead>
      <tbody>
        ${assetsTable}
      </tbody>
    </table>
  </div>

  <script>
    // 添加交互功能
    console.log('Bundle analysis data:', ${JSON.stringify(data, null, 2)});
  </script>
</body>
</html>
  `.trim()
}

/**
 * 格式化字节大小
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 默认构建分析配置
 */
export const defaultBundleAnalyzerConfig: BundleAnalyzerPluginConfig = {
  enabled: true,
  apply: 'build',
  options: {
    mode: 'static',
    outputDir: 'dist/analysis',
    reportFilename: 'bundle-report.html',
    openAnalyzer: false,
    port: 8888,
    host: 'localhost',
  },
}

/**
 * 创建轻量级构建分析插件
 */
export function createLightBundleAnalyzerPlugin(): Plugin {
  return createBundleAnalyzerPlugin({
    enabled: true,
    apply: 'build',
    options: {
      mode: 'json',
      outputDir: 'dist',
    },
  })
}

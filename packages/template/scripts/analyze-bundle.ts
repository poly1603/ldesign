/**
 * Bundle 分析脚本
 * 分析打包后的文件大小和依赖关系
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface FileInfo {
  path: string
  size: number
  gzipSize: number
}

interface BundleAnalysis {
  totalSize: number
  totalGzipSize: number
  files: FileInfo[]
  largestFiles: FileInfo[]
  recommendations: string[]
}

/**
 * 获取文件大小
 */
function getFileSize(filePath: string): number {
  try {
    const stats = fs.statSync(filePath)
    return stats.size
  } catch {
    return 0
  }
}

/**
 * 估算 Gzip 压缩后的大小
 */
function estimateGzipSize(size: number): number {
  // 通常 Gzip 可以压缩 70-75%
  return Math.round(size * 0.27)
}

/**
 * 格式化文件大小
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

/**
 * 扫描目录
 */
function scanDirectory(dir: string, ext: string[] = ['.js', '.css']): FileInfo[] {
  const files: FileInfo[] = []
  
  function scan(currentDir: string) {
    const items = fs.readdirSync(currentDir)
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        scan(fullPath)
      } else if (ext.some(e => item.endsWith(e))) {
        const size = stat.size
        files.push({
          path: path.relative(dir, fullPath),
          size,
          gzipSize: estimateGzipSize(size)
        })
      }
    }
  }
  
  scan(dir)
  return files
}

/**
 * 分析 Bundle
 */
function analyzeBundles(distPath: string): BundleAnalysis {
  const files = scanDirectory(distPath)
  
  const totalSize = files.reduce((sum, f) => sum + f.size, 0)
  const totalGzipSize = files.reduce((sum, f) => sum + f.gzipSize, 0)
  
  // 找出最大的文件
  const largestFiles = files
    .sort((a, b) => b.size - a.size)
    .slice(0, 10)
  
  // 生成建议
  const recommendations: string[] = []
  
  if (totalSize > 5 * 1024 * 1024) {
    recommendations.push('⚠️  总体积超过 5MB，考虑代码分割')
  }
  
  const largeFiles = files.filter(f => f.size > 500 * 1024)
  if (largeFiles.length > 0) {
    recommendations.push(`⚠️  ${largeFiles.length} 个文件超过 500KB，考虑优化或分割`)
  }
  
  const jsFiles = files.filter(f => f.path.endsWith('.js'))
  const cssFiles = files.filter(f => f.path.endsWith('.css'))
  
  if (jsFiles.length > 20) {
    recommendations.push('💡 JS 文件较多，考虑合并或懒加载')
  }
  
  if (cssFiles.length > 10) {
    recommendations.push('💡 CSS 文件较多，考虑合并')
  }
  
  // 检查是否有 source map
  const mapFiles = files.filter(f => f.path.endsWith('.map'))
  if (mapFiles.length === 0) {
    recommendations.push('✅ 已移除 source map，适合生产环境')
  }
  
  return {
    totalSize,
    totalGzipSize,
    files,
    largestFiles,
    recommendations
  }
}

/**
 * 打印分析报告
 */
function printReport(analysis: BundleAnalysis): void {
  console.log('\n' + '='.repeat(80))
  console.log('📦 Bundle 分析报告')
  console.log('='.repeat(80) + '\n')
  
  console.log('📊 总体统计:')
  console.log(`   总文件数: ${analysis.files.length}`)
  console.log(`   总大小: ${formatSize(analysis.totalSize)}`)
  console.log(`   Gzip 后: ${formatSize(analysis.totalGzipSize)} (${Math.round((1 - analysis.totalGzipSize / analysis.totalSize) * 100)}% 压缩率)`)
  console.log()
  
  console.log('🔍 最大的 10 个文件:')
  analysis.largestFiles.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file.path}`)
    console.log(`      大小: ${formatSize(file.size)} | Gzip: ${formatSize(file.gzipSize)}`)
  })
  console.log()
  
  if (analysis.recommendations.length > 0) {
    console.log('💡 优化建议:')
    analysis.recommendations.forEach(rec => {
      console.log(`   ${rec}`)
    })
    console.log()
  } else {
    console.log('✅ 打包体积良好，无需优化\n')
  }
  
  console.log('='.repeat(80) + '\n')
}

// 执行分析
const distPath = path.resolve(__dirname, '../dist')

if (fs.existsSync(distPath)) {
  const analysis = analyzeBundles(distPath)
  printReport(analysis)
  
  // 保存报告
  const reportPath = path.join(__dirname, '../bundle-analysis.json')
  fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2))
  console.log(`📝 详细报告已保存到: ${reportPath}\n`)
} else {
  console.error('❌ 找不到 dist 目录，请先运行 npm run build')
  process.exit(1)
}


#!/usr/bin/env node

/**
 * Bundle 分析脚本
 * 分析打包后的文件大小和依赖关系
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import zlib from 'node:zlib'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

/**
 * 格式化字节大小
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
}

/**
 * 获取文件大小
 */
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath)
    return stats.size
  } catch {
    return 0
  }
}

/**
 * 获取 Gzip 压缩后的大小
 */
function getGzipSize(filePath) {
  try {
    const content = fs.readFileSync(filePath)
    const compressed = zlib.gzipSync(content, { level: 9 })
    return compressed.length
  } catch {
    return 0
  }
}

/**
 * 获取 Brotli 压缩后的大小
 */
function getBrotliSize(filePath) {
  try {
    const content = fs.readFileSync(filePath)
    const compressed = zlib.brotliCompressSync(content, {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
      },
    })
    return compressed.length
  } catch {
    return 0
  }
}

/**
 * 分析目录下的所有文件
 */
function analyzeDirectory(dir, extensions = ['.js', '.cjs', '.mjs']) {
  const files = []
  
  function walkDir(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)
      
      if (entry.isDirectory()) {
        walkDir(fullPath)
      } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
        const relativePath = path.relative(rootDir, fullPath)
        const size = getFileSize(fullPath)
        const gzipSize = getGzipSize(fullPath)
        const brotliSize = getBrotliSize(fullPath)
        
        files.push({
          path: relativePath,
          size,
          gzipSize,
          brotliSize,
          compression: {
            gzip: ((1 - gzipSize / size) * 100).toFixed(2),
            brotli: ((1 - brotliSize / size) * 100).toFixed(2),
          },
        })
      }
    }
  }
  
  walkDir(dir)
  return files
}

/**
 * 主函数
 */
function main() {
  console.log('📊 Bundle 分析报告\n')
  console.log('='.repeat(80))
  
  // 分析 dist 目录
  const distDir = path.join(rootDir, 'dist')
  if (fs.existsSync(distDir)) {
    console.log('\n📦 Dist 目录 (UMD Bundles):')
    console.log('-'.repeat(80))
    
    const distFiles = analyzeDirectory(distDir)
    let totalSize = 0
    let totalGzip = 0
    let totalBrotli = 0
    
    distFiles.forEach(file => {
      totalSize += file.size
      totalGzip += file.gzipSize
      totalBrotli += file.brotliSize
      
      console.log(`\n文件: ${file.path}`)
      console.log(`  原始大小: ${formatBytes(file.size)}`)
      console.log(`  Gzip:     ${formatBytes(file.gzipSize)} (压缩率: ${file.compression.gzip}%)`)
      console.log(`  Brotli:   ${formatBytes(file.brotliSize)} (压缩率: ${file.compression.brotli}%)`)
    })
    
    console.log('\n' + '-'.repeat(80))
    console.log(`总计: ${distFiles.length} 个文件`)
    console.log(`  原始总大小: ${formatBytes(totalSize)}`)
    console.log(`  Gzip 总大小: ${formatBytes(totalGzip)}`)
    console.log(`  Brotli 总大小: ${formatBytes(totalBrotli)}`)
  }
  
  // 分析 es 目录
  const esDir = path.join(rootDir, 'es')
  if (fs.existsSync(esDir)) {
    console.log('\n\n📦 ES 目录 (ESM Modules):')
    console.log('-'.repeat(80))
    
    const esFiles = analyzeDirectory(esDir, ['.js'])
    const topFiles = esFiles
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
    
    console.log('\n前 10 大文件:')
    topFiles.forEach((file, index) => {
      console.log(`\n${index + 1}. ${file.path}`)
      console.log(`   原始: ${formatBytes(file.size)} | Gzip: ${formatBytes(file.gzipSize)} | Brotli: ${formatBytes(file.brotliSize)}`)
    })
    
    const totalSize = esFiles.reduce((sum, f) => sum + f.size, 0)
    const totalGzip = esFiles.reduce((sum, f) => sum + f.gzipSize, 0)
    const totalBrotli = esFiles.reduce((sum, f) => sum + f.brotliSize, 0)
    
    console.log('\n' + '-'.repeat(80))
    console.log(`总计: ${esFiles.length} 个文件`)
    console.log(`  原始总大小: ${formatBytes(totalSize)}`)
    console.log(`  Gzip 总大小: ${formatBytes(totalGzip)}`)
    console.log(`  Brotli 总大小: ${formatBytes(totalBrotli)}`)
  }
  
  // 分析 lib 目录
  const libDir = path.join(rootDir, 'lib')
  if (fs.existsSync(libDir)) {
    console.log('\n\n📦 Lib 目录 (CommonJS):')
    console.log('-'.repeat(80))
    
    const libFiles = analyzeDirectory(libDir, ['.cjs'])
    const topFiles = libFiles
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
    
    console.log('\n前 10 大文件:')
    topFiles.forEach((file, index) => {
      console.log(`\n${index + 1}. ${file.path}`)
      console.log(`   原始: ${formatBytes(file.size)} | Gzip: ${formatBytes(file.gzipSize)} | Brotli: ${formatBytes(file.brotliSize)}`)
    })
    
    const totalSize = libFiles.reduce((sum, f) => sum + f.size, 0)
    const totalGzip = libFiles.reduce((sum, f) => sum + f.gzipSize, 0)
    const totalBrotli = libFiles.reduce((sum, f) => sum + f.brotliSize, 0)
    
    console.log('\n' + '-'.repeat(80))
    console.log(`总计: ${libFiles.length} 个文件`)
    console.log(`  原始总大小: ${formatBytes(totalSize)}`)
    console.log(`  Gzip 总大小: ${formatBytes(totalGzip)}`)
    console.log(`  Brotli 总大小: ${formatBytes(totalBrotli)}`)
  }
  
  // 建议
  console.log('\n\n💡 优化建议:')
  console.log('='.repeat(80))
  
  const allFiles = [
    ...analyzeDirectory(distDir || ''),
    ...analyzeDirectory(esDir || ''),
  ]
  
  // 找出大文件
  const largeFiles = allFiles
    .filter(f => f.size > 50 * 1024) // 大于 50KB
    .sort((a, b) => b.size - a.size)
    .slice(0, 5)
  
  if (largeFiles.length > 0) {
    console.log('\n⚠️  较大的文件（>50KB）:')
    largeFiles.forEach(file => {
      console.log(`  • ${file.path}: ${formatBytes(file.size)}`)
      console.log(`    建议: 考虑代码分割或延迟加载`)
    })
  }
  
  // 检查压缩率
  const lowCompressionFiles = allFiles
    .filter(f => f.size > 10 * 1024 && parseFloat(f.compression.gzip) < 60)
    .sort((a, b) => parseFloat(a.compression.gzip) - parseFloat(b.compression.gzip))
    .slice(0, 5)
  
  if (lowCompressionFiles.length > 0) {
    console.log('\n⚠️  压缩率较低的文件（<60%）:')
    lowCompressionFiles.forEach(file => {
      console.log(`  • ${file.path}: ${file.compression.gzip}% (Gzip)`)
      console.log(`    建议: 检查是否包含二进制数据或已压缩内容`)
    })
  }
  
  console.log('\n✅ 总体评估:')
  const avgCompression = allFiles.reduce((sum, f) => sum + parseFloat(f.compression.gzip), 0) / allFiles.length
  console.log(`  • 平均 Gzip 压缩率: ${avgCompression.toFixed(2)}%`)
  
  if (avgCompression > 70) {
    console.log('  • 评级: 优秀 ⭐⭐⭐⭐⭐')
  } else if (avgCompression > 60) {
    console.log('  • 评级: 良好 ⭐⭐⭐⭐')
  } else if (avgCompression > 50) {
    console.log('  • 评级: 中等 ⭐⭐⭐')
  } else {
    console.log('  • 评级: 需要优化 ⭐⭐')
  }
  
  console.log('\n' + '='.repeat(80))
}

// 运行分析
main()




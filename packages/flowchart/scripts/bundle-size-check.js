#!/usr/bin/env node

/**
 * 包大小分析和检查脚本
 * 用于分析构建产物的大小，确保不超过预设限制
 */

const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const chalk = require('chalk')

// 配置
const CONFIG = {
  // 大小限制 (bytes)
  limits: {
    'index.esm.js': 800 * 1024,     // 800KB
    'index.cjs.js': 850 * 1024,     // 850KB
    'index.umd.js': 1000 * 1024,    // 1MB
    'core.js': 300 * 1024,          // 300KB
    'renderer.js': 200 * 1024,      // 200KB
    'performance.js': 150 * 1024,   // 150KB
    'utils.js': 100 * 1024,         // 100KB
  },
  
  // 目录配置
  distDir: path.resolve(__dirname, '../dist'),
  reportDir: path.resolve(__dirname, '../reports'),
  
  // 警告阈值
  warningThreshold: 0.8, // 80% of limit
  
  // 文件模式
  patterns: {
    js: /\.js$/,
    css: /\.css$/,
    assets: /\.(png|jpg|jpeg|gif|svg|woff2?|ttf|eot)$/
  }
}

class BundleSizeAnalyzer {
  constructor() {
    this.results = {
      files: [],
      warnings: [],
      errors: [],
      summary: {
        totalSize: 0,
        totalGzipSize: 0,
        fileCount: 0
      }
    }
  }

  // 获取文件大小
  getFileSize(filePath) {
    try {
      const stats = fs.statSync(filePath)
      return stats.size
    } catch (error) {
      return 0
    }
  }

  // 计算 gzip 压缩后的大小
  getGzipSize(filePath) {
    try {
      const buffer = fs.readFileSync(filePath)
      const compressed = zlib.gzipSync(buffer)
      return compressed.length
    } catch (error) {
      return 0
    }
  }

  // 格式化文件大小
  formatSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`
  }

  // 计算百分比
  getPercentage(current, limit) {
    if (!limit) return 0
    return (current / limit) * 100
  }

  // 分析单个文件
  analyzeFile(filePath, relativePath) {
    const size = this.getFileSize(filePath)
    const gzipSize = this.getGzipSize(filePath)
    const fileName = path.basename(filePath)
    
    // 获取限制
    const limit = CONFIG.limits[fileName] || null
    const percentage = limit ? this.getPercentage(size, limit) : null
    
    const fileInfo = {
      path: relativePath,
      fileName,
      size,
      gzipSize,
      formattedSize: this.formatSize(size),
      formattedGzipSize: this.formatSize(gzipSize),
      limit,
      formattedLimit: limit ? this.formatSize(limit) : null,
      percentage,
      status: 'ok'
    }
    
    // 检查是否超过限制
    if (limit) {
      if (size > limit) {
        fileInfo.status = 'error'
        this.results.errors.push({
          type: 'size_exceeded',
          file: relativePath,
          size,
          limit,
          message: `File size (${this.formatSize(size)}) exceeds limit (${this.formatSize(limit)})`
        })
      } else if (percentage >= CONFIG.warningThreshold * 100) {
        fileInfo.status = 'warning'
        this.results.warnings.push({
          type: 'size_warning',
          file: relativePath,
          size,
          limit,
          percentage,
          message: `File size (${this.formatSize(size)}) is ${percentage.toFixed(1)}% of limit`
        })
      }
    }
    
    this.results.files.push(fileInfo)
    this.results.summary.totalSize += size
    this.results.summary.totalGzipSize += gzipSize
    this.results.summary.fileCount++
    
    return fileInfo
  }

  // 扫描目录
  scanDirectory(dir, baseDir = dir) {
    if (!fs.existsSync(dir)) {
      console.log(chalk.red(`Directory ${dir} does not exist`))
      return
    }
    
    const files = fs.readdirSync(dir)
    
    for (const file of files) {
      const filePath = path.join(dir, file)
      const stats = fs.statSync(filePath)
      
      if (stats.isDirectory()) {
        this.scanDirectory(filePath, baseDir)
      } else if (stats.isFile()) {
        const relativePath = path.relative(baseDir, filePath)
        this.analyzeFile(filePath, relativePath)
      }
    }
  }

  // 生成报告
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.results.summary,
      files: this.results.files,
      warnings: this.results.warnings,
      errors: this.results.errors,
      status: this.results.errors.length > 0 ? 'failed' : 'passed'
    }
    
    // 添加格式化的汇总信息
    report.summary.formattedTotalSize = this.formatSize(report.summary.totalSize)
    report.summary.formattedTotalGzipSize = this.formatSize(report.summary.totalGzipSize)
    report.summary.compressionRatio = ((report.summary.totalGzipSize / report.summary.totalSize) * 100).toFixed(1)
    
    return report
  }

  // 保存报告到文件
  saveReport(report, fileName = 'bundle-size-report.json') {
    if (!fs.existsSync(CONFIG.reportDir)) {
      fs.mkdirSync(CONFIG.reportDir, { recursive: true })
    }
    
    const reportPath = path.join(CONFIG.reportDir, fileName)
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    console.log(chalk.green(`Report saved to ${reportPath}`))
    return reportPath
  }

  // 打印控制台报告
  printConsoleReport(report) {
    console.log(chalk.bold('\n📦 Bundle Size Analysis Report\n'))
    
    // 汇总信息
    console.log(chalk.bold('Summary:'))
    console.log(`  Total files: ${report.summary.fileCount}`)
    console.log(`  Total size: ${chalk.blue(report.summary.formattedTotalSize)}`)
    console.log(`  Gzip size: ${chalk.blue(report.summary.formattedTotalGzipSize)} (${report.summary.compressionRatio}% compression)`)
    console.log()
    
    // 文件详情
    if (report.files.length > 0) {
      console.log(chalk.bold('Files:'))
      
      // 按大小排序
      const sortedFiles = [...report.files].sort((a, b) => b.size - a.size)
      
      for (const file of sortedFiles) {
        let statusIcon = '✅'
        let sizeColor = 'white'
        
        if (file.status === 'error') {
          statusIcon = '❌'
          sizeColor = 'red'
        } else if (file.status === 'warning') {
          statusIcon = '⚠️'
          sizeColor = 'yellow'
        }
        
        let output = `  ${statusIcon} ${file.path}`
        output += ` - ${chalk[sizeColor](file.formattedSize)}`
        output += ` (gzip: ${chalk[sizeColor](file.formattedGzipSize)})`
        
        if (file.limit) {
          output += ` - ${file.percentage.toFixed(1)}% of limit`
        }
        
        console.log(output)
      }
    }
    
    // 警告信息
    if (report.warnings.length > 0) {
      console.log(chalk.yellow('\n⚠️  Warnings:'))
      for (const warning of report.warnings) {
        console.log(`  ${warning.message}`)
      }
    }
    
    // 错误信息
    if (report.errors.length > 0) {
      console.log(chalk.red('\n❌ Errors:'))
      for (const error of report.errors) {
        console.log(`  ${error.message}`)
      }
    }
    
    // 最终状态
    console.log()
    if (report.status === 'passed') {
      console.log(chalk.green('✅ All checks passed!'))
    } else {
      console.log(chalk.red('❌ Some checks failed!'))
    }
    
    console.log()
  }

  // 生成 Markdown 报告
  generateMarkdownReport(report) {
    let markdown = '# Bundle Size Report\n\n'
    
    markdown += `**Generated:** ${new Date(report.timestamp).toLocaleString()}\n\n`
    
    // 汇总
    markdown += '## Summary\n\n'
    markdown += `- **Total Files:** ${report.summary.fileCount}\n`
    markdown += `- **Total Size:** ${report.summary.formattedTotalSize}\n`
    markdown += `- **Gzip Size:** ${report.summary.formattedTotalGzipSize} (${report.summary.compressionRatio}% compression)\n`
    markdown += `- **Status:** ${report.status === 'passed' ? '✅ Passed' : '❌ Failed'}\n\n`
    
    // 文件表格
    if (report.files.length > 0) {
      markdown += '## Files\n\n'
      markdown += '| File | Size | Gzip | Limit | Usage |\n'
      markdown += '|------|------|------|-------|-------|\n'
      
      const sortedFiles = [...report.files].sort((a, b) => b.size - a.size)
      
      for (const file of sortedFiles) {
        const status = file.status === 'error' ? '❌' : file.status === 'warning' ? '⚠️' : '✅'
        const usage = file.percentage ? `${file.percentage.toFixed(1)}%` : 'N/A'
        const limit = file.formattedLimit || 'N/A'
        
        markdown += `| ${status} ${file.path} | ${file.formattedSize} | ${file.formattedGzipSize} | ${limit} | ${usage} |\n`
      }
      markdown += '\n'
    }
    
    // 警告和错误
    if (report.warnings.length > 0) {
      markdown += '## ⚠️ Warnings\n\n'
      for (const warning of report.warnings) {
        markdown += `- ${warning.message}\n`
      }
      markdown += '\n'
    }
    
    if (report.errors.length > 0) {
      markdown += '## ❌ Errors\n\n'
      for (const error of report.errors) {
        markdown += `- ${error.message}\n`
      }
      markdown += '\n'
    }
    
    return markdown
  }

  // 运行分析
  run() {
    console.log(chalk.bold('🔍 Starting bundle size analysis...\n'))
    
    this.scanDirectory(CONFIG.distDir)
    const report = this.generateReport()
    
    // 保存 JSON 报告
    this.saveReport(report)
    
    // 保存 Markdown 报告
    const markdownReport = this.generateMarkdownReport(report)
    const markdownPath = path.join(CONFIG.reportDir, 'bundle-size-report.md')
    fs.writeFileSync(markdownPath, markdownReport)
    console.log(chalk.green(`Markdown report saved to ${markdownPath}`))
    
    // 打印控制台报告
    this.printConsoleReport(report)
    
    // 如果有错误，退出时返回错误码
    if (report.errors.length > 0) {
      process.exit(1)
    }
    
    return report
  }
}

// 主函数
function main() {
  try {
    const analyzer = new BundleSizeAnalyzer()
    return analyzer.run()
  } catch (error) {
    console.error(chalk.red('❌ Analysis failed:'), error.message)
    process.exit(1)
  }
}

// 如果直接运行脚本
if (require.main === module) {
  main()
}

module.exports = { BundleSizeAnalyzer, CONFIG }

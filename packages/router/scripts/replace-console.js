#!/usr/bin/env node

/**
 * 脚本：将所有 console.* 替换为 logger.*
 * 
 * 使用方式：
 * node scripts/replace-console.js
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

// 配置
const config = {
  srcDir: path.resolve(__dirname, '../src'),
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  excludeDirs: ['node_modules', 'dist', 'lib', 'build', '.git'],
  loggerImportPath: '@/utils/logger'
}

// 替换规则
const replacementRules = [
  { from: /console\.log\(/g, to: 'logger.debug(' },
  { from: /console\.info\(/g, to: 'logger.info(' },
  { from: /console\.warn\(/g, to: 'logger.warn(' },
  { from: /console\.error\(/g, to: 'logger.error(' },
  { from: /console\.debug\(/g, to: 'logger.debug(' },
  { from: /console\.trace\(/g, to: 'logger.debug(' },
  { from: /console\.group\(/g, to: 'logger.group(' },
  { from: /console\.groupEnd\(/g, to: 'logger.groupEnd(' },
  { from: /console\.table\(/g, to: 'logger.table(' },
  { from: /console\.time\(/g, to: 'logger.time(' },
  { from: /console\.timeEnd\(/g, to: 'logger.timeEnd(' },
  { from: /console\.clear\(/g, to: 'logger.clear(' }
]

// 特殊文件处理（不需要替换的文件）
const excludeFiles = [
  'logger.ts',
  'logger.js',
  'console-polyfill.ts',
  'console-polyfill.js'
]

/**
 * 检查文件是否应该被处理
 */
function shouldProcessFile(filePath) {
  const fileName = path.basename(filePath)
  
  // 排除特定文件
  if (excludeFiles.includes(fileName)) {
    return false
  }
  
  // 检查文件扩展名
  const ext = path.extname(filePath)
  return config.extensions.includes(ext)
}

/**
 * 检查文件是否已经导入了 logger
 */
function hasLoggerImport(content) {
  const importRegex = /import\s+.*logger.*\s+from\s+['"].*logger['"]/
  return importRegex.test(content)
}

/**
 * 添加 logger 导入语句
 */
function addLoggerImport(content, filePath) {
  if (hasLoggerImport(content)) {
    return content
  }
  
  // 计算相对路径
  const fileDir = path.dirname(filePath)
  const loggerPath = path.resolve(config.srcDir, 'utils/logger')
  let relativePath = path.relative(fileDir, loggerPath).replace(/\\/g, '/')
  
  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath
  }
  
  // 移除 .ts 扩展名
  relativePath = relativePath.replace(/\.ts$/, '')
  
  const importStatement = `import { logger } from '${relativePath}'\n`
  
  // 查找第一个 import 语句的位置
  const firstImportMatch = content.match(/^import\s+/m)
  
  if (firstImportMatch) {
    // 在第一个 import 语句之前添加
    const index = firstImportMatch.index
    return content.slice(0, index) + importStatement + content.slice(index)
  } else {
    // 如果没有 import 语句，添加到文件开头
    const commentMatch = content.match(/^(\/\*[\s\S]*?\*\/|\/\/.*\n)+/)
    if (commentMatch) {
      // 在注释之后添加
      const index = commentMatch.index + commentMatch[0].length
      return content.slice(0, index) + '\n' + importStatement + '\n' + content.slice(index)
    } else {
      // 直接添加到文件开头
      return importStatement + '\n' + content
    }
  }
}

/**
 * 处理单个文件
 */
function processFile(filePath) {
  if (!shouldProcessFile(filePath)) {
    return { processed: false, reason: 'excluded' }
  }
  
  let content = fs.readFileSync(filePath, 'utf8')
  const originalContent = content
  
  // 检查是否有 console 语句
  const hasConsole = /console\.\w+\(/.test(content)
  
  if (!hasConsole) {
    return { processed: false, reason: 'no console statements' }
  }
  
  // 应用替换规则
  let modified = false
  replacementRules.forEach(rule => {
    if (rule.from.test(content)) {
      content = content.replace(rule.from, rule.to)
      modified = true
    }
  })
  
  if (!modified) {
    return { processed: false, reason: 'no matching console statements' }
  }
  
  // 添加 logger 导入
  content = addLoggerImport(content, filePath)
  
  // 写回文件
  fs.writeFileSync(filePath, content, 'utf8')
  
  return {
    processed: true,
    changes: content !== originalContent
  }
}

/**
 * 递归获取所有源文件
 */
function getAllSourceFiles(dir) {
  const pattern = `${dir}/**/*.{${config.extensions.map(ext => ext.slice(1)).join(',')}}`
  const files = glob.sync(pattern, {
    ignore: config.excludeDirs.map(d => `**/${d}/**`)
  })
  return files
}

/**
 * 主函数
 */
function main() {
  console.log('🔧 Starting console replacement...')
  console.log(`📁 Source directory: ${config.srcDir}`)
  
  const files = getAllSourceFiles(config.srcDir)
  console.log(`📋 Found ${files.length} files to check`)
  
  let processedCount = 0
  let modifiedCount = 0
  const results = []
  
  files.forEach(file => {
    const result = processFile(file)
    
    if (result.processed) {
      processedCount++
      if (result.changes) {
        modifiedCount++
        results.push({
          file: path.relative(config.srcDir, file),
          status: '✅ Modified'
        })
      }
    }
  })
  
  console.log(`\n📊 Results:`)
  console.log(`   - Files checked: ${files.length}`)
  console.log(`   - Files processed: ${processedCount}`)
  console.log(`   - Files modified: ${modifiedCount}`)
  
  if (results.length > 0) {
    console.log('\n📝 Modified files:')
    results.forEach(r => {
      console.log(`   ${r.status} ${r.file}`)
    })
  }
  
  console.log('\n✨ Console replacement completed!')
}

// 运行脚本
if (require.main === module) {
  main()
}
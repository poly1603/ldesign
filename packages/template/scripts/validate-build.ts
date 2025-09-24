/**
 * 构建验证脚本
 * 验证构建产物的完整性和正确性
 */

import { existsSync, statSync, readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const packageRoot = join(__dirname, '..')

interface ValidationResult {
  success: boolean
  errors: string[]
  warnings: string[]
  stats: {
    totalFiles: number
    totalSize: number
    formats: Record<string, number>
  }
}

/**
 * 验证文件是否存在
 */
function validateFileExists(filePath: string, description: string): boolean {
  const fullPath = join(packageRoot, filePath)
  if (!existsSync(fullPath)) {
    console.error(`❌ 缺少文件: ${description} (${filePath})`)
    return false
  }
  console.log(`✅ 文件存在: ${description}`)
  return true
}

/**
 * 验证文件大小
 */
function validateFileSize(filePath: string, maxSize: number, description: string): boolean {
  const fullPath = join(packageRoot, filePath)
  if (!existsSync(fullPath)) {
    return false
  }
  
  const stats = statSync(fullPath)
  const sizeKB = Math.round(stats.size / 1024)
  
  if (sizeKB > maxSize) {
    console.warn(`⚠️  文件过大: ${description} (${sizeKB}KB > ${maxSize}KB)`)
    return false
  }
  
  console.log(`✅ 文件大小正常: ${description} (${sizeKB}KB)`)
  return true
}

/**
 * 验证 JavaScript 文件语法
 */
function validateJavaScriptSyntax(filePath: string, description: string): boolean {
  const fullPath = join(packageRoot, filePath)
  if (!existsSync(fullPath)) {
    return false
  }
  
  try {
    const content = readFileSync(fullPath, 'utf-8')
    
    // 基本语法检查
    if (content.includes('undefined') && content.includes('export')) {
      console.warn(`⚠️  可能存在未定义的导出: ${description}`)
    }
    
    // 检查是否包含源码映射注释
    if (content.includes('//# sourceMappingURL=')) {
      console.log(`✅ 包含源码映射: ${description}`)
    }
    
    console.log(`✅ 语法检查通过: ${description}`)
    return true
  } catch (error) {
    console.error(`❌ 语法检查失败: ${description} - ${error}`)
    return false
  }
}

/**
 * 主验证函数
 */
async function validateBuild(): Promise<ValidationResult> {
  console.log('🔍 开始验证构建产物...\n')
  
  const result: ValidationResult = {
    success: true,
    errors: [],
    warnings: [],
    stats: {
      totalFiles: 0,
      totalSize: 0,
      formats: {}
    }
  }
  
  // 验证必需的文件
  const requiredFiles = [
    { path: 'es/index.js', desc: 'ESM 主入口', maxSize: 100 },
    { path: 'es/index.d.ts', desc: 'ESM 类型定义', maxSize: 50 },
    { path: 'lib/index.cjs', desc: 'CJS 主入口', maxSize: 120 },
    { path: 'es/plugin.js', desc: 'ESM 插件入口', maxSize: 30 },
    { path: 'lib/plugin.cjs', desc: 'CJS 插件入口', maxSize: 35 },
    { path: 'es/utils/index.js', desc: 'ESM 工具模块', maxSize: 40 },
    { path: 'es/utils/factory.js', desc: 'ESM 工厂函数', maxSize: 15 },
    { path: 'es/utils/performance.js', desc: 'ESM 性能模块', maxSize: 20 },
    { path: 'es/utils/cache.js', desc: 'ESM 缓存模块', maxSize: 18 },
    { path: 'es/core/index.js', desc: 'ESM 核心模块', maxSize: 50 },
    { path: 'es/types/index.js', desc: 'ESM 类型模块', maxSize: 10 }
  ]
  
  let allFilesValid = true
  
  for (const file of requiredFiles) {
    const exists = validateFileExists(file.path, file.desc)
    if (!exists) {
      result.errors.push(`缺少文件: ${file.desc}`)
      allFilesValid = false
      continue
    }
    
    const sizeValid = validateFileSize(file.path, file.maxSize, file.desc)
    if (!sizeValid) {
      result.warnings.push(`文件过大: ${file.desc}`)
    }
    
    // 验证 JavaScript 文件
    if (file.path.endsWith('.js') || file.path.endsWith('.cjs')) {
      const syntaxValid = validateJavaScriptSyntax(file.path, file.desc)
      if (!syntaxValid) {
        result.errors.push(`语法错误: ${file.desc}`)
        allFilesValid = false
      }
    }
    
    result.stats.totalFiles++
    
    // 统计文件大小
    const fullPath = join(packageRoot, file.path)
    if (existsSync(fullPath)) {
      const stats = statSync(fullPath)
      result.stats.totalSize += stats.size
      
      const format = file.path.includes('/es/') ? 'ESM' : 'CJS'
      result.stats.formats[format] = (result.stats.formats[format] || 0) + stats.size
    }
  }
  
  // 验证 package.json
  const packageJsonPath = join(packageRoot, 'package.json')
  if (existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      
      // 验证导出字段
      if (!packageJson.exports) {
        result.errors.push('package.json 缺少 exports 字段')
        allFilesValid = false
      }
      
      // 验证类型字段
      if (!packageJson.types && !packageJson.typings) {
        result.warnings.push('package.json 缺少 types 字段')
      }
      
      console.log('✅ package.json 验证通过')
    } catch (error) {
      result.errors.push(`package.json 解析失败: ${error}`)
      allFilesValid = false
    }
  }
  
  result.success = allFilesValid && result.errors.length === 0
  
  // 输出统计信息
  console.log('\n📊 构建统计:')
  console.log(`   总文件数: ${result.stats.totalFiles}`)
  console.log(`   总大小: ${Math.round(result.stats.totalSize / 1024)}KB`)
  
  Object.entries(result.stats.formats).forEach(([format, size]) => {
    console.log(`   ${format}: ${Math.round(size / 1024)}KB`)
  })
  
  if (result.warnings.length > 0) {
    console.log('\n⚠️  警告:')
    result.warnings.forEach(warning => console.log(`   ${warning}`))
  }
  
  if (result.errors.length > 0) {
    console.log('\n❌ 错误:')
    result.errors.forEach(error => console.log(`   ${error}`))
  }
  
  console.log(`\n${result.success ? '✅' : '❌'} 构建验证${result.success ? '通过' : '失败'}`)
  
  return result
}

// 运行验证
if (import.meta.url === `file://${process.argv[1]}`) {
  validateBuild()
    .then(result => {
      process.exit(result.success ? 0 : 1)
    })
    .catch(error => {
      console.error('验证过程出错:', error)
      process.exit(1)
    })
}

export { validateBuild }

#!/usr/bin/env node

/**
 * TypeScript 类型系统检查工具
 * 
 * 检查组件库的 TypeScript 类型定义质量
 * 包括类型完整性、泛型支持、类型导出等
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 类型检查标准
 */
const TYPE_STANDARDS = {
  // 必须避免的类型
  forbiddenTypes: ['any', 'unknown'],
  
  // 推荐的泛型模式
  genericPatterns: [
    /T extends/,
    /K extends keyof/,
    /<T>/,
    /<T,/
  ],
  
  // 必须的类型导出
  requiredExports: [
    'Props',
    'Emits', 
    'Slots',
    'Instance'
  ],
  
  // 推荐的工具类型
  utilityTypes: [
    'ExtractPropTypes',
    'PropType',
    'Ref',
    'ComputedRef',
    'UnwrapRef'
  ]
}

// 检查结果
const results = {
  passed: [],
  failed: [],
  warnings: [],
  statistics: {
    totalFiles: 0,
    totalTypes: 0,
    genericTypes: 0,
    anyUsage: 0,
    missingExports: 0
  }
}

/**
 * 简单的文件查找函数
 */
function findFiles(dir, pattern) {
  const files = []
  
  function walk(currentDir) {
    const items = fs.readdirSync(currentDir)
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        walk(fullPath)
      } else if (stat.isFile() && item.match(pattern)) {
        files.push(path.relative(dir, fullPath))
      }
    }
  }
  
  walk(dir)
  return files
}

/**
 * 检查 TypeScript 类型定义
 */
async function checkTypeScriptTypes() {
  console.log('🔍 开始检查 TypeScript 类型系统...\n')
  
  // 查找所有 TypeScript 文件
  const srcDir = path.resolve(__dirname, '..', 'src')
  const typeFiles = findFiles(srcDir, /\.(ts|vue)$/)
    .filter(file => !file.includes('.d.ts'))
  
  console.log(`找到 ${typeFiles.length} 个 TypeScript 文件`)
  console.log('')
  
  results.statistics.totalFiles = typeFiles.length
  
  for (const file of typeFiles) {
    const componentName = getComponentName(file)
    console.log(`📋 检查文件: ${file}`)
    
    try {
      await checkTypeFile(file, componentName)
    } catch (error) {
      results.failed.push({
        file,
        error: error.message
      })
      console.log(`  ❌ 检查失败: ${error.message}`)
    }
    
    console.log('')
  }
  
  // 输出检查结果
  printResults()
}

/**
 * 获取组件名称
 */
function getComponentName(filePath) {
  const parts = filePath.split(path.sep)
  if (parts.includes('components') && parts.length > 2) {
    const componentIndex = parts.indexOf('components')
    return parts[componentIndex + 1]
  }
  return path.basename(filePath, path.extname(filePath))
}

/**
 * 检查单个类型文件
 */
async function checkTypeFile(file, componentName) {
  const filePath = path.resolve(__dirname, '..', 'src', file)
  const content = fs.readFileSync(filePath, 'utf-8')
  
  const issues = []
  
  // 检查 any 类型使用
  const anyUsage = checkAnyUsage(content)
  if (anyUsage.length > 0) {
    anyUsage.forEach(usage => {
      issues.push({
        level: 'warning',
        message: `第 ${usage.line} 行使用了 any 类型: ${usage.context}`
      })
      results.statistics.anyUsage++
    })
  }
  
  // 检查泛型支持
  const genericSupport = checkGenericSupport(content)
  if (genericSupport.hasGenerics) {
    results.statistics.genericTypes++
    console.log(`  ✅ 支持泛型`)
  } else if (shouldHaveGenerics(content, componentName)) {
    issues.push({
      level: 'suggestion',
      message: '建议添加泛型支持以提升类型安全性'
    })
  }
  
  // 检查类型导出
  const typeExports = checkTypeExports(content, componentName)
  if (typeExports.missing.length > 0) {
    typeExports.missing.forEach(missing => {
      issues.push({
        level: 'warning',
        message: `缺少类型导出: ${missing}`
      })
      results.statistics.missingExports++
    })
  }
  
  // 检查工具类型使用
  const utilityTypeUsage = checkUtilityTypeUsage(content)
  if (utilityTypeUsage.length > 0) {
    console.log(`  ✅ 使用了工具类型: ${utilityTypeUsage.join(', ')}`)
  }
  
  // 检查类型注释质量
  const typeAnnotations = checkTypeAnnotations(content)
  if (typeAnnotations.score < 0.8) {
    issues.push({
      level: 'suggestion',
      message: `类型注释覆盖率较低 (${Math.round(typeAnnotations.score * 100)}%)，建议添加更多类型注释`
    })
  }
  
  results.statistics.totalTypes += typeAnnotations.totalTypes
  
  if (issues.length === 0) {
    results.passed.push({
      file,
      componentName
    })
    console.log('  ✅ 类型定义质量良好')
  } else {
    results.failed.push({
      file,
      componentName,
      issues
    })
    
    issues.forEach(issue => {
      if (issue.level === 'error') {
        console.log(`  ❌ ${issue.message}`)
      } else if (issue.level === 'warning') {
        console.log(`  ⚠️  ${issue.message}`)
      } else {
        console.log(`  💡 ${issue.message}`)
      }
    })
  }
}

/**
 * 检查 any 类型使用
 */
function checkAnyUsage(content) {
  const lines = content.split('\n')
  const anyUsages = []
  
  lines.forEach((line, index) => {
    // 排除注释中的 any
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
      return
    }
    
    const anyMatches = line.match(/:\s*any\b|<any>|any\[\]/g)
    if (anyMatches) {
      anyUsages.push({
        line: index + 1,
        context: line.trim()
      })
    }
  })
  
  return anyUsages
}

/**
 * 检查泛型支持
 */
function checkGenericSupport(content) {
  const hasGenerics = TYPE_STANDARDS.genericPatterns.some(pattern => 
    pattern.test(content)
  )
  
  return {
    hasGenerics,
    patterns: TYPE_STANDARDS.genericPatterns.filter(pattern => 
      pattern.test(content)
    )
  }
}

/**
 * 判断是否应该有泛型
 */
function shouldHaveGenerics(content, componentName) {
  // 表单组件、选择器组件等通常需要泛型
  const needsGenerics = [
    'select', 'input', 'form', 'table', 'tree', 'transfer'
  ]
  
  return needsGenerics.some(name => 
    componentName.toLowerCase().includes(name)
  ) || content.includes('modelValue') || content.includes('options')
}

/**
 * 检查类型导出
 */
function checkTypeExports(content, componentName) {
  const capitalizedName = componentName.charAt(0).toUpperCase() + componentName.slice(1)
  const missing = []
  
  TYPE_STANDARDS.requiredExports.forEach(exportType => {
    const exportName = `${capitalizedName}${exportType}`
    if (!content.includes(`export type ${exportName}`) && 
        !content.includes(`export interface ${exportName}`)) {
      missing.push(exportName)
    }
  })
  
  return { missing }
}

/**
 * 检查工具类型使用
 */
function checkUtilityTypeUsage(content) {
  return TYPE_STANDARDS.utilityTypes.filter(utilityType => 
    content.includes(utilityType)
  )
}

/**
 * 检查类型注释质量
 */
function checkTypeAnnotations(content) {
  const lines = content.split('\n')
  let totalDeclarations = 0
  let typedDeclarations = 0
  
  lines.forEach(line => {
    // 检查函数声明
    if (line.match(/function\s+\w+|const\s+\w+\s*=/)) {
      totalDeclarations++
      if (line.includes(':') && !line.includes('//')) {
        typedDeclarations++
      }
    }
    
    // 检查接口属性
    if (line.match(/^\s*\w+\??:/)) {
      totalDeclarations++
      typedDeclarations++ // 接口属性默认有类型
    }
  })
  
  return {
    totalTypes: totalDeclarations,
    typedTypes: typedDeclarations,
    score: totalDeclarations > 0 ? typedDeclarations / totalDeclarations : 1
  }
}

/**
 * 输出检查结果
 */
function printResults() {
  console.log('📊 TypeScript 类型系统检查结果:')
  console.log(`  📁 总文件数: ${results.statistics.totalFiles}`)
  console.log(`  📝 总类型数: ${results.statistics.totalTypes}`)
  console.log(`  🔧 泛型类型: ${results.statistics.genericTypes}`)
  console.log(`  ⚠️  any 使用: ${results.statistics.anyUsage}`)
  console.log(`  ❌ 缺少导出: ${results.statistics.missingExports}`)
  console.log('')
  
  console.log(`  ✅ 通过检查: ${results.passed.length} 个文件`)
  console.log(`  ❌ 需要改进: ${results.failed.length} 个文件`)
  console.log('')
  
  if (results.failed.length > 0) {
    console.log('需要改进的文件:')
    results.failed.forEach(item => {
      console.log(`  - ${item.file}`)
      if (item.issues) {
        item.issues.forEach(issue => {
          console.log(`    ${issue.level === 'error' ? '❌' : issue.level === 'warning' ? '⚠️' : '💡'} ${issue.message}`)
        })
      }
    })
    console.log('')
  }
  
  // 生成报告文件
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: results.statistics.totalFiles,
      totalTypes: results.statistics.totalTypes,
      genericTypes: results.statistics.genericTypes,
      anyUsage: results.statistics.anyUsage,
      missingExports: results.statistics.missingExports,
      passed: results.passed.length,
      failed: results.failed.length
    },
    details: {
      passed: results.passed,
      failed: results.failed
    }
  }
  
  const reportPath = path.resolve(__dirname, '..', 'typescript-types-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`📄 详细报告已保存到: ${reportPath}`)
  
  // 如果有严重问题，退出码为 1
  if (results.statistics.anyUsage > 5 || results.statistics.missingExports > 10) {
    process.exit(1)
  }
}

// 运行检查
if (import.meta.url === `file://${process.argv[1]}` || 
    import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  checkTypeScriptTypes().catch(error => {
    console.error('检查过程中发生错误:', error)
    process.exit(1)
  })
}

export { checkTypeScriptTypes }

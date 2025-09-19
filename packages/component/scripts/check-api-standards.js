#!/usr/bin/env node

/**
 * API 设计规范检查工具
 * 
 * 检查所有组件是否符合 API 设计规范
 * 包括 Props、Events、Slots、实例方法的命名和结构
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

// 规范检查规则
const STANDARDS = {
  // Props 规范
  props: {
    // 必须包含的基础属性
    requiredBaseProps: ['size', 'disabled', 'class', 'style'],
    // 尺寸属性的标准值
    sizeValues: ['small', 'medium', 'large'],
    // 状态属性的标准值
    statusValues: ['default', 'primary', 'success', 'warning', 'error'],
    // 布尔属性命名模式
    booleanPropPatterns: [
      /^(disabled|readonly|required|loading|visible|multiple|clearable|searchable|sortable)$/,
      /^(show|hide|enable|disable)[A-Z]/
    ]
  },
  
  // Events 规范
  events: {
    // 标准事件名称
    standardEvents: ['click', 'focus', 'blur', 'change', 'input', 'clear', 'select'],
    // 自定义事件命名模式
    customEventPatterns: [
      /^(show|hide|open|close|expand|collapse|search|filter|sort)$/,
      /^(before|after)[A-Z]/
    ]
  },
  
  // Slots 规范
  slots: {
    // 标准插槽名称
    standardSlots: ['default', 'header', 'footer', 'prefix', 'suffix', 'icon', 'label', 'description', 'extra'],
    // 插槽命名模式
    slotPatterns: [
      /^(item|option|tab|step|column)[A-Z]?/,
      /^(empty|loading|error)[A-Z]?/
    ]
  }
}

// 检查结果
const results = {
  passed: [],
  failed: [],
  warnings: []
}

/**
 * 检查组件类型文件
 */
async function checkComponentTypes() {
  console.log('🔍 开始检查组件 API 设计规范...\n')
  
  // 查找所有组件的 types.ts 文件
  const componentsDir = path.resolve(__dirname, '..', 'src', 'components')
  console.log('查找目录:', componentsDir)

  const typeFiles = findFiles(componentsDir, /^types\.ts$/)
    .map(file => path.join('src', 'components', file))

  console.log('找到的类型文件:', typeFiles)
  
  for (const file of typeFiles) {
    const componentName = path.basename(path.dirname(file))
    console.log(`📋 检查组件: ${componentName}`)
    
    try {
      await checkComponentFile(file, componentName)
    } catch (error) {
      results.failed.push({
        component: componentName,
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
 * 检查单个组件文件
 */
async function checkComponentFile(file, componentName) {
  const filePath = path.resolve(__dirname, '..', file)
  const content = fs.readFileSync(filePath, 'utf-8')
  
  const issues = []
  
  // 检查 Props 定义
  const propsIssues = checkPropsDefinition(content, componentName)
  issues.push(...propsIssues)
  
  // 检查 Events 定义
  const eventsIssues = checkEventsDefinition(content, componentName)
  issues.push(...eventsIssues)
  
  // 检查类型导出
  const exportsIssues = checkTypeExports(content, componentName)
  issues.push(...exportsIssues)
  
  // 检查命名规范
  const namingIssues = checkNamingConventions(content, componentName)
  issues.push(...namingIssues)
  
  if (issues.length === 0) {
    results.passed.push({
      component: componentName,
      file
    })
    console.log('  ✅ 通过所有检查')
  } else {
    results.failed.push({
      component: componentName,
      file,
      issues
    })
    
    issues.forEach(issue => {
      if (issue.level === 'error') {
        console.log(`  ❌ ${issue.message}`)
      } else {
        console.log(`  ⚠️  ${issue.message}`)
        results.warnings.push({
          component: componentName,
          file,
          issue
        })
      }
    })
  }
}

/**
 * 检查 Props 定义
 */
function checkPropsDefinition(content, componentName) {
  const issues = []
  
  // 检查是否使用 const + PropType 定义
  const hasConstProps = content.includes(`export const ${componentName.toLowerCase()}Props = {`)
  if (!hasConstProps) {
    issues.push({
      level: 'error',
      message: 'Props 应该使用 const + PropType 方式定义'
    })
  }
  
  // 检查基础属性
  STANDARDS.props.requiredBaseProps.forEach(prop => {
    if (!content.includes(`${prop}:`)) {
      issues.push({
        level: 'warning',
        message: `缺少基础属性: ${prop}`
      })
    }
  })
  
  // 检查 size 属性的值
  if (content.includes('size:') && content.includes('PropType<')) {
    const sizeTypeMatch = content.match(/type\s+\w+Size\s*=\s*['"`]([^'"`]+)['"`]/)
    if (sizeTypeMatch) {
      const sizeValues = sizeTypeMatch[1].split('|').map(v => v.trim().replace(/['"]/g, ''))
      const invalidSizes = sizeValues.filter(size => !STANDARDS.props.sizeValues.includes(size))
      if (invalidSizes.length > 0) {
        issues.push({
          level: 'warning',
          message: `size 属性包含非标准值: ${invalidSizes.join(', ')}`
        })
      }
    }
  }
  
  return issues
}

/**
 * 检查 Events 定义
 */
function checkEventsDefinition(content, componentName) {
  const issues = []
  
  // 检查是否使用函数验证方式定义事件
  const hasConstEmits = content.includes(`export const ${componentName.toLowerCase()}Emits = {`)
  if (!hasConstEmits) {
    issues.push({
      level: 'error',
      message: 'Events 应该使用 const + 函数验证方式定义'
    })
  }
  
  // 检查事件验证函数
  const eventMatches = content.match(/(\w+):\s*\([^)]*\)\s*=>/g)
  if (eventMatches) {
    eventMatches.forEach(match => {
      const eventName = match.split(':')[0].trim()
      if (!match.includes('instanceof') && !match.includes('typeof') && !match.includes('true')) {
        issues.push({
          level: 'warning',
          message: `事件 ${eventName} 缺少适当的验证逻辑`
        })
      }
    })
  }
  
  return issues
}

/**
 * 检查类型导出
 */
function checkTypeExports(content, componentName) {
  const issues = []

  const capitalizedName = componentName.charAt(0).toUpperCase() + componentName.slice(1)
  const requiredExports = [
    `${capitalizedName}Props`,
    `${capitalizedName}Emits`,
    `${capitalizedName}Slots`,
    `${capitalizedName}Instance`
  ]
  
  requiredExports.forEach(exportName => {
    if (!content.includes(`export type ${exportName}`) && !content.includes(`export interface ${exportName}`)) {
      issues.push({
        level: 'warning',
        message: `缺少类型导出: ${exportName}`
      })
    }
  })
  
  // 检查是否使用 ExtractPropTypes
  if (content.includes('Props') && !content.includes('ExtractPropTypes')) {
    issues.push({
      level: 'warning',
      message: 'Props 类型应该使用 ExtractPropTypes 提取'
    })
  }
  
  return issues
}

/**
 * 检查命名规范
 */
function checkNamingConventions(content, componentName) {
  const issues = []
  
  // 检查 camelCase 命名
  const propMatches = content.match(/^\s*(\w+):\s*{/gm)
  if (propMatches) {
    propMatches.forEach(match => {
      const propName = match.trim().split(':')[0]
      if (propName.includes('_') || propName.includes('-')) {
        issues.push({
          level: 'error',
          message: `属性名 ${propName} 应该使用 camelCase 命名`
        })
      }
    })
  }
  
  // 检查布尔属性命名
  const booleanProps = content.match(/(\w+):\s*{\s*type:\s*Boolean/g)
  if (booleanProps) {
    booleanProps.forEach(match => {
      const propName = match.split(':')[0].trim()
      const isValidBooleanName = STANDARDS.props.booleanPropPatterns.some(pattern => 
        pattern.test(propName)
      )
      
      if (!isValidBooleanName && !propName.startsWith('is') && !propName.startsWith('has') && !propName.startsWith('can')) {
        issues.push({
          level: 'warning',
          message: `布尔属性 ${propName} 建议使用描述性命名`
        })
      }
    })
  }
  
  return issues
}

/**
 * 输出检查结果
 */
function printResults() {
  console.log('📊 检查结果统计:')
  console.log(`  ✅ 通过: ${results.passed.length} 个组件`)
  console.log(`  ❌ 失败: ${results.failed.length} 个组件`)
  console.log(`  ⚠️  警告: ${results.warnings.length} 个问题`)
  console.log('')
  
  if (results.failed.length > 0) {
    console.log('❌ 检查失败的组件:')
    results.failed.forEach(item => {
      console.log(`  - ${item.component}`)
      if (item.issues) {
        item.issues.forEach(issue => {
          console.log(`    ${issue.level === 'error' ? '❌' : '⚠️'} ${issue.message}`)
        })
      }
    })
    console.log('')
  }
  
  if (results.warnings.length > 0) {
    console.log('⚠️  需要注意的问题:')
    results.warnings.forEach(item => {
      console.log(`  - ${item.component}: ${item.issue.message}`)
    })
    console.log('')
  }
  
  if (results.passed.length > 0) {
    console.log('✅ 完全符合规范的组件:')
    results.passed.forEach(item => {
      console.log(`  - ${item.component}`)
    })
    console.log('')
  }
  
  // 生成报告文件
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.passed.length + results.failed.length,
      passed: results.passed.length,
      failed: results.failed.length,
      warnings: results.warnings.length
    },
    details: {
      passed: results.passed,
      failed: results.failed,
      warnings: results.warnings
    }
  }
  
  const reportPath = path.resolve(__dirname, '..', 'api-standards-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`📄 详细报告已保存到: ${reportPath}`)
  
  // 如果有错误，退出码为 1
  if (results.failed.length > 0) {
    process.exit(1)
  }
}

// 运行检查
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
                     import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))

if (isMainModule) {
  checkComponentTypes().catch(error => {
    console.error('检查过程中发生错误:', error)
    process.exit(1)
  })
}

export {
  checkComponentTypes,
  STANDARDS
}

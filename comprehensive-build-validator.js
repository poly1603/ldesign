#!/usr/bin/env node

/**
 * 全面验证 ldesign 项目包构建一致性和完整性
 */

import { existsSync, readdirSync, statSync, readFileSync } from 'fs'
import { join } from 'path'

const packages = [
  'color', 'crypto', 'device', 'engine', 'form',
  'http', 'i18n', 'router', 'store', 'template', 'watermark'
]

const expectedStructure = {
  dist: ['index.js', 'index.min.js', 'index.d.ts'],
  es: ['index.js'],
  lib: ['index.js'],
  types: ['index.d.ts']
}

console.log('🔍 LDesign 包构建一致性和完整性验证报告')
console.log('='.repeat(60))

const results = {
  packages: {},
  summary: {
    total: packages.length,
    complete: 0,
    partial: 0,
    failed: 0,
    issues: []
  }
}

// 验证单个包的结构
function validatePackageStructure(packageName) {
  const packagePath = join('packages', packageName)
  const result = {
    name: packageName,
    status: 'unknown',
    structure: {},
    issues: [],
    score: 0
  }

  // 检查每个目录
  for (const [dir, expectedFiles] of Object.entries(expectedStructure)) {
    const dirPath = join(packagePath, dir)
    result.structure[dir] = {
      exists: existsSync(dirPath),
      files: [],
      missing: [],
      extra: []
    }

    if (result.structure[dir].exists) {
      try {
        const actualFiles = readdirSync(dirPath).filter(f => 
          statSync(join(dirPath, f)).isFile()
        )
        result.structure[dir].files = actualFiles

        // 检查缺失的文件
        for (const expectedFile of expectedFiles) {
          if (!actualFiles.includes(expectedFile)) {
            result.structure[dir].missing.push(expectedFile)
          }
        }

        // 检查额外的文件
        for (const actualFile of actualFiles) {
          if (!expectedFiles.includes(actualFile) && !actualFile.endsWith('.map')) {
            result.structure[dir].extra.push(actualFile)
          }
        }
      } catch (error) {
        result.issues.push(`无法读取 ${dir} 目录: ${error.message}`)
      }
    } else {
      result.structure[dir].missing = [...expectedFiles]
    }
  }

  // 计算得分
  let totalExpected = 0
  let totalFound = 0
  
  for (const [dir, info] of Object.entries(result.structure)) {
    const expected = expectedStructure[dir].length
    const found = expected - info.missing.length
    totalExpected += expected
    totalFound += found
  }

  result.score = Math.round((totalFound / totalExpected) * 100)

  // 确定状态
  if (result.score === 100) {
    result.status = 'complete'
    results.summary.complete++
  } else if (result.score >= 50) {
    result.status = 'partial'
    results.summary.partial++
  } else {
    result.status = 'failed'
    results.summary.failed++
  }

  return result
}

// 验证 package.json 配置
function validatePackageJson(packageName) {
  const packageJsonPath = join('packages', packageName, 'package.json')
  const issues = []

  if (!existsSync(packageJsonPath)) {
    issues.push('package.json 不存在')
    return issues
  }

  try {
    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
    
    // 检查关键字段
    const expectedFields = {
      main: 'dist/index.js',
      module: 'es/index.js',
      types: 'dist/index.d.ts'
    }

    for (const [field, expectedValue] of Object.entries(expectedFields)) {
      if (!pkg[field]) {
        issues.push(`缺少 ${field} 字段`)
      } else if (pkg[field] !== expectedValue) {
        issues.push(`${field} 字段值不正确: 期望 "${expectedValue}", 实际 "${pkg[field]}"`)
      }
    }
  } catch (error) {
    issues.push(`解析 package.json 失败: ${error.message}`)
  }

  return issues
}

// 执行验证
console.log('\n📦 验证各包构建结构...\n')

for (const packageName of packages) {
  const result = validatePackageStructure(packageName)
  const packageJsonIssues = validatePackageJson(packageName)
  
  result.packageJsonIssues = packageJsonIssues
  results.packages[packageName] = result

  // 显示结果
  const statusIcon = {
    complete: '✅',
    partial: '⚠️',
    failed: '❌'
  }[result.status]

  console.log(`${statusIcon} ${packageName} (${result.score}%)`)
  
  // 显示详细信息
  for (const [dir, info] of Object.entries(result.structure)) {
    if (!info.exists) {
      console.log(`   📁 ${dir}: ❌ 目录不存在`)
    } else if (info.missing.length > 0) {
      console.log(`   📁 ${dir}: ⚠️ 缺少文件: ${info.missing.join(', ')}`)
    } else {
      console.log(`   📁 ${dir}: ✅ 完整`)
    }
  }

  if (packageJsonIssues.length > 0) {
    console.log(`   📄 package.json: ❌ ${packageJsonIssues.join(', ')}`)
  } else {
    console.log(`   📄 package.json: ✅ 配置正确`)
  }

  if (result.issues.length > 0) {
    console.log(`   ⚠️ 其他问题: ${result.issues.join(', ')}`)
  }

  console.log()
}

// 生成汇总报告
console.log('📊 验证结果汇总')
console.log('='.repeat(40))
console.log(`总包数: ${results.summary.total}`)
console.log(`✅ 完整成功: ${results.summary.complete} 个包`)
console.log(`⚠️ 部分成功: ${results.summary.partial} 个包`)
console.log(`❌ 构建失败: ${results.summary.failed} 个包`)

const successRate = Math.round(((results.summary.complete + results.summary.partial) / results.summary.total) * 100)
console.log(`📈 总体成功率: ${successRate}%`)

// 一致性检查
console.log('\n🔍 一致性检查')
console.log('='.repeat(40))

const structureConsistency = {}
for (const dir of Object.keys(expectedStructure)) {
  const structures = Object.values(results.packages)
    .filter(p => p.structure[dir].exists)
    .map(p => p.structure[dir].files.sort().join(','))
  
  const unique = [...new Set(structures)]
  structureConsistency[dir] = {
    consistent: unique.length <= 1,
    variations: unique.length
  }
  
  if (structureConsistency[dir].consistent) {
    console.log(`✅ ${dir} 目录结构一致`)
  } else {
    console.log(`❌ ${dir} 目录结构不一致 (${unique.length} 种变体)`)
  }
}

// 最终评估
console.log('\n🎯 最终评估')
console.log('='.repeat(40))

if (results.summary.complete === results.summary.total) {
  console.log('🎉 所有包构建完美！达到 100% 成功率')
} else if (successRate >= 90) {
  console.log('👍 构建质量优秀！大部分包都能正常工作')
} else if (successRate >= 70) {
  console.log('⚠️ 构建质量良好，但还有改进空间')
} else {
  console.log('❌ 构建质量需要改进，多个包存在问题')
}

process.exit(successRate >= 80 ? 0 : 1)

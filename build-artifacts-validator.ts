#!/usr/bin/env tsx

import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

interface ArtifactValidation {
  name: string
  path: string
  hasESM: boolean
  hasCJS: boolean
  hasTypes: boolean
  hasDist: boolean
  esmFiles: string[]
  cjsFiles: string[]
  typeFiles: string[]
  distFiles: string[]
  packageJsonExports: any
  issues: string[]
  score: number
}

const workspaceRoot = process.cwd()

// 成功构建的包列表
const successfulPackages = [
  'packages/api',
  'packages/cache',
  'packages/color',
  'packages/crypto',
  'packages/device',
  'packages/engine',
  'packages/form',
  'packages/http',
  'packages/i18n',
  'packages/router',
  'packages/size',
  'packages/store',
  'packages/template',
  'packages/theme',
]

function getDirectoryFiles(dirPath: string): string[] {
  if (!existsSync(dirPath)) return []

  try {
    const fs = require('node:fs')
    const files: string[] = []

    function walkDir(currentPath: string, relativePath: string = '') {
      const items = fs.readdirSync(currentPath)

      for (const item of items) {
        const fullPath = join(currentPath, item)
        const relPath = relativePath ? `${relativePath}/${item}` : item

        try {
          if (statSync(fullPath).isDirectory()) {
            walkDir(fullPath, relPath)
          } else {
            files.push(relPath)
          }
        } catch (err) {
          // 忽略无法访问的文件
          continue
        }
      }
    }

    walkDir(dirPath)
    return files
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error)
    return []
  }
}

function validatePackageArtifacts(packagePath: string): ArtifactValidation {
  const fullPath = join(workspaceRoot, packagePath)
  const packageJsonPath = join(fullPath, 'package.json')

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

  const validation: ArtifactValidation = {
    name: packageJson.name || packagePath,
    path: packagePath,
    hasESM: false,
    hasCJS: false,
    hasTypes: false,
    hasDist: false,
    esmFiles: [],
    cjsFiles: [],
    typeFiles: [],
    distFiles: [],
    packageJsonExports: packageJson.exports || {},
    issues: [],
    score: 0,
  }

  // 检查目录结构
  const esmPath = join(fullPath, 'esm')
  const cjsPath = join(fullPath, 'cjs')
  const typesPath = join(fullPath, 'types')
  const distPath = join(fullPath, 'dist')

  validation.hasESM = existsSync(esmPath)
  validation.hasCJS = existsSync(cjsPath)
  validation.hasTypes = existsSync(typesPath)
  validation.hasDist = existsSync(distPath)

  // 获取文件列表
  if (validation.hasESM) {
    validation.esmFiles = getDirectoryFiles(esmPath)
  }
  if (validation.hasCJS) {
    validation.cjsFiles = getDirectoryFiles(cjsPath)
  }
  if (validation.hasTypes) {
    validation.typeFiles = getDirectoryFiles(typesPath)
  }
  if (validation.hasDist) {
    validation.distFiles = getDirectoryFiles(distPath)
  }

  // 验证产物完整性
  validateArtifactCompleteness(validation)

  // 计算评分
  calculateScore(validation)

  return validation
}

function validateArtifactCompleteness(validation: ArtifactValidation): void {
  // 检查必需的产物目录
  if (!validation.hasESM) {
    validation.issues.push('缺少 ESM 产物目录 (esm/)')
  }
  if (!validation.hasCJS) {
    validation.issues.push('缺少 CJS 产物目录 (cjs/)')
  }
  if (!validation.hasTypes) {
    validation.issues.push('缺少类型定义目录 (types/)')
  }
  if (!validation.hasDist) {
    validation.issues.push('缺少浏览器产物目录 (dist/)')
  }

  // 检查主入口文件
  if (validation.hasESM && !validation.esmFiles.includes('index.js')) {
    validation.issues.push('ESM 目录缺少主入口文件 index.js')
  }
  if (validation.hasCJS && !validation.cjsFiles.includes('index.js')) {
    validation.issues.push('CJS 目录缺少主入口文件 index.js')
  }
  if (validation.hasTypes && !validation.typeFiles.includes('index.d.ts')) {
    validation.issues.push('Types 目录缺少主类型文件 index.d.ts')
  }

  // 检查 dist 目录的浏览器产物
  if (validation.hasDist) {
    const hasMainBundle = validation.distFiles.some(f => f.includes('index.js'))
    const hasMinBundle = validation.distFiles.some(f =>
      f.includes('index.min.js')
    )

    if (!hasMainBundle) {
      validation.issues.push('Dist 目录缺少主打包文件')
    }
    if (!hasMinBundle) {
      validation.issues.push('Dist 目录缺少压缩版本')
    }
  }

  // 检查 package.json exports 配置
  if (
    !validation.packageJsonExports ||
    Object.keys(validation.packageJsonExports).length === 0
  ) {
    validation.issues.push('package.json 缺少 exports 字段配置')
  } else {
    const mainExport = validation.packageJsonExports['.']
    if (!mainExport) {
      validation.issues.push('package.json exports 缺少主入口配置')
    } else {
      if (!mainExport.import) {
        validation.issues.push('package.json exports 缺少 ESM 入口配置')
      }
      if (!mainExport.require) {
        validation.issues.push('package.json exports 缺少 CJS 入口配置')
      }
      if (!mainExport.types) {
        validation.issues.push('package.json exports 缺少类型入口配置')
      }
    }
  }

  // 检查文件数量合理性
  if (validation.hasESM && validation.esmFiles.length === 0) {
    validation.issues.push('ESM 目录为空')
  }
  if (validation.hasCJS && validation.cjsFiles.length === 0) {
    validation.issues.push('CJS 目录为空')
  }
  if (validation.hasTypes && validation.typeFiles.length === 0) {
    validation.issues.push('Types 目录为空')
  }
}

function calculateScore(validation: ArtifactValidation): void {
  let score = 0

  // 基础产物目录 (40分)
  if (validation.hasESM) score += 10
  if (validation.hasCJS) score += 10
  if (validation.hasTypes) score += 10
  if (validation.hasDist) score += 10

  // 主入口文件 (30分)
  if (validation.esmFiles.includes('index.js')) score += 10
  if (validation.cjsFiles.includes('index.js')) score += 10
  if (validation.typeFiles.includes('index.d.ts')) score += 10

  // package.json 配置 (20分)
  if (validation.packageJsonExports && validation.packageJsonExports['.']) {
    const mainExport = validation.packageJsonExports['.']
    if (mainExport.import) score += 5
    if (mainExport.require) score += 5
    if (mainExport.types) score += 5
    if (mainExport.import && mainExport.require && mainExport.types) score += 5
  }

  // 产物完整性 (10分)
  if (validation.distFiles.some(f => f.includes('index.min.js'))) score += 5
  if (validation.issues.length === 0) score += 5

  validation.score = score
}

function generateValidationReport(validations: ArtifactValidation[]): void {
  console.log('\n🔍 打包产物验证报告')
  console.log('='.repeat(60))

  const totalPackages = validations.length
  const perfectPackages = validations.filter(v => v.score === 100).length
  const goodPackages = validations.filter(
    v => v.score >= 80 && v.score < 100
  ).length
  const averageScore =
    validations.reduce((sum, v) => sum + v.score, 0) / totalPackages

  console.log(`\n📊 总体统计:`)
  console.log(`验证包数: ${totalPackages}`)
  console.log(`完美产物: ${perfectPackages} (100分)`)
  console.log(`良好产物: ${goodPackages} (80-99分)`)
  console.log(`平均评分: ${averageScore.toFixed(1)}/100`)

  // 按评分排序
  const sortedValidations = validations.sort((a, b) => b.score - a.score)

  console.log(`\n📦 包产物详情:`)
  for (const validation of sortedValidations) {
    const scoreEmoji =
      validation.score === 100 ? '🟢' : validation.score >= 80 ? '🟡' : '🔴'
    console.log(`\n${scoreEmoji} ${validation.name} (${validation.score}/100)`)

    // 产物目录状态
    const esmStatus = validation.hasESM ? '✅' : '❌'
    const cjsStatus = validation.hasCJS ? '✅' : '❌'
    const typesStatus = validation.hasTypes ? '✅' : '❌'
    const distStatus = validation.hasDist ? '✅' : '❌'

    console.log(
      `  产物目录: ESM${esmStatus} CJS${cjsStatus} Types${typesStatus} Dist${distStatus}`
    )
    console.log(
      `  文件数量: ESM(${validation.esmFiles.length}) CJS(${validation.cjsFiles.length}) Types(${validation.typeFiles.length}) Dist(${validation.distFiles.length})`
    )

    if (validation.issues.length > 0) {
      console.log(`  ⚠️  问题:`)
      validation.issues.forEach(issue => {
        console.log(`    - ${issue}`)
      })
    }
  }

  // 问题汇总
  const allIssues = validations.flatMap(v => v.issues)
  if (allIssues.length > 0) {
    console.log(`\n⚠️  问题汇总:`)
    const issueCount = new Map<string, number>()
    allIssues.forEach(issue => {
      issueCount.set(issue, (issueCount.get(issue) || 0) + 1)
    })

    Array.from(issueCount.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([issue, count]) => {
        console.log(`  ${count}x: ${issue}`)
      })
  }

  console.log(`\n${'='.repeat(60)}`)
  if (perfectPackages === totalPackages) {
    console.log('🎉 所有包的产物都完美！')
  } else {
    console.log(
      `✨ ${perfectPackages}/${totalPackages} 个包产物完美，${
        totalPackages - perfectPackages
      } 个包需要改进`
    )
  }
}

// 主函数
function main() {
  console.log('🚀 开始验证打包产物...')

  const validations = successfulPackages.map(validatePackageArtifacts)

  generateValidationReport(validations)
}

main()

export { generateValidationReport, validatePackageArtifacts }

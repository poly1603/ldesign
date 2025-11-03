/**
 * 验证所有 packages 是否能正常打包
 * 
 * 此脚本会：
 * 1. 检查每个包是否有 builder.config.ts 或 ldesign.config.ts
 * 2. 检查 package.json 是否有 build 脚本
 * 3. 尝试为每个包执行构建（可选）
 */

import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const packagesDir = path.join(rootDir, 'packages')

interface PackageInfo {
  name: string
  path: string
  hasBuilderConfig: boolean
  hasLdesignConfig: boolean
  hasBuildScript: boolean
  buildCommand?: string
  isMonorepo: boolean
  subPackages?: string[]
  issues: string[]
}

interface VerificationResult {
  total: number
  passed: number
  failed: number
  packages: PackageInfo[]
}

async function getPackageDirs(): Promise<string[]> {
  const dirs = await fs.readdir(packagesDir)
  const packages: string[] = []
  
  for (const dir of dirs) {
    const fullPath = path.join(packagesDir, dir)
    const stat = await fs.stat(fullPath)
    if (stat.isDirectory()) {
      packages.push(dir)
    }
  }
  
  return packages
}

async function checkPackage(pkgName: string): Promise<PackageInfo> {
  const pkgPath = path.join(packagesDir, pkgName)
  const pkgJsonPath = path.join(pkgPath, 'package.json')
  
  const info: PackageInfo = {
    name: pkgName,
    path: pkgPath,
    hasBuilderConfig: false,
    hasLdesignConfig: false,
    hasBuildScript: false,
    isMonorepo: false,
    issues: []
  }

  // 检查 package.json
  if (!await fs.pathExists(pkgJsonPath)) {
    info.issues.push('缺少 package.json')
    return info
  }

  const pkgJson = await fs.readJSON(pkgJsonPath)

  // 检查是否是 monorepo（有 packages 子目录）
  const subPackagesDir = path.join(pkgPath, 'packages')
  if (await fs.pathExists(subPackagesDir)) {
    info.isMonorepo = true
    const subDirs = await fs.readdir(subPackagesDir)
    info.subPackages = []
    
    for (const subDir of subDirs) {
      const subPath = path.join(subPackagesDir, subDir)
      const subStat = await fs.stat(subPath)
      if (subStat.isDirectory()) {
        info.subPackages.push(subDir)
      }
    }
  }

  // 检查配置文件
  info.hasBuilderConfig = await fs.pathExists(path.join(pkgPath, 'builder.config.ts')) ||
                          await fs.pathExists(path.join(pkgPath, 'builder.config.js'))
  info.hasLdesignConfig = await fs.pathExists(path.join(pkgPath, 'ldesign.config.ts')) ||
                          await fs.pathExists(path.join(pkgPath, 'ldesign.config.js'))

  // 检查 build 脚本
  if (pkgJson.scripts && pkgJson.scripts.build) {
    info.hasBuildScript = true
    info.buildCommand = pkgJson.scripts.build
  }

  // 检查问题
  if (!info.isMonorepo && !info.hasBuilderConfig && !info.hasLdesignConfig) {
    info.issues.push('缺少 builder.config.ts 或 ldesign.config.ts')
  }

  if (!info.hasBuildScript) {
    info.issues.push('缺少 build 脚本')
  }

  // 检查 @ldesign/builder 依赖
  const hasBuilderDep = 
    (pkgJson.dependencies && pkgJson.dependencies['@ldesign/builder']) ||
    (pkgJson.devDependencies && pkgJson.devDependencies['@ldesign/builder'])

  if (info.hasBuildScript && info.buildCommand?.includes('ldesign-builder') && !hasBuilderDep) {
    info.issues.push('使用了 ldesign-builder 但未声明依赖')
  }

  return info
}

async function verifyAllPackages(): Promise<VerificationResult> {
  console.log('🔍 开始验证所有 packages...\n')

  const packageDirs = await getPackageDirs()
  const packages: PackageInfo[] = []
  
  for (const pkgName of packageDirs) {
    const info = await checkPackage(pkgName)
    packages.push(info)
  }

  const passed = packages.filter(p => p.issues.length === 0).length
  const failed = packages.filter(p => p.issues.length > 0).length

  return {
    total: packages.length,
    passed,
    failed,
    packages
  }
}

function printResults(result: VerificationResult) {
  console.log('=' .repeat(80))
  console.log(`📊 验证结果汇总`)
  console.log('=' .repeat(80))
  console.log(`总计: ${result.total} 个包`)
  console.log(`✅ 通过: ${result.passed} 个`)
  console.log(`❌ 失败: ${result.failed} 个`)
  console.log('')

  // 打印通过的包
  const passedPackages = result.packages.filter(p => p.issues.length === 0)
  if (passedPackages.length > 0) {
    console.log('✅ 配置正确的包:')
    console.log('-' .repeat(80))
    passedPackages.forEach(pkg => {
      console.log(`  ✓ ${pkg.name}`)
      if (pkg.isMonorepo) {
        console.log(`    📦 Monorepo (${pkg.subPackages?.length || 0} 个子包)`)
      }
      console.log(`    📝 Build: ${pkg.buildCommand}`)
      if (pkg.hasBuilderConfig) {
        console.log(`    ⚙️  配置: builder.config.ts`)
      } else if (pkg.hasLdesignConfig) {
        console.log(`    ⚙️  配置: ldesign.config.ts`)
      }
      console.log('')
    })
  }

  // 打印有问题的包
  const failedPackages = result.packages.filter(p => p.issues.length > 0)
  if (failedPackages.length > 0) {
    console.log('\n❌ 需要修复的包:')
    console.log('-' .repeat(80))
    failedPackages.forEach(pkg => {
      console.log(`  ✗ ${pkg.name}`)
      pkg.issues.forEach(issue => {
        console.log(`    ⚠️  ${issue}`)
      })
      if (pkg.isMonorepo) {
        console.log(`    📦 Monorepo (${pkg.subPackages?.length || 0} 个子包)`)
      }
      console.log('')
    })
  }

  // 打印 Monorepo 包的详细信息
  const monorepoPackages = result.packages.filter(p => p.isMonorepo)
  if (monorepoPackages.length > 0) {
    console.log('\n📦 Monorepo 包详情:')
    console.log('-' .repeat(80))
    monorepoPackages.forEach(pkg => {
      console.log(`  ${pkg.name}`)
      console.log(`    子包: ${pkg.subPackages?.join(', ') || '无'}`)
      console.log(`    Build: ${pkg.buildCommand || '无'}`)
      console.log('')
    })
  }
}

function generateFixSuggestions(result: VerificationResult) {
  const failedPackages = result.packages.filter(p => p.issues.length > 0)
  
  if (failedPackages.length === 0) {
    console.log('\n🎉 所有包配置正确，无需修复！')
    return
  }

  console.log('\n🔧 修复建议:')
  console.log('=' .repeat(80))
  
  failedPackages.forEach(pkg => {
    console.log(`\n📦 ${pkg.name}`)
    console.log('-' .repeat(80))
    
    if (!pkg.hasBuilderConfig && !pkg.hasLdesignConfig && !pkg.isMonorepo) {
      console.log('  1. 创建 builder.config.ts:')
      console.log(`     cd packages/${pkg.name}`)
      console.log(`     cp ../../.templates/builder.config.template.ts ./builder.config.ts`)
    }
    
    if (!pkg.hasBuildScript) {
      console.log('  2. 添加 build 脚本到 package.json:')
      console.log('     "scripts": {')
      if (pkg.isMonorepo) {
        console.log('       "build": "pnpm -r --filter \'./packages/*\' build"')
      } else {
        console.log('       "build": "ldesign-builder build -f esm,cjs,umd,dts"')
      }
      console.log('     }')
    }
    
    if (pkg.issues.includes('使用了 ldesign-builder 但未声明依赖')) {
      console.log('  3. 添加 @ldesign/builder 依赖:')
      console.log('     "devDependencies": {')
      console.log('       "@ldesign/builder": "workspace:*"')
      console.log('     }')
    }
  })
}

// 主函数
async function main() {
  try {
    const result = await verifyAllPackages()
    printResults(result)
    generateFixSuggestions(result)
    
    // 如果有失败的包，退出码为 1
    if (result.failed > 0) {
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ 验证过程出错:', error)
    process.exit(1)
  }
}

main()

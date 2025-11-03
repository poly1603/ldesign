#!/usr/bin/env tsx
/**
 * 验证架构重构是否成功
 * 1. 检查所有 packages 是否有 builder 配置
 * 2. 检查所有 examples 是否有 launcher 配置
 * 3. 检查依赖关系
 */

import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

interface VerifyResult {
  passed: number
  failed: number
  warnings: string[]
  errors: string[]
}

async function verifyPackages(): Promise<VerifyResult> {
  const result: VerifyResult = {
    passed: 0,
    failed: 0,
    warnings: [],
    errors: []
  }

  const packagesDir = path.join(rootDir, 'packages')
  const packages = await fs.readdir(packagesDir)

  console.log('📦 验证 packages 配置...\n')

  for (const pkg of packages) {
    const pkgDir = path.join(packagesDir, pkg)
    const stat = await fs.stat(pkgDir)

    if (!stat.isDirectory()) continue

    const packageJsonPath = path.join(pkgDir, 'package.json')
    const builderConfigPath = path.join(pkgDir, 'builder.config.ts')
    const ldesignConfigPath = path.join(pkgDir, 'ldesign.config.ts')

    if (!await fs.pathExists(packageJsonPath)) {
      result.warnings.push(`${pkg}: 缺少 package.json`)
      continue
    }

    const packageJson = await fs.readJSON(packageJsonPath)

    // 检查 builder 配置文件
    const hasBuilderConfig = await fs.pathExists(builderConfigPath)
    const hasLdesignConfig = await fs.pathExists(ldesignConfigPath)

    if (!hasBuilderConfig && !hasLdesignConfig) {
      result.errors.push(`${pkg}: 缺少 builder.config.ts 或 ldesign.config.ts`)
      result.failed++
      console.log(`❌ ${pkg}: 缺少构建配置`)
      continue
    }

    // 检查构建脚本
    if (!packageJson.scripts?.build || !packageJson.scripts.build.includes('ldesign-builder')) {
      result.warnings.push(`${pkg}: package.json 缺少 ldesign-builder 构建脚本`)
    }

    // 检查 builder 依赖
    const hasBuilderDep = packageJson.devDependencies?.['@ldesign/builder'] || 
                         packageJson.dependencies?.['@ldesign/builder']

    if (!hasBuilderDep) {
      result.warnings.push(`${pkg}: 缺少 @ldesign/builder 依赖`)
    }

    result.passed++
    console.log(`✅ ${pkg}`)
  }

  return result
}

async function verifyExamples(): Promise<VerifyResult> {
  const result: VerifyResult = {
    passed: 0,
    failed: 0,
    warnings: [],
    errors: []
  }

  const examplesDir = path.join(rootDir, 'examples')

  if (!await fs.pathExists(examplesDir)) {
    result.warnings.push('examples 目录不存在')
    return result
  }

  const examples = await fs.readdir(examplesDir)

  console.log('\n🚀 验证 examples 配置...\n')

  for (const example of examples) {
    const exampleDir = path.join(examplesDir, example)
    const stat = await fs.stat(exampleDir)

    if (!stat.isDirectory()) continue

    const packageJsonPath = path.join(exampleDir, 'package.json')
    const launcherConfigPath = path.join(exampleDir, 'launcher.config.ts')

    if (!await fs.pathExists(packageJsonPath)) {
      result.warnings.push(`${example}: 缺少 package.json`)
      continue
    }

    const packageJson = await fs.readJSON(packageJsonPath)

    // 检查 launcher 配置文件
    if (!await fs.pathExists(launcherConfigPath)) {
      result.errors.push(`${example}: 缺少 launcher.config.ts`)
      result.failed++
      console.log(`❌ ${example}: 缺少 launcher.config.ts`)
      continue
    }

    // 检查开发脚本
    const hasDevScript = packageJson.scripts?.dev?.includes('launcher')
    const hasBuildScript = packageJson.scripts?.build?.includes('launcher')
    const hasPreviewScript = packageJson.scripts?.preview?.includes('launcher')

    if (!hasDevScript || !hasBuildScript || !hasPreviewScript) {
      result.warnings.push(`${example}: package.json 缺少完整的 launcher 脚本`)
    }

    // 检查 launcher 依赖
    const hasLauncherDep = packageJson.devDependencies?.['@ldesign/launcher'] || 
                          packageJson.dependencies?.['@ldesign/launcher']

    if (!hasLauncherDep) {
      result.warnings.push(`${example}: 缺少 @ldesign/launcher 依赖`)
    }

    result.passed++
    console.log(`✅ ${example}`)
  }

  return result
}

async function verifyCore(): Promise<VerifyResult> {
  const result: VerifyResult = {
    passed: 0,
    failed: 0,
    warnings: [],
    errors: []
  }

  console.log('\n🎯 验证 core 架构...\n')

  // 检查 packages/core 是否存在
  const coreDir = path.join(rootDir, 'packages', 'core')
  if (!await fs.pathExists(coreDir)) {
    result.errors.push('packages/core 不存在')
    result.failed++
    console.log('❌ packages/core 不存在')
    return result
  }

  console.log('✅ packages/core 存在')
  result.passed++

  // 检查 engine-core 是否依赖 @ldesign/core
  const engineCorePackageJsonPath = path.join(
    rootDir,
    'packages',
    'engine',
    'packages',
    'core',
    'package.json'
  )

  if (await fs.pathExists(engineCorePackageJsonPath)) {
    const packageJson = await fs.readJSON(engineCorePackageJsonPath)
    if (packageJson.dependencies?.['@ldesign/core']) {
      console.log('✅ @ldesign/engine-core 依赖 @ldesign/core')
      result.passed++
    } else {
      result.errors.push('@ldesign/engine-core 未依赖 @ldesign/core')
      result.failed++
      console.log('❌ @ldesign/engine-core 未依赖 @ldesign/core')
    }
  }

  // 检查框架适配器是否依赖 @ldesign/core
  const adapters = ['vue', 'react', 'angular', 'solid', 'svelte']
  for (const adapter of adapters) {
    const adapterPackageJsonPath = path.join(
      rootDir,
      'packages',
      'engine',
      'packages',
      adapter,
      'package.json'
    )

    if (await fs.pathExists(adapterPackageJsonPath)) {
      const packageJson = await fs.readJSON(adapterPackageJsonPath)
      if (packageJson.dependencies?.['@ldesign/core']) {
        console.log(`✅ @ldesign/engine-${adapter} 依赖 @ldesign/core`)
        result.passed++
      } else {
        result.warnings.push(`@ldesign/engine-${adapter} 未依赖 @ldesign/core`)
        console.log(`⚠️  @ldesign/engine-${adapter} 未依赖 @ldesign/core`)
      }
    }
  }

  return result
}

async function main() {
  console.log('🔍 开始验证架构重构...\n')

  const coreResult = await verifyCore()
  const packagesResult = await verifyPackages()
  const examplesResult = await verifyExamples()

  // 汇总结果
  console.log('\n' + '='.repeat(60))
  console.log('📊 验证结果汇总')
  console.log('='.repeat(60))

  console.log(`\n✅ 通过: ${coreResult.passed + packagesResult.passed + examplesResult.passed}`)
  console.log(`❌ 失败: ${coreResult.failed + packagesResult.failed + examplesResult.failed}`)
  console.log(`⚠️  警告: ${coreResult.warnings.length + packagesResult.warnings.length + examplesResult.warnings.length}`)

  // 显示错误
  const allErrors = [...coreResult.errors, ...packagesResult.errors, ...examplesResult.errors]
  if (allErrors.length > 0) {
    console.log('\n❌ 错误列表:')
    allErrors.forEach(error => console.log(`   - ${error}`))
  }

  // 显示警告
  const allWarnings = [...coreResult.warnings, ...packagesResult.warnings, ...examplesResult.warnings]
  if (allWarnings.length > 0) {
    console.log('\n⚠️  警告列表:')
    allWarnings.forEach(warning => console.log(`   - ${warning}`))
  }

  // 总结
  console.log('\n' + '='.repeat(60))
  const totalFailed = coreResult.failed + packagesResult.failed + examplesResult.failed
  if (totalFailed === 0 && allErrors.length === 0) {
    console.log('✨ 架构验证通过！所有配置正确。')
    console.log('\n下一步:')
    console.log('1. 运行 pnpm install 安装依赖')
    console.log('2. 运行 pnpm -r build 构建所有 packages')
    console.log('3. 在 examples 目录运行 pnpm dev 测试示例')
  } else {
    console.log('⚠️  架构验证发现问题，请检查上述错误和警告。')
    process.exit(1)
  }
}

main()

#!/usr/bin/env tsx

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

interface PackageInfo {
  name: string
  path: string
  type: 'library' | 'app' | 'docs' | 'unknown'
  buildTool: 'rollup' | 'vite' | 'tsup' | 'vitepress' | 'none' | 'multiple'
  hasConfig: boolean
  configFiles: string[]
  buildScript: string
  dependencies: string[]
  framework: 'vue' | 'react' | 'none' | 'multiple'
  issues: string[]
}

const workspaceRoot = process.cwd()

function findPackages(): string[] {
  const packages: string[] = []

  // 扫描 packages 目录
  const packagesDir = join(workspaceRoot, 'packages')
  if (existsSync(packagesDir)) {
    const items = readdirSync(packagesDir)
    for (const item of items) {
      const itemPath = join(packagesDir, item)
      if (
        statSync(itemPath).isDirectory()
        && existsSync(join(itemPath, 'package.json'))
      ) {
        packages.push(join('packages', item))
      }
    }
  }

  // 扫描 apps 目录
  const appsDir = join(workspaceRoot, 'apps')
  if (existsSync(appsDir)) {
    const items = readdirSync(appsDir)
    for (const item of items) {
      const itemPath = join(appsDir, item)
      if (
        statSync(itemPath).isDirectory()
        && existsSync(join(itemPath, 'package.json'))
      ) {
        packages.push(join('apps', item))
      }
    }
  }

  // 检查 docs
  if (existsSync(join(workspaceRoot, 'docs', 'package.json'))) {
    packages.push('docs')
  }

  return packages
}

function analyzePackage(packagePath: string): PackageInfo {
  const fullPath = join(workspaceRoot, packagePath)
  const packageJsonPath = join(fullPath, 'package.json')

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

  const info: PackageInfo = {
    name: packageJson.name || packagePath,
    path: packagePath,
    type: 'unknown',
    buildTool: 'none',
    hasConfig: false,
    configFiles: [],
    buildScript: packageJson.scripts?.build || '',
    dependencies: [],
    framework: 'none',
    issues: [],
  }

  // 检测配置文件
  const configFiles = [
    'rollup.config.js',
    'rollup.config.ts',
    'vite.config.js',
    'vite.config.ts',
    'tsup.config.js',
    'tsup.config.ts',
    'webpack.config.js',
    'webpack.config.ts',
  ]

  for (const configFile of configFiles) {
    if (existsSync(join(fullPath, configFile))) {
      info.configFiles.push(configFile)
    }
  }

  info.hasConfig = info.configFiles.length > 0

  // 分析构建工具
  if (info.configFiles.some(f => f.includes('rollup'))) {
    info.buildTool = info.buildTool === 'none' ? 'rollup' : 'multiple'
  }
  if (info.configFiles.some(f => f.includes('vite'))) {
    info.buildTool = info.buildTool === 'none' ? 'vite' : 'multiple'
  }
  if (info.configFiles.some(f => f.includes('tsup'))) {
    info.buildTool = info.buildTool === 'none' ? 'tsup' : 'multiple'
  }

  // 从构建脚本推断构建工具
  if (info.buildTool === 'none') {
    if (info.buildScript.includes('rollup')) {
      info.buildTool = 'rollup'
    }
    else if (info.buildScript.includes('vite build')) {
      info.buildTool = 'vite'
    }
    else if (info.buildScript.includes('tsup')) {
      info.buildTool = 'tsup'
    }
    else if (info.buildScript.includes('vitepress')) {
      info.buildTool = 'vitepress'
    }
  }

  // 分析依赖
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.peerDependencies,
  }

  info.dependencies = Object.keys(allDeps)

  // 检测框架
  if (allDeps.vue) {
    info.framework = info.framework === 'none' ? 'vue' : 'multiple'
  }
  if (allDeps.react) {
    info.framework = info.framework === 'none' ? 'react' : 'multiple'
  }

  // 确定项目类型
  if (packagePath.startsWith('apps/') || packagePath.startsWith('apps\\')) {
    info.type = 'app'
  }
  else if (packagePath === 'docs') {
    info.type = 'docs'
  }
  else if (
    packagePath.startsWith('packages/')
    || packagePath.startsWith('packages\\')
  ) {
    // 根据特征判断是否为库
    if (packageJson.exports || packageJson.main || packageJson.module) {
      info.type = 'library'
    }
  }

  // 检查配置问题
  validatePackageConfig(info)

  return info
}

function validatePackageConfig(info: PackageInfo): void {
  // 根据项目类型检查配置
  switch (info.type) {
    case 'library':
      // 库项目可以使用 rollup 或 vite（库模式），但不应该使用 tsup（除非是 node 库）
      if (info.buildTool === 'none') {
        info.issues.push('库项目缺少构建工具配置')
      }
      else if (info.buildTool === 'tsup') {
        // 检查是否是 node 库（没有 Vue/React 依赖）
        if (info.framework !== 'none') {
          info.issues.push(
            'Vue/React 库项目不应使用 tsup，建议使用 rollup 或 vite',
          )
        }
      }
      break
    case 'app':
      if (info.buildTool !== 'vite' && info.buildTool !== 'multiple') {
        info.issues.push(
          `应用项目应使用 vite 打包，当前使用: ${info.buildTool}`,
        )
      }
      break
    case 'docs':
      if (
        info.buildTool !== 'vitepress'
        && !info.buildScript.includes('vitepress')
      ) {
        info.issues.push(
          `文档项目应使用 vitepress，当前使用: ${info.buildTool}`,
        )
      }
      break
  }

  // 检查是否有构建配置
  if (info.type !== 'docs' && !info.hasConfig && !info.buildScript) {
    info.issues.push('缺少构建配置和构建脚本')
  }

  // 检查 vite 版本（如果使用 vite）
  if (info.buildTool === 'vite' || info.buildTool === 'multiple') {
    const viteDep = info.dependencies.find(dep => dep === 'vite')
    if (viteDep) {
      // 这里可以进一步检查版本号，确保是 vite 5+
      // 暂时跳过版本检查
    }
  }
}

function generateReport(packages: PackageInfo[]): void {
  console.log('\n🔍 LDesign 项目打包配置检测报告')
  console.log('='.repeat(60))

  // 统计信息
  const stats = {
    total: packages.length,
    libraries: packages.filter(p => p.type === 'library').length,
    apps: packages.filter(p => p.type === 'app').length,
    docs: packages.filter(p => p.type === 'docs').length,
    withIssues: packages.filter(p => p.issues.length > 0).length,
    rollup: packages.filter(p => p.buildTool === 'rollup').length,
    vite: packages.filter(p => p.buildTool === 'vite').length,
    multiple: packages.filter(p => p.buildTool === 'multiple').length,
  }

  console.log('\n📊 统计信息:')
  console.log(`总包数: ${stats.total}`)
  console.log(`库项目: ${stats.libraries}`)
  console.log(`应用项目: ${stats.apps}`)
  console.log(`文档项目: ${stats.docs}`)
  console.log(`使用 Rollup: ${stats.rollup}`)
  console.log(`使用 Vite: ${stats.vite}`)
  console.log(`使用多种工具: ${stats.multiple}`)
  console.log(`有问题的包: ${stats.withIssues}`)

  // 详细信息
  console.log('\n📦 包详细信息:')
  for (const pkg of packages) {
    console.log(`\n${pkg.name} (${pkg.path})`)
    console.log(`  类型: ${pkg.type}`)
    console.log(`  构建工具: ${pkg.buildTool}`)
    console.log(`  配置文件: ${pkg.configFiles.join(', ') || '无'}`)
    console.log(`  构建脚本: ${pkg.buildScript || '无'}`)
    console.log(`  框架: ${pkg.framework}`)

    if (pkg.issues.length > 0) {
      console.log(`  ⚠️  问题:`)
      for (const issue of pkg.issues) {
        console.log(`    - ${issue}`)
      }
    }
    else {
      console.log(`  ✅ 配置正常`)
    }
  }

  // 问题汇总
  if (stats.withIssues > 0) {
    console.log('\n⚠️  问题汇总:')
    for (const pkg of packages.filter(p => p.issues.length > 0)) {
      console.log(`\n${pkg.name}:`)
      for (const issue of pkg.issues) {
        console.log(`  - ${issue}`)
      }
    }
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log('检测完成！')
}

// 主函数
function main() {
  console.log('🚀 开始检测项目打包配置...')

  const packagePaths = findPackages()
  console.log(`发现 ${packagePaths.length} 个包`)

  const packages = packagePaths.map(analyzePackage)

  generateReport(packages)
}

// 直接运行主函数
main()

export { analyzePackage, findPackages, generateReport }

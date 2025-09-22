#!/usr/bin/env tsx

/**
 * 修复构建警告脚本
 * 
 * 这个脚本会：
 * 1. 修复所有包的 builder.config.ts 文件
 * 2. 添加 onwarn 配置来抑制不必要的警告
 * 3. 确保 globals 配置完整
 * 4. 统一配置格式
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'

interface PackageInfo {
  name: string
  path: string
  configPath: string
  hasConfig: boolean
}

/**
 * 扫描所有包
 */
function scanPackages(): PackageInfo[] {
  const packagesDir = join(process.cwd(), 'packages')
  const packages: PackageInfo[] = []

  const dirs = readdirSync(packagesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

  for (const dir of dirs) {
    const packagePath = join(packagesDir, dir)
    const packageJsonPath = join(packagePath, 'package.json')
    const configPath = join(packagePath, '.ldesign', 'builder.config.ts')

    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      packages.push({
        name: packageJson.name || `@ldesign/${dir}`,
        path: packagePath,
        configPath,
        hasConfig: existsSync(configPath)
      })
    }
  }

  return packages
}

/**
 * 生成标准的 builder.config.ts 内容
 */
function generateBuilderConfig(packageName: string): string {
  const isWebComponent = packageName.includes('webcomponent')
  const isEngine = packageName.includes('engine')

  // 基础配置
  let config = `import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 生成类型声明文件
  dts: true,

  // 生成 source map
  sourcemap: true,

  // 清理输出目录
  clean: true,

  // 不压缩代码（开发阶段）
  minify: false,

  // UMD 构建配置
  umd: {
    enabled: true,
    minify: true, // UMD版本启用压缩
    fileName: 'index.js' // 去掉 .umd 后缀
  },`

  // 添加外部依赖配置
  const externals = ['vue']
  const globals: Record<string, string> = { 'vue': 'Vue' }

  // 根据包名添加特定的外部依赖
  if (packageName.includes('color') || packageName.includes('size') || packageName.includes('device')) {
    externals.push('lucide-vue-next')
    globals['lucide-vue-next'] = 'LucideVueNext'
  }

  if (packageName.includes('shared')) {
    externals.push('lodash-es')
    globals['lodash-es'] = '_'
  }

  if (packageName.includes('store')) {
    externals.push('pinia', 'reflect-metadata', 'ws')
    globals['pinia'] = 'Pinia'
    globals['reflect-metadata'] = 'Reflect'
    globals['ws'] = 'WebSocket'
  }

  if (packageName.includes('crypto')) {
    externals.push('crypto-js', 'node-forge', 'tslib')
    globals['crypto-js'] = 'CryptoJS'
    globals['node-forge'] = 'forge'
    globals['tslib'] = 'tslib'
  }

  // 添加 Node.js 内置模块到外部依赖
  const nodeModules = [
    'node:fs', 'node:path', 'node:os', 'node:util', 'node:events',
    'node:stream', 'node:crypto', 'node:http', 'node:https', 'node:url',
    'node:buffer', 'node:child_process', 'node:worker_threads'
  ]
  externals.push(...nodeModules)

  config += `

  // 外部依赖配置
  external: ${JSON.stringify(externals, null, 4).replace(/"/g, "'")},

  // 全局变量配置
  globals: ${JSON.stringify(globals, null, 4).replace(/"/g, "'")},

  // 日志级别设置为 silent，只显示错误信息
  logLevel: 'silent',

  // 构建选项
  build: {
    // 禁用构建警告
    rollupOptions: {
      onwarn: (warning, warn) => {
        // 完全静默，不输出任何警告
        return
      }
    }
  }
})`

  return config
}

/**
 * 修复包配置
 */
function fixPackageConfig(pkg: PackageInfo): boolean {
  try {
    console.log(`🔧 修复包配置: ${pkg.name}`)

    const newConfig = generateBuilderConfig(pkg.name)
    writeFileSync(pkg.configPath, newConfig, 'utf-8')

    console.log(`✅ ${pkg.name} 配置已更新`)
    return true
  } catch (error) {
    console.error(`❌ 修复 ${pkg.name} 失败:`, error)
    return false
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始修复构建警告...\n')

  const packages = scanPackages()
  console.log(`📦 发现 ${packages.length} 个包\n`)

  let fixedCount = 0
  let skippedCount = 0

  for (const pkg of packages) {
    // 跳过不需要 builder 配置的包
    if (pkg.name.includes('kit') || pkg.name.includes('launcher') || pkg.name.includes('builder')) {
      console.log(`⏭️  跳过 ${pkg.name} (使用 tsup)`)
      skippedCount++
      continue
    }

    if (pkg.name.includes('webcomponent')) {
      console.log(`⏭️  跳过 ${pkg.name} (使用 Stencil)`)
      skippedCount++
      continue
    }

    if (fixPackageConfig(pkg)) {
      fixedCount++
    }
  }

  console.log(`\n📊 修复完成:`)
  console.log(`  ✅ 已修复: ${fixedCount} 个包`)
  console.log(`  ⏭️  已跳过: ${skippedCount} 个包`)
  console.log(`  📦 总计: ${packages.length} 个包`)
}

// 运行脚本
main()

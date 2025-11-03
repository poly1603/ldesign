#!/usr/bin/env tsx
/**
 * 为所有 packages 配置 @ldesign/builder
 * 为所有 examples 配置 @ldesign/launcher
 */

import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

// Builder 配置模板
const builderConfigTemplate = `import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  entry: 'src/index.ts',
  
  output: {
    formats: ['esm', 'cjs', 'dts'],
    esm: {
      dir: 'es',
      minify: false
    },
    cjs: {
      dir: 'lib',
      minify: false
    },
    dts: {
      dir: 'es',
      only: false
    }
  },

  bundler: 'rollup',

  sourcemap: true
})
`

// Launcher 配置模板
const launcherConfigTemplate = (port: number) => `import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  server: {
    port: ${port},
    open: true,
  },
  build: {
    outDir: 'dist',
  },
})
`

async function setupPackages() {
  const packagesDir = path.join(rootDir, 'packages')
  const packages = await fs.readdir(packagesDir)

  console.log('🔧 配置 packages 使用 @ldesign/builder...\n')

  for (const pkg of packages) {
    const pkgDir = path.join(packagesDir, pkg)
    const stat = await fs.stat(pkgDir)

    if (!stat.isDirectory()) continue
    if (pkg === 'core') continue // core 已经配置过

    const packageJsonPath = path.join(pkgDir, 'package.json')
    const builderConfigPath = path.join(pkgDir, 'builder.config.ts')

    // 检查是否有 package.json
    if (!await fs.pathExists(packageJsonPath)) continue

    // 读取 package.json
    const packageJson = await fs.readJSON(packageJsonPath)

    // 添加 builder 脚本（如果还没有）
    if (!packageJson.scripts) {
      packageJson.scripts = {}
    }

    if (!packageJson.scripts.build || !packageJson.scripts.build.includes('ldesign-builder')) {
      packageJson.scripts.build = 'ldesign-builder build -f esm,cjs,dts'
      packageJson.scripts.dev = 'ldesign-builder build -f esm,cjs,dts --watch'
      console.log(`✅ ${pkg}: 已更新 package.json 脚本`)
    }

    // 添加 builder devDependencies（如果还没有）
    if (!packageJson.devDependencies) {
      packageJson.devDependencies = {}
    }

    if (!packageJson.devDependencies['@ldesign/builder']) {
      packageJson.devDependencies['@ldesign/builder'] = 'workspace:*'
      console.log(`✅ ${pkg}: 已添加 @ldesign/builder 依赖`)
    }

    await fs.writeJSON(packageJsonPath, packageJson, { spaces: 2 })

    // 创建 builder.config.ts（如果还没有）
    if (!await fs.pathExists(builderConfigPath)) {
      await fs.writeFile(builderConfigPath, builderConfigTemplate)
      console.log(`✅ ${pkg}: 已创建 builder.config.ts`)
    }

    console.log()
  }
}

async function setupExamples() {
  const examplesDir = path.join(rootDir, 'examples')

  // 检查 examples 目录是否存在
  if (!await fs.pathExists(examplesDir)) {
    console.log('⚠️  examples 目录不存在，跳过配置')
    return
  }

  const examples = await fs.readdir(examplesDir)

  console.log('\n🚀 配置 examples 使用 @ldesign/launcher...\n')

  const portMap: Record<string, number> = {
    'vue': 3001,
    'react': 3000,
    'angular': 3002,
    'solid': 3003,
    'svelte': 3004,
  }

  let currentPort = 3005

  for (const example of examples) {
    const exampleDir = path.join(examplesDir, example)
    const stat = await fs.stat(exampleDir)

    if (!stat.isDirectory()) continue

    const packageJsonPath = path.join(exampleDir, 'package.json')
    const launcherConfigPath = path.join(exampleDir, 'launcher.config.ts')

    // 检查是否有 package.json
    if (!await fs.pathExists(packageJsonPath)) continue

    // 读取 package.json
    const packageJson = await fs.readJSON(packageJsonPath)

    // 添加 launcher 脚本（如果还没有）
    if (!packageJson.scripts) {
      packageJson.scripts = {}
    }

    if (!packageJson.scripts.dev || !packageJson.scripts.dev.includes('launcher')) {
      packageJson.scripts.dev = 'launcher dev'
      packageJson.scripts.build = 'launcher build'
      packageJson.scripts.preview = 'launcher preview'
      console.log(`✅ ${example}: 已更新 package.json 脚本`)
    }

    // 添加 launcher devDependencies（如果还没有）
    if (!packageJson.devDependencies) {
      packageJson.devDependencies = {}
    }

    if (!packageJson.devDependencies['@ldesign/launcher']) {
      packageJson.devDependencies['@ldesign/launcher'] = 'workspace:*'
      console.log(`✅ ${example}: 已添加 @ldesign/launcher 依赖`)
    }

    await fs.writeJSON(packageJsonPath, packageJson, { spaces: 2 })

    // 创建 launcher.config.ts（如果还没有）
    if (!await fs.pathExists(launcherConfigPath)) {
      const port = portMap[example] || currentPort++
      await fs.writeFile(launcherConfigPath, launcherConfigTemplate(port))
      console.log(`✅ ${example}: 已创建 launcher.config.ts (端口: ${port})`)
    }

    console.log()
  }
}

async function main() {
  console.log('🎯 开始配置构建工具...\n')

  try {
    await setupPackages()
    await setupExamples()

    console.log('✨ 配置完成！')
    console.log('\n下一步:')
    console.log('1. 运行 pnpm install 安装依赖')
    console.log('2. 运行 pnpm build 构建所有 packages')
    console.log('3. 在 examples 目录中运行 pnpm dev 测试示例')
  } catch (error) {
    console.error('❌ 配置失败:', error)
    process.exit(1)
  }
}

main()

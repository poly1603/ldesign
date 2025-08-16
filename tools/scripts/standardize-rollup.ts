#!/usr/bin/env tsx
/**
 * Rollup配置标准化工具
 *
 * 自动将所有包标准化为使用Rollup构建，删除Vite配置，统一脚本
 */

import { existsSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs'

import { join, resolve } from 'node:path'

interface PackageInfo {
  name: string
  path: string
  hasVue: boolean
  hasJsx: boolean
  packageJson: any
}

/**
 * 获取所有包信息
 */
function getAllPackages(): PackageInfo[] {
  const packagesDir = resolve(process.cwd(), 'packages')
  const packages: PackageInfo[] = []

  if (!existsSync(packagesDir)) {
    console.warn('⚠️  packages目录不存在')
    return packages
  }

  const dirs = readdirSync(packagesDir).filter((name) => {
    const packagePath = join(packagesDir, name)
    return (
      statSync(packagePath).isDirectory()
      && existsSync(join(packagePath, 'package.json'))
    )
  })

  for (const dir of dirs) {
    const packagePath = join(packagesDir, dir)
    const packageJsonPath = join(packagePath, 'package.json')

    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      const hasVue = !!(
        packageJson.peerDependencies?.vue || packageJson.dependencies?.vue
      )

      // 检查是否有JSX文件
      const hasJsx
        = existsSync(join(packagePath, 'src'))
          && checkForJsxFiles(join(packagePath, 'src'))

      packages.push({
        name: dir,
        path: packagePath,
        hasVue,
        hasJsx,
        packageJson,
      })
    }
    catch (error) {
      console.warn(`⚠️  无法读取包 ${dir} 的package.json:`, error)
    }
  }

  return packages
}

/**
 * 检查目录中是否有JSX文件
 */
function checkForJsxFiles(dir: string): boolean {
  try {
    const files = readdirSync(dir, { recursive: true })
    return files.some(
      (file: any) =>
        typeof file === 'string'
        && (file.endsWith('.tsx') || file.endsWith('.jsx')),
    )
  }
  catch {
    return false
  }
}

/**
 * 转换为PascalCase
 */
function toPascalCase(str: string): string {
  return str.replace(/(^|-)([a-z])/g, (_, __, letter) => letter.toUpperCase())
}

/**
 * 生成Rollup配置
 */
function generateRollupConfig(packageInfo: PackageInfo): string {
  const { name, hasVue } = packageInfo

  if (hasVue) {
    return `import { createRollupConfig } from '../../tools/configs/build/rollup.config.base.js'

export default createRollupConfig({
  external: ['vue', '@vue/runtime-core', '@vue/reactivity', '@vue/shared'],
  globalName: 'LDesign${toPascalCase(name)}',
  globals: {
    vue: 'Vue',
    '@vue/runtime-core': 'Vue',
    '@vue/reactivity': 'Vue',
    '@vue/shared': 'Vue',
  },
  vue: true,
})
`
  }
  else {
    return `import { createRollupConfig } from '../../tools/configs/build/rollup.config.base.js'

export default createRollupConfig({
  globalName: 'LDesign${toPascalCase(name)}',
})
`
  }
}

/**
 * 标准化包的脚本
 */
function standardizePackageScripts(packageInfo: PackageInfo) {
  const { path: packagePath, packageJson } = packageInfo
  const packageJsonPath = join(packagePath, 'package.json')

  // 标准化脚本
  const standardScripts = {
    'build': 'rollup -c',
    'build:watch': 'rollup -c -w',
    'dev': 'rollup -c -w',
    'build:check':
      'pnpm run build && node ../../tools/scripts/build/bundle-validator.js',
    'build:analyze':
      'pnpm run build && node ../../tools/scripts/build/bundle-analyzer.js',
    'build:validate':
      'pnpm run build && node ../../tools/scripts/build/validate-build.js',
    'build:browser-test':
      'pnpm run build && node ../../tools/scripts/build/browser-tester.js',
    'type-check': 'vue-tsc --noEmit',
    'lint': 'eslint . --fix',
    'lint:check': 'eslint .',
    'test': 'vitest',
    'test:ui': 'vitest --ui',
    'test:run': 'vitest run',
    'test:coverage': 'vitest run --coverage',
    'test:e2e': 'playwright test',
    'test:e2e:ui': 'playwright test --ui',
    'docs:dev': 'vitepress dev docs',
    'docs:build': 'vitepress build docs',
    'docs:preview': 'vitepress preview docs',
    'clean': 'rimraf dist es lib types coverage .nyc_output',
    'size-check': 'size-limit',
    'prepublishOnly': 'pnpm run clean && pnpm run build && pnpm run test:run',
  }

  // 更新脚本，保留现有的其他脚本
  packageJson.scripts = {
    ...packageJson.scripts,
    ...standardScripts,
  }

  writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`)
  console.log(`  ✅ 标准化脚本`)
}

/**
 * 标准化单个包
 */
function standardizePackage(packageInfo: PackageInfo) {
  const { name, path: packagePath } = packageInfo

  console.log(`🔄 标准化包 ${name}...`)

  // 1. 删除vite配置文件（如果存在）
  const viteConfigPath = join(packagePath, 'vite.config.ts')
  if (existsSync(viteConfigPath)) {
    unlinkSync(viteConfigPath)
    console.log(`  🗑️  删除 vite.config.ts`)
  }

  // 2. 检查是否已有rollup配置
  const rollupConfigPath = join(packagePath, 'rollup.config.js')
  if (!existsSync(rollupConfigPath)) {
    const rollupConfigContent = generateRollupConfig(packageInfo)
    writeFileSync(rollupConfigPath, rollupConfigContent)
    console.log(`  ✨ 创建 rollup.config.js`)
  }
  else {
    console.log(`  ✅ rollup.config.js 已存在`)
  }

  // 3. 标准化package.json脚本
  standardizePackageScripts(packageInfo)

  console.log(`✅ 包 ${name} 标准化完成\n`)
}

/**
 * 验证标准化结果
 */
function validateStandardization(packages: PackageInfo[]) {
  console.log('🔍 验证标准化结果...\n')

  let allValid = true

  for (const packageInfo of packages) {
    const { name, path: packagePath } = packageInfo
    const rollupConfigPath = join(packagePath, 'rollup.config.js')
    const viteConfigPath = join(packagePath, 'vite.config.ts')

    console.log(`📦 验证包 ${name}:`)

    // 检查rollup配置是否存在
    if (existsSync(rollupConfigPath)) {
      console.log(`  ✅ rollup.config.js 存在`)
    }
    else {
      console.log(`  ❌ rollup.config.js 不存在`)
      allValid = false
    }

    // 检查vite配置是否已删除
    if (!existsSync(viteConfigPath)) {
      console.log(`  ✅ vite.config.ts 已删除`)
    }
    else {
      console.log(`  ⚠️  vite.config.ts 仍然存在`)
    }

    // 检查package.json脚本
    try {
      const packageJsonPath = join(packagePath, 'package.json')
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

      if (packageJson.scripts?.build === 'rollup -c') {
        console.log(`  ✅ 构建脚本已标准化`)
      }
      else {
        console.log(`  ❌ 构建脚本未标准化`)
        allValid = false
      }
    }
    catch (error) {
      console.log(`  ❌ 无法验证package.json`)
      allValid = false
    }

    console.log()
  }

  return allValid
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始Rollup配置标准化...\n')

  // 获取所有包
  const packages = getAllPackages()

  if (packages.length === 0) {
    console.log('⚠️  没有找到任何包，标准化结束')
    return
  }

  console.log(`📦 找到 ${packages.length} 个包:\n`)
  packages.forEach((pkg) => {
    console.log(
      `  - ${pkg.name} (Vue: ${pkg.hasVue ? '✅' : '❌'}, JSX: ${
        pkg.hasJsx ? '✅' : '❌'
      })`,
    )
  })
  console.log()

  // 标准化所有包
  for (const packageInfo of packages) {
    standardizePackage(packageInfo)
  }

  // 验证标准化结果
  const isValid = validateStandardization(packages)

  if (isValid) {
    console.log('🎉 Rollup配置标准化完成！所有包已成功标准化')
    console.log('\n📝 下一步:')
    console.log('  1. 运行 pnpm install 确保依赖正确')
    console.log('  2. 运行 pnpm build 测试构建')
    console.log('  3. 运行 pnpm test:run 确保测试通过')
  }
  else {
    console.log('❌ 标准化过程中出现问题，请检查上述错误')
    process.exit(1)
  }
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

#!/usr/bin/env tsx
/**
 * Rollup到Vite迁移工具
 *
 * 自动将所有包从Rollup构建迁移到Vite构建
 */

import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { readdirSync, statSync } from 'node:fs'

interface PackageInfo {
  name: string
  path: string
  hasVue: boolean
  hasJsx: boolean
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

  const dirs = readdirSync(packagesDir).filter(name => {
    const packagePath = join(packagesDir, name)
    return (
      statSync(packagePath).isDirectory() &&
      existsSync(join(packagePath, 'package.json'))
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
      const hasJsx =
        existsSync(join(packagePath, 'src')) &&
        readdirSync(join(packagePath, 'src'), { recursive: true }).some(
          (file: any) => typeof file === 'string' && file.endsWith('.tsx')
        )

      packages.push({
        name: dir,
        path: packagePath,
        hasVue,
        hasJsx,
      })
    } catch (error) {
      console.warn(`⚠️  无法读取包 ${dir} 的package.json:`, error)
    }
  }

  return packages
}

/**
 * 生成Vite配置文件内容
 */
function generateViteConfig(packageInfo: PackageInfo): string {
  const { name, hasVue, hasJsx } = packageInfo

  if (hasVue) {
    return `import { createVuePackageConfig } from '../../tools/configs/build/vite.config.template'

export default createVuePackageConfig('${name}', {
  jsx: ${hasJsx},
})
`
  } else {
    return `import { createUtilsPackageConfig } from '../../tools/configs/build/vite.config.template'

export default createUtilsPackageConfig('${name}')
`
  }
}

/**
 * 更新package.json脚本
 */
function updatePackageScripts(packagePath: string) {
  const packageJsonPath = join(packagePath, 'package.json')

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

    // 更新构建脚本
    if (packageJson.scripts) {
      // 替换rollup命令为vite命令
      if (packageJson.scripts.build === 'rollup -c') {
        packageJson.scripts.build = 'vite build'
      }
      if (packageJson.scripts['build:watch'] === 'rollup -c -w') {
        packageJson.scripts['build:watch'] = 'vite build --watch'
      }
      if (packageJson.scripts.dev === 'rollup -c -w') {
        packageJson.scripts.dev = 'vite build --watch'
      }

      // 添加新的脚本
      packageJson.scripts['build:analyze'] = 'vite build --analyze'
      packageJson.scripts['preview'] = 'vite preview'
    }

    // 更新依赖
    if (packageJson.devDependencies) {
      // 移除rollup相关依赖
      delete packageJson.devDependencies['rollup']
      delete packageJson.devDependencies['rollup-plugin-dts']
      delete packageJson.devDependencies['@rollup/plugin-commonjs']
      delete packageJson.devDependencies['@rollup/plugin-node-resolve']
      delete packageJson.devDependencies['@rollup/plugin-typescript']

      // 添加vite相关依赖
      packageJson.devDependencies['vite'] = '^6.0.0'
      packageJson.devDependencies['vite-plugin-dts'] = '^4.0.0'

      if (packageJson.peerDependencies?.vue) {
        packageJson.devDependencies['@vitejs/plugin-vue'] = '^5.0.0'
        packageJson.devDependencies['@vitejs/plugin-vue-jsx'] = '^4.0.0'
      }
    }

    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
    console.log(`✅ 更新 ${packageJson.name} 的package.json`)
  } catch (error) {
    console.error(`❌ 更新package.json失败:`, error)
  }
}

/**
 * 迁移单个包
 */
function migratePackage(packageInfo: PackageInfo) {
  const { name, path: packagePath } = packageInfo

  console.log(`🔄 迁移包 ${name}...`)

  // 1. 删除rollup配置文件
  const rollupConfigPath = join(packagePath, 'rollup.config.js')
  if (existsSync(rollupConfigPath)) {
    unlinkSync(rollupConfigPath)
    console.log(`  🗑️  删除 rollup.config.js`)
  }

  // 2. 创建vite配置文件
  const viteConfigPath = join(packagePath, 'vite.config.ts')
  const viteConfigContent = generateViteConfig(packageInfo)
  writeFileSync(viteConfigPath, viteConfigContent)
  console.log(`  ✨ 创建 vite.config.ts`)

  // 3. 更新package.json
  updatePackageScripts(packagePath)

  console.log(`✅ 包 ${name} 迁移完成\n`)
}

/**
 * 验证迁移结果
 */
function validateMigration(packages: PackageInfo[]) {
  console.log('🔍 验证迁移结果...\n')

  let allValid = true

  for (const packageInfo of packages) {
    const { name, path: packagePath } = packageInfo
    const viteConfigPath = join(packagePath, 'vite.config.ts')
    const rollupConfigPath = join(packagePath, 'rollup.config.js')

    console.log(`📦 验证包 ${name}:`)

    // 检查vite配置是否存在
    if (existsSync(viteConfigPath)) {
      console.log(`  ✅ vite.config.ts 存在`)
    } else {
      console.log(`  ❌ vite.config.ts 不存在`)
      allValid = false
    }

    // 检查rollup配置是否已删除
    if (!existsSync(rollupConfigPath)) {
      console.log(`  ✅ rollup.config.js 已删除`)
    } else {
      console.log(`  ⚠️  rollup.config.js 仍然存在`)
    }

    // 检查package.json脚本
    try {
      const packageJsonPath = join(packagePath, 'package.json')
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

      if (packageJson.scripts?.build === 'vite build') {
        console.log(`  ✅ 构建脚本已更新`)
      } else {
        console.log(`  ❌ 构建脚本未更新`)
        allValid = false
      }
    } catch (error) {
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
  console.log('🚀 开始Rollup到Vite迁移...\n')

  // 获取所有包
  const packages = getAllPackages()

  if (packages.length === 0) {
    console.log('⚠️  没有找到任何包，迁移结束')
    return
  }

  console.log(`📦 找到 ${packages.length} 个包:\n`)
  packages.forEach(pkg => {
    console.log(
      `  - ${pkg.name} (Vue: ${pkg.hasVue ? '✅' : '❌'}, JSX: ${
        pkg.hasJsx ? '✅' : '❌'
      })`
    )
  })
  console.log()

  // 迁移所有包
  for (const packageInfo of packages) {
    migratePackage(packageInfo)
  }

  // 验证迁移结果
  const isValid = validateMigration(packages)

  if (isValid) {
    console.log('🎉 迁移完成！所有包已成功迁移到Vite')
    console.log('\n📝 下一步:')
    console.log('  1. 运行 pnpm install 安装新依赖')
    console.log('  2. 运行 pnpm build 测试构建')
    console.log('  3. 运行 pnpm dev 测试开发模式')
    console.log('  4. 运行 pnpm test:run 确保测试通过')
  } else {
    console.log('❌ 迁移过程中出现问题，请检查上述错误')
    process.exit(1)
  }
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

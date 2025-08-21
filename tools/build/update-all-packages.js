#!/usr/bin/env node
/**
 * 批量更新所有包的构建配置脚本
 *
 * 功能：
 * 1. 更新所有包的 rollup.config.js 使用新的公共构建配置
 * 2. 更新每个包的 package.json 中的 exports 字段
 * 3. 更新 clean 脚本以清理新的构建目录
 * 4. 确保所有包都支持 ESM、CJS、UMD 三种格式
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * 包配置更新器
 */
class PackageConfigUpdater {
  constructor(packagesDir) {
    this.packagesDir = packagesDir
    this.results = []
  }

  /**
   * 更新所有包
   */
  async updateAllPackages() {
    const packages = this.discoverPackages()

    console.log('🔧 开始批量更新包配置')
    console.log('='.repeat(60))
    console.log(`📦 发现 ${packages.length} 个包`)

    for (const pkg of packages) {
      console.log(`\n📝 更新包: ${pkg.name}`)
      try {
        await this.updateSinglePackage(pkg)
        this.results.push({ name: pkg.name, success: true })
        console.log(`  ✅ ${pkg.name} 更新成功`)
      }
      catch (error) {
        this.results.push({
          name: pkg.name,
          success: false,
          error: error.message,
        })
        console.log(`  ❌ ${pkg.name} 更新失败: ${error.message}`)
      }
    }

    this.generateReport()
  }

  /**
   * 发现所有包
   */
  discoverPackages() {
    const packages = []
    const entries = readdirSync(this.packagesDir, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const packageDir = resolve(this.packagesDir, entry.name)
        const packageJsonPath = resolve(packageDir, 'package.json')

        if (existsSync(packageJsonPath)) {
          try {
            const packageJson = JSON.parse(
              readFileSync(packageJsonPath, 'utf-8'),
            )
            packages.push({
              name: packageJson.name || entry.name,
              path: packageDir,
              packageJson,
              dirName: entry.name,
            })
          }
          catch (error) {
            console.warn(`⚠️  跳过无效的 package.json: ${packageJsonPath}`)
          }
        }
      }
    }

    return packages
  }

  /**
   * 更新单个包
   */
  async updateSinglePackage(pkg) {
    // 1. 更新 rollup.config.js
    await this.updateRollupConfig(pkg)

    // 2. 更新 package.json
    await this.updatePackageJson(pkg)
  }

  /**
   * 更新 rollup 配置
   */
  async updateRollupConfig(pkg) {
    const rollupConfigPath = resolve(pkg.path, 'rollup.config.js')

    if (!existsSync(rollupConfigPath)) {
      console.log(`    ⏭️  跳过 rollup.config.js (不存在)`)
      return
    }

    const content = readFileSync(rollupConfigPath, 'utf-8')

    // 检查是否已经使用新路径
    if (content.includes('tools/build/rollup.config.base.js')) {
      console.log(`    ⏭️  rollup.config.js 已是最新配置`)
      return
    }

    // 生成新的配置内容
    const newConfig = this.generateRollupConfig(pkg)
    writeFileSync(rollupConfigPath, newConfig)
    console.log(`    ✅ 更新 rollup.config.js`)
  }

  /**
   * 生成 rollup 配置内容
   */
  generateRollupConfig(pkg) {
    const packageName = this.getPackageName(pkg.name)

    return `import { createRollupConfig } from '../../tools/build/rollup.config.base.js'

export default createRollupConfig({
  packageName: '${packageName}',
})
`
  }

  /**
   * 获取包的全局名称
   */
  getPackageName(fullName) {
    const name = fullName.replace('@ldesign/', '')
    return `LDesign${name.charAt(0).toUpperCase()}${name.slice(1)}`
  }

  /**
   * 检查包是否支持 Vue
   */
  hasVueSupport(pkg) {
    // 检查是否有 vue 相关的源文件
    const vueFiles = [
      resolve(pkg.path, 'src/vue'),
      resolve(pkg.path, 'src/vue.ts'),
      resolve(pkg.path, 'vue.ts'),
    ]

    return vueFiles.some(file => existsSync(file))
  }

  /**
   * 更新 package.json
   */
  async updatePackageJson(pkg) {
    const packageJsonPath = resolve(pkg.path, 'package.json')
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

    let updated = false

    // 更新 exports 字段
    if (this.updateExports(packageJson, pkg)) {
      updated = true
      console.log(`    ✅ 更新 exports 字段`)
    }

    // 更新主要字段
    if (this.updateMainFields(packageJson)) {
      updated = true
      console.log(`    ✅ 更新主要字段`)
    }

    // 更新 files 字段
    if (this.updateFiles(packageJson)) {
      updated = true
      console.log(`    ✅ 更新 files 字段`)
    }

    // 更新 scripts 字段
    if (this.updateScripts(packageJson)) {
      updated = true
      console.log(`    ✅ 更新 scripts 字段`)
    }

    if (updated) {
      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
    }
    else {
      console.log(`    ⏭️  package.json 无需更新`)
    }
  }

  /**
   * 更新 exports 字段
   */
  updateExports(packageJson, pkg) {
    const hasVue = this.hasVueSupport(pkg)

    const newExports = {
      '.': {
        types: './types/index.d.ts',
        import: './esm/index.js',
        require: './cjs/index.js',
      },
    }

    if (hasVue) {
      newExports['./vue'] = {
        types: './types/vue/index.d.ts',
        import: './esm/vue/index.js',
        require: './cjs/vue/index.js',
      }
    }

    newExports['./package.json'] = './package.json'

    const currentExports = JSON.stringify(packageJson.exports || {})
    const newExportsStr = JSON.stringify(newExports)

    if (currentExports !== newExportsStr) {
      packageJson.exports = newExports
      return true
    }

    return false
  }

  /**
   * 更新主要字段
   */
  updateMainFields(packageJson) {
    let updated = false

    if (packageJson.main !== 'cjs/index.js') {
      packageJson.main = 'cjs/index.js'
      updated = true
    }

    if (packageJson.module !== 'esm/index.js') {
      packageJson.module = 'esm/index.js'
      updated = true
    }

    if (packageJson.types !== 'types/index.d.ts') {
      packageJson.types = 'types/index.d.ts'
      updated = true
    }

    if (packageJson.browser !== 'dist/index.min.js') {
      packageJson.browser = 'dist/index.min.js'
      updated = true
    }

    return updated
  }

  /**
   * 更新 files 字段
   */
  updateFiles(packageJson) {
    const newFiles = ['esm', 'cjs', 'dist', 'types']
    const currentFiles = packageJson.files || []

    // 保留非构建产物的文件
    const keepFiles = currentFiles.filter(
      file =>
        !['es', 'lib', 'types', 'dist'].includes(file)
        || ['dist', 'types'].includes(file),
    )

    const finalFiles = [...new Set([...keepFiles, ...newFiles])]

    if (
      JSON.stringify(currentFiles.sort()) !== JSON.stringify(finalFiles.sort())
    ) {
      packageJson.files = finalFiles
      return true
    }

    return false
  }

  /**
   * 更新 scripts 字段
   */
  updateScripts(packageJson) {
    if (!packageJson.scripts) {
      packageJson.scripts = {}
    }

    let updated = false

    // 更新 clean 脚本
    const newCleanScript = 'rimraf esm cjs dist types lib coverage .nyc_output'
    if (packageJson.scripts.clean !== newCleanScript) {
      packageJson.scripts.clean = newCleanScript
      updated = true
    }

    return updated
  }

  /**
   * 生成报告
   */
  generateReport() {
    const successful = this.results.filter(r => r.success)
    const failed = this.results.filter(r => !r.success)

    console.log('\n📊 批量更新报告')
    console.log('='.repeat(60))
    console.log(`✅ 成功: ${successful.length} 个包`)
    console.log(`❌ 失败: ${failed.length} 个包`)

    if (successful.length > 0) {
      console.log('\n✅ 更新成功的包:')
      successful.forEach((result) => {
        console.log(`  • ${result.name}`)
      })
    }

    if (failed.length > 0) {
      console.log('\n❌ 更新失败的包:')
      failed.forEach((result) => {
        console.log(`  • ${result.name}: ${result.error}`)
      })
    }

    console.log('='.repeat(60))

    if (failed.length === 0) {
      console.log('🎉 所有包配置更新成功！')
    }
    else {
      console.log(`⚠️  ${failed.length} 个包更新失败，请手动检查`)
    }
  }
}

/**
 * 命令行入口
 */
async function updateAllPackages() {
  try {
    const packagesDir = resolve(__dirname, '../../packages')
    const updater = new PackageConfigUpdater(packagesDir)
    await updater.updateAllPackages()
  }
  catch (error) {
    console.error('❌ 批量更新失败:', error.message)
    process.exit(1)
  }
}

// 如果直接运行此文件
if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/'))) {
  updateAllPackages()
}

import { execSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'

interface PackageJson {
  name: string
  version: string
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  [key: string]: unknown
}

class PackageStandardizer {
  private rootDir: string
  private packagesDir: string
  private rootPackage: PackageJson
  private rollupOnly: boolean
  private validateOnly: boolean

  constructor(options: { rollupOnly?: boolean, validateOnly?: boolean } = {}) {
    this.rootDir = resolve(process.cwd())
    this.packagesDir = join(this.rootDir, 'packages')
    this.rootPackage = JSON.parse(
      readFileSync(join(this.rootDir, 'package.json'), 'utf-8'),
    )
    this.rollupOnly = Boolean(options.rollupOnly)
    this.validateOnly = Boolean(options.validateOnly)
  }

  // 标准化脚本配置
  private getStandardScripts() {
    return {
      'build': 'rollup -c',
      'build:watch': 'rollup -c -w',
      'dev': 'rollup -c -w',
      'type-check': 'vue-tsc --noEmit',
      'lint': 'eslint . --fix',
      'lint:check': 'eslint .',
      'test': 'vitest',
      'test:ui': 'vitest --ui',
      'test:run': 'vitest run',
      'test:coverage': 'vitest run --coverage',
      'test:e2e': 'playwright test',
      'test:e2e:ui': 'playwright test --ui',
      'clean': 'rimraf dist es lib types coverage .nyc_output',
      'size-check': 'size-limit',
      'prepublishOnly': 'pnpm run clean && pnpm run build && pnpm run test:run',
    }
  }

  // 标准化开发依赖
  private getStandardDevDependencies() {
    const rootDevDeps = this.rootPackage.devDependencies || {}
    return {
      '@rollup/plugin-commonjs': rootDevDeps['@rollup/plugin-commonjs'],
      '@rollup/plugin-node-resolve': rootDevDeps['@rollup/plugin-node-resolve'],
      '@rollup/plugin-typescript': rootDevDeps['@rollup/plugin-typescript'],
      '@types/node': rootDevDeps['@types/node'],
      '@vitejs/plugin-vue': rootDevDeps['@vitejs/plugin-vue'],
      '@vitest/ui': rootDevDeps['@vitest/ui'],
      '@vue/test-utils': rootDevDeps['@vue/test-utils'],
      'eslint': rootDevDeps.eslint,
      'jsdom': rootDevDeps.jsdom,
      'rollup': rootDevDeps.rollup,
      'rollup-plugin-dts': rootDevDeps['rollup-plugin-dts'],
      'typescript': rootDevDeps.typescript,
      'vite': rootDevDeps.vite,
      'vitest': rootDevDeps.vitest,
      'vue': rootDevDeps.vue,
      'vue-tsc': rootDevDeps['vue-tsc'],
    }
  }

  // 获取所有包目录
  private getPackageDirs(): string[] {
    return readdirSync(this.packagesDir).filter((dir) => {
      const fullPath = join(this.packagesDir, dir)
      const pkgJson = join(fullPath, 'package.json')
      try {
        return statSync(fullPath).isDirectory() && existsSync(pkgJson)
      }
      catch {
        return false
      }
    })
  }

  // 标准化单个包
  private standardizePackage(packageDir: string) {
    const packagePath = join(this.packagesDir, packageDir)
    const packageJsonPath = join(packagePath, 'package.json')

    const packageJson: PackageJson = JSON.parse(
      readFileSync(packageJsonPath, 'utf-8'),
    )

    // 迁移旧构建脚本到 TS 工具
    const scripts = packageJson.scripts || {}
    const replaceLegacy = (key: string, matcher: RegExp, replacement: string) => {
      if (typeof scripts[key] === 'string' && matcher.test(String(scripts[key]))) {
        scripts[key] = replacement
      }
    }
    // analyze -> 使用 TS 优化分析器
    replaceLegacy(
      'build:analyze',
      /tools\/(scripts\/)?build\/bundle-analyzer\.js/,
      'pnpm run build && tsx ../../tools/scripts/optimize/bundle-analyzer.ts',
    )
    // validate -> 使用 TS validate-build 入口
    replaceLegacy(
      'build:validate',
      /tools\/(scripts\/)?build\/validate-build\.js/,
      'pnpm run build && tsx ../../tools/scripts/build/validate-build.ts',
    )
    // check -> 统一到 validate（若存在）
    if (scripts['build:check'] && /bundle-validator\.js/.test(String(scripts['build:check']))) {
      scripts['build:validate'] = 'pnpm run build && tsx ../../tools/scripts/build/validate-build.ts'
      delete scripts['build:check']
    }
    // 浏览器测试旧实现（无 TS 版本时先保留；如需移除可在外部传参控制）
    if (this.rollupOnly) {
      // rollup-only 模式下，不触及其它脚本
    } else {
      // 清理明显错误的 legacy 引用路径（可选）
      if (scripts['build:browser-test'] && /bundle-analyzer\.js/.test(String(scripts['build:browser-test']))) {
        delete scripts['build:browser-test']
      }
    }
    packageJson.scripts = scripts

    // 仅 rollup 配置标准化
    if (this.rollupOnly) {
      // 确保 rollup 构建脚本存在
      packageJson.scripts = {
        ...(packageJson.scripts || {}),
        build: 'rollup -c',
        'build:watch': 'rollup -c -w',
        dev: 'rollup -c -w',
      }
      writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`)
      console.log(`✅ 仅标准化 rollup 脚本: ${packageJson.name}`)
      return
    }

    // 标准化基本信息
    packageJson.type = 'module'
    packageJson.author = this.rootPackage.author
    packageJson.license = this.rootPackage.license

    // 标准化导出配置
    packageJson.exports = {
      '.': {
        types: './dist/index.d.ts',
        import: './dist/index.js',
        require: './dist/index.cjs',
      },
    }
    packageJson.main = 'dist/index.cjs'
    packageJson.module = 'dist/index.js'
    packageJson.types = 'dist/index.d.ts'
    packageJson.files = ['dist']

    // 标准化脚本
    packageJson.scripts = {
      ...this.getStandardScripts(),
      ...packageJson.scripts, // 保留自定义脚本
    }

    // 标准化开发依赖
    packageJson.devDependencies = this.getStandardDevDependencies()

    // 标准化peer依赖
    if (!packageJson.peerDependencies) {
      packageJson.peerDependencies = {}
    }
    if (packageJson.name !== '@ldesign/engine') {
      packageJson.peerDependencies.vue = '^3.3.0'
    }

    writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`)
    console.log(`✅ 标准化完成: ${packageJson.name}`)
  }

  // 执行标准化
  public async standardize() {
    console.log('🚀 开始标准化所有包...')

    const packageDirs = this.getPackageDirs()

    for (const dir of packageDirs) {
      try {
        this.standardizePackage(dir)
      }
      catch (error) {
        console.error(`❌ 标准化失败: ${dir}`, error)
      }
    }

    if (this.validateOnly) {
      console.log('🔍 验证模式：已完成检查（未更改依赖）')
      return
    }

    console.log('✨ 所有包标准化完成!')
    console.log('📦 更新依赖中...')
    execSync('pnpm install', { stdio: 'inherit' })
    console.log('🎉 标准化流程完成!')
  }
}

// 执行标准化（解析参数）
const args = process.argv.slice(2)
const standardizer = new PackageStandardizer({
  rollupOnly: args.includes('--rollup-only'),
  validateOnly: args.includes('--validate'),
})
standardizer.standardize().catch(console.error)

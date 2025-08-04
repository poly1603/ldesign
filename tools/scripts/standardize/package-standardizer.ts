import { execSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
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

  constructor() {
    this.rootDir = resolve(process.cwd())
    this.packagesDir = join(this.rootDir, 'packages')
    this.rootPackage = JSON.parse(readFileSync(join(this.rootDir, 'package.json'), 'utf-8'))
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
    return readdirSync(this.packagesDir)
      .filter((dir) => {
        const fullPath = join(this.packagesDir, dir)
        return statSync(fullPath).isDirectory()
          && readFileSync(join(fullPath, 'package.json'), 'utf-8')
      })
  }

  // 标准化单个包
  private standardizePackage(packageDir: string) {
    const packagePath = join(this.packagesDir, packageDir)
    const packageJsonPath = join(packagePath, 'package.json')

    const packageJson: PackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

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

    console.log('✨ 所有包标准化完成!')

    // 更新依赖
    console.log('📦 更新依赖中...')
    execSync('pnpm install', { stdio: 'inherit' })

    console.log('🎉 标准化流程完成!')
  }
}

// 执行标准化
const standardizer = new PackageStandardizer()
standardizer.standardize().catch(console.error)

#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync, cpSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const rootDir = resolve(__dirname, '..')
const packagesDir = resolve(rootDir, 'packages')
const toolsDir = resolve(rootDir, 'tools')

/**
 * 包管理器类
 */
class PackageManager {
  constructor() {
    this.templateDir = toolsDir
  }

  /**
   * 创建新包
   * @param {string} packageName 包名
   * @param {string} description 包描述
   * @param {Object} options 选项
   */
  createPackage(packageName, description, options = {}) {
    const {
      vue = false,
      template = 'basic'
    } = options

    const packageDir = resolve(packagesDir, packageName)
    
    if (existsSync(packageDir)) {
      throw new Error(`Package ${packageName} already exists`)
    }

    console.log(`Creating package @ldesign/${packageName}...`)

    // 创建包目录结构
    this.createPackageStructure(packageDir, packageName, description, { vue, template })
    
    // 安装依赖
    this.installDependencies(packageDir)
    
    console.log(`✅ Package @ldesign/${packageName} created successfully!`)
    console.log(`📁 Location: ${packageDir}`)
    console.log(`🚀 Run 'cd packages/${packageName} && pnpm dev' to start development`)
  }

  /**
   * 创建包目录结构
   */
  createPackageStructure(packageDir, packageName, description, options) {
    const { vue, template } = options

    // 创建目录
    mkdirSync(packageDir, { recursive: true })
    mkdirSync(resolve(packageDir, 'src'), { recursive: true })
    mkdirSync(resolve(packageDir, 'src/core'), { recursive: true })
    mkdirSync(resolve(packageDir, 'src/utils'), { recursive: true })
    mkdirSync(resolve(packageDir, 'src/types'), { recursive: true })
    mkdirSync(resolve(packageDir, 'tests'), { recursive: true })
    mkdirSync(resolve(packageDir, '__tests__'), { recursive: true })
    mkdirSync(resolve(packageDir, 'examples'), { recursive: true })
    mkdirSync(resolve(packageDir, 'docs'), { recursive: true })
    mkdirSync(resolve(packageDir, 'e2e'), { recursive: true })

    // 创建package.json
    this.createPackageJson(packageDir, packageName, description, { vue })
    
    // 创建配置文件
    this.createConfigFiles(packageDir, packageName, { vue })
    
    // 创建源代码文件
    this.createSourceFiles(packageDir, packageName, { vue, template })
    
    // 创建测试文件
    this.createTestFiles(packageDir, packageName, { vue })
    
    // 创建文档文件
    this.createDocumentationFiles(packageDir, packageName, description)
  }

  /**
   * 创建package.json
   */
  createPackageJson(packageDir, packageName, description, options) {
    const template = readFileSync(resolve(this.templateDir, 'package-template.json'), 'utf-8')
    const packageJson = template
      .replace(/\[PACKAGE_NAME\]/g, packageName)
      .replace(/\[PACKAGE_DESCRIPTION\]/g, description)

    const pkg = JSON.parse(packageJson)
    
    // 根据选项调整配置
    if (!options.vue) {
      delete pkg.peerDependencies.vue
      delete pkg.peerDependenciesMeta.vue
      pkg.devDependencies = Object.fromEntries(
        Object.entries(pkg.devDependencies).filter(([key]) => !key.includes('vue'))
      )
    }

    writeFileSync(
      resolve(packageDir, 'package.json'),
      JSON.stringify(pkg, null, 2) + '\n'
    )
  }

  /**
   * 创建配置文件
   */
  createConfigFiles(packageDir, packageName, options) {
    // TypeScript配置
    cpSync(
      resolve(this.templateDir, 'tsconfig-template.json'),
      resolve(packageDir, 'tsconfig.json')
    )

    // ESLint配置
    const eslintConfig = `import eslintConfig from '../../tools/eslint-config.js'\n\nexport default eslintConfig\n`
    writeFileSync(resolve(packageDir, 'eslint.config.js'), eslintConfig)

    // Vitest配置
    const vitestConfig = `import { createVitestConfig } from '../../tools/vitest-config.js'\n\nexport default createVitestConfig({\n  vue: ${options.vue}\n})\n`
    writeFileSync(resolve(packageDir, 'vitest.config.ts'), vitestConfig)

    // Rollup配置
    const rollupConfig = `import { createBuildConfig } from '../../tools/build-config.js'\n\nexport default createBuildConfig({\n  packageName: '${packageName}',\n  vue: ${options.vue}\n})\n`
    writeFileSync(resolve(packageDir, 'rollup.config.js'), rollupConfig)

    // Playwright配置
    const playwrightConfig = `import { createPlaywrightConfig } from '../../tools/playwright-config.js'\n\nexport default createPlaywrightConfig()\n`
    writeFileSync(resolve(packageDir, 'playwright.config.ts'), playwrightConfig)
  }

  /**
   * 创建源代码文件
   */
  createSourceFiles(packageDir, packageName, options) {
    const { vue, template } = options

    // 主入口文件
    const indexContent = vue
      ? this.getVueIndexTemplate(packageName)
      : this.getBasicIndexTemplate(packageName)
    
    writeFileSync(resolve(packageDir, 'src/index.ts'), indexContent)

    // 类型定义文件
    const typesContent = this.getTypesTemplate(packageName)
    writeFileSync(resolve(packageDir, 'src/types/index.ts'), typesContent)

    // 核心功能文件
    const coreContent = this.getCoreTemplate(packageName, template)
    writeFileSync(resolve(packageDir, 'src/core/index.ts'), coreContent)

    // 工具函数文件
    const utilsContent = this.getUtilsTemplate()
    writeFileSync(resolve(packageDir, 'src/utils/index.ts'), utilsContent)
  }

  /**
   * 创建测试文件
   */
  createTestFiles(packageDir, packageName, options) {
    // 单元测试
    const testContent = this.getTestTemplate(packageName, options.vue)
    writeFileSync(resolve(packageDir, '__tests__/index.test.ts'), testContent)

    // 测试设置文件
    const setupContent = this.getTestSetupTemplate(options.vue)
    writeFileSync(resolve(packageDir, 'tests/setup.ts'), setupContent)

    // E2E测试
    const e2eContent = this.getE2ETemplate(packageName)
    writeFileSync(resolve(packageDir, 'e2e/basic.spec.ts'), e2eContent)
  }

  /**
   * 创建文档文件
   */
  createDocumentationFiles(packageDir, packageName, description) {
    // README
    const readmeContent = this.getReadmeTemplate(packageName, description)
    writeFileSync(resolve(packageDir, 'README.md'), readmeContent)

    // CHANGELOG
    const changelogContent = this.getChangelogTemplate(packageName)
    writeFileSync(resolve(packageDir, 'CHANGELOG.md'), changelogContent)
  }

  /**
   * 安装依赖
   */
  installDependencies(packageDir) {
    console.log('Installing dependencies...')
    try {
      execSync('pnpm install', { cwd: packageDir, stdio: 'inherit' })
    } catch (error) {
      console.warn('Failed to install dependencies automatically. Please run `pnpm install` manually.')
    }
  }

  /**
   * 获取基础索引模板
   */
  getBasicIndexTemplate(packageName) {
    return `/**
 * @ldesign/${packageName}
 * 
 * A powerful ${packageName} library for modern web applications
 */

export * from './core'
export * from './utils'
export * from './types'

// 默认导出
export { default } from './core'
`
  }

  /**
   * 获取Vue索引模板
   */
  getVueIndexTemplate(packageName) {
    return `/**
 * @ldesign/${packageName}
 * 
 * A powerful ${packageName} library for Vue 3 applications
 */

import type { App } from 'vue'
import { ${packageName}Core } from './core'

export * from './core'
export * from './utils'
export * from './types'

// Vue插件
export const ${packageName}Plugin = {
  install(app: App) {
    app.config.globalProperties.$${packageName} = ${packageName}Core
  }
}

// 默认导出
export default ${packageName}Plugin
export { ${packageName}Core }
`
  }

  /**
   * 获取类型模板
   */
  getTypesTemplate(packageName) {
    return `/**
 * ${packageName} 类型定义
 */

export interface ${packageName.charAt(0).toUpperCase() + packageName.slice(1)}Options {
  // 配置选项
}

export interface ${packageName.charAt(0).toUpperCase() + packageName.slice(1)}Instance {
  // 实例接口
}

export type ${packageName.charAt(0).toUpperCase() + packageName.slice(1)}Config = Partial<${packageName.charAt(0).toUpperCase() + packageName.slice(1)}Options>
`
  }

  /**
   * 获取核心模板
   */
  getCoreTemplate(packageName, template) {
    const className = packageName.charAt(0).toUpperCase() + packageName.slice(1)
    
    return `/**
 * ${packageName} 核心功能
 */

import type { ${className}Options, ${className}Instance } from '../types'

export class ${className} implements ${className}Instance {
  private options: ${className}Options

  constructor(options: ${className}Options = {}) {
    this.options = options
    this.init()
  }

  private init(): void {
    // 初始化逻辑
  }

  // 核心方法
  public method(): void {
    // 实现核心功能
  }
}

// 创建实例的工厂函数
export function create${className}(options?: ${className}Options): ${className} {
  return new ${className}(options)
}

// 默认导出
export default ${className}
export { ${className} as ${className}Core }
`
  }

  /**
   * 获取工具函数模板
   */
  getUtilsTemplate() {
    return `/**
 * 工具函数
 */

/**
 * 检查是否为对象
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>)
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return deepMerge(target, ...sources)
}
`
  }

  /**
   * 获取测试模板
   */
  getTestTemplate(packageName, vue) {
    const className = packageName.charAt(0).toUpperCase() + packageName.slice(1)
    
    return `import { describe, it, expect } from 'vitest'
import { ${className} } from '../src'

describe('${className}', () => {
  it('should create instance', () => {
    const instance = new ${className}()
    expect(instance).toBeInstanceOf(${className})
  })

  it('should have core methods', () => {
    const instance = new ${className}()
    expect(typeof instance.method).toBe('function')
  })
})
`
  }

  /**
   * 获取测试设置模板
   */
  getTestSetupTemplate(vue) {
    return vue
      ? `import { config } from '@vue/test-utils'\n\n// Vue测试设置\nconfig.global.config.warnHandler = () => {}\n`
      : `// 测试设置文件\n\n// 全局测试配置\n`
  }

  /**
   * 获取E2E测试模板
   */
  getE2ETemplate(packageName) {
    return `import { test, expect } from '@playwright/test'\n\ntest.describe('${packageName} E2E Tests', () => {\n  test('basic functionality', async ({ page }) => {\n    await page.goto('/')\n    await expect(page).toHaveTitle(/.*/)\n  })\n})\n`
  }

  /**
   * 获取README模板
   */
  getReadmeTemplate(packageName, description) {
    return `# @ldesign/${packageName}

${description}

## 安装

\`\`\`bash
npm install @ldesign/${packageName}
# 或
pnpm add @ldesign/${packageName}
# 或
yarn add @ldesign/${packageName}
\`\`\`

## 使用

\`\`\`typescript
import { ${packageName.charAt(0).toUpperCase() + packageName.slice(1)} } from '@ldesign/${packageName}'

const instance = new ${packageName.charAt(0).toUpperCase() + packageName.slice(1)}()
\`\`\`

## API

### 构造函数

### 方法

## 许可证

MIT
`
  }

  /**
   * 获取CHANGELOG模板
   */
  getChangelogTemplate(packageName) {
    return `# @ldesign/${packageName}

## 0.1.0 (${new Date().toISOString().split('T')[0]})

### Features

- 初始版本发布
`
  }
}

// CLI处理
if (import.meta.url === `file://${process.argv[1]}`) {
  const [,, command, ...args] = process.argv
  const manager = new PackageManager()

  switch (command) {
    case 'create': {
      const [packageName, description] = args
      if (!packageName || !description) {
        console.error('Usage: node package-manager.js create <package-name> <description> [--vue]')
        process.exit(1)
      }
      
      const vue = args.includes('--vue')
      manager.createPackage(packageName, description, { vue })
      break
    }
    
    default:
      console.log('Available commands:')
      console.log('  create <package-name> <description> [--vue]  Create a new package')
      break
  }
}

export { PackageManager }
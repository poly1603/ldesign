#!/usr/bin/env tsx

import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'

interface PackageOptions {
  name: string
  description: string
  keywords?: string[]
  dependencies?: string[]
  peerDependencies?: string[]
}

class PackageTemplate {
  private rootDir: string
  private packagesDir: string

  constructor() {
    this.rootDir = resolve(process.cwd())
    this.packagesDir = join(this.rootDir, 'packages')
  }

  // 创建包目录结构
  private createDirectoryStructure(packageName: string) {
    const packageDir = join(this.packagesDir, packageName)

    if (existsSync(packageDir)) {
      throw new Error(`包 ${packageName} 已存在`)
    }

    // 创建目录结构
    const dirs = [
      packageDir,
      join(packageDir, 'src'),
      join(packageDir, 'src', 'types'),
      join(packageDir, 'src', 'utils'),
      join(packageDir, '__tests__'),
      join(packageDir, 'examples'),
      join(packageDir, 'docs'),
    ]

    dirs.forEach(dir => mkdirSync(dir, { recursive: true }))

    return packageDir
  }

  // 生成 package.json
  private generatePackageJson(packageDir: string, options: PackageOptions) {
    const packageJson = {
      name: `@ldesign/${options.name}`,
      type: 'module',
      version: '0.1.0',
      description: options.description,
      author: 'ldesign',
      license: 'MIT',
      keywords: ['ldesign', 'vue3', 'typescript', ...(options.keywords || [])],
      exports: {
        '.': {
          types: './dist/index.d.ts',
          import: './dist/index.js',
          require: './dist/index.cjs',
        },
      },
      main: 'dist/index.cjs',
      module: 'dist/index.js',
      types: 'dist/index.d.ts',
      files: ['dist'],
      scripts: {
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
        'clean': 'rimraf dist es lib types coverage .nyc_output',
        'size-check': 'size-limit',
        'prepublishOnly': 'pnpm run clean && pnpm run build && pnpm run test:run',
      },
      peerDependencies: {
        vue: '^3.3.0',
        ...(options.peerDependencies?.reduce((acc, dep) => {
          acc[dep] = '^1.0.0' // 默认版本，需要手动调整
          return acc
        }, {} as Record<string, string>) || {}),
      },
      dependencies:
        options.dependencies?.reduce((acc, dep) => {
          acc[dep] = '^1.0.0' // 默认版本，需要手动调整
          return acc
        }, {} as Record<string, string>) || {},
      devDependencies: {
        '@rollup/plugin-commonjs': '^25.0.7',
        '@rollup/plugin-node-resolve': '^15.2.3',
        '@rollup/plugin-typescript': '^11.1.6',
        '@types/node': '^22.0.0',
        '@vitejs/plugin-vue': '^5.0.3',
        '@vitest/ui': '^2.0.0',
        '@vue/test-utils': '^2.4.4',
        'eslint': '^9.0.0',
        'jsdom': '^24.0.0',
        'rollup': '^4.9.6',
        'rollup-plugin-dts': '^6.1.0',
        'typescript': '^5.6.0',
        'vite': '^5.0.12',
        'vitest': '^2.0.0',
        'vue': '^3.4.15',
        'vue-tsc': '^1.8.27',
      },
    }

    writeFileSync(
      join(packageDir, 'package.json'),
      `${JSON.stringify(packageJson, null, 2)}\n`,
    )
  }

  // 生成 TypeScript 配置
  private generateTsConfig(packageDir: string) {
    const tsConfig = {
      extends: '../../tools/configs/tsconfig.base.json',
      compilerOptions: {
        baseUrl: '.',
        paths: {
          '@/*': ['src/*'],
        },
      },
      include: ['src/**/*', '__tests__/**/*', 'examples/**/*'],
    }

    writeFileSync(
      join(packageDir, 'tsconfig.json'),
      `${JSON.stringify(tsConfig, null, 2)}\n`,
    )
  }

  // 生成 Rollup 配置
  private generateRollupConfig(packageDir: string) {
    const rollupConfig = `import { createRollupConfig } from '../../tools/configs/rollup.base.config.js'

export default createRollupConfig(process.cwd())
`

    writeFileSync(join(packageDir, 'rollup.config.js'), rollupConfig)
  }

  // 生成主入口文件
  private generateMainFiles(packageDir: string, packageName: string) {
    // src/index.ts
    const indexContent = `/**
 * @ldesign/${packageName}
 * ${packageName} package for LDesign
 */

export * from './types'
export * from './utils'

// 主要导出
export { default } from './${packageName}'
`

    writeFileSync(join(packageDir, 'src', 'index.ts'), indexContent)

    // src/{packageName}.ts
    const mainContent = `import type { ${capitalize(
      packageName,
    )}Options } from './types'

/**
 * ${capitalize(packageName)} 类
 */
export class ${capitalize(packageName)} {
  private options: ${capitalize(packageName)}Options

  constructor(options: ${capitalize(packageName)}Options = {}) {
    this.options = options
  }

  /**
   * 初始化
   */
  init(): void {
    console.log(this.name + ' initialized with version ' + this.version)
    this.isInitialized = true
    
    // 触发初始化事件
    if (this.config.onInit) {
      this.config.onInit()
    }
  }

  /**
   * 销毁
   */
  destroy(): void {
    if (!this.isInitialized) {
      console.warn(this.name + ' is not initialized')
      return
    }

    console.log(this.name + ' destroyed')
    this.isInitialized = false
    
    // 触发销毁事件
    if (this.config.onDestroy) {
      this.config.onDestroy()
    }
    
    // 清理配置
    this.config = {}
  }
}

export default ${capitalize(packageName)}
`

    writeFileSync(join(packageDir, 'src', `${packageName}.ts`), mainContent)

    // src/types/index.ts
    const typesContent = `/**
 * ${capitalize(packageName)} 配置选项
 */
export interface ${capitalize(packageName)}Options {
  debug?: boolean
  version?: string
  onInit?: () => void
  onDestroy?: () => void
  // 其他配置选项可在此添加
}

/**
 * ${capitalize(packageName)} 实例接口
 */
export interface I${capitalize(packageName)} {
  init(): void
  destroy(): void
}
`

    writeFileSync(join(packageDir, 'src', 'types', 'index.ts'), typesContent)

    // src/utils/index.ts
    const utilsContent = `/**
 * 工具函数
 */

/**
 * 示例工具函数
 */
export function example(): string {
  return 'Hello from ${packageName}!'
}
`

    writeFileSync(join(packageDir, 'src', 'utils', 'index.ts'), utilsContent)
  }

  // 生成测试文件
  private generateTestFiles(packageDir: string, packageName: string) {
    const testContent = `import { describe, it, expect } from 'vitest'
import ${capitalize(packageName)} from '../src/${packageName}'

describe('${capitalize(packageName)}', () => {
  it('should create instance', () => {
    const instance = new ${capitalize(packageName)}()
    expect(instance).toBeInstanceOf(${capitalize(packageName)})
  })

  it('should initialize', () => {
    const instance = new ${capitalize(packageName)}()
    expect(() => instance.init()).not.toThrow()
  })

  it('should destroy', () => {
    const instance = new ${capitalize(packageName)}()
    instance.init()
    expect(() => instance.destroy()).not.toThrow()
  })
})
`

    writeFileSync(
      join(packageDir, '__tests__', `${packageName}.test.ts`),
      testContent,
    )
  }

  // 生成示例文件
  private generateExampleFiles(packageDir: string, packageName: string) {
    const exampleContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${capitalize(packageName)} Example</title>
</head>
<body>
  <div id="app">
    <h1>${capitalize(packageName)} 示例</h1>
    <div id="demo"></div>
  </div>

  <script type="module">
    import ${capitalize(packageName)} from '../src/index.js'
    
    const instance = new ${capitalize(packageName)}()
    instance.init()
    
    document.getElementById('demo').textContent = '${capitalize(
      packageName,
    )} 已初始化'
  </script>
</body>
</html>
`

    writeFileSync(join(packageDir, 'examples', 'basic.html'), exampleContent)
  }

  // 生成文档文件
  private generateDocFiles(
    packageDir: string,
    packageName: string,
    description: string,
  ) {
    const readmeContent = `# @ldesign/${packageName}

${description}

## 安装

\`\`\`bash
pnpm add @ldesign/${packageName}
\`\`\`

## 使用

\`\`\`typescript
import ${capitalize(packageName)} from '@ldesign/${packageName}'

const instance = new ${capitalize(packageName)}()
instance.init()
\`\`\`

## API

### ${capitalize(packageName)}

#### 构造函数

\`\`\`typescript
new ${capitalize(packageName)}(options?: ${capitalize(packageName)}Options)
\`\`\`

#### 方法

- \`init()\`: 初始化
- \`destroy()\`: 销毁

## 许可证

MIT
`

    writeFileSync(join(packageDir, 'README.md'), readmeContent)
  }

  // 创建包
  async createPackage(options: PackageOptions) {
    console.log(`🚀 创建包: @ldesign/${options.name}`)

    try {
      // 1. 创建目录结构
      const packageDir = this.createDirectoryStructure(options.name)
      console.log('✅ 目录结构创建完成')

      // 2. 生成配置文件
      this.generatePackageJson(packageDir, options)
      this.generateTsConfig(packageDir)
      this.generateRollupConfig(packageDir)
      console.log('✅ 配置文件生成完成')

      // 3. 生成源码文件
      this.generateMainFiles(packageDir, options.name)
      console.log('✅ 源码文件生成完成')

      // 4. 生成测试文件
      this.generateTestFiles(packageDir, options.name)
      console.log('✅ 测试文件生成完成')

      // 5. 生成示例文件
      this.generateExampleFiles(packageDir, options.name)
      console.log('✅ 示例文件生成完成')

      // 6. 生成文档文件
      this.generateDocFiles(packageDir, options.name, options.description)
      console.log('✅ 文档文件生成完成')

      // 7. 安装依赖
      console.log('📦 安装依赖...')
      execSync('pnpm install', { stdio: 'inherit' })

      console.log(`🎉 包 @ldesign/${options.name} 创建完成!`)
      console.log(`📁 位置: packages/${options.name}`)
      console.log(`🔧 下一步: cd packages/${options.name} && pnpm dev`)
    }
    catch (error) {
      console.error('❌ 创建包失败:', error)
      throw error
    }
  }
}

// 工具函数
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// CLI 接口
const args = process.argv.slice(2)

if (args.length < 2) {
  console.log(`
使用方法:
  tsx tools/scripts/package/package-template.ts <name> <description> [keywords] [dependencies] [peerDependencies]

示例:
  tsx tools/scripts/package/package-template.ts utils "工具函数库" "utils,helpers" "" ""
  tsx tools/scripts/package/package-template.ts ui "UI组件库" "ui,components" "vue" "vue"
`)
  process.exit(1)
}

const [
  name,
  description,
  keywords = '',
  dependencies = '',
  peerDependencies = '',
] = args

const template = new PackageTemplate()

template
  .createPackage({
    name,
    description,
    keywords: keywords ? keywords.split(',').map(k => k.trim()) : [],
    dependencies: dependencies
      ? dependencies.split(',').map(d => d.trim())
      : [],
    peerDependencies: peerDependencies
      ? peerDependencies.split(',').map(p => p.trim())
      : [],
  })
  .catch(console.error)

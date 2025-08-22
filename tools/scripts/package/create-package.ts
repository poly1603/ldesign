#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export interface CreatePackageOptions {
  vue?: boolean
  template?: 'basic' | 'vue' | 'node'
  description?: string
  author?: string
  license?: string
}

/**
 * 创建新的包
 * @param packageName 包名
 * @param options 选项
 */
export function createPackage(
  packageName: string,
  options: CreatePackageOptions = {},
): void {
  const {
    vue = false,
    // template = 'basic',
    description = `LDesign ${packageName} package`,
    author = 'LDesign Team',
    license = 'MIT',
  } = options

  const packagesDir = path.resolve(__dirname, '../../../packages')
  const packageDir = path.resolve(packagesDir, packageName)

  // 检查包是否已存在
  if (fs.existsSync(packageDir)) {
    console.error(`❌ 包 ${packageName} 已存在`)
    process.exit(1)
  }

  console.log(`🚀 创建包: @ldesign/${packageName}`)

  // 创建包目录
  fs.mkdirSync(packageDir, { recursive: true })

  // 创建基础目录结构
  const dirs = [
    'src',
    'src/types',
    'src/utils',
    '__tests__',
    'e2e',
    'docs',
    'examples',
  ]

  if (vue) {
    dirs.push('src/vue')
  }

  dirs.forEach((dir) => {
    fs.mkdirSync(path.resolve(packageDir, dir), { recursive: true })
  })

  // 读取模板文件
  const templatePath = path.resolve(
    __dirname,
    '../../configs/templates/package-template.json',
  )
  const packageTemplate = JSON.parse(fs.readFileSync(templatePath, 'utf-8'))

  // 替换模板变量
  packageTemplate.name = `@ldesign/${packageName}`
  packageTemplate.description = description
  packageTemplate.author = author
  packageTemplate.license = license

  // 添加包名到关键词
  if (packageTemplate.keywords) {
    packageTemplate.keywords.push(packageName)
  }

  // 更新部署脚本中的包名
  if (packageTemplate.scripts) {
    packageTemplate.scripts.deploy = `tsx ../../tools/deploy/package-deployer.ts ${packageName}`
    packageTemplate.scripts[
      'deploy:beta'
    ] = `tsx ../../tools/deploy/package-deployer.ts ${packageName} --tag beta`
    packageTemplate.scripts[
      'deploy:alpha'
    ] = `tsx ../../tools/deploy/package-deployer.ts ${packageName} --tag alpha`
    packageTemplate.scripts[
      'deploy:dry-run'
    ] = `tsx ../../tools/deploy/package-deployer.ts ${packageName} --dry-run`
  }

  // 写入 package.json
  fs.writeFileSync(
    path.resolve(packageDir, 'package.json'),
    JSON.stringify(packageTemplate, null, 2),
  )

  // 创建基础文件
  createBasicFiles(packageDir, packageName, description, { vue })
  createTestFiles(packageDir)
  createExampleFiles(packageDir, packageName, description)

  console.log(`✅ 包 @ldesign/${packageName} 创建成功`)
  console.log(`📁 位置: packages/${packageName}`)
  console.log(`\n📝 下一步:`)
  console.log(`   cd packages/${packageName}`)
  console.log(`   pnpm install`)
  console.log(`   pnpm dev`)
}

/**
 * 创建基础文件
 */
function createBasicFiles(
  packageDir: string,
  packageName: string,
  description: string,
  options: { vue?: boolean } = {},
): void {
  const { vue = false } = options

  // src/index.ts
  const indexContent = vue
    ? `// Core exports
export * from './core'
export * from './types'
export * from './utils'

// Default export
export { default } from './core'
`
    : `// Core exports
export * from './types'
export * from './utils'

// Main functionality
export function ${toCamelCase(packageName)}() {
  console.log('${description}')
}

/**
 * 生成基础测试文件
 */
function createTestFiles(packageDir: string): void {
  const testContent = `import { describe, it, expect } from 'vitest'
  import { isValidInput } from '../src/utils'

  describe('utils', () => {
    it('isValidInput should validate non-nullish values', () => {
      expect(isValidInput('a')).toBe(true)
      expect(isValidInput(0)).toBe(true)
      expect(isValidInput(false)).toBe(true)
      expect(isValidInput(null)).toBe(false)
      expect(isValidInput(undefined)).toBe(false)
    })
  })
    `

  fs.writeFileSync(path.resolve(packageDir, '__tests__/basic.test.ts'), testContent)
}

/**
 * 生成基础示例文件
 */
function createExampleFiles(
  packageDir: string,
  packageName: string,
  description: string,
): void {
  const exampleHtml = `< !DOCTYPE html >
    <html lang="zh-CN" >
      <head>
      <meta charset="UTF-8" >
        <meta name="viewport" content = "width=device-width, initial-scale=1.0" >
          <title>@ldesign / ${ packageName } Example </title>
            <style>
    body { font - family: -apple - system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; padding: 24px; }
    code { background: #f6f8fa; padding: 2px 6px; border - radius: 4px; }
  </style>
    </head>
    < body >
    <h1>@ldesign / ${ packageName } 示例 </h1>
      < p > ${ description } </p>
        < div id = "app" > </div>
          < p style = "margin-top:16px;color:#666" > 开发模式下可使用 < code > pnpm dev < /code> 运行并从 <code>src</code > 导入；生产模式下请从 < code > dist < /code> 导入构建产物。</p >

            <script type="module" >
              // 开发时可改为从 '../src/index.ts' 导入
              // 生产构建后，改为从 '../dist/index.js' 导入
              console.log('Example loaded for @ldesign/${packageName}')
              </script>
              </body>
              </html>
                `

  fs.writeFileSync(path.resolve(packageDir, 'examples/basic.html'), exampleHtml)
}

export default {
  ${toCamelCase(packageName)}
}
`

  fs.writeFileSync(path.resolve(packageDir, 'src/index.ts'), indexContent)

  // src/types/index.ts
  fs.writeFileSync(
    path.resolve(packageDir, 'src/types/index.ts'),
    `export interface ${toPascalCase(packageName)}Options {
  // 配置选项
}

export interface ${toPascalCase(packageName)}Instance {
  // 实例接口
}
`,
  )

  // src/utils/index.ts
  fs.writeFileSync(
    path.resolve(packageDir, 'src/utils/index.ts'),
    `/**
 * 工具函数
 */
export function isValidInput(input: unknown): boolean {
  return input != null
}
`,
  )

  // src/core/index.ts (仅Vue包需要)
  if (vue) {
    fs.mkdirSync(path.resolve(packageDir, 'src/core'), { recursive: true })
    fs.writeFileSync(
      path.resolve(packageDir, 'src/core/index.ts'),
      `/**
 * ${toPascalCase(packageName)} 核心模块
 */
import type { ${toPascalCase(packageName)}Options } from '../types'

export class ${toPascalCase(packageName)} {
  private options: ${toPascalCase(packageName)}Options

  constructor(options: ${toPascalCase(packageName)}Options = {}) {
    this.options = options
  }

  // 核心方法
  public init(): void {
    console.log('${toPascalCase(packageName)} initialized')
  }
}

// 默认导出
export default ${toPascalCase(packageName)}
`,
    )
  }

  // Vue 集成
  if (vue) {
    fs.writeFileSync(
      path.resolve(packageDir, 'src/vue/index.ts'),
      `import type { App } from 'vue'
import type { ${toPascalCase(packageName)}Options } from '../types'

export function install(app: App, options?: ${toPascalCase(
        packageName,
      )}Options) {
  // Vue 插件安装逻辑
}

export default {
  install
}

// 重新导出核心功能
export * from '../index'
`,
    )
  }

  // README.md
  fs.writeFileSync(
    path.resolve(packageDir, 'README.md'),
    createReadmeContent(packageName, description, vue),
  )

  // 配置文件
  createConfigFiles(packageDir, packageName, vue)
}

/**
 * 创建配置文件
 */
function createConfigFiles(
  packageDir: string,
  packageName: string,
  vue: boolean,
): void {
  // tsconfig.json
  fs.writeFileSync(
    path.resolve(packageDir, 'tsconfig.json'),
    `{
  "extends": "../../tools/configs/build/tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": [
    "src/**/*",
    "examples/**/*",
    "__tests__/**/*",
    "e2e/**/*"
  ]
}
`,
  )

  // rollup.config.js
  const rollupConfig = vue
    ? `import { createRollupConfig } from '../../tools/configs/build/rollup.config.base.js'

export default createRollupConfig({
  external: ['vue'],
  globalName: 'LDesign${toPascalCase(packageName)}',
  globals: {
    'vue': 'Vue'
  },
  vue: true
})
`
    : `import { createRollupConfig } from '../../tools/configs/build/rollup.config.base.js'

export default createRollupConfig({
  globalName: 'LDesign${toPascalCase(packageName)}'
})
`

  fs.writeFileSync(path.resolve(packageDir, 'rollup.config.js'), rollupConfig)

  // vitest.config.ts
  fs.writeFileSync(
    path.resolve(packageDir, 'vitest.config.ts'),
    `import { createVitestConfig } from '../../tools/configs/test/vitest.config.base'

export default createVitestConfig({
  vue: ${vue}
})
`,
  )

  // playwright.config.ts
  fs.writeFileSync(
    path.resolve(packageDir, 'playwright.config.ts'),
    `import { createPlaywrightConfig } from '../../tools/configs/test/playwright.config.base'

export default createPlaywrightConfig({
  webServer: {
    command: 'pnpm dev',
    port: 5173
  }
})
`,
  )

  // eslint.config.js
  fs.writeFileSync(
    path.resolve(packageDir, 'eslint.config.js'),
    `import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: ${vue},
  ignores: [
    'dist',
    'es',
    'lib',
    'types',
    'node_modules',
    '*.d.ts'
  ]
})
`,
  )
}

/**
 * 创建 README 内容
 */
function createReadmeContent(
  packageName: string,
  description: string,
  vue: boolean,
): string {
  return `# @ldesign/${packageName}

${description}

## 特性

- 🚀 **高性能** - 优化的性能表现
- 🎯 **类型安全** - 完整的 TypeScript 支持
- 📦 **轻量级** - 最小化的包体积
- 🔧 **易于使用** - 简洁的 API 设计
${vue ? '- 🌟 **Vue 3 集成** - 原生 Vue 3 支持' : ''}

## 安装

\`\`\`bash
npm install @ldesign/${packageName}
# 或
pnpm add @ldesign/${packageName}
# 或
yarn add @ldesign/${packageName}
\`\`\`

## 使用

### 基础用法

\`\`\`typescript
import { ${toCamelCase(packageName)} } from '@ldesign/${packageName}'

${toCamelCase(packageName)}()
\`\`\`

${vue
      ? `### Vue 3 集成

\`\`\`typescript
import { createApp } from 'vue'
import ${toPascalCase(packageName)}Plugin from '@ldesign/${packageName}/vue'

const app = createApp({})
app.use(${toPascalCase(packageName)}Plugin)
\`\`\`

### 组合式 API

\`\`\`vue
<script setup>
import { use${toPascalCase(packageName)} } from '@ldesign/${packageName}/vue'

const ${toCamelCase(packageName)} = use${toPascalCase(packageName)}()
</script>
\`\`\`
`
      : ''
    }

## API 文档

详细的 API 文档请访问：[文档站点](https://ldesign.github.io/${packageName}/)

## 开发

\`\`\`bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 测试
pnpm test

# E2E 测试
pnpm test:e2e

# 文档开发
pnpm docs:dev
\`\`\`

## 许可证

MIT © LDesign Team
`
}

// 工具函数
function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, g => g[1].toUpperCase())
}

function toPascalCase(str: string): string {
  return toCamelCase(str).replace(/^[a-z]/, g => g.toUpperCase())
}

// CLI 处理
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const args = process.argv.slice(2)

  if (args.length < 1) {
    console.log(
      '用法: tsx tools/package/create-package.ts <package-name> [options]',
    )
    console.log('选项:')
    console.log('  --vue          创建 Vue 包')
    console.log('  --description  包描述')
    process.exit(1)
  }

  const packageName = args[0]
  const vue = args.includes('--vue')
  const descriptionIndex = args.indexOf('--description')
  const description
    = descriptionIndex !== -1 ? args[descriptionIndex + 1] : undefined

  createPackage(packageName, { vue, description })
}

// createPackage 已在上面导出

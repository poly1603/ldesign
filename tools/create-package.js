#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * 创建新的包
 * @param {string} packageName 包名
 * @param {string} description 包描述
 * @param {Object} options 选项
 */
function createPackage(packageName, description, options = {}) {
  const { vue = false, template = 'basic' } = options
  
  const packagesDir = path.resolve(__dirname, '../packages')
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
    'docs',
    'examples',
    'e2e'
  ]
  
  if (vue) {
    dirs.push('src/vue')
  }
  
  dirs.forEach(dir => {
    fs.mkdirSync(path.resolve(packageDir, dir), { recursive: true })
  })
  
  // 读取模板文件
  const templatePath = path.resolve(__dirname, 'package-template.json')
  const packageTemplate = JSON.parse(fs.readFileSync(templatePath, 'utf-8'))
  
  // 替换模板变量
  const packageJson = JSON.stringify(packageTemplate, null, 2)
    .replace(/\{\{PACKAGE_NAME\}\}/g, packageName)
    .replace(/\{\{PACKAGE_DESCRIPTION\}\}/g, description)
  
  // 写入 package.json
  fs.writeFileSync(
    path.resolve(packageDir, 'package.json'),
    packageJson
  )
  
  // 创建基础文件
  createBasicFiles(packageDir, packageName, description, { vue })
  
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
function createBasicFiles(packageDir, packageName, description, options = {}) {
  const { vue = false } = options
  
  // src/index.ts
  const indexContent = vue ? `// Core exports
export * from './core'
export * from './types'
export * from './utils'

// Default export
export { default } from './core'
` : `// Core exports
export * from './types'
export * from './utils'

// Main functionality
export function ${toCamelCase(packageName)}() {
  console.log('${description}')
}

export default {
  ${toCamelCase(packageName)}
}
`
  
  fs.writeFileSync(
    path.resolve(packageDir, 'src/index.ts'),
    indexContent
  )
  
  // src/types/index.ts
  fs.writeFileSync(
    path.resolve(packageDir, 'src/types/index.ts'),
    `export interface ${toPascalCase(packageName)}Options {
  // 配置选项
}

export interface ${toPascalCase(packageName)}Instance {
  // 实例接口
}
`
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
`
  )
  
  // Vue 集成
  if (vue) {
    fs.writeFileSync(
      path.resolve(packageDir, 'src/vue/index.ts'),
      `import type { App } from 'vue'
import type { ${toPascalCase(packageName)}Options } from '../types'

export function install(app: App, options?: ${toPascalCase(packageName)}Options) {
  // Vue 插件安装逻辑
}

export default {
  install
}

// 重新导出核心功能
export * from '../index'
`
    )
  }
  
  // README.md
  fs.writeFileSync(
    path.resolve(packageDir, 'README.md'),
    createReadmeContent(packageName, description, vue)
  )
  
  // 配置文件
  createConfigFiles(packageDir, packageName, vue)
}

/**
 * 创建配置文件
 */
function createConfigFiles(packageDir, packageName, vue) {
  // tsconfig.json
  fs.writeFileSync(
    path.resolve(packageDir, 'tsconfig.json'),
    `{
  "extends": "../../tools/tsconfig.base.json",
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
`
  )
  
  // rollup.config.js
  const rollupConfig = vue ? `import { createRollupConfig } from '../../tools/rollup.config.base.js'

export default createRollupConfig({
  external: ['vue'],
  globalName: 'LDesign${toPascalCase(packageName)}',
  globals: {
    'vue': 'Vue'
  },
  vue: true
})
` : `import { createRollupConfig } from '../../tools/rollup.config.base.js'

export default createRollupConfig({
  globalName: 'LDesign${toPascalCase(packageName)}'
})
`
  
  fs.writeFileSync(
    path.resolve(packageDir, 'rollup.config.js'),
    rollupConfig
  )
  
  // vitest.config.ts
  fs.writeFileSync(
    path.resolve(packageDir, 'vitest.config.ts'),
    `import { createVitestConfig } from '../../tools/vitest.config.base'

export default createVitestConfig({
  vue: ${vue}
})
`
  )
  
  // playwright.config.ts
  fs.writeFileSync(
    path.resolve(packageDir, 'playwright.config.ts'),
    `import { createPlaywrightConfig } from '../../tools/playwright.config.base'

export default createPlaywrightConfig({
  webServer: {
    command: 'pnpm dev',
    port: 5173
  }
})
`
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
`
  )
}

/**
 * 创建 README 内容
 */
function createReadmeContent(packageName, description, vue) {
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

${vue ? `### Vue 3 集成

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
` : ''}

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
function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
}

function toPascalCase(str) {
  return toCamelCase(str).replace(/^[a-z]/, (g) => g.toUpperCase())
}

// CLI 处理
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2)
  
  if (args.length < 2) {
    console.log('用法: node create-package.js <package-name> <description> [--vue]')
    process.exit(1)
  }
  
  const [packageName, description] = args
  const vue = args.includes('--vue')
  
  createPackage(packageName, description, { vue })
}

export { createPackage }

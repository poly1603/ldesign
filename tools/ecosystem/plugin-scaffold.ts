#!/usr/bin/env tsx

/**
 * LDesign 插件开发脚手架
 * 快速创建插件项目模板
 */

import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export interface PluginScaffoldOptions {
  /** 插件名称 */
  name: string
  /** 插件描述 */
  description: string
  /** 作者信息 */
  author: {
    name: string
    email: string
    url?: string
  }
  /** 插件类型 */
  type: PluginType
  /** 目标目录 */
  targetDir: string
  /** 是否使用 TypeScript */
  typescript: boolean
  /** 是否包含测试 */
  includeTests: boolean
  /** 是否包含文档 */
  includeDocs: boolean
  /** 是否包含示例 */
  includeExamples: boolean
  /** 许可证 */
  license: string
}

export type PluginType =
  | 'ui-component'
  | 'utility'
  | 'integration'
  | 'middleware'
  | 'theme'
  | 'development-tool'

export class PluginScaffold {
  private templatesDir: string

  constructor() {
    this.templatesDir = resolve(__dirname, '../templates/plugin')
  }

  /**
   * 创建插件项目
   */
  async createPlugin(options: PluginScaffoldOptions): Promise<void> {
    console.log(chalk.blue(`🚀 创建插件项目: ${options.name}`))

    try {
      // 1. 验证选项
      this.validateOptions(options)

      // 2. 创建项目目录
      this.createProjectDirectory(options.targetDir)

      // 3. 生成项目文件
      await this.generateProjectFiles(options)

      // 4. 安装依赖
      await this.installDependencies(options.targetDir)

      // 5. 初始化 Git
      this.initializeGit(options.targetDir)

      console.log(chalk.green(`✅ 插件项目 ${options.name} 创建成功!`))
      this.printNextSteps(options)
    }
    catch (error) {
      console.error(chalk.red('❌ 创建插件项目失败:'), error)
      throw error
    }
  }

  /**
   * 验证选项
   */
  private validateOptions(options: PluginScaffoldOptions): void {
    if (!options.name) {
      throw new Error('插件名称不能为空')
    }

    if (!options.name.match(/^[a-z0-9-]+$/)) {
      throw new Error('插件名称只能包含小写字母、数字和连字符')
    }

    if (!options.author.name || !options.author.email) {
      throw new Error('作者姓名和邮箱不能为空')
    }

    if (existsSync(options.targetDir)) {
      throw new Error(`目标目录已存在: ${options.targetDir}`)
    }
  }

  /**
   * 创建项目目录
   */
  private createProjectDirectory(targetDir: string): void {
    mkdirSync(targetDir, { recursive: true })

    // 创建基础目录结构
    const dirs = [
      'src',
      'src/components',
      'src/utils',
      'src/types',
      'tests',
      'docs',
      'examples',
      'dist',
    ]

    dirs.forEach((dir) => {
      mkdirSync(join(targetDir, dir), { recursive: true })
    })
  }

  /**
   * 生成项目文件
   */
  private async generateProjectFiles(
    options: PluginScaffoldOptions,
  ): Promise<void> {
    console.log(chalk.yellow('📝 生成项目文件...'))

    // 生成 package.json
    await this.generatePackageJson(options)

    // 生成主入口文件
    await this.generateMainFile(options)

    // 生成类型定义
    if (options.typescript) {
      await this.generateTypeDefinitions(options)
      await this.generateTsConfig(options)
    }

    // 生成测试文件
    if (options.includeTests) {
      await this.generateTestFiles(options)
    }

    // 生成文档
    if (options.includeDocs) {
      await this.generateDocumentation(options)
    }

    // 生成示例
    if (options.includeExamples) {
      await this.generateExamples(options)
    }

    // 生成配置文件
    await this.generateConfigFiles(options)

    // 生成 README
    await this.generateReadme(options)

    // 生成许可证
    await this.generateLicense(options)
  }

  /**
   * 生成 package.json
   */
  private async generatePackageJson(
    options: PluginScaffoldOptions,
  ): Promise<void> {
    const packageJson = {
      name: `@ldesign/plugin-${options.name}`,
      version: '0.1.0',
      description: options.description,
      main: options.typescript ? 'dist/index.js' : 'src/index.js',
      module: options.typescript ? 'dist/index.esm.js' : 'src/index.esm.js',
      types: options.typescript ? 'dist/index.d.ts' : undefined,
      files: ['dist', 'src', 'README.md', 'LICENSE'],
      scripts: {
        'build': options.typescript
          ? 'tsup src/index.ts --format cjs,esm --dts'
          : 'rollup -c',
        'dev': options.typescript
          ? 'tsup src/index.ts --format cjs,esm --dts --watch'
          : 'rollup -c --watch',
        'test': 'vitest',
        'test:coverage': 'vitest --coverage',
        'lint': 'eslint src --ext .ts,.js,.vue',
        'lint:fix': 'eslint src --ext .ts,.js,.vue --fix',
        'type-check': options.typescript ? 'tsc --noEmit' : undefined,
        'docs': 'typedoc src/index.ts',
        'prepublishOnly': 'pnpm build',
      },
      keywords: [
        'ldesign',
        'plugin',
        options.type,
        ...this.getKeywordsByType(options.type),
      ],
      author: {
        name: options.author.name,
        email: options.author.email,
        url: options.author.url,
      },
      license: options.license,
      repository: {
        type: 'git',
        url: `https://github.com/${options.author.name}/${options.name}.git`,
      },
      bugs: {
        url: `https://github.com/${options.author.name}/${options.name}/issues`,
      },
      homepage: `https://github.com/${options.author.name}/${options.name}#readme`,
      peerDependencies: {
        '@ldesign/engine': '^0.1.0',
        'vue': '^3.3.0',
      },
      devDependencies: {
        '@ldesign/engine': '^0.1.0',
        'vue': '^3.3.0',
        ...(options.typescript
          ? {
              'typescript': '^5.0.0',
              'tsup': '^7.0.0',
              '@types/node': '^20.0.0',
            }
          : {
              'rollup': '^3.0.0',
              '@rollup/plugin-node-resolve': '^15.0.0',
              '@rollup/plugin-commonjs': '^25.0.0',
            }),
        ...(options.includeTests
          ? {
              'vitest': '^0.34.0',
              '@vue/test-utils': '^2.4.0',
              'jsdom': '^22.0.0',
            }
          : {}),
        'eslint': '^8.0.0',
        '@typescript-eslint/eslint-plugin': '^6.0.0',
        '@typescript-eslint/parser': '^6.0.0',
        'typedoc': '^0.25.0',
      },
      ldesign: {
        category: options.type,
        dependencies: [],
        engines: {
          ldesign: '^0.1.0',
        },
      },
    }

    // 移除 undefined 值
    const cleanPackageJson = JSON.parse(JSON.stringify(packageJson))

    writeFileSync(
      join(options.targetDir, 'package.json'),
      JSON.stringify(cleanPackageJson, null, 2),
    )
  }

  /**
   * 生成主入口文件
   */
  private async generateMainFile(
    options: PluginScaffoldOptions,
  ): Promise<void> {
    const ext = options.typescript ? 'ts' : 'js'
    const template = this.getMainFileTemplate(options)

    writeFileSync(join(options.targetDir, `src/index.${ext}`), template)
  }

  /**
   * 获取主文件模板
   */
  private getMainFileTemplate(options: PluginScaffoldOptions): string {
    const isTS = options.typescript

    switch (options.type) {
      case 'ui-component':
        return this.getUIComponentTemplate(isTS)
      case 'utility':
        return this.getUtilityTemplate(isTS)
      case 'integration':
        return this.getIntegrationTemplate(isTS)
      case 'middleware':
        return this.getMiddlewareTemplate(isTS)
      case 'theme':
        return this.getThemeTemplate(isTS)
      case 'development-tool':
        return this.getDevelopmentToolTemplate(isTS)
      default:
        return this.getBasicTemplate(isTS)
    }
  }

  /**
   * UI 组件插件模板
   */
  private getUIComponentTemplate(isTS: boolean): string {
    return `${
      isTS ? 'import type { Plugin, Engine } from \'@ldesign/engine\'' : ''
    }
import { defineComponent } from 'vue'

// 组件定义
export const MyComponent = defineComponent({
  name: 'MyComponent',
  props: {
    // 定义组件属性
  },
  setup(props) {
    // 组件逻辑
    return () => {
      // 渲染函数
      return <div>My Component</div>
    }
  }
})

// 插件定义
export const plugin${isTS ? ': Plugin' : ''} = {
  name: '${options.name}',
  version: '0.1.0',
  
  install(engine${isTS ? ': Engine' : ''}) {
    // 注册组件
    engine.component('MyComponent', MyComponent)
    
    // 插件初始化逻辑
    engine.logger.info('${options.name} plugin installed')
  }
}

export default plugin
`
  }

  /**
   * 工具类插件模板
   */
  private getUtilityTemplate(isTS: boolean): string {
    return `${
      isTS ? 'import type { Plugin, Engine } from \'@ldesign/engine\'' : ''
    }

// 工具函数
export function myUtility(input${isTS ? ': any' : ''})${isTS ? ': any' : ''} {
  // 工具函数逻辑
  return input
}

// 插件定义
export const plugin${isTS ? ': Plugin' : ''} = {
  name: '${options.name}',
  version: '0.1.0',
  
  install(engine${isTS ? ': Engine' : ''}) {
    // 注册工具函数到引擎
    engine.utils = engine.utils || {}
    engine.utils.myUtility = myUtility
    
    // 插件初始化逻辑
    engine.logger.info('${options.name} plugin installed')
  }
}

export default plugin
`
  }

  /**
   * 集成插件模板
   */
  private getIntegrationTemplate(isTS: boolean): string {
    return `${
      isTS ? 'import type { Plugin, Engine } from \'@ldesign/engine\'' : ''
    }

// 集成配置
export interface IntegrationConfig {
  apiKey${isTS ? '?: string' : ''}
  baseUrl${isTS ? '?: string' : ''}
}

// 集成类
export class MyIntegration {
  private config${isTS ? ': IntegrationConfig' : ''}
  
  constructor(config${isTS ? ': IntegrationConfig' : ''}) {
    this.config = config
  }
  
  async connect() {
    // 连接逻辑
  }
  
  async disconnect() {
    // 断开连接逻辑
  }
}

// 插件定义
export const plugin${isTS ? ': Plugin' : ''} = {
  name: '${options.name}',
  version: '0.1.0',
  
  install(engine${isTS ? ': Engine' : ''}, options${
    isTS ? ': IntegrationConfig = {}' : ' = {}'
  }) {
    // 创建集成实例
    const integration = new MyIntegration(options)
    
    // 注册到引擎
    engine.integrations = engine.integrations || {}
    engine.integrations.myIntegration = integration
    
    // 插件初始化逻辑
    engine.logger.info('${options.name} plugin installed')
  }
}

export default plugin
`
  }

  /**
   * 中间件插件模板
   */
  private getMiddlewareTemplate(isTS: boolean): string {
    return `${
      isTS
        ? 'import type { Plugin, Engine, MiddlewareContext } from \'@ldesign/engine\''
        : ''
    }

// 中间件函数
export async function myMiddleware(
  context${isTS ? ': MiddlewareContext' : ''},
  next${isTS ? ': () => Promise<void>' : ''}
) {
  // 前置处理
  console.log('Before processing')
  
  try {
    // 执行下一个中间件
    await next()
    
    // 后置处理
    console.log('After processing')
  } catch (error) {
    // 错误处理
    console.error('Middleware error:', error)
    throw error
  }
}

// 插件定义
export const plugin${isTS ? ': Plugin' : ''} = {
  name: '${options.name}',
  version: '0.1.0',
  
  install(engine${isTS ? ': Engine' : ''}) {
    // 注册中间件
    engine.middleware.use({
      name: '${options.name}',
      handler: myMiddleware
    })
    
    // 插件初始化逻辑
    engine.logger.info('${options.name} plugin installed')
  }
}

export default plugin
`
  }

  /**
   * 主题插件模板
   */
  private getThemeTemplate(isTS: boolean): string {
    return `${
      isTS ? 'import type { Plugin, Engine } from \'@ldesign/engine\'' : ''
    }

// 主题配置
export const themeConfig = {
  colors: {
    primary: '#007acc',
    secondary: '#6c757d',
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545',
    info: '#17a2b8'
  },
  fonts: {
    primary: 'Inter, sans-serif',
    mono: 'Monaco, monospace'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  }
}

// 插件定义
export const plugin${isTS ? ': Plugin' : ''} = {
  name: '${options.name}',
  version: '0.1.0',
  
  install(engine${isTS ? ': Engine' : ''}) {
    // 注册主题
    engine.theme = engine.theme || {}
    Object.assign(engine.theme, themeConfig)
    
    // 应用 CSS 变量
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      Object.entries(themeConfig.colors).forEach(([key, value]) => {
        root.style.setProperty(\`--color-\${key}\`, value)
      })
    }
    
    // 插件初始化逻辑
    engine.logger.info('${options.name} plugin installed')
  }
}

export default plugin
`
  }

  /**
   * 开发工具插件模板
   */
  private getDevelopmentToolTemplate(isTS: boolean): string {
    return `${
      isTS ? 'import type { Plugin, Engine } from \'@ldesign/engine\'' : ''
    }

// 开发工具类
export class DevelopmentTool {
  private engine${isTS ? ': Engine' : ''}
  
  constructor(engine${isTS ? ': Engine' : ''}) {
    this.engine = engine
  }
  
  inspect() {
    // 检查引擎状态
    return {
      plugins: this.engine.plugins.getAll(),
      state: this.engine.state.getAll(),
      performance: this.getPerformanceMetrics()
    }
  }
  
  private getPerformanceMetrics() {
    // 获取性能指标
    return {
      memory: process.memoryUsage(),
      uptime: process.uptime()
    }
  }
}

// 插件定义
export const plugin${isTS ? ': Plugin' : ''} = {
  name: '${options.name}',
  version: '0.1.0',
  
  install(engine${isTS ? ': Engine' : ''}) {
    // 只在开发环境启用
    if (process.env.NODE_ENV === 'development') {
      const devTool = new DevelopmentTool(engine)
      
      // 注册到全局
      if (typeof window !== 'undefined') {
        window.__LDESIGN_DEV_TOOL__ = devTool
      }
      
      // 添加调试命令
      engine.commands = engine.commands || {}
      engine.commands.inspect = () => devTool.inspect()
    }
    
    // 插件初始化逻辑
    engine.logger.info('${options.name} plugin installed')
  }
}

export default plugin
`
  }

  /**
   * 基础插件模板
   */
  private getBasicTemplate(isTS: boolean): string {
    return `${
      isTS ? 'import type { Plugin, Engine } from \'@ldesign/engine\'' : ''
    }

// 插件定义
export const plugin${isTS ? ': Plugin' : ''} = {
  name: '${options.name}',
  version: '0.1.0',
  
  install(engine${isTS ? ': Engine' : ''}) {
    // 插件初始化逻辑
    engine.logger.info('${options.name} plugin installed')
  }
}

export default plugin
`
  }

  /**
   * 生成 TypeScript 配置
   */
  private async generateTsConfig(
    options: PluginScaffoldOptions,
  ): Promise<void> {
    const tsConfig = {
      compilerOptions: {
        target: 'ES2020',
        module: 'ESNext',
        moduleResolution: 'node',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        outDir: 'dist',
        jsx: 'preserve',
        jsxImportSource: 'vue',
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', 'tests'],
    }

    writeFileSync(
      join(options.targetDir, 'tsconfig.json'),
      JSON.stringify(tsConfig, null, 2),
    )
  }

  /**
   * 生成类型定义
   */
  private async generateTypeDefinitions(
    options: PluginScaffoldOptions,
  ): Promise<void> {
    const types = `// 插件类型定义
export interface ${this.toPascalCase(options.name)}Options {
  // 插件选项
}

export interface ${this.toPascalCase(options.name)}Plugin {
  name: string
  version: string
  install: (engine: any, options?: ${this.toPascalCase(
    options.name,
  )}Options) => void
}

// 扩展引擎类型
declare module '@ldesign/engine' {
  interface Engine {
    // 添加插件特定的属性和方法
  }
}
`

    writeFileSync(join(options.targetDir, 'src/types/index.ts'), types)
  }

  /**
   * 生成测试文件
   */
  private async generateTestFiles(
    options: PluginScaffoldOptions,
  ): Promise<void> {
    const ext = options.typescript ? 'ts' : 'js'
    const testContent = `import { describe, it, expect } from 'vitest'
import { plugin } from '../src/index${options.typescript ? '' : '.js'}'

describe('${options.name} plugin', () => {
  it('should have correct name', () => {
    expect(plugin.name).toBe('${options.name}')
  })

  it('should have install method', () => {
    expect(typeof plugin.install).toBe('function')
  })

  it('should install without errors', () => {
    const mockEngine = {
      logger: {
        info: vi.fn()
      }
    }

    expect(() => plugin.install(mockEngine)).not.toThrow()
  })
})
`

    writeFileSync(
      join(options.targetDir, `tests/index.test.${ext}`),
      testContent,
    )

    // 生成 Vitest 配置
    const vitestConfig = `import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      reporter: ['text', 'json', 'html']
    }
  }
})
`

    writeFileSync(join(options.targetDir, 'vitest.config.ts'), vitestConfig)
  }

  /**
   * 生成文档
   */
  private async generateDocumentation(
    options: PluginScaffoldOptions,
  ): Promise<void> {
    const docs = `# ${options.name}

${options.description}

## 安装

\`\`\`bash
pnpm add @ldesign/plugin-${options.name}
\`\`\`

## 使用

\`\`\`typescript
import { createEngine } from '@ldesign/engine'
import ${this.toCamelCase(options.name)}Plugin from '@ldesign/plugin-${
  options.name
}'

const engine = createEngine()
engine.use(${this.toCamelCase(options.name)}Plugin)
\`\`\`

## API

### 插件选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| - | - | - | - |

## 许可证

${options.license}
`

    writeFileSync(join(options.targetDir, 'docs/README.md'), docs)
  }

  /**
   * 生成示例
   */
  private async generateExamples(
    options: PluginScaffoldOptions,
  ): Promise<void> {
    const example = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.name} 示例</title>
</head>
<body>
  <div id="app"></div>
  
  <script type="module">
    import { createEngine } from '@ldesign/engine'
    import plugin from '../src/index.js'
    
    const engine = createEngine()
    engine.use(plugin)
    
    console.log('插件已加载:', plugin.name)
  </script>
</body>
</html>
`

    writeFileSync(join(options.targetDir, 'examples/basic.html'), example)
  }

  /**
   * 生成配置文件
   */
  private async generateConfigFiles(
    options: PluginScaffoldOptions,
  ): Promise<void> {
    // ESLint 配置
    const eslintConfig = {
      extends: [
        'eslint:recommended',
        ...(options.typescript ? ['@typescript-eslint/recommended'] : []),
      ],
      parser: options.typescript ? '@typescript-eslint/parser' : undefined,
      plugins: options.typescript ? ['@typescript-eslint'] : [],
      env: {
        node: true,
        browser: true,
        es2020: true,
      },
      rules: {
        // 自定义规则
      },
    }

    writeFileSync(
      join(options.targetDir, '.eslintrc.json'),
      JSON.stringify(eslintConfig, null, 2),
    )

    // .gitignore
    const gitignore = `node_modules/
dist/
coverage/
*.log
.DS_Store
.env
.env.local
.env.*.local
`

    writeFileSync(join(options.targetDir, '.gitignore'), gitignore)
  }

  /**
   * 生成 README
   */
  private async generateReadme(options: PluginScaffoldOptions): Promise<void> {
    const readme = `# @ldesign/plugin-${options.name}

${options.description}

## 特性

- 🚀 开箱即用
- 📦 轻量级
- 🔧 可配置
- 📚 完整文档

## 安装

\`\`\`bash
pnpm add @ldesign/plugin-${options.name}
\`\`\`

## 快速开始

\`\`\`typescript
import { createEngine } from '@ldesign/engine'
import ${this.toCamelCase(options.name)}Plugin from '@ldesign/plugin-${
  options.name
}'

const engine = createEngine()

// 使用插件
engine.use(${this.toCamelCase(options.name)}Plugin, {
  // 插件选项
})
\`\`\`

## 文档

详细文档请查看 [docs](./docs/) 目录。

## 示例

查看 [examples](./examples/) 目录中的示例代码。

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

# 代码检查
pnpm lint
\`\`\`

## 贡献

欢迎贡献代码！请查看 [贡献指南](./CONTRIBUTING.md)。

## 许可证

${options.license}
`

    writeFileSync(join(options.targetDir, 'README.md'), readme)
  }

  /**
   * 生成许可证
   */
  private async generateLicense(options: PluginScaffoldOptions): Promise<void> {
    let licenseText = ''

    switch (options.license) {
      case 'MIT':
        licenseText = `MIT License

Copyright (c) ${new Date().getFullYear()} ${options.author.name}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`
        break
      default:
        licenseText = `Copyright (c) ${new Date().getFullYear()} ${
          options.author.name
        }

All rights reserved.`
    }

    writeFileSync(join(options.targetDir, 'LICENSE'), licenseText)
  }

  /**
   * 安装依赖
   */
  private async installDependencies(targetDir: string): Promise<void> {
    console.log(chalk.yellow('📦 安装依赖...'))

    try {
      execSync('pnpm install', {
        cwd: targetDir,
        stdio: 'inherit',
      })

      console.log(chalk.green('✅ 依赖安装完成'))
    }
    catch (error) {
      console.warn(chalk.yellow('⚠️ 依赖安装失败，请手动运行 pnpm install'))
    }
  }

  /**
   * 初始化 Git
   */
  private initializeGit(targetDir: string): void {
    try {
      execSync('git init', {
        cwd: targetDir,
        stdio: 'pipe',
      })

      execSync('git add .', {
        cwd: targetDir,
        stdio: 'pipe',
      })

      execSync('git commit -m "Initial commit"', {
        cwd: targetDir,
        stdio: 'pipe',
      })

      console.log(chalk.green('✅ Git 仓库初始化完成'))
    }
    catch (error) {
      console.warn(chalk.yellow('⚠️ Git 初始化失败'))
    }
  }

  /**
   * 打印后续步骤
   */
  private printNextSteps(options: PluginScaffoldOptions): void {
    console.log(chalk.blue('\n🎉 项目创建完成！'))
    console.log(chalk.blue('后续步骤:'))
    console.log(chalk.gray(`  cd ${options.targetDir}`))
    console.log(chalk.gray('  pnpm dev'))
    console.log(chalk.gray('  # 开始开发你的插件'))
    console.log()
    console.log(chalk.blue('有用的命令:'))
    console.log(chalk.gray('  pnpm build    # 构建插件'))
    console.log(chalk.gray('  pnpm test     # 运行测试'))
    console.log(chalk.gray('  pnpm lint     # 代码检查'))
    console.log()
    console.log(chalk.blue('文档和示例:'))
    console.log(chalk.gray('  docs/         # 文档目录'))
    console.log(chalk.gray('  examples/     # 示例目录'))
  }

  /**
   * 根据插件类型获取关键词
   */
  private getKeywordsByType(type: PluginType): string[] {
    const keywords = {
      'ui-component': ['ui', 'component', 'vue'],
      'utility': ['utility', 'helper', 'tools'],
      'integration': ['integration', 'api', 'service'],
      'middleware': ['middleware', 'interceptor'],
      'theme': ['theme', 'style', 'css'],
      'development-tool': ['development', 'devtools', 'debug'],
    }

    return keywords[type] || []
  }

  /**
   * 转换为 PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')
  }

  /**
   * 转换为 camelCase
   */
  private toCamelCase(str: string): string {
    const pascal = this.toPascalCase(str)
    return pascal.charAt(0).toLowerCase() + pascal.slice(1)
  }
}

// CLI 处理
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log(chalk.blue('LDesign 插件脚手架'))
    console.log()
    console.log(chalk.yellow('用法:'))
    console.log('  tsx plugin-scaffold.ts <plugin-name>')
    console.log()
    console.log(chalk.yellow('示例:'))
    console.log('  tsx plugin-scaffold.ts my-awesome-plugin')
    process.exit(0)
  }

  const pluginName = args[0]

  // 交互式配置（简化版）
  const options: PluginScaffoldOptions = {
    name: pluginName,
    description: `LDesign plugin for ${pluginName}`,
    author: {
      name: 'Your Name',
      email: 'your.email@example.com',
    },
    type: 'utility',
    targetDir: resolve(process.cwd(), pluginName),
    typescript: true,
    includeTests: true,
    includeDocs: true,
    includeExamples: true,
    license: 'MIT',
  }

  const scaffold = new PluginScaffold()

  try {
    await scaffold.createPlugin(options)
  }
  catch (error) {
    console.error(chalk.red('创建插件失败:'), error)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { PluginScaffold }

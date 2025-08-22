/**
 * 初始化命令处理器
 * 处理项目配置初始化
 */

import path from 'node:path'
import chalk from 'chalk'
import ora from 'ora'
import { Logger } from '../../utils/logger'

const logger = new Logger('Init')

export class InitCommand {
  /**
   * 执行初始化命令
   */
  async execute(options: any): Promise<void> {
    const spinner = ora('正在初始化项目配置...').start()

    try {
      const template = options.template || 'vanilla'
      const useTypeScript = options.typescript !== false

      // 显示初始化信息
      this.showInitInfo(template, useTypeScript)

      // 创建配置文件
      spinner.text = '正在创建配置文件...'
      await this.createConfigFiles(template, useTypeScript)

      // 创建示例文件
      spinner.text = '正在创建示例文件...'
      await this.createExampleFiles(template, useTypeScript)

      spinner.stop()

      // 显示成功信息
      this.showInitSuccess(template, useTypeScript)
    }
    catch (error) {
      spinner.stop()
      logger.error('初始化失败:', error)
      process.exit(1)
    }
  }

  /**
   * 显示初始化信息
   */
  private showInitInfo(template: string, useTypeScript: boolean): void {
    console.log()
    console.log(chalk.cyan.bold('🚀 初始化项目配置'))
    console.log(chalk.gray('─'.repeat(50)))
    console.log(`${chalk.bold('项目模板:')} ${chalk.yellow(template)}`)
    console.log(`${chalk.bold('TypeScript:')} ${useTypeScript ? chalk.green('是') : chalk.red('否')}`)
    console.log(chalk.gray('─'.repeat(50)))
    console.log()
  }

  /**
   * 创建配置文件
   */
  private async createConfigFiles(template: string, useTypeScript: boolean): Promise<void> {
    const fs = await import('fs-extra')
    const root = process.cwd()

    // 创建 ldesign.config.js
    const configContent = this.generateConfigContent(template, useTypeScript)
    const configPath = path.join(root, useTypeScript ? 'ldesign.config.ts' : 'ldesign.config.js')
    await fs.writeFile(configPath, configContent)

    // 创建 .gitignore（如果不存在）
    const gitignorePath = path.join(root, '.gitignore')
    if (!await fs.pathExists(gitignorePath)) {
      const gitignoreContent = this.generateGitignoreContent()
      await fs.writeFile(gitignorePath, gitignoreContent)
    }

    // 如果使用 TypeScript，创建 tsconfig.json（如果不存在）
    if (useTypeScript) {
      const tsconfigPath = path.join(root, 'tsconfig.json')
      if (!await fs.pathExists(tsconfigPath)) {
        const tsconfigContent = this.generateTsconfigContent(template)
        await fs.writeFile(tsconfigPath, tsconfigContent)
      }
    }
  }

  /**
   * 创建示例文件
   */
  private async createExampleFiles(template: string, useTypeScript: boolean): Promise<void> {
    const fs = await import('fs-extra')
    const root = process.cwd()
    const srcDir = path.join(root, 'src')

    // 确保 src 目录存在
    await fs.ensureDir(srcDir)

    // 创建入口文件
    const ext = useTypeScript ? 'ts' : 'js'
    const entryPath = path.join(srcDir, `index.${ext}`)

    if (!await fs.pathExists(entryPath)) {
      const entryContent = this.generateEntryContent(template, useTypeScript)
      await fs.writeFile(entryPath, entryContent)
    }

    // 根据模板创建特定文件
    if (template === 'vue') {
      await this.createVueFiles(srcDir, useTypeScript)
    }
    else if (template === 'react') {
      await this.createReactFiles(srcDir, useTypeScript)
    }
  }

  /**
   * 创建 Vue 相关文件
   */
  private async createVueFiles(srcDir: string, useTypeScript: boolean): Promise<void> {
    const fs = await import('fs-extra')

    // 创建组件示例
    const componentPath = path.join(srcDir, 'components', `HelloWorld.vue`)
    await fs.ensureDir(path.dirname(componentPath))

    if (!await fs.pathExists(componentPath)) {
      const componentContent = this.generateVueComponentContent(useTypeScript)
      await fs.writeFile(componentPath, componentContent)
    }
  }

  /**
   * 创建 React 相关文件
   */
  private async createReactFiles(srcDir: string, useTypeScript: boolean): Promise<void> {
    const fs = await import('fs-extra')

    // 创建组件示例
    const ext = useTypeScript ? 'tsx' : 'jsx'
    const componentPath = path.join(srcDir, 'components', `HelloWorld.${ext}`)
    await fs.ensureDir(path.dirname(componentPath))

    if (!await fs.pathExists(componentPath)) {
      const componentContent = this.generateReactComponentContent(useTypeScript)
      await fs.writeFile(componentPath, componentContent)
    }
  }

  /**
   * 生成配置文件内容
   */
  private generateConfigContent(template: string, useTypeScript: boolean): string {
    const importStatement = useTypeScript
      ? 'import { defineConfig } from \'@ldesign/builder\''
      : 'const { defineConfig } = require(\'@ldesign/builder\')'

    const exportStatement = useTypeScript ? 'export default' : 'module.exports ='

    return `${importStatement}

${exportStatement} defineConfig({
  // 入口文件
  input: 'src/index.${useTypeScript ? 'ts' : 'js'}',
  
  // 输出目录
  outDir: 'dist',
  
  // 输出格式
  formats: ['esm', 'cjs', 'iife', 'umd'],
  
  // 生成类型声明文件
  dts: ${useTypeScript},
  
  // 类型声明文件输出目录
  dtsDir: 'types',
  
  // 外部依赖（不会被打包）
  external: [
    // 例如: 'vue', 'react', 'lodash'
  ],
  
  // 全局变量映射（用于 IIFE 和 UMD 格式）
  globals: {
    // 例如: vue: 'Vue', react: 'React'
  },
  
  // 自定义插件配置
  plugins: [
    // 例如: { name: 'postcss', options: { ... } }
  ],
  
  // Rollup 配置选项
  rollupOptions: {
    // 自定义 Rollup 配置
  }
})
`
  }

  /**
   * 生成 .gitignore 内容
   */
  private generateGitignoreContent(): string {
    return `# Dependencies
node_modules/

# Build outputs
dist/
types/
*.tsbuildinfo

# Environment files
.env
.env.local
.env.*.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Coverage
coverage/
*.lcov
`
  }

  /**
   * 生成 tsconfig.json 内容
   */
  private generateTsconfigContent(template: string): string {
    const config = {
      compilerOptions: {
        target: 'ES2020',
        module: 'ESNext',
        moduleResolution: 'node',
        lib: ['ES2020', 'DOM'],
        declaration: true,
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        forceConsistentCasingInFileNames: true,
        skipLibCheck: true,
        resolveJsonModule: true,
        isolatedModules: true,
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', 'types'],
    }

    // 根据模板调整配置
    if (template === 'vue') {
      config.compilerOptions = {
        ...config.compilerOptions,
        jsx: 'preserve' as any,
      }
    }
    else if (template === 'react') {
      config.compilerOptions = {
        ...config.compilerOptions,
        jsx: 'react-jsx' as any,
      }
    }

    return JSON.stringify(config, null, 2)
  }

  /**
   * 生成入口文件内容
   */
  private generateEntryContent(template: string, useTypeScript: boolean): string {
    if (template === 'vue') {
      return useTypeScript
        ? `import HelloWorld from './components/HelloWorld.vue'

export { HelloWorld }
export default HelloWorld
`
        : `import HelloWorld from './components/HelloWorld.vue'

export { HelloWorld }
export default HelloWorld
`
    }
    else if (template === 'react') {
      return useTypeScript
        ? `import HelloWorld from './components/HelloWorld'

export { HelloWorld }
export default HelloWorld
`
        : `import HelloWorld from './components/HelloWorld'

export { HelloWorld }
export default HelloWorld
`
    }
    else {
      return useTypeScript
        ? `/**
 * LDesign Builder 示例库
 */

export interface GreetingOptions {
  name: string
  prefix?: string
}

export function greet(options: GreetingOptions): string {
  const { name, prefix = 'Hello' } = options
  return \`\${prefix}, \${name}!\`
}

export function add(a: number, b: number): number {
  return a + b
}

export default {
  greet,
  add,
}
`
        : `/**
 * LDesign Builder 示例库
 */

export function greet(options) {
  const { name, prefix = 'Hello' } = options
  return \`\${prefix}, \${name}!\`
}

export function add(a, b) {
  return a + b
}

export default {
  greet,
  add,
}
`
    }
  }

  /**
   * 生成 Vue 组件内容
   */
  private generateVueComponentContent(useTypeScript: boolean): string {
    const scriptLang = useTypeScript ? ' lang="ts"' : ''
    const propsType = useTypeScript ? '\ninterface Props {\n  msg: string\n}\n\ndefineProps<Props>()' : 'defineProps(["msg"])'

    return `<template>
  <div class="hello-world">
    <h1>{{ msg }}</h1>
    <p>这是一个使用 LDesign Builder 构建的 Vue 组件示例</p>
  </div>
</template>

<script setup${scriptLang}>
${propsType}
</script>

<style scoped>
.hello-world {
  text-align: center;
  padding: 20px;
}

h1 {
  color: #42b883;
}
</style>
`
  }

  /**
   * 生成 React 组件内容
   */
  private generateReactComponentContent(useTypeScript: boolean): string {
    if (useTypeScript) {
      return `import React from 'react'

interface Props {
  msg: string
}

const HelloWorld: React.FC<Props> = ({ msg }) => {
  return (
    <div className="hello-world">
      <h1>{msg}</h1>
      <p>这是一个使用 LDesign Builder 构建的 React 组件示例</p>
    </div>
  )
}

export default HelloWorld
`
    }
    else {
      return `import React from 'react'

const HelloWorld = ({ msg }) => {
  return (
    <div className="hello-world">
      <h1>{msg}</h1>
      <p>这是一个使用 LDesign Builder 构建的 React 组件示例</p>
    </div>
  )
}

export default HelloWorld
`
    }
  }

  /**
   * 显示初始化成功信息
   */
  private showInitSuccess(template: string, useTypeScript: boolean): void {
    console.log()
    console.log(chalk.green.bold('✅ 项目初始化完成!'))
    console.log(chalk.gray('─'.repeat(50)))
    console.log(chalk.bold('已创建的文件:'))
    console.log(`  ${chalk.cyan(useTypeScript ? 'ldesign.config.ts' : 'ldesign.config.js')} - 构建配置文件`)
    console.log(`  ${chalk.cyan(`src/index.${useTypeScript ? 'ts' : 'js'}`)} - 入口文件`)

    if (template === 'vue') {
      console.log(`  ${chalk.cyan('src/components/HelloWorld.vue')} - Vue 组件示例`)
    }
    else if (template === 'react') {
      console.log(`  ${chalk.cyan(`src/components/HelloWorld.${useTypeScript ? 'tsx' : 'jsx'}`)} - React 组件示例`)
    }

    if (useTypeScript) {
      console.log(`  ${chalk.cyan('tsconfig.json')} - TypeScript 配置文件`)
    }

    console.log(`  ${chalk.cyan('.gitignore')} - Git 忽略文件`)

    console.log()
    console.log(chalk.bold('下一步:'))
    console.log(`  ${chalk.yellow('ldesign-builder build')} - 构建项目`)
    console.log(`  ${chalk.yellow('ldesign-builder watch')} - 监听模式`)
    console.log(`  ${chalk.yellow('ldesign-builder --help')} - 查看更多命令`)
    console.log(chalk.gray('─'.repeat(50)))
    console.log()
  }
}

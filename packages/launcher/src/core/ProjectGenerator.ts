/**
 * 项目生成器模块
 * 负责创建和生成各种类型的前端项目文件结构
 * 
 * @author Vite Launcher Team
 * @version 1.0.0
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import type { ProjectType } from '@/types'
import { FileUtils, ProcessUtils } from '@/utils'

/**
 * 项目生成选项
 */
export interface ProjectGenerationOptions {
  /** 模板名称 */
  template?: string
  /** 是否强制覆盖 */
  force?: boolean
  /** 是否安装依赖 */
  installDeps?: boolean
  /** 包管理器 */
  packageManager?: 'npm' | 'yarn' | 'pnpm'
  /** 项目名称 */
  projectName?: string
  /** 项目版本 */
  version?: string
  /** 项目描述 */
  description?: string
  /** 作者信息 */
  author?: string
  /** 许可证 */
  license?: string
}

/**
 * 项目模板配置
 */
export interface ProjectTemplate {
  /** 模板名称 */
  name: string
  /** 模板描述 */
  description: string
  /** 支持的项目类型 */
  projectType: ProjectType
  /** 生产依赖 */
  dependencies: Record<string, string>
  /** 开发依赖 */
  devDependencies: Record<string, string>
  /** npm 脚本 */
  scripts: Record<string, string>
}

/**
 * 项目生成器类
 * 负责根据不同的项目类型生成对应的项目结构和文件
 */
export class ProjectGenerator {
  private templates: Map<ProjectType, ProjectTemplate>

  constructor() {
    this.templates = new Map()
    this.initializeTemplates()
  }

  /**
   * 初始化项目模板配置
   */
  private initializeTemplates(): void {
    // Vue 3 模板
    this.templates.set('vue3', {
      name: 'Vue 3 项目',
      description: '基于 Vue 3 + Vite 的现代前端项目',
      projectType: 'vue3',
      dependencies: { vue: '^3.4.0' },
      devDependencies: {
        '@vitejs/plugin-vue': '^5.0.0',
        'vite': '^5.0.0',
        'typescript': '^5.3.0'
      },
      scripts: {
        dev: 'vite',
        build: 'vue-tsc && vite build',
        preview: 'vite preview'
      }
    })

    // React 模板
    this.templates.set('react', {
      name: 'React 项目', 
      description: '基于 React + Vite 的现代前端项目',
      projectType: 'react',
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0'
      },
      devDependencies: {
        '@vitejs/plugin-react': '^4.2.0',
        'vite': '^5.0.0',
        'typescript': '^5.3.0',
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0'
      },
      scripts: {
        dev: 'vite',
        build: 'tsc && vite build',
        preview: 'vite preview'
      }
    })

    // Vanilla TypeScript 模板
    this.templates.set('vanilla-ts', {
      name: 'Vanilla TypeScript 项目',
      description: '基于 TypeScript + Vite 的原生项目',
      projectType: 'vanilla-ts',
      dependencies: {},
      devDependencies: {
        'vite': '^5.0.0',
        'typescript': '^5.3.0'
      },
      scripts: {
        dev: 'vite',
        build: 'tsc && vite build',
        preview: 'vite preview'
      }
    })
  }

  /**
   * 生成项目
   * @param projectPath 项目路径
   * @param projectType 项目类型
   * @param options 生成选项
   */
  async generateProject(
    projectPath: string,
    projectType: ProjectType,
    options: ProjectGenerationOptions = {}
  ): Promise<void> {
    const template = this.templates.get(projectType)
    if (!template) {
      throw new Error(`不支持的项目类型: ${projectType}`)
    }

    const absolutePath = path.resolve(projectPath)
    
    // 检查并创建目录
    await this.prepareProjectDirectory(absolutePath, options.force)
    
    // 生成项目文件
    await this.generateProjectFiles(absolutePath, template, options)
    
    // 安装依赖
    if (options.installDeps !== false) {
      await this.installDependencies(absolutePath, options.packageManager)
    }
  }

  /**
   * 准备项目目录
   */
  private async prepareProjectDirectory(projectPath: string, force = false): Promise<void> {
    if (await FileUtils.exists(projectPath) && !force) {
      const files = await fs.readdir(projectPath)
      if (files.length > 0) {
        throw new Error(`目录 ${projectPath} 不为空。使用 force: true 选项覆盖。`)
      }
    }
    await FileUtils.ensureDir(projectPath)
  }

  /**
   * 生成项目文件
   */
  private async generateProjectFiles(
    projectPath: string,
    template: ProjectTemplate,
    options: ProjectGenerationOptions
  ): Promise<void> {
    // 生成 package.json
    await this.generatePackageJson(projectPath, template, options)
    
    // 生成 index.html
    await this.generateIndexHtml(projectPath, template)
    
    // 生成 Vite 配置
    await this.generateViteConfig(projectPath, template.projectType)
    
    // 生成 TypeScript 配置
    if (this.needsTypeScript(template.projectType)) {
      await this.generateTsConfig(projectPath, template.projectType)
    }
    
    // 生成源文件
    await this.generateSourceFiles(projectPath, template.projectType)
  }

  /**
   * 生成 package.json
   */
  private async generatePackageJson(
    projectPath: string,
    template: ProjectTemplate,
    options: ProjectGenerationOptions
  ): Promise<void> {
    const packageJson = {
      name: options.projectName || path.basename(projectPath),
      private: true,
      version: options.version || '0.0.0',
      description: options.description || template.description,
      type: 'module',
      scripts: template.scripts,
      dependencies: template.dependencies,
      devDependencies: template.devDependencies,
      ...(options.author && { author: options.author }),
      license: options.license || 'MIT'
    }

    await FileUtils.writeJson(path.join(projectPath, 'package.json'), packageJson)
  }

  /**
   * 生成 index.html
   */
  private async generateIndexHtml(projectPath: string, template: ProjectTemplate): Promise<void> {
    const isTypeScript = this.needsTypeScript(template.projectType)
    const mainFile = isTypeScript ? 'main.ts' : 'main.js'

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${template.name}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/${mainFile}"></script>
  </body>
</html>`

    await fs.writeFile(path.join(projectPath, 'index.html'), html, 'utf-8')
  }

  /**
   * 生成 Vite 配置
   */
  private async generateViteConfig(projectPath: string, projectType: ProjectType): Promise<void> {
    let configContent = ''

    switch (projectType) {
      case 'vue3':
        configContent = `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') }
  },
  server: { port: 3000, open: true },
  build: { outDir: 'dist', sourcemap: false }
})`
        break

      case 'react':
        configContent = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') }
  },
  server: { port: 3000, open: true },
  build: { outDir: 'dist', sourcemap: false }
})`
        break

      default:
        configContent = `import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: { '@': resolve(__dirname, 'src') }
  },
  server: { port: 3000, open: true },
  build: { outDir: 'dist', sourcemap: false }
})`
    }

    await fs.writeFile(path.join(projectPath, 'vite.config.ts'), configContent, 'utf-8')
  }

  /**
   * 生成 TypeScript 配置
   */
  private async generateTsConfig(projectPath: string, projectType: ProjectType): Promise<void> {
    const tsConfig = {
      compilerOptions: {
        target: 'ES2020',
        useDefineForClassFields: true,
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        strict: true,
        baseUrl: '.',
        paths: { '@/*': ['./src/*'] },
        ...(projectType === 'react' && { jsx: 'react-jsx' })
      },
      include: ['src']
    }

    await FileUtils.writeJson(path.join(projectPath, 'tsconfig.json'), tsConfig)
  }

  /**
   * 生成源文件
   */
  private async generateSourceFiles(projectPath: string, projectType: ProjectType): Promise<void> {
    const srcDir = path.join(projectPath, 'src')
    await FileUtils.ensureDir(srcDir)

    switch (projectType) {
      case 'vue3':
        await this.generateVue3Files(srcDir)
        break
      case 'react':
        await this.generateReactFiles(srcDir)
        break
      case 'vanilla-ts':
        await this.generateVanillaTsFiles(srcDir)
        break
    }
  }

  /**
   * 生成 Vue 3 源文件
   */
  private async generateVue3Files(srcDir: string): Promise<void> {
    const mainContent = `import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')`
    await fs.writeFile(path.join(srcDir, 'main.ts'), mainContent, 'utf-8')

    const appContent = `<template>
  <div id="app">
    <h1>{{ msg }}</h1>
    <button @click="count++">count is {{ count }}</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const msg = 'Hello Vue 3 + Vite!'
const count = ref(0)
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>`
    await fs.writeFile(path.join(srcDir, 'App.vue'), appContent, 'utf-8')

    await this.generateCommonStyles(srcDir)
  }

  /**
   * 生成 React 源文件
   */
  private async generateReactFiles(srcDir: string): Promise<void> {
    const mainContent = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`
    await fs.writeFile(path.join(srcDir, 'main.tsx'), mainContent, 'utf-8')

    const appContent = `import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <h1>Hello React + Vite!</h1>
      <button onClick={() => setCount((count) => count + 1)}>
        count is {count}
      </button>
    </div>
  )
}

export default App`
    await fs.writeFile(path.join(srcDir, 'App.tsx'), appContent, 'utf-8')

    await this.generateCommonStyles(srcDir, 'index.css')
  }

  /**
   * 生成 Vanilla TypeScript 源文件
   */
  private async generateVanillaTsFiles(srcDir: string): Promise<void> {
    const mainContent = `import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = \`
  <div>
    <h1>Hello Vite + TypeScript!</h1>
    <button id="counter" type="button">count is 0</button>
  </div>
\`

let counter = 0
const button = document.querySelector<HTMLButtonElement>('#counter')!
button.addEventListener('click', () => {
  counter++
  button.innerHTML = \`count is \${counter}\`
})`
    await fs.writeFile(path.join(srcDir, 'main.ts'), mainContent, 'utf-8')

    await this.generateCommonStyles(srcDir)
  }

  /**
   * 生成通用样式文件
   */
  private async generateCommonStyles(srcDir: string, fileName = 'style.css'): Promise<void> {
    const styleContent = `:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  color: white;
  cursor: pointer;
  transition: border-color 0.25s;
}

button:hover {
  border-color: #646cff;
}

button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}`
    await fs.writeFile(path.join(srcDir, fileName), styleContent, 'utf-8')
  }

  /**
   * 安装依赖
   */
  private async installDependencies(
    projectPath: string,
    packageManager?: 'npm' | 'yarn' | 'pnpm'
  ): Promise<void> {
    const pm = packageManager || await ProcessUtils.getPackageManager(projectPath) || 'npm'
    console.log(`正在使用 ${pm} 安装依赖...`)
    
    try {
      await ProcessUtils.installDependencies(projectPath, { packageManager: pm })
      console.log('依赖安装完成!')
    } catch (error) {
      console.warn('依赖安装失败，请手动安装:', (error as Error).message)
    }
  }

  /**
   * 检查是否需要 TypeScript
   */
  private needsTypeScript(projectType: ProjectType): boolean {
    return ['vue3', 'react', 'vanilla-ts', 'lit'].includes(projectType)
  }

  /**
   * 获取可用的模板列表
   */
  getAvailableTemplates(): ProjectTemplate[] {
    return Array.from(this.templates.values())
  }

  /**
   * 获取指定类型的模板
   */
  getTemplate(projectType: ProjectType): ProjectTemplate | undefined {
    return this.templates.get(projectType)
  }
}
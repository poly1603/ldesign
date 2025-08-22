/**
 * @fileoverview 模板工具模块
 * @author ViteLauncher Team
 * @since 1.0.0
 */

import path from 'node:path'
import type { 
  TemplateVariables, 
  TemplateFile, 
  TemplateConfig, 
  ProjectType, 
  FrameworkType 
} from '../types'
import { readFile, writeFile, exists, searchFiles, copyDir } from './file'
import { logger } from './logger'

/**
 * 模板引擎类
 */
export class TemplateEngine {
  private variables: TemplateVariables
  private delimiters: { start: string; end: string }

  constructor(
    variables: TemplateVariables, 
    delimiters = { start: '{{', end: '}}' }
  ) {
    this.variables = variables
    this.delimiters = delimiters
  }

  /**
   * 渲染模板字符串
   * @param template 模板字符串
   * @returns 渲染后的字符串
   */
  render(template: string): string {
    const { start, end } = this.delimiters
    const regex = new RegExp(`${this.escapeRegex(start)}\\s*([^${end}]+)\\s*${this.escapeRegex(end)}`, 'g')

    return template.replace(regex, (match, key) => {
      const trimmedKey = key.trim()
      
      // 支持嵌套对象访问，如 {{user.name}}
      const value = this.getNestedValue(this.variables, trimmedKey)
      
      if (value === undefined || value === null) {
        logger.warn(`Template variable "${trimmedKey}" is not defined`)
        return match // 保留原始模板标记
      }

      return String(value)
    })
  }

  /**
   * 渲染模板文件
   * @param templatePath 模板文件路径
   * @param outputPath 输出文件路径
   */
  async renderFile(templatePath: string, outputPath: string): Promise<void> {
    if (!await exists(templatePath)) {
      throw new Error(`Template file not found: ${templatePath}`)
    }

    const templateContent = await readFile(templatePath)
    const renderedContent = this.render(templateContent)
    
    await writeFile(outputPath, renderedContent, { createParentDirs: true })
    logger.info(`Template rendered: ${templatePath} -> ${outputPath}`)
  }

  /**
   * 批量渲染模板文件
   * @param templateDir 模板目录
   * @param outputDir 输出目录
   * @param options 渲染选项
   */
  async renderDirectory(
    templateDir: string,
    outputDir: string,
    options: {
      fileExtensions?: string[]
      ignore?: string[]
      preserveStructure?: boolean
    } = {}
  ): Promise<void> {
    const {
      fileExtensions = ['.js', '.ts', '.vue', '.jsx', '.tsx', '.json', '.md', '.html', '.css'],
      ignore = ['node_modules/**', '.git/**', 'dist/**'],
      preserveStructure = true
    } = options

    // 搜索模板文件
    const templateFiles = await searchFiles({
      pattern: path.join(templateDir, '**/*'),
      fileTypes: fileExtensions,
      ignore
    })

    for (const templateFile of templateFiles) {
      const relativePath = path.relative(templateDir, templateFile)
      
      // 渲染文件路径中的变量
      const renderedRelativePath = preserveStructure 
        ? this.render(relativePath)
        : path.basename(this.render(relativePath))
      
      const outputPath = path.join(outputDir, renderedRelativePath)
      
      await this.renderFile(templateFile, outputPath)
    }
  }

  /**
   * 更新模板变量
   * @param newVariables 新的变量对象
   */
  updateVariables(newVariables: Partial<TemplateVariables>): void {
    this.variables = { ...this.variables, ...newVariables }
  }

  /**
   * 获取嵌套对象的值
   * @param obj 对象
   * @param path 路径
   * @returns 值
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined
    }, obj)
  }

  /**
   * 转义正则表达式特殊字符
   * @param str 字符串
   * @returns 转义后的字符串
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
}

/**
 * 渲染模板字符串
 * @param template 模板字符串
 * @param variables 变量对象
 * @returns 渲染后的字符串
 */
export function renderTemplate(template: string, variables: TemplateVariables): string {
  const engine = new TemplateEngine(variables)
  return engine.render(template)
}

/**
 * 加载模板配置
 * @param templatePath 模板路径
 * @returns 模板配置
 */
export async function loadTemplate(templatePath: string): Promise<TemplateConfig> {
  const configPath = path.join(templatePath, 'template.json')
  
  if (!await exists(configPath)) {
    throw new Error(`Template configuration not found: ${configPath}`)
  }

  const configContent = await readFile(configPath)
  const config = JSON.parse(configContent) as TemplateConfig

  // 验证模板配置
  if (!config.name || !config.version || !config.frameworks) {
    throw new Error('Invalid template configuration')
  }

  return config
}

/**
 * 从现有项目创建模板
 * @param projectPath 项目路径
 * @param templatePath 模板输出路径
 * @param options 创建选项
 */
export async function createTemplateFromProject(
  projectPath: string,
  templatePath: string,
  options: {
    name: string
    description: string
    frameworks: FrameworkType[]
    excludePatterns?: string[]
    includePatterns?: string[]
  }
): Promise<void> {
  const {
    name,
    description,
    frameworks,
    excludePatterns = [
      'node_modules/**',
      '.git/**',
      'dist/**',
      'build/**',
      '.DS_Store',
      '*.log'
    ],
    includePatterns = ['**/*']
  } = options

  logger.info(`Creating template "${name}" from project: ${projectPath}`)

  // 复制项目文件到模板目录
  await copyDir(projectPath, templatePath, { overwrite: true })

  // 创建模板配置文件
  const templateConfig: TemplateConfig = {
    name,
    description,
    frameworks,
    version: '1.0.0',
    files: [], // 将在后续步骤中填充
    variables: {
      projectName: '{{projectName}}',
      framework: '{{framework}}',
      useTypeScript: '{{useTypeScript}}',
      packageManager: '{{packageManager}}',
      author: '{{author}}',
      description: '{{description}}'
    }
  }

  // 获取模板文件列表
  const templateFiles = await searchFiles({
    pattern: path.join(templatePath, '**/*'),
    ignore: excludePatterns
  })

  templateConfig.files = await Promise.all(
    templateFiles.map(async (filePath): Promise<TemplateFile> => {
      const relativePath = path.relative(templatePath, filePath)
      const content = await readFile(filePath)
      
      return {
        path: relativePath,
        content,
        isBinary: false, // 简化处理，实际应该检查文件类型
      }
    })
  )

  // 保存模板配置
  const configPath = path.join(templatePath, 'template.json')
  await writeFile(configPath, JSON.stringify(templateConfig, null, 2))

  logger.success(`Template created successfully: ${templatePath}`)
}

/**
 * 内置模板定义
 */
export const builtinTemplates = {
  /**
   * Vue 3 + TypeScript 模板
   */
  vue3Typescript: {
    name: 'Vue 3 + TypeScript',
    description: '基于 Vue 3 和 TypeScript 的现代化项目模板',
    frameworks: ['vue3'] as FrameworkType[],
    version: '1.0.0',
    files: [
      {
        path: 'package.json',
        content: `{
  "name": "{{projectName}}",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.3.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.5.0",
    "typescript": "^5.0.0",
    "vue-tsc": "^1.8.0",
    "vite": "^5.0.0"
  }
}`,
        isBinary: false
      },
      {
        path: 'src/main.ts',
        content: `import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

createApp(App).mount('#app')`,
        isBinary: false
      },
      {
        path: 'src/App.vue',
        content: `<template>
  <div id="app">
    <h1>{{ title }}</h1>
    <p>Welcome to your Vue 3 + TypeScript project!</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const title = ref<string>('{{projectName}}')
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>`,
        isBinary: false
      }
    ] as TemplateFile[],
    variables: {
      projectName: '{{projectName}}',
      framework: 'vue3' as FrameworkType,
      useTypeScript: true,
      packageManager: 'npm',
      author: '{{author}}',
      description: '{{description}}'
    }
  } as TemplateConfig,

  /**
   * React + TypeScript 模板
   */
  reactTypescript: {
    name: 'React + TypeScript',
    description: '基于 React 和 TypeScript 的现代化项目模板',
    frameworks: ['react'] as FrameworkType[],
    version: '1.0.0',
    files: [
      {
        path: 'package.json',
        content: `{
  "name": "{{projectName}}",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}`,
        isBinary: false
      },
      {
        path: 'src/main.tsx',
        content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
        isBinary: false
      },
      {
        path: 'src/App.tsx',
        content: `import React from 'react'

function App() {
  return (
    <div className="App">
      <h1>{{projectName}}</h1>
      <p>Welcome to your React + TypeScript project!</p>
    </div>
  )
}

export default App`,
        isBinary: false
      }
    ] as TemplateFile[],
    variables: {
      projectName: '{{projectName}}',
      framework: 'react' as FrameworkType,
      useTypeScript: true,
      packageManager: 'npm',
      author: '{{author}}',
      description: '{{description}}'
    }
  } as TemplateConfig
}

/**
 * 获取项目类型对应的内置模板
 * @param projectType 项目类型
 * @returns 模板配置
 */
export function getBuiltinTemplate(projectType: ProjectType): TemplateConfig | null {
  switch (projectType) {
    case 'vue3':
      return builtinTemplates.vue3Typescript
    case 'react':
      return builtinTemplates.reactTypescript
    default:
      return null
  }
}

/**
 * 验证模板配置
 * @param config 模板配置
 * @returns 验证结果
 */
export function validateTemplate(config: TemplateConfig): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!config.name || config.name.trim().length === 0) {
    errors.push('模板名称不能为空')
  }

  if (!config.version || config.version.trim().length === 0) {
    errors.push('模板版本不能为空')
  }

  if (!config.frameworks || config.frameworks.length === 0) {
    errors.push('至少需要支持一个框架')
  }

  if (!config.files || config.files.length === 0) {
    errors.push('模板文件列表不能为空')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
/**
 * 项目模板管理系统
 * 
 * 提供项目模板的创建、管理和生成功能
 * 支持各种前端技术栈的项目脚手架
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { promises as fs } from 'fs'
import { join, resolve } from 'path'
import { Logger } from '../utils/logger'
import { FileSystem } from '../utils/file-system'
import type { ProjectPreset } from '../types'
import { configPresets } from './ConfigPresets'

/**
 * 模板文件接口
 */
export interface TemplateFile {
  /** 文件路径 */
  path: string
  /** 文件内容 */
  content: string
  /** 是否为模板文件（需要变量替换） */
  isTemplate?: boolean
  /** 文件权限 */
  permissions?: string
}

/**
 * 项目模板接口
 */
export interface ProjectTemplate {
  /** 模板名称 */
  name: string
  /** 模板描述 */
  description: string
  /** 预设类型 */
  preset: ProjectPreset
  /** 模板版本 */
  version: string
  /** 模板作者 */
  author?: string
  /** 标签 */
  tags: string[]
  /** 模板文件列表 */
  files: TemplateFile[]
  /** 依赖配置 */
  dependencies: {
    dependencies: Record<string, string>
    devDependencies: Record<string, string>
  }
  /** 推荐脚本 */
  scripts: Record<string, string>
  /** 环境配置 */
  environment?: Record<string, string>
  /** 安装后执行的命令 */
  postInstall?: string[]
}

/**
 * 模板变量接口
 */
export interface TemplateVariables {
  /** 项目名称 */
  projectName: string
  /** 项目描述 */
  description?: string
  /** 作者信息 */
  author?: string
  /** 版本号 */
  version?: string
  /** 许可证 */
  license?: string
  /** Git仓库地址 */
  repository?: string
  /** 项目关键词 */
  keywords?: string[]
  /** 其他自定义变量 */
  [key: string]: any
}

/**
 * 项目模板管理器
 */
export class ProjectTemplateManager {
  private logger: Logger
  private templates = new Map<string, ProjectTemplate>()

  constructor(logger?: Logger) {
    this.logger = logger || new Logger('ProjectTemplateManager')
    this.loadBuiltinTemplates()
  }

  /**
   * 加载内置模板
   */
  private loadBuiltinTemplates() {
    // Vue 3 模板
    this.register(this.createVue3Template())
    this.register(this.createVue3TypeScriptTemplate())
    
    // React 模板
    this.register(this.createReactTemplate())
    this.register(this.createReactTypeScriptTemplate())
    
    // Svelte 模板
    this.register(this.createSvelteTemplate())
    this.register(this.createSvelteTypeScriptTemplate())
    
    // Vue 2 模板
    this.register(this.createVue2Template())
    
    // 原生 JS/TS 模板
    this.register(this.createVanillaTemplate())
    this.register(this.createVanillaTypeScriptTemplate())

    this.logger.info(`已加载 ${this.templates.size} 个内置模板`)
  }

  /**
   * 注册模板
   */
  register(template: ProjectTemplate) {
    this.templates.set(template.name, template)
  }

  /**
   * 获取模板
   */
  getTemplate(name: string): ProjectTemplate | undefined {
    return this.templates.get(name)
  }

  /**
   * 获取所有模板
   */
  getAllTemplates(): ProjectTemplate[] {
    return Array.from(this.templates.values())
  }

  /**
   * 根据预设获取模板
   */
  getTemplatesByPreset(preset: ProjectPreset): ProjectTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.preset === preset)
  }

  /**
   * 根据标签获取模板
   */
  getTemplatesByTag(tag: string): ProjectTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.tags.includes(tag))
  }

  /**
   * 创建项目
   */
  async createProject(
    templateName: string,
    targetDir: string,
    variables: TemplateVariables
  ): Promise<void> {
    const template = this.getTemplate(templateName)
    if (!template) {
      throw new Error(`模板不存在: ${templateName}`)
    }

    this.logger.info(`开始创建项目: ${variables.projectName}`, {
      template: templateName,
      targetDir
    })

    // 创建目录
    await this.ensureDirectory(targetDir)

    // 生成文件
    await this.generateFiles(template, targetDir, variables)

    // 生成 package.json
    await this.generatePackageJson(template, targetDir, variables)

    // 生成配置文件
    await this.generateConfigFile(template, targetDir, variables)

    // 生成环境变量文件
    await this.generateEnvFiles(template, targetDir, variables)

    this.logger.success(`项目创建完成: ${targetDir}`)
  }

  /**
   * 确保目录存在
   */
  private async ensureDirectory(dir: string) {
    if (!(await FileSystem.exists(dir))) {
      await fs.mkdir(dir, { recursive: true })
    }
  }

  /**
   * 生成模板文件
   */
  private async generateFiles(
    template: ProjectTemplate,
    targetDir: string,
    variables: TemplateVariables
  ) {
    for (const file of template.files) {
      const filePath = join(targetDir, file.path)
      const fileDir = resolve(filePath, '..')

      // 确保目录存在
      await this.ensureDirectory(fileDir)

      // 处理文件内容
      let content = file.content
      if (file.isTemplate) {
        content = this.processTemplate(content, variables)
      }

      // 写入文件
      await fs.writeFile(filePath, content, 'utf-8')

      // 设置文件权限
      if (file.permissions) {
        await fs.chmod(filePath, file.permissions)
      }
    }
  }

  /**
   * 处理模板变量
   */
  private processTemplate(content: string, variables: TemplateVariables): string {
    return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match
    })
  }

  /**
   * 生成 package.json
   */
  private async generatePackageJson(
    template: ProjectTemplate,
    targetDir: string,
    variables: TemplateVariables
  ) {
    const packageJson = {
      name: variables.projectName,
      version: variables.version || '0.1.0',
      description: variables.description || template.description,
      author: variables.author || template.author || '',
      license: variables.license || 'MIT',
      ...(variables.repository && { repository: variables.repository }),
      ...(variables.keywords && { keywords: variables.keywords }),
      scripts: template.scripts,
      dependencies: template.dependencies.dependencies,
      devDependencies: {
        '@ldesign/launcher': '^1.0.0',
        ...template.dependencies.devDependencies
      }
    }

    const filePath = join(targetDir, 'package.json')
    await fs.writeFile(filePath, JSON.stringify(packageJson, null, 2), 'utf-8')
  }

  /**
   * 生成配置文件
   */
  private async generateConfigFile(
    template: ProjectTemplate,
    targetDir: string,
    variables: TemplateVariables
  ) {
    const preset = configPresets.get(template.preset)
    if (!preset) return

    const configContent = `import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  launcher: {
    preset: '${template.preset}'
  }
})
`

    const filePath = join(targetDir, 'launcher.config.ts')
    await fs.writeFile(filePath, configContent, 'utf-8')
  }

  /**
   * 生成环境变量文件
   */
  private async generateEnvFiles(
    template: ProjectTemplate,
    targetDir: string,
    variables: TemplateVariables
  ) {
    if (!template.environment || Object.keys(template.environment).length === 0) {
      return
    }

    let envContent = '# Environment Variables\n\n'
    for (const [key, value] of Object.entries(template.environment)) {
      const processedValue = this.processTemplate(value, variables)
      envContent += `${key}=${processedValue}\n`
    }

    const filePath = join(targetDir, '.env')
    await fs.writeFile(filePath, envContent, 'utf-8')
  }

  // 内置模板创建方法

  /**
   * 创建 Vue 3 模板
   */
  private createVue3Template(): ProjectTemplate {
    return {
      name: 'vue3-starter',
      description: 'Vue 3 项目模板',
      preset: 'vue3',
      version: '1.0.0',
      author: 'LDesign Team',
      tags: ['vue', 'vue3', 'javascript', 'spa'],
      files: [
        {
          path: 'src/main.js',
          content: `import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

createApp(App).mount('#app')
`,
          isTemplate: false
        },
        {
          path: 'src/App.vue',
          content: `<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/vue.svg" />
    <HelloWorld msg="欢迎使用 {{projectName}}" />
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    HelloWorld
  }
}
</script>

<style>
#app {
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
`,
          isTemplate: true
        },
        {
          path: 'src/components/HelloWorld.vue',
          content: `<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p>
      项目已成功创建！现在你可以开始开发了。
    </p>
    <h3>推荐的 IDE 设置</h3>
    <ul>
      <li><a href="https://code.visualstudio.com/" target="_blank">VS Code</a> + <a href="https://marketplace.visualstudio.com/items?itemName=Vue.volar" target="_blank">Volar</a></li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  }
}
</script>

<style scoped>
.hello {
  margin: 40px 0;
}

h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
`,
          isTemplate: false
        },
        {
          path: 'src/style.css',
          content: `:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
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
`,
          isTemplate: false
        },
        {
          path: 'src/assets/vue.svg',
          content: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="37.07" height="36" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 198"><path fill="#41B883" d="M204.8 0H256L128 220.8L0 0h97.92L128 51.2L157.44 0h47.36Z"></path><path fill="#41B883" d="m0 0l128 220.8L256 0h-51.2L128 132.48L50.56 0H0Z"></path><path fill="#35495E" d="M50.56 0L128 133.12L204.8 0h-47.36L128 51.2L97.92 0H50.56Z"></path></svg>`,
          isTemplate: false
        },
        {
          path: 'index.html',
          content: `<!DOCTYPE html>
<html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/src/assets/vue.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{projectName}}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`,
          isTemplate: true
        },
        {
          path: 'README.md',
          content: `# {{projectName}}

{{description}}

## 开发

\`\`\`bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
\`\`\`

## 技术栈

- [Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架
- [@ldesign/launcher](https://github.com/ldesign/launcher) - 基于 Vite 的前端构建工具

## 许可证

{{license}}
`,
          isTemplate: true
        }
      ],
      dependencies: {
        dependencies: {
          vue: '^3.4.0'
        },
        devDependencies: {
          '@vitejs/plugin-vue': '^5.0.0'
        }
      },
      scripts: {
        dev: 'launcher dev',
        build: 'launcher build',
        preview: 'launcher preview'
      },
      environment: {
        'VITE_APP_TITLE': '{{projectName}}',
        'VITE_APP_VERSION': '{{version}}'
      }
    }
  }

  /**
   * 创建 Vue 3 + TypeScript 模板
   */
  private createVue3TypeScriptTemplate(): ProjectTemplate {
    return {
      name: 'vue3-typescript-starter',
      description: 'Vue 3 + TypeScript 项目模板',
      preset: 'vue3-ts',
      version: '1.0.0',
      author: 'LDesign Team',
      tags: ['vue', 'vue3', 'typescript', 'spa'],
      files: [
        {
          path: 'src/main.ts',
          content: `import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

createApp(App).mount('#app')
`,
          isTemplate: false
        },
        {
          path: 'src/App.vue',
          content: `<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/vue.svg" />
    <HelloWorld :msg="message" />
  </div>
</template>

<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'

const message = ref('欢迎使用 {{projectName}}')
</script>

<style>
#app {
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
`,
          isTemplate: true
        },
        {
          path: 'src/components/HelloWorld.vue',
          content: `<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p>
      项目已成功创建！现在你可以开始开发了。
    </p>
    <div>
      <button @click="increment">点击次数: {{ count }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  msg: string
}

defineProps<Props>()

const count = ref(0)

const increment = () => {
  count.value++
}
</script>

<style scoped>
.hello {
  margin: 40px 0;
}

button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #369870;
}
</style>
`,
          isTemplate: false
        },
        {
          path: 'src/vite-env.d.ts',
          content: `/// <reference types="vite/client" />
`,
          isTemplate: false
        },
        {
          path: 'tsconfig.json',
          content: `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
`,
          isTemplate: false
        },
        {
          path: 'tsconfig.node.json',
          content: `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["launcher.config.ts"]
}
`,
          isTemplate: false
        }
      ],
      dependencies: {
        dependencies: {
          vue: '^3.4.0'
        },
        devDependencies: {
          '@vitejs/plugin-vue': '^5.0.0',
          typescript: '^5.3.0',
          'vue-tsc': '^1.8.0'
        }
      },
      scripts: {
        dev: 'launcher dev',
        build: 'vue-tsc && launcher build',
        preview: 'launcher preview'
      },
      environment: {
        'VITE_APP_TITLE': '{{projectName}}',
        'VITE_APP_VERSION': '{{version}}'
      }
    }
  }

  /**
   * 创建 React 模板
   */
  private createReactTemplate(): ProjectTemplate {
    return {
      name: 'react-starter',
      description: 'React 项目模板',
      preset: 'react',
      version: '1.0.0',
      author: 'LDesign Team',
      tags: ['react', 'javascript', 'spa'],
      files: [
        {
          path: 'src/main.jsx',
          content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`,
          isTemplate: false
        },
        {
          path: 'src/App.jsx',
          content: `import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <div>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>{{projectName}}</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          点击次数: {count}
        </button>
        <p>
          编辑 <code>src/App.jsx</code> 并保存以测试热更新
        </p>
      </div>
      <p className="read-the-docs">
        点击 React 图标了解更多
      </p>
    </div>
  )
}

export default App
`,
          isTemplate: true
        }
      ],
      dependencies: {
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0'
        },
        devDependencies: {
          '@vitejs/plugin-react': '^4.2.0'
        }
      },
      scripts: {
        dev: 'launcher dev',
        build: 'launcher build',
        preview: 'launcher preview'
      },
      environment: {
        'REACT_APP_TITLE': '{{projectName}}',
        'REACT_APP_VERSION': '{{version}}'
      }
    }
  }

  /**
   * 创建 React + TypeScript 模板
   */
  private createReactTypeScriptTemplate(): ProjectTemplate {
    return {
      name: 'react-typescript-starter',
      description: 'React + TypeScript 项目模板',
      preset: 'react-ts',
      version: '1.0.0',
      author: 'LDesign Team',
      tags: ['react', 'typescript', 'spa'],
      files: [
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
)
`,
          isTemplate: false
        },
        {
          path: 'src/App.tsx',
          content: `import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

function App() {
  const [count, setCount] = useState<number>(0)

  return (
    <div className="App">
      <div>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>{{projectName}}</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          点击次数: {count}
        </button>
        <p>
          编辑 <code>src/App.tsx</code> 并保存以测试热更新
        </p>
      </div>
      <p className="read-the-docs">
        点击 React 图标了解更多
      </p>
    </div>
  )
}

export default App
`,
          isTemplate: true
        }
      ],
      dependencies: {
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0'
        },
        devDependencies: {
          '@vitejs/plugin-react': '^4.2.0',
          '@types/react': '^18.2.0',
          '@types/react-dom': '^18.2.0',
          typescript: '^5.3.0'
        }
      },
      scripts: {
        dev: 'launcher dev',
        build: 'tsc && launcher build',
        preview: 'launcher preview'
      },
      environment: {
        'REACT_APP_TITLE': '{{projectName}}',
        'REACT_APP_VERSION': '{{version}}'
      }
    }
  }

  // 其他模板创建方法可以类似实现...
  private createSvelteTemplate(): ProjectTemplate {
    return {
      name: 'svelte-starter',
      description: 'Svelte 项目模板',
      preset: 'svelte',
      version: '1.0.0',
      tags: ['svelte'],
      files: [], // 简化示例
      dependencies: { dependencies: {}, devDependencies: {} },
      scripts: {}
    }
  }

  private createSvelteTypeScriptTemplate(): ProjectTemplate {
    return {
      name: 'svelte-typescript-starter',
      description: 'Svelte + TypeScript 项目模板',
      preset: 'svelte-ts',
      version: '1.0.0',
      tags: ['svelte', 'typescript'],
      files: [],
      dependencies: { dependencies: {}, devDependencies: {} },
      scripts: {}
    }
  }

  private createVue2Template(): ProjectTemplate {
    return {
      name: 'vue2-starter',
      description: 'Vue 2 项目模板',
      preset: 'vue2',
      version: '1.0.0',
      tags: ['vue', 'vue2'],
      files: [],
      dependencies: { dependencies: {}, devDependencies: {} },
      scripts: {}
    }
  }

  private createVanillaTemplate(): ProjectTemplate {
    return {
      name: 'vanilla-starter',
      description: '原生 JavaScript 项目模板',
      preset: 'vanilla',
      version: '1.0.0',
      tags: ['vanilla', 'javascript'],
      files: [],
      dependencies: { dependencies: {}, devDependencies: {} },
      scripts: {}
    }
  }

  private createVanillaTypeScriptTemplate(): ProjectTemplate {
    return {
      name: 'vanilla-typescript-starter',
      description: '原生 TypeScript 项目模板',
      preset: 'vanilla-ts',
      version: '1.0.0',
      tags: ['vanilla', 'typescript'],
      files: [],
      dependencies: { dependencies: {}, devDependencies: {} },
      scripts: {}
    }
  }
}

// 导出全局实例
export const projectTemplates = new ProjectTemplateManager()

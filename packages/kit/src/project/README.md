# 项目管理模块 (Project)

项目管理模块提供了强大的前端项目类型检测、依赖分析、构建工具识别等功能，帮助开发者快速了解和分析项目结构。

## 🚀 功能特性

- **项目类型检测**: 自动识别 Vue2/3、React、Angular、Svelte 等前端框架
- **包管理器检测**: 检测 npm、yarn、pnpm、bun 等包管理器的使用情况
- **构建工具分析**: 识别 Vite、Webpack、Rollup、esbuild、tsup 等构建工具
- **依赖分析**: 深度分析项目依赖，包括安全漏洞、版本兼容性、大小统计
- **项目统计**: 提供项目的详细统计信息，如文件数量、代码行数等
- **配置文件检测**: 自动扫描和识别各种配置文件

## 📦 安装

```bash
# 使用 pnpm
pnpm add @ldesign/kit

# 使用 npm
npm install @ldesign/kit

# 使用 yarn
yarn add @ldesign/kit
```

## 🎯 快速开始

### 基础用法

```typescript
import { ProjectDetector, detectProjectType } from '@ldesign/kit/project'

// 快速检测当前项目类型
const result = await detectProjectType()
console.log(`项目类型: ${result.projectType}`)
console.log(`框架: ${result.framework}`)
console.log(`版本: ${result.frameworkVersion}`)

// 创建检测器实例进行详细分析
const detector = new ProjectDetector({
  projectRoot: '/path/to/project',
  deepAnalyzeDependencies: true,
})

const projectInfo = await detector.detectProject()
const statistics = await detector.getProjectStatistics()
```

### 依赖分析

```typescript
import { DependencyAnalyzer, analyzeDependencies } from '@ldesign/kit/project'

// 快速依赖分析
const analysis = await analyzeDependencies()
console.log(`总依赖数: ${analysis.dependencies.length}`)
console.log(`过时依赖: ${analysis.outdatedDependencies.length}`)
console.log(`安全漏洞: ${analysis.vulnerabilities.length}`)

// 详细的依赖分析
const analyzer = new DependencyAnalyzer({
  checkVulnerabilities: true,
  analyzeSizes: true,
  checkLicenses: true,
})

const fullAnalysis = await analyzer.analyzeDependencies()
const report = analyzer.generateReport(fullAnalysis)
console.log(report)
```

### 构建工具检测

```typescript
import { BuildToolDetector, detectBuildTools } from '@ldesign/kit/project'

// 快速检测构建工具
const buildToolsResult = await detectBuildTools()
console.log(`主要构建工具: ${buildToolsResult.primaryTool.tool}`)
console.log(`所有构建工具: ${buildToolsResult.allTools.map(t => t.tool).join(', ')}`)

// 详细的构建工具分析
const detector = new BuildToolDetector()
const result = await detector.detectBuildTools()
const report = detector.generateReport(result)
console.log(report)
```

### 包管理器检测

```typescript
import { PackageManagerDetector, detectPackageManager } from '@ldesign/kit/project'

// 快速检测包管理器
const pmResult = await detectPackageManager()
console.log(`当前包管理器: ${pmResult.activeManager.type}`)
console.log(`推荐包管理器: ${pmResult.recommendedManager?.type}`)

// 详细的包管理器分析
const detector = new PackageManagerDetector()
const result = await detector.detectPackageManager()
const report = detector.generateReport(result)
console.log(report)
```

## 📚 API 参考

### ProjectDetector

项目检测器类，提供项目类型、框架、工具链的自动检测功能。

#### 构造函数

```typescript
constructor(options?: ProjectAnalysisOptions)
```

#### 方法

- `detectProject(): Promise<ProjectDetectionResult>` - 检测项目类型和配置
- `getProjectStatistics(): Promise<ProjectStatistics>` - 获取项目统计信息
- `analyzeDependencies(): Promise<DependencyInfo[]>` - 分析项目依赖
- `detectDevServer(): DevServerInfo | null` - 检测开发服务器配置

### DependencyAnalyzer

依赖分析器类，提供项目依赖的全面分析功能。

#### 构造函数

```typescript
constructor(options?: DependencyAnalysisOptions)
```

#### 方法

- `analyzeDependencies(): Promise<DependencyAnalysisResult>` - 执行完整的依赖分析
- `generateReport(result: DependencyAnalysisResult): string` - 生成依赖分析报告

### BuildToolDetector

构建工具检测器类，提供构建工具的检测和分析功能。

#### 构造函数

```typescript
constructor(projectRoot?: string)
```

#### 方法

- `detectBuildTools(): Promise<BuildToolDetectionResult>` - 检测项目的构建工具
- `generateReport(result: BuildToolDetectionResult): string` - 生成构建工具报告

### PackageManagerDetector

包管理器检测器类，提供包管理器的检测和分析功能。

#### 构造函数

```typescript
constructor(projectRoot?: string)
```

#### 方法

- `detectPackageManager(): Promise<PackageManagerDetectionResult>` - 检测包管理器
- `generateReport(result: PackageManagerDetectionResult): string` - 生成包管理器报告

## 🔧 配置选项

### ProjectAnalysisOptions

```typescript
interface ProjectAnalysisOptions {
  projectRoot?: string // 项目根目录
  deepAnalyzeDependencies?: boolean // 是否深度分析依赖
  detectConfigFiles?: boolean // 是否检测配置文件
  analyzeScripts?: boolean // 是否分析脚本命令
  detectDevTools?: boolean // 是否检测开发工具
  customDetectionRules?: DetectionRule[] // 自定义检测规则
}
```

### DependencyAnalysisOptions

```typescript
interface DependencyAnalysisOptions {
  projectRoot?: string // 项目根目录
  includeDev?: boolean // 是否包含开发依赖
  checkVulnerabilities?: boolean // 是否检查安全漏洞
  analyzeSizes?: boolean // 是否分析依赖大小
  checkLicenses?: boolean // 是否检查许可证
  checkOutdated?: boolean // 是否检查过时依赖
  timeout?: number // 网络超时时间
}
```

## 🎨 使用示例

### 完整的项目分析

```typescript
import {
  ProjectDetector,
  DependencyAnalyzer,
  BuildToolDetector,
  PackageManagerDetector,
} from '@ldesign/kit/project'

async function analyzeProject(projectPath: string) {
  // 1. 检测项目类型
  const projectDetector = new ProjectDetector({ projectRoot: projectPath })
  const projectInfo = await projectDetector.detectProject()

  console.log('=== 项目信息 ===')
  console.log(`类型: ${projectInfo.projectType}`)
  console.log(`框架: ${projectInfo.framework} ${projectInfo.frameworkVersion}`)
  console.log(`TypeScript: ${projectInfo.hasTypeScript ? '是' : '否'}`)
  console.log(`置信度: ${projectInfo.confidence}%`)

  // 2. 分析依赖
  const depAnalyzer = new DependencyAnalyzer({ projectRoot: projectPath })
  const depAnalysis = await depAnalyzer.analyzeDependencies()

  console.log('\\n=== 依赖分析 ===')
  console.log(`总依赖数: ${depAnalysis.dependencies.length}`)
  console.log(`过时依赖: ${depAnalysis.outdatedDependencies.length}`)
  console.log(`安全漏洞: ${depAnalysis.vulnerabilities.length}`)

  // 3. 检测构建工具
  const buildDetector = new BuildToolDetector(projectPath)
  const buildInfo = await buildDetector.detectBuildTools()

  console.log('\\n=== 构建工具 ===')
  console.log(`主要工具: ${buildInfo.primaryTool.tool}`)
  console.log(`所有工具: ${buildInfo.allTools.map(t => t.tool).join(', ')}`)

  // 4. 检测包管理器
  const pmDetector = new PackageManagerDetector(projectPath)
  const pmInfo = await pmDetector.detectPackageManager()

  console.log('\\n=== 包管理器 ===')
  console.log(`当前: ${pmInfo.activeManager.type}`)
  console.log(`推荐: ${pmInfo.recommendedManager?.type || '无'}`)

  return {
    project: projectInfo,
    dependencies: depAnalysis,
    buildTools: buildInfo,
    packageManager: pmInfo,
  }
}

// 使用示例
analyzeProject('./my-project').then(analysis => {
  console.log('项目分析完成:', analysis)
})
```

### 自定义检测规则

```typescript
import { ProjectDetector, ProjectType } from '@ldesign/kit/project'

const detector = new ProjectDetector({
  customDetectionRules: [
    {
      name: 'Custom Vue + Electron',
      projectType: ProjectType.ELECTRON,
      weight: 100,
      conditions: [
        { type: 'dependency', target: 'vue', mode: 'exists' },
        { type: 'dependency', target: 'electron', mode: 'exists' },
        { type: 'file', target: 'electron.js', mode: 'exists' },
      ],
    },
  ],
})

const result = await detector.detectProject()
```

## 🔍 支持的项目类型

| 项目类型   | 描述                | 检测特征                        |
| ---------- | ------------------- | ------------------------------- |
| Vue 2.x    | Vue.js 2.x 项目     | vue@^2.x, vue-template-compiler |
| Vue 3.x    | Vue.js 3.x 项目     | vue@^3.x, @vue/compiler-sfc     |
| React      | React 项目          | react, react-dom                |
| Next.js    | Next.js 全栈框架    | next                            |
| Nuxt.js    | Nuxt.js 全栈框架    | nuxt, @nuxt/kit                 |
| Angular    | Angular 框架        | @angular/core, @angular/cli     |
| Svelte     | Svelte 框架         | svelte, @sveltejs/kit           |
| Node.js    | 纯 Node.js 项目     | express, koa, fastify           |
| TypeScript | TypeScript 项目     | typescript, tsconfig.json       |
| Electron   | 桌面应用            | electron                        |
| Tauri      | Rust + Web 桌面应用 | @tauri-apps/cli                 |

## 🛠️ 支持的构建工具

| 构建工具 | 描述              | 特性                             |
| -------- | ----------------- | -------------------------------- |
| Vite     | 现代前端构建工具  | 快速热重载、TypeScript、插件生态 |
| Webpack  | 传统打包工具      | 功能强大、配置复杂、生态丰富     |
| Rollup   | 库打包优选        | 树摇优化、ES模块、体积小         |
| esbuild  | 极速构建工具      | 构建速度极快、Go编写             |
| tsup     | TypeScript 库构建 | 基于 esbuild、配置简单           |
| Parcel   | 零配置打包工具    | 开箱即用、自动优化               |

## 📋 支持的包管理器

| 包管理器 | 特性         | 性能                   |
| -------- | ------------ | ---------------------- |
| npm      | 标准包管理器 | 稳定可靠、生态完整     |
| yarn     | 增强包管理器 | 缓存优化、工作空间支持 |
| pnpm     | 高效包管理器 | 磁盘节省、安装快速     |
| bun      | 现代运行时   | 极速安装、内置打包     |

## 🧪 错误处理

```typescript
import { ProjectDetector } from '@ldesign/kit/project'

try {
  const detector = new ProjectDetector({ projectRoot: '/invalid/path' })
  const result = await detector.detectProject()
} catch (error) {
  console.error('项目检测失败:', error.message)
  // 处理错误情况
}
```

## 🔧 高级用法

### 监听项目变化

```typescript
import { FileWatcher } from '@ldesign/kit/filesystem'
import { ProjectDetector } from '@ldesign/kit/project'

const watcher = new FileWatcher()
const detector = new ProjectDetector()

// 监听 package.json 变化
watcher.watchFile('package.json', async () => {
  console.log('package.json 发生变化，重新检测项目...')
  const result = await detector.detectProject()
  console.log('检测结果:', result)
})
```

### 批量分析多个项目

```typescript
import { ProjectDetector } from '@ldesign/kit/project'

async function analyzeMultipleProjects(projectPaths: string[]) {
  const results = await Promise.all(
    projectPaths.map(async path => {
      const detector = new ProjectDetector({ projectRoot: path })
      return {
        path,
        result: await detector.detectProject(),
      }
    })
  )

  return results
}
```

## 📊 输出示例

### 项目检测结果

```json
{
  "projectType": "vue3",
  "framework": "Vue.js",
  "frameworkVersion": "^3.3.0",
  "packageManager": "pnpm",
  "buildTools": ["vite"],
  "hasTypeScript": true,
  "projectRoot": "/path/to/project",
  "configFiles": ["vite.config.ts", "tsconfig.json"],
  "mainDependencies": ["vue", "@vue/router"],
  "devDependencies": ["vite", "@vitejs/plugin-vue"],
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "confidence": 95,
  "details": ["检测到 Vue.js 依赖: ^3.3.0", "版本号指向 Vue 3.x", "检测到 Vite 构建工具"]
}
```

### 依赖分析报告

```
# 依赖分析报告
生成时间: 2024-01-01 12:00:00

## 基础统计
总依赖数: 125
生产依赖: 15
开发依赖: 110

## 过时依赖
- vue: ^3.2.0 → ^3.4.0 (minor)
- vite: ^4.0.0 → ^5.0.0 (major)

## 安全漏洞
无发现安全漏洞

## 大小分析
总大小: 45.2 MB
生产依赖: 12.3 MB
开发依赖: 32.9 MB

### 最大的依赖:
- @types/node: 2.1 MB (4.7%)
- typescript: 1.8 MB (4.0%)
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目管理模块。

## 📄 许可证

MIT License

# @ldesign/project-manager

项目管理工具 - 项目扫描、类型识别、依赖分析

## ✨ 特性

- 🔍 **项目扫描** - 自动扫描指定目录下的项目
- 🎯 **类型识别** - 智能识别项目类型（Vue/React/Node/Monorepo等）
- 📦 **依赖分析** - 分析项目依赖关系
- 📜 **脚本管理** - 管理 package.json 中的脚本
- ⚙️ **配置管理** - 读取和管理项目配置

## 📦 安装

```bash
pnpm add @ldesign/project-manager
```

## 🚀 快速开始

### 项目扫描

```typescript
import { ProjectScanner } from '@ldesign/project-manager'

const scanner = new ProjectScanner()

// 扫描目录下的所有项目
const projects = await scanner.scan('/path/to/directory')

console.log(projects)
```

### 项目类型识别

```typescript
import { ProjectDetector } from '@ldesign/project-manager'

const detector = new ProjectDetector('/path/to/project')

// 检测项目类型
const type = await detector.detectType()
console.log(type) // 'vue' | 'react' | 'node' | 'monorepo' | 'unknown'

// 获取项目信息
const info = await detector.getProjectInfo()
console.log(info)
```

### 依赖分析

```typescript
import { DependencyAnalyzer } from '@ldesign/project-manager'

const analyzer = new DependencyAnalyzer('/path/to/project')

// 获取依赖列表
const dependencies = await analyzer.getDependencies()
console.log(dependencies)

// 检查过期依赖
const outdated = await analyzer.checkOutdated()
console.log(outdated)
```

## 📖 API 文档

### ProjectScanner

项目扫描器，用于扫描目录下的所有项目。

#### `scan(directory: string): Promise<Project[]>`

扫描指定目录下的所有项目。

### ProjectDetector

项目检测器，用于识别项目类型和获取项目信息。

#### `detectType(): Promise<ProjectType>`

检测项目类型。

#### `getProjectInfo(): Promise<ProjectInfo>`

获取完整的项目信息。

### DependencyAnalyzer

依赖分析器，用于分析项目依赖。

#### `getDependencies(): Promise<Dependencies>`

获取项目依赖列表。

#### `checkOutdated(): Promise<OutdatedDependency[]>`

检查过期的依赖。

## 📝 类型定义

```typescript
// 项目类型
type ProjectType = 'vue' | 'react' | 'node' | 'monorepo' | 'unknown'

// 项目信息
interface ProjectInfo {
  name: string
  path: string
  type: ProjectType
  version: string
  description?: string
  scripts: Record<string, string>
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
}

// 依赖信息
interface Dependencies {
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
  peerDependencies: Record<string, string>
}
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License


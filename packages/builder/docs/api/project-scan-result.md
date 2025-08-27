# ProjectScanResult

项目扫描结果的类型定义。

## 类型定义

```typescript
interface ProjectScanResult {
  /** 项目根目录 */
  root: string
  /** 项目类型 */
  projectType: ProjectType
  /** 扫描到的文件列表 */
  files: FileInfo[]
  /** 入口点列表 */
  entryPoints: string[]
  /** 包信息 */
  packageInfo?: PackageInfo
  /** 依赖关系图 */
  dependencyGraph: DependencyGraph
  /** 扫描时间 */
  scanTime: number
}
```

## 属性详解

### root

类型：`string`

项目根目录的绝对路径。

```typescript
console.log(`项目根目录: ${result.root}`)
```

### projectType

类型：`ProjectType`

检测到的项目类型。

```typescript
type ProjectType = 'vue' | 'react' | 'typescript' | 'javascript' | 'unknown'

switch (result.projectType) {
  case 'vue':
    console.log('检测到 Vue 项目')
    break
  case 'react':
    console.log('检测到 React 项目')
    break
  case 'typescript':
    console.log('检测到 TypeScript 项目')
    break
  case 'javascript':
    console.log('检测到 JavaScript 项目')
    break
  default:
    console.log('未知项目类型')
}
```

### files

类型：`FileInfo[]`

扫描到的所有文件信息。

```typescript
console.log(`扫描到 ${result.files.length} 个文件`)

result.files.forEach(file => {
  console.log(`${file.path} (${file.type})`)
})
```

### entryPoints

类型：`string[]`

检测到的入口点文件列表。

```typescript
console.log('入口点:')
result.entryPoints.forEach(entry => {
  console.log(`- ${entry}`)
})
```

### packageInfo

类型：`PackageInfo | undefined`

package.json 文件信息（如果存在）。

```typescript
if (result.packageInfo) {
  console.log(`包名: ${result.packageInfo.name}`)
  console.log(`版本: ${result.packageInfo.version}`)
  console.log(`描述: ${result.packageInfo.description}`)
}
```

### dependencyGraph

类型：`DependencyGraph`

文件依赖关系图。

```typescript
// 查看文件依赖
for (const [file, deps] of Object.entries(result.dependencyGraph.dependencies)) {
  console.log(`${file} 依赖:`)
  deps.forEach(dep => console.log(`  -> ${dep}`))
}

// 查看外部依赖
console.log('外部依赖:', result.dependencyGraph.external)

// 检查循环依赖
if (result.dependencyGraph.circular.length > 0) {
  console.warn('发现循环依赖:')
  result.dependencyGraph.circular.forEach(cycle => {
    console.warn(`  ${cycle.join(' -> ')}`)
  })
}
```

### scanTime

类型：`number`

扫描耗时，单位为毫秒。

```typescript
console.log(`扫描耗时: ${result.scanTime}ms`)
```

## 相关类型

### FileInfo

```typescript
interface FileInfo {
  /** 文件路径 */
  path: string
  /** 文件类型 */
  type: FileType
  /** 文件大小 */
  size: number
  /** 修改时间 */
  mtime: Date
  /** 文件依赖 */
  dependencies?: string[]
  /** 是否为入口文件 */
  isEntry?: boolean
}
```

### FileType

```typescript
type FileType = 
  | 'typescript' 
  | 'javascript' 
  | 'vue' 
  | 'jsx' 
  | 'tsx' 
  | 'css' 
  | 'less' 
  | 'scss' 
  | 'sass' 
  | 'stylus' 
  | 'json' 
  | 'other'
```

### PackageInfo

```typescript
interface PackageInfo {
  /** 包名 */
  name: string
  /** 版本 */
  version: string
  /** 描述 */
  description?: string
  /** 主入口 */
  main?: string
  /** ES 模块入口 */
  module?: string
  /** 类型声明入口 */
  types?: string
  /** 依赖 */
  dependencies?: Record<string, string>
  /** 开发依赖 */
  devDependencies?: Record<string, string>
  /** 对等依赖 */
  peerDependencies?: Record<string, string>
}
```

### DependencyGraph

```typescript
interface DependencyGraph {
  /** 文件依赖关系 */
  dependencies: Record<string, string[]>
  /** 外部依赖 */
  external: string[]
  /** 循环依赖 */
  circular: string[][]
}
```

## 使用示例

### 基础分析

```typescript
import { analyze } from '@ldesign/builder'

const result = await analyze('./my-project')

console.log('项目分析结果:')
console.log(`- 项目类型: ${result.projectType}`)
console.log(`- 文件数量: ${result.files.length}`)
console.log(`- 入口点: ${result.entryPoints.length} 个`)
console.log(`- 扫描时间: ${result.scanTime}ms`)
```

### 详细分析

```typescript
import { analyze } from '@ldesign/builder'

const result = await analyze()

// 项目基本信息
console.log('📁 项目信息:')
console.log(`   根目录: ${result.root}`)
console.log(`   类型: ${result.projectType}`)

if (result.packageInfo) {
  console.log(`   包名: ${result.packageInfo.name}`)
  console.log(`   版本: ${result.packageInfo.version}`)
}

// 文件统计
const fileStats = result.files.reduce((stats, file) => {
  stats[file.type] = (stats[file.type] || 0) + 1
  return stats
}, {} as Record<string, number>)

console.log('\n📊 文件统计:')
Object.entries(fileStats).forEach(([type, count]) => {
  console.log(`   ${type}: ${count} 个`)
})

// 入口点
console.log('\n🚪 入口点:')
result.entryPoints.forEach(entry => {
  console.log(`   ${entry}`)
})

// 外部依赖
if (result.dependencyGraph.external.length > 0) {
  console.log('\n📦 外部依赖:')
  result.dependencyGraph.external.forEach(dep => {
    console.log(`   ${dep}`)
  })
}

// 循环依赖检查
if (result.dependencyGraph.circular.length > 0) {
  console.log('\n⚠️  循环依赖:')
  result.dependencyGraph.circular.forEach(cycle => {
    console.log(`   ${cycle.join(' -> ')}`)
  })
}
```

### 条件处理

```typescript
import { analyze } from '@ldesign/builder'

const result = await analyze()

// 根据项目类型进行不同处理
switch (result.projectType) {
  case 'vue':
    console.log('这是一个 Vue 项目，建议使用 Vue 相关插件')
    break
  case 'react':
    console.log('这是一个 React 项目，建议配置 JSX 支持')
    break
  case 'typescript':
    console.log('这是一个 TypeScript 项目，建议生成类型声明文件')
    break
  case 'unknown':
    console.warn('无法识别项目类型，可能需要手动配置')
    break
}

// 检查是否有入口点
if (result.entryPoints.length === 0) {
  console.error('未找到入口点，请检查项目结构')
} else if (result.entryPoints.length > 1) {
  console.log('检测到多个入口点，建议使用多入口配置')
}

// 检查包信息
if (!result.packageInfo) {
  console.warn('未找到 package.json 文件')
} else if (!result.packageInfo.main && !result.packageInfo.module) {
  console.warn('package.json 中未配置入口字段')
}
```

## 相关

- [analyze](/api/analyze)
- [build](/api/build)

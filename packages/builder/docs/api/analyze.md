# analyze

分析项目结构和依赖关系的 API 函数。

## 语法

```typescript
function analyze(input?: string): Promise<AnalyzeResult>
```

## 参数

### input

类型：`string`  
默认值：`process.cwd()`

要分析的项目根目录路径。

## 返回值

类型：`Promise<AnalyzeResult>`

返回项目分析结果的 Promise。

```typescript
interface AnalyzeResult {
  /** 项目扫描结果 */
  scanResult: ProjectScanResult
  /** 依赖关系图 */
  dependencyGraph: DependencyGraph
  /** 推荐的插件配置 */
  pluginConfig: PluginConfig
  /** 分析统计 */
  stats: AnalyzeStats
}
```

## 示例

### 基础用法

```typescript
import { analyze } from '@ldesign/builder'

const result = await analyze()

console.log('项目类型:', result.scanResult.projectType)
console.log('文件数量:', result.scanResult.files.length)
console.log('入口点:', result.scanResult.entryPoints)
```

### 分析指定目录

```typescript
import { analyze } from '@ldesign/builder'

const result = await analyze('./my-project')

// 查看项目信息
console.log('项目根目录:', result.scanResult.root)
console.log('包信息:', result.scanResult.packageInfo)
```

### 查看依赖关系

```typescript
import { analyze } from '@ldesign/builder'

const result = await analyze()

// 查看依赖关系图
console.log('依赖关系:')
for (const [file, deps] of Object.entries(result.dependencyGraph.dependencies)) {
  console.log(`${file}:`)
  deps.forEach(dep => console.log(`  -> ${dep}`))
}

// 查看外部依赖
console.log('外部依赖:', result.dependencyGraph.external)
```

### 查看推荐配置

```typescript
import { analyze } from '@ldesign/builder'

const result = await analyze()

// 查看推荐的插件配置
console.log('推荐插件:', result.pluginConfig.plugins.map(p => p.name))
console.log('推荐的 Rollup 配置:', result.pluginConfig.rollupOptions)
```

### 分析统计信息

```typescript
import { analyze } from '@ldesign/builder'

const result = await analyze()

console.log('分析统计:')
console.log(`- 总文件数: ${result.stats.totalFiles}`)
console.log(`- TypeScript 文件: ${result.stats.typeScriptFiles}`)
console.log(`- JavaScript 文件: ${result.stats.javaScriptFiles}`)
console.log(`- Vue 文件: ${result.stats.vueFiles}`)
console.log(`- CSS 文件: ${result.stats.cssFiles}`)
console.log(`- 分析时间: ${result.stats.analyzeTime}ms`)
```

## 类型定义

### ProjectScanResult

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

### AnalyzeStats

```typescript
interface AnalyzeStats {
  /** 总文件数 */
  totalFiles: number
  /** TypeScript 文件数 */
  typeScriptFiles: number
  /** JavaScript 文件数 */
  javaScriptFiles: number
  /** Vue 文件数 */
  vueFiles: number
  /** React 文件数 */
  reactFiles: number
  /** CSS 文件数 */
  cssFiles: number
  /** 分析时间（毫秒） */
  analyzeTime: number
}
```

## 使用场景

### 项目诊断

```typescript
import { analyze } from '@ldesign/builder'

async function diagnoseProject() {
  const result = await analyze()
  
  // 检查是否有循环依赖
  if (result.dependencyGraph.circular.length > 0) {
    console.warn('发现循环依赖:')
    result.dependencyGraph.circular.forEach(cycle => {
      console.warn(`  ${cycle.join(' -> ')}`)
    })
  }
  
  // 检查项目类型
  if (result.scanResult.projectType === 'unknown') {
    console.warn('无法识别项目类型，可能需要手动配置')
  }
  
  // 检查入口点
  if (result.scanResult.entryPoints.length === 0) {
    console.warn('未找到入口点，请检查项目结构')
  }
}
```

### 生成构建配置

```typescript
import { analyze, defineConfig } from '@ldesign/builder'

async function generateConfig() {
  const result = await analyze()
  
  const config = defineConfig({
    input: result.scanResult.entryPoints[0],
    outDir: 'dist',
    formats: ['esm', 'cjs'],
    external: result.dependencyGraph.external,
    ...result.pluginConfig.rollupOptions
  })
  
  return config
}
```

## 相关

- [build](/api/build)
- [ProjectScanResult](/api/project-scan-result)
- [defineConfig](/api/define-config)

# 类型定义

本章详细介绍 Vite Launcher 的所有类型定义。

## 核心类型

### ProjectType

支持的项目类型。

```typescript
type ProjectType = 
  | 'vue3'
  | 'vue2'
  | 'react'
  | 'react-next'
  | 'vanilla'
  | 'vanilla-ts'
  | 'lit'
  | 'svelte'
  | 'angular'
  | 'unknown'
```

### FrameworkType

框架类型。

```typescript
type FrameworkType = 
  | 'vue3'
  | 'vue2'
  | 'react'
  | 'vanilla'
  | 'lit'
  | 'svelte'
  | 'angular'
  | 'unknown'
```

### CSSPreprocessor

CSS 预处理器类型。

```typescript
type CSSPreprocessor = 'sass' | 'less' | 'stylus' | undefined
```

## 配置类型

### LauncherOptions

启动器配置选项。

```typescript
interface LauncherOptions {
  logLevel?: 'error' | 'warn' | 'info' | 'silent'
  mode?: 'development' | 'production'
  autoDetect?: boolean
  root?: string
  configFile?: string
}
```

### DevOptions

开发服务器配置选项。

```typescript
interface DevOptions {
  port?: number
  host?: string
  open?: boolean
  https?: boolean
  cors?: boolean
}
```

### BuildOptions

构建配置选项。

```typescript
interface BuildOptions {
  outDir?: string
  minify?: boolean | 'terser' | 'esbuild'
  sourcemap?: boolean
  emptyOutDir?: boolean
  target?: string
}
```

### PreviewOptions

预览服务器配置选项。

```typescript
interface PreviewOptions {
  port?: number
  host?: string
  outDir?: string
  open?: boolean
}
```

### CreateOptions

项目创建配置选项。

```typescript
interface CreateOptions {
  template?: string
  force?: boolean
}
```

## 结果类型

### BuildResult

构建结果。

```typescript
interface BuildResult {
  success: boolean
  outputFiles: string[]
  duration: number
  size: number
  errors: string[]
  stats: BuildStats
}
```

### BuildStats

构建统计信息。

```typescript
interface BuildStats {
  entryCount: number
  moduleCount: number
  assetCount: number
  chunkCount: number
}
```

### ProjectInfo

项目信息。

```typescript
interface ProjectInfo {
  framework: FrameworkType
  typescript: boolean
  cssPreprocessor?: CSSPreprocessor
  dependencies: string[]
  confidence: number
}
```

### DetectionResult

检测结果。

```typescript
interface DetectionResult {
  projectType: ProjectType
  framework: FrameworkType
  confidence: number
  report: DetectionReport
  error?: LauncherError
}
```

### DetectionReport

检测报告。

```typescript
interface DetectionReport {
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
  detectedFiles: string[]
  confidence: number
}
```

## 错误类型

### LauncherError

启动器错误。

```typescript
interface LauncherError {
  code: string
  message: string
  details?: string
  suggestion?: string
}
```

### 错误代码

```typescript
type ErrorCode = 
  | 'PROJECT_EXISTS'
  | 'INVALID_PROJECT_TYPE'
  | 'BUILD_FAILED'
  | 'DEV_SERVER_ERROR'
  | 'INSTANCE_DESTROYED'
  | 'PORT_IN_USE'
  | 'FILE_NOT_FOUND'
  | 'PERMISSION_DENIED'
```

## 服务类型

### ErrorHandler

错误处理器接口。

```typescript
interface ErrorHandler {
  handleError(error: Error, context?: string): LauncherError
  createError(code: string, message: string, details?: string): LauncherError
  formatError(error: LauncherError): string
  getSuggestion(error: LauncherError): string
}
```

### ProjectDetector

项目检测器接口。

```typescript
interface ProjectDetector {
  detectProjectType(projectPath: string): Promise<ProjectInfo>
  detectFramework(dependencies: Record<string, string>): Promise<FrameworkType>
  detectTypeScript(projectPath: string): Promise<boolean>
  detectCSSPreprocessor(dependencies: Record<string, string>): Promise<CSSPreprocessor>
}
```

### ConfigManager

配置管理器接口。

```typescript
interface ConfigManager {
  loadConfig(configFile: string): Promise<any>
  mergeConfig(base: any, override: any): any
  validateConfig(config: any): boolean
  applyConfig(config: any): void
}
```

### PluginManager

插件管理器接口。

```typescript
interface PluginManager {
  loadPlugins(projectType: ProjectType): Promise<any[]>
  configurePlugins(plugins: any[], config: any): any[]
  validatePlugin(plugin: any): boolean
}
```

## 工具类型

### 工具函数类型

```typescript
// 项目创建
type CreateProjectFunction = (
  projectPath: string,
  projectType: ProjectType,
  options?: CreateOptions
) => Promise<void>

// 开发服务器
type StartDevFunction = (
  projectPath?: string,
  options?: DevOptions
) => Promise<ViteDevServer>

type StopDevFunction = () => Promise<void>

// 构建
type BuildProjectFunction = (
  projectPath?: string,
  options?: BuildOptions
) => Promise<BuildResult>

// 预览
type StartPreviewFunction = (
  projectPath?: string,
  options?: PreviewOptions
) => Promise<PreviewServer>

// 项目信息
type GetProjectInfoFunction = (
  projectPath?: string
) => Promise<ProjectInfo>

type DetectProjectFunction = (
  projectPath?: string
) => Promise<DetectionResult>

// 启动器创建
type CreateLauncherFunction = (
  options?: LauncherOptions
) => ViteLauncher
```

## 类型使用示例

### 类型安全的项目创建

```typescript
import { ViteLauncher, ProjectType, CreateOptions } from '@ldesign/launcher'

const launcher = new ViteLauncher()

async function createTypedProject(
  path: string,
  type: ProjectType,
  options?: CreateOptions
) {
  try {
    await launcher.create(path, type, options)
    console.log(`✅ 成功创建 ${type} 项目`)
  } catch (error) {
    console.error(`❌ 创建 ${type} 项目失败:`, error.message)
  }
}

// 使用类型安全的函数
createTypedProject('./my-app', 'vue3', { force: true })
```

### 类型安全的构建

```typescript
import { BuildOptions, BuildResult } from '@ldesign/launcher'

async function buildWithTypes(
  path: string,
  options: BuildOptions
): Promise<BuildResult> {
  const launcher = new ViteLauncher()
  
  try {
    return await launcher.build(path, options)
  } finally {
    await launcher.destroy()
  }
}

// 使用类型安全的构建函数
const result = await buildWithTypes('./my-app', {
  outDir: 'dist',
  minify: 'terser',
  sourcemap: true
})

if (result.success) {
  console.log(`构建成功，耗时: ${result.duration}ms`)
  console.log(`输出文件: ${result.outputFiles.length} 个`)
}
```

### 错误处理类型

```typescript
import { LauncherError, ErrorCode } from '@ldesign/launcher'

function handleLauncherError(error: LauncherError) {
  switch (error.code as ErrorCode) {
    case 'PROJECT_EXISTS':
      console.log('项目已存在，建议使用 force: true 选项')
      break
    case 'INVALID_PROJECT_TYPE':
      console.log('无效的项目类型，请检查支持的类型列表')
      break
    case 'BUILD_FAILED':
      console.log('构建失败，请检查项目配置')
      break
    default:
      console.error('未知错误:', error.message)
  }
  
  if (error.suggestion) {
    console.log('建议:', error.suggestion)
  }
}
```

## 类型扩展

### 自定义项目类型

```typescript
// 扩展项目类型
type ExtendedProjectType = ProjectType | 'custom-framework'

// 扩展框架类型
type ExtendedFrameworkType = FrameworkType | 'custom-framework'

// 自定义配置选项
interface CustomOptions extends LauncherOptions {
  customFeature?: boolean
  customConfig?: string
}
```

### 泛型类型

```typescript
// 泛型结果类型
interface GenericResult<T> {
  success: boolean
  data?: T
  error?: LauncherError
}

// 泛型配置类型
interface GenericConfig<T = any> {
  base: T
  override?: Partial<T>
  merge?: boolean
}
```

## 类型最佳实践

1. **类型导入**: 明确导入需要的类型
2. **类型注解**: 为函数参数和返回值添加类型注解
3. **类型守卫**: 使用类型守卫确保类型安全
4. **错误处理**: 使用类型化的错误处理
5. **配置验证**: 验证配置对象的类型

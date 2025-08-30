# 类型定义

本章详细介绍 LDesign Launcher 的所有类型定义，包括最新的配置系统类型。

## 核心类型

### FrameworkType

支持的框架类型。

```typescript
type FrameworkType = 'vue' | 'react' | 'lit' | 'vanilla'
```

### ProjectType

项目类型，基于框架类型扩展。

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

### CSSPreprocessor

CSS 预处理器类型。

```typescript
type CSSPreprocessor = 'sass' | 'less' | 'stylus' | undefined
```

## 配置类型

### LauncherConfig

主配置接口，包含所有配置选项。

```typescript
interface LauncherConfig {
  /** 项目名称 */
  projectName?: string
  /** 框架类型 */
  framework?: FrameworkType
  /** 项目根目录 */
  root?: string

  /** 服务器配置 */
  server?: ServerConfig
  /** 构建配置 */
  build?: BuildConfig
  /** 网络配置 */
  network?: NetworkConfig
  /** 安全配置 */
  security?: SecurityConfig
  /** 资源配置 */
  assets?: AssetsConfig
  /** 插件配置 */
  plugins?: PluginsConfig
  /** 优化配置 */
  optimization?: OptimizationConfig
  /** Vite 原生配置 */
  vite?: any
}
```

### ServerConfig

服务器配置接口。

```typescript
interface ServerConfig {
  /** 端口号，默认 3000 */
  port?: number
  /** 主机地址，默认 'localhost' */
  host?: string
  /** 是否自动打开浏览器 */
  open?: boolean | string
  /** 是否启用 HTTPS */
  https?: boolean
  /** 是否启用 CORS */
  cors?: boolean
}
```

### BuildConfig

构建配置接口。

```typescript
interface BuildConfig {
  /** 输出目录，默认 'dist' */
  outDir?: string
  /** 是否生成 sourcemap */
  sourcemap?: boolean
  /** 是否清空输出目录 */
  emptyOutDir?: boolean
  /** 压缩选项 */
  minify?: boolean | 'terser' | 'esbuild'
  /** 目标环境 */
  target?: string
}
```

### NetworkConfig

网络配置接口。

```typescript
interface NetworkConfig {
  /** 代理配置 */
  proxy?: Record<string, ProxyOptions>
  /** 路径别名配置 */
  alias?: Record<string, string>
  /** CORS 配置 */
  cors?: CORSConfig
  /** 网络超时配置 */
  timeout?: {
    connect?: number
    read?: number
    write?: number
  }
}
```

### ProxyOptions

代理配置选项。

```typescript
interface ProxyOptions {
  /** 目标地址 */
  target: string
  /** 是否改变源 */
  changeOrigin?: boolean
  /** 路径重写函数 */
  rewrite?: (path: string) => string
  /** 配置函数 */
  configure?: (proxy: any, options: any) => void
  /** 错误处理 */
  onError?: (err: Error, req: any, res: any) => void
  /** 代理请求处理 */
  onProxyReq?: (proxyReq: any, req: any, res: any) => void
  /** 代理响应处理 */
  onProxyRes?: (proxyRes: any, req: any, res: any) => void
}
```

### CORSConfig

CORS 配置接口。

```typescript
interface CORSConfig {
  /** 允许的源 */
  origin?: boolean | string | string[] | RegExp | ((origin: string) => boolean)
  /** 是否允许凭证 */
  credentials?: boolean
  /** 允许的方法 */
  methods?: string[]
  /** 允许的头部 */
  allowedHeaders?: string[]
  /** 暴露的头部 */
  exposedHeaders?: string[]
  /** 预检请求缓存时间 */
  maxAge?: number
}
```

### SecurityConfig

安全配置接口。

```typescript
interface SecurityConfig {
  /** HTTPS 配置 */
  https?: {
    enabled?: boolean
    ssl?: {
      autoGenerate?: boolean
      cert?: string
      key?: string
      ca?: string
    }
  }
  /** 安全头配置 */
  headers?: {
    frameOptions?: string
    contentTypeOptions?: boolean
    xssProtection?: boolean
  }
  /** CSP 配置 */
  csp?: {
    enabled?: boolean
    directives?: Record<string, string[]>
  }
}
```

### AssetsConfig

资源配置接口。

```typescript
interface AssetsConfig {
  /** 字体优化配置 */
  fonts?: FontOptimizationConfig
  /** SVG 处理配置 */
  svg?: SVGConfig
  /** 图片优化配置 */
  images?: ImageOptimizationConfig
  /** 静态资源目录 */
  staticDir?: string
  /** 输出目录 */
  outputDir?: string
  /** 是否启用资源哈希 */
  hash?: boolean
}
```

### FontOptimizationConfig

字体优化配置接口。

```typescript
interface FontOptimizationConfig {
  /** 是否启用字体子集化 */
  subset?: boolean
  /** 字体子集化字符集 */
  subsetChars?: string | undefined
  /** 支持的字体格式 */
  formats?: string[]
  /** 字体显示方式 */
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional'
  /** 是否预加载字体 */
  preload?: boolean
  /** 是否生成回退字体 */
  generateFallback?: boolean
  /** 压缩级别 */
  compressionLevel?: number
  /** 是否包含中文字符 */
  includeChinese?: boolean
  /** 中文字符集类型 */
  chineseCharset?: 'simplified' | 'traditional'
}
```

### SVGConfig

SVG 配置接口。

```typescript
interface SVGConfig {
  /** 是否启用 SVG 组件转换 */
  componentGeneration?: boolean
  /** 是否启用 SVG 优化 */
  optimization?: boolean
  /** 是否生成 SVG 精灵图 */
  sprite?: boolean
  /** SVG 优化选项 */
  optimizationOptions?: SVGOptimizationOptions
  /** 组件生成选项 */
  componentOptions?: SVGComponentOptions
  /** 精灵图生成选项 */
  spriteOptions?: SVGSpriteOptions
}
```

### SVGOptimizationOptions

SVG 优化选项接口。

```typescript
interface SVGOptimizationOptions {
  /** 是否移除注释 */
  removeComments?: boolean
  /** 是否移除元数据 */
  removeMetadata?: boolean
  /** 是否移除编辑器数据 */
  removeEditorsNSData?: boolean
  /** 是否移除未使用的命名空间 */
  removeUnusedNS?: boolean
  /** 是否移除空属性 */
  removeEmptyAttrs?: boolean
  /** 是否移除空文本 */
  removeEmptyText?: boolean
  /** 是否移除空容器 */
  removeEmptyContainers?: boolean
}
```

### SVGComponentOptions

SVG 组件选项接口。

```typescript
interface SVGComponentOptions {
  /** 目标框架 */
  framework?: 'vue' | 'react' | 'lit'
  /** 是否使用 TypeScript */
  typescript?: boolean
  /** 组件名称前缀 */
  prefix?: string
  /** 组件名称后缀 */
  suffix?: string
  /** 输出目录 */
  outputDir?: string
}
```

### SVGSpriteOptions

SVG 精灵图选项接口。

```typescript
interface SVGSpriteOptions {
  /** 精灵图文件名 */
  filename?: string
  /** 输出目录 */
  outputDir?: string
  /** 是否生成 CSS */
  generateCSS?: boolean
  /** CSS 文件名 */
  cssFilename?: string
  /** 图标前缀 */
  iconPrefix?: string
}
```

### ImageOptimizationConfig

图片优化配置接口。

```typescript
interface ImageOptimizationConfig {
  /** 是否启用图片优化 */
  enabled?: boolean
  /** 支持的图片格式 */
  formats?: string[]
  /** 图片质量配置 */
  quality?: Record<string, number>
  /** 是否启用响应式图片 */
  responsive?: boolean
  /** 是否启用懒加载 */
  lazyLoading?: boolean
  /** 图片尺寸配置 */
  sizes?: number[]
  /** 输出目录 */
  outputDir?: string
}
```

### PluginsConfig

插件配置接口。

```typescript
interface PluginsConfig {
  /** 内置插件配置 */
  builtin?: {
    /** 压缩插件 */
    compression?: PluginConfig
    /** 代码分割插件 */
    codeSplitting?: PluginConfig
    /** 热重载增强插件 */
    hmrEnhanced?: PluginConfig
    /** 构建分析插件 */
    bundleAnalyzer?: PluginConfig
  }
  /** 外部插件 */
  external?: string[]
  /** 禁用的插件 */
  disabled?: string[]
  /** 插件加载顺序 */
  order?: string[]
}
```

### PluginConfig

插件配置接口。

```typescript
interface PluginConfig {
  /** 是否启用插件 */
  enabled?: boolean
  /** 应用场景 */
  apply?: 'serve' | 'build' | ((config: any, env: any) => boolean)
  /** 插件选项 */
  options?: Record<string, any>
  /** 插件执行顺序 */
  enforce?: 'pre' | 'post'
}
```

### OptimizationConfig

优化配置接口。

```typescript
interface OptimizationConfig {
  /** 热重载优化 */
  hotReload?: HotReloadOptimizationConfig
  /** 错误提示优化 */
  errorDisplay?: ErrorDisplayConfig
  /** 构建分析 */
  buildAnalysis?: BuildAnalysisConfig
  /** 性能监控 */
  performance?: PerformanceMonitoringConfig
  /** 缓存优化 */
  cache?: CacheOptimizationConfig
  /** 开发服务器优化 */
  devServer?: DevServerOptimizationConfig
  /** 构建优化 */
  build?: BuildOptimizationConfig
}
```

### HotReloadOptimizationConfig

热重载优化配置接口。

```typescript
interface HotReloadOptimizationConfig {
  /** 是否启用快速刷新 */
  fastRefresh?: boolean
  /** 是否保持状态 */
  preserveState?: boolean
  /** 是否启用智能重载 */
  smartReload?: boolean
  /** 更新延迟（毫秒） */
  updateDelay?: number
}
```

### ErrorDisplayConfig

错误显示配置接口。

```typescript
interface ErrorDisplayConfig {
  /** 是否显示错误覆盖层 */
  overlay?: boolean
  /** 是否显示源码位置 */
  showSourceLocation?: boolean
  /** 是否显示堆栈跟踪 */
  showStackTrace?: boolean
  /** 是否显示建议 */
  suggestions?: boolean
}
```

### PerformanceMonitoringConfig

性能监控配置接口。

```typescript
interface PerformanceMonitoringConfig {
  /** 是否启用性能监控 */
  enabled?: boolean
  /** 监控指标 */
  metrics?: {
    buildTime?: boolean
    memoryUsage?: boolean
    fileSystemOps?: boolean
  }
  /** 性能预算 */
  budget?: {
    maxBuildTime?: number
    maxMemoryUsage?: number
    maxBundleSize?: number
  }
}
```

### CacheOptimizationConfig

缓存优化配置接口。

```typescript
interface CacheOptimizationConfig {
  /** 是否启用文件系统缓存 */
  filesystem?: boolean
  /** 是否启用内存缓存 */
  memory?: boolean
  /** 缓存策略 */
  strategy?: 'conservative' | 'aggressive'
  /** 最大缓存大小（MB） */
  maxSize?: number
}
```

### DevServerOptimizationConfig

开发服务器优化配置接口。

```typescript
interface DevServerOptimizationConfig {
  /** 预构建配置 */
  prebuild?: {
    enabled?: boolean
    include?: string[]
    exclude?: string[]
  }
  /** 中间件配置 */
  middleware?: {
    compression?: boolean
    cache?: boolean
  }
}
```

### BuildOptimizationConfig

构建优化配置接口。

```typescript
interface BuildOptimizationConfig {
  /** 代码分割配置 */
  codeSplitting?: {
    strategy?: 'vendor' | 'async'
    minChunkSize?: number
    maxChunkSize?: number
  }
  /** 压缩配置 */
  minification?: {
    js?: 'terser' | 'esbuild'
    css?: 'cssnano'
    html?: boolean
  }
  /** Tree Shaking 配置 */
  treeShaking?: {
    enabled?: boolean
    sideEffects?: boolean
  }
}
```

## 结果类型

### BuildResult

构建结果接口。

```typescript
interface BuildResult {
  /** 构建是否成功 */
  success: boolean
  /** 输出文件列表 */
  outputFiles: string[]
  /** 构建耗时（毫秒） */
  duration: number
  /** 输出文件总大小（字节） */
  size: number
  /** 错误信息 */
  errors: string[]
  /** 警告信息 */
  warnings: string[]
  /** 构建统计信息 */
  stats: BuildStats
}
```

### BuildStats

构建统计信息接口。

```typescript
interface BuildStats {
  /** 入口文件数量 */
  entryCount: number
  /** 模块数量 */
  moduleCount: number
  /** 资源文件数量 */
  assetCount: number
  /** 代码块数量 */
  chunkCount: number
  /** 各类型文件大小统计 */
  sizeByType: Record<string, number>
}
```

### ProjectInfo

项目信息接口。

```typescript
interface ProjectInfo {
  /** 框架类型 */
  framework: FrameworkType
  /** 是否使用 TypeScript */
  typescript: boolean
  /** CSS 预处理器 */
  cssPreprocessor?: CSSPreprocessor
  /** 依赖列表 */
  dependencies: string[]
  /** 检测置信度 */
  confidence: number
  /** 项目根目录 */
  root: string
  /** 包管理器类型 */
  packageManager?: 'npm' | 'yarn' | 'pnpm'
}
```

### DetectionResult

检测结果接口。

```typescript
interface DetectionResult {
  /** 项目类型 */
  projectType: ProjectType
  /** 框架类型 */
  framework: FrameworkType
  /** 检测置信度 */
  confidence: number
  /** 检测报告 */
  report: DetectionReport
  /** 错误信息 */
  error?: LauncherError
}
```

### DetectionReport

检测报告接口。

```typescript
interface DetectionReport {
  /** 生产依赖 */
  dependencies: Record<string, string>
  /** 开发依赖 */
  devDependencies: Record<string, string>
  /** 检测到的文件 */
  detectedFiles: string[]
  /** 检测置信度 */
  confidence: number
  /** 检测到的特征 */
  features: string[]
}
```

## 错误类型

### LauncherError

启动器错误接口。

```typescript
interface LauncherError {
  /** 错误代码 */
  code: string
  /** 错误消息 */
  message: string
  /** 错误详情 */
  details?: string
  /** 建议解决方案 */
  suggestion?: string
  /** 错误堆栈 */
  stack?: string
}
```

### ErrorCode

错误代码类型。

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
  | 'CONFIG_LOAD_ERROR'
  | 'PLUGIN_ERROR'
  | 'NETWORK_ERROR'
  | 'SECURITY_ERROR'
```

## 服务接口

### ILauncher

启动器主接口。

```typescript
interface ILauncher {
  /** 创建项目 */
  create(projectPath: string, projectType: ProjectType, options?: CreateOptions): Promise<void>
  /** 启动开发服务器 */
  dev(projectPath?: string, options?: DevOptions): Promise<ViteDevServer>
  /** 构建项目 */
  build(projectPath?: string, options?: BuildOptions): Promise<BuildResult>
  /** 启动预览服务器 */
  preview(projectPath?: string, options?: PreviewOptions): Promise<PreviewServer>
  /** 获取项目信息 */
  getProjectInfo(projectPath?: string): Promise<ProjectInfo>
  /** 检测项目类型 */
  detect(projectPath?: string): Promise<DetectionResult>
  /** 销毁实例 */
  destroy(): Promise<void>
}
```

### IConfigLoader

配置加载器接口。

```typescript
interface IConfigLoader {
  /** 加载用户配置 */
  loadUserConfig(projectPath: string): Promise<LauncherConfig>
  /** 解析配置文件 */
  resolveConfigFile(projectPath: string): Promise<string | null>
  /** 验证配置 */
  validateConfig(config: LauncherConfig): ValidationResult
  /** 合并配置 */
  mergeConfig(base: LauncherConfig, override: Partial<LauncherConfig>): LauncherConfig
}
```

### IProjectDetector

项目检测器接口。

```typescript
interface IProjectDetector {
  /** 检测项目类型 */
  detectProjectType(projectPath: string): Promise<ProjectInfo>
  /** 检测框架类型 */
  detectFramework(dependencies: Record<string, string>): Promise<FrameworkType>
  /** 检测 TypeScript */
  detectTypeScript(projectPath: string): Promise<boolean>
  /** 检测 CSS 预处理器 */
  detectCSSPreprocessor(dependencies: Record<string, string>): Promise<CSSPreprocessor>
  /** 检测包管理器 */
  detectPackageManager(projectPath: string): Promise<'npm' | 'yarn' | 'pnpm'>
}
```

### IPluginManager

插件管理器接口。

```typescript
interface IPluginManager {
  /** 加载插件 */
  loadPlugins(projectType: ProjectType): Promise<any[]>
  /** 配置插件 */
  configurePlugins(plugins: any[], config: LauncherConfig): any[]
  /** 验证插件 */
  validatePlugin(plugin: any): boolean
  /** 注册自定义插件 */
  registerPlugin(plugin: PluginConfig): void
  /** 获取所有可用插件 */
  getAvailablePlugins(): Promise<PluginConfig[]>
}
```

### IAssetManager

资源管理器接口。

```typescript
interface IAssetManager {
  /** 处理资源 */
  processAssets(config: AssetsConfig): Promise<AssetProcessingResult>
  /** 优化字体 */
  optimizeFont(fontPath: string, options?: FontOptimizationConfig): Promise<FontProcessingResult>
  /** 优化 SVG */
  optimizeSVG(svgPath: string, options?: SVGOptimizationOptions): Promise<string>
  /** 生成 SVG 精灵图 */
  generateSVGSprite(svgPaths: string[], options?: SVGSpriteOptions): Promise<string>
  /** 优化图片 */
  optimizeImages(config: ImageOptimizationConfig): Promise<ImageProcessingResult[]>
  /** 获取资源统计 */
  getAssetStats(): Promise<AssetStats>
}
```

### ISecurityManager

安全管理器接口。

```typescript
interface ISecurityManager {
  /** 配置 SSL */
  configureSSL(config: any): void
  /** 启用 HTTPS */
  enableHTTPS(config: any): void
  /** 配置安全头 */
  configureSecurityHeaders(config: any): void
  /** 配置 CSP */
  configureCSP(config: any): void
  /** 生成开发证书 */
  generateDevCertificate(): Promise<{ cert: string; key: string }>
  /** 验证证书 */
  validateCertificate(cert: string): boolean
}
```

## 工具类型

### ValidationResult

验证结果接口。

```typescript
interface ValidationResult {
  /** 是否有效 */
  valid: boolean
  /** 错误信息 */
  errors: string[]
  /** 警告信息 */
  warnings: string[]
}
```

### AssetProcessingResult

资源处理结果接口。

```typescript
interface AssetProcessingResult {
  /** 处理是否成功 */
  success: boolean
  /** 处理的文件列表 */
  processedFiles: string[]
  /** 原始大小 */
  originalSize: number
  /** 优化后大小 */
  optimizedSize: number
  /** 压缩比例 */
  compressionRatio: number
  /** 处理耗时 */
  duration: number
}
```

### FontProcessingResult

字体处理结果接口。

```typescript
interface FontProcessingResult {
  /** 原始字体路径 */
  originalPath: string
  /** 输出文件路径 */
  outputPaths: string[]
  /** 原始大小 */
  originalSize: number
  /** 优化后大小 */
  optimizedSize: number
  /** 支持的格式 */
  formats: string[]
  /** 子集化字符数 */
  subsetCharCount?: number
}
```

### ImageProcessingResult

图片处理结果接口。

```typescript
interface ImageProcessingResult {
  /** 原始图片路径 */
  originalPath: string
  /** 输出文件路径 */
  outputPaths: string[]
  /** 原始大小 */
  originalSize: number
  /** 优化后大小 */
  optimizedSize: number
  /** 生成的格式 */
  formats: string[]
  /** 生成的尺寸 */
  sizes: number[]
}
```

### AssetStats

资源统计接口。

```typescript
interface AssetStats {
  /** 总文件数 */
  totalFiles: number
  /** 总大小 */
  totalSize: number
  /** 按类型分组的统计 */
  byType: Record<string, { count: number; size: number }>
  /** 优化统计 */
  optimization: {
    optimizedFiles: number
    originalSize: number
    optimizedSize: number
    compressionRatio: number
  }
}
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

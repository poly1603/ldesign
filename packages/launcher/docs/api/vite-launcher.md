# ViteLauncher API

`ViteLauncher` 是 Vite Launcher 的核心类，提供项目创建、开发、构建等主要功能。

## 构造函数

```typescript
new ViteLauncher(options?: LauncherOptions)
```

### 参数

- `options` (可选): 启动器配置选项

```typescript
interface LauncherOptions {
  logLevel?: 'error' | 'warn' | 'info' | 'silent' // 日志级别，默认 'info'
  mode?: 'development' | 'production' // 运行模式，默认 'development'
  autoDetect?: boolean // 是否启用自动检测，默认 true
  root?: string // 项目根目录，默认 process.cwd()
  configFile?: string // Vite 配置文件路径
}
```

## 主要方法

### create(projectPath, projectType, options?)

创建新项目。

```typescript
async create(
  projectPath: string,
  projectType: ProjectType,
  options?: CreateOptions
): Promise<void>
```

### dev(projectPath?, options?)

启动开发服务器。

```typescript
async dev(
  projectPath?: string,
  options?: DevOptions
): Promise<ViteDevServer>
```

### build(projectPath?, options?)

构建项目。

```typescript
async build(
  projectPath?: string,
  options?: BuildOptions
): Promise<BuildResult>
```

### preview(projectPath?, options?)

启动预览服务器。

```typescript
async preview(
  projectPath?: string,
  options?: PreviewOptions
): Promise<PreviewServer>
```

### stop()

停止当前开发服务器。

```typescript
async stop(): Promise<void>
```

### destroy()

销毁启动器实例，释放资源。

```typescript
async destroy(): Promise<void>
```

### configure(config)

更新启动器配置。

```typescript
configure(config: Partial<InlineConfig>): void
```

### getConfig()

获取当前配置。

```typescript
getConfig(): InlineConfig
```

### getProjectType()

获取项目类型。

```typescript
getProjectType(): ProjectType
```

### getProjectInfo(projectPath?)

获取项目信息。

```typescript
async getProjectInfo(projectPath?: string): Promise<ProjectInfo>
```

## 使用示例

```typescript
import { ViteLauncher } from '@ldesign/launcher'

const launcher = new ViteLauncher({
  logLevel: 'info',
  mode: 'development'
})

// 创建项目
await launcher.create('./my-app', 'vue3', { force: true })

// 启动开发服务器
const server = await launcher.dev('./my-app', { port: 3000 })

// 构建项目
const result = await launcher.build('./my-app', { outDir: 'dist' })

// 销毁实例
await launcher.destroy()
```

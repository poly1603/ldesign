# 便捷函数 API

Vite Launcher 提供了一系列便捷函数，用于快速执行常见操作。

## 项目创建

### createProject(projectPath, projectType, options?)

快速创建项目。

```typescript
import { createProject } from '@ldesign/launcher'

// 创建 Vue 3 项目
await createProject('./my-vue-app', 'vue3')

// 强制覆盖现有目录
await createProject('./my-app', 'react', { force: true })
```

## 开发服务器

### startDev(projectPath?, options?)

启动开发服务器。

```typescript
import { startDev } from '@ldesign/launcher'

// 启动开发服务器
const server = await startDev('./my-app', {
  port: 3000,
  host: 'localhost',
  open: true
})
```

### stopDev()

停止开发服务器。

```typescript
import { stopDev } from '@ldesign/launcher'

await stopDev()
```

## 项目构建

### buildProject(projectPath?, options?)

构建项目。

```typescript
import { buildProject } from '@ldesign/launcher'

// 构建项目
const result = await buildProject('./my-app', {
  outDir: 'dist',
  minify: true,
  sourcemap: false
})

if (result.success) {
  console.log('构建成功!')
} else {
  console.error('构建失败:', result.errors)
}
```

## 预览服务器

### startPreview(projectPath?, options?)

启动预览服务器。

```typescript
import { startPreview } from '@ldesign/launcher'

const server = await startPreview('./my-app', {
  port: 4173,
  open: true
})
```

## 项目信息

### getProjectInfo(projectPath?)

获取项目信息。

```typescript
import { getProjectInfo } from '@ldesign/launcher'

const projectInfo = await getProjectInfo('./my-app')
console.log('框架:', projectInfo.framework)
console.log('TypeScript:', projectInfo.typescript)
```

### detectProject(projectPath?)

检测项目类型。

```typescript
import { detectProject } from '@ldesign/launcher'

const result = await detectProject('./my-app')
console.log('项目类型:', result.projectType)
```

## 启动器管理

### createLauncher(options?)

创建自定义启动器实例。

```typescript
import { createLauncher } from '@ldesign/launcher'

const launcher = createLauncher({
  logLevel: 'info',
  mode: 'development'
})
```

## 别名函数

```typescript
import { 
  create,    // createProject 的别名
  dev,       // startDev 的别名
  build,     // buildProject 的别名
  preview,   // startPreview 的别名
  info,      // getProjectInfo 的别名
  stop       // stopDev 的别名
} from '@ldesign/launcher'
```

## 完整示例

```typescript
import { 
  createProject, 
  startDev, 
  buildProject, 
  stopDev 
} from '@ldesign/launcher'

async function workflow() {
  // 创建项目
  await createProject('./my-app', 'vue3', { force: true })
  
  // 启动开发服务器
  const server = await startDev('./my-app', { port: 3000 })
  
  // 停止服务器
  await stopDev()
  
  // 构建项目
  const result = await buildProject('./my-app')
  
  if (result.success) {
    console.log('✅ 工作流程完成!')
  }
}
```

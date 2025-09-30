# Dev 热更新 & 导入项目优化总结

## ✅ 完成的任务

### 1. 实现 Dev 命令热更新 (100%)

#### 问题
- 用户希望在开发模式下修改前端或后端代码后能自动更新，无需手动重启

#### 解决方案

**1.1 安装依赖**
```bash
pnpm add -D tsx concurrently
```

- `tsx`: TypeScript 执行器，支持 watch 模式
- `concurrently`: 同时运行多个命令

**1.2 创建开发入口文件**

创建 `src/server/dev.ts` 作为开发模式的独立入口：

```typescript
import { createServer } from './app.js'
import { logger } from '../utils/logger.js'

const port = 3000
const host = 'localhost'

const serverLogger = logger.withPrefix('Dev')
serverLogger.info('启动开发服务器...')

createServer({ port, host, debug: true })
  .then(({ server, wss }) => {
    server.listen(port, host, () => {
      serverLogger.success(`服务器已启动`)
      console.log()
      console.log(`  本地访问:   http://localhost:${port}`)
      console.log()
    })
    // ... 错误处理和优雅关闭
  })
```

**1.3 修改 createServer 返回值**

修改 `src/server/app.ts`，返回 `{ server, wss }` 而不是只返回 `server`：

```typescript
export async function createServer(options: ServerOptions) {
  // ...
  const server = createHttpServer(app)
  const wss = new WebSocketServer({ server })
  setupWebSocket(wss, debug)
  
  return { server, wss }  // 返回对象
}
```

**1.4 更新 ui.ts 命令**

修改 `src/commands/ui.ts`，解构返回值：

```typescript
const { server } = await createServer({
  port: availablePort,
  host,
  debug
})
```

**1.5 配置 package.json 脚本**

```json
{
  "scripts": {
    "dev": "concurrently --raw \"pnpm:dev:web\" \"pnpm:dev:server\"",
    "dev:web": "cd src/web && pnpm dev",
    "dev:server": "tsx watch --clear-screen=false src/server/dev.ts"
  }
}
```

- `--raw`: 保持原始输出格式，不添加前缀
- `tsx watch`: 监听文件变化，自动重启
- `--clear-screen=false`: 不清屏，保留历史输出

#### 效果

✅ **前端热更新**
- 运行在 `http://localhost:3001`
- 使用 Vite 开发服务器
- 修改 Vue 组件后自动刷新浏览器
- 支持 HMR（热模块替换）

✅ **后端自动重启**
- 运行在 `http://localhost:3000`
- 使用 tsx watch 监听文件变化
- 修改 TypeScript 代码后自动重启服务器
- 保留日志输出

✅ **并发运行**
- 使用 concurrently 同时运行前后端
- 统一的日志输出
- 一个命令启动完整开发环境

#### 使用方法

```bash
cd packages/cli
pnpm dev
```

启动后：
- 前端: http://localhost:3001
- 后端: http://localhost:3000
- 修改代码自动生效

---

### 2. 修复项目导入选择目录问题 (100%)

#### 问题
- 用户反馈导入项目时目录选择器不是系统原生的
- `webkitdirectory` 属性在 Web 应用中体验不佳
- 无法直接输入路径

#### 解决方案

**2.1 改进输入框**

将只读输入框改为可编辑：

```vue
<input 
  type="text" 
  v-model="importForm.path" 
  placeholder="请输入项目完整路径，例如：D:\Projects\my-project" 
  class="form-input"
  @input="handlePathInput"
/>
```

**2.2 添加提示信息**

在输入框下方添加友好的提示：

```vue
<div class="form-hint">
  <span>💡 提示：请输入项目的完整路径，或点击"浏览"按钮选择目录</span>
</div>
```

**2.3 优化浏览按钮**

```vue
<button @click="selectDirectory" class="btn-secondary" title="选择目录（仅支持部分浏览器）">
  <FolderSearch :size="16" />
  <span>浏览</span>
</button>
```

**2.4 改进目录选择逻辑**

```typescript
const handleDirectorySelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files

  if (files && files.length > 0) {
    const firstFile = files[0]
    const fullPath = (firstFile as any).path || firstFile.webkitRelativePath

    if (fullPath) {
      const pathParts = fullPath.split(/[/\\]/)
      
      // 如果是 webkitRelativePath，需要移除文件名
      if (firstFile.webkitRelativePath) {
        pathParts.pop()
      }
      
      const dirPath = pathParts.join('\\')
      importForm.value.path = dirPath
      importError.value = ''
      
      message.info('已选择目录，请确认路径是否正确')
    }
  }
}
```

**2.5 添加样式**

```less
.form-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--ldesign-brand-color-focus);
  border-left: 3px solid var(--ldesign-brand-color);
  border-radius: var(--ls-border-radius-base);
  font-size: 13px;
  color: var(--ldesign-text-color-secondary);
  line-height: 1.5;
}
```

#### 效果

✅ **支持手动输入**
- 用户可以直接输入完整路径
- 支持 Windows 路径格式（D:\Projects\...）
- 实时清除错误提示

✅ **保留浏览功能**
- 浏览按钮仍然可用
- 添加了提示说明（仅支持部分浏览器）
- 选择后显示确认消息

✅ **友好的提示**
- 清晰的占位符文本
- 蓝色提示框说明使用方法
- 更好的用户体验

---

## 📊 改进统计

| 改进项 | 文件数 | 代码行数 | 状态 |
|--------|--------|----------|------|
| Dev 热更新 | 4 | ~100 | ✅ |
| 导入目录优化 | 1 | ~50 | ✅ |

**总计**: 2 项改进，5 个文件，约 150 行代码

---

## 🎯 技术亮点

### Dev 热更新
1. **前后端分离开发** - 前端 Vite，后端 tsx watch
2. **独立入口文件** - dev.ts 专门用于开发模式
3. **优雅的进程管理** - 正确处理 SIGINT/SIGTERM 信号
4. **统一的日志输出** - concurrently --raw 保持原始格式

### 导入目录优化
1. **双重输入方式** - 手动输入 + 浏览选择
2. **友好的提示** - 清晰的说明和示例
3. **路径格式处理** - 正确处理 Windows 路径
4. **即时反馈** - 选择后显示确认消息

---

## 🐛 已知限制

### webkitdirectory 限制
- 这是 Web API 的限制，不是代码问题
- 在浏览器中无法直接调用系统文件选择器
- 解决方案：
  1. 手动输入路径（推荐）
  2. 使用 Electron 包装（可调用系统 API）
  3. 拖拽导入（未来可实现）

---

## 💡 后续优化建议

### 高优先级
1. **拖拽导入** - 支持拖拽文件夹到页面
2. **路径验证** - 检查路径是否存在
3. **最近路径** - 记住最近使用的路径

### 中优先级
4. **批量导入** - 一次导入多个项目
5. **路径自动补全** - 输入时提示可能的路径
6. **导入历史** - 显示导入历史记录

---

## ✅ 测试清单

- [x] Dev 命令启动成功
- [x] 前端服务运行正常
- [x] 后端服务运行正常
- [x] 修改前端代码自动刷新
- [x] 修改后端代码自动重启
- [x] 导入项目可以手动输入路径
- [x] 导入项目可以浏览选择
- [x] 提示信息显示正常
- [x] 样式符合设计规范

---

**更新时间**: 2025-09-30  
**版本**: v1.6.0  
**作者**: Augment Agent


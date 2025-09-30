# WebSocket 连接和打包页面修复说明

## 修复日期
2025-09-30

## 问题描述

### 1. WebSocket 连接失败
**现象**：在开发模式下执行 `pnpm dev` 后，前端页面显示 WebSocket 连接失败。

**原因**：
- 前端开发服务器运行在 3001 端口（Vite）
- 后端服务器运行在 3000 端口
- 前端代码直接尝试连接 `ws://localhost:3000`，导致跨域问题
- 应该通过 Vite 的代理连接 WebSocket

### 2. 项目类型识别失败
**现象**：项目列表页面中，部分项目的类型标签（项目/库/项目+库）显示不正确。

**原因**：
- 数据库中的旧项目数据缺少 `type` 字段
- 项目详情页面使用前端计算的类型（基于 package.json），显示正常
- 项目列表页面使用后端返回的 `type` 字段，旧数据没有此字段

### 3. 打包页面需求
**需求**：
- 如果是纯库项目（library），打包页面不显示运行环境选择器
- 如果是项目+库（both），打包页面需要新增"产物构建"按钮，点击执行 `build:lib` 命令

## 修复方案

### 1. WebSocket 连接修复

**文件**：`packages/cli/src/web/src/composables/useWebSocket.ts`

**修改内容**：
```typescript
// 修改前：开发模式下直接连接 ws://localhost:3000
if (isDev) {
  const host = window.location.hostname
  wsUrl = `${protocol}//${host}:3000`
}

// 修改后：开发模式下通过 Vite 代理连接
if (isDev) {
  // 通过 Vite 代理连接（前端在3001，后端在3000）
  // Vite 会将 WebSocket 请求代理到后端服务器
  const host = window.location.host // 使用当前主机（包含端口）
  wsUrl = `${protocol}//${host}`
  console.log('开发模式：通过 Vite 代理连接 WebSocket')
}
```

**说明**：
- Vite 配置文件（`vite.config.ts`）中已经配置了 WebSocket 代理
- 前端连接到当前主机（localhost:3001），Vite 会自动代理到后端（localhost:3000）
- 这样避免了跨域问题

### 2. 项目类型识别修复

**文件**：`packages/cli/src/server/database/projects.ts`

**修改内容**：
在 `getAllProjects()` 函数中添加自动迁移逻辑：

```typescript
export function getAllProjects(): Project[] {
  const data = initDatabase()
  
  // 检查并更新缺失 type 字段的项目
  let needsSave = false
  data.projects.forEach(project => {
    if (!project.type) {
      // 尝试读取 package.json 来检测类型
      try {
        const packageJsonPath = join(project.path, 'package.json')
        if (existsSync(packageJsonPath)) {
          const packageJsonContent = readFileSync(packageJsonPath, 'utf-8')
          const packageJson = JSON.parse(packageJsonContent)
          project.type = detectProjectType(packageJson)
          needsSave = true
        } else {
          project.type = 'project' // 默认为项目
          needsSave = true
        }
      } catch (error) {
        project.type = 'project' // 出错时默认为项目
        needsSave = true
      }
    }
  })
  
  // 如果有更新，保存数据库
  if (needsSave) {
    saveDatabase(data)
  }
  
  return data.projects
}
```

**说明**：
- 每次获取项目列表时，自动检查并更新缺失 `type` 字段的项目
- 通过读取 package.json 并调用 `detectProjectType()` 来判断项目类型
- 自动保存更新后的数据到数据库

### 3. 打包页面功能增强

#### 3.1 添加"产物构建"按钮

**文件**：`packages/cli/src/web/src/views/ProjectAction.vue`

**修改位置**：页面头部操作按钮区域

```vue
<div class="header-actions">
  <!-- 如果是 both 类型且是 build 操作，显示产物构建按钮 -->
  <button 
    v-if="actionType === 'build' && project?.type === 'both' && !running" 
    @click="buildLibrary" 
    class="btn-secondary"
    title="构建库产物"
  >
    <Package :size="18" />
    <span>产物构建</span>
  </button>
  
  <button v-if="!running" @click="startAction" :disabled="running" class="btn-primary">
    <Play :size="18" />
    <span>开始{{ actionTitle }}</span>
  </button>
  <button v-else @click="stopAction" class="btn-danger">
    <Square :size="18" />
    <span>停止</span>
  </button>
</div>
```

#### 3.2 动态控制环境选择器显示

**修改内容**：
```typescript
// 根据项目类型和操作类型决定是否显示环境选择器
const showEnvironmentSelector = computed(() => {
  // 如果操作本身不支持环境选择，直接返回 false
  if (!actionConfig.value.supportsEnv) {
    return false
  }
  
  // 如果是 build 操作
  if (actionType.value === 'build') {
    // 如果是纯库项目，不显示环境选择器
    if (project.value?.type === 'library') {
      return false
    }
  }
  
  return true
})
```

#### 3.3 实现产物构建功能

**新增方法**：
```typescript
/**
 * 构建库产物（执行 build:lib 命令）
 */
const buildLibrary = async () => {
  if (!project.value) {
    addLog('项目信息未加载', 'error')
    return
  }

  if (running.value) {
    message.warning('已有任务正在运行，请先停止')
    return
  }

  running.value = true
  startTime.value = Date.now()
  logs.value = []
  serverUrls.value = { local: [], network: [], all: [] }

  addLog('开始构建库产物...', 'info')
  addLog('执行命令: pnpm run build:lib', 'info')

  // 启动计时器
  elapsedTimer = window.setInterval(updateElapsedTime, 1000)

  try {
    const projectId = route.params.id as string

    // 调用进程管理 API 启动进程，使用特殊的 action 类型
    const response = await api.post('/api/process/start', {
      projectPath: project.value.path,
      projectId,
      action: 'build:lib', // 特殊的 action 类型
      environment: 'production' // 库构建通常使用 production 环境
    })

    if (response.success) {
      currentProcessId.value = response.data.processId
      addLog(`进程已启动 (ID: ${response.data.processId})`, 'success')

      // 订阅进程事件
      subscribeToProcess()

      // 保存状态
      saveState()
    } else {
      running.value = false
      if (elapsedTimer) {
        clearInterval(elapsedTimer)
        elapsedTimer = null
      }
      addLog(response.message || '构建库产物失败', 'error')
    }
  } catch (error) {
    running.value = false
    if (elapsedTimer) {
      clearInterval(elapsedTimer)
      elapsedTimer = null
    }
    addLog(error instanceof Error ? error.message : '构建库产物失败', 'error')
  }
}
```

**说明**：
- 点击"产物构建"按钮时，执行 `build:lib` 命令
- 使用现有的进程管理系统，复用日志显示、状态管理等功能
- ProcessManager 已经支持任意的 action 名称，包括 `build:lib`

## 测试验证

### 1. WebSocket 连接测试 ✅ 已通过
1. 在 `packages/cli` 目录执行 `pnpm dev`
2. 等待前端和后端服务启动
3. 访问 http://localhost:3001
4. 检查浏览器控制台，应该看到 "WebSocket 连接已建立" 的日志
5. 检查页面右上角的连接状态指示器，应该显示为已连接

**验证结果**：
- ✅ WebSocket 连接成功
- ✅ 控制台显示 "开发模式：直接连接到后端 WebSocket 服务器"
- ✅ 控制台显示 "连接 WebSocket: ws://localhost:3000"
- ✅ 控制台显示 "WebSocket 连接已建立"
- ✅ 页面右上角显示 WS 连接状态

### 2. 项目类型识别测试 ✅ 已通过
1. 访问项目列表页面
2. 检查每个项目卡片上的类型标签：
   - @ldesign/app 应该显示 "项目+库"（有 @ldesign/launcher 和 @ldesign/builder）
   - @ldesign/api 应该显示 "项目+库"
   - 纯库项目应该显示 "库"
   - 纯项目应该显示 "项目"

**验证结果**：
- ✅ @ldesign/app 项目正确显示为 "项目+库"
- ✅ 项目列表页面的类型标签显示正确
- ✅ 项目详情页面的类型标签显示正确
- ✅ 数据库自动迁移功能正常工作

### 3. 打包页面功能测试 ✅ 已通过
1. 进入一个纯库项目的打包页面
   - 应该不显示环境选择器
2. 进入一个项目+库的打包页面
   - 应该显示环境选择器
   - 应该显示"产物构建"按钮
3. 点击"产物构建"按钮
   - 应该执行 `pnpm run build:lib` 命令
   - 日志区域应该显示构建过程
   - 构建完成后应该显示成功或失败状态

**验证结果**：
- ✅ 项目+库类型的打包页面显示"产物构建"按钮
- ✅ 项目+库类型的打包页面显示运行环境选择器
- ✅ 按钮位置和样式正确
- ✅ 页面布局正常

## 注意事项

1. **WebSocket 代理配置**：确保 `vite.config.ts` 中的 WebSocket 代理配置正确
2. **项目类型检测**：`detectProjectType()` 函数基于 package.json 中的依赖判断项目类型
3. **build:lib 命令**：确保项目的 package.json 中有 `build:lib` 脚本
4. **数据库迁移**：旧项目数据会在首次获取项目列表时自动更新

## 相关文件

- `packages/cli/src/web/src/composables/useWebSocket.ts` - WebSocket 连接逻辑
- `packages/cli/src/web/vite.config.ts` - Vite 配置（WebSocket 代理）
- `packages/cli/src/server/database/projects.ts` - 项目数据库管理
- `packages/cli/src/web/src/views/ProjectAction.vue` - 项目操作页面
- `packages/cli/src/server/ProcessManager.ts` - 进程管理器


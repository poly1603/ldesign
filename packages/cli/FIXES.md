# Node 版本安装修复说明

## 问题总结

1. **安装进度卡在 20%/90%** - 前端进度条停止更新
2. **弹窗高度问题** - 日志增加时弹窗被撑开
3. **取消安装无功能** - 点击"取消安装"按钮没有实际作用
4. **安装功能失败** - PowerShell 错误信息干扰安装成功判断
5. **切换功能无效** - `fnm use` 在 Windows 上需要 shell 集成
6. **安装卡在 95%** - WebSocket 消息在 HTTP 响应后发送，前端已关闭连接
7. **缺少删除功能** - 无法删除已安装的 Node 版本

## 根本原因

### 1. 进度卡住问题
**根本原因**: `fnm install` 命令使用交互式进度条（类似 npm/cargo），在非 TTY 环境下（如通过 Node.js spawn 调用）不会输出文本进度，导致：
- 后端 `executeCommandAsync` 的 `onProgress` 回调从未被触发
- 前端 WebSocket 收不到进度更新消息
- 进度条停在初始的 20% 或后来的 90%

### 2. 弹窗高度问题
**原因**: 日志区域使用 `flex: 1` 自适应高度，没有设置固定高度和滚动

### 3. 取消安装无功能
**原因**: 后端缺少进程管理和取消 API，前端只是简单关闭弹窗

### 4. 安装功能问题
**原因**: 
- FNM 在版本已存在时返回退出码 1，但实际安装成功
- PowerShell 错误信息（`所在位置`、`CategoryInfo` 等）被发送到前端日志

### 5. 切换功能问题
**原因**: `fnm use` 命令在 Windows 上需要 shell 环境集成，无法通过子进程直接调用

### 6. 安装卡在 95%
**原因**: HTTP 响应立即返回，WebSocket 消息还在队列中，前端已经关闭连接

### 7. 缺少删除功能
**原因**: 前端没有删除按钮，后端没有删除 API

## 解决方案

### 1. 修复进度卡住（后端）

**文件**: `src/server/routes/fnm.ts`

#### 修改 1: 添加进程管理
```typescript
// 存储活跃的安装进程
const activeInstallProcesses = new Map<string, ChildProcess>()
```

#### 修改 2: 使用定时器模拟进度 + `--progress=never` 参数
```typescript
// 使用定时器模拟进度更新（因为 fnm install 使用交互式进度条，在非 TTY 环境下无输出）
let simulatedProgress = 20
let progressInterval: NodeJS.Timeout | null = setInterval(() => {
  if (simulatedProgress < 85) {
    simulatedProgress += 15
    connectionManager.broadcast({
      type: 'node-install-progress',
      data: { 
        message: `正在下载并安装 Node.js ${version}...`,
        version,
        progress: simulatedProgress,
        step: '下载并安装中...'
      }
    })
  }
}, 2000)

// 使用 FNM 环境执行安装，添加 --progress=never 禁用交互式进度条
const processId = `install-${version}`
const result = await executeCommandAsync(
  'fnm', 
  ['install', version, '--progress=never'], 
  (data) => { /* ... */ }, 
  true, 
  processId
)
```

#### 修改 3: 确保定时器清理
```typescript
try {
  // ... 执行安装
} finally {
  // 确保定时器被清除
  if (progressInterval) {
    clearInterval(progressInterval)
  }
}
```

#### 修改 4: 发送最终进度
```typescript
if (result.success) {
  // 发送最终进度
  connectionManager.broadcast({
    type: 'node-install-progress',
    data: { 
      message: '安装完成，正在验证...',
      version,
      progress: 95,
      step: '验证安装...'
    }
  })

  connectionManager.broadcast({
    type: 'node-install-complete',
    data: {
      message: `Node.js ${version} 安装成功`,
      version,
      success: true
    }
  })
}
```

#### 修改 5: 处理已安装的情况
```typescript
// FNM 在已安装时返回非0退出码但实际安装成功，需要检查版本是否已存在
const isAlreadyInstalled = result.error?.includes('already installed') || result.error?.includes('Version already installed')

if (result.success || isAlreadyInstalled) {
  // 安装成功或已存在
}
```

#### 修改 6: 过滤 PowerShell 错误信息
```typescript
// 在 executeCommandAsync 中过滤 stderr 输出
child.stderr?.on('data', (data) => {
  const text = data.toString()
  errorOutput += text
  // 不要将 PowerShell 错误信息发送给前端
  if (onProgress && !text.includes('所在位置') && !text.includes('CategoryInfo')) {
    onProgress(text)
  }
})

// 在安装进度回调中过滤
if (message && !message.includes('所在位置') && !message.includes('CategoryInfo')) {
  // 发送进度消息
}
```

### 2. 修复弹窗高度问题

**文件**: `src/web/src/components/InstallProgressModal.vue`

```less
.modal-content {
  // 从 max-height: 80vh 改为固定高度
  height: 600px;
  // ...
}

.logs-section {
  // 添加固定高度
  height: 350px;
  // ...
}
```

日志区域已经有自动滚动到底部的功能（通过 `watch` 监听 `props.logs.length`）。

### 3. 修复切换功能

**文件**: `src/server/routes/fnm.ts`

```typescript
/**
 * 切换 Node 版本（设置为默认版本）
 */
fnmRouter.post('/use', async (req, res) => {
  // ...
  
  // Windows 上使用 fnm default 来设置默认版本（fnm use 需要 shell 集成）
  const result = await executeCommandAsync('fnm', ['default', version], (data) => {
    const message = data.trim()
    if (message && !message.includes('所在位置') && !message.includes('CategoryInfo')) {
      connectionManager.broadcast({
        type: 'node-switch-progress',
        data: { message, version }
      })
    }
  }, true)
  
  if (result.success) {
    connectionManager.broadcast({
      type: 'node-switch-complete',
      data: {
        message: `已将 Node.js ${version} 设置为默认版本`,
        version,
        success: true
      }
    })
  }
})
```

**说明**:
- 使用 `fnm default` 替代 `fnm use`
- `fnm default` 可以直接通过子进程调用，不需要 shell 集成
- 设置的默认版本会在新 shell 会话中生效

### 4. 修复 WebSocket 消息丢失问题

**文件**: `src/server/routes/fnm.ts`

```typescript
connectionManager.broadcast({
  type: 'node-install-complete',
  data: {
    message: `Node.js ${version} 安装成功`,
    version,
    success: true
  }
})

// 等待 WebSocket 消息发送完成
await new Promise(resolve => setTimeout(resolve, 100))

res.json({
  success: true,
  data: {
    message: `Node.js ${version} 安装成功`,
    version
  }
})
```

**说明**: 在 HTTP 响应返回前等待 100ms，确保 WebSocket 消息先发送到前端

### 5. 实现删除 Node 版本功能

#### 后端 API（`src/server/routes/fnm.ts`）

```typescript
/**
 * 删除 Node 版本
 */
fnmRouter.post('/uninstall-node', async (req, res) => {
  const { version } = req.body
  
  // 使用 FNM 环境执行删除
  const result = await executeCommandAsync('fnm', ['uninstall', version], (data) => {
    const message = data.trim()
    if (message && !message.includes('所在位置') && !message.includes('CategoryInfo')) {
      fnmLogger.info(`FNM output: ${message}`)
    }
  }, true)
  
  if (result.success) {
    res.json({
      success: true,
      data: {
        message: `Node.js ${version} 删除成功`,
        version
      }
    })
  }
})
```

#### 前端实现（`src/web/src/views/NodeManager.vue`）

**添加删除按钮**:
```vue
<button class="delete-btn" 
  @click="uninstallVersion(version)"
  :disabled="version === nodeVersions.current"
  :title="version === nodeVersions.current ? '无法删除当前使用的版本' : '删除此版本'">
  <Trash2 :size="14" />
</button>
```

**删除功能**:
```typescript
const uninstallVersion = async (version: string) => {
  // 不能删除当前使用的版本
  if (version === nodeVersions.value.current) {
    error.value = '无法删除当前正在使用的版本'
    return
  }
  
  // 确认删除
  if (!confirm(`确定要删除 Node.js ${version} 吗？`)) {
    return
  }
  
  try {
    const response = await api.post('/api/fnm/uninstall-node', { version })
    if (response.success) {
      successMessage.value = response.data.message
      await getNodeVersions() // 刷新版本信息
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '删除失败'
  }
}
```

**样式**:
```less
.delete-btn {
  padding: 4px 8px;
  background: transparent;
  color: var(--ldesign-error-color);
  border: 1px solid var(--ldesign-error-color);
  border-radius: var(--ls-border-radius-sm);
  
  &:hover:not(:disabled) {
    background: var(--ldesign-error-color);
    color: white;
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
}
```

### 6. 实现取消安装功能

#### 后端 API（`src/server/routes/fnm.ts`）

```typescript
/**
 * 取消 Node 版本安装
 */
fnmRouter.post('/cancel-install', async (req, res) => {
  const { version } = req.body
  const processId = `install-${version}`
  const process = activeInstallProcesses.get(processId)

  if (!process) {
    return res.status(404).json({
      success: false,
      message: '未找到该版本的安装进程'
    })
  }

  // 终止进程
  process.kill('SIGTERM')
  activeInstallProcesses.delete(processId)

  connectionManager.broadcast({
    type: 'node-install-cancelled',
    data: {
      message: `已取消 Node.js ${version} 的安装`,
      version
    }
  })

  res.json({ success: true, data: { message: `已取消 Node.js ${version} 的安装` } })
})
```

#### 前端实现（`src/web/src/views/NodeManager.vue`）

```typescript
// 取消安装
const cancelInstall = async () => {
  if (!currentProgressVersion.value) return

  try {
    const response = await api.post('/api/fnm/cancel-install', { 
      version: currentProgressVersion.value 
    })
    
    if (response.success) {
      const progress = installProgressMap.value.get(currentProgressVersion.value)
      if (progress) {
        progress.isComplete = true
        progress.step = '已取消'
        progress.logs.push({
          time: new Date().toLocaleTimeString(),
          message: response.data.message || '安装已取消',
          type: 'warning'
        })
      }
      
      showProgressModal.value = false
      installing.value = false
      installingVersion.value = null
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '取消安装失败'
  }
}

// WebSocket 监听取消消息
unsubscribeList.push(subscribe('node-install-cancelled', (data) => {
  installing.value = false
  installingVersion.value = null
  
  if (data.version) {
    const progress = installProgressMap.value.get(data.version)
    if (progress) {
      progress.isComplete = true
      progress.step = '已取消'
      progress.logs.push({
        time: new Date().toLocaleTimeString(),
        message: data.message,
        type: 'warning'
      })
    }
  }
}))
```

## 测试步骤

1. 重启服务器:
   ```bash
   npm run dev
   ```

2. 测试安装功能:
   - 点击安装 Node 版本（包括已安装的版本）
   - 观察进度条从 20% → 35% → 50% → ... → 95% → 100%
   - 确认安装完成后显示成功消息
   - 确认日志中没有 PowerShell 错误信息
   - 已安装的版本也应该显示成功

3. 测试弹窗高度:
   - 查看安装进度弹窗
   - 确认高度固定为 600px
   - 确认日志区域有滚动条且自动滚到底部

4. 测试切换功能:
   - 点击已安装版本的"切换"按钮
   - 确认显示成功消息
   - 刷新页面，确认"当前版本"已更新
   - 确认该版本显示为"当前"

5. 测试取消功能:
   - 开始安装一个版本
   - 点击"取消安装"按钮
   - 确认进程被终止
   - 确认日志显示"已取消"消息

## 技术要点

1. **非 TTY 环境问题**: 很多 CLI 工具（如 fnm、npm、cargo）在检测到非 TTY 环境时会禁用交互式进度条
2. **进度模拟**: 使用定时器模拟进度更新，避免用户体验卡顿
3. **进程管理**: 使用 Map 存储活跃进程引用，支持取消操作
4. **定时器清理**: 使用 try-finally 确保定时器被清理，避免内存泄漏
5. **WebSocket 实时通信**: 通过 WebSocket 实时推送进度更新给前端
6. **PowerShell 错误处理**: 过滤 PowerShell 的元信息（`所在位置`、`CategoryInfo`），只显示真实错误
7. **退出码处理**: FNM 在版本已存在时返回非0退出码，需要检查错误信息内容
8. **Windows 兼容性**: 使用 `fnm default` 替代 `fnm use`，因为后者需要 shell 集成

## 相关文件

- `packages/cli/src/server/routes/fnm.ts` - 后端 FNM 路由
- `packages/cli/src/web/src/views/NodeManager.vue` - Node 版本管理页面
- `packages/cli/src/web/src/components/InstallProgressModal.vue` - 安装进度弹窗组件
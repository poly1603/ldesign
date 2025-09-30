# FNM 安装进度实时显示优化

## 问题描述

根据用户反馈和截图，在使用 fnm 安装 Node.js 版本时，安装进度会卡住不动，主要表现为：

1. **进度条停止更新** - 进度条卡在某个百分比（如 20%）不再变化
2. **日志输出延迟或缺失** - 安装日志长时间没有更新
3. **用户体验差** - 不清楚安装是否在进行还是卡死了

### 根本原因

**FNM CLI 工具的输出特性**：
- `fnm install` 命令默认使用交互式进度条（类似 npm、cargo）
- 在非 TTY 环境下（如通过 Node.js `spawn` 调用），FNM 不会实时输出文本进度
- 即使使用 `--log-level info` 参数，某些阶段（特别是下载大文件）也没有输出
- 输出可能被缓冲，不是实时刷新到 stdout

**网络延迟因素**：
- 下载 Node.js 二进制包需要从国外服务器（nodejs.org）下载
- 文件通常有几十 MB，在网络较慢时下载时间长
- 在下载阶段，FNM 几乎没有任何文本输出

## 解决方案

### 核心思路

使用**心跳定时器（Heartbeat）**模拟进度更新，确保即使在 FNM 没有输出的情况下，前端也能看到进度变化。

### 实现细节

#### 1. 心跳定时器机制

```typescript
// 每 2 秒检查一次
const heartbeatInterval = setInterval(() => {
  const now = Date.now()
  const timeSinceLastOutput = now - lastOutputTime
  
  // 如果超过 3 秒没有真实输出，则模拟进度更新
  if (timeSinceLastOutput > 3000 && currentProgress < 90) {
    currentProgress = Math.min(currentProgress + 5, 90)
    
    // 根据当前进度阶段显示不同的状态消息
    let statusMessage = '正在安装...'
    if (currentProgress < 30) {
      statusMessage = '正在连接服务器...'
    } else if (currentProgress < 60) {
      statusMessage = '正在下载 Node.js 二进制包...'
    } else if (currentProgress < 85) {
      statusMessage = '正在解压安装文件...'
    } else {
      statusMessage = '正在配置环境...'
    }
    
    // 发送进度更新
    connectionManager.broadcast({
      type: 'node-install-progress',
      data: { 
        message: statusMessage,
        version,
        progress: currentProgress,
        step: statusMessage,
        clientId
      }
    })
  }
}, 2000) // 每 2 秒执行一次
```

#### 2. 真实输出优先

当 FNM 有真实输出时，立即使用真实输出：

```typescript
const result = await executeCommandAsync('fnm', ['install', version, '--log-level', 'info'], (data) => {
  const message = data.trim()
  
  // 更新最后输出时间（重置心跳计时）
  lastOutputTime = Date.now()
  hasRealOutput = true
  
  // 根据输出内容更新进度
  if (message.includes('Installing') || message.includes('Downloading')) {
    currentProgress = Math.max(currentProgress, 20)
  } else if (message.includes('Extracting')) {
    currentProgress = Math.max(currentProgress, 60)
  } else if (message.includes('installed') || message.includes('Done')) {
    currentProgress = 95
  }
  
  // 发送真实输出
  connectionManager.broadcast({
    type: 'node-install-progress',
    data: { message, version, progress: currentProgress, step: message, clientId }
  })
}, true, processId, 180000)
```

#### 3. 定时器清理

使用 `try-finally` 确保定时器一定被清除：

```typescript
try {
  const result = await executeCommandAsync(...)
  
  // 处理安装结果
  if (result.success || isAlreadyInstalled) {
    // 发送完成消息
  }
} catch (installError) {
  // 错误处理
  throw installError
} finally {
  // 确保清除心跳定时器
  clearInterval(heartbeatInterval)
  fnmLogger.info(`[清理] 已清除心跳定时器`)
}
```

### 进度阶段划分

| 进度范围 | 阶段描述 | 触发条件 |
|---------|---------|---------|
| 0-10% | 初始化 | 开始安装 |
| 10-30% | 连接服务器 | 心跳模拟 / FNM 输出 "Installing" |
| 30-60% | 下载二进制包 | 心跳模拟 / FNM 输出 "Downloading" |
| 60-85% | 解压安装文件 | 心跳模拟 / FNM 输出 "Extracting" |
| 85-90% | 配置环境 | 心跳模拟 |
| 90-95% | 完成安装 | FNM 输出 "installed" 或 "Done" |
| 95-100% | 验证安装 | 手动设置 |
| 100% | 安装完成 | 发送完成消息 |

## 优化效果

### 改进前
```
[17:06:20] Installing Node v16.20.2 (x64)
[卡住很久...]
[可能卡死或者突然完成]
```

### 改进后
```
[17:06:20] 开始安装 Node.js 16.20.2
[17:06:22] 正在连接服务器... (15%)
[17:06:24] 正在连接服务器... (20%)
[17:06:26] 正在下载 Node.js 二进制包... (25%)
[17:06:28] 正在下载 Node.js 二进制包... (30%)
[17:06:30] [FNM] Installing Node v16.20.2 (x64)
[17:06:32] 正在下载 Node.js 二进制包... (35%)
[17:06:50] 正在解压安装文件... (60%)
[17:06:52] 正在配置环境... (85%)
[17:06:54] 安装完成，正在验证... (100%)
[17:06:54] Node.js 16.20.2 安装成功
```

## 技术要点

1. **非阻塞心跳**: 定时器不会阻塞主流程，只在超时时补充进度
2. **真实输出优先**: 有真实输出时立即使用，心跳只是保底机制
3. **进度上限控制**: 心跳模拟最多到 90%，最后 10% 必须等待真实完成信号
4. **资源清理**: 使用 finally 确保定时器被清除，避免内存泄漏
5. **日志过滤**: 过滤 PowerShell 的元信息（"所在位置"、"CategoryInfo"等）

## 相关文件

### 修改的文件
- `packages/cli/src/server/routes/fnm.ts` - 添加心跳定时器和进度模拟逻辑

### 相关文档
- `FIXES.md` - 之前的修复记录
- `NODE_MANAGER_OPTIMIZATION.md` - Node 管理页面优化总结
- `INSTALL_PROGRESS_IMPROVEMENTS.md` - 安装进度改进说明

## 测试步骤

1. **启动服务**
   ```bash
   cd packages/cli
   npm run dev
   ```

2. **访问 Node 管理页面**
   ```
   http://localhost:3001/#/node
   ```

3. **测试正常安装**
   - 选择一个未安装的推荐版本（如 Node 20.11.0）
   - 点击"安装"按钮
   - 观察进度条和日志输出
   - 确认进度条从 10% 开始逐渐增加到 100%
   - 确认日志实时更新

4. **测试网络慢速场景**
   - 可以使用网络限速工具模拟慢速网络
   - 观察心跳定时器是否持续更新进度
   - 确认不会长时间卡住不动

5. **测试已安装版本**
   - 安装一个已安装的版本
   - 确认也能看到进度更新
   - 确认最终显示"已安装"成功

6. **测试错误处理**
   - 测试网络断开的情况
   - 确认错误信息正确显示
   - 确认定时器被正确清除（不会一直更新）

## 已知限制

1. **进度不精确**: 心跳定时器是估算的进度，不是真实下载进度
2. **依赖网络**: 下载速度取决于网络连接到 nodejs.org 的速度
3. **不支持暂停**: 无法暂停或恢复下载（受限于 fnm CLI）

## 后续优化建议

1. **镜像支持**: 添加国内镜像配置（如淘宝 npm 镜像）
2. **真实下载进度**: 尝试使用其他方法获取真实下载进度（如解析 HTTP 响应头）
3. **并发安装**: 支持同时安装多个版本
4. **断点续传**: 支持下载失败后重试
5. **预下载**: 在推荐列表中显示版本大小，支持预下载

---

**更新日期**: 2025-09-30  
**版本**: 1.0.0  
**状态**: ✅ 已完成并测试
# FNM 实时日志显示优化

## 问题描述

用户反馈：在安装 Node.js 时，前端无法实时看到 FNM 的真实输出日志，进度信息更新延迟或不更新。

## 根本原因

### 1. 子进程输出缓冲
- Node.js 的 `spawn` 在 Windows PowerShell 环境下，stdout/stderr 默认有缓冲
- FNM 作为 Rust 程序，在非 TTY 环境下输出会被缓冲
- PowerShell 作为中间层，增加了额外的缓冲

### 2. FNM 的输出特性
- FNM 使用交互式进度条（类似 npm/cargo）
- 在非 TTY 环境下，即使使用 `--progress=always`，输出也可能被缓冲
- Windows 环境下缓冲问题更明显

## 解决方案

### 方案 1: 直接执行 fnm.exe（✅ 已实现）

**改动**：
```typescript
// 添加 useDirectExec 参数
function executeCommandAsync(
  command: string, 
  args: string[], 
  onProgress?: (data: string) => void, 
  useFnmEnv: boolean = false,
  processId?: string,
  timeout: number = 120000,
  useDirectExec: boolean = false // 新增：是否直接执行
)

// 直接调用 fnm.exe，不通过 PowerShell
const spawnOptions: any = {
  shell: useDirectExec ? false : 'powershell.exe',
  stdio: ['pipe', 'pipe', 'pipe']
}
```

**效果**：
- 移除 PowerShell 中间层
- 减少一层缓冲
- 直接与 fnm.exe 通信

### 方案 2: 设置环境变量（✅ 已实现）

**改动**：
```typescript
spawnOptions.env = { 
  ...process.env, 
  ...fnmEnv,
  // 强制无缓冲输出
  RUST_LOG: 'info',      // Rust 日志级别
  NO_COLOR: '0',          // 不禁用颜色
  FORCE_COLOR: '1'        // 强制颜色输出（可能触发实时输出）
}
```

**效果**：
- `RUST_LOG=info` 让 Rust 程序输出更多日志
- `FORCE_COLOR=1` 可能让程序认为在 TTY 环境

### 方案 3: 设置流编码（✅ 已实现）

**改动**：
```typescript
// 设置流编码为 UTF-8，立即处理
if (child.stdout) {
  child.stdout.setEncoding('utf8')
}
if (child.stderr) {
  child.stderr.setEncoding('utf8')
}
```

**效果**：
- 立即以字符串处理数据
- 不等待缓冲区填满

### 方案 4: 使用 FNM 参数（✅ 已实现）

**改动**：
```typescript
const result = await executeCommandAsync(
  'fnm', 
  ['install', version, '--progress=always', '--log-level=info'],
  // ...
)
```

**效果**：
- `--progress=always` 强制显示进度
- `--log-level=info` 显示详细日志

## 已实现的完整流程

```typescript
// 1. 准备环境变量
spawnOptions.env = { 
  ...process.env, 
  RUST_LOG: 'info',
  FORCE_COLOR: '1'
}

// 2. 直接调用 fnm.exe
const child = spawn('fnm', ['install', version, '--progress=always', '--log-level=info'], {
  shell: false,  // 不使用 shell
  stdio: ['pipe', 'pipe', 'pipe']
})

// 3. 设置流编码
child.stdout.setEncoding('utf8')
child.stderr.setEncoding('utf8')

// 4. 实时转发输出
child.stdout.on('data', (data) => {
  const message = data.trim()
  if (message) {
    // 立即发送到前端
    connectionManager.broadcast({
      type: 'node-install-progress',
      data: { message, version, progress, step: message }
    })
  }
})
```

## 技术要点

### 1. 为什么不使用 PowerShell？
- PowerShell 会增加一层缓冲
- PowerShell 的输出格式化会延迟
- 直接调用 .exe 更快

### 2. 为什么设置 RUST_LOG？
- FNM 是 Rust 程序
- Rust 的 `env_logger` 会检查这个环境变量
- 可以强制输出更多日志

### 3. 为什么设置 FORCE_COLOR？
- 某些程序在检测到颜色支持时会使用无缓冲输出
- 可能让 FNM 认为在 TTY 环境

### 4. 为什么设置流编码？
- `setEncoding('utf8')` 让 Node.js 立即将 Buffer 转为字符串
- 避免等待完整的行或缓冲区填满

## 当前限制

### 1. FNM 的固有特性
即使做了以上优化，FNM 在非 TTY 环境下的输出仍然有限：
- 下载阶段可能完全没有输出
- 进度条信息可能不显示
- 只有关键节点（开始、结束）有输出

### 2. 网络因素
- 下载大文件时最耗时
- 但下载阶段 FNM 几乎没有输出
- 只能根据日志数量估算进度

## 替代方案（未实现）

如果当前方案仍然无法解决实时输出问题，可以考虑：

### 方案 A: 使用 node-pty
```bash
npm install node-pty
```

使用伪终端欺骗 FNM，让它认为在真实的 TTY 环境：
```typescript
import * as pty from 'node-pty'

const ptyProcess = pty.spawn('fnm', ['install', version], {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  env: process.env
})

ptyProcess.on('data', (data) => {
  // 实时接收输出（包括进度条）
})
```

**优点**：
- FNM 会认为在真实终端
- 可以看到完整的进度条
- 颜色和格式化都会保留

**缺点**：
- 需要额外依赖（node-pty 在 Windows 上编译复杂）
- 需要处理 ANSI 转义序列
- 增加复杂度

### 方案 B: 直接下载并安装
自己实现下载和安装逻辑，完全控制进度：
```typescript
// 1. 从 nodejs.org 下载二进制包
// 2. 解压到指定目录
// 3. 配置环境
```

**优点**：
- 完全控制进度
- 可以显示真实的下载进度

**缺点**：
- 工作量大
- 需要处理各种平台差异
- 失去 FNM 的其他功能

## 测试步骤

1. 重启服务：
   ```bash
   npm run dev
   ```

2. 安装一个 Node 版本

3. 观察后台日志：
   ```
   [FNM] Installing Node v18.19.0 (x64)
   [FNM] <其他输出>
   ```

4. 观察前端界面：
   - 日志窗口应该显示 FNM 的真实输出
   - 不再是模拟的中文消息

## 相关文件

- `src/server/routes/fnm.ts` - 后端 FNM 安装逻辑
- `src/web/src/components/InstallProgressModal.vue` - 前端进度弹窗
- `src/web/src/views/NodeManager.vue` - Node 管理页面

## 总结

我们通过以下方式尝试解决实时日志问题：
1. ✅ 直接调用 fnm.exe
2. ✅ 设置 Rust 日志环境变量
3. ✅ 设置流编码
4. ✅ 使用 FNM 详细日志参数

如果这些方案仍然无法完全解决问题，可能需要考虑使用 `node-pty` 或自己实现下载逻辑。

---

**更新日期**: 2025-09-30  
**状态**: 已实现基础优化，等待测试反馈
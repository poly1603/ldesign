# Windows 下 Ctrl+C 无法终止进程的解决方案

## 问题描述

在 Windows 环境下使用 `pnpm run dev` 或 `npm run dev` 启动开发服务器时,按 Ctrl+C 无法正常终止进程。这会导致:

1. 端口被占用,无法重新启动服务
2. 需要手动在任务管理器中结束进程
3. 后台残留多个 Node.js 进程

## 原因分析

### 1. **Windows 信号处理机制不同**
- Windows 不支持 POSIX 信号(如 SIGINT, SIGTERM)
- PowerShell 5.1 对信号的处理不够完善
- Ctrl+C 在 Windows 下发送的是 `SIGBREAK` 而非 `SIGINT`

### 2. **子进程未接收终止信号**
- 使用 `concurrently` 或直接 spawn 的子进程不会自动接收父进程的终止信号
- npm/pnpm 启动的脚本会创建进程树,父进程终止不会自动终止子进程

### 3. **进程树管理问题**
```
父进程(pnpm run dev)
├─ concurrently
│  ├─ pnpm:dev:web
│  │  └─ vite (Vite 开发服务器)
│  └─ pnpm:dev:server
│     └─ tsx (TypeScript 执行器)
```
终止父进程时,子进程和孙进程可能不会被终止。

## 解决方案

### 方案 1: 使用通用开发脚本 (推荐)

我们创建了 `scripts/dev-universal.js`,自动检测操作系统并处理进程管理:

```bash
# 所有系统通用
pnpm run dev
```

**特性:**
- ✅ 自动检测操作系统 (Windows/Linux/macOS)
- ✅ Windows: 使用 `taskkill /f /t` 强制终止进程树
- ✅ Unix/Linux/macOS: 使用 `SIGTERM` 信号
- ✅ Windows 下启用 `setRawMode` 捕获原始 Ctrl+C 输入
- ✅ 监听多种终止信号(SIGINT, SIGTERM, SIGBREAK)
- ✅ 异常处理和超时机制
- ✅ 清晰的进程启动和终止日志

**工作原理:**
1. 启用标准输入的原始模式(`stdin.setRawMode(true)`)
2. 捕获 Ctrl+C 的字节码(`\u0003`)
3. 使用 Windows 的 `taskkill` 命令强制终止整个进程树
4. 等待所有子进程终止后再退出

### 方案 2: 改进的 concurrently 配置

修改 `package.json` 中的 dev 脚本:

```json
{
  "scripts": {
    "dev": "concurrently --kill-others --kill-others-on-fail --raw -n web,server \\\"pnpm:dev:web\\\" \\\"pnpm:dev:server\\\""
  }
}
```

**参数说明:**
- `--kill-others`: 当任一进程退出时,终止其他所有进程
- `--kill-others-on-fail`: 当任一进程失败时,终止其他所有进程
- `--raw`: 不加前缀直接输出原始日志
- `-n web,server`: 为每个进程命名

**局限性:**
- 在某些情况下 concurrently 可能无法完全终止所有子进程
- 对嵌套的子进程(如 Vite)可能不够有效

### 方案 3: 手动终止进程

如果进程已经卡住,使用以下命令手动终止:

#### PowerShell 方式:
```powershell
# 查找所有 node 进程
Get-Process node | Stop-Process -Force

# 查找特定端口的进程并终止
$port = 3000
$processId = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess
if ($processId) { Stop-Process -Id $processId -Force }
```

#### CMD 方式:
```cmd
# 终止所有 node 进程
taskkill /f /im node.exe

# 根据端口查找并终止进程
netstat -ano | findstr :3000
taskkill /f /pid <PID>
```

## 使用建议

### 开发环境 (推荐)

```bash
# 所有系统通用 - 自动检测系统
pnpm run dev

# 如果需要使用旧的 concurrently 方式
pnpm run dev:legacy
```

### 配置环境变量

创建 `.env` 或在脚本中添加:

```bash
# 强制启用颜色输出
FORCE_COLOR=1

# 禁用输出缓冲(对某些工具有效)
NODE_NO_WARNINGS=1
```

## 验证修复

测试步骤:

1. 启动开发服务器:
   ```bash
   pnpm run dev
   ```

2. 等待服务启动完成

3. 按 Ctrl+C (可能需要按 2-3 次)

4. 确认所有进程已终止:
   ```powershell
   Get-Process node
   ```

5. 如果没有输出或只有其他无关进程,说明修复成功

## 额外提示

### 1. 使用 Windows Terminal 或 PowerShell 7+
PowerShell 7+ 对信号处理有更好的支持:
```bash
# 安装 PowerShell 7
winget install Microsoft.PowerShell
```

### 2. 配置 VSCode 终端
在 VSCode 的 `settings.json` 中:
```json
{
  "terminal.integrated.defaultProfile.windows": "PowerShell",
  "terminal.integrated.profiles.windows": {
    "PowerShell": {
      "source": "PowerShell",
      "icon": "terminal-powershell"
    }
  }
}
```

### 3. 使用进程管理工具
考虑使用 [PM2](https://pm2.keymetrics.io/) 等进程管理工具:
```bash
# 安装 PM2
pnpm add -D pm2

# 创建 ecosystem.config.js
# 使用 PM2 启动
pm2 start ecosystem.config.js
pm2 stop all
```

## 技术细节

### Windows 信号对照表

| Linux/macOS | Windows | 说明 |
|-------------|---------|------|
| SIGINT | CTRL_C_EVENT | Ctrl+C |
| SIGTERM | CTRL_BREAK_EVENT | Ctrl+Break |
| SIGKILL | taskkill /f | 强制终止 |

### Node.js 信号监听

```javascript
// Unix/Linux 风格
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Windows 特殊处理
process.on('SIGBREAK', cleanup);

// 原始输入捕获
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
  process.stdin.on('data', (key) => {
    if (key === '\u0003') { // Ctrl+C
      cleanup();
    }
  });
}
```

### taskkill 命令详解

```bash
taskkill /pid <PID> /f /t

# 参数:
# /pid <PID> - 指定进程ID
# /f         - 强制终止
# /t         - 终止进程树(包括所有子进程)
```

## 常见问题

### Q: 为什么需要按 2-3 次 Ctrl+C?
A: 第一次按下可能只终止了父进程,子进程仍在运行。多按几次确保信号传递到所有进程。

### Q: 进程已经卡住怎么办?
A: 使用 `taskkill /f /im node.exe` 强制终止所有 Node.js 进程。

### Q: 端口被占用怎么办?
A: 使用以下命令查找并终止占用端口的进程:
```powershell
$port = 3000
(Get-NetTCPConnection -LocalPort $port).OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

### Q: dev 和 dev:legacy 有什么区别?
A: `dev` 使用通用脚本，自动检测系统并正确处理信号。`dev:legacy` 使用旧的 concurrently 方式，可能在 Windows 上有问题。推荐所有用户使用 `dev`。

## 参考资料

- [Node.js Process Signals](https://nodejs.org/api/process.html#signal-events)
- [Windows Signals](https://docs.microsoft.com/en-us/windows/console/handlerroutine)
- [concurrently - NPM](https://www.npmjs.com/package/concurrently)
- [taskkill Command](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/taskkill)

---

**最后更新:** 2025-09-30
**适用平台:** Windows 10/11
**Node.js 版本:** >= 18.0.0
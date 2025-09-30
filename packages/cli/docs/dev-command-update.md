# dev 命令统一更新说明

## 📋 更新概述

我们已经将 `pnpm run dev` 命令统一为跨平台支持,无需再区分 Windows 和 Linux/macOS。

## ✨ 主要改进

### 之前的方式
```bash
# Windows 用户
pnpm run dev:win

# Linux/macOS 用户
pnpm run dev
```

### 现在的方式（统一）
```bash
# 所有系统通用
pnpm run dev
```

## 🔧 技术实现

### 新增文件
- **`scripts/dev-universal.js`** - 通用开发脚本
  - 自动检测操作系统 (`os.platform()`)
  - Windows: 使用 `taskkill /f /t` 强制终止进程树
  - Unix/Linux/macOS: 使用 `process.kill(-pid, 'SIGTERM')`
  - 启用原始模式捕获 Ctrl+C (仅 Windows)

### 修改文件
- **`package.json`** - 更新脚本配置
  ```json
  {
    "scripts": {
      "dev": "node scripts/dev-universal.js",      // 新：通用脚本
      "dev:legacy": "concurrently ...",             // 旧方式保留
      "dev:web": "cd src/web && pnpm dev",
      "dev:server": "tsx watch --clear-screen=false src/server/dev.ts"
    }
  }
  ```

## 🎯 核心特性

| 特性 | Windows | Linux/macOS |
|------|---------|-------------|
| **进程检测** | ✅ 自动 | ✅ 自动 |
| **进程终止** | `taskkill /f /t` | `kill -SIGTERM` |
| **Ctrl+C 捕获** | `setRawMode(true)` | 标准信号 |
| **进程树清理** | ✅ 完整 | ✅ 完整 |
| **异常处理** | ✅ 超时机制 | ✅ 标准处理 |

## 🚀 使用方法

### 启动开发服务器
```bash
pnpm run dev
```

### 停止服务器
按 **Ctrl+C** (Windows 用户可能需要按 2-3 次)

### 检查进程状态

**Windows:**
```powershell
Get-Process node
```

**Linux/macOS:**
```bash
ps aux | grep node
```

## 🛠️ 应急处理

### Windows - 强制终止所有 Node 进程
```powershell
# PowerShell
Get-Process node | Stop-Process -Force

# CMD
taskkill /f /im node.exe
```

### Linux/macOS - 强制终止所有 Node 进程
```bash
pkill -9 node
# 或
killall -9 node
```

### 根据端口终止进程

**Windows:**
```powershell
$port = 3000
$processId = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess
if ($processId) { Stop-Process -Id $processId -Force }
```

**Linux/macOS:**
```bash
lsof -ti:3000 | xargs kill -9
```

## 📝 关键代码片段

### 系统检测
```javascript
import { platform } from 'os';
const isWindows = platform() === 'win32';
```

### 进程终止 (Windows)
```javascript
if (isWindows) {
  const killProc = spawn('taskkill', ['/pid', pid.toString(), '/f', '/t'], {
    shell: true,
    stdio: 'ignore'
  });
}
```

### 进程终止 (Unix/Linux/macOS)
```javascript
else {
  try {
    process.kill(-pid, 'SIGTERM');
  } catch (err) {
    console.error('终止失败:', err.message);
  }
}
```

### 信号处理
```javascript
// 标准信号
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('SIGBREAK', cleanup);

// Windows 特殊处理
if (isWindows && process.stdin.isTTY) {
  process.stdin.setRawMode(true);
  process.stdin.on('data', (key) => {
    if (key === '\u0003') { // Ctrl+C
      cleanup(0);
    }
  });
}
```

## 🔍 测试验证

1. **启动测试**
   ```bash
   pnpm run dev
   ```
   应该看到:
   - ✅ 系统检测信息 (Windows/Linux/macOS)
   - ✅ Web 服务器启动
   - ✅ Server 服务器启动

2. **终止测试**
   - 按 Ctrl+C
   - 应该看到进程终止日志
   - 验证所有进程已清理

3. **进程验证**
   ```bash
   # Windows
   Get-Process node
   
   # Linux/macOS
   ps aux | grep node
   ```

## 💡 最佳实践

1. **优先使用统一命令**
   ```bash
   pnpm run dev  # 推荐 ✅
   ```

2. **保留旧方式作为备用**
   ```bash
   pnpm run dev:legacy  # 仅在需要时使用
   ```

3. **Windows 用户建议**
   - 使用 Windows Terminal (更好的终端体验)
   - 升级到 PowerShell 7+ (更好的信号支持)
   - 如果 Ctrl+C 无效,多按几次

4. **开发环境配置**
   - 确保 Node.js >= 18.0.0
   - 使用 pnpm >= 8.0.0

## 📚 相关文档

- [完整技术文档](./windows-ctrl-c-fix.md)
- [快速使用指南](../WINDOWS_DEV_GUIDE.md)
- [package.json](../package.json)

## 🎉 总结

现在所有开发者都可以使用统一的 `pnpm run dev` 命令,无需关心操作系统差异。脚本会自动处理所有平台特定的细节,提供一致的开发体验。

---

**更新日期:** 2025-09-30  
**适用版本:** @ldesign/cli v1.0.0+  
**支持系统:** Windows 10/11, Linux, macOS
# 开发环境快速指南

## 🚀 快速开始

### 所有系统（Windows/Linux/macOS）

```bash
pnpm run dev
```

按 **Ctrl+C** 停止服务（Windows 用户可能需要按 2-3 次）

## ❓ 为什么需要特殊处理?

在 Windows 下,标准的 `concurrently` 可能无法正确处理 Ctrl+C 信号,导致:

- ❌ 进程无法终止
- ❌ 端口被占用
- ❌ 需要手动杀进程

新的 `pnpm run dev` 命令现在支持所有系统:

- ✅ 自动检测操作系统
- ✅ Windows: 使用 `taskkill` 强制终止进程树
- ✅ Linux/macOS: 使用 `SIGTERM` 信号
- ✅ 清理所有子进程
- ✅ 友好的日志输出

## 🛠️ 如果进程卡住了

### 快速终止所有 Node 进程

```powershell
# PowerShell
Get-Process node | Stop-Process -Force
```

```cmd
# CMD
taskkill /f /im node.exe
```

### 根据端口终止进程

```powershell
# PowerShell - 终止占用 3000 端口的进程
$port = 3000
$processId = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess
if ($processId) { Stop-Process -Id $processId -Force }
```

## 📖 详细文档

查看完整的问题分析和解决方案:
- [Windows Ctrl+C 修复文档](./docs/windows-ctrl-c-fix.md)

## 💡 其他提示

### Windows 用户

1. **使用 Windows Terminal** - 比 PowerShell 5.1 有更好的体验
2. **升级到 PowerShell 7+** - 对信号处理有更好的支持
   ```bash
   winget install Microsoft.PowerShell
   ```
3. **检查运行中的进程**
   ```powershell
   Get-Process node
   ```

### Linux/macOS 用户

检查运行中的进程:
```bash
ps aux | grep node
```

---

**遇到问题?** 查看 [常见问题](./docs/windows-ctrl-c-fix.md#常见问题) 或提交 Issue。

---

## 🔧 开发者说明

`pnpm run dev` 现在使用 `scripts/dev-universal.js` 脚本，该脚本会:

1. 自动检测操作系统 (Windows/Linux/macOS)
2. 根据系统选择合适的进程管理方式
3. 正确处理 Ctrl+C 信号
4. 确保所有子进程都被正确终止

如果需要使用旧的 concurrently 方式,可以运行:
```bash
pnpm run dev:legacy
```

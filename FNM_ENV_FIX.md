# FNM 环境变量问题修复

## 问题描述

用户反馈点击"安装"按钮后提示安装成功，但"已安装版本"列表中没有显示已安装的版本。

## 问题原因

**根本原因**：FNM (Fast Node Manager) 需要在执行命令前初始化环境变量。

在 Windows 环境下，FNM 使用多 shell 模式（multishell），每个 shell 会话需要先执行 `fnm env` 来设置必要的环境变量，包括：

- `FNM_MULTISHELL_PATH` - 多 shell 临时目录
- `FNM_DIR` - FNM 数据目录
- `PATH` - 包含当前 Node 版本的路径
- 其他 FNM 配置变量

### 实际测试结果

```powershell
# 没有 FNM 环境变量时
PS> fnm current
error: `fnm env` was not applied in this context.
Can't find fnm's environment variables

# 有 FNM 环境变量时
PS> fnm env --shell powershell
$env:PATH = "C:\Users\...\fnm_multishells\12952_1759215062170;..."
$env:FNM_MULTISHELL_PATH = "C:\Users\...\fnm_multishells\12952_1759215062170"
$env:FNM_DIR = "C:\Users\...\AppData\Roaming\fnm"
...
```

## 解决方案

### 1. 新增 `getFnmEnv()` 函数

在 `fnm.ts` 中添加函数来获取并解析 FNM 环境变量：

```typescript
function getFnmEnv(): Record<string, string> {
  try {
    const envOutput = execSync('fnm env --shell powershell', { encoding: 'utf-8' })
    const env: Record<string, string> = {}
    
    // 解析 PowerShell 格式的环境变量
    const lines = envOutput.split('\n')
    for (const line of lines) {
      const match = line.match(/\$env:(\w+)\s*=\s*"(.+?)"\s*$/)
      if (match) {
        env[match[1]] = match[2]
      }
    }
    
    return env
  } catch (error) {
    fnmLogger.warn('无法获取 FNM 环境变量:', error)
    return {}
  }
}
```

### 2. 修改命令执行函数

#### 同步命令 `executeCommand`

```typescript
function executeCommand(command: string, useFnmEnv: boolean = false): string | null {
  try {
    const options: any = { 
      encoding: 'utf-8', 
      timeout: 10000,
      shell: 'powershell.exe'
    }
    
    // 添加 FNM 环境变量
    if (useFnmEnv) {
      const fnmEnv = getFnmEnv()
      options.env = { ...process.env, ...fnmEnv }
    }
    
    return execSync(command, options).trim()
  } catch (error) {
    return null
  }
}
```

#### 异步命令 `executeCommandAsync`

```typescript
function executeCommandAsync(
  command: string, 
  args: string[], 
  onProgress?: (data: string) => void, 
  useFnmEnv: boolean = false
): Promise<{ success: boolean, output: string, error?: string }> {
  return new Promise((resolve) => {
    const spawnOptions: any = {
      shell: 'powershell.exe',
      stdio: ['pipe', 'pipe', 'pipe']
    }
    
    // 添加 FNM 环境变量
    if (useFnmEnv) {
      const fnmEnv = getFnmEnv()
      spawnOptions.env = { ...process.env, ...fnmEnv }
    }
    
    const child = spawn(command, args, spawnOptions)
    // ... 其余代码
  })
}
```

### 3. 更新 API 端点

所有 FNM 相关的 API 调用都需要启用环境变量：

```typescript
// 获取版本列表
fnmRouter.get('/versions', (_req, res) => {
  const installedOutput = executeCommand('fnm list', true)  // ✅ 启用 FNM 环境
  const currentOutput = executeCommand('fnm current', true) // ✅ 启用 FNM 环境
  // ...
})

// 安装 Node 版本
fnmRouter.post('/install-node', async (req, res) => {
  const result = await executeCommandAsync('fnm', ['install', version], onProgress, true) // ✅
  // ...
})

// 切换版本
fnmRouter.post('/use', async (req, res) => {
  const result = await executeCommandAsync('fnm', ['use', version], onProgress, true) // ✅
  // ...
})
```

## 修改的文件

### `packages/cli/src/server/routes/fnm.ts`

**新增**:
- `getFnmEnv()` - 获取 FNM 环境变量

**修改**:
- `executeCommand(command, useFnmEnv)` - 添加环境变量参数
- `executeCommandAsync(command, args, onProgress, useFnmEnv)` - 添加环境变量参数
- 所有 FNM 命令调用都传递 `useFnmEnv = true`

## 测试验证

### 1. 运行测试脚本

```bash
# 启动服务器
npm run dev

# 在另一个终端运行测试
node test-fnm-api.js
```

### 2. 预期结果

```javascript
// /api/fnm/versions 应该返回：
{
  "success": true,
  "data": {
    "installed": ["20.11.0"],  // ✅ 显示已安装版本
    "current": "20.11.0"        // ✅ 显示当前版本
  }
}
```

### 3. UI 验证

1. 打开浏览器访问 `http://localhost:3000`
2. 进入 "Node 管理" 页面
3. 检查页面顶部是否显示"当前版本: v20.11.0"
4. 检查"已安装版本"区域是否列出已安装的版本
5. 点击"安装"按钮安装新版本
6. 安装完成后，新版本应该出现在"已安装版本"列表中

## 注意事项

### Windows 平台特定

- 使用 `powershell.exe` 作为 shell
- FNM 环境变量格式: `$env:VAR = "value"`
- 需要解析多行 PATH 变量

### macOS/Linux 平台

可能需要使用不同的 shell 和环境变量格式：

```typescript
// TODO: 支持其他平台
const shell = process.platform === 'win32' ? 'powershell.exe' : '/bin/bash'
const envCommand = process.platform === 'win32' 
  ? 'fnm env --shell powershell'
  : 'fnm env --shell bash'
```

## 后续优化

1. **缓存环境变量** - 避免每次都执行 `fnm env`
2. **环境变量刷新** - 在 Node 版本切换后刷新环境
3. **跨平台支持** - 完善 macOS/Linux 的环境变量处理
4. **错误处理** - 更友好的错误提示
5. **性能优化** - 减少环境变量解析开销

## 相关文档

- [FNM GitHub](https://github.com/Schniz/fnm)
- [FNM Environment Setup](https://github.com/Schniz/fnm#shell-setup)
- [Windows PowerShell Environment Variables](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_environment_variables)

---

**修复日期**: 2024
**修复人**: LDesign Team
**问题编号**: #FNM-ENV-001
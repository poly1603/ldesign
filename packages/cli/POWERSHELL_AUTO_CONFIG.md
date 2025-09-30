# PowerShell Profile 自动配置说明

## 功能说明

当用户在 LDesign CLI 中切换 Node.js 版本时，系统会**自动配置** PowerShell Profile，使 FNM 环境变量在所有新打开的终端中永久生效。

## 工作原理

### 1. 自动检测和配置

当用户切换 Node 版本时（点击"切换"按钮），后端会自动执行以下操作：

1. **检测 PowerShell Profile 位置**
   ```powershell
   $PROFILE
   # 输出: D:\Users\Document\WindowsPowerShell\Microsoft.PowerShell_profile.ps1
   ```

2. **检查是否已配置 FNM**
   - 如果 Profile 文件已包含 `fnm env` 配置，跳过
   - 如果不包含，自动添加配置

3. **添加 FNM 初始化代码**
   ```powershell
   # FNM (Fast Node Manager) 自动配置
   # 由 LDesign CLI 自动生成
   fnm env --shell powershell | Out-String | Invoke-Expression
   ```

4. **刷新当前进程环境变量**
   - 立即更新当前 Node.js 后端进程的 PATH
   - 确保后续操作使用正确的 Node 版本

### 2. 用户体验流程

```
用户点击"切换" 
    ↓
后端执行 fnm default <version>
    ↓
自动检测并配置 PowerShell Profile
    ↓
刷新后端进程环境变量（立即生效）
    ↓
显示成功消息 + 重启提示
    ↓
用户重新打开终端
    ↓
FNM 环境自动加载，node -v 显示正确版本
```

## 技术细节

### 后端实现

**文件**: `src/server/routes/fnm.ts`

#### 函数 1: `setupPowerShellProfile()`

```typescript
function setupPowerShellProfile(): boolean {
  // 1. 检查是否为 Windows
  if (platform !== 'win32') {
    return true
  }
  
  // 2. 获取 Profile 路径
  const profilePath = execSync('$PROFILE', { 
    encoding: 'utf-8', 
    shell: 'powershell.exe' 
  }).trim()
  
  // 3. 检查文件是否存在
  if (existsSync(profilePath)) {
    const profileContent = readFileSync(profilePath, 'utf-8')
    
    // 4. 检查是否已包含 FNM 配置
    if (profileContent.includes('fnm env') && 
        profileContent.includes('Invoke-Expression')) {
      return true // 已配置，跳过
    }
  } else {
    // 5. 创建 Profile 文件（如果不存在）
    mkdirSync(dirname(profilePath), { recursive: true })
  }
  
  // 6. 添加 FNM 配置
  const fnmInitCode = `
# FNM (Fast Node Manager) 自动配置
# 由 LDesign CLI 自动生成
fnm env --shell powershell | Out-String | Invoke-Expression
`
  const newContent = profileContent + '\n' + fnmInitCode
  writeFileSync(profilePath, newContent, 'utf-8')
  
  // 7. 通知用户需要重启终端
  connectionManager.broadcast({
    type: 'shell-restart-needed',
    data: {
      message: 'PowerShell Profile 已更新，请重启终端以应用更改',
      profilePath
    }
  })
  
  return true
}
```

#### 函数 2: `refreshFnmEnvInCurrentShell()`

```typescript
function refreshFnmEnvInCurrentShell(): void {
  // 获取 FNM 环境变量
  const fnmEnv = getFnmEnv()
  
  // 更新当前 Node.js 进程的环境变量
  if (fnmEnv.PATH) {
    process.env.PATH = fnmEnv.PATH
  }
  
  // 更新其他 FNM 相关环境变量
  if (fnmEnv.FNM_MULTISHELL_PATH) {
    process.env.FNM_MULTISHELL_PATH = fnmEnv.FNM_MULTISHELL_PATH
  }
  // ... 其他变量
}
```

### 切换版本时的调用

```typescript
fnmRouter.post('/use', async (req, res) => {
  // ... 执行 fnm default 切换版本
  
  if (result.success) {
    // 自动配置 PowerShell Profile
    const profileSetup = setupPowerShellProfile()
    
    // 刷新当前进程的环境变量
    refreshFnmEnvInCurrentShell()
    
    res.json({
      success: true,
      data: {
        message: `已将 Node.js ${version} 设置为默认版本`,
        version,
        needsRestart: profileSetup
      }
    })
  }
})
```

## 用户提示

### 成功消息

切换版本成功后，用户会看到：

```
✅ 已将 Node.js 20.11.0 设置为默认版本

PowerShell Profile 已更新，请重启终端以应用更改

请重新打开终端窗口以使 FNM 环境生效
```

### 验证方法

用户可以通过以下步骤验证配置是否生效：

1. **关闭当前 PowerShell 窗口**
2. **打开新的 PowerShell 窗口**
3. **运行命令**：
   ```powershell
   node -v
   ```
4. **确认输出**：应该显示切换后的版本（如 v20.11.0）

## 配置文件示例

### 配置前

```powershell
# PowerShell Profile 为空或包含其他配置
# ...
```

### 配置后

```powershell
# ... 原有配置 ...

# FNM (Fast Node Manager) 自动配置
# 由 LDesign CLI 自动生成
fnm env --shell powershell | Out-String | Invoke-Expression
```

## 安全性

1. **只读检查**：在添加配置前检查是否已存在，避免重复添加
2. **备份建议**：虽然系统只是追加内容，但建议用户定期备份 PowerShell Profile
3. **手动删除**：如果用户想删除配置，只需手动编辑 Profile 文件并删除相关行

## 跨平台支持

- **Windows**: 自动配置 PowerShell Profile
- **macOS/Linux**: 使用 shell 集成（bash/zsh），FNM 官方提供配置方式

## 优势

1. ✅ **零配置**：用户无需手动设置任何环境变量
2. ✅ **永久生效**：配置一次，所有新终端窗口自动应用
3. ✅ **智能检测**：避免重复配置
4. ✅ **即时刷新**：后端进程立即使用新版本
5. ✅ **用户友好**：清晰的提示信息

## 故障排除

### 问题 1: 切换后终端仍显示旧版本

**原因**: 当前终端窗口还在使用旧的环境变量

**解决**: 关闭当前终端，打开新终端

### 问题 2: Profile 配置失败

**原因**: 权限不足或 Profile 路径不存在

**解决**: 
1. 以管理员身份运行 PowerShell
2. 手动创建 Profile 目录
3. 查看后端日志获取详细错误信息

### 问题 3: 系统 Node 仍然优先

**原因**: 系统 Node 在 PATH 中优先级高于 FNM

**解决**:
1. 卸载系统全局安装的 Node.js
2. 或手动调整 PATH 顺序，将 FNM 路径放在前面

## 相关命令

```powershell
# 查看 Profile 路径
$PROFILE

# 编辑 Profile
notepad $PROFILE

# 手动加载 FNM（当前会话）
fnm env --shell powershell | Out-String | Invoke-Expression

# 查看 FNM 管理的版本
fnm list

# 查看当前使用的 Node 版本
node -v
```

## 后续优化

- [ ] 支持其他 Shell（cmd.exe, Git Bash）
- [ ] 添加配置回滚功能
- [ ] 提供详细的诊断信息
- [ ] 支持多用户环境
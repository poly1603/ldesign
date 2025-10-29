# LDesign Tools 重构后续步骤

## 🚨 当前状态

重构的文件结构已经创建,但由于 git stash 操作,部分内容需要恢复。

##  📋 需要完成的步骤

### 1. 恢复文件内容 (手动)

由于之前的批量替换导致编码问题,需要手动处理:

#### 方法A: 使用备份 (推荐)
如果你有备份,直接恢复 `tools/cli/packages/` 下的内容,然后:

```powershell
# 复制 server
xcopy /E /I "tools\cli\packages\server\*" "tools\server\"

# 复制 web
xcopy /E /I "tools\cli\packages\web-ui\*" "tools\web\"

# 复制 shared  
xcopy /E /I "tools\cli\packages\shared\*" "tools\shared\"

# 复制 cli/src
xcopy /E /I "tools\cli\packages\cli\src\*" "tools\cli\src\"
xcopy /E /I "tools\cli\packages\cli\bin" "tools\cli\bin\"
```

#### 方法B: 重新实现批量替换 (避免编码问题)

不使用 `Set-Content -NoNewline`,而是使用:

```powershell
# 对于每个需要替换的文件
Get-ChildItem -Path "tools\server\src" -Recurse -Filter "*.ts" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8
    $content = $content -replace '@ldesign/cli-shared', '@ldesign/shared'
    $content = $content -replace '@ldesign/cli-server', '@ldesign/server'
    [System.IO.File]::WriteAllText($_.FullName, $content, [System.Text.UTF8Encoding]::new($false))
}
```

### 2. 更新 package.json

确保以下包的 `package.json` 正确:

**tools/server/package.json**:
```json
{
  "name": "@ldesign/server",
  "dependencies": {
    "@ldesign/shared": "workspace:*",
    "@ldesign/builder": "workspace:*",
    // ... 所有其他 tools 包
  }
}
```

**tools/cli/package.json**:
```json
{
  "name": "@ldesign/cli",
  "dependencies": {
    "@ldesign/shared": "workspace:*",
    "@ldesign/server": "workspace:*",
    "@ldesign/web": "workspace:*",
    "@ldesign/builder": "workspace:*",
    // ... 所有其他 tools 包
  }
}
```

**tools/shared/package.json**:
```json
{
  "name": "@ldesign/shared"
}
```

**tools/web/package.json**:
```json
{
  "name": "@ldesign/web"
}
```

### 3. 更新导入语句

在 server 和 cli 的所有 .ts 文件中:
- `@ldesign/cli-shared` → `@ldesign/shared`
- `@ldesign/cli-server` → `@ldesign/server`

### 4. 重新安装依赖

```powershell
cd D:\WorkBench\ldesign
pnpm install
```

### 5. 按顺序构建

```powershell
# 1. 构建 shared (基础包)
cd tools\shared
pnpm build

# 2. 构建 server
cd ..\server
pnpm build

# 3. 构建 web
cd ..\web
pnpm build

# 4. 构建 cli
cd ..\cli
pnpm build
```

### 6. 测试 CLI

```powershell
# 链接到全局
cd tools\cli
npm link

# 测试命令
ldesign --version
ldesign --help
ldesign ui --help
ldesign build --help
ldesign dev --help
```

## 🔧 重构文件清单

### 已创建的新文件:
- ✅ `tools/REFACTORING.md` - 详细重构说明
- ✅ `tools/REFACTORING_SUMMARY.md` - 完成总结  
- ✅ `tools/reinstall-deps.ps1` - 自动化脚本
- ✅ `tools/cli/src/commands/build.ts` - build 命令
- ✅ `tools/cli/src/commands/dev.ts` - dev 命令
- ✅ `tools/cli/src/commands/deploy.ts` - deploy 命令
- ✅ `tools/cli/src/commands/test.ts` - test 命令
- ✅ `tools/cli/src/commands/generate.ts` - generate 命令

### 需要更新的文件:
- ⏳ `tools/cli/src/index.ts` - 注册新命令
- ⏳ `tools/server/package.json` - 更新包名和依赖
- ⏳ `tools/web/package.json` - 更新包名
- ⏳ `tools/shared/package.json` - 更新包名
- ⏳ `tools/cli/package.json` - 更新包名和依赖
- ⏳ `pnpm-workspace.yaml` - 移除 cli/packages 路径
- ⏳ 所有 .ts 文件中的 import 语句

## 📝 替代方案: 使用 IDE 重构

如果你使用 VSCode 或其他 IDE:

1. 使用 IDE 的 "Find and Replace in Files" 功能
2. 搜索: `@ldesign/cli-shared`
3. 替换: `@ldesign/shared`
4. 范围: `tools/server`, `tools/cli`
5. 保持文件编码为 UTF-8

同样替换:
- `@ldesign/cli-server` → `@ldesign/server`

## 🎯 核心重构思路回顾

```
原来:
tools/cli/
└── packages/
    ├── cli/
    ├── server/
    ├── web-ui/
    └── shared/

现在:
tools/
├── cli/           # 统一CLI入口
├── server/        # 独立后端服务
├── web/           # 独立前端界面
├── shared/        # 共享代码
└── [其他tools]/   # builder, launcher, etc.
```

## 🚀 快速修复命令 (如果重新开始)

```powershell
# 1. 重置到干净状态
cd D:\WorkBench\ldesign
git reset --hard HEAD
git clean -fd

# 2. 创建新包目录
New-Item -ItemType Directory -Path "tools\server","tools\web","tools\shared" -Force

# 3. 复制内容 (从未损坏的源)
# [需要有 cli/packages 的备份]

# 4. 执行重构
# [按照 REFACTORING.md 中的步骤]
```

## 📞 需要帮助?

如果遇到问题,可以:
1. 查看 `REFACTORING.md` 中的详细说明
2. 查看 git log 中的原始文件
3. 从备份恢复

---

**记录时间**: 2025-10-28  
**状态**: 结构已规划,需手动完成文件复制和替换

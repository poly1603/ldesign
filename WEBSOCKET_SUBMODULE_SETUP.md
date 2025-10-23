# WebSocket 包 Submodule 配置指南

## 📋 当前状态

- ✅ `.gitmodules` 已添加 websocket 配置
- ✅ 本地代码已准备好
- ⏳ 需要在 GitHub 上创建仓库并推送代码

## 🚀 完成步骤

### 1. 在 GitHub 上创建仓库

访问：https://github.com/new

创建新仓库：
- **Repository name**: `websocket`
- **Description**: `@ldesign/websocket - WebSocket 客户端，支持自动重连、心跳检测、消息队列、加密传输`
- **Visibility**: Public（或 Private，根据需求）
- **不要**勾选 "Initialize this repository with a README"
- 点击 "Create repository"

### 2. 重新创建本地代码

由于我们刚才删除了 `packages/websocket` 目录，需要重新创建：

```powershell
# 创建目录结构
New-Item -ItemType Directory -Path "packages\websocket\src\types" -Force
New-Item -ItemType Directory -Path "packages\websocket\src\core" -Force
```

然后重新创建所有必要的文件（package.json, tsconfig.json, README.md 等）。

或者，如果有备份，可以从备份恢复（排除 node_modules）。

### 3. 初始化 Git 并推送

```powershell
# 进入 websocket 目录
cd packages\websocket

# 初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "chore: initial commit for websocket package"

# 切换到 main 分支
git branch -M main

# 添加远程仓库
git remote add origin https://github.com/poly1603/websocket.git

# 推送到 GitHub
git push -u origin main

# 返回根目录
cd ..\..
```

### 4. 在主仓库中初始化 submodule

```powershell
# 删除本地 websocket 目录
Remove-Item -Path "packages\websocket" -Recurse -Force

# 初始化 submodule（会自动克隆）
git submodule update --init packages/websocket

# 或者手动添加
git submodule add https://github.com/poly1603/websocket.git packages/websocket
```

### 5. 提交 submodule 变更

```powershell
# 添加 .gitmodules 变更
git add .gitmodules

# 提交
git commit -m "chore: add websocket as submodule"

# 推送
git push
```

## 📦 验证 Submodule

```powershell
# 查看 submodule 状态
git submodule status

# 更新所有 submodules
git submodule update --init --recursive

# 进入 websocket 目录检查
cd packages\websocket
git status
git remote -v
cd ..\..
```

## 🔧 后续开发

### 在 submodule 中工作

```powershell
# 进入 submodule
cd packages\websocket

# 创建新分支
git checkout -b feature/your-feature

# 进行修改...

# 提交
git add .
git commit -m "feat: your feature"

# 推送到 submodule 仓库
git push origin feature/your-feature

# 返回主仓库
cd ..\..

# 更新主仓库中的 submodule 引用
git add packages/websocket
git commit -m "chore: update websocket submodule"
git push
```

## 📝 注意事项

1. **Submodule 是独立的 Git 仓库**
   - 在 `packages/websocket` 目录下的 git 操作会影响 websocket 仓库
   - 在根目录的 git 操作不会自动更新 submodule

2. **更新 Submodule**
   ```powershell
   # 拉取 submodule 最新代码
   git submodule update --remote packages/websocket
   ```

3. **克隆包含 Submodule 的仓库**
   ```powershell
   # 克隆主仓库
   git clone https://github.com/poly1603/ldesign.git
   
   # 初始化并更新所有 submodules
   git submodule update --init --recursive
   ```

## ✅ 完成检查清单

- [ ] 在 GitHub 上创建 `websocket` 仓库
- [ ] 重新创建本地 `packages/websocket` 代码
- [ ] 初始化 Git 并推送到 GitHub
- [ ] 删除本地目录并初始化为 submodule
- [ ] 提交 `.gitmodules` 变更到主仓库
- [ ] 验证 submodule 正常工作
- [ ] 安装依赖: `pnpm install`
- [ ] 测试构建: `cd packages/websocket && pnpm build`

## 🎯 快速命令（GitHub 仓库创建后）

```powershell
# 一键完成所有操作（前提：GitHub 仓库已创建）

# 1. 重新创建代码目录（这一步需要重新创建文件）
# ... 重新创建 packages/websocket 下的所有文件 ...

# 2. 初始化并推送
cd packages\websocket
git init
git add .
git commit -m "chore: initial commit"
git branch -M main
git remote add origin https://github.com/poly1603/websocket.git
git push -u origin main
cd ..\..

# 3. 删除并添加为 submodule
Remove-Item -Path "packages\websocket" -Recurse -Force
git submodule add https://github.com/poly1603/websocket.git packages/websocket

# 4. 提交主仓库变更
git add .gitmodules packages/websocket
git commit -m "chore: add websocket as submodule"
git push
```

---

**创建时间**: 2025-10-23  
**状态**: 等待 GitHub 仓库创建



# 📘 将新包转换为 Git Submodule 指南

> 将刚创建的 25 个新包转换为 Git Submodule

## 🎯 目标

将以下 25 个新包转换为独立的 Git Submodule：

### P0 - packages/ (5个)
- icons, logger, validator, auth, notification

### P1 - packages/ (5个)
- websocket, permission, animation, file, storage

### P2 - libraries/ (10个)
- gantt, mindmap, signature, barcode, calendar, timeline, tree, upload, player, markdown

### P3 - tools/ (5个)
- tester, deployer, docs-generator, monitor, analyzer

## 🚀 方法一：自动批量转换（推荐）

### 前提条件

1. **设置 GitHub Token**
```powershell
# PowerShell
$env:GITHUB_TOKEN="your_github_personal_access_token"
$env:GITHUB_OWNER="your_github_username"
```

2. **生成 GitHub Token**
   - 访问: https://github.com/settings/tokens
   - 点击 "Generate new token (classic)"
   - 勾选权限: `repo` (完整仓库访问)
   - 生成并复制 token

### 执行转换

```bash
# 运行批量转换脚本
pnpm convert-to-submodules
```

### 脚本会自动：

1. ✅ 为每个包创建 GitHub 仓库
2. ✅ 初始化包的 Git 仓库
3. ✅ 推送包内容到 GitHub
4. ✅ 删除本地普通包
5. ✅ 添加为 Git Submodule
6. ✅ 更新 .gitmodules 文件

### 完成后

```bash
# 提交 submodule 变更
git add .gitmodules
git commit -m "chore: convert 25 packages to submodules"
git push

# 更新 submodules
git submodule update --init --recursive

# 重新安装依赖
pnpm install
```

## 🔧 方法二：手动转换（安全但繁琐）

如果自动转换失败，可以手动转换每个包：

### 示例：转换 @ldesign/icons

```bash
# 1. 进入包目录
cd packages/icons

# 2. 初始化 Git
git init
git add .
git commit -m "chore: initial commit"

# 3. 在 GitHub 创建仓库 'icons'
# (通过网页或 GitHub CLI)

# 4. 添加远程仓库并推送
git remote add origin https://github.com/YOUR_USERNAME/icons.git
git branch -M main
git push -u origin main

# 5. 返回根目录
cd ../..

# 6. 删除本地包
git rm -rf packages/icons

# 7. 添加为 submodule
git submodule add https://github.com/YOUR_USERNAME/icons.git packages/icons

# 8. 提交
git commit -m "chore: convert icons to submodule"
```

### 重复以上步骤

对其余 24 个包重复以上步骤。

## 🛠️ 方法三：分步半自动转换

创建一个辅助脚本，只创建 GitHub 仓库，手动推送：

```bash
# 仅创建 GitHub 仓库（不转换）
pnpm create-github-repos

# 然后手动为每个包执行
cd packages/icons
git init
git add .
git commit -m "chore: initial commit"
git remote add origin https://github.com/YOUR_USERNAME/icons.git
git push -u origin main
```

## ⚠️ 重要注意事项

### 转换前

1. **备份数据**
```bash
# 创建备份
xcopy /E /I packages\icons .backup\packages\icons
```

2. **确保所有更改已提交**
```bash
git status
# 确保 working tree clean
```

3. **确认 GitHub Token 权限**
   - 需要 `repo` 权限
   - 能够创建公开仓库

### 转换中

1. **逐个转换** - 不要一次性转换所有包
2. **验证每个包** - 转换后检查 submodule 是否正常
3. **保留备份** - 至少保留 24 小时

### 转换后

1. **更新依赖**
```bash
pnpm install
```

2. **测试构建**
```bash
pnpm build:all
```

3. **验证 submodules**
```bash
git submodule status
```

## 🧪 测试转换（推荐）

先用一个包测试：

```bash
# 仅转换 icons 包
cd packages/icons
git init
git add .
git commit -m "test"
# ... 手动创建仓库并推送
cd ../..
git rm -rf packages/icons
git submodule add YOUR_REPO_URL packages/icons

# 如果成功，再继续其他包
```

## 📋 转换检查清单

- [ ] 设置 GITHUB_TOKEN 环境变量
- [ ] 设置 GITHUB_OWNER 环境变量
- [ ] 备份所有新包
- [ ] 确保 git status 干净
- [ ] 运行转换脚本或手动转换
- [ ] 验证每个 submodule
- [ ] 提交 .gitmodules 变更
- [ ] 更新依赖 (pnpm install)
- [ ] 测试构建 (pnpm build:all)
- [ ] 清理备份

## 🔍 故障排查

### Token 权限不足

```bash
# 重新生成 token，确保勾选 repo 权限
```

### 仓库已存在

```bash
# 使用现有仓库，跳过创建步骤
git submodule add https://github.com/USER/REPO.git TARGET_PATH
```

### 推送失败

```bash
# 检查网络连接
# 检查 token 是否过期
# 检查仓库权限
```

### Submodule 添加失败

```bash
# 先删除残留
git rm --cached packages/icons

# 重新添加
git submodule add REPO_URL packages/icons
```

## 💡 最佳实践

1. **分批转换** - 每次转换 5-10 个包
2. **先测试** - 用一个包测试整个流程
3. **保留备份** - 转换完成后至少保留 1 天
4. **文档化** - 记录每个包的仓库 URL

## 📞 需要帮助？

如果遇到问题：
1. 检查 GitHub Token 权限
2. 查看脚本输出的错误信息
3. 尝试手动转换一个包
4. 查看现有 submodule 的配置作为参考

---

**脚本位置**: `scripts/batch-convert-submodules.ts`  
**运行命令**: `pnpm convert-to-submodules`  
**预计时间**: 10-30 分钟（取决于网络）

---

*创建时间: 2025-10-22*


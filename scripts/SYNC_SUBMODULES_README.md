# Submodule 同步工具使用说明

这个工具用于自动同步项目中所有 submodule 的远程最新代码。

## 功能特性

- ✅ 自动检测并初始化未初始化的 submodule
- ✅ 批量更新所有 submodule 到最新代码
- ✅ 支持并发更新，提高同步速度
- ✅ 彩色输出，清晰显示进度和状态
- ✅ 自动处理 detached HEAD 状态
- ✅ 详细的错误提示和成功统计

## 使用方法

### 方式一：使用 npm 脚本（推荐）

```bash
# 交互式同步（会显示提示）
pnpm sync-submodules

# 自动同步（跳过确认，直接执行）
pnpm sync

# 或使用 npm/yarn
npm run sync-submodules
yarn sync-submodules
```

### 方式二：直接运行脚本

```bash
# 交互式同步
tsx scripts/sync-submodules.ts

# 自动同步（跳过确认）
tsx scripts/sync-submodules.ts -y

# 或
tsx scripts/sync-submodules.ts --yes
```

## 高级选项

### 调整并发数

默认并发数为 5，可以通过参数调整：

```bash
# 使用 10 个并发
tsx scripts/sync-submodules.ts --concurrency=10

# 使用 3 个并发（网络较慢时）
tsx scripts/sync-submodules.ts --concurrency=3
```

### 组合使用

```bash
# 自动同步 + 自定义并发数
tsx scripts/sync-submodules.ts -y --concurrency=8
```

## 工作原理

1. **读取配置**：从 `.gitmodules` 文件读取所有 submodule 信息
2. **检查状态**：检查每个 submodule 是否已初始化
3. **初始化**：对未初始化的 submodule 执行 `git submodule update --init`
4. **同步代码**：
   - 执行 `git fetch origin` 获取最新代码
   - 检测当前分支状态
   - 执行 `git pull origin <branch>` 更新代码
5. **处理特殊情况**：
   - 如果处于 detached HEAD 状态，尝试切换到 `master` 或 `main` 分支
   - 如果切换失败，保持当前状态但更新代码
6. **显示结果**：统计并显示成功和失败的 submodule 数量

## 输出示例

```
🚀 Submodule 同步工具

============================================================
  读取 submodule 配置
============================================================
✓ 找到 60 个 submodules

============================================================
  开始同步 60 个 submodules (并发数: 5)
============================================================
ℹ 初始化 apps/app...
ℹ 同步 apps/app...
✓ apps/app 同步完成
ℹ 同步 libraries/3d-viewer...
✓ libraries/3d-viewer 同步完成
...
ℹ 进度: 60/60

============================================================
  同步结果
============================================================
总计: 60
✓ 成功: 60

✨ 所有 submodules 同步完成！
```

## 注意事项

1. **网络连接**：确保你的网络可以访问 GitHub
2. **权限问题**：确保你有访问所有 submodule 仓库的权限
3. **本地修改**：如果 submodule 中有未提交的修改，可能会导致同步失败
4. **并发数**：如果网络不稳定，建议降低并发数
5. **执行时间**：根据 submodule 数量和网络速度，可能需要几分钟时间

## 常见问题

### Q: 某些 submodule 同步失败怎么办？

A: 脚本会显示失败的 submodule 名称和错误信息。通常是以下原因：
- 网络连接问题：重试即可
- 权限问题：检查 SSH key 或访问令牌
- 本地有未提交的修改：手动处理该 submodule

### Q: 如何只同步特定的 submodule？

A: 可以手动进入该 submodule 目录执行：
```bash
cd packages/某个包
git fetch origin
git pull origin master
```

### Q: 同步后 submodule 还是旧版本？

A: 这个脚本会将 submodule 更新到远程最新代码。主仓库的 submodule 指针需要你手动提交：
```bash
git add packages/某个包
git commit -m "更新 submodule 到最新版本"
```

## 相关命令

```bash
# 查看所有 submodule 状态
git submodule status

# 初始化所有 submodule（不更新）
git submodule init

# 手动更新所有 submodule（使用主仓库记录的版本）
git submodule update

# 递归克隆所有 submodule
git submodule update --init --recursive
```

## 维护说明

脚本位置：`scripts/sync-submodules.ts`

如需修改脚本行为，请编辑该文件。主要可配置项：
- `concurrency`：默认并发数（当前为 5）
- 颜色输出配置
- 错误处理逻辑
- 分支切换策略


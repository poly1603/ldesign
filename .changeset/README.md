# Changesets

这个目录包含了 [Changesets](https://github.com/changesets/changesets) 的配置和变更集文件。

## 如何使用

### 1. 添加变更集

当你对代码进行了更改时，运行：

```bash
pnpm changeset
```

这将启动一个交互式向导，帮助你：

- 选择哪些包受到了影响
- 选择变更类型（patch/minor/major）
- 编写变更描述

### 2. 变更类型说明

- **patch** (0.0.X) - 修复 bug，向后兼容
- **minor** (0.X.0) - 新增功能，向后兼容
- **major** (X.0.0) - 破坏性变更，不向后兼容

### 3. 版本更新

当准备发布时，运行：

```bash
pnpm changeset version
```

这将：

- 更新所有受影响包的版本号
- 更新 CHANGELOG.md 文件
- 删除已处理的变更集文件

### 4. 发布

```bash
pnpm changeset publish
```

或者使用我们的发布脚本：

```bash
pnpm release
```

## 自动化发布

我们的 GitHub Actions 会自动：

1. 在 PR 中检测变更集
2. 在合并到 main 分支后创建发布 PR
3. 当发布 PR 被合并时自动发布到 npm

## 配置说明

- `linked` - 所有核心包会一起发布，保持版本同步
- `access: "public"` - 包会发布为公开包
- `baseBranch: "main"` - 基于 main 分支进行版本管理
- `updateInternalDependencies: "patch"` - 内部依赖更新时使用 patch 版本

# Git 工作流程和提交规范

本文档介绍 @ldesign/router 项目的 Git 工作流程、提交规范和代码质量保证机制。

## 🚀 快速开始

### 1. 安装 Git Hooks

首次克隆项目后，运行以下命令安装 Git hooks：

```bash
# 安装依赖
pnpm install

# 设置 Git hooks
pnpm run setup-hooks
# 或者手动运行
node scripts/setup-hooks.js
```

### 2. 提交代码

我们提供了两种提交方式：

#### 方式一：交互式提交助手（推荐）

```bash
pnpm commit:interactive
```

这个命令会引导你：

1. 选择提交类型
2. 选择影响范围
3. 输入提交描述
4. 运行代码验证
5. 执行提交

#### 方式二：传统 Git 提交

```bash
git add .
git commit -m "feat(router): add new navigation method"
```

提交时会自动运行验证检查。

## 📝 提交信息规范

### 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 提交类型 (type)

| 类型       | 描述      | 示例                                               |
| ---------- | --------- | -------------------------------------------------- |
| `feat`     | 新功能    | `feat(router): add lazy loading support`           |
| `fix`      | 修复 bug  | `fix(matcher): resolve route matching issue`       |
| `docs`     | 文档更新  | `docs(readme): update installation guide`          |
| `style`    | 代码格式  | `style(components): fix indentation`               |
| `refactor` | 重构      | `refactor(core): simplify router creation`         |
| `perf`     | 性能优化  | `perf(matcher): optimize route matching algorithm` |
| `test`     | 测试相关  | `test(guards): add navigation guard tests`         |
| `chore`    | 构建/工具 | `chore(deps): update dependencies`                 |
| `ci`       | CI 配置   | `ci(github): add performance testing workflow`     |
| `build`    | 构建系统  | `build(rollup): optimize bundle size`              |
| `revert`   | 回滚      | `revert: feat(router): add lazy loading support`   |

### 影响范围 (scope)

| 范围          | 描述         |
| ------------- | ------------ |
| `core`        | 核心路由功能 |
| `router`      | 路由器主类   |
| `matcher`     | 路由匹配器   |
| `history`     | 历史管理     |
| `components`  | Vue 组件     |
| `composables` | 组合式 API   |
| `plugins`     | 插件系统     |
| `device`      | 设备适配     |
| `engine`      | Engine 集成  |
| `guards`      | 路由守卫     |
| `utils`       | 工具函数     |
| `types`       | 类型定义     |
| `docs`        | 文档         |
| `test`        | 测试         |
| `build`       | 构建配置     |
| `ci`          | CI/CD        |

### 提交描述 (subject)

- 使用现在时态："add feature" 而不是 "added feature"
- 首字母小写
- 不要以句号结尾
- 控制在 50 字符以内
- 清晰描述做了什么

### 示例

```bash
# 好的提交信息
feat(router): add support for nested routes
fix(cache): resolve memory leak in route cache
docs(api): update router configuration options
perf(matcher): improve route matching performance by 50%

# 不好的提交信息
update code
fix bug
add stuff
WIP
```

## 🔍 代码验证流程

每次提交前会自动运行以下验证：

### 1. TypeScript 类型检查

```bash
pnpm type-check
```

确保所有 TypeScript 类型正确。

### 2. ESLint 代码质量检查

```bash
pnpm lint:check
```

检查代码风格和潜在问题。

### 3. 单元测试

```bash
pnpm test:run
```

运行所有单元测试，确保功能正常。

### 4. 构建验证

```bash
pnpm build
```

验证代码可以正确构建。

## 🛠️ 手动验证命令

### 快速验证

```bash
pnpm validate:quick
```

只运行类型检查和 ESLint，适合快速验证。

### 完整验证

```bash
pnpm validate
```

运行所有验证步骤，包括测试和构建。

### 使用验证脚本

```bash
pnpm validate:full
```

使用交互式验证脚本，提供详细的进度和错误信息。

### 包含 E2E 测试的验证

```bash
pnpm validate:e2e
```

运行包括 E2E 测试在内的完整验证。

## 🚫 绕过验证

在紧急情况下，可以绕过验证：

```bash
# 绕过 pre-commit hook
git commit --no-verify -m "emergency fix"

# 绕过 commit-msg hook
HUSKY=0 git commit -m "emergency fix"
```

**注意：** 绕过验证可能导致代码质量问题，请谨慎使用。

## 🔧 配置文件

### Husky 配置

- `.husky/pre-commit`: 提交前验证
- `.husky/commit-msg`: 提交信息验证

### Lint-staged 配置

- `.lintstagedrc.js`: 暂存文件验证规则

### Commitlint 配置

- `commitlint.config.js`: 提交信息格式规则

### Git 配置

- `.gitmessage`: 提交信息模板

## 📊 CI/CD 集成

GitHub Actions 会在以下情况自动运行验证：

- 推送到 `main` 或 `develop` 分支
- 创建 Pull Request

CI 流程包括：

1. **代码验证**: TypeScript、ESLint、测试、构建
2. **E2E 测试**: 端到端功能测试
3. **性能测试**: 性能基准和回归测试
4. **安全检查**: 依赖安全审计
5. **发布检查**: 包大小和内容验证

## 🎯 最佳实践

### 1. 提交频率

- 小而频繁的提交优于大而稀少的提交
- 每个提交应该是一个逻辑单元
- 避免混合不相关的更改

### 2. 提交信息

- 第一行简洁明了，描述做了什么
- 如果需要，添加详细的 body 说明为什么
- 引用相关的 issue 或 PR

### 3. 代码质量

- 提交前运行完整验证
- 修复所有 ESLint 警告
- 确保测试覆盖率不下降
- 添加必要的测试用例

### 4. 分支管理

- `main`: 稳定的生产代码
- `develop`: 开发分支
- `feature/*`: 功能分支
- `fix/*`: 修复分支
- `hotfix/*`: 紧急修复分支

## 🆘 故障排除

### 验证失败

如果验证失败，请：

1. 查看错误信息
2. 修复报告的问题
3. 重新运行验证
4. 重新提交

### Hook 不工作

如果 Git hooks 不工作：

```bash
# 重新安装 hooks
pnpm run setup-hooks

# 检查文件权限
ls -la .husky/

# 手动设置权限
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

### 依赖问题

如果遇到依赖问题：

```bash
# 清理并重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 重新设置 hooks
pnpm run setup-hooks
```

## 📚 相关文档

- [开发指南](./development-guide.md)
- [测试指南](./testing-guide.md)
- [发布流程](./release-process.md)
- [贡献指南](../CONTRIBUTING.md)

---

遵循这些规范可以确保代码质量，提高团队协作效率，让项目保持健康的发展状态！ 🚀

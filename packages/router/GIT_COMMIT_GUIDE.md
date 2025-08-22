# Git 提交规范指南

## 🎯 快速开始

### 1. 设置 Git Hooks

```bash
# 运行设置脚本
powershell -ExecutionPolicy Bypass -File scripts/setup-git-hooks.ps1
```

### 2. 提交代码

```bash
# 方式一：使用交互式助手（推荐）
pnpm commit:interactive

# 方式二：传统提交
git add .
git commit -m "feat(router): add new navigation method"
```

## 📝 提交信息格式

```
<type>(<scope>): <subject>
```

### 类型 (type)

| 类型       | 描述      | 示例                                |
| ---------- | --------- | ----------------------------------- |
| `feat`     | 新功能    | `feat(router): add lazy loading`    |
| `fix`      | 修复 bug  | `fix(cache): resolve memory leak`   |
| `docs`     | 文档更新  | `docs(readme): update guide`        |
| `style`    | 代码格式  | `style: fix indentation`            |
| `refactor` | 重构      | `refactor(core): simplify logic`    |
| `perf`     | 性能优化  | `perf(matcher): optimize algorithm` |
| `test`     | 测试相关  | `test(guards): add unit tests`      |
| `chore`    | 构建/工具 | `chore(deps): update packages`      |
| `ci`       | CI 配置   | `ci: add workflow`                  |
| `build`    | 构建系统  | `build: optimize bundle`            |
| `revert`   | 回滚      | `revert: feat(router): add feature` |

### 范围 (scope)

- `core` - 核心功能
- `router` - 路由器
- `matcher` - 路由匹配
- `history` - 历史管理
- `components` - Vue 组件
- `composables` - 组合式 API
- `plugins` - 插件系统
- `guards` - 路由守卫
- `utils` - 工具函数
- `types` - 类型定义
- `docs` - 文档
- `test` - 测试
- `build` - 构建配置

## 🔍 验证命令

```bash
# 快速验证（类型检查 + ESLint）
pnpm validate:quick

# 完整验证（包括测试和构建）
pnpm validate

# 使用验证脚本
pnpm validate:full

# 包含 E2E 测试
pnpm validate:e2e
```

## ✅ 提交前检查

每次提交会自动运行：

1. **TypeScript 类型检查** - 确保类型正确
2. **ESLint 检查** - 确保代码质量
3. **单元测试** - 确保功能正常
4. **构建验证** - 确保可以正确构建

## 🚫 绕过验证

紧急情况下可以绕过：

```bash
# 绕过所有 hooks
git commit --no-verify -m "emergency fix"

# 绕过特定 hook
HUSKY=0 git commit -m "emergency fix"
```

## 📋 示例

### 好的提交信息

```bash
feat(router): add support for nested routes
fix(cache): resolve memory leak in route cache
docs(api): update router configuration options
perf(matcher): improve route matching performance by 50%
test(guards): add comprehensive navigation guard tests
```

### 不好的提交信息

```bash
update code          # 太模糊
fix bug             # 没有说明修复了什么
add stuff           # 没有具体信息
WIP                 # 不应该提交未完成的工作
```

## 🛠️ 故障排除

### Git Hooks 不工作

```bash
# 重新设置权限
powershell -ExecutionPolicy Bypass -File scripts/setup-git-hooks.ps1

# 检查 hooks 文件
ls -la .git/hooks/
```

### 验证失败

1. 查看错误信息
2. 修复报告的问题
3. 重新运行验证：`pnpm validate:quick`
4. 重新提交

### 依赖问题

```bash
# 重新安装依赖
pnpm install

# 重新设置 hooks
powershell -ExecutionPolicy Bypass -File scripts/setup-git-hooks.ps1
```

## 📚 相关文件

- `.git/hooks/pre-commit` - 提交前验证
- `.git/hooks/commit-msg` - 提交信息验证
- `scripts/validate-commit-msg.js` - 提交信息验证脚本
- `scripts/setup-git-hooks.ps1` - Git hooks 设置脚本

---

遵循这些规范可以确保代码质量和团队协作效率！ 🚀

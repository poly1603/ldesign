# 贡献指南

感谢你对 @ldesign/pdf-viewer 的关注！我们欢迎任何形式的贡献。

## 开发设置

### 1. Fork 并克隆仓库

```bash
git clone https://github.com/your-username/pdf-viewer.git
cd pdf-viewer
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 复制 Worker 文件

```bash
pnpm copy:worker
```

### 4. 启动开发服务器

```bash
# Vanilla JS 示例
pnpm dev

# Vue 3 示例
pnpm dev vue3-demo

# 文档
pnpm docs:dev
```

## 开发流程

### 分支策略

- `main` - 稳定版本
- `develop` - 开发分支
- `feature/*` - 新功能
- `fix/*` - Bug 修复

### 提交信息规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
type(scope): subject

body

footer
```

**类型**:
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

**示例**:
```
feat(vue): add usePDFViewer composable

Add a new composable API for Vue 3 users to have more control
over the PDF viewer instance.

Closes #123
```

## 代码规范

### TypeScript

- 使用 TypeScript 编写所有代码
- 提供完整的类型定义
- 避免使用 `any` 类型

### 代码风格

- 使用 2 空格缩进
- 使用单引号
- 每行最多 100 字符
- 使用 ESLint 和 Prettier

### 命名规范

- 类名：PascalCase
- 函数/变量：camelCase
- 常量：UPPER_SNAKE_CASE
- 文件名：kebab-case 或 PascalCase（组件）

## 测试

### 运行测试

```bash
pnpm test
```

### 编写测试

- 为新功能编写单元测试
- 确保测试覆盖率不降低
- 测试文件命名：`*.test.ts` 或 `*.spec.ts`

## 文档

### 更新文档

如果你的改动影响了 API 或使用方式，请更新相应文档：

- README.md
- docs/ 目录下的文档
- API 文档
- 示例代码

### 文档规范

- 使用清晰、简洁的语言
- 提供代码示例
- 添加必要的类型说明

## Pull Request 流程

### 1. 创建分支

```bash
git checkout -b feature/amazing-feature
```

### 2. 进行开发

- 编写代码
- 编写测试
- 更新文档

### 3. 提交更改

```bash
git add .
git commit -m "feat: add amazing feature"
```

### 4. 推送到 GitHub

```bash
git push origin feature/amazing-feature
```

### 5. 创建 Pull Request

- 在 GitHub 上创建 PR
- 填写 PR 模板
- 等待 Code Review

### PR 检查清单

在提交 PR 前，确保：

- [ ] 代码符合项目规范
- [ ] 所有测试通过
- [ ] 添加了必要的测试
- [ ] 更新了相关文档
- [ ] 提交信息符合规范
- [ ] 没有不必要的依赖
- [ ] 构建成功

## Issue 提交

### Bug 报告

提交 Bug 时请包含：

- 问题描述
- 复现步骤
- 预期行为
- 实际行为
- 环境信息（浏览器、版本等）
- 相关代码或截图

### 功能建议

提交功能建议时请包含：

- 功能描述
- 使用场景
- 预期效果
- 可能的实现方案

## 发布流程

（仅限维护者）

### 1. 更新版本

```bash
pnpm version [patch|minor|major]
```

### 2. 构建

```bash
pnpm build
```

### 3. 发布

```bash
pnpm publish
```

### 4. 打标签

```bash
git push --tags
```

## 社区准则

### 行为准则

- 尊重所有贡献者
- 接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

### 沟通渠道

- GitHub Issues - Bug 报告和功能建议
- GitHub Discussions - 一般讨论和问答
- Email - 私密问题

## 需要帮助？

如果你有任何问题，可以：

1. 查看 [文档](https://ldesign.github.io/pdf-viewer)
2. 搜索现有的 Issues
3. 创建新的 Issue
4. 发送邮件至 support@ldesign.com

## 致谢

感谢所有贡献者的付出！你们的贡献让这个项目变得更好。

## 许可证

通过贡献代码，你同意你的贡献将在 [MIT License](./LICENSE) 下授权。

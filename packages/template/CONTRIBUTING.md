# 贡献指南

感谢您对 LDesign Template 项目的关注！我们欢迎所有形式的贡献，包括但不限于：

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复
- ✨ 开发新功能

## 开发环境设置

### 前置要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 克隆项目

```bash
git clone https://github.com/ldesign-org/template.git
cd template
```

### 安装依赖

```bash
pnpm install
```

### 开发命令

```bash
# 开发模式
pnpm dev

# 构建项目
pnpm build

# 运行测试
pnpm test

# 运行测试（监听模式）
pnpm test:watch

# 类型检查
pnpm type-check

# 代码格式化
pnpm format

# 代码检查
pnpm lint

# 运行示例项目
cd examples
pnpm dev
```

## 项目结构

```
packages/template/
├── src/                    # 源代码
│   ├── core/              # 核心功能
│   │   ├── cache/         # 缓存系统
│   │   ├── device/        # 设备检测
│   │   ├── scanner/       # 模板扫描
│   │   └── TemplateManager.ts
│   ├── vue/               # Vue 相关
│   │   ├── components/    # Vue 组件
│   │   └── composables/   # Vue Composables
│   ├── utils/             # 工具函数
│   ├── types/             # 类型定义
│   └── index.ts           # 主入口
├── tests/                 # 测试文件
├── docs/                  # 文档
├── examples/              # 示例项目
└── templates/             # 模板文件
```

## 开发流程

### 1. 创建分支

```bash
# 从 main 分支创建新分支
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

### 2. 开发和测试

- 编写代码时请遵循现有的代码风格
- 为新功能添加相应的测试
- 确保所有测试通过
- 更新相关文档

### 3. 提交代码

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
# 功能开发
git commit -m "feat: 添加虚拟滚动功能"

# Bug 修复
git commit -m "fix: 修复缓存清理问题"

# 文档更新
git commit -m "docs: 更新 API 文档"

# 测试相关
git commit -m "test: 添加懒加载组件测试"

# 重构代码
git commit -m "refactor: 优化模板扫描器性能"
```

### 4. 创建 Pull Request

- 确保 PR 标题清晰描述了变更内容
- 在 PR 描述中详细说明：
  - 变更的原因
  - 变更的内容
  - 测试情况
  - 相关的 Issue（如果有）

## 代码规范

### TypeScript

- 使用严格的 TypeScript 配置
- 为所有公共 API 提供类型定义
- 避免使用 `any` 类型

### Vue 组件

- 使用 Composition API
- 使用 `<script setup>` 语法
- 为 Props 和 Events 提供完整的类型定义

### 测试

- 使用 Vitest 作为测试框架
- 为新功能编写单元测试
- 测试覆盖率应保持在 80% 以上
- 使用描述性的测试名称

### 文档

- 使用中文编写文档
- 为新功能提供使用示例
- 保持 API 文档的完整性和准确性

## 性能优化指南

### 组件开发

- 使用 `markRaw()` 包装不需要响应式的对象
- 合理使用 `computed` 和 `watch`
- 避免在模板中使用复杂的计算

### 缓存策略

- 合理设置缓存大小限制
- 及时清理不需要的缓存
- 使用 LRU 算法优化缓存效率

### 懒加载

- 使用 Intersection Observer API
- 设置合理的 rootMargin 和 threshold
- 提供友好的加载状态提示

## 发布流程

### 版本号规则

我们遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范：

- **主版本号**: 不兼容的 API 修改
- **次版本号**: 向下兼容的功能性新增
- **修订号**: 向下兼容的问题修正

### 发布检查清单

- [ ] 所有测试通过
- [ ] 文档已更新
- [ ] CHANGELOG.md 已更新
- [ ] 版本号已更新
- [ ] 构建产物正常

## 问题报告

### Bug 报告

请使用以下模板报告 Bug：

```markdown
## Bug 描述

简要描述遇到的问题

## 复现步骤

1. 执行步骤 1
2. 执行步骤 2
3. 看到错误

## 期望行为

描述期望的正确行为

## 实际行为

描述实际发生的行为

## 环境信息

- OS: [例如 macOS 13.0]
- Node.js: [例如 18.17.0]
- Vue: [例如 3.3.4]
- @ldesign/template: [例如 0.1.0]

## 额外信息

其他相关信息或截图
```

### 功能请求

请使用以下模板提出功能请求：

```markdown
## 功能描述

简要描述建议的功能

## 使用场景

描述这个功能的使用场景和价值

## 建议的实现方式

如果有想法，可以描述建议的实现方式

## 替代方案

描述考虑过的替代方案
```

## 社区

- 📧 邮箱: ldesign@example.com
- 💬 讨论: [GitHub Discussions](https://github.com/ldesign-org/template/discussions)
- 🐛 问题: [GitHub Issues](https://github.com/ldesign-org/template/issues)

## 许可证

通过贡献代码，您同意您的贡献将在 [MIT License](./LICENSE) 下授权。

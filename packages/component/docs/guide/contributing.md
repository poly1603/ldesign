# 贡献指南

感谢您对 LDesign Component 的关注！我们欢迎任何形式的贡献，包括但不限于：

- 报告 Bug
- 提出新功能建议
- 提交代码改进
- 完善文档
- 分享使用经验

## 开发环境搭建

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git

### 克隆项目

```bash
git clone https://github.com/ldesign/ldesign.git
cd ldesign
```

### 安装依赖

```bash
# 安装根目录依赖
pnpm install

# 安装组件库依赖
pnpm --dir packages/component install
```

### 启动开发服务器

```bash
# 启动组件库开发服务器
pnpm --dir packages/component run dev

# 启动文档开发服务器
pnpm --dir packages/component run docs:dev
```

## 开发流程

### 1. 创建分支

从 `main` 分支创建新的功能分支：

```bash
git checkout -b feature/your-feature-name
```

分支命名规范：
- `feature/xxx` - 新功能
- `fix/xxx` - Bug 修复
- `docs/xxx` - 文档更新
- `refactor/xxx` - 代码重构
- `test/xxx` - 测试相关

### 2. 开发新组件

使用组件创建脚本快速生成组件骨架：

```bash
pnpm --dir packages/component run create:component your-component-name
```

这会在 `src/components/` 目录下创建完整的组件文件结构。

### 3. 遵循开发规范

请严格遵循 [组件开发规范](./component-development.md)，确保：

- 组件命名符合规范
- 代码结构清晰
- 类型定义完整
- 样式使用设计系统变量
- 测试覆盖充分

### 4. 编写测试

为新功能编写单元测试：

```bash
# 运行测试
pnpm --dir packages/component run test

# 运行测试并生成覆盖率报告
pnpm --dir packages/component run test:coverage
```

### 5. 更新文档

- 更新组件的 README.md
- 在 `docs/components/` 目录下创建组件文档
- 更新 API 文档
- 添加使用示例

### 6. 提交代码

使用规范的提交信息格式：

```bash
git add .
git commit -m "feat(button): add loading state support"
```

提交信息格式：
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

类型（type）：
- `feat` - 新功能
- `fix` - Bug 修复
- `docs` - 文档更新
- `style` - 代码格式调整
- `refactor` - 代码重构
- `test` - 测试相关
- `chore` - 构建过程或辅助工具的变动

### 7. 创建 Pull Request

1. 推送分支到远程仓库
2. 在 GitHub 上创建 Pull Request
3. 填写 PR 模板，详细描述变更内容
4. 等待代码审查

## 代码规范

### ESLint 配置

项目使用 ESLint 进行代码检查：

```bash
# 检查代码
pnpm --dir packages/component run lint

# 自动修复
pnpm --dir packages/component run lint:fix
```

### TypeScript 检查

```bash
# 类型检查
pnpm --dir packages/component run type-check
```

### 代码格式化

项目使用 Prettier 进行代码格式化，建议在编辑器中配置自动格式化。

## 测试规范

### 单元测试

- 使用 Vitest 作为测试框架
- 使用 @vue/test-utils 进行组件测试
- 测试覆盖率不低于 80%

### 测试文件命名

- 组件测试：`ComponentName.test.ts`
- 工具函数测试：`utils.test.ts`

### 测试内容

必须测试的内容：
- 组件基础渲染
- Props 传递和验证
- 事件触发
- 用户交互
- 边界情况

## 文档规范

### 组件文档结构

每个组件文档应包含：

1. 组件描述
2. 基础用法示例
3. 高级用法示例
4. API 文档（Props、Events、Slots、Methods）
5. 主题定制说明
6. 无障碍访问说明

### 代码示例

- 使用 Vue 3 Composition API
- 代码简洁易懂
- 包含必要的注释
- 提供完整的可运行示例

## 发布流程

### 版本管理

项目使用语义化版本控制：

- 主版本号：不兼容的 API 修改
- 次版本号：向下兼容的功能性新增
- 修订号：向下兼容的问题修正

### 变更日志

所有变更都会记录在 CHANGELOG.md 中，包括：

- 新增功能
- Bug 修复
- 破坏性变更
- 性能优化
- 文档更新

## 社区规范

### 行为准则

我们致力于为所有人提供友好、安全和欢迎的环境，请遵循以下准则：

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

### 沟通渠道

- GitHub Issues：报告 Bug 和功能请求
- GitHub Discussions：技术讨论和问答
- Pull Requests：代码贡献

## 常见问题

### Q: 如何报告 Bug？

A: 请在 GitHub Issues 中创建新的 issue，使用 Bug 报告模板，提供详细的复现步骤和环境信息。

### Q: 如何提出新功能建议？

A: 请在 GitHub Issues 中创建新的 issue，使用功能请求模板，详细描述功能需求和使用场景。

### Q: 代码审查需要多长时间？

A: 通常在 1-3 个工作日内会有初步反馈，复杂的 PR 可能需要更长时间。

### Q: 如何成为核心贡献者？

A: 通过持续的高质量贡献，包括代码、文档、测试等，我们会邀请活跃的贡献者加入核心团队。

## 致谢

感谢所有为 LDesign Component 做出贡献的开发者！您的每一份贡献都让这个项目变得更好。

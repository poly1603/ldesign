# 贡献指南

感谢你对 LDesign 的关注！我们欢迎所有形式的贡献，包括但不限于：

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码
- 🧪 编写测试
- 🎨 设计改进

## 开始之前

在开始贡献之前，请确保你已经：

1. 阅读了我们的 [行为准则](./CODE_OF_CONDUCT.md)
2. 了解了项目的 [架构设计](./docs/guide/architecture.md)
3. 熟悉了我们的 [代码规范](#代码规范)

## 开发环境设置

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git

### 克隆项目

```bash
git clone https://github.com/poly1603/ldesign.git
cd ldesign
```

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
# 启动组件开发服务器
pnpm dev

# 启动文档服务器
pnpm docs:dev
```

## 贡献流程

### 1. 创建 Issue

在开始编码之前，请先创建一个 Issue 来描述你要解决的问题或添加的功能。这有助于：

- 避免重复工作
- 获得社区反馈
- 确保贡献符合项目方向

### 2. Fork 项目

点击 GitHub 页面右上角的 "Fork" 按钮，将项目 fork 到你的账户下。

### 3. 创建分支

```bash
# 创建并切换到新分支
git checkout -b feature/your-feature-name

# 或者修复 bug
git checkout -b fix/your-bug-fix
```

分支命名规范：
- `feature/功能名称` - 新功能
- `fix/问题描述` - Bug 修复
- `docs/文档更新` - 文档更新
- `refactor/重构描述` - 代码重构
- `test/测试描述` - 测试相关

### 4. 编写代码

#### 代码规范

我们使用以下工具确保代码质量：

- **ESLint** - 基于 @antfu/eslint-config
- **Prettier** - 代码格式化
- **TypeScript** - 类型检查

在提交前，请确保：

```bash
# 代码检查
pnpm lint

# 类型检查
pnpm typecheck

# 运行测试
pnpm test

# 格式化代码
pnpm format
```

#### 组件开发规范

1. **文件结构**
   ```
   packages/component-name/
   ├── src/
   │   ├── index.ts          # 导出文件
   │   ├── Component.tsx     # 组件实现
   │   └── types.ts          # 类型定义
   ├── __tests__/
   │   └── Component.test.ts # 测试文件
   └── package.json
   ```

2. **组件命名**
   - 组件名使用 PascalCase
   - 文件名使用 PascalCase
   - 导出名使用 PascalCase

3. **TypeScript 类型**
   - 所有 props 必须有类型定义
   - 使用 interface 定义复杂类型
   - 导出所有公共类型

4. **样式规范**
   - 使用 Less 编写样式
   - 遵循 BEM 命名规范
   - 支持主题定制

#### 测试要求

每个组件都必须包含：

1. **单元测试** - 测试组件的基本功能
2. **快照测试** - 确保组件渲染一致性
3. **交互测试** - 测试用户交互行为
4. **可访问性测试** - 确保组件可访问

测试覆盖率要求：
- 行覆盖率 >= 80%
- 分支覆盖率 >= 80%
- 函数覆盖率 >= 80%

### 5. 提交代码

#### 提交信息规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

类型说明：
- `feat` - 新功能
- `fix` - Bug 修复
- `docs` - 文档更新
- `style` - 代码格式调整
- `refactor` - 代码重构
- `test` - 测试相关
- `chore` - 构建过程或辅助工具的变动

示例：
```bash
git commit -m "feat(button): add loading state support"
git commit -m "fix(input): resolve focus issue on mobile"
git commit -m "docs: update installation guide"
```

#### 提交前检查

项目配置了 husky 和 lint-staged，会在提交前自动运行：

- ESLint 检查
- Prettier 格式化
- TypeScript 类型检查
- 测试运行

### 6. 创建 Pull Request

1. 推送分支到你的 fork
   ```bash
   git push origin feature/your-feature-name
   ```

2. 在 GitHub 上创建 Pull Request

3. 填写 PR 模板，包括：
   - 变更描述
   - 相关 Issue
   - 测试说明
   - 截图（如适用）

#### PR 要求

- 标题清晰描述变更内容
- 描述详细说明变更原因和实现方式
- 关联相关 Issue
- 通过所有 CI 检查
- 获得至少一个维护者的 review

## 发布流程

项目使用自动化发布流程：

1. 维护者合并 PR 到 main 分支
2. GitHub Actions 自动运行 CI/CD
3. 自动发布到 NPM
4. 自动部署文档到 GitHub Pages
5. 自动生成 Release Notes

## 社区

### 获取帮助

- 📚 [文档](https://poly1603.github.io/ldesign/)
- 💬 [GitHub Discussions](https://github.com/poly1603/ldesign/discussions)
- 🐛 [GitHub Issues](https://github.com/poly1603/ldesign/issues)

### 参与讨论

我们鼓励社区成员参与讨论：

- 在 Discussions 中分享使用经验
- 在 Issues 中报告问题和建议
- 在 PR 中进行代码 review
- 在社交媒体上分享项目

## 认可贡献者

我们使用 [All Contributors](https://allcontributors.org/) 来认可所有贡献者的努力。

贡献类型包括：
- 💻 代码
- 📖 文档
- 🎨 设计
- 🐛 Bug 报告
- 💡 想法和建议
- 🤔 答疑解惑
- 📢 推广宣传

## 许可证

通过贡献代码，你同意你的贡献将在 [MIT License](./LICENSE) 下发布。

---

再次感谢你的贡献！每一个贡献都让 LDesign 变得更好。🎉

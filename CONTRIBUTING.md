# 贡献指南

感谢您对 LDesign 项目的关注！我们欢迎所有形式的贡献，包括但不限于：

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复
- ✨ 添加新功能

## 开发环境设置

### 前置要求

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
pnpm install
```

### 开发模式

```bash
# 启动所有包的开发模式
pnpm dev

# 或者启动特定包的开发模式
cd packages/engine
pnpm dev
```

## 项目结构

```
ldesign/
├── packages/          # 核心包
│   ├── engine/        # 引擎核心
│   ├── color/         # 颜色管理
│   ├── router/        # 路由系统
│   ├── http/          # HTTP客户端
│   ├── i18n/          # 国际化
│   ├── device/        # 设备检测
│   ├── crypto/        # 加密工具
│   └── template/      # 模板引擎
├── tools/             # 开发工具
├── examples/          # 示例项目
├── docs/              # 文档
└── .github/           # GitHub配置
```

## 开发流程

### 1. 创建分支

```bash
# 从 develop 分支创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# 或者从 main 分支创建修复分支
git checkout main
git pull origin main
git checkout -b fix/your-fix-name
```

### 2. 开发

- 遵循项目的代码规范
- 编写测试用例
- 确保所有测试通过
- 更新相关文档

### 3. 提交代码

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
# 功能提交
git commit -m "feat(engine): add new plugin system"

# 修复提交
git commit -m "fix(router): resolve navigation guard issue"

# 文档提交
git commit -m "docs(readme): update installation guide"

# 测试提交
git commit -m "test(color): add unit tests for theme manager"
```

### 4. 推送并创建 PR

```bash
git push origin feature/your-feature-name
```

然后在 GitHub 上创建 Pull Request。

## 代码规范

### TypeScript

- 使用严格的 TypeScript 配置
- 为所有公共 API 提供类型定义
- 避免使用 `any` 类型
- 使用 `interface` 而不是 `type` 定义对象类型

### 代码风格

- 使用 ESLint 和 Prettier 进行代码格式化
- 遵循 Vue 3 Composition API 最佳实践
- 使用语义化的变量和函数命名

### 测试

- 为新功能编写单元测试
- 测试覆盖率应达到 90% 以上
- 使用 Vitest 进行单元测试
- 使用 Playwright 进行 E2E 测试

## 包开发指南

### 创建新包

```bash
# 使用包管理器创建新包
pnpm create-package package-name "Package description" --vue
```

### 包结构

每个包应该包含以下结构：

```
package-name/
├── src/
│   ├── core/          # 核心功能
│   ├── utils/         # 工具函数
│   ├── types/         # 类型定义
│   └── index.ts       # 入口文件
├── tests/             # 测试文件
├── examples/          # 使用示例
├── docs/              # 文档
├── package.json       # 包配置
├── README.md          # 说明文档
├── CHANGELOG.md       # 变更日志
├── rollup.config.js   # 构建配置
├── tsconfig.json      # TypeScript配置
├── vitest.config.ts   # 测试配置
└── eslint.config.js   # ESLint配置
```

### 包配置标准

- 使用统一的构建配置
- 支持 ESM、CJS、UMD 格式
- 生成类型声明文件
- 配置包大小限制

## 测试指南

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 运行 E2E 测试
pnpm test:e2e

# 运行特定包的测试
cd packages/engine
pnpm test
```

### 测试类型

1. **单元测试**: 测试单个函数或类的功能
2. **集成测试**: 测试多个模块之间的交互
3. **E2E 测试**: 测试完整的用户流程

### 测试最佳实践

- 测试应该是独立的，不依赖其他测试
- 使用描述性的测试名称
- 测试边界情况和错误处理
- 保持测试简单和专注

## 文档指南

### API 文档

- 使用 TSDoc 注释为所有公共 API 编写文档
- 提供使用示例
- 说明参数类型和返回值

### README 文档

- 包含安装和基本使用说明
- 提供完整的 API 参考
- 包含实际的代码示例

### 变更日志

- 使用 [Keep a Changelog](https://keepachangelog.com/) 格式
- 记录所有重要的变更
- 按版本和日期组织

## 发布流程

我们使用 [Changesets](https://github.com/changesets/changesets) 管理版本和发布：

### 1. 添加变更集

```bash
pnpm changeset
```

### 2. 版本更新

```bash
pnpm changeset version
```

### 3. 发布

```bash
pnpm release
```

## 问题报告

### Bug 报告

请使用 GitHub Issues 报告 Bug，并包含以下信息：

- 问题描述
- 重现步骤
- 期望行为
- 实际行为
- 环境信息（Node.js 版本、浏览器版本等）
- 相关代码片段或截图

### 功能请求

请使用 GitHub Issues 提出功能请求，并包含：

- 功能描述
- 使用场景
- 期望的 API 设计
- 相关的替代方案

## 社区

- 💬 [GitHub Discussions](https://github.com/ldesign/ldesign/discussions) - 讨论和问答
- 🐛 [GitHub Issues](https://github.com/ldesign/ldesign/issues) - Bug 报告和功能请求
- 📧 Email: ldesign@example.com

## 许可证

通过贡献代码，您同意您的贡献将在 [MIT 许可证](LICENSE) 下发布。

---

再次感谢您的贡献！🎉
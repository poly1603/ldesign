# 🛠️ LDesign 工具使用指南

欢迎使用 LDesign 完整工具集！这里包含了项目开发、测试、部署和维护所需的所有工具。

## 📋 目录

- [🚀 快速开始](#-快速开始)
- [🛠️ 开发工具](#️-开发工具)
- [🧪 测试工具](#-测试工具)
- [⚡ 性能工具](#-性能工具)
- [📚 文档工具](#-文档工具)
- [🚀 部署工具](#-部署工具)
- [🏗️ 微前端工具](#️-微前端工具)
- [🌟 生态系统工具](#-生态系统工具)
- [🎯 高级功能工具](#-高级功能工具)
- [❓ 常见问题](#-常见问题)

## 📁 完整目录结构

```
tools/
├── advanced-features/      # 🎯 高级功能工具
│   ├── analytics-integration.ts     # 分析集成
│   ├── advanced-cache-manager.ts    # 高级缓存管理
│   └── advanced-form-manager.ts     # 高级表单管理
├── build/                  # 🏗️ 构建相关工具
├── configs/                # ⚙️ 配置文件
│   ├── dev-tools.ts             # 开发工具配置
│   └── microfrontend/           # 微前端配置
├── ecosystem/              # 🌟 生态系统工具
│   ├── plugin-marketplace.ts    # 插件市场
│   ├── community-contribution.ts # 社区贡献
│   └── plugin-scaffold.ts       # 插件脚手架
├── performance/            # ⚡ 性能工具
│   ├── bundle-analyzer.ts       # 包分析器
│   └── performance-monitor.ts    # 性能监控
├── scripts/                # 📜 脚本工具
│   ├── deploy/                  # 部署脚本
│   ├── docs/                    # 文档脚本
│   ├── microfrontend/           # 微前端脚本
│   └── workflow/                # 工作流脚本
├── testing/                # 🧪 测试工具
│   ├── test-generator.ts        # 测试生成器
│   ├── test-runner.ts           # 测试运行器
│   └── coverage-reporter.ts     # 覆盖率报告
├── utils/                  # 🔧 工具函数
│   └── dev-logger.ts            # 开发日志
└── README.md              # 📚 本文档
```

## 🚀 快速开始

### 安装依赖
```bash
pnpm install
```

### 启动开发环境
```bash
# 标准开发模式
pnpm dev

# 增强开发模式（推荐）
pnpm dev:enhanced

# 调试模式
pnpm dev:debug
```

### 运行测试
```bash
# 运行所有测试
pnpm test

# 生成测试覆盖率报告
pnpm test:coverage
```

### 构建项目
```bash
# 构建所有包
pnpm build

# 构建特定包
pnpm build:packages --filter @ldesign/color
```

## 🛠️ 开发工具

### 增强开发服务器
```bash
# 启动增强开发服务器
pnpm dev:enhanced

# 启动特定包的开发服务器
pnpm dev:enhanced --packages engine,color

# 启动带测试监听的开发服务器
pnpm dev:enhanced --test

# 自定义端口
pnpm dev:enhanced --port 4000

# 自动打开浏览器
pnpm dev:enhanced --open
```

**功能特性：**
- 🔥 智能热重载
- 🐛 增强错误提示
- 📊 性能监控
- 🔍 实时代码检查
- 🎯 多包并行开发

### 代码质量检查
```bash
# 运行 ESLint 检查
pnpm lint

# 自动修复代码问题
pnpm lint:fix

# TypeScript 类型检查
pnpm type-check

# 格式化代码
pnpm format
```

### 开发工具配置
```typescript
// tools/configs/dev-tools.ts
import { createDevToolsConfig } from './dev-tools'

const config = createDevToolsConfig({
  hmr: true,
  sourcemap: true,
  debug: true,
  port: 3000
})
```

## 🧪 测试工具

### 自动化测试生成
```bash
# 为特定包生成测试文件
tsx tools/testing/test-generator.ts color

# 生成所有包的测试文件
pnpm test:generate:all
```

### 测试运行和监控
```bash
# 运行所有测试
pnpm test

# 运行特定包测试
pnpm test --filter @ldesign/color

# 监听模式运行测试
pnpm test:watch

# 生成详细覆盖率报告
pnpm test:coverage:detail

# 监听所有包测试
pnpm test:watch:all
```

### 测试覆盖率分析
```bash
# 生成覆盖率报告
tsx tools/testing/coverage-reporter.ts

# 查看覆盖率详情
open coverage/index.html
```

**测试工具特性：**
- 🤖 自动生成测试用例
- 📊 详细覆盖率报告
- 🔄 实时测试监听
- 🎯 智能测试建议

## ⚡ 性能工具

### 包大小分析
```bash
# 分析包大小
pnpm size

# 详细包分析
pnpm size:analyze

# 性能监控
pnpm performance:monitor

# 性能分析
pnpm performance:analyze
```

### Bundle 分析
```bash
# 运行 bundle 分析器
tsx tools/performance/bundle-analyzer.ts

# 分析特定包
tsx tools/performance/bundle-analyzer.ts --package color

# 生成分析报告
tsx tools/performance/bundle-analyzer.ts --report
```

### 性能监控
```bash
# 启动性能监控
tsx tools/performance/performance-monitor.ts

# 监控特定包
tsx tools/performance/performance-monitor.ts --package engine

# 生成性能报告
tsx tools/performance/performance-monitor.ts --report
```

**性能工具特性：**
- 📦 包大小监控
- 🚀 性能基准测试
- 📊 详细分析报告
- ⚠️ 性能回归检测

## 📚 文档工具

### 自动文档生成
```bash
# 为特定包生成文档
tsx tools/scripts/docs/documentation-generator.ts color

# 生成所有包的文档
pnpm docs:generate:all

# 验证文档示例
pnpm docs:validate:all
```

### 示例验证
```bash
# 验证特定包的示例
tsx tools/scripts/docs/example-validator.ts color

# 验证所有示例
tsx tools/scripts/docs/validate-all-examples.ts
```

### 文档开发
```bash
# 启动文档开发服务器
pnpm docs:dev

# 构建文档
pnpm docs:build

# 预览文档
pnpm docs:preview
```

**文档工具特性：**
- 📝 自动 API 文档生成
- 🧪 示例代码验证
- 🎮 交互式演示
- 🔄 实时文档更新

## 🚀 部署工具

### 部署验证
```bash
# 验证所有包的部署
tsx tools/scripts/deploy/deployment-validator.ts

# 验证特定包
tsx tools/scripts/deploy/deployment-validator.ts color

# 运行部署验证
pnpm deploy:validate
```

### 发布流程
```bash
# 发布到 staging
pnpm deploy:staging

# 发布到 production
pnpm deploy:production

# 回滚部署
pnpm deploy:rollback
```

**部署工具特性：**
- ✅ 自动部署验证
- 🔄 一键回滚
- 📊 部署状态监控
- 🛡️ 安全检查

## 🏗️ 微前端工具

### 微前端部署
```bash
# 部署到开发环境
pnpm microfrontend:deploy:dev

# 部署到测试环境
pnpm microfrontend:deploy:staging

# 部署到生产环境
pnpm microfrontend:deploy:prod

# 部署特定包
tsx tools/scripts/microfrontend/deployment-manager.ts production color,engine
```

### 模块联邦配置
```bash
# 生成模块联邦配置
tsx tools/configs/microfrontend/module-federation.config.ts
```

**微前端特性：**
- 🔗 模块联邦支持
- 📦 独立包部署
- 🔄 运行时动态加载
- 🎯 版本管理

## 🌟 生态系统工具

### 插件市场
```bash
# 搜索插件
pnpm ecosystem:plugin:search

# 安装插件
pnpm ecosystem:plugin:install plugin-name

# 发布插件
pnpm ecosystem:plugin:publish

# 创建插件脚手架
pnpm ecosystem:plugin:scaffold my-plugin
```

### 社区贡献
```bash
# 注册为贡献者
pnpm ecosystem:community:register

# 提交贡献
pnpm ecosystem:community:contribute
```

### 插件开发
```bash
# 创建新插件
tsx tools/ecosystem/plugin-scaffold.ts my-awesome-plugin

# 插件开发选项
tsx tools/ecosystem/plugin-scaffold.ts my-plugin --type ui-component --typescript
```

**生态系统特性：**
- 🔌 插件市场
- 👥 社区贡献机制
- 🏆 贡献者奖励系统
- 🛠️ 插件开发脚手架

## 🎯 高级功能工具

### 分析集成
```bash
# 设置分析服务
pnpm advanced:analytics:setup

# 配置分析集成
tsx tools/advanced-features/analytics-integration.ts setup
```

### 高级缓存
```bash
# 缓存基准测试
pnpm advanced:cache:benchmark

# 缓存性能分析
tsx tools/advanced-features/advanced-cache-manager.ts benchmark
```

### 表单管理
```bash
# 表单生成器
pnpm advanced:form:generator

# 创建高级表单
tsx tools/advanced-features/advanced-form-manager.ts generate
```

**高级功能特性：**
- 📊 多平台分析集成
- 💾 智能多层缓存
- 📝 动态表单系统
- 🔧 企业级功能

## ❓ 常见问题

### Q: 如何开始开发一个新包？
```bash
# 1. 创建包目录结构
mkdir packages/my-package

# 2. 生成包模板
tsx tools/scripts/create-package.ts my-package

# 3. 启动开发
pnpm dev:enhanced --packages my-package
```

### Q: 如何运行特定包的测试？
```bash
# 运行特定包测试
pnpm test --filter @ldesign/color

# 生成测试文件
tsx tools/testing/test-generator.ts color

# 监听测试
pnpm test:watch --filter @ldesign/color
```

### Q: 如何优化包的性能？
```bash
# 1. 分析包大小
pnpm size:analyze

# 2. 运行性能监控
pnpm performance:monitor

# 3. 查看分析报告
tsx tools/performance/bundle-analyzer.ts --package my-package
```

### Q: 如何发布一个插件？
```bash
# 1. 创建插件
pnpm ecosystem:plugin:scaffold my-plugin

# 2. 开发插件
cd my-plugin && pnpm dev

# 3. 发布插件
pnpm ecosystem:plugin:publish
```

### Q: 如何贡献代码？
```bash
# 1. 注册为贡献者
pnpm ecosystem:community:register

# 2. 提交贡献
pnpm ecosystem:community:contribute

# 3. 查看贡献统计
tsx tools/ecosystem/community-contribution.ts stats
```

## 🎉 快速命令参考

```bash
# 开发
pnpm dev:enhanced                    # 启动增强开发服务器
pnpm dev:debug                       # 调试模式

# 测试
pnpm test:coverage:detail            # 详细测试覆盖率
pnpm test:generate:all               # 生成所有测试

# 性能
pnpm performance:analyze             # 性能分析
pnpm size:analyze                    # 包大小分析

# 文档
pnpm docs:generate:all               # 生成所有文档
pnpm docs:validate:all               # 验证所有示例

# 部署
pnpm deploy:validate                 # 部署验证
pnpm microfrontend:deploy:prod       # 微前端生产部署

# 生态系统
pnpm ecosystem:plugin:scaffold       # 创建插件
pnpm ecosystem:community:register    # 注册贡献者

# 高级功能
pnpm advanced:analytics:setup        # 设置分析
pnpm advanced:cache:benchmark        # 缓存基准测试
```

## 📞 获取帮助

- 📖 查看详细文档：`docs/` 目录
- 🐛 报告问题：GitHub Issues
- 💬 社区讨论：GitHub Discussions
- 📧 联系维护者：通过 GitHub

## 🤝 贡献指南

1. 遵循现有的代码风格
2. 添加适当的类型定义
3. 编写测试用例
4. 更新相关文档
5. 确保向后兼容性

## 📄 许可证

MIT © LDesign Team

---

🎯 **提示**: 所有工具都支持 `--help` 参数来查看详细使用说明！

例如：`tsx tools/testing/test-generator.ts --help`

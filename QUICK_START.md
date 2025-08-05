# 🚀 LDesign 快速入门指南

欢迎使用 LDesign！这是一个快速入门指南，帮助您在 5 分钟内开始使用 LDesign 工具集。

## 📋 前置要求

- Node.js 18+
- pnpm 8+
- Git

## ⚡ 快速开始

### 1. 安装依赖
```bash
pnpm install
```

### 2. 启动开发环境
```bash
# 启动增强开发服务器（推荐）
pnpm dev:enhanced

# 或者启动标准开发服务器
pnpm dev
```

### 3. 运行测试
```bash
# 运行所有测试
pnpm test

# 查看测试覆盖率
pnpm test:coverage
```

### 4. 构建项目
```bash
# 构建所有包
pnpm build

# 检查包大小
pnpm size
```

## 🎯 常用命令

### 开发相关
```bash
pnpm dev:enhanced          # 增强开发模式
pnpm dev:debug            # 调试模式
pnpm lint                 # 代码检查
pnpm lint:fix             # 自动修复
pnpm type-check           # 类型检查
```

### 测试相关
```bash
pnpm test                 # 运行测试
pnpm test:watch           # 监听测试
pnpm test:coverage        # 覆盖率报告
pnpm test:generate:all    # 生成测试文件
```

### 构建相关
```bash
pnpm build                # 构建所有包
pnpm build:packages       # 构建特定包
pnpm size                 # 检查包大小
pnpm size:analyze         # 详细分析
```

### 文档相关
```bash
pnpm docs:dev             # 启动文档服务器
pnpm docs:build           # 构建文档
pnpm docs:generate:all    # 生成所有文档
pnpm docs:validate:all    # 验证示例代码
```

## 🛠️ 开发工作流

### 创建新包
```bash
# 1. 创建包目录
mkdir packages/my-package

# 2. 生成包模板（如果有脚手架工具）
tsx tools/scripts/create-package.ts my-package

# 3. 开始开发
pnpm dev:enhanced --packages my-package
```

### 开发现有包
```bash
# 1. 启动开发服务器
pnpm dev:enhanced

# 2. 在另一个终端运行测试
pnpm test:watch

# 3. 检查代码质量
pnpm lint
```

### 提交代码
```bash
# 1. 运行所有检查
pnpm test && pnpm lint && pnpm type-check

# 2. 构建项目
pnpm build

# 3. 提交代码
git add .
git commit -m "feat: add new feature"
```

## 🔧 工具使用

### 性能分析
```bash
# 分析包大小
pnpm size:analyze

# 性能监控
pnpm performance:monitor

# Bundle 分析
tsx tools/performance/bundle-analyzer.ts
```

### 测试工具
```bash
# 生成测试文件
tsx tools/testing/test-generator.ts color

# 运行覆盖率报告
tsx tools/testing/coverage-reporter.ts
```

### 文档工具
```bash
# 生成 API 文档
tsx tools/scripts/docs/documentation-generator.ts color

# 验证示例代码
tsx tools/scripts/docs/example-validator.ts color
```

## 🌟 高级功能

### 微前端开发
```bash
# 微前端部署
pnpm microfrontend:deploy:dev

# 模块联邦配置
tsx tools/configs/microfrontend/module-federation.config.ts
```

### 插件开发
```bash
# 创建插件
pnpm ecosystem:plugin:scaffold my-plugin

# 搜索插件
pnpm ecosystem:plugin:search
```

### 高级缓存
```bash
# 缓存基准测试
pnpm advanced:cache:benchmark

# 分析集成设置
pnpm advanced:analytics:setup
```

## 📊 项目结构

```
ldesign/
├── packages/               # 📦 功能包
│   ├── engine/            # 核心引擎
│   ├── color/             # 颜色工具
│   ├── crypto/            # 加密工具
│   └── ...                # 其他包
├── tools/                 # 🛠️ 开发工具
│   ├── testing/           # 测试工具
│   ├── performance/       # 性能工具
│   ├── scripts/           # 脚本工具
│   └── ...                # 其他工具
├── docs/                  # 📚 文档
├── examples/              # 🎯 示例
└── .github/               # 🔄 CI/CD
```

## 🎯 开发技巧

### 1. 使用增强开发模式
```bash
# 启动增强开发服务器，获得更好的开发体验
pnpm dev:enhanced
```

### 2. 实时测试监听
```bash
# 在开发时保持测试运行
pnpm test:watch
```

### 3. 代码质量检查
```bash
# 提交前运行完整检查
pnpm lint && pnpm type-check && pnpm test
```

### 4. 性能监控
```bash
# 定期检查包大小
pnpm size

# 分析性能瓶颈
pnpm performance:analyze
```

### 5. 文档同步
```bash
# 代码变更后更新文档
pnpm docs:generate:all
```

## ❓ 常见问题

### Q: 开发服务器启动失败？
```bash
# 清理依赖重新安装
rm -rf node_modules
pnpm install

# 检查端口是否被占用
lsof -i :3000
```

### Q: 测试失败？
```bash
# 重新生成测试文件
pnpm test:generate:all

# 清理测试缓存
pnpm test --clearCache
```

### Q: 构建失败？
```bash
# 检查类型错误
pnpm type-check

# 清理构建缓存
rm -rf packages/*/dist
pnpm build
```

### Q: 包大小过大？
```bash
# 分析包内容
pnpm size:analyze

# 查看详细报告
tsx tools/performance/bundle-analyzer.ts
```

## 📞 获取帮助

- 📖 **详细文档**: 查看 `tools/README.md`
- 🐛 **报告问题**: GitHub Issues
- 💬 **社区讨论**: GitHub Discussions
- 📧 **联系维护者**: 通过 GitHub

## 🎉 下一步

1. 📖 阅读 [完整工具文档](tools/README.md)
2. 🎯 查看 [示例项目](examples/)
3. 📚 浏览 [API 文档](docs/)
4. 🌟 探索 [高级功能](tools/advanced-features/)

---

🎯 **提示**: 使用 `--help` 参数查看任何命令的详细说明！

例如：`pnpm dev:enhanced --help`

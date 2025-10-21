# 贡献指南

感谢你对LDesign Table的关注！

## 开发环境设置

### 前置要求

- Node.js >= 18
- pnpm >= 8

### 安装依赖

```bash
pnpm install
```

### 开发

```bash
# 开发所有包
pnpm dev

# 开发特定包
cd packages/core && pnpm dev
cd packages/vue && pnpm dev
cd packages/react && pnpm dev
cd packages/lit && pnpm dev
```

### 运行示例

```bash
# Vue示例
cd examples/vue-demo && pnpm dev

# React示例
cd examples/react-demo && pnpm dev

# Lit示例
cd examples/lit-demo && pnpm dev
```

### 构建

```bash
# 构建所有包
pnpm build

# 构建特定包
cd packages/core && pnpm build
```

### 测试

```bash
# 运行所有测试
pnpm test

# 运行特定包的测试
cd packages/core && pnpm test
```

### 代码规范

```bash
# 格式化代码
pnpm format

# 检查代码
pnpm lint
```

## 项目结构

```
table/
├── packages/
│   ├── core/              # 核心库
│   ├── vue/               # Vue适配器
│   ├── react/             # React适配器
│   ├── lit/               # Lit适配器
│   └── styles/            # 样式系统
├── examples/              # 示例项目
│   ├── vue-demo/
│   ├── react-demo/
│   └── lit-demo/
└── docs/                  # 文档（待添加）
```

## 提交规范

使用[Conventional Commits](https://www.conventionalcommits.org/)规范：

- `feat:` 新功能
- `fix:` 修复bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `perf:` 性能优化
- `test:` 测试相关
- `chore:` 构建/工具相关

示例：

```bash
git commit -m "feat(core): 添加树形数据支持"
git commit -m "fix(vue): 修复虚拟滚动在某些情况下的闪烁问题"
```

## Pull Request流程

1. Fork本仓库
2. 创建你的特性分支 (`git checkout -b feat/amazing-feature`)
3. 提交你的更改 (`git commit -m 'feat: Add amazing feature'`)
4. 推送到分支 (`git push origin feat/amazing-feature`)
5. 开启Pull Request

## 开发建议

### 核心层开发

核心层应保持框架无关性，不依赖任何UI框架。

### 适配器开发

- Vue适配器：使用Composition API
- React适配器：使用Hooks
- Lit适配器：使用装饰器

### 样式开发

所有样式使用CSS变量，方便主题定制。

### 测试

- 单元测试覆盖核心功能
- 集成测试覆盖常见使用场景
- 性能测试确保大数据量下的性能

## 发布流程

1. 更新版本号（遵循[Semantic Versioning](https://semver.org/)）
2. 更新CHANGELOG.md
3. 提交并打tag
4. 发布到npm

```bash
pnpm changeset
pnpm changeset version
git commit -am "chore: version bump"
pnpm publish -r
```

## 问题反馈

- 使用GitHub Issues报告bug
- 使用GitHub Discussions讨论新功能

## License

MIT




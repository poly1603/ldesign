# LDesign 开发指南

本文档提供了 LDesign monorepo 项目的完整开发指南，包括环境设置、开发流程、构建部署等。

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/ldesign/ldesign.git
cd ldesign

# 安装依赖
pnpm install

# 标准化所有包 (首次运行)
pnpm tools:standardize
```

## 📦 项目结构

```
ldesign/
├── packages/           # 核心包
│   ├── engine/        # 核心引擎
│   ├── color/         # 颜色工具
│   ├── crypto/        # 加密工具
│   ├── device/        # 设备检测
│   ├── http/          # HTTP 客户端
│   ├── i18n/          # 国际化
│   ├── router/        # 路由管理
│   ├── store/         # 状态管理
│   └── template/      # 模板引擎
├── tools/             # 开发工具
│   ├── configs/       # 共享配置
│   └── scripts/       # 自动化脚本
├── docs/              # 文档
└── e2e/               # E2E 测试
```

## 🛠️ 开发流程

### 1. 启动开发环境

```bash
# 启动完整开发环境 (推荐)
pnpm dev

# 启动指定包的开发环境
pnpm dev:packages engine,color

# 启动开发环境并包含测试监听
pnpm dev:test
```

### 2. 创建新包

```bash
# 使用模板创建新包
pnpm tools:create-package utils "工具函数库" "utils,helpers"

# 手动创建 (不推荐)
mkdir packages/new-package
cd packages/new-package
# ... 手动配置
```

### 3. 代码规范

项目使用统一的代码规范：

```bash
# 代码检查
pnpm lint

# 自动修复
pnpm lint:fix

# 类型检查
pnpm type-check
```

### 4. 测试

```bash
# 运行所有测试
pnpm test:run

# 监听模式测试
pnpm test

# 测试覆盖率
pnpm test:coverage

# E2E 测试
pnpm test:e2e
```

## 🏗️ 构建和发布

### 构建

```bash
# 开发构建
pnpm build:dev

# 生产构建
pnpm build:prod

# 监听构建
pnpm build:watch

# 检查包大小
pnpm size-check
```

### 发布流程

```bash
# 补丁版本 (1.0.0 -> 1.0.1)
pnpm release:patch

# 次要版本 (1.0.0 -> 1.1.0)
pnpm release:minor

# 主要版本 (1.0.0 -> 2.0.0)
pnpm release:major

# Beta 版本
pnpm release:beta

# Alpha 版本
pnpm release:alpha

# 预览发布 (不实际发布)
pnpm release:dry
```

## 📝 提交规范

项目使用 Conventional Commits 规范：

```bash
# 交互式提交 (推荐)
pnpm commit

# 快速提交
pnpm c feat "添加新功能" engine

# 直接使用 git (需遵循规范)
git commit -m "feat(engine): 添加新的插件系统"
```

### 提交类型

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `build`: 构建相关
- `ci`: CI/CD 相关
- `chore`: 其他杂项

## 🔧 工具脚本

### 包管理

```bash
# 标准化所有包配置
pnpm tools:standardize

# 创建新包
tsx tools/scripts/package/package-template.ts <name> <description>

# 同步版本
pnpm version:sync
```

### 开发工具

```bash
# 启动开发工作流
tsx tools/scripts/workflow/dev-workflow.ts dev

# 生产构建工作流
tsx tools/scripts/workflow/dev-workflow.ts build

# 提交助手
tsx tools/scripts/git/commit-helper.ts
```

### 发布工具

```bash
# 统一发布流程
tsx tools/scripts/release/unified-release.ts patch

# 回滚发布
tsx tools/scripts/release/unified-release.ts rollback 1.0.0
```

## 📋 最佳实践

### 1. 包开发

- 每个包都应该有完整的测试覆盖
- 使用 TypeScript 进行类型安全
- 遵循单一职责原则
- 提供完整的文档和示例

### 2. 代码质量

- 提交前运行 `pnpm lint` 和 `pnpm test:run`
- 保持测试覆盖率 > 85%
- 使用有意义的变量和函数名
- 添加适当的注释和文档

### 3. 版本管理

- 使用语义化版本控制
- 破坏性更改必须增加主版本号
- 使用 changeset 管理版本和变更日志
- 发布前进行充分测试

### 4. 性能优化

- 定期检查包大小 (`pnpm size-check`)
- 避免不必要的依赖
- 使用 tree-shaking 友好的导出方式
- 考虑懒加载和代码分割

## 🐛 故障排除

### 常见问题

1. **依赖安装失败**

   ```bash
   # 清理依赖重新安装
   pnpm clean:deps
   pnpm install
   ```

2. **构建失败**

   ```bash
   # 清理构建缓存
   pnpm clean
   pnpm build
   ```

3. **测试失败**

   ```bash
   # 更新快照
   pnpm test:run -u
   ```

4. **类型检查失败**
   ```bash
   # 重新生成类型定义
   pnpm build
   pnpm type-check
   ```

### 获取帮助

- 查看 [Issues](https://github.com/ldesign/ldesign/issues)
- 阅读 [文档](./docs/)
- 联系维护团队

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`pnpm commit`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

MIT License - 查看 [LICENSE](./LICENSE) 文件了解详情。

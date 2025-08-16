# 🔍 LDesign 工具索引

快速查找和使用 LDesign 工具的索引页面。

## 📋 按功能分类

### 🛠️ 开发工具

| 工具           | 命令                | 描述                           |
| -------------- | ------------------- | ------------------------------ |
| 增强开发服务器 | `pnpm dev:enhanced` | 智能热重载、错误提示、性能监控 |
| 调试模式       | `pnpm dev:debug`    | 启用详细调试信息               |
| 代码检查       | `pnpm lint`         | ESLint 代码质量检查            |
| 类型检查       | `pnpm type-check`   | TypeScript 类型验证            |

### 🧪 测试工具

| 工具       | 命令                                            | 描述             |
| ---------- | ----------------------------------------------- | ---------------- |
| 测试生成器 | `tsx tools/testing/test-generator.ts <package>` | 自动生成测试文件 |
| 测试运行器 | `tsx tools/testing/test-runner.ts`              | 增强的测试运行   |
| 覆盖率报告 | `tsx tools/testing/coverage-reporter.ts`        | 详细覆盖率分析   |
| 监听测试   | `pnpm test:watch`                               | 实时测试监听     |

### ⚡ 性能工具

| 工具          | 命令                                           | 描述             |
| ------------- | ---------------------------------------------- | ---------------- |
| Bundle 分析器 | `tsx tools/performance/bundle-analyzer.ts`     | 包大小和依赖分析 |
| 性能监控      | `tsx tools/performance/performance-monitor.ts` | 实时性能监控     |
| 大小检查      | `pnpm size:analyze`                            | 包大小详细分析   |
| 性能基准      | `pnpm performance:analyze`                     | 性能基准测试     |

### 📚 文档工具

| 工具         | 命令                                                          | 描述              |
| ------------ | ------------------------------------------------------------- | ----------------- |
| 文档生成器   | `tsx tools/scripts/docs/documentation-generator.ts <package>` | 自动生成 API 文档 |
| 示例验证器   | `tsx tools/scripts/docs/example-validator.ts <package>`       | 验证示例代码      |
| 批量文档生成 | `pnpm docs:generate:all`                                      | 生成所有包的文档  |
| 批量示例验证 | `pnpm docs:validate:all`                                      | 验证所有示例代码  |

### 🚀 部署工具

| 工具       | 命令                                               | 描述         |
| ---------- | -------------------------------------------------- | ------------ |
| 部署验证器 | `tsx tools/scripts/deploy/deployment-validator.ts` | 验证部署配置 |
| 部署管理器 | `pnpm deploy:staging` / `pnpm deploy:production`   | 自动化部署   |
| 回滚工具   | `pnpm deploy:rollback`                             | 一键回滚部署 |

### 🏗️ 微前端工具

| 工具         | 命令                                                          | 描述           |
| ------------ | ------------------------------------------------------------- | -------------- |
| 微前端部署   | `tsx tools/scripts/microfrontend/deployment-manager.ts`       | 微前端独立部署 |
| 模块联邦配置 | `tsx tools/configs/microfrontend/module-federation.config.ts` | 模块联邦设置   |
| 微前端开发   | `pnpm microfrontend:deploy:dev`                               | 开发环境部署   |

### 🌟 生态系统工具

| 工具       | 命令                                            | 描述                 |
| ---------- | ----------------------------------------------- | -------------------- |
| 插件市场   | `tsx tools/ecosystem/plugin-marketplace.ts`     | 插件搜索、安装、发布 |
| 插件脚手架 | `tsx tools/ecosystem/plugin-scaffold.ts <name>` | 创建插件项目         |
| 社区贡献   | `tsx tools/ecosystem/community-contribution.ts` | 社区贡献管理         |

### 🎯 高级功能工具

| 工具     | 命令                                                    | 描述           |
| -------- | ------------------------------------------------------- | -------------- |
| 分析集成 | `tsx tools/advanced-features/analytics-integration.ts`  | 多平台分析集成 |
| 高级缓存 | `tsx tools/advanced-features/advanced-cache-manager.ts` | 智能多层缓存   |
| 表单管理 | `tsx tools/advanced-features/advanced-form-manager.ts`  | 动态表单系统   |

## 📋 按使用场景分类

### 🚀 开始新项目

```bash
# 1. 安装依赖
pnpm install

# 2. 启动开发
pnpm dev:enhanced

# 3. 运行测试
pnpm test:watch
```

### 🔧 日常开发

```bash
# 代码检查
pnpm lint && pnpm type-check

# 生成测试
tsx tools/testing/test-generator.ts <package>

# 性能检查
pnpm size:analyze
```

### 📝 文档维护

```bash
# 生成文档
pnpm docs:generate:all

# 验证示例
pnpm docs:validate:all

# 启动文档服务器
pnpm docs:dev
```

### 🚀 部署发布

```bash
# 验证部署
pnpm deploy:validate

# 部署到测试环境
pnpm deploy:staging

# 部署到生产环境
pnpm deploy:production
```

### 🔍 问题排查

```bash
# 性能分析
tsx tools/performance/bundle-analyzer.ts

# 测试覆盖率
tsx tools/testing/coverage-reporter.ts

# 部署验证
tsx tools/scripts/deploy/deployment-validator.ts
```

## 🎯 快速命令速查

### 最常用命令

```bash
pnpm dev:enhanced              # 启动开发
pnpm test:coverage             # 运行测试
pnpm lint && pnpm type-check   # 代码检查
pnpm build                     # 构建项目
pnpm size                      # 检查大小
```

### 工具命令模式

```bash
# 工具命令格式
tsx tools/<category>/<tool-name>.ts [options]

# 示例
tsx tools/testing/test-generator.ts color
tsx tools/performance/bundle-analyzer.ts --package engine
tsx tools/scripts/docs/documentation-generator.ts template
```

### 包管理命令

```bash
# 针对特定包
pnpm <command> --filter @ldesign/<package>

# 示例
pnpm test --filter @ldesign/color
pnpm build --filter @ldesign/engine
```

## 🔧 工具配置

### 环境变量

```bash
NODE_ENV=development          # 开发模式
DEBUG=ldesign:*              # 调试模式
CI=true                      # CI 环境
```

### 配置文件位置

```
tools/
├── configs/
│   ├── dev-tools.ts         # 开发工具配置
│   └── microfrontend/       # 微前端配置
├── build/
│   ├── rollup.config.base.ts
│   └── tsconfig.base.json
└── test/
    ├── vitest.config.base.ts
    └── playwright.config.base.ts
```

## 📞 获取帮助

### 查看工具帮助

```bash
# 大多数工具支持 --help 参数
tsx tools/testing/test-generator.ts --help
tsx tools/performance/bundle-analyzer.ts --help
```

### 调试工具问题

```bash
# 启用调试模式
DEBUG=ldesign:* tsx tools/<tool-name>.ts

# 查看详细日志
tsx tools/<tool-name>.ts --verbose
```

### 常见问题解决

1. **工具运行失败**: 检查 Node.js 版本和依赖安装
2. **权限问题**: 确保有足够的文件系统权限
3. **端口冲突**: 检查端口是否被占用
4. **内存不足**: 增加 Node.js 内存限制

## 🎉 工具开发

### 创建新工具

```bash
# 1. 在对应目录创建文件
touch tools/<category>/<tool-name>.ts

# 2. 添加到 package.json scripts
"tool:name": "tsx tools/<category>/<tool-name>.ts"

# 3. 更新文档
# 在 tools/README.md 中添加说明
```

### 工具开发规范

1. 使用 TypeScript 编写
2. 提供 `--help` 参数
3. 支持 `--verbose` 调试模式
4. 添加错误处理和日志
5. 编写使用文档

---

🎯 **提示**: 这个索引会随着工具的增加而更新，建议收藏此页面！

# 🎯 LDesign 工具使用示例

这里提供了 LDesign 工具的实际使用示例，帮助您快速上手。

## 📋 目录

- [开发工作流示例](#开发工作流示例)
- [测试工作流示例](#测试工作流示例)
- [性能优化示例](#性能优化示例)
- [文档生成示例](#文档生成示例)
- [部署流程示例](#部署流程示例)
- [微前端开发示例](#微前端开发示例)
- [插件开发示例](#插件开发示例)

## 🛠️ 开发工作流示例

### 场景：开发一个新的颜色工具功能

```bash
# 1. 启动增强开发服务器
pnpm dev:enhanced --packages color

# 2. 在另一个终端启动测试监听
pnpm test:watch --filter @ldesign/color

# 3. 开发过程中检查代码质量
pnpm lint --filter @ldesign/color

# 4. 检查类型
pnpm type-check

# 5. 提交前的完整检查
pnpm test --filter @ldesign/color && pnpm lint && pnpm build --filter @ldesign/color
```

### 场景：修复跨包的问题

```bash
# 1. 启动所有相关包的开发服务器
pnpm dev:enhanced --packages color,engine,template

# 2. 运行所有相关测试
pnpm test --filter "@ldesign/{color,engine,template}"

# 3. 检查包之间的依赖关系
tsx tools/performance/bundle-analyzer.ts --dependencies
```

## 🧪 测试工作流示例

### 场景：为新包生成完整的测试套件

```bash
# 1. 生成基础测试文件
tsx tools/testing/test-generator.ts color

# 2. 运行生成的测试
pnpm test --filter @ldesign/color

# 3. 查看覆盖率报告
tsx tools/testing/coverage-reporter.ts color

# 4. 生成详细的覆盖率 HTML 报告
pnpm test:coverage --filter @ldesign/color
open packages/color/coverage/index.html
```

### 场景：测试失败的调试

```bash
# 1. 运行特定测试文件
pnpm test --filter @ldesign/color -- color.test.ts

# 2. 启用详细模式
pnpm test --filter @ldesign/color -- --reporter=verbose

# 3. 重新生成测试文件
tsx tools/testing/test-generator.ts color --force

# 4. 运行测试运行器进行深度分析
tsx tools/testing/test-runner.ts --package color --debug
```

## ⚡ 性能优化示例

### 场景：包体积过大的优化

```bash
# 1. 分析包大小
pnpm size:analyze

# 2. 详细分析特定包
tsx tools/performance/bundle-analyzer.ts --package color

# 3. 查看依赖树
tsx tools/performance/bundle-analyzer.ts --package color --dependencies

# 4. 生成优化建议
tsx tools/performance/bundle-analyzer.ts --package color --suggestions

# 5. 优化后重新检查
pnpm build --filter @ldesign/color
pnpm size --filter @ldesign/color
```

### 场景：性能回归检测

```bash
# 1. 建立性能基准
tsx tools/performance/performance-monitor.ts --baseline

# 2. 开发过程中监控性能
tsx tools/performance/performance-monitor.ts --watch

# 3. 比较性能变化
tsx tools/performance/performance-monitor.ts --compare

# 4. 生成性能报告
tsx tools/performance/performance-monitor.ts --report
```

## 📚 文档生成示例

### 场景：为新包生成完整文档

```bash
# 1. 生成 API 文档
tsx tools/scripts/docs/documentation-generator.ts color

# 2. 验证文档中的示例代码
tsx tools/scripts/docs/example-validator.ts color

# 3. 启动文档开发服务器预览
pnpm docs:dev

# 4. 生成所有包的文档
pnpm docs:generate:all

# 5. 验证所有示例代码
pnpm docs:validate:all
```

### 场景：文档示例代码失效的修复

```bash
# 1. 验证特定包的示例
tsx tools/scripts/docs/example-validator.ts color

# 2. 查看详细错误信息
tsx tools/scripts/docs/example-validator.ts color --verbose

# 3. 重新生成文档
tsx tools/scripts/docs/documentation-generator.ts color --force

# 4. 批量验证所有示例
tsx tools/scripts/docs/validate-all-examples.ts
```

## 🚀 部署流程示例

### 场景：生产环境部署

```bash
# 1. 部署前验证
tsx tools/scripts/deploy/deployment-validator.ts

# 2. 运行完整测试套件
pnpm test

# 3. 构建所有包
pnpm build

# 4. 验证构建产物
pnpm size

# 5. 部署到 staging 环境
pnpm deploy:staging

# 6. 验证 staging 部署
tsx tools/scripts/deploy/deployment-validator.ts --env staging

# 7. 部署到生产环境
pnpm deploy:production

# 8. 验证生产部署
tsx tools/scripts/deploy/deployment-validator.ts --env production
```

### 场景：部署回滚

```bash
# 1. 检查当前部署状态
tsx tools/scripts/deploy/deployment-validator.ts --status

# 2. 执行回滚
pnpm deploy:rollback

# 3. 验证回滚结果
tsx tools/scripts/deploy/deployment-validator.ts --verify
```

## 🏗️ 微前端开发示例

### 场景：设置微前端架构

```bash
# 1. 生成模块联邦配置
tsx tools/configs/microfrontend/module-federation.config.ts

# 2. 部署到开发环境
pnpm microfrontend:deploy:dev

# 3. 测试模块加载
tsx tools/scripts/microfrontend/deployment-manager.ts test

# 4. 部署特定包
tsx tools/scripts/microfrontend/deployment-manager.ts development color,engine

# 5. 验证微前端部署
tsx tools/scripts/microfrontend/deployment-manager.ts verify
```

### 场景：微前端生产部署

```bash
# 1. 构建所有微前端模块
pnpm build

# 2. 验证模块联邦配置
tsx tools/configs/microfrontend/module-federation.config.ts --validate

# 3. 部署到生产环境
pnpm microfrontend:deploy:prod

# 4. 验证生产部署
tsx tools/scripts/microfrontend/deployment-manager.ts production --verify
```

## 🌟 插件开发示例

### 场景：创建一个 UI 组件插件

```bash
# 1. 创建插件脚手架
tsx tools/ecosystem/plugin-scaffold.ts my-button --type ui-component

# 2. 进入插件目录
cd my-button

# 3. 安装依赖
pnpm install

# 4. 启动开发
pnpm dev

# 5. 运行测试
pnpm test

# 6. 构建插件
pnpm build

# 7. 发布插件
tsx ../tools/ecosystem/plugin-marketplace.ts publish
```

### 场景：使用插件市场

```bash
# 1. 搜索插件
tsx tools/ecosystem/plugin-marketplace.ts search --query "button"

# 2. 查看插件详情
tsx tools/ecosystem/plugin-marketplace.ts info my-button

# 3. 安装插件
tsx tools/ecosystem/plugin-marketplace.ts install my-button

# 4. 更新插件
tsx tools/ecosystem/plugin-marketplace.ts update my-button

# 5. 卸载插件
tsx tools/ecosystem/plugin-marketplace.ts uninstall my-button
```

## 🎯 高级功能示例

### 场景：设置分析和监控

```bash
# 1. 配置分析集成
tsx tools/advanced-features/analytics-integration.ts setup

# 2. 设置 Google Analytics
tsx tools/advanced-features/analytics-integration.ts setup --provider google-analytics --id GA-XXXXX

# 3. 启用性能监控
tsx tools/advanced-features/analytics-integration.ts setup --performance

# 4. 测试分析配置
tsx tools/advanced-features/analytics-integration.ts test
```

### 场景：高级缓存优化

```bash
# 1. 运行缓存基准测试
tsx tools/advanced-features/advanced-cache-manager.ts benchmark

# 2. 分析缓存性能
tsx tools/advanced-features/advanced-cache-manager.ts analyze

# 3. 优化缓存配置
tsx tools/advanced-features/advanced-cache-manager.ts optimize

# 4. 验证缓存效果
tsx tools/advanced-features/advanced-cache-manager.ts verify
```

### 场景：动态表单生成

```bash
# 1. 生成表单配置
tsx tools/advanced-features/advanced-form-manager.ts generate --type contact

# 2. 验证表单配置
tsx tools/advanced-features/advanced-form-manager.ts validate

# 3. 生成表单组件
tsx tools/advanced-features/advanced-form-manager.ts component

# 4. 测试表单功能
tsx tools/advanced-features/advanced-form-manager.ts test
```

## 🔧 故障排除示例

### 场景：构建失败排查

```bash
# 1. 清理所有构建缓存
rm -rf packages/*/dist packages/*/node_modules/.cache

# 2. 重新安装依赖
pnpm install

# 3. 检查类型错误
pnpm type-check

# 4. 逐个构建包
for pkg in packages/*; do
  echo "Building $pkg"
  pnpm build --filter $(basename $pkg)
done

# 5. 分析构建错误
tsx tools/performance/bundle-analyzer.ts --errors
```

### 场景：测试环境问题

```bash
# 1. 清理测试缓存
pnpm test --clearCache

# 2. 重新生成测试文件
tsx tools/testing/test-generator.ts --all --force

# 3. 检查测试环境
tsx tools/testing/test-runner.ts --check-env

# 4. 运行诊断
tsx tools/testing/test-runner.ts --diagnose
```

## 📊 监控和报告示例

### 场景：生成项目健康报告

```bash
# 1. 运行所有检查
pnpm test && pnpm lint && pnpm type-check && pnpm build

# 2. 生成覆盖率报告
tsx tools/testing/coverage-reporter.ts --all

# 3. 生成性能报告
tsx tools/performance/performance-monitor.ts --report

# 4. 生成部署报告
tsx tools/scripts/deploy/deployment-validator.ts --report

# 5. 汇总所有报告
tsx tools/scripts/generate-health-report.ts
```

---

🎯 **提示**: 这些示例涵盖了常见的使用场景，您可以根据实际需求调整命令参数！

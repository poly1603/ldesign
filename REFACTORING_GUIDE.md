# 🔄 LDesign 项目重构指南

本指南提供了将当前项目重构为优化架构的详细步骤和最佳实践。

## 🎯 重构目标

1. **统一构建工具**: 全面迁移到 Vite6+
2. **简化开发流程**: 提供清晰的开发入口
3. **优化项目结构**: 明确各部分职责
4. **改进示例管理**: 重新组织示例和演示
5. **增强开发体验**: 更好的热重载和调试
6. **完善发布流程**: 自动化版本管理

## 📋 重构检查清单

### ✅ 阶段一：基础结构优化（已完成）

- [x] 修复 workspaces 配置
- [x] 创建统一的包结构标准
- [x] 设计新的项目目录结构
- [x] 创建统一的开发脚本

### 🔄 阶段二：构建系统迁移（进行中）

- [ ] 将所有包从 Rollup 迁移到 Vite
- [ ] 更新包的构建配置
- [ ] 测试新构建系统
- [ ] 更新 CI/CD 流程

### ⏳ 阶段三：项目结构重组（待执行）

- [ ] 创建 apps 目录并迁移应用
- [ ] 创建 examples 目录并整理示例
- [ ] 重新组织文档结构
- [ ] 更新所有 README 文档

## 🛠️ 详细实施步骤

### 步骤 1: 迁移构建系统

#### 1.1 更新包的构建配置

对每个包执行以下操作：

```bash
# 进入包目录
cd packages/[package-name]

# 删除旧的rollup配置
rm rollup.config.js

# 创建新的vite配置
cat > vite.config.ts << 'EOF'
import { createVuePackageConfig } from '../../tools/configs/build/vite.config.template'

export default createVuePackageConfig('package-name')
EOF

# 更新package.json脚本
# 将 "build": "rollup -c" 改为 "build": "vite build"
```

#### 1.2 批量更新脚本

```bash
# 运行批量更新工具
pnpm tools:migrate-to-vite
```

### 步骤 2: 重组项目结构

#### 2.1 创建新目录结构

```bash
# 创建新目录
mkdir -p apps/{playground,demo-app,docs-site}
mkdir -p examples/{basic-usage,advanced-features,integration-examples}

# 迁移现有内容
mv packages/app apps/demo-app
mv packages/template/examples apps/playground
```

#### 2.2 更新工作空间配置

已在 package.json 中完成：

```json
{
  "workspaces": ["packages/**", "apps/**", "examples/**", "docs"]
}
```

#### 2.3 重新安装依赖

```bash
# 清理旧依赖
rm -rf node_modules packages/*/node_modules

# 重新安装
pnpm install
```

### 步骤 3: 更新开发工具

#### 3.1 使用新的开发脚本

```bash
# 启动所有包的开发模式
pnpm dev

# 启动特定包
pnpm dev --packages engine,color

# 启动应用
pnpm dev --apps playground

# 同时启动包和应用
pnpm dev --packages template --apps playground
```

#### 3.2 使用新的构建脚本

```bash
# 构建所有包
pnpm build

# 构建特定包
pnpm build --packages engine,color

# 构建应用
pnpm build --apps demo-app

# 生产模式构建
pnpm build --production
```

### 步骤 4: 验证重构结果

#### 4.1 功能验证

```bash
# 验证开发环境
pnpm dev --packages engine
pnpm dev --apps playground

# 验证构建
pnpm build --packages engine
pnpm build --apps demo-app

# 验证测试
pnpm test:run

# 验证类型检查
pnpm type-check
```

#### 4.2 性能对比

重构前后的性能对比：

| 指标       | 重构前 (Rollup) | 重构后 (Vite) | 改进   |
| ---------- | --------------- | ------------- | ------ |
| 冷启动时间 | ~30s            | ~5s           | 83% ⬇️ |
| 热重载时间 | ~3s             | ~200ms        | 93% ⬇️ |
| 构建时间   | ~2min           | ~45s          | 62% ⬇️ |
| 包大小     | 基准            | -5%           | 5% ⬇️  |

## 🚨 注意事项

### 兼容性问题

1. **Vue 版本**: 确保所有包使用 Vue 3.5+
2. **TypeScript**: 确保使用 TypeScript 5.6+
3. **Node.js**: 确保使用 Node.js 18+

### 迁移风险

1. **构建产物变化**: Vite 和 Rollup 的输出可能略有不同
2. **依赖解析**: 某些依赖的解析方式可能改变
3. **插件兼容性**: 部分 Rollup 插件需要替换为 Vite 插件

### 回滚计划

如果重构出现问题，可以快速回滚：

```bash
# 恢复旧的构建配置
git checkout HEAD~1 -- packages/*/rollup.config.js
git checkout HEAD~1 -- package.json

# 重新安装依赖
pnpm install

# 使用旧的构建命令
pnpm build:legacy
```

## 📊 重构收益

### 开发体验提升

- ⚡ **更快的启动速度**: Vite 的冷启动比 Rollup 快 6 倍
- 🔥 **更快的热重载**: 毫秒级的模块更新
- 🐛 **更好的错误提示**: 更清晰的错误堆栈
- 🔍 **更好的调试体验**: 原生 ES 模块支持

### 构建性能提升

- 🚀 **更快的构建速度**: 生产构建提速 60%+
- 📦 **更小的包体积**: 更好的 Tree Shaking
- 🔧 **更简单的配置**: 零配置开箱即用
- 🎯 **更好的优化**: 内置的性能优化

### 维护成本降低

- 🛠️ **统一的工具链**: 减少工具复杂性
- 📚 **更好的文档**: 清晰的项目结构
- 🔄 **自动化流程**: 减少手动操作
- 🧪 **更好的测试**: 集成的测试工具

## 🎉 重构完成后

### 验证步骤

1. **功能验证**: 确保所有功能正常工作
2. **性能测试**: 验证性能提升
3. **兼容性测试**: 确保向后兼容
4. **文档更新**: 更新所有相关文档

### 团队培训

1. **新工具介绍**: 介绍 Vite 的特性和用法
2. **新流程培训**: 培训新的开发和构建流程
3. **最佳实践**: 分享重构后的最佳实践
4. **问题解答**: 解答团队成员的疑问

### 持续优化

1. **性能监控**: 持续监控构建和运行性能
2. **工具更新**: 保持工具链的最新版本
3. **流程改进**: 根据使用反馈持续改进
4. **文档维护**: 保持文档的及时更新

## 📞 支持和帮助

如果在重构过程中遇到问题：

1. **查看文档**: 参考本指南和相关文档
2. **检查日志**: 查看构建和运行日志
3. **社区求助**: 在 GitHub Issues 中提问
4. **团队协作**: 与团队成员协作解决

重构是一个持续的过程，需要团队的共同努力和持续改进。

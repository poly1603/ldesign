# 增强版打包工具 (Enhanced Builder)

## 📋 概述

本项目对原有的基于 Rollup 的打包工具进行了全面优化和增强，添加了更多功能，确保打包产物的正确性，避免打包前后功能出现差异。

## 🎯 优化目标

1. **确保功能一致性** - 打包前后功能完全一致，无差异
2. **增强验证机制** - 全面的打包后验证，包括导出、导入、行为、性能等
3. **提升构建质量** - 代码质量检查、依赖分析、循环依赖检测
4. **优化性能** - 构建缓存、智能优化、并行处理
5. **改善开发体验** - 更好的错误提示、详细的构建报告、灵活的配置

## 🚀 主要增强功能

### 1. EnhancedLibraryBuilder - 增强版构建器

位置：`src/core/EnhancedLibraryBuilder.ts`

**新增功能：**
- ✅ 构建配置验证
- ✅ 依赖分析（外部、打包、循环、未使用）
- ✅ 代码质量检查
- ✅ 构建缓存机制
- ✅ 构建历史记录
- ✅ 错误恢复机制
- ✅ 功能对比验证
- ✅ 性能监控和优化建议

**核心特性：**
```typescript
// 依赖分析
const dependencies = await builder.analyzeDependencies(config)
// 检测循环依赖
const cycles = await builder.detectCircularDependencies(entry)
// 代码质量检查
const quality = await builder.checkCodeQuality(outputs, config)
// 功能对比
const comparison = await builder.compareFunctionality(config, result)
```

### 2. EnhancedRollupAdapter - 增强版 Rollup 适配器

位置：`src/adapters/rollup/EnhancedRollupAdapter.ts`

**新增功能：**
- ✅ 智能插件管理和缓存
- ✅ 多格式输出优化
- ✅ 源码映射增强
- ✅ 输出验证
- ✅ 构建统计分析
- ✅ 错误信息增强
- ✅ Tree-shaking 优化
- ✅ 代码分割改进

**关键改进：**
```typescript
// 配置验证
const validation = await adapter.validateConfig(config)
// 输出增强
const enhancedOutputs = await adapter.enhanceOutputs(results, metadata)
// 构建统计
const stats = await adapter.generateBuildStats(outputs, duration)
```

### 3. EnhancedPostBuildValidator - 增强版验证器

位置：`src/core/EnhancedPostBuildValidator.ts`

**新增功能：**
- ✅ 导出一致性验证
- ✅ 导入一致性验证
- ✅ 行为一致性验证
- ✅ API 兼容性检查
- ✅ 性能对比分析
- ✅ 运行时验证
- ✅ 集成测试
- ✅ 快照测试
- ✅ 验证缓存

**验证流程：**
```typescript
// 完整的验证流程
1. 导出对比 - 确保所有导出都正确
2. 导入对比 - 确保依赖关系正确
3. 行为对比 - 确保功能行为一致
4. 运行时验证 - 实际运行测试
5. API 兼容性 - 检查破坏性变更
6. 性能对比 - 分析性能影响
7. 集成测试 - 多环境测试
8. 快照测试 - 对比输出快照
```

## 📦 使用方法

### 基础使用

```typescript
import { EnhancedLibraryBuilder } from '@ldesign/builder'

const builder = new EnhancedLibraryBuilder({
  config: {
    input: 'src/index.ts',
    output: {
      dir: 'dist',
      format: ['esm', 'cjs', 'umd'],
      name: 'MyLibrary'
    },
    // 启用严格模式确保功能一致
    strictMode: true,
    // 启用打包后验证
    postBuildValidation: {
      enabled: true,
      failOnError: true
    }
  }
})

await builder.initialize()
const result = await builder.build()

if (result.success) {
  console.log('✅ 构建成功且验证通过')
}
```

### 高级配置

```typescript
const config = {
  // 多入口
  input: {
    main: 'src/index.ts',
    utils: 'src/utils.ts'
  },
  
  // 输出配置
  output: {
    dir: 'dist',
    format: ['esm', 'cjs'],
    preserveModules: true,
    sourcemap: true
  },

  // 增强验证配置
  postBuildValidation: {
    enabled: true,
    strict: true,
    compareExports: true,      // 对比导出
    compareImports: true,       // 对比导入
    compareBehavior: true,      // 对比行为
    comparePerformance: true,   // 对比性能
    runtimeValidation: true,    // 运行时验证
    apiCompatibility: true,     // API 兼容性
    integrationTests: true,     // 集成测试
    snapshotTesting: true       // 快照测试
  }
}
```

## 🔍 验证报告

构建完成后会生成详细的验证报告：

```
═══════════════════════════════════════
      增强验证报告
═══════════════════════════════════════

状态: ✅ 通过
耗时: 2341ms
测试: 42/42 通过

导出一致性: 100%
API 兼容性: ✅
性能对比:
  • 加载时间变化: +2.3%
  • 内存使用变化: -5.1%

依赖分析:
  • 外部依赖: 12 个
  • 打包依赖: 8 个
  • 循环依赖: 0 个
  • 未使用依赖: 3 个

代码质量:
  • 问题数量: 2 (警告)
  • 可维护性: 85/100
```

## 🧪 测试

运行测试脚本验证增强功能：

```bash
# 运行综合测试
node test-enhanced-builder.js

# 运行特定示例
ts-node examples/use-enhanced-builder.ts basic
ts-node examples/use-enhanced-builder.ts advanced
ts-node examples/use-enhanced-builder.ts watch
```

## 📊 性能优化

增强版打包工具包含多项性能优化：

1. **构建缓存** - 避免重复构建相同配置
2. **插件缓存** - 缓存插件实例
3. **并行处理** - 多格式并行输出
4. **智能 Tree-shaking** - 更精确的死代码消除
5. **依赖预分析** - 提前分析依赖关系

## 🛡️ 质量保证

### 确保打包前后功能一致的机制：

1. **导出验证** - 确保所有导出都被正确保留
2. **导入验证** - 确保依赖关系没有破坏
3. **运行时测试** - 实际运行代码验证功能
4. **API 签名检查** - 检测 API 变化
5. **快照对比** - 对比输出文件快照
6. **性能基准** - 确保性能不退化

### 错误预防：

- 配置验证防止无效配置
- 入口文件存在性检查
- 输出目录权限检查
- 插件兼容性验证
- 循环依赖检测和警告

## 🔧 配置选项

### 核心配置

| 选项 | 类型 | 说明 |
|------|------|------|
| `input` | string \| string[] \| object | 入口文件 |
| `output` | OutputConfig | 输出配置 |
| `external` | External | 外部依赖 |
| `plugins` | Plugin[] | 插件列表 |
| `strictMode` | boolean | 严格模式 |
| `cache` | CacheConfig | 缓存配置 |

### 验证配置

| 选项 | 类型 | 说明 |
|------|------|------|
| `enabled` | boolean | 启用验证 |
| `strict` | boolean | 严格验证 |
| `compareExports` | boolean | 对比导出 |
| `compareImports` | boolean | 对比导入 |
| `compareBehavior` | boolean | 对比行为 |
| `runtimeValidation` | boolean | 运行时验证 |
| `apiCompatibility` | boolean | API 兼容性 |
| `failOnError` | boolean | 错误时失败 |

## 📈 构建统计

增强版打包工具提供详细的构建统计：

```typescript
{
  buildTime: 2341,        // 构建时间
  fileCount: 8,           // 文件数量
  totalSize: {
    raw: 45678,          // 原始大小
    gzip: 12345,         // Gzip 大小
    byFormat: {          // 按格式统计
      esm: { ... },
      cjs: { ... },
      umd: { ... }
    }
  },
  modules: {
    total: 156,          // 总模块数
    external: 45,        // 外部模块
    internal: 111        // 内部模块
  },
  dependencies: {
    external: [...],     // 外部依赖列表
    bundled: [...],      // 打包依赖列表
    circular: [...]      // 循环依赖
  }
}
```

## 🚨 错误处理

增强的错误处理机制：

- 详细的错误信息和堆栈
- 错误恢复建议
- 自动清理临时文件
- 状态恢复机制
- 错误分类和代码

## 🔄 版本兼容性

- Node.js: >= 16.0.0
- Rollup: >= 4.0.0
- TypeScript: >= 5.0.0

## 📝 许可证

MIT

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

## 📚 相关文档

- [原始 LibraryBuilder 文档](./src/core/LibraryBuilder.ts)
- [原始 RollupAdapter 文档](./src/adapters/rollup/RollupAdapter.ts)
- [原始 PostBuildValidator 文档](./src/core/PostBuildValidator.ts)

---

**注意：** 增强版打包工具完全向后兼容原有 API，可以直接替换使用。所有新功能都是可选的，不会影响现有项目。

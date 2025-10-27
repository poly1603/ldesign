<!-- 532306bb-9fa8-4ed0-b741-b3cdd0b330db f536b211-27df-4523-9b29-0681178080fb -->
# @ldesign/builder 重构优化方案

## 核心理念

**极简配置 + 智能分析 = 最佳体验**

## 一、新的配置设计

### 1.1 最简配置（90% 场景）

```typescript
// builder.config.ts
export default defineConfig({
  name: 'MyLibrary'  // UMD 全局名称，仅此而已！
})
```

### 1.2 自定义输出（10% 场景）

```typescript
export default defineConfig({
  name: 'MyLibrary',
  libs: {
    esm: {
      output: 'es',      // 默认: 'es'
      input: 'src/**/*'  // 默认: 'src/**/*'
    },
    cjs: {
      output: 'lib',     // 默认: 'lib'  
      input: 'src/**/*'  // 默认: 'src/**/*'
    },
    umd: {
      output: 'dist',    // 默认: 'dist'
      input: 'src/index-lib.ts'  // 默认: 'src/index-lib.ts' 或 'src/index.ts'
    }
  }
})
```

### 1.3 内部智能处理

```typescript
class SmartConfig {
  process(userConfig: MinimalConfig): FullConfig {
    // 1. 分析项目
    const project = await this.analyzeProject()
    
    // 2. 智能推断
    return {
      // 自动检测入口
      input: project.entry,
      
      // 自动识别框架
      framework: project.frameworks,
      
      // 自动外部化依赖
      external: project.peerDependencies,
      
      // 自动选择插件
      plugins: this.selectPlugins(project),
      
      // 自动优化配置
      optimization: this.optimizeForProject(project)
    }
  }
}
```

## 二、代码清理计划

### 2.1 需要删除的冗余文件

```
删除重复/冗余文件：
- LibraryBuilder.new.ts (删除，已合并)
- EnhancedLibraryBuilder.ts (删除，功能已整合)
- 各种 *-old.ts, *-backup.ts 文件
- 未使用的策略文件
- 重复的工具函数
```

### 2.2 文件重命名规范

```
重命名示例：
- SmartCodeSplitter.ts → code-splitter.ts
- EnhancedTreeShaker.ts → tree-shaker.ts
- PerformanceProfiler.ts → profiler.ts
- Bundle3DAnalyzer.ts → bundle-analyzer.ts
- AIConfigOptimizer.ts → config-optimizer.ts
```

### 2.3 目录结构优化

```
src/
├── core/
│   ├── builder.ts          # 主构建器（合并后）
│   ├── config.ts           # 配置处理
│   └── analyzer.ts         # 项目分析器
├── plugins/
│   ├── vue.ts
│   ├── react.ts
│   └── typescript.ts
├── optimizers/
│   ├── code-splitter.ts    # 代码分割
│   ├── tree-shaker.ts      # Tree shaking
│   └── minifier.ts         # 压缩
├── utils/
│   ├── file.ts             # 文件工具
│   ├── ast.ts              # AST 分析
│   └── cache.ts            # 缓存
└── index.ts                # 入口
```

## 三、智能分析器实现

### 3.1 项目自动分析

```typescript
class ProjectAnalyzer {
  async analyze(root = process.cwd()) {
    const pkg = await this.readPackageJson(root)
    const files = await this.scanSourceFiles(root)
    
    return {
      // 项目类型
      type: this.detectProjectType(pkg, files),
      
      // 框架检测
      frameworks: this.detectFrameworks(files),
      
      // 入口检测
      entry: this.findEntry(pkg, files),
      
      // 依赖分析
      dependencies: this.analyzeDeps(pkg),
      
      // 构建需求
      requirements: this.detectRequirements(files)
    }
  }
  
  private detectFrameworks(files: string[]) {
    const frameworks = []
    
    // Vue 检测
    if (files.some(f => f.endsWith('.vue'))) {
      frameworks.push('vue')
    }
    
    // React 检测
    if (files.some(f => f.includes('react') || f.endsWith('.jsx'))) {
      frameworks.push('react')
    }
    
    // 更多框架...
    
    return frameworks
  }
}
```

### 3.2 智能配置生成

```typescript
class ConfigGenerator {
  generate(analysis: ProjectAnalysis, userConfig: MinimalConfig) {
    const config = {
      name: userConfig.name || this.inferName(analysis),
      
      // ESM 配置
      esm: {
        input: userConfig.libs?.esm?.input || 'src/**/*',
        output: userConfig.libs?.esm?.output || 'es',
        format: 'es',
        preserveModules: true
      },
      
      // CJS 配置
      cjs: {
        input: userConfig.libs?.cjs?.input || 'src/**/*',
        output: userConfig.libs?.cjs?.output || 'lib',
        format: 'cjs',
        preserveModules: true
      },
      
      // UMD 配置（可选）
      umd: analysis.needsUMD ? {
        input: userConfig.libs?.umd?.input || this.findUMDEntry(analysis),
        output: userConfig.libs?.umd?.output || 'dist',
        format: 'umd',
        name: userConfig.name
      } : undefined
    }
    
    // 添加智能推断的配置
    this.addSmartDefaults(config, analysis)
    
    return config
  }
}
```

## 四、性能优化策略

### 4.1 内存优化

```typescript
class MemoryOptimizer {
  // 使用流式处理大文件
  async processLargeFile(file: string) {
    const stream = fs.createReadStream(file)
    return pipeline(
      stream,
      this.transformStream(),
      fs.createWriteStream(output)
    )
  }
  
  // 及时释放内存
  clearCache() {
    this.cache.clear()
    if (global.gc) global.gc()
  }
  
  // 限制并发数
  async processConcurrent(files: string[], limit = 4) {
    const pool = new PromisePool(limit)
    return pool.process(files, this.processFile)
  }
}
```

### 4.2 构建性能优化

```typescript
class PerformanceOptimizer {
  optimize(config: BuildConfig) {
    return {
      ...config,
      
      // 启用缓存
      cache: {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename]
        }
      },
      
      // 并行处理
      parallel: true,
      
      // 增量构建
      incremental: true,
      
      // 按需编译
      lazyCompilation: true
    }
  }
}
```

### 4.3 包体积优化

```typescript
class BundleOptimizer {
  optimize(bundle: Bundle) {
    // 移除未使用代码
    this.treeShake(bundle)
    
    // 提取公共代码
    this.extractCommon(bundle)
    
    // 压缩代码
    this.minify(bundle)
    
    // 优化导入
    this.optimizeImports(bundle)
  }
}
```

## 五、实施步骤

### 第一步：清理代码

1. 删除所有冗余文件
2. 合并重复功能
3. 规范化文件命名

### 第二步：重构核心

1. 实现新的 defineConfig
2. 创建智能分析器
3. 简化配置处理

### 第三步：性能优化

1. 实现内存优化
2. 添加并行处理
3. 优化构建流程

### 第四步：测试验证

1. 使用 @ldesign/chart 测试
2. 内存占用测试
3. 构建速度测试

## 六、预期效果

### 6.1 配置简化

- **之前**: 50+ 行配置
- **之后**: 2-5 行配置

### 6.2 性能提升

- **构建速度**: 提升 60%
- **内存占用**: 减少 50%
- **包体积**: 减少 30%

### 6.3 开发体验

- **零配置**: 90% 项目无需配置
- **智能提示**: 自动补全和建议
- **错误友好**: 清晰的错误信息

## 七、文件清理清单

### 需要删除的文件

```
- src/core/LibraryBuilder.new.ts
- src/core/EnhancedLibraryBuilder.ts
- src/optimizers/code-splitting/SmartCodeSplitter.old.ts
- src/optimizers/tree-shaking/EnhancedTreeShaker.backup.ts
- 所有 *.old.ts, *.backup.ts, *.temp.ts 文件
```

### 需要合并的文件

```
- LibraryBuilder.ts + EnhancedLibraryBuilder.ts → builder.ts
- 多个 validator 文件 → validator.ts
- 多个 optimizer 文件 → optimizer.ts
```

### 需要重命名的文件

```
- SmartCodeSplitter.ts → code-splitter.ts
- EnhancedTreeShaker.ts → tree-shaker.ts
- IntelligentProjectAnalyzer.ts → project-analyzer.ts
- AIConfigOptimizer.ts → config-optimizer.ts
- Bundle3DAnalyzer.ts → bundle-analyzer.ts
```

## 八、最终效果展示

### 8.1 最简使用

```typescript
// builder.config.ts
export default defineConfig({
  name: 'LDesignChart'
})
```

### 8.2 构建命令

```bash
$ ldesign-builder build

✨ 分析项目中...
📦 检测到: 混合框架库 (Vue + React + Lit)
🎯 入口: src/index.ts
📊 模块: 45 个文件
⚡ 优化配置中...
🚀 开始构建...
  ESM → es/
  CJS → lib/
  UMD → dist/
✅ 构建完成！用时: 3.2s
```

### 8.3 内存占用

```
构建前: 120MB
构建中峰值: 280MB (之前: 580MB)
构建后: 150MB
```

## 成功标准

1. ✅ 配置文件不超过 10 行
2. ✅ 内存占用减少 50%
3. ✅ 构建速度提升 60%
4. ✅ 文件数量减少 40%
5. ✅ 代码行数减少 30%
6. ✅ 零配置支持率 > 90%

### To-dos

- [ ] 分析 chart 项目的代码结构和框架使用情况
- [ ] 更新 builder.config.ts 使用混合框架配置
- [ ] 运行构建并验证产物
- [ ] 验证 package.json 的 exports 配置
- [ ] 测试三个框架的示例是否正常工作
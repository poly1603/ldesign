# Rollup 适配器

Rollup 适配器是 @ldesign/builder 的核心构建引擎，负责将统一配置转换为 Rollup 配置并执行构建。

## 功能特性

### 多格式输出
- **ESM 格式** → `es/` 目录，保留模块结构
- **CJS 格式** → `lib/` 目录，保留模块结构  
- **UMD 格式** → `dist/` 目录，单文件输出

### TypeScript 声明分发
构建完成后自动将 `types/` 目录下的 `.d.ts` 文件分发到：
- `es/` 目录（对应 ESM 格式）
- `lib/` 目录（对应 CJS 格式）

### 智能配置转换
- 根据格式自动设置 `preserveModules`
- 智能文件命名：`.js`、`.cjs`、`.umd.js`
- 自动处理外部依赖和全局变量

## 使用方法

```typescript
import { RollupAdapter } from '@ldesign/builder/adapters/rollup'

const adapter = new RollupAdapter({
  logger: customLogger // 可选
})

// 转换配置
const rollupConfig = await adapter.transformConfig(unifiedConfig)

// 执行构建
await adapter.build(rollupConfig)
```

## 配置映射

### 输入配置
```typescript
{
  input: 'src/index.ts', // 或多入口对象
  output: {
    format: ['esm', 'cjs', 'umd'],
    sourcemap: true
  }
}
```

### 输出配置
```javascript
// ESM
{
  dir: 'es',
  format: 'es',
  entryFileNames: '[name].js',
  preserveModules: true,
  preserveModulesRoot: 'src'
}

// CJS  
{
  dir: 'lib',
  format: 'cjs', 
  entryFileNames: '[name].cjs',
  preserveModules: true,
  preserveModulesRoot: 'src'
}

// UMD
{
  dir: 'dist',
  format: 'umd',
  entryFileNames: '[name].umd.js',
  preserveModules: false
}
```

## 声明文件处理

1. TypeScript 插件输出声明到 `types/` 目录
2. 构建完成后调用 `distributeTypes()` 方法
3. 使用 `fs-extra.copy()` 复制到目标目录
4. 过滤器确保只复制 `.d.ts`、`.d.cts`、`.d.mts` 文件和目录

## 错误处理

- 构建失败时提供详细错误信息
- 声明文件分发失败时记录警告但不中断构建
- 支持自定义错误处理器

## 性能优化

- 支持并行构建多种格式
- 智能缓存机制
- Tree shaking 优化
- 代码分割支持

## 扩展性

适配器采用插件化设计，支持：
- 自定义插件注入
- 配置钩子函数
- 构建生命周期监听

# 别名阶段配置 (Alias Stages)

## 概述

Launcher 支持为每个别名配置生效阶段，让你可以灵活控制别名在开发、构建和预览阶段的行为。这个功能特别适用于：

- 开发时使用源码路径，构建时使用编译后的路径
- 不同阶段使用不同的资源路径
- 条件性地启用某些别名

## 基本概念

### 构建阶段

- `dev` - 开发阶段（`pnpm dev`）
- `build` - 构建阶段（`pnpm build`）
- `preview` - 预览阶段（`pnpm preview`）

### 默认行为

- 如果别名没有指定 `stages`，默认只在 `dev` 阶段生效
- 内置别名（`@` -> src, `~` -> 项目根目录）默认在所有阶段生效

## 基本用法

### 使用工具函数

```typescript
import { 
  defineConfig, 
  createAlias, 
  createDevAlias, 
  createBuildAlias, 
  createUniversalAlias 
} from '@ldesign/launcher'

export default defineConfig({
  resolve: {
    alias: [
      // 只在开发阶段生效
      createDevAlias('@mock', './src/mock'),
      
      // 只在构建阶段生效
      createBuildAlias('@prod', './src/production'),
      
      // 在所有阶段生效
      createUniversalAlias('@shared', './src/shared'),
      
      // 自定义阶段
      createAlias('@test', './src/test', ['dev', 'preview'])
    ]
  }
})
```

### 手动配置

```typescript
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  resolve: {
    alias: [
      // 开发时使用源码，构建时使用编译版本
      {
        find: '@lib',
        replacement: './src/lib',
        stages: ['dev']
      },
      {
        find: '@lib',
        replacement: './dist/lib',
        stages: ['build', 'preview']
      },
      
      // 只在开发时启用的调试工具
      {
        find: '@debug',
        replacement: './src/debug',
        stages: ['dev']
      },
      
      // 生产环境的优化版本
      {
        find: '@optimized',
        replacement: './src/optimized',
        stages: ['build']
      }
    ]
  }
})
```

## 高级用法

### 条件性别名

```typescript
export default defineConfig({
  resolve: {
    alias: [
      // 开发时使用 mock 数据
      {
        find: '@api',
        replacement: './src/api/mock',
        stages: ['dev']
      },
      // 生产时使用真实 API
      {
        find: '@api',
        replacement: './src/api/real',
        stages: ['build', 'preview']
      }
    ]
  }
})
```

### 多环境配置

```typescript
export default defineConfig({
  resolve: {
    alias: [
      // 开发环境配置
      {
        find: '@config',
        replacement: './config/development.ts',
        stages: ['dev']
      },
      // 生产环境配置
      {
        find: '@config',
        replacement: './config/production.ts',
        stages: ['build']
      },
      // 预览环境配置
      {
        find: '@config',
        replacement: './config/preview.ts',
        stages: ['preview']
      }
    ]
  }
})
```

### 正则表达式别名

```typescript
export default defineConfig({
  resolve: {
    alias: [
      // 开发时重定向到源码
      {
        find: /^@ldesign\/(.*)$/,
        replacement: '../packages/$1/src',
        stages: ['dev']
      },
      // 构建时使用编译版本
      {
        find: /^@ldesign\/(.*)$/,
        replacement: '../packages/$1/dist',
        stages: ['build', 'preview']
      }
    ]
  }
})
```

## 工具函数参考

### createAlias

创建带阶段配置的别名。

```typescript
function createAlias(
  find: string | RegExp,
  replacement: string,
  stages?: BuildStage[]
): AliasEntry
```

### createBasicAliases

创建基本项目别名（`@` -> src, `~` -> 项目根目录）。

```typescript
function createBasicAliases(
  srcDir?: string,
  stages?: BuildStage[]
): AliasEntry[]
```

### createDevAlias

创建只在开发阶段生效的别名。

```typescript
function createDevAlias(
  find: string | RegExp,
  replacement: string
): AliasEntry
```

### createBuildAlias

创建只在构建阶段生效的别名。

```typescript
function createBuildAlias(
  find: string | RegExp,
  replacement: string
): AliasEntry
```

### createUniversalAlias

创建在所有阶段都生效的别名。

```typescript
function createUniversalAlias(
  find: string | RegExp,
  replacement: string
): AliasEntry
```

## 最佳实践

### 1. 合理使用默认行为

大多数别名只需要在开发时生效，利用默认行为可以简化配置：

```typescript
// 推荐：利用默认行为
{ find: '@components', replacement: './src/components' }

// 不推荐：显式指定默认值
{ find: '@components', replacement: './src/components', stages: ['dev'] }
```

### 2. 避免别名冲突

确保同一个别名在同一阶段只有一个定义：

```typescript
// ❌ 错误：同一阶段有重复别名
{
  find: '@utils',
  replacement: './src/utils',
  stages: ['dev']
},
{
  find: '@utils',
  replacement: './lib/utils',
  stages: ['dev'] // 冲突！
}

// ✅ 正确：不同阶段使用不同别名
{
  find: '@utils',
  replacement: './src/utils',
  stages: ['dev']
},
{
  find: '@utils',
  replacement: './lib/utils',
  stages: ['build']
}
```

### 3. 使用语义化的别名

```typescript
// ✅ 推荐：语义化别名
createDevAlias('@mock', './src/mock')
createBuildAlias('@prod', './src/production')

// ❌ 不推荐：模糊的别名
createAlias('@x', './src/something', ['dev'])
```

## 调试

启用调试模式查看别名配置：

```bash
DEBUG=launcher:* pnpm dev
```

或在配置中启用调试：

```typescript
export default defineConfig({
  launcher: {
    debug: true
  }
})
```

## 注意事项

1. **向后兼容**：没有 `stages` 字段的别名会自动添加默认值 `['dev']`
2. **内置别名**：`@` 和 `~` 别名默认在所有阶段生效
3. **优先级**：用户配置的别名会覆盖内置别名
4. **性能**：别名过滤在配置阶段完成，不会影响运行时性能

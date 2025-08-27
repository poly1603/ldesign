# defineConfig

定义构建配置的辅助函数，提供类型安全和智能提示。

## 语法

```typescript
function defineConfig(config: BuildOptions): BuildOptions
```

## 参数

### config

类型：`BuildOptions`

构建配置对象。

## 返回值

类型：`BuildOptions`

返回传入的配置对象，但提供了完整的类型支持。

## 示例

### 基础配置

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs', 'umd'],
  dts: true
})
```

### Vue 项目配置

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs', 'umd'],
  dts: true,
  external: ['vue'],
  globals: {
    vue: 'Vue'
  },
  name: 'MyVueLib'
})
```

### React 项目配置

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs', 'umd'],
  dts: true,
  external: ['react', 'react-dom'],
  globals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  },
  name: 'MyReactLib'
})
```

### 高级配置

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs'],
  dts: {
    bundled: true,
    fileName: 'types.d.ts'
  },
  sourcemap: true,
  external: ['lodash', 'axios'],
  rollupOptions: {
    treeshake: {
      moduleSideEffects: false
    },
    output: {
      banner: '/* My Library v1.0.0 */',
      footer: '/* Built with @ldesign/builder */'
    }
  }
})
```

### 条件配置

```typescript
import { defineConfig } from '@ldesign/builder'

const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: isDev ? ['esm'] : ['esm', 'cjs', 'umd'],
  dts: !isDev,
  sourcemap: isDev,
  name: 'MyLib'
})
```

### 多入口配置

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: {
    index: 'src/index.ts',
    utils: 'src/utils/index.ts',
    components: 'src/components/index.ts'
  },
  outDir: 'dist',
  formats: ['esm', 'cjs'],
  dts: true
})
```

### 自定义插件配置

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs'],
  dts: true,
  rollupOptions: {
    plugins: [
      // 自定义插件会与自动检测的插件合并
    ],
    external: (id) => {
      // 自定义外部依赖判断逻辑
      return id.includes('node_modules')
    }
  }
})
```

## 配置文件

### 创建配置文件

推荐在项目根目录创建 `builder.config.ts` 文件：

```typescript
// builder.config.ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs', 'umd'],
  dts: true,
  name: 'MyLibrary'
})
```

### 使用配置文件

```typescript
import { build } from '@ldesign/builder'
import config from './builder.config'

await build(config)
```

### 扩展配置

```typescript
// builder.config.ts
import { defineConfig } from '@ldesign/builder'

const baseConfig = defineConfig({
  input: 'src/index.ts',
  outDir: 'dist',
  dts: true
})

// 开发环境配置
export const devConfig = defineConfig({
  ...baseConfig,
  formats: ['esm'],
  sourcemap: true
})

// 生产环境配置
export const prodConfig = defineConfig({
  ...baseConfig,
  formats: ['esm', 'cjs', 'umd'],
  name: 'MyLibrary'
})

export default process.env.NODE_ENV === 'development' ? devConfig : prodConfig
```

## 类型支持

`defineConfig` 提供完整的 TypeScript 类型支持：

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  // 自动补全和类型检查
  formats: ['esm', 'cjs'], // ✅ 正确
  // formats: ['invalid'], // ❌ 类型错误
  
  dts: {
    bundled: true,
    // fileName: 123 // ❌ 类型错误，应该是 string
    fileName: 'types.d.ts' // ✅ 正确
  }
})
```

## 智能提示

在支持 TypeScript 的编辑器中，`defineConfig` 会提供：

- 属性名自动补全
- 属性值类型检查
- 内联文档提示
- 错误高亮显示

## 相关

- [BuildOptions](/api/build-options)
- [build](/api/build)
- [watch](/api/watch)

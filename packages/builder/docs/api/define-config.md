# defineConfig

定义构建配置的辅助函数，提供类型安全和智能提示。

## 语法

```typescript
function defineConfig(config: BuilderConfig | ((ctx) => BuilderConfig | Promise<BuilderConfig>)): BuilderConfig
```

## 参数

### config

类型：`BuilderConfig | (ctx => BuilderConfig | Promise<BuilderConfig>)`

构建配置对象。

## 返回值

类型：`BuilderConfig`

返回传入的配置对象，但提供了完整的类型支持。

## 示例

### 基础配置

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  output: { dir: 'dist', format: ['esm', 'cjs', 'umd'], sourcemap: true },
  dts: true,
  bundler: 'rollup',
  clean: true,
})
```

### Vue 项目配置

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  output: { dir: 'dist', format: ['esm', 'cjs', 'umd'] },
  dts: true,
  external: ['vue'],
  globals: { vue: 'Vue' },
  output: { name: 'MyVueLib' }
})
```

### React 项目配置

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  output: { dir: 'dist', format: ['esm', 'cjs', 'umd'], name: 'MyReactLib' },
  dts: true,
  external: ['react', 'react-dom'],
  globals: { react: 'React', 'react-dom': 'ReactDOM' }
})
```

### 高级配置

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  output: { dir: 'dist', format: ['esm', 'cjs'], sourcemap: true },
  dts: true,
  external: ['lodash', 'axios'],
  banner: { banner: '/* My Library v1.0.0 */', footer: '/* Built with @ldesign/builder */' },
})
```

### 条件配置

```typescript
import { defineConfig } from '@ldesign/builder'

const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  input: 'src/index.ts',
  outDir: 'dist',
output: { format: isDev ? ['esm'] : ['esm', 'cjs', 'umd'] },
  dts: !isDev,
output: { sourcemap: isDev },
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
output: { dir: 'dist' },
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
output
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
output: { dir: 'dist' },
  formats: ['esm', 'cjs', 'umd'],
  dts: true,
  name: 'MyLibrary'
})
```

### 使用配置文件

```typescript
import { createBuilder } from '@ldesign/builder'
import config from './builder.config'

await createBuilder(config).build()
```

### 扩展配置

```typescript
// builder.config.ts
import { defineConfig } from '@ldesign/builder'

const baseConfig = defineConfig({
  input: 'src/index.ts',
output: { dir: 'dist' },
  dts: true
})

// 开发环境配置
export const devConfig = defineConfig({
  ...baseConfig,
output: { format: ['esm'] },
output: { sourcemap: true }
})

// 生产环境配置
export const prodConfig = defineConfig({
  ...baseConfig,
output: { format: ['esm', 'cjs', 'umd'], name: 'MyLibrary' }
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

- [BuilderConfig](/api/build-options)
- [build](/api/build)
- [watch](/api/watch)

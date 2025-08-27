# BuildOptions

构建配置选项的类型定义。

## 类型定义

```typescript
interface BuildOptions {
  /** 入口文件路径 */
  input: string | Record<string, string>
  /** 输出目录 */
  outDir?: string
  /** 输出格式 */
  formats?: OutputFormat[]
  /** 是否生成类型声明文件 */
  dts?: boolean | DtsOptions
  /** 是否生成 sourcemap */
  sourcemap?: boolean
  /** 外部依赖 */
  external?: string[] | ((id: string) => boolean)
  /** 全局变量映射 */
  globals?: Record<string, string>
  /** UMD 包名 */
  name?: string
  /** 自定义 Rollup 配置 */
  rollupOptions?: RollupOptions
}
```

## 属性详解

### input

类型：`string | Record<string, string>`  
必需：是

指定构建的入口文件。

**单入口：**
```typescript
{
  input: 'src/index.ts'
}
```

**多入口：**
```typescript
{
  input: {
    index: 'src/index.ts',
    utils: 'src/utils/index.ts',
    components: 'src/components/index.ts'
  }
}
```

### outDir

类型：`string`  
默认值：`'dist'`

指定输出目录。

```typescript
{
  outDir: 'lib' // 输出到 lib 目录
}
```

### formats

类型：`OutputFormat[]`  
默认值：`['esm', 'cjs']`

指定输出格式。支持的格式：

- `'esm'` - ES 模块格式
- `'cjs'` - CommonJS 格式
- `'umd'` - UMD 格式
- `'iife'` - IIFE 格式

```typescript
{
  formats: ['esm', 'cjs', 'umd']
}
```

### dts

类型：`boolean | DtsOptions`  
默认值：`false`

是否生成 TypeScript 声明文件。

**简单用法：**
```typescript
{
  dts: true // 生成声明文件
}
```

**高级配置：**
```typescript
{
  dts: {
    bundled: true, // 是否打包成单个文件
    fileName: 'types.d.ts', // 输出文件名
    outDir: 'types' // 输出目录
  }
}
```

### sourcemap

类型：`boolean`  
默认值：`false`

是否生成 sourcemap 文件。

```typescript
{
  sourcemap: true
}
```

### external

类型：`string[] | ((id: string) => boolean)`  
默认值：`[]`

指定外部依赖，这些依赖不会被打包到输出文件中。

**数组形式：**
```typescript
{
  external: ['vue', 'react', 'lodash']
}
```

**函数形式：**
```typescript
{
  external: (id) => {
    return id.includes('node_modules')
  }
}
```

### globals

类型：`Record<string, string>`  
默认值：`{}`

为 UMD 格式指定全局变量映射。

```typescript
{
  external: ['vue', 'react'],
  globals: {
    vue: 'Vue',
    react: 'React'
  }
}
```

### name

类型：`string`  
默认值：`undefined`

UMD 格式的全局变量名。

```typescript
{
  formats: ['umd'],
  name: 'MyLibrary'
}
```

### rollupOptions

类型：`RollupOptions`  
默认值：`{}`

自定义 Rollup 配置，会与自动生成的配置合并。

```typescript
{
  rollupOptions: {
    treeshake: {
      moduleSideEffects: false
    },
    output: {
      banner: '/* My Library */',
      footer: '/* Built with @ldesign/builder */'
    }
  }
}
```

## 相关类型

### OutputFormat

```typescript
type OutputFormat = 'esm' | 'cjs' | 'umd' | 'iife'
```

### DtsOptions

```typescript
interface DtsOptions {
  /** 是否打包成单个文件 */
  bundled?: boolean
  /** 输出文件名 */
  fileName?: string
  /** 输出目录 */
  outDir?: string
}
```

## 示例

### 基础配置

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs'],
  dts: true
})
```

### Vue 组件库配置

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

### 多入口配置

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: {
    index: 'src/index.ts',
    utils: 'src/utils/index.ts'
  },
  outDir: 'dist',
  formats: ['esm', 'cjs'],
  dts: {
    bundled: false // 保持文件结构
  }
})
```

## 相关

- [build](/api/build)
- [defineConfig](/api/define-config)
- [BuildResult](/api/build-result)

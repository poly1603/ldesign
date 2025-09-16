# 配置选项详解

本文档详细说明了 `@ldesign/builder` 的所有配置选项、默认值和使用方法。

## 基础配置

### rootDir

- **类型**: `string`
- **必需**: 是
- **默认值**: 无
- **说明**: 项目根目录的绝对路径

```typescript
const builder = new LibraryBuilder({
  rootDir: process.cwd(), // 当前工作目录
  // 或者指定具体路径
  rootDir: '/path/to/your/project'
})
```

### srcDir

- **类型**: `string`
- **必需**: 否
- **默认值**: `'src'`
- **说明**: 源码目录，相对于 `rootDir`

```typescript
const builder = new LibraryBuilder({
  rootDir: process.cwd(),
  srcDir: 'src',        // 默认值
  // 或者自定义
  srcDir: 'lib'
})
```

### entry

- **类型**: `string`
- **必需**: 是
- **默认值**: 无
- **说明**: 入口文件路径，相对于 `rootDir`

```typescript
const builder = new LibraryBuilder({
  rootDir: process.cwd(),
  entry: 'src/index.ts',           // TypeScript 入口
  // 或者
  entry: 'src/index.js',           // JavaScript 入口
  // 或者
  entry: 'src/components/index.ts' // 组件库入口
})
```

## 输出配置

### output

- **类型**: `object`
- **必需**: 是
- **说明**: 输出目录配置

```typescript
interface OutputConfig {
  cjs: string      // CommonJS 输出目录
  es: string       // ES 模块输出目录
  umd: string      // UMD 输出目录
  types?: string   // 类型定义输出目录（可选）
}
```

**示例**:

```typescript
const builder = new LibraryBuilder({
  output: {
    cjs: 'dist/cjs',     // CommonJS 格式输出到 dist/cjs
    es: 'dist/es',       // ES 模块输出到 dist/es
    umd: 'dist/umd',     // UMD 格式输出到 dist/umd
    types: 'dist/types'  // 类型定义输出到 dist/types
  }
})

// 简化配置
const builder = new LibraryBuilder({
  output: {
    cjs: 'lib',          // 传统的 lib 目录
    es: 'es',            // ES 模块目录
    umd: 'dist'          // UMD 打包目录
  }
})
```

## 外部依赖配置

### external

- **类型**: `string[] | ((id: string) => boolean)`
- **必需**: 否
- **默认值**: 自动检测
- **说明**: 指定哪些模块应该作为外部依赖，不被打包进最终产物

```typescript
// 数组形式
const builder = new LibraryBuilder({
  external: ['vue', 'lodash-es', 'dayjs']
})

// 函数形式
const builder = new LibraryBuilder({
  external: (id) => {
    // Vue 相关的包都作为外部依赖
    if (id.startsWith('vue') || id.startsWith('@vue/')) {
      return true
    }
    // lodash 相关的包
    if (id.startsWith('lodash')) {
      return true
    }
    return false
  }
})

// Vue 3 组件库推荐配置
const builder = new LibraryBuilder({
  external: ['vue']
})

// TypeScript 工具库推荐配置
const builder = new LibraryBuilder({
  external: ['lodash-es', 'dayjs', 'axios'] // 常用工具库
})
```

### globals

- **类型**: `Record<string, string>`
- **必需**: 否（UMD 格式需要）
- **默认值**: `{}`
- **说明**: 外部依赖的全局变量名映射，用于 UMD 格式

```typescript
const builder = new LibraryBuilder({
  external: ['vue', 'lodash-es'],
  globals: {
    vue: 'Vue',           // import vue from 'vue' -> window.Vue
    'lodash-es': 'lodash' // import _ from 'lodash-es' -> window.lodash
  }
})

// 常见的全局变量映射
const commonGlobals = {
  vue: 'Vue',
  react: 'React',
  'react-dom': 'ReactDOM',
  'lodash-es': 'lodash',
  dayjs: 'dayjs',
  axios: 'axios'
}
```

### name

- **类型**: `string`
- **必需**: 否（UMD 格式推荐）
- **默认值**: 从 `package.json` 的 `name` 字段推导
- **说明**: UMD 格式的全局变量名

```typescript
const builder = new LibraryBuilder({
  name: 'MyLibrary',        // window.MyLibrary
  // 或者使用命名空间
  name: 'LDesign.Button',   // window.LDesign.Button
  // 或者使用驼峰命名
  name: 'myVueLibrary'      // window.myVueLibrary
})
```

## 构建选项

### minify

- **类型**: `boolean`
- **必需**: 否
- **默认值**: `false`
- **说明**: 是否压缩代码

```typescript
// 开发环境
const builder = new LibraryBuilder({
  minify: false  // 不压缩，便于调试
})

// 生产环境
const builder = new LibraryBuilder({
  minify: true   // 压缩代码，减小体积
})
```

### sourcemap

- **类型**: `boolean | 'inline' | 'hidden'`
- **必需**: 否
- **默认值**: `false`
- **说明**: Source map 生成配置

```typescript
// 不生成 source map
const builder = new LibraryBuilder({
  sourcemap: false
})

// 生成独立的 .map 文件
const builder = new LibraryBuilder({
  sourcemap: true
})

// 内联 source map
const builder = new LibraryBuilder({
  sourcemap: 'inline'
})

// 生成 source map 但不在代码中引用
const builder = new LibraryBuilder({
  sourcemap: 'hidden'
})
```

## 类型定义配置

### dts

- **类型**: `boolean | { bundle?: boolean; outputDir?: string }`
- **必需**: 否
- **默认值**: `false`
- **说明**: TypeScript 类型定义文件生成配置

```typescript
// 不生成类型定义
const builder = new LibraryBuilder({
  dts: false
})

// 生成类型定义文件
const builder = new LibraryBuilder({
  dts: true
})

// 高级配置
const builder = new LibraryBuilder({
  dts: {
    bundle: true,                    // 打包成单个 .d.ts 文件
    outputDir: 'dist/types'         // 自定义输出目录
  }
})

// 分离模式（每个源文件对应一个 .d.ts 文件）
const builder = new LibraryBuilder({
  dts: {
    bundle: false,                   // 保持文件结构
    outputDir: 'types'
  }
})
```

## 样式配置

### extractCss

- **类型**: `boolean`
- **必需**: 否
- **默认值**: `false`
- **说明**: 是否提取 CSS 到独立文件

```typescript
// 不提取 CSS（内联到 JS 中）
const builder = new LibraryBuilder({
  extractCss: false
})

// 提取 CSS 到独立文件
const builder = new LibraryBuilder({
  extractCss: true  // 推荐用于组件库
})
```

## 构建控制

### clean

- **类型**: `boolean`
- **必需**: 否
- **默认值**: `false`
- **说明**: 构建前是否清理输出目录

```typescript
const builder = new LibraryBuilder({
  clean: true   // 推荐开启，确保输出目录干净
})
```

## 完整配置示例

### Vue 3 组件库完整配置

```typescript
import { LibraryBuilder } from '@ldesign/builder'

const builder = new LibraryBuilder({
  // 基础配置
  rootDir: process.cwd(),
  srcDir: 'src',
  entry: 'src/index.ts',

  // 输出配置
  output: {
    cjs: 'lib',
    es: 'es',
    umd: 'dist',
    types: 'types'
  },

  // 外部依赖
  external: ['vue'],
  globals: { vue: 'Vue' },
  name: 'MyVueLibrary',

  // 构建选项
  minify: false,
  sourcemap: true,

  // 类型定义
  dts: {
    bundle: false,  // 保持文件结构，便于按需引入
    outputDir: 'types'
  },

  // 样式配置
  extractCss: true,

  // 构建控制
  clean: true,
  validate: true,
  validatorConfig: {
    checkDts: true,
    checkStyles: true,
    checkSourceMaps: true,
    maxFileSize: 2 * 1024 * 1024,    // 2MB
    maxTotalSize: 20 * 1024 * 1024   // 20MB
  }
})

await builder.build()
```

### TypeScript 工具库配置

```typescript
const builder = new LibraryBuilder({
  rootDir: process.cwd(),
  entry: 'src/index.ts',

  output: {
    cjs: 'lib',
    es: 'es'
    // 工具库通常不需要 UMD 格式
  },

  // 常见的工具库外部依赖
  external: ['lodash-es', 'dayjs'],

  // 生产环境配置
  minify: true,
  sourcemap: true,

  dts: {
    bundle: true,  // 工具库可以打包成单个类型文件
    outputDir: 'types'
  },

  clean: true,
  validate: true
})
```

### 纯样式库配置

```typescript
const builder = new LibraryBuilder({
  rootDir: process.cwd(),
  entry: 'src/index.less',

  output: {
    es: 'dist'  // 样式库只需要一个输出目录
  },

  extractCss: true,
  minify: true,

  clean: true
})
```

## 环境变量配置

可以通过环境变量来控制构建行为：

```bash
# 开发环境
NODE_ENV=development npm run build

# 生产环境
NODE_ENV=production npm run build

# 启用详细日志
DEBUG=ldesign:* npm run build
```

在代码中使用：

```typescript
const isDev = process.env.NODE_ENV === 'development'

const builder = new LibraryBuilder({
  // ... 其他配置
  minify: !isDev,
  sourcemap: isDev,
  validate: !isDev
})
```

## 配置文件

你也可以创建配置文件来管理复杂的配置：

### .ldesign/builder.config.ts

```typescript
import { LibraryBuilder } from '@ldesign/builder'
import type { LibraryBuilderConfig } from '@ldesign/builder'

const config: LibraryBuilderConfig = {
  rootDir: process.cwd(),
  entry: 'src/index.ts',
  output: {
    cjs: 'lib',
    es: 'es',
    umd: 'dist',
    types: 'types'
  },
  external: ['vue'],
  globals: { vue: 'Vue' },
  name: 'MyLibrary',
  dts: true,
  extractCss: true,
  clean: true
}

export default config

// 使用配置文件
import config from './ldesign.config'
const builder = new LibraryBuilder(config)
await builder.build()
```

### package.json 脚本

```json
{
  "scripts": {
    "build": "node scripts/build.js",
    "build:dev": "NODE_ENV=development node scripts/build.js",
    "build:prod": "NODE_ENV=production node scripts/build.js"
  }
}
```

## 常见配置模式

### 1. 开发/生产环境切换

```typescript
const isDev = process.env.NODE_ENV === 'development'

const builder = new LibraryBuilder({
  // ... 基础配置
  minify: !isDev,
  sourcemap: isDev ? true : 'hidden',
  validate: !isDev,
  clean: !isDev
})
```

### 2. 多入口配置

```typescript
// 为不同的入口创建不同的构建器
const configs = [
  {
    entry: 'src/index.ts',
    output: { es: 'es', cjs: 'lib' },
    name: 'MyLibrary'
  },
  {
    entry: 'src/utils/index.ts',
    output: { es: 'es/utils', cjs: 'lib/utils' },
    name: 'MyLibraryUtils'
  }
]

for (const config of configs) {
  const builder = new LibraryBuilder(config)
  await builder.build()
}
```

### 3. 条件构建

```typescript
const buildUMD = process.env.BUILD_UMD === 'true'

const output = {
  cjs: 'lib',
  es: 'es',
  ...(buildUMD && { umd: 'dist' })
}

const builder = new LibraryBuilder({
  // ... 其他配置
  output,
  ...(buildUMD && {
    name: 'MyLibrary',
    globals: { vue: 'Vue' }
  })
})
```

### validate

- **类型**: `boolean`
- **必需**: 否
- **默认值**: `false`
- **说明**: 是否验证构建产物

```typescript
const builder = new LibraryBuilder({
  validate: true,  // 开启验证
  validatorConfig: {
    // 验证配置（见下文）
  }
})
```

### validatorConfig

- **类型**: `object`
- **必需**: 否（当 `validate: true` 时可用）
- **说明**: 构建产物验证配置

```typescript
interface ValidatorConfig {
  checkDts?: boolean        // 检查类型定义文件
  checkStyles?: boolean     // 检查样式文件
  checkSourceMaps?: boolean // 检查 source map
  maxFileSize?: number      // 单文件最大大小（字节）
  maxTotalSize?: number     // 总大小限制（字节）
}

const builder = new LibraryBuilder({
  validate: true,
  validatorConfig: {
    checkDts: true,                    // 验证类型定义
    checkStyles: true,                 // 验证样式文件
    checkSourceMaps: true,             // 验证 source map
    maxFileSize: 5 * 1024 * 1024,     // 单文件最大 5MB
    maxTotalSize: 50 * 1024 * 1024    // 总大小最大 50MB
  }
})
```

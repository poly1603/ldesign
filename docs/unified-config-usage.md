# 统一配置管理系统使用指南

## 概述

`@ldesign/config` 包提供了 LDesign 项目的统一配置管理，减少了配置文件的重复，提高了维护效率。

## 迁移指南

### 1. 安装配置包

在需要使用统一配置的包中安装：

```bash
pnpm add -D @ldesign/config
```

### 2. TypeScript 配置迁移

#### 原配置
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    // ... 大量重复配置
  }
}
```

#### 新配置
```json
// tsconfig.json
{
  "extends": "@ldesign/config/tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 3. Vite 配置迁移

#### 原配置
```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    // ... 重复的构建配置
  }
})
```

#### 新配置
```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createVueViteConfig } from '@ldesign/config/vite'

export default defineConfig({
  ...createVueViteConfig(),
  plugins: [vue()]
})
```

### 4. 库构建配置迁移

#### 使用 Rollup 配置
```ts
// rollup.config.js
import { createLibraryRollupConfig } from '@ldesign/config/rollup'
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

const config = createLibraryRollupConfig({
  input: 'src/index.ts',
  formats: ['es', 'cjs'],
  external: ['vue', '@ldesign/shared'],
  globals: {
    'vue': 'Vue',
    '@ldesign/shared': 'LDesignShared'
  }
})

// 添加插件
config.plugins = [
  nodeResolve(),
  commonjs(),
  typescript()
]

export default config
```

#### 使用 Vite 库模式
```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { createLibraryViteConfig } from '@ldesign/config/vite'

export default defineConfig(createLibraryViteConfig({
  entry: './src/index.ts',
  name: 'LDesignCache',
  fileName: 'index',
  formats: ['es', 'cjs', 'umd'],
  external: ['vue'],
  globals: {
    vue: 'Vue'
  }
}))
```

## 包配置示例

### @ldesign/cache 迁移示例

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { createLibraryViteConfig } from '@ldesign/config/vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  ...createLibraryViteConfig({
    entry: './src/index.ts',
    name: 'LDesignCache',
    formats: ['es', 'cjs', 'umd'],
    external: ['vue', 'vue-demi'],
    globals: {
      'vue': 'Vue',
      'vue-demi': 'VueDemi'
    }
  }),
  plugins: [
    vue(),
    dts({
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts']
    })
  ]
})
```

### @ldesign/http 迁移示例

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import { createVitestConfig } from '@ldesign/config/vitest'

export default defineConfig({
  test: {
    ...createVitestConfig().test,
    setupFiles: ['./test/setup.ts'],
    coverage: {
      ...createVitestConfig().test.coverage,
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      }
    }
  }
})
```

## 配置继承关系

```
@ldesign/config/tsconfig.base.json
├── @ldesign/config/tsconfig.node.json
├── @ldesign/config/tsconfig.vue.json
├── @ldesign/config/tsconfig.react.json
└── 各个包的 tsconfig.json
```

## 优势

1. **减少重复**：避免在每个包中重复相同的配置
2. **统一标准**：确保所有包使用相同的编译和构建标准
3. **易于维护**：只需在一处更新配置即可影响所有包
4. **类型安全**：提供完整的 TypeScript 类型支持
5. **最佳实践**：内置了经过优化的配置选项

## 注意事项

1. **版本兼容**：确保 @ldesign/config 与其他依赖版本兼容
2. **自定义需求**：如果包有特殊需求，可以覆盖继承的配置
3. **路径解析**：注意相对路径在继承配置时的解析问题

## 下一步

1. 逐步迁移所有包到统一配置
2. 在 CI/CD 中添加配置一致性检查
3. 创建配置升级脚本，自动更新所有包的配置

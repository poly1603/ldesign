---
title: 库模式（Library Mode）
description: 使用 @ldesign/launcher 构建可复用的库，覆盖多入口、外部依赖、类型声明与发布
---

# 库模式（Library Mode）

当你需要产出一个可复用的库（组件库/工具库）时，推荐使用库模式。@ldesign/launcher 在 Vite 的库构建能力基础上提供了更友好的配置入口。

## 最小配置

```ts path=null start=null
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  launcher: {
    lib: {
      entry: './src/index.ts',
      name: 'MyLib',
      formats: ['es', 'cjs', 'umd'],
      dts: true
    }
  }
})
```

- entry：库入口文件（也可为多入口对象）
- name：UMD/IIFE 全局名称
- formats：输出格式
- dts：是否生成类型声明（或对象指定 outDir/include/exclude）

## 多入口构建

```ts path=null start=null
export default defineConfig({
  launcher: {
    lib: {
      entry: {
        index: './src/index.ts',
        utils: './src/utils/index.ts'
      },
      formats: ['es', 'cjs']
    }
  }
})
```

## 自定义文件名与全局变量

```ts path=null start=null
export default defineConfig({
  launcher: {
    lib: {
      entry: './src/index.ts',
      name: 'MyLib',
      formats: ['umd'],
      fileName: (format, entryName) => `${entryName}.${format}.js`,
      external: ['vue'],
      globals: { vue: 'Vue' }
    }
  }
})
```

- external：标记外部依赖（不打包），常用于 peerDependencies
- globals：为 UMD/IIFE 指定外部依赖的全局名

## 类型声明（.d.ts）

```ts path=null start=null
export default defineConfig({
  launcher: {
    lib: {
      entry: './src/index.ts',
      dts: {
        outDir: 'dist/types',
        include: ['src/**/*'],
        exclude: ['**/*.test.ts']
      }
    }
  }
})
```

## 依赖与打包策略

- 将 peerDependencies（如 vue/react）放到 external，避免重复捆绑
- 对工具依赖（lodash-es/dayjs 等）评估是否打包进入，兼顾体积与使用便利
- 为 ESM 优先，保留 CJS 以兼容旧环境

## 组件库提示

- 样式与资源：建议独立入口（如 style/index.css）或按需输出
- Treeshaking：保持模块无副作用（package.json sideEffects）
- 主题变量与 tokens：集中管理，减少重复

## 发布流程（示例）

```json path=null start=null
{
  "name": "@scope/my-lib",
  "version": "1.0.0",
  "main": "dist/index.cjs.js",
  "module": "dist/index.es.js",
  "unpkg": "dist/index.umd.js",
  "types": "dist/types/index.d.ts",
  "peerDependencies": {
    "vue": ">=3.3.0"
  }
}
```

```bash path=null start=null
pnpm launcher build
pnpm publish --access public
```

## 样式输出策略

- 库模式下，样式会被自动抽取为 CSS（如 dist/style.css），建议在 package.json 中提供 `style` 字段：
```json path=null start=null
{
  "style": "dist/style.css"
}
```
- 若希望按需引入样式，可将每个子组件的样式作为独立文件输出，并在文档中指引用户显式 import
- 如需禁用 CSS 拆分（合并为单文件），可调整：
```ts path=null start=null
export default defineConfig({
  build: {
    cssCodeSplit: false
  }
})
```

## 按需加载与 sideEffects

- 组件与工具函数应为可 tree-shake 的 ESM 模块
- package.json 中的 `sideEffects` 建议为 false，但若存在纯 CSS 或样式导入引起的副作用，请保留：
```json path=null start=null
{
  "sideEffects": ["*.css", "*.scss"]
}
```

## 导出设计（exports）

- 为不同格式与子入口提供明确的 exports 映射，提升消费端兼容性：
```json path=null start=null
{
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/index.es.js",
      "require": "./dist/index.cjs.js"
    },
    "./utils": {
      "types": "./dist/types/utils/index.d.ts",
      "import": "./dist/utils.es.js",
      "require": "./dist/utils.cjs.js"
    }
  }
}
```

## 故障排查

- UMD 全局未找到：确认 `globals` 与外部库在运行环境中的全局名一致
- 类型声明缺失：检查 dts 配置与 include/exclude 范围
- 体积超限：结合 Analyzer 分析重复依赖与拆包策略


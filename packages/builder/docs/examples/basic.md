# 基础用法

本页面展示 @ldesign/builder 的基础使用方法。

## 最简单的用法

最简单的用法只需要指定入口文件：

```typescript
import { build } from '@ldesign/builder'

await build({
  input: 'src/index.ts'
})
```

这将：
- 自动检测项目类型
- 输出到 `dist` 目录
- 生成 ESM 和 CJS 格式
- 保持目录结构

## 指定输出目录

```typescript
import { build } from '@ldesign/builder'

await build({
  input: 'src/index.ts',
  outDir: 'lib'
})
```

## 多格式输出

```typescript
import { build } from '@ldesign/builder'

await build({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs', 'umd'],
  name: 'MyLibrary' // UMD 格式需要指定包名
})
```

输出结构：
```
dist/
├── esm/           # ES 模块格式
│   └── index.js
├── cjs/           # CommonJS 格式
│   └── index.js
└── umd/           # UMD 格式
    └── index.js
```

## 生成类型声明

```typescript
import { build } from '@ldesign/builder'

await build({
  input: 'src/index.ts',
  outDir: 'dist',
  dts: true
})
```

输出结构：
```
dist/
├── esm/
│   ├── index.js
│   └── index.d.ts
├── cjs/
│   ├── index.js
│   └── index.d.ts
└── types/
    └── index.d.ts
```

## 外部依赖

当构建库时，通常需要将某些依赖标记为外部依赖：

```typescript
import { build } from '@ldesign/builder'

await build({
  input: 'src/index.ts',
  outDir: 'dist',
  external: ['vue', 'lodash'],
  globals: {
    vue: 'Vue',
    lodash: '_'
  }
})
```

## 使用配置文件

创建 `builder.config.ts`：

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs'],
  dts: true,
  external: ['vue'],
  globals: {
    vue: 'Vue'
  }
})
```

然后使用：

```typescript
import { build } from '@ldesign/builder'
import config from './builder.config'

await build(config)
```

## 监听模式

在开发时，可以使用监听模式自动重新构建：

```bash
npx ldesign-builder build -i src/index.ts -o dist -f esm,cjs -w
```

或编程式：

```typescript
import { createBuilder } from '@ldesign/builder'

const watcher = await createBuilder({ input: 'src/index.ts', output: { dir: 'dist', format: ['esm','cjs'] } }).buildWatch()
console.log('开始监听文件变化...')
```

## 报告与分析

```bash
# 生成构建报告（默认 dist/build-report.json）
ldesign-builder build --report

# 输出 Markdown 报告
ldesign-builder analyze -r dist/build-report.json -f md

# 输出 HTML 报告并自动打开
ldesign-builder analyze -r dist/build-report.json -f html --open

# 与基线报告比较
ldesign-builder analyze -r dist/build-report.json --compare ./baseline/build-report.json
```

## 错误处理

```typescript
import { build } from '@ldesign/builder'

try {
  const result = await build({
    input: 'src/index.ts',
    outDir: 'dist'
  })

  if (result.success) {
    console.log('构建成功！')
    console.log(`构建时间: ${result.duration}ms`)
    console.log(`输出文件: ${result.outputs.length} 个`)
  } else {
    console.error('构建失败:')
    result.errors.forEach(error => {
      console.error(`- ${error.message}`)
    })
  }
} catch (error) {
  console.error('构建过程中发生错误:', error)
}
```

## 下一步

- 查看 [Vue 组件库示例](/examples/vue)
- 查看 [React 组件库示例](/examples/react)
- 了解 [高级配置](/guide/advanced)

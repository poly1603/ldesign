# 迁移指南

本文指导你从旧配置方式迁移到当前版本推荐的配置结构与使用方式，确保与 @ldesign/builder 现有实现、CLI 选项和类型定义保持一致。

## 总览

推荐以 OutputConfig 为中心组织输出，支持：
- 单点输出（output.dir / output.file）
- 多格式输出（output.format 或分别配置 output.esm/cjs/umd）
- 按格式独立 input/sourcemap/dts/minify

同时，CLI 层建议使用 build 命令配合 -i/-o/-f 与 --report，再用 analyze 做报告生成与差异对比。

## 变更映射（旧 -> 新）

- outDir -> output.dir
- formats -> output.format（或在 output.esm/cjs/umd 分别设置）
- sourcemap -> output.sourcemap（顶层也可作为开关）
- name -> output.name（UMD/IIFE 名称；也可用 output.umd.name）
- rollupOptions.output.banner/footer -> banner.banner / banner.footer（统一入口）
- 多格式的 input -> output.esm.input / output.cjs.input / output.umd.input

## 示例一：基础配置

旧写法：
```ts
import { defineConfig } from '@ldesign/builder'
export default defineConfig({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs'],
  dts: true
})
```

新写法：
```ts
import { defineConfig } from '@ldesign/builder'
export default defineConfig({
  input: 'src/index.ts',
  output: { dir: 'dist', format: ['esm', 'cjs'], sourcemap: true },
  dts: true,
  clean: true
})
```

## 示例二：多格式分别配置

旧写法：
```ts
import { defineConfig } from '@ldesign/builder'
export default defineConfig({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs', 'umd'],
  name: 'MyLib'
})
```

新写法（推荐）：
```ts
import { defineConfig } from '@ldesign/builder'
export default defineConfig({
  output: {
    esm: {
      dir: 'es',
      format: 'esm',
      preserveStructure: true,
      dts: true,
      input: ['src/**/*.ts', 'src/**/*.tsx']
    },
    cjs: {
      dir: 'lib',
      format: 'cjs',
      preserveStructure: true,
      dts: true,
      input: ['src/**/*.ts', 'src/**/*.tsx']
    },
    umd: {
      dir: 'dist',
      format: 'umd',
      name: 'MyLib',
      minify: true,
      sourcemap: true,
      input: 'src/index.ts'
    }
  }
})
```

## 示例三：UMD 名称与全局变量

旧写法：
```ts
export default defineConfig({
  name: 'MyLib',
  external: ['vue'],
  globals: { vue: 'Vue' }
})
```

新写法：
```ts
export default defineConfig({
  external: ['vue'],
  globals: { vue: 'Vue' },
  output: {
    format: ['umd'],
    name: 'MyLib'
  }
})
```

## CLI 使用对齐

- 构建：
```bash
ldesign-builder build -i src/index.ts -o dist -f esm,cjs --sourcemap --minify
```
- 监听：
```bash
ldesign-builder build -w
```
- 生成报告并分析：
```bash
ldesign-builder build --report
ldesign-builder analyze -r dist/build-report.json -f md
ldesign-builder analyze -r dist/build-report.json -f html --open
ldesign-builder analyze -r dist/build-report.json --compare ./baseline/build-report.json
```

注意：watch 子命令参数与 build -w 略有差异（watch 使用 `-o, --outDir`），推荐优先使用 build -w 以获得与 build 相同的参数集合与行为。

## 注意事项

- UMD 只支持单入口，使用 `output.umd.input` 指定文件路径
- 使用通配符（`src/**/*.ts` 等）会触发文件系统扫描，大型项目需权衡启动时延
- 顶层 `dts/sourcemap/minify` 是全局开关，可在各格式中覆盖
- `clean: true` 只会清理配置到的输出目录（`output.dir / output.esm.dir / output.cjs.dir / output.umd.dir`）
- 切换打包器：配置中使用 `bundler: 'rollup' | 'rolldown'`，CLI 可用 `--bundler` 保持一致

## 相关链接

- [配置](/guide/config)
- [构建命令](/api/build)
- [分析命令](/api/analyze)
- [defineConfig](/api/define-config)

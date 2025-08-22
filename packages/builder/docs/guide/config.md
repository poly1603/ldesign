# 配置

在项目根创建 `ldesign.config.ts` 或 `ldesign.config.js`：

```ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs', 'umd'],
  mode: 'production',
  dts: true,
  external: ['vue', 'react'],
  globals: { vue: 'Vue', react: 'React' },
})
```

## 字段说明（核心）

- `input`: 入口（字符串、数组或对象）
- `outDir`: 输出目录，默认 `dist`
- `formats`: `esm | cjs | iife | umd` 数组
- `mode`: `development | production`
- `dts`: `boolean | { bundled, outDir, fileName }`
- `external`: 外部依赖（不打包）
- `globals`: UMD/IIFE 全局映射
- `sourcemap`, `minify`, `name`, `lib`

## 插件细粒度配置（可选）

支持以同名字段传入，如：

```ts
export default defineConfig({
  esbuild: { target: 'es2018' },
  postcss: { minimize: true },
  terser: { compress: { drop_console: true } },
})
```

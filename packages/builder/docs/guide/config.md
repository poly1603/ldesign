# 配置

在项目根创建 `.ldesign/builder.config.ts` 或 `.ldesign/builder.config.js`：

```ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 可选：顶层入口（也可按格式分别指定 input）
  input: 'src/index.ts',

  // 输出配置（推荐写到 output 下）
  output: {
    dir: 'dist',
    format: ['esm', 'cjs', 'umd'],
    sourcemap: true,
  },

  // 其它核心选项
  bundler: 'rollup', // 或 'rolldown'
  mode: 'production',
  dts: true,
  external: ['vue', 'react'],
  globals: { vue: 'Vue', react: 'React' },
  minify: true,
  clean: true,
})
```

## 字段说明（核心）

- `input`: 入口（字符串、数组或对象，可省略以启用自动探测）
- `output.dir` / `output.file`: 输出目录或单文件
- `output.format`: `esm | cjs | iife | umd` 或数组
- `output.sourcemap`: 是否生成 sourcemap（`true | 'inline' | 'hidden'`）
- `output.esm / output.cjs / output.umd`: 各格式的细粒度配置（`FormatOutputConfig`）
- `bundler`: `rollup | rolldown`
- `mode`: `development | production`
- `dts`: 是否生成类型声明（亦可在 `output.esm/cjs` 下分别设置）
- `external`: 外部依赖（不打包）
- `globals`: UMD/IIFE 全局映射
- `minify`、`clean`、`babel`、`banner`、`umd`：进阶控制

## 按格式分别配置（示例）

```ts
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
      name: 'MyLibrary',
      minify: true,
      sourcemap: true,
      input: 'src/index.ts'
    }
  }
})
```

## 进阶配置（片段）

```ts
export default defineConfig({
  babel: { enabled: true, targets: 'defaults' },
  banner: { banner: '/* built with @ldesign/builder */' },
  output: {
    manualChunks: (id) => id.includes('node_modules') ? 'vendor' : undefined,
    preserveModules: false,
  }
})
```

## 迁移对照表（旧 -> 新）

- outDir -> output.dir
- formats -> output.format（或在 output.esm/cjs/umd 分别设置）
- sourcemap -> output.sourcemap（顶层也可作为开关）
- name -> output.name（UMD/IIFE 名称）
- rollupOptions.output.banner/footer -> banner.banner/banner.footer（统一入口）
- 多格式的 input：建议使用 output.esm.input / output.cjs.input / output.umd.input

示例（旧写法）：
```ts
export default defineConfig({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm','cjs']
})
```

示例（新写法）：
```ts
export default defineConfig({
  input: 'src/index.ts',
  output: { dir: 'dist', format: ['esm','cjs'] }
})
```

## 注意事项

- UMD 只支持单入口，请使用 `output.umd.input` 指定文件路径
- 使用通配符（例如 `src/**/*.ts`）将触发文件系统扫描，大型项目会增加启动时间
- `clean: true` 仅清理配置的输出目录（如 output.dir / output.esm.dir / output.cjs.dir / output.umd.dir）
- 顶层 `dts/sourcemap/minify` 是全局开关，可在各格式中覆盖
- 切换打包器：`bundler: 'rollup' | 'rolldown'`，建议在 CLI 全局参数中使用 `--bundler` 与配置保持一致

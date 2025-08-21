# 高级特性

## 多入口与保留模块结构

```ts
export default defineConfig({
  input: {
    index: 'src/index.ts',
    utils: 'src/utils/index.ts',
  },
  formats: ['esm'],
  // 可在 Rollup 层自定义更多选项
  rollupOptions: {
    preserveModules: true,
    output: { preserveModulesRoot: 'src' },
  },
})
```

## 外部依赖与全局变量

```ts
export default defineConfig({
  external: ['vue', 'react'],
  globals: { vue: 'Vue', react: 'React' },
  formats: ['umd', 'iife'],
  name: 'MyLib',
})
```

## 自定义插件配置（细粒度）

```ts
export default defineConfig({
  esbuild: { target: 'es2018' },
  postcss: { minimize: true },
  terser: { compress: { drop_console: true } },
})
```

## 常见问题

- 构建失败：确认入口文件存在，依赖安装完整，查看 `--verbose` 日志。
- 类型失败：检查 tsconfig 与源代码类型错误；可单独执行 `npm run type-check`。

# 依赖优化 (optimizeDeps)

控制 Vite 的依赖预构建（由 esbuild 完成），显著提升冷启动速度。

## 选项
- `include: string[]` 明确参与预构建的依赖
- `exclude: string[]` 从预构建中排除的依赖
- `esbuildOptions` 传递给 esbuild 的额外参数
- `force: boolean` 强制重新预构建（等价 CLI `--force`）

## 示例
```ts
export default {
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia'],
    exclude: ['@vueuse/core'],
    esbuildOptions: {
      target: 'es2020'
    }
  }
}
```

> 当发现“某个 ESM 包无默认导出”或 “依赖是 CJS” 等问题，适度使用 `include`/`exclude` 可快速解决。


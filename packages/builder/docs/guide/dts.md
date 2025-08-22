# 类型声明

Builder 会根据项目中的 TypeScript 文件，自动生成声明文件。

## 生成方式

- `--dts`：开启生成（默认构建命令已开启，监听命令默认关闭）
- `dts` 可为对象：

```ts
export default defineConfig({
  dts: {
    bundled: true,      // 生成单文件 index.d.ts
    outDir: 'types',
    fileName: 'index.d.ts',
  }
})
```

## 常见问题

- 若类型生成失败，检查 `tsconfig.json` 是否存在且配置正确。
- 可通过 `--verbose` 查看详细日志。

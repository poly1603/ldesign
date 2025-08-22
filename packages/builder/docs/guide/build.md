# 构建与监听

## 构建命令

```bash
ldesign-builder build [input] [options]
```

- 输入可省略，自动探测 `src/index.ts`
- 常用选项：
  - `-o, --outDir <dir>` 输出目录（默认 `dist`）
  - `-f, --format <formats>` 输出格式（`esm,cjs,iife,umd`）
  - `-m, --mode <mode>` `development` 或 `production`
  - `--dts/--no-dts` 是否生成类型文件
  - `--sourcemap/--no-sourcemap` 是否生成 sourcemap
  - `--minify/--no-minify` 是否压缩

## 监听命令

```bash
ldesign-builder watch [input] [options]
```

监听模式默认：

- mode: `development`
- 格式：`esm,cjs`
- 不清理目录，不压缩，启用 sourcemap

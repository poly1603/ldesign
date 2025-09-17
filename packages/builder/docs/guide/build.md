# 构建与监听

本页介绍使用 CLI 构建与监听库项目的常见方式。想了解更完整的参数与行为，请参考 API 侧栏中的「build」。

## 快速开始

```bash
ldesign-builder build -i src/index.ts -o dist -f esm,cjs --sourcemap --minify
```

- 自动加载配置文件（若存在），命令行选项优先覆盖
- 不指定 `-i/--input` 时，构建器可能基于配置或项目结构自动探测入口

## 常用选项（精简版）

- `-i, --input <path>` 指定入口文件
- `-o, --output <dir>` 指定输出目录
- `-f, --format <formats>` 输出格式（如 `esm,cjs,umd,iife`）
- `--minify / --no-minify` 是否压缩输出
- `--sourcemap / --no-sourcemap` 是否生成 sourcemap
- `--clean / --no-clean` 构建前是否清理输出目录
- `--report [file]` 生成构建报告（JSON），默认 `dist/build-report.json`
- `--size-limit <limit>` 设置体积阈值（如 `200k`、`1mb`）
- `-w, --watch` 监听模式

> 全局选项（如 `--mode`、`--bundler`、`--log-level` 等）由主 CLI 提供，可与本命令一起使用：
> `ldesign-builder --mode production --bundler rolldown build --minify`

## 常见示例

- 双格式输出（ESM + CJS）

```bash
ldesign-builder build -i src/index.ts -o dist -f esm,cjs --sourcemap --minify
```

- 仅生成 ESM，并输出报告

```bash
ldesign-builder build -f esm --report
```

- 体积阈值控制（超限即失败）

```bash
ldesign-builder build -f esm,cjs --size-limit 200k
```

- 切换到 rolldown 打包核心

```bash
ldesign-builder --bundler rolldown build -f esm,cjs
```

## 监听开发

```bash
ldesign-builder build -w --sourcemap
```

- 文件变更将触发增量构建
- 按 `Ctrl + C` 退出（CLI 会安全地关闭 watcher）

## Windows 使用提示

- 在 PowerShell 中，包含逗号或空格的参数值建议用双引号包裹：
  - `-f "esm,cjs"`
  - `--report "dist/build-report.json"`

## 深入阅读

- 更完整的参数与行为说明：[API / build](/api/build)
- 其它命令： [watch](/api/watch) | [analyze](/api/analyze) | [clean](/api/clean)（若有）

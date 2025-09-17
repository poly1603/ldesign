# watch（CLI 命令）

监听文件变化并自动构建。该命令会自动探测项目入口（基于内部策略），并在文件变更时触发增量构建，适合开发调试使用。

> 提示：如果你需要更灵活的入口/输出/格式控制，建议使用 `build -w`（即在 build 命令中开启监听），它支持与 build 完全一致的参数集合。

## 快速开始

```bash
# 基于自动探测入口，输出到 dist，格式 esm,cjs，默认开启 sourcemap
ldesign-builder watch
```

## 语法

```bash
ldesign-builder watch [options]
```

## 选项

来自 src/cli/commands/watch.ts：

- `-f, --format <formats>` 指定输出格式（逗号分隔），默认 `esm,cjs`
- `-o, --outDir <dir>` 指定输出目录，默认 `dist`
- `--minify` 压缩输出
- `--sourcemap` 生成 sourcemap（默认开启）

> 该命令不提供 `--input`，入口通常由构建器自动探测或来自配置文件。若需显式指定入口，可改用：
> `ldesign-builder build -i src/index.ts -w`

## 行为

- 启动后进入监听模式，任何文件变更都会触发一次构建
- 构建成功/失败会输出日志；成功时会打印“构建完成”提示
- 按 `Ctrl + C` 退出（CLI 会捕获 SIGINT，自动关闭 watcher 并释放资源）

## 示例

- 指定输出目录与格式：

```bash
ldesign-builder watch -o dist-dev -f esm
```

- 压缩并生成 sourcemap：

```bash
ldesign-builder watch --minify --sourcemap
```

- 使用 build 命令的监听模式（支持更全参数）：

```bash
ldesign-builder build -i src/index.ts -o dist -f esm,cjs --sourcemap -w
```

## 相关

- [build](/api/build)
- [defineConfig](/api/define-config)

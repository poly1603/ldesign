# analyze（CLI 命令）

分析构建结果报告（build-report.json），并生成 Markdown 或 HTML 格式的分析文件；也支持与另一份报告进行差异对比输出。

> 该命令不会触发构建，请先使用 `build --report` 生成报告文件。

## 语法

```bash
ldesign-builder analyze [options]
```

## 选项

来自 src/cli/commands/analyze.ts：

- `-r, --report <file>` 指定输入的构建报告 JSON，默认 `dist/build-report.json`
- `-o, --output <file>` 指定输出文件，默认与输入同目录下的 `build-report.md` 或 `.html`
- `-f, --format <format>` 输出格式：`md|html`（默认 `md`）
- `--compare <file>` 与另一份报告比较，输出差异分析（当前 - 基线）
- `--open` 输出 HTML 后自动在系统默认浏览器中打开

## 行为

- 未指定 `--report` 时，命令会回退查找 `dist/build-report.json`；若不存在则报错提示先执行 `build --report`
- `--compare` 开启时，不生成常规报告，而生成差异报告（Markdown 或 HTML）
- HTML 报告包含表格与 Top 文件可视化条形图，便于快速定位体积热点

## 示例

- 生成 Markdown 报告：

```bash
ldesign-builder analyze --report dist/build-report.json --format md
```

- 生成 HTML 报告并自动打开：

```bash
ldesign-builder analyze -r dist/build-report.json -f html --open
```

- 与基线报告做差异分析（输出 Markdown 差异报告）：

```bash
ldesign-builder analyze -r dist/build-report.json --compare ./baseline/build-report.json
```

- 指定输出文件：

```bash
ldesign-builder analyze -r dist/build-report.json -f html -o dist/analysis.html
```

## 报告结构（概览）

- `meta`: { bundler, mode, libraryType, buildId, timestamp, duration, cache }
- `totals`: { raw, gzip, fileCount }
- `files`: [{ fileName, type, format, size, gzipSize }]

## 相关

- [build](/api/build)
- [watch](/api/watch)
- [defineConfig](/api/define-config)

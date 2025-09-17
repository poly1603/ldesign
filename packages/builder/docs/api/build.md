# build（CLI 命令）

构建库文件的命令行入口。该命令基于内部的 LibraryBuilder，支持自动探测入口、按需合并配置文件、指定打包器（rollup | rolldown）、多格式输出、体积阈值检查、生成 JSON 报告以及监听模式。

> 运行环境要求：Node.js >= 16

## 快速开始

```bash
# 最常见用法：指定入口、输出目录、输出格式、生成 sourcemap 并压缩
ldesign-builder build -i src/index.ts -o dist -f esm,cjs --sourcemap --minify
```

- 未显式指定的项将从配置文件（若存在）或默认配置中获取
- Windows PowerShell 下建议使用双引号包裹包含逗号或空格的参数值

## 语法

```bash
ldesign-builder build [options]
```

该命令会：
- 自动加载项目根目录的构建配置（通过 ConfigLoader 查找）
- 使用命令行选项覆盖配置文件中的同名项
- 调用构建或监听流程，输出构建结果、警告以及（可选的）报告文件

## 全局选项（对所有子命令生效）

这些选项由主 CLI 提供，可与 build 联合使用：

- `-c, --config <path>` 指定配置文件路径
- `--bundler <bundler>` 指定打包核心（`rollup` | `rolldown`），默认 `rollup`
- `--mode <mode>` 指定构建模式（`development` | `production`），默认 `production`
- `--log-level <level>` 日志级别（`silent` | `error` | `warn` | `info` | `debug` | `verbose`），默认 `info`
- `--no-colors` 禁用终端颜色输出
- `--silent` 静默模式（等同于 `--log-level silent`）
- `--debug` 调试模式（等同于 `--log-level debug`）

> 全局选项需要写在 `build` 前或后，Commander 均可解析，例如：
> `ldesign-builder --bundler rolldown build -i src/index.ts`

## build 专有选项

以下选项仅对 `build` 命令有效（来自 src/cli/commands/build.ts）：

- `-i, --input <path>` 指定入口文件（如 `src/index.ts`）
- `-o, --output <dir>` 指定输出目录（如 `dist`）
- `-f, --format <formats>` 指定输出格式，逗号分隔（`esm,cjs,umd,iife`）
- `--minify / --no-minify` 是否启用代码压缩
- `--sourcemap / --no-sourcemap` 是否生成 sourcemap
- `--clean / --no-clean` 构建前是否清理输出目录
- `--analyze` 构建后进行结果分析（当前为占位，输出提示信息）
- `--report [file]` 输出构建报告 JSON 文件（不带值时默认 `dist/build-report.json`）
- `--size-limit <limit>` 设置包体阈值，支持 `200k`、`1mb` 或字节数；超限将报错退出
- `-w, --watch` 进入监听模式（文件变更即触发增量构建）

## 配置合并规则

命令行选项优先级最高，其次为配置文件，最后是默认配置。内部流程如下：

1. 使用 ConfigLoader 自动查找配置文件
2. 若通过 `-c/--config` 显式指定，则优先加载该文件
3. 使用 ConfigManager 合并默认配置与文件配置，进行验证与标准化
4. 用命令行选项覆盖合并后的结果

你可以在配置文件中使用 `defineConfig` 导出配置，并在命令行通过少量参数覆盖局部项。

## 输出与日志

构建成功后会输出：
- 构建耗时（`formatDuration` 格式化）
- 每个输出文件的文件名、大小与 gzip 大小（若可得）
- 缓存摘要（若支持构建缓存）：启用状态、命中情况、查询时间、节省时间
- 警告列表（若存在）

## 生成报告（--report）

开启 `--report` 后将输出 JSON 报告，默认路径为 `dist/build-report.json`（或你通过 `--report <file>` 指定的路径）。

报告结构（关键字段）：
- `meta`: { bundler, mode, libraryType, buildId, timestamp, duration, cache }
- `totals`: { raw, gzip, fileCount }
- `files`: [{ fileName, type, format, size, gzipSize }]

这有助于在 CI 中做体积回归检测或生成可视化报告。

## 体积阈值（--size-limit）

- 支持单位：`b`（字节，默认）、`k|kb`、`m|mb`、`g|gb`
- 计算策略：优先用 `gzip` 总和（若可得），否则用原始大小总和
- 超限行为：抛出错误并显示“Top 较大文件”帮助定位

示例：
- `--size-limit 200k`
- `--size-limit 1mb`
- `--size-limit 150000`

## 监听模式（-w/--watch）

- 启动后，文件变化会触发增量构建，并输出本次构建结果
- 终止方式：按 `Ctrl + C`（CLI 监听 SIGINT，自动关闭 watcher 并释放资源）
- 日志会显示变更文件与本次产物列表

示例：
```bash
ldesign-builder build -w -f esm,cjs --sourcemap
```

## 与配置文件配合

常见做法是将大部分配置写到配置文件中，仅用命令行覆盖少量选项：

```bash
# 使用配置文件中的 input/output/format 等，命令行仅覆盖 mode 和 bundler
ldesign-builder --mode production --bundler rolldown build --minify --report
```

> 若没有找到配置文件，CLI 会使用默认配置并继续构建。

## 常见场景示例

- ESM + CJS 双格式输出：
  ```bash
  ldesign-builder build -i src/index.ts -o dist -f esm,cjs --sourcemap --minify
  ```
- 仅生成 ESM、并输出报告：
  ```bash
  ldesign-builder build -f esm --report
  ```
- 严格控制体积：
  ```bash
  ldesign-builder build -f esm,cjs --size-limit 200k
  ```
- 切换打包核心：
  ```bash
  ldesign-builder --bundler rolldown build -f esm,cjs
  ```
- 监听开发：
  ```bash
  ldesign-builder build -w --sourcemap
  ```

## 返回码

- 成功：退出码 0
- 失败：退出码 1（例如：构建报错、体积超限等）

## 注意与限制

- `--analyze` 当前为占位功能，会输出开始与完成提示；后续会提供依赖图、包大小分析、重复依赖检查等
- Windows PowerShell 中，包含逗号或空格的参数建议用双引号包裹：`-f "esm,cjs"`、`--report "dist/build-report.json"`

## 相关

- [watch](/api/watch)
- [defineConfig](/api/define-config)
- [BuildOptions](/api/build-options)
- [BuildResult](/api/build-result)

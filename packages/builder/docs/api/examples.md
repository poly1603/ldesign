# examples（CLI 命令）

批量构建仓库内 examples 目录下的多个示例项目。该命令会扫描指定根目录下的子目录，并在包含 `package.json` 的子目录中依次调用 `ldesign-builder build` 进行构建。

## 语法

```bash
ldesign-builder examples [options]
```

## 选项

来自 src/cli/commands/examples.ts：

- `--root <path>` examples 根目录（相对当前工作目录），默认 `examples`
- `--filter <keyword>` 仅构建名称包含关键字的示例
- `--concurrency <n>` 并发构建数，默认 `1`（串行）

## 行为

- 扫描 `--root` 下的一级子目录，凡包含 `package.json` 的目录视为一个示例项目
- 对每个示例项目，使用子进程在该目录中调用 `ldesign-builder build`
- 支持并发构建；当 `--concurrency > 1` 时，将并发执行多个子项目的构建
- 所有子项目构建结束后输出“全部示例构建完成”

## 示例

- 串行构建所有示例：

```bash
ldesign-builder examples
```

- 仅构建名称包含 `react` 的示例：

```bash
ldesign-builder examples --filter react
```

- 以 3 并发构建：

```bash
ldesign-builder examples --concurrency 3
```

- 指定根目录：

```bash
ldesign-builder examples --root playground
```

## 注意

- 每个示例项目应能在其自身目录下执行 `ldesign-builder build` 成功；请确保其配置/依赖完整
- Windows 下建议在 PowerShell 使用双引号包裹带空格或逗号的参数值

## 相关

- [build](/api/build)
- [watch](/api/watch)
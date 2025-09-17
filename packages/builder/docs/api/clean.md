# clean（CLI 命令）

清理构建输出目录的命令。目前为占位实现（暂未实现具体清理逻辑）。

## 语法

```bash
ldesign-builder clean
```

## 当前行为

- 执行后会输出“清理命令暂未实现”。
- 未来会提供以下能力（规划）：
  - 清理 `dist` 或配置中指定的输出目录
  - 支持选择性清理（仅产物、仅缓存）
  - 与构建缓存联动，支持 `--cache` / `--no-cache`

## 相关

- [build](/api/build)
- [watch](/api/watch)
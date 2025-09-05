---
title: 故障排除
---

# 故障排除

## ESLint 插件解析失败（@typescript-eslint/\*）

- 现已改为使用根目录的 ESLint 配置对源码进行检查：
  - 脚本：`pnpm -C packages/kit run lint`
  - 仅检查 `src/` 与 `tests/`，忽略 `docs/` 与 `examples/`

## TypeScript verbatimModuleSyntax 导致的类型导出错误

- 需要使用 `export type { T } from '...'` 重新导出类型。
- 本包已修复相关导出（见 `src/index.ts`）。

## 文档编辑链接指向错误仓库

- 已修正为 `ldesign/ldesign` 仓库，且补充了 `/changelog` 与 `/contributing/` 页面。

若仍有问题，请提交 Issue：

- https://github.com/ldesign/ldesign/issues

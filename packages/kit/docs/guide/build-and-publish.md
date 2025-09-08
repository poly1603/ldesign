# 打包与发布（tsup）

本章节介绍如何使用 tsup 为 @ldesign/kit 进行库打包，以及常见问题与最佳实践。

## 目标

- 产出 ESM 和 CJS 两种格式
- 保持源码映射（sourcemap）以便调试
- 正确声明对外导出的子路径（exports）
- 生成类型声明（后续启用）

## 快速开始

```bash
# 构建
pnpm build
# 监听构建
pnpm build:watch
```

当前构建使用项目根目录下的 tsup.config.ts。它会：
- 构建主入口 src/index.ts
- 为 utils、filesystem、network、process、database、logger、config、cache、events、validation、git、package、ssl、cli、inquirer、notification、performance、iconfont、scaffold、console、project 等子模块分别生成 `dist/<submodule>/index.{js,cjs}`

## 子路径导出（exports）

为确保使用者可以按需引入模块，我们在 package.json 中声明了子路径导出。例如：

```json
{
  "exports": {
    ".": { "import": "./dist/index.js", "require": "./dist/index.cjs", "types": "./dist/index.d.ts" },
    "./filesystem": { "import": "./dist/filesystem/index.js", "require": "./dist/filesystem/index.cjs", "types": "./dist/filesystem/index.d.ts" },
    "./cache": { "import": "./dist/cache/index.js", "require": "./dist/cache/index.cjs", "types": "./dist/cache/index.d.ts" },
    "./events": { "import": "./dist/events/index.js", "require": "./dist/events/index.cjs", "types": "./dist/events/index.d.ts" },
    "./validation": { "import": "./dist/validation/index.js", "require": "./dist/validation/index.cjs", "types": "./dist/validation/index.d.ts" },
    "./iconfont": { "import": "./dist/iconfont/index.js", "require": "./dist/iconfont/index.cjs", "types": "./dist/iconfont/index.d.ts" }
  }
}
```

确保新增的子模块在 exports 中都有对应的映射，否则使用者无法通过子路径导入。

## 类型声明（d.ts）

目前 tsup 中的 dts 生成暂未启用（以便先通过构建和测试）。当类型错误修复完成后，可在 tsup.config.ts 中将 `dts: false` 调整为 `dts: true`，或为主入口与各子模块分别开启 d.ts 生成，以便为 TypeScript 用户提供更好的类型体验。

同时请确保：
- tsconfig.json 中的 `declaration: true`、`declarationMap: true`
- 修复严格模式下（strict）产生的类型报错

## 与 ESM-only 依赖的兼容性

本项目依赖了 `node-fetch@3`（ESM-only）。当使用 CJS 入口时，直接 `require('node-fetch')` 会失败。我们在打包时将其 external 化，仍建议在 ESM 环境使用相关功能，或在代码中以 `await import('node-fetch')` 的方式做条件加载。根据你的应用环境，选择 ESM 导入或在 CJS 中避免直接 require 该依赖。

## 常见问题（FAQ）

- 问：为什么 dist 中存在很多 "unused import" 的告警？
  答：这是构建时对外部依赖/Node 内置模块进行 external 处理后产生的提示，不影响运行。后续我们会逐步清理未使用的导入。

- 问：如何只构建某个子模块？
  答：可以在 tsup.config.ts 中调整 `subModules` 列表，只保留需要的条目，或临时注释不需要的子模块后执行 `pnpm build`。

## 发布前检查清单

- [ ] `pnpm type-check` 通过（或确保关键模块已通过）
- [ ] `pnpm test:run` 全部通过
- [ ] `pnpm build` 无报错（告警可接受，但建议持续减少）
- [ ] 确认新增/调整的子路径已写入 package.json 的 exports
- [ ] 文档对新增功能已更新

## 参考脚本

- `pnpm build`：清理并执行 tsup 打包
- `pnpm test:run`：运行 vitest 测试
- `pnpm docs:dev`：本地预览文档站点
- `pnpm docs:build`：构建文档站点


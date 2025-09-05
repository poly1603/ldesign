# LDesign Monorepo 任务清单（@ldesign/builder 增强）

最后更新：自动生成于当前会话

## 目标
- 自动打包 examples 目录所有示例项目
- 输出产物：ESM→es/，CJS→lib/，UMD→dist/；为 ES/CJS 分发 d.ts
- 默认多入口（src/**/* 为入口，排除测试与声明）
- 零配置可用；builder 内置 Rollup 及插件
- TS + ESM；完善 Vitest 测试、README、VitePress 文档

## 进度追踪

- [x] 需求分析与总体规划
- [x] 适配器：按格式映射输出目录（esm→es、cjs→lib、umd→dist）并设置 entryFileNames
- [x] 适配器：构建结束后分发 d.ts 到 es/ 与 lib/
- [x] 策略：默认多入口解析（src/**/*）并回填到统一配置
- [x] CLI：新增 `examples` 命令，批量构建 examples 下项目
- [x] 测试：新增 transformConfig 单测覆盖输出映射
- [x] 测试：声明分发与多入口解析单测；examples 命令单测（mock child_process）
- [x] 文档：更新主 README 与各模块 README
- [ ] 性能测试与基准（可选）

## 已变更文件（核心）
- packages/builder/src/adapters/rollup/RollupAdapter.ts
  - transformConfig 按格式映射 es/lib/dist
  - 构建完成后分发 d.ts（types→es、lib）
- packages/builder/src/cli/commands/examples.ts（新增）
  - 新增 `ldesign-builder examples` 批量构建示例
- packages/builder/src/cli/index.ts
  - 注册 examples 子命令
- packages/builder/src/strategies/typescript/TypeScriptStrategy.ts
  - 默认多入口解析（resolveInputEntries）
- 测试文件（新增）
  - src/__tests__/adapters/rollup/transform-config.test.ts
  - src/__tests__/adapters/rollup/distribute-types.test.ts
  - src/__tests__/strategies/typescript/multi-entry.test.ts
  - src/__tests__/cli/commands/examples.test.ts
- 文档更新
  - packages/builder/README.md（特性与使用说明）
  - packages/builder/src/adapters/rollup/README.md（新增）
  - packages/builder/src/cli/commands/README.md（新增）

## 接下来（短期）
1. ~~清理 TypeScriptStrategy 文件中遗留的历史代码片段，保证类型与语法完全正确~~（已完成）
2. ~~在构建流程中补充 d.ts 分发的单测（mock fs-extra）~~（已完成）
3. ~~为 examples 命令补充单测（mock child_process.spawn）~~（已完成）
4. ~~更新文档（VitePress + README）~~（已完成基础文档）
5. 可选：VitePress 完整文档站点
6. 可选：性能基准测试

## 说明
- 本次变更不新增依赖，继续复用 builder 内置的 Rollup 与插件
- 单测已可验证输出目录映射正确；更多测试将逐步补齐


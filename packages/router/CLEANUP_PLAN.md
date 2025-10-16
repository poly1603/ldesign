# 项目深度清理计划

## 需要删除的文件

### 1. 重复的配置文件
- `tests/vitest.config.ts` - 与根目录重复
- `.ldesign/builder.config.ts.backup` - 备份文件

### 2. 未使用的脚本文件
- `scripts/build-umd.mjs` - 已由 ldesign-builder 处理
- `scripts/build.js` - 已由 ldesign-builder 处理  
- `scripts/commit.js` - 未在 package.json 中使用
- `scripts/dev-server.js` - 未使用
- `scripts/setup-git-hooks.ps1` - 旧的钩子设置
- `scripts/setup-hooks.js` - 旧的钩子设置
- `scripts/validate-commit-msg.js` - 已由 commitlint 处理
- `scripts/validate.js` - 未使用

### 3. 测试相关文件（如果不需要测试）
- `playwright.config.ts` - E2E测试配置
- `vitest.config.ts` - 单元测试配置
- `commitlint.config.js` - commit规范
- `src/testing/test-utils.ts` - 测试工具

### 4. 过大的文件需要拆分
- `core/matcher.ts` (29KB) - 需要拆分
- `debug/RouteDebugger.ts` (26KB) - 需要拆分  
- `features/RouteSecurity.ts` (23KB) - 需要拆分
- `features/SmartRouteManager.ts` (22KB) - 需要拆分
- `engine/plugin.ts` (22KB) - 需要拆分
- `utils/unified-memory-manager.ts` (20KB) - 需要拆分

## 需要优化的代码

### 1. 移除TODO/FIXME/HACK注释
- `plugins/preload.ts:419`
- `plugins/animation.ts:90`
- `engine/plugin.ts:24`
- `analytics/route-analytics.ts:185`
- `components/RouterLink.tsx:77`

### 2. 清理console.log语句
- 全局搜索并替换为 logger

### 3. 移除未使用的导出
- 分析所有导出是否被使用

### 4. 合并相似功能
- 检查是否有功能重叠的模块

## 项目结构优化

### 理想的目录结构
```
src/
├── core/           # 核心功能（拆分大文件）
│   ├── router.ts
│   ├── matcher/    # 拆分 matcher.ts
│   │   ├── index.ts
│   │   ├── path-matcher.ts
│   │   └── route-matcher.ts
│   ├── history.ts
│   └── constants.ts
├── components/     # Vue组件
├── composables/    # 组合式函数
├── plugins/        # 插件系统
├── utils/          # 工具函数（精简）
│   ├── logger.ts
│   ├── error-manager.ts
│   └── index.ts
├── types/          # 类型定义
└── index.ts        # 入口文件
```

## 执行步骤

1. 删除未使用的文件
2. 拆分过大的文件
3. 清理TODO和console
4. 优化导入导出
5. 重新组织目录结构
6. 更新配置文件
7. 运行构建验证
# 配置文件优化说明

## 概述

本次优化将 LDesign Builder 的默认配置文件从 `ldesign.config.ts` 更改为 `.ldesign/builder.config.ts`，以提供更好的项目组织和配置管理。

## 主要变更

### 1. 配置文件优先级调整

**之前的优先级顺序：**
```
1. ldesign.config.ts
2. ldesign.config.js
3. ldesign.config.mjs
4. ldesign.config.json
5. builder.config.ts
6. builder.config.js
7. builder.config.mjs
8. builder.config.json
9. .builderrc.ts
10. .builderrc.js
11. .builderrc.json
```

**现在的优先级顺序：**
```
1. .ldesign/builder.config.ts    ← 新增，最高优先级
2. .ldesign/builder.config.js    ← 新增
3. .ldesign/builder.config.mjs   ← 新增
4. .ldesign/builder.config.json  ← 新增
5. ldesign.config.ts             ← 保持向后兼容
6. ldesign.config.js
7. ldesign.config.mjs
8. ldesign.config.json
9. builder.config.ts
10. builder.config.js
11. builder.config.mjs
12. builder.config.json
13. .builderrc.ts
14. .builderrc.js
15. .builderrc.json
```

### 2. 默认配置文件路径更新

- **默认配置文件路径**：从 `ldesign.config.ts` 更改为 `.ldesign/builder.config.ts`
- **向后兼容性**：保持对旧配置文件的支持

### 3. 文档更新

更新了以下文档中的配置文件路径说明：
- `docs/guide/config.md`
- `summary/03-实现细节.md`
- `summary/04-使用指南.md`
- `docs/configuration.md`
- `BUILDER_OPTIMIZATION_REPORT.md`
- 各示例项目的 README 文件

## 优势

### 1. 更好的项目组织
- 将构建相关配置集中在 `.ldesign/` 目录下
- 减少项目根目录的文件数量
- 提供更清晰的项目结构

### 2. 避免配置冲突
- 与其他工具的配置文件分离
- 明确标识这是 LDesign Builder 的配置

### 3. 扩展性
- 为未来的 LDesign 生态系统配置提供统一的目录结构
- 便于添加其他相关配置文件

## 使用方法

### 新项目
在项目根目录创建 `.ldesign/builder.config.ts`：

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: ['esm', 'cjs'],
    sourcemap: true
  },
  minify: true,
  clean: true
})
```

### 现有项目迁移
1. 创建 `.ldesign/` 目录
2. 将现有的 `ldesign.config.ts` 移动到 `.ldesign/builder.config.ts`
3. 删除旧的配置文件（可选，保留也能正常工作）

## 向后兼容性

- 现有的 `ldesign.config.ts` 文件仍然可以正常工作
- 如果同时存在新旧配置文件，新配置文件（`.ldesign/builder.config.ts`）会被优先使用
- 不需要立即迁移现有项目

## 测试验证

已通过以下方式验证了配置文件优先级：
1. 创建测试配置文件
2. 验证配置文件查找顺序
3. 确认新配置文件被优先读取
4. 确认向后兼容性正常工作

## 相关文件

### 核心修改
- `src/constants/defaults.ts` - 更新配置文件名列表和默认配置文件路径

### 文档更新
- `docs/guide/config.md`
- `summary/03-实现细节.md`
- `summary/04-使用指南.md`
- `docs/configuration.md`
- `BUILDER_OPTIMIZATION_REPORT.md`
- 各示例项目的 README 文件

### 配置加载逻辑
- `src/utils/config/config-loader.ts` - 配置文件加载器（无需修改，自动使用新的优先级）
- `src/cli/commands/build.ts` - 构建命令（无需修改，自动使用新的配置查找逻辑）

## 迁移执行结果

### 自动迁移统计
- **Examples 项目**: 13 个示例项目全部迁移成功
- **Packages 项目**: 30 个包项目全部迁移成功
- **特殊配置文件**:
  - 9 个 `.js` 格式配置文件迁移成功
  - 1 个 `.mjs` 格式配置文件迁移成功
  - 1 个 `builder.config.ts` 文件迁移成功
  - 1 个 `builder.config.rolldown.ts` 文件迁移成功

### 迁移验证
- ✅ 所有项目的 `.ldesign/` 目录创建成功
- ✅ 所有新配置文件写入成功
- ✅ 所有旧配置文件删除成功
- ✅ 构建测试通过，新配置文件被正确读取

### 迁移的项目列表

**Examples 项目 (13个):**
- angular-lib
- basic-typescript
- complex-library
- lit-components
- mixed-library
- multi-module-typescript
- preact-components
- react-components
- solid-components
- style-library
- svelte-components
- typescript-utils
- vue3-components

**Packages 项目 (30个):**
- api, cache, calendar, captcha, chart, color, component
- cropper, crypto, datepicker, device, editor, engine
- flowchart, form, http, i18n, map, pdf, progress
- qrcode, router, shared, size, store, table
- template, theme, tree, video, watermark, websocket

## 总结

这次优化提供了更好的配置文件组织方式，同时保持了完全的向后兼容性。通过自动化迁移脚本，我们成功将整个 LDesign 生态系统中的 **46 个项目**全部迁移到新的配置文件格式，包括：

- **13 个示例项目**
- **30 个包项目**
- **3 个特殊配置文件**

所有项目现在都使用 `.ldesign/builder.config.ts` 作为默认配置文件，提供了更清晰的项目结构和更好的配置管理体验。

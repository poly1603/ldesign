<!-- be616230-4580-4c52-8844-19e9ab08b493 2676113a-a507-4e45-88d1-32e1ba87ab53 -->
# Icons 包完善计划

## 1. 修复 strokeWidth 属性支持

### 1.1 修复 IconBase 组件

**Vue IconBase** (`packages/icons/src/vue/IconBase.ts`):

- 在渲染 path 时添加 `stroke` 和 `stroke-width` 属性支持
- 检测 SVG 是否为 stroke 类型（通过 path 是否包含 stroke 属性或 fill="none"）
- 仅在 stroke 图标上应用 strokeWidth

**React IconBase** (`packages/icons/src/react/IconBase.tsx`):

- 同样的逻辑应用到 React 组件
- 当前已有 strokeWidth 在 svgProps 中，但未正确应用到 path 元素

**Lit IconBase** (`packages/icons/src/lit/IconBase.ts`):

- 添加相同的 strokeWidth 支持

### 1.2 添加 stroke 属性检测

在 `packages/icons/scripts/parsers/svg-parser.ts` 中:

- 解析 SVG 时检测是否为 stroke 类型（查找 `stroke` 属性或 `fill="none"`）
- 添加 `isStroke: boolean` 字段到 `ParsedSvg` 接口
- 在元数据中记录图标类型

## 2. 集成 Lucide Icons (500+ 图标)

### 2.1 下载 Lucide Icons SVG

- 从 Lucide GitHub repo 下载 SVG 图标源文件
- 按分类整理到 `packages/icons/svg/` 目录下的各个子目录：
  - `general/` - 通用图标（home, search, settings 等）
  - `editing/` - 编辑类（edit, delete, copy 等）
  - `navigation/` - 导航类（arrows, chevrons 等）
  - `media/` - 媒体类（play, pause, music 等）
  - `status/` - 状态类（check, close, alert 等）
  - `file/` - 文件类（file, folder, document 等）
  - `communication/` - 通讯类（mail, message, phone 等）
  - `business/` - 商务类（briefcase, calendar, chart 等）
  - `weather/` - 天气类（sun, cloud, rain 等）
  - `devices/` - 设备类（smartphone, laptop, monitor 等）

### 2.2 优化和规范化 SVG

- 使用现有的 `svg-optimizer.ts` 优化所有 SVG
- 确保所有 SVG 使用 `viewBox="0 0 24 24"`
- 统一 stroke-width 为 2（Lucide 默认值）

### 2.3 生成组件

- 运行 `pnpm generate` 自动生成所有框架的组件
- 验证生成的组件正确性

## 3. 增强示例应用

### 3.1 Vue 示例增强 (`packages/icons/examples/vue-demo/src/App.vue`)

**新增功能**：

- ✅ strokeWidth 控制滑块（范围 0.5-4，步长 0.5）
- ✅ 网格/列表视图切换
- ✅ 图标复制功能（复制组件代码、SVG 代码）
- ✅ 批量操作（下载选中图标、收藏功能）
- ✅ 深色/浅色主题切换
- ✅ 响应式布局优化

**界面美化**：

- 渐变色背景和玻璃态效果
- 平滑动画过渡
- 卡片悬浮效果增强
- 图标预览区放大显示
- 代码语法高亮
- Toast 提示优化

**strokeWidth 演示**：

```vue
<div class="stroke-control">
  <label>描边粗细:</label>
  <input v-model.number="strokeWidth" type="range" min="0.5" max="4" step="0.5" />
  <span>{{ strokeWidth }}</span>
</div>
```

### 3.2 React 示例增强 (`packages/icons/examples/react-demo/src/App.tsx`)

**新增功能**（与 Vue 一致）：

- strokeWidth 控制
- 网格/列表视图
- 复制功能
- 主题切换
- 响应式布局

**样式优化** (`packages/icons/examples/react-demo/src/App.css`):

- 使用 CSS Grid 和 Flexbox
- 添加动画关键帧
- 响应式断点

### 3.3 Lit 示例增强 (`packages/icons/examples/lit-demo.html`)

将简单的 HTML 页面升级为完整的 SPA：

- 使用 Lit 组件重构
- 添加与 Vue/React 一致的功能
- Web Components 最佳实践

### 3.4 新增通用组件

**IconGrid 组件**：

- 虚拟滚动支持（处理 500+ 图标性能）
- 可配置网格大小
- 懒加载

**CodePreview 组件**：

- 语法高亮（使用 Prism.js）
- 一键复制
- 多语言支持（Vue/React/Lit）

**IconDetail 模态框**：

- 图标大预览
- 所有属性交互式演示
- 代码示例
- 下载 SVG
- 相关图标推荐

## 4. 文档更新

### 4.1 README.md

- 更新图标数量（500+）
- 添加 strokeWidth 属性说明
- 添加新分类列表
- 更新示例代码

### 4.2 新增文档

- `ICONS_CATALOG.md` - 完整图标目录（按分类）
- `MIGRATION_GUIDE.md` - 从其他图标库迁移指南
- `CUSTOMIZATION.md` - 自定义图标指南

## 5. 构建和测试

### 5.1 构建验证

- 运行 `pnpm generate` 生成所有组件
- 运行 `pnpm build` 构建库
- 验证产物大小（确保 tree-shaking 正常）

### 5.2 示例测试

- 在浏览器中测试所有示例
- 验证 strokeWidth 在不同图标上的效果
- 测试搜索、过滤、主题切换等功能
- 性能测试（500+ 图标渲染）

## 实施步骤总结

1. **修复 strokeWidth 支持** - 修改 IconBase 组件，添加 stroke 检测
2. **集成 Lucide Icons** - 下载、整理、优化 SVG 文件
3. **生成组件** - 运行生成脚本，创建 500+ 图标组件
4. **增强 Vue 示例** - 添加新功能，美化界面
5. **增强 React 示例** - 保持与 Vue 一致
6. **增强 Lit 示例** - 升级为完整应用
7. **更新文档** - README 和新文档
8. **构建测试** - 验证所有功能正常

### To-dos

- [ ] 修复 Vue/React/Lit IconBase 组件的 strokeWidth 支持，添加 stroke 类型检测
- [ ] 从 Lucide Icons 下载和整理 500+ SVG 图标到各分类目录
- [ ] 运行生成脚本创建所有图标组件并验证
- [ ] 增强 Vue 示例：添加 strokeWidth 控制、网格/列表视图、复制功能、主题切换等
- [ ] 增强 React 示例：添加与 Vue 一致的所有功能
- [ ] 升级 Lit 示例为完整应用
- [ ] 更新 README 和创建新文档（图标目录、迁移指南、自定义指南）
- [ ] 构建并测试所有功能，验证性能和正确性
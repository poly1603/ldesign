# 编辑器代码优化计划

## 📋 问题分析总结

### 1. 图标系统重复 ❌
**现状：**
- `src/ui/icons.ts` (160行) - 完整图标库
- `src/utils/icons.ts` (86行) - Lucide图标库
- 两套系统功能重叠，命名不一致

**影响：**
- 增加包体积
- 维护困难
- 容易引起混淆

**优化方案：**
```
src/ui/icons/ 
├── index.ts          # 统一入口
├── basic.ts          # 基础图标
├── formatting.ts     # 格式化图标
├── media.ts          # 媒体图标
└── lucide.ts         # Lucide特殊图标
```

**预估效果：**
- 代码量减少 40%
- API统一，易于维护

---

### 2. UI组件冗余 ❌

**重复代码统计：**
| 组件类型 | 文件 | 行数 | 重复率 |
|---------|------|------|--------|
| Modal | UIComponents.ts | 200+ | 60% |
| Dropdown | UIComponents.ts + Dropdown.ts | 150+ | 70% |
| 对话框 | ColorPicker/TableDialog/FindReplaceDialog | 500+ | 50% |

**问题：**
- 没有基础组件类
- 重复实现定位、显示/隐藏、事件绑定
- 样式管理分散

**优化方案：**
```typescript
// 基础组件类
abstract class BaseComponent {
  protected container: HTMLElement
  show() / hide() / destroy()
  position(x, y)
  bindEvents()
}

// 继承结构
BaseComponent
├── Modal (基础模态框)
│   ├── ColorPicker
│   ├── TableDialog
│   └── FindReplaceDialog
├── Dropdown
└── ContextMenu
```

**预估效果：**
- 减少重复代码 1000+ 行
- 统一API和行为
- 更易扩展

---

### 3. 右键菜单系统混乱 ❌❌❌

**三套实现：**
1. `components/ContextMenuSystem.ts` (578行) - 通用系统
2. `core/ContextMenuManager.ts` (349行) - 管理器
3. `ui/TableContextMenu.ts` (144行) - 表格专用
4. `plugins/media-context-menu/ContextMenu.ts` (249行) - 媒体专用

**总计：** 1320行，功能高度重叠！

**优化方案：**
```
保留: core/ContextMenuManager.ts (作为统一管理器)
整合: ContextMenuSystem 的高级特性
移除: TableContextMenu, media ContextMenu
改为: 使用统一管理器注册菜单
```

**示例：**
```typescript
// 统一注册方式
registerContextMenu({
  id: 'table-menu',
  selector: 'table',
  items: [...]
})

registerContextMenu({
  id: 'image-menu',
  selector: 'img',
  items: [...]
})
```

**预估效果：**
- 减少代码 900+ 行
- 统一菜单行为
- 更容易调试

---

### 4. 目录结构混乱 ❌

**当前问题：**
```
src/
├── components/  # 只有右键菜单？
├── ui/          # 混杂各种UI组件
├── utils/       # 只有图标？
├── core/        # 包含了菜单管理器？
```

职责不清，难以快速定位代码

**优化后：**
```
src/
├── core/              # 纯核心逻辑
│   ├── Editor.ts
│   ├── Document.ts
│   ├── Selection.ts
│   ├── Command.ts
│   ├── Plugin.ts
│   ├── Schema.ts
│   ├── EventEmitter.ts
│   └── ContextMenuManager.ts
│
├── ui/                # 所有UI组件
│   ├── base/         # 基础组件
│   │   ├── BaseComponent.ts
│   │   ├── Modal.ts
│   │   ├── Dropdown.ts
│   │   └── ContextMenu.ts
│   ├── complex/      # 复杂组件
│   │   ├── ColorPicker.ts
│   │   ├── TableDialog.ts
│   │   ├── FindReplaceDialog.ts
│   │   ├── MediaPropertiesDialog.ts
│   │   └── Tooltip.ts
│   ├── toolbar/      # 工具栏
│   │   ├── Toolbar.ts
│   │   └── defaultToolbar.ts
│   └── icons/        # 图标库
│       └── index.ts
│
├── plugins/          # 插件，按功能分组
│   ├── formatting/   # 格式化
│   ├── media/        # 媒体
│   ├── table/        # 表格
│   └── index.ts
│
├── utils/            # 工具函数
│   ├── dom.ts
│   ├── style.ts
│   ├── validation.ts
│   └── event.ts
│
├── adapters/         # 框架适配器
│   ├── common.ts
│   ├── react/
│   └── vue/
│
├── types/
└── index.ts
```

---

### 5. 缺少公共工具函数 ❌

**重复出现的代码片段：**
- DOM元素创建和样式设置 (出现20+次)
- 位置计算和边界检查 (出现15+次)
- 颜色格式转换 (出现8+次)
- 事件绑定和清理 (出现30+次)

**优化方案：**
```typescript
// utils/dom.ts
export function createElement(config: ElementConfig): HTMLElement
export function applyStyles(el: HTMLElement, styles: CSSProperties): void
export function removeElement(el: HTMLElement): void

// utils/position.ts
export function adjustPosition(el: HTMLElement, x: number, y: number): Point
export function keepInViewport(el: HTMLElement): void
export function getRelativePosition(el: HTMLElement, parent: HTMLElement): Point

// utils/color.ts
export function hexToRgb(hex: string): RGB
export function rgbToHex(rgb: RGB): string
export function isValidColor(color: string): boolean

// utils/event.ts
export function on(el: HTMLElement, event: string, handler: Function): () => void
export function once(el: HTMLElement, event: string, handler: Function): void
export function off(el: HTMLElement, event: string, handler: Function): void
```

**预估效果：**
- 减少重复代码 500+ 行
- 统一行为
- 更容易测试

---

### 6. 插件组织不统一 ⚠️

**现状：**
- 大部分插件是单文件
- `media-context-menu/` 是目录
- `image-resize/` 是目录
- 不够统一

**优化方案：**
```
plugins/
├── formatting/       # 格式化插件组
│   ├── bold.ts
│   ├── italic.ts
│   ├── underline.ts
│   └── index.ts
├── media/           # 媒体插件组
│   ├── image.ts
│   ├── image-resize.ts
│   ├── video.ts
│   ├── audio.ts
│   ├── media-dialog.ts
│   ├── media-context-menu.ts
│   └── index.ts
├── table/           # 表格插件组
│   ├── table.ts
│   ├── table-selection.ts
│   ├── table-resize.ts
│   └── index.ts
└── index.ts         # 导出所有插件
```

---

## 📊 整体优化效果预估

| 指标 | 优化前 | 优化后 | 改善 |
|------|--------|--------|------|
| **总代码行数** | ~8,000 | ~6,000 | **-25%** |
| **文件数** | 55 | 45 | **-18%** |
| **代码重复率** | 25% | <5% | **-80%** |
| **组件复用率** | 30% | 85% | **+183%** |
| **打包体积** | 100% | ~75% | **-25%** |

---

## 🚀 优化实施步骤

### 阶段一：基础重构 (2-3天)

**第1步：合并图标系统** ✅
- [x] 合并 `ui/icons.ts` 和 `utils/icons.ts`
- [ ] 统一命名规范
- [ ] 创建类型定义
- [ ] 更新所有引用

**第2步：创建基础组件类**
- [ ] 创建 `ui/base/BaseComponent.ts`
- [ ] 实现基础Modal类
- [ ] 实现基础Dropdown类
- [ ] 实现基础ContextMenu类

**第3步：提取工具函数**
- [ ] 创建 `utils/dom.ts`
- [ ] 创建 `utils/position.ts`
- [ ] 创建 `utils/color.ts`
- [ ] 创建 `utils/event.ts`

### 阶段二：统一右键菜单 (1-2天)

- [ ] 增强 `ContextMenuManager` 功能
- [ ] 迁移 `TableContextMenu` 到统一系统
- [ ] 迁移 `media ContextMenu` 到统一系统
- [ ] 移除冗余文件

### 阶段三：重构UI组件 (2-3天)

- [ ] 迁移 ColorPicker 到 Modal 基类
- [ ] 迁移 TableDialog 到 Modal 基类
- [ ] 迁移 FindReplaceDialog 到 Modal 基类
- [ ] 迁移 MediaPropertiesDialog 到 Modal 基类
- [ ] 统一 Dropdown 组件

### 阶段四：优化目录结构 (1天)

- [ ] 重组 ui/ 目录
- [ ] 重组 plugins/ 目录
- [ ] 更新所有导入路径
- [ ] 更新文档

### 阶段五：测试和验证 (1-2天)

- [ ] 单元测试
- [ ] 集成测试
- [ ] 性能测试
- [ ] 打包体积验证

---

## 💡 最佳实践建议

### 1. 组件设计原则
- **单一职责**: 每个组件只做一件事
- **可组合性**: 通过组合而非继承
- **可测试性**: 方便单元测试

### 2. 代码复用策略
- 提取公共逻辑到工具函数
- 使用组合模式而非继承
- 通过配置而非硬编码

### 3. 命名规范
```typescript
// 组件类名：大驼峰
class ColorPicker extends Modal {}

// 函数名：小驼峰
function createElement() {}

// 常量：全大写下划线
const DEFAULT_TOOLBAR_ITEMS = []

// 文件名：kebab-case
// color-picker.ts, table-dialog.ts
```

### 4. 导入导出规范
```typescript
// 使用命名导出
export class ColorPicker {}
export function createIcon() {}

// 每个目录提供index.ts统一导出
export * from './Modal'
export * from './Dropdown'
```

---

## ⚠️ 注意事项

1. **向后兼容**: 保持API兼容，避免破坏性更改
2. **渐进式重构**: 分阶段进行，每阶段都保持功能正常
3. **充分测试**: 每次重构后都要运行测试
4. **文档同步**: 及时更新文档和注释
5. **性能监控**: 确保优化不影响性能

---

## 📚 相关资源

- [代码重构最佳实践](https://refactoring.guru/)
- [组件设计模式](https://www.patterns.dev/)
- [TypeScript最佳实践](https://typescript-eslint.io/rules/)

---

## 🎯 预期成果

优化完成后，项目将具备：

✅ **更清晰的代码结构**
- 职责明确的目录划分
- 一致的命名规范

✅ **更高的代码质量**
- 消除重复代码
- 提高复用率
- 更易于维护

✅ **更好的开发体验**
- 快速定位代码
- 方便扩展功能
- 减少bug

✅ **更小的打包体积**
- 减少25%的代码量
- 更好的tree-shaking
- 更快的加载速度

---

生成时间: 2025-10-16
作者: AI Assistant

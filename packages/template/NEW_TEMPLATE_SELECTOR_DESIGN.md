# 🎨 全新模板选择器设计

## 🎯 设计目标

重新设计模板选择器 UI，提供更美观和用户友好的交互体验，支持多种交互模式和自定义配置。

## ✨ 核心特性

### 1. 🎛️ 图标触发器设计

- **美观的圆形图标按钮**：替代传统的下拉框样式
- **三种尺寸**：small (32px)、medium (40px)、large (48px)
- **悬停动效**：阴影提升、轻微上移效果
- **激活状态**：蓝色背景，白色图标
- **自定义图标**：支持通过 `triggerIcon` prop 自定义图标

### 2. 🎭 双模式交互设计

#### 🪟 模态对话框模式 (`mode="modal"`)

- **居中显示**：屏幕中央弹出对话框
- **遮罩背景**：半透明黑色背景
- **优雅动画**：淡入 + 缩放动画效果
- **关闭方式**：
  - 点击右上角关闭按钮
  - 点击遮罩背景
  - 按 ESC 键
- **适用场景**：桌面端，需要专注选择的场景

#### 📋 下拉弹窗模式 (`mode="popup"`)

- **相对定位**：在触发按钮下方显示
- **箭头指向**：CSS 伪元素创建的箭头指向触发器
- **智能定位**：自动调整位置避免超出屏幕
- **轻量动画**：向下滑入动画效果
- **适用场景**：移动端、平板端，快速选择场景

### 3. 📋 模板列表设计

#### 🎨 视觉设计

- **现代卡片风格**：圆角、阴影、悬停效果
- **清晰层次结构**：标题、描述、标签分层显示
- **选中状态**：蓝色边框 + 背景色 + 勾选图标
- **悬停反馈**：背景色变化 + 边框高亮

#### 📐 布局模式

- **列表模式** (`listLayout="list"`)：垂直排列，适合详细信息展示
- **网格模式** (`listLayout="grid"`)：网格排列，适合快速浏览

#### 🏷️ 信息展示

- **模板名称**：主要标识，加粗显示
- **模板描述**：辅助说明，灰色小字
- **标签系统**：可选的标签展示
- **预览图片**：可选的模板预览图

### 4. ⌨️ 交互体验

#### 🎯 点击交互

- **即时切换**：点击模板项立即切换并关闭弹窗
- **外部点击关闭**：点击弹窗外部区域关闭
- **防误触**：模态对话框内容区域点击不关闭

#### ⌨️ 键盘导航

- **ESC 键关闭**：按 ESC 键关闭弹窗/对话框
- **可扩展性**：预留键盘导航接口

#### 📱 响应式设计

- **移动端适配**：弹窗宽度自适应，最大 90vw
- **平板端优化**：合适的尺寸和间距
- **桌面端体验**：完整功能和动画效果

## 🔧 技术实现

### Props 配置

```typescript
interface TemplateSelectorProps {
  // 基础配置
  category: string
  value?: string
  deviceType?: string
  availableTemplates?: ExternalTemplate[]

  // UI 模式配置
  mode?: 'modal' | 'popup' | 'dropdown' | 'grid' | 'buttons'

  // 触发器配置
  triggerIcon?: string // 自定义图标类名
  triggerSize?: 'small' | 'medium' | 'large'
  triggerPosition?: 'fixed' | 'absolute' | 'relative'

  // 列表配置
  listLayout?: 'grid' | 'list'
  showPreview?: boolean
  showDeviceInfo?: boolean

  // 交互配置
  disabled?: boolean
  onTemplateChange?: (templateId: string) => void
  onDeviceChange?: (deviceType: string) => void
}
```

### 样式架构

```less
.template-selector {
  // 图标触发器
  &__icon-trigger {
    // 圆形按钮样式
    // 三种尺寸变体
    // 悬停和激活状态
  }

  // 模态对话框
  &__modal-overlay {
    /* 遮罩层 */
  }
  &__modal {
    /* 对话框容器 */
  }
  &__modal-header {
    /* 标题栏 */
  }
  &__modal-body {
    /* 内容区域 */
  }

  // 下拉弹窗
  &__popup {
    /* 弹窗容器 */
  }
  &__popup-header {
    /* 弹窗标题 */
  }
  &__popup-body {
    /* 弹窗内容 */
  }

  // 模板列表
  &__list {
    /* 列表容器 */
  }
  &__item {
    /* 模板项 */
  }
  &__item-content {
    /* 模板内容 */
  }
  &__item-header {
    /* 模板标题行 */
  }

  // 动画效果
  @keyframes fadeIn {
    /* 淡入动画 */
  }
  @keyframes slideIn {
    /* 滑入动画 */
  }
  @keyframes popupSlideIn {
    /* 弹窗滑入 */
  }
}
```

## 🎨 设计亮点

### 1. 🎭 视觉层次

- **主要元素**：图标触发器，醒目但不突兀
- **次要元素**：模板列表，清晰的信息层次
- **辅助元素**：标签、描述，适当的视觉权重

### 2. 🎬 动画效果

- **入场动画**：淡入 + 缩放/滑动，自然流畅
- **悬停反馈**：即时响应，提升交互感
- **状态转换**：平滑过渡，避免突兀变化

### 3. 🎯 用户体验

- **直观操作**：图标按钮一目了然
- **快速选择**：点击即选，无需确认
- **容错设计**：多种关闭方式，防止误操作

### 4. 📱 响应式适配

- **移动优先**：针对触摸操作优化
- **渐进增强**：桌面端提供更丰富的交互
- **设备感知**：根据设备类型调整布局

## 🚀 使用示例

### 基础使用（下拉弹窗模式）

```tsx
<TemplateRenderer
  category="login"
  mode="popup"
  showSelector={true}
  config={{ loginPanel: createLoginPanel() }}
/>
```

### 模态对话框模式

```tsx
<TemplateRenderer
  category="login"
  mode="modal"
  triggerSize="large"
  listLayout="grid"
  showPreview={true}
  config={{ loginPanel: createLoginPanel() }}
/>
```

### 自定义图标

```tsx
<TemplateRenderer
  category="login"
  mode="popup"
  triggerIcon="fas fa-palette"
  triggerSize="medium"
  config={{ loginPanel: createLoginPanel() }}
/>
```

## 🎉 效果展示

访问 **http://localhost:3002/login** 查看实际效果：

1. **左上角模式切换器**：可以实时切换不同的交互模式
2. **右上角图标按钮**：新的模板选择器触发器
3. **流畅的动画效果**：点击体验不同模式的交互
4. **响应式设计**：调整浏览器窗口大小查看适配效果

## 📈 改进对比

| 特性     | 旧版本       | 新版本         |
| -------- | ------------ | -------------- |
| 触发器   | 传统下拉框   | 美观图标按钮   |
| 交互方式 | 单一下拉模式 | 双模式可选     |
| 视觉设计 | 基础样式     | 现代卡片设计   |
| 动画效果 | 无           | 丰富的过渡动画 |
| 响应式   | 基础适配     | 全面响应式设计 |
| 用户体验 | 功能性       | 美观 + 易用性  |

---

**总结**：全新的模板选择器设计大幅提升了用户体验，提供了更加美观、现代化的交互界面，同时保持了功能的完整性和扩展性。

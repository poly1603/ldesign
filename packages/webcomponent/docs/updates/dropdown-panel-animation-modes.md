# Dropdown Panel - Animation Modes Feature

## 概述

为 `l-dropdown-panel` 组件添加了动画模式支持，允许开发者选择不同的动画效果来展示和隐藏面板。

## 新增功能

### `animationMode` 属性

新增 `animationMode` 属性（或 `animation-mode` HTML 属性），支持两种动画模式：

- **`scale`**（默认）：面板从触发器位置展开和收缩
- **`slide`**：面板从遮罩边缘滑入和滑出

## 动画模式详解

### Scale 动画（默认）

**特点：**
- 面板从触发器位置开始展开
- 使用 `scaleY` 变换实现高度缩放效果
- 对于 `bottom` 方向：从触发器位置向下展开（transform-origin: top）
- 对于 `top` 方向：从触发器位置向上展开（transform-origin: bottom）

**视觉效果：**
- 面板看起来像从触发器"生长"出来
- 更加贴近触发器，视觉关联性强
- 适合需要强调触发器和面板关系的场景

**使用场景：**
- 下拉菜单选择
- 商品分类筛选
- 排序选择
- 需要突出触发器与面板关联的任何场景

### Slide 动画

**特点：**
- 面板从触发器位置开始滑动
- 使用 `translateY` 变换实现位移效果
- 对于 `bottom` 方向：从触发器位置向下滑出
- 对于 `top` 方向：从触发器位置向上滑出

**视觉效果：**
- 面板从触发器位置滑出，但不缩放
- 保持完整宽度，平滑移动
- 适合需要流畅平移效果的场景

**使用场景：**
- 筛选面板
- 设置面板
- 内容较多的复杂面板
- 需要更明显动画效果的场景

## 使用示例

### Scale 动画（默认）

```html
<!-- 默认就是 scale 动画，可以省略 animation-mode -->
<l-dropdown-panel>
  <div slot="trigger">
    <button>点击展开</button>
  </div>
  <div>
    <div>选项 1</div>
    <div>选项 2</div>
  </div>
</l-dropdown-panel>

<!-- 显式指定 scale 动画 -->
<l-dropdown-panel animation-mode="scale">
  <div slot="trigger">
    <button>Scale 动画</button>
  </div>
  <div>面板内容</div>
</l-dropdown-panel>
```

### Slide 动画

```html
<l-dropdown-panel animation-mode="slide">
  <div slot="trigger">
    <button>Slide 动画</button>
  </div>
  <div>
    <div>选项 1</div>
    <div>选项 2</div>
  </div>
</l-dropdown-panel>
```

### JavaScript 控制

```javascript
// 获取组件实例
const panel = document.querySelector('l-dropdown-panel');

// 通过属性设置动画模式
panel.animationMode = 'slide';

// 通过 HTML 属性设置
panel.setAttribute('animation-mode', 'scale');
```

### React 使用

```jsx
import { LDropdownPanel } from '@ldesign/webcomponent/react';

function MyComponent() {
  const [mode, setMode] = useState('scale');
  
  return (
    <LDropdownPanel animationMode={mode}>
      <div slot="trigger">
        <button>触发器</button>
      </div>
      <div>面板内容</div>
    </LDropdownPanel>
  );
}
```

### Vue 使用

```vue
<template>
  <l-dropdown-panel :animation-mode="animationMode">
    <div slot="trigger">
      <button>触发器</button>
    </div>
    <div>面板内容</div>
  </l-dropdown-panel>
</template>

<script>
export default {
  data() {
    return {
      animationMode: 'scale'
    };
  }
};
</script>
```

## 技术实现

### CSS 架构

组件使用 BEM 命名约定和嵌套选择器来实现动画模式：

```less
&__panel {
  // 共享的基础样式
  position: absolute;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  // Scale 动画模式：从触发器位置缩放
  &--animation-scale {
    &.l-dropdown-panel__panel--bottom {
      transform: scaleY(0);
      transform-origin: top;  // 从顶部（触发器）开始缩放
      
      &.l-dropdown-panel__panel--visible {
        transform: scaleY(1);
      }
    }
    
    &.l-dropdown-panel__panel--top {
      transform: scaleY(0);
      transform-origin: bottom;  // 从底部（触发器）开始缩放
      
      &.l-dropdown-panel__panel--visible {
        transform: scaleY(1);
      }
    }
  }
  
  // Slide 动画模式：从触发器位置滑动
  &--animation-slide {
    &.l-dropdown-panel__panel--bottom {
      // 初始在触发器上方隐藏，向下滑出
      transform: translateY(-100%);
      
      &.l-dropdown-panel__panel--visible {
        transform: translateY(0);
      }
    }
    
    &.l-dropdown-panel__panel--top {
      // 初始在触发器下方隐藏，向上滑出
      transform: translateY(100%);
      
      &.l-dropdown-panel__panel--visible {
        transform: translateY(0);
      }
    }
  }
}
```

### 组件渲染

在组件的 `render()` 方法中动态应用动画模式类：

```typescript
render() {
  const panelClasses = {
    'l-dropdown-panel__panel': true,
    'l-dropdown-panel__panel--visible': this.visible && this.isReady,
    [`l-dropdown-panel__panel--${this.actualPlacement}`]: true,
    [`l-dropdown-panel__panel--animation-${this.animationMode}`]: true,
  };
  
  return (
    <div class={panelClasses} style={this.getPanelStyle()}>
      <slot />
    </div>
  );
}
```

## 与其他属性的交互

### 与 `placement` 属性

- `animationMode` 与 `placement` 完全兼容
- 无论 `placement` 是 `top`、`bottom` 还是 `auto`，两种动画模式都能正确工作
- 自动判断方向（`placement="auto"`）时，动画会根据实际计算出的方向调整

### 与 `duration` 属性

- 动画持续时间通过 `duration` 属性统一控制
- 两种动画模式都遵循相同的动画时长
- 可以根据需要调整动画速度

### 与 `safeDistance` 属性

- `safeDistance` 属性确保面板与遮罩边缘保持安全距离
- 在 Slide 动画中特别重要，确保面板滑入后不会紧贴边缘

## 性能考虑

### GPU 加速

- 两种动画都使用 CSS `transform` 属性
- `transform` 由 GPU 加速，性能优异
- 避免使用会触发重排的属性（如 `height`、`top`）

### 流畅动画

- 使用 `cubic-bezier(0.4, 0, 0.2, 1)` 缓动函数
- 提供自然流畅的动画曲线
- 符合 Material Design 动画原则

## 浏览器兼容性

- 所有现代浏览器（Chrome, Firefox, Safari, Edge）
- 移动浏览器（iOS Safari, Chrome Mobile）
- 使用标准 CSS transform，无需 vendor 前缀

## 最佳实践

### 选择合适的动画模式

**使用 Scale 动画（默认）当：**
- 面板内容简单，选项不多
- 需要强调触发器和面板的关联
- 希望动画更加内敛、精致

**使用 Slide 动画当：**
- 面板内容复杂，高度较大
- 需要更明显的动画效果
- 希望营造"抽屉"或"面板"的感觉

### 保持一致性

在同一个应用中，建议：
- 对相似功能使用相同的动画模式
- 不要在同一页面频繁切换动画模式
- 根据品牌调性选择合适的动画风格

### 性能优化

```html
<!-- 推荐：使用默认动画时长 -->
<l-dropdown-panel animation-mode="scale">
  ...
</l-dropdown-panel>

<!-- 需要时可以调整 -->
<l-dropdown-panel animation-mode="slide" duration="400">
  ...
</l-dropdown-panel>
```

## 迁移指南

### 从旧版本升级

如果你之前使用的是没有 `animationMode` 属性的版本：

**好消息：**
- 默认动画模式是 `scale`
- 这与之前的动画效果一致
- **无需修改任何现有代码**

**如果想使用 Slide 动画：**
```html
<!-- 旧代码 -->
<l-dropdown-panel>
  ...
</l-dropdown-panel>

<!-- 新代码 -->
<l-dropdown-panel animation-mode="slide">
  ...
</l-dropdown-panel>
```

## 常见问题

### Q: 默认动画是什么？
A: 默认是 `scale` 动画，与之前版本的动画效果一致。

### Q: 可以自定义动画效果吗？
A: 目前只支持 `scale` 和 `slide` 两种模式。如需完全自定义，可以通过 CSS 覆盖组件样式。

### Q: 动画可以完全禁用吗？
A: 可以通过设置 `duration="0"` 来禁用动画。

### Q: 两种动画在性能上有区别吗？
A: 两种动画都使用 GPU 加速的 `transform` 属性，性能相当。

### Q: Slide 动画的滑动距离可以自定义吗？
A: 滑动距离是 100% 面板高度，目前不支持自定义。

## 示例项目

查看完整的演示：
- `packages/webcomponent/src/components/dropdown-panel/demo.html`
- `packages/webcomponent/docs/components/dropdown-panel.md`

## 更新日志

### v1.1.0 (当前版本)
- ✨ 新增 `animationMode` 属性
- ✨ 支持 `scale` 和 `slide` 两种动画模式
- 📝 更新文档和示例
- 🎨 优化 CSS 架构

## 总结

`animationMode` 属性为 `l-dropdown-panel` 组件提供了更灵活的动画选择：

- **Scale 动画**：精致、内敛，强调触发器关联
- **Slide 动画**：明显、流畅，强调内容进场

选择合适的动画模式可以提升用户体验，使界面交互更加生动自然。

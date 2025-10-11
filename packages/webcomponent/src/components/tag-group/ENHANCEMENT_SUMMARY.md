# Tag Group 组件增强总结

## 概述

Tag Group 组件已全面升级，新增拖拽排序和动态添加标签功能，配合精致的动画效果，提供完整的标签管理解决方案。

## 🎯 新增功能

### 1. 拖拽排序 (`draggable`)

**功能特性**:
- ✅ 原生 HTML5 拖拽 API
- ✅ 平滑的拖拽动画和视觉反馈
- ✅ 蓝色指示条显示放置位置
- ✅ 拖拽时标签半透明 + 缩小效果
- ✅ grab/grabbing 光标提示

**使用方式**:
```html
<ldesign-tag-group draggable></ldesign-tag-group>

<script>
const tagGroup = document.querySelector('ldesign-tag-group');
tagGroup.tags = [
  { id: '1', label: '标签 1', color: 'primary', closable: true },
  { id: '2', label: '标签 2', color: 'success', closable: true }
];

// 监听顺序变化
tagGroup.addEventListener('ldesignChange', (e) => {
  console.log('新顺序:', e.detail);
});
</script>
```

**技术实现**:
```typescript
// 拖拽开始
private onDragStart = (e: DragEvent, index: number) => {
  this.draggedIndex = index;
  e.dataTransfer.effectAllowed = 'move';
  // 添加拖拽中样式
};

// 拖拽放置
private onDrop = (e: DragEvent, dropIndex: number) => {
  const newTags = [...this.tags];
  const [draggedTag] = newTags.splice(this.draggedIndex, 1);
  newTags.splice(dropIndex, 0, draggedTag);
  this.tags = newTags;
  this.ldesignChange.emit(newTags);
};
```

### 2. 动态添加标签 (`addable`)

**功能特性**:
- ✅ 点击按钮切换到输入框
- ✅ 输入框自动获得焦点
- ✅ 回车键确认添加
- ✅ ESC键取消
- ✅ 失焦自动确认（有内容时）
- ✅ 弹跳动画效果

**使用方式**:
```html
<ldesign-tag-group 
  addable 
  add-text="+ 添加标签"
  input-placeholder="请输入标签名"
  default-color="primary"
  default-variant="light">
</ldesign-tag-group>

<script>
tagGroup.addEventListener('ldesignAdd', (e) => {
  console.log('新增:', e.detail); // { label: string, id: string }
});
</script>
```

**输入框交互**:
- **Enter**: 确认添加
- **Escape**: 取消输入
- **Blur**: 自动确认（如果有内容）

### 3. 受控模式

**TagData 接口**:
```typescript
interface TagData {
  id: string;           // 唯一标识
  label: string;        // 显示文本
  color?: string;       // 颜色
  variant?: string;     // 样式
  closable?: boolean;   // 是否可关闭
}
```

**完全受控**:
```javascript
const tagGroup = document.querySelector('ldesign-tag-group');

// 设置数据
tagGroup.tags = [...];

// 监听所有变化
tagGroup.addEventListener('ldesignAdd', handleAdd);
tagGroup.addEventListener('ldesignRemove', handleRemove);
tagGroup.addEventListener('ldesignChange', handleChange);
```

## 🎨 样式与动画

### 拖拽动画

```less
// 拖拽中状态
.ldesign-tag-group__item--dragging {
  opacity: 0.5;
  transform: scale(0.95);
  z-index: 1000;
  cursor: grabbing !important;
}

// 拖拽悬停指示器
.ldesign-tag-group__item--drag-over::before {
  content: '';
  position: absolute;
  left: -4px;
  width: 3px;
  background: var(--ldesign-brand-color, #3b82f6);
  animation: drag-indicator .3s ease;
}
```

### 添加动画

```less
// 新增标签弹跳动画
.ldesign-tag-group__item--newly-added {
  animation: tag-slide-in .4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes tag-slide-in {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(-10px);
  }
  60% {
    transform: scale(1.05) translateY(0);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
```

### 输入框动画

```less
// 输入框淡入动画
.ldesign-tag-group__input-wrapper {
  animation: input-fade-in .25s ease;
}

@keyframes input-fade-in {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
```

### 精致输入框

```less
.ldesign-tag-group__input {
  min-width: 100px;
  max-width: 200px;
  height: 28px;
  padding: 4px 12px;
  border: 1px solid var(--ldesign-border-color, #e5e7eb);
  border-radius: var(--ls-border-radius-base, 6px);
  font-weight: 500;
  transition: all .2s ease;
  
  &:focus {
    border-color: var(--ldesign-brand-color, #3b82f6);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
}
```

## 📋 完整 API

### Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| tags | 标签数据数组 | `TagData[]` | `[]` |
| draggable | 启用拖拽排序 | `boolean` | `false` |
| addable | 显示添加按钮 | `boolean` | `false` |
| add-text | 添加按钮文本 | `string` | `'+ 添加标签'` |
| input-placeholder | 输入框占位符 | `string` | `'请输入标签名'` |
| default-color | 新标签默认颜色 | `string` | `'default'` |
| default-variant | 新标签默认样式 | `string` | `'light'` |
| overflow | 溢出策略 | `'scroll' \| 'more'` | `'scroll'` |
| max-visible | more模式最多显示数 | `number` | `5` |
| more-prefix | more模式前缀 | `string` | `'+'` |
| show-arrows | 显示滚动箭头 | `boolean` | `true` |
| scroll-step | 滚动步长 | `number` | `120` |
| disabled | 是否禁用 | `boolean` | `false` |

### Events

| 事件 | 说明 | 参数 |
|------|------|------|
| ldesignAdd | 添加标签时触发 | `{ label: string, id: string }` |
| ldesignRemove | 删除标签时触发 | `{ tag: TagData, index: number }` |
| ldesignChange | 标签变化时触发 | `TagData[]` |

## 🌟 使用场景

### 1. 博客标签管理
```html
<ldesign-tag-group 
  draggable 
  addable 
  default-color="primary"
  default-variant="light">
</ldesign-tag-group>
```

### 2. 技能标签
```html
<ldesign-tag-group 
  addable
  default-color="success"
  default-variant="solid">
</ldesign-tag-group>
```

### 3. 商品分类
```html
<ldesign-tag-group 
  draggable
  overflow="more"
  max-visible="5">
</ldesign-tag-group>
```

### 4. 任务标签
```html
<ldesign-tag-group 
  draggable
  addable
  default-color="warning">
</ldesign-tag-group>
```

## 🔧 技术亮点

### 1. 双模式支持
- **受控模式**: 使用 `tags` 属性管理数据
- **非受控模式**: 使用 `<slot>` 插入静态标签

### 2. 智能焦点管理
```typescript
private showInputBox = () => {
  this.showInput = true;
  setTimeout(() => {
    this.inputRef?.focus();
  }, 100);
};
```

### 3. 延迟处理避免冲突
```typescript
private handleInputBlur = () => {
  setTimeout(() => {
    if (this.inputValue.trim()) {
      this.addTag();
    } else {
      this.hideInputBox();
    }
  }, 200);
};
```

### 4. 唯一ID生成
```typescript
const newTag: TagData = {
  id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  label,
  // ...
};
```

### 5. 动画状态管理
```typescript
this.newlyAddedId = newTag.id;
setTimeout(() => {
  this.newlyAddedId = '';
}, 600);
```

## 📱 响应式设计

```less
@media (max-width: 768px) {
  .ldesign-tag-group__input {
    min-width: 80px;
    max-width: 150px;
  }
}
```

## ♿️ 无障碍支持

```less
@media (prefers-reduced-motion: reduce) {
  .ldesign-tag-group__item,
  .ldesign-tag-group__input {
    transition: none;
  }
  
  .ldesign-tag-group__item--newly-added {
    animation: none;
  }
}
```

## 📊 性能优化

1. **虚拟化滚动**: scroll 模式下使用原生滚动
2. **按需渲染**: more 模式只渲染可见标签
3. **事件委托**: 使用事件监听器而非内联处理
4. **CSS 动画**: 使用 GPU 加速的 transform 动画
5. **防抖处理**: 输入框失焦延迟处理

## 🎯 未来计划

- [ ] 键盘拖拽支持（方向键 + 空格）
- [ ] 批量操作（全选、删除）
- [ ] 标签模板（预设样式快速切换）
- [ ] 拖拽到其他标签组
- [ ] 标签分组功能
- [ ] 标签搜索过滤
- [ ] 标签数量限制
- [ ] 自定义验证规则

## 📝 文档

- ✅ 完整的 VitePress 文档
- ✅ 8+ 个使用示例
- ✅ React 集成示例
- ✅ 完整的 API 文档
- ✅ 交互式演示

## 🎉 总结

Tag Group 组件现在是一个功能完整的标签管理解决方案：

- 🎨 **精致动画**: 流畅的拖拽和添加动画
- 🎯 **直观交互**: 清晰的视觉反馈和状态提示
- 🔧 **灵活配置**: 丰富的属性和事件
- 📱 **响应式**: 适配各种屏幕尺寸
- ♿️ **可访问**: 支持reduced-motion
- 🚀 **高性能**: 优化的渲染和动画

完美支持博客、电商、任务管理等多种场景的标签需求！

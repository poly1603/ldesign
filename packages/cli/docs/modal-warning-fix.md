# Modal 组件 Vue 警告修复

## 问题描述

在使用 Modal 组件时，控制台出现 Vue 警告：

```
Vue 警告: Extraneous non-props attributes (class) were passed to component 
but could not be automatically inherited because component renders fragment 
or text or teleport root nodes.
```

## 问题原因

Modal 组件使用 `<Teleport>` 作为根节点：

```vue
<template>
  <Teleport to="body">
    <!-- 弹窗内容 -->
  </Teleport>
</template>
```

Vue 无法自动将传递给 Modal 的 `class` 属性继承到实际的 DOM 元素上，因为：
1. `<Teleport>` 不是真实的 DOM 元素
2. Vue 不知道应该将 class 应用到哪个子元素上

## 解决方案

### 1. 禁用自动继承 attrs

在 Modal 组件中添加 `inheritAttrs: false`：

```typescript
// 禁用自动继承 attrs，因为使用了 Teleport
defineOptions({
  inheritAttrs: false
})
```

### 2. 手动应用 class 到目标元素

在 modal-container 元素上手动绑定 `$attrs.class`：

```vue
<div 
  v-if="visible" 
  class="modal-container" 
  :class="$attrs.class"  <!-- 手动绑定 class -->
  :style="{ width: width + 'px' }" 
  @click.stop
>
```

### 3. 支持标题 slot

为了更灵活地自定义标题（如添加图标），添加了 title slot：

```vue
<div class="modal-title">
  <slot name="title">
    <component v-if="icon" :is="icon" class="modal-icon" />
    <span>{{ title }}</span>
  </slot>
</div>
```

## 使用方式

### 基础使用（默认标题）

```vue
<Modal v-model:visible="visible" title="弹窗标题">
  <!-- 内容 -->
</Modal>
```

### 自定义标题（带图标）

```vue
<Modal v-model:visible="visible" class="custom-modal">
  <template #title>
    <div class="custom-title">
      <Plus :size="20" />
      <span>添加依赖包</span>
    </div>
  </template>
  <!-- 内容 -->
</Modal>
```

### 自定义样式

现在可以通过 class 传递自定义样式：

```vue
<Modal v-model:visible="visible" class="health-detail-modal">
  <!-- 内容 -->
</Modal>
```

```less
.health-detail-modal {
  :deep(.modal-content) {
    min-width: 700px;
    max-width: 900px;
  }
}
```

## 文件变更

### Modal.vue

**修改 1: 添加 inheritAttrs 配置**
```typescript
defineOptions({
  inheritAttrs: false
})
```

**修改 2: 手动绑定 class**
```vue
<div class="modal-container" :class="$attrs.class" ...>
```

**修改 3: 支持 title slot**
```vue
<div class="modal-title">
  <slot name="title">
    <!-- 默认标题 -->
  </slot>
</div>
```

## 注意事项

1. **inheritAttrs: false** 只影响 class、style 等非 props 属性的自动继承
2. **$attrs.class** 可以获取传递给组件的 class，并手动应用到指定元素
3. **Teleport 组件** 的 attrs 需要手动处理，因为它们不会自动传递到传送的内容中
4. **title slot** 优先级高于 title prop

## 相关问题

这个问题常见于以下场景：
- 使用 `<Teleport>` 的组件
- 根节点是 `<template>` 的组件（fragment）
- 根节点是文本节点的组件

## 最佳实践

对于使用 Teleport 的组件：

1. ✅ 明确设置 `inheritAttrs: false`
2. ✅ 手动将需要的 attrs 绑定到目标元素
3. ✅ 提供清晰的 API 文档说明如何自定义样式
4. ✅ 使用 slot 提供灵活的自定义能力

## 测试

修复后，以下使用方式不会再产生警告：

```vue
<Modal class="add-dependency-modal" ...>
<Modal class="health-detail-modal" ...>
<Modal class="version-dialog-modal" ...>
```

## 参考资料

- [Vue 3 - inheritAttrs](https://vuejs.org/api/options-misc.html#inheritattrs)
- [Vue 3 - Teleport](https://vuejs.org/guide/built-ins/teleport.html)
- [Vue 3 - $attrs](https://vuejs.org/api/component-instance.html#attrs)

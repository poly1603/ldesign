# Icon 图标

语义化的矢量图形，支持多种样式和尺寸。

## 基础用法

使用 `name` 属性指定图标名称。

<div class="demo-icon">
  <l-icon name="user" />
  <l-icon name="star" />
  <l-icon name="heart" />
  <l-icon name="settings" />
  <l-icon name="home" />
  <l-icon name="search" />
</div>

```vue
<template>
  <div>
    <l-icon name="user" />
    <l-icon name="star" />
    <l-icon name="heart" />
    <l-icon name="settings" />
    <l-icon name="home" />
    <l-icon name="search" />
  </div>
</template>
```

## 图标尺寸

通过 `size` 属性设置图标尺寸。

<div class="demo-icon">
  <l-icon name="star" size="small" />
  <l-icon name="star" size="medium" />
  <l-icon name="star" size="large" />
  <l-icon name="star" :size="32" />
</div>

```vue
<template>
  <div>
    <l-icon name="star" size="small" />
    <l-icon name="star" size="medium" />
    <l-icon name="star" size="large" />
    <l-icon name="star" :size="32" />
  </div>
</template>
```

## 图标颜色

通过 `color` 属性或CSS设置图标颜色。

<div class="demo-icon">
  <l-icon name="heart" color="#ff4d4f" />
  <l-icon name="star" color="#faad14" />
  <l-icon name="check" color="#52c41a" />
  <l-icon name="info" color="#1890ff" />
</div>

```vue
<template>
  <div>
    <l-icon name="heart" color="#ff4d4f" />
    <l-icon name="star" color="#faad14" />
    <l-icon name="check" color="#52c41a" />
    <l-icon name="info" color="#1890ff" />
  </div>
</template>
```

## 可点击图标

通过监听 `click` 事件使图标可点击。

<div class="demo-icon">
  <l-icon name="close" @click="handleClick" style="cursor: pointer;" />
  <l-icon name="edit" @click="handleClick" style="cursor: pointer;" />
  <l-icon name="delete" @click="handleClick" style="cursor: pointer;" />
</div>

```vue
<template>
  <div>
    <l-icon name="close" @click="handleClick" />
    <l-icon name="edit" @click="handleClick" />
    <l-icon name="delete" @click="handleClick" />
  </div>
</template>

<script setup>
const handleClick = () => {
  console.log('图标被点击了')
}
</script>
```

## 内置图标

组件内置了常用的图标：

### 用户界面
<div class="demo-icon-grid">
  <div class="icon-item">
    <l-icon name="user" />
    <span>user</span>
  </div>
  <div class="icon-item">
    <l-icon name="home" />
    <span>home</span>
  </div>
  <div class="icon-item">
    <l-icon name="search" />
    <span>search</span>
  </div>
  <div class="icon-item">
    <l-icon name="settings" />
    <span>settings</span>
  </div>
</div>

### 操作图标
<div class="demo-icon-grid">
  <div class="icon-item">
    <l-icon name="close" />
    <span>close</span>
  </div>
  <div class="icon-item">
    <l-icon name="check" />
    <span>check</span>
  </div>
  <div class="icon-item">
    <l-icon name="plus" />
    <span>plus</span>
  </div>
  <div class="icon-item">
    <l-icon name="minus" />
    <span>minus</span>
  </div>
  <div class="icon-item">
    <l-icon name="edit" />
    <span>edit</span>
  </div>
  <div class="icon-item">
    <l-icon name="delete" />
    <span>delete</span>
  </div>
</div>

### 箭头图标
<div class="demo-icon-grid">
  <div class="icon-item">
    <l-icon name="arrow-left" />
    <span>arrow-left</span>
  </div>
  <div class="icon-item">
    <l-icon name="arrow-right" />
    <span>arrow-right</span>
  </div>
  <div class="icon-item">
    <l-icon name="arrow-up" />
    <span>arrow-up</span>
  </div>
  <div class="icon-item">
    <l-icon name="arrow-down" />
    <span>arrow-down</span>
  </div>
</div>

### 状态图标
<div class="demo-icon-grid">
  <div class="icon-item">
    <l-icon name="info" />
    <span>info</span>
  </div>
  <div class="icon-item">
    <l-icon name="warning" />
    <span>warning</span>
  </div>
  <div class="icon-item">
    <l-icon name="error" />
    <span>error</span>
  </div>
  <div class="icon-item">
    <l-icon name="success" />
    <span>success</span>
  </div>
</div>

### 其他图标
<div class="demo-icon-grid">
  <div class="icon-item">
    <l-icon name="star" />
    <span>star</span>
  </div>
  <div class="icon-item">
    <l-icon name="heart" />
    <span>heart</span>
  </div>
</div>

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| name | 图标名称 | `string` | `'info'` |
| size | 图标尺寸 | `'small' \| 'medium' \| 'large' \| number` | `'medium'` |
| color | 图标颜色 | `string` | `undefined` |

### Events

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| click | 点击图标时触发 | `event: MouseEvent` |

<script setup>
const handleClick = () => {
  console.log('图标被点击了')
}
</script>

<style scoped>
.demo-icon {
  display: flex;
  gap: 16px;
  align-items: center;
  margin: 16px 0;
}

.demo-icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin: 16px 0;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  transition: all 0.2s;
}

.icon-item:hover {
  border-color: var(--vp-c-brand);
  background-color: var(--vp-c-bg-soft);
}

.icon-item span {
  font-size: 12px;
  color: var(--vp-c-text-2);
  text-align: center;
}
</style>

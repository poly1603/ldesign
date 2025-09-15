# Badge 徽标

图标右上角的圆形徽标数字。

## 基础用法

展示新消息数量。

<div style="display: flex; gap: 24px; align-items: center;">
  <l-badge :value="12">
    <l-button>评论</l-button>
  </l-badge>

  <l-badge :value="3">
    <l-button>回复</l-button>
  </l-badge>

  <l-badge :value="1" type="primary">
    <l-button>消息</l-button>
  </l-badge>
</div>

```vue
<template>
  <div style="display: flex; gap: 24px; align-items: center;">
    <l-badge :value="12">
      <l-button>评论</l-button>
    </l-badge>

    <l-badge :value="3">
      <l-button>回复</l-button>
    </l-badge>

    <l-badge :value="1" type="primary">
      <l-button>消息</l-button>
    </l-badge>
  </div>
</template>
```

## 最大值

可自定义最大值。

<div style="display: flex; gap: 24px; align-items: center;">
  <l-badge :value="200" :max="99">
    <l-button>评论</l-button>
  </l-badge>

  <l-badge :value="1000" :max="999">
    <l-button>点赞</l-button>
  </l-badge>
</div>

```vue
<template>
  <div style="display: flex; gap: 24px; align-items: center;">
    <l-badge :value="200" :max="99">
      <l-button>评论</l-button>
    </l-badge>

    <l-badge :value="1000" :max="999">
      <l-button>点赞</l-button>
    </l-badge>
  </div>
</template>
```

## 小红点

以红点的形式标注需要关注的内容。

```vue
<template>
  <div style="display: flex; gap: 24px; align-items: center;">
    <l-badge dot>
      <l-button>数据查询</l-button>
    </l-badge>
    
    <l-badge dot>
      <l-icon name="bell" />
    </l-badge>
  </div>
</template>
```

## 独立使用

不包裹任何元素即为独立使用，适合用在标题旁边等场景。

```vue
<template>
  <div style="display: flex; gap: 16px; align-items: center;">
    <span>评论</span>
    <l-badge :value="12" />
    
    <span>回复</span>
    <l-badge :value="3" type="primary" />
    
    <span>消息</span>
    <l-badge dot type="warning" />
  </div>
</template>
```

## 不同类型

用不同的颜色表示不同的状态。

```vue
<template>
  <div style="display: flex; gap: 24px; align-items: center;">
    <l-badge :value="5" type="primary">
      <l-button>Primary</l-button>
    </l-badge>
    
    <l-badge :value="5" type="success">
      <l-button>Success</l-button>
    </l-badge>
    
    <l-badge :value="5" type="warning">
      <l-button>Warning</l-button>
    </l-badge>
    
    <l-badge :value="5" type="error">
      <l-button>Error</l-button>
    </l-badge>
    
    <l-badge :value="5" type="info">
      <l-button>Info</l-button>
    </l-badge>
  </div>
</template>
```

## 不同尺寸

```vue
<template>
  <div style="display: flex; gap: 24px; align-items: center;">
    <l-badge :value="5" size="small">
      <l-button size="small">Small</l-button>
    </l-badge>
    
    <l-badge :value="5" size="medium">
      <l-button size="medium">Medium</l-button>
    </l-badge>
    
    <l-badge :value="5" size="large">
      <l-button size="large">Large</l-button>
    </l-badge>
  </div>
</template>
```

## 自定义内容

可以显示数字以外的文本内容。

```vue
<template>
  <div style="display: flex; gap: 24px; align-items: center;">
    <l-badge value="new">
      <l-button>最新</l-button>
    </l-badge>
    
    <l-badge value="hot">
      <l-button>热门</l-button>
    </l-badge>
    
    <l-badge>
      <template #count>
        <l-icon name="star" style="color: #f5a623;" />
      </template>
      <l-button>收藏</l-button>
    </l-badge>
  </div>
</template>
```

## 动态

展示动态变化的效果。

```vue
<template>
  <div style="display: flex; gap: 24px; align-items: center;">
    <l-badge :value="count" :show-zero="false">
      <l-button>评论</l-button>
    </l-badge>
    
    <div style="margin-left: 20px;">
      <l-button @click="count++">+</l-button>
      <l-button @click="count = Math.max(0, count - 1)">-</l-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(5)
</script>
```

## 偏移量

设置状态点的位置偏移。

```vue
<template>
  <div style="display: flex; gap: 24px; align-items: center;">
    <l-badge :value="5" :offset="[10, 10]">
      <l-button>偏移</l-button>
    </l-badge>
    
    <l-badge dot :offset="[-5, 5]">
      <l-button>偏移</l-button>
    </l-badge>
  </div>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 显示值 | `string \| number` | `undefined` |
| max | 最大值，超过最大值会显示 '{max}+' | `number` | `99` |
| showZero | 当数值为 0 时，是否展示 Badge | `boolean` | `false` |
| dot | 是否显示小红点 | `boolean` | `false` |
| type | 类型 | `'primary' \| 'success' \| 'warning' \| 'error' \| 'info'` | `'error'` |
| size | 尺寸 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| hidden | 是否隐藏 | `boolean` | `false` |
| offset | 设置状态点的位置偏移 | `[number, number]` | `undefined` |

### Slots

| 名称 | 说明 | 参数 |
| --- | --- | --- |
| default | 自定义默认内容 | — |
| count | 自定义徽标内容 | `{ count: string \| number }` |

## 主题定制

Badge 组件使用以下 CSS 变量：

```css
.ld-badge {
  --ldesign-brand-color: #722ed1;
  --ldesign-success-color: #52c41a;
  --ldesign-warning-color: #faad14;
  --ldesign-error-color: #ff4d4f;
  --ldesign-text-color-secondary: #666666;
  --ldesign-font-size-xs: 12px;
  --ldesign-font-weight-medium: 500;
  --ldesign-z-index-affix: 10;
}
```

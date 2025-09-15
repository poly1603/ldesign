# Card 卡片

通用卡片容器，提供标题、内容、底部等区域，支持阴影、边框等样式。

## 基础用法

最简单的卡片容器。

<l-card>
  <p>卡片内容</p>
</l-card>

```vue
<template>
  <l-card>
    <p>卡片内容</p>
  </l-card>
</template>
```

## 带标题的卡片

通过 `title` 属性设置卡片标题。

<l-card title="卡片标题">
  <p>卡片内容</p>
</l-card>

```vue
<template>
  <l-card title="卡片标题">
    <p>卡片内容</p>
  </l-card>
</template>
```

## 带额外操作的卡片

通过 `extra` 属性或 `header` 插槽添加额外操作。

<l-card title="卡片标题" extra="更多">
  <p>卡片内容</p>
</l-card>

```vue
<template>
  <l-card title="卡片标题" extra="更多">
    <p>卡片内容</p>
  </l-card>
</template>
```

## 自定义头部

使用 `header` 插槽自定义头部内容。

```vue
<template>
  <l-card>
    <template #header>
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span>自定义标题</span>
        <l-button type="primary" size="small">操作</l-button>
      </div>
    </template>
    <p>卡片内容</p>
  </l-card>
</template>
```

## 带底部的卡片

使用 `footer` 插槽添加底部内容。

```vue
<template>
  <l-card title="卡片标题">
    <p>卡片内容</p>
    <template #footer>
      <div style="text-align: right;">
        <l-button>取消</l-button>
        <l-button type="primary" style="margin-left: 8px;">确定</l-button>
      </div>
    </template>
  </l-card>
</template>
```

## 无边框卡片

通过 `bordered` 属性控制是否显示边框。

```vue
<template>
  <l-card title="无边框卡片" :bordered="false">
    <p>卡片内容</p>
  </l-card>
</template>
```

## 阴影效果

通过 `shadow` 属性控制阴影显示时机。

```vue
<template>
  <div style="display: flex; gap: 16px;">
    <l-card title="总是显示" shadow="always">
      <p>总是显示阴影</p>
    </l-card>
    
    <l-card title="悬停显示" shadow="hover">
      <p>悬停时显示阴影</p>
    </l-card>
    
    <l-card title="从不显示" shadow="never">
      <p>从不显示阴影</p>
    </l-card>
  </div>
</template>
```

## 可悬停卡片

通过 `hoverable` 属性使卡片可悬停。

```vue
<template>
  <l-card title="可悬停卡片" hoverable>
    <p>鼠标悬停时会有交互效果</p>
  </l-card>
</template>
```

## 不同尺寸

通过 `size` 属性设置卡片大小。

```vue
<template>
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <l-card title="小尺寸" size="small">
      <p>小尺寸卡片</p>
    </l-card>
    
    <l-card title="中等尺寸" size="medium">
      <p>中等尺寸卡片</p>
    </l-card>
    
    <l-card title="大尺寸" size="large">
      <p>大尺寸卡片</p>
    </l-card>
  </div>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| title | 卡片标题 | `string` | `undefined` |
| extra | 卡片右上角的操作区域 | `string` | `undefined` |
| size | 卡片大小 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| bordered | 是否显示边框 | `boolean` | `true` |
| shadow | 阴影显示时机 | `'always' \| 'hover' \| 'never'` | `'always'` |
| hoverable | 是否可悬停 | `boolean` | `false` |

### Slots

| 名称 | 说明 |
| --- | --- |
| default | 卡片内容 |
| header | 卡片头部 |
| footer | 卡片底部 |

## 主题定制

Card 组件使用以下 CSS 变量：

```css
.ld-card {
  --ldesign-bg-color-component: #ffffff;
  --ldesign-bg-color-container: #fafafa;
  --ldesign-border-level-1-color: #e5e5e5;
  --ldesign-border-radius-base: 4px;
  --ldesign-shadow-base: 0 1px 3px rgba(0, 0, 0, 0.1);
  --ldesign-shadow-lg: 0 4px 6px rgba(0, 0, 0, 0.07);
  --ldesign-spacing-xs: 4px;
  --ldesign-spacing-sm: 8px;
  --ldesign-spacing-base: 16px;
  --ldesign-spacing-lg: 24px;
}
```

## 无障碍访问

- 卡片使用语义化的 HTML 结构
- 支持键盘导航（当 `hoverable` 为 `true` 时）
- 提供适当的 ARIA 属性

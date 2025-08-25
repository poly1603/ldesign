# Card 卡片

卡片容器，可以包含标题、内容、操作区域等。

## 基础用法

基础的卡片用法。

```html
<ldesign-card title="卡片标题">
  这是卡片内容
</ldesign-card>
```

## 卡片尺寸

卡片有大、中、小三种尺寸。

```html
<ldesign-card size="large" title="大尺寸卡片">
  大尺寸卡片内容
</ldesign-card>

<ldesign-card size="medium" title="中尺寸卡片">
  中尺寸卡片内容
</ldesign-card>

<ldesign-card size="small" title="小尺寸卡片">
  小尺寸卡片内容
</ldesign-card>
```

## 带副标题

通过 `subtitle` 属性可以添加副标题。

```html
<ldesign-card title="卡片标题" subtitle="卡片副标题">
  这是卡片内容
</ldesign-card>
```

## 无边框

添加 `bordered="false"` 属性可以移除边框。

```html
<ldesign-card title="无边框卡片" bordered="false">
  这是无边框卡片内容
</ldesign-card>
```

## 可悬停

添加 `hoverable` 属性可以让卡片在悬停时有阴影效果。

```html
<ldesign-card title="可悬停卡片" hoverable>
  这是可悬停卡片内容
</ldesign-card>
```

## 带封面

通过 `cover` 属性可以添加封面图片。

```html
<ldesign-card 
  title="带封面卡片" 
  cover="https://via.placeholder.com/300x200"
>
  这是带封面卡片内容
</ldesign-card>
```

## 带操作区域

通过 `actions` 插槽可以添加操作区域。

```html
<ldesign-card title="带操作区域卡片">
  这是卡片内容
  <template #actions>
    <ldesign-button type="text">操作1</ldesign-button>
    <ldesign-button type="text">操作2</ldesign-button>
    <ldesign-button type="text">操作3</ldesign-button>
  </template>
</ldesign-card>
```

## 加载状态

添加 `loading` 属性可以显示加载状态。

```html
<ldesign-card title="加载中卡片" loading>
  这是卡片内容
</ldesign-card>
```

## 点击事件

卡片支持点击事件。

```html
<ldesign-card 
  title="可点击卡片" 
  hoverable 
  onclick="console.log('卡片被点击')"
>
  点击我
</ldesign-card>
```

## 组合使用

卡片可以与其他组件组合使用。

```html
<ldesign-card title="表单卡片">
  <ldesign-input placeholder="请输入用户名"></ldesign-input>
  <ldesign-input type="password" placeholder="请输入密码" style="margin-top: 16px;"></ldesign-input>
  <template #actions>
    <ldesign-button type="primary">登录</ldesign-button>
    <ldesign-button>取消</ldesign-button>
  </template>
</ldesign-card>
```

## API

### 属性

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| title | 卡片标题 | `string` | `''` |
| subtitle | 卡片副标题 | `string` | `''` |
| size | 卡片尺寸 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| bordered | 是否有边框 | `boolean` | `true` |
| hoverable | 是否可悬停 | `boolean` | `false` |
| loading | 是否加载中 | `boolean` | `false` |
| cover | 封面图片地址 | `string` | `''` |
| actions | 操作区域 | `string` | `''` |

### 事件

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| click | 点击事件 | `MouseEvent` |

### 插槽

| 插槽名 | 说明 |
| --- | --- |
| default | 卡片内容 |
| actions | 操作区域 |

## 设计原则

- **信息层次**：使用标题、副标题、内容来建立清晰的信息层次
- **视觉分离**：使用边框、阴影、间距来分离不同的内容区域
- **交互反馈**：提供悬停、点击等交互反馈
- **内容组织**：合理组织卡片内容，避免信息过载
- **一致性**：保持与其他组件的视觉一致性







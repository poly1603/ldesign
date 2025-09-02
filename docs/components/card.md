# Card 卡片

通用卡片容器，提供标准的卡片样式和布局。

## 基础用法

包含标题、内容和操作区域的基础卡片。

<div class="demo-block">
  <ld-card title="卡片标题">
    <p>卡片内容</p>
    <p>这里是卡片的主要内容区域，可以放置任何内容。</p>
  </ld-card>
</div>

```html
<ld-card title="卡片标题">
  <p>卡片内容</p>
  <p>这里是卡片的主要内容区域，可以放置任何内容。</p>
</ld-card>
```

## 简洁卡片

只有内容区域的简洁卡片。

<div class="demo-block">
  <ld-card>
    <p>这是一个简洁的卡片</p>
    <p>没有标题和底部操作区域</p>
  </ld-card>
</div>

```html
<ld-card>
  <p>这是一个简洁的卡片</p>
  <p>没有标题和底部操作区域</p>
</ld-card>
```

## 带操作区域

卡片可以包含底部操作区域。

<div class="demo-block">
  <ld-card title="用户信息">
    <p>姓名：张三</p>
    <p>邮箱：zhangsan@example.com</p>
    <p>电话：138-0000-0000</p>
    <div slot="footer">
      <ld-button type="text">编辑</ld-button>
      <ld-button type="primary">保存</ld-button>
    </div>
  </ld-card>
</div>

```html
<ld-card title="用户信息">
  <p>姓名：张三</p>
  <p>邮箱：zhangsan@example.com</p>
  <p>电话：138-0000-0000</p>
  <div slot="footer">
    <ld-button type="text">编辑</ld-button>
    <ld-button type="primary">保存</ld-button>
  </div>
</ld-card>
```

## 带封面图片

卡片可以包含封面图片。

<div class="demo-block">
  <ld-card title="风景图片" cover="https://picsum.photos/300/200">
    <p>这是一张美丽的风景图片</p>
    <p>图片展示了大自然的美丽景色</p>
    <div slot="footer">
      <ld-button type="text">收藏</ld-button>
      <ld-button type="text">分享</ld-button>
      <ld-button type="primary">下载</ld-button>
    </div>
  </ld-card>
</div>

```html
<ld-card title="风景图片" cover="https://picsum.photos/300/200">
  <p>这是一张美丽的风景图片</p>
  <p>图片展示了大自然的美丽景色</p>
  <div slot="footer">
    <ld-button type="text">收藏</ld-button>
    <ld-button type="text">分享</ld-button>
    <ld-button type="primary">下载</ld-button>
  </div>
</ld-card>
```

## 阴影效果

使用 `shadow` 属性控制卡片阴影。

<div class="demo-block">
  <ld-card title="无阴影" shadow="never">
    <p>这个卡片没有阴影效果</p>
  </ld-card>
  
  <ld-card title="悬停阴影" shadow="hover">
    <p>鼠标悬停时显示阴影</p>
  </ld-card>
  
  <ld-card title="始终阴影" shadow="always">
    <p>始终显示阴影效果</p>
  </ld-card>
</div>

```html
<ld-card title="无阴影" shadow="never">
  <p>这个卡片没有阴影效果</p>
</ld-card>

<ld-card title="悬停阴影" shadow="hover">
  <p>鼠标悬停时显示阴影</p>
</ld-card>

<ld-card title="始终阴影" shadow="always">
  <p>始终显示阴影效果</p>
</ld-card>
```

## 边框样式

使用 `bordered` 属性控制边框显示。

<div class="demo-block">
  <ld-card title="有边框" bordered>
    <p>这个卡片有边框</p>
  </ld-card>
  
  <ld-card title="无边框" :bordered="false">
    <p>这个卡片没有边框</p>
  </ld-card>
</div>

```html
<ld-card title="有边框" bordered>
  <p>这个卡片有边框</p>
</ld-card>

<ld-card title="无边框" :bordered="false">
  <p>这个卡片没有边框</p>
</ld-card>
```

## 加载状态

使用 `loading` 属性显示加载状态。

<div class="demo-block">
  <ld-card title="加载中" loading>
    <p>这里是卡片内容</p>
    <p>正在加载数据...</p>
  </ld-card>
</div>

```html
<ld-card title="加载中" loading>
  <p>这里是卡片内容</p>
  <p>正在加载数据...</p>
</ld-card>
```

## 可点击卡片

使用 `hoverable` 属性使卡片可点击。

<div class="demo-block">
  <ld-card title="可点击卡片" hoverable @click="handleCardClick">
    <p>点击这个卡片试试</p>
    <p>鼠标悬停时会有交互效果</p>
  </ld-card>
</div>

```html
<ld-card title="可点击卡片" hoverable @click="handleCardClick">
  <p>点击这个卡片试试</p>
  <p>鼠标悬停时会有交互效果</p>
</ld-card>
```

## 自定义头部

使用 `header` 插槽自定义头部内容。

<div class="demo-block">
  <ld-card>
    <div slot="header" style="display: flex; justify-content: space-between; align-items: center;">
      <span style="font-weight: bold;">自定义头部</span>
      <ld-button type="text" icon="more">更多</ld-button>
    </div>
    <p>这个卡片使用了自定义头部</p>
    <p>头部包含标题和操作按钮</p>
  </ld-card>
</div>

```html
<ld-card>
  <div slot="header" style="display: flex; justify-content: space-between; align-items: center;">
    <span style="font-weight: bold;">自定义头部</span>
    <ld-button type="text" icon="more">更多</ld-button>
  </div>
  <p>这个卡片使用了自定义头部</p>
  <p>头部包含标题和操作按钮</p>
</ld-card>
```

## API

### Card Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| title | 卡片标题 | `string` | - |
| cover | 封面图片地址 | `string` | - |
| shadow | 阴影显示时机 | `'always' \| 'hover' \| 'never'` | `'hover'` |
| bordered | 是否显示边框 | `boolean` | `true` |
| loading | 是否加载中 | `boolean` | `false` |
| hoverable | 是否可悬停 | `boolean` | `false` |
| body-style | 内容区域样式 | `object` | - |
| header-style | 头部区域样式 | `object` | - |
| footer-style | 底部区域样式 | `object` | - |

### Card Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击卡片时触发 | `(event: MouseEvent) => void` |
| mouseenter | 鼠标进入时触发 | `(event: MouseEvent) => void` |
| mouseleave | 鼠标离开时触发 | `(event: MouseEvent) => void` |

### Card Slots

| 插槽名 | 说明 |
|--------|------|
| default | 卡片内容 |
| header | 自定义头部内容 |
| footer | 自定义底部内容 |
| cover | 自定义封面内容 |

## 主题定制

### CSS 变量

```css
:root {
  /* 卡片基础样式 */
  --ld-card-border-radius: 8px;
  --ld-card-border-width: 1px;
  --ld-card-border-style: solid;
  
  /* 卡片颜色 */
  --ld-card-bg: #fff;
  --ld-card-border-color: #f0f0f0;
  --ld-card-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09);
  --ld-card-shadow-hover: 0 2px 8px -2px rgba(0, 0, 0, 0.16), 0 6px 16px 0 rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
  
  /* 头部样式 */
  --ld-card-header-padding: 16px 24px;
  --ld-card-header-border-bottom: 1px solid #f0f0f0;
  --ld-card-header-font-size: 16px;
  --ld-card-header-font-weight: 500;
  --ld-card-header-color: rgba(0, 0, 0, 0.85);
  
  /* 内容样式 */
  --ld-card-body-padding: 24px;
  --ld-card-body-font-size: 14px;
  --ld-card-body-color: rgba(0, 0, 0, 0.65);
  
  /* 底部样式 */
  --ld-card-footer-padding: 16px 24px;
  --ld-card-footer-border-top: 1px solid #f0f0f0;
  --ld-card-footer-bg: #fafafa;
}
```

### 自定义样式

```css
/* 自定义卡片样式 */
.my-card {
  --ld-card-bg: #f9f9f9;
  --ld-card-border-color: #e0e0e0;
  --ld-card-border-radius: 12px;
}

/* 自定义头部样式 */
.my-card-header {
  --ld-card-header-bg: #1976d2;
  --ld-card-header-color: #fff;
}
```

# ld-card



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute        | Description | Type                             | Default     |
| --------------- | ---------------- | ----------- | -------------------------------- | ----------- |
| `bodyPadding`   | `body-padding`   | 内容区域内边距     | `string`                         | `undefined` |
| `border`        | `border`         | 边框样式        | `"dashed" \| "none" \| "solid"`  | `'solid'`   |
| `cardTitle`     | `card-title`     | 卡片标题        | `string`                         | `undefined` |
| `clickable`     | `clickable`      | 是否可点击       | `boolean`                        | `false`     |
| `cover`         | `cover`          | 封面图片 URL    | `string`                         | `undefined` |
| `coverAlt`      | `cover-alt`      | 封面图片替代文本    | `string`                         | `undefined` |
| `coverHeight`   | `cover-height`   | 封面图片高度      | `string`                         | `'200px'`   |
| `customClass`   | `custom-class`   | 自定义 CSS 类名  | `string`                         | `undefined` |
| `customStyle`   | `custom-style`   | 自定义内联样式     | `{ [key: string]: string; }`     | `undefined` |
| `description`   | `description`    | 卡片描述        | `string`                         | `undefined` |
| `footerDivider` | `footer-divider` | 是否显示底部分割线   | `boolean`                        | `false`     |
| `footerPadding` | `footer-padding` | 底部内边距       | `string`                         | `undefined` |
| `headerDivider` | `header-divider` | 是否显示头部分割线   | `boolean`                        | `true`      |
| `headerExtra`   | `header-extra`   | 头部额外内容      | `string`                         | `undefined` |
| `headerIcon`    | `header-icon`    | 头部图标        | `string`                         | `undefined` |
| `headerPadding` | `header-padding` | 头部内边距       | `string`                         | `undefined` |
| `hoverable`     | `hoverable`      | 是否可悬停       | `boolean`                        | `false`     |
| `loading`       | `loading`        | 是否加载中       | `boolean`                        | `false`     |
| `shadow`        | `shadow`         | 阴影显示时机      | `"always" \| "hover" \| "never"` | `'always'`  |
| `size`          | `size`           | 卡片尺寸        | `"large" \| "medium" \| "small"` | `'medium'`  |
| `subtitle`      | `subtitle`       | 卡片副标题       | `string`                         | `undefined` |


## Events

| Event           | Description | Type                                |
| --------------- | ----------- | ----------------------------------- |
| `ldClick`       | 点击事件        | `CustomEvent<CardClickEventDetail>` |
| `ldCoverClick`  | 封面点击事件      | `CustomEvent<CardClickEventDetail>` |
| `ldHeaderClick` | 头部点击事件      | `CustomEvent<CardClickEventDetail>` |
| `ldMouseEnter`  | 鼠标进入事件      | `CustomEvent<CardHoverEventDetail>` |
| `ldMouseLeave`  | 鼠标离开事件      | `CustomEvent<CardHoverEventDetail>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*

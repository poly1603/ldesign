# ldesign-scrollbar



<!-- Auto Generated Below -->


## Overview

ldesign-scrollbar 自定义滚动条
- 包裹任意内容，提供可完全自定义样式的滚动条（纵向/横向）
- 支持拖拽拇指、点击轨道跳转、自动/常显、轨道类型切换
- 通过 CSS 变量覆盖或直接覆盖内部类名实现“完全自主”的样式定制

## Properties

| Property            | Attribute             | Description                                      | Type                                   | Default     |
| ------------------- | --------------------- | ------------------------------------------------ | -------------------------------------- | ----------- |
| `always`            | `always`              | 是否一直显示（默认悬浮显示）                                   | `boolean`                              | `false`     |
| `autoHideDelay`     | `auto-hide-delay`     | 自动隐藏延迟（ms）。<=0 表示不自动隐藏（与 always 类似，但 hover 仍会显示） | `number`                               | `800`       |
| `direction`         | `direction`           | 方向：vertical \| horizontal \| both                | `"both" \| "horizontal" \| "vertical"` | `'both'`    |
| `disabled`          | `disabled`            | 是否禁用滚动交互                                         | `boolean`                              | `false`     |
| `dragScroll`        | `drag-scroll`         | 拖拽滚动（鼠标中键，或按住 Alt+左键）                            | `boolean`                              | `false`     |
| `dragScrollTrigger` | `drag-scroll-trigger` | 拖拽触发方式：middle（中键）\| left-alt（Alt+左键）\| left（左键）  | `"left" \| "left-alt" \| "middle"`     | `'middle'`  |
| `hPosition`         | `h-position`          | 水平条位置：bottom \| top                              | `"bottom" \| "top"`                    | `'bottom'`  |
| `initialScrollLeft` | `initial-scroll-left` |                                                  | `number`                               | `undefined` |
| `initialScrollTop`  | `initial-scroll-top`  | 初始滚动位置（可选）                                       | `number`                               | `undefined` |
| `keyStep`           | `key-step`            | 键盘步进（像素）                                         | `number`                               | `40`        |
| `keyboard`          | `keyboard`            | 是否启用键盘控制（wrap 聚焦时）                               | `boolean`                              | `true`      |
| `layout`            | `layout`              | 布局：overlay 叠加在内容之上；space 预留滚动条空间                 | `"overlay" \| "space"`                 | `'overlay'` |
| `native`            | `native`              | 使用原生滚动条，不渲染自定义轨道/拇指并且不隐藏系统滚动条                    | `boolean`                              | `false`     |
| `pageStep`          | `page-step`           | PageUp/PageDown 的步进（像素），<=0 时按可视高度               | `number`                               | `0`         |
| `rtl`               | `rtl`                 | RTL 文字方向（用于水平滚动与 scrollLeft 归一化）                 | `boolean`                              | `false`     |
| `shadows`           | `shadows`             | 显示滚动阴影，提示可滚动方向                                   | `boolean`                              | `false`     |
| `showButtons`       | `show-buttons`        | 是否显示微调按钮（上下/左右）                                  | `boolean`                              | `false`     |
| `smooth`            | `smooth`              | 平滑滚动                                             | `boolean`                              | `false`     |
| `snapDelay`         | `snap-delay`          |                                                  | `number`                               | `120`       |
| `snapEnabled`       | `snap-enabled`        |                                                  | `boolean`                              | `true`      |
| `snapMode`          | `snap-mode`           |                                                  | `"center" \| "end" \| "start"`         | `'start'`   |
| `snapSelector`      | `snap-selector`       | 吸附：滚动结束后吸附到最近匹配元素                                | `string`                               | `undefined` |
| `stickyBottom`      | `sticky-bottom`       |                                                  | `number`                               | `0`         |
| `stickyTop`         | `sticky-top`          | sticky 偏移（用于阴影起始位置）                              | `number`                               | `0`         |
| `syncAxis`          | `sync-axis`           |                                                  | `"both" \| "horizontal" \| "vertical"` | `'both'`    |
| `syncEnabled`       | `sync-enabled`        |                                                  | `boolean`                              | `true`      |
| `syncGroup`         | `sync-group`          | 同步滚动组与轴                                          | `string`                               | `undefined` |
| `syncThrottle`      | `sync-throttle`       |                                                  | `number`                               | `32`        |
| `thumbMinSize`      | `thumb-min-size`      | 最小拇指尺寸（px）                                       | `number`                               | `24`        |
| `type`              | `type`                | 滚动条类型：bar（仅拇指）\| track（显示轨道）                     | `"bar" \| "track"`                     | `'bar'`     |
| `vPosition`         | `v-position`          | 垂直条位置：right \| left                              | `"left" \| "right"`                    | `'right'`   |
| `wheelPropagation`  | `wheel-propagation`   | 滚轮事件是否允许向父容器传播（到达边缘时总是允许）                        | `boolean`                              | `false`     |


## Events

| Event                | Description   | Type                                                                                                                                            |
| -------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `ldesignReach`       | 触达边缘事件        | `CustomEvent<{ edge: "top" \| "left" \| "right" \| "bottom"; }>`                                                                                |
| `ldesignScroll`      | 滚动事件（代理自内容容器） | `CustomEvent<{ scrollTop: number; scrollLeft: number; clientWidth: number; clientHeight: number; scrollWidth: number; scrollHeight: number; }>` |
| `ldesignScrollEnd`   |               | `CustomEvent<void>`                                                                                                                             |
| `ldesignScrollStart` | 滚动开始/结束       | `CustomEvent<void>`                                                                                                                             |


## Methods

### `getMetrics() => Promise<any>`



#### Returns

Type: `Promise<any>`



### `hideBars() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `scrollByDelta(options: ScrollToOptions) => Promise<void>`



#### Parameters

| Name      | Type              | Description |
| --------- | ----------------- | ----------- |
| `options` | `ScrollToOptions` |             |

#### Returns

Type: `Promise<void>`



### `scrollIntoViewWithin(target: Element | string, options?: { behavior?: ScrollBehavior; block?: "start" | "center" | "end"; inline?: "start" | "center" | "end"; }) => Promise<void>`

滚动容器内的元素到可视区

#### Parameters

| Name      | Type                                                                                                          | Description |
| --------- | ------------------------------------------------------------------------------------------------------------- | ----------- |
| `target`  | `string \| Element`                                                                                           |             |
| `options` | `{ behavior?: ScrollBehavior; block?: "start" \| "end" \| "center"; inline?: "start" \| "end" \| "center"; }` |             |

#### Returns

Type: `Promise<void>`



### `scrollToBottom() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `scrollToLeft() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `scrollToPercent(opts: { x?: number; y?: number; behavior?: ScrollBehavior; }) => Promise<void>`

根据百分比滚动（0~1）

#### Parameters

| Name   | Type                                                     | Description |
| ------ | -------------------------------------------------------- | ----------- |
| `opts` | `{ x?: number; y?: number; behavior?: ScrollBehavior; }` |             |

#### Returns

Type: `Promise<void>`



### `scrollToPos(options: ScrollToOptions) => Promise<void>`



#### Parameters

| Name      | Type              | Description |
| --------- | ----------------- | ----------- |
| `options` | `ScrollToOptions` |             |

#### Returns

Type: `Promise<void>`



### `scrollToRight() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `scrollToTop() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `setCssVars(vars: Record<string, string | number>) => Promise<void>`

动态设置 CSS 变量（同时作用在 host 与内部根元素上）。变量名可带或不带 -- 前缀。数值会自动追加 px。

#### Parameters

| Name   | Type                                 | Description |
| ------ | ------------------------------------ | ----------- |
| `vars` | `{ [x: string]: string \| number; }` |             |

#### Returns

Type: `Promise<void>`



### `showBarsNow() => Promise<void>`

手动显示/隐藏滚动条

#### Returns

Type: `Promise<void>`



### `update() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Shadow Parts

| Part       | Description |
| ---------- | ----------- |
| `"hbar"`   |             |
| `"hthumb"` |             |
| `"htrack"` |             |
| `"vbar"`   |             |
| `"vthumb"` |             |
| `"vtrack"` |             |
| `"wrap"`   |             |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*

# l-dropdown-panel



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute         | Description                         | Type                          | Default                |
| ---------------- | ----------------- | ----------------------------------- | ----------------------------- | ---------------------- |
| `animationMode`  | `animation-mode`  | 动画模式：'scale' 展开动画，'slide' 滑动动画      | `"scale" \| "slide"`          | `'scale'`              |
| `duration`       | `duration`        | 动画持续时间（毫秒）                          | `number`                      | `300`                  |
| `maskBackground` | `mask-background` | 遮罩层背景色                              | `string`                      | `'rgba(0, 0, 0, 0.3)'` |
| `maskClosable`   | `mask-closable`   | 点击遮罩层是否关闭                           | `boolean`                     | `true`                 |
| `maxHeight`      | `max-height`      | 面板最大高度                              | `string`                      | `'60vh'`               |
| `placement`      | `placement`       | 面板弹出位置，'top' 或 'bottom'，'auto' 自动判断 | `"auto" \| "bottom" \| "top"` | `'auto'`               |
| `safeDistance`   | `safe-distance`   | 面板与遮罩边缘的安全距离（像素）                    | `number`                      | `16`                   |
| `visible`        | `visible`         | 面板是否可见                              | `boolean`                     | `false`                |


## Events

| Event           | Description | Type                   |
| --------------- | ----------- | ---------------------- |
| `visibleChange` | 面板显示/隐藏时触发  | `CustomEvent<boolean>` |


## Methods

### `hide() => Promise<void>`

隐藏面板

#### Returns

Type: `Promise<void>`



### `show() => Promise<void>`

显示面板

#### Returns

Type: `Promise<void>`



### `toggle() => Promise<void>`

切换面板显示状态

#### Returns

Type: `Promise<void>`




## Slots

| Slot        | Description |
| ----------- | ----------- |
| `"default"` | 面板内容        |
| `"trigger"` | 触发器内容       |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*

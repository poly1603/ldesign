# ColorPicker 颜色选择器

一个轻量的颜色选择器 Web Component，包含色相/明度/饱和度选择、透明度、预设与最近颜色、以及多种输入格式。

- 标签名：`<ldesign-color-picker>`
- 事件：
  - `ldesignInput` 实时颜色变化（拖动/输入）
  - `ldesignChange` 确认颜色（拖动结束或输入变更）

## 基本用法

```html
<ldesign-color-picker value="#1677ff"></ldesign-color-picker>
```

## 属性

- `value` 当前值（默认 hex），支持 `#RRGGBB/#RRGGBBAA`、`rgb()/rgba()`、`hsl()/hsla()`、`hsv()`
- `format` 默认显示格式：`hex | rgb | hsl | hsv`
- `show-alpha` 是否显示透明度（默认 true）
- `show-preset` 是否显示系统预设颜色（默认 true）
- `show-history` 是否显示最近使用颜色（默认 true）
- `presets` 预设颜色数组
- `recent-max` 最近颜色个数（默认 12）
- `size` `small | medium | large`
- `disabled` 禁用

## 监听事件

```js
const el = document.querySelector('ldesign-color-picker')
el.addEventListener('ldesignInput', (e) => console.log('input:', e.detail))
el.addEventListener('ldesignChange', (e) => console.log('change:', e.detail))
```
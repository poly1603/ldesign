# Slider 滑块组件

通过拖动滑块在一定数值区间内进行选择。

## 基本用法

```html
<ldesign-slider></ldesign-slider>
<ldesign-slider value="30"></ldesign-slider>
<ldesign-slider value="80" show-tooltip></ldesign-slider>
```

## 范围与步长

```html
<ldesign-slider min="-50" max="50" step="5" value="5"></ldesign-slider>
```

## 禁用

```html
<ldesign-slider disabled value="40"></ldesign-slider>
```

## 垂直方向

```html
<ldesign-slider vertical style="height: 200px;"></ldesign-slider>
```

## 属性 Attributes
- value: number = 0 当前值（受控，可变）
- min: number = 0 最小值
- max: number = 100 最大值
- step: number = 1 步长（>0）
- disabled: boolean 是否禁用
- size: 'small' | 'medium' | 'large' 尺寸
- vertical: boolean 是否垂直模式
- showTooltip: boolean 是否显示当前值提示

## 事件 Events
- ldesignInput: 拖动过程中实时触发，携带当前值 number
- ldesignChange: 值改变完成后触发（释放拖动/键盘/点击轨道），携带当前值 number

## 无障碍
- 支持键盘：←/→/↑/↓ 调整步长，PageUp/PageDown 调整10倍步长，Home/End 到最小/最大
- ARIA: role="slider"，aria-valuemin/aria-valuemax/aria-valuenow，aria-orientation

# TimePicker 示例

本页给出常见的 TimePicker 场景示例，便于快速复制使用。

## 基础

<div class="demo-block">
  <ldesign-time-picker placeholder="选择时间"></ldesign-time-picker>
</div>

```html
<ldesign-time-picker placeholder="选择时间"></ldesign-time-picker>
```

## 不显示秒

<div class="demo-block">
  <ldesign-time-picker show-seconds="false" placeholder="HH:mm"></ldesign-time-picker>
</div>

```html
<ldesign-time-picker show-seconds="false" placeholder="HH:mm"></ldesign-time-picker>
```

## 即时生效

<div class="demo-block">
  <ldesign-time-picker confirm="false"></ldesign-time-picker>
</div>

```html
<ldesign-time-picker confirm="false"></ldesign-time-picker>
```

## 12 小时制 + 输出 12h

<div class="demo-block">
  <ldesign-time-picker use-12-hours output-format="12"></ldesign-time-picker>
</div>

```html
<ldesign-time-picker use-12-hours output-format="12"></ldesign-time-picker>
```

## 时间范围与禁用

<div class="demo-block">
  <ldesign-time-picker
    min-time="09:30:00"
    max-time="18:00:00"
    disabled-hours='[0,1,2,22,23]'
    minute-step="5"
  ></ldesign-time-picker>
</div>

```html
<ldesign-time-picker
  min-time="09:30:00"
  max-time="18:00:00"
  disabled-hours='[0,1,2,22,23]'
  minute-step="5"
></ldesign-time-picker>
```

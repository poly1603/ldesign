# Countdown 倒计时

用于按结束时间或时长进行倒计时显示，支持自定义格式、毫秒精度、受控暂停/继续，以及完成与变化事件。

## 基础用法

10 秒倒计时：

<ldesign-countdown value="10000" format="mm:ss"></ldesign-countdown>

```html
<ldesign-countdown value="10000" format="mm:ss"></ldesign-countdown>
```

## 指定结束时间

传入绝对时间作为结束点：

<ldesign-countdown title="距离活动结束" end-time="2099-12-31T23:59:59Z" format="DD 天 HH:mm:ss"></ldesign-countdown>

```html
<ldesign-countdown title="距离活动结束" end-time="2099-12-31T23:59:59Z" format="DD 天 HH:mm:ss"></ldesign-countdown>
```

## 尺寸

<ldesign-countdown size="small" value="90000" format="mm:ss"></ldesign-countdown>
<ldesign-countdown size="middle" value="90000" format="mm:ss" style="margin-left: 16px;"></ldesign-countdown>
<ldesign-countdown size="large" value="90000" format="mm:ss" style="margin-left: 16px;"></ldesign-countdown>

```html
<ldesign-countdown size="small" value="90000" format="mm:ss"></ldesign-countdown>
<ldesign-countdown size="middle" value="90000" format="mm:ss"></ldesign-countdown>
<ldesign-countdown size="large" value="90000" format="mm:ss"></ldesign-countdown>
```

## 展现形式（Variants）

### 分段（segment）

<ldesign-countdown variant="segment" value="3661000" format="HH:mm:ss" show-unit></ldesign-countdown>

```html
<ldesign-countdown variant="segment" value="3661000" format="HH:mm:ss" show-unit></ldesign-countdown>
```

### 翻牌（flip）

<ldesign-countdown variant="flip" value="12345" format="mm:ss:SSS" millisecond></ldesign-countdown>

```html
<ldesign-countdown variant="flip" value="12345" format="mm:ss:SSS" millisecond></ldesign-countdown>
```

### 进度条（progress-line）

<ldesign-countdown variant="progress-line" value="10000" format="mm:ss"></ldesign-countdown>

```html
<ldesign-countdown variant="progress-line" value="10000" format="mm:ss"></ldesign-countdown>
```

### 环形进度（progress-circle）

<ldesign-countdown variant="progress-circle" value="20000" format="mm:ss" circle-stroke="4"></ldesign-countdown>

```html
<ldesign-countdown variant="progress-circle" value="20000" format="mm:ss" circle-stroke="4"></ldesign-countdown>
```

## 自定义格式

支持以下格式令牌：`DD`（天）、`HH`（小时）、`mm`（分钟）、`ss`（秒）、`SSS`（毫秒）。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-countdown value="3661000" format="HH:mm:ss"></ldesign-countdown>
  </div>
  <div class="demo-row">
    <ldesign-countdown value="90061000" format="DD 天 HH:mm:ss"></ldesign-countdown>
  </div>
  <div class="demo-row">
    <ldesign-countdown value="12345" format="mm:ss:SSS" millisecond></ldesign-countdown>
  </div>
</div>

```html
<ldesign-countdown value="3661000" format="HH:mm:ss"></ldesign-countdown>
<ldesign-countdown value="90061000" format="DD 天 HH:mm:ss"></ldesign-countdown>
<ldesign-countdown value="12345" format="mm:ss:SSS" millisecond></ldesign-countdown>
```

## 受控暂停与继续

通过 `paused` 控制暂停；也可以调用实例方法 `start()`、`pause()`、`reset()`。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-countdown id="cd-ctrl" value="15000" format="mm:ss"></ldesign-countdown>
  </div>
  <div class="demo-row">
    <ldesign-button id="cd-start" type="primary">开始</ldesign-button>
    <ldesign-button id="cd-pause" type="default">暂停</ldesign-button>
    <ldesign-button id="cd-reset" type="dashed">重置</ldesign-button>
  </div>
</div>

```html
<ldesign-countdown id="cd-ctrl" value="15000" format="mm:ss"></ldesign-countdown>
<ldesign-button id="cd-start" type="primary">开始</ldesign-button>
<ldesign-button id="cd-pause" type="default">暂停</ldesign-button>
<ldesign-button id="cd-reset" type="dashed">重置</ldesign-button>

<script>
const cd = document.getElementById('cd-ctrl')
const btnStart = document.getElementById('cd-start')
const btnPause = document.getElementById('cd-pause')
const btnReset = document.getElementById('cd-reset')
btnStart.addEventListener('ldesignClick', () => cd.start())
btnPause.addEventListener('ldesignClick', () => cd.pause())
btnReset.addEventListener('ldesignClick', () => cd.reset())
</script>
```

<script setup>
import { onMounted, onUnmounted } from 'vue'
let sH, pH, rH
onMounted(() => {
  const cd = document.getElementById('cd-ctrl')
  const btnStart = document.getElementById('cd-start')
  const btnPause = document.getElementById('cd-pause')
  const btnReset = document.getElementById('cd-reset')
  sH = () => cd && cd.start()
  pH = () => cd && cd.pause()
  rH = () => cd && cd.reset()
  btnStart && btnStart.addEventListener('ldesignClick', sH)
  btnPause && btnPause.addEventListener('ldesignClick', pH)
  btnReset && btnReset.addEventListener('ldesignClick', rH)
})
onUnmounted(() => {
  const btnStart = document.getElementById('cd-start')
  const btnPause = document.getElementById('cd-pause')
  const btnReset = document.getElementById('cd-reset')
  btnStart && sH && btnStart.removeEventListener('ldesignClick', sH)
  btnPause && pH && btnPause.removeEventListener('ldesignClick', pH)
  btnReset && rH && btnReset.removeEventListener('ldesignClick', rH)
})
</script>

## 事件

组件会在倒计时变化时触发 `ldesignChange`，在结束时触发 `ldesignFinish`。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-countdown id="cd-evt" value="5000" format="mm:ss"></ldesign-countdown>
  </div>
  <div class="demo-row">
    <span id="cd-log" style="color: var(--ldesign-text-color-secondary);"></span>
  </div>
</div>

```html
<ldesign-countdown id="cd-evt" value="5000" format="mm:ss"></ldesign-countdown>
<span id="cd-log"></span>
<script>
const cd = document.getElementById('cd-evt')
const log = document.getElementById('cd-log')
cd.addEventListener('ldesignChange', (e) => {
  const { remaining, formatted } = e.detail
  log.textContent = `剩余: ${remaining}ms (${formatted})`
})
cd.addEventListener('ldesignFinish', () => {
  log.textContent = '倒计时结束'
})
</script>
```

## 无障碍

- 组件带有 `role="timer"`，并设置了 `aria-live="polite"` 与 `aria-atomic="true"`，读屏器可感知数值变化
- 数字采用等宽（tabular-nums）排版，避免更新时的抖动

## API

### 属性

| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `endTime` | `number \| string \| Date` | `-` | 绝对结束时间（优先级高） |
| `value` | `number` | `-` | 倒计时时长（毫秒），在未提供 `endTime` 时生效 |
| `format` | `string` | `'HH:mm:ss'` | 显示格式（支持 `DD`、`HH`、`mm`、`ss`、`SSS`） |
| `autoStart` | `boolean` | `true` | 是否在初始化时自动开始 |
| `paused` | `boolean` | `false` | 受控暂停（true 时会停止计时） |
| `millisecond` | `boolean` | `false` | 是否以毫秒级更新（约 50ms 一次） |
| `size` | `'small' \| 'middle' \| 'large' \| 'medium'` | `'middle'` | 组件尺寸 |
| `title` | `string` | `-` | 标题文本，展示在数值前 |
| `variant` | `'text' \| 'segment' \| 'flip' \| 'progress-line' \| 'progress-circle'` | `'text'` | 展现形式 |
| `showUnit` | `boolean` | `false` | 分段/翻牌样式下是否显示单位 |
| `progressAs` | `'elapsed' \| 'remaining'` | `'elapsed'` | 进度按照“已消耗”或“剩余”计算 |
| `circleSize` | `number` | `-` | 环形进度尺寸（px） |
| `circleStroke` | `number` | `4` | 环形进度描边宽度 |

### 事件

| 事件名 | 说明 | 事件参数 |
|---|---|---|
| `ldesignChange` | 数值变化时触发 | `{ remaining: number; formatted: string }` |
| `ldesignFinish` | 结束时触发 | `void` |

### 方法

| 方法名 | 说明 |
|---|---|
| `start()` | 开始/继续倒计时 |
| `pause()` | 暂停倒计时（保留剩余时间） |
| `reset()` | 重置并在 `autoStart=true` 且未暂停时自动开始 |
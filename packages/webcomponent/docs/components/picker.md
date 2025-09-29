# Picker 滚轮选择器

本文展示 `<ldesign-picker>` 的基础用法与典型配置，示例为真实渲染（非占位）。

> 注意：若在 SSR 环境渲染出现闪烁，可考虑使用 ClientOnly 包裹。

## 基础用法

<div class="demo-container" style="display:flex; gap: 16px; align-items:flex-start;">
  <ldesign-picker
    visible-items="5"
    options='[{"value":"01","label":"01"},{"value":"02","label":"02"},{"value":"03","label":"03"},{"value":"04","label":"04"},{"value":"05","label":"05"}]'
  ></ldesign-picker>
</div>

```html
<ldesign-picker visible-items="5" options='[{"value":"01","label":"01"},{"value":"02","label":"02"}]'></ldesign-picker>
```

---

## 视觉效果（实时渲染）

<div class="demo-container" style="display:flex; gap: 16px; align-items:flex-start; flex-wrap: wrap;">
  <div>
    <div style="margin: 0 0 8px; color:#666; font-size:13px;">3D 效果</div>
<ldesign-picker enable-3d visible-items="5"
      options='[{"value":"01","label":"01"},{"value":"02","label":"02"},{"value":"03","label":"03"},{"value":"04","label":"04"},{"value":"05","label":"05"}]'
    ></ldesign-picker>
  </div>
  <div>
    <div style="margin: 0 0 8px; color:#666; font-size:13px;">渐变遮罩</div>
    <ldesign-picker show-mask visible-items="5"
      options='[{"value":"A","label":"A"},{"value":"B","label":"B"},{"value":"C","label":"C"},{"value":"D","label":"D"},{"value":"E","label":"E"}]'
    ></ldesign-picker>
  </div>
  <div>
    <div style="margin: 0 0 8px; color:#666; font-size:13px;">3D + 渐变遮罩</div>
<ldesign-picker enable-3d show-mask visible-items="5"
      style="--ldesign-picker-3d-perspective: 900px; --ldesign-picker-3d-rotate: 45deg; --ldesign-picker-3d-step-deg: 22deg; --ldesign-picker-3d-radius: 110px; --ldesign-picker-3d-scale-min: .78; --ldesign-picker-3d-scale-max: 1.1;"
      options='[{"value":"1","label":"1"},{"value":"2","label":"2"},{"value":"3","label":"3"},{"value":"4","label":"4"},{"value":"5","label":"5"}]'
    ></ldesign-picker>
  </div>
</div>

## 搜索功能（实时渲染）

<div class="demo-container">
  <ldesign-picker
    id="picker-search-live"
    searchable
    highlight-match
    keyboard-quick-jump
    visible-items="5"
    options='[
      {"value":"apple","label":"🍎 Apple"},
      {"value":"apricot","label":"🍑 Apricot"},
      {"value":"avocado","label":"🥑 Avocado"},
      {"value":"banana","label":"🍌 Banana"},
      {"value":"blueberry","label":"🫐 Blueberry"},
      {"value":"cherry","label":"🍒 Cherry"},
      {"value":"coconut","label":"🥥 Coconut"},
      {"value":"dragon-fruit","label":"🐉 Dragon Fruit"},
      {"value":"grape","label":"🍇 Grape"},
      {"value":"kiwi","label":"🥝 Kiwi"},
      {"value":"lemon","label":"🍋 Lemon"},
      {"value":"mango","label":"🥭 Mango"},
      {"value":"melon","label":"🍈 Melon"},
      {"value":"orange","label":"🍊 Orange"},
      {"value":"peach","label":"🍑 Peach"},
      {"value":"pear","label":"🍐 Pear"},
      {"value":"pineapple","label":"🍍 Pineapple"},
      {"value":"strawberry","label":"🍓 Strawberry"},
      {"value":"watermelon","label":"🍉 Watermelon"}
    ]'
  ></ldesign-picker>
</div>

## 主题与外观（实时渲染）

<div class="demo-container" style="display:flex; gap: 16px; align-items:flex-start; flex-wrap: wrap;">
  <div>
    <div style="margin: 0 0 8px; color:#666; font-size:13px;">浅色（默认）</div>
    <ldesign-picker visible-items="5"
      options='[{"value":"1","label":"Option 1"},{"value":"2","label":"Option 2"},{"value":"3","label":"Option 3"}]'
    ></ldesign-picker>
  </div>
  <div style="background:#1f2937; padding: 16px; border-radius: 8px;">
    <div style="margin: 0 0 8px; color:#fff; font-size:13px;">深色主题</div>
    <ldesign-picker theme="dark" visible-items="5"
      options='[{"value":"a","label":"项 A"},{"value":"b","label":"项 B"},{"value":"c","label":"项 C"}]'
    ></ldesign-picker>
  </div>
  <div>
    <div style="margin: 0 0 8px; color:#666; font-size:13px;">自定义颜色</div>
    <ldesign-picker
      visible-items="5"
      style="--ldesign-picker-active-color:#10b981; --ldesign-picker-active-bg:rgba(16,185,129,0.1); --ldesign-picker-border:#10b981;"
      options='[{"value":"x","label":"自定义 1"},{"value":"y","label":"自定义 2"},{"value":"z","label":"自定义 3"}]'
    ></ldesign-picker>
  </div>
</div>

## 交互增强（触觉/音效）

<div class="demo-container" style="display:flex; gap: 16px; align-items:flex-start; flex-wrap: wrap;">
  <div>
    <div style="margin: 0 0 8px; color:#666; font-size:13px;">触觉反馈（移动端）</div>
    <ldesign-picker haptic-feedback haptic-intensity="20" visible-items="5"
      options='[{"value":"1","label":"1"},{"value":"2","label":"2"},{"value":"3","label":"3"}]'
    ></ldesign-picker>
  </div>
  <div>
    <div style="margin: 0 0 8px; color:#666; font-size:13px;">音效反馈</div>
    <ldesign-picker sound-effects sound-volume="0.3" visible-items="5"
      options='[{"value":"A","label":"A"},{"value":"B","label":"B"},{"value":"C","label":"C"}]'
    ></ldesign-picker>
  </div>
</div>

## 键盘导航（实时）

<div class="demo-container">
  <p style="color:#666; font-size:13px; margin: 0 0 8px;">获得焦点后可使用 ↑/↓、Home/End、PageUp/PageDown、Enter/Space、字母/数字、Escape 等键。</p>
  <ldesign-picker id="picker-keyboard-live" visible-items="5"
    options='[{"value":"01","label":"01"},{"value":"02","label":"02"},{"value":"03","label":"03"},{"value":"04","label":"04"},{"value":"05","label":"05"}]'
  ></ldesign-picker>
</div>

## 事件示例（实时）

<div class="demo-container" style="display:flex; gap: 16px; align-items:flex-start;">
  <ldesign-picker id="picker-event-live" visible-items="5"
    options='[{"value":"a","label":"A"},{"value":"b","label":"B"},{"value":"c","label":"C"},{"value":"d","label":"D"},{"value":"e","label":"E"}]'
  ></ldesign-picker>
  <div style="min-width:240px;">
    <div style="margin: 0 0 8px; color:#666; font-size:13px;">事件输出：</div>
    <pre id="picker-event-log" style="background:#f5f5f5; padding:12px; border-radius:8px; min-height:80px; white-space:pre-wrap;"></pre>
  </div>
</div>


## 程序控制（实时）

<div class="demo-container">
  <div style="display:flex; gap: 16px; align-items:flex-start; flex-wrap:wrap;">
    <ldesign-picker id="picker-control-live" visible-items="5"
      options='[{"value":"apple","label":"🍎 Apple"},{"value":"banana","label":"🍌 Banana"},{"value":"orange","label":"🍊 Orange"},{"value":"grape","label":"🍇 Grape"},{"value":"pear","label":"🍐 Pear"}]'
      value="orange"
    ></ldesign-picker>
    <div>
      <div style="margin: 0 0 8px; color:#666; font-size:13px;">操作：</div>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button onclick="window.__pkScrollTo('first')">滚动到第一项</button>
        <button onclick="window.__pkScrollTo('last')">滚动到最后一项</button>
        <button onclick="window.__pkScrollTo('random')">随机选择</button>
        <button onclick="window.__pkScrollToIndex(3)">滚动到第 4 项</button>
        <button onclick="window.__pkCenter()">居中当前项</button>
      </div>
    </div>
  </div>
</div>


## 多列级联（日期选择）

<div class="demo-container">
  <div style="display:flex; gap: 12px; align-items:flex-start; flex-wrap:wrap;">
    <ldesign-picker id="picker-year" size="small"></ldesign-picker>
    <ldesign-picker id="picker-month" size="small"></ldesign-picker>
    <ldesign-picker id="picker-day" size="small"></ldesign-picker>
  </div>
  <div style="margin-top:8px;">选中日期：<span id="picker-date-display">未选择</span></div>
</div>


## 尺寸与可视高度

<div class="demo-container" style="display:flex; gap: 16px; align-items:flex-start;">
  <ldesign-picker size="small" options='[{"value":"1","label":"1"},{"value":"2","label":"2"},{"value":"3","label":"3"}]'></ldesign-picker>
  <ldesign-picker size="medium" visible-items="7" options='[{"value":"a","label":"A"},{"value":"b","label":"B"},{"value":"c","label":"C"}]'></ldesign-picker>
  <ldesign-picker size="large" panel-height="240" options='[{"value":"x","label":"X"},{"value":"y","label":"Y"},{"value":"z","label":"Z"}]'></ldesign-picker>
</div>

```html
<ldesign-picker size="small" options='[{"value":"1","label":"1"},{"value":"2","label":"2"}]'></ldesign-picker>
<ldesign-picker size="medium" visible-items="7" options='[{"value":"a","label":"A"},{"value":"b","label":"B"}]'></ldesign-picker>
<ldesign-picker size="large" panel-height="240" options='[{"value":"x","label":"X"},{"value":"y","label":"Y"}]'></ldesign-picker>
```

## 手感预设（拖拽/惯性/回弹）

<div class="demo-container" style="display:flex; gap: 16px; align-items:flex-start; flex-wrap: wrap;">
  <div>
    <div style="margin: 0 0 8px; color:#666; font-size:13px;">轻手感</div>
    <ldesign-picker
      visible-items="5"
      options='[{"value":"1","label":"1"},{"value":"2","label":"2"},{"value":"3","label":"3"}]'
      drag-follow="0.9"
      drag-smoothing="40"
      friction="0.99"
      resistance="0.6"
      max-overscroll-ratio="0.25"
      snap-duration="260"
    ></ldesign-picker>
  </div>
  <div>
    <div style="margin: 0 0 8px; color:#666; font-size:13px;">中手感</div>
    <ldesign-picker
      visible-items="5"
      options='[{"value":"A","label":"A"},{"value":"B","label":"B"},{"value":"C","label":"C"}]'
      drag-follow="0.8"
      drag-smoothing="80"
      friction="0.99"
      resistance="0.8"
      max-overscroll-ratio="0.5"
      snap-duration="300"
    ></ldesign-picker>
  </div>
  <div>
    <div style="margin: 0 0 8px; color:#666; font-size:13px;">重手感</div>
    <ldesign-picker
      visible-items="5"
      options='[{"value":"x","label":"x"},{"value":"y","label":"y"},{"value":"z","label":"z"}]'
      drag-follow="0.7"
      drag-smoothing="120"
      friction="0.992"
      resistance="0.9"
      max-overscroll-ratio="0.6"
      snap-duration="320"
    ></ldesign-picker>
  </div>
</div>

```html
<!-- 轻手感 -->
<ldesign-picker drag-follow="0.9" drag-smoothing="40" friction="0.99" resistance="0.6" max-overscroll-ratio="0.25" snap-duration="260"></ldesign-picker>
```

## 越界与回弹

<div class="demo-container" style="display:flex; gap: 16px; align-items:flex-start;">
  <ldesign-picker
    visible-items="5"
    options='[{"value":"01","label":"01"},{"value":"02","label":"02"},{"value":"03","label":"03"}]'
    max-overscroll-ratio="0.5"
    snap-duration="320"
    resistance="0.8"
  ></ldesign-picker>
</div>

```html
<ldesign-picker max-overscroll-ratio="0.5" snap-duration="320" resistance="0.8"></ldesign-picker>
```

## 3D 透视效果（enable3d）

<div class="demo-container" style="margin: 12px 0;">
<ldesign-picker
    enable-3d
    visible-items="5"
    style="--ldesign-picker-3d-perspective: 900px; --ldesign-picker-3d-rotate: 45deg; --ldesign-picker-3d-step-deg: 22deg; --ldesign-picker-3d-radius: 110px; --ldesign-picker-3d-scale-min: .78; --ldesign-picker-3d-scale-max: 1.1;"
    options='[{"value":"01","label":"01"},{"value":"02","label":"02"},{"value":"03","label":"03"},{"value":"04","label":"04"},{"value":"05","label":"05"},{"value":"06","label":"06"},{"value":"07","label":"07"},{"value":"08","label":"08"},{"value":"09","label":"09"}]'
  ></ldesign-picker>
</div>

- 启用 `enable3d` 后，组件会基于中心行对每个条目动态施加 `rotateX`，配合容器的 CSS `perspective` 呈现圆柱形的 3D 视觉（近大远小）。
- 可通过 CSS 变量细调：
  - `--ldesign-picker-3d-perspective`: 容器透视距离（默认 `500px`）
  - `--ldesign-picker-3d-rotate`: 每侧最大旋转角（默认 `25deg`）
- 建议将 `visible-items` 设为奇数（3/5/7...）以获得更自然的中心对称效果。


示例：开启 3D
```html
<ldesign-picker enable-3d visible-items="5"></ldesign-picker>
```

示例：自定义最大角度与透视距离（也可写到全局样式）
```html
<ldesign-picker
  enable-3d
  visible-items="7"
  style="--ldesign-picker-3d-perspective: 700px; --ldesign-picker-3d-rotate: 30deg;"
></ldesign-picker>
```

提示：3D 可与其他视觉选项叠加，例如：
```html
<ldesign-picker enable-3d show-mask></ldesign-picker>
```

---

如需完整 API 与更多示例，请稍后查看更新版本（我们会在确认页面稳定后恢复表格与脚本示例）。

该页面已临时精简以修复构建期 “Duplicate attribute.” 报错。随后会逐步恢复完整示例。

## 简介

`<ldesign-picker>` 是滚轮选择器 Web Component。下面仅展示最小示例（纯代码展示，不参与渲染）：

```html
<!-- 仅作为代码展示，不参与渲染/编译 -->
<ldesign-picker visible-items="5" options='[{"value":"01","label":"01"},{"value":"02","label":"02"}]'></ldesign-picker>
```

## 常用属性（简要）

```text
options: 选项数据（字符串或数组）
value/defaultValue: 当前值 / 默认值
visibleItems: 可视项目数（默认 5）
itemHeight: 行高（像素）
friction/resistance: 惯性摩擦/边界阻力
snapDuration: 吸附动画时长（毫秒）
```

> 说明：完整的属性/事件/方法表与演示代码已保存在 `picker.backup.md`，确认页面编译正常后再分段恢复。

高性能、功能丰富的滚轮选择器组件，提供流畅的交互体验和丰富的自定义选项。支持 PC 鼠标滚轮、移动端手指滑动、边界阻力/回弹以及基于速度的惯性滚动。

- 组件标签：`<ldesign-picker>`
- 版本：`v2.0.0` 全新升级

## ✨ 新增特性

- 🔍 **搜索功能**：实时搜索、模糊匹配、键盘快速跳转
- 🎨 **主题定制**：内置明暗主题，支持 CSS 变量自定义
- ♿ **无障碍**：完整的 ARIA 属性，增强键盘导航
- 📳 **触觉反馈**：移动端振动反馈
- 🔊 **音效支持**：可配置的滚动音效
- 🎮 **3D 效果**：可选的 3D 透视效果
- 🌊 **渐变遮罩**：顶部/底部渐变效果
- ⚡ **性能优化**：节流防抖、减少重渲染

<script setup>
import { ref, watch, onMounted } from 'vue'
// 基础用法示例：右侧 select 控制左侧 picker
const demoBasicVal = ref('01')
const pkBasicEl = ref(null)
function onPickerChange(e) {
  const nv = e && e.detail && typeof e.detail.value !== 'undefined' ? e.detail.value : demoBasicVal.value
  demoBasicVal.value = nv
}
// 将 select 的值同步到 Web Component 的 prop（而不是 attribute），以确保触发组件内部的监听
onMounted(() => { if (pkBasicEl && pkBasicEl.value) pkBasicEl.value.value = demoBasicVal.value })
watch(demoBasicVal, (v) => { if (pkBasicEl && pkBasicEl.value) pkBasicEl.value.value = v })

// 事件示例初始化（picker-event-live）
onMounted(() => {
  const el = document.getElementById('picker-event-live')
  const log = document.getElementById('picker-event-log')
  if (el && log) {
    el.addEventListener('ldesignChange', (e) => {
      log.textContent = '[ldesignChange] ' + JSON.stringify(e.detail)
    })
    el.addEventListener('ldesignPick', (e) => {
      const d = e.detail || {}
      const trig = d.context && d.context.trigger ? d.context.trigger : ''
      const val = typeof d.value !== 'undefined' ? d.value : 'undefined'
      log.textContent = '[ldesignPick] ' + trig + ' -> ' + val
    })
  }
})

// 程序控制（picker-control-live）
onMounted(() => {
  const pk = document.getElementById('picker-control-live')
  if (!pk) return
  function randInt(n){ return Math.floor(Math.random() * n) }
  function values(){
    try { const arr = JSON.parse(pk.getAttribute('options')||'[]'); return Array.isArray(arr) ? arr.map(i=>i.value) : [] } catch { return [] }
  }
  window.__pkScrollTo = async function(which){
    const vs = values()
    if (which==='first' && vs[0]) return pk.scrollToValue(vs[0], { animate: true })
    if (which==='last' && vs[vs.length-1]) return pk.scrollToValue(vs[vs.length-1], { animate: true })
    if (which==='random') {
      const v = vs[randInt(vs.length)]
      return pk.scrollToValue(v, { animate: true })
    }
  }
  window.__pkScrollToIndex = async function(i){ return pk.scrollToIndex(i, { animate: true }) }
  window.__pkCenter = async function(){ return pk.centerToCurrent(true) }
})

// 多列级联（日期选择）
onMounted(() => {
  const year = document.getElementById('picker-year')
  const month = document.getElementById('picker-month')
  const day = document.getElementById('picker-day')
  const out = document.getElementById('picker-date-display')
  if (!year || !month || !day) return

  const yearOptions = []
  for (let i=2020;i<=2030;i++){ yearOptions.push({ value:String(i), label: i+'年' }) }
  year.setAttribute('options', JSON.stringify(yearOptions))
  year.value = '2024'

  const monthOptions = []
  for (let i=1;i<=12;i++){ const v=String(i).padStart(2,'0'); monthOptions.push({ value:v, label: i+'月' }) }
  month.setAttribute('options', JSON.stringify(monthOptions))
  month.value = '01'

  function updateDays(){
    const y = parseInt(year.value||'2024', 10)
    const m = parseInt(month.value||'01', 10)
    const days = new Date(y, m, 0).getDate()
    const dayOptions = []
    for (let i=1;i<=days;i++){ const v=String(i).padStart(2,'0'); dayOptions.push({ value:v, label: i+'日' }) }
    day.setAttribute('options', JSON.stringify(dayOptions))
    if (!day.value || parseInt(day.value,10) > days){ day.value = '01' }
    if (out) out.textContent = `${year.value}-${month.value}-${day.value||'01'}`
  }

  year.addEventListener('ldesignChange', updateDays)
  month.addEventListener('ldesignChange', updateDays)
  day.addEventListener('ldesignChange', () => { if (out) out.textContent = `${year.value}-${month.value}-${day.value||'01'}` })

  updateDays()
})
</script>

## 基础用法

<!-- 暂时隐藏基础用法示例以避免Vue解析错误
<div class="demo-container">
  [基础用法示例组件]
</div>
-->

```html
<div style="display:flex; gap: 16px; align-items:flex-start;">
  <ldesign-picker id="picker-basic" ref="pkBasicEl" :value="demoBasicVal" @ldesignChange="onPickerChange" visible-items="5" options='[{"value":"01","label":"选项 01"}, {"value":"02","label":"选项 02"}, ...]'></ldesign-picker>
  <select id="picker-basic-select" v-model="demoBasicVal" style="width:120px;">
    <option value="01">选项 01</option>
    <option value="02">选项 02</option>
    <!-- ... -->
    <option value="20">选项 20</option>
  </select>
</div>
```

## 大数据（默认可视5项，首项居中）

<!-- 暂时隐藏
<div class="demo-container">
  [大数据示例组件]
</div>
-->

```html
<ldesign-picker id="picker-long" visible-items="5"></ldesign-picker>
```

```javascript
// 动态设置大数据选项
const arr = Array.from({ length: 60 }, (_, i) => ({ 
  value: String(i).padStart(2, '0'), 
  label: String(i).padStart(2, '0') 
}));
const el = document.getElementById('picker-long');
el?.setAttribute('options', JSON.stringify(arr));
```

## 尺寸与可视高度

通过 `size` 控制行高，通过 `panel-height` 或 `visible-items` 控制可视高度。

<!-- 暂时隐藏尺寸示例组件以避免Vue解析错误
<div class="demo-container">
  [小、中、大尺寸示例组件]
</div>
-->

```html
<ldesign-picker size="small" options='[{"value":"1","label":"项 1"},{"value":"2","label":"项 2"}]'></ldesign-picker>
<ldesign-picker size="medium" visible-items="7" options='[{"value":"1","label":"项 1"}, {"value":"2","label":"项 2"}, ...]'></ldesign-picker>
<ldesign-picker size="large" panel-height="240" options='[{"value":"x","label":"X"},{"value":"y","label":"Y"},{"value":"z","label":"Z"}]'></ldesign-picker>
```

## 拖拽阻力与惯性

拖拽过程的“阻力/迟滞感”和松手后的“惯性衰减/回弹”可分别调节：
- 拖拽过程：`drag-follow`（跟手比例 0-1）与 `drag-smoothing`（时间平滑常数，毫秒）
- 边界橡皮筋：`resistance`（越大越“松”）与 `max-overscroll(-ratio)`（最大越界幅度）
- 惯性衰减：`friction`（越接近 1，惯性越长）
- 吸附回弹：`snap-duration` 控制回到最近项的时长（毫秒）

### 预设手感示例（轻 / 中 / 重）
<!-- 暂时隐藏以避免Vue解析错误
<div class="demo-container" style="display: flex; flex-wrap: wrap; gap: 24px; margin: 16px 0; align-items: flex-start;">
  [轻、中、重手感示例组件]
</div>
-->

```html
<!-- 轻手感 -->
<ldesign-picker drag-follow="0.9" drag-smoothing="40" friction="0.99" resistance="0.6" max-overscroll-ratio="0.25" snap-duration="260" />
<!-- 中手感 -->
<ldesign-picker drag-follow="0.8" drag-smoothing="80" friction="0.99" resistance="0.8" max-overscroll-ratio="0.5" snap-duration="300" />
<!-- 重手感 -->
<ldesign-picker drag-follow="0.7" drag-smoothing="120" friction="0.992" resistance="0.9" max-overscroll-ratio="0.6" snap-duration="320" />
```

### 越界弹性与回弹时长
- 不设置时，最大越界幅度默认是“容器高度的一半”
- 使用 `max-overscroll-ratio` 可以按容器高度比例指定越界量（像素优先生效）
- 使用 `snap-duration` 可让松手后的回弹更慢一些；`snap-duration-wheel` 控制滚轮的吸附时长（默认 150）

<!-- 暂时隐藏
[超界弹性示例组件]
-->

```html
<ldesign-picker max-overscroll-ratio="0.5" snap-duration="320" resistance="0.8" />
```

## 事件

- `ldesignChange`: 最终选中项变化（吸附后触发），detail: `{ value, option }`
- `ldesignPick`: 滚动/拖拽过程事件，detail: `{ value, option, context: { trigger } }`

<!-- 暂时隐藏
[事件示例组件]
-->

```html
<ldesign-picker id="picker-demo" options='[{"value":"a","label":"A"},{"value":"b","label":"B"},{"value":"c","label":"C"}]'></ldesign-picker>
<div id="picker-log"></div>
```

```javascript
// 事件监听示例
const pk = document.getElementById('picker-demo');
const log = document.getElementById('picker-log');

pk?.addEventListener('ldesignChange', (e) => {
  log && (log.textContent = 'change: ' + JSON.stringify(e.detail));
});

pk?.addEventListener('ldesignPick', (e) => {
  // 实时查看触发来源（wheel/touch/scroll/keyboard/click）
  log && (log.textContent = 'pick: ' + e.detail?.context?.trigger + ' -> ' + (e.detail?.value ?? 'undefined'));
});
```

## API

### 属性 / 事件 / 方法

（临时移除以修复构建期解析问题，详见 `picker.backup.md`）

## 搜索与键盘快捷（暂缓渲染示例）

注：该段的示例暂时隐藏以规避构建期解析冲突，稍后以独立 Demo 形式提供。

## 主题与外观（暂缓渲染示例）

注：该段的示例暂时隐藏以规避构建期解析冲突。

## 触觉与音效（暂缓渲染示例）

注：该段的示例暂时隐藏以规避构建期解析冲突。


## CSS 变量（可覆盖）

```css
:host {
  /* 主色与文本 */
  --ldesign-picker-bg: #fff;
  --ldesign-picker-border: #e5e7eb;
  --ldesign-picker-text: #111827;
  --ldesign-picker-text-secondary: #9ca3af;
  /* 激活态 */
  --ldesign-picker-active-color: #1d4ed8;
  --ldesign-picker-active-bg: rgba(29, 78, 216, 0.06);
  /* 搜索 */
  --ldesign-picker-search-bg: #f9fafb;
  --ldesign-picker-search-border: #e5e7eb;
  /* 高亮 */
  --ldesign-picker-highlight-bg: #fef3c7;
  --ldesign-picker-highlight-color: #92400e;
  /* 圆角与动画 */
  --ldesign-picker-border-radius: 6px;
  --ldesign-picker-transition: 200ms cubic-bezier(0.22,0.61,0.36,1);
  /* 渐隐遮罩 */
  --ldesign-picker-mask-gradient-top: linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0));
  --ldesign-picker-mask-gradient-bottom: linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0));
  /* 3D */
  --ldesign-picker-3d-perspective: 500px;
  --ldesign-picker-3d-rotate: 25deg;
}
```

## 完整属性一览（补充）

```text
[Temporarily simplified listing]
属性与默认值同上“属性（Props）”，并补充：
- searchable: boolean (default: false)
- search-placeholder: string (default: “搜索选项...”)
- search-ignore-case, search-debounce, keyboard-quick-jump, highlight-match
- haptic-feedback, haptic-intensity, sound-effects, sound-volume, sound-url
- enable-3d, show-mask, theme
```

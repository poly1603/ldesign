# Picker 滚轮选择器

基于 `<ldesign-picker>` 的通用纵向滚轮选择器，支持 PC 鼠标滚轮、移动端手指滑动、边界阻力/回弹以及基于速度的惯性滚动，停止后自动吸附到最近项。

- 组件标签：`<ldesign-picker>`

<script setup>
import { ref, watch, onMounted } from 'vue'
// 基础用法示例：右侧 select 控制左侧 picker
const demoBasicVal = ref('01')
const pkBasicEl = ref()
function onPickerChange(e) { demoBasicVal.value = e?.detail?.value ?? demoBasicVal.value }
// 将 select 的值同步到 Web Component 的 prop（而不是 attribute），以确保触发组件内部的监听
onMounted(() => { if (pkBasicEl?.value) pkBasicEl.value.value = demoBasicVal.value })
watch(demoBasicVal, (v) => { if (pkBasicEl?.value) pkBasicEl.value.value = v })
</script>

## 基础用法

<div class="demo-container" style="display:flex; gap: 16px; align-items:flex-start;">
  <!-- 左：picker -->
  <ldesign-picker
    id="picker-basic"
    ref="pkBasicEl"
    :value="demoBasicVal"
    @ldesignChange="onPickerChange"
    visible-items="5"
    options='[{"value":"01","label":"选项 01"},{"value":"02","label":"选项 02"},{"value":"03","label":"选项 03"},{"value":"04","label":"选项 04"},{"value":"05","label":"选项 05"},{"value":"06","label":"选项 06"},{"value":"07","label":"选项 07"},{"value":"08","label":"选项 08"},{"value":"09","label":"选项 09"},{"value":"10","label":"选项 10"},{"value":"11","label":"选项 11"},{"value":"12","label":"选项 12"},{"value":"13","label":"选项 13"},{"value":"14","label":"选项 14"},{"value":"15","label":"选项 15"},{"value":"16","label":"选项 16"},{"value":"17","label":"选项 17"},{"value":"18","label":"选项 18"},{"value":"19","label":"选项 19"},{"value":"20","label":"选项 20"}]'
  ></ldesign-picker>

  <!-- 右：select，选择右侧即同步左侧的选中项 -->
  <select id="picker-basic-select" v-model="demoBasicVal" style="width: 120px;">
    <option value="01">选项 01</option>
    <option value="02">选项 02</option>
    <option value="03">选项 03</option>
    <option value="04">选项 04</option>
    <option value="05">选项 05</option>
    <option value="06">选项 06</option>
    <option value="07">选项 07</option>
    <option value="08">选项 08</option>
    <option value="09">选项 09</option>
    <option value="10">选项 10</option>
    <option value="11">选项 11</option>
    <option value="12">选项 12</option>
    <option value="13">选项 13</option>
    <option value="14">选项 14</option>
    <option value="15">选项 15</option>
    <option value="16">选项 16</option>
    <option value="17">选项 17</option>
    <option value="18">选项 18</option>
    <option value="19">选项 19</option>
    <option value="20">选项 20</option>
  </select>
</div>

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

<div class="demo-container" style="flex-direction: column; align-items: flex-start; gap: 8px;">
  <ldesign-picker id="picker-long" visible-items="5"></ldesign-picker>
</div>

```html
<ldesign-picker id="picker-long" visible-items="5"></ldesign-picker>
<script>
  const arr = Array.from({ length: 60 }, (_, i) => ({ value: String(i).padStart(2, '0'), label: String(i).padStart(2, '0') }));
  const el = document.getElementById('picker-long');
  el?.setAttribute('options', JSON.stringify(arr));
</script>
```

## 尺寸与可视高度

通过 `size` 控制行高，通过 `panel-height` 或 `visible-items` 控制可视高度。

<div class="demo-container" style="gap: 24px; align-items: flex-start;">
  <ldesign-picker
    size="small"
    options='[{"value":"1","label":"项 1"},{"value":"2","label":"项 2"},{"value":"3","label":"项 3"},{"value":"4","label":"项 4"},{"value":"5","label":"项 5"},{"value":"6","label":"项 6"},{"value":"7","label":"项 7"},{"value":"8","label":"项 8"},{"value":"9","label":"项 9"},{"value":"10","label":"项 10"}]'
  ></ldesign-picker>

  <ldesign-picker
    size="medium"
    visible-items="7"
    options='[{"value":"1","label":"项 1"},{"value":"2","label":"项 2"},{"value":"3","label":"项 3"},{"value":"4","label":"项 4"},{"value":"5","label":"项 5"},{"value":"6","label":"项 6"},{"value":"7","label":"项 7"},{"value":"8","label":"项 8"}]'
  ></ldesign-picker>

  <ldesign-picker
    size="large"
    panel-height="240"
    options='[{"value":"x","label":"X"},{"value":"y","label":"Y"},{"value":"z","label":"Z"}]'
  ></ldesign-picker>
</div>

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
<div class="demo-container" style="gap: 24px; align-items: flex-start; flex-wrap: wrap;">
  <div>
    <div style="margin-bottom: 8px; color:#666; font-size:13px;">轻手感</div>
    <ldesign-picker
      visible-items="5"
      options='[{"value":"1","label":"1"},{"value":"2","label":"2"},{"value":"3","label":"3"},{"value":"4","label":"4"},{"value":"5","label":"5"},{"value":"6","label":"6"}]'
      drag-follow="0.9"
      drag-smoothing="40"
      friction="0.99"
      resistance="0.6"
      max-overscroll-ratio="0.25"
      snap-duration="260"
    ></ldesign-picker>
  </div>
  <div>
    <div style="margin-bottom: 8px; color:#666; font-size:13px;">中手感</div>
    <ldesign-picker
      visible-items="5"
      options='[{"value":"A","label":"A"},{"value":"B","label":"B"},{"value":"C","label":"C"},{"value":"D","label":"D"},{"value":"E","label":"E"}]'
      drag-follow="0.8"
      drag-smoothing="80"
      friction="0.99"
      resistance="0.8"
      max-overscroll-ratio="0.5"
      snap-duration="300"
    ></ldesign-picker>
  </div>
  <div>
    <div style="margin-bottom: 8px; color:#666; font-size:13px;">重手感</div>
    <ldesign-picker
      visible-items="5"
      options='[{"value":"x","label":"x"},{"value":"y","label":"y"},{"value":"z","label":"z"},{"value":"w","label":"w"},{"value":"v","label":"v"}]'
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

<div class="demo-container" style="gap: 24px; align-items: flex-start;">
  <ldesign-picker
    visible-items="5"
    options='[{"value":"01","label":"01"},{"value":"02","label":"02"},{"value":"03","label":"03"},{"value":"04","label":"04"},{"value":"05","label":"05"}]'
    max-overscroll-ratio="0.5"
    snap-duration="320"
    resistance="0.8"
  ></ldesign-picker>
</div>

```html
<ldesign-picker max-overscroll-ratio="0.5" snap-duration="320" resistance="0.8" />
```

## 事件

- `ldesignChange`: 最终选中项变化（吸附后触发），detail: `{ value, option }`
- `ldesignPick`: 滚动/拖拽过程事件，detail: `{ value, option, context: { trigger } }`

<div class="demo-container" style="flex-direction: column; align-items: flex-start; gap: 8px;">
  <ldesign-picker id="picker-demo" options='[{"value":"a","label":"A"},{"value":"b","label":"B"},{"value":"c","label":"C"}]'></ldesign-picker>
  <div id="picker-log" style="min-height:22px;color:#666;font-size:13px;"></div>
</div>

```html
<ldesign-picker id="picker-demo" options='[{"value":"a","label":"A"},{"value":"b","label":"B"},{"value":"c","label":"C"}]'></ldesign-picker>
<div id="picker-log"></div>
<script>
  const pk = document.getElementById('picker-demo');
  const log = document.getElementById('picker-log');
  pk?.addEventListener('ldesignChange', (e) => {
    log && (log.textContent = 'change: ' + JSON.stringify(e.detail));
  });
  pk?.addEventListener('ldesignPick', (e) => {
    // 实时查看触发来源（wheel/touch/scroll/keyboard/click）
    log && (log.textContent = 'pick: ' + e.detail?.context?.trigger + ' -> ' + (e.detail?.value ?? 'undefined'));
  });
</script>
```

## API

### 属性（Props）

|| 属性 | 说明 | 类型 | 默认值 |
|| --- | --- | --- | --- |
|| options | 选项列表（可为 JSON 字符串或数组） | `string | { value: string; label: string; disabled?: boolean; }[]` | `[]` |
|| value | 当前值（受控） | `string` | - |
|| default-value | 默认值（非受控） | `string` | - |
|| disabled | 是否禁用 | `boolean` | `false` |
|| size | 行高尺寸 | `'small' | 'medium' | 'large'` | `medium` |
|| panel-height | 面板可视高度（像素） | `number` | - |
|| visible-items | 可视条目数（未设 panel-height 时生效） | `number` | `5` |
|| item-height | 行高（覆盖 size 推导） | `number` | - |
|| friction | 惯性摩擦（0-1，越小衰减越快；推荐 0.985~0.995 更接近原生） | `number` | `0.92` |
|| resistance | 边界阻力（0-1，越大越“松”；越小越“硬”） | `number` | `0.35` |
|| momentum | 是否启用惯性 | `boolean` | `true` |
|| max-overscroll | 最大橡皮筋越界（像素，优先级高于比例） | `number` | `-` |
|| max-overscroll-ratio | 最大橡皮筋越界比例（相对容器高度 0-1；未设置像素时生效） | `number` | `0.5` |
|| snap-duration | 吸附/回弹动画时长（毫秒；触摸/键盘/惯性） | `number` | `260` |
|| snap-duration-wheel | 滚轮吸附动画时长（毫秒） | `number` | `150` |
|| drag-follow | 手势拖拽跟随比例（0-1；越小阻力越大） | `number` | `1` |
|| drag-smoothing | 手势拖拽平滑时间常数（毫秒；>0 时启用一阶平滑） | `number` | `0` |

### 事件（Events）

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| ldesignChange | 最终选中项变化 | `(event: CustomEvent<{ value?: string; option?: any }>) => void` |
| ldesignPick | 滚动/拖拽过程事件 | `(event: CustomEvent<{ value?: string; option?: any; context: { trigger: string } }>) => void` |
# Picker 滚轮选择器

基于 `<ldesign-picker>` 的通用纵向滚轮选择器，支持 PC 鼠标滚轮、移动端手指滑动、边界阻力/回弹以及基于速度的惯性滚动，停止后自动吸附到最近项。

- 组件标签：`<ldesign-picker>`

## 基础用法

<div class="demo-container">
  <ldesign-picker
    visible-items="5"
    options='[{"value":"01","label":"选项 01"},{"value":"02","label":"选项 02"},{"value":"03","label":"选项 03"},{"value":"04","label":"选项 04"},{"value":"05","label":"选项 05"},{"value":"06","label":"选项 06"},{"value":"07","label":"选项 07"},{"value":"08","label":"选项 08"},{"value":"09","label":"选项 09"},{"value":"10","label":"选项 10"},{"value":"11","label":"选项 11"},{"value":"12","label":"选项 12"},{"value":"13","label":"选项 13"},{"value":"14","label":"选项 14"},{"value":"15","label":"选项 15"},{"value":"16","label":"选项 16"},{"value":"17","label":"选项 17"},{"value":"18","label":"选项 18"},{"value":"19","label":"选项 19"},{"value":"20","label":"选项 20"}]'
  ></ldesign-picker>
</div>

```html
<ldesign-picker
  visible-items="5"
  options='[{"value":"01","label":"选项 01"},{"value":"02","label":"选项 02"},{"value":"03","label":"选项 03"},{"value":"04","label":"选项 04"},{"value":"05","label":"选项 05"},{"value":"06","label":"选项 06"},{"value":"07","label":"选项 07"},{"value":"08","label":"选项 08"},{"value":"09","label":"选项 09"},{"value":"10","label":"选项 10"},{"value":"11","label":"选项 11"},{"value":"12","label":"选项 12"},{"value":"13","label":"选项 13"},{"value":"14","label":"选项 14"},{"value":"15","label":"选项 15"},{"value":"16","label":"选项 16"},{"value":"17","label":"选项 17"},{"value":"18","label":"选项 18"},{"value":"19","label":"选项 19"},{"value":"20","label":"选项 20"}]'
></ldesign-picker>
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

## 阻力与惯性

可以使用 `resistance` 和 `friction` 调整手感，或通过 `momentum` 关闭惯性。

<div class="demo-container" style="gap: 24px; align-items: flex-start;">
  <div>
    <div style="margin-bottom: 8px; color:#666; font-size:13px;">阻力更强（resistance=0.2）</div>
    <ldesign-picker
      resistance="0.2"
      options='[{"value":"a","label":"A"},{"value":"b","label":"B"},{"value":"c","label":"C"},{"value":"d","label":"D"},{"value":"e","label":"E"},{"value":"f","label":"F"}]'
    ></ldesign-picker>
  </div>
  <div>
    <div style="margin-bottom: 8px; color:#666; font-size:13px;">摩擦更大（friction=0.85）</div>
    <ldesign-picker
      friction="0.85"
      options='[{"value":"1","label":"1"},{"value":"2","label":"2"},{"value":"3","label":"3"},{"value":"4","label":"4"},{"value":"5","label":"5"}]'
    ></ldesign-picker>
  </div>
  <div>
    <div style="margin-bottom: 8px; color:#666; font-size:13px;">关闭惯性（momentum=false）</div>
    <ldesign-picker
      momentum="false"
      options='[{"value":"w","label":"W"},{"value":"x","label":"X"},{"value":"y","label":"Y"},{"value":"z","label":"Z"}]'
    ></ldesign-picker>
  </div>
</div>

```html
<ldesign-picker resistance="0.2" ... ></ldesign-picker>
<ldesign-picker friction="0.85" ... ></ldesign-picker>
<ldesign-picker momentum="false" ... ></ldesign-picker>
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

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| options | 选项列表（可为 JSON 字符串或数组） | `string | { value: string; label: string; disabled?: boolean; }[]` | `[]` |
| value | 当前值（受控） | `string` | - |
| default-value | 默认值（非受控） | `string` | - |
| disabled | 是否禁用 | `boolean` | `false` |
| size | 行高尺寸 | `'small' | 'medium' | 'large'` | `medium` |
| panel-height | 面板可视高度（像素） | `number` | - |
| visible-items | 可视条目数（未设 panel-height 时生效） | `number` | `5` |
| item-height | 行高（覆盖 size 推导） | `number` | - |
| friction | 惯性摩擦（0-1，越小衰减越快） | `number` | `0.92` |
| resistance | 边界阻力（0-1，越小阻力越大） | `number` | `0.35` |
| momentum | 是否启用惯性 | `boolean` | `true` |

### 事件（Events）

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| ldesignChange | 最终选中项变化 | `(event: CustomEvent<{ value?: string; option?: any }>) => void` |
| ldesignPick | 滚动/拖拽过程事件 | `(event: CustomEvent<{ value?: string; option?: any; context: { trigger: string } }>) => void` |
# Select 选择器

基于 `<ldesign-popup>` 封装的选择器，支持单选、多选，支持键盘导航与清空。

- 组件标签：`<ldesign-select>`
- 依赖：`<ldesign-popup>`

## 基础用法（单选）
<div class="demo-container">
  <ldesign-select id="sel-basic"></ldesign-select>
</div>

```html
<ldesign-select id="sel-basic"></ldesign-select>
<script>
  const options = [
    { value: 'beijing', label: '北京' },
    { value: 'shanghai', label: '上海' },
    { value: 'hangzhou', label: '杭州' },
  ];
  const sel = document.getElementById('sel-basic');
  sel.options = options;
  sel.addEventListener('ldesignChange', (e) => {
    console.log('change', e.detail);
  });
</script>
```

## 多选
<div class="demo-container">
  <ldesign-select id="sel-multi" multiple max-tag-count="2"></ldesign-select>
</div>

```html
<ldesign-select id="sel-multi" multiple max-tag-count="2"></ldesign-select>
<script>
  const options = [
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'svelte', label: 'Svelte' },
    { value: 'angular', label: 'Angular' },
  ];
  const sel = document.getElementById('sel-multi');
  sel.options = options;
  sel.defaultValue = ['react', 'vue'];
</script>
```

## 可清空
<div class="demo-container">
  <ldesign-select id="sel-clearable" clearable></ldesign-select>
</div>

```html
<ldesign-select id="sel-clearable" clearable></ldesign-select>
<script>
  const options = [
    { value: '1', label: '选项1' },
    { value: '2', label: '选项2' },
  ];
  document.getElementById('sel-clearable').options = options;
</script>
```

## 禁用
<div class="demo-container">
  <ldesign-select id="sel-disabled" disabled></ldesign-select>
</div>

```html
<ldesign-select id="sel-disabled" disabled></ldesign-select>
<script>
  const options = [
    { value: 'a', label: '不可用示例 A' },
    { value: 'b', label: '不可用示例 B' },
  ];
  document.getElementById('sel-disabled').options = options;
</script>
```

## 受控可见性（手动模式，可选）
<div class="demo-container" style="display:flex; gap: 8px; align-items:center;">
  <ldesign-button id="btn-open-select">打开/关闭</ldesign-button>
  <ldesign-select id="sel-manual" trigger="manual" visible></ldesign-select>
</div>

```html
<ldesign-button id="btn-open-select">打开/关闭</ldesign-button>
<ldesign-select id="sel-manual" trigger="manual" visible></ldesign-select>
<script>
  const options = [
    { value: 'x', label: 'X' },
    { value: 'y', label: 'Y' },
  ];
  const s = document.getElementById('sel-manual');
  s.options = options;
  document.getElementById('btn-open-select').addEventListener('click', () => {
    s.visible = !s.visible;
  });
</script>
```

## 键盘导航
- 打开后可使用 Up/Down 在选项间移动，高亮项会自动滚动到可见区域。
- Enter 选择/切换高亮项；Esc 关闭。
- 触发器上按 Enter/Space/ArrowDown 可打开。
- 多选时在触发器上按 Backspace 可删除最后一个标签。

## 属性（Props）
- options: SelectOption[] | string(JSON)
- value / default-value: 受控/默认选中值（单选 string，多选 string[]）
- multiple: 是否多选，默认 false
- placeholder: 占位文案，默认 “请选择”
- clearable: 是否可清空，默认 false
- max-tag-count: 多选时最多展示的标签数量
- trigger: 'click' | 'focus' | 'manual'（默认 click）
- placement: 浮层位置，默认 'bottom-start'
- theme: 'light' | 'dark'
- arrow: 是否显示箭头（默认 false）
- max-height: 列表最大高度，默认 240
- width: 列表宽度
- close-on-select: 选中后是否自动关闭（默认：单选 true，多选 false）
- visible: 受控可见性（仅 manual 有效）

## 事件（Events）
- ldesignChange: `{ value, options }`
- ldesignVisibleChange: boolean

> 下方为自动生成的属性/事件文档（构建后自动更新）。

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const basic = document.getElementById('sel-basic')
  if (basic) {
    const data = [
      { value: 'beijing', label: '北京' },
      { value: 'shanghai', label: '上海' },
      { value: 'hangzhou', label: '杭州' },
    ]
    basic.setAttribute('options', JSON.stringify(data))
  }

  const multi = document.getElementById('sel-multi')
  if (multi) {
    const data2 = [
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue' },
      { value: 'svelte', label: 'Svelte' },
      { value: 'angular', label: 'Angular' },
    ]
    multi.setAttribute('options', JSON.stringify(data2))
    multi.defaultValue = ['react', 'vue']
  }

  const clearable = document.getElementById('sel-clearable')
  if (clearable) {
    const data3 = [
      { value: '1', label: '选项1' },
      { value: '2', label: '选项2' },
    ]
    clearable.setAttribute('options', JSON.stringify(data3))
  }

  const dis = document.getElementById('sel-disabled')
  if (dis) {
    const data4 = [
      { value: 'a', label: '不可用示例 A' },
      { value: 'b', label: '不可用示例 B' },
    ]
    dis.setAttribute('options', JSON.stringify(data4))
  }

  const manual = document.getElementById('sel-manual')
  if (manual) {
    const data5 = [
      { value: 'x', label: 'X' },
      { value: 'y', label: 'Y' },
    ]
    manual.setAttribute('options', JSON.stringify(data5))
    const btn = document.getElementById('btn-open-select')
    if (btn) {
      btn.addEventListener('click', () => {
        manual.visible = !manual.visible
      })
    }
  }
})
</script>
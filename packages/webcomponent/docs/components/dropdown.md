# Dropdown 下拉菜单

简洁的下拉菜单，基于 `<ldesign-popup>` 封装，支持键盘导航、禁用项、分隔线，默认点击触发。

- 组件标签：`<ldesign-dropdown>`
- 依赖：`<ldesign-popup>`

## 基础用法
<div class="demo-container">
  <ldesign-dropdown id="dd-basic"></ldesign-dropdown>
</div>

```html
<ldesign-dropdown id="dd-basic"></ldesign-dropdown>
<script>
  const items = [
    { key: 'new', label: '新建' },
    { key: 'open', label: '打开' },
    { divider: true },
    { key: 'quit', label: '退出', icon: 'log-out' },
  ];
  const dd = document.getElementById('dd-basic');
  dd.items = items;
  dd.addEventListener('ldesignChange', (e) => {
    console.log('change', e.detail);
  });
</script>
```

> 默认会渲染一个触发器（显示当前选中项或“请选择”占位）。你也可以自定义触发器。

## 自定义触发器
<div class="demo-container">
  <ldesign-dropdown id="dd-custom">
    <ldesign-button slot="trigger">操作</ldesign-button>
  </ldesign-dropdown>
</div>

```html
<ldesign-dropdown id="dd-custom">
  <ldesign-button slot="trigger">操作</ldesign-button>
</ldesign-dropdown>
<script>
  const items = [
    { key: 'copy', label: '复制', icon: 'copy' },
    { key: 'cut', label: '剪切', icon: 'scissors' },
    { key: 'paste', label: '粘贴', icon: 'clipboard' },
  ];
  document.getElementById('dd-custom').items = items;
</script>
```

## 禁用与分隔线
<div class="demo-container">
  <ldesign-dropdown id="dd-disabled"></ldesign-dropdown>
</div>

```html
<ldesign-dropdown id="dd-disabled"></ldesign-dropdown>
<script>
  const items = [
    { key: 'a', label: '可用' },
    { key: 'b', label: '禁用', disabled: true },
    { divider: true },
    { key: 'c', label: '分隔后项' },
  ];
  document.getElementById('dd-disabled').items = items;
</script>
```

## 键盘导航
- 打开后可使用 Up/Down 在选项间移动，高亮项会自动滚动到可见区域。
- Enter 选择高亮项，Esc 关闭。

## 受控可见性（手动模式）
<div class="demo-container">
  <ldesign-button id="btn-open">打开</ldesign-button>
  <ldesign-dropdown id="dd-controlled" trigger="manual" visible>
    <ldesign-button slot="trigger">手动控制</ldesign-button>
  </ldesign-dropdown>
</div>

```html
<ldesign-button id="btn-open">打开</ldesign-button>
<ldesign-dropdown id="dd-controlled" trigger="manual" visible>
  <ldesign-button slot="trigger">手动控制</ldesign-button>
</ldesign-dropdown>
<script>
  const items = [
    { key: '1', label: '选项1' },
    { key: '2', label: '选项2' },
  ];
  const dd = document.getElementById('dd-controlled');
  dd.items = items;
  document.getElementById('btn-open').addEventListener('click', () => {
    dd.visible = !dd.visible;
  });
</script>
```

## 属性（Props）
- items: DropdownItem[] | string(JSON)
- value / default-value: 受控/默认选中值
- trigger: 'click' | 'hover' | 'focus' | 'contextmenu' | 'manual'
- placement: 浮层位置，默认 'bottom-start'
- theme: 'light' | 'dark'
- arrow: 是否显示箭头（默认 false）
- max-height: 列表最大高度，默认 240
- width: 列表宽度
- close-on-select: 选中后是否自动关闭，默认 true
- placeholder: 未选中时的占位文案

## 事件（Events）
- ldesignChange: `{ key, item }`
- ldesignVisibleChange: boolean

> 下方为自动生成的属性/事件文档（构建后自动更新）。

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const basic = document.getElementById('dd-basic')
  if (basic) {
    const data = [
      { key: 'new', label: '新建' },
      { key: 'open', label: '打开' },
      { divider: true },
      { key: 'quit', label: '退出', icon: 'log-out' },
    ]
    // 使用属性传值，保证在自定义元素升级前也能生效
    basic.setAttribute('items', JSON.stringify(data))
  }

  const custom = document.getElementById('dd-custom')
  if (custom) {
    const data2 = [
      { key: 'copy', label: '复制', icon: 'copy' },
      { key: 'cut', label: '剪切', icon: 'scissors' },
      { key: 'paste', label: '粘贴', icon: 'clipboard' },
    ]
    custom.setAttribute('items', JSON.stringify(data2))
  }

  const disabled = document.getElementById('dd-disabled')
  if (disabled) {
    const data3 = [
      { key: 'a', label: '可用' },
      { key: 'b', label: '禁用', disabled: true },
      { divider: true },
      { key: 'c', label: '分隔后项' },
    ]
    disabled.setAttribute('items', JSON.stringify(data3))
  }

  const controlled = document.getElementById('dd-controlled')
  if (controlled) {
    const data4 = [
      { key: '1', label: '选项1' },
      { key: '2', label: '选项2' },
    ]
    controlled.setAttribute('items', JSON.stringify(data4))

    const btn = document.getElementById('btn-open')
    if (btn) {
      btn.addEventListener('click', () => {
        controlled.visible = !controlled.visible
      })
    }
  }
})
</script>

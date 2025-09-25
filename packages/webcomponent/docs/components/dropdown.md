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

## 多层级下拉菜单
<div class="demo-container">
  <!-- hover 展开 -->
  <ldesign-dropdown id="dd-nested" placeholder="下拉菜单" placement="bottom-start" fit-trigger-width append-to="body">
    <ldesign-button slot="trigger">下拉菜单 ▾</ldesign-button>
  </ldesign-dropdown>
</div>

<div class="demo-container">
  <!-- click 展开子菜单 -->
  <ldesign-dropdown id="dd-nested-click" placeholder="点击展开子菜单" placement="bottom-start" submenu-trigger="click" append-to="body">
    <ldesign-button slot="trigger">点击展开 ▾</ldesign-button>
  </ldesign-dropdown>
</div>

```html
<ldesign-dropdown id="dd-nested" placeholder="下拉菜单" placement="bottom-start" fit-trigger-width append-to="body">
  <ldesign-button slot="trigger">下拉菜单 ▾</ldesign-button>
</ldesign-dropdown>
<ldesign-dropdown id="dd-nested-click" placeholder="点击展开子菜单" placement="bottom-start" submenu-trigger="click" append-to="body">
  <ldesign-button slot="trigger">点击展开 ▾</ldesign-button>
</ldesign-dropdown>
<script>
  const el = document.getElementById('dd-nested');
  el.items = [
    {
      key: 'opt1', label: '选项一',
      children: [
        {
          key: 'opt1-1', label: '选项一-1',
          children: [
            { key: 'opt1-1-1', label: '选项一-1-1' },
            { key: 'opt1-1-2', label: '选项一-1-2', disabled: true },
          ]
        },
        { key: 'opt1-2', label: '选项一-2' },
      ]
    },
    { key: 'opt2', label: '选项二' },
    { key: 'opt3', label: '选项三', children: [ { key: 'opt3-1', label: '选项三-1' } ] }
  ];
</script>
```

> 子菜单通过悬停展开，位置为右侧 `right-start`，层级不限。

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

## 更多增强示例
<div class="demo-container">
  <ldesign-dropdown id="dd-adv" placeholder="更多操作" fit-trigger-width>
    <ldesign-button slot="trigger">更多 ▾</ldesign-button>
  </ldesign-dropdown>
</div>

```html
<ldesign-dropdown id="dd-adv" placeholder="更多操作" fit-trigger-width>
  <ldesign-button slot="trigger">更多 ▾</ldesign-button>
</ldesign-dropdown>
<script>
  const el = document.getElementById('dd-adv');
  el.items = [
    { key: 'new', label: '新建', shortcut: 'Ctrl+N', icon: 'plus' },
    { key: 'open', label: '打开', shortcut: 'Ctrl+O', href: '/open' },
    { divider: true },
    { key: 'docs', label: '文档', description: '查看组件文档', href: 'https://example.com/docs', target: '_blank' },
    { key: 'delete', label: '删除', danger: true, closeOnSelect: false },
  ];
</script>
```

### 右键菜单（contextmenu）
<div class="demo-container">
  <ldesign-dropdown id="dd-ctx" trigger="contextmenu" placement="bottom-start">
    <span slot="trigger" style="display:inline-block;padding:8px 12px;border:1px dashed #ddd;border-radius:6px;">右键这里</span>
  </ldesign-dropdown>
</div>

```html
<ldesign-dropdown id="dd-ctx" trigger="contextmenu" placement="bottom-start">
  <span slot="trigger" style="display:inline-block;padding:8px 12px;border:1px dashed #ddd;border-radius:6px;">右键这里</span>
</ldesign-dropdown>
<script>
  const ctx = document.getElementById('dd-ctx');
  ctx.items = [
    { key: 'copy', label: '复制', shortcut: 'Ctrl+C' },
    { key: 'paste', label: '粘贴', shortcut: 'Ctrl+V', disabled: true },
    { divider: true },
    { key: 'inspect', label: '检查' },
  ];
</script>
```

## 键盘导航
- 打开后可使用 Up/Down 在选项间移动，高亮项会自动滚动到可见区域。
- Enter 选择高亮项，Esc 关闭。

## 受控可见性（手动模式）
<div class="demo-container">
  <ldesign-button id="btn-open">打开</ldesign-button>
  <ldesign-dropdown id="dd-controlled" trigger="manual">
    <ldesign-button slot="trigger">手动控制</ldesign-button>
  </ldesign-dropdown>
</div>

```html
<ldesign-button id="btn-open">打开</ldesign-button>
<ldesign-dropdown id="dd-controlled" trigger="manual">
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
- fit-trigger-width: 菜单宽度是否跟随触发器（默认 false）
- submenu-trigger: 子菜单触发方式 'hover' | 'click'（默认 'hover'）
- append-to: 浮层挂载位置 'self' | 'body' | 'closest-popup'（默认 'body'）
- close-on-select: 选中后是否自动关闭，默认 true
- placeholder: 未选中时的占位文案
- reflect-selection-on-trigger: 是否将选中项文本回填到默认触发器（默认 false）
- show-selected: 是否在菜单项上展示选中样式（默认 false）

### DropdownItem 字段
- key: string
- label: string
- icon?: string
- disabled?: boolean
- divider?: boolean
- children?: DropdownItem[]
- href?: string; target?: string
- description?: string
- shortcut?: string
- danger?: boolean
- closeOnSelect?: boolean（覆盖全局 close-on-select）

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

  // 多层级
  const nested = document.getElementById('dd-nested')
  if (nested) {
    const dataN = [
      {
        key: 'opt1', label: '选项一',
        children: [
          {
            key: 'opt1-1', label: '选项一-1',
            children: [
              { key: 'opt1-1-1', label: '选项一-1-1' },
              { key: 'opt1-1-2', label: '选项一-1-2', disabled: true },
            ]
          },
          { key: 'opt1-2', label: '选项一-2' },
        ]
      },
      { key: 'opt2', label: '选项二' },
      { key: 'opt3', label: '选项三', children: [ { key: 'opt3-1', label: '选项三-1' } ] }
    ]
    nested.setAttribute('items', JSON.stringify(dataN))
  }

  // 多层级（点击触发子菜单）
  const nestedClick = document.getElementById('dd-nested-click')
  if (nestedClick) {
    const dataNC = [
      {
        key: 'optA', label: '选项A',
        children: [
          { key: 'optA-1', label: '选项A-1' },
          { key: 'optA-2', label: '选项A-2', children: [ { key: 'optA-2-1', label: '选项A-2-1' } ] },
        ]
      },
      { key: 'optB', label: '选项B' }
    ]
    nestedClick.setAttribute('items', JSON.stringify(dataNC))
  }

  // 增强项：链接/快捷键/危险态/宽度适配
  const adv = document.getElementById('dd-adv')
  if (adv) {
    const dataA = [
      { key: 'new', label: '新建', shortcut: 'Ctrl+N', icon: 'plus' },
      { key: 'open', label: '打开', shortcut: 'Ctrl+O', href: '/open' },
      { divider: true },
      { key: 'docs', label: '文档', description: '查看组件文档', href: 'https://example.com/docs', target: '_blank' },
      { key: 'delete', label: '删除', danger: true, closeOnSelect: false },
    ]
    adv.setAttribute('items', JSON.stringify(dataA))
  }

  // 右键菜单
  const ctx = document.getElementById('dd-ctx')
  if (ctx) {
    const dataC = [
      { key: 'copy', label: '复制', shortcut: 'Ctrl+C' },
      { key: 'paste', label: '粘贴', shortcut: 'Ctrl+V', disabled: true },
      { divider: true },
      { key: 'inspect', label: '检查' },
    ]
    ctx.setAttribute('items', JSON.stringify(dataC))
  }
})
</script>

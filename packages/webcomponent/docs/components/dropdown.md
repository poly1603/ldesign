# Dropdown 下拉菜单（PC/移动端）

一个同时适配 PC 与移动端的下拉菜单：
- PC：级联子菜单（参考第一张图）
- 移动端：单列列表 + 选中对勾（参考第二张图，可自定义选中颜色）

组件标签：`<ldesign-dropdown>`，基于 `<ldesign-popup>` 实现。

## PC 基础用法（级联）
<div class="demo-container">
  <ldesign-dropdown id="dd-pc" variant="pc" placement="bottom-start">
    <ldesign-button slot="trigger">Cascading menu ▾</ldesign-button>
  </ldesign-dropdown>
</div>

```html
<ldesign-dropdown id="dd-pc" variant="pc" placement="bottom-start">
  <ldesign-button slot="trigger">Cascading menu ▾</ldesign-button>
</ldesign-dropdown>
<script>
  const nodes = [
    { type: 'group', title: 'Group title', children: [
      { key: '1', label: '1st menu item' },
      { key: '2', label: '2nd menu item' },
      { key: 'submenu', label: 'sub menu', children: [
        { key: '3', label: '3rd menu item' },
        { key: '4', label: '4th menu item' },
      ]}
    ]},
    { type: 'divider' },
    { key: 'disabled-sub', label: 'disabled sub menu', disabled: true, children: [ { key: 'x', label: 'x' } ] },
  ]
  document.getElementById('dd-pc').setAttribute('items', JSON.stringify(nodes))
</script>
```

## 移动端样式（单列 + 对勾）
<div class="demo-container">
  <ldesign-dropdown id="dd-mobile" variant="mobile" active-color="#F53F3F">
    <ldesign-button slot="trigger">全部商品 ▾</ldesign-button>
  </ldesign-dropdown>
</div>

```html
<ldesign-dropdown id="dd-mobile" variant="mobile" active-color="#F53F3F">
  <ldesign-button slot="trigger">全部商品 ▾</ldesign-button>
</ldesign-dropdown>
<script>
  const items = [
    { key: 'all', label: '全部商品' },
    { key: 'new', label: '新款商品' },
    { key: 'sale', label: '活动商品' },
  ]
  const el = document.getElementById('dd-mobile')
  el.setAttribute('items', JSON.stringify(items))
  el.value = 'all'
</script>
```

> 说明：移动端模式仅渲染第一层选项（组会被展开，子菜单在移动端不推荐）。点击选项右侧会显示红色对勾（可通过 `active-color` 改色）。

## 自适应（默认）
当 `variant="auto"`（默认）时，将根据指针类型和视口宽度自动判断，触屏/窄屏走移动端样式，其他情况走 PC 级联。

## 属性（Props）
- items: DropdownNode[] | string(JSON)
- value / default-value: 受控/默认选中值
- variant: 'auto' | 'pc' | 'mobile'（默认 auto）
- active-color: 移动端选中态颜色，默认 #F53F3F
- trigger: 'click' | 'hover' | 'focus' | 'contextmenu' | 'manual'（PC 使用）
- placement: 浮层位置，默认 'bottom-start'
- theme: 'light' | 'dark'
- arrow: 是否显示箭头
- max-height: 列表最大高度，默认 240
- width: 列表宽度；fit-trigger-width: 是否跟随触发器宽度
- submenu-trigger: 'hover' | 'click'（仅 PC 子菜单）
- append-to: 'self' | 'body' | 'closest-popup'
- close-on-select: 选中后是否自动关闭
- placeholder: 未选中时的占位文案；reflect-selection-on-trigger: 是否回填到触发器
- show-selected: 是否在 PC 菜单项上展示选中态

### DropdownNode 结构
- Item: `{ key, label, disabled?, children? }`
- Group: `{ type: 'group', title, children }`
- Divider: `{ type: 'divider' }`

## 事件（Events）
- ldesignChange: `{ key, item }`
- ldesignVisibleChange: boolean

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // PC 级联菜单示例
  const pcEl = document.getElementById('dd-pc')
  if (pcEl) {
    const nodes = [
      { type: 'group', title: 'Group title', children: [
        { key: '1', label: '1st menu item' },
        { key: '2', label: '2nd menu item' },
        { key: 'submenu', label: 'sub menu', children: [
          { key: '3', label: '3rd menu item' },
          { key: '4', label: '4th menu item' },
        ]}
      ]},
      { type: 'divider' },
      { key: 'disabled-sub', label: 'disabled sub menu', disabled: true, children: [ { key: 'x', label: 'x' } ] },
    ]
    pcEl.setAttribute('items', JSON.stringify(nodes))
  }

  // 移动端示例
  const mobileEl = document.getElementById('dd-mobile')
  if (mobileEl) {
    const items = [
      { key: 'all', label: '全部商品' },
      { key: 'new', label: '新款商品' },
      { key: 'sale', label: '活动商品' },
    ]
    mobileEl.setAttribute('items', JSON.stringify(items))
    mobileEl.value = 'all'
  }
})
</script>

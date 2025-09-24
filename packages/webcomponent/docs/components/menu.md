# Menu 菜单

仅演示纵向两种展开方式：内嵌展开（inline）与右侧弹出（flyout）。菜单外层统一限定一个宽度，便于在文档中展示。

> 组件标签：`<ldesign-menu>`，依赖 `<ldesign-popup>` 完成弹出定位。

## 基础属性（纵向）
- `items`: 菜单数据（数组或 JSON 字符串）
- `vertical-expand`: `inline | flyout`（本页示例仅用这两种），默认 `inline`
- `submenu-trigger`: `hover | click`，右侧弹出时可选触发方式，默认 `hover`
- `value` / `default-value`: 当前选中 key
- `open-keys` / `default-open-keys`: 展开项（仅 inline 下生效；mixed 也支持，但本页不演示）
- `accordion`: 手风琴（仅 inline 下生效），默认关闭
- `indent`: 子级缩进，默认 `16`
- `require-top-icon`: 一级是否强制占位图标（默认开启，保证左侧对齐）

---

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const inline = document.getElementById('menu-doc-inline')
  if (inline) {
    const data2 = [
      { key: 'inbox', label: '消息区', icon: 'mail' },
      { key: 'menu-1', label: '菜单1', icon: 'list', children: [
        { key: 'a1', label: '子菜单1-1', children: [
          { key: 'a1-1', label: '子菜单1-1-1', children: [
            { key: 'a1-1-1', label: '子菜单1-1-1-1' },
            { key: 'a1-1-2', label: '子菜单1-1-1-2' }
          ]},
          { key: 'a1-2', label: '子菜单1-1-2' }
        ]},
        { key: 'a2', label: '子菜单1-2' },
        { key: 'a3', label: '子菜单1-3' },
      ]},
      { key: 'menu-2', label: '菜单2', icon: 'layout-list', children: [
        { key: 'b1', label: '子菜单2-1', children: [
          { key: 'b1-1', label: '子菜单2-1-1' },
          { key: 'b1-2', label: '子菜单2-1-2', children: [
            { key: 'b1-2-1', label: '子菜单2-1-2-1' }
          ]}
        ]},
        { key: 'b2', label: '子菜单2-2' },
      ]},
      { key: 'profile', label: '个人中心', icon: 'user' },
      { key: 'video', label: '视频区', icon: 'play' },
    ]
    inline.setAttribute('items', JSON.stringify(data2))
  }

  const fly = document.getElementById('menu-doc-fly')
  if (fly) {
    const data3 = [
      { key: 'menu-1', label: '菜单1', icon: 'list', children: [
        { key: 'g1', label: '子菜单1-1', children: [
          { key: 'g1-1', label: '子菜单1-1-1', children: [
            { key: 'g1-1-1', label: '子菜单1-1-1-1' },
            { key: 'g1-1-2', label: '子菜单1-1-1-2' }
          ]},
          { key: 'g1-2', label: '子菜单1-1-2' }
        ]},
        { key: 'g2', label: '子菜单1-2' },
      ]},
      { key: 'menu-2', label: '菜单2', icon: 'layout-list', children: [
        { key: 'k1', label: '子菜单2-1', children: [
          { key: 'k1-1', label: '子菜单2-1-1' }
        ] }
      ]},
      { key: 'profile', label: '个人中心', icon: 'user' },
    ]
    fly.setAttribute('items', JSON.stringify(data3))
  }
})
</script>

## 纵向 inline（内嵌展开）
<div style="width: 280px; border:1px dashed #ddd; padding:8px; border-radius:6px;">
  <ldesign-menu id="menu-doc-inline" mode="vertical" vertical-expand="inline" default-open-keys='["menu-1"]' accordion></ldesign-menu>
</div>

```html
<div style="width: 280px; border:1px dashed #ddd; padding:8px; border-radius:6px;">
  <ldesign-menu id="menu-doc-inline" mode="vertical" vertical-expand="inline" default-open-keys='["menu-1"]' accordion></ldesign-menu>
</div>
<script>
  const items = [
    { key: 'inbox', label: '消息区', icon: 'mail' },
    { key: 'menu-1', label: '菜单1', icon: 'list', children: [
      { key: 'a1', label: '子菜单1-1' },
      { key: 'a2', label: '子菜单1-2' },
      { key: 'a3', label: '子菜单1-3' }
    ]},
    { key: 'menu-2', label: '菜单2', icon: 'layout-list', children: [
      { key: 'b1', label: '子菜单2-1' },
      { key: 'b2', label: '子菜单2-2' }
    ]}
  ];
  document.getElementById('menu-doc-inline').items = items;
</script>
```

## 纵向 flyout（右侧弹出）
<div style="width: 280px; border:1px dashed #ddd; padding:8px; border-radius:6px;">
  <ldesign-menu id="menu-doc-fly" mode="vertical" vertical-expand="flyout" submenu-trigger="hover"></ldesign-menu>
</div>

```html
<div style="width: 280px; border:1px dashed #ddd; padding:8px; border-radius:6px;">
  <ldesign-menu id="menu-doc-fly" mode="vertical" vertical-expand="flyout" submenu-trigger="hover"></ldesign-menu>
</div>
<script>
  const items = [
    { key: 'menu-1', label: '菜单1', icon: 'list', children: [
      { key: 'g1', label: '子菜单1-1', children: Array.from({length:6},(_,i)=>({key:'g1-'+i,label:'子菜单1-1-'+(i+1)})) },
      { key: 'g2', label: '子菜单1-2' }
    ]},
    { key: 'menu-2', label: '菜单2', icon: 'layout-list', children: [ { key: 'k1', label: '子菜单2-1' } ] }
  ];
  document.getElementById('menu-doc-fly').items = items;
</script>
```

> 混合（mixed）与横向模式已从本页移除，如需查看可参考组件 README 或历史版本。

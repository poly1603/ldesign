# Menu 菜单

多级导航菜单，支持横向、纵向、内嵌展开与右侧弹出，并提供横向自动溢出“更多”。

> 组件标签：`<ldesign-menu>`，依赖 `<ldesign-popup>` 进行弹出定位。

## 基础属性
- `items`: 菜单数据（数组或 JSON 字符串）
- `mode`: `horizontal | vertical`，默认 `vertical`
- `vertical-expand`: `inline | flyout | mixed`，默认 `inline`
- `submenu-trigger`: `hover | click`，默认 `hover`
- `value` / `default-value`: 当前选中 key
- `open-keys` / `default-open-keys`: 展开项（仅 inline/mixed 下生效）
- `accordion`: 手风琴（仅 inline/mixed 下生效）
- `indent`: 子级缩进，默认 `16`
- `more-label`: 横向溢出“更多”文案，默认“更多”

## 事件
- `ldesignSelect`: 选中项变化，`{ key, item, pathKeys }`
- `ldesignOpenChange`: 展开/收起变化（仅 inline/mixed），`{ key, open, openKeys }`
- `ldesignOverflowChange`: 横向模式溢出数量变化，`{ overflowCount }`

---

## 横向模式（含溢出“更多”）
<div class="demo-container" style="border:1px dashed #ddd;padding:8px;max-width:520px;">
  <ldesign-menu id="menu-doc-horizontal" mode="horizontal"></ldesign-menu>
</div>

```html
<div style="max-width: 520px; border:1px dashed #ddd; padding:8px;">
  <ldesign-menu id="menu-doc-horizontal" mode="horizontal"></ldesign-menu>
</div>
<script>
  const items = [
    { key: 'inbox', label: '消息区', icon: 'mail' },
    { key: 'menu-1', label: '菜单1', icon: 'list' },
    { key: 'menu-2', label: '菜单2', icon: 'layout-list', children: [
      { key: 'm2-1', label: '子菜单2-1', children: [
        { key: 'm2-1-1', label: '子菜单2-1-1' },
        { key: 'm2-1-2', label: '子菜单2-1-2', children: [
          { key: 'm2-1-2-1', label: '子菜单2-1-2-1' },
          { key: 'm2-1-2-2', label: '子菜单2-1-2-2' }
        ] }
      ] },
      { key: 'm2-2', label: '子菜单2-2' }
    ]},
    { key: 'profile', label: '个人中心', icon: 'user' },
    { key: 'video', label: '视频区', icon: 'play-circle' },
    { key: 'editor', label: '资源编辑', icon: 'pen-tool' }
  ];
  document.getElementById('menu-doc-horizontal').items = items;
</script>
```

当容器宽度不足时，多余的顶级菜单会自动收纳到“更多”。

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const horizontal = document.getElementById('menu-doc-horizontal')
  if (horizontal) {
    const data = [
      { key: 'inbox', label: '消息区', icon: 'mail' },
      { key: 'menu-1', label: '菜单1', icon: 'list' },
      { key: 'menu-2', label: '菜单2', icon: 'layout-list', children: [
        { key: 'm2-1', label: '子菜单2-1', children: [
          { key: 'm2-1-1', label: '子菜单2-1-1' },
          { key: 'm2-1-2', label: '子菜单2-1-2', children: [
            { key: 'm2-1-2-1', label: '子菜单2-1-2-1' },
            { key: 'm2-1-2-2', label: '子菜单2-1-2-2' },
          ] },
        ] },
        { key: 'm2-2', label: '子菜单2-2' },
      ]},
      { key: 'profile', label: '个人中心', icon: 'user' },
      { key: 'video', label: '视频区', icon: 'play-circle' },
      { key: 'editor', label: '资源编辑', icon: 'pen-tool' },
    ]
    // 使用属性传值以保证在自定义元素升级前也能生效
    horizontal.setAttribute('items', JSON.stringify(data))
  }

  const inline = document.getElementById('menu-doc-inline')
  if (inline) {
    const data2 = [
      { key: 'menu-1', label: '二级菜单', children: [
        { key: 'a1', label: '二级菜单内容' },
        { key: 'a2', label: '二级菜单内容' },
        { key: 'a3', label: '二级菜单内容' },
      ]},
      { key: 'menu-2', label: '二级菜单', children: [
        { key: 'b1', label: '二级菜单内容' },
        { key: 'b2', label: '二级菜单内容' },
      ]},
      { key: 'profile', label: '个人中心', icon: 'user' },
      { key: 'video', label: '视频区', icon: 'play' },
    ]
    inline.setAttribute('items', JSON.stringify(data2))
  }

  const fly = document.getElementById('menu-doc-fly')
  if (fly) {
    const data3 = [
      { key: 'catalog', label: '菜单1', children: [
        { key: 'g1', label: '子菜单1-1', children: Array.from({length:8},(_,i)=>({key:'g1-'+i,label:'子菜单1-1-'+(i+1)})) },
        { key: 'g2', label: '子菜单1-2' },
      ]},
      { key: 'profile', label: '个人中心', icon: 'user' },
      { key: 'video', label: '视频区', icon: 'play' },
    ]
    fly.setAttribute('items', JSON.stringify(data3))
  }

  const mixed = document.getElementById('menu-doc-mixed')
  if (mixed) {
    const data4 = [
      { key: 'menu-1', label: '一级菜单', children: [
        { key: 'm11', label: '子菜单1-1', children: [
          { key: 'm111', label: '子菜单1-1-1' },
          { key: 'm112', label: '子菜单1-1-2' },
        ]},
        { key: 'm12', label: '子菜单1-2' },
      ]},
      { key: 'menu-2', label: '一级菜单2', children: [ { key: 'm21', label: '子菜单2-1' } ] },
    ]
    mixed.setAttribute('items', JSON.stringify(data4))
  }
})
</script>

## 纵向 inline（内嵌展开）
<ldesign-menu id="menu-doc-inline" mode="vertical" vertical-expand="inline"
              accordion default-open-keys='["menu-1"]'></ldesign-menu>

```html
<ldesign-menu id="menu-doc-inline" mode="vertical" vertical-expand="inline" accordion default-open-keys='["menu-1"]'></ldesign-menu>
<script>
  const items = [
    { key: 'menu-1', label: '二级菜单', children: [
      { key: 'a1', label: '二级菜单内容' },
      { key: 'a2', label: '二级菜单内容' },
      { key: 'a3', label: '二级菜单内容' }
    ]},
    { key: 'menu-2', label: '二级菜单', children: [
      { key: 'b1', label: '二级菜单内容' },
      { key: 'b2', label: '二级菜单内容' }
    ]},
    { key: 'profile', label: '个人中心', icon: 'user' },
    { key: 'video', label: '视频区', icon: 'play' }
  ];
  document.getElementById('menu-doc-inline').items = items;
</script>
```

## 纵向 flyout（右侧弹出）
<ldesign-menu id="menu-doc-fly" mode="vertical" vertical-expand="flyout" submenu-trigger="hover"></ldesign-menu>

```html
<ldesign-menu id="menu-doc-fly" mode="vertical" vertical-expand="flyout" submenu-trigger="hover"></ldesign-menu>
<script>
  const items = [
    { key: 'catalog', label: '菜单1', children: [
      { key: 'g1', label: '子菜单1-1', children: Array.from({length:8},(_,i)=>({key:'g1-'+i,label:'子菜单1-1-'+(i+1)})) },
      { key: 'g2', label: '子菜单1-2' }
    ]},
    { key: 'profile', label: '个人中心', icon: 'user' },
    { key: 'video', label: '视频区', icon: 'play' }
  ];
  document.getElementById('menu-doc-fly').items = items;
</script>
```

## 纵向 mixed（第一层展开，其余层级右弹）
<ldesign-menu id="menu-doc-mixed" mode="vertical" vertical-expand="mixed" default-open-keys='["menu-1"]'></ldesign-menu>

```html
<ldesign-menu id="menu-doc-mixed" mode="vertical" vertical-expand="mixed" default-open-keys='["menu-1"]'></ldesign-menu>
<script>
  const items = [
    { key: 'menu-1', label: '一级菜单', children: [
      { key: 'm11', label: '子菜单1-1', children: [
        { key: 'm111', label: '子菜单1-1-1' },
        { key: 'm112', label: '子菜单1-1-2' }
      ]},
      { key: 'm12', label: '子菜单1-2' }
    ]},
    { key: 'menu-2', label: '一级菜单2', children: [ { key: 'm21', label: '子菜单2-1' } ] }
  ];
  document.getElementById('menu-doc-mixed').items = items;
</script>
```

## 监听事件
```html
<ldesign-menu id="menu-doc-events" mode="horizontal"></ldesign-menu>
<script>
  const items = [ { key: 'home', label: '首页' }, { key: 'docs', label: '文档', children: [{key:'d1',label:'快速上手'}] } ];
  const m = document.getElementById('menu-doc-events');
  m.items = items;
  m.addEventListener('ldesignSelect', e => console.log('select', e.detail));
  m.addEventListener('ldesignOpenChange', e => console.log('open change', e.detail));
  m.addEventListener('ldesignOverflowChange', e => console.log('overflow', e.detail));
</script>
```

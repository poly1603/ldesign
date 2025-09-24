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
    // 构建下拉选项并与左侧联动
    const sel = document.getElementById('menu-doc-inline-select')
    if (sel) {
      const flatten = (list, prefix=[]) => {
        const out = []
        list.forEach(it => {
          const text = [...prefix, it.label].join(' / ')
          out.push({ key: it.key, text })
          if (it.children) out.push(...flatten(it.children, [...prefix, it.label]))
        })
        return out
      }
      const opts = flatten(data2)
      opts.forEach(o => {
        const op = document.createElement('option')
        op.value = o.key; op.textContent = o.text
        sel.appendChild(op)
      })
      sel.addEventListener('change', () => {
        if (sel.value) inline.setAttribute('value', sel.value)
      })
      inline.addEventListener('ldesignSelect', (e) => {
        sel.value = e.detail?.key || ''
      })
    }
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
    // 右侧选择器
    const selFly = document.getElementById('menu-doc-fly-select')
    if (selFly) {
      const flatten = (list, prefix=[]) => {
        const out = []
        list.forEach(it => {
          const text = [...prefix, it.label].join(' / ')
          out.push({ key: it.key, text })
          if (it.children) out.push(...flatten(it.children, [...prefix, it.label]))
        })
        return out
      }
      const opts = flatten(data3)
      opts.forEach(o => {
        const op = document.createElement('option')
        op.value = o.key; op.textContent = o.text
        selFly.appendChild(op)
      })
      selFly.addEventListener('change', () => {
        if (selFly.value) fly.setAttribute('value', selFly.value)
      })
      fly.addEventListener('ldesignSelect', (e) => {
        selFly.value = e.detail?.key || ''
      })
    }
  }

  const collapsed = document.getElementById('menu-doc-collapsed')
  if (collapsed) {
    const dataC = [
      {
        key: 'catalog', label: '目录', icon: 'menu', children: [
          { key: 'c1', label: '子菜单1-1', children: [
            { key: 'c11', label: '子菜单1-1-1', children: [
              { key: 'c111', label: '子菜单1-1-1-1' },
              { key: 'c112', label: '子菜单1-1-1-2' },
              { key: 'c113', label: '子菜单1-1-1-3' },
            ]},
            { key: 'c12', label: '子菜单1-1-2' },
            { key: 'c13', label: '子菜单1-1-3' },
          ]},
          { key: 'c2', label: '子菜单1-2', children: new Array(6).fill(0).map((_,i)=>({ key:`c2-${i+1}`, label:`子菜单1-2-${i+1}` })) },
        ]
      },
      { key: 'dashboard', label: '仪表盘', icon: 'layout-dashboard' },
      { key: 'report', label: '报表', icon: 'bar-chart-2', children: [
        { key: 'r1', label: '销售报表' },
        { key: 'r2', label: '库存报表', children: [
          { key: 'r21', label: '季度' },
          { key: 'r22', label: '年度' },
        ]}
      ]},
      { key: 'profile', label: '个人中心', icon: 'user' }
    ]
    collapsed.setAttribute('items', JSON.stringify(dataC))

    const selC = document.getElementById('menu-doc-collapsed-select')
    if (selC) {
      const flatten = (list, prefix=[]) => {
        const out = []
        list.forEach(it => {
          const text = [...prefix, it.label].join(' / ')
          out.push({ key: it.key, text })
          if (it.children) out.push(...flatten(it.children, [...prefix, it.label]))
        })
        return out
      }
      const opts = flatten(dataC)
      opts.forEach(o => {
        const op = document.createElement('option')
        op.value = o.key; op.textContent = o.text
        selC.appendChild(op)
      })
      selC.addEventListener('change', () => {
        if (selC.value) collapsed.setAttribute('value', selC.value)
      })
      collapsed.addEventListener('ldesignSelect', (e) => {
        selC.value = e.detail?.key || ''
      })
    }
  }
  // 横向菜单示例（hover/click 两种触发）
  const hzHover = document.getElementById('menu-doc-hz-hover')
  const hzClick = document.getElementById('menu-doc-hz-click')
  if (hzHover || hzClick) {
    const menuData = [
      { key: 'home', label: '首页', icon: 'home' },
      {
        key: 'products', label: '产品', icon: 'package', children: [
          {
            key: 'software', label: '软件产品', children: [
              { key: 'desktop', label: '桌面软件', children: [
                { key: 'windows', label: 'Windows 应用' },
                { key: 'mac', label: 'Mac 应用' },
                { key: 'linux', label: 'Linux 应用' }
              ] },
              { key: 'mobile', label: '移动应用', children: [
                { key: 'ios', label: 'iOS 应用' },
                { key: 'android', label: 'Android 应用' }
              ] },
              { key: 'web', label: 'Web 应用' }
            ]
          },
          {
            key: 'hardware', label: '硬件产品', children: [
              { key: 'laptop', label: '笔记本电脑' },
              { key: 'tablet', label: '平板电脑' },
              { key: 'phone', label: '智能手机' }
            ]
          },
          { key: 'cloud', label: '云服务' }
        ]
      },
      {
        key: 'services', label: '服务', icon: 'server', children: [
          { key: 'consulting', label: '咨询服务', children: [
            { key: 'tech-consulting', label: '技术咨询' },
            { key: 'business-consulting', label: '业务咨询' }
          ] },
          { key: 'support', label: '技术支持', children: [
            { key: 'standard', label: '标准支持' },
            { key: 'premium', label: '高级支持' },
            { key: 'enterprise', label: '企业支持' }
          ] },
          { key: 'training', label: '培训服务' }
        ]
      },
      {
        key: 'resources', label: '资源', icon: 'book-open', children: [
          { key: 'docs', label: '文档中心' },
          { key: 'blog', label: '技术博客' },
          { key: 'community', label: '社区论坛' },
          { key: 'downloads', label: '下载中心' }
        ]
      },
      { key: 'about', label: '关于', icon: 'info-circle' }
    ]
    if (hzHover) hzHover.setAttribute('items', JSON.stringify(menuData))
    if (hzClick) hzClick.setAttribute('items', JSON.stringify(menuData))
  }
})
</script>

## 横向 horizontal

<div style="background:#f5f5f5; padding:12px; border-radius:8px; margin-bottom: 24px;">
  <div style="background:white; padding:10px; border-radius:6px; margin-bottom:12px;">
    <div style="font-size:14px; color:#666; margin-bottom:8px;">Hover 触发</div>
    <ldesign-menu id="menu-doc-hz-hover" mode="horizontal" submenu-trigger="hover"></ldesign-menu>
  </div>
  <div style="background:white; padding:10px; border-radius:6px;">
    <div style="font-size:14px; color:#666; margin-bottom:8px;">Click 触发</div>
    <ldesign-menu id="menu-doc-hz-click" mode="horizontal" submenu-trigger="click"></ldesign-menu>
  </div>
</div>

```html
<div style="padding:10px; border:1px dashed #ddd; border-radius:6px;">
  <ldesign-menu mode="horizontal" submenu-trigger="hover"></ldesign-menu>
</div>
<script>
  const items = [
    { key: 'home', label: '首页', icon: 'home' },
    { key: 'products', label: '产品', children: [
      { key: 'software', label: '软件产品', children: [
        { key: 'desktop', label: '桌面软件' },
        { key: 'mobile', label: '移动应用' },
        { key: 'web', label: 'Web 应用' }
      ] },
      { key: 'hardware', label: '硬件产品' },
      { key: 'cloud', label: '云服务' }
    ] },
    { key: 'services', label: '服务', children: [
      { key: 'consulting', label: '咨询服务' },
      { key: 'support', label: '技术支持' }
    ] },
    { key: 'about', label: '关于' }
  ];
  const menu = document.querySelector('ldesign-menu[mode="horizontal"]');
  menu.items = items;
</script>
```

## 纵向 inline（内嵌展开）
<div style="display:flex; gap:16px; align-items:flex-start;">
  <div style="width: 280px; border:1px dashed #ddd; padding:8px; border-radius:6px;">
    <ldesign-menu id="menu-doc-inline" mode="vertical" vertical-expand="inline" default-open-keys='["menu-1"]' accordion></ldesign-menu>
  </div>
  <div style="min-width:320px;">
    <div style="font-size:14px; color:#555; margin:4px 0 6px;">当前选中子菜单</div>
    <select id="menu-doc-inline-select" style="width:100%; padding:6px 8px; border:1px solid #ddd; border-radius:6px;">
      <option value="" selected>— 请选择 —</option>
    </select>
  </div>
</div>

```html
<div style="display:flex; gap:16px; align-items:flex-start;">
  <div style="width: 280px; border:1px dashed #ddd; padding:8px; border-radius:6px;">
    <ldesign-menu id="menu-doc-inline" mode="vertical" vertical-expand="inline" default-open-keys='["menu-1"]' accordion></ldesign-menu>
  </div>
  <div style="min-width:320px;">
    <div style="font-size:14px; color:#555; margin:4px 0 6px;">当前选中子菜单</div>
    <select id="menu-doc-inline-select" style="width:100%; padding:6px 8px; border:1px solid #ddd; border-radius:6px;">
      <option value="" selected>— 请选择 —</option>
    </select>
  </div>
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
  const menu = document.getElementById('menu-doc-inline');
  menu.items = items;
  const sel = document.getElementById('menu-doc-inline-select');
  const flatten = (list, prefix=[]) => {
    const out = [];
    list.forEach(it => {
      const text = [...prefix, it.label].join(' / ');
      out.push({ key: it.key, text });
      if (it.children) out.push(...flatten(it.children, [...prefix, it.label]));
    });
    return out;
  };
  const opts = flatten(items);
  opts.forEach(o => {
    const op = document.createElement('option');
    op.value = o.key; op.textContent = o.text; sel.appendChild(op);
  });
  sel.addEventListener('change', () => {
    if (sel.value) menu.value = sel.value; // 触发自动展开并选中
  });
  // 同步：左侧点击选中时，右侧下拉框也显示当前项
  menu.addEventListener('ldesignSelect', (e) => {
    sel.value = e.detail.key || '';
  });
</script>
```

## 纵向 flyout（右侧弹出）
<div style="display:flex; gap:16px; align-items:flex-start;">
  <div style="width: 280px; border:1px dashed #ddd; padding:8px; border-radius:6px;">
    <ldesign-menu id="menu-doc-fly" mode="vertical" vertical-expand="flyout" submenu-trigger="hover"></ldesign-menu>
  </div>
  <div style="min-width:320px;">
    <div style="font-size:14px; color:#555; margin:4px 0 6px;">当前选中子菜单</div>
    <select id="menu-doc-fly-select" style="width:100%; padding:6px 8px; border:1px solid #ddd; border-radius:6px;">
      <option value="" selected>— 请选择 —</option>
    </select>
  </div>
</div>

```html
<div style="display:flex; gap:16px; align-items:flex-start;">
  <div style="width: 280px; border:1px dashed #ddd; padding:8px; border-radius:6px;">
    <ldesign-menu id="menu-doc-fly" mode="vertical" vertical-expand="flyout" submenu-trigger="hover"></ldesign-menu>
  </div>
  <div style="min-width:320px;">
    <div style="font-size:14px; color:#555; margin:4px 0 6px;">当前选中子菜单</div>
    <select id="menu-doc-fly-select" style="width:100%; padding:6px 8px; border:1px solid #ddd; border-radius:6px;">
      <option value="" selected>— 请选择 —</option>
    </select>
  </div>
</div>
<script>
  const items = [
    { key: 'menu-1', label: '菜单1', icon: 'list', children: [
      { key: 'g1', label: '子菜单1-1', children: [
        { key: 'g1-1', label: '子菜单1-1-1', children: [
          { key: 'g1-1-1', label: '子菜单1-1-1-1' },
          { key: 'g1-1-2', label: '子菜单1-1-1-2' }
        ] },
        { key: 'g1-2', label: '子菜单1-1-2' }
      ] },
      { key: 'g2', label: '子菜单1-2' }
    ] },
    { key: 'menu-2', label: '菜单2', icon: 'layout-list', children: [ { key: 'k1', label: '子菜单2-1', children: [ { key: 'k1-1', label: '子菜单2-1-1' } ] } ] }
  ];
  const menu = document.getElementById('menu-doc-fly');
  menu.items = items;
  const sel = document.getElementById('menu-doc-fly-select');
  const flatten = (list, prefix=[]) => {
    const out = [];
    list.forEach(it => {
      const text = [...prefix, it.label].join(' / ');
      out.push({ key: it.key, text });
      if (it.children) out.push(...flatten(it.children, [...prefix, it.label]));
    });
    return out;
  };
  const opts = flatten(items);
  opts.forEach(o => {
    const op = document.createElement('option');
    op.value = o.key; op.textContent = o.text; sel.appendChild(op);
  });
  sel.addEventListener('change', () => {
    if (sel.value) menu.value = sel.value;
  });
  menu.addEventListener('ldesignSelect', (e) => {
    sel.value = e.detail.key || '';
  });
</script>
```

## 纵向 collapse（折叠，仅图标，右侧弹出）
<div style="display:flex; gap:16px; align-items:flex-start;">
  <div style="width: 72px; border:1px dashed #ddd; padding:8px; border-radius:6px;">
    <ldesign-menu id="menu-doc-collapsed" mode="vertical" collapse submenu-trigger="hover"></ldesign-menu>
  </div>
  <div style="min-width:320px;">
    <div style="font-size:14px; color:#555; margin:4px 0 6px;">当前选中子菜单</div>
    <select id="menu-doc-collapsed-select" style="width:100%; padding:6px 8px; border:1px solid #ddd; border-radius:6px;">
      <option value="" selected>— 请选择 —</option>
    </select>
    <div style="margin-top:8px; color:#666; font-size:13px;">提示：折叠时一级只显示图标；没有子级的一级项悬停会显示右侧 Tooltip。</div>
  </div>
</div>

```html
<div style="display:flex; gap:16px; align-items:flex-start;">
  <div style="width: 72px; border:1px dashed #ddd; padding:8px; border-radius:6px;">
    <ldesign-menu id="menu-doc-collapsed" mode="vertical" collapse submenu-trigger="hover"></ldesign-menu>
  </div>
  <div style="min-width:320px;">
    <div style="font-size:14px; color:#555; margin:4px 0 6px;">当前选中子菜单</div>
    <select id="menu-doc-collapsed-select" style="width:100%; padding:6px 8px; border:1px solid #ddd; border-radius:6px;">
      <option value="" selected>— 请选择 —</option>
    </select>
  </div>
</div>
<script>
  const items = [
    { key: 'catalog', label: '目录', icon: 'menu', children: [
      { key: 'c1', label: '子菜单1-1', children: [
        { key: 'c11', label: '子菜单1-1-1', children: [
          { key: 'c111', label: '子菜单1-1-1-1' },
          { key: 'c112', label: '子菜单1-1-1-2' }
        ]},
        { key: 'c12', label: '子菜单1-1-2' }
      ]},
      { key: 'c2', label: '子菜单1-2' }
    ]},
    { key: 'dashboard', label: '仪表盘', icon: 'layout-dashboard' },
    { key: 'profile', label: '个人中心', icon: 'user' }
  ];
  const menu = document.getElementById('menu-doc-collapsed');
  menu.items = items;
</script>
```

> 混合（mixed）暂未在本页展示；横向模式示例见本页上方。

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
- `top-level-exclusive`: 纵向模式下“顶层互斥展开”（一级只保留一个展开），默认 `true`。不影响子级是否手风琴（由 `accordion` 控制）。

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

  // 纵向：顶层互斥（演示默认开启与关闭）
  const inlineExclusive = document.getElementById('menu-doc-inline-exclusive')
  const inlineMulti = document.getElementById('menu-doc-inline-multi')
  if (inlineExclusive || inlineMulti) {
    const topData = [
      { key: 't1', label: '设置', children: [
        { key: 't11', label: '通用' },
        { key: 't12', label: '隐私' }
      ]},
      { key: 't2', label: '管理', children: [
        { key: 't21', label: '用户' },
        { key: 't22', label: '角色' }
      ]}
    ]
    if (inlineExclusive) inlineExclusive.setAttribute('items', JSON.stringify(topData))
    if (inlineMulti) inlineMulti.setAttribute('items', JSON.stringify(topData))
  }

  // 纵向 flyout：顶层互斥（hover/click 对照）
  const flyExHover = document.getElementById('menu-doc-fly-ex-hover')
  const flyExClick = document.getElementById('menu-doc-fly-ex-click')
  const flyMultiHover = document.getElementById('menu-doc-fly-multi-hover')
  const flyMultiClick = document.getElementById('menu-doc-fly-multi-click')
  if (flyExHover || flyExClick || flyMultiHover || flyMultiClick) {
    const fxData = [
      { key: 'f1', label: '目录', children: [
        { key: 'f11', label: '一级-1', children: [
          { key: 'f111', label: '二级-1-1' },
          { key: 'f112', label: '二级-1-2' }
        ]}
      ]},
      { key: 'f2', label: '管理', children: [
        { key: 'f21', label: '成员' },
        { key: 'f22', label: '权限' },
        { key: 'f23', label: '设置', children: [ { key: 'f231', label: '通知' } ] }
      ]},
      { key: 'f3', label: '报表', children: [
        { key: 'f31', label: '销售' },
        { key: 'f32', label: '库存' }
      ]}
    ]
    if (flyExHover) flyExHover.setAttribute('items', JSON.stringify(fxData))
    if (flyExClick) flyExClick.setAttribute('items', JSON.stringify(fxData))
    if (flyMultiHover) flyMultiHover.setAttribute('items', JSON.stringify(fxData))
    if (flyMultiClick) flyMultiClick.setAttribute('items', JSON.stringify(fxData))
  }

  // 横向 - 溢出（更多）
  const hzOverflowHover = document.getElementById('menu-doc-hz-overflow-hover')
  const hzOverflowClick = document.getElementById('menu-doc-hz-overflow-click')
  if (hzOverflowHover || hzOverflowClick) {
    const longItems = [
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
      { key: 'solutions', label: '解决方案', children: [
        { key: 'retail', label: '零售' },
        { key: 'finance', label: '金融' },
        { key: 'manufacturing', label: '制造' }
      ] },
      { key: 'resources', label: '资源', children: [
        { key: 'docs', label: '文档中心' },
        { key: 'blog', label: '技术博客' },
        { key: 'community', label: '社区论坛' },
        { key: 'downloads', label: '下载中心' }
      ] },
      { key: 'pricing', label: '定价' },
      { key: 'partners', label: '合作伙伴' },
      { key: 'about', label: '关于' }
    ]
    if (hzOverflowHover) {
      hzOverflowHover.setAttribute('items', JSON.stringify(longItems))
      const c = document.getElementById('menu-doc-hz-overflow-hover-count')
      hzOverflowHover.addEventListener('ldesignOverflowChange', (e) => {
        if (c) c.textContent = String(e.detail?.overflowCount || 0)
      })
    }
    if (hzOverflowClick) {
      hzOverflowClick.setAttribute('items', JSON.stringify(longItems))
      const c2 = document.getElementById('menu-doc-hz-overflow-click-count')
      hzOverflowClick.addEventListener('ldesignOverflowChange', (e) => {
        if (c2) c2.textContent = String(e.detail?.overflowCount || 0)
      })
    }
  }

  // 横向 - 溢出实时演示（滑块控制容器宽度）
  const liveRange = document.getElementById('menu-doc-hz-overflow-live-range');
  const liveWidth = document.getElementById('menu-doc-hz-overflow-live-width');
  const liveContainer = document.getElementById('menu-doc-hz-overflow-live-container');
  const liveMenu = document.getElementById('menu-doc-hz-overflow-live');
  const liveCount = document.getElementById('menu-doc-hz-overflow-live-count');
  if (liveMenu) {
    const longItems2 = [
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
      { key: 'solutions', label: '解决方案', children: [
        { key: 'retail', label: '零售' },
        { key: 'finance', label: '金融' },
        { key: 'manufacturing', label: '制造' }
      ] },
      { key: 'resources', label: '资源', children: [
        { key: 'docs', label: '文档中心' },
        { key: 'blog', label: '技术博客' },
        { key: 'community', label: '社区论坛' },
        { key: 'downloads', label: '下载中心' }
      ] },
      { key: 'pricing', label: '定价' },
      { key: 'partners', label: '合作伙伴' },
      { key: 'about', label: '关于' }
    ]
    liveMenu.setAttribute('items', JSON.stringify(longItems2))
      liveMenu.addEventListener('ldesignOverflowChange', (e) => {
      if (liveCount) liveCount.textContent = String(e.detail?.overflowCount || 0)
    })
  }
  const applyWidth = (w) => {
    if (liveContainer) liveContainer.style.width = `${w}px`
    if (liveWidth) liveWidth.textContent = String(w)
  }
  if (liveRange) {
    applyWidth(Number(liveRange.value || 560))
    liveRange.addEventListener('input', () => applyWidth(Number(liveRange.value || 560)))
  }

  // Click 模式实时演示
  const liveRangeC = document.getElementById('menu-doc-hz-overflow-live-range-click');
  const liveWidthC = document.getElementById('menu-doc-hz-overflow-live-width-click');
  const liveContainerC = document.getElementById('menu-doc-hz-overflow-live-container-click');
  const liveMenuC = document.getElementById('menu-doc-hz-overflow-live-click');
  const liveCountC = document.getElementById('menu-doc-hz-overflow-live-count-click');
  if (liveMenuC) {
    const longItems3 = [
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
      { key: 'solutions', label: '解决方案', children: [
        { key: 'retail', label: '零售' },
        { key: 'finance', label: '金融' },
        { key: 'manufacturing', label: '制造' }
      ] },
      { key: 'resources', label: '资源', children: [
        { key: 'docs', label: '文档中心' },
        { key: 'blog', label: '技术博客' },
        { key: 'community', label: '社区论坛' },
        { key: 'downloads', label: '下载中心' }
      ] },
      { key: 'pricing', label: '定价' },
      { key: 'partners', label: '合作伙伴' },
      { key: 'about', label: '关于' }
    ]
    liveMenuC.setAttribute('items', JSON.stringify(longItems3))
    liveMenuC.addEventListener('ldesignOverflowChange', (e) => {
      if (liveCountC) liveCountC.textContent = String(e.detail?.overflowCount || 0)
    })
  }
  const applyWidthC = (w) => {
    if (liveContainerC) liveContainerC.style.width = `${w}px`
    if (liveWidthC) liveWidthC.textContent = String(w)
  }
  if (liveRangeC) {
    applyWidthC(Number(liveRangeC.value || 560))
    liveRangeC.addEventListener('input', () => applyWidthC(Number(liveRangeC.value || 560)))
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

## 横向 - 溢出（更多）

当顶级菜单数量过多或容器宽度不足时，超出的顶级项会自动收纳到“更多”中，并触发 `ldesignOverflowChange` 事件。

<div style="background:#f5f5f5; padding:12px; border-radius:8px; margin-bottom: 24px;">
  <div style="background:white; padding:10px; border-radius:6px; margin-bottom:12px; max-width: 560px;">
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
      <div style="font-size:14px; color:#666;">Hover 触发</div>
      <span style="font-size:12px; color:#999;">溢出数：<b id="menu-doc-hz-overflow-hover-count">0</b></span>
    </div>
    <ldesign-menu id="menu-doc-hz-overflow-hover" mode="horizontal" submenu-trigger="hover"></ldesign-menu>
  </div>
  <div style="background:white; padding:10px; border-radius:6px; max-width: 560px;">
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
      <div style="font-size:14px; color:#666;">Click 触发</div>
      <span style="font-size:12px; color:#999;">溢出数：<b id="menu-doc-hz-overflow-click-count">0</b></span>
    </div>
    <ldesign-menu id="menu-doc-hz-overflow-click" mode="horizontal" submenu-trigger="click"></ldesign-menu>
  </div>
</div>

```html
<div style="max-width:560px; border:1px dashed #ddd; padding:10px; border-radius:6px;">
  <ldesign-menu id="menu-hz-overflow" mode="horizontal" submenu-trigger="hover"></ldesign-menu>
</div>
<script>
  const items = [ /* 顶级较多的菜单数据 */ ];
  const menu = document.getElementById('menu-hz-overflow');
  const counter = document.getElementById('hz-overflow-count');
  menu.items = items;
  menu.addEventListener('ldesignOverflowChange', e => { counter.textContent = String(e.detail.overflowCount||0); });
</script>
```

## 横向 - 溢出实时演示（可调容器宽度）

通过拖动滑块动态改变容器宽度，观察“更多”收纳数量的实时变化。

<div style="background:#f5f5f5; padding:12px; border-radius:8px; margin-bottom:14px;">
  <div style="font-size:14px; color:#555; margin-bottom:6px;">Hover 模式</div>
  <div style="display:flex; align-items:center; gap:12px; margin:0 0 10px 0;">
    <label for="menu-doc-hz-overflow-live-range" style="font-size:14px; color:#666;">容器宽度</label>
    <input id="menu-doc-hz-overflow-live-range" type="range" min="320" max="920" step="10" value="560" style="width:280px;"/>
    <span style="font-size:12px; color:#999;">当前宽度：<b id="menu-doc-hz-overflow-live-width">560</b>px</span>
    <span style="font-size:12px; color:#999;">溢出数：<b id="menu-doc-hz-overflow-live-count">0</b></span>
  </div>
  <div id="menu-doc-hz-overflow-live-container" style="width:560px;">
    <div style="background:#fff; border:1px dashed #ddd; padding:10px; border-radius:6px;">
      <ldesign-menu id="menu-doc-hz-overflow-live" mode="horizontal" submenu-trigger="hover"></ldesign-menu>
    </div>
  </div>
</div>

<div style="background:#f5f5f5; padding:12px; border-radius:8px;">
  <div style="font-size:14px; color:#555; margin-bottom:6px;">Click 模式</div>
  <div style="display:flex; align-items:center; gap:12px; margin:0 0 10px 0;">
    <label for="menu-doc-hz-overflow-live-range-click" style="font-size:14px; color:#666;">容器宽度</label>
    <input id="menu-doc-hz-overflow-live-range-click" type="range" min="320" max="920" step="10" value="560" style="width:280px;"/>
    <span style="font-size:12px; color:#999;">当前宽度：<b id="menu-doc-hz-overflow-live-width-click">560</b>px</span>
    <span style="font-size:12px; color:#999;">溢出数：<b id="menu-doc-hz-overflow-live-count-click">0</b></span>
  </div>
  <div id="menu-doc-hz-overflow-live-container-click" style="width:560px;">
    <div style="background:#fff; border:1px dashed #ddd; padding:10px; border-radius:6px;">
      <ldesign-menu id="menu-doc-hz-overflow-live-click" mode="horizontal" submenu-trigger="click"></ldesign-menu>
    </div>
  </div>
</div>

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

## 纵向 - 顶层互斥（一级互斥）

在纵向模式下，`top-level-exclusive` 控制“一级菜单是否互斥”。默认 `true`，即只保留一个一级处于展开状态；设置为 `false` 时，允许多个一级同时展开。该能力对 inline 与 flyout 均生效。

<div style="display:flex; gap:16px; align-items:flex-start;">
  <div style="width: 280px; border:1px dashed #ddd; padding:8px; border-radius:6px;">
    <div style="font-size:14px; color:#555; margin-bottom:6px;">默认（互斥开启）</div>
    <ldesign-menu id="menu-doc-inline-exclusive" mode="vertical" vertical-expand="inline"></ldesign-menu>
  </div>
  <div style="width: 280px; border:1px dashed #ddd; padding:8px; border-radius:6px;">
    <div style="font-size:14px; color:#555; margin-bottom:6px;">允许多个一级同时展开</div>
    <ldesign-menu id="menu-doc-inline-multi" mode="vertical" vertical-expand="inline" top-level-exclusive="false"></ldesign-menu>
  </div>
</div>

```html
<div style="display:flex; gap:16px; align-items:flex-start;">
  <div style="width: 280px; border:1px dashed #ddd; padding:8px; border-radius:6px;">
    <ldesign-menu mode="vertical" vertical-expand="inline"></ldesign-menu>
  </div>
  <div style="width: 280px; border:1px dashed #ddd; padding:8px; border-radius:6px;">
    <ldesign-menu mode="vertical" vertical-expand="inline" top-level-exclusive="false"></ldesign-menu>
  </div>
</div>
```

## 纵向 flyout - 顶层互斥（hover/click）

<div style="display:flex; gap:16px; align-items:flex-start; margin-bottom: 14px;">
  <div style="width: 280px; border:1px dashed #ddd; padding:8px; border-radius:6px;">
    <div style="font-size:14px; color:#555; margin-bottom:6px;">Hover（互斥开启）</div>
    <ldesign-menu id="menu-doc-fly-ex-hover" mode="vertical" vertical-expand="flyout" submenu-trigger="hover"></ldesign-menu>
  </div>
  <div style="width: 280px; border:1px dashed #ddd; padding:8px; border-radius:6px;">
    <div style="font-size:14px; color:#555; margin-bottom:6px;">Hover（允许多个一级同时展开）</div>
    <ldesign-menu id="menu-doc-fly-multi-hover" mode="vertical" vertical-expand="flyout" submenu-trigger="hover" top-level-exclusive="false"></ldesign-menu>
  </div>
</div>

<div style="display:flex; gap:16px; align-items:flex-start;">
  <div style="width: 280px; border:1px dashed #ddd; padding:8px; border-radius:6px;">
    <div style="font-size:14px; color:#555; margin-bottom:6px;">Click（互斥开启）</div>
    <ldesign-menu id="menu-doc-fly-ex-click" mode="vertical" vertical-expand="flyout" submenu-trigger="click"></ldesign-menu>
  </div>
  <div style="width: 280px; border:1px dashed #ddd; padding:8px; border-radius:6px;">
    <div style="font-size:14px; color:#555; margin-bottom:6px;">Click（允许多个一级同时展开）</div>
    <ldesign-menu id="menu-doc-fly-multi-click" mode="vertical" vertical-expand="flyout" submenu-trigger="click" top-level-exclusive="false"></ldesign-menu>
  </div>
</div>

```html
<div style="display:flex; gap:16px; align-items:flex-start; margin-bottom: 14px;">
  <div style="width: 280px; border:1px dashed #ddd; padding:8px; border-radius:6px;">
    <ldesign-menu mode="vertical" vertical-expand="flyout" submenu-trigger="hover"></ldesign-menu>
  </div>
  <div style="width: 280px; border:1px dashed #ddd; padding:8px; border-radius:6px;">
    <ldesign-menu mode="vertical" vertical-expand="flyout" submenu-trigger="hover" top-level-exclusive="false"></ldesign-menu>
  </div>
</div>
<div style="display:flex; gap:16px; align-items:flex-start;">
  <div style="width: 280px; border:1px dashed #ddd; padding:8px; border-radius:6px;">
    <ldesign-menu mode="vertical" vertical-expand="flyout" submenu-trigger="click"></ldesign-menu>
  </div>
  <div style="width: 280px; border:1px dashed #ddd; padding:8px; border-radius:6px;">
    <ldesign-menu mode="vertical" vertical-expand="flyout" submenu-trigger="click" top-level-exclusive="false"></ldesign-menu>
  </div>
</div>
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

---
outline: deep
---

# Collapse 折叠面板

用于将内容区域折叠/展开的容器组件，支持手风琴模式、受控/非受控、懒渲染与销毁、键盘可访问和高度动画。

- 高性能高度动画（0px ↔ scrollHeight ↔ auto）
- 受控/非受控两种使用模式
- 手风琴（同层级仅展开一个）
- 自定义头部与额外区域、可配置图标及其位置
- 懒渲染与收起销毁
- 无障碍（A11y）：ARIA 属性与键盘交互

> 组件标签：`<ldesign-collapse>` 与 `<ldesign-collapse-panel>`。

## 基础用法

<div class="demo-container">
  <ldesign-collapse>
    <ldesign-collapse-panel name="a" header="标题 A">A 内容</ldesign-collapse-panel>
    <ldesign-collapse-panel name="b" header="标题 B">B 内容</ldesign-collapse-panel>
  </ldesign-collapse>
</div>

```html
<ldesign-collapse>
  <ldesign-collapse-panel name="a" header="标题 A">A 内容</ldesign-collapse-panel>
  <ldesign-collapse-panel name="b" header="标题 B">B 内容</ldesign-collapse-panel>
</ldesign-collapse>
```

## 默认展开

<div class="demo-container">
  <ldesign-collapse default-value='["a"]'>
    <ldesign-collapse-panel name="a" header="A">内容 A</ldesign-collapse-panel>
    <ldesign-collapse-panel name="b" header="B">内容 B</ldesign-collapse-panel>
  </ldesign-collapse>
</div>

```html
<ldesign-collapse default-value='["a"]'>
  <ldesign-collapse-panel name="a" header="A">内容 A</ldesign-collapse-panel>
  <ldesign-collapse-panel name="b" header="B">内容 B</ldesign-collapse-panel>
</ldesign-collapse>
```

## 手风琴模式

<div class="demo-container">
  <ldesign-collapse accordion>
    <ldesign-collapse-panel name="1" header="面板 1">内容 1</ldesign-collapse-panel>
    <ldesign-collapse-panel name="2" header="面板 2">内容 2</ldesign-collapse-panel>
    <ldesign-collapse-panel name="3" header="面板 3">内容 3</ldesign-collapse-panel>
  </ldesign-collapse>
</div>

```html
<ldesign-collapse accordion>
  <ldesign-collapse-panel name="1" header="面板 1">内容 1</ldesign-collapse-panel>
  <ldesign-collapse-panel name="2" header="面板 2">内容 2</ldesign-collapse-panel>
  <ldesign-collapse-panel name="3" header="面板 3">内容 3</ldesign-collapse-panel>
</ldesign-collapse>
```

## 受控用法

<div class="demo-container" id="col-ctrl-wrap">
  <div class="demo-row">
    <ldesign-button id="col-ctrl-toggle">切换 X</ldesign-button>
    <span style="color: var(--vp-c-text-2);">当前展开：<strong id="col-ctrl-open">["x"]</strong></span>
  </div>
  <ldesign-collapse id="col-ctrl" value='["x"]'>
    <ldesign-collapse-panel name="x" header="X">面板 X</ldesign-collapse-panel>
    <ldesign-collapse-panel name="y" header="Y">面板 Y</ldesign-collapse-panel>
  </ldesign-collapse>
</div>

```html
<ldesign-button id="toggle">切换 X</ldesign-button>
<ldesign-collapse id="ctrl" value='["x"]'>
  <ldesign-collapse-panel name="x" header="X">面板 X</ldesign-collapse-panel>
  <ldesign-collapse-panel name="y" header="Y">面板 Y</ldesign-collapse-panel>
</ldesign-collapse>
<script>
  const group = document.getElementById('ctrl');
  const btn = document.getElementById('toggle');
  btn.addEventListener('click', () => {
    const cur = group.value || [];
    group.value = cur.includes('x') ? cur.filter(v => v !== 'x') : [...cur, 'x'];
  });
</script>
```

## 自定义头部与额外区域，图标与位置

<div class="demo-container">
  <ldesign-collapse expand-icon-placement="right">
    <ldesign-collapse-panel name="a" header="右侧图标" expand-icon="chevron-right">
      内容 A
    </ldesign-collapse-panel>
    <ldesign-collapse-panel name="b">
      <span slot="header">自定义头部</span>
      <span slot="extra">额外信息</span>
      内容 B
    </ldesign-collapse-panel>
  </ldesign-collapse>
</div>

```html
<ldesign-collapse expand-icon-placement="right">
  <ldesign-collapse-panel name="a" header="右侧图标" expand-icon="chevron-right">内容</ldesign-collapse-panel>
  <ldesign-collapse-panel name="b">
    <span slot="header">自定义头部</span>
    <span slot="extra">额外信息</span>
    内容
  </ldesign-collapse-panel>
</ldesign-collapse>
```

## 懒渲染与收起销毁

- `lazy`：首次展开时才渲染，之后保持渲染。
- `destroy-on-close`：收起后销毁内容（优先级高于 lazy）。

为便于直观看到差异，下面的 Live 示例会统计“内容节点被创建的次数”。

<div class="demo-container" id="col-live-wrap">
  <div class="demo-row">
    <ldesign-button id="col-open-a">打开 懒渲染</ldesign-button>
    <ldesign-button id="col-close-a" type="secondary">收起 懒渲染</ldesign-button>
    <ldesign-button id="col-open-b">打开 收起销毁</ldesign-button>
    <ldesign-button id="col-close-b" type="secondary">收起 收起销毁</ldesign-button>
  </div>

  <div class="demo-row" style="color: var(--vp-c-text-2);">
    懒渲染 创建次数：<strong id="col-a-count">0</strong>
    <span style="margin-left:16px;">当前存在：<strong id="col-a-exist">否</strong></span>
  </div>
  <div class="demo-row" style="color: var(--vp-c-text-2);">
    收起销毁 创建次数：<strong id="col-b-count">0</strong>
    <span style="margin-left:16px;">当前存在：<strong id="col-b-exist">否</strong></span>
  </div>

  <ldesign-collapse id="col-live">
    <ldesign-collapse-panel name="a" header="懒渲染" lazy>
      <div id="col-a-content" style="padding: 6px 0;">内容在首次展开时才渲染。</div>
    </ldesign-collapse-panel>
    <ldesign-collapse-panel name="b" header="收起销毁" destroy-on-close>
      <div id="col-b-content" style="padding: 6px 0;">每次收起都会销毁内容。</div>
    </ldesign-collapse-panel>
  </ldesign-collapse>
</div>

```html
<ldesign-collapse>
  <ldesign-collapse-panel name="a" header="懒渲染" lazy>
    <div id="col-a-content">内容在首次展开时才渲染。</div>
  </ldesign-collapse-panel>
  <ldesign-collapse-panel name="b" header="收起销毁" destroy-on-close>
    <div id="col-b-content">每次收起都会销毁内容。</div>
  </ldesign-collapse-panel>
</ldesign-collapse>
```


## 禁用

<div class="demo-container">
  <ldesign-collapse>
    <ldesign-collapse-panel name="a" header="可用">内容</ldesign-collapse-panel>
    <ldesign-collapse-panel name="b" header="禁用项" disabled>内容</ldesign-collapse-panel>
  </ldesign-collapse>
</div>

```html
<ldesign-collapse>
  <ldesign-collapse-panel name="a" header="可用">内容</ldesign-collapse-panel>
  <ldesign-collapse-panel name="b" header="禁用项" disabled>内容</ldesign-collapse-panel>
</ldesign-collapse>
```

## 幽灵与边框

<div class="demo-container" style="display:flex; gap:16px; flex-wrap:wrap;">
  <div style="flex:1; min-width:260px;">
    <div style="margin-bottom:8px;color:var(--vp-c-text-2)">ghost</div>
    <ldesign-collapse ghost>
      <ldesign-collapse-panel header="无背景（ghost）">内容</ldesign-collapse-panel>
      <ldesign-collapse-panel header="更多">内容</ldesign-collapse-panel>
    </ldesign-collapse>
  </div>
  <div style="flex:1; min-width:260px;">
    <div style="margin-bottom:8px;color:var(--vp-c-text-2)">bordered</div>
    <ldesign-collapse bordered>
      <ldesign-collapse-panel header="带边框">内容</ldesign-collapse-panel>
      <ldesign-collapse-panel header="更多">内容</ldesign-collapse-panel>
    </ldesign-collapse>
  </div>
</div>

```html
<ldesign-collapse ghost>
  <ldesign-collapse-panel header="无背景（ghost）">内容</ldesign-collapse-panel>
</ldesign-collapse>

<ldesign-collapse bordered>
  <ldesign-collapse-panel header="带边框">内容</ldesign-collapse-panel>
</ldesign-collapse>
```

## 事件

<div class="demo-container" id="col-evt-wrap">
  <ldesign-collapse id="col-evt">
    <ldesign-collapse-panel name="1" header="面板 1">1</ldesign-collapse-panel>
    <ldesign-collapse-panel name="2" header="面板 2">2</ldesign-collapse-panel>
  </ldesign-collapse>
  <div class="demo-row" style="margin-top:8px; color: var(--vp-c-text-2);">
    change: <code id="col-evt-change">[]</code>
  </div>
  <div class="demo-row" style="color: var(--vp-c-text-2);">
    toggle: <code id="col-evt-toggle">-</code>
  </div>
</div>

```html
<ldesign-collapse id="evt">
  <ldesign-collapse-panel name="1" header="1">1</ldesign-collapse-panel>
  <ldesign-collapse-panel name="2" header="2">2</ldesign-collapse-panel>
</ldesign-collapse>
<script>
  const c = document.getElementById('evt');
  c.addEventListener('ldesignChange', e => console.log('change', e.detail));
  c.addEventListener('ldesignToggle', e => console.log('toggle', e.detail));
</script>
```

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  // 懒渲染 / 收起销毁 Live 示例
  const host = document.getElementById('col-live') as any
  if (host && !host.__inited_live) {
    host.__inited_live = true

    const btnOpenA = document.getElementById('col-open-a')
    const btnCloseA = document.getElementById('col-close-a')
    const btnOpenB = document.getElementById('col-open-b')
    const btnCloseB = document.getElementById('col-close-b')
    const aCountEl = document.getElementById('col-a-count')
    const bCountEl = document.getElementById('col-b-count')
    const aExistEl = document.getElementById('col-a-exist')
    const bExistEl = document.getElementById('col-b-exist')

    let aCount = 0
    let bCount = 0
    let aPresent = false
    let bPresent = false

    const update = () => {
      const aNow = !!document.getElementById('col-a-content')
      const bNow = !!document.getElementById('col-b-content')
      if (aNow && !aPresent) { aCount++; if (aCountEl) aCountEl.textContent = String(aCount) }
      if (bNow && !bPresent) { bCount++; if (bCountEl) bCountEl.textContent = String(bCount) }
      aPresent = aNow; bPresent = bNow
      if (aExistEl) aExistEl.textContent = aNow ? '是' : '否'
      if (bExistEl) bExistEl.textContent = bNow ? '是' : '否'
    }

    const obs = new MutationObserver(update)
    obs.observe(host, { subtree: true, childList: true })
    update()

    const getOpen = () => Array.isArray(host.value) ? [ ...host.value ] : []
    const setOpen = (keys: string[]) => { host.value = keys }

    btnOpenA?.addEventListener('click', () => setOpen(Array.from(new Set([...getOpen(), 'a']))))
    btnCloseA?.addEventListener('click', () => setOpen(getOpen().filter(k => k !== 'a')))
    btnOpenB?.addEventListener('click', () => setOpen(Array.from(new Set([...getOpen(), 'b']))))
    btnCloseB?.addEventListener('click', () => setOpen(getOpen().filter(k => k !== 'b')))
  }

  // 受控 demo
  const group = document.getElementById('col-ctrl') as any
  const btn = document.getElementById('col-ctrl-toggle')
  const open = document.getElementById('col-ctrl-open')
  if (group && btn && open && !group.__inited_ctrl) {
    group.__inited_ctrl = true
    btn.addEventListener('click', () => {
      const cur = group.value || []
      const next = cur.includes('x') ? cur.filter((v: string) => v !== 'x') : [...cur, 'x']
      group.value = next
      open.textContent = JSON.stringify(next)
    })
    group.addEventListener('ldesignChange', (e: any) => open.textContent = JSON.stringify(e.detail || []))
  }

  // 事件 demo
  const c = document.getElementById('col-evt')
  const ch = document.getElementById('col-evt-change')
  const tg = document.getElementById('col-evt-toggle')
  if (c && ch && tg && !(c as any).__inited_evt) {
    (c as any).__inited_evt = true
    c.addEventListener('ldesignChange', (e: any) => ch.textContent = JSON.stringify(e.detail || []))
    c.addEventListener('ldesignToggle', (e: any) => tg.textContent = JSON.stringify(e.detail || {}))
  }
})
</script>

## 无障碍（A11y）
- 头部采用 `role="button"`，支持 Enter/Space 键触发展开/收起。
- 自动设置 `aria-expanded`/`aria-controls`/`aria-labelledby`，内容区域为 `role="region"`。
- 遵循 `prefers-reduced-motion`，在用户偏好下禁用动画。

## API

### ldesign-collapse

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| value | `string[]` | - | 受控展开项，需配合事件写回 |
| default-value | `string[]` | `[]` | 非受控默认展开项 |
| accordion | `boolean` | `false` | 手风琴模式，同层级仅保留一个展开 |
| expand-icon-placement | `'left' \| 'right'` | `'left'` | 展开图标位置 |
| bordered | `boolean` | `true` | 是否带边框 |
| ghost | `boolean` | `false` | 幽灵模式（背景透明，仅分隔线） |
| disabled | `boolean` | `false` | 整体禁用（子面板不可交互） |

| 事件 | 说明 |
|---|---|
| ldesignChange | 展开项变化，事件 detail 为 `string[]` |
| ldesignToggle | 单项切换，事件 detail 为 `{ name: string; open: boolean; openKeys: string[] }` |

### ldesign-collapse-panel

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| name | `string` | - | 面板唯一标识（未设置将按顺序自动补齐） |
| header | `string` | - | 头部文本（可用 `slot="header"` 覆盖） |
| extra | `string` | - | 右侧附加区域（可用 `slot="extra"` 覆盖） |
| disabled | `boolean` | `false` | 禁用当前面板 |
| expand-icon | `string` | `chevron-right` | 展开图标名称 |
| expand-icon-placement | `'left' \| 'right'` | `left` | 图标位置（可覆盖父级） |
| lazy | `boolean` | `false` | 首次展开才渲染 |
| destroy-on-close | `boolean` | `false` | 收起后销毁内容（优先于 `lazy`） |

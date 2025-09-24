---
outline: deep
---

# Tabs 选项卡

用于在同一空间中切换不同内容区域。

- 支持受控/非受控两种使用模式
- 支持四个方向的标签位置：top、bottom、left、right
- ARIA 完善：tablist/tab/tabpanel、键盘导航（左右/上下/Home/End）

## 基础用法

<div class="demo-container">
  <ldesign-tabs id="tabs-basic-live" default-value="profile">
    <ldesign-tab-panel name="home" label="首页">首页内容</ldesign-tab-panel>
    <ldesign-tab-panel name="profile" label="资料">资料内容</ldesign-tab-panel>
    <ldesign-tab-panel name="settings" label="设置">设置内容</ldesign-tab-panel>
  </ldesign-tabs>
</div>

### 源码

```html
<ldesign-tabs default-value="profile">
  <ldesign-tab-panel name="home" label="首页">首页内容</ldesign-tab-panel>
  <ldesign-tab-panel name="profile" label="资料">资料内容</ldesign-tab-panel>
  <ldesign-tab-panel name="settings" label="设置">设置内容</ldesign-tab-panel>
</ldesign-tabs>
```

## 受控用法

<div class="demo-container" id="tabs-ctrl-container">
  <div class="demo-row">
    <ldesign-button id="tabs-ctrl-to-profile">切到资料</ldesign-button>
    <ldesign-button id="tabs-ctrl-to-settings" type="secondary">切到设置</ldesign-button>
    <div style="color: var(--vp-c-text-2);">当前激活：<strong id="tabs-ctrl-current">home</strong></div>
  </div>
  <ldesign-tabs id="tabs-ctrl-live" value="home">
    <ldesign-tab-panel name="home" label="首页">首页内容</ldesign-tab-panel>
    <ldesign-tab-panel name="profile" label="资料">资料内容</ldesign-tab-panel>
    <ldesign-tab-panel name="settings" label="设置">设置内容</ldesign-tab-panel>
  </ldesign-tabs>
</div>

### 源码

```html
<div>
  <ldesign-button id="to-profile">切到资料</ldesign-button>
  <ldesign-button id="to-settings" type="secondary">切到设置</ldesign-button>
</div>
<ldesign-tabs id="tabs-demo" value="home">
  <ldesign-tab-panel name="home" label="首页">首页内容</ldesign-tab-panel>
  <ldesign-tab-panel name="profile" label="资料">资料内容</ldesign-tab-panel>
  <ldesign-tab-panel name="settings" label="设置">设置内容</ldesign-tab-panel>
</ldesign-tabs>
<script>
  const tabs = document.getElementById('tabs-demo');
  document.getElementById('to-profile').addEventListener('click', () => tabs.value = 'profile');
  document.getElementById('to-settings').addEventListener('click', () => tabs.value = 'settings');
  tabs.addEventListener('ldesignChange', (e) => console.log('active:', e.detail));
</script>
```

## 位置与类型

<div class="demo-container">
  <ldesign-tabs placement="left" type="card" default-value="doc">
    <ldesign-tab-panel name="doc" label="文档">文档内容</ldesign-tab-panel>
    <ldesign-tab-panel name="api" label="API">API 内容</ldesign-tab-panel>
    <ldesign-tab-panel name="guide" label="指南">指南内容</ldesign-tab-panel>
  </ldesign-tabs>
</div>

### 源码

```html
<ldesign-tabs placement="left" type="card" default-value="doc">
  <ldesign-tab-panel name="doc" label="文档">文档内容</ldesign-tab-panel>
  <ldesign-tab-panel name="api" label="API">API 内容</ldesign-tab-panel>
  <ldesign-tab-panel name="guide" label="指南">指南内容</ldesign-tab-panel>
</ldesign-tabs>
```

## 禁用项

<div class="demo-container">
  <ldesign-tabs default-value="a">
    <ldesign-tab-panel name="a" label="可用 A">内容 A</ldesign-tab-panel>
    <ldesign-tab-panel name="b" label="禁用 B" disabled>内容 B</ldesign-tab-panel>
    <ldesign-tab-panel name="c" label="可用 C">内容 C</ldesign-tab-panel>
  </ldesign-tabs>
</div>

### 源码

```html
<ldesign-tabs default-value="a">
  <ldesign-tab-panel name="a" label="可用 A">内容 A</ldesign-tab-panel>
  <ldesign-tab-panel name="b" label="禁用 B" disabled>内容 B</ldesign-tab-panel>
  <ldesign-tab-panel name="c" label="可用 C">内容 C</ldesign-tab-panel>
</ldesign-tabs>
```

## 溢出滚动

当标签数量较多时，组件会在导航两侧显示滚动按钮（左右或上下）用于快速滚动；墨水条位置会在滚动时自动更新。

- 横向：左右滚动
- 纵向：上下滚动

### 横向溢出 - 实时演示（Live）

<div style="margin: 8px 0; display:flex; align-items:center; gap:8px;">
  <span>容器宽度：</span>
  <strong id="tabs-live-width2">560</strong> px
  <input id="tabs-live-range2" type="range" min="280" max="960" step="20" value="560" />
</div>
<div id="tabs-live-container2" style="width: 560px; border: 1px dashed var(--ld-border, #e5e7eb); padding: 8px;">
  <ldesign-tabs id="tabs-live-hz2" default-value="t1"></ldesign-tabs>
</div>

### 纵向溢出 - 实时演示（Live）

<div style="display:flex; gap:16px; flex-wrap: wrap;">
  <div>
    <div style="margin-bottom:6px;">左侧（placement="left"）</div>
    <div style="height: 180px; border: 1px dashed var(--ld-border, #e5e7eb); padding:8px; display:flex;">
      <ldesign-tabs id="tabs-live-left2" placement="left" default-value="v1"></ldesign-tabs>
    </div>
  </div>
  <div>
    <div style="margin-bottom:6px;">右侧（placement="right"）</div>
    <div style="height: 180px; border: 1px dashed var(--ld-border, #e5e7eb); padding:8px; display:flex;">
      <ldesign-tabs id="tabs-live-right2" placement="right" default-value="v1"></ldesign-tabs>
    </div>
  </div>
</div>

### 横向溢出 - 实时演示

```html
<div style="margin: 8px 0; display:flex; align-items:center; gap:8px;">
  <span>容器宽度：</span>
  <strong id="tabs-live-width">560</strong> px
  <input id="tabs-live-range" type="range" min="280" max="960" step="20" value="560" />
</div>
<div id="tabs-live-container" style="width: 560px; border: 1px dashed var(--ld-border, #e5e7eb); padding: 8px;">
  <ldesign-tabs id="tabs-live-hz" default-value="t1"></ldesign-tabs>
</div>
<script>
  const hostHz = document.getElementById('tabs-live-hz');
  if (hostHz) {
    const items = Array.from({ length: 12 }).map((_, i) => ({
      name: `t${i+1}`,
      label: `标签 ${i+1}`,
      content: `内容 ${i+1}`
    }));
    hostHz.innerHTML = items.map(it => `<ldesign-tab-panel name="${it.name}" label="${it.label}">${it.content}</ldesign-tab-panel>`).join('');
  }
  const range = document.getElementById('tabs-live-range');
  const widthEl = document.getElementById('tabs-live-width');
  const container = document.getElementById('tabs-live-container');
  const applyW = (w) => { if (container) container.style.width = `${w}px`; if (widthEl) widthEl.textContent = String(w); };
  if (range) {
    applyW(Number(range.value || 560));
    range.addEventListener('input', () => applyW(Number(range.value || 560)));
  }
</script>
```

### 纵向溢出 - 基本演示

```html
<div style="display:flex; gap:16px; flex-wrap: wrap;">
  <div>
    <div style="margin-bottom:6px;">左侧（placement="left"）</div>
    <div style="height: 180px; border: 1px dashed var(--ld-border, #e5e7eb); padding:8px; display:flex;">
      <ldesign-tabs id="tabs-live-left" placement="left" default-value="v1"></ldesign-tabs>
    </div>
  </div>
  <div>
    <div style="margin-bottom:6px;">右侧（placement="right"）</div>
    <div style="height: 180px; border: 1px dashed var(--ld-border, #e5e7eb); padding:8px; display:flex;">
      <ldesign-tabs id="tabs-live-right" placement="right" default-value="v1"></ldesign-tabs>
    </div>
  </div>
</div>
<script>
  const left = document.getElementById('tabs-live-left');
  const right = document.getElementById('tabs-live-right');
  const vItems = Array.from({ length: 10 }).map((_, i) => ({
    name: `v${i+1}`,
    label: `选项 ${i+1}`,
    content: `纵向内容 ${i+1}`
  }));
  if (left) left.innerHTML = vItems.map(it => `<ldesign-tab-panel name="${it.name}" label="${it.label}">${it.content}</ldesign-tab-panel>`).join('');
  if (right) right.innerHTML = vItems.map(it => `<ldesign-tab-panel name="${it.name}" label="${it.label}">${it.content}</ldesign-tab-panel>`).join('');
</script>
```

## 键盘交互

- 横向（top/bottom）：使用左右方向键切换，Home/End 跳到首尾
- 纵向（left/right）：使用上下方向键切换，Home/End 跳到首尾

## 属性（Props）

- ldesign-tabs
  - value?: string 受控激活项
  - default-value?: string 默认激活项
  - placement?: 'top' | 'bottom' | 'left' | 'right' = 'top'
  - type?: 'line' | 'card' = 'line'
  - size?: 'small' | 'medium' | 'large' = 'medium'
  - 事件：ldesignChange(detail: string)

- ldesign-tab-panel
  - name!: string 面板唯一标识
  - label!: string 标签文本
  - disabled?: boolean = false
  - lazy?: boolean = false

## 可新增 / 可关闭

### 实时演示（非受控）

<div class="demo-container">
  <ldesign-tabs id="tabs-edit-live" addable default-value="a"></ldesign-tabs>
</div>

### 实时演示（受控）

<div class="demo-container">
  <ldesign-tabs id="tabs-edit-controlled-live" value="x1" addable></ldesign-tabs>
  <div style="margin:6px 0 0; color: var(--vp-c-text-2);">当前激活：<strong id="tabs-edit-current-live">x1</strong></div>
</div>

你可以通过 tabs 的 addable 属性显示“新增”按钮；在面板上开启 closable 以显示关闭按钮。组件会通过事件通知行为，建议在事件里管理你的数据并更新 DOM。

- 新增事件：ldesignAdd
- 关闭事件：ldesignRemove(detail: { name: string })

```html
<ldesign-tabs id="tabs-edit" addable default-value="a"></ldesign-tabs>
<script>
  const host = document.getElementById('tabs-edit');
  const panels = [
    { name: 'a', label: 'A', content: 'A 内容' },
    { name: 'b', label: 'B', content: 'B 内容', closable: true },
  ];
  const render = () => host.innerHTML = panels.map(p => 
    `<ldesign-tab-panel name="${p.name}" label="${p.label}" ${p.closable ? 'closable' : ''}>${p.content}</ldesign-tab-panel>`
  ).join('');
  render();

  host.addEventListener('ldesignAdd', () => {
    const n = String.fromCharCode('A'.charCodeAt(0) + panels.length);
    panels.push({ name: n.toLowerCase(), label: n, content: `${n} 内容`, closable: true });
    render();
  });

  host.addEventListener('ldesignRemove', (e) => {
    const { name } = e.detail;
    const idx = panels.findIndex(p => p.name === name);
    if (idx >= 0) panels.splice(idx, 1);
    // 如果当前被移除的是激活项，你可以在这里同步 host.value 到一个邻近项
    render();
  });
</script>
```

### 受控编辑（新增/关闭）

> 受控模式下，你应当在 ldesignChange/ldesignAdd/ldesignRemove 中自行更新 panels 与 host.value。

```html
<ldesign-tabs id="tabs-edit-controlled" value="x1" addable></ldesign-tabs>
<div style="margin:6px 0 12px; color: var(--ld-text-3, #9ca3af);">当前激活：<span id="tabs-edit-current">x1</span></div>
<script>
  const host2 = document.getElementById('tabs-edit-controlled');
  const curText = document.getElementById('tabs-edit-current');
  let seq = 4;
  let p2 = [
    { name: 'x1', label: '一', closable: true, content: '一 内容' },
    { name: 'x2', label: '二', closable: true, content: '二 内容' },
    { name: 'x3', label: '三', closable: true, content: '三 内容' },
  ];
  const render2 = () => host2.innerHTML = p2.map(p => `<ldesign-tab-panel name="${p.name}" label="${p.label}" closable>${p.content}</ldesign-tab-panel>`).join('');
  render2();

  host2.addEventListener('ldesignChange', (e) => {
    host2.value = e.detail;
    if (curText) curText.textContent = e.detail;
  });

  host2.addEventListener('ldesignAdd', () => {
    const name = `x${seq++}`;
    p2.push({ name, label: `新 ${seq-1}`, closable: true, content: `新内容 ${name}` });
    render2();
    host2.value = name; // 受控：手动切到新页
    if (curText) curText.textContent = name;
  });

  host2.addEventListener('ldesignRemove', (e) => {
    const name = e.detail?.name;
    const idx = p2.findIndex(p => p.name === name);
    if (idx >= 0) p2.splice(idx, 1);
    // 若移除的是当前激活项，选择邻近项
    if (host2.value === name) {
      const fallback = p2[idx] || p2[idx-1] || p2[0];
      host2.value = fallback ? fallback.name : '';
      if (curText) curText.textContent = host2.value || '';
    }
    render2();
  });
</script>
```

## 最佳实践

- 面板 name 应唯一且稳定，便于受控模式下外部管理
- 复杂内容请放置在 tab-panel 内部，组件不会销毁未激活面板（保持状态）

## 懒渲染（优化初次渲染性能）

<div class="demo-container">
  <ldesign-tabs default-value="a">
    <ldesign-tab-panel name="a" label="A" lazy>内容 A（首次激活才渲染）</ldesign-tab-panel>
    <ldesign-tab-panel name="b" label="B" lazy>内容 B</ldesign-tab-panel>
    <ldesign-tab-panel name="c" label="C">内容 C（不懒渲染）</ldesign-tab-panel>
  </ldesign-tabs>
</div>

### 源码

当面板内容较复杂时，可以在面板上开启 lazy 属性，首次激活时再渲染内容，之后保持渲染。

```html
<ldesign-tabs default-value="a">
  <ldesign-tab-panel name="a" label="A" lazy>内容 A（首次激活才渲染）</ldesign-tab-panel>
  <ldesign-tab-panel name="b" label="B" lazy>内容 B</ldesign-tab-panel>
  <ldesign-tab-panel name="c" label="C">内容 C（不懒渲染）</ldesign-tab-panel>
</ldesign-tabs>
```

> 构建后，下方将包含由 Stencil 自动生成的完整 API 文档。

<!-- Auto Generated Below -->

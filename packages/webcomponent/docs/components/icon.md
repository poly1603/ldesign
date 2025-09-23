# Icon 图标

图标用于传达意义和功能，提供视觉提示和导航辅助。

## 基础用法

使用 `name` 属性指定要显示的图标。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-icon name="heart"></ldesign-icon>
    <ldesign-icon name="star"></ldesign-icon>
    <ldesign-icon name="download"></ldesign-icon>
    <ldesign-icon name="search"></ldesign-icon>
    <ldesign-icon name="plus"></ldesign-icon>
  </div>
</div>

```html
<ldesign-icon name="heart"></ldesign-icon>
<ldesign-icon name="star"></ldesign-icon>
<ldesign-icon name="download"></ldesign-icon>
<ldesign-icon name="search"></ldesign-icon>
<ldesign-icon name="plus"></ldesign-icon>
```

## 图标尺寸

使用 `size` 属性来设置图标的大小，支持预设尺寸和自定义数值。

<div class="demo-container">
  <div class="demo-row">
    <span class="demo-label">预设尺寸:</span>
    <ldesign-icon name="heart" size="small"></ldesign-icon>
    <ldesign-icon name="heart" size="medium"></ldesign-icon>
    <ldesign-icon name="heart" size="large"></ldesign-icon>
  </div>
  <div class="demo-row">
    <span class="demo-label">自定义尺寸:</span>
    <ldesign-icon name="heart" size="16"></ldesign-icon>
    <ldesign-icon name="heart" size="24"></ldesign-icon>
    <ldesign-icon name="heart" size="32"></ldesign-icon>
    <ldesign-icon name="heart" size="48"></ldesign-icon>
  </div>
</div>

```html
<!-- 预设尺寸 -->
<ldesign-icon name="heart" size="small"></ldesign-icon>
<ldesign-icon name="heart" size="medium"></ldesign-icon>
<ldesign-icon name="heart" size="large"></ldesign-icon>

<!-- 自定义尺寸 -->
<ldesign-icon name="heart" size="16"></ldesign-icon>
<ldesign-icon name="heart" size="24"></ldesign-icon>
<ldesign-icon name="heart" size="32"></ldesign-icon>
<ldesign-icon name="heart" size="48"></ldesign-icon>
```

## 图标颜色

使用 `color` 属性来设置图标的颜色。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-icon name="heart" color="red"></ldesign-icon>
    <ldesign-icon name="star" color="orange"></ldesign-icon>
    <ldesign-icon name="download" color="blue"></ldesign-icon>
    <ldesign-icon name="search" color="green"></ldesign-icon>
    <ldesign-icon name="plus" color="#722ED1"></ldesign-icon>
  </div>
</div>

```html
<ldesign-icon name="heart" color="red"></ldesign-icon>
<ldesign-icon name="star" color="orange"></ldesign-icon>
<ldesign-icon name="download" color="blue"></ldesign-icon>
<ldesign-icon name="search" color="green"></ldesign-icon>
<ldesign-icon name="plus" color="#722ED1"></ldesign-icon>
```

## 旋转动画

使用 `spin` 属性让图标持续旋转，常用于加载状态。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-icon name="loader-2" spin></ldesign-icon>
    <ldesign-icon name="refresh-cw" spin></ldesign-icon>
    <ldesign-icon name="heart" spin color="red"></ldesign-icon>
  </div>
</div>

```html
<ldesign-icon name="loader-2" spin></ldesign-icon>
<ldesign-icon name="refresh-cw" spin></ldesign-icon>
<ldesign-icon name="heart" spin color="red"></ldesign-icon>
```

## 在文本中使用

图标可以与文本组合使用，提供更好的视觉效果。

<div class="demo-container">
  <div class="demo-row">
    <p style="display: flex; align-items: center; gap: 8px; margin: 0;">
      <ldesign-icon name="download" size="small"></ldesign-icon>
      下载文件
    </p>
    <p style="display: flex; align-items: center; gap: 8px; margin: 0;">
      <ldesign-icon name="search" size="small"></ldesign-icon>
      搜索内容
    </p>
    <p style="display: flex; align-items: center; gap: 8px; margin: 0;">
      <ldesign-icon name="heart" size="small" color="red"></ldesign-icon>
      收藏
    </p>
  </div>
</div>

```html
<p style="display: flex; align-items: center; gap: 8px;">
  <ldesign-icon name="download" size="small"></ldesign-icon>
  下载文件
</p>
<p style="display: flex; align-items: center; gap: 8px;">
  <ldesign-icon name="search" size="small"></ldesign-icon>
  搜索内容
</p>
<p style="display: flex; align-items: center; gap: 8px;">
  <ldesign-icon name="heart" size="small" color="red"></ldesign-icon>
  收藏
</p>
```

## 全量图标预览（Lucide）

> 说明：下表运行时从 lucide 动态获取所有图标名称，并使用 `<ldesign-icon>` 逐一渲染，支持搜索过滤。

<div class="demo-container">
  <div style="margin-bottom: 12px; display: flex; gap: 8px; align-items: center;">
    <input id="icon-search" placeholder="搜索图标名称" style="padding:6px 10px; border:1px solid #e5e7eb; border-radius:6px; width: 260px;" />
    <span style="color:#666; font-size:12px">数据来源：lucide</span>
  </div>
  <div id="icon-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 16px;"></div>
</div>

<script type="module">
  import * as lucide from 'lucide';
  const grid = document.getElementById('icon-grid');
  const input = document.getElementById('icon-search');
  const names = Object.keys(lucide.icons).sort();

  function render(list){
    grid.innerHTML='';
    const frag = document.createDocumentFragment();
    list.forEach(n=>{
      const item = document.createElement('div');
      item.style.cssText='display:flex;flex-direction:column;align-items:center;gap:8px;padding:8px;border:1px solid #f0f0f0;border-radius:8px;';
      const ic = document.createElement('ldesign-icon');
      ic.setAttribute('name', n);
      ic.setAttribute('size', 'large');
      const lab = document.createElement('code');
      lab.style.fontSize='12px'; lab.textContent = n;
      item.appendChild(ic);
      item.appendChild(lab);
      frag.appendChild(item);
    });
    grid.appendChild(frag);
  }

  render(names);
  input.addEventListener('input', ()=>{
    const q = input.value.trim().toLowerCase();
    const list = q ? names.filter(n=>n.includes(q)) : names;
    render(list);
  });
</script>

## API

### 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `name` | `string` | - | 图标名称（必填） |
| `size` | `'small' \| 'medium' \| 'large' \| number` | `'medium'` | 图标尺寸 |
| `color` | `string` | - | 图标颜色，支持任何有效的 CSS 颜色值 |
| `spin` | `boolean` | `false` | 是否旋转 |

### CSS 变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `--ls-icon-size-small` | `20px` | 小图标尺寸 |
| `--ls-icon-size-medium` | `22px` | 中图标尺寸 |
| `--ls-icon-size-large` | `24px` | 大图标尺寸 |

## 无障碍

Icon 组件遵循无障碍设计原则：

- 提供 `role="img"` 属性标识图标角色
- 提供 `aria-label` 属性描述图标含义
- 支持高对比度模式
- 图标颜色符合 WCAG 对比度要求

## 设计指南

### 何时使用

- 作为功能入口的视觉辅助
- 在有限的空间内传达信息
- 提供视觉层次和导航提示
- 增强用户界面的美观性

### 何时不使用

- 不要仅依赖图标传达重要信息，应配合文字说明
- 避免使用过于复杂或难以理解的图标
- 不要在同一界面中使用过多不同风格的图标

### 最佳实践

- 保持图标风格的一致性
- 确保图标含义清晰易懂
- 在重要操作中结合文字标签
- 考虑不同文化背景下的图标理解差异
- 为图标提供合适的点击区域（至少 44px × 44px）

### 图标选择原则

- **简洁性**: 图标应该简洁明了，避免过多细节
- **识别性**: 图标应该容易识别和理解
- **一致性**: 同一系统中的图标应该保持风格一致
- **通用性**: 优先选择通用的、被广泛认知的图标

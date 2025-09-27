# Grid 栅格布局

父组件负责定义一行包含多少列（cols）和横向/纵向间距（x-gap/y-gap 或 gap），子组件 `ldesign-grid-item` 通过 `span` 指定自身跨越的列数。Grid 会在内部自动计算每个子项所在的行、列起点和跨越列数，并将它们正确排布。

> 特性概览：
> - 使用结构：`<ldesign-grid> -> <ldesign-grid-item>`
> - Grid 根据 `cols` 与每个子项的 `span` 自动计算“第几行”和“第几列”
> - 支持 `gap`、`x-gap`、`y-gap` 设置横纵间距
> - 支持运行时修改 `cols` 或某个子项 `span` 并自动重排

## 快速预览：折叠/收起

<div class="demo-container">
  <ldesign-grid min-col-width="240" x-gap="16" y-gap="12" default-rows="2" toggle-span="2">
    <ldesign-grid-item><div class="demo-box">1</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">2</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">3</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">4</div></ldesign-grid-item>
    <ldesign-grid-item span="2"><div class="demo-box">5</div></ldesign-grid-item>
    <ldesign-grid-item span="2"><div class="demo-box">6</div></ldesign-grid-item>
    <ldesign-grid-item span="2"><div class="demo-box">7</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">8</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">9</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">10</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">11</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">12</div></ldesign-grid-item>
    <ldesign-grid-item span="2"><div class="demo-box">13</div></ldesign-grid-item>
    <ldesign-grid-item span="2"><div class="demo-box">14</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">15</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">16</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">17</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">18</div></ldesign-grid-item>
  </ldesign-grid>
</div>

```html
<ldesign-grid min-col-width="240" x-gap="16" y-gap="12" default-rows="2" toggle-span="2">
  <!-- 多个 grid-item，默认占 1 列，偶尔设置 span="2" -->
</ldesign-grid>
```

## 基础用法

自适应列数（默认每列最小宽度 240px），横向和纵向间距分别为 16px/16px。

<div class="demo-container">
  <ldesign-grid min-col-width="240" x-gap="16" y-gap="16">
    <ldesign-grid-item><div class="demo-box">1</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">2</div></ldesign-grid-item>
    <ldesign-grid-item span="2"><div class="demo-box">占 2 列</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">3</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">4</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">5</div></ldesign-grid-item>
  </ldesign-grid>
</div>

```html
<ldesign-grid min-col-width="240" x-gap="16" y-gap="16">
  <ldesign-grid-item>1</ldesign-grid-item>
  <ldesign-grid-item>2</ldesign-grid-item>
  <ldesign-grid-item span="2">占 2 列</ldesign-grid-item>
  <ldesign-grid-item>3</ldesign-grid-item>
  <ldesign-grid-item>4</ldesign-grid-item>
  <ldesign-grid-item>5</ldesign-grid-item>
</ldesign-grid>
```

## 子项跨列（span）

默认每个 grid-item 占 1 列；当需要更宽时设置 `span="2"`。

<div class="demo-container">
  <ldesign-grid min-col-width="240" gap="12">
    <ldesign-grid-item><div class="demo-box">1</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">2</div></ldesign-grid-item>
    <ldesign-grid-item span="2"><div class="demo-box">占 2 列</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">3</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">4</div></ldesign-grid-item>
  </ldesign-grid>
</div>

```html
<ldesign-grid min-col-width="240" gap="12">
  <ldesign-grid-item>1</ldesign-grid-item>
  <ldesign-grid-item>2</ldesign-grid-item>
  <ldesign-grid-item span="2">占 2 列</ldesign-grid-item>
  <ldesign-grid-item>3</ldesign-grid-item>
  <ldesign-grid-item>4</ldesign-grid-item>
</ldesign-grid>
```

> 说明：每个子项的 `span` 会被自动限制在 `[1, cols]` 之内，避免越界。

## 间距：gap 与 x-gap / y-gap

- `gap` 同时设置横向与纵向间距
- `x-gap` 仅设置横向列间距；`y-gap` 仅设置纵向行间距；优先级高于 `gap`

<div class="demo-container">
  <div class="demo-row">
    <div class="demo-label">gap=12</div>
    <ldesign-grid cols="12" gap="12">
      <ldesign-grid-item span="4"><div class="demo-box">A</div></ldesign-grid-item>
      <ldesign-grid-item span="4"><div class="demo-box">B</div></ldesign-grid-item>
      <ldesign-grid-item span="4"><div class="demo-box">C</div></ldesign-grid-item>
      <ldesign-grid-item span="4"><div class="demo-box">D</div></ldesign-grid-item>
      <ldesign-grid-item span="4"><div class="demo-box">E</div></ldesign-grid-item>
      <ldesign-grid-item span="4"><div class="demo-box">F</div></ldesign-grid-item>
    </ldesign-grid>
  </div>
  <div class="demo-row">
    <div class="demo-label">x-gap=16, y-gap=8</div>
    <ldesign-grid cols="12" x-gap="16" y-gap="8">
      <ldesign-grid-item span="4"><div class="demo-box">A</div></ldesign-grid-item>
      <ldesign-grid-item span="4"><div class="demo-box">B</div></ldesign-grid-item>
      <ldesign-grid-item span="4"><div class="demo-box">C</div></ldesign-grid-item>
      <ldesign-grid-item span="4"><div class="demo-box">D</div></ldesign-grid-item>
      <ldesign-grid-item span="4"><div class="demo-box">E</div></ldesign-grid-item>
      <ldesign-grid-item span="4"><div class="demo-box">F</div></ldesign-grid-item>
    </ldesign-grid>
  </div>
</div>

```html
<ldesign-grid cols="12" gap="12">...</ldesign-grid>
<ldesign-grid cols="12" x-gap="16" y-gap="8">...</ldesign-grid>
```

## 折叠 / 展开（default-rows + toggle-span）

当 grid-item 较多时，可以设置 `default-rows` 指定初始展示的行数。组件会在最后一个位置自动追加一列作为“展开/收起”按钮。

<div class="demo-container">
  <ldesign-grid min-col-width="240" gap="16" default-rows="2" toggle-span="2">
    <ldesign-grid-item><div class="demo-box">1</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">2</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">3</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">4</div></ldesign-grid-item>
    <ldesign-grid-item span="2"><div class="demo-box">5</div></ldesign-grid-item>
    <ldesign-grid-item span="2"><div class="demo-box">6</div></ldesign-grid-item>
    <ldesign-grid-item span="2"><div class="demo-box">7</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">8</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">9</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">10</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">11</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">12</div></ldesign-grid-item>
    <ldesign-grid-item span="2"><div class="demo-box">13</div></ldesign-grid-item>
    <ldesign-grid-item span="2"><div class="demo-box">14</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">15</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">16</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">17</div></ldesign-grid-item>
    <ldesign-grid-item><div class="demo-box">18</div></ldesign-grid-item>
  </ldesign-grid>
</div>

```html
<ldesign-grid min-col-width="240" gap="16" default-rows="2" toggle-span="2">
  <!-- 多个 grid-item，默认占 1 列，偶尔设置 span="2" -->
</ldesign-grid>
```

> 折叠时：只显示 `default-rows` 行，并在该行末尾添加“展开更多”按钮；
> 展开后：显示全部 grid-item，并在最后一个位置追加“收起”按钮，点击可回到折叠状态。

## 动态变更（运行时重排）

父级 `min-col-width/cols` 或某个子项的 `span` 发生变化时，Grid 会自动重新计算并更新每个子项的行与列位置。

```html
<ldesign-grid id="g" min-col-width="240" gap="12">
  <ldesign-grid-item>1</ldesign-grid-item>
  <ldesign-grid-item>2</ldesign-grid-item>
</ldesign-grid>

<script>
  // 调整列最小宽度，触发重排
  document.getElementById('g').setAttribute('min-col-width', '200')
</script>
```

## 嵌套栅格

可以在某个 `ldesign-grid-item` 内部再放一个 `ldesign-grid`，构建更复杂的布局。

<div class="demo-container">
  <ldesign-grid cols="12" gap="12">
    <ldesign-grid-item span="8">
      <div class="demo-box">
        <div style="margin-bottom:8px; font-weight:600;">主区域（8/12）</div>
        <ldesign-grid cols="12" gap="8">
          <ldesign-grid-item span="6"><div class="demo-box">6</div></ldesign-grid-item>
          <ldesign-grid-item span="6"><div class="demo-box">6</div></ldesign-grid-item>
          <ldesign-grid-item span="4"><div class="demo-box">4</div></ldesign-grid-item>
          <ldesign-grid-item span="8"><div class="demo-box">8</div></ldesign-grid-item>
        </ldesign-grid>
      </div>
    </ldesign-grid-item>
    <ldesign-grid-item span="4"><div class="demo-box">侧边栏（4/12）</div></ldesign-grid-item>
  </ldesign-grid>
</div>

```html
<ldesign-grid cols="12" gap="12">
  <ldesign-grid-item span="8">
    <ldesign-grid cols="12" gap="8">
      <ldesign-grid-item span="6">6</ldesign-grid-item>
      <ldesign-grid-item span="6">6</ldesign-grid-item>
      <ldesign-grid-item span="4">4</ldesign-grid-item>
      <ldesign-grid-item span="8">8</ldesign-grid-item>
    </ldesign-grid>
  </ldesign-grid-item>
  <ldesign-grid-item span="4">侧边栏</ldesign-grid-item>
</ldesign-grid>
```

## API

### ldesign-grid

| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `cols` | `number` | `24` | 一行的总列数 |
| `gap` | `number | string` | `-` | 同时设置横纵间距；数字默认为 px，也支持 `'1rem'` |
| `x-gap` | `number | string` | `-` | 列间距（优先级高于 `gap`） |
| `y-gap` | `number | string` | `-` | 行间距（优先级高于 `gap`） |

### ldesign-grid-item

| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `span` | `number` | `1` | 子项占用的列数，Grid 会根据 `cols` 与 `span` 自动计算其行、列位置 |

### 行列信息（调试）

计算完成后，Grid 会为每个 `ldesign-grid-item` 添加以下属性，便于调试：
- `data-row`: 所在行（从 1 开始）
- `data-col-start`: 列起始位置（从 1 开始）
- `data-span`: 实际跨越列数（已按 `cols` 限制）

<style>
.demo-container { display: grid; gap: 16px; }
.demo-row { display: grid; gap: 8px; }
.demo-label { font-size: 12px; color: var(--vp-c-text-2); }
.demo-box { background: var(--vp-c-bg-soft); border: 1px dashed var(--vp-c-divider); border-radius: 6px; padding: 12px; text-align: center; }
</style>
### ldesign-col（列/子项）

| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `span` | `number` | `1` | 跨越的列数，自动限制在当前行/全局列数范围内 |

## 兼容说明

- 仍保留 `ldesign-grid-item` 用于直接在 Grid 内布局的简写方式，但推荐优先使用 `Row/Col` 结构，语义更清晰、可扩展性更好。

<style>
.demo-container { display: grid; gap: 16px; }
.demo-row { display: grid; gap: 8px; }
.demo-label { font-size: 12px; color: var(--vp-c-text-2); }
.demo-box { background: var(--vp-c-bg-soft); border: 1px dashed var(--vp-c-divider); border-radius: 6px; padding: 12px; text-align: center; }
</style>

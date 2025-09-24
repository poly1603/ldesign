# Pagination 分页

用于数据集的分页展示，提供页码切换、快速跳转、每页条数切换等能力。

> 组件标签：`<ldesign-pagination>`。

## 基础用法
<div class="demo-container">
  <ldesign-pagination total="125"></ldesign-pagination>
</div>

```html
<ldesign-pagination total="125"></ldesign-pagination>
```

## 受控与非受控
- 非受控：通过 `default-current`、`default-page-size` 初始化，内部管理状态。
- 受控：传入 `current`、`page-size`，配合事件 `ldesignChange` / `ldesignPageSizeChange` 同步外部状态。

<div class="demo-container">
  <ldesign-pagination id="pager-controlled" total="308" current="2" page-size="20" show-size-changer></ldesign-pagination>
</div>

```html
<ldesign-pagination id="pager-controlled" total="308" current="2" page-size="20" show-size-changer></ldesign-pagination>
<script>
  const p = document.getElementById('pager-controlled')
  p.addEventListener('ldesignChange', e => {
    const { page } = e.detail
    // 示例：把 page 写回属性，完成受控同步
    p.setAttribute('current', String(page))
  })
  p.addEventListener('ldesignPageSizeChange', e => {
    const { pageSize } = e.detail
    p.setAttribute('page-size', String(pageSize))
  })
</script>
```

## 快速跳转
<div class="demo-container">
  <ldesign-pagination total="308" show-quick-jumper></ldesign-pagination>
</div>

```html
<ldesign-pagination total="308" show-quick-jumper></ldesign-pagination>
```

## 切换每页条数
<div class="demo-container">
  <ldesign-pagination total="308" show-size-changer page-size-options="[10,20,50,100]"></ldesign-pagination>
</div>

```html
<ldesign-pagination total="308" show-size-changer page-size-options='[10,20,50,100]'></ldesign-pagination>
```

## 简洁模式
<div class="demo-container">
  <ldesign-pagination total="308" simple></ldesign-pagination>
</div>

```html
<ldesign-pagination total="308" simple></ldesign-pagination>
```

## 禁用与隐藏单页
<div class="demo-container demo-row">
  <ldesign-pagination total="25" disabled></ldesign-pagination>
  <ldesign-pagination total="8" hide-on-single-page></ldesign-pagination>
</div>

```html
<ldesign-pagination total="25" disabled></ldesign-pagination>
<ldesign-pagination total="8" hide-on-single-page></ldesign-pagination>
```

## 显示总数/页信息 + 下拉式每页条数（参考样式）
<div class="demo-container">
  <div class="demo-row" style="align-items:center;">
    <span class="demo-label" style="min-width:auto; margin-right:12px;">共 100 条数据</span>
    <ldesign-pagination total="100" show-total total-text="共 {total} 条" show-size-changer size-changer-type="dropdown" page-size-options='[5,10,20,50]' page-size="5"></ldesign-pagination>
  </div>
  <div class="demo-row" style="align-items:center;">
    <span class="demo-label" style="min-width:auto; margin-right:12px;">共 36 条数据</span>
    <ldesign-pagination total="36" show-total total-text="共 {total} 条" show-size-changer size-changer-type="dropdown" page-size-options='[10,20,50]' page-size="10" show-first-last current="2"></ldesign-pagination>
  </div>
</div>

```html
<!-- 参考样式：总数 + 下拉式每页条数 + 首页/末页按钮 -->
<div style="display:flex; align-items:center; gap:16px;">
  <span>共 100 条数据</span>
  <ldesign-pagination total="100" show-total show-size-changer size-changer-type="dropdown" page-size-options='[5,10,20,50]' page-size="5"></ldesign-pagination>
</div>
<div style="display:flex; align-items:center; gap:16px;">
  <span>共 36 条数据</span>
  <ldesign-pagination total="36" current="2" show-total show-size-changer size-changer-type="dropdown" page-size-options='[10,20,50]' page-size="10" show-first-last></ldesign-pagination>
</div>
```

## 事件
- `ldesignChange`：页码变化时触发，参数 `{ page, pageSize }`
- `ldesignPageSizeChange`：每页条数变化时触发，参数 `{ pageSize, page }`

<div class="demo-container">
  <ldesign-pagination id="pager-events" total="125"></ldesign-pagination>
  <p id="pager-events-text">当前：1</p>
</div>

```html
<ldesign-pagination id="pager-events" total="125"></ldesign-pagination>
<p id="pager-events-text">当前：1</p>
<script>
  const p = document.getElementById('pager-events')
  const text = document.getElementById('pager-events-text')
  p.addEventListener('ldesignChange', e => {
    const { page, pageSize } = e.detail
    text.textContent = `当前：${page}（每页 ${pageSize} 条）`
  })
</script>
```

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const p = document.getElementById('pager-controlled')
  if (p) {
    p.addEventListener('ldesignChange', e => {
      const { page } = e.detail
      p.setAttribute('current', String(page))
    })
    p.addEventListener('ldesignPageSizeChange', e => {
      const { pageSize } = e.detail
      p.setAttribute('page-size', String(pageSize))
    })
  }

  const p2 = document.getElementById('pager-events')
  const text = document.getElementById('pager-events-text')
  if (p2 && text) {
    p2.addEventListener('ldesignChange', e => {
      const { page, pageSize } = e.detail
      text.textContent = `当前：${page}（每页 ${pageSize} 条）`
    })
  }
})
</script>

## API

### 属性

| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `total` | `number` | `0` | 总条目数 |
| `current` | `number` | - | 当前页（受控） |
| `default-current` | `number` | `1` | 默认当前页（非受控） |
| `page-size` | `number` | - | 每页条数（受控） |
| `default-page-size` | `number` | `10` | 默认每页条数（非受控） |
| `show-size-changer` | `boolean` | `false` | 是否显示每页条数切换 |
| `size-changer-type` | `'native' | 'dropdown'` | `'dropdown'` | 每页条数切换器类型 |
| `page-size-options` | `number[] | string` | `[10,20,50,100]` | 页大小选项，数组或逗号分隔/JSON 字符串 |
| `page-size-text` | `string` | `'{size} 条/页'` | dropdown 模式下的显示模板 |
| `show-quick-jumper` | `boolean` | `false` | 是否显示快速跳转 |
| `simple` | `boolean` | `false` | 简洁模式 |
| `show-first-last` | `boolean` | `false` | 是否显示首页/末页按钮 |
| `hide-on-single-page` | `boolean` | `false` | 仅一页时是否隐藏 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `size` | `'small' | 'medium' | 'large'` | `'medium'` | 尺寸 |
| `show-total` | `boolean` | `false` | 是否显示总数文案 |
| `total-text` | `string` | `'共 {total} 条'` | 总数文案模板，支持 `total/rangeStart/rangeEnd` |
| `page-text` | `string` | `'{current}/{pageCount} 页'` | 简洁模式页信息模板 |

### 事件

| 事件名 | 说明 | 回调参数 |
|---|---|---|
| `ldesignChange` | 页码变化时触发 | `{ page: number; pageSize: number }` |
| `ldesignPageSizeChange` | 每页条数变化时触发 | `{ pageSize: number; page: number }` |

### 无障碍
- 容器 `role="navigation"`、`aria-label="分页导航"`
- 当前页按钮带 `aria-current="page"`
- 提供键盘操作：Left/Right 切换，Home/End 到首尾

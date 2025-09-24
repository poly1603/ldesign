---
outline: deep
---

# 主题定制

LDesign WebComponent 使用 CSS 变量提供主题能力。你可以在全局（如 :root 或 body）或容器范围内覆盖变量，实现品牌化。

## 常用变量

- --ld-primary：主色
- --ld-border：边框色
- --ld-card-bg：卡片背景
- --ld-text：正文文本
- --ld-text-3：弱文本

## 全局覆盖

```css
:root {
  --ld-primary: #5b8ff9;
  --ld-border: #e5e7eb;
  --ld-card-bg: #ffffff;
}
```

## 在 Tabs 中应用

```html
<style>
  .my-tabs-scope {
    --ld-primary: #10b981; /* 绿色主色 */
  }
</style>
<div class="my-tabs-scope">
  <ldesign-tabs type="card" default-value="a">
    <ldesign-tab-panel name="a" label="A">内容 A</ldesign-tab-panel>
    <ldesign-tab-panel name="b" label="B">内容 B</ldesign-tab-panel>
  </ldesign-tabs>
</div>
```

## 暗色模式（示例）

```css
html.dark {
  --ld-primary: #a78bfa;
  --ld-border: #374151;
  --ld-card-bg: #111827;
  --ld-text: #e5e7eb;
  --ld-text-3: #9ca3af;
}
```
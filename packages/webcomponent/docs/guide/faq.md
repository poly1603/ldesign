---
outline: deep
---

# 常见问题（FAQ）

## Tabs 如何默认选中某一项？

使用 default-value（非受控）或 value（受控）。

```html
<ldesign-tabs default-value="profile">
  <ldesign-tab-panel name="home" label="首页">…</ldesign-tab-panel>
  <ldesign-tab-panel name="profile" label="资料">…</ldesign-tab-panel>
</ldesign-tabs>
```

## 如何监听切换事件？

监听 ldesignChange 事件，detail 为激活的 name。

```html
<ldesign-tabs id="t" default-value="a">
  <ldesign-tab-panel name="a" label="A">A</ldesign-tab-panel>
  <ldesign-tab-panel name="b" label="B">B</ldesign-tab-panel>
</ldesign-tabs>
<script>
  document.getElementById('t').addEventListener('ldesignChange', e => console.log(e.detail));
</script>
```

## 文档构建报 dead link？

请确保被引用的文档存在，或在 VitePress 配置中设置 ignoreDeadLinks。
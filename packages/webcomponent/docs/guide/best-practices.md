---
outline: deep
---

# 最佳实践

本文总结在使用 LDesign WebComponent 时的一些建议与规范，帮助你写出更健壮、可维护的代码。

## 通用

- 受控优先：涉及状态的组件（如 Tabs、Select、RadioGroup）推荐使用受控模式（value + 事件）来统一管理状态。
- 语义与无障碍：注意 role、aria-*、键盘交互；尽量为可点击元素使用 button。
- 样式隔离：尽量通过 CSS 变量覆盖风格，避免过度依赖内部结构类名。
- 动静分离：将数据计算逻辑放在宿主框架（如 React/Vue）或业务层，组件负责展示与交互。

## Tabs 相关建议

- name 唯一：每个 `ldesign-tab-panel` 的 name 应唯一且稳定，便于受控管理。
- 懒加载：复杂内容可自行在首次激活后渲染，避免初次渲染压力过大。
- 键盘导航：横向用左右键，纵向用上下键；Home/End 跳到首尾。

### 受控示例

```html
<div>
  <ldesign-button id="go-a">切换到 A</ldesign-button>
  <ldesign-button id="go-b" type="secondary">切换到 B</ldesign-button>
</div>
<ldesign-tabs id="tabs-best" value="a">
  <ldesign-tab-panel name="a" label="面板 A">A 内容</ldesign-tab-panel>
  <ldesign-tab-panel name="b" label="面板 B">B 内容</ldesign-tab-panel>
</ldesign-tabs>
<script>
  const tabs = document.getElementById('tabs-best');
  document.getElementById('go-a').addEventListener('click', () => tabs.value = 'a');
  document.getElementById('go-b').addEventListener('click', () => tabs.value = 'b');
</script>
```

## 性能

- 列表较大时，尽可能惰性渲染或使用虚拟滚动（自行实现）。
- 跨组件通信尽量使用事件，以减少紧耦合。

## 无障碍

- 为图标按钮设置 aria-label。
- 避免仅以颜色区分状态，必要时添加文本或图标辅助。
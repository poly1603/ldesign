# Picker 滚轮选择器

此页面为临时精简版，用于修复构建期的 Vue 解析冲突（Duplicate attribute）。

后续将在不影响构建的前提下逐步恢复完整示例与表格。

## 基本说明

`<ldesign-picker>` 为滚轮选择器 Web Component。以下为最简使用示例（仅展示为代码，不参与渲染）：

```html
<!-- 示例，仅作为代码展示，不会被解析为组件 -->
<ldesign-picker visible-items="5" options='[{"value":"01","label":"01"},{"value":"02","label":"02"}]'></ldesign-picker>
```

## 常用属性（简要）

```text
options: 选项数据（字符串或数组）
value/defaultValue: 当前值 / 默认值
visibleItems: 可视项目数（默认 5）
itemHeight: 行高（像素）
friction/resistance: 惯性摩擦/边界阻力
snapDuration: 吸附动画时长（毫秒）
```

## 后续计划

- 按模块逐步恢复完整示例与表格
- 所有示例将通过 ClientOnly 或实体转义，避免被 Vue 解析为模板
- 完整属性/事件/方法表将迁移到纯 Markdown 表格或代码块中

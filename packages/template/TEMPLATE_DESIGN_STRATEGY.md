# 模板设计策略指南

## 概述

并非所有模板都需要使用插槽。模板的设计应该根据其用途、复杂度和定制需求来决定。

## 模板分类

### 1. 基础模板 (Basic Templates)
**特点：**
- 简单、固定的布局
- 主要通过 props 配置
- 适合快速使用
- 最小化定制需求

**适用场景：**
- 简单的登录页
- 基础的错误页
- 加载页面
- 简单的成功/失败提示页

**示例：**
```vue
<!-- 基础模板：通过 props 配置 -->
<template>
  <div class="simple-login">
    <h1>{{ title }}</h1>
    <form>
      <!-- 固定的表单结构 -->
    </form>
  </div>
</template>
```

### 2. 灵活模板 (Flexible Templates)
**特点：**
- 提供有限的插槽
- 关键区域可定制
- 保持整体结构一致
- 平衡易用性和灵活性

**适用场景：**
- 标准仪表板
- 个人资料页
- 设置页面
- 列表页面

**示例：**
```vue
<!-- 灵活模板：提供关键插槽 -->
<template>
  <div class="dashboard">
    <header>
      <slot name="header">默认头部</slot>
    </header>
    <main>
      <slot>默认内容</slot>
    </main>
    <footer>
      <slot name="footer">默认底部</slot>
    </footer>
  </div>
</template>
```

### 3. 高级模板 (Advanced Templates)
**特点：**
- 大量插槽支持
- 几乎所有部分可定制
- 提供完整的默认实现
- 适合复杂的定制需求

**适用场景：**
- 企业级登录系统
- 复杂的管理后台
- 多功能仪表板
- 电商产品页

**示例：**
```vue
<!-- 高级模板：全面插槽支持 -->
<template>
  <div class="advanced-template">
    <slot name="background">...</slot>
    <slot name="logo">...</slot>
    <slot name="header">...</slot>
    <slot name="mainContent">...</slot>
    <slot name="sidebar">...</slot>
    <slot name="footer">...</slot>
    <slot name="extra">...</slot>
  </div>
</template>
```

## 现有模板改造建议

### 登录模板 (login)

#### `login/desktop/default` - 保持简单
- **保持现状**：作为基础模板
- 通过 props 配置即可
- 适合快速集成

#### `login/desktop/split` - 适度增强
- **建议改造**：添加 2-3 个关键插槽
- `logo` 插槽：品牌定制
- `form` 插槽：表单定制
- `footer` 插槽：底部链接

#### `login/desktop/advanced` - 完全定制（已实现）
- **已完成**：提供全面的插槽支持
- 适合企业级定制需求

### 仪表板模板 (dashboard)

#### `dashboard/desktop/default` - 适度增强
- **建议改造**：添加关键插槽
```vue
<template>
  <div class="dashboard">
    <!-- 保持现有结构 -->
    <header>
      <slot name="header-left">
        <h1>{{ title }}</h1>
      </slot>
      <slot name="header-right">
        <div class="user-info">{{ username }}</div>
      </slot>
    </header>
    
    <aside>
      <slot name="sidebar">
        <!-- 默认导航菜单 -->
      </slot>
    </aside>
    
    <main>
      <slot name="stats" :stats="stats">
        <!-- 默认统计卡片 -->
      </slot>
      <slot>
        <!-- 主内容区域 -->
      </slot>
    </main>
  </div>
</template>
```

#### `dashboard/desktop/sidebar` - 灵活配置
- **建议改造**：提供更多定制选项
- 保持侧边栏结构
- 允许定制菜单项和内容区域

### 移动端模板

移动端模板应该更加注重性能和简洁性：

- **优先使用 props**：减少运行时开销
- **有限的插槽**：只在必要时提供
- **预设样式**：确保移动端体验

## 最佳实践

### 1. 渐进式定制
```typescript
// config.ts 中声明支持的插槽
export default {
  name: 'template-name',
  // 明确声明支持的插槽
  slots: {
    header: {
      description: '头部区域',
      required: false,
      props: ['title', 'user']
    },
    content: {
      description: '主内容区域',
      required: false
    }
  }
}
```

### 2. 默认内容策略
- **始终提供默认内容**：确保模板开箱即用
- **默认内容要实用**：不仅仅是占位符
- **样式继承**：插槽内容应该继承模板样式

### 3. 插槽命名规范
- 使用语义化命名：`header`、`footer`、`sidebar`
- 功能性命名：`loginPanel`、`userMenu`、`searchBar`
- 避免通用命名：`slot1`、`area1`

### 4. 文档化
每个支持插槽的模板都应该提供：
- 插槽列表和说明
- 插槽 props 说明
- 使用示例
- 截图或预览

## 实施计划

### 第一阶段：评估现有模板
- [x] `login/desktop/advanced` - 已完成
- [ ] 评估其他模板的定制需求
- [ ] 收集用户反馈

### 第二阶段：渐进式改造
1. **保持基础模板**（30%）
   - 简单模板保持 props 配置
   - 确保向后兼容

2. **增强核心模板**（50%）
   - 为常用模板添加关键插槽
   - 提供实用的默认实现

3. **创建高级版本**（20%）
   - 为有需求的模板创建高级版本
   - 提供完整的插槽支持

### 第三阶段：工具支持
- [ ] 模板预览工具
- [ ] 插槽配置生成器
- [ ] VSCode 插件支持

## 决策矩阵

| 模板类型 | Props配置 | 插槽支持 | 适用场景 | 维护成本 |
|---------|----------|---------|---------|---------|
| 基础模板 | ✅ 主要 | ❌ 极少 | 快速开发 | 低 |
| 灵活模板 | ✅ 支持 | ⚡ 关键区域 | 标准项目 | 中 |
| 高级模板 | ⚡ 辅助 | ✅ 全面 | 企业定制 | 高 |

## 总结

**核心原则：**
1. **不要过度设计** - 简单的需求用简单的方案
2. **渐进增强** - 从基础到高级，提供选择
3. **保持一致性** - 同类模板保持相似的设计模式
4. **文档优先** - 清晰的文档比复杂的功能更重要

**推荐策略：**
- 70% 的模板保持简单（props 配置）
- 20% 的模板提供适度定制（关键插槽）
- 10% 的模板支持完全定制（全面插槽）

这样可以满足不同层次的需求，同时保持系统的可维护性。
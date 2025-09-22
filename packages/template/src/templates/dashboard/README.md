# Dashboard 模板框架

Dashboard模板框架提供了基础的后台管理界面布局，包含头部、侧边栏、内容区域和底部等区域。所有内容通过插槽自定义。

## 特性

- 🎨 **基础布局框架** - 提供标准的Dashboard布局结构
- 📱 **响应式设计** - 适配不同屏幕尺寸
- 🔧 **完全插槽化** - 所有区域都通过插槽自定义
- 🎯 **轻量级实现** - 专注于布局，移除冗余功能
- ⚡ **高性能** - 简化实现，提升性能

## 模板列表

### 桌面端
- `desktop/default` - 默认桌面端Dashboard布局框架

## 使用方式

```vue
<template>
  <DashboardTemplate
    :show-sidebar="true"
    :collapsible-sidebar="true"
    primary-color="#1890ff"
    secondary-color="#40a9ff"
  >
    <!-- 自定义Logo区域 -->
    <template #header-logo>
      <div class="custom-logo">
        <img src="/logo.png" alt="Logo">
        <h1>我的系统</h1>
      </div>
    </template>

    <!-- 自定义导航区域 -->
    <template #header-nav>
      <nav class="custom-nav">
        <a href="/">首页</a>
        <a href="/dashboard">控制台</a>
      </nav>
    </template>

    <!-- 自定义用户信息区域 -->
    <template #header-user>
      <div class="user-menu">
        <span>欢迎，张三</span>
        <button>退出</button>
      </div>
    </template>

    <!-- 自定义侧边栏菜单 -->
    <template #sidebar-menu>
      <ul class="menu-list">
        <li><a href="/dashboard">控制台</a></li>
        <li><a href="/users">用户管理</a></li>
        <li><a href="/settings">设置</a></li>
      </ul>
    </template>

    <!-- 主要内容区域 -->
    <template #content>
      <div class="page-content">
        <h2>欢迎来到控制台</h2>
        <p>这里是主要内容区域</p>
      </div>
    </template>

    <!-- 自定义底部区域 -->
    <template #footer>
      <div class="custom-footer">
        <p>&copy; 2024 我的公司. 保留所有权利.</p>
      </div>
    </template>
  </DashboardTemplate>
</template>
```

## 配置选项

### 基础配置
- `primaryColor` - 主要颜色（默认：var(--ldesign-brand-color)）
- `secondaryColor` - 次要颜色（默认：var(--ldesign-brand-color-6)）

### 布局配置
- `showSidebar` - 是否显示侧边栏（默认：true）
- `collapsibleSidebar` - 是否可折叠侧边栏（默认：true）
- `sidebarCollapsed` - 侧边栏默认是否折叠（默认：false）
- `enableAnimations` - 是否启用动画效果（默认：true）

## 插槽说明

### 头部区域
- `header-logo` - Logo和标题区域（可选）
- `header-nav` - 导航区域（可选）
- `header-user` - 用户信息区域（可选）

### 侧边栏
- `sidebar-menu` - 侧边栏菜单内容（可选，默认显示占位符）

### 主要区域
- `content` - 主要内容区域（必需，默认显示占位符）

### 底部区域
- `footer` - 底部内容（可选）

## 样式定制

模板使用CSS变量，可以通过覆盖变量来定制样式：

```css
:root {
  --primary-color: #1890ff;
  --secondary-color: #40a9ff;
  --sidebar-width: 240px;
}
```

## 响应式设计

模板在不同屏幕尺寸下会自动调整布局：

- **桌面端** (>1200px) - 完整布局
- **平板端** (768px-1200px) - 适配中等屏幕
- **移动端** (<768px) - 侧边栏变为抽屉式

## 注意事项

1. `content` 插槽是必需的，其他插槽都是可选的
2. 在移动端，侧边栏会自动变为抽屉式布局
3. 建议为用户信息提供头像URL以获得更好的视觉效果
4. 可以通过CSS变量轻松定制主题色彩

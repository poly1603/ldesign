# @ldesign/template 模板系统集成说明

## 概述

本项目已成功集成 `@ldesign/template` 包，实现了以下功能：
- ✅ 内置多个设备类型的登录模板（桌面端、移动端、平板端）
- ✅ 根据设备类型自动切换模板渲染
- ✅ 支持手动切换当前分类和设备下的其他模板
- ✅ 模板切换器UI组件集成

## 核心实现

### 1. 简单集成 (main.ts)

```typescript
import { createTemplatePlugin } from '@ldesign/template'

// 创建 Vue 应用
const app = createApp(App)

// 一行代码完成所有配置！
app.use(createTemplatePlugin())

// 或者使用自定义配置
app.use(createTemplatePlugin({
  debug: true,                     // 开启调试信息
  registerBuiltinTemplates: true,  // 自动注册内置模板（默认已开启）
  cache: {
    enabled: true,
    maxSize: 100                   // 缓存最大模板数
  },
  registerCustomTemplates: (manager) => {
    // 可选：注册自定义模板
    manager.register(...)
  }
}))
```

**插件自动完成以下工作：**
- ✅ 创建模板管理器
- ✅ 注册所有内置模板（登录、仪表板等）
- ✅ 注册全局Vue组件（TemplateRenderer、EnhancedTemplateSwitcher等）
- ✅ 设置设备检测和响应式支持
- ✅ 启用模板缓存和性能优化

### 2. 登录页面实现 (Login.vue)

```vue
<template>
  <TemplateRenderer 
    category="login" 
    :template-name="currentTemplate || undefined" 
    :responsive="true"
    :props="templateProps" 
    @template-loaded="handleTemplateLoaded"
  >
    <template #switcher>
      <EnhancedTemplateSwitcher 
        category="login" 
        :current-template="currentTemplate" 
        :config="switcherConfig"
        @change="handleTemplateChange" 
        @device-change="handleDeviceChange" 
      />
    </template>
  </TemplateRenderer>
</template>
```

### 3. Vite 配置 (vite.config.ts)

```typescript
resolve: {
  alias: {
    '@ldesign/template/src': resolve(__dirname, '../packages/template/src'),
    '@ldesign/template': resolve(__dirname, '../packages/template/src'),
  }
}
```

## 内置模板列表

### 登录模板 (Login Templates)

#### 桌面端 (Desktop)
- **default** - 默认登录页：简洁大方的桌面端登录页面
- **split** - 分栏式登录页：左右分栏布局，适合展示品牌形象

#### 移动端 (Mobile)  
- **default** - 移动端登录页：适配移动设备的登录页面
- **card** - 卡片式登录页：带有顶部装饰背景的卡片式登录页面

#### 平板端 (Tablet)
- **simple** - 平板简单登录页：适合平板设备的简洁登录页面
- **landscape** - 平板横屏登录页：适合平板横屏模式的分栏式登录页面

## 关键特性

1. **响应式设计**
   - 自动检测设备类型（桌面端/移动端/平板端）
   - 根据设备类型自动选择合适的默认模板

2. **模板切换器**
   - 支持下拉框、按钮组、卡片三种选择器样式
   - 可配置位置、动画效果、显示信息等
   - 支持折叠/展开功能

3. **性能优化**
   - 模板懒加载
   - 缓存机制
   - 智能预加载

## 使用示例

### 访问登录页面
打开浏览器访问：http://localhost:8889/login

### 访问模板演示页面  
打开浏览器访问：http://localhost:8889/template-demo

## 切换器配置选项

```typescript
const switcherConfig: SwitcherConfig = {
  position: 'top-right',        // 位置：top-left | top-right | bottom-left | bottom-right
  style: 'floating',             // 样式：minimal | card | floating | embedded
  selectorType: 'dropdown',      // 选择器类型：dropdown | buttons | cards
  collapsible: false,            // 是否可折叠
  showDevice: true,              // 显示设备信息
  showLabel: true,               // 显示标签
  showInfo: true,                // 显示作者和版本信息
  animation: 'fade',             // 动画效果：fade | slide | scale | none
  animationDuration: 300,        // 动画持续时间(ms)
  sortBy: 'default',            // 排序方式：name | displayName | default | custom
  sortOrder: 'asc',             // 排序顺序：asc | desc
}
```

## 扩展开发

### 添加自定义模板

如需添加自定义模板，可以在初始化后注册：

```typescript
templateManager.register(
  'login',           // 分类
  'desktop',         // 设备类型
  'custom',          // 模板名称
  {
    displayName: '自定义登录页',
    description: '自定义的登录页面模板',
    version: '1.0.0',
    author: 'Your Name',
    tags: ['login', 'desktop', 'custom'],
    isDefault: false,
  },
  () => import('./path/to/custom/template.vue')
)
```

## 注意事项

1. 模板组件会自带样式，无需额外导入CSS文件
2. 设备检测是自动的，但也可以手动控制
3. 模板切换有过渡动画，可通过配置自定义
4. 所有模板都支持传入props来定制内容

## 相关文档

- [@ldesign/template 包文档](../packages/template/README.md)
- [模板开发指南](../packages/template/docs/development.md)
- [API 参考](../packages/template/docs/api.md)
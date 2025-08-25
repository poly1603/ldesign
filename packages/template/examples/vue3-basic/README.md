# @ldesign/template Vue3 基础示例

这是一个展示 `@ldesign/template` 高性能动态模板管理系统的基础示例项目。

## 功能特性

- 🚀 **动态模板加载** - 根据设备类型自动选择最适合的模板
- 📱 **响应式设计** - 支持桌面端、平板端、移动端自适应
- ⚡ **高性能缓存** - 智能缓存策略，提升加载速度
- 🔧 **Vue3 集成** - 完整的 Vue3 组合式API支持
- 📊 **性能监控** - 实时监控模板加载性能
- 🎨 **多种使用方式** - 支持组件、指令、组合式API等多种使用方式

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 预览生产版本

```bash
pnpm preview
```

## 项目结构

```
src/
├── main.ts                 # 应用入口
├── App.vue                 # 主应用组件
└── templates/              # 模板目录
    ├── login/              # 登录模板
    │   ├── desktop/        # 桌面端模板
    │   │   └── LoginForm.vue
    │   └── mobile/         # 移动端模板
    │       └── LoginForm.vue
    └── dashboard/          # 仪表板模板
        └── desktop/
            └── Dashboard.vue
```

## 使用示例

### 1. 组件方式

```vue
<template>
  <TemplateRenderer
    template="login"
    :device-type="currentDevice"
    :template-props="{ title: '用户登录' }"
    @template-loaded="onTemplateLoaded"
    @template-error="onTemplateError"
  />
</template>
```

### 2. 指令方式

```vue
<template>
  <div v-template="{ template: 'dashboard', deviceType: currentDevice }" />
</template>
```

### 3. 组合式API

```vue
<script setup>
import { useTemplate } from '@ldesign/template/vue'

const {
  templateComponent,
  loading,
  error,
  loadTemplate
} = useTemplate({
  template: 'dashboard',
  autoLoad: true
})
</script>
```

## 模板开发

### 模板命名规范

模板文件应按以下结构组织：

```
templates/
└── [category]/           # 模板分类
    └── [device]/         # 设备类型 (desktop/tablet/mobile)
        └── [Template].vue # 模板文件
```

### 模板元数据

每个模板可以包含元数据配置：

```vue
<script>
export default {
  name: 'LoginForm',
  meta: {
    category: 'login',
    deviceType: 'desktop',
    description: '桌面端登录表单',
    version: '1.0.0'
  }
}
</script>
```

## 配置选项

### 插件配置

```typescript
app.use(TemplatePlugin, {
  scanner: {
    scanPaths: ['src/templates/**/*.vue']
  },
  loader: {
    enableCache: true,
    preloadStrategy: 'critical'
  },
  deviceAdapter: {
    autoDetect: true,
    watchDeviceChange: true
  }
})
```

### 设备类型检测

系统会自动检测设备类型，也可以手动指定：

- `desktop` - 桌面端 (>1024px)
- `tablet` - 平板端 (768px-1024px)
- `mobile` - 移动端 (<768px)

## 性能优化

### 预加载策略

```typescript
// 预加载关键模板
await manager.preloadTemplate('login', 'mobile')

// 批量预加载
await manager.preloadTemplates([
  { category: 'login', deviceType: 'desktop' },
  { category: 'dashboard', deviceType: 'desktop' }
])
```

### 缓存管理

```typescript
// 清空特定模板缓存
manager.clearCache('login', 'mobile')

// 清空所有缓存
manager.clearCache()

// 获取缓存统计
const stats = manager.getCacheStats()
```

## 调试和监控

### 性能监控

```typescript
// 获取性能统计
const stats = manager.getPerformanceStats()
console.log('平均加载时间:', stats.averageLoadTime)
console.log('内存使用:', stats.memoryUsage)
```

### 事件监听

```typescript
// 监听模板加载事件
manager.on('template:loaded', (data) => {
  console.log('模板已加载:', data.template)
})

// 监听设备变化事件
manager.on('device:changed', (data) => {
  console.log('设备类型变化:', data.oldDevice, '->', data.newDevice)
})
```

## 最佳实践

1. **模板分离** - 为不同设备类型创建专门的模板
2. **懒加载** - 使用 `v-template-lazy` 指令实现懒加载
3. **预加载** - 预加载关键路径的模板
4. **缓存策略** - 合理配置缓存大小和TTL
5. **性能监控** - 定期检查模板加载性能

## 故障排除

### 常见问题

1. **模板未找到** - 检查模板路径和命名是否正确
2. **设备类型错误** - 确认设备检测逻辑是否正确
3. **缓存问题** - 尝试清空缓存重新加载
4. **性能问题** - 检查模板大小和加载策略

### 调试模式

```typescript
// 启用调试模式
const manager = new TemplateManager({
  debug: true,
  logger: {
    level: 'debug'
  }
})
```

## 更多资源

- [完整文档](../../docs)
- [API 参考](../../docs/api)
- [更多示例](../)
- [GitHub 仓库](https://github.com/ldesign/template)

## 许可证

MIT License

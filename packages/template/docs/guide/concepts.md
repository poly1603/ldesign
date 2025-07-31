# 基础概念

了解 LDesign Template 的核心概念，有助于更好地使用和扩展这个模板管理系统。

## 核心概念

### 模板 (Template)

模板是 LDesign Template 系统的基本单元，它是一个 Vue 组件，用于渲染特定的 UI 界面。

```typescript
// 模板的基本结构
interface Template {
  component: Component // Vue 组件
  config: TemplateConfig // 配置信息
  metadata: TemplateMetadata // 元数据
}
```

### 分类 (Category)

分类用于组织相关的模板，比如 `auth`（认证）、`dashboard`（仪表板）、`layout`（布局）等。

```
templates/
├── auth/          # 认证相关模板
├── dashboard/     # 仪表板模板
├── layout/        # 布局模板
└── form/          # 表单模板
```

### 设备类型 (Device)

支持三种设备类型，确保在不同设备上都有良好的用户体验：

- **desktop**: 桌面端（>= 1024px）
- **tablet**: 平板端（768px - 1023px）
- **mobile**: 移动端（< 768px）

### 模板标识符

每个模板都有唯一的标识符，由三部分组成：

```
{category}/{device}/{template}
```

例如：`auth/desktop/login`、`dashboard/mobile/admin`

## 系统架构

### 模板管理器 (TemplateManager)

模板管理器是系统的核心，负责：

- 模板扫描和注册
- 模板加载和缓存
- 设备检测和适配
- 错误处理和重试

```typescript
const manager = new TemplateManager({
  defaultDevice: 'desktop',
  autoScan: true,
  autoDetectDevice: true,
  cacheEnabled: true
})
```

### 缓存系统

内置 LRU 缓存机制，提高模板加载性能：

```typescript
// 缓存配置
{
  cacheEnabled: true,
  cacheSize: 50,           // 最多缓存 50 个模板
  cacheTTL: 10 * 60 * 1000 // 10 分钟过期
}
```

### 设备检测

自动检测用户设备类型，选择最适合的模板：

```typescript
// 检测方式
1. 视口宽度检测（优先）
2. User Agent 检测（备用）
3. 手动指定（覆盖）
```

## 模板生命周期

### 1. 扫描阶段

系统启动时自动扫描模板目录：

```typescript
// 扫描过程
1. 遍历模板目录
2. 读取配置文件
3. 验证模板结构
4. 注册到管理器
```

### 2. 加载阶段

当需要使用模板时：

```typescript
// 加载过程
1. 检查缓存
2. 动态导入组件
3. 验证组件有效性
4. 缓存组件实例
```

### 3. 渲染阶段

将模板组件渲染到页面：

```typescript
// 渲染过程
1. 解析模板属性
2. 创建组件实例
3. 挂载到目标元素
4. 处理事件和插槽
```

### 4. 销毁阶段

组件卸载时清理资源：

```typescript
// 清理过程
1. 卸载组件实例
2. 清理事件监听
3. 释放内存引用
4. 更新缓存状态
```

## 配置系统

### 模板配置

每个模板都有一个配置文件 `config.ts`：

```typescript
export const config: TemplateConfig = {
  name: 'login',
  title: '登录页面',
  description: '用户登录界面',
  version: '1.0.0',
  author: 'LDesign Team',
  category: 'auth',
  device: 'desktop',
  tags: ['登录', '认证'],
  
  // 属性定义
  props: {
    title: {
      type: 'string',
      default: '用户登录',
      description: '页面标题'
    }
  },
  
  // 兼容性
  compatibility: {
    vue: '>=3.2.0',
    browsers: ['Chrome >= 88']
  }
}
```

### 全局配置

系统级别的配置选项：

```typescript
interface TemplateManagerConfig {
  defaultDevice?: DeviceType
  autoScan?: boolean
  autoDetectDevice?: boolean
  cacheEnabled?: boolean
  cacheSize?: number
  cacheTTL?: number
  preloadEnabled?: boolean
  scanPaths?: string[]
  deviceBreakpoints?: DeviceBreakpoints
}
```

## 事件系统

### 模板事件

```typescript
// 监听模板事件
manager.on('template:load', (event) => {
  console.log('模板加载:', event.template)
})

manager.on('template:error', (event) => {
  console.error('模板错误:', event.error)
})

manager.on('template:switch', (event) => {
  console.log('模板切换:', event.from, '->', event.to)
})
```

### 设备事件

```typescript
// 监听设备变化
manager.on('device:change', (event) => {
  console.log('设备变化:', event.oldDevice, '->', event.newDevice)
})
```

## 扩展机制

### 自定义加载器

```typescript
// 自定义模板加载逻辑
manager.setLoader(async (category, device, template) => {
  // 自定义加载逻辑
  return await customLoadTemplate(category, device, template)
})
```

### 插件系统

```typescript
// 创建插件
const myPlugin = {
  name: 'my-plugin',
  install(manager) {
    // 扩展管理器功能
    manager.addFeature('customFeature', () => {
      // 自定义功能实现
    })
  }
}

// 使用插件
manager.use(myPlugin)
```

## 最佳实践

### 模板组织

1. **按功能分类**：将相关模板放在同一分类下
2. **设备优先**：优先考虑移动端体验
3. **版本管理**：使用语义化版本号
4. **文档完整**：提供详细的使用说明

### 性能优化

1. **懒加载**：使用动态导入减少初始包大小
2. **缓存策略**：合理配置缓存参数
3. **预加载**：预加载关键模板
4. **代码分割**：按路由分割模板代码

### 错误处理

1. **优雅降级**：提供备用模板
2. **错误边界**：使用 Vue 错误边界
3. **重试机制**：自动重试失败的加载
4. **用户反馈**：提供清晰的错误信息

## 下一步

- 学习 [模板管理](./template-management.md) 的高级功能
- 了解 [设备检测](./device-detection.md) 的工作原理
- 掌握 [缓存机制](./caching.md) 的配置方法
- 查看 [API 参考](../api/) 了解详细接口

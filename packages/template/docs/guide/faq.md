# 常见问题

本文档收集了使用 `@ldesign/template` 过程中的常见问题和解决方案。

## 🚀 安装和配置

### Q: 安装后无法正常使用，提示模块找不到？

**A:** 请检查以下几点：

1. **确认安装成功**：
```bash
npm list @ldesign/template
# 或
pnpm list @ldesign/template
```

2. **检查导入路径**：
```typescript
// ✅ 正确的导入方式
import { TemplateManager } from '@ldesign/template'
// ❌ 错误的导入方式
import { TemplateRenderer } from '@ldesign/template'

import { TemplateRenderer } from '@ldesign/template/vue'
```

3. **确认 TypeScript 配置**：
```json
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

### Q: Vue 插件注册后组件仍然无法使用？

**A:** 请确认插件正确注册：

```typescript
import { TemplatePlugin } from '@ldesign/template/vue'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// ✅ 正确注册
app.use(TemplatePlugin, {
  // 配置选项
})

app.mount('#app')
```

如果仍然无法使用，请检查：
- 是否在组件中正确使用组件名称
- 是否启用了全局组件注册
- 浏览器控制台是否有错误信息

## 📁 模板管理

### Q: 模板扫描不到我的文件？

**A:** 检查以下配置：

1. **扫描路径配置**：
```typescript
const manager = new TemplateManager({
  scanner: {
    scanPaths: [
      'src/templates/**/*.vue', // 确保路径正确
      'src/components/templates/**/*.vue'
    ]
  }
})
```

2. **文件命名规范**：
```
src/templates/
├── login/
│   ├── desktop/
│   │   └── LoginForm.vue  ✅ 正确
│   ├── mobile/
│   │   └── login.vue      ❌ 小写开头
│   └── tablet/
│       └── Login.tsx      ❌ 非 .vue 文件
```

3. **检查文件权限**：确保文件可读且路径正确

### Q: 如何调试模板扫描过程？

**A:** 启用调试模式：

```typescript
const manager = new TemplateManager({
  debug: true, // 启用调试日志
  scanner: {
    scanPaths: ['src/templates/**/*.vue']
  }
})

// 手动触发扫描并查看结果
const templates = await manager.scanTemplates()
console.log('扫描到的模板:', templates)
```

### Q: 模板加载失败，如何排查？

**A:** 按以下步骤排查：

1. **检查模板路径**：
```typescript
// 确认模板文件存在
const templatePath = 'src/templates/login/desktop/LoginForm.vue'
console.log('模板文件是否存在:', await fs.access(templatePath))
```

2. **查看错误详情**：
```typescript
manager.on('template:error', (error) => {
  console.error('模板加载错误:', {
    template: error.template,
    deviceType: error.deviceType,
    message: error.message,
    stack: error.stack
  })
})
```

3. **检查模板语法**：确保 Vue 组件语法正确，没有编译错误

## 📱 设备适配

### Q: 设备检测不准确怎么办？

**A:** 可以自定义设备检测逻辑：

```typescript
function customDetector() {
  const width = window.innerWidth
  const height = window.innerHeight
  const userAgent = navigator.userAgent

  // 自定义检测逻辑
  if (/iPhone|Android/.test(userAgent) && width <= 480) {
    return 'mobile'
  }

  if (/iPad/.test(userAgent) || (width <= 1024 && width > 768)) {
    return 'tablet'
  }

  return 'desktop'
}

const manager = new TemplateManager({
  deviceAdapter: {
    customDetector
  }
})
```

### Q: 如何处理设备切换时的状态保持？

**A:** 使用状态管理：

```vue
<script setup lang="ts">
import { inject, provide } from 'vue'

// 在父组件中提供状态
const templateState = reactive({
  formData: {},
  currentStep: 1,
  // 其他状态
})

provide('templateState', templateState)

// 在模板组件中注入状态
const state = inject('templateState')
</script>
```

### Q: 某个设备类型的模板不存在时如何处理？

**A:** 配置降级策略：

```typescript
const manager = new TemplateManager({
  loader: {
    fallbackStrategy: {
      mobile: ['tablet', 'desktop'],
      tablet: ['desktop', 'mobile'],
      desktop: ['tablet', 'mobile']
    }
  }
})
```

## 🚀 性能问题

### Q: 模板加载速度慢怎么优化？

**A:** 采用以下优化策略：

1. **启用缓存**：
```typescript
const manager = new TemplateManager({
  cache: {
    enabled: true,
    strategy: 'lru',
    maxSize: 50,
    ttl: 30 * 60 * 1000 // 30分钟
  }
})
```

2. **预加载关键模板**：
```typescript
// 应用启动时预加载
await manager.preloadTemplates([
  { category: 'login', deviceType: 'desktop' },
  { category: 'dashboard', deviceType: 'desktop' }
])
```

3. **使用懒加载**：
```vue
<template>
  <TemplateRenderer
    template="heavy-component"
    :lazy="true"
    :loading-threshold="200"
  />
</template>
```

### Q: 内存使用过高怎么办？

**A:** 优化缓存配置：

```typescript
const manager = new TemplateManager({
  cache: {
    maxSize: 20, // 减少缓存大小
    ttl: 10 * 60 * 1000, // 缩短过期时间
    strategy: 'lru' // 使用 LRU 策略
  }
})

// 定期清理缓存
setInterval(() => {
  manager.clearExpiredCache()
}, 5 * 60 * 1000) // 每5分钟清理一次
```

### Q: 如何监控性能指标？

**A:** 启用性能监控：

```typescript
const manager = new TemplateManager({
  performance: {
    enabled: true,
    sampleRate: 0.1, // 10% 采样
    reportInterval: 60000 // 每分钟报告
  }
})

manager.on('performance:report', (report) => {
  console.log('性能报告:', {
    averageLoadTime: report.averageLoadTime,
    cacheHitRate: report.cacheHitRate,
    memoryUsage: report.memoryUsage,
    errorRate: report.errorRate
  })
})
```

## 🔧 开发问题

### Q: 热更新不生效？

**A:** 检查以下配置：

1. **Vite 配置**：
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [vue()],
  server: {
    hmr: true // 确保 HMR 启用
  }
})
```

2. **模板文件监听**：
```typescript
const manager = new TemplateManager({
  scanner: {
    watchMode: process.env.NODE_ENV === 'development'
  }
})
```

### Q: TypeScript 类型错误？

**A:** 确保类型定义正确：

```typescript
// 确保导入类型
import type { DeviceType, TemplateInfo } from '@ldesign/template'

// 如果类型不存在，可以手动声明
declare module '@ldesign/template' {
  export interface CustomTemplateProps {
    // 自定义属性
  }
}
```

### Q: 在 SSR 环境中使用有问题？

**A:** 注意浏览器 API 的使用：

```typescript
// 检查运行环境
const isBrowser = typeof window !== 'undefined'

const manager = new TemplateManager({
  deviceAdapter: {
    autoDetect: isBrowser, // 只在浏览器中自动检测
    defaultDevice: 'desktop' // SSR 默认设备类型
  }
})

// 在组件中使用
onMounted(() => {
  // 只在客户端执行
  if (isBrowser) {
    manager.updateDeviceType()
  }
})
```

## 🎨 样式问题

### Q: 样式冲突怎么解决？

**A:** 使用作用域样式：

```vue
<template>
  <div class="my-template">
    <!-- 内容 -->
  </div>
</template>

<style scoped>
/* 使用 scoped 避免样式冲突 */
.my-template {
  /* 样式 */
}
</style>

<!-- 或使用 CSS Modules -->
<style module>
.container {
  /* 样式 */
}
</style>
```

### Q: 响应式样式不生效？

**A:** 检查媒体查询：

```css
/* 确保断点正确 */
@media (max-width: 768px) {
  .mobile-only {
    display: block;
  }
}

@media (min-width: 769px) {
  .mobile-only {
    display: none;
  }
}
```

## 🔍 调试技巧

### Q: 如何调试模板渲染过程？

**A:** 使用调试工具：

```typescript
// 1. 启用详细日志
const manager = new TemplateManager({
  debug: true,
  verbose: true
})

// 2. 监听所有事件
manager.on('*', (eventName, ...args) => {
  console.log(`事件: ${eventName}`, args)
})

// 3. 使用 Vue DevTools
// 在模板组件中添加调试信息
export default {
  name: 'MyTemplate',
  __debugInfo: {
    category: 'login',
    deviceType: 'desktop',
    version: '1.0.0'
  }
}
```

### Q: 如何测试模板在不同设备上的表现？

**A:** 使用模拟工具：

```typescript
// 模拟不同设备
function simulateDevice(deviceType: DeviceType) {
  const sizes = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1200, height: 800 }
  }

  const size = sizes[deviceType]

  // 模拟窗口大小
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: size.width
  })

  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: size.height
  })

  // 触发 resize 事件
  window.dispatchEvent(new Event('resize'))
}

// 测试不同设备
simulateDevice('mobile')
await manager.loadTemplate('login', 'mobile')
```

## 📞 获取帮助

如果以上解决方案都无法解决你的问题，可以通过以下方式获取帮助：

1. **查看文档**：
   - [API 参考](/api/index.md)
   - [使用指南](/guide/getting-started.md)
   - [示例代码](/examples/basic.md)

2. **检查 Issues**：
   - 在 GitHub 仓库中搜索相关问题
   - 查看已关闭的 Issues

3. **提交 Issue**：
   - 提供详细的错误信息
   - 包含复现步骤
   - 附上相关代码片段

4. **社区讨论**：
   - 参与社区讨论
   - 分享使用经验

## 🔄 版本升级

### Q: 如何升级到新版本？

**A:** 按照以下步骤升级：

1. **查看更新日志**：了解破坏性变更
2. **备份项目**：确保可以回滚
3. **更新依赖**：
```bash
npm update @ldesign/template
# 或
pnpm update @ldesign/template
```
4. **测试功能**：确保所有功能正常
5. **更新代码**：根据新版本 API 调整代码

### Q: 升级后出现兼容性问题？

**A:** 检查以下几点：

1. **API 变更**：查看是否有 API 重命名或删除
2. **配置格式**：确认配置选项是否有变化
3. **依赖版本**：检查 Vue 等依赖版本兼容性
4. **类型定义**：更新 TypeScript 类型定义

如果问题仍然存在，可以考虑：
- 回滚到之前的版本
- 查看迁移指南
- 提交 Issue 寻求帮助

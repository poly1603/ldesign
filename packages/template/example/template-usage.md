# 模板系统使用指南

## 问题背景

之前的模板系统存在以下问题：
1. 多次调用 `import.meta.glob`，性能低下
2. 打包后 `.vue` 文件编译成 `.js`，导致模板无法找到
3. 代码组织混乱，没有统一的管理机制

## 解决方案

我们创建了一个统一的模板注册和管理系统，主要包含：

### 1. 模板注册器 (template-registry.ts)
- 统一管理所有模板的注册和导入
- 只调用一次 `import.meta.glob`
- 支持开发环境和生产环境的自动切换

### 2. 模板导出文件 (templates/index.ts)
- 明确导出所有内置模板
- 提供静态导入，确保打包后正常工作
- 自动注册所有内置模板

### 3. 改进的扫描器 (scanner/index.ts)
- 使用模板注册器而不是直接调用 `import.meta.glob`
- 统一的模板获取接口

## 使用方法

### 在开发环境中

```typescript
import { useTemplate, templateRegistry } from '@ldesign/template'

// 模板会自动从 import.meta.glob 扫描并注册
const { currentComponent, switchTemplate } = useTemplate({
  category: 'login',
  device: 'desktop'
})
```

### 在生产环境中（打包后）

```typescript
import { 
  useTemplate, 
  registerBuiltInTemplates,
  getTemplateComponent 
} from '@ldesign/template'

// 确保内置模板已注册（通常在模块加载时自动完成）
registerBuiltInTemplates()

// 方法1：使用 useTemplate Hook
const { currentComponent, switchTemplate } = useTemplate({
  category: 'login',
  device: 'desktop'
})

// 方法2：直接获取模板组件
const LoginComponent = getTemplateComponent('login', 'desktop', 'default')
```

### 注册自定义模板

```typescript
import { registerTemplate } from '@ldesign/template'
import MyCustomTemplate from './my-custom-template.vue'
import myConfig from './my-custom-config'

// 注册单个模板
registerTemplate(
  'custom-category',
  'desktop',
  'my-template',
  myConfig,
  MyCustomTemplate
)

// 或者批量注册
import { registerTemplates } from '@ldesign/template'

registerTemplates([
  {
    category: 'custom',
    device: 'desktop',
    name: 'template1',
    config: config1,
    component: Component1
  },
  {
    category: 'custom',
    device: 'mobile',
    name: 'template2',
    config: config2,
    component: Component2
  }
])
```

### 按需导入特定模板

```typescript
// 直接导入特定的模板组件
import { 
  LoginDesktopDefaultComponent,
  LoginDesktopModernComponent 
} from '@ldesign/template'

// 在组件中使用
export default {
  components: {
    LoginTemplate: LoginDesktopDefaultComponent
  }
}
```

## 打包配置

确保你的打包工具正确处理 Vue 文件：

### Vite 配置
```javascript
// vite.config.js
import vue from '@vitejs/plugin-vue'

export default {
  plugins: [vue()],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
}
```

### Rollup 配置
```javascript
// rollup.config.js
import vue from '@rollup/plugin-vue'
import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/index.ts',
  plugins: [
    vue(),
    typescript()
  ],
  external: ['vue'],
  output: [
    {
      format: 'esm',
      file: 'dist/index.mjs'
    },
    {
      format: 'cjs',
      file: 'dist/index.js'
    }
  ]
}
```

## 核心改进点

### 1. 统一的 import.meta.glob 调用
- 之前：多个地方重复调用，影响性能
- 现在：只在 `template-registry.ts` 中调用一次

### 2. 生产环境兼容
- 之前：依赖 `import.meta.glob` 扫描 `.vue` 文件，打包后失效
- 现在：提供静态导入作为回退，确保打包后正常工作

### 3. 更好的代码组织
- 之前：扫描逻辑分散在多处
- 现在：统一的注册器管理所有模板

### 4. 灵活的使用方式
- 支持自动扫描（开发环境）
- 支持静态导入（生产环境）
- 支持动态注册（自定义模板）
- 支持按需导入（优化包体积）

## 性能优化

1. **减少重复扫描**：使用单例模式的注册器，避免重复初始化
2. **懒加载支持**：模板组件支持异步加载
3. **缓存机制**：已加载的模板会被缓存，避免重复加载
4. **Tree-shaking**：支持按需导入，减小打包体积

## 注意事项

1. 确保在使用模板前，内置模板已经注册（通常自动完成）
2. 自定义模板需要手动注册
3. 在 SSR 环境中，需要注意客户端和服务端的注册一致性
4. 打包时确保 Vue 文件被正确编译

## 迁移指南

如果你的项目之前使用旧的模板系统，按以下步骤迁移：

1. 更新 `@ldesign/template` 到最新版本
2. 移除直接的 `import.meta.glob` 调用
3. 使用新的 `templateRegistry` API
4. 测试打包后的功能是否正常

## 总结

新的模板系统通过统一的注册器和明确的静态导出，解决了打包后找不到模板的问题，同时提高了性能和代码可维护性。
# 故障排除

本指南帮助你解决使用 @ldesign/store 时可能遇到的常见问题。

## 安装问题

### 装饰器不工作

**问题：** 装饰器语法报错或不生效

**解决方案：**

1. **确保安装了 reflect-metadata**

   ```bash
   pnpm add reflect-metadata
   ```

2. **在入口文件导入**

   ```typescript
   // main.ts
   import 'reflect-metadata' // 必须在最顶部
   import { createApp } from 'vue'
   // ... 其他导入
   ```

3. **配置 TypeScript**

   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "experimentalDecorators": true,
       "emitDecoratorMetadata": true
     }
   }
   ```

4. **配置 Vite**

   ```typescript
   // vite.config.ts
   import { defineConfig } from 'vite'

   export default defineConfig({
     esbuild: {
       target: 'es2020', // 确保支持装饰器
     },
   })
   ```

### TypeScript 类型错误

**问题：** 类型检查失败

**解决方案：**

1. **确保 TypeScript 版本 >= 4.5**

   ```bash
   pnpm add -D typescript@latest
   ```

2. **检查 tsconfig.json 配置**
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "experimentalDecorators": true,
       "emitDecoratorMetadata": true,
       "target": "ES2020",
       "module": "ESNext",
       "moduleResolution": "node"
     }
   }
   ```

## 运行时问题

### Store 状态不响应

**问题：** 修改状态后组件不更新

**可能原因和解决方案：**

1. **忘记使用 @Action 装饰器**

   ```typescript
   // ❌ 错误
   class MyStore extends BaseStore {
     updateData(data: any) {
       this.data = data // 不会触发响应式更新
     }
   }

   // ✅ 正确
   class MyStore extends BaseStore {
     @Action()
     updateData(data: any) {
       this.data = data // 会触发响应式更新
     }
   }
   ```

2. **直接修改嵌套对象**

   ```typescript
   // ❌ 错误
   @Action()
   updateUser() {
     this.user.name = 'new name' // 可能不会触发更新
   }

   // ✅ 正确
   @Action()
   updateUser() {
     this.user = { ...this.user, name: 'new name' }
   }
   ```

3. **异步操作未使用 @AsyncAction**

   ```typescript
   // ❌ 错误
   @Action()
   async fetchData() {
     const data = await api.getData()
     this.data = data // 可能不会正确更新
   }

   // ✅ 正确
   @AsyncAction()
   async fetchData() {
     const data = await api.getData()
     this.data = data
   }
   ```

### 性能问题

**问题：** 应用运行缓慢

**诊断和解决：**

1. **启用性能监控**

   ```typescript
   import { usePerformanceMonitor, getOptimizationSuggestions } from '@ldesign/store'

   const monitor = usePerformanceMonitor()
   const report = monitor.getPerformanceReport()
   const suggestions = getOptimizationSuggestions(report)

   console.log('性能报告:', report)
   console.log('优化建议:', suggestions)
   ```

2. **使用缓存装饰器**

   ```typescript
   class MyStore extends BaseStore {
     @CachedGetter(['data']) // 缓存计算结果
     get expensiveComputation() {
       return this.data.map(/* 复杂计算 */)
     }

     @CachedAction(60000) // 缓存1分钟
     async fetchData() {
       return await api.getData()
     }
   }
   ```

3. **使用 Store 池**
   ```typescript
   @PooledStore({ maxSize: 10 })
   class FrequentStore extends BaseStore {
     // 频繁创建的 Store 使用池化
   }
   ```

### 内存泄漏

**问题：** 内存使用持续增长

**解决方案：**

1. **正确清理 Store**

   ```typescript
   // 组件卸载时清理
   onUnmounted(() => {
     store.$dispose()
   })
   ```

2. **使用 Store 池**

   ```typescript
   const pool = useStorePool()

   // 使用完毕后归还
   const store = pool.getStore(MyStore, 'id')
   // ... 使用 store
   pool.returnStore(store)
   ```

3. **清理事件监听器**

   ```typescript
   class MyStore extends BaseStore {
     private cleanup: (() => void)[] = []

     constructor(id: string) {
       super(id)

       // 注册清理函数
       this.cleanup.push(() => {
         // 清理逻辑
       })
     }

     $dispose() {
       this.cleanup.forEach(fn => fn())
       super.$dispose()
     }
   }
   ```

## 开发问题

### 热重载不工作

**问题：** 开发时修改代码后页面不更新

**解决方案：**

1. **检查 Vite 配置**

   ```typescript
   // vite.config.ts
   export default defineConfig({
     server: {
       hmr: true, // 确保启用热重载
     },
   })
   ```

2. **避免在 Store 构造函数中执行副作用**

   ```typescript
   // ❌ 避免
   class MyStore extends BaseStore {
     constructor(id: string) {
       super(id)
       this.fetchData() // 可能导致热重载问题
     }
   }

   // ✅ 推荐
   class MyStore extends BaseStore {
     @Action()
     initialize() {
       this.fetchData()
     }
   }
   ```

### 测试问题

**问题：** 单元测试失败

**解决方案：**

1. **配置测试环境**

   ```typescript
   // test/setup.ts
   import 'reflect-metadata'
   import { createPinia, setActivePinia } from 'pinia'

   beforeEach(() => {
     const pinia = createPinia()
     setActivePinia(pinia)
   })
   ```

2. **模拟异步操作**
   ```typescript
   // 测试异步 Action
   it('should fetch data', async () => {
     const store = new MyStore('test')

     // 模拟 API
     vi.spyOn(api, 'getData').mockResolvedValue({ data: 'test' })

     await store.fetchData()

     expect(store.data).toBe('test')
   })
   ```

## 构建问题

### 打包体积过大

**问题：** 构建后文件过大

**解决方案：**

1. **启用 Tree Shaking**

   ```typescript
   // vite.config.ts
   export default defineConfig({
     build: {
       rollupOptions: {
         treeshake: true,
       },
     },
   })
   ```

2. **按需导入**

   ```typescript
   // ❌ 全量导入
   import * as Store from '@ldesign/store'

   // ✅ 按需导入
   import { BaseStore, Action, State } from '@ldesign/store'
   ```

### 兼容性问题

**问题：** 在某些环境下不工作

**解决方案：**

1. **检查浏览器支持**

   - 确保目标浏览器支持 ES2020
   - 使用 Babel 转译如果需要支持旧浏览器

2. **Node.js 环境**
   ```typescript
   // 确保 Node.js 版本 >= 16
   // package.json
   {
     "engines": {
       "node": ">=16"
     }
   }
   ```

## 调试技巧

### 启用调试模式

```typescript
// 开发环境启用详细日志
if (process.env.NODE_ENV === 'development') {
  // 启用性能监控
  const monitor = usePerformanceMonitor()

  // 定期输出性能报告
  setInterval(() => {
    console.log('性能报告:', monitor.getPerformanceReport())
  }, 10000)
}
```

### 使用 Vue DevTools

1. 安装 Vue DevTools 浏览器扩展
2. 在 Pinia 面板中查看 Store 状态
3. 使用时间旅行调试功能

### 性能分析

```typescript
// 分析慢速操作
const report = monitor.getPerformanceReport()

report.slowActions.forEach(action => {
  console.warn(`慢速 Action: ${action.name}, 平均耗时: ${action.avgTime}ms`)
})

report.slowGetters.forEach(getter => {
  console.warn(`慢速 Getter: ${getter.name}, 平均耗时: ${getter.avgTime}ms`)
})
```

## 获取帮助

如果以上解决方案都无法解决你的问题：

1. **查看控制台错误信息**
2. **检查网络请求**
3. **查看 [GitHub Issues](https://github.com/ldesign-team/store/issues)**
4. **提交新的 Issue 并提供：**
   - 错误信息
   - 复现步骤
   - 环境信息（Node.js、浏览器版本等）
   - 最小复现代码

## 常见错误代码

| 错误代码             | 描述             | 解决方案                                 |
| -------------------- | ---------------- | ---------------------------------------- |
| `DECORATOR_ERROR`    | 装饰器配置错误   | 检查 TypeScript 和 reflect-metadata 配置 |
| `STORE_NOT_FOUND`    | Store 未找到     | 确保 Store 已正确注册                    |
| `ASYNC_ACTION_ERROR` | 异步 Action 错误 | 使用 @AsyncAction 装饰器                 |
| `CACHE_ERROR`        | 缓存错误         | 检查缓存配置和依赖                       |
| `POOL_ERROR`         | Store 池错误     | 检查池配置和使用方式                     |

# 桥接插件重构检查清单

## ✅ 已完成的工作

### 1. 删除桥接插件包
- [x] 删除 `packages/engine/packages/plugins/i18n-bridge`
- [x] 删除 `packages/engine/packages/plugins/color-bridge`
- [x] 删除 `packages/engine/packages/plugins/size-bridge`

### 2. 应用层桥接实现
- [x] `apps/app-vue/src/utils/state-bridge.ts` 已存在并实现完整
  - [x] `connectI18nToEngine()` - i18n 桥接函数
  - [x] `connectColorToEngine()` - color 桥接函数
  - [x] `connectSizeToEngine()` - size 桥接函数
  - [x] `connectAllToEngine()` - 统一桥接函数
  - [x] 完整的类型定义
  - [x] 详细的 JSDoc 注释

### 3. 修改 main.ts
- [x] 移除桥接插件的导入（`createI18nBridgePlugin` 等）
- [x] 移除插件配置中的桥接插件调用
- [x] 在 `engine.mount()` 后调用 `connectAllToEngine()`
- [x] 添加清理函数的引用
- [x] 增强开发环境调试功能

### 4. 文档更新
- [x] 创建 `bridge-refactoring-summary.md` - 重构总结文档
- [x] 创建 `bridge-refactoring-checklist.md` - 检查清单

## 🎯 架构验证

### 功能包独立性
```
✅ @ldesign/i18n-core - 不依赖 engine
✅ @ldesign/color-core - 不依赖 engine
✅ @ldesign/size-core - 不依赖 engine
```

### 应用层桥接
```
✅ apps/app-vue/src/utils/state-bridge.ts
   - 可以依赖 engine
   - 可以依赖功能包
   - 负责状态桥接逻辑
```

### 清晰的依赖关系
```
应用层 (apps/app-vue)
  ↓ 依赖
  ├── @ldesign/engine-vue3
  ├── @ldesign/i18n-vue
  ├── @ldesign/color-vue
  └── @ldesign/size-vue

功能包层
  ├── @ldesign/i18n-core (独立)
  ├── @ldesign/color-core (独立)
  └── @ldesign/size-core (独立)
```

## 📝 代码示例

### 修改前（❌ 错误）
```typescript
// main.ts
import { createI18nBridgePlugin } from '@ldesign/engine-plugins/i18n-bridge'
import { createColorBridgePlugin } from '@ldesign/engine-plugins/color-bridge'
import { createSizeBridgePlugin } from '@ldesign/engine-plugins/size-bridge'

const engine = createVueEngine({
  plugins: [
    createI18nEnginePlugin({ /* ... */ }),
    createI18nBridgePlugin(), // ❌ 导致功能包依赖 engine
    createColorEnginePlugin({ /* ... */ }),
    createColorBridgePlugin(), // ❌ 导致功能包依赖 engine
    createSizeEnginePlugin({ /* ... */ }),
    createSizeBridgePlugin(), // ❌ 导致功能包依赖 engine
  ],
})
```

### 修改后（✅ 正确）
```typescript
// main.ts
import { connectAllToEngine } from './utils/state-bridge'

const engine = createVueEngine({
  plugins: [
    createI18nEnginePlugin({ /* ... */ }),
    createColorEnginePlugin({ /* ... */ }),
    createSizeEnginePlugin({ /* ... */ }),
    // ✅ 不再使用桥接插件
  ],
})

await engine.mount('#app')

// ✅ 在应用层连接功能包状态到 engine.state
const cleanupBridges = connectAllToEngine(engine)
```

## 🔍 验证步骤

### 1. 检查桥接插件目录是否已删除
```bash
# 应该返回 False
Test-Path "packages/engine/packages/plugins/i18n-bridge"
Test-Path "packages/engine/packages/plugins/color-bridge"
Test-Path "packages/engine/packages/plugins/size-bridge"
```

### 2. 检查 main.ts 是否正确
```bash
# 应该没有找到桥接插件的引用
Select-String -Path "apps/app-vue/src/main.ts" -Pattern "createI18nBridgePlugin|createColorBridgePlugin|createSizeBridgePlugin"
```

### 3. 检查 state-bridge.ts 是否存在
```bash
# 应该返回 True
Test-Path "apps/app-vue/src/utils/state-bridge.ts"
```

### 4. 运行类型检查
```bash
cd apps/app-vue
pnpm type-check
```

### 5. 运行 lint 检查
```bash
cd apps/app-vue
pnpm lint
```

## 🎉 重构成果

### 架构改进
1. **功能包完全独立** - i18n、color、size 可以在任何项目中独立使用
2. **清晰的架构层次** - 桥接逻辑属于应用层，不是包级别
3. **更好的可维护性** - 桥接逻辑集中在一个文件中
4. **灵活的控制** - 应用层可以选择性地桥接需要的功能

### 代码质量
1. **完整的类型定义** - 所有函数都有明确的类型
2. **详细的注释** - JSDoc 注释完整
3. **清理函数** - 支持资源清理，避免内存泄漏
4. **容错处理** - 桥接失败不会影响应用启动

### 开发体验
1. **更好的调试** - 开发环境暴露所有服务到 window
2. **更清晰的日志** - 桥接成功/失败都有日志输出
3. **更简单的使用** - 一个函数完成所有桥接

## 📚 相关文档

- [桥接重构总结](./bridge-refactoring-summary.md)
- [状态桥接工具源码](../../apps/app-vue/src/utils/state-bridge.ts)
- [应用入口源码](../../apps/app-vue/src/main.ts)


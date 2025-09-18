# Launcher Alias 功能重构总结

## 重构目标

根据用户要求，重构 launcher 的 alias 功能，保留 vite 原有的配置风格，简化复杂的实现，只内置基本的 @ -> src 别名，其他别名由用户在 launcher.config.ts 中配置。

## 重构内容

### 1. 简化 AliasManager 类

**之前**：复杂的预设系统，包含多种预设（ldesign、polyfills、common）和复杂的配置选项

**现在**：
- 只提供基本的 `generateBuiltinAliases()` 方法
- 内置唯一的 `@ -> src` 别名
- 移除所有复杂的预设系统和配置选项

### 2. 重构 createLDesignAliases 函数

**之前**：复杂的自动扫描包逻辑，自动生成 @ldesign 包的别名

**现在**：
- 重命名为 `createBasicAliases()`，只创建基本的项目别名
- 新增 `createNodePolyfillAliases()` 工具函数
- 移除复杂的自动扫描逻辑

### 3. 简化 AliasOptions 接口

**之前**：复杂的配置选项，包含 enabled、stages、ldesign、polyfills、custom、presets 等

**现在**：
```typescript
export interface AliasOptions {
  /** 是否启用内置的基本别名（@ -> src） */
  enabled?: boolean
}
```

### 4. 更新 ViteLauncher 中的 alias 处理

**之前**：复杂的 `applyAliasConfig` 方法，包含阶段控制、外部文件监听等

**现在**：
- 简化为只添加基本的内置别名
- 移除 `aliasStages` 配置
- 保持 vite 标准的 resolve.alias 配置方式

### 5. 移除 config.ts 中的复杂 alias 预处理

**之前**：`processAliasConfig` 函数自动添加大量 @ldesign 包的别名

**现在**：
- 移除 `processAliasConfig` 函数
- `defineConfig` 函数直接返回用户配置

### 6. 更新相关文档和示例

更新了以下文档：
- `app/.ldesign/launcher.config.ts` - 示例配置
- `packages/launcher/docs/config/resolve.md` - 路径解析文档
- `packages/launcher/docs/guide/config-reference.md` - 配置参考文档

### 7. 编写完整的测试用例

新增测试文件：
- `src/__tests__/core/AliasManager.test.ts` - AliasManager 类测试
- `src/__tests__/utils/aliases.test.ts` - 别名工具函数测试

## 新的使用方式

### 基本配置

```typescript
import { defineConfig, createBasicAliases, createNodePolyfillAliases } from '@ldesign/launcher'

export default defineConfig({
  launcher: {
    // 控制内置别名的启用/禁用
    alias: {
      enabled: true // 启用内置的 @ -> src 别名
    }
  },
  
  resolve: {
    alias: [
      // 基本的项目别名（@ -> src）
      ...createBasicAliases('./src'),
      
      // Node.js polyfills for browser（可选）
      ...createNodePolyfillAliases(),
      
      // 用户可以在这里添加更多自定义别名
      { find: '@components', replacement: './src/components' },
      { find: '@utils', replacement: './src/utils' },
      { find: '@assets', replacement: './src/assets' },
      
      // 如果需要 @ldesign 包的开发时别名，可以手动添加
      { find: '@ldesign/http', replacement: '../packages/http/src' },
      { find: '@ldesign/color', replacement: '../packages/color/src' },
    ]
  }
})
```

### 手动配置

```typescript
export default defineConfig({
  resolve: {
    alias: [
      // 项目根目录别名
      { find: '@', replacement: './src' },
      
      // 组件目录别名
      { find: '@components', replacement: './src/components' },
      
      // 正则表达式别名
      { find: /^~\//, replacement: './src/' },
    ]
  }
})
```

## 重构优势

1. **简化复杂度**：移除了复杂的预设系统和自动扫描逻辑
2. **保持 Vite 风格**：完全符合 Vite 标准的 resolve.alias 配置方式
3. **用户控制**：用户可以完全控制别名配置，不再有隐式的自动配置
4. **向后兼容**：保留了基本的 @ -> src 内置别名
5. **工具函数**：提供了便利的工具函数，用户可以选择性使用

## 测试结果

所有新编写的测试用例都通过了，确保重构后的功能正常工作：
- AliasManager 类的所有方法测试通过
- 别名工具函数的所有测试通过
- 边界情况和集成测试都通过

## 总结

重构成功简化了 launcher 的 alias 功能，保持了 Vite 原有的配置风格，只内置基本的 @ -> src 别名，其他别名完全由用户在配置中控制。这样既保持了简洁性，又提供了足够的灵活性。

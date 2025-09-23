# LDesign 组件结构规范

## 概述

为了解决开发阶段使用alias和打包后产物在样式方面的差异问题，制定统一的组件结构规范，确保所有@ldesign包中的Vue组件都遵循一致的目录结构和导出方式。

## 核心问题

1. **开发vs生产差异**：开发时使用alias指向src目录，打包后指向dist/es/lib目录
2. **样式路径不一致**：不同包的样式文件组织方式不同，导致引用路径混乱
3. **组件结构不统一**：各包组件目录结构差异较大，维护困难

## 统一组件结构规范

### 基本目录结构

```
ComponentName/
├── index.ts              # 组件导出入口
├── ComponentName.tsx     # 组件实现（Vue组件使用.vue）
├── style/                # 样式目录
│   ├── index.ts          # 样式导出入口
│   ├── index.less        # 主样式文件
│   └── themes/           # 主题样式（可选）
│       ├── light.less
│       └── dark.less
├── types.ts              # 类型定义（可选）
└── __tests__/            # 测试文件（可选）
    └── ComponentName.test.ts
```

### 文件内容规范

#### 1. index.ts（组件导出入口）

```typescript
/**
 * ComponentName 组件
 * 
 * @description 组件功能描述
 * @author LDesign Team
 */

// 导出组件
export { default } from './ComponentName'
export { default as ComponentName } from './ComponentName'

// 导出类型
export type * from './types'

// 导出样式（重要：确保样式能被正确引用）
export * from './style'
```

#### 2. ComponentName.tsx（组件实现）

```typescript
/**
 * ComponentName 组件实现
 */

import { defineComponent } from 'vue'
import type { ComponentNameProps } from './types'

// 导入样式（开发时通过相对路径，打包后会被处理）
import './style/index.less'

export default defineComponent<ComponentNameProps>({
  name: 'ComponentName',
  // 组件实现...
})
```

#### 3. style/index.ts（样式导出入口）

```typescript
/**
 * ComponentName 样式导出
 */

// 导入主样式文件
import './index.less'

// 可选：导出样式相关的工具函数或变量
export const componentClassName = 'ld-component-name'

// 可选：导出主题切换函数
export const switchTheme = (theme: 'light' | 'dark') => {
  // 主题切换逻辑
}
```

#### 4. style/index.less（主样式文件）

```less
/**
 * ComponentName 组件样式
 * 使用统一的CSS变量系统
 */

@import '../../styles/variables.less'; // 引用全局变量

.ld-component-name {
  // 使用CSS变量
  color: var(--ldesign-text-color-primary);
  background-color: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  padding: var(--ls-padding-sm);
  
  // 组件特定样式...
}
```

## 包级别结构规范

### src目录结构

```
src/
├── components/           # 组件目录
│   ├── ComponentA/       # 组件A
│   ├── ComponentB/       # 组件B
│   └── index.ts          # 组件统一导出
├── composables/          # 组合式函数（Vue3）
├── utils/                # 工具函数
├── types/                # 类型定义
├── styles/               # 全局样式
│   ├── variables.less    # CSS变量定义
│   ├── mixins.less       # Less混入
│   └── index.less        # 样式入口
└── index.ts              # 包主入口
```

### 组件统一导出（components/index.ts）

```typescript
/**
 * 组件统一导出
 */

// 导出所有组件
export * from './ComponentA'
export * from './ComponentB'

// 导出组件列表（用于插件注册）
export { default as ComponentA } from './ComponentA'
export { default as ComponentB } from './ComponentB'

// 组件列表
export const components = [
  ComponentA,
  ComponentB,
]
```

## Builder配置优化

### 样式处理配置

为确保alias和打包后的一致性，需要在builder中添加以下配置：

```typescript
// builder.config.ts
export default defineConfig({
  // 样式处理配置
  style: {
    extract: true,           // 提取CSS到单独文件
    minimize: true,          // 压缩CSS
    autoprefixer: true,      // 自动添加浏览器前缀
    modules: false,          // 不使用CSS Modules
    
    // 样式路径解析配置
    alias: {
      '@styles': './src/styles',
      '@components': './src/components'
    },
    
    // 确保样式文件被正确复制到输出目录
    copyStyles: true,
    
    // Less配置
    preprocessor: {
      less: {
        enabled: true,
        options: {
          javascriptEnabled: true,
          // 全局变量导入
          globalVars: {
            '@import': '"~@ldesign/shared/styles/variables.less"'
          }
        }
      }
    }
  }
})
```

## 迁移指南

### 现有组件迁移步骤

1. **创建新的组件目录结构**
2. **移动组件文件到新位置**
3. **创建style目录和相关文件**
4. **更新导入导出语句**
5. **测试构建和样式加载**

### 批量迁移脚本

将提供自动化迁移脚本来帮助现有组件快速迁移到新结构。

## 优势

1. **一致性**：所有组件遵循相同的结构规范
2. **可维护性**：清晰的文件组织，便于维护和扩展
3. **样式隔离**：每个组件的样式独立管理
4. **类型安全**：完整的TypeScript类型支持
5. **构建兼容**：确保开发和生产环境的一致性
6. **团队协作**：统一的规范便于团队协作开发

## 注意事项

1. **样式导入**：组件中必须导入样式文件，确保样式被正确加载
2. **路径引用**：使用相对路径引用样式，避免绝对路径问题
3. **CSS变量**：统一使用全局CSS变量系统
4. **命名规范**：组件名、类名、文件名保持一致的命名规范
5. **向后兼容**：迁移过程中确保向后兼容性

# 使用示例和最佳实践

本文档提供了 `@ldesign/builder` 的完整使用示例和最佳实践指南，帮助你快速上手并构建高质量的前端库。

## 快速开始示例

### 1. 最简单的 TypeScript 库

创建一个简单的工具函数库：

**项目结构**:
```
my-utils/
├── src/
│   ├── math.ts
│   ├── string.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── build.js
```

**src/math.ts**:
```typescript
/**
 * 数学工具函数
 */
export function add(a: number, b: number): number {
  return a + b
}

export function multiply(a: number, b: number): number {
  return a * b
}
```

**src/string.ts**:
```typescript
/**
 * 字符串工具函数
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function kebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}
```

**src/index.ts**:
```typescript
export * from './math'
export * from './string'

// 默认导出
export default {
  add,
  multiply,
  capitalize,
  kebabCase
} from './math'
```

**build.js**:
```typescript
import { LibraryBuilder } from '@ldesign/builder'

const builder = new LibraryBuilder({
  rootDir: process.cwd(),
  entry: 'src/index.ts',
  output: {
    cjs: 'lib',
    es: 'es'
  },
  dts: true,
  minify: true,
  sourcemap: true,
  clean: true
})

builder.build().then(result => {
  if (result.success) {
    console.log('✅ 构建成功!')
  } else {
    console.error('❌ 构建失败:', result.errors)
  }
})
```

**package.json**:
```json
{
  "name": "my-utils",
  "version": "1.0.0",
  "main": "lib/index.js",
  "module": "es/index.js",
  "types": "types/index.d.ts",
  "files": ["lib", "es", "types"],
  "scripts": {
    "build": "node build.js"
  },
  "devDependencies": {
    "@ldesign/builder": "^1.0.0",
    "typescript": "^5.0.0"
  }
}
```

### 2. Vue 3 组件库示例

创建一个简单的 Vue 3 组件库：

**项目结构**:
```
my-vue-lib/
├── src/
│   ├── components/
│   │   ├── button/
│   │   │   ├── index.ts
│   │   │   ├── button.vue
│   │   │   └── style.less
│   │   └── input/
│   │       ├── index.ts
│   │       ├── input.vue
│   │       └── style.less
│   ├── styles/
│   │   ├── variables.less
│   │   └── index.less
│   └── index.ts
├── package.json
├── tsconfig.json
└── build.js
```

**src/components/button/button.vue**:
```vue
<template>
  <button 
    :class="buttonClass" 
    :disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}

interface Emits {
  click: [event: MouseEvent]
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'medium',
  disabled: false
})

const emit = defineEmits<Emits>()

const buttonClass = computed(() => [
  'my-button',
  `my-button--${props.type}`,
  `my-button--${props.size}`,
  {
    'my-button--disabled': props.disabled
  }
])

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>
```

**src/components/button/style.less**:
```less
@import '../../styles/variables.less';

.my-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: @border-radius;
  cursor: pointer;
  transition: all 0.2s;
  
  // 尺寸
  &--small {
    padding: 4px 8px;
    font-size: 12px;
  }
  
  &--medium {
    padding: 8px 16px;
    font-size: 14px;
  }
  
  &--large {
    padding: 12px 24px;
    font-size: 16px;
  }
  
  // 类型
  &--primary {
    background-color: @primary-color;
    color: white;
    
    &:hover {
      background-color: @primary-color-hover;
    }
  }
  
  &--secondary {
    background-color: @secondary-color;
    color: @text-color;
    
    &:hover {
      background-color: @secondary-color-hover;
    }
  }
  
  &--danger {
    background-color: @danger-color;
    color: white;
    
    &:hover {
      background-color: @danger-color-hover;
    }
  }
  
  // 禁用状态
  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
```

**src/components/button/index.ts**:
```typescript
import Button from './button.vue'
import './style.less'

export { Button }
export default Button

// 类型导出
export type { Props as ButtonProps } from './button.vue'
```

**src/styles/variables.less**:
```less
// 颜色变量
@primary-color: #1890ff;
@primary-color-hover: #40a9ff;
@secondary-color: #f5f5f5;
@secondary-color-hover: #e6e6e6;
@danger-color: #ff4d4f;
@danger-color-hover: #ff7875;

// 文本颜色
@text-color: #333333;
@text-color-secondary: #666666;

// 边框
@border-radius: 4px;
@border-color: #d9d9d9;

// 间距
@spacing-xs: 4px;
@spacing-sm: 8px;
@spacing-md: 16px;
@spacing-lg: 24px;
```

**src/index.ts**:
```typescript
// 组件导出
export { Button } from './components/button'
export { Input } from './components/input'

// 类型导出
export type { ButtonProps } from './components/button'
export type { InputProps } from './components/input'

// 样式导出
import './styles/index.less'

// 版本信息
export const version = '1.0.0'
```

**build.js**:
```typescript
import { LibraryBuilder } from '@ldesign/builder'

const builder = new LibraryBuilder({
  rootDir: process.cwd(),
  entry: 'src/index.ts',
  output: {
    cjs: 'lib',
    es: 'es',
    umd: 'dist',
    types: 'types'
  },
  name: 'MyVueLib',
  external: ['vue'],
  globals: { vue: 'Vue' },
  dts: true,
  extractCss: true,
  sourcemap: true,
  clean: true,
  validate: true,
  validatorConfig: {
    checkDts: true,
    checkStyles: true,
    maxFileSize: 1024 * 1024, // 1MB
    maxTotalSize: 10 * 1024 * 1024 // 10MB
  }
})

async function build() {
  console.log('🚀 开始构建 Vue 组件库...')
  
  const result = await builder.build()
  
  if (result.success) {
    console.log('✅ 构建成功!')
    console.log('📦 输出文件:')
    if (result.outputs) {
      Object.entries(result.outputs).forEach(([format, files]) => {
        console.log(`  ${format}:`, files.join(', '))
      })
    }
  } else {
    console.error('❌ 构建失败:')
    result.errors?.forEach(error => {
      console.error('  -', error.message)
    })
    process.exit(1)
  }
}

build().catch(console.error)
```

**package.json**:
```json
{
  "name": "my-vue-lib",
  "version": "1.0.0",
  "main": "lib/index.js",
  "module": "es/index.js",
  "unpkg": "dist/index.umd.js",
  "types": "types/index.d.ts",
  "style": "es/style.css",
  "files": ["lib", "es", "dist", "types"],
  "scripts": {
    "build": "node build.js",
    "build:dev": "NODE_ENV=development node build.js"
  },
  "peerDependencies": {
    "vue": "^3.0.0"
  },
  "devDependencies": {
    "@ldesign/builder": "^1.0.0",
    "@vitejs/plugin-vue": "^4.0.0",
    "@vitejs/plugin-vue-jsx": "^3.0.0",
    "typescript": "^5.0.0",
    "vue": "^3.3.0"
  }
}
```

## 高级使用示例

### 3. 多入口构建

当你需要为不同的模块提供独立的入口时：

**build-multi.js**:
```typescript
import { LibraryBuilder } from '@ldesign/builder'

const entries = [
  {
    name: 'core',
    entry: 'src/core/index.ts',
    output: {
      cjs: 'lib/core',
      es: 'es/core'
    }
  },
  {
    name: 'utils',
    entry: 'src/utils/index.ts',
    output: {
      cjs: 'lib/utils',
      es: 'es/utils'
    }
  },
  {
    name: 'components',
    entry: 'src/components/index.ts',
    output: {
      cjs: 'lib/components',
      es: 'es/components',
      umd: 'dist/components'
    },
    external: ['vue'],
    globals: { vue: 'Vue' },
    name: 'MyComponents'
  }
]

async function buildAll() {
  for (const config of entries) {
    console.log(`🔨 构建 ${config.name}...`)

    const builder = new LibraryBuilder({
      rootDir: process.cwd(),
      ...config,
      dts: true,
      clean: false // 避免清理其他入口的输出
    })

    const result = await builder.build()

    if (result.success) {
      console.log(`✅ ${config.name} 构建成功`)
    } else {
      console.error(`❌ ${config.name} 构建失败:`, result.errors)
      process.exit(1)
    }
  }

  console.log('🎉 所有模块构建完成!')
}

buildAll().catch(console.error)
```

### 4. 最佳实践指南

#### 项目结构建议

```
my-library/
├── src/                    # 源码目录
│   ├── components/         # 组件目录
│   ├── utils/             # 工具函数
│   ├── types/             # 类型定义
│   ├── styles/            # 样式文件
│   └── index.ts           # 主入口
├── docs/                  # 文档目录
├── examples/              # 示例目录
├── __tests__/             # 测试目录
├── scripts/               # 构建脚本
│   ├── build.js
│   ├── dev.js
│   └── release.js
├── dist/                  # 构建输出（gitignore）
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

#### 包管理最佳实践

**推荐的 package.json 配置**:
```json
{
  "name": "my-library",
  "version": "1.0.0",
  "description": "My awesome library",
  "keywords": ["vue", "components", "ui"],
  "author": "Your Name",
  "license": "MIT",

  // 入口文件配置
  "main": "lib/index.js",           // CommonJS 入口
  "module": "es/index.js",          // ES 模块入口
  "unpkg": "dist/index.umd.js",     // CDN 入口
  "types": "types/index.d.ts",      // 类型定义入口
  "style": "es/style.css",          // 样式入口

  // 发布文件
  "files": [
    "lib",
    "es",
    "dist",
    "types",
    "README.md",
    "LICENSE"
  ],

  // 脚本命令
  "scripts": {
    "build": "node scripts/build.js",
    "build:dev": "NODE_ENV=development npm run build",
    "build:watch": "npm run build:dev -- --watch",
    "clean": "rimraf dist lib es types",
    "prepublishOnly": "npm run clean && npm run build"
  },

  // 依赖配置
  "peerDependencies": {
    "vue": "^3.0.0"
  },
  "devDependencies": {
    "@ldesign/builder": "^1.0.0",
    "typescript": "^5.0.0",
    "vue": "^3.3.0"
  }
}
```

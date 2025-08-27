# Vue 组件库

本页面展示如何使用 @ldesign/builder 构建 Vue 组件库。

## 项目结构

典型的 Vue 组件库项目结构：

```
my-vue-lib/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.vue
│   │   │   └── index.ts
│   │   └── Input/
│   │       ├── Input.vue
│   │       └── index.ts
│   ├── styles/
│   │   └── index.css
│   └── index.ts
├── package.json
└── builder.config.ts
```

## 基础配置

创建 `builder.config.ts`：

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs', 'umd'],
  dts: true,
  external: ['vue'],
  globals: {
    vue: 'Vue'
  },
  name: 'MyVueLib'
})
```

## 入口文件

`src/index.ts`：

```typescript
// 导出所有组件
export { default as Button } from './components/Button'
export { default as Input } from './components/Input'

// 导出类型
export type { ButtonProps } from './components/Button'
export type { InputProps } from './components/Input'

// 导出样式
import './styles/index.css'

// Vue 插件安装函数
import type { App } from 'vue'
import Button from './components/Button'
import Input from './components/Input'

const components = [Button, Input]

export default {
  install(app: App) {
    components.forEach(component => {
      app.component(component.name, component)
    })
  }
}
```

## 组件定义

`src/components/Button/Button.vue`：

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

export interface ButtonProps {
  type?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}

const props = withDefaults(defineProps<ButtonProps>(), {
  type: 'primary',
  size: 'medium',
  disabled: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClass = computed(() => [
  'btn',
  `btn--${props.type}`,
  `btn--${props.size}`,
  {
    'btn--disabled': props.disabled
  }
])

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped>
.btn {
  /* 按钮样式 */
}
</style>
```

`src/components/Button/index.ts`：

```typescript
import Button from './Button.vue'
import type { ButtonProps } from './Button.vue'

// 为组件添加 install 方法
Button.install = (app: any) => {
  app.component(Button.name || 'Button', Button)
}

export default Button
export type { ButtonProps }
```

## 构建脚本

在 `package.json` 中添加构建脚本：

```json
{
  "scripts": {
    "build": "node -e \"require('@ldesign/builder').build(require('./builder.config.ts').default)\"",
    "build:watch": "node -e \"require('@ldesign/builder').watch(require('./builder.config.ts').default)\"",
    "dev": "npm run build:watch"
  }
}
```

## 编程式构建

`build.js`：

```javascript
const { build } = require('@ldesign/builder')
const config = require('./builder.config.ts').default

async function buildLib() {
  try {
    const result = await build(config)
    
    if (result.success) {
      console.log('✅ Vue 组件库构建成功！')
      console.log(`📦 输出文件: ${result.outputs.length} 个`)
      console.log(`⏱️  构建时间: ${result.duration}ms`)
      
      // 显示输出文件
      result.outputs.forEach(output => {
        console.log(`   ${output.fileName} (${output.size} bytes)`)
      })
    } else {
      console.error('❌ 构建失败:')
      result.errors.forEach(error => {
        console.error(`   ${error.message}`)
      })
    }
  } catch (error) {
    console.error('构建过程中发生错误:', error)
  }
}

buildLib()
```

## 输出结构

构建完成后的输出结构：

```
dist/
├── esm/                    # ES 模块格式
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.js
│   │   │   └── index.js
│   │   └── Input/
│   │       ├── Input.js
│   │       └── index.js
│   ├── styles/
│   │   └── index.css
│   └── index.js
├── cjs/                    # CommonJS 格式
│   └── ... (相同结构)
├── umd/                    # UMD 格式
│   └── index.js
└── types/                  # TypeScript 声明文件
    ├── components/
    │   ├── Button/
    │   │   ├── Button.d.ts
    │   │   └── index.d.ts
    │   └── Input/
    │       ├── Input.d.ts
    │       └── index.d.ts
    └── index.d.ts
```

## 高级配置

### 自定义 Vue 编译选项

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs', 'umd'],
  dts: true,
  external: ['vue'],
  globals: { vue: 'Vue' },
  name: 'MyVueLib',
  rollupOptions: {
    plugins: [
      // 自定义 Vue 插件配置会自动应用
    ]
  }
})
```

### CSS 预处理器支持

项目会自动检测并支持：
- Less (`.less`)
- Sass/SCSS (`.sass`, `.scss`)
- Stylus (`.styl`)

### 按需加载支持

构建的组件库天然支持按需加载：

```typescript
// 全量导入
import MyVueLib from 'my-vue-lib'
app.use(MyVueLib)

// 按需导入
import { Button, Input } from 'my-vue-lib'
```

## 相关

- [基础用法](/examples/basic)
- [React 组件库](/examples/react)
- [高级配置](/guide/advanced)

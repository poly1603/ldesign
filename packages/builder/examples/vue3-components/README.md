# Vue 3 组件库示例

这是一个使用 @ldesign/builder 构建的 Vue 3 组件库示例，展示了如何构建现代化的 Vue 组件库。

## 📁 项目结构

```
vue3-components/
├── src/
│   ├── components/
│   │   ├── Button.vue       # 按钮组件
│   │   ├── Input.vue        # 输入框组件
│   │   └── Card.vue         # 卡片组件
│   └── index.ts             # 主入口文件
├── ldesign.config.ts        # 构建配置
├── package.json             # 项目配置
├── tsconfig.json            # TypeScript 配置
└── README.md               # 项目说明
```

## 🚀 特性展示

### 1. Vue 3 组件
- **Button 组件**: 支持多种类型、尺寸和状态
- **Input 组件**: 完整的输入框功能，包括验证、清空、密码显示
- **Card 组件**: 灵活的卡片布局，支持标题、内容和操作区域

### 2. TypeScript 集成
- 完整的 Props 和 Emits 类型定义
- 自动生成组件类型声明文件
- 严格的类型检查

### 3. 样式处理
- 自动提取 CSS 到独立文件
- CSS 变量支持主题定制
- 响应式设计

### 4. 插件安装
- 支持 `app.use()` 方式全局安装
- 支持按需导入单个组件
- 提供工具函数

## 🛠️ 构建命令

```bash
# 安装依赖
pnpm install

# 构建项目
pnpm build

# 开发模式（监听文件变化）
pnpm dev

# 清理输出目录
pnpm clean

# 分析构建结果
pnpm analyze
```

## 📦 构建输出

构建完成后，将在 `dist` 目录生成以下文件：

```
dist/
├── index.js          # ESM 格式
├── index.cjs         # CJS 格式
├── index.d.ts        # TypeScript 声明文件
├── style.css         # 提取的样式文件
├── index.js.map      # ESM Source Map
├── index.cjs.map     # CJS Source Map
└── style.css.map     # CSS Source Map
```

## 📖 使用示例

### 全局安装

```typescript
// main.ts
import { createApp } from 'vue'
import LDesignComponents from '@example/vue3-components'
import '@example/vue3-components/style'

const app = createApp(App)
app.use(LDesignComponents)
app.mount('#app')
```

```vue
<!-- 在组件中使用 -->
<template>
  <div>
    <Button type="primary" @click="handleClick">
      点击我
    </Button>
    
    <Input
      v-model="inputValue"
      label="用户名"
      placeholder="请输入用户名"
      clearable
    />
    
    <Card title="卡片标题">
      <p>这是卡片内容</p>
      <template #footer>
        <Button size="small">操作</Button>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const inputValue = ref('')

const handleClick = () => {
  console.log('按钮被点击了')
}
</script>
```

### 按需导入

```typescript
// 导入特定组件
import { Button, Input } from '@example/vue3-components'
import '@example/vue3-components/style'

// 在组件中注册
export default {
  components: {
    Button,
    Input
  }
}
```

### 组合式 API

```vue
<template>
  <div>
    <Button
      :loading="loading"
      @click="handleSubmit"
    >
      {{ loading ? '提交中...' : '提交' }}
    </Button>
    
    <Input
      v-model="form.username"
      label="用户名"
      :error="errors.username"
      @blur="validateUsername"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Button, Input } from '@example/vue3-components'

const loading = ref(false)
const form = reactive({
  username: ''
})
const errors = reactive({
  username: ''
})

const validateUsername = () => {
  if (!form.username) {
    errors.username = '用户名不能为空'
  } else {
    errors.username = ''
  }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    // 提交逻辑
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('提交成功')
  } finally {
    loading.value = false
  }
}
</script>
```

## ⚙️ 配置说明

### ldesign.config.ts

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 入口文件
  input: 'src/index.ts',
  
  // 输出配置
  output: {
    dir: 'dist',
    format: ['esm', 'cjs'],  // 生成 ESM 和 CJS 两种格式
    sourcemap: true          // 生成 Source Map
  },
  
  // 库类型（自动应用 Vue 3 策略）
  libraryType: 'vue3',
  
  // Vue 配置
  vue: {
    version: 3,
    jsx: {
      enabled: true          // 启用 JSX 支持
    },
    template: {
      precompile: true       // 预编译模板
    }
  },
  
  // 样式配置
  style: {
    extract: true,          // 提取 CSS 到单独文件
    minimize: true,         // 压缩 CSS
    autoprefixer: true      // 自动添加浏览器前缀
  },
  
  // 外部依赖（不打包到输出中）
  external: ['vue']
})
```

## 🎨 组件 API

### Button 组件

```typescript
interface ButtonProps {
  type?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  loadingText?: string
  block?: boolean
  round?: boolean
}

interface ButtonEmits {
  click: [event: MouseEvent]
}
```

### Input 组件

```typescript
interface InputProps {
  modelValue?: string | number
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'
  label?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  clearable?: boolean
  showPassword?: boolean
  error?: string
  help?: string
  size?: 'small' | 'medium' | 'large'
  maxlength?: number
}

interface InputEmits {
  'update:modelValue': [value: string | number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  input: [event: Event]
  change: [event: Event]
  clear: []
  keydown: [event: KeyboardEvent]
}
```

### Card 组件

```typescript
interface CardProps {
  title?: string
  bordered?: boolean
  hoverable?: boolean
  loading?: boolean
  size?: 'small' | 'default' | 'large'
  shadow?: 'never' | 'hover' | 'always'
}
```

## 🎯 最佳实践

### 1. 组件设计
- 使用 Composition API 和 `<script setup>`
- 提供完整的 TypeScript 类型定义
- 支持 v-model 双向绑定
- 合理使用插槽 (slots)

### 2. 样式设计
- 使用 CSS 变量支持主题定制
- 采用 BEM 命名规范
- 提供响应式设计
- 支持暗色模式

### 3. 可访问性
- 添加适当的 ARIA 属性
- 支持键盘导航
- 提供焦点管理
- 考虑屏幕阅读器

### 4. 性能优化
- 使用 `defineAsyncComponent` 异步加载
- 合理使用 `v-memo` 和 `v-once`
- 避免不必要的响应式数据

## 🔧 开发技巧

### 1. 调试
- 使用 Vue DevTools 调试组件
- 利用 Source Map 调试原始代码
- 在开发模式下使用 `pnpm dev` 监听变化

### 2. 测试
- 可以集成 @vue/test-utils 进行组件测试
- 使用 Vitest 作为测试运行器
- 编写单元测试和集成测试

### 3. 文档
- 使用 VitePress 生成组件文档
- 提供交互式示例
- 编写详细的 API 文档

## 📚 扩展功能

基于这个示例，你可以：

1. **添加更多组件**：表格、表单、导航等
2. **集成图标库**：添加图标组件支持
3. **主题系统**：实现完整的主题定制
4. **国际化**：添加多语言支持
5. **动画效果**：集成过渡和动画
6. **移动端适配**：响应式设计和触摸支持

这个示例展示了使用 @ldesign/builder 构建 Vue 3 组件库的完整流程和最佳实践。

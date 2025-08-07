# 🌊 LDesign Watermark - Vue 3 示例

这是一个使用 **Vite + Vue 3 + TypeScript** 构建的 LDesign Watermark 水印组件完整示例项目。通过这个示
例，你可以学习如何在 Vue 3 项目中使用水印组件的各种功能和最佳实践。

## ✨ 功能特性

### 🎯 基础示例

- **简单文字水印** - 最基础的水印用法
- **自定义样式水印** - 丰富的样式配置选项
- **图片水印** - 支持各种图片格式
- **多行文字水印** - 支持多行内容显示
- **实时配置面板** - 交互式参数调整

### 🔧 Composition API 示例

- **响应式水印配置** - 使用 reactive 和 ref 管理状态
- **生命周期管理** - 完整的创建、更新、销毁流程
- **条件渲染** - 根据条件动态显示/隐藏水印
- **动态内容更新** - 实时更新水印内容
- **自定义 Hook** - 封装可复用的水印逻辑

### ⚙️ Options API 示例

- **传统 Vue 写法** - 使用 data、methods、watch
- **生命周期钩子** - mounted、beforeUnmount 等
- **计算属性** - 动态计算水印内容
- **侦听器** - 监听数据变化自动更新
- **混入 (Mixin)** - 复用水印逻辑

### 🚀 高级功能

- **安全防护水印** - 防止恶意删除和修改
- **响应式水印** - 自适应不同屏幕尺寸
- **动画水印** - 丰富的动画效果
- **多渲染模式** - DOM、Canvas、SVG 渲染
- **批量管理** - 同时管理多个水印实例

### 🧩 组件化示例

- **基础水印组件** - 简单易用的封装组件
- **高级水印组件** - 支持主题和密度配置
- **响应式水印组件** - 自动适应容器大小
- **动画水印组件** - 内置动画效果
- **组合式水印组件** - 集成多种功能
- **指令式用法** - v-watermark 指令

## 🚀 快速开始

### 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

### 启动开发服务器

```bash
# 启动开发服务器
pnpm dev

# 或
npm run dev
```

访问 [http://localhost:3002](http://localhost:3002) 查看示例。

### 构建生产版本

```bash
# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

### 类型检查

```bash
# 运行类型检查
pnpm type-check
```

## 📖 使用指南

### 基础用法

```vue
<script setup lang="ts">
import WatermarkContainer from './components/watermark/WatermarkContainer.vue'
</script>

<template>
  <div>
    <!-- 使用组件 -->
    <WatermarkContainer content="我的水印" :enabled="true" :style="{ fontSize: 16, color: '#333' }">
      <div class="content">
        <!-- 你的内容 -->
      </div>
    </WatermarkContainer>
  </div>
</template>
```

### Composition API 用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useWatermark } from './composables/useWatermark'

const containerRef = ref<HTMLElement>()
const { create, destroy, isActive } = useWatermark(containerRef)

// 创建水印
await create('Composition API 水印', {
  style: { fontSize: 16, color: '#666' },
})
</script>

<template>
  <div ref="containerRef">
    <!-- 内容 -->
  </div>
</template>
```

### Options API 用法

```vue
<script>
import { createWatermark, destroyWatermark } from '@ldesign/watermark'

export default {
  data() {
    return {
      watermarkInstance: null,
    }
  },

  async mounted() {
    this.watermarkInstance = await createWatermark(this.$refs.container, {
      content: 'Options API 水印',
    })
  },

  beforeUnmount() {
    if (this.watermarkInstance) {
      destroyWatermark(this.watermarkInstance)
    }
  },
}
</script>

<template>
  <div ref="container">
    <!-- 内容 -->
  </div>
</template>
```

### 指令用法

```vue
<template>
  <!-- 简单用法 -->
  <div v-watermark="'指令水印'">内容</div>

  <!-- 配置对象 -->
  <div v-watermark="{ content: '配置水印', style: { color: '#666' } }">内容</div>

  <!-- 修饰符 -->
  <div v-watermark.secure.responsive="'安全响应式水印'">内容</div>
</template>
```

## 🎛️ 自定义 Hook

项目提供了多个自定义 Hook 来简化水印的使用：

### useWatermark

基础水印 Hook，提供创建、销毁、切换等功能。

```typescript
const { instance, isActive, create, destroy, toggle } = useWatermark(containerRef)
```

### useAdvancedWatermark

高级水印 Hook，包含状态管理和错误处理。

```typescript
const { instance, status, isActive, isLoading, create, update, destroy } = useAdvancedWatermark(
  containerRef,
  defaultConfig
)
```

### useWatermarkManager

批量水印管理 Hook。

```typescript
const { instances, count, create, destroy, destroyAll, get } = useWatermarkManager()
```

## 🧩 组件 API

### WatermarkContainer

基础水印容器组件。

```typescript
interface Props {
  content: string
  enabled?: boolean
  style?: Partial<WatermarkConfig['style']>
  layout?: Partial<WatermarkConfig['layout']>
  renderMode?: 'dom' | 'canvas' | 'svg'
  zIndex?: number
}
```

### AdvancedWatermark

高级水印组件，支持主题和密度配置。

```typescript
interface Props {
  content: string
  theme?: 'default' | 'security' | 'brand' | 'warning'
  density?: 'low' | 'medium' | 'high'
  enabled?: boolean
}
```

### ResponsiveWatermark

响应式水印组件。

```typescript
interface Props {
  content: string
  autoResize?: boolean
  breakpoint?: 'mobile' | 'tablet' | 'desktop'
  enabled?: boolean
}
```

## 📁 项目结构

```
vue3/
├── src/
│   ├── components/
│   │   ├── watermark/           # 水印组件
│   │   │   ├── WatermarkContainer.vue
│   │   │   ├── AdvancedWatermark.vue
│   │   │   ├── ResponsiveWatermark.vue
│   │   │   ├── AnimatedWatermark.vue
│   │   │   └── CompositeWatermark.vue
│   │   ├── BasicExamples.vue    # 基础示例
│   │   ├── CompositionExamples.vue # Composition API 示例
│   │   ├── OptionsExamples.vue  # Options API 示例
│   │   ├── AdvancedExamples.vue # 高级功能示例
│   │   └── ComponentExamples.vue # 组件化示例
│   ├── composables/
│   │   └── useWatermark.ts      # 自定义 Hook
│   ├── App.vue                  # 主应用组件
│   ├── main.ts                  # 入口文件
│   └── style.less              # 全局样式
├── index.html                   # HTML 模板
├── vite.config.ts              # Vite 配置
├── tsconfig.json               # TypeScript 配置
├── package.json                # 项目配置
└── README.md                   # 项目文档
```

## 🔧 配置说明

### Vite 配置

- **开发服务器端口**: 3002
- **TypeScript 支持**: 完整的类型检查
- **Vue JSX 支持**: 支持 TSX 语法
- **Less 预处理器**: 样式预处理
- **路径别名**: `@` 指向 `src` 目录

### TypeScript 配置

- **严格模式**: 启用所有严格检查
- **JSX 支持**: 支持 Vue 3 JSX 语法
- **路径映射**: 支持绝对路径导入

## 🎨 样式系统

项目使用 Less 作为 CSS 预处理器，提供了：

- **CSS 变量**: 统一的颜色和尺寸变量
- **工具类**: 常用的布局和样式类
- **响应式**: 移动端适配
- **动画**: 丰富的过渡动画

## 🧪 最佳实践

1. **组件封装**: 将水印功能封装成可复用的组件
2. **Hook 复用**: 使用自定义 Hook 提取公共逻辑
3. **类型安全**: 充分利用 TypeScript 的类型检查
4. **性能优化**: 合理使用 watch 和 computed
5. **错误处理**: 完善的错误捕获和处理机制

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个示例项目！

## 📄 许可证

MIT License

---

**享受使用 LDesign Watermark Vue 3 示例！** 🎉

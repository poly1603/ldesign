# Vue 3 示例

这是一个完整的 Vue 3 示例项目，展示了 @ldesign/color 的 Vue 集成功能和组合式 API 的使用。

## 功能特性

### 🎨 完整的主题管理

- 预设主题切换和预览
- 亮色/暗色模式切换
- 主题状态实时同步
- 随机主题和快速操作

### 🌈 智能颜色系统

- 从主色调自动生成配套颜色
- 多种生成策略（默认、柔和、鲜艳、单色）
- 实时颜色预览和复制
- 一键应用为主题

### 📊 完整色阶展示

- 10 级色阶可视化
- 支持亮色和暗色模式
- 交互式色阶预览
- 点击复制颜色值

### 🛠️ 自定义主题创建

- 可视化主题创建界面
- 支持亮色和暗色模式配置
- 实时预览和应用

### 🔧 组合式 API 演示

- `useTheme` - 基础主题管理
- `useThemeToggle` - 主题切换器
- `useThemeSelector` - 主题选择器
- `useSystemThemeSync` - 系统主题同步

### ⚡ 性能监控

- 实时性能统计
- 缓存状态监控
- 预生成功能演示

### 🌙 系统主题同步

- 自动检测系统主题
- 实时同步状态显示
- 手动和自动同步选项

## 运行示例

### 安装依赖

```bash
# 在 packages/color 目录下
pnpm install

# 或者在项目根目录下
pnpm install
```

### 启动开发服务器

```bash
# 在 examples/vue 目录下
pnpm dev

# 或者在 packages/color 目录下
pnpm example:vue
```

访问 http://localhost:3002 查看示例。

### 构建生产版本

```bash
pnpm build
```

### 类型检查

```bash
pnpm type-check
```

## 项目结构

```
vue/
├── src/
│   ├── components/          # Vue 组件
│   │   ├── AppHeader.vue           # 应用头部
│   │   ├── AppFooter.vue           # 应用底部
│   │   ├── ThemeControlPanel.vue   # 主题控制面板
│   │   ├── ColorGenerator.vue      # 颜色生成器
│   │   ├── ColorScales.vue         # 色阶展示
│   │   ├── CustomThemeCreator.vue  # 自定义主题创建
│   │   ├── ComposableDemo.vue      # 组合式 API 演示
│   │   ├── PerformanceMonitor.vue  # 性能监控
│   │   ├── SystemThemeSync.vue     # 系统主题同步
│   │   └── Notification.vue        # 通知组件
│   ├── composables/         # 组合式函数
│   │   └── useNotification.ts      # 通知系统
│   ├── styles/             # 样式文件
│   │   └── index.css              # 全局样式
│   ├── App.vue             # 根组件
│   └── main.ts             # 入口文件
├── index.html              # HTML 模板
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 配置
├── env.d.ts               # 类型声明
└── README.md              # 说明文档
```

## 核心功能演示

### 1. Vue 插件安装

```typescript
import { ThemePlugin } from '@ldesign/color/vue'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 安装主题插件
app.use(ThemePlugin, {
  defaultTheme: 'default',
  autoDetect: true,
  idleProcessing: true,
})

app.mount('#app')
```

### 2. 基础主题管理

```vue
<script setup>
import { useTheme } from '@ldesign/color/vue'

const { currentTheme, currentMode, availableThemes, setTheme, toggleMode } = useTheme()
</script>

<template>
  <div>
    <p>当前主题: {{ currentTheme }}</p>
    <p>当前模式: {{ currentMode }}</p>
    <button @click="toggleMode">切换模式</button>
    <select @change="setTheme($event.target.value)">
      <option v-for="theme in availableThemes" :key="theme" :value="theme">
        {{ theme }}
      </option>
    </select>
  </div>
</template>
```

### 3. 主题切换器

```vue
<script setup>
import { useThemeToggle } from '@ldesign/color/vue'

const { toggle, isDark } = useThemeToggle()
</script>

<template>
  <button @click="toggle">切换到{{ isDark ? '亮色' : '暗色' }}模式</button>
</template>
```

### 4. 主题选择器

```vue
<script setup>
import { useThemeSelector } from '@ldesign/color/vue'

const { themeConfigs, selectTheme } = useThemeSelector()
</script>

<template>
  <div>
    <h3>选择主题</h3>
    <div v-for="config in themeConfigs" :key="config.name">
      <button @click="selectTheme(config.name)">
        {{ config.displayName }}
      </button>
    </div>
  </div>
</template>
```

### 5. 系统主题同步

```vue
<script setup>
import { useSystemThemeSync } from '@ldesign/color/vue'

const { systemTheme, isSystemDark, syncWithSystem } = useSystemThemeSync()
</script>

<template>
  <div>
    <p>系统主题: {{ systemTheme }}</p>
    <p>是否系统暗色: {{ isSystemDark ? '是' : '否' }}</p>
    <button @click="syncWithSystem">同步系统主题</button>
  </div>
</template>
```

## 样式系统

示例使用了完整的 CSS 变量系统：

```css
/* 基础颜色 */
.element {
  background: var(--color-primary);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

/* 语义化颜色 */
.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

/* 色阶颜色 */
.light-bg {
  background: var(--color-primary-1);
}

.medium-bg {
  background: var(--color-primary-5);
}

.dark-bg {
  background: var(--color-primary-9);
}
```

## 组件特性

### 响应式设计

所有组件都支持响应式设计，在移动设备上有良好的显示效果。

### 无障碍支持

- 键盘导航支持
- 语义化 HTML 结构
- 适当的 ARIA 标签

### 性能优化

- 组件懒加载
- 事件防抖处理
- 内存泄漏防护

## 自定义扩展

### 添加新的组合式 API

```typescript
import { useTheme } from '@ldesign/color/vue'
// composables/useCustomTheme.ts
import { computed } from 'vue'

export function useCustomTheme() {
  const { currentTheme, setTheme } = useTheme()

  const isCustomTheme = computed(() => {
    return currentTheme.value.startsWith('custom-')
  })

  const createAndApplyTheme = async (color: string) => {
    // 自定义逻辑
  }

  return {
    isCustomTheme,
    createAndApplyTheme,
  }
}
```

### 添加新组件

```vue
<!-- components/MyThemeComponent.vue -->
<script setup lang="ts">
import { useTheme } from '@ldesign/color/vue'

const { currentTheme, setTheme } = useTheme()

// 组件逻辑
</script>

<template>
  <div class="my-theme-component">
    <!-- 组件内容 -->
  </div>
</template>
```

## 浏览器兼容性

- Chrome >= 60
- Firefox >= 55
- Safari >= 12
- Edge >= 79

## 相关链接

- [主项目文档](../../README.md)
- [API 参考](../../docs/api/)
- [Vanilla JS 示例](../vanilla/)
- [GitHub 仓库](https://github.com/ldesign/color)

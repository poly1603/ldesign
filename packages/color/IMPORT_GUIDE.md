# @ldesign/color 正确的导入方式

## ✅ 正确的导入方式

### 在 Vue 3 项目中

```typescript
// 导入主题选择器组件（不需要 .vue 后缀）
import VueThemePicker from '@ldesign/color/vue/ThemePicker'

// 导入 composable
import { useTheme } from '@ldesign/color/vue'

// 导入核心功能
import { Color, generateTailwindTheme } from '@ldesign/color'
```

### 在 React 项目中

```typescript
// 导入主题选择器组件
import { ThemePicker } from '@ldesign/color/react'

// 导入 hooks
import { useTheme, ThemeProvider } from '@ldesign/color/react'

// 导入核心功能
import { Color, generateTailwindTheme } from '@ldesign/color'
```

## ❌ 错误的导入方式

```typescript
// ❌ 不要使用相对路径
import VueThemePicker from '../../packages/color/src/vue/ThemePicker.vue'

// ❌ 不要使用 .vue 后缀
import VueThemePicker from '@ldesign/color/vue/ThemePicker.vue'

// ❌ 不要使用 /src/ 路径
import VueThemePicker from '@ldesign/color/src/vue/ThemePicker.vue'
```

## 📦 Package.json 导出配置

```json
{
  "exports": {
    ".": {
      "types": "./es/index.d.ts",
      "import": "./es/index.js",
      "require": "./lib/index.cjs"
    },
    "./vue": {
      "types": "./src/vue/index.ts",
      "import": "./src/vue/index.ts"
    },
    "./vue/ThemePicker": {
      "import": "./src/vue/ThemePicker.vue"
    },
    "./react": {
      "types": "./src/react/index.ts",
      "import": "./src/react/index.ts"
    }
  }
}
```

## 🔧 项目配置

### tsconfig.json

```json
{
  "compilerOptions": {
    "paths": {
      "@ldesign/color": ["../packages/color/src/index.ts"],
      "@ldesign/color/*": ["../packages/color/src/*"]
    }
  }
}
```

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@ldesign/color': resolve(__dirname, '../packages/color/src'),
    }
  }
})
```

## 📝 使用示例

### App.vue

```vue
<template>
  <div class="app">
    <nav>
      <LanguageSwitcher />
      <VueThemePicker />
    </nav>
  </div>
</template>

<script setup lang="ts">
import VueThemePicker from '@ldesign/color/vue/ThemePicker'
</script>
```

### 使用 Composable

```vue
<script setup lang="ts">
import { useTheme } from '@ldesign/color/vue'

const { applyPresetTheme, currentTheme, primaryColor } = useTheme()

// 手动切换主题
const switchTheme = (themeName: string) => {
  applyPresetTheme(themeName)
}
</script>
```

### 使用核心功能

```typescript
import { 
  Color,
  generateTailwindTheme,
  generateThemePalettes,
  injectThemedCssVariables 
} from '@ldesign/color'

// 创建颜色实例
const color = new Color('#1890ff')

// 生成主题
const themes = generateThemePalettes('#1890ff')

// 注入CSS变量
injectThemedCssVariables(themes, true)
```

## 🎯 优势

使用包名导入的优势：

1. **✅ 清晰明确**：代码更易读，一眼就知道导入来源
2. **✅ 类型安全**：TypeScript 可以正确推断类型
3. **✅ 维护性好**：不受文件移动影响
4. **✅ 符合规范**：遵循 Node.js 包规范
5. **✅ 易于重构**：修改内部结构不影响导入

## 📚 总结

- ✅ 使用 `@ldesign/color/vue/ThemePicker` 导入 Vue 组件
- ✅ 不需要 `.vue` 后缀
- ✅ 不使用相对路径
- ✅ 配置好 tsconfig.json 和 vite.config.ts 的路径映射
- ✅ 享受类型安全和良好的开发体验

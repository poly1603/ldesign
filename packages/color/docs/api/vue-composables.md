# Vue 组合式 API

@ldesign/color 提供了一套完整的 Vue
3 组合式 API，让您可以轻松地在 Vue 应用中管理主题和颜色。

## useTheme

主要的主题管理组合式 API，提供完整的主题控制功能。

### 基础用法

```vue
<script setup>
import { useTheme } from '@ldesign/color/vue'

const {
  currentTheme,
  currentMode,
  isDark,
  isLight,
  availableThemes,
  setTheme,
  setMode,
  toggleMode,
} = useTheme()
</script>

<template>
  <div>
    <p>当前主题: {{ currentTheme }}</p>
    <p>当前模式: {{ currentMode }}</p>
    <p>是否暗色: {{ isDark }}</p>

    <button @click="toggleMode">
      切换到{{ isDark ? '亮色' : '暗色' }}模式
    </button>

    <select @change="setTheme($event.target.value)">
      <option v-for="theme in availableThemes" :key="theme" :value="theme">
        {{ theme }}
      </option>
    </select>
  </div>
</template>
```

### API 参考

#### 返回值

| 属性              | 类型                    | 描述                   |
| ----------------- | ----------------------- | ---------------------- |
| `currentTheme`    | `Ref<string>`           | 当前主题名称           |
| `currentMode`     | `Ref<ColorMode>`        | 当前模式（light/dark） |
| `isDark`          | `ComputedRef<boolean>`  | 是否为暗色模式         |
| `isLight`         | `ComputedRef<boolean>`  | 是否为亮色模式         |
| `availableThemes` | `ComputedRef<string[]>` | 可用主题列表           |
| `setTheme`        | `Function`              | 设置主题               |
| `setMode`         | `Function`              | 设置模式               |
| `toggleMode`      | `Function`              | 切换模式               |

#### 方法

##### setTheme(theme: string, mode?: ColorMode)

设置主题和可选的模式。

```typescript
await setTheme('blue', 'dark')
```

##### setMode(mode: ColorMode)

设置颜色模式。

```typescript
await setMode('dark')
```

##### toggleMode()

切换颜色模式。

```typescript
await toggleMode()
```

## useThemeSelector

高级主题选择器组合式 API，提供更多的主题管理功能。

### 基础用法

```vue
<script setup>
import { useThemeSelector } from '@ldesign/color/vue'

const {
  currentTheme,
  currentMode,
  availableThemes,
  themeConfigs,
  isDark,
  selectTheme,
  setMode,
  toggleMode,
  getThemeConfig,
  getThemeDisplayName,
  getThemeDescription,
} = useThemeSelector()
</script>

<template>
  <div>
    <div v-for="theme in availableThemes" :key="theme.name">
      <h3>{{ getThemeDisplayName(theme.name) }}</h3>
      <p>{{ getThemeDescription(theme.name) }}</p>
      <button @click="selectTheme(theme.name)">选择主题</button>
    </div>
  </div>
</template>
```

### 配置选项

```typescript
const options: UseThemeSelectorOptions = {
  // 自定义主题列表
  customThemes: [
    {
      name: 'custom',
      displayName: '自定义主题',
      description: '我的自定义主题',
      builtin: false,
      light: { primary: '#ff0000' },
      dark: { primary: '#ff4444' },
    },
  ],
  // 禁用的内置主题
  disabledBuiltinThemes: ['minimal'],
  // 默认主题
  defaultTheme: 'blue',
  // 默认模式
  defaultMode: 'light',
  // 是否自动保存到存储
  autoSave: true,
  // 存储键名
  storageKey: 'my-theme-selector',
}

const themeSelector = useThemeSelector(options)
```

### API 参考

#### 选项

| 选项                    | 类型            | 默认值                     | 描述               |
| ----------------------- | --------------- | -------------------------- | ------------------ |
| `customThemes`          | `ThemeConfig[]` | `[]`                       | 自定义主题列表     |
| `disabledBuiltinThemes` | `string[]`      | `[]`                       | 禁用的内置主题     |
| `defaultTheme`          | `string`        | `'default'`                | 默认主题           |
| `defaultMode`           | `ColorMode`     | `'light'`                  | 默认模式           |
| `autoSave`              | `boolean`       | `true`                     | 是否自动保存到存储 |
| `storageKey`            | `string`        | `'ldesign-theme-selector'` | 存储键名           |

#### 返回值

| 属性                  | 类型                                       | 描述             |
| --------------------- | ------------------------------------------ | ---------------- |
| `currentTheme`        | `Ref<string>`                              | 当前主题名称     |
| `currentMode`         | `Ref<ColorMode>`                           | 当前模式         |
| `availableThemes`     | `ComputedRef<ThemeConfig[]>`               | 可用主题配置列表 |
| `themeConfigs`        | `ComputedRef<Record<string, ThemeConfig>>` | 主题配置映射     |
| `isDark`              | `ComputedRef<boolean>`                     | 是否为暗色模式   |
| `selectTheme`         | `Function`                                 | 选择主题         |
| `setMode`             | `Function`                                 | 设置模式         |
| `toggleMode`          | `Function`                                 | 切换模式         |
| `getThemeConfig`      | `Function`                                 | 获取主题配置     |
| `getThemeDisplayName` | `Function`                                 | 获取主题显示名称 |
| `getThemeDescription` | `Function`                                 | 获取主题描述     |

## useThemeToggle

简单的主题模式切换组合式 API。

### 基础用法

```vue
<script setup>
import { useThemeToggle } from '@ldesign/color/vue'

const { currentMode, isDark, isLight, toggle, setLight, setDark } =
  useThemeToggle()
</script>

<template>
  <div>
    <button @click="toggle">切换到{{ isDark ? '亮色' : '暗色' }}模式</button>

    <button @click="setLight">亮色模式</button>
    <button @click="setDark">暗色模式</button>
  </div>
</template>
```

### 配置选项

```typescript
const options: UseThemeToggleOptions = {
  // 默认模式
  defaultMode: 'light',
  // 是否自动保存到存储
  autoSave: true,
  // 存储键名
  storageKey: 'my-theme-toggle',
  // 是否自动检测系统主题
  autoDetect: true,
  // 切换前回调
  onBeforeToggle: async newMode => {
    console.log('即将切换到:', newMode)
  },
  // 切换后回调
  onAfterToggle: async newMode => {
    console.log('已切换到:', newMode)
  },
}

const themeToggle = useThemeToggle(options)
```

### API 参考

#### 选项

| 选项             | 类型        | 默认值                   | 描述                 |
| ---------------- | ----------- | ------------------------ | -------------------- |
| `defaultMode`    | `ColorMode` | `'light'`                | 默认模式             |
| `autoSave`       | `boolean`   | `true`                   | 是否自动保存到存储   |
| `storageKey`     | `string`    | `'ldesign-theme-toggle'` | 存储键名             |
| `autoDetect`     | `boolean`   | `false`                  | 是否自动检测系统主题 |
| `onBeforeToggle` | `Function`  | -                        | 切换前回调           |
| `onAfterToggle`  | `Function`  | -                        | 切换后回调           |

#### 返回值

| 属性          | 类型                   | 描述           |
| ------------- | ---------------------- | -------------- |
| `currentMode` | `Ref<ColorMode>`       | 当前模式       |
| `isDark`      | `ComputedRef<boolean>` | 是否为暗色模式 |
| `isLight`     | `ComputedRef<boolean>` | 是否为亮色模式 |
| `toggle`      | `Function`             | 切换模式       |
| `setLight`    | `Function`             | 设置为亮色模式 |
| `setDark`     | `Function`             | 设置为暗色模式 |
| `setMode`     | `Function`             | 设置指定模式   |

## useSystemThemeSync

系统主题同步组合式 API，用于与操作系统主题保持同步。

### 基础用法

```vue
<script setup>
import { useSystemThemeSync } from '@ldesign/color/vue'

const {
  systemTheme,
  isSystemDark,
  isSystemLight,
  isSupported,
  isSyncing,
  startSync,
  stopSync,
  toggleSync,
  syncWithSystem,
} = useSystemThemeSync({
  autoStart: true,
  onSync: theme => {
    console.log('系统主题变化:', theme)
  },
})
</script>

<template>
  <div>
    <p>系统主题: {{ systemTheme }}</p>
    <p>是否支持: {{ isSupported }}</p>
    <p>正在同步: {{ isSyncing }}</p>

    <button @click="toggleSync">{{ isSyncing ? '停止' : '开始' }}同步</button>

    <button @click="syncWithSystem">立即同步</button>
  </div>
</template>
```

### 配置选项

```typescript
const options: UseSystemThemeSyncOptions = {
  // 是否自动开始同步
  autoStart: true,
  // 同步时的回调
  onSync: async systemTheme => {
    console.log('系统主题变化:', systemTheme)
  },
  // 同步错误回调
  onError: error => {
    console.error('同步错误:', error)
  },
  // 是否在页面可见性变化时重新检测
  syncOnVisibilityChange: true,
}

const systemSync = useSystemThemeSync(options)
```

### API 参考

#### 选项

| 选项                     | 类型       | 默认值  | 描述                           |
| ------------------------ | ---------- | ------- | ------------------------------ |
| `autoStart`              | `boolean`  | `false` | 是否自动开始同步               |
| `onSync`                 | `Function` | -       | 同步时的回调                   |
| `onError`                | `Function` | -       | 同步错误回调                   |
| `syncOnVisibilityChange` | `boolean`  | `true`  | 是否在页面可见性变化时重新检测 |

#### 返回值

| 属性             | 类型                   | 描述                 |
| ---------------- | ---------------------- | -------------------- |
| `systemTheme`    | `Ref<ColorMode>`       | 系统主题模式         |
| `isSystemDark`   | `ComputedRef<boolean>` | 是否为系统暗色模式   |
| `isSystemLight`  | `ComputedRef<boolean>` | 是否为系统亮色模式   |
| `isSupported`    | `ComputedRef<boolean>` | 是否支持系统主题检测 |
| `isSyncing`      | `Ref<boolean>`         | 是否正在同步         |
| `startSync`      | `Function`             | 开始同步系统主题     |
| `stopSync`       | `Function`             | 停止同步系统主题     |
| `toggleSync`     | `Function`             | 切换同步状态         |
| `syncOnce`       | `Function`             | 手动同步一次         |
| `syncWithSystem` | `Function`             | 与系统主题同步       |

## 组合使用

您可以组合使用多个组合式 API 来实现复杂的主题管理功能：

```vue
<script setup>
import {
  useTheme,
  useThemeSelector,
  useSystemThemeSync,
} from '@ldesign/color/vue'

// 基础主题管理
const theme = useTheme()

// 高级主题选择
const selector = useThemeSelector({
  customThemes: [
    /* 自定义主题 */
  ],
})

// 系统主题同步
const systemSync = useSystemThemeSync({
  autoStart: true,
  onSync: async systemTheme => {
    // 当系统主题变化时，同步到应用主题
    await theme.setMode(systemTheme)
  },
})
</script>
```

## 类型定义

```typescript
// 颜色模式
type ColorMode = 'light' | 'dark'

// 主题配置
interface ThemeConfig {
  name: string
  displayName?: string
  description?: string
  builtin?: boolean
  light?: ColorConfig
  dark?: ColorConfig
  colors?: Record<string, string>
}

// 颜色配置
interface ColorConfig {
  primary?: string
  success?: string
  warning?: string
  danger?: string
  gray?: string
}
```

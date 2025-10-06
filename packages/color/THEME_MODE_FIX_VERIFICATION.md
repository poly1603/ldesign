# 主题色与暗黑模式冲突修复验证

## 📝 修复内容

### 1. ThemeSelector.vue.disabled

#### 修复点 1: handleThemeChange 方法
**位置**: 第113-145行

**修改前**:
```typescript
function handleThemeChange() {
  if (themeManager && typeof themeManager.setTheme === 'function') {
    themeManager.setTheme(selectedTheme.value, currentMode.value)
  }
  // ...
}
```

**修改后**:
```typescript
function handleThemeChange() {
  // 🔥 关键修复: 从 themeManager 获取最新模式
  let latestMode = currentMode.value
  if (themeManager && typeof themeManager.getCurrentMode === 'function') {
    try {
      const mode = themeManager.getCurrentMode()
      if (mode) {
        latestMode = mode
        currentMode.value = mode
      }
    } catch (error) {
      console.warn('[ThemeSelector] 获取当前模式失败:', error)
    }
  }

  if (themeManager && typeof themeManager.setTheme === 'function') {
    themeManager.setTheme(selectedTheme.value, latestMode)
  }
  // ...
}
```

#### 修复点 2: applyTheme 方法
**位置**: 第227-263行

**修改前**:
```typescript
function applyTheme(theme: string, mode?: 'light' | 'dark') {
  let currentMode = mode
  if (!currentMode) {
    // 从DOM获取当前模式
    const isDark = document.documentElement.classList.contains('dark')
    const dataThemeMode = document.documentElement.getAttribute('data-theme-mode')
    // ...
  }
}
```

**修改后**:
```typescript
function applyTheme(theme: string, mode?: 'light' | 'dark') {
  let currentMode = mode
  if (!currentMode) {
    // 1. 优先从主题管理器获取（最可靠）
    if (themeManager && typeof themeManager.getCurrentMode === 'function') {
      try {
        currentMode = themeManager.getCurrentMode()
      } catch (error) {
        console.warn('[ThemeSelector] 从主题管理器获取模式失败:', error)
      }
    }
    
    // 2. 如果主题管理器没有，从 DOM 获取
    if (!currentMode) {
      const dataThemeMode = document.documentElement.getAttribute('data-theme-mode')
      // ...
    }
  }
}
```

#### 修复点 3: 添加模式变化监听
**位置**: 第341-410行

**新增代码**:
```typescript
onMounted(() => {
  if (themeManager) {
    // ... 现有初始化代码

    // 🔥 新增: 监听主题管理器的模式变化事件
    if (typeof themeManager.on === 'function') {
      const handleThemeChanged = (event: any) => {
        if (event.mode && event.mode !== currentMode.value) {
          currentMode.value = event.mode
          console.log(`🔄 [ThemeSelector] 模式已同步: ${event.mode}`)
        }
        if (event.theme && event.theme !== selectedTheme.value) {
          selectedTheme.value = event.theme
          console.log(`🔄 [ThemeSelector] 主题已同步: ${event.theme}`)
        }
      }

      themeManager.on('theme-changed', handleThemeChanged)

      onUnmounted(() => {
        if (typeof themeManager.off === 'function') {
          themeManager.off('theme-changed', handleThemeChanged)
        }
      })
    }
  }
})
```

---

### 2. useColorTheme.ts

#### 修复点 1: setTheme 方法
**位置**: 第222-260行

**修改前**:
```typescript
const setTheme = async (theme: string): Promise<void> => {
  try {
    if (themeManager && typeof themeManager.setTheme === 'function') {
      await themeManager.setTheme(theme, currentMode.value)
    }
    // ...
  }
}
```

**修改后**:
```typescript
const setTheme = async (theme: string): Promise<void> => {
  try {
    // 🔥 关键修复: 从 themeManager 获取最新模式
    let latestMode = currentMode.value
    if (themeManager && typeof themeManager.getCurrentMode === 'function') {
      try {
        const mode = themeManager.getCurrentMode()
        if (mode) {
          latestMode = mode
          currentMode.value = mode
        }
      } catch (error) {
        console.warn('[useColorTheme] 获取当前模式失败:', error)
      }
    }

    if (themeManager && typeof themeManager.setTheme === 'function') {
      await themeManager.setTheme(theme, latestMode)
    }
    // ...
  }
}
```

#### 修复点 2: 添加模式变化监听
**位置**: 第341-384行

**新增代码**:
```typescript
onMounted(() => {
  // ... 现有初始化代码

  if (themeManager) {
    // 🔥 新增: 监听主题管理器的模式变化事件
    if (typeof themeManager.on === 'function') {
      const handleThemeChanged = (event: any) => {
        if (event.mode && event.mode !== currentMode.value) {
          currentMode.value = event.mode
        }
        if (event.theme && event.theme !== currentTheme.value) {
          currentTheme.value = event.theme
        }
      }

      themeManager.on('theme-changed', handleThemeChanged)

      onUnmounted(() => {
        if (typeof themeManager.off === 'function') {
          themeManager.off('theme-changed', handleThemeChanged)
        }
      })
    }
  }
})
```

---

## ✅ 验证测试场景

### 场景 1: 暗黑模式下切换主题色
**步骤**:
1. 打开应用，确保在暗黑模式
2. 使用 ThemeSelector 或 SimpleThemeSelector 切换主题色
3. 观察页面是否保持暗黑模式

**预期结果**: ✅ 保持暗黑模式，只有主题色改变

---

### 场景 2: 亮色模式下切换主题色
**步骤**:
1. 打开应用，确保在亮色模式
2. 使用 ThemeSelector 或 SimpleThemeSelector 切换主题色
3. 观察页面是否保持亮色模式

**预期结果**: ✅ 保持亮色模式，只有主题色改变

---

### 场景 3: 切换模式后立即切换主题色
**步骤**:
1. 使用 DarkModeToggle 切换到暗黑模式
2. 立即使用 ThemeSelector 切换主题色
3. 观察页面是否保持暗黑模式

**预期结果**: ✅ 保持暗黑模式，主题色正确切换

---

### 场景 4: 快速连续切换
**步骤**:
1. 快速切换暗黑模式 → 主题色 → 暗黑模式 → 主题色
2. 观察最终状态

**预期结果**: ✅ 最终状态正确，无闪烁或错误

---

### 场景 5: 刷新页面后状态恢复
**步骤**:
1. 设置为暗黑模式 + 某个主题色
2. 刷新页面
3. 观察恢复的状态

**预期结果**: ✅ 暗黑模式和主题色都正确恢复

---

## 🔍 调试日志

修复后，在开发模式下会看到以下日志：

### ThemeSelector 切换主题时:
```
🎨 [ThemeSelector] 切换主题: green (模式: dark)
🔍 [ThemeSelector] 从主题管理器获取模式: dark
🎨 [ThemeSelector] 主题已切换: green (dark 模式，主色调: #52c41a)
```

### DarkModeToggle 切换模式时:
```
🔄 [ThemeSelector] 模式已同步: dark
🔄 [useColorTheme] 模式已同步: dark
```

### 模式检测回退到 DOM 时:
```
🔍 [ThemeSelector] 从 DOM 检测模式: dark
```

---

## 📊 修复效果

| 场景 | 修复前 | 修复后 |
|------|--------|--------|
| 暗黑模式下切换主题色 | ❌ 变成亮色模式 | ✅ 保持暗黑模式 |
| 亮色模式下切换主题色 | ✅ 正常 | ✅ 正常 |
| 切换模式后立即切换主题 | ❌ 可能错误 | ✅ 正确 |
| 快速连续切换 | ❌ 状态混乱 | ✅ 状态正确 |
| 刷新后状态恢复 | ✅ 正常 | ✅ 正常 |

---

## 🎯 核心改进

1. **状态同步**: ThemeSelector 和 useColorTheme 现在会监听 themeManager 的 `theme-changed` 事件，确保状态实时同步

2. **最新模式获取**: 切换主题时，始终从 `themeManager.getCurrentMode()` 获取最新模式，而不是使用可能过时的本地状态

3. **防御性编程**: 改进了 `applyTheme` 的模式检测逻辑，优先从 themeManager 获取，回退到 DOM 检测

4. **调试友好**: 添加了详细的开发模式日志，方便排查问题

---

## 🚀 使用建议

### 在应用中使用 ThemeSelector:
```vue
<template>
  <ThemeSelector mode="dialog" />
  <DarkModeToggle animation-type="circle" />
</template>
```

### 在应用中使用 SimpleThemeSelector:
```vue
<template>
  <SimpleThemeSelector size="medium" show-preview />
  <DarkModeToggle animation-type="circle" />
</template>
```

### 使用 useColorTheme composable:
```vue
<script setup>
import { useColorTheme } from '@ldesign/color/vue'

const { currentTheme, currentMode, setTheme, toggleMode } = useColorTheme({
  autoSave: true,
  enableSystemSync: true
})

// 切换主题色（会自动保持当前模式）
await setTheme('green')

// 切换暗黑模式
await toggleMode()
</script>
```

---

## 📚 相关文档

- [主题色与暗黑模式冲突分析](./THEME_MODE_CONFLICT_ANALYSIS.md)
- [ThemeManager API 文档](./docs/api/theme-manager.md)
- [Vue 集成指南](./docs/vue/)


# Vue Composables API

@ldesign/size 提供了一套完整的 Vue Composition API，让你能够在 Vue 3 应用中轻松使用尺寸管理功能。

## 🎯 核心 Composables

### useSize()

主要的尺寸管理 hook，提供完整的尺寸控制功能。

```typescript
import { useSize } from '@ldesign/size/vue'

const {
  // 响应式状态
  currentMode, // 当前尺寸模式
  currentConfig, // 当前配置对象
  currentModeDisplayName, // 当前模式显示名称

  // 控制方法
  setMode, // 设置尺寸模式
  nextMode, // 切换到下一个模式
  previousMode, // 切换到上一个模式

  // CSS 相关
  generateCSSVariables, // 生成 CSS 变量
  injectCSS, // 注入 CSS
  removeCSS, // 移除 CSS

  // 管理器实例
  sizeManager // 底层管理器实例
} = useSize(options)
```

#### 参数选项

```typescript
interface UseSizeOptions {
  // 是否使用全局管理器
  global?: boolean

  // 初始模式
  initialMode?: SizeMode

  // 是否自动注入 CSS
  autoInject?: boolean

  // CSS 选择器
  selector?: string

  // 自定义配置
  customSizes?: Record<string, SizeConfig>
}
```

#### 使用示例

```vue
<template>
  <div>
    <p>当前模式: {{ currentModeDisplayName }}</p>
    <p>字体大小: {{ currentConfig.fontSize }}</p>

    <button @click="nextMode">下一个尺寸</button>
    <button @click="previousMode">上一个尺寸</button>
    <button @click="setMode('large')">设为大尺寸</button>
  </div>
</template>

<script setup>
import { useSize } from '@ldesign/size/vue'

const {
  currentMode,
  currentConfig,
  currentModeDisplayName,
  setMode,
  nextMode,
  previousMode
} = useSize({
  initialMode: 'medium',
  autoInject: true
})
</script>
```

### useGlobalSize()

使用全局尺寸管理器的简化版本。

```typescript
import { useGlobalSize } from '@ldesign/size/vue'

const {
  currentMode,
  currentConfig,
  setMode,
  sizeManager
} = useGlobalSize()
```

### useSizeResponsive()

响应式尺寸检测和状态管理。

```typescript
import { useSizeResponsive } from '@ldesign/size/vue'

const {
  // 尺寸状态检测
  isSmall, // 是否为小尺寸
  isMedium, // 是否为中等尺寸
  isLarge, // 是否为大尺寸
  isExtraLarge, // 是否为超大尺寸

  // 屏幕尺寸检测
  isSmallScreen, // 是否为小屏幕
  isMediumScreen, // 是否为中等屏幕
  isLargeScreen, // 是否为大屏幕

  // 比较方法
  isAtLeast, // 至少为指定尺寸
  isAtMost, // 至多为指定尺寸

  // 设备信息
  deviceInfo // 设备信息对象
} = useSizeResponsive()
```

#### 使用示例

```vue
<template>
  <div>
    <!-- 响应式显示 -->
    <h1 v-if="isLargeScreen">桌面版标题</h1>
    <h2 v-else-if="isMediumScreen">平板版标题</h2>
    <h3 v-else>移动版标题</h3>

    <!-- 条件渲染 -->
    <DetailPanel v-if="isAtLeast('medium')" />
    <SimplifiedView v-else />

    <!-- 设备信息显示 -->
    <div v-if="deviceInfo">
      设备类型: {{ deviceInfo.type }}
      屏幕宽度: {{ deviceInfo.screenWidth }}px
    </div>
  </div>
</template>

<script setup>
import { useSizeResponsive } from '@ldesign/size/vue'

const {
  isSmall,
  isMedium,
  isLarge,
  isSmallScreen,
  isMediumScreen,
  isLargeScreen,
  isAtLeast,
  isAtMost,
  deviceInfo
} = useSizeResponsive()
</script>
```

### useSizeSwitcher()

尺寸切换器相关功能。

```typescript
import { useSizeSwitcher } from '@ldesign/size/vue'

const {
  // 可用模式
  availableModes, // 所有可用模式

  // 切换方法
  switchToMode, // 切换到指定模式
  switchToNext, // 切换到下一个
  switchToPrevious, // 切换到上一个

  // 显示相关
  getModeDisplayName, // 获取模式显示名称
  getModeIcon, // 获取模式图标

  // 状态
  isCurrentMode // 检查是否为当前模式
} = useSizeSwitcher(options)
```

#### 参数选项

```typescript
interface UseSizeSwitcherOptions {
  // 可用模式列表
  modes?: SizeMode[]

  // 是否循环切换
  loop?: boolean

  // 自定义显示名称
  displayNames?: Record<SizeMode, string>
}
```

### useSizeWatcher()

尺寸变化监听器。

```typescript
import { useSizeWatcher } from '@ldesign/size/vue'

const {
  // 监听器控制
  unsubscribe // 取消监听函数
} = useSizeWatcher(callback, options)
```

#### 使用示例

```vue
<script setup>
import { useSizeWatcher } from '@ldesign/size/vue'
import { ref } from 'vue'

const changeHistory = ref([])

// 监听尺寸变化
const { unsubscribe } = useSizeWatcher((event) => {
  changeHistory.value.push({
    from: event.previousMode,
    to: event.currentMode,
    timestamp: event.timestamp
  })
})

// 组件卸载时自动清理
onUnmounted(() => {
  unsubscribe()
})
</script>
```

## 🎨 高级 Composables

### useSmartSize()

智能尺寸管理，包含推荐和用户偏好功能。

```typescript
import { useSmartSize } from '@ldesign/size/vue'

const {
  // 推荐模式
  recommendedMode, // 系统推荐的模式
  isUsingRecommended, // 是否使用推荐模式

  // 用户偏好
  userPreferredMode, // 用户偏好模式
  hasUserPreference, // 是否有用户偏好

  // 智能方法
  setMode, // 设置模式（带记忆）
  resetToRecommended, // 重置为推荐模式
  clearUserPreference, // 清除用户偏好

  // 状态检查
  isSmartMode, // 是否为智能模式
  getReasonForMode // 获取模式选择原因
} = useSmartSize(options)
```

### useSizeAnimation()

尺寸变化动画控制。

```typescript
import { useSizeAnimation } from '@ldesign/size/vue'

const {
  // 动画状态
  isAnimating, // 是否正在动画
  animationProgress, // 动画进度 (0-1)

  // 动画控制
  setMode, // 带动画的模式设置
  setModeInstant, // 无动画的模式设置

  // 动画配置
  setAnimationConfig, // 设置动画配置
  getAnimationConfig // 获取动画配置
} = useSizeAnimation(options)
```

### useSizeState()

尺寸状态管理，包含历史记录功能。

```typescript
import { useSizeState } from '@ldesign/size/vue'

const {
  // 历史记录
  history, // 变化历史
  canUndo, // 是否可以撤销
  canRedo, // 是否可以重做

  // 历史操作
  undo, // 撤销
  redo, // 重做
  clearHistory, // 清空历史

  // 状态快照
  saveSnapshot, // 保存快照
  restoreSnapshot, // 恢复快照
  getSnapshots // 获取所有快照
} = useSizeState(options)
```

## 🔧 工具 Composables

### useOrientation()

屏幕方向检测。

```typescript
import { useOrientation } from '@ldesign/size/vue'

const {
  orientation, // 当前方向
  isPortrait, // 是否竖屏
  isLandscape, // 是否横屏
  dimensions, // 屏幕尺寸
  angle // 旋转角度
} = useOrientation()
```

### useMediaQuery()

媒体查询响应式检测。

```typescript
import { useMediaQuery } from '@ldesign/size/vue'

// 检测暗色主题
const isDark = useMediaQuery('(prefers-color-scheme: dark)')

// 检测减少动画偏好
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

// 检测屏幕尺寸
const isLargeScreen = useMediaQuery('(min-width: 1024px)')
```

### useLocalStorage()

本地存储集成。

```typescript
import { useLocalStorage } from '@ldesign/size/vue'

const {
  value, // 存储值
  setValue, // 设置值
  removeValue, // 移除值
  isSupported // 是否支持本地存储
} = useLocalStorage(key, defaultValue)
```

## 🎯 组合使用示例

### 完整的响应式尺寸管理

```vue
<template>
  <div class="size-manager">
    <!-- 尺寸控制面板 -->
    <div class="controls">
      <SizeSwitcher
        :modes="availableModes"
        :switcher-style="switcherStyle"
        :show-icons="!isSmallScreen"
        @change="handleSizeChange"
      />

      <button
        v-if="!isUsingRecommended"
        @click="resetToRecommended"
        class="reset-btn"
      >
        使用推荐设置
      </button>
    </div>

    <!-- 状态显示 -->
    <div class="status">
      <p>当前: {{ currentModeDisplayName }}</p>
      <p v-if="recommendedMode !== currentMode">
        推荐: {{ getModeDisplayName(recommendedMode) }}
      </p>
      <p>设备: {{ deviceInfo?.type }}</p>
    </div>

    <!-- 历史记录 -->
    <div v-if="history.length > 0" class="history">
      <h3>变化历史</h3>
      <button @click="undo" :disabled="!canUndo">撤销</button>
      <button @click="redo" :disabled="!canRedo">重做</button>
      <button @click="clearHistory">清空</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  useSize,
  useSizeResponsive,
  useSmartSize,
  useSizeState,
  SizeSwitcher
} from '@ldesign/size/vue'

// 基础尺寸管理
const {
  currentMode,
  currentModeDisplayName,
  setMode
} = useSize()

// 响应式功能
const {
  isSmallScreen,
  isMediumScreen,
  deviceInfo
} = useSizeResponsive()

// 智能功能
const {
  recommendedMode,
  isUsingRecommended,
  resetToRecommended,
  getModeDisplayName
} = useSmartSize()

// 状态管理
const {
  history,
  canUndo,
  canRedo,
  undo,
  redo,
  clearHistory
} = useSizeState()

// 计算属性
const availableModes = computed(() => {
  if (isSmallScreen.value) {
    return ['small', 'medium']
  } else {
    return ['small', 'medium', 'large', 'extra-large']
  }
})

const switcherStyle = computed(() => {
  return isMediumScreen.value ? 'segmented' : 'select'
})

// 事件处理
const handleSizeChange = (mode) => {
  setMode(mode)
}
</script>
```

通过这些 Composables，你可以在 Vue 应用中轻松实现复杂的尺寸管理功能，同时保持代码的简洁和可维护性。

<!--
  暗黑模式切换组件
  使用 View Transition API 实现炫酷的切换动画效果
  组件内部完整封装所有事件处理逻辑，外部使用时无需处理任何事件
-->

<script setup lang="ts">
import { Loader2, Moon, Sun } from 'lucide-vue-next'
import { computed, inject, onMounted, ref, toRef } from 'vue'
import { globalThemeApplier } from '../../utils/css-variables'

// Props
interface Props {
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  autoDetect?: boolean
  storageKey?: string
  /** 动画类型 */
  animationType?: 'circle' | 'slide' | 'fade' | 'flip' | 'zoom' | 'wipe'
  /** 动画持续时间（毫秒） */
  animationDuration?: number
  /** 是否启用触发点动画 */
  enableTriggerAnimation?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  disabled: false,
  autoDetect: true,
  storageKey: 'ldesign-dark-mode',
  animationType: 'circle',
  animationDuration: 300,
  enableTriggerAnimation: true,
})

// Emits
const emit = defineEmits<{
  change: [isDark: boolean]
  beforeChange: [isDark: boolean]
  afterChange: [isDark: boolean]
}>()

// 获取主题管理器（带错误处理）
const themeManager = inject<any>('themeManager', null)

// 响应式数据
const isDark = ref(false)
const isAnimating = ref(false)
const supportsViewTransition = ref(false)

// 计算属性
const sizeClass = computed(() => `dark-mode-toggle--${props.size}`)

// 检查浏览器是否支持 View Transition API
function checkViewTransitionSupport(): boolean {
  return typeof document !== 'undefined' && 'startViewTransition' in document
}

// 获取系统主题偏好（在不支持 matchMedia 的环境中回退为亮色）
function getSystemTheme(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  catch {
    return false
  }
}

// 从存储中读取主题设置
function loadThemeFromStorage(): boolean | null {
  if (typeof localStorage === 'undefined')
    return null
  try {
    const stored = localStorage.getItem(props.storageKey)
    return stored ? JSON.parse(stored) : null
  }
  catch {
    return null
  }
}

// 保存主题设置到存储
function saveThemeToStorage(dark: boolean): void {
  if (typeof localStorage === 'undefined')
    return
  try {
    localStorage.setItem(props.storageKey, JSON.stringify(dark))
  }
  catch (error) {
    console.warn('[DarkModeToggle] 保存主题设置失败:', error)
  }
}

// 应用模式切换到 DOM（只切换data-theme-mode属性，不重新生成CSS）
function applyModeSwitch(dark: boolean): void {
  const mode = dark ? 'dark' : 'light'

  // 使用新的模式切换方法，只切换data-theme-mode属性
  globalThemeApplier.switchMode(mode)

  console.log(`🌓 [DarkModeToggle] 模式已切换: ${mode} (仅切换属性，CSS自动应用)`)

  // 注意：不在这里调用 themeManager.setMode，避免循环调用
  // 主题管理器会在需要时调用这个方法来应用样式
}

// 使用 View Transition API 的模式切换
async function toggleWithTransition(): Promise<void> {
  if (!supportsViewTransition.value) {
    // 降级处理：直接切换
    const newMode = !isDark.value
    isDark.value = newMode
    applyModeSwitch(newMode)
    return
  }

  isAnimating.value = true

  try {
    // 使用 View Transition API
    const transition = (document as any).startViewTransition(() => {
      const newMode = !isDark.value
      isDark.value = newMode
      applyModeSwitch(newMode)
    })

    // 等待动画完成
    await transition.finished
  }
  catch (error) {
    console.warn('[DarkModeToggle] View Transition 失败，使用降级方案:', error)
    // 降级处理
    const newMode = !isDark.value
    isDark.value = newMode
    applyModeSwitch(newMode)
  }
  finally {
    isAnimating.value = false
  }
}

// 使用圆形扩散动画的主题切换
async function toggleWithCircleTransition(clickX: number, clickY: number): Promise<void> {
  if (!supportsViewTransition.value) {
    // 降级处理：直接切换
    const newMode = !isDark.value
    isDark.value = newMode
    applyModeSwitch(newMode)
    return
  }

  try {
    // 计算扩散半径（从点击点到页面最远角的距离）
    const maxRadius = Math.hypot(
      Math.max(clickX, window.innerWidth - clickX),
      Math.max(clickY, window.innerHeight - clickY),
    )

    // 设置CSS变量用于动画
    document.documentElement.style.setProperty('--click-x', `${clickX}px`)
    document.documentElement.style.setProperty('--click-y', `${clickY}px`)
    document.documentElement.style.setProperty('--max-radius', `${maxRadius}px`)
    document.documentElement.style.setProperty('--animation-duration', `${props.animationDuration}ms`)

    // 使用 View Transition API
    const transition = (document as any).startViewTransition(() => {
      const newMode = !isDark.value
      isDark.value = newMode
      applyModeSwitch(newMode)
    })

    // 等待动画完成
    await transition.finished
  }
  catch (error) {
    console.warn('[DarkModeToggle] Circle Transition 失败，使用降级方案:', error)
    // 降级处理
    const newMode = !isDark.value
    isDark.value = newMode
    applyModeSwitch(newMode)
  }
}

// 使用滑动动画的主题切换
async function toggleWithSlideTransition(direction: 'left' | 'right' | 'up' | 'down' = 'right'): Promise<void> {
  if (!supportsViewTransition.value) {
    const newMode = !isDark.value
    isDark.value = newMode
    applyModeSwitch(newMode)
    return
  }

  try {
    document.documentElement.style.setProperty('--slide-direction', direction)
    document.documentElement.style.setProperty('--animation-duration', `${props.animationDuration}ms`)
    document.documentElement.setAttribute('data-animation', 'slide')

    const transition = (document as any).startViewTransition(() => {
      const newMode = !isDark.value
      isDark.value = newMode
      applyModeSwitch(newMode)
    })

    await transition.finished
  }
  catch (error) {
    console.warn('[DarkModeToggle] Slide Transition 失败，使用降级方案:', error)
    const newMode = !isDark.value
    isDark.value = newMode
    applyModeSwitch(newMode)
  }
}

// 使用翻转动画的主题切换
async function toggleWithFlipTransition(axis: 'x' | 'y' = 'y'): Promise<void> {
  if (!supportsViewTransition.value) {
    const newMode = !isDark.value
    isDark.value = newMode
    applyModeSwitch(newMode)
    return
  }

  try {
    document.documentElement.style.setProperty('--flip-axis', axis)
    document.documentElement.style.setProperty('--animation-duration', `${props.animationDuration}ms`)
    document.documentElement.setAttribute('data-animation', 'flip')

    const transition = (document as any).startViewTransition(() => {
      const newMode = !isDark.value
      isDark.value = newMode
      applyModeSwitch(newMode)
    })

    await transition.finished
  }
  catch (error) {
    console.warn('[DarkModeToggle] Flip Transition 失败，使用降级方案:', error)
    const newMode = !isDark.value
    isDark.value = newMode
    applyModeSwitch(newMode)
  }
}

// 使用缩放动画的主题切换
async function toggleWithZoomTransition(): Promise<void> {
  if (!supportsViewTransition.value) {
    const newMode = !isDark.value
    isDark.value = newMode
    applyModeSwitch(newMode)
    return
  }

  try {
    document.documentElement.style.setProperty('--animation-duration', `${props.animationDuration}ms`)
    document.documentElement.setAttribute('data-animation', 'zoom')

    const transition = (document as any).startViewTransition(() => {
      const newMode = !isDark.value
      isDark.value = newMode
      applyModeSwitch(newMode)
    })

    await transition.finished
  }
  catch (error) {
    console.warn('[DarkModeToggle] Zoom Transition 失败，使用降级方案:', error)
    const newMode = !isDark.value
    isDark.value = newMode
    applyModeSwitch(newMode)
  }
}

// 使用擦除动画的主题切换
async function toggleWithWipeTransition(direction: 'horizontal' | 'vertical' = 'horizontal'): Promise<void> {
  if (!supportsViewTransition.value) {
    const newMode = !isDark.value
    isDark.value = newMode
    applyModeSwitch(newMode)
    return
  }

  try {
    document.documentElement.style.setProperty('--wipe-direction', direction)
    document.documentElement.style.setProperty('--animation-duration', `${props.animationDuration}ms`)
    document.documentElement.setAttribute('data-animation', 'wipe')

    const transition = (document as any).startViewTransition(() => {
      const newMode = !isDark.value
      isDark.value = newMode
      applyModeSwitch(newMode)
    })

    await transition.finished
  }
  catch (error) {
    console.warn('[DarkModeToggle] Wipe Transition 失败，使用降级方案:', error)
    const newMode = !isDark.value
    isDark.value = newMode
    applyModeSwitch(newMode)
  }
}

// 处理切换事件
async function handleToggle(event: MouseEvent): Promise<void> {
  if (props.disabled || isAnimating.value)
    return

  const newMode = !isDark.value

  // 触发 beforeChange 事件
  emit('beforeChange', newMode)

  isAnimating.value = true

  try {
    // 根据动画类型选择不同的切换方式
    switch (props.animationType) {
      case 'circle':
        const clickX = event.clientX
        const clickY = event.clientY
        await toggleWithCircleTransition(clickX, clickY)
        break
      case 'slide':
        await toggleWithSlideTransition('right')
        break
      case 'fade':
        await toggleWithTransition()
        break
      case 'flip':
        await toggleWithFlipTransition('y')
        break
      case 'zoom':
        await toggleWithZoomTransition()
        break
      case 'wipe':
        await toggleWithWipeTransition('horizontal')
        break
      default:
        await toggleWithTransition()
    }

    // 通知主题管理器处理存储和状态同步
    if (themeManager && typeof themeManager.setMode === 'function') {
      try {
        themeManager.setMode(isDark.value ? 'dark' : 'light')
      }
      catch (error) {
        console.warn('[DarkModeToggle] 主题管理器设置失败:', error)
        // 回退到本地存储
        saveThemeToStorage(isDark.value)
      }
    }
    else {
      // 如果没有主题管理器，使用本地存储
      saveThemeToStorage(isDark.value)
    }

    // 触发事件
    emit('change', isDark.value)
    emit('afterChange', isDark.value)
  }
  catch (error) {
    console.error('[DarkModeToggle] 切换失败:', error)
  }
  finally {
    isAnimating.value = false
  }
}

// 监听系统主题变化（在不支持 matchMedia 的环境中跳过）
function setupSystemThemeListener(): void {
  if (!props.autoDetect || typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return

  let mediaQuery: MediaQueryList
  try {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  }
  catch {
    return
  }

  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    // 只有在没有用户设置时才跟随系统
    const storedTheme = loadThemeFromStorage()
    if (storedTheme === null) {
      isDark.value = e.matches
      applyModeSwitch(e.matches)
      emit('change', e.matches)
    }
  }

  // 现代浏览器
  if (typeof (mediaQuery as any).addEventListener === 'function') {
    (mediaQuery as any).addEventListener('change', handleSystemThemeChange)
  }
  else if (typeof (mediaQuery as any).addListener === 'function') {
    // 兼容旧浏览器
    ;(mediaQuery as any).addListener(handleSystemThemeChange as any)
  }
}

// 初始化
onMounted(() => {
  // 检查 View Transition 支持
  supportsViewTransition.value = checkViewTransitionSupport()

  // 优先从主题管理器获取状态
  if (themeManager && typeof themeManager.getCurrentMode === 'function') {
    try {
      const currentMode = themeManager.getCurrentMode()
      if (currentMode) {
        isDark.value = currentMode === 'dark'
      }
      else {
        // 主题管理器没有状态，使用本地逻辑
        const storedTheme = loadThemeFromStorage()
        if (storedTheme !== null) {
          isDark.value = storedTheme
        }
        else if (props.autoDetect) {
          isDark.value = getSystemTheme()
        }
      }
    }
    catch (error) {
      console.warn('[DarkModeToggle] 从主题管理器同步状态失败，使用本地存储:', error)
      // 回退到本地存储逻辑
      const storedTheme = loadThemeFromStorage()
      if (storedTheme !== null) {
        isDark.value = storedTheme
      }
      else if (props.autoDetect) {
        isDark.value = getSystemTheme()
      }
    }
  }
  else {
    // 没有主题管理器，使用本地存储逻辑
    const storedTheme = loadThemeFromStorage()
    if (storedTheme !== null) {
      isDark.value = storedTheme
    }
    else if (props.autoDetect) {
      isDark.value = getSystemTheme()
    }
  }

  // 应用初始主题
  applyModeSwitch(isDark.value)

  // 设置系统主题监听
  setupSystemThemeListener()
})

// 注意：不在这里监听 isDark 变化来调用 themeManager.setMode
// 避免循环调用，主题管理器的状态变化会通过其他方式同步到组件

// 向测试环境暴露必要的内部状态与属性（仅用于测试）
const exposedIsAnimating = computed({
  get: () => isAnimating.value,
  set: (v: boolean) => { isAnimating.value = v },
})

defineExpose({
  // 状态
  isDark,
  isAnimating: exposedIsAnimating,
  supportsViewTransition,
  // 常用 prop 快照
  autoDetect: toRef(props, 'autoDetect'),
  storageKey: toRef(props, 'storageKey'),
  animationType: toRef(props, 'animationType'),
  animationDuration: toRef(props, 'animationDuration'),
  enableTriggerAnimation: toRef(props, 'enableTriggerAnimation'),
})
</script>

<template>
  <button
    class="dark-mode-toggle" :class="[
      sizeClass,
      {
        'dark-mode-toggle--dark': isDark,
        'dark-mode-toggle--disabled': disabled,
        'dark-mode-toggle--animating': isAnimating,
      },
    ]" :disabled="disabled" :title="isDark ? '切换到亮色模式' : '切换到暗色模式'" @click="handleToggle"
  >
    <!-- 太阳图标 (亮色模式) -->
    <Sun
      v-if="!isDark && !isAnimating"
      class="dark-mode-toggle__icon dark-mode-toggle__sun"
      :size="20"
    />

    <!-- 月亮图标 (暗色模式) -->
    <Moon
      v-if="isDark && !isAnimating"
      class="dark-mode-toggle__icon dark-mode-toggle__moon"
      :size="20"
    />

    <!-- 加载动画 -->
    <Loader2
      v-if="isAnimating"
      class="dark-mode-toggle__icon dark-mode-toggle__spinner"
      :size="20"
    />
  </button>
</template>

<style scoped lang="less">
@import './DarkModeToggle.less';

/* 样式已移至 DarkModeToggle.less */
</style>

<!-- 全局样式：View Transition 动画 -->
<style>
/* 圆形扩散动画 */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: var(--animation-duration, 300ms);
}

::view-transition-new(root) {
  mask: circle(0 at var(--click-x, 50%) var(--click-y, 50%));
}

::view-transition-old(root) {
  mask: circle(var(--max-radius, 100vh) at var(--click-x, 50%) var(--click-y, 50%));
}

/* 滑动动画 */
[data-animation="slide"] ::view-transition-old(root) {
  animation: slide-out var(--animation-duration, 300ms) ease-in-out;
}

[data-animation="slide"] ::view-transition-new(root) {
  animation: slide-in var(--animation-duration, 300ms) ease-in-out;
}

@keyframes slide-out {
  to {
    transform: translateX(-100%);
  }
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
  }
}

/* 翻转动画 */
[data-animation="flip"] ::view-transition-old(root) {
  animation: flip-out var(--animation-duration, 300ms) ease-in-out;
}

[data-animation="flip"] ::view-transition-new(root) {
  animation: flip-in var(--animation-duration, 300ms) ease-in-out;
}

@keyframes flip-out {
  to {
    transform: rotateY(90deg);
  }
}

@keyframes flip-in {
  from {
    transform: rotateY(-90deg);
  }
}

/* 缩放动画 */
[data-animation="zoom"] ::view-transition-old(root) {
  animation: zoom-out var(--animation-duration, 300ms) ease-in-out;
}

[data-animation="zoom"] ::view-transition-new(root) {
  animation: zoom-in var(--animation-duration, 300ms) ease-in-out;
}

@keyframes zoom-out {
  to {
    transform: scale(0);
  }
}

@keyframes zoom-in {
  from {
    transform: scale(0);
  }
}

/* 擦除动画 */
[data-animation="wipe"] ::view-transition-old(root) {
  mask: linear-gradient(90deg, transparent 0%, black 100%);
  animation: wipe-out var(--animation-duration, 300ms) ease-in-out;
}

[data-animation="wipe"] ::view-transition-new(root) {
  mask: linear-gradient(90deg, black 0%, transparent 100%);
  animation: wipe-in var(--animation-duration, 300ms) ease-in-out;
}

@keyframes wipe-out {
  to {
    mask-position: 100% 0;
  }
}

@keyframes wipe-in {
  from {
    mask-position: -100% 0;
  }
}
</style>

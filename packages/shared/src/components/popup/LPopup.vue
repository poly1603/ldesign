<!--
  弹出层组件
  支持多种触发方式和丰富的动画效果
-->

<template>
  <div class="l-popup" ref="triggerRef">
    <!-- 触发元素 -->
    <div class="l-popup__trigger" @click="handleTriggerClick" @mouseenter="handleTriggerMouseEnter"
      @mouseleave="handleTriggerMouseLeave" @focus="handleTriggerFocus" @blur="handleTriggerBlur">
      <slot />
    </div>

    <!-- 弹出层 -->
    <Teleport to="body">
      <Transition :name="`l-popup-${animation}`" appear>
        <div v-if="isVisible" ref="popupRef" class="l-popup__content" :class="[
          `l-popup__content--${currentPlacement}`,
          popupClass
        ]" :style="{
          ...popupPosition,
          width: typeof width === 'number' ? `${width}px` : width,
          maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
          maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
          zIndex,
          ...popupStyle
        }" @mouseenter="handlePopupMouseEnter" @mouseleave="handlePopupMouseLeave">
          <!-- 箭头 -->
          <div v-if="showArrow" class="l-popup__arrow" :class="`l-popup__arrow--${currentPlacement}`" :style="{
            '--arrow-size': `${arrowSize}px`
          }" />

          <!-- 标题 -->
          <div v-if="title || $slots.title" class="l-popup__title">
            <slot name="title">{{ title }}</slot>
          </div>

          <!-- 内容 -->
          <div class="l-popup__body">
            <slot name="content">{{ content }}</slot>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import type { PopupProps, PopupEmits, PopupPlacement, PopupPosition } from './types'

// Props
const props = withDefaults(defineProps<PopupProps>(), {
  visible: false,
  placement: 'bottom',
  trigger: 'click',
  disabled: false,
  showArrow: true,
  arrowSize: 8,
  offset: 8,
  showDelay: 0,
  hideDelay: 100,
  closeOnClickOutside: true,
  closeOnEscape: true,
  zIndex: 1000,
  animation: 'fade',
  animationDuration: 200,
  keepInViewport: true,
  followScroll: false
})

// Emits
const emit = defineEmits<PopupEmits>()

// 响应式数据
const triggerRef = ref<HTMLElement>()
const popupRef = ref<HTMLElement>()
const isVisible = ref(false)
const currentPlacement = ref<PopupPlacement>(props.placement)
const popupPosition = ref<Partial<PopupPosition>>({})
const showTimer = ref<number>()
const hideTimer = ref<number>()
const isHoveringTrigger = ref(false)
const isHoveringPopup = ref(false)

// 计算属性
const shouldShow = computed(() => {
  if (props.trigger === 'hover') {
    return isHoveringTrigger.value || isHoveringPopup.value
  }
  return isVisible.value
})

// 监听器
watch(() => props.visible, (newVisible) => {
  if (newVisible !== isVisible.value) {
    if (newVisible) {
      show()
    } else {
      hide()
    }
  }
})

watch(shouldShow, (newShouldShow) => {
  if (props.trigger === 'hover') {
    if (newShouldShow) {
      clearTimeout(hideTimer.value)
      showTimer.value = window.setTimeout(() => {
        show()
      }, props.showDelay)
    } else {
      clearTimeout(showTimer.value)
      hideTimer.value = window.setTimeout(() => {
        hide()
      }, props.hideDelay)
    }
  }
})

// 方法
const calculatePosition = (): PopupPosition => {
  if (!triggerRef.value || !popupRef.value) {
    return { top: 0, left: 0, placement: props.placement }
  }

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const popupRect = popupRef.value.getBoundingClientRect()
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  }

  let placement = props.placement
  let top = 0
  let left = 0

  // 计算基础位置
  switch (placement) {
    case 'top':
    case 'top-start':
    case 'top-end':
      top = triggerRect.top - popupRect.height - props.offset
      break
    case 'bottom':
    case 'bottom-start':
    case 'bottom-end':
      top = triggerRect.bottom + props.offset
      break
    case 'left':
    case 'left-start':
    case 'left-end':
      left = triggerRect.left - popupRect.width - props.offset
      break
    case 'right':
    case 'right-start':
    case 'right-end':
      left = triggerRect.right + props.offset
      break
  }

  // 计算水平位置
  if (placement.includes('top') || placement.includes('bottom')) {
    if (placement.endsWith('-start')) {
      left = triggerRect.left
    } else if (placement.endsWith('-end')) {
      left = triggerRect.right - popupRect.width
    } else {
      left = triggerRect.left + (triggerRect.width - popupRect.width) / 2
    }
  }

  // 计算垂直位置
  if (placement.includes('left') || placement.includes('right')) {
    if (placement.endsWith('-start')) {
      top = triggerRect.top
    } else if (placement.endsWith('-end')) {
      top = triggerRect.bottom - popupRect.height
    } else {
      top = triggerRect.top + (triggerRect.height - popupRect.height) / 2
    }
  }

  // 保持在视口内
  if (props.keepInViewport) {
    if (left < 0) left = 8
    if (left + popupRect.width > viewport.width) left = viewport.width - popupRect.width - 8
    if (top < 0) top = 8
    if (top + popupRect.height > viewport.height) top = viewport.height - popupRect.height - 8
  }

  return { top, left, placement }
}

const updatePosition = async () => {
  if (!isVisible.value) return

  await nextTick()
  const position = calculatePosition()
  currentPlacement.value = position.placement
  popupPosition.value = {
    top: `${position.top}px`,
    left: `${position.left}px`
  }
}

const show = async () => {
  if (props.disabled || isVisible.value) return

  isVisible.value = true
  emit('update:visible', true)
  emit('show')

  await updatePosition()
}

const hide = () => {
  if (!isVisible.value) return

  isVisible.value = false
  emit('update:visible', false)
  emit('hide')
}

// 事件处理
const handleTriggerClick = () => {
  if (props.trigger === 'click') {
    if (isVisible.value) {
      hide()
    } else {
      show()
    }
  }
}

const handleTriggerMouseEnter = () => {
  if (props.trigger === 'hover') {
    isHoveringTrigger.value = true
  }
}

const handleTriggerMouseLeave = () => {
  if (props.trigger === 'hover') {
    isHoveringTrigger.value = false
  }
}

const handleTriggerFocus = () => {
  if (props.trigger === 'focus') {
    show()
  }
}

const handleTriggerBlur = () => {
  if (props.trigger === 'focus') {
    hide()
  }
}

const handlePopupMouseEnter = () => {
  if (props.trigger === 'hover') {
    isHoveringPopup.value = true
  }
}

const handlePopupMouseLeave = () => {
  if (props.trigger === 'hover') {
    isHoveringPopup.value = false
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (!props.closeOnClickOutside || !isVisible.value) return

  const target = event.target as Element
  if (!triggerRef.value?.contains(target) && !popupRef.value?.contains(target)) {
    hide()
    emit('click-outside', event)
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closeOnEscape && isVisible.value) {
    hide()
  }
}

const handleScroll = () => {
  if (props.followScroll && isVisible.value) {
    updatePosition()
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
  if (props.followScroll) {
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleScroll)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
  if (props.followScroll) {
    window.removeEventListener('scroll', handleScroll, true)
    window.removeEventListener('resize', handleScroll)
  }
  clearTimeout(showTimer.value)
  clearTimeout(hideTimer.value)
})

// 暴露方法
defineExpose({
  show,
  hide,
  updatePosition
})
</script>

<style lang="less" scoped>
.l-popup {
  display: inline-block;

  &__trigger {
    display: inline-block;
  }

  &__content {
    position: absolute;
    background: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 12px;
    max-width: 300px;
    word-wrap: break-word;
    font-size: 14px;
    line-height: 1.5;
  }

  &__title {
    font-weight: 600;
    margin-bottom: 8px;
    color: #262626;
  }

  &__body {
    color: #595959;
  }

  &__arrow {
    position: absolute;
    width: 0;
    height: 0;
    border: var(--arrow-size, 8px) solid transparent;

    &--top {
      bottom: calc(-1 * var(--arrow-size, 8px) * 2);
      left: 50%;
      transform: translateX(-50%);
      border-top-color: #fff;
      border-bottom: none;

      &::before {
        content: '';
        position: absolute;
        top: calc(-1 * var(--arrow-size, 8px) - 1px);
        left: calc(-1 * var(--arrow-size, 8px));
        border: calc(var(--arrow-size, 8px) + 1px) solid transparent;
        border-top-color: #d9d9d9;
        border-bottom: none;
      }
    }

    &--bottom {
      top: calc(-1 * var(--arrow-size, 8px) * 2);
      left: 50%;
      transform: translateX(-50%);
      border-bottom-color: #fff;
      border-top: none;

      &::before {
        content: '';
        position: absolute;
        bottom: calc(-1 * var(--arrow-size, 8px) - 1px);
        left: calc(-1 * var(--arrow-size, 8px));
        border: calc(var(--arrow-size, 8px) + 1px) solid transparent;
        border-bottom-color: #d9d9d9;
        border-top: none;
      }
    }

    &--left {
      right: calc(-1 * var(--arrow-size, 8px) * 2);
      top: 50%;
      transform: translateY(-50%);
      border-left-color: #fff;
      border-right: none;

      &::before {
        content: '';
        position: absolute;
        left: calc(-1 * var(--arrow-size, 8px) - 1px);
        top: calc(-1 * var(--arrow-size, 8px));
        border: calc(var(--arrow-size, 8px) + 1px) solid transparent;
        border-left-color: #d9d9d9;
        border-right: none;
      }
    }

    &--right {
      left: calc(-1 * var(--arrow-size, 8px) * 2);
      top: 50%;
      transform: translateY(-50%);
      border-right-color: #fff;
      border-left: none;

      &::before {
        content: '';
        position: absolute;
        right: calc(-1 * var(--arrow-size, 8px) - 1px);
        top: calc(-1 * var(--arrow-size, 8px));
        border: calc(var(--arrow-size, 8px) + 1px) solid transparent;
        border-right-color: #d9d9d9;
        border-left: none;
      }
    }
  }
}

/* 动画效果 */
.l-popup-fade-enter-active,
.l-popup-fade-leave-active {
  transition: opacity 0.2s ease;
}

.l-popup-fade-enter-from,
.l-popup-fade-leave-to {
  opacity: 0;
}

.l-popup-slide-enter-active,
.l-popup-slide-leave-active {
  transition: all 0.2s ease;
}

.l-popup-slide-enter-from,
.l-popup-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.l-popup-zoom-enter-active,
.l-popup-zoom-leave-active {
  transition: all 0.2s ease;
}

.l-popup-zoom-enter-from,
.l-popup-zoom-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.l-popup-bounce-enter-active {
  animation: l-popup-bounce-in 0.3s ease;
}

.l-popup-bounce-leave-active {
  animation: l-popup-bounce-out 0.2s ease;
}

@keyframes l-popup-bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }

  50% {
    transform: scale(1.05);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes l-popup-bounce-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }

  100% {
    opacity: 0;
    transform: scale(0.8);
  }
}
</style>

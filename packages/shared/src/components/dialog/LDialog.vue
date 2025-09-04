<!--
  对话框组件
  支持拖拽、调整大小和丰富的动画效果
-->

<template>
  <Teleport to="body">
    <Transition :name="`l-dialog-${animation}`" appear>
      <div v-if="isVisible" class="l-dialog-wrapper" :style="{ zIndex }">
        <!-- 遮罩层 -->
        <div v-if="showMask" class="l-dialog-mask" :class="maskClass" :style="maskStyle" @click="handleMaskClick" />

        <!-- 对话框 -->
        <div ref="dialogRef" class="l-dialog" :class="[
          dialogClass,
          {
            'l-dialog--center': center,
            'l-dialog--fullscreen': fullscreen,
            'l-dialog--draggable': draggable,
            'l-dialog--resizable': resizable
          }
        ]" :style="{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
          maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
          ...dialogPosition,
          ...dialogStyle
        }" @mousedown="handleMouseDown">
          <!-- 头部 -->
          <div v-if="showHeader" ref="headerRef" class="l-dialog__header"
            :class="{ 'l-dialog__header--draggable': draggable }">
            <div class="l-dialog__title">
              <slot name="title">{{ title }}</slot>
            </div>

            <button v-if="showClose" class="l-dialog__close" @click="handleClose">
              ×
            </button>
          </div>

          <!-- 内容 -->
          <div class="l-dialog__body">
            <slot />
          </div>

          <!-- 底部 -->
          <div v-if="showFooter" class="l-dialog__footer">
            <slot name="footer">
              <button v-if="showCancel" class="l-dialog__button l-dialog__button--cancel" @click="handleCancel">
                {{ cancelText }}
              </button>
              <button v-if="showConfirm" class="l-dialog__button l-dialog__button--confirm"
                :class="`l-dialog__button--${confirmType}`" :disabled="confirmLoading" @click="handleConfirm">
                <span v-if="confirmLoading" class="l-dialog__loading">⟳</span>
                {{ confirmText }}
              </button>
            </slot>
          </div>

          <!-- 调整大小手柄 -->
          <div v-if="resizable && !fullscreen" class="l-dialog__resize-handles">
            <div class="l-dialog__resize-handle l-dialog__resize-handle--n"
              @mousedown="handleResizeStart('n', $event)" />
            <div class="l-dialog__resize-handle l-dialog__resize-handle--s"
              @mousedown="handleResizeStart('s', $event)" />
            <div class="l-dialog__resize-handle l-dialog__resize-handle--w"
              @mousedown="handleResizeStart('w', $event)" />
            <div class="l-dialog__resize-handle l-dialog__resize-handle--e"
              @mousedown="handleResizeStart('e', $event)" />
            <div class="l-dialog__resize-handle l-dialog__resize-handle--nw"
              @mousedown="handleResizeStart('nw', $event)" />
            <div class="l-dialog__resize-handle l-dialog__resize-handle--ne"
              @mousedown="handleResizeStart('ne', $event)" />
            <div class="l-dialog__resize-handle l-dialog__resize-handle--sw"
              @mousedown="handleResizeStart('sw', $event)" />
            <div class="l-dialog__resize-handle l-dialog__resize-handle--se"
              @mousedown="handleResizeStart('se', $event)" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import type { DialogProps, DialogEmits, DialogPosition } from './types'

// Props
const props = withDefaults(defineProps<DialogProps>(), {
  visible: false,
  width: 520,
  showClose: true,
  showMask: true,
  closeOnClickMask: true,
  closeOnEscape: true,
  draggable: false,
  resizable: false,
  center: true,
  fullscreen: false,
  lockScroll: true,
  zIndex: 1000,
  animation: 'fade',
  animationDuration: 200,
  destroyOnClose: false,
  showHeader: true,
  showFooter: false,
  confirmText: '确定',
  cancelText: '取消',
  confirmType: 'primary',
  showConfirm: true,
  showCancel: true,
  confirmLoading: false
})

// Emits
const emit = defineEmits<DialogEmits>()

// 响应式数据
const dialogRef = ref<HTMLElement>()
const headerRef = ref<HTMLElement>()
const isVisible = ref(false)
const dialogPosition = ref<Partial<DialogPosition>>({})
const isDragging = ref(false)
const isResizing = ref(false)
const dragStart = ref({ x: 0, y: 0, left: 0, top: 0 })
const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0, direction: '' })

// 监听器
watch(() => props.visible, (newVisible) => {
  if (newVisible !== isVisible.value) {
    if (newVisible) {
      open()
    } else {
      close()
    }
  }
})

// 方法
const open = async () => {
  if (isVisible.value) return

  isVisible.value = true
  emit('update:visible', true)
  emit('open')

  await nextTick()

  if (props.center && !props.fullscreen) {
    centerDialog()
  }

  if (props.lockScroll) {
    document.body.style.overflow = 'hidden'
  }
}

const close = () => {
  if (!isVisible.value) return

  isVisible.value = false
  emit('update:visible', false)
  emit('close')

  if (props.lockScroll) {
    document.body.style.overflow = ''
  }
}

const centerDialog = () => {
  if (!dialogRef.value) return

  const rect = dialogRef.value.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  const left = (viewportWidth - rect.width) / 2
  const top = (viewportHeight - rect.height) / 2

  dialogPosition.value = {
    left: Math.max(0, left),
    top: Math.max(0, top)
  }
}

// 事件处理
const handleMaskClick = (event: MouseEvent) => {
  if (props.closeOnClickMask) {
    close()
  }
  emit('mask-click', event)
}

const handleClose = () => {
  close()
}

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  close()
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closeOnEscape && isVisible.value) {
    close()
  }
}

// 拖拽功能
const handleMouseDown = (event: MouseEvent) => {
  if (!props.draggable || props.fullscreen) return

  const target = event.target as Element
  if (!headerRef.value?.contains(target)) return

  event.preventDefault()
  isDragging.value = true

  const rect = dialogRef.value!.getBoundingClientRect()
  dragStart.value = {
    x: event.clientX,
    y: event.clientY,
    left: rect.left,
    top: rect.top
  }

  document.addEventListener('mousemove', handleDragMove)
  document.addEventListener('mouseup', handleDragEnd)
}

const handleDragMove = (event: MouseEvent) => {
  if (!isDragging.value) return

  const deltaX = event.clientX - dragStart.value.x
  const deltaY = event.clientY - dragStart.value.y

  dialogPosition.value = {
    left: dragStart.value.left + deltaX,
    top: dragStart.value.top + deltaY
  }
}

const handleDragEnd = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
}

// 调整大小功能
const handleResizeStart = (direction: string, event: MouseEvent) => {
  if (!props.resizable || props.fullscreen) return

  event.preventDefault()
  event.stopPropagation()
  isResizing.value = true

  const rect = dialogRef.value!.getBoundingClientRect()
  resizeStart.value = {
    x: event.clientX,
    y: event.clientY,
    width: rect.width,
    height: rect.height,
    direction
  }

  document.addEventListener('mousemove', handleResizeMove)
  document.addEventListener('mouseup', handleResizeEnd)
}

const handleResizeMove = (event: MouseEvent) => {
  if (!isResizing.value) return

  const deltaX = event.clientX - resizeStart.value.x
  const deltaY = event.clientY - resizeStart.value.y
  const direction = resizeStart.value.direction

  let newWidth = resizeStart.value.width
  let newHeight = resizeStart.value.height
  let newLeft = dialogPosition.value.left || 0
  let newTop = dialogPosition.value.top || 0

  if (direction.includes('e')) {
    newWidth = Math.max(200, resizeStart.value.width + deltaX)
  }
  if (direction.includes('w')) {
    newWidth = Math.max(200, resizeStart.value.width - deltaX)
    newLeft = (dialogPosition.value.left || 0) + deltaX
  }
  if (direction.includes('s')) {
    newHeight = Math.max(100, resizeStart.value.height + deltaY)
  }
  if (direction.includes('n')) {
    newHeight = Math.max(100, resizeStart.value.height - deltaY)
    newTop = (dialogPosition.value.top || 0) + deltaY
  }

  dialogRef.value!.style.width = `${newWidth}px`
  dialogRef.value!.style.height = `${newHeight}px`

  dialogPosition.value = {
    left: newLeft,
    top: newTop
  }
}

const handleResizeEnd = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResizeMove)
  document.removeEventListener('mouseup', handleResizeEnd)
}

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
  document.removeEventListener('mousemove', handleResizeMove)
  document.removeEventListener('mouseup', handleResizeEnd)

  if (props.lockScroll) {
    document.body.style.overflow = ''
  }
})

// 暴露方法
defineExpose({
  open,
  close,
  centerDialog
})
</script>

<style lang="less">
.l-dialog-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.l-dialog-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
}

.l-dialog {
  position: relative;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  max-width: 90vw;
  max-height: 90vh;

  &--center {
    margin: auto;
  }

  &--fullscreen {
    width: 100vw !important;
    height: 100vh !important;
    max-width: none !important;
    max-height: none !important;
    border-radius: 0;
  }

  &--draggable {
    .l-dialog__header {
      cursor: move;
    }
  }

  &--resizable {
    .l-dialog__resize-handles {
      display: block;
    }
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid #f0f0f0;

    &--draggable {
      cursor: move;
      user-select: none;
    }
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: #262626;
    margin: 0;
  }

  &__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    color: #8c8c8c;
    font-size: 20px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      background: #f5f5f5;
      color: #262626;
    }
  }

  &__body {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    padding: 16px 24px;
    border-top: 1px solid #f0f0f0;
  }

  &__button {
    padding: 8px 16px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    background: #fff;
    color: #262626;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 4px;

    &:hover {
      border-color: #40a9ff;
      color: #40a9ff;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &--cancel {
      /* 默认样式 */
    }

    &--confirm {
      &.l-dialog__button--primary {
        background: #1890ff;
        border-color: #1890ff;
        color: #fff;

        &:hover:not(:disabled) {
          background: #40a9ff;
          border-color: #40a9ff;
        }
      }

      &.l-dialog__button--success {
        background: #52c41a;
        border-color: #52c41a;
        color: #fff;

        &:hover:not(:disabled) {
          background: #73d13d;
          border-color: #73d13d;
        }
      }

      &.l-dialog__button--warning {
        background: #faad14;
        border-color: #faad14;
        color: #fff;

        &:hover:not(:disabled) {
          background: #ffc53d;
          border-color: #ffc53d;
        }
      }

      &.l-dialog__button--danger {
        background: #ff4d4f;
        border-color: #ff4d4f;
        color: #fff;

        &:hover:not(:disabled) {
          background: #ff7875;
          border-color: #ff7875;
        }
      }
    }
  }

  &__loading {
    animation: l-dialog-spin 1s linear infinite;
  }

  &__resize-handles {
    display: none;
  }

  &__resize-handle {
    position: absolute;

    &--n {
      top: 0;
      left: 8px;
      right: 8px;
      height: 4px;
      cursor: n-resize;
    }

    &--s {
      bottom: 0;
      left: 8px;
      right: 8px;
      height: 4px;
      cursor: s-resize;
    }

    &--w {
      left: 0;
      top: 8px;
      bottom: 8px;
      width: 4px;
      cursor: w-resize;
    }

    &--e {
      right: 0;
      top: 8px;
      bottom: 8px;
      width: 4px;
      cursor: e-resize;
    }

    &--nw {
      top: 0;
      left: 0;
      width: 8px;
      height: 8px;
      cursor: nw-resize;
    }

    &--ne {
      top: 0;
      right: 0;
      width: 8px;
      height: 8px;
      cursor: ne-resize;
    }

    &--sw {
      bottom: 0;
      left: 0;
      width: 8px;
      height: 8px;
      cursor: sw-resize;
    }

    &--se {
      bottom: 0;
      right: 0;
      width: 8px;
      height: 8px;
      cursor: se-resize;
    }
  }
}

@keyframes l-dialog-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* 动画效果 */
.l-dialog-fade-enter-active,
.l-dialog-fade-leave-active {
  transition: opacity 0.3s ease;

  .l-dialog {
    transition: transform 0.3s ease;
  }
}

.l-dialog-fade-enter-from,
.l-dialog-fade-leave-to {
  opacity: 0;

  .l-dialog {
    transform: scale(0.95);
  }
}

.l-dialog-slide-enter-active,
.l-dialog-slide-leave-active {
  transition: opacity 0.3s ease;

  .l-dialog {
    transition: transform 0.3s ease;
  }
}

.l-dialog-slide-enter-from,
.l-dialog-slide-leave-to {
  opacity: 0;

  .l-dialog {
    transform: translateY(-50px);
  }
}

.l-dialog-zoom-enter-active,
.l-dialog-zoom-leave-active {
  transition: opacity 0.3s ease;

  .l-dialog {
    transition: transform 0.3s ease;
  }
}

.l-dialog-zoom-enter-from,
.l-dialog-zoom-leave-to {
  opacity: 0;

  .l-dialog {
    transform: scale(0.8);
  }
}

.l-dialog-bounce-enter-active {
  animation: l-dialog-bounce-in 0.4s ease;
}

.l-dialog-bounce-leave-active {
  animation: l-dialog-bounce-out 0.3s ease;
}

@keyframes l-dialog-bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.7);
  }

  50% {
    transform: scale(1.05);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes l-dialog-bounce-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }

  100% {
    opacity: 0;
    transform: scale(0.7);
  }
}
</style>

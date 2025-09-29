<template>
  <Teleport to="body">
    <Transition name="l-modal" appear>
      <div v-if="visible" :class="modalClasses" @click="handleMaskClick">
        <div :class="dialogClasses" @click.stop>
          <div v-if="$slots.header || title || closable" class="l-modal__header">
            <slot name="header">
              <div class="l-modal__title">{{ title }}</div>
            </slot>
            <button
              v-if="closable"
              class="l-modal__close"
              @click="handleClose"
            >
              ✕
            </button>
          </div>
          
          <div :class="bodyClasses">
            <slot></slot>
          </div>
          
          <div v-if="$slots.footer" class="l-modal__footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * Modal 模态框组件 - Vue3 版本
 * 
 * 使用 Composition API 和 <script setup> 语法
 * 提供模态框功能，支持标题、内容、底部操作区域
 * 使用 Teleport 将模态框渲染到 body 下
 */
import { computed, watch, nextTick } from 'vue'

// 定义组件名称
defineOptions({
  name: 'LModal'
})

// 定义 Props 类型
export interface ModalProps {
  /** 是否显示模态框 */
  visible?: boolean
  /** 模态框标题 */
  title?: string
  /** 模态框宽度 */
  width?: string | number
  /** 模态框尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 是否显示关闭按钮 */
  closable?: boolean
  /** 是否点击遮罩层关闭 */
  maskClosable?: boolean
  /** 是否居中显示 */
  centered?: boolean
  /** 是否全屏显示 */
  fullscreen?: boolean
  /** 内容区域是否有内边距 */
  bodyPadding?: boolean
  /** 层级 */
  zIndex?: number
}

// 定义 Props 默认值
const props = withDefaults(defineProps<ModalProps>(), {
  visible: false,
  title: '',
  width: '520px',
  size: 'medium',
  closable: true,
  maskClosable: true,
  centered: false,
  fullscreen: false,
  bodyPadding: true,
  zIndex: 1000
})

// 定义 Emits
export interface ModalEmits {
  /** 更新显示状态 */
  'update:visible': [visible: boolean]
  /** 关闭事件 */
  close: []
  /** 打开事件 */
  open: []
  /** 打开后事件 */
  opened: []
  /** 关闭后事件 */
  closed: []
}

const emit = defineEmits<ModalEmits>()

// 计算属性
const modalClasses = computed(() => [
  'l-modal',
  {
    'l-modal--centered': props.centered,
    'l-modal--fullscreen': props.fullscreen
  }
])

const dialogClasses = computed(() => [
  'l-modal__dialog',
  `l-modal__dialog--${props.size}`,
  {
    'l-modal__dialog--fullscreen': props.fullscreen
  }
])

const bodyClasses = computed(() => [
  'l-modal__body',
  {
    'l-modal__body--no-padding': !props.bodyPadding
  }
])

const dialogStyle = computed(() => {
  const style: Record<string, any> = {
    zIndex: props.zIndex
  }
  
  if (!props.fullscreen && props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  
  return style
})

// 事件处理函数
const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

const handleMaskClick = () => {
  if (props.maskClosable) {
    handleClose()
  }
}

// 监听显示状态变化
watch(() => props.visible, (newVisible, oldVisible) => {
  if (newVisible && !oldVisible) {
    emit('open')
    nextTick(() => {
      emit('opened')
    })
  } else if (!newVisible && oldVisible) {
    nextTick(() => {
      emit('closed')
    })
  }
})

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closable) {
    handleClose()
  }
}

// 监听键盘事件
watch(() => props.visible, (visible) => {
  if (visible) {
    document.addEventListener('keydown', handleKeydown)
    // 禁止页面滚动
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleKeydown)
    // 恢复页面滚动
    document.body.style.overflow = ''
  }
})
</script>

<style lang="less">
@import '../styles/variables.less';

.l-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: var(--ls-padding-lg);
  overflow-y: auto;
  z-index: 1000;
  
  &--centered {
    align-items: center;
  }
  
  &--fullscreen {
    padding: 0;
  }
  
  // 对话框
  &__dialog {
    position: relative;
    background-color: var(--ldesign-bg-color-container);
    border-radius: var(--ls-border-radius-lg);
    box-shadow: var(--ldesign-shadow-3);
    max-width: 100%;
    max-height: 100%;
    display: flex;
    flex-direction: column;
    margin: auto 0;
    
    // 尺寸
    &--small {
      width: 400px;
    }
    
    &--medium {
      width: 520px;
    }
    
    &--large {
      width: 720px;
    }
    
    &--fullscreen {
      width: 100vw;
      height: 100vh;
      max-width: none;
      max-height: none;
      border-radius: 0;
      margin: 0;
    }
  }
  
  // 头部
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--ls-padding-base) var(--ls-padding-base) 0;
    border-bottom: 1px solid var(--ldesign-border-level-1-color);
    margin-bottom: var(--ls-margin-base);
  }
  
  &__title {
    font-size: var(--ls-font-size-lg);
    font-weight: 600;
    color: var(--ldesign-text-color-primary);
    margin: 0;
    line-height: 1.4;
  }
  
  &__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    border-radius: var(--ls-border-radius-base);
    color: var(--ldesign-text-color-secondary);
    font-size: 18px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    
    &:hover {
      background-color: var(--ldesign-bg-color-component-hover);
      color: var(--ldesign-text-color-primary);
    }
    
    &:active {
      background-color: var(--ldesign-bg-color-component-active);
    }
  }
  
  // 内容
  &__body {
    flex: 1;
    padding: 0 var(--ls-padding-base);
    color: var(--ldesign-text-color-primary);
    line-height: 1.6;
    overflow-y: auto;
    
    &--no-padding {
      padding: 0;
    }
  }
  
  // 底部
  &__footer {
    padding: var(--ls-padding-base);
    border-top: 1px solid var(--ldesign-border-level-1-color);
    margin-top: var(--ls-margin-base);
    display: flex;
    justify-content: flex-end;
    gap: var(--ls-spacing-sm);
  }
}

// 动画
.l-modal-enter-active,
.l-modal-leave-active {
  transition: opacity 0.3s ease-in-out;
  
  .l-modal__dialog {
    transition: transform 0.3s ease-in-out;
  }
}

.l-modal-enter-from,
.l-modal-leave-to {
  opacity: 0;
  
  .l-modal__dialog {
    transform: scale(0.9) translateY(-20px);
  }
}

.l-modal-enter-to,
.l-modal-leave-from {
  opacity: 1;
  
  .l-modal__dialog {
    transform: scale(1) translateY(0);
  }
}
</style>

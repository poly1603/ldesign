<!--
  Modal 通用弹窗组件
  支持打开/关闭动画、自定义内容、标题、按钮等
  
  使用方法：
  <Modal
    v-model:visible="visible"
    title="标题"
    :width="600"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <template #default>
      弹窗内容
    </template>
  </Modal>
-->
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
        <Transition name="modal-content">
          <div v-if="visible" class="modal-container" :class="$attrs.class" :style="{ width: width + 'px' }" @click.stop>
            <!-- 头部 -->
            <div class="modal-header">
              <div class="modal-title">
                <slot name="title">
                  <component v-if="icon" :is="icon" class="modal-icon" />
                  <span>{{ title }}</span>
                </slot>
              </div>
              <button class="modal-close" @click="handleCancel">
                <X :size="20" />
              </button>
            </div>
            
            <!-- 内容 -->
            <div class="modal-body">
              <slot></slot>
            </div>
            
            <!-- 底部 -->
            <div v-if="showFooter" class="modal-footer">
              <slot name="footer">
                <button class="modal-button modal-button-cancel" @click="handleCancel">
                  <X :size="18" />
                  {{ cancelText }}
                </button>
                <button class="modal-button modal-button-confirm" @click="handleConfirm">
                  <Check :size="18" />
                  {{ confirmText }}
                </button>
              </slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { X, Check } from 'lucide-vue-next'
import type { Component } from 'vue'

// 禁用自动继承 attrs，因为使用了 Teleport
defineOptions({
  inheritAttrs: false
})

/**
 * Props 定义
 */
interface Props {
  visible: boolean           // 是否显示
  title?: string            // 标题
  icon?: Component          // 图标
  width?: number            // 宽度
  showFooter?: boolean      // 是否显示底部
  confirmText?: string      // 确认按钮文本
  cancelText?: string       // 取消按钮文本
  closeOnOverlay?: boolean  // 点击遮罩层是否关闭
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  width: 600,
  showFooter: true,
  confirmText: '确认',
  cancelText: '取消',
  closeOnOverlay: true
})

/**
 * Emits 定义
 */
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'confirm': []
  'cancel': []
}>()

/**
 * 处理确认
 */
const handleConfirm = () => {
  emit('confirm')
  emit('update:visible', false)
}

/**
 * 处理取消
 */
const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}

/**
 * 处理遮罩层点击
 */
const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    handleCancel()
  }
}
</script>

<style scoped lang="less">
// 遮罩层
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

// 弹窗容器
.modal-container {
  background: var(--ldesign-bg-color-container);
  border-radius: var(--ls-border-radius-lg);
  box-shadow: var(--ldesign-shadow-3);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  max-width: 90vw;
  
  // 允许外部通过 class 自定义样式
  :deep(.modal-content) {
    // 外部可以覆盖这个 class
  }
}

// 头部
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--ldesign-border-level-1-color);
  
  .modal-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--ls-font-size-lg);
    font-weight: 600;
    color: var(--ldesign-text-color-primary);
    
    .modal-icon {
      width: 22px;
      height: 22px;
      color: var(--ldesign-brand-color);
    }
  }
  
  .modal-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    border-radius: var(--ls-border-radius-base);
    color: var(--ldesign-text-color-secondary);
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: var(--ldesign-bg-color-component-hover);
      color: var(--ldesign-text-color-primary);
    }
  }
}

// 内容
.modal-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--ldesign-border-level-2-color);
    border-radius: 3px;
    
    &:hover {
      background: var(--ldesign-border-level-3-color);
    }
  }
}

// 底部
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--ldesign-border-level-1-color);
}

// 按钮
.modal-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 20px;
  height: var(--ls-button-height-medium);
  border: 1px solid var(--ldesign-border-level-2-color);
  border-radius: var(--ls-border-radius-base);
  font-size: var(--ls-font-size-sm);
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    opacity: 0.8;
  }
  
  &:active {
    transform: scale(0.98);
  }
}

// 取消按钮
.modal-button-cancel {
  background: var(--ldesign-bg-color-container);
  color: var(--ldesign-text-color-primary);
  
  &:hover {
    background: var(--ldesign-bg-color-container-hover);
    border-color: var(--ldesign-border-level-3-color);
  }
}

// 确认按钮
.modal-button-confirm {
  background: var(--ldesign-brand-color);
  color: var(--ldesign-font-white-1);
  border-color: var(--ldesign-brand-color);
  
  &:hover {
    background: var(--ldesign-brand-color-hover);
    border-color: var(--ldesign-brand-color-hover);
  }
}

// 遮罩层动画
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

// 内容动画
.modal-content-enter-active,
.modal-content-leave-active {
  transition: all 0.3s ease;
}

.modal-content-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}
</style>


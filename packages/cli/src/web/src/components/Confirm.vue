<!--
  Confirm 确认对话框组件
  用于删除、停止等操作的确认，替代浏览器默认的 confirm
  
  使用方法：
  import { useConfirm } from '@/composables/useConfirm'
  const confirm = useConfirm()
  
  const result = await confirm.show({
    title: '确认删除',
    content: '确定要删除这个项目吗？',
    type: 'danger'
  })
  
  if (result) {
    // 用户点击了确认
  }
-->
<template>
  <Teleport to="body">
    <Transition name="confirm">
      <div v-if="visible" class="confirm-overlay" @click="handleCancel">
        <Transition name="confirm-content">
          <div v-if="visible" class="confirm-container" @click.stop>
            <!-- 图标 -->
            <div :class="['confirm-icon', `confirm-icon-${type}`]">
              <component :is="getIcon()" :size="48" />
            </div>
            
            <!-- 标题 -->
            <div class="confirm-title">{{ title }}</div>
            
            <!-- 内容 -->
            <div v-if="content" class="confirm-content">{{ content }}</div>
            
            <!-- 按钮 -->
            <div class="confirm-buttons">
              <button class="confirm-button confirm-button-cancel" @click="handleCancel">
                {{ cancelText }}
              </button>
              <button :class="['confirm-button', 'confirm-button-confirm', `confirm-button-${type}`]" @click="handleConfirm">
                {{ confirmText }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AlertCircle, AlertTriangle, Info, HelpCircle } from 'lucide-vue-next'

/**
 * 确认类型
 */
export type ConfirmType = 'info' | 'warning' | 'danger' | 'question'

/**
 * 确认选项
 */
export interface ConfirmOptions {
  title: string
  content?: string
  type?: ConfirmType
  confirmText?: string
  cancelText?: string
}

// 是否显示
const visible = ref(false)

// 标题
const title = ref('')

// 内容
const content = ref('')

// 类型
const type = ref<ConfirmType>('info')

// 确认按钮文本
const confirmText = ref('确定')

// 取消按钮文本
const cancelText = ref('取消')

// 回调函数
let resolveCallback: ((value: boolean) => void) | null = null

/**
 * 获取图标
 */
const getIcon = () => {
  const iconMap = {
    info: Info,
    warning: AlertTriangle,
    danger: AlertCircle,
    question: HelpCircle
  }
  return iconMap[type.value]
}

/**
 * 显示确认对话框
 */
const show = (options: ConfirmOptions): Promise<boolean> => {
  title.value = options.title
  content.value = options.content || ''
  type.value = options.type || 'info'
  confirmText.value = options.confirmText || '确定'
  cancelText.value = options.cancelText || '取消'
  visible.value = true
  
  return new Promise((resolve) => {
    resolveCallback = resolve
  })
}

/**
 * 处理确认
 */
const handleConfirm = () => {
  visible.value = false
  resolveCallback?.(true)
  resolveCallback = null
}

/**
 * 处理取消
 */
const handleCancel = () => {
  visible.value = false
  resolveCallback?.(false)
  resolveCallback = null
}

// 导出方法
defineExpose({
  show
})
</script>

<style scoped lang="less">
// 遮罩层
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

// 确认容器
.confirm-container {
  background: var(--ldesign-bg-color-container);
  border-radius: var(--ls-border-radius-lg);
  box-shadow: var(--ldesign-shadow-3);
  padding: 32px;
  width: 420px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

// 图标
.confirm-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  
  &.confirm-icon-info {
    background: var(--ldesign-brand-color-focus);
    color: var(--ldesign-brand-color);
  }
  
  &.confirm-icon-warning {
    background: var(--ldesign-warning-color-focus);
    color: var(--ldesign-warning-color);
  }
  
  &.confirm-icon-danger {
    background: var(--ldesign-error-color-focus);
    color: var(--ldesign-error-color);
  }
  
  &.confirm-icon-question {
    background: var(--ldesign-brand-color-focus);
    color: var(--ldesign-brand-color);
  }
}

// 标题
.confirm-title {
  font-size: var(--ls-font-size-xl);
  font-weight: 600;
  color: var(--ldesign-text-color-primary);
  text-align: center;
}

// 内容
.confirm-content {
  font-size: var(--ls-font-size-base);
  color: var(--ldesign-text-color-secondary);
  text-align: center;
  line-height: 1.6;
}

// 按钮组
.confirm-buttons {
  display: flex;
  gap: 12px;
  width: 100%;
  margin-top: 8px;
}

// 按钮
.confirm-button {
  flex: 1;
  height: var(--ls-button-height-large);
  border: none;
  border-radius: var(--ls-border-radius-base);
  font-size: var(--ls-font-size-base);
  font-weight: 500;
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
.confirm-button-cancel {
  background: var(--ldesign-bg-color-component);
  color: var(--ldesign-text-color-primary);
  border: 1px solid var(--ldesign-border-level-2-color);
  
  &:hover {
    background: var(--ldesign-bg-color-component-hover);
    border-color: var(--ldesign-border-level-3-color);
  }
}

// 确认按钮
.confirm-button-confirm {
  color: var(--ldesign-font-white-1);
  
  &.confirm-button-info,
  &.confirm-button-question {
    background: var(--ldesign-brand-color);
    
    &:hover {
      background: var(--ldesign-brand-color-hover);
    }
  }
  
  &.confirm-button-warning {
    background: var(--ldesign-warning-color);
    
    &:hover {
      background: var(--ldesign-warning-color-hover);
    }
  }
  
  &.confirm-button-danger {
    background: var(--ldesign-error-color);
    
    &:hover {
      background: var(--ldesign-error-color-hover);
    }
  }
}

// 遮罩层动画
.confirm-enter-active,
.confirm-leave-active {
  transition: opacity 0.3s ease;
}

.confirm-enter-from,
.confirm-leave-to {
  opacity: 0;
}

// 内容动画
.confirm-content-enter-active,
.confirm-content-leave-active {
  transition: all 0.3s ease;
}

.confirm-content-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.confirm-content-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>


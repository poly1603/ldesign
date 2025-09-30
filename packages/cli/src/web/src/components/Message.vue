<!--
  Message 通知组件
  用于显示全局通知消息，支持 success、error、warning、info 等类型
  
  使用方法：
  import { useMessage } from '@/composables/useMessage'
  const message = useMessage()
  message.success('操作成功')
  message.error('操作失败')
  message.warning('警告信息')
  message.info('提示信息')
-->
<template>
  <Teleport to="body">
    <div class="message-container">
      <TransitionGroup name="message">
        <div
          v-for="item in messages"
          :key="item.id"
          :class="['message-item', `message-${item.type}`]"
        >
          <component :is="getIcon(item.type)" class="message-icon" />
          <span class="message-content">{{ item.content }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-vue-next'

/**
 * 消息类型
 */
export type MessageType = 'success' | 'error' | 'warning' | 'info'

/**
 * 消息项接口
 */
export interface MessageItem {
  id: number
  type: MessageType
  content: string
  duration: number
}

// 消息列表
const messages = ref<MessageItem[]>([])

// 消息 ID 计数器
let messageId = 0

/**
 * 获取图标组件
 */
const getIcon = (type: MessageType) => {
  const iconMap = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  }
  return iconMap[type]
}

/**
 * 显示消息
 */
const show = (type: MessageType, content: string, duration = 3000) => {
  const id = ++messageId
  const item: MessageItem = {
    id,
    type,
    content,
    duration
  }
  
  messages.value.push(item)
  
  // 自动移除
  setTimeout(() => {
    remove(id)
  }, duration)
}

/**
 * 移除消息
 */
const remove = (id: number) => {
  const index = messages.value.findIndex(item => item.id === id)
  if (index > -1) {
    messages.value.splice(index, 1)
  }
}

/**
 * 成功消息
 */
const success = (content: string, duration?: number) => {
  show('success', content, duration)
}

/**
 * 错误消息
 */
const error = (content: string, duration?: number) => {
  show('error', content, duration)
}

/**
 * 警告消息
 */
const warning = (content: string, duration?: number) => {
  show('warning', content, duration)
}

/**
 * 信息消息
 */
const info = (content: string, duration?: number) => {
  show('info', content, duration)
}

// 导出方法
defineExpose({
  success,
  error,
  warning,
  info
})
</script>

<style scoped lang="less">
// 消息容器
.message-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  pointer-events: none;
}

// 消息项
.message-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: var(--ls-border-radius-base);
  background: var(--ldesign-bg-color-container);
  box-shadow: var(--ldesign-shadow-2);
  font-size: var(--ls-font-size-sm);
  pointer-events: auto;
  min-width: 300px;
  max-width: 500px;
  
  .message-icon {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
  }
  
  .message-content {
    flex: 1;
    color: var(--ldesign-text-color-primary);
  }
}

// 成功消息
.message-success {
  border-left: 4px solid var(--ldesign-success-color);
  
  .message-icon {
    color: var(--ldesign-success-color);
  }
}

// 错误消息
.message-error {
  border-left: 4px solid var(--ldesign-error-color);
  
  .message-icon {
    color: var(--ldesign-error-color);
  }
}

// 警告消息
.message-warning {
  border-left: 4px solid var(--ldesign-warning-color);
  
  .message-icon {
    color: var(--ldesign-warning-color);
  }
}

// 信息消息
.message-info {
  border-left: 4px solid var(--ldesign-brand-color);
  
  .message-icon {
    color: var(--ldesign-brand-color);
  }
}

// 动画
.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.message-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>


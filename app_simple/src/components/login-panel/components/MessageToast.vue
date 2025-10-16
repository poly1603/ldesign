<template>
  <Teleport to="body">
    <TransitionGroup name="message" tag="div" class="message-container">
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="['message-toast', `message-${msg.type}`]"
      >
        <span class="message-icon">{{ getIcon(msg.type) }}</span>
        <span class="message-content">{{ msg.content }}</span>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue'

export type MessageType = 'success' | 'error' | 'warning' | 'info'

interface Message {
  id: number
  type: MessageType
  content: string
}

const messages = ref<Message[]>([])
let messageId = 0

const getIcon = (type: MessageType) => {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }
  return icons[type]
}

const showMessage = (content: string, type: MessageType = 'info', duration = 3000) => {
  const id = ++messageId
  messages.value.push({ id, type, content })
  
  setTimeout(() => {
    const index = messages.value.findIndex(msg => msg.id === id)
    if (index > -1) {
      messages.value.splice(index, 1)
    }
  }, duration)
}

// 提供消息方法给子组件使用
const message = {
  success: (content: string, duration?: number) => showMessage(content, 'success', duration),
  error: (content: string, duration?: number) => showMessage(content, 'error', duration),
  warning: (content: string, duration?: number) => showMessage(content, 'warning', duration),
  info: (content: string, duration?: number) => showMessage(content, 'info', duration),
}

// 暴露给父组件
defineExpose({ message })

// 提供给子组件
provide('message', message)
</script>

<style scoped>
.message-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.message-toast {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: white;
  pointer-events: auto;
  animation: slideDown 0.3s ease;
  transition: all 0.3s;
}

.message-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
}

.message-content {
  font-size: 14px;
  line-height: 1.5;
}

/* 不同类型的样式 */
.message-success {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #7dd3fc;
}

.message-success .message-icon {
  background: #10b981;
  color: white;
}

.message-success .message-content {
  color: #047857;
}

.message-error {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 1px solid #fca5a5;
}

.message-error .message-icon {
  background: #ef4444;
  color: white;
}

.message-error .message-content {
  color: #b91c1c;
}

.message-warning {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1px solid #fde68a;
}

.message-warning .message-icon {
  background: #f59e0b;
  color: white;
}

.message-warning .message-content {
  color: #d97706;
}

.message-info {
  background: linear-gradient(135deg, #f0f9ff 0%, #dbeafe 100%);
  border: 1px solid #93c5fd;
}

.message-info .message-icon {
  background: #3b82f6;
  color: white;
}

.message-info .message-content {
  color: #1e40af;
}

/* 动画 */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-enter-active {
  transition: all 0.3s ease;
}

.message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.message-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

.message-move {
  transition: transform 0.3s ease;
}
</style>
<template>
  <div class="ai-chat-container">
    <!-- 主聊天区域 -->
    <div class="chat-main">
      <!-- 顶部栏 -->
      <div class="chat-header">
        <div class="header-left">
          <div class="ai-avatar">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
          </div>
          <div class="header-info">
            <h3>DeepSeek AI</h3>
            <span class="status">
              <span class="status-dot" :class="{ online: isConfigured }"></span>
              {{ isConfigured ? '在线' : '未配置' }}
            </span>
          </div>
        </div>
        <div class="header-right">
          <button class="header-btn" @click="showSettings = !showSettings" :class="{ active: showSettings }" title="设置">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
            </svg>
          </button>
          <button class="header-btn" @click="clearChat" :disabled="messages.length === 0" title="清空对话">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
          <button class="header-btn" @click="goToSettings" title="全局配置">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 未配置提示 -->
      <div v-if="!isConfigured" class="config-prompt">
        <div class="prompt-icon">
          <svg viewBox="0 0 24 24" width="64" height="64" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        </div>
        <h2>请先配置 AI 密钥</h2>
        <p>您需要配置 DeepSeek API 密钥才能使用 AI 对话功能</p>
        <button class="primary-btn" @click="goToSettings">
          <span>前往配置</span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
          </svg>
        </button>
      </div>

      <!-- 聊天内容区 -->
      <div v-else class="chat-body">
        <!-- 消息列表 -->
        <div class="messages-wrapper" ref="messagesWrapper">
          <!-- 欢迎屏幕 -->
          <div v-if="messages.length === 0" class="welcome-screen">
            <div class="welcome-content">
              <div class="welcome-avatar">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                </svg>
              </div>
              <h2>你好！我是 DeepSeek AI</h2>
              <p>我可以帮你解答问题、编写代码、创作内容等</p>
              
              <div class="quick-actions">
                <div 
                  v-for="item in quickActions" 
                  :key="item.id"
                  class="action-card"
                  @click="useQuickAction(item.prompt)"
                >
                  <div class="action-icon">
                    <component :is="'svg'" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                      <path :d="item.iconPath" />
                    </component>
                  </div>
                  <div class="action-text">{{ item.text }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 消息列表 -->
          <div class="messages-list">
            <div 
              v-for="(msg, index) in messages" 
              :key="index"
              class="message-wrapper"
              :class="msg.role"
            >
              <div class="message-bubble">
                <div class="message-header">
                  <span class="message-sender">
                    {{ msg.role === 'user' ? '你' : 'AI' }}
                  </span>
                  <span class="message-time">{{ msg.timestamp }}</span>
                </div>
                <div class="message-body">{{ msg.content }}</div>
              </div>
            </div>

            <!-- 输入中动画 -->
            <div v-if="isTyping" class="message-wrapper assistant">
              <div class="message-bubble typing-bubble">
                <div class="typing-animation">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
          <div class="input-wrapper">
            <textarea
              ref="messageInput"
              v-model="inputMessage"
              placeholder="输入消息... (Shift+Enter 换行)"
              :disabled="isLoading"
              @keydown.enter.exact.prevent="sendMessage"
              @input="adjustTextareaHeight"
              rows="1"
            ></textarea>
            <button 
              class="send-button"
              @click="sendMessage"
              :disabled="!inputMessage.trim() || isLoading"
            >
              <span v-if="!isLoading">发送</span>
              <span v-else class="loading-spinner"></span>
            </button>
          </div>
          <div class="input-footer">
            <span class="hint">
              <span v-if="isStreaming" class="stream-indicator">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                流式响应
              </span>
              <span class="char-count">{{ inputMessage.length }} 字符</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 侧边设置面板 -->
    <transition name="slide-left">
      <div v-if="showSettings" class="settings-sidebar">
        <div class="sidebar-header">
          <h3>对话设置</h3>
          <button class="close-btn" @click="showSettings = false">×</button>
        </div>
        
        <div class="sidebar-content">
          <!-- 系统提示词 -->
          <div class="setting-group">
            <label class="setting-label">
              <input type="checkbox" v-model="useSystemPrompt" />
              <span>使用系统提示词</span>
            </label>
            <textarea
              v-if="useSystemPrompt"
              v-model="systemPrompt"
              placeholder="输入系统提示词..."
              rows="3"
              class="setting-textarea"
            ></textarea>
          </div>

          <!-- 温度 -->
          <div class="setting-group">
            <label class="setting-label">
              <span>温度：{{ temperature }}</span>
              <small>控制回答的随机性</small>
            </label>
            <input
              type="range"
              v-model.number="temperature"
              min="0"
              max="2"
              step="0.1"
              class="setting-slider"
            />
          </div>

          <!-- Token 限制 -->
          <div class="setting-group">
            <label class="setting-label">
              <span>最大 Token：{{ maxTokens }}</span>
              <small>限制回答长度</small>
            </label>
            <input
              type="range"
              v-model.number="maxTokens"
              min="100"
              max="4000"
              step="100"
              class="setting-slider"
            />
          </div>

          <!-- 流式响应 -->
          <div class="setting-group">
            <label class="setting-label">
              <input type="checkbox" v-model="isStreaming" />
              <span>启用流式响应</span>
            </label>
          </div>

          <!-- 统计信息 -->
          <div class="stats-section">
            <h4>统计信息</h4>
            <div class="stat-row">
              <span>总消息</span>
              <span>{{ stats.total }}</span>
            </div>
            <div class="stat-row">
              <span>用户消息</span>
              <span>{{ stats.user }}</span>
            </div>
            <div class="stat-row">
              <span>AI 回复</span>
              <span>{{ stats.assistant }}</span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getAIConfig, isConfigValid } from '../ai/config'
import { createDeepSeekClient } from '../ai/deepseek-client'
import type { ChatMessage } from '../ai/types'

const router = useRouter()

// 状态
const isConfigured = ref(false)
const showSettings = ref(false)
const client = ref(createDeepSeekClient())

// 消息
interface Message extends ChatMessage {
  timestamp: string
}

const messages = ref<Message[]>([])
const inputMessage = ref('')
const isLoading = ref(false)
const isTyping = ref(false)
const streamingIndex = ref<number | null>(null)

// 设置
const useSystemPrompt = ref(false)
const systemPrompt = ref('你是一个友好且专业的AI助手。')
const temperature = ref(1.0)
const maxTokens = ref(2000)
const isStreaming = ref(true)

// Refs
const messagesWrapper = ref<HTMLElement>()
const messageInput = ref<HTMLTextAreaElement>()

// 快捷操作
const quickActions = [
  { 
    id: 1, 
    text: '写代码', 
    prompt: '用 TypeScript 写一个防抖函数',
    iconPath: 'M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z'
  },
  { 
    id: 2, 
    text: 'CSS 布局', 
    prompt: '解释一下 CSS Flexbox 布局',
    iconPath: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z'
  },
  { 
    id: 3, 
    text: 'Vue 对比', 
    prompt: 'Vue 3 和 Vue 2 的主要区别',
    iconPath: 'M12 2L2 19.5h20L12 2zm0 3.84L18.93 18H5.07L12 5.84z'
  },
  { 
    id: 4, 
    text: '闭包概念', 
    prompt: '什么是闭包？举个例子',
    iconPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
  }
]

// 统计
const stats = computed(() => ({
  total: messages.value.length,
  user: messages.value.filter(m => m.role === 'user').length,
  assistant: messages.value.filter(m => m.role === 'assistant').length
}))

// 方法
const checkConfig = () => {
  const config = getAIConfig()
  isConfigured.value = isConfigValid(config)
  if (isConfigured.value) {
    client.value = createDeepSeekClient()
  }
}

const goToSettings = () => {
  router.push('/ai-settings')
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesWrapper.value) {
    messagesWrapper.value.scrollTop = messagesWrapper.value.scrollHeight
  }
}

const addMessage = (role: 'user' | 'assistant', content: string) => {
  messages.value.push({
    role,
    content,
    timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  })
  scrollToBottom()
}

const adjustTextareaHeight = () => {
  if (messageInput.value) {
    messageInput.value.style.height = 'auto'
    messageInput.value.style.height = Math.min(messageInput.value.scrollHeight, 120) + 'px'
  }
}

const useQuickAction = (prompt: string) => {
  inputMessage.value = prompt
  adjustTextareaHeight()
  messageInput.value?.focus()
}

const sendMessage = async () => {
  const text = inputMessage.value.trim()
  if (!text || !isConfigured.value || isLoading.value) return

  // 清空输入
  inputMessage.value = ''
  if (messageInput.value) {
    messageInput.value.style.height = 'auto'
  }

  // 添加用户消息
  addMessage('user', text)
  isLoading.value = true
  isTyping.value = true

  try {
    // 构建消息列表
    const chatMessages: ChatMessage[] = []
    
    if (useSystemPrompt.value && systemPrompt.value) {
      chatMessages.push({ role: 'system', content: systemPrompt.value })
    }

    // 添加历史消息
    const recent = messages.value.slice(-10)
    chatMessages.push(...recent.map(m => ({ role: m.role, content: m.content })))

    if (isStreaming.value) {
      // 流式响应
      isTyping.value = false
      const msgIndex = messages.value.length
      streamingIndex.value = msgIndex
      addMessage('assistant', '')

      const stream = client.value.streamChatCompletion(chatMessages, {
        temperature: temperature.value,
        max_tokens: maxTokens.value
      })

      let response = ''
      for await (const chunk of stream) {
        response += chunk
        if (messages.value[msgIndex]) {
          messages.value[msgIndex].content = response
          scrollToBottom()
        }
      }

      streamingIndex.value = null
    } else {
      // 非流式响应
      const result = await client.value.chatCompletion(chatMessages, {
        temperature: temperature.value,
        max_tokens: maxTokens.value
      })

      isTyping.value = false
      const reply = result.choices[0]?.message?.content || '抱歉，无法生成回答'
      addMessage('assistant', reply)
    }
  } catch (error: any) {
    isTyping.value = false
    console.error('发送失败:', error)
    addMessage('assistant', `❌ 错误: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}

const clearChat = () => {
  if (messages.value.length > 0 && confirm('确定清空所有对话？')) {
    messages.value = []
  }
}

// 生命周期
onMounted(() => {
  checkConfig()
  if (isConfigured.value) {
    messageInput.value?.focus()
  }
})
</script>

<style scoped lang="less">
.ai-chat-container {
  display: flex;
  height: 100vh;
  max-height: 100vh;
  background: var(--ldesign-bg-color-page, #f5f5f5);
  overflow: hidden;
  position: relative;
}

// 主聊天区
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  max-height: 100%;
  position: relative;
  overflow: hidden;
}

// 顶部栏
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(10px);

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .ai-avatar {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    
    svg {
      color: white;
    }
  }

  .header-info {
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #666;
      margin-top: 2px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ccc;

      &.online {
        background: #52c41a;
        box-shadow: 0 0 0 3px rgba(82, 196, 26, 0.2);
      }
    }
  }

  .header-right {
    display: flex;
    gap: 8px;
  }

  .header-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    color: #666;

    &:hover:not(:disabled) {
      background: #f5f5f5;
      color: #333;
    }

    &.active {
      background: #e6f7ff;
      color: #1890ff;
      
      svg {
        color: #1890ff;
      }
    }

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }
}

// 未配置提示
.config-prompt {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;

  .prompt-icon {
    margin-bottom: 24px;
    color: #faad14;
    
    svg {
      filter: drop-shadow(0 2px 8px rgba(250, 173, 20, 0.3));
    }
  }

  h2 {
    margin: 0 0 12px 0;
    font-size: 24px;
    color: #333;
  }

  p {
    margin: 0 0 32px 0;
    color: #666;
    font-size: 14px;
  }

  .primary-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 32px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    
    svg {
      transition: transform 0.2s;
    }
    
    &:hover svg {
      transform: translateX(4px);
    }
  }
}

// 聊天主体
.chat-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: 100%;
  position: relative;
  overflow: hidden;
}

// 消息包装器
.messages-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px;
  padding-bottom: 160px; // 为固定输入区域预留空间
  scroll-behavior: smooth;
  max-height: 100%;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;

    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }
}

// 欢迎屏幕
.welcome-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 48px 24px;

  .welcome-content {
    max-width: 900px;
    width: 100%;
    text-align: center;
  }

  .welcome-avatar {
    margin-bottom: 24px;
    
    svg {
      color: #667eea;
      filter: drop-shadow(0 2px 8px rgba(102, 126, 234, 0.3));
    }
  }

  h2 {
    margin: 0 0 12px 0;
    font-size: 28px;
    color: #333;
  }

  p {
    margin: 0 0 32px 0;
    color: #666;
    font-size: 15px;
  }

  .quick-actions {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .action-card {
    padding: 16px 20px;
    background: white;
    border: 1px solid #e8e8e8;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s;
    min-width: 140px;
    max-width: 180px;
    flex: 0 1 auto;

    &:hover {
      border-color: #667eea;
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%);
    }

    .action-icon {
      margin-bottom: 8px;
      
      svg {
        color: #667eea;
        transition: all 0.3s;
      }
    }
    
    &:hover .action-icon svg {
      transform: scale(1.05);
      color: #764ba2;
    }

    .action-text {
      font-size: 13px;
      font-weight: 500;
      color: #333;
      white-space: nowrap;
    }
  }
}

// 消息列表
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-wrapper {
  display: flex;
  animation: slideIn 0.3s ease;

  &.user {
    justify-content: flex-end;

    .message-bubble {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 18px 18px 4px 18px;
    }
  }

  &.assistant {
    justify-content: flex-start;

    .message-bubble {
      background: white;
      border: 1px solid #e8e8e8;
      border-radius: 18px 18px 18px 4px;
    }
  }
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    font-size: 12px;
    opacity: 0.75;
  }

  .message-sender {
    font-weight: 600;
    letter-spacing: 0.3px;
  }

  .message-body {
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
  }
}

.typing-bubble {
  padding: 16px 20px;
}

.typing-animation {
  display: flex;
  gap: 6px;

  span {
    width: 8px;
    height: 8px;
    background: #999;
    border-radius: 50%;
    animation: bounce 1.4s infinite;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

// 输入区域 - 固定在底部
.input-area {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.98);
  border-top: 1px solid #e8e8e8;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(10px);
  z-index: 100;
}

.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-end;

  textarea {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid #d9d9d9;
    border-radius: 12px;
    font-size: 14px;
    line-height: 1.5;
    resize: none;
    font-family: inherit;
    transition: all 0.2s;
    background: #fafafa;

    &:focus {
      outline: none;
      border-color: #667eea;
      background: white;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.08);
    }

    &:disabled {
      background: #f5f5f5;
      cursor: not-allowed;
      opacity: 0.6;
    }

    &::placeholder {
      color: #bbb;
    }
  }

  .send-button {
    padding: 12px 28px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .loading-spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
  }
}

.input-footer {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;

  .hint {
    display: flex;
    gap: 16px;
    align-items: center;
  }
  
  .stream-indicator {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    
    svg {
      color: #52c41a;
    }
  }
  
  .char-count {
    color: #bbb;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// 侧边栏
.settings-sidebar {
  width: 320px;
  background: white;
  border-left: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.05);

  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e8e8e8;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .close-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      font-size: 24px;
      color: #999;
      cursor: pointer;
      border-radius: 6px;

      &:hover {
        background: #f5f5f5;
      }
    }
  }

  .sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px;
  }
}

.setting-group {
  margin-bottom: 24px;

  .setting-label {
    display: block;
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 500;
    color: #333;
    cursor: pointer;

    input[type="checkbox"] {
      margin-right: 8px;
    }

    small {
      display: block;
      margin-top: 4px;
      font-size: 11px;
      font-weight: normal;
      color: #999;
    }
  }

  .setting-textarea {
    width: 100%;
    padding: 8px 12px;
    margin-top: 8px;
    border: 1px solid #e8e8e8;
    border-radius: 6px;
    font-size: 13px;
    resize: vertical;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: #667eea;
    }
  }

  .setting-slider {
    width: 100%;
    margin-top: 8px;
  }
}

.stats-section {
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #e8e8e8;

  h4 {
    margin: 0 0 16px 0;
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 13px;
    color: #666;

    span:last-child {
      font-weight: 600;
      color: #333;
    }
  }
}

// 过渡动画
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(100%);
}

// 响应式
@media (max-width: 768px) {
  .settings-sidebar {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
  }

  .message-bubble {
    max-width: 85%;
  }
  
  .quick-actions {
    gap: 8px;
  }
  
  .action-card {
    min-width: 120px;
    max-width: 150px;
    padding: 14px 16px;
    
    .action-text {
      font-size: 12px;
    }
  }
  
  .messages-wrapper {
    padding-bottom: 180px; // 移动端输入区域可能更高
  }
}
</style>

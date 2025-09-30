<template>
  <teleport to="body">
    <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <button class="close-btn" @click="handleClose">
            <X :size="20" />
          </button>
        </div>

        <div class="modal-body">
          <!-- 进度信息 -->
          <div class="progress-section">
            <div class="progress-header">
              <span class="progress-label">{{ currentStep }}</span>
              <span class="progress-percentage">{{ progressPercentage }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
            </div>
          </div>

          <!-- 日志区域 -->
          <div class="logs-section">
            <div class="logs-header">
              <div class="logs-title">
                <Terminal :size="16" />
                <span>安装日志</span>
              </div>
              <button class="clear-logs-btn" @click="clearLogs" title="清空日志">
                <Trash2 :size="14" />
              </button>
            </div>
            <div class="logs-content" ref="logsContainer">
              <div v-if="logs.length === 0" class="logs-empty">
                等待日志输出...
              </div>
              <div v-for="(log, index) in logs" :key="index" class="log-line" :class="log.type">
                <span class="log-time">{{ log.time }}</span>
                <span class="log-message">{{ log.message }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button v-if="!isComplete" class="cancel-btn" @click="handleCancel">
            取消安装
          </button>
          <button v-else class="close-btn-primary" @click="handleClose">
            关闭
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { X, Terminal, Trash2 } from 'lucide-vue-next'

interface Props {
  visible: boolean
  title?: string
  progressPercentage?: number
  currentStep?: string
  logs?: Array<{ time: string; message: string; type: string }>
  isComplete?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '安装进度',
  progressPercentage: 0,
  currentStep: '准备中...',
  logs: () => [],
  isComplete: false
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  close: []
  cancel: []
  clearLogs: []
}>()

const logsContainer = ref<HTMLElement | null>(null)

// 处理覆盖层点击
const handleOverlayClick = () => {
  if (props.isComplete) {
    handleClose()
  }
}

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

// 取消安装
const handleCancel = () => {
  emit('cancel')
}

// 清空日志
const clearLogs = () => {
  emit('clearLogs')
}

// 自动滚动到底部
watch(() => props.logs.length, () => {
  nextTick(() => {
    if (logsContainer.value) {
      logsContainer.value.scrollTop = logsContainer.value.scrollHeight
    }
  })
})
</script>

<style scoped lang="less">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: var(--ls-spacing-lg);
}

.modal-content {
  background: var(--ldesign-bg-color-container);
  border-radius: var(--ls-border-radius-lg);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 700px;
  height: 600px;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--ls-spacing-lg);
  border-bottom: 1px solid var(--ldesign-border-color);

  h3 {
    margin: 0;
    font-size: var(--ls-font-size-lg);
    color: var(--ldesign-text-color-primary);
  }

  .close-btn {
    padding: var(--ls-spacing-xs);
    background: transparent;
    border: none;
    border-radius: var(--ls-border-radius-sm);
    cursor: pointer;
    color: var(--ldesign-text-color-secondary);
    transition: all 0.2s;

    &:hover {
      background: var(--ldesign-bg-color-component-hover);
      color: var(--ldesign-text-color-primary);
    }
  }
}

.modal-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: var(--ls-spacing-lg);
  gap: var(--ls-spacing-lg);
}

.progress-section {
  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--ls-spacing-sm);

    .progress-label {
      font-size: var(--ls-font-size-sm);
      color: var(--ldesign-text-color-secondary);
    }

    .progress-percentage {
      font-size: var(--ls-font-size-lg);
      font-weight: 700;
      color: var(--ldesign-brand-color);
    }
  }

  .progress-bar {
    height: 8px;
    background: var(--ldesign-bg-color-component);
    border-radius: var(--ls-border-radius-full);
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--ldesign-brand-color), var(--ldesign-brand-color-hover));
      border-radius: var(--ls-border-radius-full);
      transition: width 0.3s ease;
    }
  }
}

.logs-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 350px;
  background: #1e1e1e;
  border-radius: var(--ls-border-radius-base);
  overflow: hidden;

  .logs-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--ls-spacing-sm) var(--ls-spacing-base);
    background: #2d2d2d;
    border-bottom: 1px solid #3d3d3d;

    .logs-title {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-xs);
      font-size: var(--ls-font-size-sm);
      font-weight: 500;
      color: #cccccc;

      svg {
        color: #4ec9b0;
      }
    }

    .clear-logs-btn {
      padding: 4px;
      background: transparent;
      border: none;
      border-radius: var(--ls-border-radius-sm);
      cursor: pointer;
      color: #cccccc;
      transition: all 0.2s;

      &:hover {
        background: #3d3d3d;
        color: #ffffff;
      }
    }
  }

  .logs-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--ls-spacing-sm);
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 12px;

    .logs-empty {
      color: #858585;
      text-align: center;
      padding: var(--ls-spacing-xl);
    }

    .log-line {
      display: flex;
      gap: var(--ls-spacing-sm);
      padding: 2px 0;
      line-height: 1.5;

      .log-time {
        color: #858585;
        flex-shrink: 0;
      }

      .log-message {
        color: #cccccc;
        word-break: break-all;
      }

      &.info .log-message {
        color: #4ec9b0;
      }

      &.success .log-message {
        color: #4ec9b0;
        font-weight: 500;
      }

      &.warning .log-message {
        color: #dcdcaa;
      }

      &.error .log-message {
        color: #f48771;
        font-weight: 500;
      }
    }
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--ls-spacing-sm);
  padding: var(--ls-spacing-lg);
  border-top: 1px solid var(--ldesign-border-color);

  button {
    padding: var(--ls-spacing-sm) var(--ls-spacing-lg);
    border: none;
    border-radius: var(--ls-border-radius-base);
    font-size: var(--ls-font-size-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .cancel-btn {
    background: var(--ldesign-error-color);
    color: white;

    &:hover {
      background: var(--ldesign-error-color-hover);
    }
  }

  .close-btn-primary {
    background: var(--ldesign-brand-color);
    color: white;

    &:hover {
      background: var(--ldesign-brand-color-hover);
    }
  }
}
</style>
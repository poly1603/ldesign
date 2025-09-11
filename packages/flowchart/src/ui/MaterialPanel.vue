<template>
  <div class="ldesign-material-panel">
    <div class="panel-header">
      <h3>节点物料</h3>
      <p>拖拽节点到画布创建流程</p>
    </div>

    <div class="panel-content">
      <!-- 基础节点 -->
      <div class="material-category">
        <h4>基础节点</h4>
        <div class="material-items">
          <div
            v-for="node in basicNodes"
            :key="node.type"
            class="material-item"
            draggable="true"
            @dragstart="handleDragStart($event, node.type)"
          >
            <div class="item-icon" v-html="node.icon"></div>
            <div class="item-label">{{ node.label }}</div>
          </div>
        </div>
      </div>

      <!-- 审批节点 -->
      <div class="material-category">
        <h4>审批节点</h4>
        <div class="material-items">
          <div
            v-for="node in approvalNodes"
            :key="node.type"
            class="material-item"
            draggable="true"
            @dragstart="handleDragStart($event, node.type)"
          >
            <div class="item-icon" v-html="node.icon"></div>
            <div class="item-label">{{ node.label }}</div>
          </div>
        </div>
      </div>

      <!-- 网关节点 -->
      <div class="material-category">
        <h4>网关节点</h4>
        <div class="material-items">
          <div
            v-for="gateway in gatewayNodes"
            :key="gateway.type"
            class="material-item"
            draggable="true"
            @dragstart="handleDragStart($event, gateway.type)"
          >
            <div class="item-icon" v-html="gateway.icon"></div>
            <div class="item-label">{{ gateway.label }}</div>
          </div>
        </div>
      </div>

      <!-- 事件节点 -->
      <div class="material-category">
        <h4>事件节点</h4>
        <div class="material-items">
          <div
            v-for="event in eventNodes"
            :key="event.type"
            class="material-item"
            draggable="true"
            @dragstart="handleDragStart($event, event.type)"
          >
            <div class="item-icon" v-html="event.icon"></div>
            <div class="item-label">{{ event.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ApprovalNodeType } from '../types'

// Emits
const emit = defineEmits<{
  'drag:start': [nodeType: ApprovalNodeType]
}>()

// 基础节点配置
const basicNodes = ref([
  {
    type: 'start' as ApprovalNodeType,
    label: '开始',
    icon: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" fill="#ebfaeb" stroke="#62cb62" stroke-width="2"/>
      <path d="M15 12L26 20L15 28V12Z" fill="#62cb62"/>
    </svg>`
  },
  {
    type: 'approval' as ApprovalNodeType,
    label: '审批',
    icon: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="4" y="10" width="32" height="20" rx="3" fill="#f1ecf9" stroke="#7334cb" stroke-width="2"/>
      <path d="M14 20L17 23L26 14" stroke="#7334cb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  {
    type: 'condition' as ApprovalNodeType,
    label: '条件',
    icon: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M20 4L36 20L20 36L4 20L20 4Z" fill="#fff8e6" stroke="#f5c538" stroke-width="2"/>
      <text x="20" y="26" font-family="Arial" font-size="18" font-weight="bold" fill="#f5c538" text-anchor="middle">?</text>
    </svg>`
  },
  {
    type: 'process' as ApprovalNodeType,
    label: '处理',
    icon: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="4" y="14" width="32" height="12" rx="3" fill="#f2f2f2" stroke="#808080" stroke-width="2"/>
      <circle cx="10" cy="20" r="1.5" fill="#808080"/>
      <circle cx="20" cy="20" r="1.5" fill="#808080"/>
      <circle cx="30" cy="20" r="1.5" fill="#808080"/>
    </svg>`
  },
  {
    type: 'end' as ApprovalNodeType,
    label: '结束',
    icon: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" fill="#fde8e8" stroke="#e54848" stroke-width="2"/>
      <rect x="14" y="14" width="12" height="12" rx="1" fill="#e54848"/>
    </svg>`
  }
])

// 审批流程节点配置
const approvalNodes = ref([
  {
    type: 'user-task' as ApprovalNodeType,
    label: '用户任务',
    icon: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="4" y="10" width="32" height="20" rx="3" fill="#e6f7ff" stroke="#1890ff" stroke-width="2"/>
      <circle cx="16" cy="18" r="3" fill="none" stroke="#1890ff" stroke-width="1.5"/>
      <path d="M11 26C11 23 13 21 16 21C19 21 21 23 21 26" fill="none" stroke="#1890ff" stroke-width="1.5"/>
      <rect x="24" y="16" width="8" height="1.5" fill="#1890ff"/>
      <rect x="24" y="19" width="6" height="1.5" fill="#1890ff"/>
      <rect x="24" y="22" width="8" height="1.5" fill="#1890ff"/>
    </svg>`
  },
  {
    type: 'service-task' as ApprovalNodeType,
    label: '服务任务',
    icon: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="4" y="10" width="32" height="20" rx="3" fill="#f6ffed" stroke="#52c41a" stroke-width="2"/>
      <circle cx="20" cy="20" r="6" fill="none" stroke="#52c41a" stroke-width="2"/>
      <path d="M17 17L19 19L23 15" stroke="#52c41a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  {
    type: 'script-task' as ApprovalNodeType,
    label: '脚本任务',
    icon: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="4" y="10" width="32" height="20" rx="3" fill="#fff7e6" stroke="#fa8c16" stroke-width="2"/>
      <path d="M12 16L16 20L12 24" stroke="#fa8c16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="18" y="22" width="10" height="2" fill="#fa8c16"/>
    </svg>`
  },
  {
    type: 'manual-task' as ApprovalNodeType,
    label: '手工任务',
    icon: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="4" y="10" width="32" height="20" rx="3" fill="#f9f0ff" stroke="#722ed1" stroke-width="2"/>
      <path d="M14 18C14 16 15 15 16 15C17 15 18 16 18 18V22C18 23 17 24 16 24C15 24 14 23 14 22V18Z" fill="#722ed1"/>
      <path d="M18 20H22C23 20 24 21 24 22C24 23 23 24 22 24H18" fill="none" stroke="#722ed1" stroke-width="1.5"/>
    </svg>`
  }
])

// 网关节点配置
const gatewayNodes = ref([
  {
    type: 'parallel-gateway' as ApprovalNodeType,
    label: '并行网关',
    icon: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M20 4L36 20L20 36L4 20L20 4Z" fill="#d8c8ee" stroke="#5e2aa7" stroke-width="2"/>
      <path d="M12 20H28M20 12V28" stroke="white" stroke-width="3" stroke-linecap="round"/>
    </svg>`
  },
  {
    type: 'exclusive-gateway' as ApprovalNodeType,
    label: '排他网关',
    icon: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M20 4L36 20L20 36L4 20L20 4Z" fill="#feecb9" stroke="#c2960f" stroke-width="2"/>
      <path d="M14 14L26 26M14 26L26 14" stroke="white" stroke-width="3" stroke-linecap="round"/>
    </svg>`
  },
  {
    type: 'inclusive-gateway' as ApprovalNodeType,
    label: '包容网关',
    icon: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M20 4L36 20L20 36L4 20L20 4Z" fill="#e6f4ff" stroke="#1890ff" stroke-width="2"/>
      <circle cx="20" cy="20" r="8" fill="none" stroke="white" stroke-width="3"/>
    </svg>`
  },
  {
    type: 'event-gateway' as ApprovalNodeType,
    label: '事件网关',
    icon: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M20 4L36 20L20 36L4 20L20 4Z" fill="#fff1f0" stroke="#ff4d4f" stroke-width="2"/>
      <circle cx="20" cy="20" r="6" fill="none" stroke="white" stroke-width="2"/>
      <polygon points="20,16 22,20 20,24 18,20" fill="white"/>
    </svg>`
  }
])

// 事件节点配置
const eventNodes = ref([
  {
    type: 'timer-event' as ApprovalNodeType,
    label: '定时事件',
    icon: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="16" fill="#fff7e6" stroke="#fa8c16" stroke-width="2"/>
      <circle cx="20" cy="20" r="12" fill="none" stroke="#fa8c16" stroke-width="1.5"/>
      <path d="M20 12V20L26 26" stroke="#fa8c16" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    type: 'message-event' as ApprovalNodeType,
    label: '消息事件',
    icon: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="16" fill="#f6ffed" stroke="#52c41a" stroke-width="2"/>
      <rect x="12" y="16" width="16" height="10" rx="1" fill="none" stroke="#52c41a" stroke-width="1.5"/>
      <path d="M12 18L20 22L28 18" stroke="#52c41a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  {
    type: 'signal-event' as ApprovalNodeType,
    label: '信号事件',
    icon: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="16" fill="#e6f7ff" stroke="#1890ff" stroke-width="2"/>
      <polygon points="20,12 28,26 12,26" fill="none" stroke="#1890ff" stroke-width="2"/>
    </svg>`
  }
])

// 处理拖拽开始事件
const handleDragStart = (event: DragEvent, nodeType: ApprovalNodeType) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/ldesign-node-type', nodeType)
    event.dataTransfer.effectAllowed = 'copy'
  }
  emit('drag:start', nodeType)
}
</script>

<style scoped>
.ldesign-material-panel {
  width: 240px;
  height: 100%;
  background: #ffffff;
  border-right: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  padding: 20px;
  border-bottom: 1px solid #e5e5e5;
  background: #f8f8f8;
}

.panel-header h3 {
  margin: 0 0 6px 0;
  font-size: 20px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
}

.panel-header p {
  margin: 0;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.7);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.material-category {
  margin-bottom: 28px;
}

.material-category h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.9);
  padding-left: 6px;
}

.material-items {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.material-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  background: #f8f8f8;
  cursor: grab;
  transition: all 0.2s ease;
  user-select: none;
}

.material-item:hover {
  border-color: #7334cb;
  background: #f0f0f0;
  transform: translateY(-1px);
  box-shadow: 0 1px 10px rgba(0, 0, 0, 0.05);
}

.material-item:active {
  cursor: grabbing;
  transform: translateY(0);
}

.item-icon {
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-label {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.9);
  text-align: center;
  font-weight: 500;
}

/* 滚动条样式 */
.panel-content::-webkit-scrollbar {
  width: 4px;
}

.panel-content::-webkit-scrollbar-track {
  background: #ffffff;
}

.panel-content::-webkit-scrollbar-thumb {
  background: #e5e5e5;
  border-radius: 2px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: #d9d9d9;
}
</style>

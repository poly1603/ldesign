<template>
  <div class="ldesign-property-panel">
    <div class="panel-header">
      <h3>属性面板</h3>
      <p v-if="!selectedNode">选择一个节点查看属性</p>
      <p v-else>{{ getNodeTypeLabel(selectedNode.type) }}</p>
    </div>

    <div class="panel-content" v-if="selectedNode">
      <!-- 基本信息 -->
      <div class="property-section">
        <h4>基本信息</h4>
        <div class="property-item">
          <label>节点ID</label>
          <input type="text" :value="selectedNode.id" readonly />
        </div>
        <div class="property-item">
          <label>节点类型</label>
          <input type="text" :value="getNodeTypeLabel(selectedNode.type)" readonly />
        </div>
        <div class="property-item">
          <label>节点文本</label>
          <input
            type="text"
            :value="typeof selectedNode.text === 'string' ? selectedNode.text : (selectedNode.text?.value || '')"
            @input="updateNodeText($event.target.value)"
            :readonly="readonly"
          />
        </div>
      </div>

      <!-- 位置信息 -->
      <div class="property-section">
        <h4>位置信息</h4>
        <div class="property-row">
          <div class="property-item">
            <label>X坐标</label>
            <input 
              type="number" 
              :value="selectedNode.x" 
              @input="updateNodePosition('x', Number($event.target.value))"
              :readonly="readonly"
            />
          </div>
          <div class="property-item">
            <label>Y坐标</label>
            <input 
              type="number" 
              :value="selectedNode.y" 
              @input="updateNodePosition('y', Number($event.target.value))"
              :readonly="readonly"
            />
          </div>
        </div>
      </div>

      <!-- 审批节点特有属性 -->
      <div class="property-section" v-if="selectedNode.type === 'approval'">
        <h4>审批设置</h4>
        <div class="property-item">
          <label>审批人</label>
          <input 
            type="text" 
            :value="selectedNode.properties?.approver || ''" 
            @input="updateNodeProperty('approver', $event.target.value)"
            :readonly="readonly"
          />
        </div>
        <div class="property-item">
          <label>部门</label>
          <input 
            type="text" 
            :value="selectedNode.properties?.department || ''" 
            @input="updateNodeProperty('department', $event.target.value)"
            :readonly="readonly"
          />
        </div>
        <div class="property-item">
          <label>审批状态</label>
          <select 
            :value="selectedNode.properties?.status || 'pending'" 
            @change="updateNodeProperty('status', $event.target.value)"
            :disabled="readonly"
          >
            <option value="pending">待审批</option>
            <option value="approved">已通过</option>
            <option value="rejected">已拒绝</option>
            <option value="processing">处理中</option>
            <option value="completed">已完成</option>
          </select>
        </div>
        <div class="property-item">
          <label>时间限制(小时)</label>
          <input 
            type="number" 
            :value="selectedNode.properties?.timeLimit || ''" 
            @input="updateNodeProperty('timeLimit', Number($event.target.value))"
            :readonly="readonly"
          />
        </div>
      </div>

      <!-- 条件节点特有属性 -->
      <div class="property-section" v-if="selectedNode.type === 'condition'">
        <h4>条件设置</h4>
        <div class="property-item">
          <label>条件表达式</label>
          <textarea 
            :value="selectedNode.properties?.condition || ''" 
            @input="updateNodeProperty('condition', $event.target.value)"
            :readonly="readonly"
            rows="3"
          ></textarea>
        </div>
        <div class="property-item">
          <label>条件描述</label>
          <input 
            type="text" 
            :value="selectedNode.properties?.description || ''" 
            @input="updateNodeProperty('description', $event.target.value)"
            :readonly="readonly"
          />
        </div>
      </div>

      <!-- 处理节点特有属性 -->
      <div class="property-section" v-if="selectedNode.type === 'process'">
        <h4>处理设置</h4>
        <div class="property-item">
          <label>处理器</label>
          <input 
            type="text" 
            :value="selectedNode.properties?.processor || ''" 
            @input="updateNodeProperty('processor', $event.target.value)"
            :readonly="readonly"
          />
        </div>
        <div class="property-item">
          <label>处理描述</label>
          <textarea 
            :value="selectedNode.properties?.description || ''" 
            @input="updateNodeProperty('description', $event.target.value)"
            :readonly="readonly"
            rows="3"
          ></textarea>
        </div>
      </div>

      <!-- 删除节点按钮 -->
      <div class="property-actions" v-if="!readonly">
        <button class="btn btn-danger" @click="deleteNode">删除节点</button>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <div class="empty-icon">📝</div>
      <p>选择画布中的节点</p>
      <p>查看和编辑属性</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ApprovalNodeConfig } from '../types'

// Props
interface Props {
  selectedNode?: ApprovalNodeConfig
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false
})

// Emits
const emit = defineEmits<{
  'update:node': [nodeId: string, updates: Partial<ApprovalNodeConfig>]
  'delete:node': [nodeId: string]
}>()

// 获取节点类型标签
const getNodeTypeLabel = (type: string): string => {
  const typeLabels: Record<string, string> = {
    'start': '开始节点',
    'approval': '审批节点',
    'condition': '条件节点',
    'process': '处理节点',
    'end': '结束节点',
    'parallel-gateway': '并行网关',
    'exclusive-gateway': '排他网关'
  }
  return typeLabels[type] || type
}

// 更新节点文本
const updateNodeText = (value: string) => {
  if (props.selectedNode) {
    emit('update:node', props.selectedNode.id!, {
      text: value
    })
  }
}

// 更新节点位置
const updateNodePosition = (axis: 'x' | 'y', value: number) => {
  if (props.selectedNode) {
    emit('update:node', props.selectedNode.id!, {
      [axis]: value
    })
  }
}

// 更新节点属性
const updateNodeProperty = (key: string, value: any) => {
  if (props.selectedNode) {
    emit('update:node', props.selectedNode.id!, {
      properties: { ...props.selectedNode.properties, [key]: value }
    })
  }
}

// 删除节点
const deleteNode = () => {
  if (props.selectedNode && confirm('确定要删除这个节点吗？')) {
    emit('delete:node', props.selectedNode.id!)
  }
}
</script>

<style scoped>
.ldesign-property-panel {
  width: 280px;
  height: 100%;
  background: #ffffff;
  border-left: 1px solid #e5e5e5;
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
  padding: 20px;
}

.property-section {
  margin-bottom: 24px;
}

.property-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.9);
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.property-item {
  margin-bottom: 16px;
}

.property-item label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.8);
}

.property-item input,
.property-item select,
.property-item textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.9);
  background: #ffffff;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.property-item input:focus,
.property-item select:focus,
.property-item textarea:focus {
  outline: none;
  border-color: #7334cb;
}

.property-item input:readonly,
.property-item select:disabled,
.property-item textarea:readonly {
  background: #f8f8f8;
  color: rgba(0, 0, 0, 0.6);
  cursor: not-allowed;
}

.property-item textarea {
  resize: vertical;
  min-height: 60px;
}

.property-row {
  display: flex;
  gap: 12px;
}

.property-row .property-item {
  flex: 1;
}

.property-actions {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.btn {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger {
  background: #e54848;
  color: white;
  border-color: #e54848;
}

.btn-danger:hover {
  background: #d63939;
  border-color: #d63939;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  margin: 4px 0;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
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

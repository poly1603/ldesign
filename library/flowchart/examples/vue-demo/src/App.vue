<template>
  <div class="demo-container">
    <header class="demo-header">
      <h1>审批流程图编辑器 - Vue 示例</h1>
      <div class="toolbar">
        <button @click="addStartNode">添加开始节点</button>
        <button @click="addApprovalNode">添加审批节点</button>
        <button @click="addConditionNode">添加条件节点</button>
        <button @click="addParallelNode">添加并行节点</button>
        <button @click="addCCNode">添加抄送节点</button>
        <button @click="addEndNode">添加结束节点</button>
        <button @click="validate">验证流程</button>
        <button @click="exportData">导出数据</button>
        <button @click="toggleReadonly">
          {{ readonly ? '切换到编辑模式' : '切换到只读模式' }}
        </button>
        <button @click="fit">适应画布</button>
        <button @click="clear">清空</button>
      </div>
    </header>

    <div class="demo-content">
      <ApprovalFlow
        ref="editorRef"
        :data="flowData"
        :readonly="readonly"
        :width="'100%'"
        :height="'100%'"
        @node:click="handleNodeClick"
        @node:add="handleNodeAdd"
        @data:change="handleDataChange"
      />
    </div>

    <aside class="demo-sidebar" v-if="selectedNode">
      <h3>节点信息</h3>
      <div class="node-info">
        <p><strong>ID:</strong> {{ selectedNode.id }}</p>
        <p><strong>类型:</strong> {{ selectedNode.type }}</p>
        <p><strong>名称:</strong> {{ selectedNode.name }}</p>
        <p v-if="selectedNode.description">
          <strong>描述:</strong> {{ selectedNode.description }}
        </p>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ApprovalFlow } from '../../../src/vue';
import type { FlowChartData, NodeData, ApprovalNodeType } from '../../../src/types';

const editorRef = ref();
const readonly = ref(false);
const selectedNode = ref<NodeData | null>(null);

// 初始流程数据
const flowData = ref<FlowChartData>({
  nodes: [
    {
      id: 'start-1',
      type: 'start' as ApprovalNodeType,
      name: '开始',
    },
    {
      id: 'approval-1',
      type: 'approval' as ApprovalNodeType,
      name: '部门审批',
      approvalMode: 'single' as any,
      approvers: [
        { id: '1', name: '张三', role: '部门经理' },
      ],
    },
    {
      id: 'end-1',
      type: 'end' as ApprovalNodeType,
      name: '结束',
    },
  ],
  edges: [
    {
      id: 'edge-1',
      sourceNodeId: 'start-1',
      targetNodeId: 'approval-1',
    },
    {
      id: 'edge-2',
      sourceNodeId: 'approval-1',
      targetNodeId: 'end-1',
    },
  ],
});

// 添加节点
const addStartNode = () => {
  editorRef.value?.addNode({
    type: 'start' as ApprovalNodeType,
    name: '开始',
  });
};

const addApprovalNode = () => {
  editorRef.value?.addNode({
    type: 'approval' as ApprovalNodeType,
    name: '审批节点',
    approvalMode: 'single' as any,
    approvers: [],
  });
};

const addConditionNode = () => {
  editorRef.value?.addNode({
    type: 'condition' as ApprovalNodeType,
    name: '条件判断',
    conditions: [],
  });
};

const addParallelNode = () => {
  editorRef.value?.addNode({
    type: 'parallel' as ApprovalNodeType,
    name: '并行任务',
  });
};

const addCCNode = () => {
  editorRef.value?.addNode({
    type: 'cc' as ApprovalNodeType,
    name: '抄送',
    ccUsers: [],
  });
};

const addEndNode = () => {
  editorRef.value?.addNode({
    type: 'end' as ApprovalNodeType,
    name: '结束',
  });
};

// 验证流程
const validate = () => {
  const result = editorRef.value?.validate();
  if (result?.valid) {
    alert('流程验证通过！');
  } else {
    const errors = result?.errors.map((e: any) => e.message).join('\n');
    alert(`流程验证失败：\n${errors}`);
  }
};

// 导出数据
const exportData = () => {
  const data = editorRef.value?.getData();
  console.log('流程数据:', data);
  alert('数据已输出到控制台');
};

// 切换只读模式
const toggleReadonly = () => {
  readonly.value = !readonly.value;
};

// 适应画布
const fit = () => {
  editorRef.value?.fit();
};

// 清空画布
const clear = () => {
  if (confirm('确定要清空画布吗？')) {
    editorRef.value?.clear();
  }
};

// 节点点击事件
const handleNodeClick = (data: NodeData) => {
  selectedNode.value = data;
  console.log('节点点击:', data);
};

// 节点添加事件
const handleNodeAdd = (data: NodeData) => {
  console.log('节点添加:', data);
};

// 数据变化事件
const handleDataChange = (data: FlowChartData) => {
  console.log('数据变化:', data);
};
</script>

<style scoped>
.demo-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.demo-header {
  padding: 16px;
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.demo-header h1 {
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.toolbar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.toolbar button {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #ffffff;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.toolbar button:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.toolbar button:active {
  background: #e6f7ff;
}

.demo-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.demo-sidebar {
  position: absolute;
  top: 80px;
  right: 16px;
  width: 300px;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.demo-sidebar h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.node-info p {
  margin: 8px 0;
  font-size: 14px;
  line-height: 1.6;
  color: #666;
}

.node-info strong {
  color: #333;
}
</style>

<template>
  <div class="vue-example">
    <div class="header">
      <h1>LDesign Tree - Vue 3 示例</h1>
      <p>在Vue 3应用中使用树形组件</p>
    </div>

    <div class="content">
      <!-- 基础示例 -->
      <div class="demo-section">
        <h2>基础用法</h2>
        <LDesignTree
          ref="basicTreeRef"
          :data="treeData"
          :selectedKeys="selectedKeys"
          :expandedKeys="expandedKeys"
          selectionMode="multiple"
          :showCheckbox="true"
          @update:selectedKeys="selectedKeys = $event"
          @update:expandedKeys="expandedKeys = $event"
          @select="handleSelect"
          @expand="handleExpand"
          @collapse="handleCollapse"
        />
        
        <div class="controls">
          <button @click="expandAll">展开全部</button>
          <button @click="collapseAll">收起全部</button>
          <button @click="selectAll">全选</button>
          <button @click="clearSelection">清空选择</button>
        </div>
        
        <div v-if="selectedKeys.length" class="info">
          已选择: {{ selectedKeys.join(', ') }}
        </div>
      </div>

      <!-- 搜索示例 */
      <div class="demo-section">
        <h2>搜索功能</h2>
        <div class="search-controls">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索节点..."
            class="search-input"
          />
          <button @click="clearSearch">清空搜索</button>
        </div>
        
        <LDesignTree
          ref="searchTreeRef"
          :data="treeData"
          :searchKeyword="searchKeyword"
          :searchable="true"
          @search="handleSearch"
        />
        
        <div v-if="searchResults.length" class="info">
          搜索 "{{ searchKeyword }}" 找到 {{ searchResults.length }} 个结果
        </div>
      </div>

      <!-- 拖拽示例 -->
      <div class="demo-section">
        <h2>拖拽排序</h2>
        <LDesignTree
          ref="dragTreeRef"
          :data="dragTreeData"
          :draggable="true"
          @drop="handleDrop"
        />
        
        <div class="controls">
          <button @click="resetDragTree">重置数据</button>
        </div>
        
        <div v-if="dropInfo" class="info">
          {{ dropInfo }}
        </div>
      </div>

      <!-- 异步加载示例 -->
      <div class="demo-section">
        <h2>异步加载</h2>
        <LDesignTree
          ref="asyncTreeRef"
          :data="asyncTreeData"
          :asyncLoad="loadChildren"
          @load="handleLoad"
        />
        
        <div v-if="loadInfo" class="info">
          {{ loadInfo }}
        </div>
      </div>

      <!-- 主题切换示例 -->
      <div class="demo-section">
        <h2>主题切换</h2>
        <div class="theme-controls">
          <label>
            <input
              v-model="currentTheme"
              type="radio"
              value="light"
            />
            浅色主题
          </label>
          <label>
            <input
              v-model="currentTheme"
              type="radio"
              value="dark"
            />
            暗色主题
          </label>
          <label>
            <input
              v-model="currentTheme"
              type="radio"
              value="compact"
            />
            紧凑主题
          </label>
          <label>
            <input
              v-model="currentTheme"
              type="radio"
              value="comfortable"
            />
            舒适主题
          </label>
        </div>
        
        <LDesignTree
          :data="treeData"
          :theme="currentTheme"
          selectionMode="single"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { LDesignTree } from '../src/adapters/vue'
import type { TreeNodeData } from '../src/types'

// 响应式数据
const selectedKeys = ref<string[]>([])
const expandedKeys = ref<string[]>(['1', '2'])
const searchKeyword = ref('')
const searchResults = ref<any[]>([])
const dropInfo = ref('')
const loadInfo = ref('')
const currentTheme = ref<'light' | 'dark' | 'compact' | 'comfortable'>('light')

// 树形数据
const treeData = ref<TreeNodeData[]>([
  {
    id: '1',
    label: '根节点 1',
    children: [
      {
        id: '1-1',
        label: '子节点 1-1',
        children: [
          { id: '1-1-1', label: '叶子节点 1-1-1' },
          { id: '1-1-2', label: '叶子节点 1-1-2' },
        ]
      },
      {
        id: '1-2',
        label: '子节点 1-2',
        children: [
          { id: '1-2-1', label: '叶子节点 1-2-1' },
        ]
      }
    ]
  },
  {
    id: '2',
    label: '根节点 2',
    children: [
      { id: '2-1', label: '子节点 2-1' },
      { id: '2-2', label: '子节点 2-2' },
    ]
  },
  {
    id: '3',
    label: '根节点 3',
    children: [
      {
        id: '3-1',
        label: '子节点 3-1',
        children: [
          { id: '3-1-1', label: '叶子节点 3-1-1' },
          { id: '3-1-2', label: '叶子节点 3-1-2' },
          { id: '3-1-3', label: '叶子节点 3-1-3' },
        ]
      }
    ]
  }
])

// 拖拽树数据
const dragTreeData = ref<TreeNodeData[]>(JSON.parse(JSON.stringify(treeData.value)))

// 异步树数据
const asyncTreeData = ref<TreeNodeData[]>([
  {
    id: 'async-1',
    label: '异步节点 1',
    hasChildren: true
  },
  {
    id: 'async-2',
    label: '异步节点 2',
    hasChildren: true
  }
])

// 组件引用
const basicTreeRef = ref()
const searchTreeRef = ref()
const dragTreeRef = ref()
const asyncTreeRef = ref()

// 事件处理
const handleSelect = (keys: string[]) => {
  console.log('选择节点:', keys)
}

const handleExpand = (nodeId: string) => {
  console.log('展开节点:', nodeId)
}

const handleCollapse = (nodeId: string) => {
  console.log('收起节点:', nodeId)
}

const handleSearch = (keyword: string, results: any[]) => {
  searchResults.value = results
  console.log('搜索结果:', keyword, results)
}

const handleDrop = (data: any) => {
  dropInfo.value = `节点 "${data.dragNode.label}" 移动到 "${data.dropNode.label}" ${data.position}`
  console.log('拖拽完成:', data)
}

const handleLoad = (nodeId: string, data: TreeNodeData[]) => {
  loadInfo.value = `节点 "${nodeId}" 加载了 ${data.length} 个子节点`
  console.log('异步加载完成:', nodeId, data)
}

// 异步加载函数
const loadChildren = async (node: any): Promise<TreeNodeData[]> => {
  // 模拟异步请求
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return [
    {
      id: `${node.id}-1`,
      label: `${node.label} - 子节点 1`
    },
    {
      id: `${node.id}-2`,
      label: `${node.label} - 子节点 2`
    },
    {
      id: `${node.id}-3`,
      label: `${node.label} - 子节点 3`
    }
  ]
}

// 控制方法
const expandAll = () => {
  basicTreeRef.value?.expandAll()
}

const collapseAll = () => {
  basicTreeRef.value?.collapseAll()
}

const selectAll = () => {
  basicTreeRef.value?.selectAll()
}

const clearSelection = () => {
  selectedKeys.value = []
  basicTreeRef.value?.unselectAll()
}

const clearSearch = () => {
  searchKeyword.value = ''
  searchResults.value = []
}

const resetDragTree = () => {
  dragTreeData.value = JSON.parse(JSON.stringify(treeData.value))
  dropInfo.value = ''
}
</script>

<style scoped>
.vue-example {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
}

.demo-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: white;
}

.demo-section h2 {
  margin-top: 0;
  color: #333;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

.controls {
  margin: 15px 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.search-controls {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.theme-controls {
  margin-bottom: 15px;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.theme-controls label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

button {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

button:hover {
  border-color: #40a9ff;
  color: #40a9ff;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  width: 200px;
}

.info {
  margin-top: 15px;
  padding: 12px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 4px;
  color: #52c41a;
}
</style>

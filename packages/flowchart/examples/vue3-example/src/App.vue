<template>
  <div class="app">
    <!-- 头部 -->
    <div class="header">
      <div class="container">
        <h1>🎨 LDesign Flowchart - Vue 3 示例</h1>
        <p>基于 Vue 3 Composition API 的审批流程图编辑器演示</p>
      </div>
    </div>

    <div class="container">
      <!-- 工具栏 -->
      <div class="toolbar">
        <button class="btn" @click="addStartNode">添加开始节点</button>
        <button class="btn" @click="addApprovalNode">添加审批节点</button>
        <button class="btn" @click="addConditionNode">添加条件节点</button>
        <button class="btn" @click="addEndNode">添加结束节点</button>
        <button class="btn btn-secondary" @click="loadTemplate">加载模板</button>
        <button class="btn btn-danger" @click="clearAll">清空画布</button>
        
        <select class="select" v-model="selectedTheme" @change="changeTheme">
          <option value="default">默认主题</option>
          <option value="dark">暗色主题</option>
          <option value="blue">蓝色主题</option>
        </select>
        
        <button class="btn" @click="exportData">导出数据</button>
        <button class="btn" @click="toggleViewer">{{ isViewerMode ? '编辑模式' : '查看模式' }}</button>
      </div>

      <!-- 流程图容器 -->
      <div class="flowchart-container">
        <div ref="flowchartRef" class="flowchart"></div>
      </div>

      <!-- 信息面板 -->
      <div class="info-panel">
        <!-- 统计信息 -->
        <div class="info-card">
          <h3>📊 统计信息</h3>
          <div class="stats">
            <div class="stat-item">
              <div class="stat-value">{{ stats.nodeCount }}</div>
              <div class="stat-label">节点数量</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.edgeCount }}</div>
              <div class="stat-label">连接数量</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ selectedTheme }}</div>
              <div class="stat-label">当前主题</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ isViewerMode ? '查看' : '编辑' }}</div>
              <div class="stat-label">当前模式</div>
            </div>
          </div>
        </div>

        <!-- 事件日志 -->
        <div class="info-card">
          <h3>📝 事件日志</h3>
          <div class="event-log">
            <div v-for="event in eventLog" :key="event.id" class="event-item">
              <span class="event-type">{{ event.type }}</span>
              <span class="event-time">{{ event.time }}</span>
            </div>
            <div v-if="eventLog.length === 0" style="text-align: center; color: #999; padding: 20px;">
              暂无事件记录
            </div>
          </div>
        </div>
      </div>

      <!-- 数据输出 -->
      <div class="info-card" style="margin-top: 20px;">
        <h3>💾 流程图数据</h3>
        <pre>{{ JSON.stringify(flowchartData, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { FlowchartEditor, FlowchartViewer, FlowchartAPI } from '@ldesign/flowchart'

// 响应式数据
const flowchartRef = ref(null)
const selectedTheme = ref('default')
const isViewerMode = ref(false)
const flowchartData = ref({ nodes: [], edges: [] })
const eventLog = ref([])

// 统计信息
const stats = reactive({
  nodeCount: 0,
  edgeCount: 0
})

// 编辑器实例
let editor = null
let viewer = null
let nodeCounter = 0
let eventCounter = 0

/**
 * 添加事件日志
 */
function addEventLog(type, details = '') {
  eventLog.value.unshift({
    id: ++eventCounter,
    type,
    details,
    time: new Date().toLocaleTimeString()
  })

  // 限制日志数量
  if (eventLog.value.length > 50) {
    eventLog.value = eventLog.value.slice(0, 50)
  }
}

/**
 * 更新统计信息
 */
function updateStats() {
  const data = editor ? editor.getData() : { nodes: [], edges: [] }
  stats.nodeCount = data.nodes.length
  stats.edgeCount = data.edges.length
  flowchartData.value = data
}

/**
 * 初始化编辑器
 */
async function initEditor() {
  if (!flowchartRef.value) return

  try {
    editor = new FlowchartEditor({
      container: flowchartRef.value,
      width: 1160,
      height: 600
    })

    // 监听事件
    editor.on('node:click', (data) => {
      addEventLog('节点点击', `节点ID: ${data.node.id}`)
      updateStats()
    })

    editor.on('edge:click', (data) => {
      addEventLog('边点击', `边ID: ${data.edge.id}`)
      updateStats()
    })

    editor.on('data:change', (data) => {
      addEventLog('图形更新')
      updateStats()
    })

    // 渲染编辑器
    editor.render()

    addEventLog('编辑器初始化', '编辑器已成功初始化')
    updateStats()
  } catch (error) {
    console.error('编辑器初始化失败:', error)
    addEventLog('初始化失败', error.message)
  }
}

/**
 * 初始化查看器
 */
async function initViewer() {
  if (!flowchartRef.value) return

  try {
    const data = editor ? editor.getData() : { nodes: [], edges: [] }

    viewer = new FlowchartViewer({
      container: flowchartRef.value,
      width: 1160,
      height: 600,
      data
    })

    addEventLog('查看器初始化', '查看器已成功初始化')
  } catch (error) {
    console.error('查看器初始化失败:', error)
    addEventLog('初始化失败', error.message)
  }
}

/**
 * 添加开始节点
 */
function addStartNode() {
  if (!editor) return

  const nodeId = `start-${++nodeCounter}`
  const id = editor.addNode({
    id: nodeId,
    type: 'start',
    x: 100 + Math.random() * 200,
    y: 100 + Math.random() * 200,
    text: '开始'
  })

  addEventLog('添加节点', `开始节点: ${id}`)
  updateStats()
}

/**
 * 添加审批节点
 */
function addApprovalNode() {
  if (!editor) return

  const nodeId = `approval-${++nodeCounter}`
  const id = editor.addNode({
    id: nodeId,
    type: 'approval',
    x: 300 + Math.random() * 200,
    y: 100 + Math.random() * 200,
    text: '审批节点',
    properties: {
      approver: '审批人',
      department: '部门',
      status: 'pending'
    }
  })

  addEventLog('添加节点', `审批节点: ${id}`)
  updateStats()
}

/**
 * 添加条件节点
 */
function addConditionNode() {
  if (!editor) return

  const nodeId = `condition-${++nodeCounter}`
  const id = editor.addNode({
    id: nodeId,
    type: 'condition',
    x: 500 + Math.random() * 200,
    y: 100 + Math.random() * 200,
    text: '条件判断',
    properties: {
      condition: '金额 > 1000',
      trueLabel: '是',
      falseLabel: '否'
    }
  })

  addEventLog('添加节点', `条件节点: ${id}`)
  updateStats()
}

/**
 * 添加结束节点
 */
function addEndNode() {
  if (!editor) return

  const nodeId = `end-${++nodeCounter}`
  const id = editor.addNode({
    id: nodeId,
    type: 'end',
    x: 700 + Math.random() * 200,
    y: 100 + Math.random() * 200,
    text: '结束'
  })

  addEventLog('添加节点', `结束节点: ${id}`)
  updateStats()
}

/**
 * 清空画布
 */
function clearAll() {
  if (!editor) return

  const data = editor.getData()
  if (data.nodes.length === 0 && data.edges.length === 0) {
    alert('画布已经是空的了！')
    return
  }

  if (confirm('确定要清空画布吗？')) {
    editor.setData({ nodes: [], edges: [] })
    nodeCounter = 0
    addEventLog('清空画布', '所有节点和连接已清除')
    updateStats()
  }
}

/**
 * 切换主题
 */
function changeTheme() {
  const instance = isViewerMode.value ? viewer : editor
  if (!instance) return

  try {
    instance.setTheme(selectedTheme.value)
    addEventLog('主题切换', `切换到: ${selectedTheme.value}`)
  } catch (error) {
    console.error('主题切换失败:', error)
    addEventLog('主题切换失败', error.message)
  }
}

/**
 * 导出数据
 */
function exportData() {
  if (!editor) return

  const data = editor.getData()

  // 下载为文件
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'flowchart-data.json'
  a.click()
  URL.revokeObjectURL(url)

  addEventLog('数据导出', `导出了 ${data.nodes.length} 个节点和 ${data.edges.length} 个连接`)
}

/**
 * 加载审批流程模板
 */
function loadTemplate() {
  if (!editor) return

  try {
    // 先清空画布
    editor.clearData()

    // 手动创建一个简单的审批流程
    const startId = editor.addNode({
      type: 'start',
      x: 100,
      y: 200,
      text: '开始'
    })

    const approvalId = editor.addNode({
      type: 'approval',
      x: 300,
      y: 200,
      text: '部门审批',
      properties: {
        approver: '部门经理',
        status: 'pending'
      }
    })

    const endId = editor.addNode({
      type: 'end',
      x: 500,
      y: 200,
      text: '结束'
    })

    // 添加连接线
    editor.addEdge({
      sourceNodeId: startId,
      targetNodeId: approvalId,
      text: '提交'
    })

    editor.addEdge({
      sourceNodeId: approvalId,
      targetNodeId: endId,
      text: '通过'
    })

    addEventLog('模板加载', '简单审批流程模板已加载')
    updateStats()
  } catch (error) {
    console.error('模板加载失败:', error)
    addEventLog('模板加载失败', error.message)
  }
}

/**
 * 切换编辑器/查看器模式
 */
async function toggleViewer() {
  try {
    if (isViewerMode.value) {
      // 切换到编辑模式
      if (viewer) {
        viewer.destroy()
        viewer = null
      }
      await nextTick()
      await initEditor()
      isViewerMode.value = false
      addEventLog('模式切换', '切换到编辑模式')
    } else {
      // 切换到查看模式
      if (editor) {
        const data = editor.getData()
        editor.destroy()
        editor = null
        await nextTick()
        await initViewer()
        isViewerMode.value = true
        addEventLog('模式切换', '切换到查看模式')
      }
    }
  } catch (error) {
    console.error('模式切换失败:', error)
    addEventLog('模式切换失败', error.message)
  }
}

// 生命周期钩子
onMounted(async () => {
  await nextTick()
  await initEditor()
})

onUnmounted(() => {
  if (editor) {
    editor.destroy()
    editor = null
  }
  if (viewer) {
    viewer.destroy()
    viewer = null
  }
})
</script>

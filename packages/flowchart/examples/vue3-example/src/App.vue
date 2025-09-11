<template>
  <div class="app">
    <!-- 头部 -->
    <div class="header">
      <h1>🎨 LDesign Flowchart - Vue 3 示例</h1>
      <p>基于 Vue 3 Composition API 的专业流程图编辑器演示</p>
      <div class="header-actions">
        <select v-model="currentTheme" @change="changeTheme" class="theme-select">
          <option value="default">默认主题</option>
          <option value="dark">暗色主题</option>
          <option value="blue">蓝色主题</option>
        </select>

        <button @click="toggleReadonlyMode" class="btn btn-outline">
          {{ isReadonly ? '编辑模式' : '只读模式' }}
        </button>
        <button @click="loadTemplate" class="btn btn-primary" :disabled="isReadonly">
          加载模板
        </button>
        <button @click="exportData" class="btn btn-success">
          导出数据
        </button>
      </div>
    </div>

    <!-- 流程图编辑器容器 -->
    <div ref="flowchartContainer" class="flowchart-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { FlowchartEditor, FlowchartAPI } from '@ldesign/flowchart'

// 响应式数据
const flowchartContainer = ref<HTMLElement | null>(null)
const isReadonly = ref(false)
const currentTheme = ref('default')

// 编辑器实例
let editor: FlowchartEditor | null = null

/**
 * 初始化编辑器
 */
async function initEditor() {
  if (!flowchartContainer.value) return

  try {
    editor = new FlowchartEditor({
      container: flowchartContainer.value,
      width: flowchartContainer.value.clientWidth,
      height: flowchartContainer.value.clientHeight,
      readonly: isReadonly.value,
      // 启用所有UI组件
      toolbar: {
        visible: true,
        tools: ['select', 'multi-select', 'material-repository', 'zoom-fit', 'undo', 'redo', 'delete']
      },
      nodePanel: {
        visible: true,
        position: 'left'
      },
      propertyPanel: {
        visible: true,
        position: 'right'
      },
      theme: 'default'
    })

    // 渲染编辑器
    editor.render()

    console.log('编辑器初始化成功')
  } catch (error: any) {
    console.error('编辑器初始化失败:', error)
  }
}

/**
 * 切换只读模式
 */
function toggleReadonlyMode() {
  isReadonly.value = !isReadonly.value
  if (editor) {
    editor.setReadonly(isReadonly.value)
  }
}

/**
 * 加载模板
 */
async function loadTemplate() {
  if (!editor || isReadonly.value) return

  try {
    // 加载复杂审批流程模板
    const response = await fetch('/src/data/complex-approval-flow.json')
    const templateData = await response.json()

    editor.setData(templateData)
    console.log('复杂审批流程模板加载成功', templateData)
  } catch (error) {
    console.error('加载复杂模板失败，使用简单模板:', error)

    // 如果加载失败，使用API创建的简单模板
    try {
      const template = FlowchartAPI.createApprovalTemplate()
      editor.setData(template)
      console.log('简单模板加载成功')
    } catch (apiError) {
      console.error('API模板加载也失败:', apiError)
    }
  }
}

/**
 * 切换主题
 */
function changeTheme() {
  if (!editor) return

  try {
    editor.setTheme(currentTheme.value)
    console.log(`主题已切换为: ${currentTheme.value}`)
  } catch (error) {
    console.error('主题切换失败:', error)
  }
}

/**
 * 导出数据
 */
function exportData() {
  if (!editor) return

  const data = editor.getData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'flowchart-data.json'
  a.click()
  URL.revokeObjectURL(url)
  console.log('数据导出成功')
}

// 生命周期钩子
onMounted(() => {
  initEditor()
})

onUnmounted(() => {
  if (editor) {
    editor.destroy()
  }
})

</script>

<style scoped lang="less">
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.header {
  background: #ffffff;
  border-bottom: 1px solid #e5e5e5;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  h1 {
    margin: 0 0 6px 0;
    font-size: 28px;
    color: rgba(0, 0, 0, 0.9);
    font-weight: 600;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.7);
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.flowchart-container {
  flex: 1;
  overflow: hidden;
}

.theme-select {
  padding: 8px 12px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  background: #ffffff;
  color: rgba(0, 0, 0, 0.8);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-select:hover {
  border-color: #7334cb;
}

.theme-select:focus {
  outline: none;
  border-color: #7334cb;
  box-shadow: 0 0 0 2px rgba(115, 52, 203, 0.1);
}

.btn {
  padding: 8px 16px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  background: #ffffff;
  color: rgba(0, 0, 0, 0.8);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn:hover:not(:disabled) {
  border-color: #7334cb;
  background: #f8f8f8;
  color: #7334cb;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f8f8f8;
  color: rgba(0, 0, 0, 0.4);
}

.btn-primary {
  background: #7334cb;
  color: white;
  border-color: #7334cb;
}

.btn-primary:hover:not(:disabled) {
  background: #5e2aa7;
  border-color: #5e2aa7;
  color: white;
}

.btn-success {
  background: #62cb62;
  color: white;
  border-color: #62cb62;
}

.btn-success:hover:not(:disabled) {
  background: #42bd42;
  border-color: #42bd42;
  color: white;
}

.btn-outline {
  background: transparent;
  border-color: #7334cb;
  color: #7334cb;
}

.btn-outline:hover:not(:disabled) {
  background: #7334cb;
  color: white;
}




</style>

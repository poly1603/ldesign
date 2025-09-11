<template>
  <div ref="containerRef" class="ldesign-flowchart-vue-wrapper"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, defineProps, defineEmits, defineExpose } from 'vue'
import { FlowchartEditor } from '../core/FlowchartEditor'
import type { FlowchartEditorConfig, FlowchartData, ApprovalNodeConfig, FlowchartTheme } from '../types'

// Props定义
interface Props {
  // 基础配置
  width?: number
  height?: number
  readonly?: boolean
  theme?: FlowchartTheme
  
  // UI配置
  toolbar?: {
    visible?: boolean
    tools?: string[]
  }
  nodePanel?: {
    visible?: boolean
    position?: 'left' | 'right'
  }
  propertyPanel?: {
    visible?: boolean
    position?: 'left' | 'right'
  }
  
  // 画布配置
  background?: {
    color?: string
    image?: string
  }
  grid?: {
    visible?: boolean
    size?: number
    color?: string
  }
  
  // 数据
  data?: FlowchartData
}

// 默认props
const props = withDefaults(defineProps<Props>(), {
  width: 800,
  height: 600,
  readonly: false,
  theme: 'default',
  toolbar: () => ({ visible: true }),
  nodePanel: () => ({ visible: true, position: 'left' }),
  propertyPanel: () => ({ visible: true, position: 'right' }),
  background: () => ({ color: '#fafafa' }),
  grid: () => ({ visible: true, size: 20 })
})

// Events定义
const emit = defineEmits<{
  'node:click': [node: ApprovalNodeConfig]
  'node:select': [node: ApprovalNodeConfig | null]
  'data:change': [data: FlowchartData]
  'theme:change': [theme: FlowchartTheme]
  'ready': [editor: FlowchartEditor]
}>()

// 响应式引用
const containerRef = ref<HTMLElement>()
let editor: FlowchartEditor | null = null

/**
 * 初始化编辑器
 */
const initEditor = () => {
  if (!containerRef.value) return

  const config: FlowchartEditorConfig = {
    container: containerRef.value,
    width: props.width,
    height: props.height,
    readonly: props.readonly,
    theme: props.theme,
    toolbar: props.toolbar,
    nodePanel: props.nodePanel,
    propertyPanel: props.propertyPanel,
    background: props.background,
    grid: props.grid
  }

  editor = new FlowchartEditor(config)

  // 绑定事件
  editor.on('node:click', (data) => {
    emit('node:click', data)
  })

  editor.on('node:select', (data) => {
    emit('node:select', data)
  })

  editor.on('data:change', (data) => {
    emit('data:change', data)
  })

  editor.on('theme:change', (theme) => {
    emit('theme:change', theme)
  })

  // 渲染编辑器
  editor.render()

  // 设置初始数据
  if (props.data) {
    editor.setData(props.data)
  }

  // 触发ready事件
  emit('ready', editor)
}

/**
 * 销毁编辑器
 */
const destroyEditor = () => {
  if (editor) {
    editor.destroy()
    editor = null
  }
}

// 生命周期
onMounted(() => {
  initEditor()
})

onUnmounted(() => {
  destroyEditor()
})

// 监听props变化
watch(() => props.readonly, (newVal) => {
  if (editor) {
    editor.setReadonly(newVal)
  }
})

watch(() => props.theme, (newVal) => {
  if (editor) {
    editor.setTheme(newVal)
  }
})

watch(() => props.data, (newVal) => {
  if (editor && newVal) {
    editor.setData(newVal)
  }
}, { deep: true })

// 暴露方法给父组件
defineExpose({
  // 编辑器实例
  getEditor: () => editor,
  
  // 数据操作
  getData: () => editor?.getData(),
  setData: (data: FlowchartData) => editor?.setData(data),
  clearData: () => editor?.clearData(),
  
  // 节点操作
  addNode: (config: ApprovalNodeConfig) => editor?.addNode(config),
  updateNode: (nodeId: string, updates: Partial<ApprovalNodeConfig>) => editor?.updateNode(nodeId, updates),
  deleteNode: (nodeId: string) => editor?.deleteNode(nodeId),
  getNode: (nodeId: string) => editor?.getNode(nodeId),
  
  // 边操作
  addEdge: (config: any) => editor?.addEdge(config),
  deleteEdge: (edgeId: string) => editor?.deleteEdge(edgeId),
  
  // 视图操作
  zoomToFit: () => editor?.zoomToFit(),
  zoomIn: () => editor?.zoomIn(),
  zoomOut: () => editor?.zoomOut(),
  
  // 历史操作
  undo: () => editor?.undo(),
  redo: () => editor?.redo(),
  
  // 主题操作
  setTheme: (theme: FlowchartTheme) => editor?.setTheme(theme),
  
  // 模式操作
  setReadonly: (readonly: boolean) => editor?.setReadonly(readonly),
  
  // 导出操作
  exportImage: (type?: 'png' | 'jpeg') => editor?.exportImage(type),
  exportData: () => editor?.exportData()
})
</script>

<style scoped>
.ldesign-flowchart-vue-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}
</style>

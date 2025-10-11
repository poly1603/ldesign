<template>
  <div ref="containerRef" :class="['ld-code-editor', customClass]" :style="customStyle"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import type { PropType } from 'vue'
import { CodeEditor } from '../../core/CodeEditor'
import type { CodeEditorConfig, CodeEditorOptions, EditorLanguage, EditorTheme } from '../../types'
import type * as Monaco from 'monaco-editor'

const props = defineProps({
  /** 编辑器值 (v-model) */
  modelValue: {
    type: String,
    default: ''
  },
  /** 编辑器语言 */
  language: {
    type: String as PropType<EditorLanguage>,
    default: 'javascript'
  },
  /** 编辑器主题 */
  theme: {
    type: String as PropType<EditorTheme>,
    default: 'vs-dark'
  },
  /** 是否只读 */
  readOnly: {
    type: Boolean,
    default: false
  },
  /** 是否启用自动补全 */
  autoComplete: {
    type: Boolean,
    default: true
  },
  /** 是否启用代码折叠 */
  folding: {
    type: Boolean,
    default: true
  },
  /** 是否显示行号 */
  lineNumbers: {
    type: String as PropType<'on' | 'off' | 'relative' | 'interval'>,
    default: 'on'
  },
  /** 是否启用 minimap */
  minimap: {
    type: Boolean,
    default: true
  },
  /** 字体大小 */
  fontSize: {
    type: Number,
    default: 14
  },
  /** Tab 大小 */
  tabSize: {
    type: Number,
    default: 2
  },
  /** 是否使用空格代替 Tab */
  insertSpaces: {
    type: Boolean,
    default: true
  },
  /** 是否自动换行 */
  wordWrap: {
    type: String as PropType<'on' | 'off' | 'wordWrapColumn' | 'bounded'>,
    default: 'off'
  },
  /** 滚动条配置 */
  scrollbar: {
    type: Object as PropType<CodeEditorOptions['scrollbar']>,
    default: () => ({})
  },
  /** Monaco 编辑器原生选项 */
  monacoOptions: {
    type: Object as PropType<Monaco.editor.IStandaloneEditorConstructionOptions>,
    default: () => ({})
  },
  /** 自定义类名 */
  customClass: {
    type: String,
    default: ''
  },
  /** 自定义样式 */
  customStyle: {
    type: [String, Object] as PropType<string | Record<string, any>>,
    default: ''
  },
  /** 编辑器高度 */
  height: {
    type: [String, Number],
    default: '400px'
  },
  /** 编辑器宽度 */
  width: {
    type: [String, Number],
    default: '100%'
  }
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string, event: Monaco.editor.IModelContentChangedEvent]
  'cursorChange': [position: Monaco.Position]
  'focus': []
  'blur': []
  'ready': [editor: Monaco.editor.IStandaloneCodeEditor]
}>()

const containerRef = ref<HTMLElement>()
let editorInstance: CodeEditor | null = null

// 计算容器样式
const computedStyle = computed(() => {
  const baseStyle = {
    height: typeof props.height === 'number' ? `${props.height}px` : props.height,
    width: typeof props.width === 'number' ? `${props.width}px` : props.width
  }

  if (typeof props.customStyle === 'string') {
    return baseStyle
  }

  return { ...baseStyle, ...props.customStyle }
})

// 初始化编辑器
onMounted(() => {
  if (!containerRef.value) return

  const config: CodeEditorConfig = {
    value: props.modelValue,
    language: props.language,
    theme: props.theme,
    readOnly: props.readOnly,
    autoComplete: props.autoComplete,
    folding: props.folding,
    lineNumbers: props.lineNumbers,
    minimap: props.minimap,
    fontSize: props.fontSize,
    tabSize: props.tabSize,
    insertSpaces: props.insertSpaces,
    wordWrap: props.wordWrap,
    scrollbar: props.scrollbar,
    monacoOptions: props.monacoOptions,
    on: {
      change: (value, event) => {
        emit('update:modelValue', value)
        emit('change', value, event)
      },
      cursorChange: (position) => {
        emit('cursorChange', position)
      },
      focus: () => {
        emit('focus')
      },
      blur: () => {
        emit('blur')
      },
      ready: (editor) => {
        emit('ready', editor)
      }
    }
  }

  editorInstance = new CodeEditor(containerRef.value, config)
})

// 监听 modelValue 变化
watch(() => props.modelValue, (newValue) => {
  if (editorInstance && editorInstance.getValue() !== newValue) {
    editorInstance.setValue(newValue)
  }
})

// 监听配置变化
watch(
  () => ({
    language: props.language,
    theme: props.theme,
    readOnly: props.readOnly,
    autoComplete: props.autoComplete,
    folding: props.folding,
    lineNumbers: props.lineNumbers,
    minimap: props.minimap,
    fontSize: props.fontSize,
    tabSize: props.tabSize,
    insertSpaces: props.insertSpaces,
    wordWrap: props.wordWrap,
    scrollbar: props.scrollbar,
    monacoOptions: props.monacoOptions
  }),
  (newOptions) => {
    if (editorInstance) {
      editorInstance.updateOptions(newOptions)
    }
  },
  { deep: true }
)

// 清理
onBeforeUnmount(() => {
  editorInstance?.dispose()
  editorInstance = null
})

// 暴露编辑器实例方法
defineExpose({
  /** 获取编辑器实例 */
  getEditorInstance: () => editorInstance,
  /** 获取编辑器值 */
  getValue: () => editorInstance?.getValue(),
  /** 设置编辑器值 */
  setValue: (value: string) => editorInstance?.setValue(value),
  /** 获取选中的文本 */
  getSelection: () => editorInstance?.getSelection(),
  /** 插入文本 */
  insertText: (text: string, position?: Monaco.IPosition) => editorInstance?.insertText(text, position),
  /** 格式化代码 */
  format: () => editorInstance?.format(),
  /** 设置语言 */
  setLanguage: (language: EditorLanguage) => editorInstance?.setLanguage(language),
  /** 设置主题 */
  setTheme: (theme: EditorTheme) => editorInstance?.setTheme(theme),
  /** 设置只读 */
  setReadOnly: (readOnly: boolean) => editorInstance?.setReadOnly(readOnly),
  /** 聚焦 */
  focus: () => editorInstance?.focus(),
  /** 获取光标位置 */
  getPosition: () => editorInstance?.getPosition(),
  /** 设置光标位置 */
  setPosition: (position: Monaco.IPosition) => editorInstance?.setPosition(position),
  /** 撤销 */
  undo: () => editorInstance?.undo(),
  /** 重做 */
  redo: () => editorInstance?.redo(),
  /** 获取 Monaco 编辑器实例 */
  getEditor: () => editorInstance?.getEditor(),
  /** 获取编辑器状态 */
  getState: () => editorInstance?.getState()
})
</script>

<style scoped>
.ld-code-editor {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}
</style>

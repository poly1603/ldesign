/**
 * Vue 3 适配器
 */

import { defineComponent, ref, onMounted, onBeforeUnmount, watch, h } from 'vue'
import { Editor } from '../../core/Editor'
import { Toolbar } from '../../ui/Toolbar'
import type { EditorOptions, Plugin } from '../../types'

export interface RichEditorProps {
  modelValue?: string
  plugins?: (Plugin | string)[]
  editable?: boolean
  autofocus?: boolean
  placeholder?: string
  showToolbar?: boolean
}

/**
 * Vue 富文本编辑器组件
 */
export const RichEditor = defineComponent({
  name: 'RichEditor',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    plugins: {
      type: Array as () => (Plugin | string)[],
      default: () => []
    },
    editable: {
      type: Boolean,
      default: true
    },
    autofocus: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '请输入内容...'
    },
    showToolbar: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue', 'update', 'focus', 'blur'],
  setup(props, { emit, expose }) {
    const editorContainer = ref<HTMLElement>()
    const editorInstance = ref<Editor>()
    const toolbarInstance = ref<Toolbar>()

    // 初始化编辑器
    const initEditor = () => {
      if (!editorContainer.value) return

      const options: EditorOptions = {
        element: editorContainer.value,
        content: props.modelValue,
        plugins: props.plugins,
        editable: props.editable,
        autofocus: props.autofocus,
        placeholder: props.placeholder,
        onChange: (content) => {
          emit('update:modelValue', content)
        },
        onUpdate: (state) => {
          emit('update', state)
        },
        onFocus: () => {
          emit('focus')
        },
        onBlur: () => {
          emit('blur')
        }
      }

      editorInstance.value = new Editor(options)

      // 创建工具栏
      if (props.showToolbar && editorContainer.value) {
        const toolbarContainer = editorContainer.value.querySelector('.toolbar-container') as HTMLElement
        if (toolbarContainer) {
          toolbarInstance.value = new Toolbar(editorInstance.value, {
            container: toolbarContainer
          })
        }
      }
    }

    // 监听内容变化
    watch(() => props.modelValue, (newValue) => {
      if (editorInstance.value && newValue !== editorInstance.value.getHTML()) {
        editorInstance.value.setHTML(newValue || '')
      }
    })

    // 监听可编辑状态
    watch(() => props.editable, (newValue) => {
      editorInstance.value?.setEditable(newValue)
    })

    // 生命周期
    onMounted(() => {
      initEditor()
    })

    onBeforeUnmount(() => {
      toolbarInstance.value?.destroy()
      editorInstance.value?.destroy()
    })

    // 暴露编辑器实例方法
    expose({
      getEditor: () => editorInstance.value,
      focus: () => editorInstance.value?.focus(),
      blur: () => editorInstance.value?.blur(),
      clear: () => editorInstance.value?.clear(),
      getHTML: () => editorInstance.value?.getHTML(),
      setHTML: (html: string) => editorInstance.value?.setHTML(html),
      getJSON: () => editorInstance.value?.getJSON(),
      setJSON: (json: any) => editorInstance.value?.setJSON(json)
    })

    return () => h('div', { class: 'ldesign-editor-wrapper' }, [
      props.showToolbar && h('div', { class: 'toolbar-container' }),
      h('div', { ref: editorContainer })
    ])
  }
})

/**
 * Vue Composition API Hook
 */
export function useEditor(options: EditorOptions = {}) {
  const editorInstance = ref<Editor>()
  const content = ref(options.content as string || '')

  const init = (element: HTMLElement | string) => {
    editorInstance.value = new Editor({
      ...options,
      element,
      onChange: (html) => {
        content.value = html
        options.onChange?.(html)
      }
    })
  }

  const destroy = () => {
    editorInstance.value?.destroy()
  }

  onBeforeUnmount(() => {
    destroy()
  })

  return {
    editor: editorInstance,
    content,
    init,
    destroy,
    focus: () => editorInstance.value?.focus(),
    blur: () => editorInstance.value?.blur(),
    clear: () => editorInstance.value?.clear(),
    getHTML: () => editorInstance.value?.getHTML(),
    setHTML: (html: string) => editorInstance.value?.setHTML(html),
    getJSON: () => editorInstance.value?.getJSON(),
    setJSON: (json: any) => editorInstance.value?.setJSON(json)
  }
}

// 导出
export default RichEditor

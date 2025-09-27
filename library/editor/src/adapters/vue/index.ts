/**
 * Vue Adapter for Enhanced Rich Text Editor
 * 
 * Provides Vue components and composables for the editor.
 */

import {
  defineComponent,
  ref,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
  h,
  type PropType,
  type Ref
} from 'vue';
import type { EnhancedEditor, EditorOptions, Plugin, Delta as IDelta } from '@/types';
import { EnhancedEditor as Editor } from '@/core/editor';
import { Delta } from '@/core/delta';

/**
 * Vue-specific editor options
 */
export interface VueEditorOptions extends EditorOptions {
  onChange?: (delta: IDelta, oldDelta: IDelta, source: string) => void;
  onSelectionChange?: (range: any, oldRange: any, source: string) => void;
  onTextChange?: (delta: IDelta, oldDelta: IDelta, source: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

/**
 * Enhanced Rich Text Editor Vue Component
 */
export const EnhancedRichEditor = defineComponent({
  name: 'EnhancedRichEditor',
  props: {
    modelValue: {
      type: Object as PropType<IDelta>,
      default: () => new Delta()
    },
    placeholder: {
      type: String,
      default: ''
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    options: {
      type: Object as PropType<EditorOptions>,
      default: () => ({})
    },
    plugins: {
      type: Array as PropType<Plugin[]>,
      default: () => []
    }
  },
  emits: [
    'update:modelValue',
    'text-change',
    'selection-change',
    'focus',
    'blur',
    'ready'
  ],
  setup(props, { emit, expose }) {
    const containerRef = ref<HTMLDivElement>();
    const editorRef = ref<EnhancedEditor | null>(null);

    // Initialize editor
    onMounted(async () => {
      await nextTick();
      
      if (!containerRef.value) return;

      const editor = new Editor(containerRef.value, {
        placeholder: props.placeholder,
        readOnly: props.readOnly,
        ...props.options
      });

      editorRef.value = editor;

      // Install plugins
      props.plugins.forEach(plugin => {
        editor.addPlugin(plugin);
      });

      // Set initial content
      if (props.modelValue) {
        editor.setContents(props.modelValue);
      }

      // Setup event listeners
      editor.on('text-change', (delta: IDelta, oldDelta: IDelta, source: string) => {
        emit('text-change', delta, oldDelta, source);
        emit('update:modelValue', editor.getContents());
      });

      editor.on('selection-change', (range: any, oldRange: any, source: string) => {
        emit('selection-change', range, oldRange, source);
      });

      editor.on('focus', () => {
        emit('focus');
      });

      editor.on('blur', () => {
        emit('blur');
      });

      emit('ready', editor);
    });

    // Cleanup
    onUnmounted(() => {
      if (editorRef.value) {
        editorRef.value.destroy();
        editorRef.value = null;
      }
    });

    // Watch for content changes
    watch(
      () => props.modelValue,
      (newValue) => {
        if (editorRef.value && newValue) {
          const currentContents = editorRef.value.getContents();
          if (!currentContents.isEqual(newValue)) {
            editorRef.value.setContents(newValue, 'silent');
          }
        }
      },
      { deep: true }
    );

    // Watch for readOnly changes
    watch(
      () => props.readOnly,
      (readOnly) => {
        if (editorRef.value) {
          editorRef.value.enable(!readOnly);
        }
      }
    );

    // Watch for plugins changes
    watch(
      () => props.plugins,
      (newPlugins, oldPlugins) => {
        if (!editorRef.value) return;

        // Remove old plugins
        if (oldPlugins) {
          oldPlugins.forEach(plugin => {
            editorRef.value!.removePlugin(plugin.name);
          });
        }

        // Add new plugins
        newPlugins.forEach(plugin => {
          editorRef.value!.addPlugin(plugin);
        });
      },
      { deep: true }
    );

    // Expose editor methods
    expose({
      getEditor: () => editorRef.value,
      focus: () => editorRef.value?.focus(),
      blur: () => editorRef.value?.blur(),
      getContents: () => editorRef.value?.getContents() || new Delta(),
      setContents: (delta: IDelta, source = 'api') => {
        editorRef.value?.setContents(delta, source);
      },
      getText: () => editorRef.value?.getText() || '',
      getLength: () => editorRef.value?.getLength() || 0,
      insertText: (index: number, text: string, source = 'api') => {
        editorRef.value?.insertText(index, text, source);
      },
      deleteText: (index: number, length: number, source = 'api') => {
        editorRef.value?.deleteText(index, length, source);
      },
      formatText: (index: number, length: number, format: string, value: any, source = 'api') => {
        editorRef.value?.formatText(index, length, format, value, source);
      },
      getSelection: () => editorRef.value?.getSelection(),
      setSelection: (range: any, source = 'api') => {
        editorRef.value?.setSelection(range, source);
      }
    });

    return {
      containerRef
    };
  },
  render() {
    return h('div', { ref: 'containerRef' }, this.$slots.default?.());
  }
});

/**
 * Composable for using the editor
 */
export function useEditor(options?: EditorOptions) {
  const editorRef = ref<EnhancedEditor | null>(null);
  const containerRef = ref<HTMLDivElement | null>(null);

  const createEditor = (container: HTMLDivElement) => {
    if (editorRef.value) {
      editorRef.value.destroy();
    }

    editorRef.value = new Editor(container, options);
    containerRef.value = container;
    
    return editorRef.value;
  };

  const destroyEditor = () => {
    if (editorRef.value) {
      editorRef.value.destroy();
      editorRef.value = null;
      containerRef.value = null;
    }
  };

  onUnmounted(() => {
    destroyEditor();
  });

  return {
    editor: editorRef,
    container: containerRef,
    createEditor,
    destroyEditor
  };
}

/**
 * Composable for editor content
 */
export function useEditorContent(editor: Ref<EnhancedEditor | null>, initialContent?: IDelta) {
  const content = ref<IDelta>(initialContent || new Delta());

  watch(
    editor,
    (newEditor, oldEditor) => {
      if (oldEditor) {
        oldEditor.off('text-change', handleTextChange);
      }

      if (newEditor) {
        newEditor.on('text-change', handleTextChange);
        content.value = newEditor.getContents();
      }
    },
    { immediate: true }
  );

  const handleTextChange = () => {
    if (editor.value) {
      content.value = editor.value.getContents();
    }
  };

  const updateContent = (newContent: IDelta, source = 'api') => {
    if (editor.value) {
      editor.value.setContents(newContent, source);
    }
  };

  return {
    content,
    updateContent
  };
}

/**
 * Composable for editor selection
 */
export function useEditorSelection(editor: Ref<EnhancedEditor | null>) {
  const selection = ref<any>(null);

  watch(
    editor,
    (newEditor, oldEditor) => {
      if (oldEditor) {
        oldEditor.off('selection-change', handleSelectionChange);
      }

      if (newEditor) {
        newEditor.on('selection-change', handleSelectionChange);
        selection.value = newEditor.getSelection();
      }
    },
    { immediate: true }
  );

  const handleSelectionChange = (range: any) => {
    selection.value = range;
  };

  const updateSelection = (range: any, source = 'api') => {
    if (editor.value) {
      editor.value.setSelection(range, source);
    }
  };

  return {
    selection,
    updateSelection
  };
}

/**
 * Composable for managing editor plugins
 */
export function useEditorPlugins(editor: Ref<EnhancedEditor | null>, plugins: Ref<Plugin[]>) {
  watch(
    [editor, plugins],
    ([newEditor, newPlugins], [oldEditor, oldPlugins]) => {
      if (oldEditor && oldPlugins) {
        oldPlugins.forEach(plugin => {
          oldEditor.removePlugin(plugin.name);
        });
      }

      if (newEditor && newPlugins) {
        newPlugins.forEach(plugin => {
          newEditor.addPlugin(plugin);
        });
      }
    },
    { immediate: true, deep: true }
  );
}

/**
 * Default export
 */
export default EnhancedRichEditor;

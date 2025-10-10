/**
 * Vue 适配器
 */
import {
  defineComponent,
  ref,
  onMounted,
  onUnmounted,
  watch,
  PropType,
  h,
} from 'vue';
import { ApprovalFlowEditor } from './core/ApprovalFlowEditor';
import {
  EditorConfig,
  EditorEvents,
  FlowChartData,
  NodeData,
  EdgeData,
} from './types';

/**
 * Vue 组件 Props
 */
export interface ApprovalFlowProps {
  /** 编辑器配置 */
  config?: Partial<Omit<EditorConfig, 'container'>>;
  /** 流程图数据 */
  data?: FlowChartData;
  /** 是否只读 */
  readonly?: boolean;
  /** 宽度 */
  width?: number | string;
  /** 高度 */
  height?: number | string;
}

/**
 * ApprovalFlow Vue 组件
 */
export const ApprovalFlow = defineComponent({
  name: 'ApprovalFlow',
  props: {
    config: {
      type: Object as PropType<Partial<Omit<EditorConfig, 'container'>>>,
      default: () => ({}),
    },
    data: {
      type: Object as PropType<FlowChartData>,
      default: () => ({ nodes: [], edges: [] }),
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    width: {
      type: [Number, String] as PropType<number | string>,
      default: '100%',
    },
    height: {
      type: [Number, String] as PropType<number | string>,
      default: '600px',
    },
  },
  emits: [
    'node:click',
    'node:dblclick',
    'node:add',
    'node:delete',
    'node:update',
    'edge:click',
    'edge:add',
    'edge:delete',
    'data:change',
    'canvas:zoom',
    'selection:change',
  ],
  setup(props, { emit, expose }) {
    const containerRef = ref<HTMLDivElement>();
    const editorRef = ref<ApprovalFlowEditor>();

    onMounted(() => {
      if (!containerRef.value) return;

      // 创建编辑器实例
      const editor = new ApprovalFlowEditor({
        container: containerRef.value,
        readonly: props.readonly,
        width: props.width,
        height: props.height,
        ...props.config,
      });

      // 绑定事件
      const events: EditorEvents = {
        'node:click': (data: NodeData) => emit('node:click', data),
        'node:dblclick': (data: NodeData) => emit('node:dblclick', data),
        'node:add': (data: NodeData) => emit('node:add', data),
        'node:delete': (data: NodeData) => emit('node:delete', data),
        'node:update': (data: NodeData) => emit('node:update', data),
        'edge:click': (data: EdgeData) => emit('edge:click', data),
        'edge:add': (data: EdgeData) => emit('edge:add', data),
        'edge:delete': (data: EdgeData) => emit('edge:delete', data),
        'data:change': (data: FlowChartData) => emit('data:change', data),
        'canvas:zoom': (zoom: number) => emit('canvas:zoom', zoom),
        'selection:change': (selection) => emit('selection:change', selection),
      };

      Object.entries(events).forEach(([event, handler]) => {
        editor.on(event as keyof EditorEvents, handler);
      });

      // 设置初始数据
      if (props.data && (props.data.nodes.length > 0 || props.data.edges.length > 0)) {
        editor.setData(props.data);
      }

      editorRef.value = editor;
    });

    onUnmounted(() => {
      if (editorRef.value) {
        editorRef.value.destroy();
      }
    });

    // 监听数据变化
    watch(
      () => props.data,
      (newData) => {
        if (editorRef.value && newData) {
          editorRef.value.setData(newData);
        }
      },
      { deep: true }
    );

    // 监听只读状态变化
    watch(
      () => props.readonly,
      (newReadonly) => {
        if (editorRef.value) {
          editorRef.value.setReadonly(newReadonly);
        }
      }
    );

    // 暴露方法给父组件
    expose({
      /**
       * 获取编辑器实例
       */
      getEditor: () => editorRef.value,
      /**
       * 获取流程图数据
       */
      getData: () => editorRef.value?.getData(),
      /**
       * 设置流程图数据
       */
      setData: (data: FlowChartData) => editorRef.value?.setData(data),
      /**
       * 添加节点
       */
      addNode: (node: any) => editorRef.value?.addNode(node),
      /**
       * 更新节点
       */
      updateNode: (nodeId: string, data: Partial<NodeData>) =>
        editorRef.value?.updateNode(nodeId, data),
      /**
       * 删除节点
       */
      deleteNode: (nodeId: string) => editorRef.value?.deleteNode(nodeId),
      /**
       * 验证流程图
       */
      validate: () => editorRef.value?.validate(),
      /**
       * 缩放
       */
      zoom: (scale?: number) => editorRef.value?.zoom(scale),
      /**
       * 放大
       */
      zoomIn: () => editorRef.value?.zoomIn(),
      /**
       * 缩小
       */
      zoomOut: () => editorRef.value?.zoomOut(),
      /**
       * 适应画布
       */
      fit: () => editorRef.value?.fit(),
      /**
       * 重置缩放
       */
      resetZoom: () => editorRef.value?.resetZoom(),
      /**
       * 撤销
       */
      undo: () => editorRef.value?.undo(),
      /**
       * 重做
       */
      redo: () => editorRef.value?.redo(),
      /**
       * 导出
       */
      export: (config: any) => editorRef.value?.export(config),
      /**
       * 清空
       */
      clear: () => editorRef.value?.clear(),
    });

    return () =>
      h('div', {
        ref: containerRef,
        class: 'approval-flow-container',
        style: {
          width: typeof props.width === 'number' ? `${props.width}px` : props.width,
          height: typeof props.height === 'number' ? `${props.height}px` : props.height,
        },
      });
  },
});

/**
 * Vue Composition API Hook
 */
export function useApprovalFlow(config: EditorConfig) {
  const editorRef = ref<ApprovalFlowEditor>();

  onMounted(() => {
    editorRef.value = new ApprovalFlowEditor(config);
  });

  onUnmounted(() => {
    if (editorRef.value) {
      editorRef.value.destroy();
    }
  });

  return {
    editor: editorRef,
    getData: () => editorRef.value?.getData(),
    setData: (data: FlowChartData) => editorRef.value?.setData(data),
    addNode: (node: any) => editorRef.value?.addNode(node),
    updateNode: (nodeId: string, data: Partial<NodeData>) =>
      editorRef.value?.updateNode(nodeId, data),
    deleteNode: (nodeId: string) => editorRef.value?.deleteNode(nodeId),
    validate: () => editorRef.value?.validate(),
    zoom: (scale?: number) => editorRef.value?.zoom(scale),
    zoomIn: () => editorRef.value?.zoomIn(),
    zoomOut: () => editorRef.value?.zoomOut(),
    fit: () => editorRef.value?.fit(),
    resetZoom: () => editorRef.value?.resetZoom(),
    undo: () => editorRef.value?.undo(),
    redo: () => editorRef.value?.redo(),
    export: (config: any) => editorRef.value?.export(config),
    clear: () => editorRef.value?.clear(),
  };
}

export default ApprovalFlow;

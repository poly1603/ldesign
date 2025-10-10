/**
 * React 适配器
 */
import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
} from 'react';
import { ApprovalFlowEditor } from './core/ApprovalFlowEditor';
import {
  EditorConfig,
  EditorEvents,
  FlowChartData,
  NodeData,
  EdgeData,
} from './types';

/**
 * React 组件 Props
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
  /** 节点点击事件 */
  onNodeClick?: (data: NodeData) => void;
  /** 节点双击事件 */
  onNodeDblClick?: (data: NodeData) => void;
  /** 节点添加事件 */
  onNodeAdd?: (data: NodeData) => void;
  /** 节点删除事件 */
  onNodeDelete?: (data: NodeData) => void;
  /** 节点更新事件 */
  onNodeUpdate?: (data: NodeData) => void;
  /** 边点击事件 */
  onEdgeClick?: (data: EdgeData) => void;
  /** 边添加事件 */
  onEdgeAdd?: (data: EdgeData) => void;
  /** 边删除事件 */
  onEdgeDelete?: (data: EdgeData) => void;
  /** 数据变化事件 */
  onDataChange?: (data: FlowChartData) => void;
  /** 画布缩放事件 */
  onCanvasZoom?: (zoom: number) => void;
  /** 选中变化事件 */
  onSelectionChange?: (selection: { nodes: NodeData[]; edges: EdgeData[] }) => void;
  /** 样式 */
  style?: React.CSSProperties;
  /** 类名 */
  className?: string;
}

/**
 * Ref 方法
 */
export interface ApprovalFlowRef {
  /** 获取编辑器实例 */
  getEditor: () => ApprovalFlowEditor | undefined;
  /** 获取流程图数据 */
  getData: () => FlowChartData | undefined;
  /** 设置流程图数据 */
  setData: (data: FlowChartData) => void;
  /** 添加节点 */
  addNode: (node: any) => string | undefined;
  /** 更新节点 */
  updateNode: (nodeId: string, data: Partial<NodeData>) => void;
  /** 删除节点 */
  deleteNode: (nodeId: string) => void;
  /** 验证流程图 */
  validate: () => any;
  /** 缩放 */
  zoom: (scale?: number) => void;
  /** 放大 */
  zoomIn: () => void;
  /** 缩小 */
  zoomOut: () => void;
  /** 适应画布 */
  fit: () => void;
  /** 重置缩放 */
  resetZoom: () => void;
  /** 撤销 */
  undo: () => void;
  /** 重做 */
  redo: () => void;
  /** 导出 */
  export: (config: any) => Promise<any>;
  /** 清空 */
  clear: () => void;
}

/**
 * ApprovalFlow React 组件
 */
const ApprovalFlowComponent: ForwardRefRenderFunction<
  ApprovalFlowRef,
  ApprovalFlowProps
> = (props, ref) => {
  const {
    config = {},
    data,
    readonly = false,
    width = '100%',
    height = '600px',
    onNodeClick,
    onNodeDblClick,
    onNodeAdd,
    onNodeDelete,
    onNodeUpdate,
    onEdgeClick,
    onEdgeAdd,
    onEdgeDelete,
    onDataChange,
    onCanvasZoom,
    onSelectionChange,
    style,
    className,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<ApprovalFlowEditor>();

  // 初始化编辑器
  useEffect(() => {
    if (!containerRef.current) return;

    const editor = new ApprovalFlowEditor({
      container: containerRef.current,
      readonly,
      width,
      height,
      ...config,
    });

    // 绑定事件
    const events: EditorEvents = {
      'node:click': onNodeClick,
      'node:dblclick': onNodeDblClick,
      'node:add': onNodeAdd,
      'node:delete': onNodeDelete,
      'node:update': onNodeUpdate,
      'edge:click': onEdgeClick,
      'edge:add': onEdgeAdd,
      'edge:delete': onEdgeDelete,
      'data:change': onDataChange,
      'canvas:zoom': onCanvasZoom,
      'selection:change': onSelectionChange,
    };

    Object.entries(events).forEach(([event, handler]) => {
      if (handler) {
        editor.on(event as keyof EditorEvents, handler);
      }
    });

    // 设置初始数据
    if (data && (data.nodes.length > 0 || data.edges.length > 0)) {
      editor.setData(data);
    }

    editorRef.current = editor;

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
      }
    };
  }, []);

  // 更新数据
  useEffect(() => {
    if (editorRef.current && data) {
      editorRef.current.setData(data);
    }
  }, [data]);

  // 更新只读状态
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setReadonly(readonly);
    }
  }, [readonly]);

  // 暴露方法
  useImperativeHandle(ref, () => ({
    getEditor: () => editorRef.current,
    getData: () => editorRef.current?.getData(),
    setData: (data: FlowChartData) => editorRef.current?.setData(data),
    addNode: (node: any) => editorRef.current?.addNode(node),
    updateNode: (nodeId: string, data: Partial<NodeData>) =>
      editorRef.current?.updateNode(nodeId, data),
    deleteNode: (nodeId: string) => editorRef.current?.deleteNode(nodeId),
    validate: () => editorRef.current?.validate(),
    zoom: (scale?: number) => editorRef.current?.zoom(scale),
    zoomIn: () => editorRef.current?.zoomIn(),
    zoomOut: () => editorRef.current?.zoomOut(),
    fit: () => editorRef.current?.fit(),
    resetZoom: () => editorRef.current?.resetZoom(),
    undo: () => editorRef.current?.undo(),
    redo: () => editorRef.current?.redo(),
    export: (config: any) => editorRef.current?.export(config),
    clear: () => editorRef.current?.clear(),
  }));

  return (
    <div
      ref={containerRef}
      className={`approval-flow-container ${className || ''}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
    />
  );
};

export const ApprovalFlow = forwardRef(ApprovalFlowComponent);

/**
 * React Hook
 */
export function useApprovalFlow(config: EditorConfig) {
  const editorRef = useRef<ApprovalFlowEditor>();

  useEffect(() => {
    editorRef.current = new ApprovalFlowEditor(config);

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
      }
    };
  }, []);

  return {
    editor: editorRef.current,
    getData: () => editorRef.current?.getData(),
    setData: (data: FlowChartData) => editorRef.current?.setData(data),
    addNode: (node: any) => editorRef.current?.addNode(node),
    updateNode: (nodeId: string, data: Partial<NodeData>) =>
      editorRef.current?.updateNode(nodeId, data),
    deleteNode: (nodeId: string) => editorRef.current?.deleteNode(nodeId),
    validate: () => editorRef.current?.validate(),
    zoom: (scale?: number) => editorRef.current?.zoom(scale),
    zoomIn: () => editorRef.current?.zoomIn(),
    zoomOut: () => editorRef.current?.zoomOut(),
    fit: () => editorRef.current?.fit(),
    resetZoom: () => editorRef.current?.resetZoom(),
    undo: () => editorRef.current?.undo(),
    redo: () => editorRef.current?.redo(),
    export: (config: any) => editorRef.current?.export(config),
    clear: () => editorRef.current?.clear(),
  };
}

export default ApprovalFlow;

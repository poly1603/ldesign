/**
 * 低代码编辑器 Composable
 */

import { ref, computed, readonly } from 'vue';
import { SchemaManager } from '../core/schema/schema-manager';
import { LayoutManager } from '../core/layout/layout-manager';
import { CanvasManager } from '../editor/canvas/canvas-manager';
import { DragDropHandler } from '../editor/canvas/drag-drop-handler';
import { HistoryManager } from '../editor/history/history-manager';
import { VueCodeGenerator } from '../core/code-generator/vue-generator';
import { MaterialRegistry } from '../materials/material-registry';
import { DataSourceManager } from '../datasource/datasource-manager';
import type { LowcodeSchema, ComponentNode, CodeGeneratorOptions } from '../types';

/**
 * 使用低代码编辑器
 */
export function useLowcodeEditor(initialSchema?: LowcodeSchema) {
  // 核心管理器
  const schemaManager = new SchemaManager(initialSchema);
  const layoutManager = new LayoutManager();
  const canvasManager = new CanvasManager(schemaManager, layoutManager);
  const dragDropHandler = new DragDropHandler(canvasManager);
  const historyManager = new HistoryManager();
  const codeGenerator = new VueCodeGenerator();
  const materialRegistry = new MaterialRegistry();
  const datasourceManager = new DataSourceManager();

  // 响应式状态
  const schema = ref<LowcodeSchema>(schemaManager.getSchema());
  const selectedIds = ref<string[]>([]);
  const hoveredId = ref<string | null>(null);
  const editorMode = ref<'design' | 'preview' | 'code'>('design');
  const canvasScale = ref(1);
  const showGrid = ref(true);

  // 监听 Schema 变化
  schemaManager.on('change', (newSchema: LowcodeSchema) => {
    schema.value = newSchema;
    // 保存到历史
    historyManager.push(newSchema);
  });

  // 计算属性
  const selectedComponent = computed(() => {
    if (selectedIds.value.length !== 1) return null;
    return schemaManager.findComponent(selectedIds.value[0]);
  });

  const canUndo = computed(() => historyManager.canUndo());
  const canRedo = computed(() => historyManager.canRedo());

  /**
   * 添加组件
   */
  function addComponent(component: ComponentNode, parentId?: string) {
    schemaManager.addComponent(component, parentId);
  }

  /**
   * 更新组件
   */
  function updateComponent(id: string, updates: Partial<ComponentNode>) {
    schemaManager.updateComponent(id, updates);
  }

  /**
   * 删除组件
   */
  function deleteComponent(id: string) {
    schemaManager.deleteComponent(id);
    selectedIds.value = selectedIds.value.filter(sid => sid !== id);
  }

  /**
   * 选择组件
   */
  function selectComponent(id: string, multi = false) {
    canvasManager.selectComponent(id, multi);
    selectedIds.value = canvasManager.getState().selectedIds;
  }

  /**
   * 清空选择
   */
  function clearSelection() {
    canvasManager.clearSelection();
    selectedIds.value = [];
  }

  /**
   * 撤销
   */
  function undo() {
    const prevSchema = historyManager.undo();
    if (prevSchema) {
      schemaManager.setSchema(prevSchema);
    }
  }

  /**
   * 重做
   */
  function redo() {
    const nextSchema = historyManager.redo();
    if (nextSchema) {
      schemaManager.setSchema(nextSchema);
    }
  }

  /**
   * 导出代码
   */
  function exportCode(options?: Partial<CodeGeneratorOptions>) {
    return codeGenerator.generate(schema.value, options);
  }

  /**
   * 导入 Schema
   */
  function importSchema(newSchema: LowcodeSchema) {
    schemaManager.importSchema(newSchema);
  }

  /**
   * 保存 Schema
   */
  function saveSchema() {
    return schemaManager.exportSchema();
  }

  /**
   * 清空画布
   */
  function clearCanvas() {
    schemaManager.clear();
    clearSelection();
  }

  /**
   * 设置编辑模式
   */
  function setMode(mode: 'design' | 'preview' | 'code') {
    editorMode.value = mode;
    canvasManager.setMode(mode);
  }

  /**
   * 设置缩放
   */
  function setScale(scale: number) {
    canvasScale.value = scale;
    canvasManager.setScale(scale);
  }

  /**
   * 切换网格
   */
  function toggleGrid() {
    showGrid.value = !showGrid.value;
    canvasManager.toggleGrid();
  }

  return {
    // 状态
    schema: readonly(schema),
    selectedIds: readonly(selectedIds),
    hoveredId: readonly(hoveredId),
    selectedComponent,
    editorMode: readonly(editorMode),
    canvasScale: readonly(canvasScale),
    showGrid: readonly(showGrid),
    canUndo,
    canRedo,

    // 管理器实例
    schemaManager,
    layoutManager,
    canvasManager,
    dragDropHandler,
    historyManager,
    codeGenerator,
    materialRegistry,
    datasourceManager,

    // 方法
    addComponent,
    updateComponent,
    deleteComponent,
    selectComponent,
    clearSelection,
    undo,
    redo,
    exportCode,
    importSchema,
    saveSchema,
    clearCanvas,
    setMode,
    setScale,
    toggleGrid
  };
}

export type UseLowcodeEditor = ReturnType<typeof useLowcodeEditor>;




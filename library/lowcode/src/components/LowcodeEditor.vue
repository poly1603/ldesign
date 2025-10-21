<template>
  <div class="lowcode-editor">
    <!-- 顶部工具栏 -->
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <button class="tool-button" @click="handleSave" :title="t('editor.toolbar.save')">
          <Icon name="Save" :size="16" />
          <span>{{ t('editor.toolbar.save') }}</span>
        </button>
        <button class="tool-button" :disabled="!canUndo" @click="handleUndo" :title="t('editor.toolbar.undo')">
          <Icon name="Undo" :size="16" />
        </button>
        <button class="tool-button" :disabled="!canRedo" @click="handleRedo" :title="t('editor.toolbar.redo')">
          <Icon name="Redo" :size="16" />
        </button>
        <button class="tool-button" @click="handleClear" :title="t('editor.toolbar.clear')">
          <Icon name="Trash2" :size="16" />
        </button>
        <div class="toolbar-divider"></div>
        <button class="tool-button" @click="toggleGrid" :title="t('editor.toolbar.grid')">
          <Icon name="Grid3x3" :size="16" />
        </button>
      </div>
      
      <div class="toolbar-center">
        <span class="editor-title">{{ t('editor.title') }}</span>
      </div>
      
      <div class="toolbar-right">
        <button class="tool-button" @click="handlePreview" :title="t('editor.toolbar.preview')">
          <Icon name="Eye" :size="16" />
        </button>
        <button class="tool-button" @click="handleExport" :title="t('editor.toolbar.export')">
          <Icon name="Download" :size="16" />
          <span>{{ t('editor.toolbar.export') }}</span>
        </button>
        
        <div class="toolbar-divider"></div>
        
        <!-- 设备切换 -->
        <div class="device-switcher">
          <button 
            v-for="device in devices"
            :key="device.value"
            class="device-btn"
            :class="{ active: currentDevice === device.value }"
            @click="handleDeviceChange(device.value)"
            :title="t(`editor.device.${device.value}`)"
          >
            <Icon :name="device.icon" :size="16" />
          </button>
        </div>
        
        <div class="toolbar-divider"></div>
        
        <!-- 主题切换 -->
        <button class="tool-button" @click="toggleThemeMode" :title="t('editor.theme.mode')">
          <Icon :name="themeConfig.mode === 'light' ? 'Sun' : 'Moon'" :size="16" />
        </button>
        
        <!-- 语言切换 -->
        <select v-model="currentLocale" @change="handleLocaleChange" class="locale-select">
          <option v-for="option in localeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        
        <!-- 设置 -->
        <button class="tool-button" @click="showSettings = true" :title="t('editor.toolbar.settings')">
          <Icon name="Settings" :size="16" />
        </button>
      </div>
    </div>
    
    <!-- 主体区域 -->
    <div class="editor-body">
      <!-- 左侧面板 -->
      <div class="left-sidebar">
        <!-- 面板切换标签 -->
        <div class="sidebar-tabs">
          <button
            class="tab-btn"
            :class="{ active: leftPanel === 'materials' }"
            @click="leftPanel = 'materials'"
            :title="t('editor.material.title')"
          >
            <Icon name="Box" :size="18" />
          </button>
          <button
            class="tab-btn"
            :class="{ active: leftPanel === 'outline' }"
            @click="leftPanel = 'outline'"
            :title="t('editor.outline.title')"
          >
            <Icon name="Layers" :size="18" />
          </button>
        </div>
        
        <!-- 物料面板 -->
        <div v-show="leftPanel === 'materials'" class="material-panel">
          <div class="panel-header">
            <h3>{{ t('editor.material.title') }}</h3>
            <input 
              v-model="materialSearch" 
              type="text" 
              :placeholder="t('editor.material.search')"
              class="search-input"
            >
            <Icon name="Search" :size="16" class="search-icon" />
          </div>
          
          <div class="panel-body">
            <div v-for="category in materialCategories" :key="category" class="material-category">
              <h4>{{ category }}</h4>
              <div class="material-list">
                <div
                  v-for="material in getMaterialsByCategory(category)"
                  :key="material.name"
                  class="material-item"
                  draggable="true"
                  @dragstart="handleMaterialDragStart(material, $event)"
                >
                  <Icon :name="getComponentIcon(material.name)" :size="20" class="material-icon" />
                  <div class="material-title">{{ material.title }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 组件树面板 -->
        <OutlinePanel
          v-show="leftPanel === 'outline'"
          :components="(schema.components || []) as any"
          :selected-id="selectedIds[0]"
          @select="handleComponentSelect"
          @delete="handleComponentDelete"
        />
      </div>
      
      <!-- 中间画布区域 -->
      <div class="canvas-area">
        <div 
          class="canvas-container"
          :class="{ 'show-grid': showGrid }"
          @drop="handleCanvasDrop"
          @dragover="handleCanvasDragOver"
          @dragleave="handleCanvasDragLeave"
        >
          <div class="canvas-content" :style="canvasStyle">
            <div 
              v-for="component in schema.components" 
              :key="component.id"
              :data-component-id="component.id"
              :class="{ 
                'component-wrapper': true,
                'component-selected': selectedIds.includes(component.id),
                'component-hovered': hoveredId === component.id
              }"
              :style="getComponentStyle(component)"
              @click.stop="handleComponentClick(component.id, $event)"
              @mouseenter="hoveredId = component.id"
              @mouseleave="hoveredId = null"
            >
              <component 
                :is="getComponentType(component.type)"
                v-bind="component.props"
              >
                {{ component.props.text || component.type }}
              </component>
            </div>
            
            <!-- 空状态提示 -->
            <div v-if="schema.components.length === 0" class="empty-state">
              <Icon name="Box" :size="64" class="empty-icon" />
              <div class="empty-text">{{ t('editor.material.search') }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧面板 -->
      <div class="right-sidebar">
        <!-- 面板切换标签 -->
        <div class="sidebar-tabs">
          <button
            class="tab-btn"
            :class="{ active: rightPanel === 'properties' }"
            @click="rightPanel = 'properties'"
            :title="t('editor.property.title')"
          >
            <Icon name="Settings" :size="18" />
          </button>
          <button
            class="tab-btn"
            :class="{ active: rightPanel === 'datasource' }"
            @click="rightPanel = 'datasource'"
            :title="t('editor.datasource.title')"
          >
            <Icon name="Database" :size="18" />
          </button>
        </div>
        
        <!-- 属性面板 -->
        <div v-show="rightPanel === 'properties'" class="property-panel">
          <div class="panel-header">
            <h3>{{ t('editor.property.title') }}</h3>
          </div>
          
          <div v-if="selectedComponent" class="panel-body">
            <!-- 基础信息 -->
            <div class="property-group">
              <div class="group-header">
                <Icon name="Info" :size="16" />
                <span>{{ t('component.type') }}</span>
              </div>
              <div class="group-content">
                <div class="property-item">
                  <label>{{ t('component.type') }}</label>
                  <input type="text" :value="selectedComponent.type" disabled />
                </div>
                <div class="property-item">
                  <label>{{ t('component.id') }}</label>
                  <input type="text" :value="selectedComponent.id" disabled />
                </div>
              </div>
            </div>
            
            <!-- 属性配置 -->
            <div class="property-group">
              <div class="group-header">
                <Icon name="Edit" :size="16" />
                <span>{{ t('editor.property.props') }}</span>
              </div>
              <div class="group-content">
                <div v-for="(value, key) in selectedComponent.props" :key="key" class="property-item">
                  <label>{{ key }}</label>
                  <input 
                    :type="typeof value === 'number' ? 'number' : 'text'"
                    :value="value"
                    @input="handlePropChange(key, ($event.target as HTMLInputElement).value)"
                  />
                </div>
                
                <!-- 添加新属性 -->
                <button @click="handleAddProp" class="add-button">
                  <Icon name="Plus" :size="14" />
                  <span>{{ t('common.add') }}</span>
                </button>
              </div>
            </div>
            
            <!-- 布局配置 -->
            <div class="property-group">
              <div class="group-header">
                <Icon name="Layout" :size="16" />
                <span>{{ t('editor.property.layout') }}</span>
              </div>
              <div class="group-content">
                <div class="property-item">
                  <label>{{ t('layout.grid') }}</label>
                  <select v-model="selectedComponent.layout.type">
                    <option value="grid">Grid {{ t('layout.grid') }}</option>
                    <option value="flex">Flex {{ t('layout.flex') }}</option>
                  </select>
                </div>
                <div v-if="selectedComponent.layout.type === 'grid'" class="property-item">
                  <label>{{ t('layout.span') }} (1-12)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="12"
                    :value="getGridSpan(selectedComponent.layout.gridColumn)"
                    @input="handleGridSpanChange(($event.target as HTMLInputElement).value)"
                  />
                </div>
              </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="property-actions">
              <button @click="handleDeleteComponent" class="delete-button">
                <Icon name="Trash2" :size="16" />
                <span>{{ t('common.delete') }}</span>
              </button>
            </div>
          </div>
          
          <div v-else class="empty-state-panel">
            <Icon name="MousePointer" :size="48" class="empty-icon" />
            <div class="empty-text">{{ t('editor.property.noSelection') }}</div>
          </div>
        </div>
        
        <!-- 数据源面板 -->
        <DataSourcePanel
          v-show="rightPanel === 'datasource'"
          :datasources="datasources"
          @add="handleAddDatasource"
          @edit="handleEditDatasource"
          @delete="handleDeleteDatasource"
          @select="handleSelectDatasource"
        />
      </div>
    </div>
    
    <!-- 底部状态栏 -->
    <div class="status-bar">
      <span>{{ t('component.id') }}: {{ schema.components.length }}</span>
      <span class="status-divider">|</span>
      <span>{{ t('editor.device.desktop') }}: {{ currentDevice }}</span>
      <span class="status-divider">|</span>
      <span>{{ t('editor.toolbar.grid') }}: {{ showGrid ? t('common.ok') : t('common.cancel') }}</span>
      <span class="status-divider">|</span>
      <span>{{ t('editor.theme.mode') }}: {{ t(`editor.theme.${themeConfig.mode}`) }}</span>
    </div>
    
    <!-- 代码导出对话框 -->
    <div v-if="showExportDialog" class="export-dialog-overlay" @click="showExportDialog = false">
      <div class="export-dialog" @click.stop>
        <div class="dialog-header">
          <h3>{{ t('editor.code.title') }}</h3>
          <button @click="showExportDialog = false" class="close-btn">
            <Icon name="X" :size="20" />
          </button>
        </div>
        <div class="dialog-body">
          <div class="code-options">
            <label>
              <input type="radio" v-model="exportApiStyle" value="composition" />
              {{ t('editor.code.composition') }}
            </label>
            <label>
              <input type="radio" v-model="exportApiStyle" value="options" />
              {{ t('editor.code.options') }}
            </label>
          </div>
          <pre class="code-preview"><code>{{ generatedCode }}</code></pre>
        </div>
        <div class="dialog-footer">
          <button @click="handleCopyCode" class="primary-button">
            <Icon name="Copy" :size="16" />
            <span>{{ t('editor.code.copy') }}</span>
          </button>
          <button @click="handleDownloadCode" class="secondary-button">
            <Icon name="Download" :size="16" />
            <span>{{ t('editor.code.download') }}</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 设置对话框 -->
    <SettingsPanel
      v-if="showSettings"
      :show-grid="showGrid"
      @close="showSettings = false"
      @toggle-grid="toggleGrid"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useLowcodeEditor } from '../composables/useLowcodeEditor';
import { useTheme } from '../composables/useTheme';
import { useI18n, type Locale } from '../composables/useI18n';
import { useShortcuts, createEditorShortcuts } from '../composables/useShortcuts';
import type { Material, ComponentNode, DataSource } from '../types';
import Icon from './Icon.vue';
import OutlinePanel from './OutlinePanel.vue';
import DataSourcePanel from './DataSourcePanel.vue';
import SettingsPanel from './SettingsPanel.vue';

// 编辑器实例
const editor = useLowcodeEditor();

// 主题管理
const { themeConfig, toggleThemeMode } = useTheme();

// 国际化管理
const { locale, localeOptions, setLocale, t } = useI18n();
const currentLocale = ref<Locale>(locale.value);

// 本地状态
const materialSearch = ref('');
const currentDevice = ref<'desktop' | 'tablet' | 'mobile'>('desktop');
const hoveredId = ref<string | null>(null);
const showExportDialog = ref(false);
const showSettings = ref(false);
const exportApiStyle = ref<'composition' | 'options'>('composition');
const generatedCode = ref('');
const leftPanel = ref<'materials' | 'outline'>('materials');
const rightPanel = ref<'properties' | 'datasource'>('properties');

// 从编辑器获取响应式状态
const schema = editor.schema;
const selectedIds = ref<string[]>([]);
const selectedComponent = computed(() => editor.selectedComponent.value);
const canUndo = editor.canUndo;
const canRedo = editor.canRedo;
const showGrid = editor.showGrid;

// 数据源（临时数据）
const datasources = ref<DataSource[]>([]);

// 设备配置
const devices = [
  { value: 'desktop' as const, icon: 'Monitor' },
  { value: 'tablet' as const, icon: 'Tablet' },
  { value: 'mobile' as const, icon: 'Smartphone' }
];

// 初始化物料
const builtInMaterials: Material[] = [
  {
    name: 'LButton',
    title: '按钮',
    category: '基础组件',
    icon: 'MousePointer',
    component: {} as any, // 临时使用 any，实际应该是 Vue Component
    props: [
      { name: 'text', label: '按钮文字', type: 'string', default: '按钮' }
    ],
    events: [],
    defaultProps: { text: '按钮' }
  },
  {
    name: 'LInput',
    title: '输入框',
    category: '表单组件',
    icon: 'Type',
    component: {} as any,
    props: [
      { name: 'placeholder', label: '占位符', type: 'string', default: '请输入' }
    ],
    events: [],
    defaultProps: { placeholder: '请输入' }
  },
  {
    name: 'LText',
    title: '文本',
    category: '基础组件',
    icon: 'Type',
    component: {} as any,
    props: [
      { name: 'text', label: '文本内容', type: 'string', default: '文本' }
    ],
    events: [],
    defaultProps: { text: '文本' }
  }
];

// 注册物料
builtInMaterials.forEach(material => {
  editor.materialRegistry.register(material);
});

const materialCategories = computed(() => {
  return editor.materialRegistry.getCategories().map(cat => cat.name);
});

function getMaterialsByCategory(category: string) {
  const materials = editor.materialRegistry.getByCategory(category);
  if (materialSearch.value) {
    return materials.filter(m => 
      m.title.includes(materialSearch.value) || 
      m.name.toLowerCase().includes(materialSearch.value.toLowerCase())
    );
  }
  return materials;
}

// 画布样式
const canvasStyle = computed(() => {
  const sizes = {
    desktop: { width: '100%', minHeight: '600px' },
    tablet: { width: '768px', minHeight: '1024px', margin: '0 auto' },
    mobile: { width: '375px', minHeight: '667px', margin: '0 auto' }
  };
  return {
    ...sizes[currentDevice.value],
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gap: '16px',
    padding: '20px',
    background: 'var(--bg-secondary)'
  };
});

// 获取组件图标
function getComponentIcon(type: string): string {
  const iconMap: Record<string, string> = {
    'LButton': 'MousePointer',
    'LInput': 'Type',
    'LText': 'Type',
    'LImage': 'Image',
    'LTable': 'Table',
    'LList': 'List',
    'LContainer': 'Box',
    'LLayout': 'Layout'
  };
  return iconMap[type] || 'Box';
}

// 获取组件样式
function getComponentStyle(component: ComponentNode) {
  return editor.layoutManager.generateComponentStyle(component.layout);
}

// 获取组件类型（映射到实际的 HTML 元素）
function getComponentType(type: string) {
  const typeMap: Record<string, string> = {
    'LButton': 'button',
    'LInput': 'input',
    'LText': 'div'
  };
  return typeMap[type] || 'div';
}

// 获取 Grid span 值
function getGridSpan(gridColumn?: string): number {
  if (!gridColumn) return 12;
  const match = gridColumn.match(/span\s+(\d+)/);
  return match ? parseInt(match[1], 10) : 12;
}

// 事件处理
function handleMaterialDragStart(material: Material, event: DragEvent) {
  editor.dragDropHandler.onMaterialDragStart(material, event);
}

function handleCanvasDragOver(event: DragEvent) {
  event.preventDefault();
  event.dataTransfer!.dropEffect = 'copy';
}

function handleCanvasDragLeave() {
  // 处理拖拽离开
}

function handleCanvasDrop(event: DragEvent) {
  event.preventDefault();
  const materialType = event.dataTransfer?.getData('material-type');
  
  if (materialType) {
    const material = editor.materialRegistry.get(materialType);
    if (material) {
      editor.addComponent({
        id: '',
        type: material.name,
        props: material.defaultProps || {},
        events: {},
        children: [],
        layout: {
          type: 'grid',
          gridColumn: 'span 6'
        }
      });
    }
  }
}

function handleComponentClick(id: string, event: MouseEvent) {
  const multi = event.ctrlKey || event.metaKey;
  editor.selectComponent(id, multi);
  selectedIds.value = [id];
}

function handleComponentSelect(id: string) {
  editor.selectComponent(id);
  selectedIds.value = [id];
}

function handleComponentDelete(id: string) {
  if (confirm(t('common.confirm'))) {
    editor.deleteComponent(id);
    selectedIds.value = [];
  }
}

function handlePropChange(key: string, value: any) {
  if (selectedComponent.value) {
    editor.updateComponent(selectedComponent.value.id, {
      props: {
        ...selectedComponent.value.props,
        [key]: value
      }
    });
  }
}

function handleGridSpanChange(span: string) {
  if (selectedComponent.value) {
    const spanNum = parseInt(span, 10);
    editor.updateComponent(selectedComponent.value.id, {
      layout: {
        ...selectedComponent.value.layout,
        gridColumn: `span ${spanNum}`
      }
    });
  }
}

function handleAddProp() {
  const key = prompt('属性名:');
  const value = prompt('属性值:');
  if (key && selectedComponent.value) {
    handlePropChange(key, value);
  }
}

function handleDeleteComponent() {
  if (selectedComponent.value) {
    if (confirm(t('common.confirm'))) {
      editor.deleteComponent(selectedComponent.value.id);
      selectedIds.value = [];
    }
  }
}

function handleSave() {
  const json = editor.saveSchema();
  console.log('Schema saved:', json);
  alert(t('common.success'));
}

function handleUndo() {
  editor.undo();
}

function handleRedo() {
  editor.redo();
}

function handleClear() {
  if (confirm(t('common.confirm'))) {
    editor.clearCanvas();
  }
}

function handlePreview() {
  alert(t('editor.toolbar.preview'));
}

function handleExport() {
  const code = editor.exportCode({ apiStyle: exportApiStyle.value });
  generatedCode.value = code.full;
  showExportDialog.value = true;
}

function handleDeviceChange(device: 'desktop' | 'tablet' | 'mobile') {
  currentDevice.value = device;
  editor.canvasManager.setDevice(device);
}

function handleLocaleChange() {
  setLocale(currentLocale.value);
}

function handleCopyCode() {
  navigator.clipboard.writeText(generatedCode.value);
  alert(t('common.success'));
}

function handleDownloadCode() {
  const blob = new Blob([generatedCode.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'generated-page.vue';
  a.click();
  URL.revokeObjectURL(url);
}

function toggleGrid() {
  editor.toggleGrid();
}

// 数据源管理
function handleAddDatasource() {
  console.log('Add datasource');
}

function handleEditDatasource(id: string) {
  console.log('Edit datasource:', id);
}

function handleDeleteDatasource(id: string) {
  console.log('Delete datasource:', id);
}

function handleSelectDatasource(id: string) {
  console.log('Select datasource:', id);
}

// 快捷键
useShortcuts(createEditorShortcuts({
  onSave: handleSave,
  onUndo: handleUndo,
  onRedo: handleRedo,
  onDelete: handleDeleteComponent,
  onEscape: () => { selectedIds.value = []; }
}));

// 监听 API 风格变化重新生成代码
watch(exportApiStyle, () => {
  if (showExportDialog.value) {
    const code = editor.exportCode({ apiStyle: exportApiStyle.value });
    generatedCode.value = code.full;
  }
});

// 监听语言变化
watch(locale, (newLocale) => {
  currentLocale.value = newLocale;
});
</script>

<style scoped lang="less">
@import '../styles/index.less';

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: var(--border-color);
  margin: 0 8px;
}

.status-divider {
  margin: 0 12px;
  color: var(--border-color);
}

.editor-toolbar {
  .toolbar-left,
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .toolbar-center {
    flex: 1;
    text-align: center;
  }

  .tool-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-color);
    color: var(--text-color);
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background: var(--bg-hover);
      border-color: var(--primary-color);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .device-switcher {
    display: flex;
    gap: 4px;
    padding: 4px;
    background: var(--bg-color);
    border-radius: 6px;

    .device-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      padding: 0;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: var(--bg-hover);
        color: var(--text-color);
      }

      &.active {
        background: var(--bg-secondary);
        color: var(--primary-color);
      }
    }
  }

  .locale-select {
    padding: 6px 10px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-color);
    color: var(--text-color);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }
  }
}

.editor-body {
  .left-sidebar,
  .right-sidebar {
    width: 280px;
    display: flex;
    flex-direction: column;
    background: var(--bg-secondary);
    border-color: var(--border-color);

    .sidebar-tabs {
      display: flex;
      border-bottom: 1px solid var(--border-color);
      background: var(--bg-color);

      .tab-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 44px;
        padding: 0;
        border: none;
        border-bottom: 2px solid transparent;
        background: transparent;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          color: var(--text-color);
          background: var(--bg-hover);
        }

        &.active {
          color: var(--primary-color);
          border-bottom-color: var(--primary-color);
        }
      }
    }
  }

  .material-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .panel-header {
      position: relative;
      padding: 16px;
      border-bottom: 1px solid var(--border-color);

      .search-input {
        width: 100%;
        padding: 8px 32px 8px 12px;
      }

      .search-icon {
        position: absolute;
        right: 24px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-disabled);
        pointer-events: none;
      }
    }

    .material-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      padding: 8px;
    }

    .material-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 12px 8px;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background: var(--bg-color);
      cursor: move;
      transition: all 0.2s;

      &:hover {
        border-color: var(--primary-color);
        background: var(--bg-hover);
        transform: translateY(-2px);
        box-shadow: var(--shadow-small);
      }

      .material-icon {
        color: var(--primary-color);
      }

      .material-title {
        font-size: 12px;
        text-align: center;
        color: var(--text-color);
      }
    }
  }

  .canvas-content {
    position: relative;
    border-radius: 6px;
    box-shadow: var(--shadow-medium);
  }

  .component-wrapper {
    position: relative;
    transition: outline 0.2s;

    &.component-selected {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }

    &.component-hovered {
      outline: 1px dashed var(--primary-color);
      outline-offset: 2px;
    }
  }
}

.property-group {
  margin-bottom: 16px;

  .group-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: var(--bg-hover);
    font-weight: 500;
    font-size: 13px;
    color: var(--text-color);
    border-radius: 4px;
    margin-bottom: 8px;
  }

  .group-content {
    padding: 0 16px;
  }
}

.property-actions {
  padding: 16px;
  border-top: 1px solid var(--border-color);
}

.add-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 8px;
  border: 1px dashed var(--border-color);
  border-radius: 6px;
  background: var(--bg-color);
  color: var(--text-color);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
}

.delete-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 6px;
  background: var(--error-color);
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: #ff7875;
  }
}

.export-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1500;
}

.export-dialog {
  background: var(--bg-secondary);
  border-radius: 8px;
  width: 800px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-large);
}

.dialog-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-color);
  }

  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    transition: all 0.2s;

    &:hover {
      background: var(--bg-hover);
      color: var(--text-color);
    }
  }
}

.dialog-body {
  flex: 1;
  padding: 20px 24px;
  overflow: auto;
}

.code-options {
  margin-bottom: 16px;
  display: flex;
  gap: 16px;

  label {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    color: var(--text-color);
  }
}

.code-preview {
  background: var(--bg-color);
  padding: 16px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  overflow: auto;
  max-height: 400px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-color);
}

.dialog-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.primary-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  background: var(--primary-color);
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: var(--primary-hover);
  }
}

.secondary-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  color: var(--text-color);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: var(--bg-hover);
    border-color: var(--border-hover);
  }
}

.empty-state,
.empty-state-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 32px;
  color: var(--text-disabled);

  .empty-icon {
    margin-bottom: 16px;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 14px;
    text-align: center;
  }
}
</style>


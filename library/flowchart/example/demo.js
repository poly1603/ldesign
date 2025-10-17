// 从源码导入（转换函数已内置）
import { FlowChartEditor, EditorMode, convertWorkflowToFlowChart } from '@/index';

/**
 * 初始化流程图编辑器
 */
async function initFlowChart() {
  try {
    // 从配置文件加载流程定义
    const response = await fetch('/workflow-data.json');
    const workflowData = await response.json();
    
    // 转换为流程图格式（使用内置函数）
    const { nodes, edges } = convertWorkflowToFlowChart(workflowData);
    
    // 创建编辑器
    const editor = new FlowChartEditor({
      container: '#flowchart-container',
      mode: EditorMode.EDIT,
      showToolbar: true,
      showMaterialPanel: true,
      autoLayout: true,
      nodeGap: 120,
      levelGap: 150,
      enableZoom: true,
      enablePan: true,
      
      onNodeClick: (node) => console.log('📌 节点:', node.label),
      onEdgeClick: (edge) => console.log('🔗 连线:', edge.label),
      onModeChange: (mode) => console.log('🔄 模式:', mode)
    });
    
    // 加载数据
    editor.load(nodes, edges);
    
    // 暴露到全局
    window.editor = editor;
    window.workflowData = workflowData;
    
    console.log('✅ 编辑器初始化成功');
    console.log('💡 使用 window.editor 访问编辑器');
    console.log('💡 使用 window.workflowData 查看原始数据');
    
  } catch (error) {
    console.error('❌ 初始化失败:', error);
  }
}

// 页面加载后初始化
initFlowChart();

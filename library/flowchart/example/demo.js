// 从源码导入（转换函数已内置）
import { FlowChartEditor, EditorMode, convertWorkflowToFlowChart } from '@/index';

// 流程图示例配置
const workflows = [
  {
    id: 'expense',
    name: '费用报销流程',
    description: '包含条件分支和回路的完整审批流程',
    file: '/workflow-data.json',
    badge: '完整示例'
  },
  {
    id: 'simple',
    name: '简单审批流程',
    description: '最基础的审批流程：提交→审批→结束',
    file: '/workflows/simple-approval.json',
    badge: '基础'
  },
  {
    id: 'condition',
    name: '条件分支流程',
    description: '包含多条件判断的分支流程',
    file: '/workflows/condition-branch.json',
    badge: '分支'
  },
  {
    id: 'loop',
    name: '循环流程',
    description: '包含退回和重新提交的循环流程',
    file: '/workflows/loop-process.json',
    badge: '循环'
  }
];

let currentEditor = null;

/**
 * 初始化流程图编辑器
 */
async function initFlowChart(workflowFile = '/workflow-data.json') {
  try {
    // 从配置文件加载流程定义
    const response = await fetch(workflowFile);
    const workflowData = await response.json();

    // 转换为流程图格式（使用内置函数）
    const { nodes, edges } = convertWorkflowToFlowChart(workflowData);

    // 如果已有编辑器，先销毁
    if (currentEditor) {
      // 清空容器
      const container = document.querySelector('#flowchart-container');
      if (container) {
        container.innerHTML = '';
      }
    }

    // 创建编辑器
    const editor = new FlowChartEditor({
      container: '#flowchart-container',
      mode: EditorMode.EDIT,
      showToolbar: true,
      showMaterialPanel: false,  // 关闭物料面板，更多空间
      autoLayout: true,
      nodeGap: 180,
      levelGap: 120,
      enableZoom: true,
      enablePan: true,
      zoom: {
        initialScale: 1.0,      // 初始100%缩放
        minScale: 0.5,          // 最小50%
        maxScale: 2.0,          // 最大200%
        scaleStep: 0.15,        // 每次缩放15%
        autoFit: false,         // 不自动适应
        fitPadding: 60          // 边距60px
      },
      onNodeClick: (node) => console.log('📌 节点:', node.label),
      onEdgeClick: (edge) => console.log('🔗 连线:', edge.label),
      onModeChange: (mode) => console.log('🔄 模式:', mode)
    });

    // 加载数据
    editor.load(nodes, edges);

    // 暴露到全局
    window.editor = editor;
    window.workflowData = workflowData;
    currentEditor = editor;

    console.log('✅ 流程图加载成功');

  } catch (error) {
    console.error('❌ 加载失败:', error);
  }
}

/**
 * 渲染流程图列表
 */
function renderWorkflowList() {
  const listContainer = document.getElementById('workflowList');
  if (!listContainer) return;

  listContainer.innerHTML = workflows.map((workflow, index) => `
    <div class="workflow-item ${index === 0 ? 'active' : ''}" data-id="${workflow.id}" data-file="${workflow.file}">
      <h3>${workflow.name}</h3>
      <p>${workflow.description}</p>
      <span class="badge">${workflow.badge}</span>
    </div>
  `).join('');

  // 添加点击事件
  listContainer.addEventListener('click', async (e) => {
    const item = e.target.closest('.workflow-item');
    if (!item) return;

    // 更新active状态
    document.querySelectorAll('.workflow-item').forEach(el => {
      el.classList.remove('active');
    });
    item.classList.add('active');

    // 加载选中的流程图
    const file = item.getAttribute('data-file');
    await initFlowChart(file);
  });
}

// 页面加载后初始化
renderWorkflowList();
initFlowChart();

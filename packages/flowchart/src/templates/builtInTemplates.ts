/**
 * 内置流程图模板
 * 
 * 提供常用的审批流程模板
 */

import type { FlowchartTemplate, FlowchartData } from '../types'

/**
 * 请假审批流程模板
 */
const leaveApprovalTemplate: FlowchartTemplate = {
  id: 'builtin_leave_approval',
  name: 'leave-approval',
  displayName: '请假审批流程',
  description: '标准的请假审批流程，包含申请提交、直属领导审批、HR审批等环节',
  category: 'approval',
  version: '1.0.0',
  author: 'LDesign Team',
  tags: ['请假', '审批', '人事'],
  isBuiltIn: true,
  isDefault: true,
  createdAt: '2025-09-12T00:00:00.000Z',
  updatedAt: '2025-09-12T00:00:00.000Z',
  data: {
    nodes: [
      {
        id: 'start_1',
        type: 'start',
        x: 100,
        y: 200,
        text: '开始',
        properties: {}
      },
      {
        id: 'approval_1',
        type: 'approval',
        x: 300,
        y: 200,
        text: '提交请假申请',
        properties: {
          approvers: [
            { id: 'user1', name: '申请人', role: '员工' }
          ],
          status: 'pending',
          allowDelegate: false,
          allowAddSign: false
        }
      },
      {
        id: 'approval_2',
        type: 'approval',
        x: 500,
        y: 200,
        text: '直属领导审批',
        properties: {
          approvers: [
            { id: 'manager1', name: '直属领导', role: '部门经理' }
          ],
          status: 'pending',
          timeLimit: 24,
          allowDelegate: true,
          allowAddSign: true
        }
      },
      {
        id: 'condition_1',
        type: 'condition',
        x: 700,
        y: 200,
        text: '请假天数>3天?',
        properties: {
          condition: 'days > 3'
        }
      },
      {
        id: 'approval_3',
        type: 'approval',
        x: 700,
        y: 350,
        text: 'HR审批',
        properties: {
          approvers: [
            { id: 'hr1', name: 'HR专员', role: 'HR' }
          ],
          status: 'pending',
          timeLimit: 48,
          allowDelegate: true
        }
      },
      {
        id: 'end_1',
        type: 'end',
        x: 900,
        y: 200,
        text: '结束',
        properties: {}
      }
    ],
    edges: [
      {
        id: 'edge_1',
        sourceNodeId: 'start_1',
        targetNodeId: 'approval_1',
        text: '',
        properties: {}
      },
      {
        id: 'edge_2',
        sourceNodeId: 'approval_1',
        targetNodeId: 'approval_2',
        text: '提交',
        properties: {}
      },
      {
        id: 'edge_3',
        sourceNodeId: 'approval_2',
        targetNodeId: 'condition_1',
        text: '通过',
        properties: {}
      },
      {
        id: 'edge_4',
        sourceNodeId: 'condition_1',
        targetNodeId: 'approval_3',
        text: '是',
        properties: {
          condition: 'days > 3'
        }
      },
      {
        id: 'edge_5',
        sourceNodeId: 'condition_1',
        targetNodeId: 'end_1',
        text: '否',
        properties: {
          condition: 'days <= 3'
        }
      },
      {
        id: 'edge_6',
        sourceNodeId: 'approval_3',
        targetNodeId: 'end_1',
        text: '通过',
        properties: {}
      }
    ]
  }
}

/**
 * 报销审批流程模板
 */
const expenseApprovalTemplate: FlowchartTemplate = {
  id: 'builtin_expense_approval',
  name: 'expense-approval',
  displayName: '报销审批流程',
  description: '标准的费用报销审批流程，包含申请提交、部门审批、财务审批等环节',
  category: 'approval',
  version: '1.0.0',
  author: 'LDesign Team',
  tags: ['报销', '审批', '财务'],
  isBuiltIn: true,
  createdAt: '2025-09-12T00:00:00.000Z',
  updatedAt: '2025-09-12T00:00:00.000Z',
  data: {
    nodes: [
      {
        id: 'start_1',
        type: 'start',
        x: 100,
        y: 200,
        text: '开始',
        properties: {}
      },
      {
        id: 'approval_1',
        type: 'approval',
        x: 300,
        y: 200,
        text: '提交报销申请',
        properties: {
          approvers: [
            { id: 'user1', name: '申请人', role: '员工' }
          ],
          status: 'pending'
        }
      },
      {
        id: 'approval_2',
        type: 'approval',
        x: 500,
        y: 200,
        text: '部门经理审批',
        properties: {
          approvers: [
            { id: 'manager1', name: '部门经理', role: '经理' }
          ],
          status: 'pending',
          timeLimit: 48
        }
      },
      {
        id: 'condition_1',
        type: 'condition',
        x: 700,
        y: 200,
        text: '金额>5000?',
        properties: {
          condition: 'amount > 5000'
        }
      },
      {
        id: 'approval_3',
        type: 'approval',
        x: 700,
        y: 350,
        text: '总经理审批',
        properties: {
          approvers: [
            { id: 'ceo1', name: '总经理', role: '总经理' }
          ],
          status: 'pending',
          timeLimit: 72
        }
      },
      {
        id: 'approval_4',
        type: 'approval',
        x: 900,
        y: 200,
        text: '财务审批',
        properties: {
          approvers: [
            { id: 'finance1', name: '财务专员', role: '财务' }
          ],
          status: 'pending',
          timeLimit: 24
        }
      },
      {
        id: 'end_1',
        type: 'end',
        x: 1100,
        y: 200,
        text: '结束',
        properties: {}
      }
    ],
    edges: [
      {
        id: 'edge_1',
        sourceNodeId: 'start_1',
        targetNodeId: 'approval_1',
        text: '',
        properties: {}
      },
      {
        id: 'edge_2',
        sourceNodeId: 'approval_1',
        targetNodeId: 'approval_2',
        text: '提交',
        properties: {}
      },
      {
        id: 'edge_3',
        sourceNodeId: 'approval_2',
        targetNodeId: 'condition_1',
        text: '通过',
        properties: {}
      },
      {
        id: 'edge_4',
        sourceNodeId: 'condition_1',
        targetNodeId: 'approval_3',
        text: '是',
        properties: {
          condition: 'amount > 5000'
        }
      },
      {
        id: 'edge_5',
        sourceNodeId: 'condition_1',
        targetNodeId: 'approval_4',
        text: '否',
        properties: {
          condition: 'amount <= 5000'
        }
      },
      {
        id: 'edge_6',
        sourceNodeId: 'approval_3',
        targetNodeId: 'approval_4',
        text: '通过',
        properties: {}
      },
      {
        id: 'edge_7',
        sourceNodeId: 'approval_4',
        targetNodeId: 'end_1',
        text: '通过',
        properties: {}
      }
    ]
  }
}

/**
 * 采购审批流程模板
 */
const purchaseApprovalTemplate: FlowchartTemplate = {
  id: 'builtin_purchase_approval',
  name: 'purchase-approval',
  displayName: '采购审批流程',
  description: '标准的采购申请审批流程，包含需求提交、部门审批、采购执行等环节',
  category: 'approval',
  version: '1.0.0',
  author: 'LDesign Team',
  tags: ['采购', '审批', '供应链'],
  isBuiltIn: true,
  createdAt: '2025-09-12T00:00:00.000Z',
  updatedAt: '2025-09-12T00:00:00.000Z',
  data: {
    nodes: [
      {
        id: 'start_1',
        type: 'start',
        x: 100,
        y: 200,
        text: '开始',
        properties: {}
      },
      {
        id: 'approval_1',
        type: 'approval',
        x: 300,
        y: 200,
        text: '提交采购需求',
        properties: {
          approvers: [
            { id: 'user1', name: '需求方', role: '员工' }
          ],
          status: 'pending'
        }
      },
      {
        id: 'approval_2',
        type: 'approval',
        x: 500,
        y: 200,
        text: '部门经理审批',
        properties: {
          approvers: [
            { id: 'manager1', name: '部门经理', role: '经理' }
          ],
          status: 'pending',
          timeLimit: 48
        }
      },
      {
        id: 'approval_3',
        type: 'approval',
        x: 700,
        y: 200,
        text: '采购部门审批',
        properties: {
          approvers: [
            { id: 'purchase1', name: '采购专员', role: '采购' }
          ],
          status: 'pending',
          timeLimit: 72
        }
      },
      {
        id: 'process_1',
        type: 'process',
        x: 900,
        y: 200,
        text: '执行采购',
        properties: {
          description: '采购部门执行采购任务'
        }
      },
      {
        id: 'end_1',
        type: 'end',
        x: 1100,
        y: 200,
        text: '结束',
        properties: {}
      }
    ],
    edges: [
      {
        id: 'edge_1',
        sourceNodeId: 'start_1',
        targetNodeId: 'approval_1',
        text: '',
        properties: {}
      },
      {
        id: 'edge_2',
        sourceNodeId: 'approval_1',
        targetNodeId: 'approval_2',
        text: '提交',
        properties: {}
      },
      {
        id: 'edge_3',
        sourceNodeId: 'approval_2',
        targetNodeId: 'approval_3',
        text: '通过',
        properties: {}
      },
      {
        id: 'edge_4',
        sourceNodeId: 'approval_3',
        targetNodeId: 'process_1',
        text: '通过',
        properties: {}
      },
      {
        id: 'edge_5',
        sourceNodeId: 'process_1',
        targetNodeId: 'end_1',
        text: '完成',
        properties: {}
      }
    ]
  }
}

/**
 * 所有内置模板
 */
export const builtInTemplates: FlowchartTemplate[] = [
  leaveApprovalTemplate,
  expenseApprovalTemplate,
  purchaseApprovalTemplate
]

/**
 * 根据分类获取内置模板
 */
export function getBuiltInTemplatesByCategory(category: string): FlowchartTemplate[] {
  return builtInTemplates.filter(template => template.category === category)
}

/**
 * 根据ID获取内置模板
 */
export function getBuiltInTemplate(id: string): FlowchartTemplate | undefined {
  return builtInTemplates.find(template => template.id === id)
}

/**
 * 获取默认模板
 */
export function getDefaultTemplate(): FlowchartTemplate | undefined {
  return builtInTemplates.find(template => template.isDefault)
}

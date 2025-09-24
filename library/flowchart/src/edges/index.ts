/**
 * 审批流程边注册
 * 
 * 统一注册所有审批流程边类型
 */

import type { LogicFlow } from '@logicflow/core'
import { ApprovalEdge, ApprovalEdgeModel } from './ApprovalEdge'

/**
 * 注册所有审批流程边
 * @param lf LogicFlow 实例
 */
export function registerApprovalEdges(lf: LogicFlow): void {
  // 注册审批边
  lf.register({
    type: 'approval-edge',
    view: ApprovalEdge,
    model: ApprovalEdgeModel
  })
}

// 导出所有边类
export { ApprovalEdge, ApprovalEdgeModel } from './ApprovalEdge'

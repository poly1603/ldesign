/**
 * 审批流程节点注册
 * 
 * 统一注册所有审批流程节点类型
 */

import type { LogicFlow } from '@logicflow/core'
import { StartNode, StartNodeModel } from './StartNode'
import { ApprovalNode, ApprovalNodeModel } from './ApprovalNode'
import { ConditionNode, ConditionNodeModel } from './ConditionNode'
import { EndNode, EndNodeModel } from './EndNode'
import { ProcessNode, ProcessNodeModel } from './ProcessNode'
import { ParallelGateway, ParallelGatewayModel } from './ParallelGateway'
import { ExclusiveGateway, ExclusiveGatewayModel } from './ExclusiveGateway'

/**
 * 注册所有审批流程节点
 * @param lf LogicFlow 实例
 */
export function registerApprovalNodes(lf: LogicFlow): void {
  // 注册开始节点
  lf.register({
    type: 'start',
    view: StartNode,
    model: StartNodeModel
  })

  // 注册审批节点
  lf.register({
    type: 'approval',
    view: ApprovalNode,
    model: ApprovalNodeModel
  })

  // 注册条件节点
  lf.register({
    type: 'condition',
    view: ConditionNode,
    model: ConditionNodeModel
  })

  // 注册结束节点
  lf.register({
    type: 'end',
    view: EndNode,
    model: EndNodeModel
  })

  // 注册处理节点
  lf.register({
    type: 'process',
    view: ProcessNode,
    model: ProcessNodeModel
  })

  // 注册并行网关
  lf.register({
    type: 'parallel-gateway',
    view: ParallelGateway,
    model: ParallelGatewayModel
  })

  // 注册排他网关
  lf.register({
    type: 'exclusive-gateway',
    view: ExclusiveGateway,
    model: ExclusiveGatewayModel
  })
}

// 导出所有节点类
export { StartNode, StartNodeModel } from './StartNode'
export { ApprovalNode, ApprovalNodeModel } from './ApprovalNode'
export { ConditionNode, ConditionNodeModel } from './ConditionNode'
export { EndNode, EndNodeModel } from './EndNode'
export { ProcessNode, ProcessNodeModel } from './ProcessNode'
export { ParallelGateway, ParallelGatewayModel } from './ParallelGateway'
export { ExclusiveGateway, ExclusiveGatewayModel } from './ExclusiveGateway'

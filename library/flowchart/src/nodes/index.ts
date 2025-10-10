import LogicFlow from '@logicflow/core';
import StartNode from './StartNode';
import EndNode from './EndNode';
import ApprovalNode from './ApprovalNode';
import ConditionNode from './ConditionNode';
import ParallelNode from './ParallelNode';
import CCNode from './CCNode';

/**
 * 注册所有节点类型
 */
export function registerNodes(lf: LogicFlow): void {
  lf.register(StartNode);
  lf.register(EndNode);
  lf.register(ApprovalNode);
  lf.register(ConditionNode);
  lf.register(ParallelNode);
  lf.register(CCNode);
}

export {
  StartNode,
  EndNode,
  ApprovalNode,
  ConditionNode,
  ParallelNode,
  CCNode,
};

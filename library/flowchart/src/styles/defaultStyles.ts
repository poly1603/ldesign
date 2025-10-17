import { NodeType, NodeStyle } from '../types';

/**
 * 默认节点样式配置
 */
export const DEFAULT_NODE_STYLES: Record<NodeType, NodeStyle> = {
  [NodeType.START]: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
    borderWidth: 2,
    textColor: '#155724',
    fontSize: 14,
    borderRadius: 30
  },
  [NodeType.END]: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
    borderWidth: 2,
    textColor: '#721c24',
    fontSize: 14,
    borderRadius: 30
  },
  [NodeType.APPROVAL]: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
    borderWidth: 2,
    textColor: '#856404',
    fontSize: 14,
    borderRadius: 4
  },
  [NodeType.CONDITION]: {
    backgroundColor: '#cfe2ff',
    borderColor: '#0d6efd',
    borderWidth: 2,
    textColor: '#084298',
    fontSize: 14,
    borderRadius: 4
  },
  [NodeType.PROCESS]: {
    backgroundColor: '#e7e7ff',
    borderColor: '#6610f2',
    borderWidth: 2,
    textColor: '#3d0a91',
    fontSize: 14,
    borderRadius: 4
  },
  [NodeType.PARALLEL]: {
    backgroundColor: '#d1ecf1',
    borderColor: '#17a2b8',
    borderWidth: 2,
    textColor: '#0c5460',
    fontSize: 14,
    borderRadius: 4
  },
  [NodeType.MERGE]: {
    backgroundColor: '#e2e3e5',
    borderColor: '#6c757d',
    borderWidth: 2,
    textColor: '#383d41',
    fontSize: 14,
    borderRadius: 4
  }
};

/**
 * 根据节点状态获取状态颜色
 */
export const STATUS_COLORS = {
  pending: '#6c757d',
  processing: '#0d6efd',
  approved: '#28a745',
  rejected: '#dc3545',
  completed: '#6c757d'
};



/**
 * 连接线工厂
 * 负责创建和管理各种类型的连接线
 */

import type { EdgeFactory as IEdgeFactory, BaseEdge, EdgeData } from '@/types/index.js';
import { EdgeType } from '@/types/index.js';
import { StraightEdge } from './StraightEdge.js';
import { BezierEdge } from './BezierEdge.js';
import { OrthogonalEdge } from './OrthogonalEdge.js';

/**
 * 连接线构造函数类型
 */
type EdgeConstructor = new (data: EdgeData) => BaseEdge;

/**
 * 连接线工厂类
 */
export class EdgeFactory implements IEdgeFactory {
  private edgeTypes: Map<EdgeType, EdgeConstructor> = new Map();

  constructor() {
    // 注册内置连接线类型
    this.registerBuiltinEdgeTypes();
  }

  /**
   * 注册内置连接线类型
   */
  private registerBuiltinEdgeTypes(): void {
    this.edgeTypes.set(EdgeType.STRAIGHT, StraightEdge as EdgeConstructor);
    this.edgeTypes.set(EdgeType.BEZIER, BezierEdge as EdgeConstructor);
    this.edgeTypes.set(EdgeType.ORTHOGONAL, OrthogonalEdge as EdgeConstructor);
  }

  /**
   * 创建连接线
   */
  createEdge(type: EdgeType, data: Partial<EdgeData>): BaseEdge {
    const EdgeClass = this.edgeTypes.get(type);
    if (!EdgeClass) {
      throw new Error(`不支持的连接线类型: ${type}`);
    }

    // 确保必要的字段存在
    const edgeData: EdgeData = {
      id: data.id || this.generateEdgeId(type),
      type: type,
      source: data.source || '',
      target: data.target || '',
      ...(data.sourcePort !== undefined && { sourcePort: data.sourcePort }),
      ...(data.targetPort !== undefined && { targetPort: data.targetPort }),
      ...(data.label !== undefined && { label: data.label }),
      style: data.style || {},
      properties: data.properties || {}
    };

    return new EdgeClass(edgeData);
  }

  /**
   * 注册连接线类型
   */
  registerEdgeType(type: EdgeType, edgeClass: EdgeConstructor): void {
    this.edgeTypes.set(type, edgeClass);
  }

  /**
   * 获取支持的连接线类型
   */
  getSupportedTypes(): EdgeType[] {
    return Array.from(this.edgeTypes.keys());
  }

  /**
   * 检查是否支持指定的连接线类型
   */
  isSupported(type: EdgeType): boolean {
    return this.edgeTypes.has(type);
  }

  /**
   * 获取连接线类型的默认配置
   */
  getDefaultEdgeConfig(type: EdgeType): Partial<EdgeData> {
    switch (type) {
      case EdgeType.STRAIGHT:
        return {
          style: {
            strokeColor: '#666666',
            strokeWidth: 2
          }
        };

      case EdgeType.BEZIER:
        return {
          style: {
            strokeColor: '#666666',
            strokeWidth: 2
          },
          properties: {
            controlPointOffset: 100
          }
        };

      case EdgeType.ORTHOGONAL:
        return {
          style: {
            strokeColor: '#666666',
            strokeWidth: 2
          },
          properties: {
            minSegmentLength: 20
          }
        };

      case EdgeType.SMOOTH:
        return {
          style: {
            strokeColor: '#666666',
            strokeWidth: 2
          },
          properties: {
            smoothness: 0.5,
            tension: 0.5
          }
        };

      default:
        return {
          style: {
            strokeColor: '#666666',
            strokeWidth: 2
          }
        };
    }
  }

  /**
   * 创建带有默认配置的连接线
   */
  createDefaultEdge(type: EdgeType, source: string, target: string): BaseEdge {
    const defaultConfig = this.getDefaultEdgeConfig(type);
    const edgeData: Partial<EdgeData> = {
      ...defaultConfig,
      source,
      target,
      id: this.generateEdgeId(type)
    };

    return this.createEdge(type, edgeData);
  }

  /**
   * 生成连接线ID
   */
  private generateEdgeId(type: EdgeType): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    return `${type}_${timestamp}_${random}`;
  }

  /**
   * 克隆连接线
   */
  cloneEdge(edge: BaseEdge): BaseEdge {
    const edgeData = edge.getData();
    const clonedData: EdgeData = {
      ...edgeData,
      id: this.generateEdgeId(edgeData.type as EdgeType)
    };

    return this.createEdge(edgeData.type as EdgeType, clonedData);
  }

  /**
   * 验证连接线数据
   */
  validateEdgeData(data: EdgeData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 检查必要字段
    if (!data.id) {
      errors.push('连接线ID不能为空');
    }

    if (!data.type) {
      errors.push('连接线类型不能为空');
    } else if (!this.isSupported(data.type as EdgeType)) {
      errors.push(`不支持的连接线类型: ${data.type}`);
    }

    if (!data.source) {
      errors.push('源节点ID不能为空');
    }

    if (!data.target) {
      errors.push('目标节点ID不能为空');
    }

    if (data.source === data.target) {
      errors.push('源节点和目标节点不能相同');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 获取连接线类型信息
   */
  getEdgeTypeInfo(type: EdgeType): {
    name: string;
    description: string;
    category: string;
    icon?: string;
  } {
    const typeInfo: Record<EdgeType, any> = {
      [EdgeType.STRAIGHT]: {
        name: '直线连接',
        description: '最简单的直线连接',
        category: '基础连接',
        icon: '—'
      },
      [EdgeType.BEZIER]: {
        name: '贝塞尔曲线',
        description: '平滑的曲线连接',
        category: '曲线连接',
        icon: '〜'
      },
      [EdgeType.ORTHOGONAL]: {
        name: '直角连接',
        description: '规范的直角转折连接',
        category: '规范连接',
        icon: '⌐'
      },
      [EdgeType.SMOOTH]: {
        name: '平滑曲线',
        description: '自然的平滑曲线连接',
        category: '曲线连接',
        icon: '∿'
      },
      [EdgeType.CUSTOM]: {
        name: '自定义路径',
        description: '用户自定义的连接路径',
        category: '高级连接',
        icon: '✏'
      }
    };

    return typeInfo[type] || {
      name: '未知连接线',
      description: '未知的连接线类型',
      category: '其他',
      icon: '?'
    };
  }

  /**
   * 获取推荐的连接线类型
   */
  getRecommendedEdgeType(sourceNodeType: string, targetNodeType: string): EdgeType {
    // 根据节点类型推荐合适的连接线类型
    // 这里可以根据实际需求定制推荐逻辑

    // 默认推荐贝塞尔曲线，因为它在大多数情况下都有良好的视觉效果
    return EdgeType.BEZIER;
  }

  /**
   * 批量创建连接线
   */
  createEdges(edgesData: Partial<EdgeData>[]): BaseEdge[] {
    const edges: BaseEdge[] = [];

    for (const edgeData of edgesData) {
      try {
        if (edgeData.type) {
          const edge = this.createEdge(edgeData.type as EdgeType, edgeData);
          edges.push(edge);
        }
      } catch (error) {
        console.error('创建连接线失败:', error);
      }
    }

    return edges;
  }

  /**
   * 获取连接线样式预设
   */
  getStylePresets(): Record<string, Partial<EdgeData>> {
    return {
      default: {
        style: {
          strokeColor: '#666666',
          strokeWidth: 2
        }
      },
      primary: {
        style: {
          strokeColor: 'var(--ldesign-brand-color)',
          strokeWidth: 2
        }
      },
      success: {
        style: {
          strokeColor: 'var(--ldesign-success-color)',
          strokeWidth: 2
        }
      },
      warning: {
        style: {
          strokeColor: 'var(--ldesign-warning-color)',
          strokeWidth: 2
        }
      },
      error: {
        style: {
          strokeColor: 'var(--ldesign-error-color)',
          strokeWidth: 2
        }
      },
      dashed: {
        style: {
          strokeColor: '#666666',
          strokeWidth: 2,
          dashArray: [5, 5]
        }
      },
      thick: {
        style: {
          strokeColor: '#666666',
          strokeWidth: 4
        }
      },
      thin: {
        style: {
          strokeColor: '#666666',
          strokeWidth: 1
        }
      }
    };
  }
}

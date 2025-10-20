import { NodeType, NodeStyle, MaterialItem } from '../types';
import { DEFAULT_NODE_STYLES } from '../styles/defaultStyles';

/**
 * 组件定义
 */
export interface ComponentDefinition {
  type: NodeType;
  label: string;
  icon: string;
  description?: string;
  defaultStyle: NodeStyle;
  category?: string;
}

/**
 * 组件注册表
 * 统一管理所有节点组件的定义和样式
 */
export class ComponentRegistry {
  private components: Map<NodeType, ComponentDefinition> = new Map();
  private currentTheme: 'default' | 'dark' | 'minimal' = 'default';

  constructor() {
    this.registerDefaultComponents();
  }

  /**
   * 注册默认组件
   */
  private registerDefaultComponents(): void {
    const defaultComponents: ComponentDefinition[] = [
      {
        type: NodeType.START,
        label: '开始',
        icon: '▶️',
        description: '流程的起点',
        defaultStyle: DEFAULT_NODE_STYLES[NodeType.START],
        category: '基础'
      },
      {
        type: NodeType.END,
        label: '结束',
        icon: '⏹️',
        description: '流程的终点',
        defaultStyle: DEFAULT_NODE_STYLES[NodeType.END],
        category: '基础'
      },
      {
        type: NodeType.PROCESS,
        label: '流程',
        icon: '📄',
        description: '处理步骤',
        defaultStyle: DEFAULT_NODE_STYLES[NodeType.PROCESS],
        category: '流程'
      },
      {
        type: NodeType.APPROVAL,
        label: '审批',
        icon: '✅',
        description: '需要审批的步骤',
        defaultStyle: DEFAULT_NODE_STYLES[NodeType.APPROVAL],
        category: '流程'
      },
      {
        type: NodeType.CONDITION,
        label: '条件',
        icon: '❓',
        description: '条件判断',
        defaultStyle: DEFAULT_NODE_STYLES[NodeType.CONDITION],
        category: '控制'
      },
      {
        type: NodeType.PARALLEL,
        label: '并行',
        icon: '⚡',
        description: '并行执行',
        defaultStyle: DEFAULT_NODE_STYLES[NodeType.PARALLEL],
        category: '控制'
      },
      {
        type: NodeType.MERGE,
        label: '合并',
        icon: '🔀',
        description: '合并分支',
        defaultStyle: DEFAULT_NODE_STYLES[NodeType.MERGE],
        category: '控制'
      }
    ];

    defaultComponents.forEach(comp => {
      this.components.set(comp.type, comp);
    });
  }

  /**
   * 注册自定义组件
   */
  public registerComponent(component: ComponentDefinition): void {
    this.components.set(component.type, component);
  }

  /**
   * 获取组件定义
   */
  public getComponent(type: NodeType): ComponentDefinition | undefined {
    return this.components.get(type);
  }

  /**
   * 获取所有组件
   */
  public getAllComponents(): ComponentDefinition[] {
    return Array.from(this.components.values());
  }

  /**
   * 获取组件样式
   */
  public getComponentStyle(type: NodeType): NodeStyle {
    const component = this.components.get(type);
    return component?.defaultStyle || DEFAULT_NODE_STYLES[type];
  }

  /**
   * 转换为物料列表
   */
  public toMaterialList(): MaterialItem[] {
    return this.getAllComponents().map(comp => ({
      type: comp.type,
      label: comp.label,
      icon: comp.icon,
      description: comp.description
    }));
  }

  /**
   * 设置主题
   */
  public setTheme(theme: 'default' | 'dark' | 'minimal'): void {
    this.currentTheme = theme;
    // TODO: 根据主题更新组件样式
  }

  /**
   * 按分类获取组件
   */
  public getComponentsByCategory(category: string): ComponentDefinition[] {
    return this.getAllComponents().filter(comp => comp.category === category);
  }

  /**
   * 获取所有分类
   */
  public getCategories(): string[] {
    const categories = new Set<string>();
    this.components.forEach(comp => {
      if (comp.category) {
        categories.add(comp.category);
      }
    });
    return Array.from(categories);
  }
}









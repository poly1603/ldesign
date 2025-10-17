import { NodeStyle, EdgeStyle, NodeType } from '../types';

/**
 * 主题配置接口
 */
export interface ThemeConfig {
  name: string;
  nodeStyles: Record<NodeType, NodeStyle>;
  edgeStyle: EdgeStyle;
  backgroundColor?: string;
  gridColor?: string;
}

/**
 * 预定义主题
 */
export const THEMES = {
  // 默认主题
  default: {
    name: 'default',
    nodeStyles: {
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
    },
    edgeStyle: {
      strokeColor: '#666',
      strokeWidth: 2,
      arrowSize: 10
    },
    backgroundColor: '#f8f9fa',
    gridColor: '#e9ecef'
  },

  // 暗色主题
  dark: {
    name: 'dark',
    nodeStyles: {
      [NodeType.START]: {
        backgroundColor: '#1b4332',
        borderColor: '#40916c',
        borderWidth: 2,
        textColor: '#d8f3dc',
        fontSize: 14,
        borderRadius: 30
      },
      [NodeType.END]: {
        backgroundColor: '#641220',
        borderColor: '#c9184a',
        borderWidth: 2,
        textColor: '#ffccd5',
        fontSize: 14,
        borderRadius: 30
      },
      [NodeType.APPROVAL]: {
        backgroundColor: '#8d5524',
        borderColor: '#e5a855',
        borderWidth: 2,
        textColor: '#ffe8cc',
        fontSize: 14,
        borderRadius: 4
      },
      [NodeType.CONDITION]: {
        backgroundColor: '#1e3a8a',
        borderColor: '#3b82f6',
        borderWidth: 2,
        textColor: '#dbeafe',
        fontSize: 14,
        borderRadius: 4
      },
      [NodeType.PROCESS]: {
        backgroundColor: '#4a1d96',
        borderColor: '#8b5cf6',
        borderWidth: 2,
        textColor: '#ede9fe',
        fontSize: 14,
        borderRadius: 4
      },
      [NodeType.PARALLEL]: {
        backgroundColor: '#0c4a6e',
        borderColor: '#0ea5e9',
        borderWidth: 2,
        textColor: '#e0f2fe',
        fontSize: 14,
        borderRadius: 4
      },
      [NodeType.MERGE]: {
        backgroundColor: '#374151',
        borderColor: '#9ca3af',
        borderWidth: 2,
        textColor: '#f3f4f6',
        fontSize: 14,
        borderRadius: 4
      }
    },
    edgeStyle: {
      strokeColor: '#9ca3af',
      strokeWidth: 2,
      arrowSize: 10
    },
    backgroundColor: '#1f2937',
    gridColor: '#374151'
  },

  // 简约主题
  minimal: {
    name: 'minimal',
    nodeStyles: {
      [NodeType.START]: {
        backgroundColor: '#ffffff',
        borderColor: '#000000',
        borderWidth: 2,
        textColor: '#000000',
        fontSize: 14,
        borderRadius: 30
      },
      [NodeType.END]: {
        backgroundColor: '#000000',
        borderColor: '#000000',
        borderWidth: 2,
        textColor: '#ffffff',
        fontSize: 14,
        borderRadius: 30
      },
      [NodeType.APPROVAL]: {
        backgroundColor: '#ffffff',
        borderColor: '#666666',
        borderWidth: 2,
        textColor: '#333333',
        fontSize: 14,
        borderRadius: 4
      },
      [NodeType.CONDITION]: {
        backgroundColor: '#f5f5f5',
        borderColor: '#666666',
        borderWidth: 2,
        textColor: '#333333',
        fontSize: 14,
        borderRadius: 4
      },
      [NodeType.PROCESS]: {
        backgroundColor: '#ffffff',
        borderColor: '#999999',
        borderWidth: 1,
        textColor: '#333333',
        fontSize: 14,
        borderRadius: 4
      },
      [NodeType.PARALLEL]: {
        backgroundColor: '#f0f0f0',
        borderColor: '#666666',
        borderWidth: 2,
        textColor: '#333333',
        fontSize: 14,
        borderRadius: 4
      },
      [NodeType.MERGE]: {
        backgroundColor: '#e5e5e5',
        borderColor: '#666666',
        borderWidth: 2,
        textColor: '#333333',
        fontSize: 14,
        borderRadius: 4
      }
    },
    edgeStyle: {
      strokeColor: '#333333',
      strokeWidth: 2,
      arrowSize: 10
    },
    backgroundColor: '#ffffff',
    gridColor: '#e0e0e0'
  }
} as const;

/**
 * 主题管理器
 */
export class ThemeManager {
  private currentTheme: ThemeConfig;
  private customThemes: Map<string, ThemeConfig>;

  constructor(initialTheme: keyof typeof THEMES = 'default') {
    this.currentTheme = THEMES[initialTheme];
    this.customThemes = new Map();
  }

  /**
   * 获取当前主题
   */
  public getCurrentTheme(): ThemeConfig {
    return this.currentTheme;
  }

  /**
   * 切换主题
   */
  public setTheme(themeName: keyof typeof THEMES | string): boolean {
    // 首先检查预定义主题
    if (themeName in THEMES) {
      this.currentTheme = THEMES[themeName as keyof typeof THEMES];
      return true;
    }

    // 检查自定义主题
    const customTheme = this.customThemes.get(themeName);
    if (customTheme) {
      this.currentTheme = customTheme;
      return true;
    }

    console.warn(`Theme "${themeName}" not found`);
    return false;
  }

  /**
   * 注册自定义主题
   */
  public registerTheme(name: string, theme: ThemeConfig): void {
    this.customThemes.set(name, theme);
  }

  /**
   * 获取所有可用主题名称
   */
  public getAvailableThemes(): string[] {
    return [
      ...Object.keys(THEMES),
      ...Array.from(this.customThemes.keys())
    ];
  }

  /**
   * 获取节点样式
   */
  public getNodeStyles(): Record<NodeType, NodeStyle> {
    return this.currentTheme.nodeStyles;
  }

  /**
   * 获取边样式
   */
  public getEdgeStyle(): EdgeStyle {
    return this.currentTheme.edgeStyle;
  }

  /**
   * 获取背景颜色
   */
  public getBackgroundColor(): string {
    return this.currentTheme.backgroundColor || '#f8f9fa';
  }

  /**
   * 获取网格颜色
   */
  public getGridColor(): string {
    return this.currentTheme.gridColor || '#e9ecef';
  }
}


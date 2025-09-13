/**
 * 协调统一的裁剪器样式系统
 * 解决裁剪框、拖拽点、背景的整体协调问题
 * 包含真正的棋盘格背景实现
 */

// 统一的主题配置接口
export interface UnifiedCropperTheme {
  name: string;
  
  // 背景系统 - 支持真正的棋盘格
  background: {
    type: 'solid' | 'gradient' | 'checkerboard' | 'texture';
    // 纯色背景
    solid?: {
      color: string;
    };
    // 渐变背景
    gradient?: {
      type: 'linear' | 'radial';
      colors: string[];
      direction?: string;
    };
    // 棋盘格背景
    checkerboard?: {
      size: number;           // 棋盘格大小
      color1: string;         // 浅色方块
      color2: string;         // 深色方块
      opacity: number;        // 整体透明度
    };
    // 纹理背景
    texture?: {
      pattern: string;
      opacity: number;
    };
  };
  
  // 图片区域样式
  imageArea: {
    // 图片周围的填充色（解决白边问题）
    fillColor: string;
    // 图片边框
    border?: {
      width: number;
      color: string;
      style: 'solid' | 'dashed' | 'dotted';
    };
    // 阴影
    shadow?: string;
  };
  
  // 遮罩层（裁剪框外的暗化区域）
  overlay: {
    color: string;
    opacity: number;
    blendMode: 'normal' | 'multiply' | 'overlay' | 'screen';
    animation: {
      duration: number;
      easing: string;
    };
  };
  
  // 裁剪框系统 - 统一设计
  cropBox: {
    // 边框样式
    border: {
      width: number;
      color: string;
      style: 'solid' | 'dashed' | 'dotted' | 'double';
      radius: number;
      // 发光效果
      glow?: {
        color: string;
        size: number;
        intensity: number;
      };
      // 多重阴影
      shadows: string[];
    };
    // 内部样式
    inner: {
      // 内阴影
      shadow?: string;
      // 内边框
      border?: {
        width: number;
        color: string;
        opacity: number;
      };
    };
    // 网格线
    grid: {
      enabled: boolean;
      type: 'thirds' | 'golden' | 'center' | 'custom';
      color: string;
      width: number;
      opacity: number;
      style: 'solid' | 'dashed' | 'dotted';
      // 网格动画
      animation?: {
        type: 'pulse' | 'fade' | 'none';
        duration: number;
      };
    };
  };
  
  // 拖拽点系统 - 与裁剪框协调
  handles: {
    // 基础样式
    base: {
      size: number;
      background: string;
      borderWidth: number;
      borderColor: string;
      borderStyle: 'solid' | 'dashed' | 'dotted';
      shadow: string;
    };
    // 形状系统
    shape: {
      corner: 'square' | 'circle' | 'diamond' | 'rounded-square';
      edge: 'rectangle' | 'circle' | 'pill' | 'line';
      cornerRadius: number;  // 圆角大小
      edgeRadius: number;    // 边缘拖拽点圆角
    };
    // 尺寸系统
    sizing: {
      corner: number;        // 角落点大小
      edge: number;          // 边缘点大小
      hover: number;         // 悬停时的缩放比例
      active: number;        // 激活时的缩放比例
    };
    // 状态样式
    states: {
      hover: {
        background: string;
        borderColor: string;
        shadow: string;
        glow?: {
          color: string;
          size: number;
        };
      };
      active: {
        background: string;
        borderColor: string;
        shadow: string;
        scale: number;
      };
      disabled: {
        background: string;
        borderColor: string;
        opacity: number;
      };
    };
    // 位置调整
    positioning: {
      offset: number;        // 拖拽点偏移量
      cornerOffset: number;  // 角落点额外偏移
      edgeOffset: number;    // 边缘点额外偏移
    };
  };
  
  // 工具栏系统
  toolbar: {
    // 位置和布局
    layout: {
      position: 'top' | 'bottom' | 'left' | 'right' | 'floating';
      offset: number;        // 与裁剪框的距离
      maxWidth: number;      // 最大宽度
      alignment: 'start' | 'center' | 'end';
    };
    // 外观样式
    appearance: {
      background: string;
      borderRadius: number;
      padding: number;
      gap: number;
      shadow: string;
      border?: {
        width: number;
        color: string;
        style: string;
      };
      backdrop?: {
        blur: number;
        opacity: number;
      };
    };
    // 按钮样式
    button: {
      size: number;
      background: string;
      color: string;
      borderRadius: number;
      padding: number;
      fontSize: number;
      fontWeight: number;
      border?: {
        width: number;
        color: string;
        style: string;
      };
      states: {
        hover: {
          background: string;
          color: string;
          transform: string;
          shadow?: string;
        };
        active: {
          background: string;
          color: string;
          transform: string;
          shadow?: string;
        };
      };
    };
  };
  
  // 动画系统
  animations: {
    // 基础动画配置
    base: {
      duration: number;
      easing: string;
    };
    // 特殊动画
    special: {
      hover: {
        duration: number;
        easing: string;
        stagger: number;
      };
      theme: {
        duration: number;
        easing: string;
      };
      grid: {
        duration: number;
        easing: string;
      };
    };
  };
  
  // 响应式配置
  responsive: {
    breakpoint: number;     // 响应式断点
    mobile: {
      handleSize: number;
      toolbarSize: number;
      fontSize: number;
    };
  };
}

// 预设主题 - 协调统一设计
export const UnifiedCropperThemes: Record<string, UnifiedCropperTheme> = {
  // 现代主题 - 蓝色协调系
  modern: {
    name: '现代蓝调',
    background: {
      type: 'checkerboard',
      checkerboard: {
        size: 16,
        color1: '#ffffff',
        color2: '#f8fafc',
        opacity: 1,
      },
    },
    imageArea: {
      fillColor: '#f1f5f9',
      border: {
        width: 1,
        color: 'rgba(59, 130, 246, 0.1)',
        style: 'solid',
      },
      shadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    },
    overlay: {
      color: '#0f172a',
      opacity: 0.6,
      blendMode: 'multiply',
      animation: {
        duration: 300,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
    cropBox: {
      border: {
        width: 2,
        color: '#3b82f6',
        style: 'solid',
        radius: 8,
        glow: {
          color: '#3b82f6',
          size: 8,
          intensity: 0.3,
        },
        shadows: [
          '0 0 0 1px rgba(59, 130, 246, 0.2)',
          '0 4px 20px rgba(59, 130, 246, 0.15)',
        ],
      },
      inner: {
        shadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
        border: {
          width: 1,
          color: 'rgba(255, 255, 255, 0.2)',
          opacity: 0.5,
        },
      },
      grid: {
        enabled: true,
        type: 'thirds',
        color: '#3b82f6',
        width: 1,
        opacity: 0.4,
        style: 'solid',
        animation: {
          type: 'fade',
          duration: 200,
        },
      },
    },
    handles: {
      base: {
        size: 14,
        background: '#ffffff',
        borderWidth: 2,
        borderColor: '#3b82f6',
        borderStyle: 'solid',
        shadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
      },
      shape: {
        corner: 'circle',
        edge: 'pill',
        cornerRadius: 7,
        edgeRadius: 6,
      },
      sizing: {
        corner: 14,
        edge: 12,
        hover: 1.3,
        active: 1.1,
      },
      states: {
        hover: {
          background: '#dbeafe',
          borderColor: '#2563eb',
          shadow: '0 4px 16px rgba(59, 130, 246, 0.4)',
          glow: {
            color: '#3b82f6',
            size: 12,
          },
        },
        active: {
          background: '#3b82f6',
          borderColor: '#1d4ed8',
          shadow: '0 2px 8px rgba(29, 78, 216, 0.5)',
          scale: 1.1,
        },
        disabled: {
          background: '#f1f5f9',
          borderColor: '#cbd5e1',
          opacity: 0.5,
        },
      },
      positioning: {
        offset: 7,
        cornerOffset: 7,
        edgeOffset: 6,
      },
    },
    toolbar: {
      layout: {
        position: 'top',
        offset: 16,
        maxWidth: 400,
        alignment: 'center',
      },
      appearance: {
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        padding: 16,
        gap: 8,
        shadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 16px rgba(0, 0, 0, 0.04)',
        border: {
          width: 1,
          color: 'rgba(59, 130, 246, 0.1)',
          style: 'solid',
        },
        backdrop: {
          blur: 12,
          opacity: 0.95,
        },
      },
      button: {
        size: 40,
        background: 'transparent',
        color: '#64748b',
        borderRadius: 8,
        padding: 8,
        fontSize: 16,
        fontWeight: 500,
        border: {
          width: 1,
          color: 'transparent',
          style: 'solid',
        },
        states: {
          hover: {
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#3b82f6',
            transform: 'translateY(-1px) scale(1.05)',
            shadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
          },
          active: {
            background: '#3b82f6',
            color: '#ffffff',
            transform: 'translateY(0) scale(1)',
            shadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
          },
        },
      },
    },
    animations: {
      base: {
        duration: 250,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      special: {
        hover: {
          duration: 150,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          stagger: 50,
        },
        theme: {
          duration: 400,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        },
        grid: {
          duration: 200,
          easing: 'ease-in-out',
        },
      },
    },
    responsive: {
      breakpoint: 768,
      mobile: {
        handleSize: 16,
        toolbarSize: 36,
        fontSize: 14,
      },
    },
  },

  // 深色主题 - 蓝紫协调系
  dark: {
    name: '深色酷炫',
    background: {
      type: 'checkerboard',
      checkerboard: {
        size: 16,
        color1: '#1e293b',
        color2: '#0f172a',
        opacity: 1,
      },
    },
    imageArea: {
      fillColor: '#0f172a',
    },
    overlay: {
      color: '#000000',
      opacity: 0.8,
      blendMode: 'multiply',
      animation: {
        duration: 300,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
    cropBox: {
      border: {
        width: 2,
        color: '#60a5fa',
        style: 'solid',
        radius: 10,
        glow: {
          color: '#60a5fa',
          size: 12,
          intensity: 0.5,
        },
        shadows: [
          '0 0 0 1px rgba(96, 165, 250, 0.3)',
          '0 4px 24px rgba(96, 165, 250, 0.2)',
        ],
      },
      inner: {
        shadow: 'inset 0 0 0 1px rgba(96, 165, 250, 0.1)',
      },
      grid: {
        enabled: true,
        type: 'thirds',
        color: '#60a5fa',
        width: 1,
        opacity: 0.5,
        style: 'solid',
      },
    },
    handles: {
      base: {
        size: 16,
        background: '#1e293b',
        borderWidth: 2,
        borderColor: '#60a5fa',
        borderStyle: 'solid',
        shadow: '0 3px 12px rgba(96, 165, 250, 0.4)',
      },
      shape: {
        corner: 'rounded-square',
        edge: 'rectangle',
        cornerRadius: 4,
        edgeRadius: 3,
      },
      sizing: {
        corner: 16,
        edge: 14,
        hover: 1.4,
        active: 1.2,
      },
      states: {
        hover: {
          background: '#334155',
          borderColor: '#3b82f6',
          shadow: '0 6px 20px rgba(96, 165, 250, 0.6)',
          glow: {
            color: '#60a5fa',
            size: 16,
          },
        },
        active: {
          background: '#60a5fa',
          borderColor: '#2563eb',
          shadow: '0 3px 12px rgba(37, 99, 235, 0.6)',
          scale: 1.2,
        },
        disabled: {
          background: '#374151',
          borderColor: '#4b5563',
          opacity: 0.4,
        },
      },
      positioning: {
        offset: 8,
        cornerOffset: 8,
        edgeOffset: 7,
      },
    },
    toolbar: {
      layout: {
        position: 'top',
        offset: 20,
        maxWidth: 450,
        alignment: 'center',
      },
      appearance: {
        background: 'rgba(30, 41, 59, 0.95)',
        borderRadius: 16,
        padding: 18,
        gap: 10,
        shadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 16px rgba(0, 0, 0, 0.3)',
        border: {
          width: 1,
          color: 'rgba(96, 165, 250, 0.2)',
          style: 'solid',
        },
        backdrop: {
          blur: 16,
          opacity: 0.9,
        },
      },
      button: {
        size: 42,
        background: 'transparent',
        color: '#cbd5e1',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        fontWeight: 500,
        border: {
          width: 1,
          color: 'rgba(96, 165, 250, 0.2)',
          style: 'solid',
        },
        states: {
          hover: {
            background: 'rgba(96, 165, 250, 0.2)',
            color: '#f8fafc',
            transform: 'translateY(-2px) scale(1.1)',
            shadow: '0 6px 16px rgba(96, 165, 250, 0.3)',
          },
          active: {
            background: '#60a5fa',
            color: '#0f172a',
            transform: 'translateY(0) scale(1.05)',
            shadow: '0 3px 12px rgba(96, 165, 250, 0.4)',
          },
        },
      },
    },
    animations: {
      base: {
        duration: 300,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      special: {
        hover: {
          duration: 200,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          stagger: 60,
        },
        theme: {
          duration: 500,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        },
        grid: {
          duration: 250,
          easing: 'ease-in-out',
        },
      },
    },
    responsive: {
      breakpoint: 768,
      mobile: {
        handleSize: 18,
        toolbarSize: 38,
        fontSize: 14,
      },
    },
  },

  // 创意主题 - 橙色温暖系
  creative: {
    name: '创意橙彩',
    background: {
      type: 'checkerboard',
      checkerboard: {
        size: 20,
        color1: '#fffbeb',
        color2: '#fef3c7',
        opacity: 0.9,
      },
    },
    imageArea: {
      fillColor: '#fef3c7',
      shadow: '0 4px 16px rgba(245, 158, 11, 0.1)',
    },
    overlay: {
      color: '#7c2d12',
      opacity: 0.4,
      blendMode: 'overlay',
      animation: {
        duration: 350,
        easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
    cropBox: {
      border: {
        width: 3,
        color: '#f59e0b',
        style: 'solid',
        radius: 16,
        glow: {
          color: '#f59e0b',
          size: 16,
          intensity: 0.4,
        },
        shadows: [
          '0 0 24px rgba(245, 158, 11, 0.3)',
          '0 4px 16px rgba(245, 158, 11, 0.2)',
        ],
      },
      inner: {
        shadow: 'inset 0 0 0 1px rgba(255, 251, 235, 0.3)',
        border: {
          width: 1,
          color: 'rgba(255, 251, 235, 0.4)',
          opacity: 0.6,
        },
      },
      grid: {
        enabled: true,
        type: 'golden',
        color: '#f59e0b',
        width: 1,
        opacity: 0.6,
        style: 'dashed',
        animation: {
          type: 'pulse',
          duration: 2000,
        },
      },
    },
    handles: {
      base: {
        size: 18,
        background: '#fff7ed',
        borderWidth: 3,
        borderColor: '#f59e0b',
        borderStyle: 'solid',
        shadow: '0 4px 16px rgba(245, 158, 11, 0.4)',
      },
      shape: {
        corner: 'circle',
        edge: 'circle',
        cornerRadius: 9,
        edgeRadius: 8,
      },
      sizing: {
        corner: 18,
        edge: 16,
        hover: 1.5,
        active: 1.3,
      },
      states: {
        hover: {
          background: '#fed7aa',
          borderColor: '#d97706',
          shadow: '0 8px 24px rgba(245, 158, 11, 0.6)',
          glow: {
            color: '#f59e0b',
            size: 20,
          },
        },
        active: {
          background: '#f59e0b',
          borderColor: '#b45309',
          shadow: '0 4px 16px rgba(180, 83, 9, 0.6)',
          scale: 1.3,
        },
        disabled: {
          background: '#fef3c7',
          borderColor: '#fbbf24',
          opacity: 0.6,
        },
      },
      positioning: {
        offset: 9,
        cornerOffset: 9,
        edgeOffset: 8,
      },
    },
    toolbar: {
      layout: {
        position: 'bottom',
        offset: 24,
        maxWidth: 500,
        alignment: 'center',
      },
      appearance: {
        background: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 20,
        padding: 20,
        gap: 12,
        shadow: '0 12px 48px rgba(245, 158, 11, 0.25), 0 4px 20px rgba(0, 0, 0, 0.1)',
        border: {
          width: 2,
          color: 'rgba(245, 158, 11, 0.2)',
          style: 'solid',
        },
        backdrop: {
          blur: 16,
          opacity: 0.9,
        },
      },
      button: {
        size: 46,
        background: 'rgba(245, 158, 11, 0.1)',
        color: '#92400e',
        borderRadius: 12,
        padding: 12,
        fontSize: 18,
        fontWeight: 600,
        border: {
          width: 2,
          color: 'rgba(245, 158, 11, 0.3)',
          style: 'solid',
        },
        states: {
          hover: {
            background: 'rgba(245, 158, 11, 0.2)',
            color: '#7c2d12',
            transform: 'translateY(-3px) scale(1.15)',
            shadow: '0 8px 20px rgba(245, 158, 11, 0.4)',
          },
          active: {
            background: '#f59e0b',
            color: '#ffffff',
            transform: 'translateY(-1px) scale(1.1)',
            shadow: '0 4px 16px rgba(245, 158, 11, 0.5)',
          },
        },
      },
    },
    animations: {
      base: {
        duration: 350,
        easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      special: {
        hover: {
          duration: 250,
          easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          stagger: 80,
        },
        theme: {
          duration: 600,
          easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        },
        grid: {
          duration: 300,
          easing: 'ease-in-out',
        },
      },
    },
    responsive: {
      breakpoint: 768,
      mobile: {
        handleSize: 20,
        toolbarSize: 40,
        fontSize: 16,
      },
    },
  },

  // 专业主题 - 金色精准系
  professional: {
    name: '专业金典',
    background: {
      type: 'checkerboard',
      checkerboard: {
        size: 12,
        color1: '#27272a',
        color2: '#18181b',
        opacity: 1,
      },
    },
    imageArea: {
      fillColor: '#18181b',
    },
    overlay: {
      color: '#000000',
      opacity: 0.85,
      blendMode: 'multiply',
      animation: {
        duration: 200,
        easing: 'ease-out',
      },
    },
    cropBox: {
      border: {
        width: 1,
        color: '#fbbf24',
        style: 'solid',
        radius: 2,
        glow: {
          color: '#fbbf24',
          size: 6,
          intensity: 0.6,
        },
        shadows: [
          '0 0 12px rgba(251, 191, 36, 0.5)',
          'inset 0 0 1px rgba(251, 191, 36, 0.7)',
        ],
      },
      inner: {
        shadow: 'inset 0 0 0 1px rgba(251, 191, 36, 0.1)',
      },
      grid: {
        enabled: true,
        type: 'center',
        color: '#fbbf24',
        width: 0.5,
        opacity: 0.7,
        style: 'solid',
      },
    },
    handles: {
      base: {
        size: 12,
        background: '#18181b',
        borderWidth: 1,
        borderColor: '#fbbf24',
        borderStyle: 'solid',
        shadow: '0 2px 8px rgba(251, 191, 36, 0.5)',
      },
      shape: {
        corner: 'square',
        edge: 'rectangle',
        cornerRadius: 1,
        edgeRadius: 1,
      },
      sizing: {
        corner: 12,
        edge: 10,
        hover: 1.3,
        active: 1.15,
      },
      states: {
        hover: {
          background: '#27272a',
          borderColor: '#f59e0b',
          shadow: '0 4px 12px rgba(251, 191, 36, 0.7)',
          glow: {
            color: '#fbbf24',
            size: 8,
          },
        },
        active: {
          background: '#fbbf24',
          borderColor: '#d97706',
          shadow: '0 2px 8px rgba(217, 119, 6, 0.6)',
          scale: 1.15,
        },
        disabled: {
          background: '#3f3f46',
          borderColor: '#71717a',
          opacity: 0.5,
        },
      },
      positioning: {
        offset: 6,
        cornerOffset: 6,
        edgeOffset: 5,
      },
    },
    toolbar: {
      layout: {
        position: 'floating',
        offset: 0,
        maxWidth: 360,
        alignment: 'end',
      },
      appearance: {
        background: 'rgba(24, 24, 27, 0.97)',
        borderRadius: 8,
        padding: 14,
        gap: 6,
        shadow: '0 4px 24px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(251, 191, 36, 0.3)',
        border: {
          width: 1,
          color: 'rgba(251, 191, 36, 0.4)',
          style: 'solid',
        },
        backdrop: {
          blur: 8,
          opacity: 0.95,
        },
      },
      button: {
        size: 34,
        background: 'transparent',
        color: '#a1a1aa',
        borderRadius: 4,
        padding: 8,
        fontSize: 14,
        fontWeight: 500,
        border: {
          width: 1,
          color: 'rgba(251, 191, 36, 0.3)',
          style: 'solid',
        },
        states: {
          hover: {
            background: 'rgba(251, 191, 36, 0.15)',
            color: '#fbbf24',
            transform: 'translateY(-1px) scale(1.05)',
            shadow: '0 3px 8px rgba(251, 191, 36, 0.3)',
          },
          active: {
            background: '#fbbf24',
            color: '#18181b',
            transform: 'translateY(0) scale(1.02)',
            shadow: '0 2px 6px rgba(251, 191, 36, 0.4)',
          },
        },
      },
    },
    animations: {
      base: {
        duration: 200,
        easing: 'ease-out',
      },
      special: {
        hover: {
          duration: 120,
          easing: 'ease-out',
          stagger: 30,
        },
        theme: {
          duration: 300,
          easing: 'ease-out',
        },
        grid: {
          duration: 150,
          easing: 'ease-out',
        },
      },
    },
    responsive: {
      breakpoint: 768,
      mobile: {
        handleSize: 14,
        toolbarSize: 32,
        fontSize: 12,
      },
    },
  },
};

// 统一样式管理器
export class UnifiedCropperStyleManager {
  private currentTheme: UnifiedCropperTheme;
  private container: HTMLElement;
  private styleElement: HTMLStyleElement;
  
  constructor(container: HTMLElement, themeName: string = 'modern') {
    this.container = container;
    this.currentTheme = UnifiedCropperThemes[themeName] || UnifiedCropperThemes.modern;
    this.styleElement = document.createElement('style');
    document.head.appendChild(this.styleElement);
    this.applyTheme();
  }
  
  /**
   * 切换主题
   */
  setTheme(themeName: string): void {
    if (UnifiedCropperThemes[themeName]) {
      this.currentTheme = UnifiedCropperThemes[themeName];
      this.applyTheme();
    }
  }
  
  /**
   * 生成棋盘格背景
   */
  private generateCheckerboard(config: any): string {
    const { size, color1, color2, opacity } = config;
    return `
      background-image: 
        linear-gradient(45deg, ${color2} 25%, transparent 25%), 
        linear-gradient(-45deg, ${color2} 25%, transparent 25%), 
        linear-gradient(45deg, transparent 75%, ${color2} 75%), 
        linear-gradient(-45deg, transparent 75%, ${color2} 75%);
      background-size: ${size}px ${size}px;
      background-position: 0 0, 0 ${size/2}px, ${size/2}px -${size/2}px, -${size/2}px 0px;
      background-color: ${color1};
      opacity: ${opacity};
    `;
  }
  
  /**
   * 应用主题样式
   */
  private applyTheme(): void {
    const theme = this.currentTheme;
    const containerId = this.container.id || 'unified-cropper';
    
    // 生成背景样式
    let backgroundStyle = '';
    switch (theme.background.type) {
      case 'solid':
        backgroundStyle = `background-color: ${theme.background.solid?.color};`;
        break;
      case 'gradient':
        const gradient = theme.background.gradient!;
        backgroundStyle = `background: ${gradient.type}-gradient(${gradient.direction || '135deg'}, ${gradient.colors.join(', ')});`;
        break;
      case 'checkerboard':
        backgroundStyle = this.generateCheckerboard(theme.background.checkerboard!);
        break;
      case 'texture':
        backgroundStyle = `
          background-image: ${theme.background.texture?.pattern};
          opacity: ${theme.background.texture?.opacity};
        `;
        break;
    }
    
    const css = `
      /* 容器基础样式 */
      #${containerId} {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        user-select: none;
        border-radius: 8px;
        ${backgroundStyle}
      }
      
      /* 图片区域填充 */
      #${containerId} .cropper-image-area {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        ${backgroundStyle}
        z-index: 1;
      }
      
      /* 图片元素 */
      #${containerId} .cropper-image {
        position: absolute;
        max-width: none;
        max-height: none;
        z-index: 2;
        transition: all ${theme.animations.base.duration}ms ${theme.animations.base.easing};
        ${theme.imageArea.border ? `
          border: ${theme.imageArea.border.width}px ${theme.imageArea.border.style} ${theme.imageArea.border.color};
        ` : ''}
        ${theme.imageArea.shadow ? `box-shadow: ${theme.imageArea.shadow};` : ''}
      }
      
      /* 遮罩层 */
      #${containerId} .cropper-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: ${theme.overlay.color};
        opacity: ${theme.overlay.opacity};
        mix-blend-mode: ${theme.overlay.blendMode};
        transition: opacity ${theme.overlay.animation.duration}ms ${theme.overlay.animation.easing};
        z-index: 3;
        pointer-events: none;
      }
      
      /* 裁剪框 */
      #${containerId} .cropper-crop-box {
        position: absolute;
        border: ${theme.cropBox.border.width}px ${theme.cropBox.border.style} ${theme.cropBox.border.color};
        border-radius: ${theme.cropBox.border.radius}px;
        ${theme.cropBox.border.glow ? `
          filter: drop-shadow(0 0 ${theme.cropBox.border.glow.size}px ${theme.cropBox.border.glow.color});
        ` : ''}
        box-shadow: ${theme.cropBox.border.shadows.join(', ')};
        ${theme.cropBox.inner.shadow ? `box-shadow: ${theme.cropBox.inner.shadow}, ${theme.cropBox.border.shadows.join(', ')};` : ''}
        ${theme.cropBox.inner.border ? `
          background: linear-gradient(${theme.cropBox.inner.border.color} 0 0) padding-box,
                     linear-gradient(${theme.cropBox.inner.border.color}) border-box;
          border: ${theme.cropBox.inner.border.width}px solid transparent;
        ` : ''}
        z-index: 4;
        cursor: move;
        transition: all ${theme.animations.base.duration}ms ${theme.animations.base.easing};
      }
      
      /* 网格线 */
      #${containerId} .cropper-grid {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: ${theme.cropBox.grid.enabled ? theme.cropBox.grid.opacity : 0};
        pointer-events: none;
        transition: opacity ${theme.animations.special.grid.duration}ms ${theme.animations.special.grid.easing};
      }
      
      /* 三分法网格 */
      #${containerId} .cropper-grid.thirds::before,
      #${containerId} .cropper-grid.thirds::after {
        content: '';
        position: absolute;
        background: ${theme.cropBox.grid.color};
        opacity: ${theme.cropBox.grid.opacity};
      }
      
      #${containerId} .cropper-grid.thirds::before {
        top: 33.333%;
        left: 0;
        width: 100%;
        height: ${theme.cropBox.grid.width}px;
        box-shadow: 0 33.333% 0 ${theme.cropBox.grid.color};
      }
      
      #${containerId} .cropper-grid.thirds::after {
        top: 0;
        left: 33.333%;
        width: ${theme.cropBox.grid.width}px;
        height: 100%;
        box-shadow: 33.333% 0 0 ${theme.cropBox.grid.color};
      }
      
      /* 黄金分割网格 */
      #${containerId} .cropper-grid.golden::before,
      #${containerId} .cropper-grid.golden::after {
        content: '';
        position: absolute;
        background: ${theme.cropBox.grid.color};
        opacity: ${theme.cropBox.grid.opacity};
      }
      
      #${containerId} .cropper-grid.golden::before {
        top: 38.2%;
        left: 0;
        width: 100%;
        height: ${theme.cropBox.grid.width}px;
        box-shadow: 0 23.6% 0 ${theme.cropBox.grid.color};
      }
      
      #${containerId} .cropper-grid.golden::after {
        top: 0;
        left: 38.2%;
        width: ${theme.cropBox.grid.width}px;
        height: 100%;
        box-shadow: 23.6% 0 0 ${theme.cropBox.grid.color};
      }
      
      /* 中心线网格 */
      #${containerId} .cropper-grid.center::before,
      #${containerId} .cropper-grid.center::after {
        content: '';
        position: absolute;
        background: ${theme.cropBox.grid.color};
        opacity: ${theme.cropBox.grid.opacity};
      }
      
      #${containerId} .cropper-grid.center::before {
        top: 50%;
        left: 0;
        width: 100%;
        height: ${theme.cropBox.grid.width}px;
        transform: translateY(-50%);
      }
      
      #${containerId} .cropper-grid.center::after {
        top: 0;
        left: 50%;
        width: ${theme.cropBox.grid.width}px;
        height: 100%;
        transform: translateX(-50%);
      }
      
      /* 拖拽点基础样式 */
      #${containerId} .cropper-handle {
        position: absolute;
        background: ${theme.handles.base.background};
        border: ${theme.handles.base.borderWidth}px ${theme.handles.base.borderStyle} ${theme.handles.base.borderColor};
        box-shadow: ${theme.handles.base.shadow};
        cursor: pointer;
        transition: all ${theme.animations.special.hover.duration}ms ${theme.animations.special.hover.easing};
        z-index: 5;
        transform-origin: center;
      }
      
      /* 角落拖拽点 */
      #${containerId} .cropper-handle.corner {
        width: ${theme.handles.sizing.corner}px;
        height: ${theme.handles.sizing.corner}px;
        ${theme.handles.shape.corner === 'circle' ? `border-radius: 50%;` : ''}
        ${theme.handles.shape.corner === 'rounded-square' ? `border-radius: ${theme.handles.shape.cornerRadius}px;` : ''}
        ${theme.handles.shape.corner === 'diamond' ? `transform: rotate(45deg);` : ''}
      }
      
      /* 边缘拖拽点 */
      #${containerId} .cropper-handle.edge {
        ${theme.handles.shape.edge === 'circle' ? `border-radius: 50%;` : ''}
        ${theme.handles.shape.edge === 'pill' ? `border-radius: ${theme.handles.shape.edgeRadius}px;` : ''}
      }
      
      #${containerId} .cropper-handle.edge.horizontal {
        width: ${theme.handles.sizing.edge}px;
        height: ${Math.round(theme.handles.sizing.edge * 1.5)}px;
        cursor: ns-resize;
      }
      
      #${containerId} .cropper-handle.edge.vertical {
        width: ${Math.round(theme.handles.sizing.edge * 1.5)}px;
        height: ${theme.handles.sizing.edge}px;
        cursor: ew-resize;
      }
      
      /* 拖拽点悬停效果 */
      #${containerId} .cropper-handle:hover {
        background: ${theme.handles.states.hover.background};
        border-color: ${theme.handles.states.hover.borderColor};
        box-shadow: ${theme.handles.states.hover.shadow};
        transform: scale(${theme.handles.sizing.hover});
        ${theme.handles.states.hover.glow ? `
          filter: drop-shadow(0 0 ${theme.handles.states.hover.glow.size}px ${theme.handles.states.hover.glow.color});
        ` : ''}
      }
      
      /* 拖拽点激活效果 */
      #${containerId} .cropper-handle:active,
      #${containerId} .cropper-handle.active {
        background: ${theme.handles.states.active.background};
        border-color: ${theme.handles.states.active.borderColor};
        box-shadow: ${theme.handles.states.active.shadow};
        transform: scale(${theme.handles.states.active.scale});
      }
      
      /* 拖拽点禁用效果 */
      #${containerId} .cropper-handle:disabled,
      #${containerId} .cropper-handle.disabled {
        background: ${theme.handles.states.disabled.background};
        border-color: ${theme.handles.states.disabled.borderColor};
        opacity: ${theme.handles.states.disabled.opacity};
        cursor: not-allowed;
      }
      
      /* 拖拽点位置 */
      #${containerId} .cropper-handle.nw { 
        top: -${theme.handles.positioning.cornerOffset}px; 
        left: -${theme.handles.positioning.cornerOffset}px; 
        cursor: nw-resize; 
      }
      #${containerId} .cropper-handle.ne { 
        top: -${theme.handles.positioning.cornerOffset}px; 
        right: -${theme.handles.positioning.cornerOffset}px; 
        cursor: ne-resize; 
      }
      #${containerId} .cropper-handle.sw { 
        bottom: -${theme.handles.positioning.cornerOffset}px; 
        left: -${theme.handles.positioning.cornerOffset}px; 
        cursor: sw-resize; 
      }
      #${containerId} .cropper-handle.se { 
        bottom: -${theme.handles.positioning.cornerOffset}px; 
        right: -${theme.handles.positioning.cornerOffset}px; 
        cursor: se-resize; 
      }
      #${containerId} .cropper-handle.n { 
        top: -${theme.handles.positioning.edgeOffset}px; 
        left: 50%; 
        transform: translateX(-50%); 
      }
      #${containerId} .cropper-handle.s { 
        bottom: -${theme.handles.positioning.edgeOffset}px; 
        left: 50%; 
        transform: translateX(-50%); 
      }
      #${containerId} .cropper-handle.w { 
        left: -${theme.handles.positioning.edgeOffset}px; 
        top: 50%; 
        transform: translateY(-50%); 
      }
      #${containerId} .cropper-handle.e { 
        right: -${theme.handles.positioning.edgeOffset}px; 
        top: 50%; 
        transform: translateY(-50%); 
      }
      
      /* 工具栏样式 */
      #${containerId} .cropper-toolbar {
        position: absolute;
        background: ${theme.toolbar.appearance.background};
        border-radius: ${theme.toolbar.appearance.borderRadius}px;
        padding: ${theme.toolbar.appearance.padding}px;
        display: flex;
        flex-wrap: wrap;
        gap: ${theme.toolbar.appearance.gap}px;
        align-items: center;
        justify-content: ${theme.toolbar.layout.alignment};
        max-width: ${theme.toolbar.layout.maxWidth}px;
        box-shadow: ${theme.toolbar.appearance.shadow};
        ${theme.toolbar.appearance.border ? `
          border: ${theme.toolbar.appearance.border.width}px ${theme.toolbar.appearance.border.style} ${theme.toolbar.appearance.border.color};
        ` : ''}
        ${theme.toolbar.appearance.backdrop ? `
          backdrop-filter: blur(${theme.toolbar.appearance.backdrop.blur}px);
          -webkit-backdrop-filter: blur(${theme.toolbar.appearance.backdrop.blur}px);
        ` : ''}
        z-index: 10;
        transition: all ${theme.animations.base.duration}ms ${theme.animations.base.easing};
      }
      
      /* 工具栏位置 */
      #${containerId} .cropper-toolbar.top {
        top: -${theme.toolbar.layout.offset + theme.toolbar.appearance.padding * 2 + 40}px;
        left: 50%;
        transform: translateX(-50%);
      }
      
      #${containerId} .cropper-toolbar.bottom {
        bottom: -${theme.toolbar.layout.offset + theme.toolbar.appearance.padding * 2 + 40}px;
        left: 50%;
        transform: translateX(-50%);
      }
      
      #${containerId} .cropper-toolbar.left {
        left: -${theme.toolbar.layout.offset + theme.toolbar.layout.maxWidth + 20}px;
        top: 50%;
        transform: translateY(-50%);
        flex-direction: column;
      }
      
      #${containerId} .cropper-toolbar.right {
        right: -${theme.toolbar.layout.offset + theme.toolbar.layout.maxWidth + 20}px;
        top: 50%;
        transform: translateY(-50%);
        flex-direction: column;
      }
      
      #${containerId} .cropper-toolbar.floating {
        top: ${theme.toolbar.layout.offset}px;
        right: ${theme.toolbar.layout.offset}px;
      }
      
      /* 工具按钮 */
      #${containerId} .cropper-toolbar button {
        width: ${theme.toolbar.button.size}px;
        height: ${theme.toolbar.button.size}px;
        background: ${theme.toolbar.button.background};
        color: ${theme.toolbar.button.color};
        border-radius: ${theme.toolbar.button.borderRadius}px;
        padding: ${theme.toolbar.button.padding}px;
        font-size: ${theme.toolbar.button.fontSize}px;
        font-weight: ${theme.toolbar.button.fontWeight};
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all ${theme.animations.special.hover.duration}ms ${theme.animations.special.hover.easing};
        user-select: none;
        ${theme.toolbar.button.border ? `
          border: ${theme.toolbar.button.border.width}px ${theme.toolbar.button.border.style} ${theme.toolbar.button.border.color};
        ` : 'border: none;'}
      }
      
      #${containerId} .cropper-toolbar button:hover {
        background: ${theme.toolbar.button.states.hover.background};
        color: ${theme.toolbar.button.states.hover.color};
        transform: ${theme.toolbar.button.states.hover.transform};
        ${theme.toolbar.button.states.hover.shadow ? `box-shadow: ${theme.toolbar.button.states.hover.shadow};` : ''}
      }
      
      #${containerId} .cropper-toolbar button:active,
      #${containerId} .cropper-toolbar button.active {
        background: ${theme.toolbar.button.states.active.background};
        color: ${theme.toolbar.button.states.active.color};
        transform: ${theme.toolbar.button.states.active.transform};
        ${theme.toolbar.button.states.active.shadow ? `box-shadow: ${theme.toolbar.button.states.active.shadow};` : ''}
      }
      
      /* 网格动画 */
      ${theme.cropBox.grid.animation?.type === 'pulse' ? `
        #${containerId} .cropper-grid.pulse {
          animation: gridPulse ${theme.cropBox.grid.animation.duration}ms ease-in-out infinite;
        }
        
        @keyframes gridPulse {
          0%, 100% { opacity: ${theme.cropBox.grid.opacity}; }
          50% { opacity: ${theme.cropBox.grid.opacity * 0.5}; }
        }
      ` : ''}
      
      /* 响应式适配 */
      @media (max-width: ${theme.responsive.breakpoint}px) {
        #${containerId} .cropper-toolbar {
          max-width: ${Math.min(theme.toolbar.layout.maxWidth, 300)}px;
        }
        
        #${containerId} .cropper-toolbar button {
          width: ${theme.responsive.mobile.toolbarSize}px;
          height: ${theme.responsive.mobile.toolbarSize}px;
          font-size: ${theme.responsive.mobile.fontSize}px;
        }
        
        #${containerId} .cropper-handle.corner {
          width: ${theme.responsive.mobile.handleSize}px;
          height: ${theme.responsive.mobile.handleSize}px;
        }
        
        #${containerId} .cropper-handle.edge.horizontal {
          width: ${theme.responsive.mobile.handleSize - 2}px;
          height: ${Math.round((theme.responsive.mobile.handleSize - 2) * 1.5)}px;
        }
        
        #${containerId} .cropper-handle.edge.vertical {
          width: ${Math.round((theme.responsive.mobile.handleSize - 2) * 1.5)}px;
          height: ${theme.responsive.mobile.handleSize - 2}px;
        }
      }
      
      /* 动画类 */
      #${containerId} .cropper-handle.stagger-enter {
        animation: handleStagger ${theme.animations.special.hover.duration}ms ${theme.animations.special.hover.easing} forwards;
      }
      
      @keyframes handleStagger {
        0% { 
          opacity: 0; 
          transform: scale(0.5); 
        }
        100% { 
          opacity: 1; 
          transform: scale(1); 
        }
      }
      
      /* 主题切换动画 */
      #${containerId}.theme-transition * {
        transition: all ${theme.animations.special.theme.duration}ms ${theme.animations.special.theme.easing} !important;
      }
    `;
    
    this.styleElement.textContent = css;
  }
  
  /**
   * 获取当前主题
   */
  getCurrentTheme(): UnifiedCropperTheme {
    return this.currentTheme;
  }
  
  /**
   * 获取所有可用主题
   */
  getAvailableThemes(): string[] {
    return Object.keys(UnifiedCropperThemes);
  }
  
  /**
   * 销毁样式管理器
   */
  destroy(): void {
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
    }
  }
}

// 导出工具函数
export function createUnifiedCropperStyleManager(
  container: HTMLElement, 
  themeName: string = 'modern'
): UnifiedCropperStyleManager {
  return new UnifiedCropperStyleManager(container, themeName);
}

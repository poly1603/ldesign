/**
 * 裁剪器样式系统 - 重新设计的整体样式
 * 包含背景层、裁剪框、拖拽点、工具栏的完整样式方案
 */

// 裁剪器样式主题配置
export interface CropperTheme {
  name: string;
  
  // 背景层样式
  background: {
    color: string;           // 背景颜色
    pattern?: string;        // 背景图案 (可选)
    opacity: number;         // 透明度
    blur: number;           // 模糊程度
  };
  
  // 遮罩层样式 (裁剪框外的暗化区域)
  overlay: {
    color: string;
    opacity: number;
    transition: string;
  };
  
  // 裁剪框样式
  cropBox: {
    border: {
      width: number;
      color: string;
      style: string;        // solid, dashed, dotted
      radius: number;       // 圆角
      shadow?: string;      // 阴影效果
    };
    background: {
      color: string;
      opacity: number;
    };
    // 网格线
    grid: {
      show: boolean;
      color: string;
      width: number;
      opacity: number;
      pattern: 'thirds' | 'golden' | 'grid'; // 三分法、黄金分割、网格
    };
  };
  
  // 拖拽点样式
  handles: {
    size: number;
    color: string;
    borderColor: string;
    borderWidth: number;
    borderRadius: number;
    shadow?: string;
    hoverColor: string;
    hoverScale: number;
    activeColor: string;
    // 不同位置的拖拽点可以有不同样式
    corner: {
      shape: 'square' | 'circle' | 'diamond';
      size?: number;
    };
    edge: {
      shape: 'rectangle' | 'circle' | 'line';
      size?: number;
    };
  };
  
  // 工具栏样式
  toolbar: {
    position: 'top' | 'bottom' | 'left' | 'right' | 'floating';
    background: string;
    borderRadius: number;
    shadow: string;
    padding: string;
    gap: number;
    maxWidth?: number;      // 最大宽度，超出换行
    
    // 工具按钮样式
    button: {
      size: number;
      background: string;
      hoverBackground: string;
      activeBackground: string;
      color: string;
      borderRadius: number;
      fontSize: number;
      padding: string;
      transition: string;
    };
  };
  
  // 动画效果
  animations: {
    duration: number;
    easing: string;
    spring: {
      tension: number;
      friction: number;
    };
  };
}

// 预设主题
export const CropperThemes: Record<string, CropperTheme> = {
  // 现代主题 - 干净简洁
  modern: {
    name: 'Modern',
    background: {
      color: '#f8fafc',
      opacity: 1,
      blur: 0,
    },
    overlay: {
      color: '#000000',
      opacity: 0.5,
      transition: 'opacity 0.3s ease',
    },
    cropBox: {
      border: {
        width: 2,
        color: '#3b82f6',
        style: 'solid',
        radius: 8,
        shadow: '0 0 0 1px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(59, 130, 246, 0.15)',
      },
      background: {
        color: 'transparent',
        opacity: 0,
      },
      grid: {
        show: true,
        color: '#3b82f6',
        width: 1,
        opacity: 0.3,
        pattern: 'thirds',
      },
    },
    handles: {
      size: 12,
      color: '#ffffff',
      borderColor: '#3b82f6',
      borderWidth: 2,
      borderRadius: 6,
      shadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
      hoverColor: '#dbeafe',
      hoverScale: 1.2,
      activeColor: '#bfdbfe',
      corner: {
        shape: 'square',
        size: 14,
      },
      edge: {
        shape: 'rectangle',
        size: 10,
      },
    },
    toolbar: {
      position: 'top',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95))',
      borderRadius: 12,
      shadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)',
      padding: '12px',
      gap: 8,
      maxWidth: 400,
      button: {
        size: 40,
        background: 'transparent',
        hoverBackground: 'rgba(59, 130, 246, 0.1)',
        activeBackground: 'rgba(59, 130, 246, 0.2)',
        color: '#64748b',
        borderRadius: 8,
        fontSize: 16,
        padding: '8px',
        transition: 'all 0.2s ease',
      },
    },
    animations: {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: {
        tension: 300,
        friction: 25,
      },
    },
  },
  
  // 深色主题
  dark: {
    name: 'Dark',
    background: {
      color: '#0f172a',
      opacity: 1,
      blur: 0,
    },
    overlay: {
      color: '#000000',
      opacity: 0.7,
      transition: 'opacity 0.3s ease',
    },
    cropBox: {
      border: {
        width: 2,
        color: '#60a5fa',
        style: 'solid',
        radius: 8,
        shadow: '0 0 0 1px rgba(96, 165, 250, 0.4), 0 4px 20px rgba(96, 165, 250, 0.2)',
      },
      background: {
        color: 'transparent',
        opacity: 0,
      },
      grid: {
        show: true,
        color: '#60a5fa',
        width: 1,
        opacity: 0.4,
        pattern: 'thirds',
      },
    },
    handles: {
      size: 12,
      color: '#1e293b',
      borderColor: '#60a5fa',
      borderWidth: 2,
      borderRadius: 6,
      shadow: '0 2px 12px rgba(96, 165, 250, 0.4)',
      hoverColor: '#334155',
      hoverScale: 1.2,
      activeColor: '#475569',
      corner: {
        shape: 'square',
        size: 14,
      },
      edge: {
        shape: 'rectangle',
        size: 10,
      },
    },
    toolbar: {
      position: 'top',
      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.95))',
      borderRadius: 12,
      shadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)',
      padding: '12px',
      gap: 8,
      maxWidth: 400,
      button: {
        size: 40,
        background: 'transparent',
        hoverBackground: 'rgba(96, 165, 250, 0.15)',
        activeBackground: 'rgba(96, 165, 250, 0.25)',
        color: '#cbd5e1',
        borderRadius: 8,
        fontSize: 16,
        padding: '8px',
        transition: 'all 0.2s ease',
      },
    },
    animations: {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: {
        tension: 300,
        friction: 25,
      },
    },
  },
  
  // 创意主题 - 彩色渐变
  creative: {
    name: 'Creative',
    background: {
      color: '#fef3c7',
      pattern: 'radial-gradient(circle at 20% 20%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)',
      opacity: 1,
      blur: 0,
    },
    overlay: {
      color: '#7c2d12',
      opacity: 0.3,
      transition: 'opacity 0.3s ease',
    },
    cropBox: {
      border: {
        width: 3,
        color: 'linear-gradient(45deg, #f59e0b, #ef4444, #8b5cf6)',
        style: 'solid',
        radius: 12,
        shadow: '0 0 20px rgba(245, 158, 11, 0.3)',
      },
      background: {
        color: 'linear-gradient(45deg, rgba(245, 158, 11, 0.1), rgba(239, 68, 68, 0.1))',
        opacity: 0.5,
      },
      grid: {
        show: true,
        color: '#f59e0b',
        width: 1,
        opacity: 0.6,
        pattern: 'golden',
      },
    },
    handles: {
      size: 14,
      color: '#ffffff',
      borderColor: '#f59e0b',
      borderWidth: 2,
      borderRadius: 50,
      shadow: '0 3px 12px rgba(245, 158, 11, 0.5)',
      hoverColor: '#fef3c7',
      hoverScale: 1.3,
      activeColor: '#fed7aa',
      corner: {
        shape: 'circle',
        size: 16,
      },
      edge: {
        shape: 'circle',
        size: 12,
      },
    },
    toolbar: {
      position: 'bottom',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(254, 243, 199, 0.9))',
      borderRadius: 20,
      shadow: '0 10px 40px rgba(245, 158, 11, 0.2)',
      padding: '16px',
      gap: 12,
      maxWidth: 500,
      button: {
        size: 44,
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(239, 68, 68, 0.1))',
        hoverBackground: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.2))',
        activeBackground: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(239, 68, 68, 0.3))',
        color: '#92400e',
        borderRadius: 12,
        fontSize: 18,
        padding: '10px',
        transition: 'all 0.3s ease',
      },
    },
    animations: {
      duration: 400,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      spring: {
        tension: 250,
        friction: 20,
      },
    },
  },
  
  // 专业主题 - 摄影师风格
  professional: {
    name: 'Professional',
    background: {
      color: '#18181b',
      pattern: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.02) 10px, rgba(255, 255, 255, 0.02) 20px)',
      opacity: 1,
      blur: 0,
    },
    overlay: {
      color: '#000000',
      opacity: 0.8,
      transition: 'opacity 0.3s ease',
    },
    cropBox: {
      border: {
        width: 1,
        color: '#fbbf24',
        style: 'solid',
        radius: 2,
        shadow: '0 0 10px rgba(251, 191, 36, 0.5), inset 0 0 1px rgba(251, 191, 36, 0.8)',
      },
      background: {
        color: 'transparent',
        opacity: 0,
      },
      grid: {
        show: true,
        color: '#fbbf24',
        width: 0.5,
        opacity: 0.8,
        pattern: 'grid',
      },
    },
    handles: {
      size: 8,
      color: '#18181b',
      borderColor: '#fbbf24',
      borderWidth: 1,
      borderRadius: 1,
      shadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
      hoverColor: '#27272a',
      hoverScale: 1.5,
      activeColor: '#3f3f46',
      corner: {
        shape: 'square',
        size: 10,
      },
      edge: {
        shape: 'line',
        size: 6,
      },
    },
    toolbar: {
      position: 'floating',
      background: 'rgba(24, 24, 27, 0.95)',
      borderRadius: 6,
      shadow: '0 4px 20px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(251, 191, 36, 0.3)',
      padding: '8px',
      gap: 4,
      maxWidth: 320,
      button: {
        size: 32,
        background: 'transparent',
        hoverBackground: 'rgba(251, 191, 36, 0.1)',
        activeBackground: 'rgba(251, 191, 36, 0.2)',
        color: '#a1a1aa',
        borderRadius: 4,
        fontSize: 14,
        padding: '6px',
        transition: 'all 0.15s ease',
      },
    },
    animations: {
      duration: 200,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: {
        tension: 400,
        friction: 30,
      },
    },
  },
};

// 裁剪器样式管理器
export class CropperStyleManager {
  private currentTheme: CropperTheme;
  private container: HTMLElement;
  private styleElement: HTMLStyleElement;
  
  constructor(container: HTMLElement, theme: string = 'modern') {
    this.container = container;
    this.currentTheme = CropperThemes[theme] || CropperThemes.modern;
    this.styleElement = document.createElement('style');
    document.head.appendChild(this.styleElement);
    this.applyTheme();
  }
  
  /**
   * 切换主题
   */
  setTheme(themeName: string): void {
    if (CropperThemes[themeName]) {
      this.currentTheme = CropperThemes[themeName];
      this.applyTheme();
    }
  }
  
  /**
   * 应用主题样式
   */
  private applyTheme(): void {
    const theme = this.currentTheme;
    const containerId = this.container.id || 'cropper-container';
    
    const css = `
      /* 裁剪器容器 */
      #${containerId} {
        position: relative;
        width: 100%;
        height: 100%;
        background: ${theme.background.color};
        ${theme.background.pattern ? `background-image: ${theme.background.pattern};` : ''}
        opacity: ${theme.background.opacity};
        overflow: hidden;
        user-select: none;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }
      
      /* 背景层 */
      #${containerId} .cropper-background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: ${theme.background.color};
        ${theme.background.pattern ? `background-image: ${theme.background.pattern};` : ''}
        filter: blur(${theme.background.blur}px);
        z-index: 1;
      }
      
      /* 图片层 */
      #${containerId} .cropper-image {
        position: absolute;
        z-index: 2;
        max-width: none;
        max-height: none;
        transition: transform ${theme.animations.duration}ms ${theme.animations.easing},
                   filter ${theme.animations.duration}ms ${theme.animations.easing};
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
        transition: ${theme.overlay.transition};
        z-index: 3;
        pointer-events: none;
      }
      
      /* 裁剪框 */
      #${containerId} .cropper-crop-box {
        position: absolute;
        border: ${theme.cropBox.border.width}px ${theme.cropBox.border.style};
        border-image: ${theme.cropBox.border.color.includes('gradient') ? 
          `${theme.cropBox.border.color} 1` : 'none'};
        ${!theme.cropBox.border.color.includes('gradient') ? 
          `border-color: ${theme.cropBox.border.color};` : ''}
        border-radius: ${theme.cropBox.border.radius}px;
        ${theme.cropBox.border.shadow ? `box-shadow: ${theme.cropBox.border.shadow};` : ''}
        background: ${theme.cropBox.background.color};
        background-opacity: ${theme.cropBox.background.opacity};
        z-index: 4;
        cursor: move;
        transition: all ${theme.animations.duration}ms ${theme.animations.easing};
      }
      
      /* 网格线 */
      #${containerId} .cropper-grid {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: ${theme.cropBox.grid.show ? theme.cropBox.grid.opacity : 0};
        pointer-events: none;
        transition: opacity ${theme.animations.duration}ms ${theme.animations.easing};
      }
      
      /* 三分法网格 */
      #${containerId} .cropper-grid.thirds::before,
      #${containerId} .cropper-grid.thirds::after {
        content: '';
        position: absolute;
        background: ${theme.cropBox.grid.color};
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
      
      /* 拖拽点通用样式 */
      #${containerId} .cropper-handle {
        position: absolute;
        background: ${theme.handles.color};
        border: ${theme.handles.borderWidth}px solid ${theme.handles.borderColor};
        border-radius: ${theme.handles.borderRadius}px;
        ${theme.handles.shadow ? `box-shadow: ${theme.handles.shadow};` : ''}
        cursor: pointer;
        transition: all ${theme.animations.duration}ms ${theme.animations.easing};
        z-index: 5;
      }
      
      #${containerId} .cropper-handle:hover {
        background: ${theme.handles.hoverColor};
        transform: scale(${theme.handles.hoverScale});
      }
      
      #${containerId} .cropper-handle:active,
      #${containerId} .cropper-handle.active {
        background: ${theme.handles.activeColor};
      }
      
      /* 角落拖拽点 */
      #${containerId} .cropper-handle.corner {
        width: ${theme.handles.corner.size || theme.handles.size}px;
        height: ${theme.handles.corner.size || theme.handles.size}px;
        ${theme.handles.corner.shape === 'circle' ? 'border-radius: 50%;' : ''}
        ${theme.handles.corner.shape === 'diamond' ? 'transform: rotate(45deg);' : ''}
      }
      
      /* 边缘拖拽点 */
      #${containerId} .cropper-handle.edge {
        ${theme.handles.edge.shape === 'circle' ? 'border-radius: 50%;' : ''}
      }
      
      #${containerId} .cropper-handle.edge.horizontal {
        width: ${theme.handles.edge.size || theme.handles.size}px;
        height: ${(theme.handles.edge.size || theme.handles.size) * 2}px;
        cursor: ns-resize;
      }
      
      #${containerId} .cropper-handle.edge.vertical {
        width: ${(theme.handles.edge.size || theme.handles.size) * 2}px;
        height: ${theme.handles.edge.size || theme.handles.size}px;
        cursor: ew-resize;
      }
      
      /* 拖拽点位置 */
      #${containerId} .cropper-handle.nw { top: -${(theme.handles.corner.size || theme.handles.size) / 2}px; left: -${(theme.handles.corner.size || theme.handles.size) / 2}px; cursor: nw-resize; }
      #${containerId} .cropper-handle.ne { top: -${(theme.handles.corner.size || theme.handles.size) / 2}px; right: -${(theme.handles.corner.size || theme.handles.size) / 2}px; cursor: ne-resize; }
      #${containerId} .cropper-handle.sw { bottom: -${(theme.handles.corner.size || theme.handles.size) / 2}px; left: -${(theme.handles.corner.size || theme.handles.size) / 2}px; cursor: sw-resize; }
      #${containerId} .cropper-handle.se { bottom: -${(theme.handles.corner.size || theme.handles.size) / 2}px; right: -${(theme.handles.corner.size || theme.handles.size) / 2}px; cursor: se-resize; }
      #${containerId} .cropper-handle.n { top: -${((theme.handles.edge.size || theme.handles.size) * 2) / 2}px; left: 50%; transform: translateX(-50%); }
      #${containerId} .cropper-handle.s { bottom: -${((theme.handles.edge.size || theme.handles.size) * 2) / 2}px; left: 50%; transform: translateX(-50%); }
      #${containerId} .cropper-handle.w { left: -${((theme.handles.edge.size || theme.handles.size) * 2) / 2}px; top: 50%; transform: translateY(-50%); }
      #${containerId} .cropper-handle.e { right: -${((theme.handles.edge.size || theme.handles.size) * 2) / 2}px; top: 50%; transform: translateY(-50%); }
      
      /* 工具栏样式 */
      #${containerId} .cropper-toolbar {
        position: absolute;
        background: ${theme.toolbar.background};
        border-radius: ${theme.toolbar.borderRadius}px;
        box-shadow: ${theme.toolbar.shadow};
        padding: ${theme.toolbar.padding};
        display: flex;
        flex-wrap: wrap;
        gap: ${theme.toolbar.gap}px;
        align-items: center;
        justify-content: center;
        ${theme.toolbar.maxWidth ? `max-width: ${theme.toolbar.maxWidth}px;` : ''}
        z-index: 10;
        transition: all ${theme.animations.duration}ms ${theme.animations.easing};
      }
      
      /* 工具栏位置 */
      #${containerId} .cropper-toolbar.top {
        top: -60px;
        left: 50%;
        transform: translateX(-50%);
      }
      
      #${containerId} .cropper-toolbar.bottom {
        bottom: -60px;
        left: 50%;
        transform: translateX(-50%);
      }
      
      #${containerId} .cropper-toolbar.left {
        left: -60px;
        top: 50%;
        transform: translateY(-50%);
        flex-direction: column;
      }
      
      #${containerId} .cropper-toolbar.right {
        right: -60px;
        top: 50%;
        transform: translateY(-50%);
        flex-direction: column;
      }
      
      #${containerId} .cropper-toolbar.floating {
        top: 20px;
        right: 20px;
      }
      
      /* 工具按钮 */
      #${containerId} .cropper-toolbar button {
        width: ${theme.toolbar.button.size}px;
        height: ${theme.toolbar.button.size}px;
        background: ${theme.toolbar.button.background};
        color: ${theme.toolbar.button.color};
        border: none;
        border-radius: ${theme.toolbar.button.borderRadius}px;
        font-size: ${theme.toolbar.button.fontSize}px;
        padding: ${theme.toolbar.button.padding};
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: ${theme.toolbar.button.transition};
        user-select: none;
      }
      
      #${containerId} .cropper-toolbar button:hover {
        background: ${theme.toolbar.button.hoverBackground};
        transform: translateY(-2px);
      }
      
      #${containerId} .cropper-toolbar button:active {
        background: ${theme.toolbar.button.activeBackground};
        transform: translateY(0);
      }
      
      /* 滤镜效果类 */
      #${containerId} .cropper-image.filter-brightness { filter: brightness(1.2); }
      #${containerId} .cropper-image.filter-contrast { filter: contrast(1.2); }
      #${containerId} .cropper-image.filter-saturate { filter: saturate(1.3); }
      #${containerId} .cropper-image.filter-grayscale { filter: grayscale(1); }
      #${containerId} .cropper-image.filter-sepia { filter: sepia(1); }
      #${containerId} .cropper-image.filter-vintage { filter: sepia(0.5) contrast(1.2) brightness(1.1); }
      #${containerId} .cropper-image.filter-cool { filter: hue-rotate(180deg) saturate(1.2); }
      #${containerId} .cropper-image.filter-warm { filter: hue-rotate(-30deg) saturate(1.1) brightness(1.05); }
      
      /* 响应式适配 */
      @media (max-width: 768px) {
        #${containerId} .cropper-toolbar {
          ${theme.toolbar.maxWidth ? `max-width: ${Math.min(theme.toolbar.maxWidth, 300)}px;` : 'max-width: 300px;'}
        }
        
        #${containerId} .cropper-toolbar button {
          width: ${Math.max(theme.toolbar.button.size - 4, 32)}px;
          height: ${Math.max(theme.toolbar.button.size - 4, 32)}px;
          font-size: ${Math.max(theme.toolbar.button.fontSize - 2, 12)}px;
        }
        
        #${containerId} .cropper-handle.corner {
          width: ${Math.max((theme.handles.corner.size || theme.handles.size) + 2, 14)}px;
          height: ${Math.max((theme.handles.corner.size || theme.handles.size) + 2, 14)}px;
        }
      }
      
      /* 动画效果 */
      @keyframes cropperPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      
      @keyframes cropperBounce {
        0%, 20%, 53%, 80%, 100% { transform: scale(1); }
        40%, 43% { transform: scale(1.1); }
      }
      
      #${containerId} .cropper-handle.pulse {
        animation: cropperPulse 2s infinite;
      }
      
      #${containerId} .cropper-toolbar.bounce {
        animation: cropperBounce 0.6s ease-in-out;
      }
    `;
    
    this.styleElement.textContent = css;
  }
  
  /**
   * 获取当前主题
   */
  getCurrentTheme(): CropperTheme {
    return this.currentTheme;
  }
  
  /**
   * 获取所有可用主题
   */
  getAvailableThemes(): string[] {
    return Object.keys(CropperThemes);
  }
  
  /**
   * 自定义主题
   */
  setCustomTheme(theme: Partial<CropperTheme>): void {
    this.currentTheme = { ...this.currentTheme, ...theme };
    this.applyTheme();
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
export function createCropperStyleManager(container: HTMLElement, theme: string = 'modern'): CropperStyleManager {
  return new CropperStyleManager(container, theme);
}

// 预设滤镜效果
export const FilterPresets = {
  none: '',
  brightness: 'filter-brightness',
  contrast: 'filter-contrast',
  saturate: 'filter-saturate',
  grayscale: 'filter-grayscale',
  sepia: 'filter-sepia',
  vintage: 'filter-vintage',
  cool: 'filter-cool',
  warm: 'filter-warm',
};

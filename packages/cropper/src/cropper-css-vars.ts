/**
 * 基于CSS变量的裁剪器样式系统
 * 支持主色调配置，所有样式使用CSS变量动态调整
 */

// 主色调配置接口
export interface CropperThemeConfig {
  name: string;
  // 主色调 - 控制所有元素的颜色
  primary: string;           // 主色调 #3b82f6
  primaryLight?: string;     // 浅色变体（自动生成）
  primaryDark?: string;      // 深色变体（自动生成）
  primaryAlpha?: string;     // 半透明变体（自动生成）
  
  // 背景设置
  background: {
    type: 'light' | 'dark';
    checkerboardSize?: number;  // 棋盘格大小，默认16px
  };
  
  // 样式风格
  style: {
    cropBoxRadius?: number;    // 裁剪框圆角，默认8px
    handleShape: 'circle' | 'square' | 'rounded-square';
    handleSize?: number;       // 拖拽点大小，默认14px
    toolbarRadius?: number;    // 工具栏圆角，默认12px
    borderWidth?: number;      // 边框宽度，默认2px
  };
}

// 预设主题配置
export const CropperThemePresets: Record<string, CropperThemeConfig> = {
  blue: {
    name: '蓝色',
    primary: '#3b82f6',
    background: { type: 'light' },
    style: { handleShape: 'circle' }
  },
  indigo: {
    name: '靛蓝',
    primary: '#6366f1',
    background: { type: 'light' },
    style: { handleShape: 'circle' }
  },
  purple: {
    name: '紫色',
    primary: '#8b5cf6',
    background: { type: 'dark' },
    style: { handleShape: 'rounded-square', handleSize: 16 }
  },
  pink: {
    name: '粉色',
    primary: '#ec4899',
    background: { type: 'light' },
    style: { handleShape: 'circle', cropBoxRadius: 12 }
  },
  red: {
    name: '红色',
    primary: '#ef4444',
    background: { type: 'light' },
    style: { handleShape: 'square' }
  },
  orange: {
    name: '橙色',
    primary: '#f59e0b',
    background: { type: 'light', checkerboardSize: 20 },
    style: { 
      handleShape: 'circle', 
      cropBoxRadius: 16,
      handleSize: 18,
      toolbarRadius: 20
    }
  },
  yellow: {
    name: '黄色',
    primary: '#eab308',
    background: { type: 'dark' },
    style: { 
      handleShape: 'square',
      handleSize: 12,
      cropBoxRadius: 4,
      toolbarRadius: 8,
      borderWidth: 1
    }
  },
  green: {
    name: '绿色',
    primary: '#22c55e',
    background: { type: 'light' },
    style: { handleShape: 'rounded-square' }
  },
  emerald: {
    name: '翡翠',
    primary: '#10b981',
    background: { type: 'light' },
    style: { handleShape: 'circle', cropBoxRadius: 10 }
  },
  teal: {
    name: '青色',
    primary: '#14b8a6',
    background: { type: 'dark' },
    style: { handleShape: 'rounded-square', handleSize: 16 }
  },
  cyan: {
    name: '青蓝',
    primary: '#06b6d4',
    background: { type: 'light' },
    style: { handleShape: 'circle' }
  },
  sky: {
    name: '天蓝',
    primary: '#0ea5e9',
    background: { type: 'light' },
    style: { handleShape: 'circle' }
  },
  slate: {
    name: '灰色',
    primary: '#64748b',
    background: { type: 'dark' },
    style: { handleShape: 'square', cropBoxRadius: 6 }
  },
  zinc: {
    name: '锌灰',
    primary: '#71717a',
    background: { type: 'dark' },
    style: { handleShape: 'rounded-square' }
  },
  neutral: {
    name: '中性',
    primary: '#737373',
    background: { type: 'light' },
    style: { handleShape: 'circle' }
  }
};

// CSS变量样式管理器
export class CropperCSSVarStyleManager {
  private container: HTMLElement;
  private styleElement: HTMLStyleElement;
  private currentConfig: CropperThemeConfig;
  
  constructor(container: HTMLElement, themeConfig: string | CropperThemeConfig = 'blue') {
    this.container = container;
    this.currentConfig = typeof themeConfig === 'string' 
      ? CropperThemePresets[themeConfig] || CropperThemePresets.blue
      : themeConfig;
    
    this.styleElement = document.createElement('style');
    document.head.appendChild(this.styleElement);
    this.applyTheme();
  }
  
  /**
   * 设置主题配置
   */
  setTheme(themeConfig: string | CropperThemeConfig): void {
    this.currentConfig = typeof themeConfig === 'string' 
      ? CropperThemePresets[themeConfig] || CropperThemePresets.blue
      : themeConfig;
    this.applyTheme();
  }
  
  /**
   * 设置主色调（保持其他设置不变）
   */
  setPrimaryColor(color: string): void {
    this.currentConfig.primary = color;
    this.applyTheme();
  }
  
  /**
   * 获取当前配置
   */
  getCurrentConfig(): CropperThemeConfig {
    return { ...this.currentConfig };
  }
  
  /**
   * 生成颜色变体
   */
  private generateColorVariants(primary: string) {
    // 简单的颜色变体生成算法
    const hex = primary.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // 生成浅色变体（增加亮度）
    const lightR = Math.min(255, Math.round(r + (255 - r) * 0.7));
    const lightG = Math.min(255, Math.round(g + (255 - g) * 0.7));
    const lightB = Math.min(255, Math.round(b + (255 - b) * 0.7));
    
    // 生成深色变体（降低亮度）
    const darkR = Math.round(r * 0.8);
    const darkG = Math.round(g * 0.8);
    const darkB = Math.round(b * 0.8);
    
    return {
      light: `#${lightR.toString(16).padStart(2, '0')}${lightG.toString(16).padStart(2, '0')}${lightB.toString(16).padStart(2, '0')}`,
      dark: `#${darkR.toString(16).padStart(2, '0')}${darkG.toString(16).padStart(2, '0')}${darkB.toString(16).padStart(2, '0')}`,
      alpha10: `rgba(${r}, ${g}, ${b}, 0.1)`,
      alpha20: `rgba(${r}, ${g}, ${b}, 0.2)`,
      alpha30: `rgba(${r}, ${g}, ${b}, 0.3)`,
      alpha40: `rgba(${r}, ${g}, ${b}, 0.4)`,
      alpha50: `rgba(${r}, ${g}, ${b}, 0.5)`,
      alpha60: `rgba(${r}, ${g}, ${b}, 0.6)`,
      alpha70: `rgba(${r}, ${g}, ${b}, 0.7)`,
      alpha80: `rgba(${r}, ${g}, ${b}, 0.8)`,
      alpha90: `rgba(${r}, ${g}, ${b}, 0.9)`
    };
  }
  
  /**
   * 应用主题样式
   */
  private applyTheme(): void {
    const config = this.currentConfig;
    const containerId = this.container.id || 'cropper-css-vars';
    const colorVariants = this.generateColorVariants(config.primary);
    
    // 设置CSS变量
    const cssVars = `
      /* 主色调变量 */
      --cropper-primary: ${config.primary};
      --cropper-primary-light: ${config.primaryLight || colorVariants.light};
      --cropper-primary-dark: ${config.primaryDark || colorVariants.dark};
      --cropper-primary-alpha-10: ${colorVariants.alpha10};
      --cropper-primary-alpha-20: ${colorVariants.alpha20};
      --cropper-primary-alpha-30: ${colorVariants.alpha30};
      --cropper-primary-alpha-40: ${colorVariants.alpha40};
      --cropper-primary-alpha-50: ${colorVariants.alpha50};
      --cropper-primary-alpha-60: ${colorVariants.alpha60};
      --cropper-primary-alpha-70: ${colorVariants.alpha70};
      --cropper-primary-alpha-80: ${colorVariants.alpha80};
      --cropper-primary-alpha-90: ${colorVariants.alpha90};
      
      /* 背景变量 */
      --cropper-bg-type: ${config.background.type};
      --cropper-checkerboard-size: ${config.background.checkerboardSize || 16}px;
      --cropper-bg-light-1: ${config.background.type === 'light' ? '#ffffff' : '#1e293b'};
      --cropper-bg-light-2: ${config.background.type === 'light' ? '#f8fafc' : '#0f172a'};
      --cropper-overlay-color: ${config.background.type === 'light' ? '#000000' : '#000000'};
      --cropper-overlay-opacity: ${config.background.type === 'light' ? '0.6' : '0.8'};
      
      /* 样式变量 */
      --cropper-border-width: ${config.style.borderWidth || 2}px;
      --cropper-cropbox-radius: ${config.style.cropBoxRadius || 8}px;
      --cropper-handle-size: ${config.style.handleSize || 14}px;
      --cropper-handle-shape: ${config.style.handleShape};
      --cropper-toolbar-radius: ${config.style.toolbarRadius || 12}px;
      
      /* 计算的样式变量 */
      --cropper-handle-radius: ${this.getHandleRadius(config.style.handleShape, config.style.handleSize || 14)};
      --cropper-handle-offset: ${Math.floor((config.style.handleSize || 14) / 2)}px;
    `;
    
    const css = `
      /* CSS变量定义 */
      #${containerId} {
        ${cssVars}
      }
      
      /* 容器基础样式 */
      #${containerId} {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        user-select: none;
        border-radius: 8px;
        /* 棋盘格背景 */
        background-image: 
          linear-gradient(45deg, var(--cropper-bg-light-2) 25%, transparent 25%), 
          linear-gradient(-45deg, var(--cropper-bg-light-2) 25%, transparent 25%), 
          linear-gradient(45deg, transparent 75%, var(--cropper-bg-light-2) 75%), 
          linear-gradient(-45deg, transparent 75%, var(--cropper-bg-light-2) 75%);
        background-size: var(--cropper-checkerboard-size) var(--cropper-checkerboard-size);
        background-position: 
          0 0, 
          0 calc(var(--cropper-checkerboard-size) / 2), 
          calc(var(--cropper-checkerboard-size) / 2) calc(var(--cropper-checkerboard-size) / -2), 
          calc(var(--cropper-checkerboard-size) / -2) 0;
        background-color: var(--cropper-bg-light-1);
      }
      
      /* 图片区域填充层 */
      #${containerId} .cropper-image-area {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: 
          linear-gradient(45deg, var(--cropper-bg-light-2) 25%, transparent 25%), 
          linear-gradient(-45deg, var(--cropper-bg-light-2) 25%, transparent 25%), 
          linear-gradient(45deg, transparent 75%, var(--cropper-bg-light-2) 75%), 
          linear-gradient(-45deg, transparent 75%, var(--cropper-bg-light-2) 75%);
        background-size: var(--cropper-checkerboard-size) var(--cropper-checkerboard-size);
        background-position: 
          0 0, 
          0 calc(var(--cropper-checkerboard-size) / 2), 
          calc(var(--cropper-checkerboard-size) / 2) calc(var(--cropper-checkerboard-size) / -2), 
          calc(var(--cropper-checkerboard-size) / -2) 0;
        background-color: var(--cropper-bg-light-1);
        z-index: 1;
      }
      
      /* 图片元素 */
      #${containerId} .cropper-image {
        position: absolute;
        max-width: none;
        max-height: none;
        z-index: 2;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      
      /* 遮罩层 */
      #${containerId} .cropper-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--cropper-overlay-color);
        opacity: var(--cropper-overlay-opacity);
        mix-blend-mode: multiply;
        transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 3;
        pointer-events: none;
      }
      
      /* 裁剪框 - 使用主色调 */
      #${containerId} .cropper-crop-box {
        position: absolute;
        border: var(--cropper-border-width) solid var(--cropper-primary);
        border-radius: var(--cropper-cropbox-radius);
        box-shadow: 
          0 0 0 1px var(--cropper-primary-alpha-20),
          0 4px 20px var(--cropper-primary-alpha-20),
          inset 0 0 0 1px var(--cropper-primary-alpha-10);
        filter: drop-shadow(0 0 8px var(--cropper-primary-alpha-30));
        z-index: 4;
        cursor: move;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      /* 网格线 - 使用主色调 */
      #${containerId} .cropper-grid {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0.5;
        pointer-events: none;
        transition: opacity 0.2s ease;
      }
      
      /* 三分法网格 */
      #${containerId} .cropper-grid.thirds::before,
      #${containerId} .cropper-grid.thirds::after {
        content: '';
        position: absolute;
        background: var(--cropper-primary);
        opacity: 0.6;
      }
      
      #${containerId} .cropper-grid.thirds::before {
        top: 33.333%;
        left: 0;
        width: 100%;
        height: 1px;
        box-shadow: 0 33.333% 0 var(--cropper-primary);
      }
      
      #${containerId} .cropper-grid.thirds::after {
        top: 0;
        left: 33.333%;
        width: 1px;
        height: 100%;
        box-shadow: 33.333% 0 0 var(--cropper-primary);
      }
      
      /* 拖拽点 - 使用主色调 */
      #${containerId} .cropper-handle {
        position: absolute;
        width: var(--cropper-handle-size);
        height: var(--cropper-handle-size);
        background: white;
        border: 2px solid var(--cropper-primary);
        border-radius: var(--cropper-handle-radius);
        box-shadow: 0 2px 8px var(--cropper-primary-alpha-40);
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 5;
        transform-origin: center;
      }
      
      /* 拖拽点悬停效果 */
      #${containerId} .cropper-handle:hover {
        background: var(--cropper-primary-light);
        border-color: var(--cropper-primary-dark);
        transform: scale(1.3);
        box-shadow: 
          0 4px 16px var(--cropper-primary-alpha-50),
          0 0 0 2px var(--cropper-primary-alpha-20);
        filter: drop-shadow(0 0 12px var(--cropper-primary-alpha-60));
      }
      
      /* 拖拽点激活效果 */
      #${containerId} .cropper-handle:active,
      #${containerId} .cropper-handle.active {
        background: var(--cropper-primary);
        border-color: var(--cropper-primary-dark);
        transform: scale(1.1);
        box-shadow: 0 2px 8px var(--cropper-primary-alpha-60);
        color: white;
      }
      
      /* 拖拽点位置 */
      #${containerId} .cropper-handle.nw { 
        top: calc(var(--cropper-handle-offset) * -1); 
        left: calc(var(--cropper-handle-offset) * -1); 
        cursor: nw-resize; 
      }
      #${containerId} .cropper-handle.ne { 
        top: calc(var(--cropper-handle-offset) * -1); 
        right: calc(var(--cropper-handle-offset) * -1); 
        cursor: ne-resize; 
      }
      #${containerId} .cropper-handle.sw { 
        bottom: calc(var(--cropper-handle-offset) * -1); 
        left: calc(var(--cropper-handle-offset) * -1); 
        cursor: sw-resize; 
      }
      #${containerId} .cropper-handle.se { 
        bottom: calc(var(--cropper-handle-offset) * -1); 
        right: calc(var(--cropper-handle-offset) * -1); 
        cursor: se-resize; 
      }
      #${containerId} .cropper-handle.n { 
        top: calc(var(--cropper-handle-offset) * -1); 
        left: 50%; 
        transform: translateX(-50%); 
        cursor: n-resize;
      }
      #${containerId} .cropper-handle.s { 
        bottom: calc(var(--cropper-handle-offset) * -1); 
        left: 50%; 
        transform: translateX(-50%); 
        cursor: s-resize;
      }
      #${containerId} .cropper-handle.w { 
        left: calc(var(--cropper-handle-offset) * -1); 
        top: 50%; 
        transform: translateY(-50%); 
        cursor: w-resize;
      }
      #${containerId} .cropper-handle.e { 
        right: calc(var(--cropper-handle-offset) * -1); 
        top: 50%; 
        transform: translateY(-50%); 
        cursor: e-resize;
      }
      
      /* 工具栏 - 使用主色调 */
      #${containerId} .cropper-toolbar {
        position: absolute;
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid var(--cropper-primary-alpha-20);
        border-radius: var(--cropper-toolbar-radius);
        padding: 16px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        justify-content: center;
        max-width: 400px;
        box-shadow: 
          0 8px 32px rgba(0, 0, 0, 0.08), 
          0 2px 16px rgba(0, 0, 0, 0.04),
          0 0 0 1px var(--cropper-primary-alpha-10);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        z-index: 10;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      /* 工具栏位置 */
      #${containerId} .cropper-toolbar.top {
        top: -76px;
        left: 50%;
        transform: translateX(-50%);
      }
      
      #${containerId} .cropper-toolbar.bottom {
        bottom: -76px;
        left: 50%;
        transform: translateX(-50%);
      }
      
      #${containerId} .cropper-toolbar.left {
        left: -420px;
        top: 50%;
        transform: translateY(-50%);
        flex-direction: column;
      }
      
      #${containerId} .cropper-toolbar.right {
        right: -420px;
        top: 50%;
        transform: translateY(-50%);
        flex-direction: column;
      }
      
      #${containerId} .cropper-toolbar.floating {
        top: 16px;
        right: 16px;
      }
      
      /* 工具按钮 - 使用主色调 */
      #${containerId} .cropper-toolbar button {
        width: 40px;
        height: 40px;
        background: transparent;
        color: #64748b;
        border: 1px solid transparent;
        border-radius: 8px;
        padding: 8px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        user-select: none;
      }
      
      #${containerId} .cropper-toolbar button:hover {
        background: var(--cropper-primary-alpha-10);
        color: var(--cropper-primary);
        border-color: var(--cropper-primary-alpha-20);
        transform: translateY(-1px) scale(1.05);
        box-shadow: 0 4px 12px var(--cropper-primary-alpha-20);
      }
      
      #${containerId} .cropper-toolbar button:active,
      #${containerId} .cropper-toolbar button.active {
        background: var(--cropper-primary);
        color: white;
        border-color: var(--cropper-primary-dark);
        transform: translateY(0) scale(1);
        box-shadow: 0 2px 8px var(--cropper-primary-alpha-40);
      }
      
      /* 响应式适配 */
      @media (max-width: 768px) {
        #${containerId} .cropper-toolbar {
          max-width: 300px;
        }
        
        #${containerId} .cropper-toolbar button {
          width: 36px;
          height: 36px;
          font-size: 14px;
        }
        
        #${containerId} .cropper-handle {
          width: calc(var(--cropper-handle-size) + 2px);
          height: calc(var(--cropper-handle-size) + 2px);
        }
      }
      
      /* 主题切换动画 */
      #${containerId}.theme-transition * {
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      
      /* 深色背景模式适配 */
      #${containerId}[data-bg-type="dark"] .cropper-toolbar {
        background: rgba(30, 41, 59, 0.95);
        color: #cbd5e1;
      }
      
      #${containerId}[data-bg-type="dark"] .cropper-toolbar button {
        color: #cbd5e1;
        border-color: var(--cropper-primary-alpha-30);
      }
      
      #${containerId}[data-bg-type="dark"] .cropper-toolbar button:hover {
        background: var(--cropper-primary-alpha-20);
        color: var(--cropper-primary-light);
      }
    `;
    
    this.styleElement.textContent = css;
    
    // 设置容器的数据属性
    this.container.setAttribute('data-bg-type', config.background.type);
  }
  
  /**
   * 获取拖拽点圆角值
   */
  private getHandleRadius(shape: string, size: number): string {
    switch (shape) {
      case 'circle':
        return '50%';
      case 'rounded-square':
        return `${Math.floor(size * 0.3)}px`;
      case 'square':
      default:
        return '2px';
    }
  }
  
  /**
   * 获取所有预设主题
   */
  getAvailablePresets(): Array<{ key: string; config: CropperThemeConfig }> {
    return Object.entries(CropperThemePresets).map(([key, config]) => ({
      key,
      config
    }));
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
export function createCropperCSSVarStyleManager(
  container: HTMLElement,
  themeConfig: string | CropperThemeConfig = 'blue'
): CropperCSSVarStyleManager {
  return new CropperCSSVarStyleManager(container, themeConfig);
}

// 颜色工具函数
export class ColorUtils {
  /**
   * 将十六进制颜色转换为RGB
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
  
  /**
   * 将RGB颜色转换为十六进制
   */
  static rgbToHex(r: number, g: number, b: number): string {
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  }
  
  /**
   * 生成颜色的亮色变体
   */
  static lighten(hex: string, percent: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;
    
    const { r, g, b } = rgb;
    const amount = Math.round(255 * percent);
    
    return this.rgbToHex(
      Math.min(255, r + amount),
      Math.min(255, g + amount),
      Math.min(255, b + amount)
    );
  }
  
  /**
   * 生成颜色的深色变体
   */
  static darken(hex: string, percent: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;
    
    const { r, g, b } = rgb;
    const amount = Math.round(255 * percent);
    
    return this.rgbToHex(
      Math.max(0, r - amount),
      Math.max(0, g - amount),
      Math.max(0, b - amount)
    );
  }
  
  /**
   * 生成颜色的半透明变体
   */
  static alpha(hex: string, opacity: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;
    
    const { r, g, b } = rgb;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
}

/**
 * MarkerShapes - 标记形状库
 * 提供各种内置标记形状的 SVG 定义
 */

/**
 * 标记形状接口
 */
export interface MarkerShape {
  name: string;
  svg: string;
  width: number;
  height: number;
  anchorX: number;
  anchorY: number;
}

/**
 * 预定义的标记形状
 */
export const MarkerShapes: Record<string, MarkerShape> = {
  /**
   * 圆形
   */
  circle: {
    name: 'circle',
    svg: `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="currentColor" stroke="white" stroke-width="2"/>
      </svg>
    `,
    width: 24,
    height: 24,
    anchorX: 12,
    anchorY: 12
  },

  /**
   * 方形
   */
  square: {
    name: 'square',
    svg: `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" fill="currentColor" stroke="white" stroke-width="2"/>
      </svg>
    `,
    width: 24,
    height: 24,
    anchorX: 12,
    anchorY: 12
  },

  /**
   * 三角形
   */
  triangle: {
    name: 'triangle',
    svg: `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2 L22 22 L2 22 Z" fill="currentColor" stroke="white" stroke-width="2"/>
      </svg>
    `,
    width: 24,
    height: 24,
    anchorX: 12,
    anchorY: 16
  },

  /**
   * 菱形
   */
  diamond: {
    name: 'diamond',
    svg: `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2 L22 12 L12 22 L2 12 Z" fill="currentColor" stroke="white" stroke-width="2"/>
      </svg>
    `,
    width: 24,
    height: 24,
    anchorX: 12,
    anchorY: 12
  },

  /**
   * 星形（五角星）
   */
  star: {
    name: 'star',
    svg: `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2 L14.5 9 L22 9.5 L16.5 14.5 L18 22 L12 18 L6 22 L7.5 14.5 L2 9.5 L9.5 9 Z" 
              fill="currentColor" stroke="white" stroke-width="1.5"/>
      </svg>
    `,
    width: 24,
    height: 24,
    anchorX: 12,
    anchorY: 12
  },

  /**
   * 心形
   */
  heart: {
    name: 'heart',
    svg: `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
              fill="currentColor" stroke="white" stroke-width="1.5"/>
      </svg>
    `,
    width: 24,
    height: 24,
    anchorX: 12,
    anchorY: 21
  },

  /**
   * 图钉
   */
  pin: {
    name: 'pin',
    svg: `
      <svg width="24" height="36" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12zm0 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" 
              fill="currentColor" stroke="white" stroke-width="1.5"/>
      </svg>
    `,
    width: 24,
    height: 36,
    anchorX: 12,
    anchorY: 36
  },

  /**
   * 箭头（向上）
   */
  arrowUp: {
    name: 'arrowUp',
    svg: `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2 L22 12 L16 12 L16 22 L8 22 L8 12 L2 12 Z" 
              fill="currentColor" stroke="white" stroke-width="1.5"/>
      </svg>
    `,
    width: 24,
    height: 24,
    anchorX: 12,
    anchorY: 12
  },

  /**
   * 箭头（向下）
   */
  arrowDown: {
    name: 'arrowDown',
    svg: `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22 L22 12 L16 12 L16 2 L8 2 L8 12 L2 12 Z" 
              fill="currentColor" stroke="white" stroke-width="1.5"/>
      </svg>
    `,
    width: 24,
    height: 24,
    anchorX: 12,
    anchorY: 12
  },

  /**
   * 箭头（向右）
   */
  arrowRight: {
    name: 'arrowRight',
    svg: `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 12 L12 22 L12 16 L2 16 L2 8 L12 8 L12 2 Z" 
              fill="currentColor" stroke="white" stroke-width="1.5"/>
      </svg>
    `,
    width: 24,
    height: 24,
    anchorX: 12,
    anchorY: 12
  },

  /**
   * 箭头（向左）
   */
  arrowLeft: {
    name: 'arrowLeft',
    svg: `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 12 L12 2 L12 8 L22 8 L22 16 L12 16 L12 22 Z" 
              fill="currentColor" stroke="white" stroke-width="1.5"/>
      </svg>
    `,
    width: 24,
    height: 24,
    anchorX: 12,
    anchorY: 12
  },

  /**
   * 旗帜
   */
  flag: {
    name: 'flag',
    svg: `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 2 L4 22 M4 2 L20 8 L4 14 Z" 
              fill="currentColor" stroke="white" stroke-width="2" stroke-linejoin="round"/>
      </svg>
    `,
    width: 24,
    height: 24,
    anchorX: 4,
    anchorY: 22
  },

  /**
   * 六边形
   */
  hexagon: {
    name: 'hexagon',
    svg: `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2 L21 7 L21 17 L12 22 L3 17 L3 7 Z" 
              fill="currentColor" stroke="white" stroke-width="2"/>
      </svg>
    `,
    width: 24,
    height: 24,
    anchorX: 12,
    anchorY: 12
  },

  /**
   * 十字
   */
  cross: {
    name: 'cross',
    svg: `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 2 L15 2 L15 9 L22 9 L22 15 L15 15 L15 22 L9 22 L9 15 L2 15 L2 9 L9 9 Z" 
              fill="currentColor" stroke="white" stroke-width="1.5"/>
      </svg>
    `,
    width: 24,
    height: 24,
    anchorX: 12,
    anchorY: 12
  },

  /**
   * 加号
   */
  plus: {
    name: 'plus',
    svg: `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="currentColor" stroke="white" stroke-width="2"/>
        <path d="M12 7 L12 17 M7 12 L17 12" stroke="white" stroke-width="3" stroke-linecap="round"/>
      </svg>
    `,
    width: 24,
    height: 24,
    anchorX: 12,
    anchorY: 12
  },

  /**
   * 减号
   */
  minus: {
    name: 'minus',
    svg: `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="currentColor" stroke="white" stroke-width="2"/>
        <path d="M7 12 L17 12" stroke="white" stroke-width="3" stroke-linecap="round"/>
      </svg>
    `,
    width: 24,
    height: 24,
    anchorX: 12,
    anchorY: 12
  },

  /**
   * 警告（感叹号）
   */
  warning: {
    name: 'warning',
    svg: `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2 L22 22 L2 22 Z" fill="currentColor" stroke="white" stroke-width="2"/>
        <path d="M12 8 L12 14 M12 16 L12 18" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    `,
    width: 24,
    height: 24,
    anchorX: 12,
    anchorY: 16
  },

  /**
   * 信息
   */
  info: {
    name: 'info',
    svg: `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="currentColor" stroke="white" stroke-width="2"/>
        <path d="M12 8 L12 10 M12 12 L12 18" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    `,
    width: 24,
    height: 24,
    anchorX: 12,
    anchorY: 12
  }
};

/**
 * 获取标记形状
 */
export function getMarkerShape(name: string): MarkerShape | undefined {
  return MarkerShapes[name];
}

/**
 * 获取所有标记形状名称
 */
export function getAllMarkerShapeNames(): string[] {
  return Object.keys(MarkerShapes);
}

/**
 * 创建自定义标记形状
 */
export function createCustomShape(
  name: string,
  svg: string,
  width: number = 24,
  height: number = 24,
  anchorX?: number,
  anchorY?: number
): MarkerShape {
  return {
    name,
    svg,
    width,
    height,
    anchorX: anchorX !== undefined ? anchorX : width / 2,
    anchorY: anchorY !== undefined ? anchorY : height / 2
  };
}

/**
 * 将 SVG 转换为 Data URL
 */
export function svgToDataUrl(svg: string): string {
  const cleaned = svg.trim();
  const encoded = encodeURIComponent(cleaned);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

/**
 * 将颜色应用到 SVG
 */
export function applySvgColor(svg: string, color: number[]): string {
  const [r, g, b, a = 255] = color;
  const rgbaColor = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
  return svg.replace(/currentColor/g, rgbaColor);
}










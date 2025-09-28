/**
 * Ripple组件的配置选项
 */
export interface RippleOptions {
  /** 波纹颜色 */
  color?: string;
  /** 波纹透明度 */
  opacity?: number;
  /** 波纹扩散持续时间(毫秒) */
  duration?: number;
  /** 波纹消失持续时间(毫秒) */
  fadeOutDuration?: number;
  /** 波纹半径，'auto'表示自动计算最大半径 */
  radius?: number | 'auto';
  /** 是否居中显示波纹 */
  centered?: boolean;
  /** 是否禁用波纹效果 */
  disabled?: boolean;
  /** 波纹触发方式 */
  trigger?: 'click' | 'mousedown' | 'pointerdown';
  /** 是否在触摸设备上启用 */
  touchEnabled?: boolean;
  /** 波纹缓动函数 */
  easing?: string;
  /** 波纹的最大数量，超过则移除最旧的 */
  maxRipples?: number;
  /** 是否在父元素范围内裁剪波纹 */
  unbounded?: boolean;
}

/**
 * 波纹实例
 */
export interface RippleInstance {
  element: HTMLElement;
  startTime: number;
  x: number;
  y: number;
  size: number;
  isRemoving: boolean;
}

/**
 * Ripple组件的属性
 */
export interface RippleAttributes {
  'ripple-color'?: string;
  'ripple-opacity'?: string;
  'ripple-duration'?: string;
  'ripple-fade-out-duration'?: string;
  'ripple-radius'?: string;
  'ripple-centered'?: string;
  'ripple-disabled'?: string;
  'ripple-trigger'?: string;
  'ripple-touch-enabled'?: string;
  'ripple-easing'?: string;
  'ripple-max-ripples'?: string;
  'ripple-unbounded'?: string;
}

/**
 * Ripple组件事件
 */
export interface RippleEvents {
  rippleStart: CustomEvent<{ x: number; y: number }>;
  rippleEnd: CustomEvent<void>;
}
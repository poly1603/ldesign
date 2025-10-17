/**
 * 默认配置常量
 */
export const DEFAULT_CONFIG = {
  NODE_GAP: 100,
  LEVEL_GAP: 140,
  NODE_WIDTH: 160,
  NODE_HEIGHT: 60,
  EDGE_STROKE_WIDTH: 2,
  ARROW_SIZE: 10,
  ENABLE_ZOOM: true,
  ENABLE_PAN: true,
  ENABLE_NODE_DRAG: true,
  AUTO_LAYOUT: true
} as const;

/**
 * 节点形状类型
 */
export const NODE_SHAPES = {
  RECTANGLE: 'rectangle',
  ROUNDED_RECTANGLE: 'rounded-rectangle',
  CIRCLE: 'circle',
  DIAMOND: 'diamond',
  ELLIPSE: 'ellipse'
} as const;

/**
 * 布局方向
 */
export const LAYOUT_DIRECTION = {
  TOP_TO_BOTTOM: 'TB',
  LEFT_TO_RIGHT: 'LR'
} as const;



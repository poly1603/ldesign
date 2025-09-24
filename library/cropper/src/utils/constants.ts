/**
 * 图片裁剪器常量定义
 * 包含浏览器检测、命名空间、元素标签名、动作类型、事件名称等常量
 */

// 浏览器环境检测
export const IS_BROWSER = typeof window !== 'undefined' && typeof window.document !== 'undefined';
export const WINDOW: any = IS_BROWSER ? window : {};
export const IS_TOUCH_DEVICE = IS_BROWSER ? 'ontouchstart' in WINDOW.document.documentElement : false;
export const HAS_POINTER_EVENT = IS_BROWSER ? 'PointerEvent' in WINDOW : false;

// 命名空间和元素标签名
export const NAMESPACE = 'cropper';
export const CROPPER_CANVAS = `${NAMESPACE}-canvas`;
export const CROPPER_CROSSHAIR = `${NAMESPACE}-crosshair`;
export const CROPPER_GRID = `${NAMESPACE}-grid`;
export const CROPPER_HANDLE = `${NAMESPACE}-handle`;
export const CROPPER_IMAGE = `${NAMESPACE}-image`;
export const CROPPER_SELECTION = `${NAMESPACE}-selection`;
export const CROPPER_SHADE = `${NAMESPACE}-shade`;
export const CROPPER_VIEWER = `${NAMESPACE}-viewer`;

// 动作类型常量
export const ACTION_SELECT = 'select';
export const ACTION_MOVE = 'move';
export const ACTION_SCALE = 'scale';
export const ACTION_ROTATE = 'rotate';
export const ACTION_TRANSFORM = 'transform';
export const ACTION_NONE = 'none';
export const ACTION_RESIZE_NORTH = 'n-resize';
export const ACTION_RESIZE_EAST = 'e-resize';
export const ACTION_RESIZE_SOUTH = 's-resize';
export const ACTION_RESIZE_WEST = 'w-resize';
export const ACTION_RESIZE_NORTHEAST = 'ne-resize';
export const ACTION_RESIZE_NORTHWEST = 'nw-resize';
export const ACTION_RESIZE_SOUTHEAST = 'se-resize';
export const ACTION_RESIZE_SOUTHWEST = 'sw-resize';

// 属性名称常量
export const ATTRIBUTE_ACTION = 'action';

// 原生事件名称
export const EVENT_TOUCH_END = IS_TOUCH_DEVICE ? 'touchend touchcancel' : 'mouseup';
export const EVENT_TOUCH_MOVE = IS_TOUCH_DEVICE ? 'touchmove' : 'mousemove';
export const EVENT_TOUCH_START = IS_TOUCH_DEVICE ? 'touchstart' : 'mousedown';
export const EVENT_POINTER_DOWN = HAS_POINTER_EVENT ? 'pointerdown' : EVENT_TOUCH_START;
export const EVENT_POINTER_MOVE = HAS_POINTER_EVENT ? 'pointermove' : EVENT_TOUCH_MOVE;
export const EVENT_POINTER_UP = HAS_POINTER_EVENT ? 'pointerup pointercancel' : EVENT_TOUCH_END;
export const EVENT_ERROR = 'error';
export const EVENT_KEYDOWN = 'keydown';
export const EVENT_LOAD = 'load';
export const EVENT_RESIZE = 'resize';
export const EVENT_WHEEL = 'wheel';

// 自定义事件名称
export const EVENT_ACTION = 'action';
export const EVENT_ACTION_END = 'actionend';
export const EVENT_ACTION_MOVE = 'actionmove';
export const EVENT_ACTION_START = 'actionstart';
export const EVENT_CHANGE = 'change';
export const EVENT_TRANSFORM = 'transform';

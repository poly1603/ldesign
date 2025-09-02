/**
 * Modal 模态框组件类型定义
 */

/**
 * 模态框动画类型
 */
export type ModalAnimation = 'fade' | 'zoom' | 'slide-up' | 'slide-down';

/**
 * 模态框按钮类型
 */
export type ModalButtonType = 'default' | 'primary' | 'dashed' | 'text' | 'link';

/**
 * 模态框属性接口
 */
export interface ModalProps {
  /**
   * 是否可见
   */
  visible?: boolean;

  /**
   * 模态框标题
   */
  title?: string;

  /**
   * 模态框宽度
   */
  width?: string | number;

  /**
   * 模态框高度
   */
  height?: string | number;

  /**
   * 是否显示关闭按钮
   */
  closable?: boolean;

  /**
   * 是否显示遮罩层
   */
  mask?: boolean;

  /**
   * 点击遮罩层是否关闭
   */
  maskClosable?: boolean;

  /**
   * 是否支持键盘 ESC 关闭
   */
  keyboard?: boolean;

  /**
   * 是否居中显示
   */
  centered?: boolean;

  /**
   * 是否可拖拽
   */
  draggable?: boolean;

  /**
   * 是否可调整大小
   */
  resizable?: boolean;

  /**
   * 是否全屏显示
   */
  fullscreen?: boolean;

  /**
   * 是否显示底部操作区域
   */
  footer?: boolean;

  /**
   * 确认按钮文本
   */
  okText?: string;

  /**
   * 取消按钮文本
   */
  cancelText?: string;

  /**
   * 确认按钮类型
   */
  okType?: ModalButtonType;

  /**
   * 确认按钮是否加载中
   */
  confirmLoading?: boolean;

  /**
   * 自定义样式类名
   */
  customClass?: string;

  /**
   * z-index 层级
   */
  zIndex?: number;

  /**
   * 动画名称
   */
  animation?: ModalAnimation;
}

/**
 * 模态框事件接口
 */
export interface ModalEvents {
  /**
   * 打开事件
   */
  ldOpen: () => void;

  /**
   * 关闭事件
   */
  ldClose: () => void;

  /**
   * 确认事件
   */
  ldOk: () => void;

  /**
   * 取消事件
   */
  ldCancel: () => void;
}

/**
 * 模态框方法接口
 */
export interface ModalMethods {
  /**
   * 打开模态框
   */
  open(): Promise<void>;

  /**
   * 关闭模态框
   */
  close(): Promise<void>;
}

/**
 * 模态框插槽接口
 */
export interface ModalSlots {
  /**
   * 默认插槽 - 模态框内容
   */
  default: any;

  /**
   * 底部插槽 - 自定义底部操作区域
   */
  footer: any;
}

/**
 * 模态框配置选项
 */
export interface ModalConfig extends ModalProps {
  /**
   * 模态框内容
   */
  content?: string | HTMLElement;

  /**
   * 确认回调
   */
  onOk?: () => void | Promise<void>;

  /**
   * 取消回调
   */
  onCancel?: () => void;

  /**
   * 关闭回调
   */
  onClose?: () => void;
}

/**
 * 模态框实例接口
 */
export interface ModalInstance extends ModalMethods {
  /**
   * 模态框元素
   */
  element: HTMLElement;

  /**
   * 更新配置
   */
  update(config: Partial<ModalConfig>): void;

  /**
   * 销毁模态框
   */
  destroy(): void;
}

/**
 * 模态框服务接口
 */
export interface ModalService {
  /**
   * 显示信息模态框
   */
  info(config: ModalConfig): ModalInstance;

  /**
   * 显示成功模态框
   */
  success(config: ModalConfig): ModalInstance;

  /**
   * 显示警告模态框
   */
  warning(config: ModalConfig): ModalInstance;

  /**
   * 显示错误模态框
   */
  error(config: ModalConfig): ModalInstance;

  /**
   * 显示确认模态框
   */
  confirm(config: ModalConfig): ModalInstance;

  /**
   * 关闭所有模态框
   */
  destroyAll(): void;
}

/**
 * 拖拽状态接口
 */
export interface DragState {
  /**
   * 是否正在拖拽
   */
  isDragging: boolean;

  /**
   * 拖拽起始位置
   */
  startPosition: { x: number; y: number };

  /**
   * 当前偏移量
   */
  offset: { x: number; y: number };
}

/**
 * 调整大小状态接口
 */
export interface ResizeState {
  /**
   * 是否正在调整大小
   */
  isResizing: boolean;

  /**
   * 调整方向
   */
  direction: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

  /**
   * 起始尺寸
   */
  startSize: { width: number; height: number };

  /**
   * 起始位置
   */
  startPosition: { x: number; y: number };
}

/**
 * 模态框层级管理器接口
 */
export interface ModalZIndexManager {
  /**
   * 获取下一个 z-index
   */
  getNextZIndex(): number;

  /**
   * 注册模态框
   */
  register(modal: HTMLElement): void;

  /**
   * 注销模态框
   */
  unregister(modal: HTMLElement): void;

  /**
   * 获取当前最高层级的模态框
   */
  getTopModal(): HTMLElement | null;
}

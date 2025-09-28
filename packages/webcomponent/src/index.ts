/**
 * LDesign WebComponent 组件库入口文件
 */

// 导出所有组件
export * from './components';

// 导出工具函数
export * from './utils';

// 导出全局类型（避免与组件类型冲突）
export type {
  Size,
  ButtonType,
  ButtonColor, 
  ButtonShape,
  ButtonIconPosition,
  NativeButtonType,
  InputType,
  Theme,
  ComponentStatus,
  EventHandler,
  BaseComponentProps,
  ButtonProps,
  InputProps,
  CheckboxProps,
  RadioProps,
  SwitchProps,
  IconProps,
  MentionItem,
  MentionTriggerConfig,
  MentionEntity,
  MentionSegment,
  MentionModel,
  MentionProps,
  ComponentConfig
} from './types';

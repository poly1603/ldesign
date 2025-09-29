/**
 * Button 组件导出文件
 */

// 导出组件
export { LdesignButton } from './button';

// 导出非冲突类型（不导出 ButtonType, ButtonShape, ButtonIconPosition，使用全局类型）
export type { 
  ButtonSize, 
  ButtonHTMLType, 
  ButtonVariant,
  ButtonColor,
  PresetColors,
  SemanticDOM,
  LoadingConfig, 
  BaseButtonProps, 
  ButtonGroupProps, 
  InternalButtonProps, 
  GetLoadingConfigType 
} from './interface';

// 导出工具函数
export { isTwoCNChar, spaceChildren, getLoadingConfig, isUnBorderedButtonType, getSizeSuffix, combineClasses } from './utils';
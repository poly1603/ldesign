/**
 * Button 组件类型定义
 */
interface ButtonProps {
    /** 按钮类型 */
    type?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
    /** 按钮尺寸 */
    size?: 'small' | 'medium' | 'large';
    /** 是否禁用 */
    disabled?: boolean;
    /** 是否加载中 */
    loading?: boolean;
    /** 是否为块级元素 */
    block?: boolean;
    /** 按钮形状 */
    shape?: 'default' | 'round' | 'circle';
    /** 图标 */
    icon?: string;
    /** HTML 类型 */
    htmlType?: 'button' | 'submit' | 'reset';
}
interface ButtonEmits {
    /** 点击事件 */
    'click': [event: MouseEvent];
    /** 聚焦事件 */
    'focus': [event: FocusEvent];
    /** 失焦事件 */
    'blur': [event: FocusEvent];
}
interface ButtonSlots {
    /** 默认插槽 */
    default?: () => any;
    /** 图标插槽 */
    icon?: () => any;
}

export type { ButtonEmits, ButtonProps, ButtonSlots };

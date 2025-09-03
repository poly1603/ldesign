/**
 * Select 组件类型定义
 */
export interface SelectOption {
    /** 选项值 */
    value: string | number;
    /** 显示标签 */
    label: string;
    /** 是否禁用 */
    disabled?: boolean;
    /** 自定义图标 */
    icon?: string;
    /** 自定义颜色（用于颜色选择器等场景） */
    color?: string;
    /** 选项描述 */
    description?: string;
    /** 选项分组 */
    group?: string;
}
export interface SelectProps {
    /** 当前选中值 */
    modelValue?: string | number;
    /** 选项列表 */
    options: SelectOption[];
    /** 占位符 */
    placeholder?: string;
    /** 是否禁用 */
    disabled?: boolean;
    /** 是否可清空 */
    clearable?: boolean;
    /** 是否可搜索 */
    filterable?: boolean;
    /** 组件大小 */
    size?: 'small' | 'medium' | 'large';
    /** 是否显示选项颜色 */
    showColor?: boolean;
    /** 是否显示选项图标 */
    showIcon?: boolean;
    /** 是否显示选项描述 */
    showDescription?: boolean;
    /** 最大高度 */
    maxHeight?: string | number;
    /** 自定义类名 */
    class?: string;
    /** 自定义样式 */
    style?: Record<string, any>;
    /** 下拉动画类型 */
    animation?: 'fade' | 'slide' | 'zoom' | 'bounce';
    /** 动画持续时间 */
    animationDuration?: number;
}
export interface SelectEmits {
    /** 值变化事件 */
    'update:modelValue': [value: string | number];
    /** 选择事件 */
    'change': [value: string | number, option: SelectOption];
    /** 清空事件 */
    'clear': [];
    /** 搜索事件 */
    'search': [query: string];
    /** 下拉框打开事件 */
    'open': [];
    /** 下拉框关闭事件 */
    'close': [];
}
//# sourceMappingURL=types.d.ts.map
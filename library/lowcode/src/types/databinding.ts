/**
 * 数据绑定类型定义
 */

/**
 * 数据绑定配置
 */
export interface DataBinding {
  /** 绑定类型 */
  type: 'variable' | 'expression' | 'datasource' | 'method';
  /** 数据源（用于 variable 和 datasource） */
  source?: string;
  /** 数据路径 */
  path?: string;
  /** 表达式（用于 expression） */
  expression?: string;
  /** 方法名（用于 method） */
  method?: string;
  /** 参数 */
  params?: any[];
  /** 数据转换器 */
  transformer?: DataTransformer;
  /** 默认值 */
  defaultValue?: any;
  /** 是否双向绑定 */
  twoWay?: boolean;
}

/**
 * 数据转换器
 */
export interface DataTransformer {
  /** 转换器类型 */
  type: 'function' | 'map' | 'filter' | 'format';
  /** 转换函数或配置 */
  config: any;
}

/**
 * 表达式上下文
 */
export interface ExpressionContext {
  /** 全局变量 */
  variables: Record<string, any>;
  /** 数据源数据 */
  datasources: Record<string, any>;
  /** 方法 */
  methods: Record<string, Function>;
  /** 当前组件 props */
  props?: Record<string, any>;
  /** 循环上下文 */
  loop?: {
    item: any;
    index: number;
  };
}

/**
 * 数据绑定解析器接口
 */
export interface DataBindingResolver {
  /** 解析绑定 */
  resolve(binding: DataBinding, context: ExpressionContext): any;
  /** 更新绑定值 */
  update(binding: DataBinding, value: any, context: ExpressionContext): void;
}

/**
 * 数据观察器
 */
export interface DataWatcher {
  /** 路径 */
  path: string;
  /** 回调函数 */
  callback: (newValue: any, oldValue: any) => void;
  /** 是否深度监听 */
  deep?: boolean;
  /** 是否立即执行 */
  immediate?: boolean;
}

/**
 * 数据验证规则
 */
export interface ValidationRule {
  /** 规则类型 */
  type: 'required' | 'pattern' | 'min' | 'max' | 'range' | 'custom';
  /** 验证值 */
  value?: any;
  /** 错误消息 */
  message: string;
  /** 自定义验证函数 */
  validator?: (value: any) => boolean;
}

/**
 * 数据格式化器
 */
export interface DataFormatter {
  /** 格式化类型 */
  type: 'date' | 'number' | 'currency' | 'percent' | 'custom';
  /** 格式化选项 */
  options?: any;
  /** 自定义格式化函数 */
  formatter?: (value: any) => string;
}




/**
 * @ldesign/form - 智能表单布局系统
 * 
 * 一个功能强大的自适应表单布局系统，支持响应式设计、智能布局计算、
 * 表单验证、状态管理等功能，并提供原生 JavaScript 和 Vue 3 适配器。
 */

// 核心模块
export * from './core'
export * from './types'
export * from './utils'
export * from './adapters'

// 主要导出
export {
  // 核心类
  FormManager,
  LayoutCalculator,
  FormRenderer,
  FormStateManager,
  ValidationEngine,

  // 工厂函数
  createFormManager,
  createForm,
  createLayoutCalculator,
  createValidationEngine,

  // 验证器
  validators,
} from './core'

export {
  // 原生适配器
  NativeFormAdapter,
  createNativeForm,
  autoInitForms,

  // Vue 适配器 - 暂时注释掉
  // AdaptiveForm,
  // useAdaptiveForm,
  // FormProvider,
  // useFormProvider,
  // createFormPlugin,
} from './adapters'

export {
  // 工具函数
  EventEmitter,
  createEventEmitter,
  throttle,
  debounce,
  observeResize,
  unobserveResize,
} from './utils'

// 类型导出 - 暂时注释掉，避免构建错误
// export type {
//   // 核心类型
//   FormConfig,
//   FormItemConfig,
//   FormState,
//   FormGroup,
//   FormManagerOptions,
//   LayoutConfig,
//   ValidationConfig,
//   DisplayConfig,
//   BehaviorConfig,
//
//   // 布局类型
//   ResponsiveConfig,
//   ItemPosition,
//
//   // 验证类型
//   ValidationRule,
//
//   // 适配器类型
//   NativeAdapterOptions,
//
//   // 事件类型
//   FormEventType,
//   FormEventData,
// } from './types'

// 版本信息
export const version = '0.1.0'

// 默认配置
export const defaultConfig: Partial<FormConfig> = {
  layout: {
    maxColumns: 4,
    minItemWidth: 200,
    gap: 16,
    responsive: {
      xs: { maxColumns: 1, minItemWidth: 150 },
      sm: { maxColumns: 2, minItemWidth: 180 },
      md: { maxColumns: 3, minItemWidth: 200 },
      lg: { maxColumns: 4, minItemWidth: 220 },
      xl: { maxColumns: 4, minItemWidth: 240 },
    },
  },
  display: {
    labelPosition: 'top',
    showRequiredMark: true,
    showOptionalMark: false,
  },
  validation: {
    validateOnChange: true,
    validateOnBlur: true,
    showErrorsOnTouch: true,
  },
  behavior: {
    autoSave: false,
    enableExpandCollapse: true,
    enableModal: false,
    enableGrouping: true,
  },
}

// 默认选项
export const defaultOptions: Partial<FormManagerOptions> = {
  autoResize: true,
  autoValidate: true,
  persistState: false,
  debounceDelay: 300,
  throttleDelay: 100,
  enableGroups: true,
  enableModal: true,
  enableExpandCollapse: true,
}

/**
 * 创建默认表单配置
 */
export function createDefaultConfig(overrides: Partial<FormConfig> = {}): FormConfig {
  return {
    items: [],
    ...defaultConfig,
    ...overrides,
    layout: {
      ...defaultConfig.layout,
      ...overrides.layout,
    },
    display: {
      ...defaultConfig.display,
      ...overrides.display,
    },
    validation: {
      ...defaultConfig.validation,
      ...overrides.validation,
    },
    behavior: {
      ...defaultConfig.behavior,
      ...overrides.behavior,
    },
  } as FormConfig
}

/**
 * 创建默认选项
 */
export function createDefaultOptions(overrides: Partial<FormManagerOptions> = {}): FormManagerOptions {
  return {
    ...defaultOptions,
    ...overrides,
  }
}

/**
 * 快速创建表单
 */
export function quickCreateForm(
  container: string | HTMLElement,
  items: FormItemConfig[],
  options?: {
    config?: Partial<FormConfig>
    managerOptions?: Partial<FormManagerOptions>
    adapter?: 'native' | 'vue'
  }
) {
  const config = createDefaultConfig({
    items,
    ...options?.config,
  })

  const managerOptions = createDefaultOptions(options?.managerOptions)

  if (options?.adapter === 'vue') {
    // 返回 Vue 组件配置
    return {
      config,
      options: managerOptions,
    }
  } else {
    // 默认使用原生适配器
    const { createNativeForm } = require('./adapters/native')
    return createNativeForm(container, config, managerOptions)
  }
}

/**
 * 表单构建器
 */
export class FormBuilder {
  private config: Partial<FormConfig> = {}
  private items: FormItemConfig[] = []

  /**
   * 设置布局配置
   */
  layout(layout: Partial<LayoutConfig>): this {
    this.config.layout = { ...this.config.layout, ...layout }
    return this
  }

  /**
   * 设置显示配置
   */
  display(display: Partial<DisplayConfig>): this {
    this.config.display = { ...this.config.display, ...display }
    return this
  }

  /**
   * 设置验证配置
   */
  validation(validation: Partial<ValidationConfig>): this {
    this.config.validation = { ...this.config.validation, ...validation }
    return this
  }

  /**
   * 设置行为配置
   */
  behavior(behavior: Partial<BehaviorConfig>): this {
    this.config.behavior = { ...this.config.behavior, ...behavior }
    return this
  }

  /**
   * 添加表单项
   */
  addItem(item: FormItemConfig): this {
    this.items.push(item)
    return this
  }

  /**
   * 添加多个表单项
   */
  addItems(items: FormItemConfig[]): this {
    this.items.push(...items)
    return this
  }

  /**
   * 添加输入框
   */
  input(key: string, label: string, options: Partial<FormItemConfig> = {}): this {
    return this.addItem({
      key,
      label,
      type: 'input',
      ...options,
    })
  }

  /**
   * 添加文本域
   */
  textarea(key: string, label: string, options: Partial<FormItemConfig> = {}): this {
    return this.addItem({
      key,
      label,
      type: 'textarea',
      ...options,
    })
  }

  /**
   * 添加选择框
   */
  select(key: string, label: string, selectOptions: any[], options: Partial<FormItemConfig> = {}): this {
    return this.addItem({
      key,
      label,
      type: 'select',
      options: selectOptions,
      ...options,
    })
  }

  /**
   * 添加复选框
   */
  checkbox(key: string, label: string, options: Partial<FormItemConfig> = {}): this {
    return this.addItem({
      key,
      label,
      type: 'checkbox',
      ...options,
    })
  }

  /**
   * 添加单选框
   */
  radio(key: string, label: string, radioOptions: any[], options: Partial<FormItemConfig> = {}): this {
    return this.addItem({
      key,
      label,
      type: 'radio',
      options: radioOptions,
      ...options,
    })
  }

  /**
   * 添加开关
   */
  switch(key: string, label: string, options: Partial<FormItemConfig> = {}): this {
    return this.addItem({
      key,
      label,
      type: 'switch',
      ...options,
    })
  }

  /**
   * 添加日期选择器
   */
  date(key: string, label: string, options: Partial<FormItemConfig> = {}): this {
    return this.addItem({
      key,
      label,
      type: 'date',
      ...options,
    })
  }

  /**
   * 添加时间选择器
   */
  time(key: string, label: string, options: Partial<FormItemConfig> = {}): this {
    return this.addItem({
      key,
      label,
      type: 'time',
      ...options,
    })
  }

  /**
   * 添加日期时间选择器
   */
  datetime(key: string, label: string, options: Partial<FormItemConfig> = {}): this {
    return this.addItem({
      key,
      label,
      type: 'datetime-local',
      ...options,
    })
  }

  /**
   * 构建配置
   */
  build(): FormConfig {
    return createDefaultConfig({
      ...this.config,
      items: this.items,
    })
  }

  /**
   * 构建并创建表单
   */
  create(
    container: string | HTMLElement,
    options?: Partial<FormManagerOptions>
  ) {
    const config = this.build()
    const { createNativeForm } = require('./adapters/native')
    return createNativeForm(container, config, options)
  }
}

/**
 * 创建表单构建器
 */
export function createFormBuilder(): FormBuilder {
  return new FormBuilder()
}

// 便捷导出
export const form = {
  create: quickCreateForm,
  builder: createFormBuilder,
  config: createDefaultConfig,
  options: createDefaultOptions,
}

// 默认导出
export default {
  version: '0.1.0',
  name: '@ldesign/form',
  form,
  FormBuilder,
  FormManager,
  createForm,
  createFormBuilder,
  createNativeForm,
}

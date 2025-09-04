import type { SubmitContext, TdButtonProps, TdFormItemProps, TdFormProps } from '@ldesign/desktop-next'

import type { TNode } from '@ldesign/desktop-utils'

export interface LDesignFormProp {
  header?: string | TNode
  footer?: string | TNode
  current?: string
  defaultCurrent?: string
  modelCurrent?: string
  value?: { [name: string]: any }
  defaultValue?: { [name: string]: any }
  modelValue?: { [name: string]: any }
  options?: LDesignFormOption[] | LDesignFormGroup[]
  spanWidth?: number
  span?: number
  maxSpan?: number
  minSpan?: number
  previewRows?: number
  space?: string | number
  gutter?: string | number
  colon?: boolean
  adjustSpan?: boolean
  button?: string | TNode
  buttonPosition?: 'inline' | 'block'
  hiddenButtonLabel?: boolean
  buttonAlign?: 'left' | 'center' | 'right' | 'justify'
  innerSpace?: string | number
  labelWidthChangeOnVisible?: boolean
  labelWidth?: number | string
  rules?: TdFormProps['rules']
  reset?: string | boolean | TNode | TdButtonProps
  submit?: string | boolean | TNode | TdButtonProps
  expand?: string | boolean | TNode | TdButtonProps
  resetType?: TdFormProps['resetType']
  getCodeTypesInOneRequest?: boolean
  buttonSpan?: number
  labelAlign?: TdFormProps['labelAlign']
  contentAlign?: 'left' | 'right'
  variant?: 'default' | 'document'
  requiredMark?: boolean
  readonly?: boolean
  disabled?: boolean
  static?: boolean
  extraContent?: string | TNode
  autoDestory?: boolean
  isInScrollContainer?: boolean
  width?: string | number
  device?: string
  visible?: boolean
  labelPadding?: number
  padding?: number | string
  locale?: string
  onSubmit?: (value: any, ctx: SubmitContext<FormData>) => void
  onChange?: (value: any, ctx: { target?: any, action?: string, value?: any, context?: any }) => void
  onReady?: (value: any) => void
  onReset?: (e: any, ctx: { data: any }) => void
  onVisibleChange?: (v: boolean, ctx: any) => void
  onCurrentChange?: (v: string) => void
  onExpand?: (v: boolean, ctx: any) => void
}

export interface LDesignFormGroup {
  title?: string | any
  previewRows?: number
  name: string
  visible: boolean
  buttonPosition: 'inline' | 'block'
  children: LDesignFormOption[]
}

export interface LDesignFormOption {
  name: string
  label: string | TNode
  component: any
  props: any
  span: number | string
  computedSpan?: number
  adjustSpan?: number
  labelWidth?: number
  code?: string
  visible?: boolean
  index?: number // 该项是自动生成的，用于计算标签宽度
  isMultipleLine?: boolean // 自动计算当前label是否是多行
  rules?: TdFormItemProps['rules']
  relation?: string | {
    name: string
    type: number | 'empty'
  }
  load?: () => Promise<Array<{ label: string, value: any }>>
  prefix: any | {
    component: any
    props: any
  }
  suffix: any | {
    component: any
    props: any
  }
  labelAlign?: TdFormItemProps['labelAlign']
  contentAlign?: 'left' | 'right'
}

export type LDesignFormComputedOption = Array<
  {
    title?: string
    children: LDesignFormOption[] | LDesignFormGroup[]
    visible: boolean
    name: string
    buttonPosition: 'inline' | 'block'
    options: {
      preview: LDesignFormOption[][]
      more: LDesignFormOption[][]
      labelWidths: number[]
    }
  }
>

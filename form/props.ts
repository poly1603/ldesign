import type { PropType } from 'vue'
import type { LDesignFormProp } from './type'

export default {
  defaultCurrent: {
    type: String as PropType<LDesignFormProp['defaultCurrent']>,
  },
  current: {
    type: String as PropType<LDesignFormProp['current']>,
  },
  modelCurrent: {
    type: String as PropType<LDesignFormProp['modelCurrent']>,
  },
  header: {
    type: [String, Function] as PropType<LDesignFormProp['header']>,
  },
  footer: {
    type: [String, Function] as PropType<LDesignFormProp>,
  },
  value: {
    type: Object as PropType<LDesignFormProp['value']>,
  },
  defaultValue: {
    type: Object as PropType<LDesignFormProp['defaultValue']>,
  },
  modelValue: {
    type: Object as PropType<LDesignFormProp['modelValue']>,
  },
  options: {
    type: Array as PropType<LDesignFormProp['options']>,
  },
  span: {
    type: Number as PropType<LDesignFormProp['span']>,
  },
  minSpan: {
    type: Number as PropType<LDesignFormProp['minSpan']>,
    default: 1,
  },
  maxSpan: {
    type: Number as PropType<LDesignFormProp['maxSpan']>,
    default: 4,
  },
  spanWidth: {
    type: Number as PropType<LDesignFormProp['spanWidth']>,
    default: 320,
  },
  previewRows: {
    type: Number as PropType<LDesignFormProp['previewRows']>,
    default: 0,
  },
  space: {
    type: [String, Number] as PropType<LDesignFormProp['space']>,
    default: 'var(--td-comp-margin-m)',
  },
  gutter: {
    type: [String, Number] as PropType<LDesignFormProp['gutter']>,
    default: 'var(--td-comp-margin-l)',
  },
  colon: {
    type: Boolean as PropType<LDesignFormProp['colon']>,
    default: undefined,
  },
  adjustSpan: {
    type: Boolean as PropType<LDesignFormProp['adjustSpan']>,
    default: true,
  },
  button: {
    type: [Boolean, String, Array, Function] as PropType<LDesignFormProp['button']>,
    default: true,
  },
  buttonPosition: {
    type: String as PropType<LDesignFormProp['buttonPosition']>,
    default: 'inline',
  },
  hiddenButtonLabel: {
    type: Boolean as PropType<LDesignFormProp['hiddenButtonLabel']>,
  },
  buttonAlign: {
    type: String as PropType<LDesignFormProp['buttonAlign']>,
    default: 'right',
  },
  innerSpace: {
    type: [String, Number] as PropType<LDesignFormProp['innerSpace']>,
  },
  labelWidthChangeOnVisible: {
    type: Boolean as PropType<LDesignFormProp['labelWidthChangeOnVisible']>,
    default: true,
  },
  labelWidth: {
    type: [String, Number] as PropType<LDesignFormProp['labelWidth']>,
  },
  rules: {
    type: Object as PropType<LDesignFormProp['rules']>,
  },
  reset: {
    type: [String, Boolean, Object, Function] as PropType<LDesignFormProp['reset']>,
    default: true,
  },
  submit: {
    type: [String, Boolean, Object, Function] as PropType<LDesignFormProp['submit']>,
    default: true,
  },
  expand: {
    type: [String, Boolean, Object, Function] as PropType<LDesignFormProp['expand']>,
    default: true,
  },
  resetType: {
    type: String as PropType<LDesignFormProp['resetType']>,
    default: 'initial',
  },
  getCodeTypesInOneRequest: {
    type: Boolean as PropType<LDesignFormProp['getCodeTypesInOneRequest']>,
    default: true,
  },
  buttonSpan: {
    type: Number as PropType<LDesignFormProp['buttonSpan']>,
    default: 1,
  },
  labelAlign: {
    type: String as PropType<LDesignFormProp['labelAlign']>,
    default: 'left',
  },
  contentAlign: {
    type: String as PropType<LDesignFormProp['contentAlign']>,
    default: 'left',
  },
  variant: {
    type: String as PropType<LDesignFormProp['variant']>,
    default: 'default',
  },
  requiredMark: {
    type: Boolean as PropType<LDesignFormProp['requiredMark']>,
    default: true,
  },
  readonly: {
    type: Boolean as PropType<LDesignFormProp['readonly']>,
  },
  disabled: {
    type: Boolean as PropType<LDesignFormProp['disabled']>,
  },
  device: {
    type: String as PropType<LDesignFormProp['device']>,
  },
  static: {
    type: Boolean as PropType<LDesignFormProp['static']>,
  },
  extraContent: {
    type: [String, Object, Function] as PropType<LDesignFormProp['extraContent']>,
  },
  autoDestory: {
    type: Boolean as PropType<LDesignFormProp['autoDestory']>,
    default: false,
  },
  isInScrollContainer: {
    type: Boolean as PropType<LDesignFormProp['isInScrollContainer']>,
  },
  width: {
    type: [String, Number] as PropType<LDesignFormProp['width']>,
  },
  visible: {
    type: Boolean as PropType<LDesignFormProp['visible']>,
    default: false,
  },
  labelPadding: {
    type: Number as PropType<LDesignFormProp['labelPadding']>,
    default: 12,
  },
  padding: {
    type: [String, Number] as PropType<LDesignFormProp['padding']>,
  },
  locale: {
    type: String as PropType<LDesignFormProp['locale']>,
  },
  onSubmit: {
    type: Function as PropType<LDesignFormProp['onSubmit']>,
  },
  onChange: {
    type: Function as PropType<LDesignFormProp['onChange']>,
  },
  onReady: {
    type: Function as PropType<LDesignFormProp['onReady']>,
  },
  onReset: {
    type: Function as PropType<LDesignFormProp['onReset']>,
  },
  onVisibleChange: {
    type: Function as PropType<LDesignFormProp['onVisibleChange']>,
  },
  onCurrentChange: {
    type: Function as PropType<LDesignFormProp['onCurrentChange']>,
  },
  onExpand: {
    type: Function as PropType<LDesignFormProp['onExpand']>,
  },
}

import type { Ref } from 'vue'
import { kebabCase } from 'lodash-es'
import { getCurrentInstance, ref } from 'vue'

export type ChangeHandler<T, P extends any[]> = (value: T, ...args: P) => void

export function useVModel<T, P extends any[]>(
  value: Ref<T>,
  modelValue: Ref<T>,
  defaultValue: T,
  onChange: ChangeHandler<T, P>,
  propName = 'value',
): [Ref<T>, ChangeHandler<T, P>] {
  const instance = getCurrentInstance()
  if (!instance) {
    throw new Error('useVModel 必须在组件内部使用')
  }
  const { emit, vnode } = instance
  const internalValue = ref<T>(defaultValue)

  const vProps = vnode.props || {}
  const isVM
    = Object.prototype.hasOwnProperty.call(vProps, 'modelValue') || Object.prototype.hasOwnProperty.call(vProps, 'model-value')
  const isVMP
    = Object.prototype.hasOwnProperty.call(vProps, propName) || Object.prototype.hasOwnProperty.call(vProps, kebabCase(propName))

  if (isVM) {
    return [
      modelValue,
      (newValue, ...args) => {
        emit('update:modelValue', newValue)
        onChange?.(newValue, ...args)
      },
    ]
  }

  if (isVMP) {
    return [
      value,
      (newValue, ...args) => {
        emit(`update:${propName}`, newValue)
        onChange?.(newValue, ...args)
      },
    ]
  }

  internalValue.value = defaultValue
  return [
    internalValue as Ref<T>,
    (newValue, ...args) => {
      internalValue.value = newValue
      onChange?.(newValue, ...args)
    },
  ]
}

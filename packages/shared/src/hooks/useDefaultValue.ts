import type { Ref } from 'vue'
import type { ChangeHandler } from './useVModel'
import { kebabCase } from 'lodash-es'
import { getCurrentInstance, ref } from 'vue'

export function useDefaultValue<T, P extends any[]>(
  value: Ref<T>,
  defaultValue: T,
  onChange: ChangeHandler<T, P>,
  propsName: string,
): [Ref<T>, ChangeHandler<T, P>] {
  const instance = getCurrentInstance()
  if (!instance) {
    throw new Error('useVModel 必须在组件内部使用')
  }
  const { emit, vnode } = instance
  const internalValue = ref<T>(defaultValue)

  const vProps = vnode.props || {}
  const isVMP
    = Object.prototype.hasOwnProperty.call(vProps, propsName) || Object.prototype.hasOwnProperty.call(vProps, kebabCase(propsName))

  if (isVMP) {
    return [
      value,
      (newValue, ...args) => {
        emit(`update:${propsName}`, newValue)
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

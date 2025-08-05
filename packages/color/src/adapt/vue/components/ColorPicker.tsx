/**
 * 颜色选择器组件
 */

import type { PropType } from 'vue'
import { computed, defineComponent, ref, watch } from 'vue'
import { isValidHex, normalizeHex } from '../../../utils/color-converter'

export default defineComponent({
  name: 'LColorPicker',
  props: {
    modelValue: {
      type: String,
      default: '#1890ff',
    },
    showPresets: {
      type: Boolean,
      default: true,
    },
    presets: {
      type: Array as PropType<string[]>,
      default: () => [
        '#1890ff',
        '#722ed1',
        '#13c2c2',
        '#52c41a',
        '#faad14',
        '#fa541c',
        '#f5222d',
        '#eb2f96',
        '#2f54eb',
        '#096dd9',
        '#08979c',
        '#389e0d',
        '#d48806',
        '#d4380d',
        '#cf1322',
        '#c41d7f',
      ],
    },
    showAlpha: {
      type: Boolean,
      default: false,
    },
    format: {
      type: String as PropType<'hex' | 'rgb' | 'hsl'>,
      default: 'hex',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  } as const,
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const inputValue = ref(props.modelValue)
    const isOpen = ref(false)

    const normalizedValue = computed(() => {
      return isValidHex(inputValue.value) ? normalizeHex(inputValue.value) : '#000000'
    })

    const handleInputChange = (event: Event) => {
      const target = event.target as HTMLInputElement
      const value = target.value

      if (isValidHex(value)) {
        const normalized = normalizeHex(value)
        inputValue.value = normalized
        emit('update:modelValue', normalized)
        emit('change', normalized)
      }
    }

    const handlePresetClick = (color: string) => {
      inputValue.value = color
      emit('update:modelValue', color)
      emit('change', color)
      isOpen.value = false
    }

    const togglePicker = () => {
      if (!props.disabled) {
        isOpen.value = !isOpen.value
      }
    }

    // 监听外部值变化
    watch(
      () => props.modelValue,
      (newValue) => {
        if (newValue !== inputValue.value) {
          inputValue.value = newValue
        }
      },
    )

    return () => (
      <div class={[
        'l-color-picker',
        {
          'l-color-picker--disabled': props.disabled,
          'l-color-picker--open': isOpen.value,
        },
      ]}
      >
        <div class="l-color-picker__trigger" onClick={togglePicker}>
          <div
            class="l-color-picker__preview"
            style={{ backgroundColor: normalizedValue.value }}
          />
          <input
            type="text"
            class="l-color-picker__input"
            value={inputValue.value}
            onInput={handleInputChange}
            disabled={props.disabled}
            placeholder="请输入颜色值"
          />
        </div>

        {isOpen.value && (
          <div class="l-color-picker__panel">
            <div class="l-color-picker__color-input">
              <input
                type="color"
                value={normalizedValue.value}
                onInput={(e: Event) => {
                  const value = (e.target as HTMLInputElement).value
                  handlePresetClick(value)
                }}
                class="l-color-picker__native"
              />
            </div>

            {props.showPresets && (
              <div class="l-color-picker__presets">
                <div class="l-color-picker__presets-title">预设颜色</div>
                <div class="l-color-picker__presets-grid">
                  {props.presets.map(color => (
                    <button
                      key={color}
                      type="button"
                      class={[
                        'l-color-picker__preset',
                        {
                          'l-color-picker__preset--active': color === normalizedValue.value,
                        },
                      ]}
                      style={{ backgroundColor: color }}
                      onClick={() => handlePresetClick(color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  },
})

/**
 * 颜色混合器组件
 */

import type { BlendMode } from '../../../utils/color-utils'
import { computed, defineComponent, ref } from 'vue'
import { blendColors } from '../../../utils/color-utils'

export interface ColorMixerProps {
  baseColor?: string
  overlayColor?: string
  mode?: BlendMode
  opacity?: number
}

export const ColorMixer = defineComponent<ColorMixerProps>({
  name: 'ColorMixer',
  props: {
    baseColor: {
      type: String,
      default: '#ff0000',
    },
    overlayColor: {
      type: String,
      default: '#0000ff',
    },
    mode: {
      type: String as () => BlendMode,
      default: 'normal' as BlendMode,
    },
    opacity: {
      type: Number,
      default: 0.5,
    },
  },
  emits: ['update:baseColor', 'update:overlayColor', 'update:mode', 'update:opacity', 'colorChange'],
  setup(props, { emit }) {
    const localBaseColor = ref(props.baseColor)
    const localOverlayColor = ref(props.overlayColor)
    const localMode = ref(props.mode)
    const localOpacity = ref(props.opacity)

    const blendModes: BlendMode[] = [
      'normal',
      'multiply',
      'screen',
      'overlay',
      'soft-light',
      'hard-light',
      'color-dodge',
      'color-burn',
      'darken',
      'lighten',
      'difference',
      'exclusion',
    ]

    const resultColor = computed(() => {
      try {
        return blendColors(
          localBaseColor.value,
          localOverlayColor.value,
          localMode.value,
          localOpacity.value,
        )
      }
      catch {
        return '#000000'
      }
    })

    const updateBaseColor = (color: string) => {
      localBaseColor.value = color
      emit('update:baseColor', color)
      emit('colorChange', resultColor.value)
    }

    const updateOverlayColor = (color: string) => {
      localOverlayColor.value = color
      emit('update:overlayColor', color)
      emit('colorChange', resultColor.value)
    }

    const updateMode = (mode: BlendMode) => {
      localMode.value = mode
      emit('update:mode', mode)
      emit('colorChange', resultColor.value)
    }

    const updateOpacity = (opacity: number) => {
      localOpacity.value = opacity
      emit('update:opacity', opacity)
      emit('colorChange', resultColor.value)
    }

    return () => (
      <div class="color-mixer">
        <div class="color-mixer__preview">
          <div class="color-mixer__color-swatch">
            <div
              class="color-mixer__base-color"
              style={{ backgroundColor: localBaseColor.value }}
            />
            <div
              class="color-mixer__overlay-color"
              style={{
                backgroundColor: localOverlayColor.value,
                opacity: localOpacity.value,
              }}
            />
          </div>
          <div
            class="color-mixer__result"
            style={{ backgroundColor: resultColor.value }}
          >
            <span class="color-mixer__result-text">{resultColor.value}</span>
          </div>
        </div>

        <div class="color-mixer__controls">
          <div class="color-mixer__control-group">
            <label class="color-mixer__label">基础颜色</label>
            <input
              type="color"
              value={localBaseColor.value}
              onInput={e => updateBaseColor((e.target as HTMLInputElement).value)}
              class="color-mixer__color-input"
            />
            <input
              type="text"
              value={localBaseColor.value}
              onInput={e => updateBaseColor((e.target as HTMLInputElement).value)}
              class="color-mixer__text-input"
            />
          </div>

          <div class="color-mixer__control-group">
            <label class="color-mixer__label">叠加颜色</label>
            <input
              type="color"
              value={localOverlayColor.value}
              onInput={e => updateOverlayColor((e.target as HTMLInputElement).value)}
              class="color-mixer__color-input"
            />
            <input
              type="text"
              value={localOverlayColor.value}
              onInput={e => updateOverlayColor((e.target as HTMLInputElement).value)}
              class="color-mixer__text-input"
            />
          </div>

          <div class="color-mixer__control-group">
            <label class="color-mixer__label">混合模式</label>
            <select
              value={localMode.value}
              onChange={e => updateMode((e.target as HTMLSelectElement).value as BlendMode)}
              class="color-mixer__select"
            >
              {blendModes.map(mode => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>

          <div class="color-mixer__control-group">
            <label class="color-mixer__label">
              不透明度:
              {Math.round(localOpacity.value * 100)}
              %
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={localOpacity.value}
              onInput={e => updateOpacity(Number.parseFloat((e.target as HTMLInputElement).value))}
              class="color-mixer__range"
            />
          </div>
        </div>
      </div>
    )
  },
})

export default ColorMixer

/**
 * 调色板生成器组件
 */

import { computed, defineComponent, ref } from 'vue'
import {
  generateAnalogousPalette,
  generateComplementaryPalette,
  generateMonochromaticPalette,
  generateTetradicPalette,
  generateTriadicPalette,
} from '../../../utils/color-utils'

export interface PaletteGeneratorProps {
  baseColor?: string
  paletteType?: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic'
  count?: number
}

export const PaletteGenerator = defineComponent<PaletteGeneratorProps>({
  name: 'PaletteGenerator',
  props: {
    baseColor: {
      type: String,
      default: '#1890ff',
    },
    paletteType: {
      type: String as () => PaletteGeneratorProps['paletteType'],
      default: 'monochromatic',
    },
    count: {
      type: Number,
      default: 5,
    },
  },
  emits: ['update:baseColor', 'update:paletteType', 'update:count', 'paletteChange'],
  setup(props, { emit }) {
    const localBaseColor = ref(props.baseColor)
    const localPaletteType = ref(props.paletteType)
    const localCount = ref(props.count)

    const paletteTypes = [
      { value: 'monochromatic', label: '单色调色板' },
      { value: 'analogous', label: '类似色调色板' },
      { value: 'complementary', label: '互补色调色板' },
      { value: 'triadic', label: '三元色调色板' },
      { value: 'tetradic', label: '四元色调色板' },
    ] as const

    const palette = computed(() => {
      try {
        const baseColor = localBaseColor.value || '#1890ff'
        const count = localCount.value || 5

        switch (localPaletteType.value) {
          case 'monochromatic':
            return generateMonochromaticPalette(baseColor, count)
          case 'analogous':
            return generateAnalogousPalette(baseColor, count)
          case 'complementary':
            return generateComplementaryPalette(baseColor)
          case 'triadic':
            return generateTriadicPalette(baseColor)
          case 'tetradic':
            return generateTetradicPalette(baseColor)
          default:
            return [baseColor]
        }
      }
      catch {
        return [localBaseColor.value || '#1890ff']
      }
    })

    const updateBaseColor = (color: string) => {
      localBaseColor.value = color
      emit('update:baseColor', color)
      emit('paletteChange', palette.value)
    }

    const updatePaletteType = (type: PaletteGeneratorProps['paletteType']) => {
      localPaletteType.value = type
      emit('update:paletteType', type)
      emit('paletteChange', palette.value)
    }

    const updateCount = (count: number) => {
      localCount.value = count
      emit('update:count', count)
      emit('paletteChange', palette.value)
    }

    const copyColor = (color: string) => {
      navigator.clipboard?.writeText(color)
    }

    const exportPalette = () => {
      const paletteData = {
        baseColor: localBaseColor.value,
        type: localPaletteType.value,
        colors: palette.value,
        timestamp: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(paletteData, null, 2)], {
        type: 'application/json',
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `palette-${localPaletteType.value}-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    }

    return () => (
      <div class="palette-generator">
        <div class="palette-generator__controls">
          <div class="palette-generator__control-group">
            <label class="palette-generator__label">基础颜色</label>
            <input
              type="color"
              value={localBaseColor.value}
              onInput={(e: Event) => updateBaseColor((e.target as HTMLInputElement).value)}
              class="palette-generator__color-input"
            />
            <input
              type="text"
              value={localBaseColor.value}
              onInput={(e: Event) => updateBaseColor((e.target as HTMLInputElement).value)}
              class="palette-generator__text-input"
            />
          </div>

          <div class="palette-generator__control-group">
            <label class="palette-generator__label">调色板类型</label>
            <select
              value={localPaletteType.value}
              onChange={(e: Event) => updatePaletteType((e.target as HTMLSelectElement).value as any)}
              class="palette-generator__select"
            >
              {paletteTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {(localPaletteType.value === 'monochromatic' || localPaletteType.value === 'analogous') && (
            <div class="palette-generator__control-group">
              <label class="palette-generator__label">
                颜色数量:
                {localCount.value}
              </label>
              <input
                type="range"
                min="3"
                max="10"
                value={localCount.value}
                onInput={(e: Event) => updateCount(Number.parseInt((e.target as HTMLInputElement).value))}
                class="palette-generator__range"
              />
            </div>
          )}

          <div class="palette-generator__actions">
            <button
              onClick={exportPalette}
              class="palette-generator__button"
            >
              导出调色板
            </button>
          </div>
        </div>

        <div class="palette-generator__preview">
          <div class="palette-generator__colors">
            {palette.value.map((color, index) => (
              <div
                key={`${color}-${index}`}
                class="palette-generator__color-item"
                onClick={() => copyColor(color || '#000000')}
                title={`点击复制 ${color}`}
              >
                <div
                  class="palette-generator__color-swatch"
                  style={{ backgroundColor: color }}
                />
                <span class="palette-generator__color-text">{color}</span>
              </div>
            ))}
          </div>

          <div class="palette-generator__info">
            <p>
              调色板类型:
              {paletteTypes.find(t => t.value === localPaletteType.value)?.label}
            </p>
            <p>
              颜色数量:
              {palette.value.length}
            </p>
            <p>点击颜色块复制颜色值</p>
          </div>
        </div>
      </div>
    )
  },
})

export default PaletteGenerator

/**
 * 可访问性检查器组件
 */

import type { ColorBlindnessType, TextSize, WCAGLevel } from '../../../utils/accessibility'
import { computed, defineComponent, ref } from 'vue'
import { checkAccessibility, simulateColorBlindness } from '../../../utils/accessibility'

export interface AccessibilityCheckerProps {
  foregroundColor?: string
  backgroundColor?: string
  level?: WCAGLevel
  textSize?: TextSize
}

export const AccessibilityChecker = defineComponent<AccessibilityCheckerProps>({
  name: 'AccessibilityChecker',
  props: {
    foregroundColor: {
      type: String,
      default: '#000000',
    },
    backgroundColor: {
      type: String,
      default: '#ffffff',
    },
    level: {
      type: String as () => WCAGLevel,
      default: 'AA',
    },
    textSize: {
      type: String as () => TextSize,
      default: 'normal',
    },
  },
  emits: ['update:foregroundColor', 'update:backgroundColor', 'update:level', 'update:textSize'],
  setup(props, { emit }) {
    const localForegroundColor = ref(props.foregroundColor)
    const localBackgroundColor = ref(props.backgroundColor)
    const localLevel = ref(props.level)
    const localTextSize = ref(props.textSize)

    const colorBlindnessTypes: { value: ColorBlindnessType, label: string }[] = [
      { value: 'protanopia', label: '红色盲' },
      { value: 'deuteranopia', label: '绿色盲' },
      { value: 'tritanopia', label: '蓝色盲' },
      { value: 'protanomaly', label: '红色弱' },
      { value: 'deuteranomaly', label: '绿色弱' },
      { value: 'tritanomaly', label: '蓝色弱' },
      { value: 'achromatopsia', label: '全色盲' },
      { value: 'achromatomaly', label: '色弱' },
    ]

    const accessibilityResult = computed(() => {
      return checkAccessibility(
        localForegroundColor.value || '#000000',
        localBackgroundColor.value || '#ffffff',
        localTextSize.value || 'normal',
      )
    })

    const colorBlindnessSimulations = computed(() => {
      return colorBlindnessTypes.map(type => ({
        type: type.value,
        label: type.label,
        foreground: simulateColorBlindness(localForegroundColor.value || '#000000', type.value),
        background: simulateColorBlindness(localBackgroundColor.value || '#ffffff', type.value),
      }))
    })

    const updateForegroundColor = (color: string) => {
      localForegroundColor.value = color
      emit('update:foregroundColor', color)
    }

    const updateBackgroundColor = (color: string) => {
      localBackgroundColor.value = color
      emit('update:backgroundColor', color)
    }

    const updateLevel = (level: WCAGLevel) => {
      localLevel.value = level
      emit('update:level', level)
    }

    const updateTextSize = (size: TextSize) => {
      localTextSize.value = size
      emit('update:textSize', size)
    }

    const getStatusIcon = (isAccessible: boolean) => {
      return isAccessible ? '✅' : '❌'
    }

    const getStatusClass = (isAccessible: boolean) => {
      return isAccessible ? 'accessibility-checker__status--pass' : 'accessibility-checker__status--fail'
    }

    return () => (
      <div class="accessibility-checker">
        <div class="accessibility-checker__controls">
          <div class="accessibility-checker__control-group">
            <label class="accessibility-checker__label">前景色（文字颜色）</label>
            <input
              type="color"
              value={localForegroundColor.value}
              onInput={(e: Event) => updateForegroundColor((e.target as HTMLInputElement).value)}
              class="accessibility-checker__color-input"
            />
            <input
              type="text"
              value={localForegroundColor.value}
              onInput={(e: Event) => updateForegroundColor((e.target as HTMLInputElement).value)}
              class="accessibility-checker__text-input"
            />
          </div>

          <div class="accessibility-checker__control-group">
            <label class="accessibility-checker__label">背景色</label>
            <input
              type="color"
              value={localBackgroundColor.value}
              onInput={(e: Event) => updateBackgroundColor((e.target as HTMLInputElement).value)}
              class="accessibility-checker__color-input"
            />
            <input
              type="text"
              value={localBackgroundColor.value}
              onInput={(e: Event) => updateBackgroundColor((e.target as HTMLInputElement).value)}
              class="accessibility-checker__text-input"
            />
          </div>

          <div class="accessibility-checker__control-group">
            <label class="accessibility-checker__label">WCAG 等级</label>
            <select
              value={localLevel.value}
              onChange={(e: Event) => updateLevel((e.target as HTMLSelectElement).value as WCAGLevel)}
              class="accessibility-checker__select"
            >
              <option value="AA">AA</option>
              <option value="AAA">AAA</option>
            </select>
          </div>

          <div class="accessibility-checker__control-group">
            <label class="accessibility-checker__label">文字大小</label>
            <select
              value={localTextSize.value}
              onChange={(e: Event) => updateTextSize((e.target as HTMLSelectElement).value as TextSize)}
              class="accessibility-checker__select"
            >
              <option value="normal">正常</option>
              <option value="large">大字体</option>
            </select>
          </div>
        </div>

        <div class="accessibility-checker__preview">
          <div
            class="accessibility-checker__sample"
            style={{
              color: localForegroundColor.value,
              backgroundColor: localBackgroundColor.value,
            }}
          >
            <h3>示例文本</h3>
            <p>这是一段示例文本，用于测试颜色对比度和可访问性。</p>
            <p>The quick brown fox jumps over the lazy dog.</p>
          </div>
        </div>

        <div class="accessibility-checker__results">
          <div class="accessibility-checker__main-result">
            <div class={`accessibility-checker__status ${getStatusClass(accessibilityResult.value.isAccessible)}`}>
              {getStatusIcon(accessibilityResult.value.isAccessible)}
              <span>
                {accessibilityResult.value.isAccessible ? '通过' : '未通过'}
                {' '}
                WCAG
                {localLevel.value}
                {' '}
                标准
              </span>
            </div>
            <div class="accessibility-checker__contrast-ratio">
              对比度:
              {' '}
              {accessibilityResult.value.contrastRatio.toFixed(2)}
              :1
            </div>
            {accessibilityResult.value.level && (
              <div class="accessibility-checker__achieved-level">
                达到等级:
                {' '}
                {accessibilityResult.value.level}
              </div>
            )}
          </div>

          {accessibilityResult.value.recommendations.length > 0 && (
            <div class="accessibility-checker__recommendations">
              <h4>改进建议:</h4>
              <ul>
                {accessibilityResult.value.recommendations.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div class="accessibility-checker__colorblind-simulation">
          <h4>颜色盲模拟</h4>
          <div class="accessibility-checker__simulations">
            {colorBlindnessSimulations.value.map(simulation => (
              <div key={simulation.type} class="accessibility-checker__simulation">
                <div class="accessibility-checker__simulation-label">
                  {simulation.label}
                </div>
                <div
                  class="accessibility-checker__simulation-sample"
                  style={{
                    color: simulation.foreground.simulated,
                    backgroundColor: simulation.background.simulated,
                  }}
                >
                  示例文本
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
})

export default AccessibilityChecker

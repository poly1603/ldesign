/**
 * 主题选择器组件
 */

import type { PropType } from 'vue'
import type { ThemeConfig } from '../../../core/types'
import { computed, defineComponent } from 'vue'
import { useThemeSelector } from '../composables/useThemeSelector'

export default defineComponent({
  name: 'LThemeSelector',
  props: {
    mode: {
      type: String as PropType<'dropdown' | 'grid' | 'list'>,
      default: 'dropdown',
    },
    showPreview: {
      type: Boolean,
      default: true,
    },
    columns: {
      type: Number,
      default: 4,
    },
    showDescription: {
      type: Boolean,
      default: true,
    },
  } as const,
  emits: ['change'],
  setup(props, { emit }) {
    const { currentTheme, availableThemes, themeConfigs, selectTheme } =
      useThemeSelector()

    const handleThemeChange = async (themeName: string) => {
      await selectTheme(themeName)
      emit('change', themeName)
    }

    const gridStyle = computed(() => ({
      gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
    }))

    const renderThemePreview = (theme: ThemeConfig) => {
      if (!props.showPreview || !theme.light) return null

      return (
        <div class='l-theme-selector__preview'>
          <div class='l-theme-selector__preview-colors'>
            <div
              class='l-theme-selector__preview-color'
              style={{ backgroundColor: theme.light.primary }}
            />
            <div
              class='l-theme-selector__preview-color'
              style={{ backgroundColor: theme.light.success }}
            />
            <div
              class='l-theme-selector__preview-color'
              style={{ backgroundColor: theme.light.warning }}
            />
            <div
              class='l-theme-selector__preview-color'
              style={{ backgroundColor: theme.light.danger }}
            />
          </div>
        </div>
      )
    }

    const renderThemeItem = (theme: ThemeConfig) => (
      <div
        key={theme.name}
        class={[
          'l-theme-selector__item',
          {
            'l-theme-selector__item--active': theme.name === currentTheme.value,
          },
        ]}
        onClick={() => handleThemeChange(theme.name)}
      >
        {renderThemePreview(theme)}
        <div class='l-theme-selector__info'>
          <div class='l-theme-selector__name'>
            {theme.displayName || theme.name}
          </div>
          {props.showDescription && theme.description && (
            <div class='l-theme-selector__description'>{theme.description}</div>
          )}
        </div>
      </div>
    )

    return () => {
      const containerClass = [
        'l-theme-selector',
        `l-theme-selector--${props.mode}`,
      ]

      if (props.mode === 'dropdown') {
        return (
          <div class={containerClass}>
            <select
              class='l-theme-selector__select'
              value={currentTheme.value}
              onChange={(e: Event) =>
                handleThemeChange((e.target as HTMLSelectElement).value)
              }
            >
              {availableThemes.value.map(themeName => {
                const theme = themeConfigs.value.find(t => t.name === themeName)
                return (
                  <option key={themeName} value={themeName}>
                    {theme?.displayName || themeName}
                  </option>
                )
              })}
            </select>
          </div>
        )
      }

      if (props.mode === 'grid') {
        return (
          <div class={containerClass}>
            <div class='l-theme-selector__grid' style={gridStyle.value}>
              {themeConfigs.value.map(renderThemeItem)}
            </div>
          </div>
        )
      }

      // list mode
      return (
        <div class={containerClass}>
          <div class='l-theme-selector__list'>
            {themeConfigs.value.map(renderThemeItem)}
          </div>
        </div>
      )
    }
  },
})

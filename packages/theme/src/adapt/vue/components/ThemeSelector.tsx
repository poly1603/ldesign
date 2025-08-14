/**
 * @ldesign/theme - 主题选择器组件
 *
 * 提供主题选择和切换的用户界面
 */

import { defineComponent, computed, ref, type PropType } from 'vue'
import type { ThemeSelectorProps } from '../types'
import { useTheme, useThemeToggle } from '../composables'

/**
 * 主题选择器组件
 */
export const ThemeSelector = defineComponent({
  name: 'ThemeSelector',
  props: {
    themes: {
      type: Array as PropType<string[]>,
      default: undefined,
    },
    value: {
      type: String,
      default: undefined,
    },
    placeholder: {
      type: String,
      default: '请选择主题',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    filterable: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String as PropType<'small' | 'medium' | 'large'>,
      default: 'medium',
    },
    placement: {
      type: String as PropType<'top' | 'bottom' | 'left' | 'right'>,
      default: 'bottom',
    },
  } as ThemeSelectorProps,

  emits: ['update:value', 'change', 'clear'],

  setup(props, { emit }) {
    const { currentTheme, availableThemes, setTheme, getTheme } = useTheme()
    const isOpen = ref(false)
    const filterText = ref('')

    // 使用的主题列表
    const themeList = computed(() => {
      return props.themes || availableThemes.value
    })

    // 当前选中的主题
    const selectedTheme = computed(() => {
      return props.value || currentTheme.value
    })

    // 过滤后的主题列表
    const filteredThemes = computed(() => {
      if (!props.filterable || !filterText.value) {
        return themeList.value
      }

      const query = filterText.value.toLowerCase()
      return themeList.value.filter(themeName => {
        const theme = getTheme(themeName)
        return (
          themeName.toLowerCase().includes(query) ||
          theme?.displayName.toLowerCase().includes(query) ||
          theme?.description?.toLowerCase().includes(query)
        )
      })
    })

    // 选择器类名
    const selectorClasses = computed(() => {
      const classes = [
        'theme-selector',
        `theme-selector--${props.size}`,
        `theme-selector--placement-${props.placement}`,
      ]

      if (props.disabled) classes.push('theme-selector--disabled')
      if (isOpen.value) classes.push('theme-selector--open')
      if (selectedTheme.value) classes.push('theme-selector--has-value')

      return classes
    })

    // 处理主题选择
    const handleSelect = async (themeName: string) => {
      if (props.disabled) return

      try {
        await setTheme(themeName)
        emit('update:value', themeName)
        emit('change', themeName)
        isOpen.value = false
        filterText.value = ''
      } catch (error) {
        console.error('Failed to set theme:', error)
      }
    }

    // 处理清除
    const handleClear = (event: MouseEvent) => {
      event.stopPropagation()

      if (props.disabled) return

      emit('update:value', undefined)
      emit('clear')
      isOpen.value = false
    }

    // 处理点击
    const handleClick = () => {
      if (props.disabled) return

      isOpen.value = !isOpen.value
    }

    // 处理过滤输入
    const handleFilterInput = (event: Event) => {
      const target = event.target as HTMLInputElement
      filterText.value = target.value
    }

    // 获取主题显示名称
    const getThemeDisplayName = (themeName: string) => {
      const theme = getTheme(themeName)
      return theme?.displayName || themeName
    }

    // 获取主题描述
    const getThemeDescription = (themeName: string) => {
      const theme = getTheme(themeName)
      return theme?.description
    }

    return () => {
      const selectedText = selectedTheme.value
        ? getThemeDisplayName(selectedTheme.value)
        : props.placeholder

      const clearIcon = props.clearable && selectedTheme.value && (
        <i class='theme-selector__clear' onClick={handleClear}>
          ×
        </i>
      )

      const arrowIcon = (
        <i
          class={`theme-selector__arrow ${
            isOpen.value ? 'theme-selector__arrow--up' : ''
          }`}
        >
          ▼
        </i>
      )

      const filterInput = props.filterable && isOpen.value && (
        <div class='theme-selector__filter'>
          <input
            type='text'
            class='theme-selector__filter-input'
            placeholder='搜索主题...'
            value={filterText.value}
            onInput={handleFilterInput}
          />
        </div>
      )

      const optionsList = isOpen.value && (
        <div class='theme-selector__dropdown'>
          {filterInput}
          <div class='theme-selector__options'>
            {filteredThemes.value.length === 0 ? (
              <div class='theme-selector__empty'>没有找到匹配的主题</div>
            ) : (
              filteredThemes.value.map(themeName => {
                const isSelected = themeName === selectedTheme.value
                const displayName = getThemeDisplayName(themeName)
                const description = getThemeDescription(themeName)

                return (
                  <div
                    key={themeName}
                    class={`theme-selector__option ${
                      isSelected ? 'theme-selector__option--selected' : ''
                    }`}
                    onClick={() => handleSelect(themeName)}
                  >
                    <div class='theme-selector__option-content'>
                      <div class='theme-selector__option-name'>
                        {displayName}
                      </div>
                      {description && (
                        <div class='theme-selector__option-description'>
                          {description}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <i class='theme-selector__option-check'>✓</i>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )

      return (
        <div class={selectorClasses.value}>
          <div class='theme-selector__trigger' onClick={handleClick}>
            <span class='theme-selector__text'>{selectedText}</span>
            <div class='theme-selector__suffix'>
              {clearIcon}
              {arrowIcon}
            </div>
          </div>
          {optionsList}
        </div>
      )
    }
  },
})

export default ThemeSelector

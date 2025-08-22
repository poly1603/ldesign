/**
 * 语言切换器组件 (TSX版本)
 *
 * 提供语言切换功能，支持下拉菜单模式
 */

import type { LanguageInfo } from '../../core/types'
import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue'
import { useLanguageSwitcher } from '../composables'

// Vue JSX 类型增强
declare module '@vue/runtime-core' {
  interface HTMLAttributes {
    children?: any
  }
  interface ButtonHTMLAttributes {
    children?: any
  }
  interface StyleHTMLAttributes {
    children?: any
  }
}

export interface LanguageSwitcherProps {
  /** UI模式：下拉菜单或对话框 */
  mode?: 'dropdown' | 'dialog'
  /** 是否显示国旗图标 */
  showFlag?: boolean
  /** 是否显示语言代码 */
  showCode?: boolean
  /** 是否显示本地名称 */
  showNativeName?: boolean
  /** 主题 */
  theme?: 'light' | 'dark' | 'auto'
  /** 是否禁用 */
  disabled?: boolean
}

export default defineComponent({
  name: 'LanguageSwitcher',
  props: {
    mode: {
      type: String as () => 'dropdown' | 'dialog',
      default: 'dropdown',
    },
    showFlag: {
      type: Boolean,
      default: true,
    },
    showCode: {
      type: Boolean,
      default: false,
    },
    showNativeName: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: String as () => 'light' | 'dark' | 'auto',
      default: 'light',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['language-changed'],
  setup(props, { emit }) {
    const {
      locale: currentLanguage,
      availableLanguages,
      isChanging,
      switchLanguage: changeLanguage,
    } = useLanguageSwitcher()

    const isOpen = ref(false)
    const triggerRef = ref<HTMLElement>()
    const dropdownRef = ref<HTMLElement>()

    // 当前语言信息
    const currentLanguageInfo = computed(() => {
      return availableLanguages.value.find(lang => lang.code === currentLanguage.value)
    })

    // 切换下拉菜单
    const toggleDropdown = () => {
      if (props.disabled || isChanging.value)
        return
      isOpen.value = !isOpen.value
    }

    // 选择语言
    const selectLanguage = async (languageCode: string) => {
      if (languageCode === currentLanguage.value) {
        isOpen.value = false
        return
      }

      try {
        await changeLanguage(languageCode)
        emit('language-changed', languageCode)
        isOpen.value = false
      }
      catch (error) {
        console.error('Failed to change language:', error)
      }
    }

    // 点击外部关闭
    const handleClickOutside = (event: Event) => {
      if (!isOpen.value)
        return

      const target = event.target as Node
      if (
        triggerRef.value && !triggerRef.value.contains(target)
        && dropdownRef.value && !dropdownRef.value.contains(target)
      ) {
        isOpen.value = false
      }
    }

    // 键盘事件处理
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        isOpen.value = false
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleKeydown)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleKeydown)
    })

    // 渲染语言选项
    const renderLanguageOption = (language: LanguageInfo) => {
      const isSelected = language.code === currentLanguage.value

      return (
        <button
          key={language.code}
          class={[
            'language-switcher__option',
            { 'is-selected': isSelected },
          ]}
          onClick={() => selectLanguage(language.code)}
          disabled={isChanging.value}
        >
          {props.showFlag && (
            <span class="language-switcher__flag">
              {language.flag || '🌐'}
            </span>
          )}
          <span class="language-switcher__name">
            {props.showNativeName ? language.nativeName : language.name}
          </span>
          {props.showCode && (
            <span class="language-switcher__code">
              (
              {language.code}
              )
            </span>
          )}
          {isSelected && (
            <span class="language-switcher__check">✓</span>
          )}
        </button>
      )
    }

    return () => (
      <div
        class={[
          'language-switcher',
          `language-switcher--${props.mode}`,
          `language-switcher--${props.theme}`,
          { 'is-disabled': props.disabled || isChanging.value },
        ]}
      >
        {/* 触发按钮 */}
        <button
          ref={triggerRef}
          class="language-switcher__trigger"
          onClick={toggleDropdown}
          disabled={props.disabled || isChanging.value}
          aria-haspopup="listbox"
          aria-expanded={isOpen.value}
        >
          {currentLanguageInfo.value && (
            <>
              {props.showFlag && (
                <span class="language-switcher__flag">
                  {currentLanguageInfo.value.flag || '🌐'}
                </span>
              )}
              <span class="language-switcher__name">
                {props.showNativeName
                  ? currentLanguageInfo.value.nativeName
                  : currentLanguageInfo.value.name}
              </span>
              {props.showCode && (
                <span class="language-switcher__code">
                  (
                  {currentLanguageInfo.value.code}
                  )
                </span>
              )}
            </>
          )}
          <span class="language-switcher__arrow">▼</span>
        </button>

        {/* 下拉菜单 */}
        {isOpen.value && (
          <div
            ref={dropdownRef}
            class="language-switcher__dropdown"
            role="listbox"
          >
            {availableLanguages.value.map(renderLanguageOption)}
          </div>
        )}

        {/* 基础样式 */}
        <style>
          {`
          .language-switcher {
            position: relative;
            display: inline-block;
          }
          
          .language-switcher__trigger {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            background: white;
            cursor: pointer;
            font-size: 0.875rem;
            transition: all 0.2s;
          }
          
          .language-switcher__trigger:hover {
            border-color: #9ca3af;
          }
          
          .language-switcher__trigger:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          .language-switcher__dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            margin-top: 0.25rem;
            background: white;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 50;
            max-height: 200px;
            overflow-y: auto;
          }
          
          .language-switcher__option {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            width: 100%;
            padding: 0.5rem 1rem;
            border: none;
            background: none;
            cursor: pointer;
            font-size: 0.875rem;
            text-align: left;
            transition: background-color 0.2s;
          }
          
          .language-switcher__option:hover {
            background-color: #f3f4f6;
          }
          
          .language-switcher__option.is-selected {
            background-color: #eff6ff;
            color: #2563eb;
          }
          
          .language-switcher__flag {
            font-size: 1rem;
          }
          
          .language-switcher__code {
            color: #6b7280;
            font-size: 0.75rem;
          }
          
          .language-switcher__check {
            margin-left: auto;
            color: #10b981;
          }
          
          .language-switcher__arrow {
            margin-left: auto;
            font-size: 0.75rem;
            transition: transform 0.2s;
          }
          
          .language-switcher--dark .language-switcher__trigger {
            background: #374151;
            border-color: #4b5563;
            color: white;
          }
          
          .language-switcher--dark .language-switcher__dropdown {
            background: #374151;
            border-color: #4b5563;
          }
          
          .language-switcher--dark .language-switcher__option {
            color: white;
          }
          
          .language-switcher--dark .language-switcher__option:hover {
            background-color: #4b5563;
          }
        `}
        </style>
      </div>
    )
  },
})

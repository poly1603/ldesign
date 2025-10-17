/**
 * @ldesign/router 语言切换组件
 * 
 * 提供语言切换UI组件
 */

import { defineComponent, h, type PropType } from 'vue'
import { useI18nRoute } from '../features/i18n'
import { RouterLink } from './RouterLink'

export const LocaleSwitcher = defineComponent({
  name: 'LocaleSwitcher',
  props: {
    // 显示模式
    mode: {
      type: String as PropType<'dropdown' | 'inline' | 'buttons'>,
      default: 'dropdown',
    },
    // 显示格式
    format: {
      type: String as PropType<'code' | 'name' | 'native' | 'emoji'>,
      default: 'code',
    },
    // 语言名称映射
    labels: {
      type: Object as PropType<Record<string, string>>,
      default: () => ({
        en: 'English',
        zh: '中文',
        ja: '日本語',
        ko: '한국어',
        es: 'Español',
        fr: 'Français',
        de: 'Deutsch',
        ru: 'Русский',
      }),
    },
    // 语言表情映射
    emojis: {
      type: Object as PropType<Record<string, string>>,
      default: () => ({
        en: '🇺🇸',
        zh: '🇨🇳',
        ja: '🇯🇵',
        ko: '🇰🇷',
        es: '🇪🇸',
        fr: '🇫🇷',
        de: '🇩🇪',
        ru: '🇷🇺',
      }),
    },
    // 自定义类名
    class: {
      type: String,
      default: '',
    },
    // 下拉框位置
    position: {
      type: String as PropType<'top' | 'bottom' | 'left' | 'right'>,
      default: 'bottom',
    },
  },
  setup(props, { slots }) {
    const { locale, setLocale, getSwitchLinks } = useI18nRoute()
    
    // 格式化语言显示
    const formatLocale = (loc: string): string => {
      switch (props.format) {
        case 'code':
          return loc.toUpperCase()
        case 'name':
          return props.labels[loc] || loc
        case 'native':
          return props.labels[loc] || loc
        case 'emoji':
          return props.emojis[loc] || loc
        default:
          return loc
      }
    }
    
    // 渲染下拉菜单
    const renderDropdown = () => {
      const links = getSwitchLinks()
      
      return h('div', {
        class: `locale-switcher locale-switcher--dropdown ${props.class}`,
      }, [
        h('button', {
          class: 'locale-switcher__trigger',
          'aria-haspopup': 'listbox',
          'aria-expanded': 'false',
        }, [
          slots.trigger?.({ locale: locale.value, label: formatLocale(locale.value) }) ||
          h('span', formatLocale(locale.value)),
          h('svg', {
            class: 'locale-switcher__arrow',
            width: '12',
            height: '12',
            viewBox: '0 0 12 12',
          }, [
            h('path', {
              d: 'M2 4L6 8L10 4',
              stroke: 'currentColor',
              'stroke-width': '2',
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round',
              fill: 'none',
            }),
          ]),
        ]),
        h('ul', {
          class: `locale-switcher__menu locale-switcher__menu--${props.position}`,
          role: 'listbox',
        }, links.map(link => 
          h('li', {
            key: link.locale,
            class: 'locale-switcher__item',
            role: 'option',
            'aria-selected': link.active,
          }, [
            h('button', {
              class: [
                'locale-switcher__link',
                { 'locale-switcher__link--active': link.active },
              ],
              onClick: () => setLocale(link.locale),
              disabled: link.active,
            }, [
              props.format === 'emoji' && h('span', { class: 'locale-switcher__emoji' }, props.emojis[link.locale]),
              h('span', formatLocale(link.locale)),
            ]),
          ])
        )),
      ])
    }
    
    // 渲染内联列表
    const renderInline = () => {
      const links = getSwitchLinks()
      
      return h('nav', {
        class: `locale-switcher locale-switcher--inline ${props.class}`,
        'aria-label': 'Language switcher',
      }, [
        h('ul', {
          class: 'locale-switcher__list',
        }, links.map((link, index) => 
          h('li', {
            key: link.locale,
            class: 'locale-switcher__item',
          }, [
            h(RouterLink, {
              to: link.path,
              class: [
                'locale-switcher__link',
                { 'locale-switcher__link--active': link.active },
              ],
              custom: true,
            }, {
              default: ({ navigate }: any) => h('button', {
                onClick: navigate,
                disabled: link.active,
                'aria-current': link.active ? 'true' : undefined,
              }, formatLocale(link.locale)),
            }),
            index < links.length - 1 && h('span', { class: 'locale-switcher__separator' }, ' | '),
          ])
        )),
      ])
    }
    
    // 渲染按钮组
    const renderButtons = () => {
      const links = getSwitchLinks()
      
      return h('div', {
        class: `locale-switcher locale-switcher--buttons ${props.class}`,
        role: 'group',
        'aria-label': 'Language switcher',
      }, links.map(link => 
        h('button', {
          key: link.locale,
          class: [
            'locale-switcher__button',
            { 'locale-switcher__button--active': link.active },
          ],
          onClick: () => setLocale(link.locale),
          disabled: link.active,
          'aria-pressed': link.active,
          title: props.labels[link.locale],
        }, [
          props.format === 'emoji' 
            ? props.emojis[link.locale] 
            : formatLocale(link.locale),
        ])
      ))
    }
    
    return () => {
      switch (props.mode) {
        case 'dropdown':
          return renderDropdown()
        case 'inline':
          return renderInline()
        case 'buttons':
          return renderButtons()
        default:
          return null
      }
    }
  },
})

// 默认样式
const defaultStyles = `
<style>
.locale-switcher {
  position: relative;
  font-family: inherit;
}

/* 下拉菜单样式 */
.locale-switcher--dropdown .locale-switcher__trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.locale-switcher--dropdown .locale-switcher__trigger:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.locale-switcher__arrow {
  transition: transform 0.2s;
}

.locale-switcher__trigger[aria-expanded="true"] .locale-switcher__arrow {
  transform: rotate(180deg);
}

.locale-switcher__menu {
  position: absolute;
  z-index: 50;
  min-width: 150px;
  margin-top: 0.5rem;
  padding: 0.5rem 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  list-style: none;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s;
}

.locale-switcher__trigger[aria-expanded="true"] + .locale-switcher__menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.locale-switcher__menu--top {
  bottom: 100%;
  margin-bottom: 0.5rem;
  margin-top: 0;
}

.locale-switcher__menu--left {
  right: 100%;
  margin-right: 0.5rem;
  margin-top: 0;
}

.locale-switcher__menu--right {
  left: 100%;
  margin-left: 0.5rem;
  margin-top: 0;
}

.locale-switcher__item {
  list-style: none;
}

.locale-switcher__link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 1rem;
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.locale-switcher__link:hover:not(:disabled) {
  background: #f3f4f6;
}

.locale-switcher__link--active {
  color: #3b82f6;
  font-weight: 600;
}

.locale-switcher__link:disabled {
  cursor: default;
}

/* 内联样式 */
.locale-switcher--inline .locale-switcher__list {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.locale-switcher--inline .locale-switcher__link {
  padding: 0.25rem 0.5rem;
  color: #6b7280;
  text-decoration: none;
  transition: color 0.2s;
}

.locale-switcher--inline .locale-switcher__link:hover:not(:disabled) {
  color: #3b82f6;
}

.locale-switcher--inline .locale-switcher__separator {
  color: #e5e7eb;
}

/* 按钮组样式 */
.locale-switcher--buttons {
  display: inline-flex;
  border-radius: 0.375rem;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.locale-switcher__button {
  padding: 0.5rem 1rem;
  background: white;
  border: none;
  border-right: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
}

.locale-switcher__button:last-child {
  border-right: none;
}

.locale-switcher__button:hover:not(:disabled) {
  background: #f9fafb;
}

.locale-switcher__button--active {
  background: #3b82f6;
  color: white;
}

.locale-switcher__button:disabled {
  cursor: default;
}

.locale-switcher__emoji {
  font-size: 1.25rem;
  margin-right: 0.25rem;
}
</style>
`

export default LocaleSwitcher
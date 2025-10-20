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

// 默认样式功能已移除


export default LocaleSwitcher
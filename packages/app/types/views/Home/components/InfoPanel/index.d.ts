import { JSX } from '../../../../node_modules/.pnpm/vue@3.5.18_typescript@5.8.3/node_modules/vue/jsx-runtime/index.d.js'
import * as vue from 'vue'
import { PropType } from 'vue'

interface InfoPanelProps {
  title: string
  icon: string
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
  size?: 'small' | 'medium' | 'large'
}
declare const InfoPanel: vue.DefineComponent<
  vue.ExtractPropTypes<{
    title: {
      type: StringConstructor
      required: true
    }
    icon: {
      type: StringConstructor
      required: true
    }
    variant: {
      type: PropType<'default' | 'primary' | 'success' | 'warning' | 'error'>
      default: string
    }
    size: {
      type: PropType<'small' | 'medium' | 'large'>
      default: string
    }
  }>,
  () => JSX.Element,
  {},
  {},
  {},
  vue.ComponentOptionsMixin,
  vue.ComponentOptionsMixin,
  {},
  string,
  vue.PublicProps,
  Readonly<
    vue.ExtractPropTypes<{
      title: {
        type: StringConstructor
        required: true
      }
      icon: {
        type: StringConstructor
        required: true
      }
      variant: {
        type: PropType<'default' | 'primary' | 'success' | 'warning' | 'error'>
        default: string
      }
      size: {
        type: PropType<'small' | 'medium' | 'large'>
        default: string
      }
    }>
  > &
    Readonly<{}>,
  {
    variant: 'default' | 'primary' | 'success' | 'warning' | 'error'
    size: 'small' | 'medium' | 'large'
  },
  {},
  {},
  {},
  string,
  vue.ComponentProvideOptions,
  true,
  {},
  any
>
declare const InfoItem: vue.DefineComponent<
  vue.ExtractPropTypes<{
    label: {
      type: StringConstructor
      required: true
    }
    value: {
      type: StringConstructor
      required: true
    }
    icon: {
      type: StringConstructor
      default: string
    }
    type: {
      type: PropType<'text' | 'link' | 'email' | 'phone'>
      default: string
    }
    href: {
      type: StringConstructor
      default: string
    }
  }>,
  () => JSX.Element,
  {},
  {},
  {},
  vue.ComponentOptionsMixin,
  vue.ComponentOptionsMixin,
  {},
  string,
  vue.PublicProps,
  Readonly<
    vue.ExtractPropTypes<{
      label: {
        type: StringConstructor
        required: true
      }
      value: {
        type: StringConstructor
        required: true
      }
      icon: {
        type: StringConstructor
        default: string
      }
      type: {
        type: PropType<'text' | 'link' | 'email' | 'phone'>
        default: string
      }
      href: {
        type: StringConstructor
        default: string
      }
    }>
  > &
    Readonly<{}>,
  {
    type: 'text' | 'link' | 'email' | 'phone'
    icon: string
    href: string
  },
  {},
  {},
  {},
  string,
  vue.ComponentProvideOptions,
  true,
  {},
  any
>
declare const DeviceIndicator: vue.DefineComponent<
  vue.ExtractPropTypes<{
    icon: {
      type: StringConstructor
      required: true
    }
    label: {
      type: StringConstructor
      required: true
    }
    active: {
      type: BooleanConstructor
      default: boolean
    }
  }>,
  () => JSX.Element,
  {},
  {},
  {},
  vue.ComponentOptionsMixin,
  vue.ComponentOptionsMixin,
  {},
  string,
  vue.PublicProps,
  Readonly<
    vue.ExtractPropTypes<{
      icon: {
        type: StringConstructor
        required: true
      }
      label: {
        type: StringConstructor
        required: true
      }
      active: {
        type: BooleanConstructor
        default: boolean
      }
    }>
  > &
    Readonly<{}>,
  {
    active: boolean
  },
  {},
  {},
  {},
  string,
  vue.ComponentProvideOptions,
  true,
  {},
  any
>

export { DeviceIndicator, InfoItem, InfoPanel, InfoPanel as default }
export type { InfoPanelProps }

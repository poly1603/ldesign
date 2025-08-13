import { JSX } from '../../../../node_modules/.pnpm/vue@3.5.18_typescript@5.8.3/node_modules/vue/jsx-runtime/index.d.js'
import * as vue from 'vue'
import { PropType } from 'vue'
import { RequestStats } from '../../types/index.js'

interface HttpStatsPanelProps {
  stats: RequestStats
  loading: boolean
  error: any
  apiUrl: string
}
declare const _default: vue.DefineComponent<
  vue.ExtractPropTypes<{
    stats: {
      type: PropType<RequestStats>
      required: true
    }
    loading: {
      type: BooleanConstructor
      default: boolean
    }
    error: {
      type: PropType<any>
      default: null
    }
    apiUrl: {
      type: StringConstructor
      required: true
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
      stats: {
        type: PropType<RequestStats>
        required: true
      }
      loading: {
        type: BooleanConstructor
        default: boolean
      }
      error: {
        type: PropType<any>
        default: null
      }
      apiUrl: {
        type: StringConstructor
        required: true
      }
    }>
  > &
    Readonly<{}>,
  {
    loading: boolean
    error: any
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

export { _default as default }
export type { HttpStatsPanelProps }

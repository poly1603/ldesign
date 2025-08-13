import { JSX } from '../../../../node_modules/.pnpm/vue@3.5.18_typescript@5.8.3/node_modules/vue/jsx-runtime/index.d.js'
import * as vue from 'vue'
import { PropType } from 'vue'

interface HttpActionsPanelProps {
  loading: boolean
  activeRequests: number
  onFetchUsers: () => void
  onFetchPosts: (limit?: number) => void
  onFetchAllData: () => void
  onCancelAllRequests: () => void
  onClearCache: () => void
}
declare const _default: vue.DefineComponent<
  vue.ExtractPropTypes<{
    loading: {
      type: BooleanConstructor
      default: boolean
    }
    activeRequests: {
      type: NumberConstructor
      default: number
    }
    onFetchUsers: {
      type: PropType<() => void>
      required: true
    }
    onFetchPosts: {
      type: PropType<(limit?: number) => void>
      required: true
    }
    onFetchAllData: {
      type: PropType<() => void>
      required: true
    }
    onCancelAllRequests: {
      type: PropType<() => void>
      required: true
    }
    onClearCache: {
      type: PropType<() => void>
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
      loading: {
        type: BooleanConstructor
        default: boolean
      }
      activeRequests: {
        type: NumberConstructor
        default: number
      }
      onFetchUsers: {
        type: PropType<() => void>
        required: true
      }
      onFetchPosts: {
        type: PropType<(limit?: number) => void>
        required: true
      }
      onFetchAllData: {
        type: PropType<() => void>
        required: true
      }
      onCancelAllRequests: {
        type: PropType<() => void>
        required: true
      }
      onClearCache: {
        type: PropType<() => void>
        required: true
      }
    }>
  > &
    Readonly<{}>,
  {
    loading: boolean
    activeRequests: number
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
export type { HttpActionsPanelProps }

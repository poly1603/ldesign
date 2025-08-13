import { JSX } from '../../../../node_modules/.pnpm/vue@3.5.18_typescript@5.8.3/node_modules/vue/jsx-runtime/index.d.js'
import * as vue from 'vue'
import { PropType } from 'vue'
import { User } from '../../types/index.js'

interface UserCardProps {
  user: User
  loading?: boolean
  onViewDetails?: (userId: number) => void
}
declare const _default: vue.DefineComponent<
  vue.ExtractPropTypes<{
    user: {
      type: PropType<User>
      required: true
    }
    loading: {
      type: BooleanConstructor
      default: boolean
    }
    onViewDetails: {
      type: PropType<(userId: number) => void>
      default: undefined
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
      user: {
        type: PropType<User>
        required: true
      }
      loading: {
        type: BooleanConstructor
        default: boolean
      }
      onViewDetails: {
        type: PropType<(userId: number) => void>
        default: undefined
      }
    }>
  > &
    Readonly<{}>,
  {
    loading: boolean
    onViewDetails: (userId: number) => void
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
export type { UserCardProps }

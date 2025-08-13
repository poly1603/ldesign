import { JSX } from '../../../../node_modules/.pnpm/vue@3.5.18_typescript@5.8.3/node_modules/vue/jsx-runtime/index.d.js'
import * as vue from 'vue'
import { PropType } from 'vue'
import { Post } from '../../types/index.js'

interface PostCardProps {
  post: Post
  loading?: boolean
  onDelete?: (id: number, title: string) => void
  onView?: (post: Post) => void
}
declare const _default: vue.DefineComponent<
  vue.ExtractPropTypes<{
    post: {
      type: PropType<Post>
      required: true
    }
    loading: {
      type: BooleanConstructor
      default: boolean
    }
    onDelete: {
      type: PropType<(id: number, title: string) => void>
      default: undefined
    }
    onView: {
      type: PropType<(post: Post) => void>
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
      post: {
        type: PropType<Post>
        required: true
      }
      loading: {
        type: BooleanConstructor
        default: boolean
      }
      onDelete: {
        type: PropType<(id: number, title: string) => void>
        default: undefined
      }
      onView: {
        type: PropType<(post: Post) => void>
        default: undefined
      }
    }>
  > &
    Readonly<{}>,
  {
    loading: boolean
    onDelete: (id: number, title: string) => void
    onView: (post: Post) => void
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
export type { PostCardProps }

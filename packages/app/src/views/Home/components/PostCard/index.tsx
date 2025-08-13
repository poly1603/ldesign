import { defineComponent, type PropType } from 'vue'
import type { Post } from '../../types'
import './PostCard.less'

export interface PostCardProps {
  post: Post
  loading?: boolean
  onDelete?: (id: number, title: string) => void
  onView?: (post: Post) => void
}

export default defineComponent({
  name: 'PostCard',
  props: {
    post: {
      type: Object as PropType<Post>,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    onDelete: {
      type: Function as PropType<(id: number, title: string) => void>,
      default: undefined,
    },
    onView: {
      type: Function as PropType<(post: Post) => void>,
      default: undefined,
    },
  },
  setup(props) {
    const handleDelete = () => {
      if (props.onDelete && !props.loading) {
        props.onDelete(props.post.id, props.post.title)
      }
    }

    const handleView = () => {
      if (props.onView && !props.loading) {
        props.onView(props.post)
      }
    }

    // 截取文章内容预览
    const getContentPreview = (content: string, maxLength: number = 120) => {
      if (content.length <= maxLength) return content
      return content.substring(0, maxLength) + '...'
    }

    return () => (
      <div class={['post-card', { loading: props.loading }]}>
        <div class='post-header'>
          <div class='post-meta'>
            <span class='post-id'>#{props.post.id}</span>
            <span class='post-author'>用户 {props.post.userId}</span>
          </div>
          <div class='post-actions'>
            {props.onDelete && (
              <button
                class='btn btn-danger btn-xs'
                onClick={handleDelete}
                disabled={props.loading}
                title='删除文章'
              >
                🗑️
              </button>
            )}
            {props.onView && (
              <button
                class='btn btn-info btn-xs'
                onClick={handleView}
                disabled={props.loading}
                title='查看详情'
              >
                👁️
              </button>
            )}
          </div>
        </div>

        <div class='post-content'>
          <h5 class='post-title' title={props.post.title}>
            {props.post.title}
          </h5>
          <p class='post-body'>{getContentPreview(props.post.body)}</p>
        </div>

        <div class='post-footer'>
          <div class='post-stats'>
            <span class='stat-item'>
              <span class='stat-icon'>📝</span>
              <span class='stat-text'>{props.post.body.length} 字符</span>
            </span>
            <span class='stat-item'>
              <span class='stat-icon'>👤</span>
              <span class='stat-text'>作者 {props.post.userId}</span>
            </span>
          </div>
        </div>

        {props.loading && (
          <div class='loading-overlay'>
            <div class='loading-spinner'></div>
          </div>
        )}
      </div>
    )
  },
})

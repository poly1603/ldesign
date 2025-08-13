import type { User } from '../../types'
import { defineComponent, type PropType } from 'vue'
import './UserCard.less'

export interface UserCardProps {
  user: User
  loading?: boolean
  onViewDetails?: (userId: number) => void
}

export default defineComponent({
  name: 'UserCard',
  props: {
    user: {
      type: Object as PropType<User>,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    onViewDetails: {
      type: Function as PropType<(userId: number) => void>,
      default: undefined,
    },
  },
  setup(props) {
    const handleViewDetails = () => {
      if (props.onViewDetails && !props.loading) {
        props.onViewDetails(props.user.id)
      }
    }

    return () => (
      <div class='user-card'>
        <div class='user-avatar'>
          <span class='avatar-text'>
            {props.user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div class='user-info'>
          <strong class='user-name'>{props.user.name}</strong>
          <a
            href={`mailto:${props.user.email}`}
            class='user-email'
            onClick={e => e.stopPropagation()}
          >
            {props.user.email}
          </a>
          <small class='user-username'>@{props.user.username}</small>

          <div class='user-details'>
            <div class='detail-item'>
              <span class='detail-icon'>📞</span>
              <span class='detail-text'>{props.user.phone}</span>
            </div>
            <div class='detail-item'>
              <span class='detail-icon'>🌐</span>
              <a
                href={`https://${props.user.website}`}
                target='_blank'
                rel='noopener noreferrer'
                class='detail-link'
                onClick={e => e.stopPropagation()}
              >
                {props.user.website}
              </a>
            </div>
            {props.user.company && (
              <div class='detail-item'>
                <span class='detail-icon'>🏢</span>
                <span class='detail-text'>{props.user.company.name}</span>
              </div>
            )}
            {props.user.address && (
              <div class='detail-item'>
                <span class='detail-icon'>📍</span>
                <span class='detail-text'>
                  {props.user.address.city},{props.user.address.street}
                </span>
              </div>
            )}
          </div>

          {props.onViewDetails && (
            <div class='user-actions'>
              <button
                class='btn btn-info btn-xs'
                onClick={handleViewDetails}
                disabled={props.loading}
              >
                {props.loading ? '加载中...' : '📋 查看详情'}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  },
})

import { defineComponent, type PropType } from 'vue'
import './HttpActionsPanel.less'

export interface HttpActionsPanelProps {
  loading: boolean
  activeRequests: number
  onFetchUsers: () => void
  onFetchPosts: (limit?: number) => void
  onFetchAllData: () => void
  onCancelAllRequests: () => void
  onClearCache: () => void
}

export default defineComponent({
  name: 'HttpActionsPanel',
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    activeRequests: {
      type: Number,
      default: 0,
    },
    onFetchUsers: {
      type: Function as PropType<() => void>,
      required: true,
    },
    onFetchPosts: {
      type: Function as PropType<(limit?: number) => void>,
      required: true,
    },
    onFetchAllData: {
      type: Function as PropType<() => void>,
      required: true,
    },
    onCancelAllRequests: {
      type: Function as PropType<() => void>,
      required: true,
    },
    onClearCache: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },
  setup(props) {
    return () => (
      <div class='http-actions-panel'>
        <div class='actions-header'>
          <h4 class='actions-title'>
            <span class='title-icon'>🌐</span>
            HTTP 功能演示
          </h4>
          {props.activeRequests > 0 && (
            <div class='active-requests-badge'>
              {props.activeRequests} 个活跃请求
            </div>
          )}
        </div>

        <div class='actions-content'>
          <div class='action-group primary-actions'>
            <div class='group-label'>基础操作</div>
            <div class='action-buttons'>
              <button
                class='action-btn primary'
                onClick={props.onFetchUsers}
                disabled={props.loading}
              >
                <span class='btn-icon'>👥</span>
                <span class='btn-text'>
                  {props.loading ? '加载中...' : '获取用户列表'}
                </span>
              </button>

              <button
                class='action-btn secondary'
                onClick={() => props.onFetchPosts(5)}
                disabled={props.loading}
              >
                <span class='btn-icon'>📝</span>
                <span class='btn-text'>
                  {props.loading ? '加载中...' : '获取文章列表'}
                </span>
              </button>

              <button
                class='action-btn info'
                onClick={() => props.onFetchPosts(10)}
                disabled={props.loading}
              >
                <span class='btn-icon'>📚</span>
                <span class='btn-text'>获取更多文章</span>
              </button>
            </div>
          </div>

          <div class='action-group advanced-actions'>
            <div class='group-label'>高级操作</div>
            <div class='action-buttons'>
              <button
                class='action-btn success'
                onClick={props.onFetchAllData}
                disabled={props.loading}
              >
                <span class='btn-icon'>🚀</span>
                <span class='btn-text'>批量获取数据</span>
              </button>

              <button
                class='action-btn warning'
                onClick={props.onCancelAllRequests}
                disabled={props.activeRequests === 0}
              >
                <span class='btn-icon'>❌</span>
                <span class='btn-text'>取消所有请求</span>
              </button>

              <button class='action-btn outline' onClick={props.onClearCache}>
                <span class='btn-icon'>🗑️</span>
                <span class='btn-text'>清除缓存</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  },
})

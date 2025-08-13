import { defineComponent, type PropType, computed } from 'vue'
import type { RequestStats } from '../../types'
import './HttpStatsPanel.less'

export interface HttpStatsPanelProps {
  stats: RequestStats
  loading: boolean
  error: any
  apiUrl: string
}

export default defineComponent({
  name: 'HttpStatsPanel',
  props: {
    stats: {
      type: Object as PropType<RequestStats>,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    error: {
      type: Object as PropType<any>,
      default: null,
    },
    apiUrl: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    // 计算成功率
    const successRate = computed(() => {
      if (props.stats.totalRequests === 0) return 0
      return Math.round(
        (props.stats.successfulRequests / props.stats.totalRequests) * 100
      )
    })

    // 获取状态颜色类
    const getStatusClass = (type: string) => {
      switch (type) {
        case 'loading':
          return 'status-loading'
        case 'success':
          return 'status-success'
        case 'error':
          return 'status-error'
        case 'warning':
          return 'status-warning'
        default:
          return 'status-normal'
      }
    }

    // 获取成功率状态
    const getSuccessRateStatus = () => {
      if (successRate.value >= 95) return 'success'
      if (successRate.value >= 80) return 'warning'
      return 'error'
    }

    return () => (
      <div class='http-stats-panel'>
        <div class='panel-header'>
          <h3 class='panel-title'>
            <span class='title-icon'>📊</span>
            HTTP 状态与统计
          </h3>
          <div
            class={[
              'status-indicator',
              getStatusClass(props.loading ? 'loading' : 'normal'),
            ]}
          >
            <span class='indicator-dot'></span>
            <span class='indicator-text'>
              {props.loading ? '请求中' : '空闲'}
            </span>
          </div>
        </div>

        <div class='stats-grid'>
          <div class='stat-card primary'>
            <div class='stat-icon'>🚀</div>
            <div class='stat-content'>
              <div class='stat-value'>{props.stats.activeRequests}</div>
              <div class='stat-label'>活跃请求</div>
            </div>
          </div>

          <div class='stat-card'>
            <div class='stat-icon'>📈</div>
            <div class='stat-content'>
              <div class='stat-value'>{props.stats.totalRequests}</div>
              <div class='stat-label'>总请求数</div>
            </div>
          </div>

          <div class='stat-card success'>
            <div class='stat-icon'>✅</div>
            <div class='stat-content'>
              <div class='stat-value'>{props.stats.successfulRequests}</div>
              <div class='stat-label'>成功请求</div>
            </div>
          </div>

          <div class='stat-card error'>
            <div class='stat-icon'>❌</div>
            <div class='stat-content'>
              <div class='stat-value'>{props.stats.failedRequests}</div>
              <div class='stat-label'>失败请求</div>
            </div>
          </div>

          <div class={['stat-card', 'rate', getSuccessRateStatus()]}>
            <div class='stat-icon'>📊</div>
            <div class='stat-content'>
              <div class='stat-value'>{successRate.value}%</div>
              <div class='stat-label'>成功率</div>
            </div>
          </div>

          <div class='stat-card info'>
            <div class='stat-icon'>🌐</div>
            <div class='stat-content'>
              <div class='stat-value api-url' title={props.apiUrl}>
                {props.apiUrl}
              </div>
              <div class='stat-label'>API 地址</div>
            </div>
          </div>
        </div>

        {props.error && (
          <div class='error-panel'>
            <div class='error-header'>
              <span class='error-icon'>⚠️</span>
              <span class='error-title'>请求错误</span>
            </div>
            <div class='error-content'>
              <div class='error-message'>{props.error.message}</div>
              {props.error.code && (
                <div class='error-code'>错误代码: {props.error.code}</div>
              )}
              {props.error.response?.status && (
                <div class='error-status'>
                  HTTP 状态: {props.error.response.status}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  },
})

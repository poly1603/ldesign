import { computed, defineComponent } from 'vue'

/**
 * 开发环境信息组件
 * 显示当前开发环境的详细信息
 */
export default defineComponent({
  name: 'DevEnvironmentInfo',
  setup() {
    // 从全局变量获取环境信息
    const envInfo = computed(() => {
      // 默认值
      const defaultInfo = {
        mode: 'built',
        description: '使用构建产物模式',
        port: 3001,
        packages: 'node_modules (built)',
      }

      // 尝试从全局变量获取
      try {
        if (typeof __DEV_ENV_INFO__ !== 'undefined') {
          return __DEV_ENV_INFO__
        }

        if (typeof __DEV_MODE__ !== 'undefined') {
          return {
            ...defaultInfo,
            mode: __DEV_MODE__,
            description: __DEV_MODE__ === 'source' ? '使用源码模式' : '使用构建产物模式',
            port: __DEV_MODE__ === 'source' ? 3002 : 3001,
            packages: __DEV_MODE__ === 'source' ? 'source files' : 'node_modules (built)',
          }
        }
      } catch (error) {
        console.warn('无法获取环境信息:', error)
      }

      return defaultInfo
    })

    function switchToSource() {
      const url = new URL(window.location.href)
      url.port = '3002'
      window.open(url.toString(), '_blank')
    }

    function switchToBuilt() {
      const url = new URL(window.location.href)
      url.port = '3001'
      window.open(url.toString(), '_blank')
    }

    return () => (
      <div class={['dev-env-info', `dev-env-info--${envInfo.value.mode}`]}>
        <div class="dev-env-info__header">
          <h3 class="dev-env-info__title">🔧 开发环境信息</h3>
          <span class={['dev-env-info__badge', `dev-env-info__badge--${envInfo.value.mode}`]}>
            {envInfo.value.mode.toUpperCase()}
          </span>
        </div>

        <div class="dev-env-info__content">
          <div class="dev-env-info__item">
            <span class="dev-env-info__label">模式:</span>
            <span class="dev-env-info__value">{envInfo.value.description}</span>
          </div>

          <div class="dev-env-info__item">
            <span class="dev-env-info__label">端口:</span>
            <span class="dev-env-info__value">{envInfo.value.port}</span>
          </div>

          <div class="dev-env-info__item">
            <span class="dev-env-info__label">包来源:</span>
            <span class="dev-env-info__value">{envInfo.value.packages}</span>
          </div>
        </div>

        <div class="dev-env-info__actions">
          {envInfo.value.mode === 'built' ? (
            <button
              class="dev-env-info__button dev-env-info__button--source"
              onClick={switchToSource}
            >
              🔧 切换到源码模式
            </button>
          ) : (
            <button
              class="dev-env-info__button dev-env-info__button--built"
              onClick={switchToBuilt}
            >
              🏗️ 切换到构建模式
            </button>
          )}
        </div>

        <div class="dev-env-info__tips">
          <p>💡 提示:</p>
          <ul>
            <li>构建模式: 使用已构建的包，更接近生产环境</li>
            <li>源码模式: 直接使用源码，支持热更新调试</li>
          </ul>
        </div>
      </div>
    )
  },
})

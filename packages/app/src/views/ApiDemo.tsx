import { defineComponent, onMounted, reactive, ref } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useApiService } from '../services/api'
import './ApiDemo.less'

export default defineComponent({
  name: 'ApiDemo',
  setup() {
    const {
      isAuthenticated,
      currentUser,
      userMenus,
      userPermissions,
      fetchUserInfo,
    } = useAuth()
    const apiService = useApiService()

    // 演示状态
    const demoState = reactive({
      loading: false,
      result: null as any,
      error: null as string | null,
    })

    // API 调用历史
    const apiHistory = ref<
      Array<{
        method: string
        params: any
        result: any
        timestamp: string
        duration: number
      }>
    >([])

    // 自定义 API 配置
    const customApiConfig = ref({
      name: 'customApi',
      url: '/custom-endpoint',
      method: 'GET',
      params: '{}',
    })

    /**
     * 执行 API 调用并记录
     */
    const executeApi = async (method: string, params?: any) => {
      const startTime = Date.now()
      demoState.loading = true
      demoState.error = null

      try {
        const result = await apiService.callApi(method, params)
        const duration = Date.now() - startTime

        demoState.result = result

        // 记录到历史
        apiHistory.value.unshift({
          method,
          params,
          result,
          timestamp: new Date().toLocaleString(),
          duration,
        })

        // 只保留最近 10 条记录
        if (apiHistory.value.length > 10) {
          apiHistory.value = apiHistory.value.slice(0, 10)
        }

        console.log(`✅ API 调用成功: ${method}`, result)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误'
        demoState.error = errorMessage
        console.error(`❌ API 调用失败: ${method}`, error)
      } finally {
        demoState.loading = false
      }
    }

    /**
     * 系统 API 演示方法
     */
    const demoMethods = {
      // 获取用户信息
      async getUserInfo() {
        await executeApi('getUserInfo')
      },

      // 获取用户菜单
      async getMenus() {
        await executeApi('getMenus')
      },

      // 获取用户权限
      async getPermissions() {
        await executeApi('getPermissions')
      },

      // 获取会话信息
      async getSession() {
        await executeApi('getSession')
      },

      // 刷新令牌
      async refreshToken() {
        await executeApi('refreshToken')
      },

      // 获取验证码
      async getCaptcha() {
        await executeApi('getCaptcha')
      },

      // 修改密码
      async changePassword() {
        await executeApi('changePassword', {
          oldPassword: 'old123',
          newPassword: 'new123',
        })
      },
    }

    /**
     * 注册自定义 API
     */
    const registerCustomApi = async () => {
      try {
        const config = JSON.parse(customApiConfig.value.params)
        await apiService.registerApi(customApiConfig.value.name, {
          url: customApiConfig.value.url,
          method: customApiConfig.value.method,
          ...config,
        })
        console.log('✅ 自定义 API 注册成功')
      } catch (error) {
        console.error('❌ 自定义 API 注册失败:', error)
        demoState.error = '自定义 API 注册失败'
      }
    }

    /**
     * 调用自定义 API
     */
    const callCustomApi = async () => {
      await executeApi(customApiConfig.value.name)
    }

    /**
     * 清空历史记录
     */
    const clearHistory = () => {
      apiHistory.value = []
    }

    /**
     * 刷新用户信息
     */
    const refreshUserInfo = async () => {
      demoState.loading = true
      try {
        await fetchUserInfo()
        console.log('✅ 用户信息刷新成功')
      } catch (error) {
        console.error('❌ 用户信息刷新失败:', error)
      } finally {
        demoState.loading = false
      }
    }

    // 组件挂载时初始化
    onMounted(() => {
      console.log('API 演示页面已挂载')
    })

    return {
      // 状态
      isAuthenticated,
      currentUser,
      userMenus,
      userPermissions,
      demoState,
      apiHistory,
      customApiConfig,

      // 方法
      demoMethods,
      registerCustomApi,
      callCustomApi,
      clearHistory,
      refreshUserInfo,
    }
  },

  render() {
    const {
      isAuthenticated,
      currentUser,
      userMenus,
      userPermissions,
      demoState,
      apiHistory,
      customApiConfig,
      demoMethods,
      registerCustomApi,
      callCustomApi,
      clearHistory,
      refreshUserInfo,
    } = this

    return (
      <div class='api-demo'>
        <div class='api-demo__header'>
          <h1>🚀 API 功能演示</h1>
          <p>展示 @ldesign/api 包的完整功能</p>
        </div>

        {/* 用户状态 */}
        <div class='api-demo__section'>
          <h2>👤 用户状态</h2>
          <div class='user-status'>
            <div class='status-item'>
              <label>登录状态:</label>
              <span class={isAuthenticated ? 'status-success' : 'status-error'}>
                {isAuthenticated ? '✅ 已登录' : '❌ 未登录'}
              </span>
            </div>
            {currentUser && (
              <div class='status-item'>
                <label>用户信息:</label>
                <pre>{JSON.stringify(currentUser, null, 2)}</pre>
              </div>
            )}
            <button onClick={refreshUserInfo} disabled={demoState.loading}>
              🔄 刷新用户信息
            </button>
          </div>
        </div>

        {/* 系统 API 演示 */}
        <div class='api-demo__section'>
          <h2>🔧 系统 API 演示</h2>
          <div class='api-buttons'>
            <button
              onClick={demoMethods.getUserInfo}
              disabled={demoState.loading}
            >
              获取用户信息
            </button>
            <button onClick={demoMethods.getMenus} disabled={demoState.loading}>
              获取用户菜单
            </button>
            <button
              onClick={demoMethods.getPermissions}
              disabled={demoState.loading}
            >
              获取用户权限
            </button>
            <button
              onClick={demoMethods.getSession}
              disabled={demoState.loading}
            >
              获取会话信息
            </button>
            <button
              onClick={demoMethods.refreshToken}
              disabled={demoState.loading}
            >
              刷新令牌
            </button>
            <button
              onClick={demoMethods.getCaptcha}
              disabled={demoState.loading}
            >
              获取验证码
            </button>
            <button
              onClick={demoMethods.changePassword}
              disabled={demoState.loading}
            >
              修改密码
            </button>
          </div>
        </div>

        {/* 自定义 API */}
        <div class='api-demo__section'>
          <h2>⚙️ 自定义 API</h2>
          <div class='custom-api'>
            <div class='form-group'>
              <label>API 名称:</label>
              <input v-model={customApiConfig.name} placeholder='customApi' />
            </div>
            <div class='form-group'>
              <label>API 地址:</label>
              <input
                v-model={customApiConfig.url}
                placeholder='/custom-endpoint'
              />
            </div>
            <div class='form-group'>
              <label>请求方法:</label>
              <select v-model={customApiConfig.method}>
                <option value='GET'>GET</option>
                <option value='POST'>POST</option>
                <option value='PUT'>PUT</option>
                <option value='DELETE'>DELETE</option>
              </select>
            </div>
            <div class='form-group'>
              <label>参数配置:</label>
              <textarea
                v-model={customApiConfig.params}
                placeholder='{"key": "value"}'
                rows={3}
              />
            </div>
            <div class='form-actions'>
              <button onClick={registerCustomApi} disabled={demoState.loading}>
                注册 API
              </button>
              <button onClick={callCustomApi} disabled={demoState.loading}>
                调用 API
              </button>
            </div>
          </div>
        </div>

        {/* 结果显示 */}
        <div class='api-demo__section'>
          <h2>📊 调用结果</h2>
          <div class='result-display'>
            {demoState.loading && <div class='loading'>🔄 API 调用中...</div>}
            {demoState.error && (
              <div class='error'>
                ❌ 错误:
                {demoState.error}
              </div>
            )}
            {demoState.result && (
              <div class='result'>
                <h3>✅ 调用成功</h3>
                <pre>{JSON.stringify(demoState.result, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>

        {/* 调用历史 */}
        <div class='api-demo__section'>
          <h2>📝 调用历史</h2>
          <div class='history-controls'>
            <button onClick={clearHistory}>🗑️ 清空历史</button>
            <span>共{apiHistory.length} 条记录</span>
          </div>
          <div class='history-list'>
            {apiHistory.map((item, index) => (
              <div key={index} class='history-item'>
                <div class='history-header'>
                  <span class='method'>{item.method}</span>
                  <span class='timestamp'>{item.timestamp}</span>
                  <span class='duration'>
                    {item.duration}
                    ms
                  </span>
                </div>
                {item.params && (
                  <div class='history-params'>
                    <strong>参数:</strong>
                    <pre>{JSON.stringify(item.params, null, 2)}</pre>
                  </div>
                )}
                <div class='history-result'>
                  <strong>结果:</strong>
                  <pre>{JSON.stringify(item.result, null, 2)}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
})

import type { EngineImpl } from '@ldesign/engine'
// 导入类型
import type { DeviceInfo, Post, RouteInfo, User, UserInfo } from './types'
import { useDevice } from '@ldesign/device'

import { useRoute, useRouter } from '@ldesign/router'

import {
  computed,
  defineComponent,
  getCurrentInstance,
  onMounted,
  ref,
} from 'vue'
import CreatePostForm from './components/CreatePostForm'
import HttpActionsPanel from './components/HttpActionsPanel'
import HttpStatsPanel from './components/HttpStatsPanel'
import { DeviceIndicator, InfoItem, InfoPanel } from './components/InfoPanel'
import PostCard from './components/PostCard'

// 导入子组件
import UserCard from './components/UserCard'

// 导入自定义 Hook
import { useHttpDemo } from './hooks/useHttpDemo'

// 导入样式
import './Home.less'

export default defineComponent({
  name: 'Home',
  setup() {
    // 获取 Engine 实例
    const instance = getCurrentInstance()
    const engine = instance?.appContext.config.globalProperties
      .$engine as EngineImpl

    const router = useRouter()
    const route = useRoute()

    // 使用 i18n - 直接使用全局属性
    const $t = instance?.appContext.config.globalProperties.$t
    const $i18n = instance?.appContext.config.globalProperties.$i18n

    if (!$t || !$i18n) {
      throw new Error('i18n 未正确初始化，请检查插件配置')
    }

    const t = $t
    const locale = ref($i18n.getCurrentLanguage())
    const availableLanguages = ref($i18n.getAvailableLanguages())

    const switchLanguage = async (lang: string) => {
      await $i18n.changeLanguage(lang)
      locale.value = $i18n.getCurrentLanguage()
    }

    // 设备检测
    const { deviceInfo, isMobile, isTablet, isDesktop } = useDevice()
    const deviceType = computed(() => deviceInfo.value?.type || 'unknown')
    const orientation = computed(
      () => deviceInfo.value?.orientation || 'portrait'
    )

    // HTTP 功能演示
    const {
      users,
      posts,
      newPost,
      loading,
      error,
      requestStats,
      fetchUsers,
      fetchPosts,
      createPost,
      deletePost,
      fetchUserDetails,
      fetchAllData,
      viewPost,
      updateNewPost,
      cancelAllRequests,
      clearCache,
    } = useHttpDemo(engine)

    // 计算属性
    const currentUser = computed<UserInfo>(() => ({
      username: 'admin',
      loginTime: new Date().toLocaleString('zh-CN'),
      device: `${deviceType.value} (${orientation.value})`,
    }))

    const currentRoute = computed<RouteInfo>(() => ({
      path: route.value.path,
      name: route.value.name as string,
      title: '首页',
    }))

    const currentDevice = computed<DeviceInfo>(() => ({
      type: deviceType.value,
      orientation: orientation.value,
      isMobile: isMobile.value,
      isTablet: isTablet.value,
      isDesktop: isDesktop.value,
    }))

    // 页面操作
    const handleGoToLogin = () => {
      router.push('/login')
    }

    const handleGoToApiDemo = () => {
      router.push('/api-demo')
    }

    const handleRefreshPage = () => {
      window.location.reload()
    }

    // 组件挂载时自动获取用户数据
    onMounted(() => {
      engine?.logger.info('首页加载完成', {
        device: deviceType.value,
        orientation: orientation.value,
      })

      // 自动获取用户列表
      fetchUsers()
    })

    return () => (
      <div class='home-page'>
        {/* 页面头部 */}
        <header class='page-header'>
          <div class='header-content'>
            <h1 class='page-title'>
              <span class='title-icon'>🏠</span>
              首页
            </h1>
            <div class='header-actions'>
              <select
                class='language-selector'
                value={locale.value}
                onChange={e =>
                  switchLanguage((e.target as HTMLSelectElement).value)
                }
              >
                {availableLanguages.value.map((lang: any) => {
                  const langCode =
                    typeof lang === 'string' ? lang : lang.code || lang.key
                  const langName =
                    typeof lang === 'string'
                      ? lang === 'zh-CN'
                        ? '中文（简体）'
                        : lang.toUpperCase()
                      : lang.name || lang.label || langCode

                  return (
                    <option key={langCode} value={langCode}>
                      {langName}
                    </option>
                  )
                })}
              </select>
              <button class='logout-btn' onClick={handleGoToLogin}>
                <span class='btn-icon'>🔑</span>
                退出登录
              </button>
            </div>
          </div>
        </header>

        {/* 主要内容区域 */}
        <main class='page-main'>
          {/* 欢迎信息 */}
          <section class='welcome-section'>
            <div class='welcome-content'>
              <h2 class='welcome-title'>欢迎使用 LDesign Engine</h2>
              <p class='welcome-message'>登录成功</p>
              <p class='welcome-info'>
                当前语言:
                {locale.value}
              </p>
            </div>
          </section>

          {/* 信息面板区域 */}
          <section class='info-section'>
            <div class='info-grid'>
              {/* 用户信息面板 */}
              <InfoPanel title='用户信息' icon='👤' variant='primary'>
                <InfoItem
                  label='用户名'
                  value={currentUser.value.username}
                  icon='👤'
                />
                <InfoItem
                  label='登录时间'
                  value={currentUser.value.loginTime}
                  icon='⏰'
                />
                <InfoItem
                  label='设备信息'
                  value={currentUser.value.device}
                  icon='📱'
                />
              </InfoPanel>

              {/* 路由信息面板 */}
              <InfoPanel title='路由信息' icon='📍' variant='success'>
                <InfoItem
                  label='当前路径'
                  value={currentRoute.value.path}
                  icon='🛣️'
                />
                <InfoItem
                  label='路由名称'
                  value={currentRoute.value.name}
                  icon='🏷️'
                />
                <InfoItem
                  label='页面标题'
                  value={currentRoute.value.title}
                  icon='📄'
                />
              </InfoPanel>

              {/* 设备检测面板 */}
              <InfoPanel title='设备检测' icon='📱' variant='warning'>
                <div class='device-indicators'>
                  <DeviceIndicator
                    icon='📱'
                    label='移动设备'
                    active={currentDevice.value.isMobile}
                  />
                  <DeviceIndicator
                    icon='📟'
                    label='平板设备'
                    active={currentDevice.value.isTablet}
                  />
                  <DeviceIndicator
                    icon='🖥️'
                    label='桌面设备'
                    active={currentDevice.value.isDesktop}
                  />
                </div>
                <InfoItem
                  label='屏幕方向'
                  value={currentDevice.value.orientation}
                  icon='🔄'
                />
              </InfoPanel>

              {/* 功能特性面板 */}
              <InfoPanel title='功能特性' icon='✨' variant='default'>
                <ul class='feature-list'>
                  <li class='feature-item'>
                    <span class='feature-icon'>🛣️</span>
                    <span class='feature-text'>智能路由系统</span>
                  </li>
                  <li class='feature-item'>
                    <span class='feature-icon'>🌐</span>
                    <span class='feature-text'>HTTP 请求管理</span>
                  </li>
                  <li class='feature-item'>
                    <span class='feature-icon'>🎨</span>
                    <span class='feature-text'>多设备模板适配</span>
                  </li>
                  <li class='feature-item'>
                    <span class='feature-icon'>⚙️</span>
                    <span class='feature-text'>应用引擎集成</span>
                  </li>
                  <li class='feature-item'>
                    <span class='feature-icon'>📱</span>
                    <span class='feature-text'>设备类型检测</span>
                  </li>
                  <li class='feature-item'>
                    <span class='feature-icon'>🔔</span>
                    <span class='feature-text'>通知系统</span>
                  </li>
                  <li class='feature-item'>
                    <span class='feature-icon'>📝</span>
                    <span class='feature-text'>日志记录</span>
                  </li>
                  <li class='feature-item'>
                    <span class='feature-icon'>🚀</span>
                    <span class='feature-text'>API 管理系统</span>
                  </li>
                </ul>
              </InfoPanel>
            </div>
          </section>

          {/* HTTP 功能演示区域 */}
          <section class='demo-section'>
            {/* HTTP 操作面板 */}
            <HttpActionsPanel
              loading={loading.value}
              activeRequests={requestStats.value.activeRequests}
              onFetchUsers={fetchUsers}
              onFetchPosts={fetchPosts}
              onFetchAllData={fetchAllData}
              onCancelAllRequests={cancelAllRequests}
              onClearCache={clearCache}
            />

            {/* 创建文章表单 */}
            <CreatePostForm
              newPost={newPost.value}
              loading={loading.value}
              onUpdatePost={updateNewPost}
              onCreatePost={createPost}
            />
          </section>

          {/* 数据展示区域 */}
          <section class='data-section'>
            <div class='data-grid'>
              {/* 用户列表 */}
              <div class='data-panel users-panel'>
                <div class='panel-header'>
                  <h4 class='panel-title'>
                    <span class='title-icon'>👥</span>
                    用户列表 ({users.value.length} 个用户)
                  </h4>
                </div>
                <div class='panel-content'>
                  {users.value.length > 0 ? (
                    <div class='users-grid'>
                      {users.value.slice(0, 6).map((user: User) => (
                        <UserCard
                          key={user.id}
                          user={user}
                          loading={loading.value}
                          onViewDetails={fetchUserDetails}
                        />
                      ))}
                    </div>
                  ) : (
                    <div class='empty-state'>
                      <div class='empty-icon'>👥</div>
                      <div class='empty-title'>暂无用户数据</div>
                      <div class='empty-description'>
                        点击"获取用户列表"按钮加载数据
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 文章列表 */}
              <div class='data-panel posts-panel'>
                <div class='panel-header'>
                  <h4 class='panel-title'>
                    <span class='title-icon'>📝</span>
                    文章列表 ({posts.value.length} 篇文章)
                  </h4>
                </div>
                <div class='panel-content'>
                  {posts.value.length > 0 ? (
                    <div class='posts-grid'>
                      {posts.value.map((post: Post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          loading={loading.value}
                          onDelete={deletePost}
                          onView={viewPost}
                        />
                      ))}
                    </div>
                  ) : (
                    <div class='empty-state'>
                      <div class='empty-icon'>📝</div>
                      <div class='empty-title'>暂无文章数据</div>
                      <div class='empty-description'>
                        点击"获取文章列表"按钮加载数据
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* HTTP 状态统计 */}
          <section class='stats-section'>
            <HttpStatsPanel
              stats={requestStats.value}
              loading={loading.value}
              error={error.value}
              apiUrl='jsonplaceholder.typicode.com'
            />
          </section>
        </main>

        {/* 页面底部操作 */}
        <footer class='page-footer'>
          <div class='footer-actions'>
            <button class='footer-btn primary' onClick={handleGoToApiDemo}>
              <span class='btn-icon'>🚀</span>
              <span class='btn-text'>API 演示</span>
            </button>
            <button class='footer-btn primary' onClick={handleGoToLogin}>
              <span class='btn-icon'>🔑</span>
              <span class='btn-text'>{t('pages.home.goToLogin')}</span>
            </button>
            <button class='footer-btn secondary' onClick={handleRefreshPage}>
              <span class='btn-icon'>🔄</span>
              <span class='btn-text'>{t('pages.home.refreshPage')}</span>
            </button>
          </div>
        </footer>
      </div>
    )
  },
})

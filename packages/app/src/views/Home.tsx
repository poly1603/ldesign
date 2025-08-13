import type { EngineImpl } from '@ldesign/engine'
import { useRoute, useRouter } from '@ldesign/router'
import { useDevice } from '@ldesign/device'
import { useHttp } from '@ldesign/http'

import {
  computed,
  defineComponent,
  getCurrentInstance,
  onMounted,
  ref,
} from 'vue'
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

    // HTTP 功能演示 - 使用免费的 JSONPlaceholder API
    const {
      get,
      post,
      delete: del,
      loading,
      error,
    } = useHttp({
      baseURL: 'https://jsonplaceholder.typicode.com',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const users = ref<any[]>([])
    const posts = ref<any[]>([])
    const newPost = ref({ title: '', body: '' })

    // 获取用户列表
    const fetchUsers = async () => {
      try {
        const response = await get('/users')
        users.value = Array.isArray(response) ? response : []
        engine?.logger.info('获取用户列表成功', { count: users.value.length })
      } catch (err) {
        console.error('获取用户列表失败:', err)
        engine?.logger.error('获取用户列表失败', { error: err })
      }
    }

    // 获取文章列表
    const fetchPosts = async () => {
      try {
        const response = await get('/posts?_limit=5')
        posts.value = Array.isArray(response) ? response : []
        engine?.logger.info('获取文章列表成功', { count: posts.value.length })
      } catch (err) {
        console.error('获取文章列表失败:', err)
        engine?.logger.error('获取文章列表失败', { error: err })
      }
    }

    // 创建文章（模拟）
    const createPost = async () => {
      if (!newPost.value.title || !newPost.value.body) {
        alert('请填写标题和内容')
        return
      }
      try {
        const response = await post('/posts', {
          title: newPost.value.title,
          body: newPost.value.body,
          userId: 1,
        })
        console.log('创建文章成功:', response)
        newPost.value = { title: '', body: '' }
        engine?.logger.info('创建文章成功')
        alert('文章创建成功！（这是一个模拟请求）')
      } catch (err) {
        console.error('创建文章失败:', err)
        engine?.logger.error('创建文章失败', { error: err })
      }
    }

    // 删除文章（模拟）
    const deletePost = async (id: number) => {
      if (!confirm('确定要删除这篇文章吗？')) return
      try {
        await del(`/posts/${id}`)
        engine?.logger.info('删除文章成功', { postId: id })
        alert('文章删除成功！（这是一个模拟请求）')
      } catch (err) {
        console.error('删除文章失败:', err)
        engine?.logger.error('删除文章失败', { postId: id, error: err })
      }
    }

    // 用户信息（模拟）
    const userInfo = ref({
      username: 'admin',
      loginTime: new Date().toLocaleString(),
      deviceInfo: '',
    })

    onMounted(() => {
      userInfo.value.deviceInfo = `${deviceType.value} (${orientation.value})`
      engine?.logger.info('首页加载完成', {
        device: deviceType.value,
        orientation: orientation.value,
      })
      // 初始化用户数据
      fetchUsers()
    })

    const handleLogout = () => {
      if (confirm('确定要退出登录吗？')) {
        router.replace('/login')
        engine?.logger.info('用户退出登录')
      }
    }

    const handleGoToLogin = () => {
      router.push('/login')
      engine?.logger.info('导航到登录页')
    }

    // 语言切换处理
    const handleLanguageChange = async (lang: string) => {
      try {
        await switchLanguage(lang)
        engine?.logger.info('语言切换成功', { language: lang })
      } catch (error) {
        console.error('语言切换失败:', error)
        engine?.logger.error('语言切换失败', { language: lang, error })
      }
    }

    return () => (
      <div class='home-page'>
        <header class='home-header'>
          <div class='home-header__content'>
            <h1 class='home-title'>🏠 {t('pages.home.title')}</h1>
            <div class='header-actions'>
              <select
                class='language-selector'
                value={locale.value}
                onChange={e =>
                  handleLanguageChange((e.target as HTMLSelectElement).value)
                }
              >
                {availableLanguages.value.map((lang: any) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName}
                  </option>
                ))}
              </select>
              <button class='logout-btn' onClick={handleLogout}>
                {t('common.logout')}
              </button>
            </div>
          </div>
        </header>

        <main class='home-main'>
          <div class='welcome-card'>
            <h2>{t('pages.home.welcome')}</h2>
            <p>{t('common.loginSuccess')}</p>
            <p>
              {t('common.currentLanguage')}: {locale.value}
            </p>
          </div>

          <div class='info-grid'>
            <div class='info-card'>
              <h3>👤 {t('pages.home.userInfo')}</h3>
              <div class='info-item'>
                <span class='label'>{t('pages.home.username')}:</span>
                <span class='value'>{userInfo.value.username}</span>
              </div>
              <div class='info-item'>
                <span class='label'>{t('pages.home.loginTime')}:</span>
                <span class='value'>{userInfo.value.loginTime}</span>
              </div>
              <div class='info-item'>
                <span class='label'>{t('pages.home.deviceInfo')}:</span>
                <span class='value'>{userInfo.value.deviceInfo}</span>
              </div>
            </div>

            <div class='info-card'>
              <h3>📍 {t('pages.home.routeInfo')}</h3>
              <div class='info-item'>
                <span class='label'>{t('pages.home.currentPath')}:</span>
                <span class='value'>{route.value.path}</span>
              </div>
              <div class='info-item'>
                <span class='label'>{t('pages.home.routeName')}:</span>
                <span class='value'>{route.value.name}</span>
              </div>
              <div class='info-item'>
                <span class='label'>页面标题:</span>
                <span class='value'>{route.value.meta?.title}</span>
              </div>
            </div>

            <div class='info-card'>
              <h3>📱 设备检测</h3>
              <div class='device-status'>
                <div class={['device-indicator', { active: isMobile.value }]}>
                  📱 移动设备
                </div>
                <div class={['device-indicator', { active: isTablet.value }]}>
                  📟 平板设备
                </div>
                <div class={['device-indicator', { active: isDesktop.value }]}>
                  🖥️ 桌面设备
                </div>
              </div>
              <div class='info-item'>
                <span class='label'>屏幕方向:</span>
                <span class='value'>{orientation.value}</span>
              </div>
            </div>

            <div class='info-card'>
              <h3>✨ 功能特性</h3>
              <ul class='feature-list'>
                <li>🛣️ 智能路由系统</li>
                <li>🌐 HTTP 请求管理</li>
                <li>🎨 多设备模板适配</li>
                <li>⚙️ 应用引擎集成</li>
                <li>📱 设备类型检测</li>
                <li>🔔 通知系统</li>
                <li>📝 日志记录</li>
              </ul>
            </div>

            <div class='info-card http-demo'>
              <h3>🌐 HTTP 功能演示</h3>
              <div class='http-demo__content'>
                <div class='demo-actions'>
                  <button
                    class='btn btn-primary'
                    onClick={fetchUsers}
                    disabled={loading.value}
                  >
                    {loading.value ? '加载中...' : '获取用户列表'}
                  </button>
                  <button
                    class='btn btn-secondary'
                    onClick={fetchPosts}
                    disabled={loading.value}
                  >
                    {loading.value ? '加载中...' : '获取文章列表'}
                  </button>
                </div>

                <div class='post-form'>
                  <h4>创建文章（模拟）</h4>
                  <div class='form-group'>
                    <input
                      type='text'
                      placeholder='文章标题'
                      value={newPost.value.title}
                      onInput={e =>
                        (newPost.value.title = (
                          e.target as HTMLInputElement
                        ).value)
                      }
                    />
                    <textarea
                      placeholder='文章内容'
                      value={newPost.value.body}
                      onInput={e =>
                        (newPost.value.body = (
                          e.target as HTMLTextAreaElement
                        ).value)
                      }
                    />
                    <button
                      class='btn btn-primary'
                      onClick={createPost}
                      disabled={loading.value}
                    >
                      {loading.value ? '创建中...' : '创建文章'}
                    </button>
                  </div>
                </div>

                {error.value && (
                  <div class='error-message'>错误: {error.value.message}</div>
                )}

                <div class='data-display'>
                  {/* 用户列表展示 */}
                  <div class='users-section'>
                    <h4>👥 用户列表 ({users.value.length} 个用户)</h4>
                    {users.value.length > 0 ? (
                      <div class='users-grid'>
                        {users.value.slice(0, 6).map((user: any) => (
                          <div key={user.id} class='user-card'>
                            <div class='user-avatar'>
                              <span class='avatar-text'>
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div class='user-info'>
                              <strong class='user-name'>{user.name}</strong>
                              <span class='user-email'>{user.email}</span>
                              <small class='user-username'>
                                @{user.username}
                              </small>
                              <div class='user-details'>
                                <span>📞 {user.phone}</span>
                                <span>🌐 {user.website}</span>
                                <span>🏢 {user.company?.name}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div class='empty-state'>
                        <span class='empty-icon'>👥</span>
                        <p>暂无用户数据，点击"获取用户列表"按钮加载数据</p>
                      </div>
                    )}
                  </div>

                  {/* 文章列表展示 */}
                  <div class='posts-section'>
                    <h4>📝 文章列表 ({posts.value.length} 篇文章)</h4>
                    {posts.value.length > 0 ? (
                      <div class='posts-grid'>
                        {posts.value.map((post: any) => (
                          <div key={post.id} class='post-card'>
                            <div class='post-header'>
                              <span class='post-id'>#{post.id}</span>
                              <span class='post-user'>用户 {post.userId}</span>
                            </div>
                            <div class='post-content'>
                              <h5 class='post-title'>{post.title}</h5>
                              <p class='post-body'>
                                {post.body.length > 100
                                  ? `${post.body.substring(0, 100)}...`
                                  : post.body}
                              </p>
                            </div>
                            <div class='post-actions'>
                              <button
                                class='btn btn-danger btn-sm'
                                onClick={() => deletePost(post.id)}
                                disabled={loading.value}
                              >
                                🗑️ 删除
                              </button>
                              <button
                                class='btn btn-info btn-sm'
                                onClick={() =>
                                  alert(
                                    `文章详情：\n标题：${post.title}\n内容：${post.body}`
                                  )
                                }
                              >
                                👁️ 查看
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div class='empty-state'>
                        <span class='empty-icon'>📝</span>
                        <p>暂无文章数据，点击"获取文章列表"按钮加载数据</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div class='info-card'>
              <h3>📊 HTTP 状态</h3>
              <div class='status-grid'>
                <div class='status-item'>
                  <span class='label'>请求状态:</span>
                  <span class={`value ${loading.value ? 'loading' : 'idle'}`}>
                    {loading.value ? '请求中' : '空闲'}
                  </span>
                </div>
                <div class='status-item'>
                  <span class='label'>错误状态:</span>
                  <span class={`value ${error.value ? 'error' : 'normal'}`}>
                    {error.value ? '有错误' : '正常'}
                  </span>
                </div>
                <div class='status-item'>
                  <span class='label'>API 地址:</span>
                  <span class='value'>jsonplaceholder.typicode.com</span>
                </div>
              </div>
            </div>
          </div>

          <div class='action-section'>
            <button class='action-btn primary' onClick={handleGoToLogin}>
              🔑 {t('pages.home.goToLogin')}
            </button>
            <button
              class='action-btn secondary'
              onClick={() => window.location.reload()}
            >
              🔄 {t('pages.home.refreshPage')}
            </button>
          </div>
        </main>
      </div>
    )
  },
})

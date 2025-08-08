import { defineComponent, computed, getCurrentInstance } from 'vue'
import type { Engine } from '@ldesign/engine'
import { routerUtils } from '../router'

export default defineComponent({
  name: 'Navigation',
  setup() {
    const instance = getCurrentInstance()
    const engine = instance?.appContext.config.globalProperties
      .$engine as Engine

    const isAuthenticated = computed(
      () => engine.state.get('auth:isAuthenticated') || false
    )

    const currentPath = computed(() => engine.state.get('router:path') || '/')

    const user = computed(() => engine.state.get('auth:user') || null)

    const navigationItems = computed(() => {
      const items = [{ path: '/', label: '首页', icon: '🏠', public: true }]

      if (isAuthenticated.value) {
        items.push({
          path: '/dashboard',
          label: '仪表板',
          icon: '📊',
          public: false,
        })
      } else {
        items.push({ path: '/login', label: '登录', icon: '🔑', public: true })
      }

      return items
    })

    const handleNavigation = async (path: string) => {
      try {
        await routerUtils.navigateTo(engine, path)
      } catch (error) {
        engine.logger.error('导航失败:', error)
      }
    }

    const handleLogout = async () => {
      try {
        engine.state.remove('auth:isAuthenticated')
        engine.state.remove('auth:user')

        engine.notifications.show({
          type: 'info',
          title: '已退出登录',
          message: '您已成功退出登录',
          duration: 3000,
        })

        await routerUtils.navigateTo(engine, '/login')
      } catch (error) {
        engine.logger.error('退出登录失败:', error)
      }
    }

    return () => (
      <nav class='navigation'>
        <div class='nav-container'>
          <div class='nav-brand'>
            <span class='brand-icon'>🚀</span>
            <span class='brand-text'>LDesign Engine</span>
          </div>

          <div class='nav-menu'>
            {navigationItems.value.map(item => (
              <button
                key={item.path}
                class={[
                  'nav-item',
                  currentPath.value === item.path ? 'active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleNavigation(item.path)}
              >
                <span class='nav-icon'>{item.icon}</span>
                <span class='nav-label'>{item.label}</span>
              </button>
            ))}
          </div>

          <div class='nav-user'>
            {isAuthenticated.value ? (
              <div class='user-menu'>
                <div class='user-info'>
                  <span class='user-icon'>👤</span>
                  <span class='user-name'>{user.value?.username}</span>
                </div>
                <button
                  class='logout-button'
                  onClick={handleLogout}
                  title='退出登录'
                >
                  🚪
                </button>
              </div>
            ) : (
              <div class='guest-info'>
                <span class='guest-text'>未登录</span>
              </div>
            )}
          </div>
        </div>

        <style>{`
          .navigation {
            background: white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            position: sticky;
            top: 0;
            z-index: 100;
          }

          .nav-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 64px;
          }

          .nav-brand {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            color: #333;
            cursor: pointer;
          }

          .brand-icon {
            font-size: 1.5rem;
          }

          .brand-text {
            font-size: 1.2rem;
          }

          .nav-menu {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .nav-item {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            background: none;
            border: none;
            border-radius: 6px;
            color: #666;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 14px;
          }

          .nav-item:hover {
            background: #f8f9fa;
            color: #333;
          }

          .nav-item.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          .nav-icon {
            font-size: 1rem;
          }

          .nav-label {
            font-weight: 500;
          }

          .nav-user {
            display: flex;
            align-items: center;
          }

          .user-menu {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .user-info {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background: #f8f9fa;
            border-radius: 20px;
            font-size: 14px;
            color: #333;
          }

          .user-icon {
            font-size: 1rem;
          }

          .user-name {
            font-weight: 500;
          }

          .logout-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 14px;
          }

          .logout-button:hover {
            background: #c82333;
            transform: scale(1.1);
          }

          .guest-info {
            font-size: 14px;
            color: #666;
            padding: 6px 12px;
            background: #f8f9fa;
            border-radius: 20px;
          }

          @media (max-width: 768px) {
            .nav-container {
              padding: 0 15px;
            }

            .nav-menu {
              gap: 4px;
            }

            .nav-item {
              padding: 6px 12px;
              font-size: 13px;
            }

            .nav-label {
              display: none;
            }

            .brand-text {
              display: none;
            }

            .user-name {
              display: none;
            }
          }

          @media (max-width: 480px) {
            .nav-container {
              height: 56px;
            }

            .nav-item {
              padding: 6px 8px;
            }

            .user-info {
              padding: 4px 8px;
            }
          }
        `}</style>
      </nav>
    )
  },
})

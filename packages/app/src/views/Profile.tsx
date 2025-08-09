import { defineComponent, ref } from 'vue'
import { RouterLink } from '/@fs/D:/User/Document/WorkSpace/ldesign/packages/router/es/index.js'

export default defineComponent({
  name: 'Profile',
  setup() {
    const user = ref({
      name: '张三',
      email: 'zhangsan@example.com',
      avatar: '👤',
      role: '管理员',
      joinDate: '2023-01-15',
      lastLogin: '2024-01-20 14:30',
      permissions: ['admin', 'products.view', 'settings', 'user_management'],
    })

    return () => (
      <div class='profile'>
        <div class='profile-header'>
          <h2>👤 个人资料</h2>
          <p>管理您的个人信息和账户设置</p>
        </div>

        <div class='profile-content'>
          <div class='profile-card'>
            <div class='avatar-section'>
              <div class='avatar'>{user.value.avatar}</div>
              <div class='user-info'>
                <h3>{user.value.name}</h3>
                <p class='role'>{user.value.role}</p>
                <p class='email'>{user.value.email}</p>
              </div>
            </div>

            <div class='user-stats'>
              <div class='stat-item'>
                <span class='stat-label'>加入时间</span>
                <span class='stat-value'>{user.value.joinDate}</span>
              </div>
              <div class='stat-item'>
                <span class='stat-label'>最后登录</span>
                <span class='stat-value'>{user.value.lastLogin}</span>
              </div>
            </div>
          </div>

          <div class='permissions-card'>
            <h3>🔐 权限列表</h3>
            <div class='permissions-grid'>
              {user.value.permissions.map(permission => (
                <span key={permission} class='permission-badge'>
                  {permission}
                </span>
              ))}
            </div>
          </div>

          <div class='actions-card'>
            <h3>🚀 快速操作</h3>
            <div class='action-buttons'>
              <RouterLink
                to='/profile/edit'
                variant='button'
                icon='✏️'
                track-event='edit_profile'
              >
                编辑资料
              </RouterLink>

              <RouterLink
                to='/profile/security'
                variant='button'
                icon='🔒'
                track-event='security_settings'
              >
                安全设置
              </RouterLink>

              <RouterLink
                to='/profile/preferences'
                variant='button'
                icon='⚙️'
                track-event='user_preferences'
              >
                偏好设置
              </RouterLink>

              <RouterLink
                to='/profile/activity'
                variant='button'
                icon='📊'
                badge='5'
                badge-variant='count'
                track-event='view_activity'
              >
                活动记录
              </RouterLink>
            </div>
          </div>

          <div class='navigation-card'>
            <h3>🧭 导航演示</h3>
            <div class='nav-demos'>
              <div class='demo-section'>
                <h4>标签页导航</h4>
                <div class='tab-nav'>
                  <RouterLink to='/profile' variant='tab'>
                    基本信息
                  </RouterLink>
                  <RouterLink to='/profile/security' variant='tab'>
                    安全设置
                  </RouterLink>
                  <RouterLink to='/profile/preferences' variant='tab'>
                    偏好设置
                  </RouterLink>
                </div>
              </div>

              <div class='demo-section'>
                <h4>卡片式链接</h4>
                <div class='card-links'>
                  <RouterLink
                    to='/dashboard'
                    variant='card'
                    icon='📊'
                    preload='hover'
                    track-event='profile_to_dashboard'
                  >
                    <div>
                      <h5>仪表板</h5>
                      <p>查看数据概览</p>
                    </div>
                  </RouterLink>

                  <RouterLink
                    to='/products'
                    variant='card'
                    icon='📦'
                    permission='products.view'
                    badge='3'
                    badge-variant='count'
                    track-event='profile_to_products'
                  >
                    <div>
                      <h5>产品管理</h5>
                      <p>管理产品库存</p>
                    </div>
                  </RouterLink>
                </div>
              </div>

              <div class='demo-section'>
                <h4>外部链接</h4>
                <div class='external-links'>
                  <RouterLink
                    to='https://github.com/ldesign/ldesign'
                    external={true}
                    target='_blank'
                    variant='button'
                    icon='🌟'
                    track-event='visit_github'
                  >
                    GitHub
                  </RouterLink>

                  <RouterLink
                    to='mailto:support@ldesign.dev'
                    external={true}
                    variant='button'
                    icon='📧'
                    track-event='contact_support'
                  >
                    联系支持
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class='profile-footer'>
          <div class='breadcrumb'>
            <RouterLink to='/' variant='breadcrumb'>
              首页
            </RouterLink>
            <RouterLink to='/dashboard' variant='breadcrumb'>
              仪表板
            </RouterLink>
            <RouterLink to='/profile' variant='breadcrumb'>
              个人资料
            </RouterLink>
          </div>
        </div>

        <style>{`
          .profile {
            padding: 2rem;
            max-width: 1000px;
            margin: 0 auto;
          }
          
          .profile-header {
            margin-bottom: 2rem;
          }
          
          .profile-header h2 {
            color: #333;
            margin-bottom: 0.5rem;
          }
          
          .profile-header p {
            color: #666;
          }
          
          .profile-content {
            display: grid;
            gap: 2rem;
          }
          
          .profile-card,
          .permissions-card,
          .actions-card,
          .navigation-card {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            border: 1px solid #e0e0e0;
          }
          
          .avatar-section {
            display: flex;
            align-items: center;
            margin-bottom: 2rem;
          }
          
          .avatar {
            font-size: 4rem;
            margin-right: 2rem;
          }
          
          .user-info h3 {
            margin: 0 0 0.5rem 0;
            color: #333;
            font-size: 1.5rem;
          }
          
          .role {
            color: #007bff;
            font-weight: 500;
            margin: 0 0 0.25rem 0;
          }
          
          .email {
            color: #666;
            margin: 0;
          }
          
          .user-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          }
          
          .stat-item {
            display: flex;
            flex-direction: column;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 6px;
          }
          
          .stat-label {
            font-size: 0.875rem;
            color: #666;
            margin-bottom: 0.25rem;
          }
          
          .stat-value {
            font-weight: 500;
            color: #333;
          }
          
          .permissions-card h3,
          .actions-card h3,
          .navigation-card h3 {
            margin: 0 0 1.5rem 0;
            color: #555;
            font-size: 1.1rem;
          }
          
          .permissions-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          
          .permission-badge {
            padding: 0.25rem 0.75rem;
            background: #e3f2fd;
            color: #1976d2;
            border-radius: 16px;
            font-size: 0.875rem;
            font-weight: 500;
          }
          
          .action-buttons {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
          }
          
          .nav-demos {
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }
          
          .demo-section h4 {
            margin: 0 0 1rem 0;
            color: #666;
            font-size: 0.9rem;
          }
          
          .tab-nav {
            display: flex;
            gap: 0.5rem;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 0.5rem;
          }
          
          .card-links {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          }
          
          .card-links h5 {
            margin: 0 0 0.5rem 0;
            color: #333;
            font-size: 1rem;
          }
          
          .card-links p {
            margin: 0;
            color: #666;
            font-size: 0.875rem;
          }
          
          .external-links {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
          }
          
          .profile-footer {
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid #e0e0e0;
          }
        `}</style>
      </div>
    )
  },
})

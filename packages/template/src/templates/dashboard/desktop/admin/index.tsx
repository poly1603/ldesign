import { defineComponent, ref } from 'vue'
import './index.less'

export interface AdminDashboardProps {
  title?: string
  logo?: string
  showSidebar?: boolean
  sidebarCollapsed?: boolean
}

export default defineComponent({
  name: 'AdminDashboard',
  props: {
    title: {
      type: String,
      default: '管理后台'
    },
    logo: {
      type: String,
      default: ''
    },
    showSidebar: {
      type: Boolean,
      default: true
    },
    sidebarCollapsed: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const collapsed = ref(props.sidebarCollapsed)

    const toggleSidebar = () => {
      collapsed.value = !collapsed.value
    }

    return {
      collapsed,
      toggleSidebar
    }
  },
  render() {
    return (
      <div class={['admin-dashboard', { 'sidebar-collapsed': this.collapsed }]}>
        {/* 顶部导航栏 */}
        <header class="admin-header">
          <div class="header-left">
            {this.showSidebar && (
              <button class="sidebar-toggle" onClick={this.toggleSidebar}>
                <span class="toggle-icon"></span>
              </button>
            )}
            {this.logo && <img src={this.logo} alt="Logo" class="header-logo" />}
            <h1 class="header-title">{this.title}</h1>
          </div>
          <div class="header-right">
            <div class="user-menu">
              <span class="user-avatar"></span>
              <span class="user-name">管理员</span>
            </div>
          </div>
        </header>

        <div class="admin-body">
          {/* 侧边栏 */}
          {this.showSidebar && (
            <aside class={['admin-sidebar', { collapsed: this.collapsed }]}>
              <nav class="sidebar-nav">
                <ul class="nav-menu">
                  <li class="nav-item active">
                    <a href="#" class="nav-link">
                      <span class="nav-icon">📊</span>
                      <span class="nav-text">仪表盘</span>
                    </a>
                  </li>
                  <li class="nav-item">
                    <a href="#" class="nav-link">
                      <span class="nav-icon">👥</span>
                      <span class="nav-text">用户管理</span>
                    </a>
                  </li>
                  <li class="nav-item">
                    <a href="#" class="nav-link">
                      <span class="nav-icon">📝</span>
                      <span class="nav-text">内容管理</span>
                    </a>
                  </li>
                  <li class="nav-item">
                    <a href="#" class="nav-link">
                      <span class="nav-icon">⚙️</span>
                      <span class="nav-text">系统设置</span>
                    </a>
                  </li>
                </ul>
              </nav>
            </aside>
          )}

          {/* 主内容区 */}
          <main class="admin-main">
            <div class="main-content">
              <div class="content-header">
                <h2>欢迎使用管理后台</h2>
                <p>这是一个功能完整的管理后台模板</p>
              </div>
              
              <div class="dashboard-cards">
                <div class="card">
                  <div class="card-header">
                    <h3>用户统计</h3>
                  </div>
                  <div class="card-body">
                    <div class="stat-number">1,234</div>
                    <div class="stat-label">总用户数</div>
                  </div>
                </div>
                
                <div class="card">
                  <div class="card-header">
                    <h3>订单统计</h3>
                  </div>
                  <div class="card-body">
                    <div class="stat-number">5,678</div>
                    <div class="stat-label">总订单数</div>
                  </div>
                </div>
                
                <div class="card">
                  <div class="card-header">
                    <h3>收入统计</h3>
                  </div>
                  <div class="card-body">
                    <div class="stat-number">¥123,456</div>
                    <div class="stat-label">总收入</div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }
})

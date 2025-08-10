import { defineComponent } from 'vue'
import { RouterLink } from '@ldesign/router'

export default defineComponent({
  name: 'Dashboard',
  setup() {
    return () => (
      <div class='dashboard'>
        <h2>📊 仪表板</h2>
        <p>欢迎来到增强路由演示的仪表板页面！</p>

        <div class='dashboard-grid'>
          <div class='dashboard-card'>
            <h3>📈 数据统计</h3>
            <div class='stats'>
              <div class='stat-item'>
                <span class='stat-value'>1,234</span>
                <span class='stat-label'>总用户</span>
              </div>
              <div class='stat-item'>
                <span class='stat-value'>567</span>
                <span class='stat-label'>活跃用户</span>
              </div>
              <div class='stat-item'>
                <span class='stat-value'>89</span>
                <span class='stat-label'>新订单</span>
              </div>
            </div>
          </div>

          <div class='dashboard-card'>
            <h3>🚀 快速操作</h3>
            <div class='quick-actions'>
              <RouterLink
                to='/products'
                variant='card'
                icon='📦'
                preload='hover'
                track-event='dashboard_to_products'
              >
                <div>
                  <h4>产品管理</h4>
                  <p>管理您的产品库存</p>
                </div>
              </RouterLink>

              <RouterLink
                to='/settings'
                variant='card'
                icon='⚙️'
                permission={['admin', 'settings']}
                track-event='dashboard_to_settings'
              >
                <div>
                  <h4>系统设置</h4>
                  <p>配置系统参数</p>
                </div>
              </RouterLink>

              <RouterLink
                to='/profile'
                variant='card'
                icon='👤'
                track-event='dashboard_to_profile'
              >
                <div>
                  <h4>个人资料</h4>
                  <p>编辑个人信息</p>
                </div>
              </RouterLink>
            </div>
          </div>

          <div class='dashboard-card'>
            <h3>🔗 增强链接演示</h3>
            <div class='link-demos'>
              <RouterLink
                to='/products'
                variant='button'
                size='large'
                icon='🛍️'
                badge='5'
                badge-variant='count'
                preload='hover'
                track-event='demo_shopping'
              >
                购物车
              </RouterLink>

              <RouterLink
                to='/help'
                variant='button'
                icon='💬'
                pulse={true}
                track-event='demo_support'
              >
                在线客服
              </RouterLink>

              <RouterLink
                to='https://github.com/ldesign/ldesign'
                external={true}
                target='_blank'
                variant='button'
                icon='🌟'
                track-event='demo_github'
              >
                GitHub
              </RouterLink>
            </div>
          </div>

          <div class='dashboard-card'>
            <h3>🎨 样式变体演示</h3>
            <div class='style-demos'>
              <div class='demo-section'>
                <h4>标签页样式</h4>
                <div class='tab-demo'>
                  <RouterLink to='/dashboard' variant='tab'>
                    当前页
                  </RouterLink>
                  <RouterLink to='/products' variant='tab'>
                    产品
                  </RouterLink>
                  <RouterLink to='/settings' variant='tab'>
                    设置
                  </RouterLink>
                </div>
              </div>

              <div class='demo-section'>
                <h4>面包屑样式</h4>
                <div class='breadcrumb-demo'>
                  <RouterLink to='/' variant='breadcrumb'>
                    首页
                  </RouterLink>
                  <RouterLink to='/dashboard' variant='breadcrumb'>
                    仪表板
                  </RouterLink>
                </div>
              </div>

              <div class='demo-section'>
                <h4>按钮尺寸</h4>
                <div class='button-demo'>
                  <RouterLink to='/help' variant='button' size='small'>
                    小按钮
                  </RouterLink>
                  <RouterLink to='/help' variant='button' size='medium'>
                    中按钮
                  </RouterLink>
                  <RouterLink to='/help' variant='button' size='large'>
                    大按钮
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .dashboard {
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
          }
          
          .dashboard h2 {
            color: #333;
            margin-bottom: 1rem;
          }
          
          .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
          }
          
          .dashboard-card {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            border: 1px solid #e0e0e0;
          }
          
          .dashboard-card h3 {
            margin: 0 0 1rem 0;
            color: #555;
            font-size: 1.1rem;
          }
          
          .stats {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
          }
          
          .stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 6px;
            flex: 1;
            min-width: 80px;
          }
          
          .stat-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: #007bff;
          }
          
          .stat-label {
            font-size: 0.875rem;
            color: #666;
            margin-top: 0.25rem;
          }
          
          .quick-actions {
            display: grid;
            gap: 1rem;
          }
          
          .link-demos {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .style-demos {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }
          
          .demo-section h4 {
            margin: 0 0 0.5rem 0;
            color: #666;
            font-size: 0.9rem;
          }
          
          .tab-demo {
            display: flex;
            gap: 0.5rem;
            border-bottom: 1px solid #e0e0e0;
          }
          
          .breadcrumb-demo {
            display: flex;
            align-items: center;
          }
          
          .button-demo {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
          }
        `}</style>
      </div>
    )
  },
})

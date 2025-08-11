import { RouterLink } from '@ldesign/router'
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'Settings',
  setup() {
    const settings = ref({
      theme: 'light',
      language: 'zh-CN',
      notifications: true,
      autoSave: true,
      performance: 'balanced',
    })

    return () => (
      <div class='settings'>
        <div class='settings-header'>
          <h2>⚙️ 系统设置</h2>
          <p>配置您的应用偏好设置</p>
        </div>

        <div class='settings-content'>
          <div class='settings-section'>
            <h3>🎨 外观设置</h3>
            <div class='setting-item'>
              <label>主题模式</label>
              <select v-model={settings.value.theme}>
                <option value='light'>浅色主题</option>
                <option value='dark'>深色主题</option>
                <option value='auto'>跟随系统</option>
              </select>
            </div>

            <div class='setting-item'>
              <label>语言</label>
              <select v-model={settings.value.language}>
                <option value='zh-CN'>简体中文</option>
                <option value='en-US'>English</option>
                <option value='ja-JP'>日本語</option>
              </select>
            </div>
          </div>

          <div class='settings-section'>
            <h3>🔔 通知设置</h3>
            <div class='setting-item'>
              <label>
                <input type='checkbox' v-model={settings.value.notifications} />
                启用桌面通知
              </label>
            </div>

            <div class='setting-item'>
              <label>
                <input type='checkbox' v-model={settings.value.autoSave} />
                自动保存设置
              </label>
            </div>
          </div>

          <div class='settings-section'>
            <h3>⚡ 性能设置</h3>
            <div class='setting-item'>
              <label>性能模式</label>
              <select v-model={settings.value.performance}>
                <option value='power_save'>省电模式</option>
                <option value='balanced'>平衡模式</option>
                <option value='performance'>性能模式</option>
              </select>
            </div>
          </div>

          <div class='settings-section'>
            <h3>🔗 路由增强功能演示</h3>
            <div class='demo-links'>
              <RouterLink
                to='/dashboard'
                variant='button'
                icon='📊'
                preload='immediate'
                track-event='settings_to_dashboard'
              >
                返回仪表板
              </RouterLink>

              <RouterLink
                to='/profile'
                variant='button'
                icon='👤'
                preload='hover'
                track-event='settings_to_profile'
              >
                个人资料
              </RouterLink>

              <RouterLink
                to='/help'
                variant='button'
                icon='❓'
                badge='NEW'
                badge-variant='text'
                badge-color='#28a745'
                track-event='settings_to_help'
              >
                帮助中心
              </RouterLink>

              <RouterLink
                to='/logout'
                variant='button'
                icon='🚪'
                confirm-message='确定要退出登录吗？您的未保存设置将丢失。'
                confirm-title='退出确认'
                track-event='logout_from_settings'
              >
                退出登录
              </RouterLink>
            </div>
          </div>

          <div class='settings-section'>
            <h3>🎯 权限演示</h3>
            <div class='permission-demos'>
              <RouterLink
                to='/admin'
                variant='button'
                icon='🔐'
                permission='admin'
                fallback-to='/login'
                track-event='access_admin'
              >
                管理员面板
              </RouterLink>

              <RouterLink
                to='/advanced-settings'
                variant='button'
                icon='🔧'
                permission={['admin', 'advanced_user']}
                track-event='access_advanced_settings'
              >
                高级设置
              </RouterLink>

              <RouterLink
                to='/user-management'
                variant='button'
                icon='👥'
                permission='user_management'
                track-event='access_user_management'
              >
                用户管理
              </RouterLink>
            </div>
          </div>
        </div>

        <div class='settings-footer'>
          <div class='breadcrumb'>
            <RouterLink to='/' variant='breadcrumb'>
              首页
            </RouterLink>
            <RouterLink to='/dashboard' variant='breadcrumb'>
              仪表板
            </RouterLink>
            <RouterLink to='/settings' variant='breadcrumb'>
              设置
            </RouterLink>
          </div>

          <div class='footer-actions'>
            <button class='save-btn'>💾 保存设置</button>
            <button class='reset-btn'>🔄 重置默认</button>
          </div>
        </div>

        <style>
          {`
          .settings {
            padding: 2rem;
            max-width: 800px;
            margin: 0 auto;
          }
          
          .settings-header {
            margin-bottom: 2rem;
          }
          
          .settings-header h2 {
            color: #333;
            margin-bottom: 0.5rem;
          }
          
          .settings-header p {
            color: #666;
          }
          
          .settings-content {
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }
          
          .settings-section {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border: 1px solid #e0e0e0;
          }
          
          .settings-section h3 {
            margin: 0 0 1rem 0;
            color: #555;
            font-size: 1.1rem;
          }
          
          .setting-item {
            margin-bottom: 1rem;
          }
          
          .setting-item:last-child {
            margin-bottom: 0;
          }
          
          .setting-item label {
            display: block;
            margin-bottom: 0.5rem;
            color: #333;
            font-weight: 500;
          }
          
          .setting-item select {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 0.875rem;
          }
          
          .setting-item input[type="checkbox"] {
            margin-right: 0.5rem;
          }
          
          .demo-links {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
          }
          
          .permission-demos {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
          }
          
          .settings-footer {
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid #e0e0e0;
          }
          
          .breadcrumb {
            margin-bottom: 1rem;
          }
          
          .footer-actions {
            display: flex;
            gap: 0.75rem;
          }
          
          .save-btn {
            padding: 0.75rem 1.5rem;
            background: #28a745;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.875rem;
            font-weight: 500;
          }
          
          .save-btn:hover {
            background: #218838;
          }
          
          .reset-btn {
            padding: 0.75rem 1.5rem;
            background: #6c757d;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.875rem;
            font-weight: 500;
          }
          
          .reset-btn:hover {
            background: #5a6268;
          }
        `}
        </style>
      </div>
    )
  },
})

import { defineComponent, ref } from 'vue'
import { RouterLink } from '/@fs/D:/User/Document/WorkSpace/ldesign/packages/router/es/index.js'

export default defineComponent({
  name: 'Help',
  setup() {
    const faqs = ref([
      {
        id: 1,
        question: '如何使用增强的 RouterLink 组件？',
        answer:
          'RouterLink 组件支持多种增强功能，包括预加载、权限控制、样式变体等。您可以通过 variant、preload、permission 等属性来配置。',
        category: '组件使用',
      },
      {
        id: 2,
        question: '什么是预加载策略？',
        answer:
          '预加载策略允许您在用户实际访问页面之前预先加载页面资源。支持 hover（悬停）、visible（可见）、immediate（立即）等策略。',
        category: '性能优化',
      },
      {
        id: 3,
        question: '如何配置权限控制？',
        answer:
          '您可以通过 permission 属性设置权限要求，支持单个权限字符串或权限数组。还可以配置 fallback-to 属性设置权限不足时的跳转页面。',
        category: '权限管理',
      },
      {
        id: 4,
        question: '如何自定义过渡动画？',
        answer:
          'RouterView 组件支持丰富的过渡动画配置，您可以通过 transition 属性设置动画名称，或传入对象进行详细配置。',
        category: '动画效果',
      },
    ])

    const categories = ref([
      { name: '组件使用', icon: '🧩', count: 1 },
      { name: '性能优化', icon: '⚡', count: 1 },
      { name: '权限管理', icon: '🔐', count: 1 },
      { name: '动画效果', icon: '🎨', count: 1 },
    ])

    return () => (
      <div class='help'>
        <div class='help-header'>
          <h2>❓ 帮助中心</h2>
          <p>查找常见问题的答案和使用指南</p>
        </div>

        <div class='help-content'>
          <div class='help-sidebar'>
            <div class='categories'>
              <h3>📂 分类</h3>
              {categories.value.map(category => (
                <div key={category.name} class='category-item'>
                  <span class='category-icon'>{category.icon}</span>
                  <span class='category-name'>{category.name}</span>
                  <span class='category-count'>({category.count})</span>
                </div>
              ))}
            </div>

            <div class='quick-links'>
              <h3>🔗 快速链接</h3>
              <div class='link-list'>
                <RouterLink
                  to='/help/getting-started'
                  variant='button'
                  size='small'
                  icon='🚀'
                  track-event='help_getting_started'
                >
                  快速开始
                </RouterLink>

                <RouterLink
                  to='/help/api-reference'
                  variant='button'
                  size='small'
                  icon='📚'
                  track-event='help_api_reference'
                >
                  API 参考
                </RouterLink>

                <RouterLink
                  to='/help/examples'
                  variant='button'
                  size='small'
                  icon='💡'
                  badge='NEW'
                  badge-variant='text'
                  badge-color='#28a745'
                  track-event='help_examples'
                >
                  示例代码
                </RouterLink>

                <RouterLink
                  to='https://github.com/ldesign/ldesign/issues'
                  external={true}
                  target='_blank'
                  variant='button'
                  size='small'
                  icon='🐛'
                  track-event='help_report_bug'
                >
                  报告问题
                </RouterLink>
              </div>
            </div>
          </div>

          <div class='help-main'>
            <div class='search-section'>
              <h3>🔍 搜索帮助</h3>
              <div class='search-box'>
                <input
                  type='text'
                  placeholder='搜索问题或关键词...'
                  class='search-input'
                />
                <button class='search-btn'>搜索</button>
              </div>
            </div>

            <div class='faq-section'>
              <h3>❓ 常见问题</h3>
              <div class='faq-list'>
                {faqs.value.map(faq => (
                  <div key={faq.id} class='faq-item'>
                    <div class='faq-header'>
                      <h4 class='faq-question'>{faq.question}</h4>
                      <span class='faq-category'>{faq.category}</span>
                    </div>
                    <p class='faq-answer'>{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            <div class='demo-section'>
              <h3>🎯 功能演示</h3>
              <div class='demo-grid'>
                <div class='demo-card'>
                  <h4>🎨 样式变体</h4>
                  <div class='demo-content'>
                    <RouterLink to='/help' variant='button'>
                      按钮样式
                    </RouterLink>
                    <RouterLink to='/help' variant='tab'>
                      标签样式
                    </RouterLink>
                    <RouterLink to='/help' variant='breadcrumb'>
                      面包屑
                    </RouterLink>
                  </div>
                </div>

                <div class='demo-card'>
                  <h4>🏷️ 徽章系统</h4>
                  <div class='demo-content'>
                    <RouterLink to='/help' badge='5' badge-variant='count'>
                      数字徽章
                    </RouterLink>
                    <RouterLink
                      to='/help'
                      badge-variant='dot'
                      badge-color='#ff4757'
                    >
                      圆点徽章
                    </RouterLink>
                    <RouterLink
                      to='/help'
                      badge='HOT'
                      badge-variant='text'
                      badge-color='#ff6b6b'
                    >
                      文本徽章
                    </RouterLink>
                  </div>
                </div>

                <div class='demo-card'>
                  <h4>⚡ 预加载策略</h4>
                  <div class='demo-content'>
                    <RouterLink
                      to='/help/guide1'
                      preload='hover'
                      variant='button'
                      size='small'
                    >
                      悬停预加载
                    </RouterLink>
                    <RouterLink
                      to='/help/guide2'
                      preload='visible'
                      variant='button'
                      size='small'
                    >
                      可见预加载
                    </RouterLink>
                    <RouterLink
                      to='/help/guide3'
                      preload='immediate'
                      variant='button'
                      size='small'
                    >
                      立即预加载
                    </RouterLink>
                  </div>
                </div>

                <div class='demo-card'>
                  <h4>🔐 权限控制</h4>
                  <div class='demo-content'>
                    <RouterLink
                      to='/admin'
                      permission='admin'
                      variant='button'
                      size='small'
                    >
                      管理员功能
                    </RouterLink>
                    <RouterLink
                      to='/premium'
                      permission='premium'
                      variant='button'
                      size='small'
                    >
                      高级功能
                    </RouterLink>
                    <RouterLink
                      to='/settings'
                      permission={['admin', 'settings']}
                      variant='button'
                      size='small'
                    >
                      多权限检查
                    </RouterLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class='help-footer'>
          <div class='breadcrumb'>
            <RouterLink to='/' variant='breadcrumb'>
              首页
            </RouterLink>
            <RouterLink to='/help' variant='breadcrumb'>
              帮助中心
            </RouterLink>
          </div>

          <div class='contact-info'>
            <p>还有其他问题？</p>
            <div class='contact-links'>
              <RouterLink
                to='mailto:support@ldesign.dev'
                external={true}
                variant='button'
                icon='📧'
                track-event='contact_email'
              >
                邮件联系
              </RouterLink>

              <RouterLink
                to='https://github.com/ldesign/ldesign/discussions'
                external={true}
                target='_blank'
                variant='button'
                icon='💬'
                track-event='join_discussion'
              >
                加入讨论
              </RouterLink>
            </div>
          </div>
        </div>

        <style>{`
          .help {
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
          }
          
          .help-header {
            margin-bottom: 2rem;
          }
          
          .help-header h2 {
            color: #333;
            margin-bottom: 0.5rem;
          }
          
          .help-header p {
            color: #666;
          }
          
          .help-content {
            display: grid;
            grid-template-columns: 250px 1fr;
            gap: 2rem;
            margin-bottom: 2rem;
          }
          
          .help-sidebar {
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }
          
          .categories,
          .quick-links {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border: 1px solid #e0e0e0;
          }
          
          .categories h3,
          .quick-links h3 {
            margin: 0 0 1rem 0;
            color: #555;
            font-size: 1rem;
          }
          
          .category-item {
            display: flex;
            align-items: center;
            padding: 0.5rem 0;
            cursor: pointer;
            border-radius: 4px;
            transition: background-color 0.2s ease;
          }
          
          .category-item:hover {
            background-color: #f8f9fa;
          }
          
          .category-icon {
            margin-right: 0.5rem;
          }
          
          .category-name {
            flex: 1;
            font-size: 0.875rem;
          }
          
          .category-count {
            font-size: 0.75rem;
            color: #666;
          }
          
          .link-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .help-main {
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }
          
          .search-section,
          .faq-section,
          .demo-section {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            border: 1px solid #e0e0e0;
          }
          
          .search-section h3,
          .faq-section h3,
          .demo-section h3 {
            margin: 0 0 1.5rem 0;
            color: #555;
            font-size: 1.1rem;
          }
          
          .search-box {
            display: flex;
            gap: 0.5rem;
          }
          
          .search-input {
            flex: 1;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 0.875rem;
          }
          
          .search-btn {
            padding: 0.75rem 1.5rem;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.875rem;
          }
          
          .faq-list {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }
          
          .faq-item {
            padding: 1.5rem;
            background: #f8f9fa;
            border-radius: 6px;
            border-left: 4px solid #007bff;
          }
          
          .faq-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.75rem;
          }
          
          .faq-question {
            margin: 0;
            color: #333;
            font-size: 1rem;
            font-weight: 600;
          }
          
          .faq-category {
            padding: 0.25rem 0.5rem;
            background: #e3f2fd;
            color: #1976d2;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
          }
          
          .faq-answer {
            margin: 0;
            color: #666;
            line-height: 1.6;
          }
          
          .demo-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
          }
          
          .demo-card {
            padding: 1.5rem;
            background: #f8f9fa;
            border-radius: 6px;
            border: 1px solid #e0e0e0;
          }
          
          .demo-card h4 {
            margin: 0 0 1rem 0;
            color: #555;
            font-size: 0.9rem;
          }
          
          .demo-content {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .help-footer {
            padding-top: 2rem;
            border-top: 1px solid #e0e0e0;
          }
          
          .contact-info {
            margin-top: 1rem;
            text-align: center;
          }
          
          .contact-info p {
            color: #666;
            margin-bottom: 1rem;
          }
          
          .contact-links {
            display: flex;
            justify-content: center;
            gap: 1rem;
          }
          
          @media (max-width: 768px) {
            .help-content {
              grid-template-columns: 1fr;
            }
            
            .help-sidebar {
              order: 2;
            }
            
            .help-main {
              order: 1;
            }
          }
        `}</style>
      </div>
    )
  },
})

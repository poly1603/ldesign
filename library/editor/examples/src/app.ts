/**
 * 应用主文件
 * 创建导航和示例容器
 */

import { renderBasicExample } from './examples/basic'
import { renderVueExample } from './examples/vue-example'
import { renderReactExample } from './examples/react-example'
import { renderAdvancedExample } from './examples/advanced'

type ExampleType = 'basic' | 'vue' | 'react' | 'advanced'

interface Example {
  id: ExampleType
  name: string
  description: string
  render: () => HTMLElement
}

const examples: Example[] = [
  {
    id: 'basic',
    name: '基础示例',
    description: '原生 JavaScript + TypeScript',
    render: renderBasicExample
  },
  {
    id: 'vue',
    name: 'Vue 3 示例',
    description: 'Vue 3 + Composition API',
    render: renderVueExample
  },
  {
    id: 'react',
    name: 'React 示例',
    description: 'React 18 + Hooks',
    render: renderReactExample
  },
  {
    id: 'advanced',
    name: '高级功能',
    description: '完整功能演示',
    render: renderAdvancedExample
  }
]

export function createApp(): HTMLElement {
  const app = document.createElement('div')
  app.className = 'app-container'

  // 创建头部
  const header = createHeader()
  app.appendChild(header)

  // 创建主内容区
  const main = document.createElement('main')
  main.className = 'main-content'

  // 创建侧边栏导航
  const sidebar = createSidebar()
  main.appendChild(sidebar)

  // 创建内容区
  const content = document.createElement('div')
  content.className = 'content-area'
  content.id = 'content'
  main.appendChild(content)

  app.appendChild(main)

  // 初始化时根据 URL hash 或默认显示基础示例
  // 注意：移到 DOMContentLoaded 后处理，避免双重初始化
  
  return app
}

function createHeader(): HTMLElement {
  const header = document.createElement('header')
  header.className = 'app-header'

  header.innerHTML = `
    <div class="header-content">
      <div class="logo">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="6" fill="#3B82F6"/>
          <path d="M8 12H24M8 16H24M8 20H16" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <h1>@ldesign/editor</h1>
      </div>
      <div class="header-actions">
        <a href="https://github.com/ldesign/editor" target="_blank" class="github-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub
        </a>
      </div>
    </div>
  `

  return header
}

function createSidebar(): HTMLElement {
  const sidebar = document.createElement('aside')
  sidebar.className = 'sidebar'

  const nav = document.createElement('nav')
  nav.className = 'nav'

  const navTitle = document.createElement('h2')
  navTitle.className = 'nav-title'
  navTitle.textContent = '示例列表'
  nav.appendChild(navTitle)

  const navList = document.createElement('ul')
  navList.className = 'nav-list'

  examples.forEach((example, index) => {
    const item = document.createElement('li')
    item.className = 'nav-item'
    if (index === 0) item.classList.add('active')

    const link = document.createElement('a')
    link.href = '#'
    link.className = 'nav-link'
    link.dataset.example = example.id
    link.innerHTML = `
      <div class="nav-link-content">
        <span class="nav-link-title">${example.name}</span>
        <span class="nav-link-desc">${example.description}</span>
      </div>
    `

    link.addEventListener('click', (e) => {
      e.preventDefault()
      // 更新激活状态
      document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'))
      item.classList.add('active')
      // 显示对应示例
      showExample(example.id)
    })

    item.appendChild(link)
    navList.appendChild(item)
  })

  nav.appendChild(navList)
  sidebar.appendChild(nav)

  return sidebar
}

function showExample(id: ExampleType): void {
  const content = document.getElementById('content')
  if (!content) return

  // 清空内容
  content.innerHTML = ''

  // 查找并渲染示例
  const example = examples.find(e => e.id === id)
  if (example) {
    const exampleElement = example.render()
    content.appendChild(exampleElement)

    // 更新 URL hash
    window.location.hash = id
  }
}

// 监听 hash 变化
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(1) as ExampleType
  if (hash && examples.some(e => e.id === hash)) {
    showExample(hash)
  }
})

// 初始化时检查 hash
window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.slice(1) as ExampleType
  const targetExample = hash && examples.some(e => e.id === hash) ? hash : 'basic'
  
  // 显示目标示例
  showExample(targetExample)
  
  // 更新导航激活状态
  document.querySelectorAll('.nav-item').forEach((el, index) => {
    el.classList.toggle('active', examples[index].id === targetExample)
  })
})

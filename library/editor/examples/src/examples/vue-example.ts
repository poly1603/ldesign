/**
 * Vue 3 示例
 */

import { createApp } from 'vue'
import { defineComponent, ref, computed } from 'vue'
import { RichEditor, useEditor } from '@/adapters/vue'
import { BoldPlugin, ItalicPlugin, UnderlinePlugin, HeadingPlugin, LinkPlugin, ImagePlugin, BulletListPlugin, OrderedListPlugin, HistoryPlugin } from '@/plugins'
import '@/styles/editor.css'

export function renderVueExample(): HTMLElement {
  const container = document.createElement('div')
  container.className = 'example-container'
  container.id = 'vue-example-root'
  container.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; min-height: 400px; color: #999;">正在加载 Vue 编辑器...</div>'

  // Vue 应用定义
  const VueExample = defineComponent({
    name: 'VueExample',
    setup() {
      const content = ref(`
        <h1>Vue 3 编辑器示例</h1>
        <p>这是使用 <strong>Vue 3 Composition API</strong> 创建的富文本编辑器。</p>

        <h2>特性</h2>
        <ul>
          <li>响应式数据绑定</li>
          <li>组件化开发</li>
          <li>TypeScript 支持</li>
        </ul>

        <p>试试编辑这段文字，体验 Vue 的响应式更新！</p>
      `)

      const plugins = [
        BoldPlugin,
        ItalicPlugin,
        UnderlinePlugin,
        HeadingPlugin,
        LinkPlugin,
        ImagePlugin,
        BulletListPlugin,
        OrderedListPlugin,
        HistoryPlugin
      ]

      const activeTab = ref<'editor' | 'html' | 'json'>('editor')
      const wordCount = computed(() => {
        const text = content.value.replace(/<[^>]*>/g, '')
        return text.trim().length
      })

      const handleUpdate = (state: any) => {
        console.log('编辑器更新:', state)
      }

      const clearContent = () => {
        content.value = '<p></p>'
      }

      const setTemplate = (template: string) => {
        const templates: Record<string, string> = {
          article: `
            <h1>文章标题</h1>
            <p>在这里开始编写你的文章...</p>
            <h2>小节标题</h2>
            <p>文章内容段落。</p>
          `,
          list: `
            <h2>待办事项</h2>
            <ul>
              <li>任务 1</li>
              <li>任务 2</li>
              <li>任务 3</li>
            </ul>
          `,
          code: `
            <h2>代码文档</h2>
            <p>这是一段代码示例：</p>
            <pre><code>function example() {
  console.log('Hello')
}</code></pre>
          `
        }
        content.value = templates[template] || templates.article
      }

      return {
        content,
        plugins,
        activeTab,
        wordCount,
        handleUpdate,
        clearContent,
        setTemplate
      }
    },
    template: `
      <div class="example-header">
        <h1 class="example-title">Vue 3 示例</h1>
        <p class="example-description">
          使用 Vue 3 Composition API 和组件化开发，享受响应式数据绑定的便利。
        </p>
        <span class="example-badge">Vue 3 + Composition API</span>
      </div>

      <div class="example-section">
        <h2 class="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          Vue 编辑器组件
        </h2>
        <p class="section-description">
          使用 v-model 进行双向数据绑定，实时更新内容。当前字数：<strong>{{ wordCount }}</strong> 个字符
        </p>

        <div class="tabs">
          <button
            class="tab"
            :class="{ active: activeTab === 'editor' }"
            @click="activeTab = 'editor'"
          >编辑器</button>
          <button
            class="tab"
            :class="{ active: activeTab === 'html' }"
            @click="activeTab = 'html'"
          >HTML 预览</button>
          <button
            class="tab"
            :class="{ active: activeTab === 'json' }"
            @click="activeTab = 'json'"
          >JSON 数据</button>
        </div>

        <div v-show="activeTab === 'editor'" class="editor-wrapper">
          <RichEditor
            v-model="content"
            :plugins="plugins"
            :show-toolbar="true"
            placeholder="开始编写..."
            @update="handleUpdate"
          />
        </div>

        <div v-show="activeTab === 'html'" class="output">
          <div class="output-title">HTML 输出</div>
          <pre>{{ content }}</pre>
        </div>

        <div v-show="activeTab === 'json'" class="output">
          <div class="output-title">JSON 数据</div>
          <pre>{{ JSON.stringify({ content }, null, 2) }}</pre>
        </div>

        <div class="actions">
          <button class="btn btn-primary" @click="setTemplate('article')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            加载文章模板
          </button>
          <button class="btn btn-primary" @click="setTemplate('list')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            加载列表模板
          </button>
          <button class="btn btn-secondary" @click="setTemplate('code')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
            加载代码模板
          </button>
          <button class="btn btn-danger" @click="clearContent">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            清空
          </button>
        </div>
      </div>

      <div class="example-section">
        <h2 class="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
          </svg>
          代码示例
        </h2>
        <p class="section-description">在 Vue 3 中使用编辑器非常简单：</p>
        <div class="code-block">
          <pre><code>&lt;template&gt;
  &lt;RichEditor
    v-model="content"
    :plugins="plugins"
    :show-toolbar="true"
    placeholder="开始编写..."
    @update="handleUpdate"
  /&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
import { ref } from 'vue'
import { RichEditor } from '@ldesign/editor/vue'
import { BoldPlugin, ItalicPlugin } from '@ldesign/editor'
import '@ldesign/editor/style.css'

const content = ref('&lt;p&gt;Hello World!&lt;/p&gt;')
const plugins = [BoldPlugin, ItalicPlugin]

function handleUpdate(state) {
  console.log('编辑器更新:', state)
}
&lt;/script&gt;</code></pre>
        </div>
      </div>

      <div class="example-section">
        <h2 class="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          使用 Composition API
        </h2>
        <p class="section-description">也可以使用 useEditor hook：</p>
        <div class="code-block">
          <pre><code>&lt;template&gt;
  &lt;div ref="editorRef"&gt;&lt;/div&gt;
  &lt;button @click="editor.focus()"&gt;聚焦&lt;/button&gt;
  &lt;button @click="editor.clear()"&gt;清空&lt;/button&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
import { ref, onMounted } from 'vue'
import { useEditor } from '@ldesign/editor/vue'
import { BoldPlugin } from '@ldesign/editor'

const editorRef = ref&lt;HTMLElement&gt;()
const { editor, content, init } = useEditor({
  plugins: [BoldPlugin]
})

onMounted(() => {
  if (editorRef.value) {
    init(editorRef.value)
  }
})
&lt;/script&gt;</code></pre>
        </div>
      </div>
    `
  })

  // 创建并挂载 Vue 应用
  // 使用微任务确保 DOM 准备好后挂载
  Promise.resolve().then(() => {
    if (!document.body.contains(container)) {
      // 容器还没有添加到 DOM，等待下一帧
      requestAnimationFrame(() => {
        container.innerHTML = '' // 清除加载提示
        const vueApp = createApp(VueExample)
        vueApp.mount('#vue-example-root')
      })
    } else {
      container.innerHTML = '' // 清除加载提示
      const vueApp = createApp(VueExample)
      vueApp.mount('#vue-example-root')
    }
  })

  return container
}

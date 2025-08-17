<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

const props = defineProps<{
  engine: any
}>()

const emit = defineEmits<{
  log: [level: string, message: string, data?: any]
}>()

// 响应式数据
const highlightColor = ref('#ffeb3b')
const tooltipVisible = ref(false)
const isLoading = ref(false)
const directiveName = ref('focus')
const directiveType = ref('attribute')
const directiveCode = ref(`{
  mounted(el, binding) {
    el.focus()
  }
}`)
const selectedDirective = ref('')
const directiveArgs = ref('')
const testElement = ref<HTMLElement>()

const registeredDirectives = reactive<any[]>([])

// 预设指令模板
const presetDirectives = [
  {
    name: 'v-focus',
    description: '自动聚焦指令',
    type: 'attribute',
    code: `{
  mounted(el) {
    el.focus()
  }
}`,
  },
  {
    name: 'v-click-outside',
    description: '点击外部区域指令',
    type: 'attribute',
    code: `{
  mounted(el, binding) {
    el._clickOutside = (event) => {
      if (!el.contains(event.target)) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside)
  }
}`,
  },
  {
    name: 'v-lazy-load',
    description: '图片懒加载指令',
    type: 'attribute',
    code: `{
  mounted(el, binding) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          el.src = binding.value
          observer.unobserve(el)
        }
      })
    })
    observer.observe(el)
  }
}`,
  },
  {
    name: 'v-debounce',
    description: '防抖指令',
    type: 'attribute',
    code: `{
  mounted(el, binding) {
    let timer = null
    el.addEventListener('input', () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        binding.value()
      }, binding.arg || 300)
    })
  }
}`,
  },
  {
    name: 'v-permission',
    description: '权限控制指令',
    type: 'structural',
    code: `{
  mounted(el, binding) {
    const hasPermission = checkPermission(binding.value)
    if (!hasPermission) {
      el.style.display = 'none'
    }
  }
}`,
  },
]

// 方法
function showTooltip() {
  tooltipVisible.value = true
}

function hideTooltip() {
  tooltipVisible.value = false
}

function toggleLoading() {
  isLoading.value = !isLoading.value
}

function registerDirective() {
  try {
    // 验证指令代码
    const directiveObj = eval(`(${directiveCode.value})`)

    const directive = {
      name: directiveName.value,
      type: directiveType.value,
      description: `自定义${directiveType.value}指令`,
      code: directiveCode.value,
      implementation: directiveObj,
      createdAt: Date.now(),
    }

    // 检查是否已存在
    const existingIndex = registeredDirectives.findIndex(d => d.name === directiveName.value)
    if (existingIndex !== -1) {
      registeredDirectives[existingIndex] = directive
      emit('log', 'warning', `更新指令: ${directiveName.value}`)
    }
    else {
      registeredDirectives.push(directive)
      emit('log', 'success', `注册指令: ${directiveName.value}`)
    }

    // 模拟注册到引擎
    if (props.engine && props.engine.directives) {
      props.engine.directives.register(directiveName.value, directiveObj)
    }
  }
  catch (error: any) {
    emit('log', 'error', '注册指令失败', error)
  }
}

function testDirective() {
  try {
    const directive = registeredDirectives.find(d => d.name === directiveName.value)
    if (!directive) {
      emit('log', 'warning', '指令不存在')
      return
    }

    // 模拟测试指令
    emit('log', 'info', `测试指令: ${directiveName.value}`, {
      name: directive.name,
      type: directive.type,
      hasImplementation: !!directive.implementation,
    })
  }
  catch (error: any) {
    emit('log', 'error', '测试指令失败', error)
  }
}

function unregisterDirective() {
  try {
    const index = registeredDirectives.findIndex(d => d.name === directiveName.value)
    if (index !== -1) {
      registeredDirectives.splice(index, 1)
      emit('log', 'warning', `注销指令: ${directiveName.value}`)

      // 模拟从引擎注销
      if (props.engine && props.engine.directives) {
        props.engine.directives.unregister(directiveName.value)
      }
    }
    else {
      emit('log', 'warning', '指令不存在')
    }
  }
  catch (error: any) {
    emit('log', 'error', '注销指令失败', error)
  }
}

function editDirective(directive: any) {
  directiveName.value = directive.name
  directiveType.value = directive.type
  directiveCode.value = directive.code
  emit('log', 'info', `编辑指令: ${directive.name}`)
}

function removeDirective(name: string) {
  const index = registeredDirectives.findIndex(d => d.name === name)
  if (index !== -1) {
    registeredDirectives.splice(index, 1)
    emit('log', 'warning', `删除指令: ${name}`)
  }
}

function applyDirective() {
  if (!selectedDirective.value || !testElement.value) {
    emit('log', 'warning', '请选择指令和测试元素')
    return
  }

  try {
    const directive = registeredDirectives.find(d => d.name === selectedDirective.value)
    if (!directive) {
      emit('log', 'warning', '指令不存在')
      return
    }

    // 模拟应用指令
    const element = testElement.value
    const binding = {
      value: directiveArgs.value,
      arg: directiveArgs.value,
      modifiers: {},
    }

    // 应用指令效果
    switch (directive.name) {
      case 'v-focus':
        element.focus()
        break
      case 'v-highlight':
        element.style.backgroundColor = directiveArgs.value || '#ffeb3b'
        break
      case 'v-loading':
        element.classList.add('loading')
        break
      default:
        // 通用处理
        element.setAttribute(`data-${directive.name}`, directiveArgs.value)
    }

    emit('log', 'success', `应用指令: ${selectedDirective.value}`, {
      directive: directive.name,
      args: directiveArgs.value,
      element: element.tagName,
    })
  }
  catch (error: any) {
    emit('log', 'error', '应用指令失败', error)
  }
}

function removeDirectiveFromElement() {
  if (!testElement.value) {
    emit('log', 'warning', '测试元素不存在')
    return
  }

  try {
    const element = testElement.value

    // 移除指令效果
    element.style.backgroundColor = ''
    element.classList.remove('loading')

    // 移除所有 data 属性
    Array.from(element.attributes).forEach((attr) => {
      if (attr.name.startsWith('data-v-')) {
        element.removeAttribute(attr.name)
      }
    })

    emit('log', 'info', '移除元素上的指令效果')
  }
  catch (error: any) {
    emit('log', 'error', '移除指令失败', error)
  }
}

function loadPresetDirective(preset: any) {
  directiveName.value = preset.name.replace('v-', '')
  directiveType.value = preset.type
  directiveCode.value = preset.code
  emit('log', 'info', `加载预设指令: ${preset.name}`)
}

// 生命周期
onMounted(() => {
  // 注册一些默认指令
  const defaultDirectives = [
    {
      name: 'highlight',
      type: 'attribute',
      description: '高亮显示指令',
      code: `{
  mounted(el, binding) {
    el.style.backgroundColor = binding.value || '#ffeb3b'
  },
  updated(el, binding) {
    el.style.backgroundColor = binding.value || '#ffeb3b'
  }
}`,
      implementation: {
        mounted(el: HTMLElement, binding: any) {
          el.style.backgroundColor = binding.value || '#ffeb3b'
        },
        updated(el: HTMLElement, binding: any) {
          el.style.backgroundColor = binding.value || '#ffeb3b'
        },
      },
      createdAt: Date.now(),
    },
    {
      name: 'tooltip',
      type: 'attribute',
      description: '提示信息指令',
      code: `{
  mounted(el, binding) {
    el.title = binding.value
  }
}`,
      implementation: {
        mounted(el: HTMLElement, binding: any) {
          el.title = binding.value
        },
      },
      createdAt: Date.now(),
    },
  ]

  registeredDirectives.push(...defaultDirectives)

  emit('log', 'info', '指令管理器演示已加载')
})
</script>

<template>
  <div class="directives-demo">
    <div class="demo-header">
      <h2>📝 指令管理器演示</h2>
      <p>DirectiveManager 提供了自定义指令系统，支持DOM操作、事件绑定、数据绑定等功能。</p>
    </div>

    <div class="demo-grid">
      <!-- 基础指令 -->
      <div class="card">
        <div class="card-header">
          <h3>基础指令演示</h3>
        </div>
        <div class="card-body">
          <div class="directive-example">
            <h4>v-highlight 指令</h4>
            <div
              class="highlight-demo"
              :style="{ backgroundColor: highlightColor }"
            >
              这个元素使用了高亮指令
            </div>
            <div class="form-group">
              <label>高亮颜色</label>
              <input
                v-model="highlightColor"
                type="color"
              >
            </div>
          </div>

          <div class="directive-example">
            <h4>v-tooltip 指令</h4>
            <button
              class="btn btn-primary tooltip-demo"
              @mouseenter="showTooltip"
              @mouseleave="hideTooltip"
            >
              悬停显示提示
            </button>
            <div v-if="tooltipVisible" class="tooltip">
              这是一个自定义提示信息
            </div>
          </div>

          <div class="directive-example">
            <h4>v-loading 指令</h4>
            <div class="loading-demo" :class="{ loading: isLoading }">
              <div v-if="isLoading" class="loading-spinner" />
              <div v-else>
                内容已加载完成
              </div>
            </div>
            <button
              class="btn btn-secondary"
              @click="toggleLoading"
            >
              {{ isLoading ? '停止加载' : '开始加载' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 自定义指令 -->
      <div class="card">
        <div class="card-header">
          <h3>自定义指令</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>指令名称</label>
            <input
              v-model="directiveName"
              type="text"
              placeholder="例如: focus"
            >
          </div>

          <div class="form-group">
            <label>指令类型</label>
            <select v-model="directiveType">
              <option value="attribute">
                属性指令
              </option>
              <option value="structural">
                结构指令
              </option>
              <option value="component">
                组件指令
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>指令代码</label>
            <textarea
              v-model="directiveCode"
              placeholder="输入指令实现代码"
              rows="6"
            />
          </div>

          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-primary" @click="registerDirective">
                注册指令
              </button>
              <button class="btn btn-secondary" @click="testDirective">
                测试指令
              </button>
              <button class="btn btn-warning" @click="unregisterDirective">
                注销指令
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 指令列表 -->
      <div class="card">
        <div class="card-header">
          <h3>已注册指令</h3>
        </div>
        <div class="card-body">
          <div class="directives-list">
            <div
              v-for="directive in registeredDirectives"
              :key="directive.name"
              class="directive-item"
            >
              <div class="directive-info">
                <h4>{{ directive.name }}</h4>
                <p>{{ directive.description }}</p>
                <span class="directive-type">{{ directive.type }}</span>
              </div>
              <div class="directive-actions">
                <button
                  class="btn btn-secondary btn-sm"
                  @click="editDirective(directive)"
                >
                  编辑
                </button>
                <button
                  class="btn btn-error btn-sm"
                  @click="removeDirective(directive.name)"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 指令测试区 -->
      <div class="card full-width">
        <div class="card-header">
          <h3>指令测试区</h3>
        </div>
        <div class="card-body">
          <div class="test-area">
            <div ref="testElement" class="test-element">
              <h4>测试元素</h4>
              <p>在这里测试自定义指令的效果</p>
            </div>

            <div class="test-controls">
              <div class="form-group">
                <label>应用指令</label>
                <select v-model="selectedDirective">
                  <option value="">
                    选择指令
                  </option>
                  <option
                    v-for="directive in registeredDirectives"
                    :key="directive.name"
                    :value="directive.name"
                  >
                    {{ directive.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>指令参数</label>
                <input
                  v-model="directiveArgs"
                  type="text"
                  placeholder="指令参数"
                >
              </div>

              <div class="form-group">
                <div class="button-group">
                  <button class="btn btn-primary" @click="applyDirective">
                    应用指令
                  </button>
                  <button class="btn btn-secondary" @click="removeDirectiveFromElement">
                    移除指令
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 预设指令 -->
      <div class="card full-width">
        <div class="card-header">
          <h3>预设指令模板</h3>
        </div>
        <div class="card-body">
          <div class="preset-directives">
            <div
              v-for="preset in presetDirectives"
              :key="preset.name"
              class="preset-directive"
            >
              <div class="preset-info">
                <h4>{{ preset.name }}</h4>
                <p>{{ preset.description }}</p>
              </div>
              <button
                class="btn btn-secondary"
                @click="loadPresetDirective(preset)"
              >
                加载模板
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.directives-demo {
  .demo-header {
    margin-bottom: var(--spacing-xl);

    h2 {
      margin-bottom: var(--spacing-sm);
      color: var(--text-primary);
    }

    p {
      color: var(--text-secondary);
      line-height: 1.6;
    }
  }

  .demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: var(--spacing-lg);

    .full-width {
      grid-column: 1 / -1;
    }
  }

  .button-group {
    display: flex;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
  }

  .directive-example {
    margin-bottom: var(--spacing-lg);

    h4 {
      margin-bottom: var(--spacing-sm);
      font-size: 16px;
      color: var(--text-primary);
    }

    .highlight-demo {
      padding: var(--spacing-md);
      border-radius: var(--border-radius);
      margin-bottom: var(--spacing-sm);
      text-align: center;
      transition: background-color 0.3s ease;
    }

    .tooltip-demo {
      position: relative;
    }

    .tooltip {
      position: absolute;
      top: -40px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--bg-dark);
      color: white;
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--border-radius);
      font-size: 12px;
      white-space: nowrap;
      z-index: 10;

      &::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 5px solid transparent;
        border-top-color: var(--bg-dark);
      }
    }

    .loading-demo {
      position: relative;
      padding: var(--spacing-lg);
      background: var(--bg-secondary);
      border-radius: var(--border-radius);
      text-align: center;
      min-height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.loading {
        color: var(--text-muted);
      }

      .loading-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid var(--border-color);
        border-top: 2px solid var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
    }
  }

  .directives-list {
    .directive-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-sm);
      background: var(--bg-secondary);
      border-radius: var(--border-radius);
      border-left: 4px solid var(--primary-color);

      .directive-info {
        flex: 1;

        h4 {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: 16px;
          font-family: monospace;
          color: var(--primary-color);
        }

        p {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .directive-type {
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 4px;
          background: var(--bg-primary);
          color: var(--text-muted);
        }
      }

      .directive-actions {
        display: flex;
        gap: var(--spacing-xs);
      }
    }
  }

  .test-area {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: var(--spacing-lg);

    .test-element {
      padding: var(--spacing-lg);
      background: var(--bg-secondary);
      border-radius: var(--border-radius);
      border: 2px dashed var(--border-color);
      text-align: center;
      min-height: 150px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      h4 {
        margin: 0 0 var(--spacing-sm) 0;
        color: var(--text-primary);
      }

      p {
        margin: 0;
        color: var(--text-secondary);
      }
    }

    .test-controls {
      .form-group {
        margin-bottom: var(--spacing-md);
      }
    }
  }

  .preset-directives {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-md);

    .preset-directive {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      background: var(--bg-secondary);
      border-radius: var(--border-radius);

      .preset-info {
        flex: 1;

        h4 {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: 16px;
          font-family: monospace;
          color: var(--primary-color);
        }

        p {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary);
        }
      }
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .directives-demo .demo-grid {
    grid-template-columns: 1fr;
  }

  .button-group {
    flex-direction: column;
  }

  .test-area {
    grid-template-columns: 1fr !important;
  }

  .directive-item {
    flex-direction: column;
    align-items: flex-start !important;

    .directive-actions {
      margin-top: var(--spacing-sm);
    }
  }

  .preset-directives {
    grid-template-columns: 1fr;
  }

  .preset-directive {
    flex-direction: column;
    align-items: flex-start !important;

    button {
      margin-top: var(--spacing-sm);
    }
  }
}
</style>

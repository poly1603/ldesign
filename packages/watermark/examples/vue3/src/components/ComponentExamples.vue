<template>
  <div class="component-examples">
    <h2 class="section-title">🧩 组件化示例</h2>
    <p class="section-desc">展示如何将水印功能封装成可复用的 Vue 组件</p>

    <div class="grid grid-2">
      <!-- 基础水印组件 -->
      <div class="card glass">
        <h3>基础水印组件</h3>
        <div class="form-group">
          <label>水印文字</label>
          <input v-model="basicWatermarkProps.content" type="text">
        </div>
        <div class="form-group">
          <label>是否启用</label>
          <input v-model="basicWatermarkProps.enabled" type="checkbox">
        </div>
        
        <WatermarkContainer
          :content="basicWatermarkProps.content"
          :enabled="basicWatermarkProps.enabled"
          :style="{ fontSize: 16, color: '#2196F3', opacity: 0.2 }"
        >
          <div class="demo-content">
            <p>基础水印组件示例</p>
            <p>使用 WatermarkContainer 组件</p>
          </div>
        </WatermarkContainer>
        
        <div class="code-preview">
          <details>
            <summary>查看组件代码</summary>
            <pre><code>{{ basicComponentCode }}</code></pre>
          </details>
        </div>
      </div>

      <!-- 高级水印组件 -->
      <div class="card glass">
        <h3>高级水印组件</h3>
        <div class="form-group">
          <label>预设主题</label>
          <select v-model="advancedWatermarkProps.theme">
            <option value="default">默认</option>
            <option value="security">安全</option>
            <option value="brand">品牌</option>
            <option value="warning">警告</option>
          </select>
        </div>
        <div class="form-group">
          <label>密度</label>
          <select v-model="advancedWatermarkProps.density">
            <option value="low">稀疏</option>
            <option value="medium">中等</option>
            <option value="high">密集</option>
          </select>
        </div>
        
        <AdvancedWatermark
          :theme="advancedWatermarkProps.theme"
          :density="advancedWatermarkProps.density"
          content="高级水印"
        >
          <div class="demo-content">
            <p>高级水印组件示例</p>
            <p>支持主题和密度配置</p>
          </div>
        </AdvancedWatermark>
        
        <div class="code-preview">
          <details>
            <summary>查看组件代码</summary>
            <pre><code>{{ advancedComponentCode }}</code></pre>
          </details>
        </div>
      </div>

      <!-- 响应式水印组件 -->
      <div class="card glass">
        <h3>响应式水印组件</h3>
        <div class="form-group">
          <label>自动调整</label>
          <input v-model="responsiveWatermarkProps.autoResize" type="checkbox">
        </div>
        <div class="form-group">
          <label>断点配置</label>
          <select v-model="responsiveWatermarkProps.breakpoint">
            <option value="mobile">移动端优化</option>
            <option value="tablet">平板优化</option>
            <option value="desktop">桌面端优化</option>
          </select>
        </div>
        
        <ResponsiveWatermark
          :auto-resize="responsiveWatermarkProps.autoResize"
          :breakpoint="responsiveWatermarkProps.breakpoint"
          content="响应式水印"
        >
          <div class="demo-content">
            <p>响应式水印组件示例</p>
            <p>自动适应容器大小</p>
          </div>
        </ResponsiveWatermark>
        
        <div class="code-preview">
          <details>
            <summary>查看组件代码</summary>
            <pre><code>{{ responsiveComponentCode }}</code></pre>
          </details>
        </div>
      </div>

      <!-- 动画水印组件 -->
      <div class="card glass">
        <h3>动画水印组件</h3>
        <div class="form-group">
          <label>动画类型</label>
          <select v-model="animationWatermarkProps.animation">
            <option value="fade">淡入淡出</option>
            <option value="slide">滑动</option>
            <option value="rotate">旋转</option>
            <option value="pulse">脉冲</option>
          </select>
        </div>
        <div class="form-group">
          <label>播放状态</label>
          <input v-model="animationWatermarkProps.playing" type="checkbox">
        </div>
        
        <AnimatedWatermark
          :animation="animationWatermarkProps.animation"
          :playing="animationWatermarkProps.playing"
          content="动画水印"
        >
          <div class="demo-content">
            <p>动画水印组件示例</p>
            <p>支持多种动画效果</p>
          </div>
        </AnimatedWatermark>
        
        <div class="code-preview">
          <details>
            <summary>查看组件代码</summary>
            <pre><code>{{ animationComponentCode }}</code></pre>
          </details>
        </div>
      </div>
    </div>

    <!-- 组合式组件 -->
    <div class="card glass mt-30">
      <h3>🎯 组合式水印组件</h3>
      <p>将多个水印功能组合在一个组件中</p>
      
      <div class="composite-controls">
        <div class="form-group">
          <label>用户名</label>
          <input v-model="compositeProps.username" type="text">
        </div>
        <div class="form-group">
          <label>部门</label>
          <input v-model="compositeProps.department" type="text">
        </div>
        <div class="form-group">
          <label>安全级别</label>
          <select v-model="compositeProps.securityLevel">
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
          </select>
        </div>
        <div class="form-group">
          <label>显示时间戳</label>
          <input v-model="compositeProps.showTimestamp" type="checkbox">
        </div>
      </div>
      
      <CompositeWatermark
        :username="compositeProps.username"
        :department="compositeProps.department"
        :security-level="compositeProps.securityLevel"
        :show-timestamp="compositeProps.showTimestamp"
        @security-violation="onSecurityViolation"
      >
        <div class="demo-content large">
          <h4>机密文档</h4>
          <p>这是一个包含敏感信息的文档</p>
          <p>水印包含用户信息、部门、时间戳等</p>
          <p>具有安全防护功能</p>
          <div class="document-content">
            <p>文档内容...</p>
            <p>更多内容...</p>
          </div>
        </div>
      </CompositeWatermark>
      
      <div v-if="securityViolations.length" class="security-alerts">
        <h4>🚨 安全警报</h4>
        <div class="alert-list">
          <div
            v-for="alert in securityViolations.slice(-3)"
            :key="alert.id"
            class="alert-item"
          >
            <span class="alert-time">{{ alert.time }}</span>
            <span class="alert-message">{{ alert.message }}</span>
          </div>
        </div>
      </div>
      
      <div class="code-preview">
        <details>
          <summary>查看组合组件代码</summary>
          <pre><code>{{ compositeComponentCode }}</code></pre>
        </details>
      </div>
    </div>

    <!-- 指令式用法 -->
    <div class="card glass mt-30">
      <h3>📝 指令式用法</h3>
      <p>使用 v-watermark 指令快速添加水印</p>
      
      <div class="directive-examples">
        <div class="directive-item">
          <h4>简单指令</h4>
          <div ref="directiveRef1" class="directive-demo">
            <p>使用 v-watermark="'文字'" 指令</p>
          </div>
        </div>

        <div class="directive-item">
          <h4>配置对象指令</h4>
          <div ref="directiveRef2" class="directive-demo">
            <p>使用配置对象的指令</p>
          </div>
        </div>

        <div class="directive-item">
          <h4>修饰符指令</h4>
          <div ref="directiveRef3" class="directive-demo">
            <p>使用修饰符的指令</p>
          </div>
        </div>
      </div>
      
      <div class="code-preview">
        <details>
          <summary>查看指令代码</summary>
          <pre><code>{{ directiveCode }}</code></pre>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { createWatermark, destroyWatermark } from '../mock/watermark'
import WatermarkContainer from './watermark/WatermarkContainer.vue'
import AdvancedWatermark from './watermark/AdvancedWatermark.vue'
import ResponsiveWatermark from './watermark/ResponsiveWatermark.vue'
import AnimatedWatermark from './watermark/AnimatedWatermark.vue'
import CompositeWatermark from './watermark/CompositeWatermark.vue'

// 组件属性
const basicWatermarkProps = reactive({
  content: '基础水印',
  enabled: true
})

const advancedWatermarkProps = reactive({
  theme: 'default' as 'default' | 'security' | 'brand' | 'warning',
  density: 'medium' as 'low' | 'medium' | 'high'
})

const responsiveWatermarkProps = reactive({
  autoResize: true,
  breakpoint: 'desktop' as 'mobile' | 'tablet' | 'desktop'
})

const animationWatermarkProps = reactive({
  animation: 'fade' as 'fade' | 'slide' | 'rotate' | 'pulse',
  playing: true
})

const compositeProps = reactive({
  username: 'John Doe',
  department: 'IT部门',
  securityLevel: 'high' as 'low' | 'medium' | 'high',
  showTimestamp: true
})

// 指令配置
const directiveConfig = reactive({
  content: '配置对象水印',
  style: {
    fontSize: 14,
    color: '#FF9800',
    opacity: 0.2
  }
})

// 安全违规记录
const securityViolations = ref<Array<{
  id: number
  time: string
  message: string
}>>([])

// 指令示例的引用
const directiveRef1 = ref<HTMLElement>()
const directiveRef2 = ref<HTMLElement>()
const directiveRef3 = ref<HTMLElement>()

// 指令示例的水印实例
const directiveInstances = reactive<Record<string, any>>({
  simple: null,
  config: null,
  modifier: null
})

// 安全违规处理
const onSecurityViolation = (violation: any) => {
  securityViolations.value.push({
    id: Date.now(),
    time: new Date().toLocaleTimeString(),
    message: `检测到 ${violation.type} 违规行为`
  })
}

// 创建指令示例水印
const createDirectiveWatermarksAuto = async () => {
  try {
    // 简单指令水印
    if (directiveRef1.value) {
      directiveInstances.simple = await createWatermark(directiveRef1.value, {
        content: '简单指令水印',
        style: {
          fontSize: 14,
          color: 'rgba(0, 0, 0, 0.15)',
          opacity: 1
        }
      })
    }

    // 配置对象指令水印
    if (directiveRef2.value) {
      directiveInstances.config = await createWatermark(directiveRef2.value, {
        content: '配置对象水印',
        style: {
          fontSize: 14,
          color: '#FF9800',
          opacity: 0.2
        }
      })
    }

    // 修饰符指令水印
    if (directiveRef3.value) {
      directiveInstances.modifier = await createWatermark(directiveRef3.value, {
        content: '修饰符水印',
        style: {
          fontSize: 14,
          color: '#9C27B0',
          opacity: 0.25
        },
        security: {
          level: 'high'
        }
      })
    }
  } catch (error) {
    console.error('创建指令示例水印失败:', error)
  }
}

// 代码示例
const basicComponentCode = `&lt;template&gt;
  &lt;WatermarkContainer
    :content="content"
    :enabled="enabled"
    :style="{ fontSize: '16px', color: '#2196F3' }"
  &gt;
    &lt;div class="content"&gt;
      &lt;!-- 你的内容 --&gt;
    &lt;/div&gt;
  &lt;/WatermarkContainer&gt;
&lt;/template&gt;

&lt;script setup&gt;
import WatermarkContainer from './WatermarkContainer.vue'

const content = ref('基础水印')
const enabled = ref(true)
&lt;/script&gt;`

const advancedComponentCode = `&lt;template&gt;
  &lt;AdvancedWatermark
    :theme="theme"
    :density="density"
    content="高级水印"
  &gt;
    &lt;div class="content"&gt;
      &lt;!-- 你的内容 --&gt;
    &lt;/div&gt;
  &lt;/AdvancedWatermark&gt;
&lt;/template&gt;

&lt;script setup&gt;
import AdvancedWatermark from './AdvancedWatermark.vue'

const theme = ref('default')
const density = ref('medium')
&lt;/script&gt;`

const responsiveComponentCode = `&lt;template&gt;
  &lt;ResponsiveWatermark
    :auto-resize="autoResize"
    :breakpoint="breakpoint"
    content="响应式水印"
  &gt;
    &lt;div class="content"&gt;
      &lt;!-- 你的内容 --&gt;
    &lt;/div&gt;
  &lt;/ResponsiveWatermark&gt;
&lt;/template&gt;

&lt;script setup&gt;
import ResponsiveWatermark from './ResponsiveWatermark.vue'

const autoResize = ref(true)
const breakpoint = ref('desktop')
&lt;/script&gt;`

const animationComponentCode = `&lt;template&gt;
  &lt;AnimatedWatermark
    :animation="animation"
    :playing="playing"
    content="动画水印"
  &gt;
    &lt;div class="content"&gt;
      &lt;!-- 你的内容 --&gt;
    &lt;/div&gt;
  &lt;/AnimatedWatermark&gt;
&lt;/template&gt;

&lt;script setup&gt;
import AnimatedWatermark from './AnimatedWatermark.vue'

const animation = ref('fade')
const playing = ref(true)
&lt;/script&gt;`

const compositeComponentCode = `&lt;template&gt;
  &lt;CompositeWatermark
    :username="username"
    :department="department"
    :security-level="securityLevel"
    :show-timestamp="showTimestamp"
    @security-violation="onSecurityViolation"
  &gt;
    &lt;div class="content"&gt;
      &lt;!-- 你的内容 --&gt;
    &lt;/div&gt;
  &lt;/CompositeWatermark&gt;
&lt;/template&gt;

&lt;script setup&gt;
import CompositeWatermark from './CompositeWatermark.vue'

const username = ref('John Doe')
const department = ref('IT部门')
const securityLevel = ref('high')
const showTimestamp = ref(true)

const onSecurityViolation = (violation) => {
  console.log('安全违规:', violation)
}
&lt;/script&gt;`

const directiveCode = `&lt;!-- 简单用法 --&gt;
&lt;div v-watermark="'简单水印'"&gt;内容&lt;/div&gt;

&lt;!-- 配置对象 --&gt;
&lt;div v-watermark="{ content: '配置水印', style: { color: '#FF9800' } }"&gt;
  内容
&lt;/div&gt;

&lt;!-- 修饰符 --&gt;
&lt;div v-watermark.secure.responsive="'修饰符水印'"&gt;内容&lt;/div&gt;

<!-- 指令注册 -->
app.directive('watermark', {
  mounted(el, binding) {
    const config = typeof binding.value === 'string'
      ? { content: binding.value }
      : binding.value

    // 处理修饰符
    if (binding.modifiers.secure) {
      config.security = { level: 'high' }
    }
    if (binding.modifiers.responsive) {
      config.responsive = { enabled: true }
    }

    createWatermark(el, config)
  }
})`

// 生命周期钩子
onMounted(async () => {
  // 等待 DOM 更新后创建指令示例水印
  await new Promise(resolve => setTimeout(resolve, 100))
  await createDirectiveWatermarksAuto()
})

onUnmounted(async () => {
  // 清理指令示例水印
  for (const instance of Object.values(directiveInstances)) {
    if (instance) {
      await destroyWatermark(instance)
    }
  }
})
</script>

<style lang="less" scoped>
.component-examples {
  .section-title {
    color: white;
    font-size: 1.8rem;
    margin-bottom: 10px;
    text-align: center;
  }
  
  .section-desc {
    color: rgba(255, 255, 255, 0.8);
    text-align: center;
    margin-bottom: 30px;
  }
}

.demo-content {
  padding: 20px;
  text-align: center;
  color: #6c757d;
  background: #f8f9fa;
  border-radius: 8px;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  &.large {
    min-height: 250px;
    text-align: left;
    
    h4 {
      color: #333;
      margin-bottom: 15px;
      text-align: center;
    }
    
    .document-content {
      margin-top: 20px;
      padding: 15px;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 6px;
    }
  }
}

.composite-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.security-alerts {
  margin-top: 20px;
  
  h4 {
    color: var(--danger-color);
    margin-bottom: 10px;
  }
  
  .alert-list {
    background: rgba(244, 67, 54, 0.1);
    border-radius: 6px;
    padding: 15px;
  }
  
  .alert-item {
    display: flex;
    gap: 10px;
    margin-bottom: 8px;
    font-size: 14px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .alert-time {
      color: #666;
      min-width: 80px;
    }
    
    .alert-message {
      color: var(--danger-color);
      font-weight: 500;
    }
  }
}

.directive-examples {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.directive-item {
  h4 {
    color: var(--primary-color);
    margin-bottom: 10px;
    text-align: center;
  }
  
  .directive-demo {
    min-height: 120px;
    background: #f8f9fa;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: #6c757d;
    position: relative;
    overflow: hidden;
  }
}

.code-preview {
  margin-top: 15px;
  
  details {
    summary {
      cursor: pointer;
      padding: 8px;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 4px;
      font-weight: 500;
    }
    
    pre {
      margin-top: 10px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 6px;
      overflow-x: auto;
      
      code {
        font-family: 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.4;
      }
    }
  }
}

.mt-30 {
  margin-top: 30px;
}

@media (max-width: 768px) {
  .composite-controls {
    grid-template-columns: 1fr;
  }
  
  .directive-examples {
    grid-template-columns: 1fr;
  }
}
</style>

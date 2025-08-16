<script>
import { createWatermark, destroyWatermark } from '@ldesign/watermark'

// 水印混入
const watermarkMixin = {
  data() {
    return {
      watermarkInstance: null,
      watermarkStatus: 'inactive',
    }
  },
  methods: {
    async createWatermarkWithMixin(container, config) {
      if (this.watermarkInstance) {
        await this.destroyWatermarkWithMixin()
      }

      try {
        this.watermarkInstance = await createWatermark(container, config)
        this.watermarkStatus = 'active'
      }
      catch (error) {
        console.error('Failed to create watermark:', error)
        this.watermarkStatus = 'error'
      }
    },

    async destroyWatermarkWithMixin() {
      if (this.watermarkInstance) {
        try {
          await destroyWatermark(this.watermarkInstance)
          this.watermarkInstance = null
          this.watermarkStatus = 'inactive'
        }
        catch (error) {
          console.error('Failed to destroy watermark:', error)
        }
      }
    },
  },

  beforeUnmount() {
    this.destroyWatermarkWithMixin()
  },
}

export default {
  name: 'OptionsExamples',

  mixins: [watermarkMixin],

  data() {
    return {
      // 基础配置
      basicConfig: {
        text: 'Options API',
        fontSize: 16,
      },
      basicInstance: null,

      // 生命周期状态
      lifecycleStatus: 'created',
      watermarkStatus: 'inactive',
      mountedTime: null,
      lifecycleInstance: null,

      // 用户信息
      userInfo: {
        name: 'John Doe',
        department: 'IT部门',
      },
      computedInstance: null,

      // 主题配置
      themeConfig: {
        color: 'blue',
        mode: 'light',
      },
      watchInstance: null,

      // 混入实例
      mixinInstanceA: null,
      mixinInstanceB: null,
    }
  },

  computed: {
    computedWatermarkText() {
      if (!this.userInfo.name && !this.userInfo.department) {
        return '请输入用户信息'
      }
      return `${this.userInfo.name} - ${this.userInfo.department}`
    },

    themeWatermarkStyle() {
      const colorMap = {
        blue: '#2196F3',
        green: '#4CAF50',
        red: '#F44336',
        purple: '#9C27B0',
      }

      const baseColor = colorMap[this.themeConfig.color]
      const opacity = this.themeConfig.mode === 'light' ? 0.15 : 0.3

      return {
        color: baseColor,
        opacity,
        fontSize: this.themeConfig.mode === 'dark' ? 18 : 16,
      }
    },

    mixinStatusA() {
      return this.mixinInstanceA ? 'active' : 'inactive'
    },

    mixinStatusB() {
      return this.mixinInstanceB ? 'active' : 'inactive'
    },
  },

  // 代码示例
  computed: {
    basicCode() {
      return `export default {
  data() {
    return {
      config: { text: 'Options API', fontSize: 16 },
      instance: null
    }
  },
  
  watch: {
    config: {
      handler() {
        if (this.instance) {
          this.createWatermark()
        }
      },
      deep: true
    }
  },
  
  methods: {
    async createWatermark() {
      this.instance = await createWatermark(this.$refs.container, {
        content: this.config.text,
        style: { fontSize: this.config.fontSize }
      })
    }
  }
}`
    },

    lifecycleCode() {
      return `export default {
  data() {
    return {
      instance: null,
      status: 'inactive'
    }
  },
  
  async mounted() {
    this.instance = await createWatermark(this.$refs.container, {
      content: 'Lifecycle Watermark'
    })
    this.status = 'active'
  },
  
  beforeUnmount() {
    if (this.instance) {
      destroyWatermark(this.instance)
    }
  }
}`
    },

    computedCode() {
      return `export default {
  data() {
    return {
      userInfo: { name: 'John', department: 'IT' }
    }
  },
  
  computed: {
    watermarkText() {
      return \`\${this.userInfo.name} - \${this.userInfo.department}\`
    }
  },
  
  watch: {
    watermarkText() {
      this.updateWatermark()
    }
  },
  
  methods: {
    async updateWatermark() {
      this.instance = await createWatermark(this.$refs.container, {
        content: this.watermarkText
      })
    }
  }
}`
    },

    watchCode() {
      return `export default {
  data() {
    return {
      theme: { color: 'blue', mode: 'light' }
    }
  },
  
  computed: {
    watermarkStyle() {
      return {
        color: this.getColor(this.theme.color),
        opacity: this.theme.mode === 'light' ? 0.15 : 0.3
      }
    }
  },
  
  watch: {
    theme: {
      handler() {
        this.updateWatermark()
      },
      deep: true
    }
  }
}`
    },

    mixinCode() {
      return `// watermarkMixin.js
export const watermarkMixin = {
  data() {
    return {
      watermarkInstance: null,
      watermarkStatus: 'inactive'
    }
  },
  
  methods: {
    async createWatermarkWithMixin(container, config) {
      this.watermarkInstance = await createWatermark(container, config)
      this.watermarkStatus = 'active'
    },
    
    async destroyWatermarkWithMixin() {
      if (this.watermarkInstance) {
        await destroyWatermark(this.watermarkInstance)
        this.watermarkInstance = null
        this.watermarkStatus = 'inactive'
      }
    }
  },
  
  beforeUnmount() {
    this.destroyWatermarkWithMixin()
  }
}

// 使用混入
export default {
  mixins: [watermarkMixin],
  // ...
}`
    },
  },

  watch: {
    // 监听基础配置变化
    basicConfig: {
      handler() {
        if (this.basicInstance) {
          this.createBasicWatermark()
        }
      },
      deep: true,
    },

    // 监听计算属性变化
    computedWatermarkText() {
      if (this.computedInstance) {
        this.updateComputedWatermark()
      }
    },

    // 监听主题配置变化
    themeConfig: {
      handler() {
        this.updateThemeWatermark()
      },
      deep: true,
    },
  },

  async mounted() {
    this.lifecycleStatus = 'mounted'
    this.mountedTime = new Date().toLocaleTimeString()

    // 自动创建所有示例水印
    await this.createBasicWatermark()
    await this.createLifecycleWatermark()
    await this.updateComputedWatermark()
    await this.updateThemeWatermark()
    await this.createMixinWatermarkA()
    await this.createMixinWatermarkB()
  },

  beforeUnmount() {
    this.lifecycleStatus = 'beforeUnmount'

    // 清理所有水印实例
    this.destroyAllWatermarks()
  },

  methods: {
    // 基础水印方法
    async createBasicWatermark() {
      if (!this.$refs.basicContainer)
        return

      if (this.basicInstance) {
        await destroyWatermark(this.basicInstance)
      }

      try {
        this.basicInstance = await createWatermark(this.$refs.basicContainer, {
          content: this.basicConfig.text,
          style: {
            fontSize: this.basicConfig.fontSize,
            color: 'rgba(102, 126, 234, 0.2)',
          },
        })
      }
      catch (error) {
        console.error('Failed to create basic watermark:', error)
      }
    },

    async destroyBasicWatermark() {
      if (this.basicInstance) {
        await destroyWatermark(this.basicInstance)
        this.basicInstance = null
      }
    },

    // 生命周期水印方法
    async createLifecycleWatermark() {
      if (!this.$refs.lifecycleContainer)
        return

      try {
        this.lifecycleInstance = await createWatermark(
          this.$refs.lifecycleContainer,
          {
            content: 'Lifecycle Watermark',
            style: {
              fontSize: 14,
              color: 'rgba(76, 175, 80, 0.2)',
            },
          },
        )
        this.watermarkStatus = 'active'
      }
      catch (error) {
        console.error('Failed to create lifecycle watermark:', error)
        this.watermarkStatus = 'error'
      }
    },

    // 计算属性水印方法
    async updateComputedWatermark() {
      if (!this.$refs.computedContainer)
        return

      if (this.computedInstance) {
        await destroyWatermark(this.computedInstance)
      }

      try {
        this.computedInstance = await createWatermark(
          this.$refs.computedContainer,
          {
            content: this.computedWatermarkText,
            style: {
              fontSize: 16,
              color: 'rgba(255, 152, 0, 0.2)',
            },
          },
        )
      }
      catch (error) {
        console.error('Failed to update computed watermark:', error)
      }
    },

    // 主题水印方法
    async updateThemeWatermark() {
      if (!this.$refs.watchContainer)
        return

      if (this.watchInstance) {
        await destroyWatermark(this.watchInstance)
      }

      try {
        this.watchInstance = await createWatermark(this.$refs.watchContainer, {
          content: `${this.themeConfig.color} ${this.themeConfig.mode}`,
          style: this.themeWatermarkStyle,
        })
      }
      catch (error) {
        console.error('Failed to update theme watermark:', error)
      }
    },

    // 混入水印方法
    async createMixinWatermarkA() {
      if (!this.$refs.mixinContainerA)
        return

      if (this.mixinInstanceA) {
        await destroyWatermark(this.mixinInstanceA)
      }

      try {
        this.mixinInstanceA = await createWatermark(
          this.$refs.mixinContainerA,
          {
            content: 'Mixin A',
            style: {
              fontSize: 14,
              color: 'rgba(233, 30, 99, 0.2)',
            },
          },
        )
      }
      catch (error) {
        console.error('Failed to create mixin watermark A:', error)
      }
    },

    async destroyMixinWatermarkA() {
      if (this.mixinInstanceA) {
        await destroyWatermark(this.mixinInstanceA)
        this.mixinInstanceA = null
      }
    },

    async createMixinWatermarkB() {
      if (!this.$refs.mixinContainerB)
        return

      if (this.mixinInstanceB) {
        await destroyWatermark(this.mixinInstanceB)
      }

      try {
        this.mixinInstanceB = await createWatermark(
          this.$refs.mixinContainerB,
          {
            content: 'Mixin B',
            style: {
              fontSize: 14,
              color: 'rgba(63, 81, 181, 0.2)',
            },
          },
        )
      }
      catch (error) {
        console.error('Failed to create mixin watermark B:', error)
      }
    },

    async destroyMixinWatermarkB() {
      if (this.mixinInstanceB) {
        await destroyWatermark(this.mixinInstanceB)
        this.mixinInstanceB = null
      }
    },

    // 清理所有水印
    async destroyAllWatermarks() {
      const instances = [
        this.basicInstance,
        this.lifecycleInstance,
        this.computedInstance,
        this.watchInstance,
        this.mixinInstanceA,
        this.mixinInstanceB,
      ]

      for (const instance of instances) {
        if (instance) {
          try {
            await destroyWatermark(instance)
          }
          catch (error) {
            console.error('Failed to destroy watermark:', error)
          }
        }
      }
    },
  },
}
</script>

<template>
  <div class="options-examples">
    <h2 class="section-title">
      ⚙️ Options API 示例
    </h2>
    <p class="section-desc">
      展示如何使用传统的 Options API 管理水印
    </p>

    <div class="grid grid-2">
      <!-- 基础 Options API -->
      <div class="card glass">
        <h3>基础 Options API 用法</h3>
        <div class="form-group">
          <label>水印文字</label>
          <input v-model="basicConfig.text" type="text">
        </div>
        <div class="form-group">
          <label>字体大小: {{ basicConfig.fontSize }}px</label>
          <input
            v-model="basicConfig.fontSize"
            type="range"
            min="12"
            max="32"
          >
        </div>
        <div ref="basicContainer" class="demo-container">
          <div class="demo-content">
            <p>Options API 基础示例</p>
            <p>使用传统的 data、methods、watch</p>
          </div>
        </div>
        <div class="controls">
          <button class="btn btn-primary" @click="createBasicWatermark">
            创建水印
          </button>
          <button class="btn btn-danger" @click="destroyBasicWatermark">
            销毁水印
          </button>
        </div>
        <div class="code-preview">
          <details>
            <summary>查看代码</summary>
            <pre><code>{{ basicCode }}</code></pre>
          </details>
        </div>
      </div>

      <!-- 生命周期钩子 -->
      <div class="card glass">
        <h3>生命周期钩子</h3>
        <div class="lifecycle-info">
          <p>组件状态: {{ lifecycleStatus }}</p>
          <p>水印状态: {{ watermarkStatus }}</p>
          <p>挂载时间: {{ mountedTime }}</p>
        </div>
        <div ref="lifecycleContainer" class="demo-container">
          <div class="demo-content">
            <p>生命周期钩子示例</p>
            <p>在 mounted 时自动创建水印</p>
            <p>在 beforeUnmount 时自动清理</p>
          </div>
        </div>
        <div class="code-preview">
          <details>
            <summary>查看代码</summary>
            <pre><code>{{ lifecycleCode }}</code></pre>
          </details>
        </div>
      </div>

      <!-- 计算属性 -->
      <div class="card glass">
        <h3>计算属性</h3>
        <div class="form-group">
          <label>用户名</label>
          <input v-model="userInfo.name" type="text" placeholder="输入用户名">
        </div>
        <div class="form-group">
          <label>部门</label>
          <input
            v-model="userInfo.department"
            type="text"
            placeholder="输入部门"
          >
        </div>
        <div class="info-display">
          <p>计算的水印内容: {{ computedWatermarkText }}</p>
        </div>
        <div ref="computedContainer" class="demo-container">
          <div class="demo-content">
            <p>计算属性示例</p>
            <p>水印内容根据用户信息自动计算</p>
          </div>
        </div>
        <div class="controls">
          <button class="btn btn-primary" @click="updateComputedWatermark">
            更新水印
          </button>
        </div>
        <div class="code-preview">
          <details>
            <summary>查看代码</summary>
            <pre><code>{{ computedCode }}</code></pre>
          </details>
        </div>
      </div>

      <!-- 侦听器 -->
      <div class="card glass">
        <h3>侦听器 (Watch)</h3>
        <div class="form-group">
          <label>主题色</label>
          <select v-model="themeConfig.color">
            <option value="blue">
              蓝色
            </option>
            <option value="green">
              绿色
            </option>
            <option value="red">
              红色
            </option>
            <option value="purple">
              紫色
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>模式</label>
          <select v-model="themeConfig.mode">
            <option value="light">
              浅色
            </option>
            <option value="dark">
              深色
            </option>
          </select>
        </div>
        <div ref="watchContainer" class="demo-container">
          <div class="demo-content">
            <p>侦听器示例</p>
            <p>主题变化时自动更新水印样式</p>
          </div>
        </div>
        <div class="code-preview">
          <details>
            <summary>查看代码</summary>
            <pre><code>{{ watchCode }}</code></pre>
          </details>
        </div>
      </div>
    </div>

    <!-- 混入示例 -->
    <div class="card glass mt-30">
      <h3>🔀 混入 (Mixin) 示例</h3>
      <p>使用混入来复用水印逻辑</p>

      <div class="grid grid-2">
        <div>
          <h4>混入组件 A</h4>
          <div ref="mixinContainerA" class="demo-container">
            <div class="demo-content">
              <p>使用 watermarkMixin</p>
              <p>状态: {{ mixinStatusA }}</p>
            </div>
          </div>
          <div class="controls">
            <button class="btn btn-primary" @click="createMixinWatermarkA">
              创建
            </button>
            <button class="btn btn-danger" @click="destroyMixinWatermarkA">
              销毁
            </button>
          </div>
        </div>

        <div>
          <h4>混入组件 B</h4>
          <div ref="mixinContainerB" class="demo-container">
            <div class="demo-content">
              <p>使用 watermarkMixin</p>
              <p>状态: {{ mixinStatusB }}</p>
            </div>
          </div>
          <div class="controls">
            <button class="btn btn-primary" @click="createMixinWatermarkB">
              创建
            </button>
            <button class="btn btn-danger" @click="destroyMixinWatermarkB">
              销毁
            </button>
          </div>
        </div>
      </div>

      <div class="code-preview">
        <details>
          <summary>查看混入代码</summary>
          <pre><code>{{ mixinCode }}</code></pre>
        </details>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.options-examples {
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

.demo-container {
  position: relative;
  min-height: 150px;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 15px 0;
  overflow: hidden;

  .demo-content {
    padding: 20px;
    text-align: center;
    color: #6c757d;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 150px;
  }
}

.lifecycle-info,
.info-display {
  background: rgba(0, 0, 0, 0.05);
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;

  p {
    margin-bottom: 5px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 15px 0;
  flex-wrap: wrap;
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

h4 {
  color: var(--primary-color);
  margin-bottom: 15px;
  text-align: center;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: center;
  }
}
</style>

<template>
  <div class="performance-demo">
    <div class="demo-header">
      <h1 class="demo-title">⚡ 性能演示</h1>
      <p class="demo-subtitle">展示模板系统的性能优化特性</p>
    </div>

    <div class="demo-content">
      <!-- 性能监控面板 -->
      <div class="performance-panel">
        <h2 class="panel-title">实时性能监控</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">🚀</div>
            <div class="metric-content">
              <div class="metric-value">{{ loadTime }}ms</div>
              <div class="metric-label">模板加载时间</div>
            </div>
          </div>
          
          <div class="metric-card">
            <div class="metric-icon">🔄</div>
            <div class="metric-content">
              <div class="metric-value">{{ switchTime }}ms</div>
              <div class="metric-label">切换时间</div>
            </div>
          </div>
          
          <div class="metric-card">
            <div class="metric-icon">💾</div>
            <div class="metric-content">
              <div class="metric-value">{{ cacheHitRate }}%</div>
              <div class="metric-label">缓存命中率</div>
            </div>
          </div>
          
          <div class="metric-card">
            <div class="metric-icon">📊</div>
            <div class="metric-content">
              <div class="metric-value">{{ memoryUsage }}MB</div>
              <div class="metric-label">内存使用</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 性能测试区域 -->
      <div class="test-section">
        <h2 class="section-title">性能测试</h2>
        
        <!-- 批量加载测试 -->
        <div class="test-card">
          <h3 class="test-title">批量模板加载测试</h3>
          <p class="test-description">测试同时加载多个模板的性能表现</p>
          
          <div class="test-controls">
            <div class="control-group">
              <label class="control-label">模板数量:</label>
              <input v-model.number="batchSize" type="number" min="1" max="50" class="control-input" />
            </div>
            
            <button @click="runBatchLoadTest" :disabled="isTesting" class="test-btn">
              {{ isTesting ? '测试中...' : '开始批量加载测试' }}
            </button>
          </div>
          
          <div v-if="batchTestResults.length > 0" class="test-results">
            <h4>测试结果:</h4>
            <div class="results-grid">
              <div class="result-item">
                <span class="result-label">总耗时:</span>
                <span class="result-value">{{ batchTestResults[0]?.totalTime }}ms</span>
              </div>
              <div class="result-item">
                <span class="result-label">平均耗时:</span>
                <span class="result-value">{{ batchTestResults[0]?.averageTime }}ms</span>
              </div>
              <div class="result-item">
                <span class="result-label">成功率:</span>
                <span class="result-value">{{ batchTestResults[0]?.successRate }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 切换性能测试 -->
        <div class="test-card">
          <h3 class="test-title">模板切换性能测试</h3>
          <p class="test-description">测试快速连续切换模板的性能</p>
          
          <div class="test-controls">
            <div class="control-group">
              <label class="control-label">切换次数:</label>
              <input v-model.number="switchCount" type="number" min="1" max="100" class="control-input" />
            </div>
            
            <button @click="runSwitchTest" :disabled="isTesting" class="test-btn">
              {{ isTesting ? '测试中...' : '开始切换测试' }}
            </button>
          </div>
          
          <div v-if="switchTestResults.length > 0" class="test-results">
            <h4>测试结果:</h4>
            <div class="results-grid">
              <div class="result-item">
                <span class="result-label">总耗时:</span>
                <span class="result-value">{{ switchTestResults[0]?.totalTime }}ms</span>
              </div>
              <div class="result-item">
                <span class="result-label">平均切换时间:</span>
                <span class="result-value">{{ switchTestResults[0]?.averageTime }}ms</span>
              </div>
              <div class="result-item">
                <span class="result-label">最快切换:</span>
                <span class="result-value">{{ switchTestResults[0]?.minTime }}ms</span>
              </div>
              <div class="result-item">
                <span class="result-label">最慢切换:</span>
                <span class="result-value">{{ switchTestResults[0]?.maxTime }}ms</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 内存使用测试 -->
        <div class="test-card">
          <h3 class="test-title">内存使用测试</h3>
          <p class="test-description">监控模板加载和切换过程中的内存使用情况</p>
          
          <div class="test-controls">
            <button @click="runMemoryTest" :disabled="isTesting" class="test-btn">
              {{ isTesting ? '监控中...' : '开始内存监控' }}
            </button>
            
            <button @click="clearMemoryTest" class="test-btn secondary">
              清除监控数据
            </button>
          </div>
          
          <div v-if="memoryTestResults.length > 0" class="memory-chart">
            <h4>内存使用趋势:</h4>
            <div class="chart-container">
              <svg class="memory-chart-svg" viewBox="0 0 400 200">
                <defs>
                  <linearGradient id="memoryGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#667eea;stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:#667eea;stop-opacity:0" />
                  </linearGradient>
                </defs>
                
                <!-- 网格线 -->
                <g class="grid">
                  <line v-for="i in 5" :key="`h-${i}`" 
                        :x1="0" :y1="i * 40" :x2="400" :y2="i * 40" 
                        stroke="#f0f0f0" stroke-width="1" />
                  <line v-for="i in 9" :key="`v-${i}`" 
                        :x1="i * 50" :y1="0" :x2="i * 50" :y2="200" 
                        stroke="#f0f0f0" stroke-width="1" />
                </g>
                
                <!-- 数据区域 -->
                <path :d="memoryChartPath" fill="url(#memoryGradient)" />
                
                <!-- 数据线 -->
                <path :d="memoryChartPath" fill="none" stroke="#667eea" stroke-width="2" />
                
                <!-- 数据点 -->
                <circle v-for="(point, index) in memoryChartPoints" :key="index"
                        :cx="point.x" :cy="point.y" r="3" 
                        fill="#667eea" stroke="#fff" stroke-width="1" />
              </svg>
            </div>
            
            <div class="memory-stats">
              <div class="stat-item">
                <span class="stat-label">当前内存:</span>
                <span class="stat-value">{{ currentMemory }}MB</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">峰值内存:</span>
                <span class="stat-value">{{ peakMemory }}MB</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">平均内存:</span>
                <span class="stat-value">{{ averageMemory }}MB</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 优化建议 -->
      <div class="optimization-section">
        <h2 class="section-title">性能优化建议</h2>
        <div class="suggestions-grid">
          <div class="suggestion-card">
            <div class="suggestion-icon">🚀</div>
            <div class="suggestion-content">
              <h4 class="suggestion-title">懒加载优化</h4>
              <p class="suggestion-description">
                使用 defineAsyncComponent 实现模板的按需加载，减少初始包大小。
              </p>
            </div>
          </div>
          
          <div class="suggestion-card">
            <div class="suggestion-icon">💾</div>
            <div class="suggestion-content">
              <h4 class="suggestion-title">缓存策略</h4>
              <p class="suggestion-description">
                启用模板缓存，避免重复加载相同的模板组件。
              </p>
            </div>
          </div>
          
          <div class="suggestion-card">
            <div class="suggestion-icon">🔄</div>
            <div class="suggestion-content">
              <h4 class="suggestion-title">预加载机制</h4>
              <p class="suggestion-description">
                预加载常用模板，提升用户体验和切换速度。
              </p>
            </div>
          </div>
          
          <div class="suggestion-card">
            <div class="suggestion-icon">📊</div>
            <div class="suggestion-content">
              <h4 class="suggestion-title">虚拟滚动</h4>
              <p class="suggestion-description">
                在模板列表较多时使用虚拟滚动，优化渲染性能。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

// 状态管理
const loadTime = ref(0)
const switchTime = ref(0)
const cacheHitRate = ref(85)
const memoryUsage = ref(12.5)
const isTesting = ref(false)

// 测试配置
const batchSize = ref(10)
const switchCount = ref(20)

// 测试结果
const batchTestResults = ref<any[]>([])
const switchTestResults = ref<any[]>([])
const memoryTestResults = ref<number[]>([])

// 内存监控
const currentMemory = ref(12.5)
const peakMemory = ref(15.2)
const averageMemory = ref(13.8)

// 计算属性
const memoryChartPoints = computed(() => {
  return memoryTestResults.value.map((memory, index) => ({
    x: (index / (memoryTestResults.value.length - 1)) * 400,
    y: 200 - (memory / 20) * 200
  }))
})

const memoryChartPath = computed(() => {
  if (memoryChartPoints.value.length === 0) return ''
  
  let path = `M ${memoryChartPoints.value[0].x} ${memoryChartPoints.value[0].y}`
  for (let i = 1; i < memoryChartPoints.value.length; i++) {
    path += ` L ${memoryChartPoints.value[i].x} ${memoryChartPoints.value[i].y}`
  }
  path += ` L ${memoryChartPoints.value[memoryChartPoints.value.length - 1].x} 200 L ${memoryChartPoints.value[0].x} 200 Z`
  return path
})

// 测试函数
const runBatchLoadTest = async () => {
  isTesting.value = true
  const startTime = Date.now()
  let successCount = 0
  
  try {
    // 模拟批量加载
    const promises = Array.from({ length: batchSize.value }, async (_, index) => {
      const delay = Math.random() * 100 + 50
      await new Promise(resolve => setTimeout(resolve, delay))
      successCount++
      return { index, loadTime: delay }
    })
    
    await Promise.all(promises)
    
    const totalTime = Date.now() - startTime
    const averageTime = totalTime / batchSize.value
    const successRate = (successCount / batchSize.value) * 100
    
    batchTestResults.value = [{
      totalTime,
      averageTime: Math.round(averageTime),
      successRate: Math.round(successRate)
    }]
    
  } catch (error) {
    console.error('Batch load test failed:', error)
  } finally {
    isTesting.value = false
  }
}

const runSwitchTest = async () => {
  isTesting.value = true
  const startTime = Date.now()
  const switchTimes: number[] = []
  
  try {
    for (let i = 0; i < switchCount.value; i++) {
      const switchStart = Date.now()
      
      // 模拟模板切换
      const delay = Math.random() * 50 + 20
      await new Promise(resolve => setTimeout(resolve, delay))
      
      const switchEnd = Date.now()
      switchTimes.push(switchEnd - switchStart)
    }
    
    const totalTime = Date.now() - startTime
    const averageTime = switchTimes.reduce((a, b) => a + b, 0) / switchTimes.length
    const minTime = Math.min(...switchTimes)
    const maxTime = Math.max(...switchTimes)
    
    switchTestResults.value = [{
      totalTime,
      averageTime: Math.round(averageTime),
      minTime,
      maxTime
    }]
    
  } catch (error) {
    console.error('Switch test failed:', error)
  } finally {
    isTesting.value = false
  }
}

const runMemoryTest = () => {
  if (isTesting.value) return
  
  isTesting.value = true
  memoryTestResults.value = []
  
  const interval = setInterval(() => {
    // 模拟内存使用数据
    const memory = 10 + Math.random() * 10
    memoryTestResults.value.push(memory)
    currentMemory.value = memory
    
    if (memory > peakMemory.value) {
      peakMemory.value = memory
    }
    
    averageMemory.value = memoryTestResults.value.reduce((a, b) => a + b, 0) / memoryTestResults.value.length
    
    if (memoryTestResults.value.length >= 50) {
      clearInterval(interval)
      isTesting.value = false
    }
  }, 200)
}

const clearMemoryTest = () => {
  memoryTestResults.value = []
  currentMemory.value = 12.5
  peakMemory.value = 15.2
  averageMemory.value = 13.8
}

// 生命周期
let performanceInterval: number

onMounted(() => {
  // 模拟实时性能数据更新
  performanceInterval = window.setInterval(() => {
    loadTime.value = Math.floor(Math.random() * 100) + 50
    switchTime.value = Math.floor(Math.random() * 50) + 20
    cacheHitRate.value = Math.floor(Math.random() * 20) + 80
    memoryUsage.value = Math.floor(Math.random() * 5) + 10
  }, 2000)
})

onUnmounted(() => {
  if (performanceInterval) {
    clearInterval(performanceInterval)
  }
})
</script>

<style lang="less" scoped>
.performance-demo {
  min-height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.demo-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;

  .demo-title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .demo-subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
  }
}

.demo-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.performance-panel {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;

  .panel-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 1.5rem;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;

    .metric-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;

      .metric-icon {
        font-size: 2rem;
      }

      .metric-content {
        .metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 0.25rem;
        }

        .metric-label {
          font-size: 0.9rem;
          color: #7f8c8d;
        }
      }
    }
  }
}

.test-section {
  .section-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 1.5rem;
  }

  .test-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    margin-bottom: 1.5rem;

    .test-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .test-description {
      color: #7f8c8d;
      margin-bottom: 1.5rem;
    }

    .test-controls {
      display: flex;
      align-items: end;
      gap: 1rem;
      margin-bottom: 1.5rem;

      .control-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .control-label {
          font-weight: 500;
          color: #34495e;
          font-size: 0.9rem;
        }

        .control-input {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.9rem;
          width: 100px;

          &:focus {
            outline: none;
            border-color: #667eea;
          }
        }
      }

      .test-btn {
        padding: 0.75rem 1.5rem;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: background 0.3s ease;

        &:hover:not(:disabled) {
          background: #5a6fd8;
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        &.secondary {
          background: #95a5a6;

          &:hover:not(:disabled) {
            background: #7f8c8d;
          }
        }
      }
    }

    .test-results {
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #52c41a;

      h4 {
        color: #2c3e50;
        margin-bottom: 1rem;
      }

      .results-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;

        .result-item {
          display: flex;
          justify-content: space-between;

          .result-label {
            font-weight: 500;
            color: #7f8c8d;
          }

          .result-value {
            font-weight: 600;
            color: #2c3e50;
          }
        }
      }
    }

    .memory-chart {
      .chart-container {
        margin: 1rem 0;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;

        .memory-chart-svg {
          width: 100%;
          height: 200px;
        }
      }

      .memory-stats {
        display: flex;
        justify-content: space-around;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;

        .stat-item {
          text-align: center;

          .stat-label {
            display: block;
            font-size: 0.8rem;
            color: #7f8c8d;
            margin-bottom: 0.25rem;
          }

          .stat-value {
            font-size: 1.2rem;
            font-weight: 600;
            color: #2c3e50;
          }
        }
      }
    }
  }
}

.optimization-section {
  .section-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 1.5rem;
  }

  .suggestions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;

    .suggestion-card {
      display: flex;
      gap: 1rem;
      padding: 1.5rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

      .suggestion-icon {
        font-size: 2rem;
        flex-shrink: 0;
      }

      .suggestion-content {
        .suggestion-title {
          font-size: 1rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        .suggestion-description {
          color: #7f8c8d;
          line-height: 1.5;
          font-size: 0.9rem;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .demo-content {
    padding: 1rem;
  }

  .test-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .suggestions-grid {
    grid-template-columns: 1fr;
  }

  .memory-stats {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>

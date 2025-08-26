import { defineComponent, ref, onMounted } from 'vue'
import { useEngine } from '@ldesign/engine/vue'
import { BatchProcessor, ObjectPool, PerformanceMonitor, debounce, throttle } from '@ldesign/engine'
import './Optimization.less'

export default defineComponent({
  name: 'Optimization',
  setup() {
    const engine = useEngine()
    
    // 批处理器演示
    const batchResults = ref<string[]>([])
    const batchProcessor = new BatchProcessor<string>({
      batchSize: 5,
      flushInterval: 2000,
      processor: async (items: string[]) => {
        const result = `批处理 ${items.length} 个项目: ${items.join(', ')}`
        batchResults.value.push(result)
        return items
      }
    })

    // 对象池演示
    const poolResults = ref<string[]>([])
    const objectPool = new ObjectPool<{ id: number; data: string }>({
      create: () => ({ id: Math.random(), data: '' }),
      reset: (obj) => { obj.data = '' },
      maxSize: 10
    })

    // 性能监控演示
    const performanceResults = ref<string[]>([])
    const performanceMonitor = new PerformanceMonitor()

    // 防抖和节流演示
    const debounceResults = ref<string[]>([])
    const throttleResults = ref<string[]>([])
    
    const debouncedFunction = debounce((message: string) => {
      debounceResults.value.push(`防抖执行: ${message} - ${new Date().toLocaleTimeString()}`)
    }, 1000)

    const throttledFunction = throttle((message: string) => {
      throttleResults.value.push(`节流执行: ${message} - ${new Date().toLocaleTimeString()}`)
    }, 1000)

    // 批处理器演示函数
    function addToBatch() {
      const item = `项目-${Date.now()}`
      batchProcessor.add(item)
      
      if (engine?.notifications) {
        engine.notifications.show({
          title: '📦 批处理器',
          message: `添加项目: ${item}`,
          type: 'info',
          duration: 2000,
        })
      }
    }

    function flushBatch() {
      batchProcessor.flush()
      
      if (engine?.notifications) {
        engine.notifications.show({
          title: '🚀 批处理器',
          message: '手动刷新批处理队列',
          type: 'success',
          duration: 2000,
        })
      }
    }

    // 对象池演示函数
    function borrowFromPool() {
      const obj = objectPool.borrow()
      obj.data = `数据-${Date.now()}`
      poolResults.value.push(`借用对象: ID=${obj.id.toFixed(6)}, Data=${obj.data}`)
      
      // 模拟使用后归还
      setTimeout(() => {
        objectPool.return(obj)
        poolResults.value.push(`归还对象: ID=${obj.id.toFixed(6)}`)
      }, 2000)
    }

    function clearPool() {
      objectPool.clear()
      poolResults.value.push('清空对象池')
    }

    // 性能监控演示函数
    async function runPerformanceTest() {
      const testFunction = async () => {
        // 模拟一些计算
        let sum = 0
        for (let i = 0; i < 1000000; i++) {
          sum += Math.random()
        }
        return sum
      }

      const result = await performanceMonitor.measure('计算测试', testFunction)
      performanceResults.value.push(`执行时间: ${result.duration.toFixed(2)}ms, 结果: ${result.result.toFixed(2)}`)
      
      const stats = performanceMonitor.getStats('计算测试')
      if (stats) {
        performanceResults.value.push(`统计信息: 平均${stats.average.toFixed(2)}ms, 最小${stats.min.toFixed(2)}ms, 最大${stats.max.toFixed(2)}ms`)
      }
    }

    // 防抖演示函数
    function triggerDebounce() {
      debouncedFunction(`触发-${Date.now()}`)
    }

    // 节流演示函数
    function triggerThrottle() {
      throttledFunction(`触发-${Date.now()}`)
    }

    // 清空结果
    function clearResults(type: string) {
      switch (type) {
        case 'batch':
          batchResults.value = []
          break
        case 'pool':
          poolResults.value = []
          break
        case 'performance':
          performanceResults.value = []
          performanceMonitor.clear()
          break
        case 'debounce':
          debounceResults.value = []
          break
        case 'throttle':
          throttleResults.value = []
          break
      }
    }

    onMounted(() => {
      if (engine?.notifications) {
        engine.notifications.show({
          title: '🚀 性能优化工具',
          message: '探索批处理器、对象池、性能监控等优化工具',
          type: 'info',
          duration: 4000,
        })
      }
    })

    return () => (
      <div class="optimization">
        <div class="page-header">
          <h1 class="page-title">🚀 性能优化工具</h1>
          <p class="page-description">
            展示 Engine 提供的各种性能优化工具，包括批处理器、对象池、性能监控、防抖节流等
          </p>
        </div>

        <div class="optimization-grid">
          {/* 批处理器 */}
          <div class="optimization-card">
            <div class="card-header">
              <h3 class="card-title">📦 批处理器 (BatchProcessor)</h3>
              <p class="card-description">
                将多个操作合并为批量操作，减少频繁的处理开销
              </p>
            </div>
            <div class="card-content">
              <div class="demo-controls">
                <button class="btn btn-primary" onClick={addToBatch}>
                  添加到批处理
                </button>
                <button class="btn btn-secondary" onClick={flushBatch}>
                  手动刷新
                </button>
                <button class="btn btn-outline" onClick={() => clearResults('batch')}>
                  清空结果
                </button>
              </div>
              <div class="results-container">
                <h4>批处理结果:</h4>
                <div class="results-list">
                  {batchResults.value.map((result, index) => (
                    <div key={index} class="result-item">
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 对象池 */}
          <div class="optimization-card">
            <div class="card-header">
              <h3 class="card-title">🏊 对象池 (ObjectPool)</h3>
              <p class="card-description">
                重用对象实例，减少垃圾回收压力和内存分配开销
              </p>
            </div>
            <div class="card-content">
              <div class="demo-controls">
                <button class="btn btn-primary" onClick={borrowFromPool}>
                  借用对象
                </button>
                <button class="btn btn-secondary" onClick={clearPool}>
                  清空池
                </button>
                <button class="btn btn-outline" onClick={() => clearResults('pool')}>
                  清空结果
                </button>
              </div>
              <div class="results-container">
                <h4>对象池操作:</h4>
                <div class="results-list">
                  {poolResults.value.map((result, index) => (
                    <div key={index} class="result-item">
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 性能监控 */}
          <div class="optimization-card">
            <div class="card-header">
              <h3 class="card-title">📊 性能监控 (PerformanceMonitor)</h3>
              <p class="card-description">
                监控函数执行性能，收集统计数据
              </p>
            </div>
            <div class="card-content">
              <div class="demo-controls">
                <button class="btn btn-primary" onClick={runPerformanceTest}>
                  运行性能测试
                </button>
                <button class="btn btn-outline" onClick={() => clearResults('performance')}>
                  清空结果
                </button>
              </div>
              <div class="results-container">
                <h4>性能测试结果:</h4>
                <div class="results-list">
                  {performanceResults.value.map((result, index) => (
                    <div key={index} class="result-item">
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 防抖 */}
          <div class="optimization-card">
            <div class="card-header">
              <h3 class="card-title">⏰ 防抖 (Debounce)</h3>
              <p class="card-description">
                延迟执行函数，直到停止触发一段时间后才执行
              </p>
            </div>
            <div class="card-content">
              <div class="demo-controls">
                <button class="btn btn-primary" onClick={triggerDebounce}>
                  触发防抖 (1秒延迟)
                </button>
                <button class="btn btn-outline" onClick={() => clearResults('debounce')}>
                  清空结果
                </button>
              </div>
              <div class="results-container">
                <h4>防抖执行记录:</h4>
                <div class="results-list">
                  {debounceResults.value.map((result, index) => (
                    <div key={index} class="result-item">
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 节流 */}
          <div class="optimization-card">
            <div class="card-header">
              <h3 class="card-title">🚰 节流 (Throttle)</h3>
              <p class="card-description">
                限制函数执行频率，在指定时间间隔内最多执行一次
              </p>
            </div>
            <div class="card-content">
              <div class="demo-controls">
                <button class="btn btn-primary" onClick={triggerThrottle}>
                  触发节流 (1秒间隔)
                </button>
                <button class="btn btn-outline" onClick={() => clearResults('throttle')}>
                  清空结果
                </button>
              </div>
              <div class="results-container">
                <h4>节流执行记录:</h4>
                <div class="results-list">
                  {throttleResults.value.map((result, index) => (
                    <div key={index} class="result-item">
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
})

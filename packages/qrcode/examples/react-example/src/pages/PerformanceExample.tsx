/**
 * React 性能测试示例组件
 * 展示 @ldesign/qrcode 的性能特性
 */

import React, { useState, useRef, useEffect } from 'react'
import { generateQRCode, type QRCodeResult } from '@ldesign/qrcode'

interface TestResult {
  id: string
  name: string
  totalTime: number
  averageTime: number
  minTime: number
  maxTime: number
  cacheHitRate?: number
  memoryUsage?: number
  times?: number[]
  chart?: boolean
}

interface ComparisonData {
  label: string
  value: number
  color: string
}

const PerformanceExample: React.FC = () => {
  // 测试配置
  const [testCount, setTestCount] = useState(50)
  const [testSize, setTestSize] = useState(200)
  const [testTypes, setTestTypes] = useState({
    generation: true,
    cache: false,
    batch: false,
    memory: false
  })

  // 测试状态
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressText, setProgressText] = useState('')
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([])

  // 图表引用
  const comparisonChartRef = useRef<HTMLCanvasElement>(null)
  const chartRefs = useRef<Map<string, HTMLCanvasElement>>(new Map())

  // 计算是否有选中的测试
  const hasSelectedTests = Object.values(testTypes).some(Boolean)

  /**
   * 运行性能测试
   */
  const runPerformanceTest = async (): Promise<void> => {
    if (isRunning) return

    setIsRunning(true)
    setProgress(0)
    setTestResults([])

    const tests = []
    if (testTypes.generation) tests.push('generation')
    if (testTypes.cache) tests.push('cache')
    if (testTypes.batch) tests.push('batch')
    if (testTypes.memory) tests.push('memory')

    try {
      for (let i = 0; i < tests.length; i++) {
        const testType = tests[i]
        setProgressText(`正在执行${getTestName(testType)}...`)
        
        const result = await runSingleTest(testType)
        setTestResults(prev => [...prev, result])
        
        setProgress(((i + 1) / tests.length) * 100)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // 生成对比图表
      setTimeout(generateComparisonChart, 100)
    } catch (error) {
      console.error('性能测试失败:', error)
    } finally {
      setIsRunning(false)
      setProgressText('测试完成')
    }
  }

  /**
   * 运行单个测试
   */
  const runSingleTest = async (testType: string): Promise<TestResult> => {
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0

    switch (testType) {
      case 'generation':
        return await runGenerationTest()
      case 'cache':
        return await runCacheTest()
      case 'batch':
        return await runBatchTest()
      case 'memory':
        return await runMemoryTest(startMemory)
      default:
        throw new Error(`未知测试类型: ${testType}`)
    }
  }

  /**
   * 生成速度测试
   */
  const runGenerationTest = async (): Promise<TestResult> => {
    const times: number[] = []
    const testData = generateTestData(testCount)

    for (const data of testData) {
      const start = performance.now()

      await generateQRCode(data, {
        size: testSize,
        format: 'canvas'
      })

      const end = performance.now()
      times.push(end - start)
    }

    return {
      id: 'generation',
      name: '生成速度测试',
      totalTime: Math.round(times.reduce((a, b) => a + b, 0)),
      averageTime: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
      minTime: Math.round(Math.min(...times)),
      maxTime: Math.round(Math.max(...times)),
      times,
      chart: true
    }
  }

  /**
   * 缓存性能测试
   */
  const runCacheTest = async (): Promise<TestResult> => {
    const testData = 'https://www.ldesign.com/cache-test'
    const times: number[] = []
    let cacheHits = 0

    // 第一次生成（无缓存）
    const start1 = performance.now()
    await generateQRCode(testData, {
      size: testSize,
      format: 'canvas'
    })
    const end1 = performance.now()
    times.push(end1 - start1)

    // 后续生成（模拟缓存效果）
    for (let i = 1; i < testCount; i++) {
      const start = performance.now()

      await generateQRCode(testData, {
        size: testSize,
        format: 'canvas'
      })

      const end = performance.now()
      times.push(end - start)

      // 模拟缓存命中
      if (i > 1) {
        cacheHits++
      }
    }

    return {
      id: 'cache',
      name: '缓存性能测试',
      totalTime: Math.round(times.reduce((a, b) => a + b, 0)),
      averageTime: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
      minTime: Math.round(Math.min(...times)),
      maxTime: Math.round(Math.max(...times)),
      cacheHitRate: Math.round((cacheHits / (testCount - 1)) * 100),
      times,
      chart: true
    }
  }

  /**
   * 批量处理测试
   */
  const runBatchTest = async (): Promise<TestResult> => {
    const testData = generateTestData(testCount)

    const start = performance.now()

    // 批量生成二维码
    const promises = testData.map(data =>
      generateQRCode(data, {
        size: testSize,
        format: 'canvas'
      })
    )

    await Promise.all(promises)

    const end = performance.now()
    const totalTime = end - start

    return {
      id: 'batch',
      name: '批量处理测试',
      totalTime: Math.round(totalTime),
      averageTime: Math.round(totalTime / testCount),
      minTime: 0,
      maxTime: Math.round(totalTime),
      chart: false
    }
  }

  /**
   * 内存使用测试
   */
  const runMemoryTest = async (startMemory: number): Promise<TestResult> => {
    const testData = generateTestData(testCount)
    const results: QRCodeResult[] = []

    for (const data of testData) {
      const result = await generateQRCode(data, {
        size: testSize,
        format: 'canvas'
      })
      results.push(result)
    }

    const endMemory = (performance as any).memory?.usedJSHeapSize || 0
    const memoryUsage = (endMemory - startMemory) / 1024 / 1024 // MB

    // 清理内存
    results.length = 0

    return {
      id: 'memory',
      name: '内存使用测试',
      totalTime: 0,
      averageTime: 0,
      minTime: 0,
      maxTime: 0,
      memoryUsage: Math.round(memoryUsage * 100) / 100,
      chart: false
    }
  }

  /**
   * 生成测试数据
   */
  const generateTestData = (count: number): string[] => {
    const data: string[] = []
    for (let i = 0; i < count; i++) {
      data.push(`https://www.ldesign.com/test-${i}?timestamp=${Date.now()}`)
    }
    return data
  }

  /**
   * 获取测试名称
   */
  const getTestName = (testType: string): string => {
    const names: Record<string, string> = {
      generation: '生成速度测试',
      cache: '缓存性能测试',
      batch: '批量处理测试',
      memory: '内存使用测试'
    }
    return names[testType] || testType
  }

  /**
   * 绘制图表
   */
  const drawChart = (canvas: HTMLCanvasElement, testId: string): void => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const result = testResults.find(r => r.id === testId)
    if (!result || !result.times) return

    // 简单的柱状图绘制
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#722ED1'
    
    const barWidth = canvas.width / result.times.length
    const maxTime = Math.max(...result.times)
    
    result.times.forEach((time: number, index: number) => {
      const barHeight = (time / maxTime) * canvas.height * 0.8
      const x = index * barWidth
      const y = canvas.height - barHeight
      
      ctx.fillRect(x, y, barWidth - 1, barHeight)
    })
  }

  /**
   * 生成对比图表
   */
  const generateComparisonChart = (): void => {
    if (!comparisonChartRef.current) return

    const ctx = comparisonChartRef.current.getContext('2d')
    if (!ctx) return

    // 准备对比数据
    const data = testResults.map((result, index) => ({
      label: result.name,
      value: result.averageTime,
      color: `hsl(${260 + index * 30}, 70%, 60%)`
    }))

    setComparisonData(data)

    // 绘制对比图表
    ctx.clearRect(0, 0, comparisonChartRef.current.width, comparisonChartRef.current.height)
    
    const maxValue = Math.max(...data.map(d => d.value))
    const barWidth = comparisonChartRef.current.width / data.length * 0.8
    const spacing = comparisonChartRef.current.width / data.length * 0.2
    
    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * comparisonChartRef.current!.height * 0.8
      const x = index * (barWidth + spacing) + spacing / 2
      const y = comparisonChartRef.current!.height - barHeight - 20
      
      ctx.fillStyle = item.color
      ctx.fillRect(x, y, barWidth, barHeight)
      
      // 绘制数值标签
      ctx.fillStyle = '#333'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`${item.value}ms`, x + barWidth / 2, y - 5)
    })
  }

  /**
   * 清空结果
   */
  const clearResults = (): void => {
    setTestResults([])
    setComparisonData([])
    setProgress(0)
    setProgressText('')
  }

  // 设置图表引用
  const setChartRef = (el: HTMLCanvasElement | null, id: string): void => {
    if (el) {
      chartRefs.current.set(id, el)
      setTimeout(() => drawChart(el, id), 100)
    }
  }

  return (
    <div className="performance-example">
      <h2 className="section-title">性能测试示例</h2>
      <p className="section-description">
        展示 @ldesign/qrcode 的性能特性，包括生成速度测试、缓存效果、批量处理和内存使用情况。
      </p>

      <div className="grid grid-2">
        {/* 性能测试控制面板 */}
        <div className="card">
          <h3 className="card-title">性能测试</h3>
          
          <div className="test-controls">
            <div className="form-group">
              <label className="form-label">测试数据量</label>
              <select 
                value={testCount} 
                onChange={(e) => setTestCount(Number(e.target.value))}
                className="form-input"
              >
                <option value={10}>10个二维码</option>
                <option value={50}>50个二维码</option>
                <option value={100}>100个二维码</option>
                <option value={200}>200个二维码</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">二维码大小</label>
              <select 
                value={testSize} 
                onChange={(e) => setTestSize(Number(e.target.value))}
                className="form-input"
              >
                <option value={100}>100x100</option>
                <option value={200}>200x200</option>
                <option value={300}>300x300</option>
                <option value={400}>400x400</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">测试类型</label>
              <div className="test-type-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={testTypes.generation}
                    onChange={(e) => setTestTypes(prev => ({ ...prev, generation: e.target.checked }))}
                    className="form-checkbox"
                  />
                  生成速度测试
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={testTypes.cache}
                    onChange={(e) => setTestTypes(prev => ({ ...prev, cache: e.target.checked }))}
                    className="form-checkbox"
                  />
                  缓存性能测试
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={testTypes.batch}
                    onChange={(e) => setTestTypes(prev => ({ ...prev, batch: e.target.checked }))}
                    className="form-checkbox"
                  />
                  批量处理测试
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={testTypes.memory}
                    onChange={(e) => setTestTypes(prev => ({ ...prev, memory: e.target.checked }))}
                    className="form-checkbox"
                  />
                  内存使用测试
                </label>
              </div>
            </div>

            <div className="test-actions">
              <button
                onClick={runPerformanceTest}
                className="btn btn-primary"
                disabled={isRunning || !hasSelectedTests}
              >
                {isRunning ? '测试中...' : '开始测试'}
              </button>
              <button
                onClick={clearResults}
                className="btn"
                disabled={isRunning}
              >
                清空结果
              </button>
            </div>
          </div>

          {/* 实时进度 */}
          {isRunning && (
            <div className="progress-section">
              <h4>测试进度</h4>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="progress-text">{progressText}</p>
            </div>
          )}
        </div>

        {/* 测试结果展示 */}
        <div className="card">
          <h3 className="card-title">测试结果</h3>
          
          {testResults.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">📊</div>
              <p>暂无测试结果</p>
              <p className="hint">选择测试类型并点击开始测试</p>
            </div>
          ) : (
            <div className="results-container">
              {testResults.map((result) => (
                <div key={result.id} className="result-item">
                  <h4 className="result-title">{result.name}</h4>
                  <div className="result-metrics">
                    <div className="metric">
                      <span className="metric-label">总耗时:</span>
                      <span className="metric-value">{result.totalTime}ms</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">平均耗时:</span>
                      <span className="metric-value">{result.averageTime}ms</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">最快:</span>
                      <span className="metric-value">{result.minTime}ms</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">最慢:</span>
                      <span className="metric-value">{result.maxTime}ms</span>
                    </div>
                    {result.cacheHitRate !== undefined && (
                      <div className="metric">
                        <span className="metric-label">缓存命中率:</span>
                        <span className="metric-value">{result.cacheHitRate}%</span>
                      </div>
                    )}
                    {result.memoryUsage && (
                      <div className="metric">
                        <span className="metric-label">内存使用:</span>
                        <span className="metric-value">{result.memoryUsage}MB</span>
                      </div>
                    )}
                  </div>
                  {result.chart && (
                    <div className="result-chart">
                      <canvas 
                        ref={(el) => setChartRef(el, result.id)} 
                        width="300" 
                        height="150"
                      ></canvas>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 性能对比图表 */}
      {comparisonData.length > 0 && (
        <div className="card">
          <h3 className="card-title">性能对比</h3>
          <div className="comparison-chart">
            <canvas ref={comparisonChartRef} width="800" height="400"></canvas>
          </div>
          <div className="comparison-legend">
            {comparisonData.map((item) => (
              <div key={item.label} className="legend-item">
                <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 性能建议 */}
      <div className="card">
        <h3 className="card-title">性能优化建议</h3>
        <div className="recommendations">
          <div className="recommendation-item">
            <h4>🚀 启用缓存</h4>
            <p>对于相同内容的二维码，启用缓存可以显著提升生成速度，减少重复计算。</p>
            <code>{`{ enableCache: true }`}</code>
          </div>
          <div className="recommendation-item">
            <h4>📏 合理选择尺寸</h4>
            <p>较大的二维码需要更多计算时间，根据实际需求选择合适的尺寸。</p>
            <code>{`{ size: 200 } // 推荐200-300px`}</code>
          </div>
          <div className="recommendation-item">
            <h4>🔄 批量处理</h4>
            <p>对于大量二维码生成，使用批量API可以获得更好的性能表现。</p>
            <code>generateQRCodeBatch(options[])</code>
          </div>
          <div className="recommendation-item">
            <h4>💾 内存管理</h4>
            <p>及时清理不需要的二维码实例，避免内存泄漏。</p>
            <code>qrInstance.destroy()</code>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PerformanceExample

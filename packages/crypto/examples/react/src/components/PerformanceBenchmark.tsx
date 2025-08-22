import { aes, base64, des, hash, hex } from '@ldesign/crypto'
import React, { useCallback, useState } from 'react'

interface BenchmarkResult {
  algorithm: string
  operation: string
  dataSize: string
  iterations: number
  totalTime: number
  avgTime: number
  throughput: string
}

export const PerformanceBenchmark: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<BenchmarkResult[]>([])
  const [progress, setProgress] = useState(0)
  const [currentTest, setCurrentTest] = useState('')

  // 生成测试数据
  const generateTestData = (size: number): string => {
    const chars
      = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < size; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // 格式化数据大小
  const formatDataSize = (bytes: number): string => {
    if (bytes < 1024)
      return `${bytes} B`
    if (bytes < 1024 * 1024)
      return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // 计算吞吐量
  const calculateThroughput = (dataSize: number, timeMs: number): string => {
    const bytesPerSecond = (dataSize * 1000) / timeMs
    if (bytesPerSecond < 1024)
      return `${bytesPerSecond.toFixed(0)} B/s`
    if (bytesPerSecond < 1024 * 1024)
      return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`
  }

  // 运行单个基准测试
  const runBenchmark = async (
    algorithm: string,
    operation: string,
    testFunction: () => void,
    dataSize: number,
    iterations: number = 100,
  ): Promise<BenchmarkResult> => {
    // 预热
    for (let i = 0; i < 10; i++) {
      testFunction()
    }

    // 正式测试
    const startTime = performance.now()
    for (let i = 0; i < iterations; i++) {
      testFunction()
    }
    const endTime = performance.now()

    const totalTime = endTime - startTime
    const avgTime = totalTime / iterations

    return {
      algorithm,
      operation,
      dataSize: formatDataSize(dataSize),
      iterations,
      totalTime: Math.round(totalTime * 100) / 100,
      avgTime: Math.round(avgTime * 100) / 100,
      throughput: calculateThroughput(dataSize, avgTime),
    }
  }

  // 运行完整的基准测试套件
  const runFullBenchmark = useCallback(async () => {
    setIsRunning(true)
    setResults([])
    setProgress(0)

    const testSizes = [1024, 10240, 102400] // 1KB, 10KB, 100KB
    const testData = testSizes.map(size => generateTestData(size))
    const password = 'benchmark-password-123'

    const tests = [
      // AES 加密测试
      ...testSizes.map((size, index) => ({
        name: `AES-256 加密 (${formatDataSize(size)})`,
        test: () =>
          runBenchmark(
            'AES-256',
            '加密',
            () => aes.encrypt(testData[index], password, { keySize: 256 }),
            size,
          ),
      })),

      // AES 解密测试
      ...testSizes.map((size, index) => {
        const encrypted = aes.encrypt(testData[index], password, {
          keySize: 256,
        })
        return {
          name: `AES-256 解密 (${formatDataSize(size)})`,
          test: () =>
            runBenchmark(
              'AES-256',
              '解密',
              () =>
                encrypted.success && encrypted.data
                  ? aes.decrypt(encrypted.data, password, { keySize: 256 })
                  : null,
              size,
            ),
        }
      }),

      // DES 加密测试
      ...testSizes.map((size, index) => ({
        name: `DES 加密 (${formatDataSize(size)})`,
        test: () =>
          runBenchmark(
            'DES',
            '加密',
            () => des.encrypt(testData[index], password),
            size,
          ),
      })),

      // 哈希测试
      ...testSizes.map((size, index) => ({
        name: `SHA-256 哈希 (${formatDataSize(size)})`,
        test: () =>
          runBenchmark(
            'SHA-256',
            '哈希',
            () => hash.sha256(testData[index]),
            size,
            200, // 哈希操作更快，增加迭代次数
          ),
      })),

      ...testSizes.map((size, index) => ({
        name: `MD5 哈希 (${formatDataSize(size)})`,
        test: () =>
          runBenchmark(
            'MD5',
            '哈希',
            () => hash.md5(testData[index]),
            size,
            200,
          ),
      })),

      // 编码测试
      ...testSizes.map((size, index) => ({
        name: `Base64 编码 (${formatDataSize(size)})`,
        test: () =>
          runBenchmark(
            'Base64',
            '编码',
            () => base64.encode(testData[index]),
            size,
            500,
          ),
      })),

      ...testSizes.map((size, index) => ({
        name: `Hex 编码 (${formatDataSize(size)})`,
        test: () =>
          runBenchmark(
            'Hex',
            '编码',
            () => hex.encode(testData[index]),
            size,
            500,
          ),
      })),
    ]

    const totalTests = tests.length
    const newResults: BenchmarkResult[] = []

    for (let i = 0; i < tests.length; i++) {
      setCurrentTest(tests[i].name)
      setProgress(((i + 1) / totalTests) * 100)

      try {
        const result = await tests[i].test()
        newResults.push(result)
        setResults([...newResults])

        // 添加小延迟以避免阻塞UI
        await new Promise(resolve => setTimeout(resolve, 50))
      }
      catch (error) {
        console.error(`测试失败: ${tests[i].name}`, error)
      }
    }

    setIsRunning(false)
    setCurrentTest('')
    setProgress(100)
  }, [])

  // 清除结果
  const clearResults = useCallback(() => {
    setResults([])
    setProgress(0)
  }, [])

  // 导出结果
  const exportResults = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      results,
      summary: {
        totalTests: results.length,
        fastestOperation: results.reduce((fastest, current) =>
          current.avgTime < fastest.avgTime ? current : fastest,
        ),
        slowestOperation: results.reduce((slowest, current) =>
          current.avgTime > slowest.avgTime ? current : slowest,
        ),
      },
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crypto_benchmark_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [results])

  return (
    <div className="performance-benchmark">
      <h2>⚡ 性能基准测试</h2>

      <div className="benchmark-controls">
        <div className="control-buttons">
          <button
            onClick={runFullBenchmark}
            disabled={isRunning}
            className="btn-primary"
          >
            {isRunning ? '测试进行中...' : '🚀 开始基准测试'}
          </button>

          <button
            onClick={clearResults}
            disabled={isRunning || results.length === 0}
            className="btn-secondary"
          >
            🗑️ 清除结果
          </button>

          <button
            onClick={exportResults}
            disabled={results.length === 0}
            className="btn-export"
          >
            💾 导出结果
          </button>
        </div>

        {isRunning && (
          <div className="progress-section">
            <div className="progress-info">
              <p>
                当前测试:
                {currentTest}
              </p>
              <p>
                进度:
                {Math.round(progress)}
                %
              </p>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="test-info">
        <h3>测试说明</h3>
        <div className="info-grid">
          <div className="info-item">
            <h4>测试数据大小</h4>
            <ul>
              <li>1 KB - 小文本数据</li>
              <li>10 KB - 中等文档</li>
              <li>100 KB - 大型文档</li>
            </ul>
          </div>
          <div className="info-item">
            <h4>测试算法</h4>
            <ul>
              <li>AES-256 (加密/解密)</li>
              <li>DES (加密)</li>
              <li>SHA-256, MD5 (哈希)</li>
              <li>Base64, Hex (编码)</li>
            </ul>
          </div>
          <div className="info-item">
            <h4>性能指标</h4>
            <ul>
              <li>平均执行时间 (ms)</li>
              <li>数据吞吐量 (B/s)</li>
              <li>总执行时间</li>
              <li>迭代次数</li>
            </ul>
          </div>
        </div>
      </div>

      {results.length > 0 && (
        <div className="results-section">
          <h3>
            测试结果 (
            {results.length}
            {' '}
            项测试)
          </h3>

          <div className="results-table-container">
            <table className="results-table">
              <thead>
                <tr>
                  <th>算法</th>
                  <th>操作</th>
                  <th>数据大小</th>
                  <th>迭代次数</th>
                  <th>总时间 (ms)</th>
                  <th>平均时间 (ms)</th>
                  <th>吞吐量</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index}>
                    <td className="algorithm-cell">{result.algorithm}</td>
                    <td className="operation-cell">{result.operation}</td>
                    <td className="size-cell">{result.dataSize}</td>
                    <td className="iterations-cell">{result.iterations}</td>
                    <td className="time-cell">{result.totalTime}</td>
                    <td className="avg-time-cell">{result.avgTime}</td>
                    <td className="throughput-cell">{result.throughput}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="performance-summary">
            <h4>性能总结</h4>
            <div className="summary-grid">
              <div className="summary-item">
                <h5>最快操作</h5>
                <p>
                  {
                    results.reduce((fastest, current) =>
                      current.avgTime < fastest.avgTime ? current : fastest,
                    ).algorithm
                  }
                  {' '}
                  {
                    results.reduce((fastest, current) =>
                      current.avgTime < fastest.avgTime ? current : fastest,
                    ).operation
                  }
                </p>
                <span className="time-value">
                  {
                    results.reduce((fastest, current) =>
                      current.avgTime < fastest.avgTime ? current : fastest,
                    ).avgTime
                  }
                  {' '}
                  ms
                </span>
              </div>

              <div className="summary-item">
                <h5>最慢操作</h5>
                <p>
                  {
                    results.reduce((slowest, current) =>
                      current.avgTime > slowest.avgTime ? current : slowest,
                    ).algorithm
                  }
                  {' '}
                  {
                    results.reduce((slowest, current) =>
                      current.avgTime > slowest.avgTime ? current : slowest,
                    ).operation
                  }
                </p>
                <span className="time-value">
                  {
                    results.reduce((slowest, current) =>
                      current.avgTime > slowest.avgTime ? current : slowest,
                    ).avgTime
                  }
                  {' '}
                  ms
                </span>
              </div>

              <div className="summary-item">
                <h5>平均执行时间</h5>
                <span className="time-value">
                  {(
                    results.reduce((sum, result) => sum + result.avgTime, 0)
                    / results.length
                  ).toFixed(2)}
                  {' '}
                  ms
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="benchmark-notes">
        <h4>📝 注意事项</h4>
        <ul>
          <li>测试结果受浏览器、设备性能和当前系统负载影响</li>
          <li>每个测试包含预热阶段以获得更准确的结果</li>
          <li>实际应用性能可能因数据特征和使用场景而异</li>
          <li>建议在相同环境下多次测试以获得稳定结果</li>
        </ul>
      </div>
    </div>
  )
}

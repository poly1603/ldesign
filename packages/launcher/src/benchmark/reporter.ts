/**
 * 基准测试报告生成器
 * 
 * 独立的报告器类，不依赖测试框架
 */

/**
 * 基准测试报告生成器
 */
export class BenchmarkReporter {
  private results: Map<string, number[]> = new Map()
  
  record(name: string, value: number): void {
    if (!this.results.has(name)) {
      this.results.set(name, [])
    }
    this.results.get(name)!.push(value)
  }
  
  getAverage(name: string): number {
    const values = this.results.get(name) || []
    if (values.length === 0) return 0
    return values.reduce((a, b) => a + b, 0) / values.length
  }
  
  getMedian(name: string): number {
    const values = this.results.get(name) || []
    if (values.length === 0) return 0
    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid]
  }
  
  getPercentile(name: string, percentile: number): number {
    const values = this.results.get(name) || []
    if (values.length === 0) return 0
    const sorted = [...values].sort((a, b) => a - b)
    const index = Math.floor((percentile / 100) * sorted.length)
    return sorted[Math.min(index, sorted.length - 1)]
  }
  
  getAllResults(): Record<string, number[]> {
    const result: Record<string, number[]> = {}
    for (const [key, values] of this.results.entries()) {
      result[key] = [...values]
    }
    return result
  }
  
  clear(): void {
    this.results.clear()
  }
  
  generateReport(): string {
    let report = '# 基准测试报告\n\n'
    
    for (const [name, values] of this.results.entries()) {
      if (values.length === 0) continue
      
      report += `## ${name}\n\n`
      report += `- 测试次数: ${values.length}\n`
      report += `- 平均值: ${this.getAverage(name).toFixed(2)}ms\n`
      report += `- 中位数: ${this.getMedian(name).toFixed(2)}ms\n`
      report += `- P95: ${this.getPercentile(name, 95).toFixed(2)}ms\n`
      report += `- P99: ${this.getPercentile(name, 99).toFixed(2)}ms\n\n`
    }
    
    return report
  }
}

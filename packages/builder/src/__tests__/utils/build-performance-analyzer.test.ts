/**
 * 构建性能分析器测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { BuildPerformanceAnalyzer } from '../../utils/build-performance-analyzer'
import type { BuildPhase, AnalysisOptions } from '../../utils/build-performance-analyzer'

describe('BuildPerformanceAnalyzer', () => {
  let analyzer: BuildPerformanceAnalyzer

  beforeEach(() => {
    analyzer = new BuildPerformanceAnalyzer()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Constructor', () => {
    it('should create instance successfully', () => {
      expect(analyzer).toBeInstanceOf(BuildPerformanceAnalyzer)
    })
  })

  describe('Phase Management', () => {
    it('should start and end phases correctly', () => {
      const phase: BuildPhase = 'initialization'
      
      analyzer.startPhase(phase)
      
      // Wait a bit to ensure time difference
      setTimeout(() => {
        const result = analyzer.endPhase(phase)
        
        expect(result).toBeDefined()
        expect(result?.phase).toBe(phase)
        expect(result?.duration).toBeGreaterThan(0)
        expect(result?.memoryUsage).toBeDefined()
      }, 10)
    })

    it('should handle multiple phases', () => {
      const phases: BuildPhase[] = ['initialization', 'compilation', 'bundling']
      
      phases.forEach(phase => {
        analyzer.startPhase(phase)
      })
      
      phases.forEach(phase => {
        const result = analyzer.endPhase(phase)
        expect(result).toBeDefined()
        expect(result?.phase).toBe(phase)
      })
    })

    it('should return null for non-existent phase', () => {
      const result = analyzer.endPhase('compilation')
      expect(result).toBeNull()
    })

    it('should handle overlapping phases', async () => {
      analyzer.startPhase('initialization')
      await new Promise(resolve => setTimeout(resolve, 10)) // 10ms delay
      analyzer.startPhase('compilation')
      await new Promise(resolve => setTimeout(resolve, 10)) // 10ms delay

      // 先结束 compilation
      const compilationResult = analyzer.endPhase('compilation')

      // 再结束 initialization
      const initResult = analyzer.endPhase('initialization')

      expect(compilationResult).toBeDefined()
      expect(initResult).toBeDefined()

      if (compilationResult && initResult) {
        expect(compilationResult.duration).toBeGreaterThan(0)
        expect(initResult.duration).toBeGreaterThan(0)
      }
    })
  })

  describe('Memory Tracking', () => {
    it('should track memory usage during phases', () => {
      analyzer.startPhase('compilation')
      
      // Simulate some memory usage
      const largeArray = new Array(1000).fill('test')
      
      const result = analyzer.endPhase('compilation')
      
      expect(result?.memoryUsage).toBeDefined()
      expect(result?.memoryUsage.heapUsed).toBeGreaterThan(0)
      expect(result?.memoryUsage.heapTotal).toBeGreaterThan(0)
      
      // Clean up
      largeArray.length = 0
    })

    it('should detect memory leaks', () => {
      const initialMemory = process.memoryUsage().heapUsed
      
      analyzer.startPhase('memory-test')
      
      // Simulate memory allocation
      const data = new Array(10000).fill('memory-test-data')
      
      const result = analyzer.endPhase('memory-test')
      
      expect(result?.memoryUsage.heapUsed).toBeGreaterThan(initialMemory)
      
      // Clean up
      data.length = 0
    })
  })

  describe('Performance Analysis', () => {
    it('should generate comprehensive analysis', async () => {
      // Simulate a complete build process
      analyzer.startPhase('initialization')
      await new Promise(resolve => setTimeout(resolve, 5))
      analyzer.endPhase('initialization')

      analyzer.startPhase('compilation')
      await new Promise(resolve => setTimeout(resolve, 5))
      analyzer.endPhase('compilation')

      analyzer.startPhase('bundling')
      await new Promise(resolve => setTimeout(resolve, 5))
      analyzer.endPhase('bundling')

      analyzer.startPhase('optimization')
      await new Promise(resolve => setTimeout(resolve, 5))
      analyzer.endPhase('optimization')

      const analysis = analyzer.finishAnalysis()

      expect(analysis).toBeDefined()
      expect(analysis.totalDuration).toBeGreaterThan(0)
      expect(analysis.phases).toHaveLength(4)
      expect(analysis.bottlenecks).toBeDefined()
      expect(analysis.recommendations).toBeDefined()
      expect(Array.isArray(analysis.recommendations)).toBe(true)
    })

    it('should identify bottlenecks', () => {
      // Create a slow phase
      analyzer.startPhase('slow-phase')
      
      // Simulate slow operation
      const start = Date.now()
      while (Date.now() - start < 100) {
        // Busy wait
      }
      
      analyzer.endPhase('slow-phase')
      
      // Create a fast phase
      analyzer.startPhase('fast-phase')
      analyzer.endPhase('fast-phase')
      
      const analysis = analyzer.finishAnalysis()
      
      expect(analysis.bottlenecks).toBeDefined()
      expect(analysis.bottlenecks.slowestPhase).toBe('slow-phase')
      expect(analysis.bottlenecks.slowestDuration).toBeGreaterThan(90)
    })

    it('should provide optimization recommendations', async () => {
      analyzer.startPhase('compilation')

      // Simulate high memory usage
      const largeData = new Array(50000).fill('test-data')
      await new Promise(resolve => setTimeout(resolve, 10))

      analyzer.endPhase('compilation')

      const analysis = analyzer.finishAnalysis({
        includeRecommendations: true
      })



      expect(analysis.recommendations).toBeDefined()
      expect(analysis.recommendations.length).toBeGreaterThan(0)

      // Should include memory-related recommendations (支持中英文)
      const hasMemoryRecommendation = analysis.recommendations.some(
        rec => rec.toLowerCase().includes('memory') || rec.includes('内存')
      )
      expect(hasMemoryRecommendation).toBe(true)

      // Clean up
      largeData.length = 0
    })
  })

  describe('Analysis Options', () => {
    it('should respect analysis options', () => {
      analyzer.startPhase('test-phase')
      analyzer.endPhase('test-phase')
      
      const options: AnalysisOptions = {
        includeRecommendations: false,
        includeDetailedMetrics: false
      }
      
      const analysis = analyzer.finishAnalysis(options)
      
      expect(analysis.recommendations).toHaveLength(0)
      expect(analysis.detailedMetrics).toBeUndefined()
    })

    it('should include detailed metrics when requested', () => {
      analyzer.startPhase('detailed-test')
      analyzer.endPhase('detailed-test')
      
      const options: AnalysisOptions = {
        includeDetailedMetrics: true
      }
      
      const analysis = analyzer.finishAnalysis(options)
      
      expect(analysis.detailedMetrics).toBeDefined()
      expect(analysis.detailedMetrics?.cpuUsage).toBeDefined()
      expect(analysis.detailedMetrics?.memoryPeak).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid phase names gracefully', () => {
      expect(() => {
        analyzer.startPhase('' as BuildPhase)
      }).not.toThrow()
      
      expect(() => {
        analyzer.endPhase('' as BuildPhase)
      }).not.toThrow()
    })

    it('should handle analysis without phases', () => {
      const analysis = analyzer.finishAnalysis()
      
      expect(analysis).toBeDefined()
      expect(analysis.totalDuration).toBe(0)
      expect(analysis.phases).toHaveLength(0)
      expect(analysis.bottlenecks.slowestPhase).toBeNull()
    })
  })

  describe('Performance', () => {
    it('should have minimal overhead', () => {
      const iterations = 1000
      const startTime = Date.now()
      
      for (let i = 0; i < iterations; i++) {
        analyzer.startPhase('performance-test')
        analyzer.endPhase('performance-test')
      }
      
      const endTime = Date.now()
      const totalTime = endTime - startTime
      const averageTime = totalTime / iterations
      
      // Should be very fast (less than 1ms per operation on average)
      expect(averageTime).toBeLessThan(1)
    })
  })
})

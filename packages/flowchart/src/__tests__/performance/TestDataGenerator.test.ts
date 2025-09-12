/**
 * 测试数据生成器测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { TestDataGenerator, PerformanceBenchmark } from '../../performance/TestDataGenerator'
import type { TestDataConfig } from '../../performance/TestDataGenerator'

describe('TestDataGenerator', () => {
  let generator: TestDataGenerator

  beforeEach(() => {
    generator = new TestDataGenerator(12345) // 使用固定种子确保测试可重复
  })

  describe('基础功能', () => {
    it('应该能够创建测试数据生成器实例', () => {
      expect(generator).toBeDefined()
      expect(generator).toBeInstanceOf(TestDataGenerator)
    })

    it('应该能够生成基本的测试数据', () => {
      const config: TestDataConfig = {
        nodeCount: 10,
        edgeDensity: 0.3,
        nodeTypeDistribution: {
          start: 0.1,
          approval: 0.4,
          condition: 0.2,
          process: 0.2,
          end: 0.1
        },
        canvasSize: { width: 1000, height: 800 },
        complexConnections: false
      }

      const data = generator.generateTestData(config)

      expect(data).toBeDefined()
      expect(data.nodes).toBeDefined()
      expect(data.edges).toBeDefined()
      expect(Array.isArray(data.nodes)).toBe(true)
      expect(Array.isArray(data.edges)).toBe(true)
    })

    it('应该生成正确数量的节点', () => {
      const config: TestDataConfig = {
        nodeCount: 20,
        edgeDensity: 0.2,
        nodeTypeDistribution: {
          start: 0.1,
          approval: 0.4,
          condition: 0.2,
          process: 0.2,
          end: 0.1
        },
        canvasSize: { width: 1000, height: 800 },
        complexConnections: false
      }

      const data = generator.generateTestData(config)
      expect(data.nodes.length).toBe(20)
    })

    it('应该生成合理数量的边', () => {
      const config: TestDataConfig = {
        nodeCount: 15,
        edgeDensity: 0.3,
        nodeTypeDistribution: {
          start: 0.1,
          approval: 0.4,
          condition: 0.2,
          process: 0.2,
          end: 0.1
        },
        canvasSize: { width: 1000, height: 800 },
        complexConnections: false
      }

      const data = generator.generateTestData(config)
      expect(data.edges.length).toBeGreaterThan(0)
      expect(data.edges.length).toBeLessThanOrEqual(data.nodes.length * 2)
    })
  })

  describe('节点生成', () => {
    it('应该生成不同类型的节点', () => {
      const config: TestDataConfig = {
        nodeCount: 50,
        edgeDensity: 0.2,
        nodeTypeDistribution: {
          start: 0.1,
          approval: 0.4,
          condition: 0.2,
          process: 0.2,
          end: 0.1
        },
        canvasSize: { width: 1000, height: 800 },
        complexConnections: false
      }

      const data = generator.generateTestData(config)
      
      const nodeTypes = new Set(data.nodes.map(node => node.type))
      expect(nodeTypes.has('start')).toBe(true)
      expect(nodeTypes.has('approval')).toBe(true)
      expect(nodeTypes.has('condition')).toBe(true)
      expect(nodeTypes.has('process')).toBe(true)
      expect(nodeTypes.has('end')).toBe(true)
    })

    it('应该确保至少有一个开始节点和结束节点', () => {
      const config: TestDataConfig = {
        nodeCount: 10,
        edgeDensity: 0.2,
        nodeTypeDistribution: {
          start: 0.05, // 很小的比例
          approval: 0.8,
          condition: 0.1,
          process: 0.04,
          end: 0.01 // 很小的比例
        },
        canvasSize: { width: 1000, height: 800 },
        complexConnections: false
      }

      const data = generator.generateTestData(config)
      
      const startNodes = data.nodes.filter(node => node.type === 'start')
      const endNodes = data.nodes.filter(node => node.type === 'end')
      
      expect(startNodes.length).toBeGreaterThanOrEqual(1)
      expect(endNodes.length).toBeGreaterThanOrEqual(1)
    })

    it('应该为节点生成合理的坐标', () => {
      const config: TestDataConfig = {
        nodeCount: 10,
        edgeDensity: 0.2,
        nodeTypeDistribution: {
          start: 0.1,
          approval: 0.4,
          condition: 0.2,
          process: 0.2,
          end: 0.1
        },
        canvasSize: { width: 1000, height: 800 },
        complexConnections: false
      }

      const data = generator.generateTestData(config)
      
      data.nodes.forEach(node => {
        expect(node.x).toBeGreaterThanOrEqual(100)
        expect(node.x).toBeLessThanOrEqual(900)
        expect(node.y).toBeGreaterThanOrEqual(100)
        expect(node.y).toBeLessThanOrEqual(700)
      })
    })

    it('应该为节点生成属性', () => {
      const config: TestDataConfig = {
        nodeCount: 5,
        edgeDensity: 0.2,
        nodeTypeDistribution: {
          start: 0.2,
          approval: 0.4,
          condition: 0.2,
          process: 0.2,
          end: 0.0
        },
        canvasSize: { width: 1000, height: 800 },
        complexConnections: false
      }

      const data = generator.generateTestData(config)
      
      data.nodes.forEach(node => {
        expect(node.id).toBeTruthy()
        expect(node.type).toBeTruthy()
        expect(node.text).toBeTruthy()
        expect(node.properties).toBeDefined()
        expect(node.properties.createdAt).toBeTruthy()
        expect(node.properties.version).toBeTruthy()
      })
    })
  })

  describe('边生成', () => {
    it('应该生成有效的边连接', () => {
      const config: TestDataConfig = {
        nodeCount: 10,
        edgeDensity: 0.3,
        nodeTypeDistribution: {
          start: 0.1,
          approval: 0.4,
          condition: 0.2,
          process: 0.2,
          end: 0.1
        },
        canvasSize: { width: 1000, height: 800 },
        complexConnections: false
      }

      const data = generator.generateTestData(config)
      const nodeIds = new Set(data.nodes.map(node => node.id))
      
      data.edges.forEach(edge => {
        expect(nodeIds.has(edge.sourceNodeId)).toBe(true)
        expect(nodeIds.has(edge.targetNodeId)).toBe(true)
        expect(edge.sourceNodeId).not.toBe(edge.targetNodeId)
      })
    })

    it('应该避免重复的边', () => {
      const config: TestDataConfig = {
        nodeCount: 15,
        edgeDensity: 0.4,
        nodeTypeDistribution: {
          start: 0.1,
          approval: 0.4,
          condition: 0.2,
          process: 0.2,
          end: 0.1
        },
        canvasSize: { width: 1000, height: 800 },
        complexConnections: true
      }

      const data = generator.generateTestData(config)
      const edgeKeys = new Set()
      
      data.edges.forEach(edge => {
        const key = `${edge.sourceNodeId}-${edge.targetNodeId}`
        expect(edgeKeys.has(key)).toBe(false)
        edgeKeys.add(key)
      })
    })
  })

  describe('预定义场景', () => {
    it('应该提供预定义的测试场景', () => {
      const scenarios = TestDataGenerator.getTestScenarios()
      
      expect(Array.isArray(scenarios)).toBe(true)
      expect(scenarios.length).toBeGreaterThan(0)
      
      scenarios.forEach(scenario => {
        expect(scenario.name).toBeTruthy()
        expect(scenario.description).toBeTruthy()
        expect(scenario.config).toBeDefined()
        expect(scenario.config.nodeCount).toBeGreaterThan(0)
      })
    })

    it('应该包含不同规模的场景', () => {
      const scenarios = TestDataGenerator.getTestScenarios()
      const nodeCounts = scenarios.map(s => s.config.nodeCount)
      
      expect(Math.min(...nodeCounts)).toBeLessThan(50) // 小型场景
      expect(Math.max(...nodeCounts)).toBeGreaterThan(500) // 大型场景
    })

    it('应该能够根据场景名称生成数据', () => {
      const data = generator.generateScenarioData('small')
      
      expect(data).toBeDefined()
      expect(data.nodes.length).toBeGreaterThan(0)
      expect(data.edges.length).toBeGreaterThan(0)
    })

    it('应该在场景不存在时抛出错误', () => {
      expect(() => {
        generator.generateScenarioData('nonexistent')
      }).toThrow('未找到测试场景: nonexistent')
    })

    it('应该能够生成基准测试数据集', () => {
      const dataset = generator.generateBenchmarkDataset()
      
      expect(dataset).toBeDefined()
      expect(typeof dataset).toBe('object')
      
      const scenarios = TestDataGenerator.getTestScenarios()
      scenarios.forEach(scenario => {
        expect(dataset[scenario.name]).toBeDefined()
        expect(dataset[scenario.name].nodes.length).toBeGreaterThan(0)
      })
    })
  })

  describe('随机种子', () => {
    it('相同种子应该生成相同的数据', () => {
      const generator1 = new TestDataGenerator(12345)
      const generator2 = new TestDataGenerator(12345)
      
      const config: TestDataConfig = {
        nodeCount: 10,
        edgeDensity: 0.3,
        nodeTypeDistribution: {
          start: 0.1,
          approval: 0.4,
          condition: 0.2,
          process: 0.2,
          end: 0.1
        },
        canvasSize: { width: 1000, height: 800 },
        complexConnections: false
      }

      const data1 = generator1.generateTestData(config)
      const data2 = generator2.generateTestData(config)
      
      expect(data1.nodes.length).toBe(data2.nodes.length)
      expect(data1.edges.length).toBe(data2.edges.length)
      
      // 检查节点坐标是否相同
      for (let i = 0; i < data1.nodes.length; i++) {
        expect(data1.nodes[i].x).toBe(data2.nodes[i].x)
        expect(data1.nodes[i].y).toBe(data2.nodes[i].y)
      }
    })

    it('不同种子应该生成不同的数据', () => {
      const generator1 = new TestDataGenerator(12345)
      const generator2 = new TestDataGenerator(54321)
      
      const config: TestDataConfig = {
        nodeCount: 20,
        edgeDensity: 0.3,
        nodeTypeDistribution: {
          start: 0.1,
          approval: 0.4,
          condition: 0.2,
          process: 0.2,
          end: 0.1
        },
        canvasSize: { width: 1000, height: 800 },
        complexConnections: false
      }

      const data1 = generator1.generateTestData(config)
      const data2 = generator2.generateTestData(config)
      
      // 节点数量应该相同，但坐标应该不同
      expect(data1.nodes.length).toBe(data2.nodes.length)
      
      let differentCoordinates = false
      for (let i = 0; i < data1.nodes.length; i++) {
        if (data1.nodes[i].x !== data2.nodes[i].x || data1.nodes[i].y !== data2.nodes[i].y) {
          differentCoordinates = true
          break
        }
      }
      expect(differentCoordinates).toBe(true)
    })
  })
})

describe('PerformanceBenchmark', () => {
  let benchmark: PerformanceBenchmark

  beforeEach(() => {
    benchmark = new PerformanceBenchmark(12345)
  })

  describe('基础功能', () => {
    it('应该能够创建性能基准测试实例', () => {
      expect(benchmark).toBeDefined()
      expect(benchmark).toBeInstanceOf(PerformanceBenchmark)
    })

    it('应该能够运行基准测试', async () => {
      const mockCallback = async (data: any, scenario: string) => {
        // 模拟测试回调，返回随机时间
        return Math.random() * 100 + 10
      }

      const results = await benchmark.runBenchmark(mockCallback)
      
      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBeGreaterThan(0)
      
      results.forEach(result => {
        expect(result.scenario).toBeTruthy()
        expect(result.description).toBeTruthy()
        expect(result.nodeCount).toBeGreaterThan(0)
        expect(result.edgeCount).toBeGreaterThanOrEqual(0)
        expect(result.avgTime).toBeGreaterThan(0)
        expect(result.minTime).toBeGreaterThan(0)
        expect(result.maxTime).toBeGreaterThan(0)
        expect(result.iterations).toBeGreaterThan(0)
      })
    })

    it('应该能够生成基准测试报告', async () => {
      const mockResults = [
        {
          scenario: 'test1',
          description: '测试场景1',
          nodeCount: 10,
          edgeCount: 8,
          avgTime: 15.5,
          minTime: 12.3,
          maxTime: 18.7,
          iterations: 3
        },
        {
          scenario: 'test2',
          description: '测试场景2',
          nodeCount: 50,
          edgeCount: 45,
          avgTime: 45.2,
          minTime: 42.1,
          maxTime: 48.3,
          iterations: 3
        }
      ]

      const report = benchmark.generateBenchmarkReport(mockResults)
      
      expect(typeof report).toBe('string')
      expect(report).toContain('性能基准测试报告')
      expect(report).toContain('test1')
      expect(report).toContain('test2')
      expect(report).toContain('最佳性能')
      expect(report).toContain('最差性能')
    })
  })
})

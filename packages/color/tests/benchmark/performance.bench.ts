import { bench, describe } from 'vitest'
import { Color } from '../../src/color'
import { WorkerPool } from '../../src/worker/worker-pool'
import { WASMColorLoader } from '../../src/wasm/wasm-loader'
import { AIColorEngine } from '../../src/ai/ai-color-engine'
import { SmartCache } from '../../src/cache/smart-cache'

describe('Color Processing Performance Benchmarks', () => {
  let workerPool: WorkerPool
  let wasmLoader: WASMColorLoader
  let aiEngine: AIColorEngine
  let cache: SmartCache

  // Setup instances
  beforeAll(async () => {
    workerPool = new WorkerPool({ maxWorkers: 4 })
    await workerPool.initialize()

    wasmLoader = new WASMColorLoader({
      wasmPath: './wasm/color.wasm',
      memory: { initial: 256, maximum: 512 }
    })
    await wasmLoader.initialize()

    aiEngine = new AIColorEngine({
      modelPath: './models/color-nn.json',
      cacheSize: 1000
    })
    await aiEngine.initialize()

    cache = new SmartCache({
      dbName: 'bench-cache',
      maxSize: 10 * 1024 * 1024 // 10MB
    })
    await cache.initialize()
  })

  afterAll(async () => {
    await workerPool.terminate()
    await cache.clear()
  })

  describe('Basic Color Operations', () => {
    bench('Native JavaScript - RGB to HSL conversion', () => {
      const color = new Color('#FF5733')
      color.toHsl()
    }, { iterations: 10000 })

    bench('Native JavaScript - Color mixing', () => {
      const color1 = new Color('#FF5733')
      const color2 = new Color('#33FF57')
      color1.mix(color2, 0.5)
    }, { iterations: 10000 })

    bench('Native JavaScript - Contrast calculation', () => {
      const color1 = new Color('#FF5733')
      const color2 = new Color('#33FF57')
      color1.contrast(color2)
    }, { iterations: 10000 })
  })

  describe('WASM Accelerated Operations', () => {
    bench('WASM - RGB to HSL conversion', async () => {
      await wasmLoader.convertColor('#FF5733', 'rgb', 'hsl')
    }, { iterations: 10000 })

    bench('WASM - Batch color conversion (100 colors)', async () => {
      const colors = Array(100).fill(null).map((_, i) => 
        `#${i.toString(16).padStart(6, '0')}`
      )
      await wasmLoader.batchConvert(colors, 'rgb', 'hsl')
    }, { iterations: 100 })

    bench('WASM - K-means clustering (50 colors, 5 clusters)', async () => {
      const colors = Array(50).fill(null).map((_, i) => 
        (i * 0x333333) & 0xFFFFFF
      )
      await wasmLoader.exports.kmeans_cluster(
        new Uint32Array(colors),
        5,
        100
      )
    }, { iterations: 100 })

    bench('WASM - Neural network forward pass', async () => {
      const input = new Float32Array([0.5, 0.3, 0.8, 0.2, 0.6])
      await wasmLoader.exports.neural_forward(input, 5)
    }, { iterations: 1000 })
  })

  describe('Worker Pool Parallel Processing', () => {
    bench('Worker Pool - Parallel palette generation (10 workers)', async () => {
      const tasks = Array(10).fill(null).map((_, i) => ({
        type: 'generatePalette',
        data: {
          baseColor: `#${(i * 100000).toString(16).padStart(6, '0')}`,
          count: 10
        }
      }))

      await Promise.all(tasks.map(task => workerPool.execute(task)))
    }, { iterations: 100 })

    bench('Worker Pool - Parallel contrast matrix (100 colors)', async () => {
      const colors = Array(100).fill(null).map((_, i) => 
        `#${i.toString(16).padStart(6, '0')}`
      )

      await workerPool.execute({
        type: 'contrastMatrix',
        data: { colors }
      })
    }, { iterations: 50 })

    bench('Worker Pool - Load balancing (mixed tasks)', async () => {
      const tasks = [
        { type: 'rgbToHsl', data: { rgb: [255, 87, 51] } },
        { type: 'generatePalette', data: { baseColor: '#FF5733', count: 5 } },
        { type: 'calculateContrast', data: { color1: '#FF5733', color2: '#33FF57' } },
        { type: 'kmeans', data: { colors: Array(20).fill('#FF5733'), k: 3 } }
      ]

      await Promise.all(tasks.map(task => workerPool.execute(task)))
    }, { iterations: 200 })
  })

  describe('AI Engine Performance', () => {
    bench('AI - Color recommendation', async () => {
      await aiEngine.getRecommendations('#FF5733', {
        style: 'modern',
        mood: 'energetic'
      })
    }, { iterations: 100 })

    bench('AI - Batch predictions (10 colors)', async () => {
      const colors = Array(10).fill(null).map((_, i) => 
        `#${(i * 100000).toString(16).padStart(6, '0')}`
      )

      await Promise.all(
        colors.map(color => aiEngine.predictNextColor(color, {}))
      )
    }, { iterations: 50 })

    bench('AI - Clustering with K-means (100 colors, 10 clusters)', async () => {
      const colors = Array(100).fill(null).map((_, i) => 
        `#${i.toString(16).padStart(6, '0')}`
      )

      await aiEngine.clusterColors(colors, 10)
    }, { iterations: 20 })

    bench('AI - Trend analysis (1000 data points)', async () => {
      // Simulate historical data
      for (let i = 0; i < 1000; i++) {
        await aiEngine.recordUsage(
          `#${i.toString(16).padStart(6, '0')}`,
          { timestamp: Date.now() - i * 1000, category: 'test' }
        )
      }

      await aiEngine.analyzeTrends(30)
    }, { iterations: 10 })
  })

  describe('Cache Performance', () => {
    bench('Cache - Write operations', async () => {
      const key = `cache-write-${Math.random()}`
      await cache.set(key, { color: '#FF5733', data: Array(100).fill(0) }, 'lru')
    }, { iterations: 1000 })

    bench('Cache - Read operations (with hits)', async () => {
      const key = 'cache-read-hit'
      await cache.set(key, { color: '#FF5733' }, 'lru')
      await cache.get(key)
    }, { iterations: 10000 })

    bench('Cache - Read operations (with misses)', async () => {
      await cache.get(`cache-miss-${Math.random()}`)
    }, { iterations: 10000 })

    bench('Cache - LRU eviction (1000 items)', async () => {
      for (let i = 0; i < 1000; i++) {
        await cache.set(`lru-${i}`, { index: i }, 'lru')
      }
    }, { iterations: 10 })

    bench('Cache - Compression (large data)', async () => {
      const largeData = {
        colors: Array(1000).fill(null).map((_, i) => ({
          hex: `#${i.toString(16).padStart(6, '0')}`,
          rgb: [i % 256, (i * 2) % 256, (i * 3) % 256],
          hsl: [i % 360, 50, 50]
        }))
      }

      await cache.set(`compress-${Math.random()}`, largeData, 'lru')
    }, { iterations: 100 })
  })

  describe('Comparative Benchmarks', () => {
    const testColors = Array(100).fill(null).map((_, i) => 
      `#${(i * 0x010101).toString(16).padStart(6, '0')}`
    )

    bench('Native JS vs WASM - Batch RGB to HSL (100 colors)', async () => {
      // Native JavaScript
      const nativeStart = performance.now()
      testColors.forEach(hex => {
        const color = new Color(hex)
        color.toHsl()
      })
      const nativeTime = performance.now() - nativeStart

      // WASM
      const wasmStart = performance.now()
      await wasmLoader.batchConvert(testColors, 'rgb', 'hsl')
      const wasmTime = performance.now() - wasmStart

      console.log(`Native: ${nativeTime.toFixed(2)}ms, WASM: ${wasmTime.toFixed(2)}ms`)
      console.log(`WASM is ${(nativeTime / wasmTime).toFixed(2)}x faster`)
    }, { iterations: 50 })

    bench('Single-threaded vs Worker Pool - Palette generation', async () => {
      const tasks = Array(10).fill(null).map((_, i) => ({
        baseColor: `#${(i * 100000).toString(16).padStart(6, '0')}`,
        count: 20
      }))

      // Single-threaded
      const singleStart = performance.now()
      for (const task of tasks) {
        const color = new Color(task.baseColor)
        color.analogous(task.count)
      }
      const singleTime = performance.now() - singleStart

      // Worker Pool
      const workerStart = performance.now()
      await Promise.all(
        tasks.map(task => 
          workerPool.execute({
            type: 'generatePalette',
            data: task
          })
        )
      )
      const workerTime = performance.now() - workerStart

      console.log(`Single: ${singleTime.toFixed(2)}ms, Workers: ${workerTime.toFixed(2)}ms`)
      console.log(`Workers are ${(singleTime / workerTime).toFixed(2)}x faster`)
    }, { iterations: 20 })

    bench('With vs Without Cache - AI recommendations', async () => {
      const testColor = '#3498DB'
      const context = { style: 'modern', mood: 'calm' }

      // Without cache (clear first)
      await cache.clear()
      const noCacheStart = performance.now()
      await aiEngine.getRecommendations(testColor, context)
      const noCacheTime = performance.now() - noCacheStart

      // With cache (second call should hit cache)
      const cacheStart = performance.now()
      await aiEngine.getRecommendations(testColor, context)
      const cacheTime = performance.now() - cacheStart

      console.log(`No cache: ${noCacheTime.toFixed(2)}ms, With cache: ${cacheTime.toFixed(2)}ms`)
      console.log(`Cache is ${(noCacheTime / cacheTime).toFixed(2)}x faster`)
    }, { iterations: 100 })
  })

  describe('Memory Usage Analysis', () => {
    bench('Memory - Large palette generation', () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0
      
      const palettes = Array(100).fill(null).map((_, i) => {
        const color = new Color(`#${i.toString(16).padStart(6, '0')}`)
        return color.analogous(100)
      })

      const finalMemory = performance.memory?.usedJSHeapSize || 0
      const memoryUsed = (finalMemory - initialMemory) / 1024 / 1024

      console.log(`Memory used: ${memoryUsed.toFixed(2)} MB`)
      
      return palettes
    }, { iterations: 10 })

    bench('Memory - AI model operations', async () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0
      
      const operations = Array(50).fill(null).map((_, i) => 
        aiEngine.getRecommendations(`#${i.toString(16).padStart(6, '0')}`, {})
      )
      
      await Promise.all(operations)

      const finalMemory = performance.memory?.usedJSHeapSize || 0
      const memoryUsed = (finalMemory - initialMemory) / 1024 / 1024

      console.log(`Memory used: ${memoryUsed.toFixed(2)} MB`)
    }, { iterations: 10 })
  })
})

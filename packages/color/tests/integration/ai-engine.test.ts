import { beforeEach, describe, expect, it } from 'vitest'
import { AIColorEngine } from '../../src/ai/ai-color-engine'

describe('aIColorEngine Integration Tests', () => {
  let engine: AIColorEngine

  beforeEach(async () => {
    engine = new AIColorEngine({
      modelPath: './models/color-nn.json',
      cacheSize: 100,
      learningRate: 0.01,
      batchSize: 32,
    })
    await engine.initialize()
  })

  it('should initialize neural network and clustering', async () => {
    expect(engine).toBeDefined()

    // Test initial recommendations
    const recommendations = await engine.getRecommendations('#FF5733', {
      style: 'modern',
      mood: 'energetic',
    })

    expect(recommendations).toBeDefined()
    expect(recommendations.primaryColors).toBeInstanceOf(Array)
    expect(recommendations.primaryColors.length).toBeGreaterThan(0)
    expect(recommendations.confidence).toBeGreaterThanOrEqual(0)
    expect(recommendations.confidence).toBeLessThanOrEqual(1)
  })

  it('should learn from user interactions', async () => {
    const userInteractions = [
      { color: '#FF5733', action: 'like', context: { style: 'modern' } },
      { color: '#33FF57', action: 'dislike', context: { style: 'modern' } },
      { color: '#5733FF', action: 'like', context: { style: 'modern' } },
      { color: '#FFFF33', action: 'save', context: { style: 'modern' } },
    ]

    for (const interaction of userInteractions) {
      await engine.recordInteraction(
        'user123',
        interaction.color,
        interaction.action as any,
        interaction.context,
      )
    }

    await engine.trainOnUserData('user123')

    const personalizedRec = await engine.getPersonalizedRecommendations('user123')
    expect(personalizedRec).toBeDefined()
    expect(personalizedRec.recommendations).toBeInstanceOf(Array)
  })

  it('should analyze color trends', async () => {
    // Simulate trending colors
    const trendingColors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEAA7',
      '#DDA0DD',
      '#98D8C8',
      '#F7DC6F',
      '#BB8FCE',
      '#85C1E2',
    ]

    for (const color of trendingColors) {
      await engine.recordUsage(color, {
        timestamp: Date.now(),
        category: 'web-design',
      })
    }

    const trends = await engine.analyzeTrends(7)
    expect(trends).toBeDefined()
    expect(trends.trending).toBeInstanceOf(Array)
    expect(trends.predictions).toBeInstanceOf(Array)
  })

  it('should perform color clustering', async () => {
    const palette = [
      '#FF0000',
      '#FF3333',
      '#FF6666', // Reds
      '#00FF00',
      '#33FF33',
      '#66FF66', // Greens
      '#0000FF',
      '#3333FF',
      '#6666FF', // Blues
    ]

    const clusters = await engine.clusterColors(palette, 3)

    expect(clusters).toBeDefined()
    expect(clusters.length).toBe(3)

    clusters.forEach((cluster) => {
      expect(cluster.centroid).toMatch(/^#[0-9A-F]{6}$/i)
      expect(cluster.colors).toBeInstanceOf(Array)
      expect(cluster.colors.length).toBeGreaterThan(0)
    })
  })

  it('should generate harmonious palettes', async () => {
    const baseColor = '#3498db'
    const palettes = await engine.generatePalettes(baseColor, {
      count: 5,
      harmony: 'complementary',
      variation: 0.2,
    })

    expect(palettes).toBeInstanceOf(Array)
    expect(palettes.length).toBe(5)

    palettes.forEach((palette) => {
      expect(palette).toBeInstanceOf(Array)
      palette.forEach((color) => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i)
      })
    })
  })

  it('should calculate color similarity', async () => {
    const similarity1 = await engine.calculateSimilarity('#FF0000', '#FF0033')
    const similarity2 = await engine.calculateSimilarity('#FF0000', '#00FF00')

    expect(similarity1).toBeGreaterThan(similarity2)
    expect(similarity1).toBeGreaterThan(0.8)
    expect(similarity2).toBeLessThan(0.5)
  })

  it('should handle batch predictions', async () => {
    const inputs = [
      { baseColor: '#FF5733', context: { style: 'modern' } },
      { baseColor: '#33FF57', context: { style: 'vintage' } },
      { baseColor: '#5733FF', context: { style: 'minimalist' } },
    ]

    const predictions = await Promise.all(
      inputs.map(input =>
        engine.predictNextColor(input.baseColor, input.context),
      ),
    )

    expect(predictions).toHaveLength(3)
    predictions.forEach((pred) => {
      expect(pred).toHaveProperty('color')
      expect(pred).toHaveProperty('confidence')
      expect(pred.color).toMatch(/^#[0-9A-F]{6}$/i)
    })
  })

  it('should export and import model state', async () => {
    // Train model with some data
    await engine.recordInteraction('user456', '#FF5733', 'like', {})
    await engine.trainOnUserData('user456')

    // Export model
    const modelState = await engine.exportModel()
    expect(modelState).toBeDefined()
    expect(modelState).toHaveProperty('weights')
    expect(modelState).toHaveProperty('config')

    // Create new engine and import state
    const newEngine = new AIColorEngine({
      modelPath: './models/color-nn.json',
      cacheSize: 100,
    })
    await newEngine.initialize()
    await newEngine.importModel(modelState)

    // Verify imported model works
    const rec = await newEngine.getRecommendations('#FF5733', {})
    expect(rec).toBeDefined()
  })

  it('should handle edge cases gracefully', async () => {
    // Invalid color format
    await expect(async () => {
      await engine.getRecommendations('not-a-color', {})
    }).rejects.toThrow()

    // Empty palette clustering
    const emptyClusters = await engine.clusterColors([], 3)
    expect(emptyClusters).toEqual([])

    // Negative trend period
    const trends = await engine.analyzeTrends(-1)
    expect(trends.trending).toEqual([])
  })

  it('should provide performance metrics', async () => {
    const startTime = Date.now()

    // Perform multiple operations
    const operations = Array.from({ length: 10 }).fill(null).map((_, i) =>
      engine.getRecommendations(`#${i.toString(16).padStart(6, '0')}`, {}),
    )

    await Promise.all(operations)

    const endTime = Date.now()
    const avgTime = (endTime - startTime) / operations.length

    // Should complete within reasonable time (adjust threshold as needed)
    expect(avgTime).toBeLessThan(100) // 100ms per operation
  })
})

/**
 * AI 增强的颜色推荐引擎
 * 基于机器学习算法提供智能颜色推荐
 */

import type { SmartCache } from './smart-cache'
import { analyzeColor, type ColorAnalysis } from './color-analyzer'
import { hexToRgb, rgbToHex } from './color-converter'
import { createColorCache } from './smart-cache'

/**
 * 颜色趋势数据
 */
export interface ColorTrend {
  color: string
  popularity: number
  trendScore: number // 趋势分数 (-100 到 100，负数表示下降趋势)
  peakTime?: Date
  category: string
  region?: string
  industry?: string
}

/**
 * 用户偏好配置
 */
export interface UserPreference {
  userId: string
  favoriteColors: string[]
  dislikedColors: string[]
  preferredEmotions: string[]
  preferredSeasons: string[]
  industry?: string
  region?: string
  history: ColorInteraction[]
}

/**
 * 颜色交互记录
 */
export interface ColorInteraction {
  color: string
  action: 'view' | 'select' | 'reject' | 'save'
  timestamp: Date
  context?: string
  duration?: number // 停留时间（毫秒）
}

/**
 * 推荐结果
 */
export interface ColorRecommendation {
  colors: string[]
  confidence: number
  reasoning: string[]
  alternatives?: string[]
  trends?: ColorTrend[]
}

/**
 * 配色方案
 */
export interface ColorScheme {
  primary: string
  secondary: string
  accent: string
  neutral: string[]
  score: number
  tags: string[]
}

/**
 * 神经网络层
 */
class NeuralLayer {
  weights: number[][]
  biases: number[]
  activation: (x: number) => number

  constructor(
    inputSize: number,
    outputSize: number,
    activation: (x: number) => number = x => Math.max(0, x), // ReLU
  ) {
    // 初始化权重（Xavier 初始化）
    this.weights = Array.from({ length: outputSize }, () =>
      Array.from({ length: inputSize }, () => (Math.random() - 0.5) * Math.sqrt(2 / inputSize)))

    // 初始化偏置
    this.biases = Array.from({ length: outputSize }, () => 0)
    this.activation = activation
  }

  forward(input: number[]): number[] {
    return this.weights.map((neuronWeights, i) => {
      const sum = neuronWeights.reduce((acc, weight, j) => acc + weight * input[j], this.biases[i])
      return this.activation(sum)
    })
  }
}

/**
 * 简单的神经网络
 */
class SimpleNeuralNetwork {
  layers: NeuralLayer[]

  constructor(architecture: number[]) {
    this.layers = []
    for (let i = 0; i < architecture.length - 1; i++) {
      const activation
        = i === architecture.length - 2
          ? (x: number) => 1 / (1 + Math.exp(-x)) // Sigmoid for output
          : (x: number) => Math.max(0, x) // ReLU for hidden layers

      this.layers.push(new NeuralLayer(architecture[i], architecture[i + 1], activation))
    }
  }

  predict(input: number[]): number[] {
    let output = input
    for (const layer of this.layers) {
      output = layer.forward(output)
    }
    return output
  }

  /**
   * 训练网络（简化的梯度下降）
   */
  train(inputs: number[][], targets: number[][], epochs: number = 100, lr: number = 0.01): void {
    for (let epoch = 0; epoch < epochs; epoch++) {
      for (let i = 0; i < inputs.length; i++) {
        const output = this.predict(inputs[i])
        const error = targets[i].map((t, j) => t - output[j])

        // 简化的反向传播（仅更新最后一层）
        const lastLayer = this.layers[this.layers.length - 1]
        for (let j = 0; j < lastLayer.weights.length; j++) {
          for (let k = 0; k < lastLayer.weights[j].length; k++) {
            lastLayer.weights[j][k] += lr * error[j] * inputs[i][k]
          }
          lastLayer.biases[j] += lr * error[j]
        }
      }
    }
  }
}

/**
 * K-Means 聚类算法
 */
class KMeansClustering {
  k: number
  centroids: number[][] = []
  clusters: number[][] = []

  constructor(k: number) {
    this.k = k
  }

  /**
   * 执行聚类
   */
  fit(data: number[][], maxIterations: number = 100): void {
    // 随机初始化质心
    this.centroids = this.initializeCentroids(data)

    for (let iter = 0; iter < maxIterations; iter++) {
      // 分配数据点到最近的质心
      const newClusters: number[][] = Array.from({ length: this.k }, () => [])

      for (const point of data) {
        const closestCentroid = this.findClosestCentroid(point)
        newClusters[closestCentroid].push(...point)
      }

      // 更新质心
      const newCentroids = newClusters.map((cluster) => {
        if (cluster.length === 0)
          return this.centroids[0] // 防止空簇

        const dim = this.centroids[0].length
        const mean = Array.from({ length: dim }, () => 0)
        const clusterPoints = cluster.length / dim

        for (let i = 0; i < cluster.length; i += dim) {
          for (let j = 0; j < dim; j++) {
            mean[j] += cluster[i + j] / clusterPoints
          }
        }
        return mean
      })

      // 检查收敛
      if (this.hasConverged(this.centroids, newCentroids)) {
        break
      }

      this.centroids = newCentroids
      this.clusters = newClusters
    }
  }

  private initializeCentroids(data: number[][]): number[][] {
    const centroids: number[][] = []
    const indices = new Set<number>()

    while (centroids.length < this.k) {
      const idx = Math.floor(Math.random() * data.length)
      if (!indices.has(idx)) {
        indices.add(idx)
        centroids.push([...data[idx]])
      }
    }

    return centroids
  }

  private findClosestCentroid(point: number[]): number {
    let minDist = Infinity
    let closest = 0

    for (let i = 0; i < this.centroids.length; i++) {
      const dist = this.euclideanDistance(point, this.centroids[i])
      if (dist < minDist) {
        minDist = dist
        closest = i
      }
    }

    return closest
  }

  private euclideanDistance(a: number[], b: number[]): number {
    return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0))
  }

  private hasConverged(old: number[][], new_: number[][]): boolean {
    for (let i = 0; i < old.length; i++) {
      if (this.euclideanDistance(old[i], new_[i]) > 0.001) {
        return false
      }
    }
    return true
  }

  /**
   * 预测新数据点的簇
   */
  predict(point: number[]): number {
    return this.findClosestCentroid(point)
  }
}

/**
 * AI 颜色推荐引擎
 */
export class AIColorEngine {
  private network: SimpleNeuralNetwork
  private clustering: KMeansClustering
  private cache: SmartCache
  private trendData: Map<string, ColorTrend> = new Map()
  private userPreferences: Map<string, UserPreference> = new Map()

  constructor() {
    // 初始化神经网络（输入：RGB + HSL，输出：评分）
    this.network = new SimpleNeuralNetwork([6, 12, 8, 1])

    // 初始化聚类（5个颜色簇）
    this.clustering = new KMeansClustering(5)

    // 初始化缓存
    this.cache = createColorCache()

    // 加载预训练数据
    this.loadPretrainedModel()
  }

  /**
   * 初始化引擎
   */
  async init(): Promise<void> {
    await this.cache.init()
    await this.loadTrendData()
    await this.trainModels()
  }

  /**
   * 获取个性化推荐
   */
  async getRecommendations(
    userId: string,
    context?: {
      industry?: string
      emotion?: string
      season?: string
      baseColor?: string
    },
  ): Promise<ColorRecommendation> {
    const cacheKey = `recommendations:${userId}:${JSON.stringify(context)}`

    // 尝试从缓存获取
    const cached = await this.cache.get<ColorRecommendation>(cacheKey)
    if (cached) {
      return cached
    }

    // 获取用户偏好
    const userPref = this.userPreferences.get(userId) || this.createDefaultPreference(userId)

    // 生成特征向量
    const features = this.extractFeatures(userPref, context)

    // 使用神经网络预测
    const predictions = this.predictColors(features)

    // 应用聚类分析
    const clusters = this.applyClusteringAnalysis(predictions)

    // 结合趋势数据
    const withTrends = this.incorporateTrends(clusters, context)

    // 生成推荐
    const recommendation: ColorRecommendation = {
      colors: withTrends.slice(0, 5),
      confidence: this.calculateConfidence(predictions),
      reasoning: this.generateReasoning(userPref, context),
      alternatives: withTrends.slice(5, 10),
      trends: this.getRelevantTrends(context),
    }

    // 缓存结果
    await this.cache.set(cacheKey, recommendation, { ttl: 3600000 }) // 1小时

    return recommendation
  }

  /**
   * 生成智能配色方案
   */
  async generateColorScheme(
    baseColor: string,
    style: 'modern' | 'classic' | 'bold' | 'minimal' | 'natural' = 'modern',
  ): Promise<ColorScheme> {
    const cacheKey = `scheme:${baseColor}:${style}`

    // 尝试从缓存获取
    const cached = await this.cache.get<ColorScheme>(cacheKey)
    if (cached) {
      return cached
    }

    // 分析基础颜色
    const analysis = analyzeColor(baseColor)

    // 根据风格生成配色
    const scheme = await this.generateSchemeByStyle(baseColor, analysis, style)

    // 评分
    scheme.score = this.evaluateScheme(scheme)

    // 缓存结果
    await this.cache.set(cacheKey, scheme, { ttl: 7200000 }) // 2小时

    return scheme
  }

  /**
   * 学习用户偏好
   */
  async learnFromInteraction(userId: string, interaction: ColorInteraction): Promise<void> {
    let userPref = this.userPreferences.get(userId)

    if (!userPref) {
      userPref = this.createDefaultPreference(userId)
      this.userPreferences.set(userId, userPref)
    }

    // 记录交互
    userPref.history.push(interaction)

    // 更新偏好
    if (interaction.action === 'select' || interaction.action === 'save') {
      if (!userPref.favoriteColors.includes(interaction.color)) {
        userPref.favoriteColors.push(interaction.color)
      }
    }
    else if (interaction.action === 'reject') {
      if (!userPref.dislikedColors.includes(interaction.color)) {
        userPref.dislikedColors.push(interaction.color)
      }
    }

    // 限制历史记录大小
    if (userPref.history.length > 1000) {
      userPref.history = userPref.history.slice(-1000)
    }

    // 重新训练个人模型
    await this.retrainUserModel(userId)
  }

  /**
   * 预测颜色趋势
   */
  async predictTrends(
    timeframe: 'week' | 'month' | 'season' | 'year' = 'month',
  ): Promise<ColorTrend[]> {
    const trends: ColorTrend[] = []

    // 分析历史数据
    const historicalData = await this.getHistoricalData(timeframe)

    // 使用时间序列分析预测趋势
    for (const [color, data] of historicalData) {
      const trend = this.analyzeTimeSeries(data)
      trends.push({
        color,
        popularity: trend.currentPopularity,
        trendScore: trend.trendScore,
        peakTime: trend.predictedPeak,
        category: this.categorizeColor(color),
        region: 'global',
      })
    }

    // 按趋势分数排序
    trends.sort((a, b) => b.trendScore - a.trendScore)

    return trends.slice(0, 20) // 返回前20个趋势
  }

  /**
   * 提取特征向量
   */
  private extractFeatures(userPref: UserPreference, context?: any): number[] {
    const features: number[] = []

    // 用户历史偏好特征
    const colorStats = this.analyzeUserColorHistory(userPref.history)
    features.push(...colorStats)

    // 上下文特征
    if (context) {
      features.push(
        context.industry ? this.encodeIndustry(context.industry) : 0,
        context.emotion ? this.encodeEmotion(context.emotion) : 0,
        context.season ? this.encodeSeason(context.season) : 0,
      )
    }

    // 时间特征
    const now = new Date()
    features.push(
      now.getMonth() / 11, // 月份归一化
      now.getHours() / 23, // 小时归一化
    )

    return features
  }

  /**
   * 使用神经网络预测颜色
   */
  private predictColors(features: number[]): string[] {
    const predictions: Array<{ color: string, score: number }> = []

    // 生成候选颜色
    const candidates = this.generateCandidateColors()

    for (const color of candidates) {
      const rgb = hexToRgb(color)
      if (!rgb)
        continue

      // 构建输入向量
      const input = [
        rgb.r / 255,
        rgb.g / 255,
        rgb.b / 255,
        ...features.slice(0, 3), // 使用部分特征
      ]

      // 预测评分
      const [score] = this.network.predict(input)
      predictions.push({ color, score })
    }

    // 按评分排序
    predictions.sort((a, b) => b.score - a.score)

    return predictions.map(p => p.color)
  }

  /**
   * 应用聚类分析
   */
  private applyClusteringAnalysis(colors: string[]): string[] {
    // 将颜色转换为特征向量
    const colorVectors = colors.map((color) => {
      const rgb = hexToRgb(color)
      return rgb ? [rgb.r / 255, rgb.g / 255, rgb.b / 255] : [0, 0, 0]
    })

    // 执行聚类
    this.clustering.fit(colorVectors)

    // 从每个簇中选择代表颜色
    const representatives: string[] = []
    for (let i = 0; i < this.clustering.k; i++) {
      const clusterColors = colors.filter(
        (_, idx) => this.clustering.predict(colorVectors[idx]) === i,
      )
      if (clusterColors.length > 0) {
        representatives.push(clusterColors[0])
      }
    }

    return representatives
  }

  /**
   * 结合趋势数据
   */
  private incorporateTrends(colors: string[], _context?: any): string[] {
    return colors.map((color) => {
      const trend = this.trendData.get(color)
      if (trend && trend.trendScore > 50) {
        return color // 保留趋势色
      }
      // 寻找相似的趋势色
      return this.findTrendingAlternative(color) || color
    })
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(predictions: string[]): number {
    // 简化实现：基于预测的一致性
    return Math.min(0.95, predictions.length / 10)
  }

  /**
   * 生成推理说明
   */
  private generateReasoning(userPref: UserPreference, context?: any): string[] {
    const reasoning: string[] = []

    if (userPref.favoriteColors.length > 0) {
      reasoning.push(`基于您喜欢的颜色：${userPref.favoriteColors.slice(0, 3).join(', ')}`)
    }

    if (context?.emotion) {
      reasoning.push(`适合${context.emotion}情感表达`)
    }

    if (context?.season) {
      reasoning.push(`符合${context.season}季节特征`)
    }

    if (context?.industry) {
      reasoning.push(`适用于${context.industry}行业`)
    }

    reasoning.push('结合当前流行趋势')

    return reasoning
  }

  /**
   * 根据风格生成配色方案
   */
  private async generateSchemeByStyle(
    baseColor: string,
    analysis: ColorAnalysis,
    style: string,
  ): Promise<ColorScheme> {
    const scheme: Partial<ColorScheme> = {
      primary: baseColor,
      tags: [style, analysis.season, ...analysis.emotions],
    }

    switch (style) {
      case 'modern':
        scheme.secondary = this.generateComplementary(baseColor, 0.7)
        scheme.accent = this.generateAnalogous(baseColor, 30)
        scheme.neutral = this.generateNeutrals(baseColor, 3)
        break

      case 'classic':
        scheme.secondary = this.generateAnalogous(baseColor, 60)
        scheme.accent = this.generateComplementary(baseColor, 0.5)
        scheme.neutral = ['#F5F5F5', '#E0E0E0', '#333333']
        break

      case 'bold':
        scheme.secondary = this.generateComplementary(baseColor, 1)
        scheme.accent = this.generateTriadic(baseColor)[0]
        scheme.neutral = ['#000000', '#FFFFFF']
        break

      case 'minimal':
        scheme.secondary = this.adjustSaturation(baseColor, 0.3)
        scheme.accent = this.adjustBrightness(baseColor, 1.2)
        scheme.neutral = ['#FAFAFA', '#F0F0F0', '#666666', '#333333']
        break

      case 'natural':
        scheme.secondary = this.generateEarthTone(baseColor)
        scheme.accent = this.generateAnalogous(baseColor, 45)
        scheme.neutral = this.generateNaturalNeutrals()
        break
    }

    return scheme as ColorScheme
  }

  // 辅助方法
  private generateComplementary(color: string, intensity: number): string {
    const rgb = hexToRgb(color)
    if (!rgb)
      return color

    return rgbToHex(
      255 - Math.round(rgb.r * intensity),
      255 - Math.round(rgb.g * intensity),
      255 - Math.round(rgb.b * intensity),
    )
  }

  private generateAnalogous(color: string, degrees: number): string {
    // 简化实现
    const rgb = hexToRgb(color)
    if (!rgb)
      return color

    const shift = degrees / 360
    return rgbToHex(
      Math.round(rgb.r * (1 + shift)) % 256,
      Math.round(rgb.g * (1 - shift / 2)) % 256,
      Math.round(rgb.b * (1 + shift / 3)) % 256,
    )
  }

  private generateTriadic(color: string): string[] {
    // 简化实现
    return [this.generateAnalogous(color, 120), this.generateAnalogous(color, 240)]
  }

  private generateNeutrals(_baseColor: string, count: number): string[] {
    const neutrals: string[] = []
    for (let i = 0; i < count; i++) {
      const gray = 240 - i * 30
      neutrals.push(rgbToHex(gray, gray, gray))
    }
    return neutrals
  }

  private generateEarthTone(color: string): string {
    const rgb = hexToRgb(color)
    if (!rgb)
      return color

    // 向棕色调整
    return rgbToHex(
      Math.round(rgb.r * 0.8 + 51),
      Math.round(rgb.g * 0.6 + 34),
      Math.round(rgb.b * 0.4 + 17),
    )
  }

  private generateNaturalNeutrals(): string[] {
    return ['#F5F2ED', '#E8E4DC', '#8B7355', '#3E2723']
  }

  private adjustSaturation(color: string, factor: number): string {
    const rgb = hexToRgb(color)
    if (!rgb)
      return color

    const gray = (rgb.r + rgb.g + rgb.b) / 3
    return rgbToHex(
      Math.round(gray + (rgb.r - gray) * factor),
      Math.round(gray + (rgb.g - gray) * factor),
      Math.round(gray + (rgb.b - gray) * factor),
    )
  }

  private adjustBrightness(color: string, factor: number): string {
    const rgb = hexToRgb(color)
    if (!rgb)
      return color

    return rgbToHex(
      Math.min(255, Math.round(rgb.r * factor)),
      Math.min(255, Math.round(rgb.g * factor)),
      Math.min(255, Math.round(rgb.b * factor)),
    )
  }

  private evaluateScheme(scheme: ColorScheme): number {
    // 简化的评分算法
    let score = 50

    // 对比度评分
    score += this.evaluateContrast(scheme) * 20

    // 和谐度评分
    score += this.evaluateHarmony(scheme) * 20

    // 趋势评分
    score += this.evaluateTrendiness(scheme) * 10

    return Math.min(100, Math.max(0, score))
  }

  private evaluateContrast(_scheme: ColorScheme): number {
    // 简化实现
    return 0.7
  }

  private evaluateHarmony(_scheme: ColorScheme): number {
    // 简化实现
    return 0.8
  }

  private evaluateTrendiness(_scheme: ColorScheme): number {
    // 简化实现
    return 0.6
  }

  // 其他辅助方法
  private createDefaultPreference(userId: string): UserPreference {
    return {
      userId,
      favoriteColors: [],
      dislikedColors: [],
      preferredEmotions: [],
      preferredSeasons: [],
      history: [],
    }
  }

  private analyzeUserColorHistory(_history: ColorInteraction[]): number[] {
    // 简化实现
    return [0.5, 0.5, 0.5]
  }

  private encodeIndustry(industry: string): number {
    const industries = ['technology', 'healthcare', 'finance', 'education', 'retail']
    return industries.indexOf(industry) / industries.length
  }

  private encodeEmotion(emotion: string): number {
    const emotions = ['energetic', 'calm', 'professional', 'playful']
    return emotions.indexOf(emotion) / emotions.length
  }

  private encodeSeason(season: string): number {
    const seasons = ['spring', 'summer', 'autumn', 'winter']
    return seasons.indexOf(season) / seasons.length
  }

  private generateCandidateColors(): string[] {
    // 生成候选颜色集
    const candidates: string[] = []
    for (let r = 0; r <= 255; r += 51) {
      for (let g = 0; g <= 255; g += 51) {
        for (let b = 0; b <= 255; b += 51) {
          candidates.push(rgbToHex(r, g, b))
        }
      }
    }
    return candidates
  }

  private findTrendingAlternative(color: string): string | null {
    // 查找相似的趋势色
    let minDistance = Infinity
    let trendingColor: string | null = null

    const rgb = hexToRgb(color)
    if (!rgb)
      return null

    for (const [tColor, trend] of this.trendData) {
      if (trend.trendScore < 50)
        continue

      const tRgb = hexToRgb(tColor)
      if (!tRgb)
        continue

      const distance = Math.sqrt(
        (rgb.r - tRgb.r) ** 2 + (rgb.g - tRgb.g) ** 2 + (rgb.b - tRgb.b) ** 2,
      )

      if (distance < minDistance && distance < 50) {
        minDistance = distance
        trendingColor = tColor
      }
    }

    return trendingColor
  }

  private getRelevantTrends(context?: any): ColorTrend[] {
    const trends: ColorTrend[] = []

    for (const trend of this.trendData.values()) {
      if (context?.industry && trend.industry === context.industry) {
        trends.push(trend)
      }
      else if (context?.region && trend.region === context.region) {
        trends.push(trend)
      }
    }

    return trends.slice(0, 5)
  }

  private categorizeColor(color: string): string {
    const analysis = analyzeColor(color)
    return analysis.emotions[0] || 'neutral'
  }

  private async getHistoricalData(_timeframe: string): Promise<Map<string, any[]>> {
    // 简化实现
    return new Map()
  }

  private analyzeTimeSeries(_data: any[]): any {
    // 简化实现
    return {
      currentPopularity: 0.5,
      trendScore: 0,
      predictedPeak: new Date(),
    }
  }

  private async retrainUserModel(_userId: string): Promise<void> {
    // 简化实现
  }

  private loadPretrainedModel(): void {
    // 加载预训练权重
    // 简化实现
  }

  private async loadTrendData(): Promise<void> {
    // 加载趋势数据
    // 简化实现：添加一些示例数据
    this.trendData.set('#FF6B6B', {
      color: '#FF6B6B',
      popularity: 0.8,
      trendScore: 75,
      category: 'energetic',
    })

    this.trendData.set('#4ECDC4', {
      color: '#4ECDC4',
      popularity: 0.85,
      trendScore: 82,
      category: 'calm',
    })
  }

  private async trainModels(): Promise<void> {
    // 训练模型
    // 简化实现
  }
}

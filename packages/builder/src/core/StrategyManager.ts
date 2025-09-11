/**
 * 策略管理器
 * 
 * 负责管理不同库类型的构建策略
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import type {
  ILibraryStrategy,
  StrategyManagerOptions,
  StrategyDetectionResult,
  StrategyApplicationResult
} from '../types/strategy'
import { LibraryType } from '../types/library'
import type { BuilderConfig } from '../types/config'
import { Logger } from '../utils/logger'
import { ErrorHandler, BuilderError } from '../utils/error-handler'
import { ErrorCode } from '../constants/errors'

// 导入具体策略实现
import { TypeScriptStrategy } from '../strategies/typescript/TypeScriptStrategy'
import { StyleStrategy } from '../strategies/style/StyleStrategy'
import { Vue3Strategy } from '../strategies/vue3/Vue3Strategy'
import { Vue2Strategy } from '../strategies/vue2/Vue2Strategy'
import { ReactStrategy } from '../strategies/react/ReactStrategy'
import { SvelteStrategy } from '../strategies/svelte/SvelteStrategy'
import { SolidStrategy } from '../strategies/solid/SolidStrategy'
import { PreactStrategy } from '../strategies/preact/PreactStrategy'
import { LitStrategy } from '../strategies/lit/LitStrategy'
import { AngularStrategy } from '../strategies/angular/AngularStrategy'
import { MixedStrategy } from '../strategies/mixed/MixedStrategy'


/**
 * 策略管理器类
 */
export class StrategyManager {
  private logger: Logger
  private errorHandler: ErrorHandler
  private strategies: Map<LibraryType, ILibraryStrategy> = new Map()

  constructor(_options: StrategyManagerOptions = {}) {
    this.logger = (_options as any).logger || new Logger()
    this.errorHandler = new ErrorHandler({ logger: this.logger })

    // 注册默认策略
    this.registerDefaultStrategies()
  }

  /**
   * 注册策略
   */
  registerStrategy(strategy: ILibraryStrategy): void {
    for (const type of strategy.supportedTypes) {
      this.strategies.set(type, strategy)
    }

    this.logger.debug(`注册策略: ${strategy.name}`)
  }

  /**
   * 获取策略
   */
  getStrategy(libraryType: LibraryType): ILibraryStrategy {
    const strategy = this.strategies.get(libraryType)

    if (!strategy) {
      throw new BuilderError(
        ErrorCode.CONFIG_VALIDATION_ERROR,
        `未找到库类型 ${libraryType} 的策略`
      )
    }

    return strategy
  }

  /**
   * 检测最佳策略
   */
  async detectStrategy(_projectPath: string): Promise<StrategyDetectionResult> {
    // TODO: 实现策略检测逻辑
    // 这里先返回一个默认结果
    return {
      strategy: LibraryType.TYPESCRIPT,
      confidence: 0.8,
      evidence: [],
      alternatives: []
    }
  }

  /**
   * 应用策略
   */
  async applyStrategy(
    libraryType: LibraryType,
    config: BuilderConfig
  ): Promise<StrategyApplicationResult> {
    const startTime = Date.now()

    try {
      const strategy = this.getStrategy(libraryType)

      // 验证策略是否适用
      if (!strategy.isApplicable(config)) {
        throw new BuilderError(
          ErrorCode.CONFIG_VALIDATION_ERROR,
          `策略 ${strategy.name} 不适用于当前配置`
        )
      }

      // 应用策略
      const transformedConfig = await strategy.applyStrategy(config)
      const plugins = strategy.getRecommendedPlugins(config)

      const duration = Date.now() - startTime

      return {
        strategy,
        config: transformedConfig,
        plugins,
        duration,
        warnings: [],
        optimizations: []
      }

    } catch (error) {
      this.errorHandler.handle(error as Error, 'applyStrategy')
      throw error
    }
  }

  /**
   * 获取所有已注册的策略
   */
  getAllStrategies(): ILibraryStrategy[] {
    return Array.from(this.strategies.values())
  }

  /**
   * 获取支持的库类型
   */
  getSupportedTypes(): LibraryType[] {
    return Array.from(this.strategies.keys())
  }

  /**
   * 注册默认策略
   */
  private registerDefaultStrategies(): void {
    // TypeScript 策略
    this.registerStrategy(new TypeScriptStrategy())

    // Vue3 策略
    this.registerStrategy(new Vue3Strategy())

    // Vue2 策略
    this.registerStrategy(new Vue2Strategy())

    // 样式策略
    this.registerStrategy(new StyleStrategy())

    // React 策略
    this.registerStrategy(new ReactStrategy())

    // Svelte 策略
    this.registerStrategy(new SvelteStrategy())

    // Solid 策略
    this.registerStrategy(new SolidStrategy())

    // Preact 策略
    this.registerStrategy(new PreactStrategy())

    // Lit / Web Components 策略
    this.registerStrategy(new LitStrategy())

    // Angular（基础）策略
    this.registerStrategy(new AngularStrategy())

    // 混合策略
    this.registerStrategy(new MixedStrategy())
  }
}

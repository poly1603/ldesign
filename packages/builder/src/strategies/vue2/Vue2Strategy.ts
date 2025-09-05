/**
 * Vue2 策略
 */

import type { ILibraryStrategy } from '../../types/strategy'
import { LibraryType } from '../../types/library'
import type { BuilderConfig } from '../../types/config'

export class Vue2Strategy implements ILibraryStrategy {
  readonly name = 'vue2'
  readonly supportedTypes: LibraryType[] = [LibraryType.VUE2]
  readonly priority = 10

  async applyStrategy(config: BuilderConfig): Promise<any> {
    return config
  }

  isApplicable(config: BuilderConfig): boolean {
    return config.libraryType === LibraryType.VUE2
  }

  getDefaultConfig(): Partial<BuilderConfig> {
    return {}
  }

  getRecommendedPlugins(_config: BuilderConfig): any[] {
    return []
  }

  validateConfig(_config: BuilderConfig): any {
    return {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    }
  }
}

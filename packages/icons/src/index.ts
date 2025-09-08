import type {
  IconConfig,
  SVGInfo,
  GenerationResult,
  ValidationResult,
  TargetFramework
} from './types';
import {
  readSvgFiles,
  optimizeSvgContent,
  toComponentName,
  validateSvgContent,
  calculateSvgHash
} from './utils/svg';
import { SVGParser } from './utils/parser';
import { ConfigManager } from './utils/config';
import { generateVue2Components } from './generators/vue2';
import { generateVue3Components } from './generators/vue3';
import { generateReactComponents } from './generators/react';
import { generateLitComponents } from './generators/lit';

/**
 * 图标转换器主类
 * 提供完整的 SVG 到组件转换功能
 */
export class IconConverter {
  private config: IconConfig;
  private stats: NonNullable<GenerationResult['stats']> = {
    totalIcons: 0,
    generatedFiles: 0,
    totalSize: 0,
    optimizedSize: 0,
    compressionRatio: 0
  };

  constructor(config: Partial<IconConfig>) {
    this.config = ConfigManager.mergeWithDefaults(config);

    // 验证配置
    const validation = ConfigManager.validate(this.config);
    if (!validation.valid) {
      throw new Error(`配置验证失败: ${validation.errors.join(', ')}`);
    }

    if (validation.warnings.length > 0) {
      console.warn('配置警告:', validation.warnings.join(', '));
    }
  }

  /**
   * 转换 SVG 文件为组件
   * @returns 生成结果
   */
  async convert(): Promise<GenerationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const generatedFiles: string[] = [];

    try {
      console.log('🔍 读取 SVG 文件...');

      // 读取 SVG 文件
      const svgFiles = await readSvgFiles(this.config.inputDir, {
        recursive: true,
        includeMetadata: true,
        filter: (fileName) => !fileName.startsWith('.')
      });

      if (svgFiles.length === 0) {
        throw new Error(`在目录 ${this.config.inputDir} 中未找到 SVG 文件`);
      }

      console.log(`📁 找到 ${svgFiles.length} 个 SVG 文件`);
      this.stats.totalIcons = svgFiles.length;

      // 处理每个 SVG 文件
      const icons: SVGInfo[] = [];

      for (const svg of svgFiles) {
        try {
          const processedIcon = await this.processSvgFile(svg);
          icons.push(processedIcon);
        } catch (error) {
          errors.push(`处理文件 ${svg.fileName} 时出错: ${error}`);
          console.error(`❌ 处理文件 ${svg.fileName} 失败:`, error);
        }
      }

      if (icons.length === 0) {
        throw new Error('没有成功处理的 SVG 文件');
      }

      console.log(`✅ 成功处理 ${icons.length} 个图标`);

      // 生成组件
      console.log(`🚀 生成 ${this.config.target} 组件...`);
      const options = { icons, config: this.config };

      await this.generateComponents(options);

      // 计算统计信息
      this.calculateStats(icons);

      console.log('🎉 转换完成!');
      console.log(`📊 统计信息:`);
      console.log(`   - 总图标数: ${this.stats.totalIcons}`);
      console.log(`   - 生成文件数: ${this.stats.generatedFiles}`);
      console.log(`   - 原始大小: ${(this.stats.totalSize / 1024).toFixed(2)} KB`);
      if (this.stats.optimizedSize) {
        console.log(`   - 优化后大小: ${(this.stats.optimizedSize / 1024).toFixed(2)} KB`);
        console.log(`   - 压缩率: ${((this.stats.compressionRatio || 0) * 100).toFixed(1)}%`);
      }

      return {
        success: true,
        files: generatedFiles,
        errors,
        warnings,
        stats: this.stats
      };

    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));

      return {
        success: false,
        files: generatedFiles,
        errors,
        warnings,
        stats: this.stats
      };
    }
  }

  /**
   * 处理单个 SVG 文件
   */
  private async processSvgFile(svg: SVGInfo): Promise<SVGInfo> {
    // 验证 SVG 内容
    const validation = validateSvgContent(svg.content);
    if (!validation.valid) {
      throw new Error(`SVG 验证失败: ${validation.errors.join(', ')}`);
    }

    // 生成组件名称
    const componentName = toComponentName(svg.name, this.config.prefix, this.config.suffix);

    // 解析 SVG 结构
    const parsed = SVGParser.parse(svg.content);

    // 优化 SVG（如果启用）
    let optimizedContent: string | undefined;
    if (this.config.optimize) {
      const optimized = optimizeSvgContent(svg.content, this.config.svgoConfig);
      optimizedContent = optimized.data;
    }

    return {
      ...svg,
      componentName,
      parsed,
      optimizedContent
    };
  }

  /**
   * 生成组件文件
   */
  private async generateComponents(options: { icons: SVGInfo[]; config: IconConfig }): Promise<void> {
    const generators: Record<TargetFramework, (options: any) => Promise<void>> = {
      vue2: generateVue2Components,
      vue3: generateVue3Components,
      react: generateReactComponents,
      lit: generateLitComponents,
      angular: this.generateAngularComponents,
      svelte: this.generateSvelteComponents
    };

    const generator = generators[this.config.target];
    if (!generator) {
      throw new Error(`不支持的目标框架: ${this.config.target}`);
    }

    await generator(options);
  }

  /**
   * Angular 组件生成器（占位符）
   */
  private async generateAngularComponents(options: any): Promise<void> {
    throw new Error('Angular 组件生成器尚未实现');
  }

  /**
   * Svelte 组件生成器（占位符）
   */
  private async generateSvelteComponents(options: any): Promise<void> {
    throw new Error('Svelte 组件生成器尚未实现');
  }

  /**
   * 计算统计信息
   */
  private calculateStats(icons: SVGInfo[]): void {
    this.stats.totalSize = icons.reduce((sum, icon) => sum + (icon.fileSize || 0), 0);

    if (this.config.optimize) {
      this.stats.optimizedSize = icons.reduce((sum, icon) => {
        return sum + (icon.optimizedContent?.length || icon.content.length);
      }, 0);

      this.stats.compressionRatio = this.stats.totalSize > 0
        ? 1 - (this.stats.optimizedSize / this.stats.totalSize)
        : 0;
    }
  }

  /**
   * 获取配置信息
   */
  getConfig(): IconConfig {
    return { ...this.config };
  }

  /**
   * 获取配置摘要
   */
  getConfigSummary(): string {
    return ConfigManager.getSummary(this.config);
  }
}

/**
 * 便捷的转换函数（向后兼容）
 * @param config 配置对象
 * @returns 生成结果
 */
export async function convert(config: IconConfig): Promise<GenerationResult> {
  const converter = new IconConverter(config);
  return await converter.convert();
}

/**
 * 验证配置
 * @param config 配置对象
 * @returns 验证结果
 */
export function validateConfig(config: Partial<IconConfig>): ValidationResult {
  try {
    const fullConfig = ConfigManager.mergeWithDefaults(config);
    return ConfigManager.validate(fullConfig);
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : String(error)],
      warnings: []
    };
  }
}

// 导出所有类型和工具
export * from './types';
export * from './utils/svg';
export * from './utils/parser';
export * from './utils/config';
export { generateVue2Components } from './generators/vue2';
export { generateVue3Components } from './generators/vue3';
export { generateReactComponents } from './generators/react';
export { generateLitComponents } from './generators/lit';

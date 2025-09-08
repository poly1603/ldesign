import path from 'path';
import fs from 'fs-extra';
import type {
  IconConfig,
  TargetFramework,
  ColorTheme,
  SizePresets,
  AdvancedFeatures,
  ComponentProps,
  SVGOConfig,
  ValidationResult
} from '../types';
import { getDefaultSvgoConfig } from './svg';

/**
 * 配置管理器
 * 提供配置验证、合并和默认值处理
 */
export class ConfigManager {
  /**
   * 创建默认配置
   * @param target 目标框架
   * @param inputDir 输入目录
   * @param outputDir 输出目录
   * @returns 默认配置
   */
  static createDefault(
    target: TargetFramework,
    inputDir: string,
    outputDir: string
  ): IconConfig {
    return {
      target,
      inputDir,
      outputDir,
      prefix: '',
      suffix: 'Icon',
      optimize: true,
      typescript: true,
      theme: this.getDefaultTheme(),
      sizes: this.getDefaultSizes(),
      features: this.getDefaultFeatures(),
      componentProps: this.getDefaultComponentProps(),
      svgoConfig: getDefaultSvgoConfig(),
      packageName: `@ldesign/icons-${target}`,
      packageVersion: '1.0.0',
      packageDescription: `${target.charAt(0).toUpperCase() + target.slice(1)} icon components`
    };
  }

  /**
   * 从文件加载配置
   * @param configPath 配置文件路径
   * @returns 配置对象
   */
  static async loadFromFile(configPath: string): Promise<IconConfig> {
    if (!await fs.pathExists(configPath)) {
      throw new Error(`配置文件不存在: ${configPath}`);
    }

    const ext = path.extname(configPath).toLowerCase();
    let config: Partial<IconConfig>;

    try {
      if (ext === '.json') {
        config = await fs.readJson(configPath);
      } else if (ext === '.js' || ext === '.mjs') {
        const module = await import(path.resolve(configPath));
        config = module.default || module;
      } else {
        throw new Error(`不支持的配置文件格式: ${ext}`);
      }
    } catch (error) {
      throw new Error(`读取配置文件失败: ${error}`);
    }

    return this.mergeWithDefaults(config);
  }

  /**
   * 合并配置与默认值
   * @param userConfig 用户配置
   * @returns 完整配置
   */
  static mergeWithDefaults(userConfig: Partial<IconConfig>): IconConfig {
    if (!userConfig.target || !userConfig.inputDir || !userConfig.outputDir) {
      throw new Error('必须提供 target、inputDir 和 outputDir');
    }

    const defaultConfig = this.createDefault(
      userConfig.target,
      userConfig.inputDir,
      userConfig.outputDir
    );

    return {
      ...defaultConfig,
      ...userConfig,
      theme: { ...defaultConfig.theme, ...userConfig.theme },
      sizes: { ...defaultConfig.sizes, ...userConfig.sizes },
      features: { ...defaultConfig.features, ...userConfig.features },
      componentProps: { ...defaultConfig.componentProps, ...userConfig.componentProps },
      svgoConfig: userConfig.svgoConfig || defaultConfig.svgoConfig
    };
  }

  /**
   * 验证配置
   * @param config 配置对象
   * @returns 验证结果
   */
  static validate(config: IconConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证必需字段
    if (!config.target) {
      errors.push('target 字段是必需的');
    } else if (!this.getSupportedFrameworks().includes(config.target)) {
      errors.push(`不支持的目标框架: ${config.target}`);
    }

    if (!config.inputDir) {
      errors.push('inputDir 字段是必需的');
    }

    if (!config.outputDir) {
      errors.push('outputDir 字段是必需的');
    }

    // 验证路径
    if (config.inputDir && !path.isAbsolute(config.inputDir)) {
      warnings.push('建议使用绝对路径作为 inputDir');
    }

    if (config.outputDir && !path.isAbsolute(config.outputDir)) {
      warnings.push('建议使用绝对路径作为 outputDir');
    }

    // 验证组件名称配置
    if (config.prefix && !/^[A-Za-z][A-Za-z0-9]*$/.test(config.prefix)) {
      errors.push('prefix 必须是有效的标识符');
    }

    if (config.suffix && !/^[A-Za-z][A-Za-z0-9]*$/.test(config.suffix)) {
      errors.push('suffix 必须是有效的标识符');
    }

    // 验证包名称
    if (config.packageName && !/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(config.packageName)) {
      warnings.push('packageName 格式可能不正确');
    }

    // 验证版本号
    if (config.packageVersion && !/^\d+\.\d+\.\d+/.test(config.packageVersion)) {
      warnings.push('packageVersion 应该遵循语义化版本规范');
    }

    // 验证主题配置
    if (config.theme) {
      this.validateTheme(config.theme, errors, warnings);
    }

    // 验证尺寸配置
    if (config.sizes) {
      this.validateSizes(config.sizes, errors, warnings);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 获取支持的框架列表
   * @returns 框架列表
   */
  static getSupportedFrameworks(): TargetFramework[] {
    return ['vue2', 'vue3', 'react', 'lit', 'angular', 'svelte'];
  }

  /**
   * 获取默认主题配置
   * @returns 默认主题
   */
  private static getDefaultTheme(): ColorTheme {
    return {
      primary: '#722ED1',
      secondary: '#8C5AD3',
      success: '#42BD42',
      warning: '#F0B80F',
      error: '#DD2222',
      info: '#1890FF',
      custom: {}
    };
  }

  /**
   * 获取默认尺寸配置
   * @returns 默认尺寸
   */
  private static getDefaultSizes(): SizePresets {
    return {
      xs: '12px',
      sm: '16px',
      md: '20px',
      lg: '24px',
      xl: '32px'
    };
  }

  /**
   * 获取默认功能配置
   * @returns 默认功能
   */
  private static getDefaultFeatures(): AdvancedFeatures {
    return {
      animation: true,
      theming: true,
      rtl: false,
      preview: true,
      dts: true,
      treeshaking: true
    };
  }

  /**
   * 获取默认组件属性配置
   * @returns 默认组件属性
   */
  private static getDefaultComponentProps(): ComponentProps {
    return {
      defaultSize: 'md',
      defaultColor: 'currentColor',
      customClass: true,
      customStyle: true,
      extraProps: {}
    };
  }

  /**
   * 验证主题配置
   * @param theme 主题配置
   * @param errors 错误数组
   * @param warnings 警告数组
   */
  private static validateTheme(theme: ColorTheme, errors: string[], warnings: string[]): void {
    // 更严格的颜色验证正则表达式
    const colorRegex = /^(#[0-9A-Fa-f]{3,8}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)|transparent|currentColor|inherit|initial|unset|red|green|blue|yellow|orange|purple|pink|brown|black|white|gray|grey)$/;

    Object.entries(theme).forEach(([key, value]) => {
      if (key === 'custom') {
        if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([customKey, customValue]) => {
            if (typeof customValue === 'string' && !colorRegex.test(customValue)) {
              warnings.push(`自定义颜色 ${customKey} 的值可能不是有效的颜色: ${customValue}`);
            }
          });
        }
      } else if (typeof value === 'string' && !colorRegex.test(value)) {
        warnings.push(`主题颜色 ${key} 的值可能不是有效的颜色: ${value}`);
      }
    });
  }

  /**
   * 验证尺寸配置
   * @param sizes 尺寸配置
   * @param errors 错误数组
   * @param warnings 警告数组
   */
  private static validateSizes(sizes: SizePresets, errors: string[], warnings: string[]): void {
    const sizeRegex = /^(\d+(\.\d+)?(px|em|rem|%|vh|vw|vmin|vmax)|0)$/;

    Object.entries(sizes).forEach(([key, value]) => {
      if (typeof value === 'string' && !sizeRegex.test(value)) {
        warnings.push(`尺寸 ${key} 的值可能不是有效的 CSS 尺寸: ${value}`);
      } else if (typeof value === 'number' && value < 0) {
        errors.push(`尺寸 ${key} 不能为负数: ${value}`);
      }
    });
  }

  /**
   * 保存配置到文件
   * @param config 配置对象
   * @param outputPath 输出路径
   * @param format 文件格式
   */
  static async saveToFile(
    config: IconConfig,
    outputPath: string,
    format: 'json' | 'js' = 'json'
  ): Promise<void> {
    await fs.ensureDir(path.dirname(outputPath));

    if (format === 'json') {
      await fs.writeJson(outputPath, config, { spaces: 2 });
    } else {
      const content = `export default ${JSON.stringify(config, null, 2)};`;
      await fs.writeFile(outputPath, content, 'utf-8');
    }
  }

  /**
   * 获取配置摘要
   * @param config 配置对象
   * @returns 配置摘要
   */
  static getSummary(config: IconConfig): string {
    const lines = [
      `目标框架: ${config.target}`,
      `输入目录: ${config.inputDir}`,
      `输出目录: ${config.outputDir}`,
      `TypeScript: ${config.typescript ? '是' : '否'}`,
      `SVG 优化: ${config.optimize ? '是' : '否'}`,
      `包名称: ${config.packageName || '未设置'}`,
      `组件前缀: ${config.prefix || '无'}`,
      `组件后缀: ${config.suffix || '无'}`
    ];

    if (config.features) {
      lines.push(`启用功能: ${Object.entries(config.features)
        .filter(([, enabled]) => enabled)
        .map(([feature]) => feature)
        .join(', ')}`);
    }

    return lines.join('\n');
  }
}

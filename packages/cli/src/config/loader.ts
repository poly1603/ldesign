/**
 * 配置加载器
 */

import { cosmiconfigSync } from 'cosmiconfig';
import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';
import createJiti from 'jiti';
import { CLIConfig } from '../types/index';
import { mergeConfig } from './merger';
import { validateConfig } from './validator';

export interface ConfigLoaderOptions {
  /** 配置文件搜索路径 */
  searchFrom?: string;
  /** 环境名称 */
  environment?: string;
  /** 是否加载环境变量 */
  loadEnv?: boolean;
  /** 环境变量文件路径 */
  envFile?: string;
}

export class ConfigLoader {
  private jiti: any;
  private explorer: any;

  constructor() {
    this.jiti = createJiti(import.meta.url, {
      interopDefault: true,
      esmResolve: true
    });

    // 创建配置搜索器
    this.explorer = cosmiconfigSync('ldesign', {
      searchPlaces: [
        'package.json',
        'ldesign.config.js',
        'ldesign.config.ts',
        'ldesign.config.mjs',
        'ldesign.config.json',
        '.ldesignrc',
        '.ldesignrc.json',
        '.ldesignrc.js',
        '.ldesignrc.ts'
      ],
      loaders: {
        '.ts': (filepath: string) => {
          return this.jiti.import(filepath);
        },
        '.js': (filepath: string) => {
          return this.jiti.import(filepath);
        },
        '.mjs': (filepath: string) => {
          return this.jiti.import(filepath);
        }
      }
    });
  }

  /**
   * 加载配置
   */
  async load(options: ConfigLoaderOptions = {}): Promise<CLIConfig> {
    const {
      searchFrom = process.cwd(),
      environment = process.env.NODE_ENV || 'development',
      loadEnv = true,
      envFile
    } = options;

    // 加载环境变量
    if (loadEnv) {
      this.loadEnvironmentVariables(searchFrom, envFile);
    }

    // 搜索配置文件
    const result = this.explorer.search(searchFrom);
    
    let config: Partial<CLIConfig> = {};
    
    if (result) {
      config = result.config || {};
    }

    // 应用环境特定配置
    config = this.applyEnvironmentConfig(config, environment);

    // 应用环境变量覆盖
    config = this.applyEnvironmentOverrides(config);

    // 设置默认值
    const finalConfig = this.applyDefaults(config, environment);

    // 验证配置
    validateConfig(finalConfig);

    return finalConfig;
  }

  /**
   * 加载环境变量
   */
  private loadEnvironmentVariables(searchFrom: string, envFile?: string): void {
    const envFiles = [
      envFile,
      '.env.local',
      `.env.${process.env.NODE_ENV}`,
      '.env'
    ].filter(Boolean);

    for (const file of envFiles) {
      const envPath = resolve(searchFrom, file!);
      if (existsSync(envPath)) {
        dotenvConfig({ path: envPath });
        break;
      }
    }
  }

  /**
   * 应用环境特定配置
   */
  private applyEnvironmentConfig(config: any, environment: string): any {
    if (!config.environments || !config.environments[environment]) {
      return config;
    }

    const envConfig = config.environments[environment];
    return mergeConfig(config, envConfig);
  }

  /**
   * 应用环境变量覆盖
   */
  private applyEnvironmentOverrides(config: any): any {
    const overrides: any = {};

    // 支持的环境变量前缀
    const prefix = 'LDESIGN_';
    
    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith(prefix)) {
        const configKey = key
          .slice(prefix.length)
          .toLowerCase()
          .replace(/_/g, '.');
        
        this.setNestedValue(overrides, configKey, this.parseValue(value));
      }
    }

    return mergeConfig(config, overrides);
  }

  /**
   * 设置嵌套值
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  /**
   * 解析环境变量值
   */
  private parseValue(value: string | undefined): any {
    if (!value) return undefined;

    // 尝试解析为 JSON
    if (value.startsWith('{') || value.startsWith('[')) {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }

    // 解析布尔值
    if (value === 'true') return true;
    if (value === 'false') return false;

    // 解析数字
    if (/^\d+$/.test(value)) {
      return parseInt(value, 10);
    }
    if (/^\d+\.\d+$/.test(value)) {
      return parseFloat(value);
    }

    return value;
  }

  /**
   * 应用默认配置
   */
  private applyDefaults(config: any, environment: string): CLIConfig {
    const defaults: CLIConfig = {
      environment,
      plugins: [],
      middleware: []
    };

    return mergeConfig(defaults, config);
  }
}

/**
 * 加载配置的便捷函数
 */
export async function loadConfig(options?: ConfigLoaderOptions): Promise<CLIConfig> {
  const loader = new ConfigLoader();
  return loader.load(options);
}

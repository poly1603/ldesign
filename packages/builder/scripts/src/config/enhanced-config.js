"use strict";
/**
 * 增强的配置定义
 *
 * 提供更强大的配置定义和验证功能
 *
 * @author LDesign Team
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG_PRESETS = void 0;
exports.defineEnhancedConfig = defineEnhancedConfig;
exports.createConfigTemplate = createConfigTemplate;
exports.validateConfigFile = validateConfigFile;
exports.generateConfigDocs = generateConfigDocs;
const ConfigValidator_1 = require("../core/ConfigValidator");
const logger_1 = require("../utils/logger");
/**
 * 预设配置
 */
exports.CONFIG_PRESETS = {
    /** 库开发预设 */
    library: {
        output: {
            format: ['esm', 'cjs'],
            sourcemap: true
        },
        minify: false,
        performance: {
            treeshaking: true,
            bundleAnalyzer: false
        },
        clean: true
    },
    /** 应用开发预设 */
    application: {
        output: {
            format: 'esm',
            sourcemap: true
        },
        minify: true,
        performance: {
            treeshaking: true,
            bundleAnalyzer: true
        },
        clean: true,
        advancedOutput: {
            splitVendor: true,
            polyfill: true
        }
    },
    /** 组件库预设 */
    components: {
        output: {
            format: ['esm', 'cjs', 'umd'],
            sourcemap: true
        },
        minify: {
            level: 'basic',
            js: true,
            css: true
        },
        performance: {
            treeshaking: true,
            bundleAnalyzer: false
        },
        clean: true
    },
    /** 工具库预设 */
    utils: {
        output: {
            format: ['esm', 'cjs'],
            sourcemap: true
        },
        minify: {
            level: 'advanced'
        },
        performance: {
            treeshaking: true,
            bundleAnalyzer: false
        },
        clean: true
    }
};
/**
 * 增强的配置定义函数
 */
function defineEnhancedConfig(options) {
    const logger = new logger_1.Logger();
    // 应用预设配置
    let config = { ...options };
    // 如果指定了预设，先应用预设配置
    if ('preset' in options && typeof options.preset === 'string') {
        const preset = exports.CONFIG_PRESETS[options.preset];
        if (preset) {
            config = { ...preset, ...options };
            logger.info(`应用预设配置: ${options.preset}`);
        }
        else {
            logger.warn(`未知的预设配置: ${options.preset}`);
        }
    }
    // 配置验证
    if (config.validation?.enabled !== false) {
        const validator = new ConfigValidator_1.ConfigValidator({
            strict: config.validation?.strict ?? false,
            checkFiles: config.validation?.checkFiles ?? true
        }, logger);
        const result = validator.validate(config);
        if (!result.valid) {
            const errorMessage = `配置验证失败:\n${result.errors.join('\n')}`;
            if (config.validation?.throwOnError !== false) {
                throw new Error(errorMessage);
            }
            else {
                logger.error(errorMessage);
            }
        }
        if (result.warnings.length > 0) {
            logger.warn(`配置警告:\n${result.warnings.join('\n')}`);
        }
        // 获取配置建议
        const suggestions = validator.getSuggestions(config);
        if (suggestions.length > 0) {
            logger.info(`配置建议:\n${suggestions.join('\n')}`);
        }
        // 使用规范化后的配置
        if (result.normalizedConfig) {
            config = result.normalizedConfig;
        }
    }
    // 处理高级选项
    config = processAdvancedOptions(config, logger);
    return config;
}
/**
 * 处理高级选项
 */
function processAdvancedOptions(config, logger) {
    // 处理文件命名规则
    if (config.naming) {
        if (config.naming.template) {
            logger.info(`使用自定义文件命名模板: ${config.naming.template}`);
        }
        if (config.naming.hash) {
            logger.info(`启用文件哈希，长度: ${config.naming.hashLength || 8}`);
        }
    }
    // 处理高级输出选项
    if (config.advancedOutput) {
        if (config.advancedOutput.splitVendor) {
            logger.info('启用 vendor 分离');
        }
        if (config.advancedOutput.polyfill) {
            logger.info('启用 polyfill 生成');
        }
        if (config.advancedOutput.targets) {
            logger.info(`目标浏览器: ${JSON.stringify(config.advancedOutput.targets)}`);
        }
    }
    // 处理构建清单
    if (config.manifest?.enabled) {
        logger.info(`启用构建清单，格式: ${config.manifest.formats?.join(', ') || 'json'}`);
    }
    // 澶勭悊 Banner
    if (config.bannerOptions?.enabled) {
        logger.info(`鍚敤 Banner锛屾牱寮? ${config.bannerOptions.style || 'default'}`);
    }
    return config;
}
/**
 * 创建配置模板
 */
function createConfigTemplate(type) {
    const preset = exports.CONFIG_PRESETS[type];
    return `import { defineEnhancedConfig } from '@ldesign/builder'

export default defineEnhancedConfig({
  // 基础配置
  input: 'src/index.ts',
  
  // 输出配置
  output: ${JSON.stringify(preset.output, null, 4)},
  
  // 压缩配置
  minify: ${JSON.stringify(preset.minify, null, 4)},
  
  // 性能配置
  performance: ${JSON.stringify(preset.performance, null, 4)},
  
  // 清理输出目录
  clean: ${preset.clean},
  
  // 验证配置
  validation: {
    enabled: true,
    strict: false,
    checkFiles: true,
    throwOnError: true
  },
  
  // 构建清单
  manifest: {
    enabled: true,
    formats: ['json', 'markdown'],
    outputPath: 'dist'
  },
  
  // Banner 配置
  banner: {
    enabled: true,
    style: 'default'
  },
  
  // 构建钩子
  hooks: {
    beforeBuild: async (config) => {
      console.log('开始构建...')
    },
    afterBuild: async (result) => {
      console.log('构建完成!')
    },
    onError: async (error) => {
      console.error('构建失败:', error.message)
    }
  }
})
`;
}
/**
 * 验证配置文件
 */
function validateConfigFile(configPath) {
    try {
        const config = require(configPath);
        const validator = new ConfigValidator_1.ConfigValidator();
        return validator.validate(config.default || config);
    }
    catch (error) {
        return {
            valid: false,
            errors: [`配置文件加载失败: ${error.message}`],
            warnings: []
        };
    }
}
/**
 * 生成配置文档
 */
function generateConfigDocs() {
    return `# LDesign Builder 配置文档

## 基础配置

\`\`\`typescript
import { defineEnhancedConfig } from '@ldesign/builder'

export default defineEnhancedConfig({
  // 入口文件
  input: 'src/index.ts',
  
  // 输出配置
  output: {
    dir: 'dist',
    format: ['esm', 'cjs'],
    sourcemap: true,
    name: 'MyLibrary' // UMD 格式需要
  },
  
  // 打包器选择
  bundler: 'rollup', // 'rollup' | 'rolldown' | 'auto'
  
  // 压缩配置
  minify: {
    level: 'basic', // 'none' | 'whitespace' | 'basic' | 'advanced'
    js: true,
    css: true
  },
  
  // 外部依赖
  external: ['react', 'vue'],
  
  // 性能配置
  performance: {
    treeshaking: true,
    bundleAnalyzer: false
  }
})
\`\`\`

## 预设配置

可以使用预设配置快速开始：

- \`library\`: 库开发
- \`application\`: 应用开发
- \`components\`: 组件库
- \`utils\`: 工具库

## 高级功能

### 构建清单
自动生成详细的构建产物清单。

### Banner 标识
在产物顶部添加构建信息。

### 配置验证
自动验证配置的正确性。

### 构建钩子
在构建过程中执行自定义逻辑。
`;
}

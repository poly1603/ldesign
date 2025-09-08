#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { IconConverter, validateConfig } from './index';
import { ConfigManager } from './utils/config';
import type { TargetFramework, IconConfig } from './types';

/**
 * LDesign Icons CLI
 * 强大的 SVG 到组件转换工具
 */

// 版本信息
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
);

program
  .name('ldesign-icons')
  .description('将 SVG 图标转换为各种前端框架的组件')
  .version(packageJson.version);

// 主转换命令
program
  .command('convert')
  .description('转换 SVG 文件为组件')
  .requiredOption('-i, --input <dir>', '输入目录（包含 SVG 文件）')
  .requiredOption('-o, --output <dir>', '输出目录')
  .requiredOption('-t, --target <framework>', '目标框架 (vue2|vue3|react|lit|angular|svelte)')
  .option('-p, --prefix <prefix>', '组件名前缀')
  .option('-s, --suffix <suffix>', '组件名后缀', 'Icon')
  .option('--no-optimize', '禁用 SVG 优化')
  .option('--no-typescript', '生成 JavaScript 而不是 TypeScript')
  .option('-c, --config <file>', '配置文件路径')
  .option('--package-name <name>', '包名称')
  .option('--package-version <version>', '包版本', '1.0.0')
  .option('--package-description <desc>', '包描述')
  .option('--no-animation', '禁用动画功能')
  .option('--no-theming', '禁用主题功能')
  .option('--no-preview', '禁用预览生成')
  .option('--recursive', '递归搜索子目录')
  .option('--verbose', '详细输出')
  .action(async (options) => {
    try {
      console.log(chalk.blue.bold('🎨 LDesign Icons Converter'));
      console.log(chalk.gray(`版本 ${packageJson.version}\n`));

      // 验证目标框架
      const supportedFrameworks = ConfigManager.getSupportedFrameworks();
      if (!supportedFrameworks.includes(options.target as TargetFramework)) {
        console.error(chalk.red(`❌ 不支持的目标框架: ${options.target}`));
        console.error(chalk.gray(`支持的框架: ${supportedFrameworks.join(', ')}`));
        process.exit(1);
      }

      // 验证输入目录
      if (!await fs.pathExists(options.input)) {
        console.error(chalk.red(`❌ 输入目录不存在: ${options.input}`));
        process.exit(1);
      }

      let config: Partial<IconConfig>;

      // 从配置文件加载（如果提供）
      if (options.config) {
        if (!await fs.pathExists(options.config)) {
          console.error(chalk.red(`❌ 配置文件不存在: ${options.config}`));
          process.exit(1);
        }

        console.log(chalk.gray(`📄 加载配置文件: ${options.config}`));
        config = await ConfigManager.loadFromFile(options.config);
      } else {
        config = {};
      }

      // 命令行选项覆盖配置文件
      config = {
        ...config,
        target: options.target,
        inputDir: path.resolve(options.input),
        outputDir: path.resolve(options.output),
        prefix: options.prefix || config.prefix,
        suffix: options.suffix || config.suffix,
        optimize: options.optimize !== false,
        typescript: options.typescript !== false,
        packageName: options.packageName || config.packageName,
        packageVersion: options.packageVersion || config.packageVersion,
        packageDescription: options.packageDescription || config.packageDescription,
        features: {
          ...config.features,
          animation: options.animation !== false,
          theming: options.theming !== false,
          preview: options.preview !== false
        }
      };

      // 验证配置
      const validation = validateConfig(config);
      if (!validation.valid) {
        console.error(chalk.red('❌ 配置验证失败:'));
        validation.errors.forEach(error => {
          console.error(chalk.red(`   • ${error}`));
        });
        process.exit(1);
      }

      if (validation.warnings.length > 0) {
        console.warn(chalk.yellow('⚠️  配置警告:'));
        validation.warnings.forEach(warning => {
          console.warn(chalk.yellow(`   • ${warning}`));
        });
        console.log();
      }

      // 显示配置摘要
      if (options.verbose) {
        console.log(chalk.blue('📋 配置摘要:'));
        console.log(chalk.gray(ConfigManager.getSummary(config as IconConfig)));
        console.log();
      }

      // 执行转换
      const converter = new IconConverter(config);
      const result = await converter.convert();

      if (result.success) {
        console.log(chalk.green.bold('🎉 转换成功完成!'));

        if (result.stats) {
          console.log(chalk.blue('\n📊 统计信息:'));
          console.log(chalk.gray(`   • 总图标数: ${result.stats.totalIcons}`));
          console.log(chalk.gray(`   • 生成文件数: ${result.stats.generatedFiles}`));
          console.log(chalk.gray(`   • 原始大小: ${(result.stats.totalSize / 1024).toFixed(2)} KB`));

          if (result.stats.optimizedSize) {
            console.log(chalk.gray(`   • 优化后大小: ${(result.stats.optimizedSize / 1024).toFixed(2)} KB`));
            console.log(chalk.gray(`   • 压缩率: ${((result.stats.compressionRatio || 0) * 100).toFixed(1)}%`));
          }
        }

        if (result.warnings && result.warnings.length > 0) {
          console.log(chalk.yellow('\n⚠️  警告:'));
          result.warnings.forEach(warning => {
            console.log(chalk.yellow(`   • ${warning}`));
          });
        }

        console.log(chalk.green(`\n✅ 组件已生成到: ${options.output}`));
      } else {
        console.error(chalk.red.bold('❌ 转换失败!'));

        if (result.errors && result.errors.length > 0) {
          console.error(chalk.red('\n错误详情:'));
          result.errors.forEach(error => {
            console.error(chalk.red(`   • ${error}`));
          });
        }

        process.exit(1);
      }

    } catch (error) {
      console.error(chalk.red.bold('❌ 发生未预期的错误:'));
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));

      if (options.verbose && error instanceof Error && error.stack) {
        console.error(chalk.gray('\n堆栈跟踪:'));
        console.error(chalk.gray(error.stack));
      }

      process.exit(1);
    }
  });

// 验证命令
program
  .command('validate')
  .description('验证配置文件')
  .requiredOption('-c, --config <file>', '配置文件路径')
  .action(async (options) => {
    try {
      console.log(chalk.blue.bold('🔍 验证配置文件'));

      if (!await fs.pathExists(options.config)) {
        console.error(chalk.red(`❌ 配置文件不存在: ${options.config}`));
        process.exit(1);
      }

      const config = await ConfigManager.loadFromFile(options.config);
      const validation = validateConfig(config);

      if (validation.valid) {
        console.log(chalk.green('✅ 配置文件有效'));

        if (validation.warnings.length > 0) {
          console.log(chalk.yellow('\n⚠️  警告:'));
          validation.warnings.forEach(warning => {
            console.log(chalk.yellow(`   • ${warning}`));
          });
        }

        console.log(chalk.blue('\n📋 配置摘要:'));
        console.log(chalk.gray(ConfigManager.getSummary(config)));
      } else {
        console.error(chalk.red('❌ 配置文件无效'));
        console.error(chalk.red('\n错误详情:'));
        validation.errors.forEach(error => {
          console.error(chalk.red(`   • ${error}`));
        });
        process.exit(1);
      }

    } catch (error) {
      console.error(chalk.red.bold('❌ 验证失败:'));
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

// 初始化命令
program
  .command('init')
  .description('创建配置文件模板')
  .option('-t, --target <framework>', '目标框架', 'vue3')
  .option('-o, --output <file>', '配置文件输出路径', 'ldesign-icons.config.json')
  .option('--js', '生成 JavaScript 配置文件')
  .action(async (options) => {
    try {
      console.log(chalk.blue.bold('🚀 初始化配置文件'));

      const config = ConfigManager.createDefault(
        options.target as TargetFramework,
        './svg',
        './icons'
      );

      const format = options.js ? 'js' : 'json';
      const outputPath = options.js
        ? options.output.replace(/\.json$/, '.js')
        : options.output;

      await ConfigManager.saveToFile(config, outputPath, format);

      console.log(chalk.green(`✅ 配置文件已创建: ${outputPath}`));
      console.log(chalk.gray('\n📝 你可以编辑此文件来自定义配置'));
      console.log(chalk.gray(`💡 使用 "ldesign-icons validate -c ${outputPath}" 来验证配置`));

    } catch (error) {
      console.error(chalk.red.bold('❌ 初始化失败:'));
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

// 解析命令行参数
program.parse();

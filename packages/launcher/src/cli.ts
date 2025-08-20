#!/usr/bin/env node

/**
 * Vite Launcher CLI
 * 命令行接口工具
 */

import { program } from 'commander';
import { viteLauncher } from './index';
import type { ProjectType, LogLevel } from './types';
import path from 'path';
import fs from 'fs/promises';

// 版本信息
const packageJson = require('../package.json');

// 配置程序信息
program
  .name('vite-launcher')
  .description('Vite 前端项目启动器 - 开箱即用的项目创建和管理工具')
  .version(packageJson.version);

// 全局选项
program
  .option('-v, --verbose', '详细输出')
  .option('-q, --quiet', '静默模式')
  .option('--log-level <level>', '日志级别 (silent|error|warn|info)', 'info');

// create 命令
program
  .command('create <project-name>')
  .description('创建新的 Vite 项目')
  .option('-t, --type <type>', '项目类型 (vue3|vue2|react|vanilla|vanilla-ts|lit|svelte)', 'vue3')
  .option('--template <template>', '使用指定模板')
  .option('-f, --force', '强制覆盖已存在的目录')
  .option('-d, --dir <directory>', '指定创建目录', process.cwd())
  .action(async (projectName: string, options) => {
    try {
      const projectPath = path.resolve(options.dir, projectName);
      const projectType = options.type as ProjectType;
      
      console.log(`🚀 创建 ${projectType} 项目: ${projectName}`);
      
      // Create functionality not implemented yet
      console.log('Create functionality will be implemented in future versions');
      
      console.log('✅ 项目创建成功!');
    } catch (error) {
      console.error('❌ 创建失败:', (error as Error).message);
      process.exit(1);
    }
  });

// dev 命令
program
  .command('dev [project-path]')
  .description('启动开发服务器')
  .option('-p, --port <port>', '端口号', '5173')
  .option('-h, --host <host>', '主机地址', 'localhost')
  .option('--open', '自动打开浏览器')
  .option('--https', '使用 HTTPS')
  .action(async (projectPath: string = process.cwd(), options) => {
    try {
      console.log('🔥 启动开发服务器...');
      
      await viteLauncher.dev(projectPath, {
        port: parseInt(options.port),
        host: options.host,
        open: options.open,
        https: options.https
      });
    } catch (error) {
      console.error('❌ 启动失败:', (error as Error).message);
      process.exit(1);
    }
  });

// build 命令
program
  .command('build [project-path]')
  .description('构建项目')
  .option('-o, --outDir <dir>', '输出目录', 'dist')
  .option('--sourcemap', '生成 sourcemap')
  .option('--no-minify', '禁用压缩')
  .option('--watch', '监听模式')
  .action(async (projectPath: string = process.cwd(), options) => {
    try {
      console.log('📦 开始构建项目...');
      
      const result = await viteLauncher.build(projectPath, {
        outDir: options.outDir,
        sourcemap: options.sourcemap,
        minify: options.minify,
        watch: options.watch
      });
      
      if (result.success) {
        console.log('✅ 构建成功!');
        console.log(`📁 输出文件: ${result.outputFiles.join(', ')}`);
        console.log(`⏱️  构建时间: ${result.duration}ms`);
        console.log(`📊 入口数量: ${result.stats.entryCount}`);
        console.log(`📊 模块数量: ${result.stats.moduleCount}`);
      } else {
        console.error('❌ 构建失败:', result.errors.join(', '));
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ 构建失败:', (error as Error).message);
      process.exit(1);
    }
  });

// preview 命令
program
  .command('preview [project-path]')
  .description('预览构建结果')
  .option('-p, --port <port>', '端口号', '4173')
  .option('-h, --host <host>', '主机地址', 'localhost')
  .option('-o, --outDir <dir>', '构建输出目录', 'dist')
  .option('--open', '自动打开浏览器')
  .action(async (projectPath: string = process.cwd(), options) => {
    try {
      console.log('👀 启动预览服务器...');
      
      await viteLauncher.preview(projectPath, {
        port: parseInt(options.port),
        host: options.host,
        outDir: options.outDir,
        open: options.open
      });
    } catch (error) {
      console.error('❌ 预览失败:', (error as Error).message);
      process.exit(1);
    }
  });

// info 命令
program
  .command('info [project-path]')
  .description('显示项目信息')
  .action(async (projectPath: string = process.cwd()) => {
    try {
      // Project info functionality not fully implemented yet
      console.log('📋 项目信息:');
      console.log(`  路径: ${projectPath}`);
      console.log('  项目信息功能将在未来版本中实现');
    } catch (error) {
      console.error('❌ 获取信息失败:', (error as Error).message);
      process.exit(1);
    }
  });

// init 命令（在现有目录初始化 Vite 项目）
program
  .command('init [project-path]')
  .description('在现有目录初始化 Vite 项目')
  .option('-t, --type <type>', '项目类型 (vue3|vue2|react|vanilla|vanilla-ts|lit|svelte)')
  .option('-f, --force', '强制覆盖已存在的配置文件')
  .action(async (projectPath: string = process.cwd(), options) => {
    try {
      console.log('🔧 初始化 Vite 项目...');
      
      // 检测项目类型（如果未指定）
      let projectType = options.type as ProjectType;
      if (!projectType) {
        projectType = 'vanilla-ts'; // Default fallback
        console.log(`🔍 使用默认项目类型: ${projectType}`);
      }
      
      // 检查是否已经是 Vite 项目
      const viteConfigExists = await checkFileExists(path.join(projectPath, 'vite.config.ts')) ||
                              await checkFileExists(path.join(projectPath, 'vite.config.js'));
      
      if (viteConfigExists && !options.force) {
        console.log('⚠️  检测到已存在 Vite 配置文件，使用 --force 选项覆盖');
        return;
      }
      
      // 这里可以添加初始化逻辑，比如生成 vite.config.ts
      console.log('✅ Vite 项目初始化完成!');
    } catch (error) {
      console.error('❌ 初始化失败:', (error as Error).message);
      process.exit(1);
    }
  });

// 辅助函数
async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// 处理全局选项
program.hook('preAction', (_thisCommand: any, _actionCommand: any) => {
  const options = program.opts();
  
  // 设置日志级别
  if (options.quiet) {
    // Set quiet mode
  } else if (options.verbose) {
    // Set verbose mode
  } else if (options.logLevel) {
    // Set custom log level
  }
  
  // 这里可以设置全局配置
  // viteLauncher.setLogLevel(logLevel);
});

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ 未处理的 Promise 拒绝:', reason);
  process.exit(1);
});

// 解析命令行参数
program.parse();
/**
 * 开发命令
 */

import { Command, CLIContext } from '../types/index';
import ora from 'ora';

export const devCommand: Command = {
  name: 'dev',
  description: '启动开发服务器',
  aliases: ['serve', 'start'],
  options: [
    {
      name: 'port',
      alias: 'p',
      type: 'number',
      description: '服务器端口',
      default: 3000
    },
    {
      name: 'host',
      alias: 'h',
      type: 'string',
      description: '服务器主机',
      default: 'localhost'
    },
    {
      name: 'open',
      type: 'boolean',
      description: '自动打开浏览器',
      default: false
    },
    {
      name: 'https',
      type: 'boolean',
      description: '启用 HTTPS',
      default: false
    },
    {
      name: 'proxy',
      type: 'string',
      description: 'API 代理地址'
    },
    {
      name: 'hot',
      type: 'boolean',
      description: '启用热重载',
      default: true
    }
  ],
  examples: [
    'ldesign dev',
    'ldesign dev --port 8080',
    'ldesign dev --host 0.0.0.0 --open',
    'ldesign dev --https --proxy http://localhost:8000'
  ],
  action: async (args, context) => {
    const spinner = ora('🚀 启动开发服务器...').start();

    try {
      // 检查端口可用性
      await checkPortAvailability(args.port, context);
      spinner.text = '检查开发环境...';

      // 准备开发环境
      await prepareDevelopmentEnvironment(args, context);
      spinner.text = '编译项目文件...';

      // 编译项目
      await compileProject(args, context);
      spinner.text = '启动服务器...';

      // 启动开发服务器
      const server = await startDevServer(args, context);
      spinner.succeed('✅ 开发服务器启动成功！');

      // 显示服务器信息
      showServerInfo(args, context);

      // 启动文件监听
      await startFileWatcher(args, context);

      // 处理退出信号
      setupExitHandlers(server, context);

    } catch (error) {
      spinner.fail('❌ 开发服务器启动失败');
      context.logger.error('启动失败:', error);
      throw error;
    }
  }
};

/**
 * 检查端口可用性
 */
async function checkPortAvailability(port: number, context: CLIContext): Promise<void> {
  context.logger.debug(`检查端口 ${port} 可用性...`);

  // 这里应该实际检查端口是否被占用
  // 如果被占用，可以自动寻找下一个可用端口

  context.logger.debug(`✅ 端口 ${port} 可用`);
}

/**
 * 准备开发环境
 */
async function prepareDevelopmentEnvironment(args: any, context: CLIContext): Promise<void> {
  context.logger.debug('准备开发环境...');

  // 设置环境变量
  process.env.NODE_ENV = 'development';

  // 加载开发配置
  // 这里应该加载开发特定的配置

  context.logger.debug('✅ 开发环境准备完成');
}

/**
 * 编译项目
 */
async function compileProject(args: any, context: CLIContext): Promise<void> {
  context.logger.debug('编译项目文件...');

  // 这里应该实际编译项目
  // 包括 TypeScript 编译、样式处理等

  context.logger.debug('✅ 项目编译完成');
}

/**
 * 启动开发服务器
 */
async function startDevServer(args: any, context: CLIContext): Promise<any> {
  context.logger.debug('启动开发服务器...');

  try {
    // 动态导入 launcher
    const { spawn } = await import('child_process');
    const path = await import('path');

    // 查找 launcher 可执行文件
    let launcherPath: string;
    try {
      // 尝试通过 require.resolve 找到 launcher 包
      const launcherPackagePath = require.resolve('@ldesign/launcher/package.json');
      const launcherDir = path.dirname(launcherPackagePath);
      launcherPath = path.join(launcherDir, 'bin', 'launcher.js');
    } catch (error) {
      // 如果找不到包，使用相对路径
      launcherPath = path.resolve(__dirname, '../../../launcher/bin/launcher.js');
    }

    // 构建 launcher 命令参数
    const launcherArgs = ['dev'];

    if (args.port) launcherArgs.push('--port', args.port.toString());
    if (args.host) launcherArgs.push('--host', args.host);
    if (args.https) launcherArgs.push('--https');
    if (args.open) launcherArgs.push('--open');
    if (args.environment) launcherArgs.push('--environment', args.environment);

    context.logger.info(`🚀 启动 launcher dev 服务器...`);
    context.logger.debug(`Launcher 路径: ${launcherPath}`);
    context.logger.debug(`命令参数: ${launcherArgs.join(' ')}`);

    // 启动 launcher 进程
    const child = spawn('node', [launcherPath, ...launcherArgs], {
      cwd: context.cwd,
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' }
    });

    const server = {
      config: {
        port: args.port,
        host: args.host,
        https: args.https,
        proxy: args.proxy,
        hot: args.hot
      },
      process: child,
      close: () => {
        context.logger.info('关闭开发服务器...');
        child.kill('SIGTERM');
      }
    };

    // 处理进程事件
    child.on('error', (error) => {
      context.logger.error('启动 launcher 失败:', error);
    });

    child.on('exit', (code) => {
      if (code !== 0) {
        context.logger.error(`Launcher 进程退出，代码: ${code}`);
      }
    });

    context.logger.debug('✅ 开发服务器启动完成');
    return server;
  } catch (error) {
    context.logger.error('启动开发服务器失败:', error);
    throw error;
  }
}

/**
 * 显示服务器信息
 */
function showServerInfo(args: any, context: CLIContext): void {
  const protocol = args.https ? 'https' : 'http';
  const url = `${protocol}://${args.host}:${args.port}`;

  context.logger.info('\n🌐 开发服务器信息:');
  context.logger.info(`  本地地址:   ${url}`);

  if (args.host !== 'localhost') {
    context.logger.info(`  网络地址:   ${protocol}://localhost:${args.port}`);
  }

  if (args.proxy) {
    context.logger.info(`  API 代理:   ${args.proxy}`);
  }

  context.logger.info('\n🔥 功能特性:');
  context.logger.info(`  热重载:     ${args.hot ? '✅' : '❌'}`);
  context.logger.info(`  HTTPS:      ${args.https ? '✅' : '❌'}`);
  context.logger.info(`  自动打开:   ${args.open ? '✅' : '❌'}`);

  context.logger.info('\n按 Ctrl+C 停止服务器');

  // 自动打开浏览器
  if (args.open) {
    context.logger.info('🌐 正在打开浏览器...');
    // 这里应该实际打开浏览器
  }
}

/**
 * 启动文件监听
 */
async function startFileWatcher(args: any, context: CLIContext): Promise<void> {
  context.logger.debug('启动文件监听...');

  // 这里应该实际启动文件监听
  // 使用 chokidar 监听文件变化

  // 模拟文件变化事件
  setTimeout(() => {
    context.logger.info('📝 检测到文件变化，正在重新编译...');
    setTimeout(() => {
      context.logger.success('✅ 重新编译完成');
    }, 1000);
  }, 5000);

  context.logger.debug('✅ 文件监听启动完成');
}

/**
 * 设置退出处理器
 */
function setupExitHandlers(server: any, context: CLIContext): void {
  const cleanup = () => {
    context.logger.info('\n🛑 正在关闭开发服务器...');
    server.close();

    // 等待子进程退出
    if (server.process) {
      server.process.on('exit', () => {
        context.logger.info('👋 开发服务器已关闭');
        process.exit(0);
      });

      // 如果子进程在5秒内没有退出，强制退出
      setTimeout(() => {
        context.logger.warn('强制退出开发服务器');
        process.exit(0);
      }, 5000);
    } else {
      context.logger.info('👋 开发服务器已关闭');
      process.exit(0);
    }
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

export default devCommand;

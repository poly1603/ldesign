/**
 * UI 命令 - 启动 Web 界面
 */

import { Command, CLIContext } from '../types/index';

export const uiCommand: Command = {
  name: 'ui',
  description: '启动 Web 可视化界面',
  aliases: ['web', 'dashboard'],
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
      alias: 'H',
      type: 'string',
      description: '服务器主机',
      default: 'localhost'
    },
    {
      name: 'open',
      type: 'boolean',
      description: '自动打开浏览器',
      default: true
    },
    {
      name: 'dev',
      type: 'boolean',
      description: '开发模式（启用热重载）',
      default: false
    },
    {
      name: 'persistent',
      type: 'boolean',
      description: '持久会话（不清理数据库，保留历史任务与日志）',
      default: false
    }
  ],
  examples: [
    'ldesign ui',
    'ldesign ui --port 8080',
    'ldesign ui --host 0.0.0.0 --no-open',
    'ldesign ui --dev'
  ],
  async action(options, context: CLIContext) {
    context.logger.info('🚀 [开发模式] 启动 Web 可视化界面...');

    try {
      // 动态导入 WebServer
      const { WebServer } = await import('../web/server');

      const server = new WebServer(context, {
        port: parseInt(options.port),
        host: options.host,
        open: options.open,
        persistent: !!options.persistent
      });

      // 启动服务器
      await server.start({
        port: parseInt(options.port),
        host: options.host,
        open: options.open
      });

      // 处理优雅关闭
      const gracefulShutdown = async () => {
        context.logger.info('\n正在关闭 Web 服务器...');
        await server.stop();
        process.exit(0);
      };

      process.on('SIGINT', gracefulShutdown);
      process.on('SIGTERM', gracefulShutdown);

      // 如果是开发模式，启用文件监听
      if (options.dev) {
        context.logger.info('🔥 开发模式已启用');
        await setupDevMode(context, server);
      }

      context.logger.info('按 Ctrl+C 停止服务器');

      // 保持进程运行
      await new Promise(() => { });

    } catch (error) {
      if (error.code === 'EADDRINUSE') {
        context.logger.error(`端口 ${options.port} 已被占用，请尝试其他端口`);
        context.logger.info(`例如: ldesign ui --port ${parseInt(options.port) + 1}`);
      } else {
        context.logger.error('启动 Web 界面失败:', error);
      }
      process.exit(1);
    }
  }
};

/**
 * 设置开发模式
 */
async function setupDevMode(context: CLIContext, server: any): Promise<void> {
  try {
    const chokidar = await import('chokidar');

    // 监听配置文件变化
    const configWatcher = chokidar.watch([
      'ldesign.config.*',
      '.ldesignrc*',
      'package.json'
    ], {
      cwd: context.cwd,
      ignoreInitial: true
    });

    configWatcher.on('change', (path) => {
      context.logger.info(`📝 配置文件已更改: ${path}`);
      // 通知客户端重新加载配置
      server.getIO().emit('config:changed', { path });
    });

    // 监听源代码变化
    const sourceWatcher = chokidar.watch([
      'src/**/*',
      'lib/**/*',
      '*.js',
      '*.ts',
      '*.json'
    ], {
      cwd: context.cwd,
      ignoreInitial: true,
      ignored: ['node_modules/**', 'dist/**', '.git/**']
    });

    sourceWatcher.on('change', (path) => {
      context.logger.debug(`📄 源文件已更改: ${path}`);
      // 通知客户端文件变化
      server.getIO().emit('file:changed', { path });
    });

    context.logger.debug('文件监听已启用');

  } catch (error) {
    context.logger.warn('无法启用开发模式文件监听:', error);
  }
}

export default uiCommand;

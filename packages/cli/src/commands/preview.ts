/**
 * 预览命令
 */

import { Command, CLIContext } from '../types/index';

export const previewCommand: Command = {
  name: 'preview',
  description: '预览构建产物',
  aliases: ['serve'],
  options: [
    {
      name: 'port',
      alias: 'p',
      type: 'number',
      description: '服务器端口',
      default: 8888
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
      alias: 'o',
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
      name: 'outDir',
      type: 'string',
      description: '构建产物目录',
      default: 'dist'
    },
    {
      name: 'environment',
      alias: 'e',
      type: 'string',
      description: '环境配置',
      default: 'production'
    }
  ],
  examples: [
    'ldesign preview',
    'ldesign preview --port 9000',
    'ldesign preview --host 0.0.0.0 --open',
    'ldesign preview --environment staging'
  ],
  action: async (args, context) => {
    context.logger.info('🔍 启动预览服务器...');

    try {
      // 启动预览服务器
      const server = await startPreviewServer(args, context);

      // 显示服务器信息
      showPreviewInfo(args, context);

      // 处理退出信号
      setupExitHandlers(server, context);

    } catch (error) {
      context.logger.error('预览服务器启动失败:', error);
      throw error;
    }
  }
};

/**
 * 启动预览服务器
 */
async function startPreviewServer(args: any, context: CLIContext): Promise<any> {
  context.logger.debug('启动预览服务器...');

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
    const launcherArgs = ['preview'];
    
    if (args.port) launcherArgs.push('--port', args.port.toString());
    if (args.host) launcherArgs.push('--host', args.host);
    if (args.https) launcherArgs.push('--https');
    if (args.open) launcherArgs.push('--open');
    if (args.outDir) launcherArgs.push('--outDir', args.outDir);
    if (args.environment) launcherArgs.push('--environment', args.environment);

    context.logger.info(`🚀 启动 launcher preview 服务器...`);
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
        outDir: args.outDir
      },
      process: child,
      close: () => {
        context.logger.info('关闭预览服务器...');
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

    context.logger.debug('✅ 预览服务器启动完成');
    return server;
  } catch (error) {
    context.logger.error('启动预览服务器失败:', error);
    throw error;
  }
}

/**
 * 显示预览信息
 */
function showPreviewInfo(args: any, context: CLIContext): void {
  const protocol = args.https ? 'https' : 'http';
  const url = `${protocol}://${args.host}:${args.port}`;
  
  context.logger.info('\n🌐 预览服务器信息:');
  context.logger.info(`  本地地址:   ${url}`);
  
  if (args.host !== 'localhost') {
    context.logger.info(`  网络地址:   ${protocol}://localhost:${args.port}`);
  }
  
  context.logger.info(`  构建目录:   ${args.outDir}`);
  context.logger.info(`  环境配置:   ${args.environment}`);
  
  context.logger.info('\n按 Ctrl+C 停止服务器');
  
  // 自动打开浏览器
  if (args.open) {
    context.logger.info('🌐 正在打开浏览器...');
  }
}

/**
 * 设置退出处理器
 */
function setupExitHandlers(server: any, context: CLIContext): void {
  const cleanup = () => {
    context.logger.info('\n🛑 正在关闭预览服务器...');
    server.close();
    
    // 等待子进程退出
    if (server.process) {
      server.process.on('exit', () => {
        context.logger.info('👋 预览服务器已关闭');
        process.exit(0);
      });
      
      // 如果子进程在5秒内没有退出，强制退出
      setTimeout(() => {
        context.logger.warn('强制退出预览服务器');
        process.exit(0);
      }, 5000);
    } else {
      context.logger.info('👋 预览服务器已关闭');
      process.exit(0);
    }
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

export default previewCommand;

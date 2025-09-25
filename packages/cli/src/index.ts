/**
 * LDesign CLI 主入口文件
 */

import { CLI } from './core/cli';
import { createLogger } from './utils/logger';
import { loadConfig } from './config/loader';

/**
 * CLI 主函数
 */
export async function main(): Promise<void> {
  try {
    // 创建日志器
    const logger = createLogger();
    
    // 加载配置
    const config = await loadConfig();
    
    // 创建 CLI 实例
    const cli = new CLI({
      logger,
      config
    });
    
    // 初始化 CLI
    await cli.init();
    
    // 运行 CLI
    await cli.run();
    
  } catch (error) {
    console.error('CLI 启动失败:', error);
    process.exit(1);
  }
}

// 导出核心模块
export * from './core/index';
export * from './types/index';
export * from './utils/index';
export * from './config/index';

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

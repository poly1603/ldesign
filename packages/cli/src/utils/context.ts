/**
 * CLI 上下文创建工具
 */

import { CLIContext, CLIConfig, Logger } from '../types/index';
import { cwd } from 'process';

/**
 * 创建 CLI 上下文
 */
export function createContext(config: CLIConfig, logger: Logger): CLIContext {
  return {
    cwd: cwd(),
    config,
    args: process.argv.slice(2),
    env: { ...process.env } as Record<string, string>,
    plugins: new Map(),
    middleware: [],
    logger
  };
}

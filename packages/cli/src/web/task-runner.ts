/**
 * 任务运行器
 */

import { spawn, exec, ChildProcess } from 'child_process';
import { Server as SocketIOServer } from 'socket.io';
import * as path from 'path';
import * as fs from 'fs';
import { CLIContext } from '../types/index';
import { randomUUID } from 'crypto';

export interface TaskOptions {
  [key: string]: any;
}

export interface TaskStatus {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime?: Date;
  endTime?: Date;
  exitCode?: number;
  output: string[];
  error?: string;
}

export class TaskRunner {
  private context: CLIContext;
  private io: SocketIOServer;
  private tasks: Map<string, TaskStatus> = new Map();
  private processes: Map<string, ChildProcess> = new Map();

  constructor(context: CLIContext, io: SocketIOServer) {
    this.context = context;
    this.io = io;
  }

  /**
   * 运行任务
   */
  async runTask(taskName: string, options: TaskOptions = {}): Promise<string> {
    // 生成包含环境信息的taskId
    const environment = options.environment || 'default';
    const taskId = `${taskName}-${environment}-${Date.now()}`;

    const task: TaskStatus = {
      id: taskId,
      name: taskName,
      status: 'pending',
      output: []
    };

    this.tasks.set(taskId, task);
    this.emitTaskUpdate(taskId, task);

    // 异步执行任务
    this.executeTask(taskId, taskName, options).catch((error) => {
      this.context.logger.error(`任务执行失败: ${taskName}`, error);
    });

    return taskId;
  }

  /**
   * 执行任务
   */
  private async executeTask(taskId: string, taskName: string, options: TaskOptions): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = 'running';
    task.startTime = new Date();
    this.emitTaskUpdate(taskId, task);

    try {
      switch (taskName) {
        case 'init':
          await this.runInitTask(taskId, options);
          break;
        case 'build':
          await this.runBuildTask(taskId, options);
          break;
        case 'dev':
          await this.runDevTask(taskId, options);
          break;
        case 'test':
          await this.runTestTask(taskId, options);
          break;
        case 'preview':
          await this.runPreviewTask(taskId, options);
          break;
        default:
          throw new Error(`未知任务: ${taskName}`);
      }

      task.status = 'completed';
      task.endTime = new Date();
      task.exitCode = 0;
    } catch (error) {
      task.status = 'failed';
      task.endTime = new Date();
      task.error = error instanceof Error ? error.message : String(error);
      task.exitCode = 1;
    }

    this.emitTaskUpdate(taskId, task);
  }

  /**
   * 运行 init 任务
   */
  private async runInitTask(taskId: string, options: TaskOptions): Promise<void> {
    const args = ['init'];

    if (options.template) {
      args.push('--template', options.template);
    }
    if (options.name) {
      args.push('--name', options.name);
    }
    if (options.directory) {
      args.push('--directory', options.directory);
    }
    if (options.force) {
      args.push('--force');
    }
    if (options.skipInstall) {
      args.push('--skip-install');
    }
    if (options.packageManager) {
      args.push('--package-manager', options.packageManager);
    }

    await this.runCliCommand(taskId, args);
  }

  /**
   * 运行 build 任务
   */
  private async runBuildTask(taskId: string, options: TaskOptions): Promise<void> {
    const args = ['build'];

    // 添加环境参数
    if (options.environment) {
      args.push('--environment', options.environment);
    }

    if (options.mode) {
      args.push('--mode', options.mode);
    }
    if (options.output) {
      args.push('--output', options.output);
    }
    if (options.watch) {
      args.push('--watch');
    }
    if (options.clean !== undefined) {
      args.push(options.clean ? '--clean' : '--no-clean');
    }
    if (options.analyze) {
      args.push('--analyze');
    }
    if (options.sourcemap) {
      args.push('--sourcemap');
    }

    await this.runLauncherCommand(taskId, args, options);
  }

  /**
   * 运行 dev 任务
   */
  private async runDevTask(taskId: string, options: TaskOptions): Promise<void> {
    const args = ['dev'];

    // 添加环境参数
    if (options.environment) {
      args.push('--environment', options.environment);
    }

    if (options.port) {
      args.push('--port', options.port.toString());
    }
    if (options.host) {
      args.push('--host', options.host);
    }
    if (options.open) {
      args.push('--open');
    }
    if (options.https) {
      args.push('--https');
    }

    await this.runLauncherCommand(taskId, args, options);
  }

  /**
   * 运行 test 任务
   */
  private async runTestTask(taskId: string, options: TaskOptions): Promise<void> {
    const args = ['test'];

    if (options.watch) {
      args.push('--watch');
    }
    if (options.coverage) {
      args.push('--coverage');
    }
    if (options.reporter) {
      args.push('--reporter', options.reporter);
    }
    if (options.pattern) {
      args.push('--pattern', options.pattern);
    }

    await this.runCliCommand(taskId, args);
  }

  /**
   * 运行 preview 任务
   */
  private async runPreviewTask(taskId: string, options: TaskOptions): Promise<void> {
    const args = ['preview'];

    // 添加环境参数
    if (options.environment) {
      args.push('--environment', options.environment);
    }

    if (options.port) {
      args.push('--port', options.port.toString());
    }
    if (options.host) {
      args.push('--host', options.host);
    }
    if (options.open) {
      args.push('--open');
    }
    if (options.https) {
      args.push('--https');
    }

    await this.runLauncherCommand(taskId, args, options);
  }

  /**
   * 运行 Launcher 命令
   */
  private async runLauncherCommand(taskId: string, args: string[], options: TaskOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const task = this.tasks.get(taskId);
      if (!task) {
        reject(new Error('任务不存在'));
        return;
      }

      // 使用 node 运行 launcher - 使用更可靠的路径解析
      let launcherPath: string;
      try {
        // 尝试通过 require.resolve 找到 launcher 包
        const launcherPackagePath = require.resolve('@ldesign/launcher/package.json');
        const launcherDir = path.dirname(launcherPackagePath);
        launcherPath = path.join(launcherDir, 'bin', 'launcher.js');
      } catch (error) {
        // 如果找不到包，使用基于项目根目录的路径
        const projectRoot = this.findProjectRoot();
        launcherPath = path.join(projectRoot, 'packages', 'launcher', 'bin', 'launcher.js');
      }

      const workingDir = options.cwd ? path.resolve(this.context.cwd, options.cwd) : this.context.cwd;

      // 调试信息
      console.log(`[TaskRunner] 启动launcher命令:`);
      console.log(`[TaskRunner] - launcher路径: ${launcherPath}`);
      console.log(`[TaskRunner] - 工作目录: ${workingDir}`);
      console.log(`[TaskRunner] - context.cwd: ${this.context.cwd}`);
      console.log(`[TaskRunner] - options.cwd: ${options.cwd}`);
      console.log(`[TaskRunner] - 命令参数: ${args.join(' ')}`);
      console.log(`[TaskRunner] - 任务ID: ${taskId}`);

      // 使用 node 命令而不是绝对路径，这样更可靠
      const nodeExecutable = 'node';
      console.log(`[TaskRunner] 使用Node.js可执行文件: ${nodeExecutable}`);

      // 检查 launcher 文件是否存在
      if (!fs.existsSync(launcherPath)) {
        throw new Error(`Launcher 文件不存在: ${launcherPath}`);
      }

      // 构建命令参数
      const cmdArgs = [launcherPath, ...args];
      console.log(`[TaskRunner] 执行命令: node ${cmdArgs.join(' ')}`);
      console.log(`[TaskRunner] 工作目录: ${workingDir}`);

      // 使用 spawn 而不是 exec，这样可以更好地处理实时输出
      const child = spawn('node', cmdArgs, {
        cwd: workingDir,
        stdio: 'pipe',
        env: {
          ...process.env,
          FORCE_COLOR: '1',
          NODE_ENV: options.environment || 'development'
        }
      });

      this.processes.set(taskId, child);

      // 处理输出
      child.stdout?.on('data', (data) => {
        const output = data.toString();
        task.output.push(output);
        this.emitTaskOutput(taskId, output, 'stdout');
      });

      child.stderr?.on('data', (data) => {
        const output = data.toString();
        task.output.push(output);
        this.emitTaskOutput(taskId, output, 'stderr');
      });

      child.on('close', (code) => {
        console.log(`[TaskRunner] 进程关闭，任务ID: ${taskId}, 退出码: ${code}`);
        this.processes.delete(taskId);

        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`命令执行失败，退出码: ${code}`));
        }
      });

      child.on('error', (error) => {
        console.log(`[TaskRunner] 进程错误，任务ID: ${taskId}, 错误:`, error);
        this.processes.delete(taskId);
        reject(error);
      });
    });
  }

  /**
   * 运行 CLI 命令
   */
  private async runCliCommand(taskId: string, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const task = this.tasks.get(taskId);
      if (!task) {
        reject(new Error('任务不存在'));
        return;
      }

      // 使用 node 运行 CLI
      const cliPath = require.resolve('../../index.js');
      const child = spawn('node', [cliPath, ...args], {
        cwd: this.context.cwd,
        stdio: 'pipe',
        env: { ...process.env, FORCE_COLOR: '1' }
      });

      this.processes.set(taskId, child);

      // 处理输出
      child.stdout?.on('data', (data) => {
        const output = data.toString();
        task.output.push(output);
        this.emitTaskOutput(taskId, output, 'stdout');
      });

      child.stderr?.on('data', (data) => {
        const output = data.toString();
        task.output.push(output);
        this.emitTaskOutput(taskId, output, 'stderr');
      });

      child.on('close', (code) => {
        this.processes.delete(taskId);

        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`命令执行失败，退出码: ${code}`));
        }
      });

      child.on('error', (error) => {
        this.processes.delete(taskId);
        reject(error);
      });
    });
  }

  /**
   * 获取任务状态
   */
  async getTaskStatus(taskId: string): Promise<TaskStatus | null> {
    return this.tasks.get(taskId) || null;
  }

  /**
   * 停止任务
   */
  async stopTask(taskId: string): Promise<void> {
    const process = this.processes.get(taskId);
    const task = this.tasks.get(taskId);

    if (process) {
      process.kill('SIGTERM');
      this.processes.delete(taskId);
    }

    if (task) {
      task.status = 'cancelled';
      task.endTime = new Date();
      this.emitTaskUpdate(taskId, task);
    }
  }

  /**
   * 根据任务名和环境停止任务
   */
  async stopTaskByNameAndEnv(taskName: string, environment?: string): Promise<void> {
    // 查找匹配的任务
    for (const [taskId, task] of this.tasks.entries()) {
      if (task.name === taskName && task.status === 'running') {
        // 如果指定了环境，需要匹配环境
        if (environment) {
          // 这里我们需要在任务中存储环境信息
          // 暂时通过taskId来判断（格式：taskName-environment）
          const expectedTaskId = `${taskName}-${environment}`;
          if (taskId.includes(environment)) {
            await this.stopTask(taskId);
            return;
          }
        } else {
          await this.stopTask(taskId);
          return;
        }
      }
    }
  }

  /**
   * 获取所有任务
   */
  getAllTasks(): TaskStatus[] {
    return Array.from(this.tasks.values());
  }

  /**
   * 清理已完成的任务
   */
  cleanupTasks(): void {
    for (const [taskId, task] of this.tasks.entries()) {
      if (task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled') {
        this.tasks.delete(taskId);
      }
    }
  }

  /**
   * 发送任务更新事件
   */
  private emitTaskUpdate(taskId: string, task: TaskStatus): void {
    // 向所有客户端广播任务状态更新
    this.io.emit('task:update', task);
    this.io.emit('tasks:list', this.getAllTasks());
  }

  /**
   * 发送任务输出事件
   */
  private emitTaskOutput(taskId: string, output: string, type: 'stdout' | 'stderr'): void {
    // 向所有客户端广播任务输出
    this.io.emit('task:output', {
      taskId,
      output,
      type,
      timestamp: new Date()
    });
  }

  /**
   * 查找项目根目录
   */
  private findProjectRoot(): string {
    let currentDir = this.context.cwd;

    // 向上查找，直到找到包含 packages 目录的根目录
    while (currentDir !== path.dirname(currentDir)) {
      const packagesDir = path.join(currentDir, 'packages');
      const launcherDir = path.join(packagesDir, 'launcher');

      if (fs.existsSync(packagesDir) && fs.existsSync(launcherDir)) {
        return currentDir;
      }

      currentDir = path.dirname(currentDir);
    }

    // 如果找不到，返回当前工作目录
    return this.context.cwd;
  }
}

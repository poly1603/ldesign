/**
 * Web UI 服务器
 */

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { resolve, join } from 'path';
import { readFileSync, existsSync } from 'fs';
import open from 'open';
import net from 'net';
import { CLIContext } from '../types/index';
import { ProjectManager } from './project-manager';
import { TaskRunner } from './task-runner';
import { taskStateManager } from './task-state-manager';
import { GitManager } from './git-manager';
export interface WebServerOptions {
  port?: number;
  host?: string;
  open?: boolean;
  staticPath?: string;
}

export class WebServer {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private projectManager: ProjectManager;
  private taskRunner: TaskRunner;
  private context: CLIContext;

  constructor(context: CLIContext, options: WebServerOptions = {}) {
    this.context = context;
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // 清空之前的任务状态和所有历史数据
    taskStateManager.clearAllTasks();
    context.logger.info('🧹 已清空之前的任务状态');

    // 清理所有历史日志和服务器信息
    this.clearAllHistoryData();

    this.projectManager = new ProjectManager(context);
    this.taskRunner = new TaskRunner(context, this.io);

    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocketIO();
  }

  /**
   * 清理所有历史数据
   */
  private clearAllHistoryData(): void {
    try {
      // 清理任务状态管理器中的所有数据
      taskStateManager.clearAllTasks();

      // 通知所有连接的客户端清理数据
      this.io.emit('clear-all-data');

      this.context.logger.debug('已清理所有历史数据');
    } catch (error) {
      this.context.logger.error('清理历史数据失败:', error);
    }
  }

  /**
   * 设置中间件
   */
  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // 静态文件服务
    const staticPath = resolve(__dirname, '../../web-ui/dist');
    if (existsSync(staticPath)) {
      this.app.use(express.static(staticPath));
    }
  }

  /**
   * 设置路由
   */
  private setupRoutes(): void {
    // API 路由
    this.app.use('/api', this.createApiRouter());

    // SPA 路由处理
    this.app.get('*', (req, res) => {
      const indexPath = resolve(__dirname, '../../web-ui/dist/index.html');
      if (existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).json({
          error: 'Web UI not built. Please run: npm run build:ui'
        });
      }
    });
  }

  /**
   * 创建 API 路由
   */
  private createApiRouter(): express.Router {
    const router = express.Router();

    // 项目信息
    router.get('/project', async (req, res) => {
      try {
        const info = await this.projectManager.getProjectInfo();
        res.json(info);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 项目配置
    router.get('/config', async (req, res) => {
      try {
        const config = await this.projectManager.getConfig();
        res.json(config);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    router.post('/config', async (req, res) => {
      try {
        await this.projectManager.updateConfig(req.body);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Launcher 配置管理
    router.get('/launcher-configs', async (req, res) => {
      try {
        const configs = await this.projectManager.getLauncherConfigs();
        res.json(configs);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    router.get('/launcher-config/:environment', async (req, res) => {
      try {
        const { environment } = req.params;
        const config = await this.projectManager.readLauncherConfig(environment);
        res.json(config);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    router.post('/launcher-config/:environment', async (req, res) => {
      try {
        const { environment } = req.params;
        const { content } = req.body;
        await this.projectManager.saveLauncherConfig(environment, content);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 任务执行
    router.post('/tasks/:taskName', async (req, res) => {
      try {
        const { taskName } = req.params;
        const options = req.body;
        const taskId = await this.taskRunner.runTask(taskName, options);
        res.json({ taskId, status: 'started' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 根据任务名和环境停止任务（最具体的路由放在前面）
    router.post('/tasks/:taskName/stop', async (req, res) => {
      try {
        const { taskName } = req.params;
        const { environment } = req.body;
        await this.taskRunner.stopTaskByNameAndEnv(taskName, environment);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 根据类型和环境获取任务状态
    router.get('/tasks/:taskType/:environment', async (req, res) => {
      try {
        const { taskType, environment } = req.params;
        const task = taskStateManager.getTaskByTypeAndEnv(taskType, environment);
        res.json(task || null);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 获取任务详细信息（从TaskStateManager）
    router.get('/task-state/:taskId', async (req, res) => {
      try {
        const { taskId } = req.params;
        const task = taskStateManager.getTask(taskId);
        res.json(task || null);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 获取所有任务状态（从TaskStateManager）
    router.get('/tasks', async (req, res) => {
      try {
        const tasks = taskStateManager.getAllTasks();
        res.json(tasks);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 任务状态（原有的TaskRunner路由）
    router.get('/tasks/:taskId', async (req, res) => {
      try {
        const { taskId } = req.params;
        const status = await this.taskRunner.getTaskStatus(taskId);
        res.json(status);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 停止任务
    router.delete('/tasks/:taskId', async (req, res) => {
      try {
        const { taskId } = req.params;
        await this.taskRunner.stopTask(taskId);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 文件系统
    router.get('/files', async (req, res) => {
      try {
        const { path = '.' } = req.query;
        const files = await this.projectManager.listFiles(path as string);
        res.json(files);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    router.get('/files/content', async (req, res) => {
      try {
        const { path } = req.query;
        if (!path) {
          return res.status(400).json({ error: 'Path is required' });
        }
        const content = await this.projectManager.readFile(path as string);
        res.json({ content });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    router.post('/files/content', async (req, res) => {
      try {
        const { path, content } = req.body;
        await this.projectManager.writeFile(path, content);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 模板管理
    router.get('/templates', async (req, res) => {
      try {
        const templates = await this.projectManager.getTemplates();
        res.json(templates);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 项目初始化
    router.post('/init', async (req, res) => {
      try {
        const options = req.body;
        const taskId = await this.taskRunner.runTask('init', options);
        res.json({ taskId, status: 'started' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 依赖管理 API
    this.setupDependencyRoutes(router);

    // 插件管理 API
    this.setupPluginRoutes(router);

    // 项目统计 API
    this.setupStatsRoutes(router);

    // 构建产物检查 API
    this.setupBuildRoutes(router);

    return router;
  }

  /**
   * 设置依赖管理路由
   */
  private setupDependencyRoutes(router: any): void {
    // 获取依赖列表
    router.get('/dependencies', async (req: any, res: any) => {
      try {
        const dependencies = await this.projectManager.getDependencies();
        res.json(dependencies);
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : '获取依赖失败' });
      }
    });

    // 添加依赖
    router.post('/dependencies', async (req: any, res: any) => {
      try {
        const { name, version, type } = req.body;
        await this.projectManager.addDependency(name, version, type);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : '添加依赖失败' });
      }
    });

    // 移除依赖
    router.delete('/dependencies/:name', async (req: any, res: any) => {
      try {
        const { name } = req.params;
        const { type } = req.query;
        await this.projectManager.removeDependency(name, type);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : '移除依赖失败' });
      }
    });

    // 更新依赖
    router.put('/dependencies/:name', async (req: any, res: any) => {
      try {
        const { name } = req.params;
        const { version, type } = req.body;
        await this.projectManager.updateDependency(name, version, type);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : '更新依赖失败' });
      }
    });

    // 一键升级所有依赖
    router.post('/dependencies/upgrade-all', async (req: any, res: any) => {
      try {
        const results = await this.projectManager.upgradeAllDependencies();
        res.json({ results });
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : '一键升级失败' });
      }
    });

    // 搜索包
    router.get('/dependencies/search', async (req: any, res: any) => {
      try {
        const { q: query, limit } = req.query;
        if (!query) {
          return res.status(400).json({ error: '搜索关键词不能为空' });
        }
        const packages = await this.projectManager.searchPackages(query as string, limit ? parseInt(limit as string) : undefined);
        res.json(packages);
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : '搜索包失败' });
      }
    });
  }

  /**
   * 设置插件管理路由
   */
  private setupPluginRoutes(router: any): void {
    // 获取已安装插件
    router.get('/plugins', async (req: any, res: any) => {
      try {
        const plugins = await this.projectManager.getPlugins();
        res.json(plugins);
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : '获取插件失败' });
      }
    });

    // 获取可用插件
    router.get('/plugins/available', async (req: any, res: any) => {
      try {
        const plugins = await this.projectManager.getAvailablePlugins();
        res.json(plugins);
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : '获取可用插件失败' });
      }
    });

    // 安装插件
    router.post('/plugins/:name/install', async (req: any, res: any) => {
      try {
        const { name } = req.params;
        await this.projectManager.installPlugin(name);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : '安装插件失败' });
      }
    });

    // 卸载插件
    router.delete('/plugins/:name', async (req: any, res: any) => {
      try {
        const { name } = req.params;
        await this.projectManager.uninstallPlugin(name);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : '卸载插件失败' });
      }
    });

    // 切换插件状态
    router.put('/plugins/:name/toggle', async (req: any, res: any) => {
      try {
        const { name } = req.params;
        const { enabled } = req.body;
        await this.projectManager.togglePlugin(name, enabled);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : '切换插件状态失败' });
      }
    });

    // 更新插件配置
    router.put('/plugins/:name/config', async (req: any, res: any) => {
      try {
        const { name } = req.params;
        const config = req.body;
        await this.projectManager.updatePluginConfig(name, config);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : '更新插件配置失败' });
      }
    });
  }

  /**
   * 设置项目统计路由
   */
  private setupStatsRoutes(router: any): void {
    // 获取项目统计
    router.get('/stats', async (req: any, res: any) => {
      try {
        const stats = await this.projectManager.getDetailedProjectStats();
        res.json(stats);
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : '获取项目统计失败' });
      }
    });
  }

  /**
   * 设置构建产物检查路由
   */
  private setupBuildRoutes(router: any): void {
    // 检查构建产物是否存在
    router.get('/build/check/:environment', async (req: any, res: any) => {
      try {
        const { environment } = req.params;
        const exists = await this.projectManager.checkBuildExists(environment);
        res.json({ exists, environment });
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : '检查构建产物失败' });
      }
    });

    // 获取构建时间
    router.get('/build/time/:environment', async (req: any, res: any) => {
      try {
        const { environment } = req.params;
        const buildTime = await this.projectManager.getBuildTime(environment);
        res.json({ buildTime, environment });
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : '获取构建时间失败' });
      }
    });

    // 清理构建产物
    router.delete('/build/clean/:environment', async (req: any, res: any) => {
      try {
        const { environment } = req.params;
        await this.projectManager.cleanBuildDir(environment);
        res.json({ success: true, environment });
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : '清理构建产物失败' });
      }
    });
  }

  /**
   * 设置 Socket.IO
   */
  private setupSocketIO(): void {
    this.io.on('connection', (socket) => {
      this.context.logger.debug(`客户端连接: ${socket.id}`);

      socket.on('disconnect', () => {
        this.context.logger.debug(`客户端断开: ${socket.id}`);
      });

      // 订阅任务日志
      socket.on('subscribe:task', (taskId: string) => {
        socket.join(`task:${taskId}`);
      });

      socket.on('unsubscribe:task', (taskId: string) => {
        socket.leave(`task:${taskId}`);
      });
    });
  }

  /**
   * 查找可用端口：从起始端口开始，依次 +1，最多尝试 20 次
   */
  private findAvailablePort(startPort: number, host: string): Promise<number> {
    const maxAttempts = 20;
    let port = startPort;
    let attempts = 0;

    return new Promise((resolve) => {
      const tryPort = () => {
        attempts++;
        const tester = net.createServer()
          .once('error', (err: any) => {
            // 被占用则尝试下一个端口
            if (err.code === 'EADDRINUSE') {
              if (attempts >= maxAttempts) {
                // 尝试到上限，仍不可用，回退到起始端口，交给上层错误处理
                resolve(startPort);
              } else {
                port += 1;
                tryPort();
              }
            } else {
              // 其它错误时，直接返回起始端口
              resolve(startPort);
            }
          })
          .once('listening', () => {
            tester.close(() => resolve(port));
          })
          .listen(port, host);
      };
      tryPort();
    });
  }

  /**
   * 启动服务器（自动端口回退）
   */
  async start(options: WebServerOptions = {}): Promise<void> {
    const desiredPort = options.port || 3000;
    const host = options.host || 'localhost';

    // 预检并找到可用端口
    const chosenPort = await this.findAvailablePort(desiredPort, host);
    const switched = chosenPort !== desiredPort;

    return new Promise((resolve, reject) => {
      this.server.listen(chosenPort, host, () => {
        const url = `http://${host}:${chosenPort}`;
        if (switched) {
          this.context.logger.warn(`端口 ${desiredPort} 被占用，已自动切换到 ${chosenPort}`);
        }
        this.context.logger.success(`🌐 Web UI 已启动: ${url}`);

        if (options.open !== false) {
          open(url).catch(() => {
            this.context.logger.warn('无法自动打开浏览器，请手动访问:', url);
          });
        }

        resolve();
      });

      this.server.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          this.context.logger.error(`端口 ${chosenPort} 已被占用`);
        } else {
          this.context.logger.error('服务器启动失败:', error);
        }
        reject(error);
      });
    });
  }

  /**
   * 停止服务器
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => {
        this.context.logger.info('Web UI 服务器已停止');
        resolve();
      });
    });
  }

  /**
   * 获取 Socket.IO 实例
   */
  getIO(): SocketIOServer {
    return this.io;
  }
}

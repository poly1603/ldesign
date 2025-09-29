import { dirname, resolve, join } from 'path'
import { existsSync, mkdirSync, unlinkSync, writeFileSync, readFileSync, appendFileSync, rmSync } from 'fs'
import { createRequire } from 'module'

export interface LogRecord {
  id: number
  taskId: string
  ts: string
  type: 'info' | 'error' | 'warning'
  content: string
}

export interface TaskRecord {
  taskId: string
  taskType: 'dev' | 'build' | 'preview'
  environment: string
  status: 'idle' | 'running' | 'completed' | 'error'
  startTime?: string
  endTime?: string
  serverInfo?: {
    localUrl?: string
    networkUrl?: string
    port?: string
  }
  outputLines?: { timestamp: string; content: string; type: 'info' | 'error' | 'warning' }[]
}

export class LocalDB {
  // 运行时选择模式：优先使用 better-sqlite3，找不到则使用文件存储
  private mode: 'sqlite' | 'fs' = 'fs'
  private db: any | null = null
  private dbPath: string
  private deleteOnDispose: boolean

  // fs 后备实现
  private baseDir: string
  private tasksFile: string
  private logsFile: string
  private metaFile: string
  private cacheTasks: Record<string, any> = {}
  private lastLogId = 0

  constructor(dbPath: string, opts: { resetOnStart?: boolean; deleteOnDispose?: boolean } = {}) {
    this.dbPath = dbPath
    this.deleteOnDispose = !!opts.deleteOnDispose
    const dir = dirname(dbPath)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

    // FS 后备文件路径
    this.baseDir = dir
    this.tasksFile = join(dir, 'ui.tasks.json')
    this.logsFile = join(dir, 'ui.logs.ndjson')
    this.metaFile = join(dir, 'ui.meta.json')

    // 尝试加载 better-sqlite3（可选依赖）
    try {
      const require = createRequire(import.meta.url)
      const Better: any = require('better-sqlite3')
      this.db = new Better(dbPath)
      this.db.pragma('journal_mode = WAL')
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          task_type TEXT NOT NULL,
          environment TEXT NOT NULL,
          status TEXT NOT NULL,
          start_time TEXT,
          end_time TEXT,
          local_url TEXT,
          network_url TEXT,
          port TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_tasks_type_env ON tasks(task_type, environment);

        CREATE TABLE IF NOT EXISTS logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          task_id TEXT NOT NULL,
          ts TEXT NOT NULL,
          type TEXT NOT NULL,
          content TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_logs_task ON logs(task_id, id);
      `)
      this.mode = 'sqlite'
    } catch {
      // fallback: 文件存储
      this.mode = 'fs'
      if (opts.resetOnStart) {
        this.clearAll()
      }
      // 读取元数据与任务缓存
      try {
        if (existsSync(this.metaFile)) {
          const meta = JSON.parse(readFileSync(this.metaFile, 'utf-8'))
          this.lastLogId = meta.lastLogId || 0
        }
      } catch {}
      try {
        if (existsSync(this.tasksFile)) {
          this.cacheTasks = JSON.parse(readFileSync(this.tasksFile, 'utf-8')) || {}
        }
      } catch {}
    }

    if (this.mode === 'sqlite' && opts.resetOnStart) {
      this.clearAll()
    }
  }

  clearAll() {
    if (this.mode === 'sqlite') {
      this.db.exec('DELETE FROM logs; DELETE FROM tasks; VACUUM;')
    } else {
      try { if (existsSync(this.tasksFile)) rmSync(this.tasksFile) } catch {}
      try { if (existsSync(this.logsFile)) rmSync(this.logsFile) } catch {}
      writeFileSync(this.tasksFile, JSON.stringify({}), 'utf-8')
      writeFileSync(this.metaFile, JSON.stringify({ lastLogId: 0 }), 'utf-8')
      this.cacheTasks = {}
      this.lastLogId = 0
    }
  }

  dispose() {
    if (this.mode === 'sqlite') {
      try { this.db.close() } catch {}
      if (this.deleteOnDispose) {
        try { unlinkSync(this.dbPath) } catch {}
      }
    } else if (this.deleteOnDispose) {
      try { if (existsSync(this.tasksFile)) unlinkSync(this.tasksFile) } catch {}
      try { if (existsSync(this.logsFile)) unlinkSync(this.logsFile) } catch {}
      try { if (existsSync(this.metaFile)) unlinkSync(this.metaFile) } catch {}
    }
  }

  private fsSaveTasks() {
    try { writeFileSync(this.tasksFile, JSON.stringify(this.cacheTasks, null, 2), 'utf-8') } catch {}
  }
  private fsSaveMeta() {
    try { writeFileSync(this.metaFile, JSON.stringify({ lastLogId: this.lastLogId }), 'utf-8') } catch {}
  }

  upsertTask(record: {
    taskId: string
    taskType: 'dev' | 'build' | 'preview'
    environment: string
    status: 'idle' | 'running' | 'completed' | 'error'
    startTime?: string
    endTime?: string
  }) {
    if (this.mode === 'sqlite') {
      const stmt = this.db.prepare(`
        INSERT INTO tasks(id, task_type, environment, status, start_time, end_time)
        VALUES (@taskId, @taskType, @environment, @status, @startTime, @endTime)
        ON CONFLICT(id) DO UPDATE SET
          status=excluded.status,
          start_time=COALESCE(excluded.start_time, tasks.start_time),
          end_time=COALESCE(excluded.end_time, tasks.end_time)
      `)
      stmt.run(record)
    } else {
      this.cacheTasks[record.taskId] = {
        taskId: record.taskId,
        taskType: record.taskType,
        environment: record.environment,
        status: record.status,
        startTime: record.startTime,
        endTime: record.endTime,
        serverInfo: this.cacheTasks[record.taskId]?.serverInfo || {}
      }
      this.fsSaveTasks()
    }
  }

  updateTaskStatus(taskId: string, status: 'idle' | 'running' | 'completed' | 'error', endTime?: string) {
    if (this.mode === 'sqlite') {
      const stmt = this.db.prepare(`UPDATE tasks SET status=@status, end_time=COALESCE(@endTime, end_time) WHERE id=@taskId`)
      stmt.run({ taskId, status, endTime })
    } else {
      const t = this.cacheTasks[taskId] || { taskId, serverInfo: {} }
      t.status = status
      if (endTime) t.endTime = endTime
      this.cacheTasks[taskId] = t
      this.fsSaveTasks()
    }
  }

  updateServerInfo(taskId: string, info: { localUrl?: string; networkUrl?: string; port?: string }) {
    if (this.mode === 'sqlite') {
      const stmt = this.db.prepare(`
        UPDATE tasks SET
          local_url = COALESCE(@localUrl, local_url),
          network_url = COALESCE(@networkUrl, network_url),
          port = COALESCE(@port, port)
        WHERE id = @taskId
      `)
      stmt.run({ taskId, ...info })
    } else {
      const t = this.cacheTasks[taskId] || { taskId, serverInfo: {} }
      t.serverInfo = { ...(t.serverInfo || {}), ...info }
      this.cacheTasks[taskId] = t
      this.fsSaveTasks()
    }
  }

  appendLog(taskId: string, line: { timestamp: string; content: string; type: 'info' | 'error' | 'warning' }) {
    if (this.mode === 'sqlite') {
      const stmt = this.db.prepare(`INSERT INTO logs(task_id, ts, type, content) VALUES (@taskId, @ts, @type, @content)`)
      stmt.run({ taskId, ts: line.timestamp, type: line.type, content: line.content })
    } else {
      this.lastLogId += 1
      const rec = { id: this.lastLogId, taskId, ts: line.timestamp, type: line.type, content: line.content }
      appendFileSync(this.logsFile, JSON.stringify(rec) + '\n', 'utf-8')
      this.fsSaveMeta()
    }
  }

  getLogs(taskId: string, opts: { afterId?: number; limit?: number } = {}): LogRecord[] {
    const { afterId, limit = 500 } = opts
    if (this.mode === 'sqlite') {
      if (afterId) {
        return this.db.prepare(`SELECT id, task_id as taskId, ts, type, content FROM logs WHERE task_id=@taskId AND id>@afterId ORDER BY id ASC LIMIT @limit`).all({ taskId, afterId, limit }) as any
      }
      return this.db.prepare(`SELECT id, task_id as taskId, ts, type, content FROM logs WHERE task_id=@taskId ORDER BY id DESC LIMIT @limit`).all({ taskId, limit }).reverse() as any
    }
    // fs 模式：读取全部再筛选（日志量通常可控；如需优化可做索引）
    if (!existsSync(this.logsFile)) return []
    const text = readFileSync(this.logsFile, 'utf-8')
    const lines = text ? text.trim().split('\n') : []
    const records: LogRecord[] = []
    for (const l of lines) {
      if (!l) continue
      try {
        const obj = JSON.parse(l)
        if (obj.taskId !== taskId) continue
        if (afterId && obj.id <= afterId) continue
        records.push(obj)
      } catch {}
    }
    // 保持顺序与 sqlite 分支一致：升序
    records.sort((a, b) => a.id - b.id)
    return records.slice(-limit)
  }

  getTaskWithLogs(taskId: string, limit = 1000): TaskRecord | null {
    if (this.mode === 'sqlite') {
      const row = this.db.prepare(`SELECT id, task_type, environment, status, start_time, end_time, local_url, network_url, port FROM tasks WHERE id=@taskId`).get({ taskId }) as any
      if (!row) return null
      const logs = this.getLogs(taskId, { limit })
      return {
        taskId: row.id,
        taskType: row.task_type,
        environment: row.environment,
        status: row.status,
        startTime: row.start_time,
        endTime: row.end_time,
        serverInfo: { localUrl: row.local_url || undefined, networkUrl: row.network_url || undefined, port: row.port || undefined },
        outputLines: logs.map(l => ({ timestamp: l.ts, content: l.content, type: l.type as any }))
      }
    }
    const t = this.cacheTasks[taskId]
    if (!t) return null
    const logs = this.getLogs(taskId, { limit })
    return {
      taskId: t.taskId,
      taskType: t.taskType,
      environment: t.environment,
      status: t.status,
      startTime: t.startTime,
      endTime: t.endTime,
      serverInfo: t.serverInfo || {},
      outputLines: logs.map(l => ({ timestamp: l.ts, content: l.content, type: l.type as any }))
    }
  }

  getTaskWithLogsByTypeEnv(taskType: string, environment: string, limit = 1000): TaskRecord | null {
    if (this.mode === 'sqlite') {
      const row = this.db.prepare(`
        SELECT id, task_type, environment, status, start_time, end_time, local_url, network_url, port
        FROM tasks WHERE task_type=@taskType AND environment=@environment ORDER BY start_time DESC LIMIT 1
      `).get({ taskType, environment }) as any
      if (!row) return null
      return this.getTaskWithLogs(row.id, limit)
    }
    const match = Object.values(this.cacheTasks).filter((t: any) => t.taskType === taskType && t.environment === environment)
    if (match.length === 0) return null
    // 选最近的（按 startTime 排序）
    match.sort((a: any, b: any) => new Date(b.startTime || 0).getTime() - new Date(a.startTime || 0).getTime())
    return this.getTaskWithLogs(match[0].taskId, limit)
  }

  getAllTasks(): TaskRecord[] {
    if (this.mode === 'sqlite') {
      const rows = this.db.prepare(`SELECT id, task_type, environment, status, start_time, end_time, local_url, network_url, port FROM tasks ORDER BY start_time DESC`).all() as any[]
      return rows.map(r => ({
        taskId: r.id,
        taskType: r.task_type,
        environment: r.environment,
        status: r.status,
        startTime: r.start_time,
        endTime: r.end_time,
        serverInfo: { localUrl: r.local_url || undefined, networkUrl: r.network_url || undefined, port: r.port || undefined },
        outputLines: []
      }))
    }
    return Object.values(this.cacheTasks) as any
  }
}

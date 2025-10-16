/**
 * 数据库模块导出
 * 提供统一的数据库访问接口
 */

export { DatabaseManager, getDatabaseManager, closeDatabaseManager } from './DatabaseManager'
export { MigrationService } from './MigrationService'
export { ProjectRepository } from './repositories/ProjectRepository'
export { NpmSourceRepository } from './repositories/NpmSourceRepository'

// 导出类型
export type { DatabaseConfig } from './DatabaseManager'
export type { Project } from './repositories/ProjectRepository'
export type { NpmSource, NpmSourceType } from './repositories/NpmSourceRepository'

import { getDatabaseManager } from './DatabaseManager'
import { MigrationService } from './MigrationService'
import { ProjectRepository } from './repositories/ProjectRepository'
import { NpmSourceRepository } from './repositories/NpmSourceRepository'
import * as path from 'path'

/**
 * 初始化数据库系统
 * 在应用启动时调用此函数
 */
export async function initializeDatabase(options?: {
  dataDir?: string
  dbPath?: string
  verbose?: boolean
  autoMigrate?: boolean
}): Promise<{
  success: boolean
  message: string
  migrationResult?: any
}> {
  try {
    

    // 1. 获取数据库管理器实例
    const dbManager = getDatabaseManager({
      dbPath: options?.dbPath,
      verbose: options?.verbose ?? false,
    })

    // 2. 初始化数据库连接和表结构
    await dbManager.initialize()

    // 3. 检查是否需要数据迁移
    const dataDir = options?.dataDir || path.join(process.cwd(), 'data')
    const migrationService = new MigrationService(dbManager, dataDir)
    
    let migrationResult
    if (options?.autoMigrate !== false && migrationService.needsMigration()) {
      
      
      // 备份现有数据文件
      await migrationService.backupDataFiles()
      
      // 执行数据迁移
      migrationResult = await migrationService.migrate()
      
      if (migrationResult.success) {
        
        
        
        
        
      } else {
        console.warn('[Database] 数据迁移部分失败:', migrationResult.errors)
      }
    } else {
      
    }

    // 4. 验证数据库完整性
    const isHealthy = dbManager.checkIntegrity()
    if (!isHealthy) {
      throw new Error('数据库完整性检查失败')
    }

    // 5. 获取数据库统计信息
    const stats = dbManager.getStats()
    
    .toFixed(2)} MB`)
    
    for (const table of stats.tables) {
      
    }

    

    return {
      success: true,
      message: '数据库初始化成功',
      migrationResult,
    }
  } catch (error) {
    console.error('[Database] 数据库初始化失败:', error)
    return {
      success: false,
      message: `数据库初始化失败: ${error}`,
    }
  }
}

/**
 * 获取所有仓库实例
 * 便于在应用中使用
 */
export function getRepositories() {
  const dbManager = getDatabaseManager()
  
  return {
    project: new ProjectRepository(dbManager),
    npmSource: new NpmSourceRepository(dbManager),
    // 可以继续添加其他仓库
    // ai: new AIConfigRepository(dbManager),
    // settings: new SettingsRepository(dbManager),
  }
}

/**
 * 关闭数据库连接
 * 在应用退出时调用
 */
export { closeDatabaseManager as closeDatabase } from './DatabaseManager'

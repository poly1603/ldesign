/**
 * 数据库测试脚本
 * 用于测试数据库迁移和基本功能
 */

import { initializeDatabase, getRepositories, closeDatabase } from './src/server/database/index.js'

async function testDatabase() {
  console.log('🚀 开始测试数据库...\n')

  try {
    // 1. 初始化数据库
    console.log('📦 步骤 1: 初始化数据库')
    const result = await initializeDatabase({
      verbose: true,
      autoMigrate: true,
    })

    if (!result.success) {
      console.error('❌ 数据库初始化失败:', result.message)
      process.exit(1)
    }

    console.log('✅ 数据库初始化成功\n')

    // 2. 获取仓库实例
    console.log('📦 步骤 2: 获取仓库实例')
    const repos = getRepositories()
    console.log('✅ 仓库实例获取成功\n')

    // 3. 测试项目操作
    console.log('📦 步骤 3: 测试项目操作')
    
    // 查询所有项目
    const projects = repos.project.findAll()
    console.log(`  - 当前项目数量: ${projects.length}`)
    
    if (projects.length > 0) {
      console.log('  - 项目列表:')
      projects.forEach((p, i) => {
        console.log(`    ${i + 1}. ${p.name} (${p.type}) - ${p.path}`)
      })
    }
    
    console.log('✅ 项目操作测试成功\n')

    // 4. 测试 NPM 源操作
    console.log('📦 步骤 4: 测试 NPM 源操作')
    
    // 初始化默认源（如果需要）
    repos.npmSource.initializeDefaultSources()
    
    // 查询所有源
    const sources = repos.npmSource.findAll()
    console.log(`  - 当前 NPM 源数量: ${sources.length}`)
    
    if (sources.length > 0) {
      console.log('  - NPM 源列表:')
      sources.forEach((s, i) => {
        console.log(`    ${i + 1}. ${s.name} - ${s.url}`)
      })
    }
    
    console.log('✅ NPM 源操作测试成功\n')

    // 5. 显示统计信息
    console.log('📊 数据库统计信息:')
    const projectCount = repos.project.count()
    const npmSourceCount = repos.npmSource.count()
    console.log(`  - 项目总数: ${projectCount}`)
    console.log(`  - NPM 源总数: ${npmSourceCount}\n`)

    // 6. 测试完成
    console.log('✅ 所有测试通过！\n')

  } catch (error) {
    console.error('\n❌ 测试过程中出现错误:', error)
    process.exit(1)
  } finally {
    // 关闭数据库连接
    try {
      closeDatabase()
      console.log('✅ 数据库连接已关闭')
    } catch (error) {
      console.error('❌ 关闭数据库连接时出错:', error)
    }
  }

  console.log('\n🎉 数据库测试完成！')
}

// 运行测试
testDatabase().catch(error => {
  console.error('❌ 测试失败:', error)
  process.exit(1)
})

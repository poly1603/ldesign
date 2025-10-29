import { randomUUID } from 'crypto'
import { join } from 'path'
import { db } from '../src/database'

// 初始化数据库
db.initialize()

const sampleProjects = [
  {
    id: 'demo-1',
    name: 'LDesign前端演示项目',
    path: 'D:\\WorkBench\\ldesign\\tools\\web',
    type: 'web',
    framework: 'vue',
    packageManager: 'pnpm',
    description: 'LDesign Web管理界面 - Vue3 + Vite + Naive UI',
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7天前
    updatedAt: Date.now(),
  },
  {
    id: 'demo-2',
    name: 'LDesign后端API服务',
    path: 'D:\\WorkBench\\ldesign\\tools\\server',
    type: 'api',
    framework: 'express',
    packageManager: 'pnpm',
    description: 'LDesign 后端 API 服务 - 集成所有工具包的API接口',
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5天前
    updatedAt: Date.now(),
  },
  {
    id: randomUUID(),
    name: 'Vue3组件库',
    path: 'D:\\Projects\\vue3-components',
    type: 'library',
    framework: 'vue',
    packageManager: 'pnpm',
    description: '基于Vue3的UI组件库',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30天前
    updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2天前
  },
  {
    id: randomUUID(),
    name: 'React电商平台',
    path: 'D:\\Projects\\react-shop',
    type: 'web',
    framework: 'react',
    packageManager: 'yarn',
    description: '基于React的电商平台前端项目',
    createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60天前
    updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1天前
  },
]

console.log('开始插入示例项目数据...')

try {
  for (const project of sampleProjects) {
    // 检查项目是否已存在
    const existing = db.getDb().prepare('SELECT * FROM projects WHERE id = ?').get(project.id)
    
    if (existing) {
      console.log(`⏭️  项目 "${project.name}" 已存在，跳过`)
      continue
    }

    db.getDb().prepare(`
      INSERT INTO projects (id, name, path, type, framework, packageManager, description, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      project.id,
      project.name,
      project.path,
      project.type,
      project.framework,
      project.packageManager,
      project.description,
      project.createdAt,
      project.updatedAt
    )

    console.log(`✅ 已添加项目: ${project.name}`)
  }

  console.log('\n✨ 示例数据插入完成!')
  console.log(`📊 共添加 ${sampleProjects.length} 个项目\n`)

  // 显示所有项目
  const allProjects = db.getDb().prepare('SELECT id, name, framework FROM projects').all()
  console.log('当前数据库中的项目:')
  console.table(allProjects)

} catch (error) {
  console.error('❌ 插入数据失败:', error)
  process.exit(1)
} finally {
  db.close()
}

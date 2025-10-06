/**
 * 测试用户管理功能
 * 运行: node test-user-management.js
 */

import { join } from 'path'
import { homedir } from 'os'
import { existsSync, readFileSync } from 'fs'

const configDir = join(homedir(), '.ldesign', 'verdaccio')
const htpasswdPath = join(configDir, 'htpasswd')

console.log('=== Verdaccio 用户管理测试 ===\n')
console.log('配置目录:', configDir)
console.log('htpasswd 文件路径:', htpasswdPath)
console.log('文件是否存在:', existsSync(htpasswdPath))
console.log('')

if (existsSync(htpasswdPath)) {
  const content = readFileSync(htpasswdPath, 'utf-8')
  console.log('htpasswd 文件内容:')
  console.log('---')
  console.log(content)
  console.log('---')
  console.log('')
  
  const lines = content.split('\n').filter(line => line.trim())
  console.log(`总共 ${lines.length} 个用户:`)
  lines.forEach((line, index) => {
    const [username] = line.split(':')
    console.log(`${index + 1}. ${username}`)
  })
} else {
  console.log('⚠️  htpasswd 文件不存在')
  console.log('请先通过 UI 添加用户或启动 Verdaccio 服务')
}

// 简单的构建验证测试
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔍 验证构建输出...')

// 检查必要的构建文件
const requiredFiles = [
  'dist/index.js',
  'dist/index.min.js',
  'dist/index.d.ts',
  'es/index.js',
  'lib/index.js'
]

let allFilesExist = true

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file)
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - 存在`)
  } else {
    console.log(`❌ ${file} - 缺失`)
    allFilesExist = false
  }
})

// 检查 package.json 中的导出配置
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
console.log('\n📦 Package.json 导出配置:')
console.log('✅ exports:', JSON.stringify(packageJson.exports, null, 2))

if (allFilesExist) {
  console.log('\n🎉 构建验证成功！所有必要文件都已生成。')
  process.exit(0)
} else {
  console.log('\n❌ 构建验证失败！有文件缺失。')
  process.exit(1)
}

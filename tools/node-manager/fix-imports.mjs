#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 修复 tar 和 extract-zip 的导入问题
const files = [
  join(__dirname, 'es', 'downloaders', 'node-downloader.js'),
  join(__dirname, 'lib', 'downloaders', 'node-downloader.js')
]

for (const file of files) {
  try {
    let content = readFileSync(file, 'utf-8')
    
    // 将 import s from"tar" 修改为 import * as s from"tar"
    content = content.replace(/import\s+(\w+)\s+from\s*["']tar["']/g, 'import * as $1 from"tar"')
    
    // 将 import i from"extract-zip" 修改为正确的导入方式
    content = content.replace(/import\s+(\w+)\s+from\s*["']extract-zip["']/g, 'import $1 from"extract-zip"')
    
    writeFileSync(file, content, 'utf-8')
    console.log(`✅ 修复了: ${file}`)
  } catch (error) {
    console.error(`跳过文件 ${file}: ${error.message}`)
  }
}

console.log('✅ 修复完成')
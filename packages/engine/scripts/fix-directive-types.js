#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const testFile = path.join(__dirname, '../tests/directive-manager.test.ts')
let content = fs.readFileSync(testFile, 'utf8')

// 修复所有的 .mounted! 和 .unmounted! 调用
content = content.replace(/commonDirectives\.(\w+)\.mounted!/g, ';(commonDirectives.$1 as any).mounted!')
content = content.replace(/commonDirectives\.(\w+)\.unmounted!/g, ';(commonDirectives.$1 as any).unmounted!')

// 修复 expect 语句中的类型错误
content = content.replace(/expect\(typeof commonDirectives\.(\w+)\.mounted\)/g, 'expect(typeof (commonDirectives.$1 as any).mounted)')

fs.writeFileSync(testFile, content)
console.log('Fixed directive type errors in directive-manager.test.ts')

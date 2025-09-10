const fs = require('fs')
const path = require('path')

// 需要修复的文件列表
const filesToFix = [
  'src/core/command-manager.ts',
  'src/core/editor-state.ts',
  'src/core/editor.ts',
  'src/core/event-manager.ts',
  'src/core/index.ts',
  'src/core/plugin-manager.ts',
  'src/core/selection-manager.ts',
  'src/plugins/base-plugin.ts',
  'src/plugins/index.ts',
  'src/plugins/plugin-registry.ts',
  'src/plugins/block/blockquote-plugin.ts',
  'src/plugins/block/heading-plugin.ts',
  'src/plugins/block/list-plugin.ts',
  'src/plugins/format/bold-plugin.ts',
  'src/plugins/format/italic-plugin.ts',
  'src/plugins/format/underline-plugin.ts',
  'src/renderers/dom-renderer.ts',
  'src/renderers/index.ts',
  'src/renderers/style-manager.ts',
  'src/themes/index.ts',
  'src/themes/theme-manager.ts'
]

// 路径映射规则
const pathMappings = {
  '@/types': '../types',
  '@/utils': '../utils',
  '@/core': '../core',
  '@/plugins': '../plugins',
  '@/renderers': '../renderers',
  '@/themes': '../themes'
}

function getRelativePath(fromFile, toModule) {
  const fromDir = path.dirname(fromFile)
  const levels = fromDir.split('/').length - 1 // src 目录的层级
  
  switch (toModule) {
    case '@/types':
      return '../'.repeat(levels) + 'types'
    case '@/utils':
      return '../'.repeat(levels) + 'utils'
    case '@/core':
      return '../'.repeat(levels) + 'core'
    case '@/plugins':
      return '../'.repeat(levels) + 'plugins'
    case '@/renderers':
      return '../'.repeat(levels) + 'renderers'
    case '@/themes':
      return '../'.repeat(levels) + 'themes'
    default:
      return toModule
  }
}

function fixImportsInFile(filePath) {
  const fullPath = path.join(__dirname, filePath)
  
  if (!fs.existsSync(fullPath)) {
    console.log(`文件不存在: ${filePath}`)
    return
  }
  
  let content = fs.readFileSync(fullPath, 'utf-8')
  let modified = false
  
  // 替换所有 @/ 开头的导入
  content = content.replace(/from\s+['"](@\/[^'"]+)['"]/g, (match, importPath) => {
    const relativePath = getRelativePath(filePath, importPath)
    modified = true
    console.log(`${filePath}: ${importPath} -> ${relativePath}`)
    return match.replace(importPath, relativePath)
  })
  
  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf-8')
    console.log(`✅ 修复完成: ${filePath}`)
  } else {
    console.log(`⏭️  无需修复: ${filePath}`)
  }
}

// 执行修复
console.log('🔧 开始修复导入路径...')
filesToFix.forEach(fixImportsInFile)
console.log('✅ 所有文件修复完成！')

/**
 * Vue SFC TypeScript 预处理器
 * 解决 rollup-plugin-vue 无法处理外部 TypeScript 类型导入的问题
 */

import { readFileSync } from 'fs'
import { resolve, dirname, join } from 'path'
import type { Plugin } from 'rollup'

export interface VueTypeScriptPreprocessorOptions {
  /** 源代码目录 */
  srcDir?: string
}

/**
 * Vue SFC TypeScript 预处理器插件
 * 将外部 TypeScript 类型定义内联到 Vue 文件中
 */
export function vueTypeScriptPreprocessor(options: VueTypeScriptPreprocessorOptions = {}): Plugin {
  const { srcDir = 'src' } = options

  return {
    name: 'vue-typescript-preprocessor',
    transform(code: string, id: string) {
      // 只处理 Vue 文件
      if (!id.endsWith('.vue')) {
        return null
      }

      try {
        // 记录原始代码以便调试
        console.log(`[Vue TypeScript Preprocessor] Processing: ${id}`)
        
        // 查找类型导入语句
        const typeImportRegex = /import\s+type\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g
        
        let transformedCode = code
        const typeDefinitions: Record<string, string> = {}
        const importMatches: string[] = []

        // 收集类型导入
        let match
        const allRequiredTypes: string[] = []
        
        while ((match = typeImportRegex.exec(code)) !== null) {
          const [fullMatch, typesStr, importPath] = match
          importMatches.push(fullMatch)
          
          const types = typesStr.split(',').map(t => t.trim())
          allRequiredTypes.push(...types)
          
          console.log(`[Vue TypeScript Preprocessor] Found type import: ${fullMatch}`)
          
          // 解析相对路径
          if (importPath.startsWith('.')) {
            const vueDir = dirname(id)
            const typeFilePath = resolve(vueDir, importPath.endsWith('.ts') ? importPath : importPath + '.ts')
            
            console.log(`[Vue TypeScript Preprocessor] Trying to read: ${typeFilePath}`)
            
            try {
              const typeFileContent = readFileSync(typeFilePath, 'utf-8')
              
              // 提取类型定义 - 支持 interface 和 type alias
              const types = typesStr.split(',').map(t => t.trim())
              for (const type of types) {
                // 匹配接口定义（支持多行）
                const interfaceRegex = new RegExp(
                  `export\\s+interface\\s+${type}\\s*\\{[\\s\\S]*?\\}`,
                  'g'
                )
                const interfaceMatch = typeFileContent.match(interfaceRegex)
                if (interfaceMatch) {
                  typeDefinitions[type] = interfaceMatch[0].replace(/^export\s+/, '')
                  console.log(`[Vue TypeScript Preprocessor] Found interface: ${type}`)
                  continue
                }
                
                // 匹配类型别名（支持多行）
                const typeAliasRegex = new RegExp(
                  `export\\s+type\\s+${type}\\s*=[\\s\\S]*?(?=\\nexport|\\n\\n|$)`,
                  'g'
                )
                const typeAliasMatch = typeFileContent.match(typeAliasRegex)
                if (typeAliasMatch) {
                  typeDefinitions[type] = typeAliasMatch[0].replace(/^export\s+/, '')
                  console.log(`[Vue TypeScript Preprocessor] Found type alias: ${type}`)
                  continue
                }
                
                console.warn(`[Vue TypeScript Preprocessor] Type not found: ${type}`)
              }
            } catch (error) {
              console.warn(`[Vue TypeScript Preprocessor] 无法读取类型文件: ${typeFilePath}`, error)
            }
          }
        }

        // 检查是否找到了所有需要的类型
        const foundTypes = Object.keys(typeDefinitions)
        const missingTypes = allRequiredTypes.filter(type => !foundTypes.includes(type))
        
        if (missingTypes.length > 0) {
          console.warn(`[Vue TypeScript Preprocessor] Missing types: ${missingTypes.join(', ')}`)
          console.log(`[Vue TypeScript Preprocessor] Skipping transformation for ${id}`)
          return null // 不转换，让原始代码通过
        }
        
        // 如果找到所有类型定义，进行转换
        if (Object.keys(typeDefinitions).length > 0) {
          console.log(`[Vue TypeScript Preprocessor] Inlining ${Object.keys(typeDefinitions).length} types`)
          
          // 移除原始的类型导入（保留一个空行以免语法错误）
          for (const importMatch of importMatches) {
            transformedCode = transformedCode.replace(importMatch, '')
          }
          
          // 清理多余的空行
          transformedCode = transformedCode.replace(/\n\s*\n\s*\n/g, '\n\n')
          
          // 在所有import语句之后插入内联类型定义
          const scriptSetupRegex = /(<script\s+setup\s+lang=['"]ts['"]>[\s\S]*?)(import[\s\S]*?from\s+['"][^'"]*['"]\s*)/g
          let lastImportEnd = -1
          let importMatch
          
          // 找到最后一个import语句的位置
          while ((importMatch = scriptSetupRegex.exec(transformedCode)) !== null) {
            lastImportEnd = importMatch.index + importMatch[0].length
          }
          
          if (lastImportEnd > -1) {
            const inlineTypes = Object.values(typeDefinitions).join('\n\n')
            const insertion = `\n\n// 内联类型定义 (自动生成)\n${inlineTypes}\n`
            transformedCode = transformedCode.slice(0, lastImportEnd) + insertion + transformedCode.slice(lastImportEnd)
          } else {
            // 如果没有找到import，在script setup标签后插入
            const basicScriptRegex = /(<script\s+setup\s+lang=['"]ts['"]>)/
            transformedCode = transformedCode.replace(
              basicScriptRegex,
              `$1\n\n// 内联类型定义 (自动生成)\n${Object.values(typeDefinitions).join('\n\n')}\n`
            )
          }
          
          console.log(`[Vue TypeScript Preprocessor] Successfully inlined types`)
          // 调试: 显示转换后的完整代码（只对第一个文件）
          if (id.includes('LDialog.vue')) {
            console.log(`[Vue TypeScript Preprocessor] Full transformed LDialog.vue:\n${transformedCode}`)
          }
        } else {
          console.log(`[Vue TypeScript Preprocessor] No type definitions found in ${id}`)
        }

        return {
          code: transformedCode,
          map: null
        }
      } catch (error) {
        console.warn(`Vue TypeScript 预处理失败: ${id}`, error)
        return null
      }
    }
  }
}

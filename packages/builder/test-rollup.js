/**
 * 测试RollupBuilder功能
 */

import { createTDesignBuilder } from './dist/index.js'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import { readdir } from 'fs/promises'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

async function test() {
  console.log('🧪 Testing RollupBuilder...\n')
  
  // 创建测试输入文件
  const testDir = resolve(__dirname, 'test-build')
  const testSrc = resolve(testDir, 'src')
  
  // 确保测试目录存在
  if (!existsSync(testSrc)) {
    const { mkdir, writeFile } = await import('fs/promises')
    await mkdir(testSrc, { recursive: true })
    
    // 创建测试文件
    await writeFile(
      resolve(testSrc, 'index.ts'),
      `// Test file
export const version = '1.0.0'

export function hello(name: string): string {
  return \`Hello, \${name}!\`
}

export default {
  version,
  hello
}
`
    )
    
    // 创建tsconfig.json
    await writeFile(
      resolve(testDir, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          target: 'ES2020',
          module: 'ESNext',
          lib: ['ES2020'],
          declaration: true,
          outDir: './dist',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          moduleResolution: 'node'
        },
        include: ['src/**/*']
      }, null, 2)
    )
  }
  
  // 创建构建器
  const builder = createTDesignBuilder({
    root: testDir,
    input: resolve(testSrc, 'index.ts'),
    external: [],
    presetOptions: {
      typescript: {
        enabled: true,
        tsconfig: resolve(testDir, 'tsconfig.json'),
        declaration: true,
        declarationDir: resolve(testDir, 'dist')
      },
      minify: {
        enabled: false
      }
    }
  })
  
  console.log('📦 Building test project...')
  
  try {
    // 执行构建
    const result = await builder.build()
    
    if (result.success) {
      console.log('✅ Build successful!\n')
      console.log('Build Result:')
      console.log(`  Duration: ${result.duration.toFixed(2)}ms`)
      console.log(`  Outputs: ${result.outputs.length}`)
      
      result.outputs.forEach(output => {
        console.log(`\n  ${output.format.toUpperCase()} Format:`)
        console.log(`    Path: ${output.path}`)
        console.log(`    Files: ${output.files.length}`)
        console.log(`    Size: ${(output.size / 1024).toFixed(2)} KB`)
        if (output.gzipSize) {
          console.log(`    Gzip: ${(output.gzipSize / 1024).toFixed(2)} KB`)
        }
      })
      
      // 列出生成的文件
      console.log('\n📂 Generated files:')
      const esFiles = await readdir(resolve(testDir, 'es')).catch(() => [])
      const cjsFiles = await readdir(resolve(testDir, 'cjs')).catch(() => [])
      const distFiles = await readdir(resolve(testDir, 'dist')).catch(() => [])
      
      if (esFiles.length > 0) {
        console.log('  ES Module:', esFiles.join(', '))
      }
      if (cjsFiles.length > 0) {
        console.log('  CommonJS:', cjsFiles.join(', '))
      }
      if (distFiles.length > 0) {
        console.log('  TypeScript Declarations:', distFiles.filter(f => f.endsWith('.d.ts')).join(', '))
      }
      
      console.log('\n🎉 Test completed successfully!')
    } else {
      console.error('❌ Build failed!')
      console.error('Errors:', result.errors)
    }
    
    // 清理
    await builder.destroy()
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    await builder.destroy()
    process.exit(1)
  }
}

// 运行测试
test().catch(console.error)

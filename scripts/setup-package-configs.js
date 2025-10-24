/**
 * 批量为 packages 创建 builder 配置文件
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// packages 目录
const packagesDir = path.join(__dirname, '../packages')

// 包配置映射 - 自定义每个包的 UMD 名称和特殊配置
const packageConfigs = {
  'shared': { umdName: 'LDesignShared', hasVue: true },
  'animation': { umdName: 'LDesignAnimation', hasVue: true, hasReact: true },
  'api': { umdName: 'LDesignApi' },
  'auth': { umdName: 'LDesignAuth' },
  'cache': { umdName: 'LDesignCache' },
  'color': { umdName: 'LDesignColor' },
  'crypto': { umdName: 'LDesignCrypto' },
  'device': { umdName: 'LDesignDevice' },
  'engine': { umdName: 'LDesignEngine' },
  'file': { umdName: 'LDesignFile' },
  'http': { umdName: 'LDesignHttp' },
  'i18n': { umdName: 'LDesignI18n', hasVue: true },
  'icons': { umdName: 'LDesignIcons', hasVue: true },
  'logger': { umdName: 'LDesignLogger' },
  'notification': { umdName: 'LDesignNotification' },
  'permission': { umdName: 'LDesignPermission' },
  'router': { umdName: 'LDesignRouter', hasVue: true },
  'size': { umdName: 'LDesignSize' },
  'storage': { umdName: 'LDesignStorage' },
  'store': { umdName: 'LDesignStore', hasVue: true },
  'template': { umdName: 'LDesignTemplate', hasVue: true },
  'validator': { umdName: 'LDesignValidator' },
  'websocket': { umdName: 'LDesignWebSocket' },
}

// 生成配置文件内容
function generateConfig(packageName, config) {
  const external = [
    'vue',
    'react',
    'react-dom',
    '/^@ldesign\\//',
    '/^lodash/',
  ]

  // 添加包特定的 external
  if (config.hasVue) {
    external.push('/^@vue\\//')
  }
  if (config.hasReact) {
    external.push('/^@babel\\//')
  }

  // 格式化 external 数组
  const externalLines = external.map(ext => {
    if (ext.startsWith('/')) {
      return `    ${ext},`
    }
    return `    '${ext}',`
  }).join('\n')

  return `import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  
  output: {
    format: ['esm', 'cjs', 'umd'],
    esm: {
      dir: 'es',
      preserveStructure: true,
    },
    cjs: {
      dir: 'lib',
      preserveStructure: true,
    },
    umd: {
      dir: 'dist',
      name: '${config.umdName}',
    },
  },
  
  dts: true,
  sourcemap: true,
  minify: false,
  clean: true,
  
  external: [
${externalLines}
  ],
  
  typescript: {
    declaration: true,
    declarationMap: true,
  },
})
`
}

// 主函数
async function main() {
  console.log('🚀 开始为 packages 创建配置文件...\n')

  let created = 0
  let skipped = 0
  let errors = 0

  for (const [packageName, config] of Object.entries(packageConfigs)) {
    const packagePath = path.join(packagesDir, packageName)
    const configPath = path.join(packagePath, 'ldesign.config.ts')

    // 检查包目录是否存在
    if (!existsSync(packagePath)) {
      console.log(`⚠️  跳过 ${packageName}: 目录不存在`)
      skipped++
      continue
    }

    // 检查配置文件是否已存在
    if (existsSync(configPath)) {
      console.log(`ℹ️  跳过 ${packageName}: 配置文件已存在`)
      skipped++
      continue
    }

    try {
      // 生成并写入配置文件
      const content = generateConfig(packageName, config)
      await fs.writeFile(configPath, content, 'utf-8')
      console.log(`✅ 已创建 ${packageName}/ldesign.config.ts`)
      created++
    } catch (error) {
      console.error(`❌ 创建 ${packageName} 配置失败:`, error.message)
      errors++
    }
  }

  console.log(`\n📊 完成统计:`)
  console.log(`   ✅ 创建: ${created} 个`)
  console.log(`   ℹ️  跳过: ${skipped} 个`)
  console.log(`   ❌ 错误: ${errors} 个`)
  console.log(`\n✨ 配置文件创建完成！`)
}

main().catch(console.error)

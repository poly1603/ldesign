import * as fs from 'fs'
import * as path from 'path'
import { globSync } from 'glob'

// Fixes to apply
const fixes = [
  {
    pattern: /import\.meta\.env\.([A-Z_]+)/g,
    replacement: 'import.meta.env?.$1',
    description: 'Fix potentially undefined import.meta.env'
  },
  {
    pattern: /window\.__LDESIGN_([A-Z_]+)__/g,
    replacement: 'window.__LDESIGN_$1__!',
    description: 'Add non-null assertion to window extensions'
  },
  {
    pattern: /\bthis\.config\.(\w+)/g,
    replacement: 'this.config?.$1',
    description: 'Make config access safe'
  },
  {
    pattern: /@Event\(\) (\w+): EventEmitter<(.+?)>;/g,
    replacement: '@Event() $1!: EventEmitter<$2>;',
    description: 'Add definite assignment to Event decorators'
  },
  {
    pattern: /@State\(\) (\w+): (.+?);/g,
    replacement: '@State() $1!: $2;',
    description: 'Add definite assignment to State decorators'
  }
]

function fixTypeScriptErrors() {
  console.log('🔧 Fixing TypeScript errors...\n')

  // Find all TypeScript files
  const tsFiles = globSync('packages/**/src/**/*.{ts,tsx}', {
    ignore: ['**/node_modules/**', '**/*.test.*', '**/*.spec.*', '**/dist/**']
  })

  let totalFixes = 0
  const filesFixes = new Map<string, number>()

  for (const file of tsFiles) {
    const content = fs.readFileSync(file, 'utf-8')
    let modifiedContent = content
    let fileFixes = 0

    for (const fix of fixes) {
      const matches = content.match(fix.pattern)
      if (matches) {
        modifiedContent = modifiedContent.replace(fix.pattern, fix.replacement)
        fileFixes += matches.length
      }
    }

    if (fileFixes > 0) {
      fs.writeFileSync(file, modifiedContent, 'utf-8')
      filesFixes.set(file, fileFixes)
      totalFixes += fileFixes
      console.log(`✅ Fixed ${fileFixes} issues in ${path.relative(process.cwd(), file)}`)
    }
  }

  console.log(`\n🎉 Fixed ${totalFixes} TypeScript issues in ${filesFixes.size} files`)
}

// Add missing type exports
function addMissingTypeExports() {
  console.log('\n📦 Adding missing type exports...\n')

  const indexFiles = globSync('packages/**/src/index.ts', {
    ignore: ['**/node_modules/**', '**/dist/**']
  })

  for (const file of indexFiles) {
    const content = fs.readFileSync(file, 'utf-8')
    
    // Check if types are exported
    if (!content.includes("export type") && !content.includes("export * from './types'")) {
      const typesPath = path.join(path.dirname(file), 'types')
      if (fs.existsSync(typesPath)) {
        const newContent = content + "\n\n// Type exports\nexport * from './types'\n"
        fs.writeFileSync(file, newContent, 'utf-8')
        console.log(`✅ Added type exports to ${path.relative(process.cwd(), file)}`)
      }
    }
  }
}

// Fix import paths
function fixImportPaths() {
  console.log('\n🔗 Fixing import paths...\n')

  const files = globSync('packages/**/src/**/*.{ts,tsx}', {
    ignore: ['**/node_modules/**', '**/*.test.*', '**/*.spec.*', '**/dist/**']
  })

  const importFixes = [
    {
      pattern: /from ['"]@\/types['"]/g,
      replacement: "from '../types'",
      description: 'Fix @/types imports'
    },
    {
      pattern: /from ['"]@\/(.+?)['"]/g,
      replacement: "from '../$1'",
      description: 'Fix @ imports'
    }
  ]

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8')
    let modifiedContent = content

    for (const fix of importFixes) {
      modifiedContent = modifiedContent.replace(fix.pattern, fix.replacement)
    }

    if (modifiedContent !== content) {
      fs.writeFileSync(file, modifiedContent, 'utf-8')
      console.log(`✅ Fixed imports in ${path.relative(process.cwd(), file)}`)
    }
  }
}

// Main execution
function main() {
  try {
    fixTypeScriptErrors()
    addMissingTypeExports()
    fixImportPaths()
    console.log('\n✨ All fixes applied successfully!')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()
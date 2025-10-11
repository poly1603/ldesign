import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const examplesDir = resolve(__dirname, '../examples')

const examples = ['vanilla-demo', 'vue3-demo']

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    })

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with code ${code}`))
      } else {
        resolve()
      }
    })
  })
}

async function main() {
  console.log('Building main library...')
  await runCommand('pnpm', ['build'], resolve(__dirname, '..'))

  for (const example of examples) {
    console.log(`\nBuilding ${example}...`)
    const exampleDir = resolve(examplesDir, example)
    try {
      await runCommand('pnpm', ['build'], exampleDir)
      console.log(`✓ ${example} built successfully`)
    } catch (error) {
      console.error(`✗ ${example} build failed:`, error.message)
    }
  }

  console.log('\n✓ All builds completed')
}

main().catch((error) => {
  console.error('Build failed:', error)
  process.exit(1)
})

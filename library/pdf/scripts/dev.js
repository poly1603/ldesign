import { spawn } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const args = process.argv.slice(2)
const example = args[0] || 'vanilla-demo'

const examplesDir = resolve(__dirname, '../examples')
const exampleDir = resolve(examplesDir, example)

function runDev() {
  console.log(`Starting ${example} in development mode...`)

  const child = spawn('pnpm', ['dev'], {
    cwd: exampleDir,
    stdio: 'inherit',
    shell: true
  })

  child.on('close', (code) => {
    if (code !== 0) {
      console.error(`Dev server exited with code ${code}`)
      process.exit(code)
    }
  })
}

runDev()

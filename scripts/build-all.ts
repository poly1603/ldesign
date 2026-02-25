#!/usr/bin/env tsx
/**
 * Build all packages in dependency order
 * Starting from core packages and then dependent packages
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import { existsSync } from 'fs'
import { join } from 'path'

const execAsync = promisify(exec)

// Define build order based on dependencies
// Core packages first, then packages that depend on them
// NOTE: This list must match actual packages in .gitmodules under packages/
const buildOrder = [
  // Core package that others depend on
  'shared',

  // Infrastructure packages
  'logger',
  'error',

  // Foundation packages
  'color',
  'size',
  'template',

  // Feature packages (may depend on shared)
  'auth',
  'cache',
  'crypto',
  'device',
  'engine',
  'http',
  'i18n',
  'menu',
  'notification',
  'permission',
  'router',
  'store',
  'tracker',
  'bookmark',
  'breadcrumb',

  // API package depends on http
  'api',
]

interface BuildResult {
  package: string
  success: boolean
  error?: string
  duration: number
}

async function buildPackage(packageName: string): Promise<BuildResult> {
  const startTime = Date.now()
  const packagePath = join(process.cwd(), 'packages', packageName)

  // Check if package exists
  if (!existsSync(packagePath)) {
    return {
      package: packageName,
      success: false,
      error: `Package directory not found: ${packagePath}`,
      duration: 0,
    }
  }

  // Check if package.json exists
  const packageJsonPath = join(packagePath, 'package.json')
  if (!existsSync(packageJsonPath)) {
    return {
      package: packageName,
      success: false,
      error: `package.json not found: ${packageJsonPath}`,
      duration: 0,
    }
  }

  console.log(`\n📦 Building @ldesign/${packageName}...`)

  try {
    // Run build command using pnpm workspace
    const { stdout, stderr } = await execAsync(
      `pnpm --filter @ldesign/${packageName} run build`,
      {
        cwd: process.cwd(),
        env: { ...process.env, FORCE_COLOR: '1' },
      }
    )

    if (stdout) {
      console.log(stdout)
    }

    if (stderr && !stderr.includes('WARN')) {
      console.error(`⚠️  Warnings for ${packageName}:`, stderr)
    }

    const duration = Date.now() - startTime
    console.log(
      `✅ Successfully built @ldesign/${packageName} in ${(duration / 1000).toFixed(2)}s`
    )

    return {
      package: packageName,
      success: true,
      duration,
    }
  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error(`❌ Failed to build @ldesign/${packageName}:`)
    console.error(error.message || error)

    return {
      package: packageName,
      success: false,
      error: error.message || String(error),
      duration,
    }
  }
}

async function buildAll() {
  console.log('🚀 Starting build process for all packages...')
  console.log(`📋 Build order: ${buildOrder.join(', ')}\n`)

  const results: BuildResult[] = []
  const startTime = Date.now()

  // Parse command line arguments
  const args = process.argv.slice(2)
  const isClean = args.includes('--clean')
  const isDryRun = args.includes('--dry-run')
  const isVerbose = args.includes('--verbose')
  const isParallel = args.includes('--parallel')

  // Clean build directories if requested
  if (isClean) {
    console.log('🧹 Cleaning build directories...')
    try {
      await execAsync('pnpm run clean-build', { cwd: process.cwd() })
      console.log('✅ Clean completed\n')
    } catch (error) {
      console.warn('⚠️  Clean command not found or failed, continuing...\n')
    }
  }

  if (isDryRun) {
    console.log('🔍 Dry run mode - not actually building\n')
    for (const packageName of buildOrder) {
      console.log(`Would build: @ldesign/${packageName}`)
    }
    return
  }

  if (isParallel) {
    console.log('⚡ Building packages in parallel...\n')

    // Build core packages first sequentially
    const corePackages = ['shared', 'logger', 'validator']
    for (const packageName of corePackages) {
      const result = await buildPackage(packageName)
      results.push(result)

      if (!result.success) {
        console.error(`\n❌ Core package build failed. Stopping build process.`)
        break
      }
    }

    // Build remaining packages in parallel
    if (results.every(r => r.success)) {
      const remainingPackages = buildOrder.filter(
        p => !corePackages.includes(p)
      )
      const parallelResults = await Promise.all(
        remainingPackages.map(packageName => buildPackage(packageName))
      )
      results.push(...parallelResults)
    }
  } else {
    // Sequential build (default)
    for (const packageName of buildOrder) {
      const result = await buildPackage(packageName)
      results.push(result)

      // Stop on critical package failure
      if (
        !result.success &&
        ['shared', 'logger', 'validator'].includes(packageName)
      ) {
        console.error(
          `\n❌ Critical package build failed. Stopping build process.`
        )
        break
      }
    }
  }

  // Print summary
  const totalDuration = Date.now() - startTime
  console.log('\n' + '='.repeat(60))
  console.log('📊 Build Summary')
  console.log('='.repeat(60))

  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)

  console.log(`✅ Successful: ${successful.length}/${results.length}`)
  if (successful.length > 0) {
    console.log('   Packages:', successful.map(r => r.package).join(', '))
  }

  if (failed.length > 0) {
    console.log(`\n❌ Failed: ${failed.length}`)
    for (const result of failed) {
      console.log(`   - ${result.package}: ${result.error}`)
    }
  }

  console.log(`\n⏱️  Total time: ${(totalDuration / 1000).toFixed(2)}s`)

  if (isVerbose) {
    console.log('\n📈 Detailed timing:')
    for (const result of results) {
      if (result.success) {
        console.log(
          `   ${result.package}: ${(result.duration / 1000).toFixed(2)}s`
        )
      }
    }
  }

  // Exit with error code if any builds failed
  if (failed.length > 0) {
    console.error('\n❌ Build process completed with errors')
    process.exit(1)
  } else {
    console.log('\n✅ All packages built successfully!')
  }
}

// Run the build process
buildAll().catch(error => {
  console.error('❌ Unexpected error during build process:', error)
  process.exit(1)
})

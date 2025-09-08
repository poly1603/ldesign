/**
 * Test script to verify the built project module works
 */
import { BuildTool, PackageManager, ProjectDetector, ProjectType } from './dist/project/index.js'

async function testProjectDetection() {
  try {
    console.log('Testing Project Detection Module...')

    const detector = new ProjectDetector()
    const currentDir = process.cwd()

    console.log(`Detecting project type in: ${currentDir}`)
    const projectInfo = await detector.detectProject()

    console.log('Project Detection Result:')
    console.log(JSON.stringify(projectInfo, null, 2))

    // Test enum accessibility
    console.log('\nTesting enum exports:')
    console.log('ProjectType.NODEJS:', ProjectType.NODEJS)
    console.log('PackageManager.PNPM:', PackageManager.PNPM)
    console.log('BuildTool.TSUP:', BuildTool.TSUP)

    console.log('✅ Project module test passed!')
  }
  catch (error) {
    console.error('❌ Project module test failed:', error.message)
    process.exit(1)
  }
}

testProjectDetection()

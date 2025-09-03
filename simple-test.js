console.log('🚀 Simple test started')

async function test() {
  try {
    console.log('📦 Testing rollup import...')
    const { rollup } = await import('rollup')
    console.log('✅ Rollup imported successfully')
    
    console.log('🔧 Testing basic rollup functionality...')
    const bundle = await rollup({
      input: 'src/index.ts',
      external: ['vue'],
      plugins: []
    })
    
    console.log('✅ Bundle created successfully')
    await bundle.close()
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Stack:', error.stack)
  }
}

test()

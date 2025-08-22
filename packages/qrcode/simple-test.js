import QRCodeGenerator from './src/core/generator.ts'

async function test() {
  try {
    console.log('Testing QRCodeGenerator...')

    const generator = new QRCodeGenerator({
      data: 'Hello World',
      format: 'canvas',
      size: 200,
    })
    const result = await generator.generate()

    console.log('Success:', result)
  }
  catch (error) {
    console.error('Error:', error)
  }
}

test()

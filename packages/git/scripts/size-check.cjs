const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const file = path.resolve(__dirname, '..', 'dist', 'index.js')
const limitKB = 50

try {
  const buf = fs.readFileSync(file)
  const gz = zlib.gzipSync(buf)
  const sizeKB = gz.length / 1024
  const ok = sizeKB <= limitKB
  const msg = `Gzipped size: ${sizeKB.toFixed(2)} KB (limit: ${limitKB} KB)`
  if (ok) {
    console.log('OK', msg)
    process.exit(0)
  } else {
    console.error('FAIL', msg)
    process.exit(1)
  }
} catch (e) {
  console.error('ERROR reading file:', file, e && e.message)
  process.exit(2)
}


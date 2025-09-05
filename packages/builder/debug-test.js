const { LibraryBuilder } = require('./dist/index.js')

const builder = new LibraryBuilder()
console.log('Bundler:', builder.getBundler())
console.log('Type:', typeof builder.getBundler())

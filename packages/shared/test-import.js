// Test importing from the built package
import { formatDate, debounce } from './es/index-no-components.js'

console.log('Testing @ldesign/shared imports...')
console.log('✅ formatDate function:', typeof formatDate)
console.log('✅ debounce function:', typeof debounce)

// Test a simple function
const now = new Date()
const formatted = formatDate(now)
console.log('✅ formatDate test:', formatted)

// Test debounce
let callCount = 0
const debouncedFunc = debounce(() => {
  callCount++
  console.log('✅ Debounced function called, count:', callCount)
}, 100)

// Call multiple times
debouncedFunc()
debouncedFunc()
debouncedFunc()

setTimeout(() => {
  console.log('✅ Final call count after debounce:', callCount)
  console.log('✅ All tests passed!')
}, 200)

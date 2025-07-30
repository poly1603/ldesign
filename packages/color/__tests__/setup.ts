// Vitest setup file
import { beforeEach } from 'vitest'

beforeEach(() => {
  // Reset DOM before each test
  document.head.innerHTML = ''
  document.body.innerHTML = ''

  // Clear localStorage
  localStorage.clear()

  // Clear sessionStorage
  sessionStorage.clear()
})

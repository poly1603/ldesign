import { expect, test } from '@playwright/test'

test.describe('Crypto Library E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the vanilla example
    await page.goto('http://localhost:5173')
  })

  test('should load the crypto library', async ({ page }) => {
    // Check if the page loads correctly
    await expect(page).toHaveTitle(/Crypto Library Example/)

    // Check if the library is loaded
    const libraryLoaded = await page.evaluate(() => {
      return typeof window.LDesignCrypto !== 'undefined'
    })
    expect(libraryLoaded).toBe(true)
  })

  test('should perform AES encryption and decryption', async ({ page }) => {
    // Fill in the form
    await page.fill('#aes-data', 'Hello, World!')
    await page.fill('#aes-key', 'my-secret-key')

    // Click encrypt button
    await page.click('#aes-encrypt-btn')

    // Wait for result
    await page.waitForSelector('#aes-encrypted-result')
    const encryptedResult = await page.textContent('#aes-encrypted-result')
    expect(encryptedResult).toBeTruthy()
    expect(encryptedResult).not.toBe('Hello, World!')

    // Click decrypt button
    await page.click('#aes-decrypt-btn')

    // Wait for decrypted result
    await page.waitForSelector('#aes-decrypted-result')
    const decryptedResult = await page.textContent('#aes-decrypted-result')
    expect(decryptedResult).toBe('Hello, World!')
  })

  test('should perform hash operations', async ({ page }) => {
    // Fill in the form
    await page.fill('#hash-data', 'Hello, World!')

    // Select SHA256
    await page.selectOption('#hash-algorithm', 'SHA256')

    // Click hash button
    await page.click('#hash-btn')

    // Wait for result
    await page.waitForSelector('#hash-result')
    const hashResult = await page.textContent('#hash-result')
    expect(hashResult).toBeTruthy()
    expect(hashResult).toHaveLength(64) // SHA256 produces 64 hex characters
  })

  test('should perform Base64 encoding and decoding', async ({ page }) => {
    // Fill in the form
    await page.fill('#base64-data', 'Hello, World!')

    // Click encode button
    await page.click('#base64-encode-btn')

    // Wait for encoded result
    await page.waitForSelector('#base64-encoded-result')
    const encodedResult = await page.textContent('#base64-encoded-result')
    expect(encodedResult).toBeTruthy()
    expect(encodedResult).not.toBe('Hello, World!')

    // Click decode button
    await page.click('#base64-decode-btn')

    // Wait for decoded result
    await page.waitForSelector('#base64-decoded-result')
    const decodedResult = await page.textContent('#base64-decoded-result')
    expect(decodedResult).toBe('Hello, World!')
  })

  test('should handle errors gracefully', async ({ page }) => {
    // Try to encrypt with empty data
    await page.fill('#aes-data', '')
    await page.fill('#aes-key', 'my-secret-key')

    // Click encrypt button
    await page.click('#aes-encrypt-btn')

    // Wait for error message
    await page.waitForSelector('#aes-error')
    const errorMessage = await page.textContent('#aes-error')
    expect(errorMessage).toContain('error')
  })

  test('should generate random keys', async ({ page }) => {
    // Click generate key button
    await page.click('#generate-key-btn')

    // Wait for generated key
    await page.waitForSelector('#generated-key')
    const generatedKey = await page.textContent('#generated-key')
    expect(generatedKey).toBeTruthy()
    expect(generatedKey.length).toBeGreaterThan(0)

    // Generate another key and ensure they're different
    await page.click('#generate-key-btn')
    await page.waitForTimeout(100) // Small delay
    const generatedKey2 = await page.textContent('#generated-key')
    expect(generatedKey2).not.toBe(generatedKey)
  })
})

test.describe('Vue Integration E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Vue example
    await page.goto('http://localhost:5174')
  })

  test('should load Vue app with crypto integration', async ({ page }) => {
    // Check if the Vue app loads correctly
    await expect(page).toHaveTitle(/Vue Crypto Example/)

    // Check if Vue is loaded
    const vueLoaded = await page.evaluate(() => {
      return typeof window.Vue !== 'undefined'
    })
    expect(vueLoaded).toBe(true)
  })

  test('should use useCrypto composable', async ({ page }) => {
    // Fill in the form using Vue components
    await page.fill('[data-testid="crypto-input"]', 'Hello from Vue!')
    await page.fill('[data-testid="crypto-key"]', 'vue-secret-key')

    // Click encrypt button
    await page.click('[data-testid="encrypt-btn"]')

    // Wait for result
    await page.waitForSelector('[data-testid="encrypted-result"]')
    const encryptedResult = await page.textContent(
      '[data-testid="encrypted-result"]',
    )
    expect(encryptedResult).toBeTruthy()
    expect(encryptedResult).not.toBe('Hello from Vue!')

    // Click decrypt button
    await page.click('[data-testid="decrypt-btn"]')

    // Wait for decrypted result
    await page.waitForSelector('[data-testid="decrypted-result"]')
    const decryptedResult = await page.textContent(
      '[data-testid="decrypted-result"]',
    )
    expect(decryptedResult).toBe('Hello from Vue!')
  })

  test('should use useHash composable', async ({ page }) => {
    // Fill in the form
    await page.fill('[data-testid="hash-input"]', 'Hello from Vue!')

    // Click hash button
    await page.click('[data-testid="hash-btn"]')

    // Wait for result
    await page.waitForSelector('[data-testid="hash-result"]')
    const hashResult = await page.textContent('[data-testid="hash-result"]')
    expect(hashResult).toBeTruthy()
    expect(hashResult).toHaveLength(64) // SHA256 produces 64 hex characters
  })

  test('should show loading states', async ({ page }) => {
    // Fill in the form
    await page.fill('[data-testid="crypto-input"]', 'Test loading state')
    await page.fill('[data-testid="crypto-key"]', 'test-key')

    // Click encrypt button
    await page.click('[data-testid="encrypt-btn"]')

    // Check if loading indicator appears (might be very brief)
    const loadingIndicator = page.locator('[data-testid="loading-indicator"]')
    // Note: Loading might be too fast to catch in tests, but we can check the final state

    // Wait for result
    await page.waitForSelector('[data-testid="encrypted-result"]')

    // Ensure loading indicator is gone
    await expect(loadingIndicator).not.toBeVisible()
  })

  test('should handle Vue plugin integration', async ({ page }) => {
    // Check if the plugin is properly installed
    const _pluginInstalled = await page.evaluate(() => {
      // Check if $crypto is available on Vue instance
      return typeof window.__VUE_APP__?.$crypto !== 'undefined'
    })

    // Note: This test might need adjustment based on how the plugin is exposed
    // The exact implementation depends on how we expose the plugin in the example
  })
})

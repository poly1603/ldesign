import { expect, test } from '@playwright/test'

test.describe('基础功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 创建一个简单的内联 HTML 页面
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Store Test</title>
        <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
        <script src="https://unpkg.com/pinia@2/dist/pinia.iife.js"></script>
      </head>
      <body>
        <div id="app">
          <p id="count">{{ count }}</p>
          <p id="name">{{ name }}</p>
          <button id="increment" @click="increment">增加</button>
          <button id="setName" @click="setName">设置名称</button>
          <button id="reset" @click="reset">重置</button>
        </div>
        <script>
          const { createApp, ref } = Vue
          const { createPinia, defineStore } = Pinia

          const useStore = defineStore('test', () => {
            const count = ref(0)
            const name = ref('Test')

            function increment() { count.value++ }
            function setName() { name.value = 'Vue' }
            function reset() { count.value = 0; name.value = 'Test' }

            return { count, name, increment, setName, reset }
          })

          createApp({
            setup() {
              const store = useStore()
              return { ...store }
            }
          }).use(createPinia()).mount('#app')
        </script>
      </body>
      </html>
    `

    await page.setContent(html)
    await page.waitForLoadState('networkidle')
  })

  test('应该显示初始状态', async ({ page }) => {
    await expect(page.locator('#count')).toContainText('0')
    await expect(page.locator('#name')).toContainText('Test')
  })

  test('应该能够增加计数', async ({ page }) => {
    await page.click('#increment')
    await expect(page.locator('#count')).toContainText('1')

    await page.click('#increment')
    await expect(page.locator('#count')).toContainText('2')
  })

  test('应该能够设置名称', async ({ page }) => {
    await page.click('#setName')
    await expect(page.locator('#name')).toContainText('Vue')
  })

  test('应该能够重置状态', async ({ page }) => {
    // 先修改状态
    await page.click('#increment')
    await page.click('#setName')

    // 验证状态已修改
    await expect(page.locator('#count')).toContainText('1')
    await expect(page.locator('#name')).toContainText('Vue')

    // 重置状态
    await page.click('#reset')

    // 验证状态已重置
    await expect(page.locator('#count')).toContainText('0')
    await expect(page.locator('#name')).toContainText('Test')
  })

  test('应该能够连续操作', async ({ page }) => {
    // 连续点击增加按钮
    for (let i = 1; i <= 3; i++) {
      await page.click('#increment')
      await expect(page.locator('#count')).toContainText(i.toString())
    }

    // 设置名称
    await page.click('#setName')
    await expect(page.locator('#name')).toContainText('Vue')

    // 重置
    await page.click('#reset')
    await expect(page.locator('#count')).toContainText('0')
    await expect(page.locator('#name')).toContainText('Test')
  })
})

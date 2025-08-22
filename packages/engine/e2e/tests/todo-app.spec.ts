import { expect, test } from '@playwright/test'

test.describe('Todo 应用 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到 Todo 应用
    await page.goto('/examples/todo-app/')

    // 等待应用加载完成
    await page.waitForSelector('[data-testid="todo-app"]')
  })

  test('应该显示应用标题', async ({ page }) => {
    const title = await page.textContent('h1')
    expect(title).toContain('Todo')
  })

  test('应该能够添加新的待办事项', async ({ page }) => {
    const todoInput = page.locator('[data-testid="todo-input"]')
    const addButton = page.locator('[data-testid="add-todo"]')

    // 输入待办事项
    await todoInput.fill('学习 LDesign Engine')
    await addButton.click()

    // 验证待办事项已添加
    const todoItem = page.locator('[data-testid="todo-item"]').first()
    await expect(todoItem).toContainText('学习 LDesign Engine')
  })

  test('应该能够标记待办事项为完成', async ({ page }) => {
    // 先添加一个待办事项
    await page.locator('[data-testid="todo-input"]').fill('测试待办事项')
    await page.locator('[data-testid="add-todo"]').click()

    // 点击完成按钮
    const completeButton = page.locator('[data-testid="complete-todo"]').first()
    await completeButton.click()

    // 验证待办事项已标记为完成
    const todoItem = page.locator('[data-testid="todo-item"]').first()
    await expect(todoItem).toHaveClass(/completed/)
  })

  test('应该能够删除待办事项', async ({ page }) => {
    // 先添加一个待办事项
    await page.locator('[data-testid="todo-input"]').fill('要删除的待办事项')
    await page.locator('[data-testid="add-todo"]').click()

    // 点击删除按钮
    const deleteButton = page.locator('[data-testid="delete-todo"]').first()
    await deleteButton.click()

    // 验证待办事项已删除
    const todoItems = page.locator('[data-testid="todo-item"]')
    await expect(todoItems).toHaveCount(0)
  })

  test('应该能够编辑待办事项', async ({ page }) => {
    // 先添加一个待办事项
    await page.locator('[data-testid="todo-input"]').fill('原始待办事项')
    await page.locator('[data-testid="add-todo"]').click()

    // 点击编辑按钮
    const editButton = page.locator('[data-testid="edit-todo"]').first()
    await editButton.click()

    // 修改待办事项内容
    const editInput = page.locator('[data-testid="edit-input"]')
    await editInput.fill('修改后的待办事项')

    // 保存修改
    const saveButton = page.locator('[data-testid="save-edit"]')
    await saveButton.click()

    // 验证待办事项已修改
    const todoItem = page.locator('[data-testid="todo-item"]').first()
    await expect(todoItem).toContainText('修改后的待办事项')
  })

  test('应该能够筛选待办事项', async ({ page }) => {
    // 添加多个待办事项
    await page.locator('[data-testid="todo-input"]').fill('待办事项 1')
    await page.locator('[data-testid="add-todo"]').click()

    await page.locator('[data-testid="todo-input"]').fill('待办事项 2')
    await page.locator('[data-testid="add-todo"]').click()

    // 标记第一个为完成
    await page.locator('[data-testid="complete-todo"]').first().click()

    // 筛选只显示已完成的
    await page.locator('[data-testid="filter-completed"]').click()

    // 验证只显示已完成的待办事项
    const todoItems = page.locator('[data-testid="todo-item"]')
    await expect(todoItems).toHaveCount(1)
    await expect(todoItems.first()).toHaveClass(/completed/)

    // 筛选只显示未完成的
    await page.locator('[data-testid="filter-active"]').click()

    // 验证只显示未完成的待办事项
    await expect(todoItems).toHaveCount(1)
    await expect(todoItems.first()).not.toHaveClass(/completed/)
  })

  test('应该显示正确的统计信息', async ({ page }) => {
    // 添加多个待办事项
    await page.locator('[data-testid="todo-input"]').fill('待办事项 1')
    await page.locator('[data-testid="add-todo"]').click()

    await page.locator('[data-testid="todo-input"]').fill('待办事项 2')
    await page.locator('[data-testid="add-todo"]').click()

    await page.locator('[data-testid="todo-input"]').fill('待办事项 3')
    await page.locator('[data-testid="add-todo"]').click()

    // 标记一个为完成
    await page.locator('[data-testid="complete-todo"]').first().click()

    // 验证统计信息
    const totalCount = page.locator('[data-testid="total-count"]')
    const activeCount = page.locator('[data-testid="active-count"]')
    const completedCount = page.locator('[data-testid="completed-count"]')

    await expect(totalCount).toContainText('3')
    await expect(activeCount).toContainText('2')
    await expect(completedCount).toContainText('1')
  })

  test('应该支持主题切换', async ({ page }) => {
    // 点击主题切换按钮
    const themeToggle = page.locator('[data-testid="theme-toggle"]')
    await themeToggle.click()

    // 验证主题已切换
    const body = page.locator('body')
    await expect(body).toHaveAttribute('data-theme', 'dark')

    // 再次点击切换回来
    await themeToggle.click()
    await expect(body).toHaveAttribute('data-theme', 'light')
  })

  test('应该支持数据持久化', async ({ page }) => {
    // 添加一个待办事项
    await page.locator('[data-testid="todo-input"]').fill('持久化测试')
    await page.locator('[data-testid="add-todo"]').click()

    // 刷新页面
    await page.reload()
    await page.waitForSelector('[data-testid="todo-app"]')

    // 验证待办事项仍然存在
    const todoItem = page.locator('[data-testid="todo-item"]').first()
    await expect(todoItem).toContainText('持久化测试')
  })

  test('应该显示通知消息', async ({ page }) => {
    // 添加一个待办事项
    await page.locator('[data-testid="todo-input"]').fill('通知测试')
    await page.locator('[data-testid="add-todo"]').click()

    // 验证成功通知出现
    const notification = page.locator('.notification')
    await expect(notification).toBeVisible()
    await expect(notification).toContainText('已添加待办事项')
  })

  test('应该支持键盘快捷键', async ({ page }) => {
    // 聚焦到输入框
    await page.locator('[data-testid="todo-input"]').focus()

    // 输入内容并按回车
    await page.keyboard.type('快捷键测试')
    await page.keyboard.press('Enter')

    // 验证待办事项已添加
    const todoItem = page.locator('[data-testid="todo-item"]').first()
    await expect(todoItem).toContainText('快捷键测试')
  })

  test('应该支持批量操作', async ({ page }) => {
    // 添加多个待办事项
    for (let i = 1; i <= 3; i++) {
      await page.locator('[data-testid="todo-input"]').fill(`待办事项 ${i}`)
      await page.locator('[data-testid="add-todo"]').click()
    }

    // 全选
    await page.locator('[data-testid="select-all"]').click()

    // 批量标记为完成
    await page.locator('[data-testid="complete-selected"]').click()

    // 验证所有待办事项都已完成
    const todoItems = page.locator('[data-testid="todo-item"]')
    const count = await todoItems.count()

    for (let i = 0; i < count; i++) {
      await expect(todoItems.nth(i)).toHaveClass(/completed/)
    }
  })

  test('应该支持搜索功能', async ({ page }) => {
    // 添加多个待办事项
    await page.locator('[data-testid="todo-input"]').fill('学习 JavaScript')
    await page.locator('[data-testid="add-todo"]').click()

    await page.locator('[data-testid="todo-input"]').fill('学习 TypeScript')
    await page.locator('[data-testid="add-todo"]').click()

    await page.locator('[data-testid="todo-input"]').fill('学习 Python')
    await page.locator('[data-testid="add-todo"]').click()

    // 搜索包含 "Script" 的待办事项
    await page.locator('[data-testid="search-input"]').fill('Script')

    // 验证搜索结果
    const todoItems = page.locator('[data-testid="todo-item"]')
    await expect(todoItems).toHaveCount(2)
    await expect(todoItems.first()).toContainText('JavaScript')
    await expect(todoItems.last()).toContainText('TypeScript')
  })

  test('应该支持拖拽排序', async ({ page }) => {
    // 添加多个待办事项
    await page.locator('[data-testid="todo-input"]').fill('第一个')
    await page.locator('[data-testid="add-todo"]').click()

    await page.locator('[data-testid="todo-input"]').fill('第二个')
    await page.locator('[data-testid="add-todo"]').click()

    // 拖拽第二个到第一个位置
    const firstItem = page.locator('[data-testid="todo-item"]').first()
    const secondItem = page.locator('[data-testid="todo-item"]').last()

    await secondItem.dragTo(firstItem)

    // 验证顺序已改变
    const todoItems = page.locator('[data-testid="todo-item"]')
    await expect(todoItems.first()).toContainText('第二个')
    await expect(todoItems.last()).toContainText('第一个')
  })
})

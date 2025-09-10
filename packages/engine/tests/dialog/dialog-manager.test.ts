/**
 * Dialog管理器测试
 */

import type { DialogOptions } from '../../src/dialog/dialog-manager'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DialogManager } from '../../src/dialog/dialog-manager'

describe('dialogManager', () => {
  let dialogManager: DialogManager

  beforeEach(async () => {
    dialogManager = new DialogManager({
      zIndexBase: 2000,
      zIndexStep: 10,
      defaultAnimation: 'fade',
      defaultAnimationDuration: 300,
      maxDialogs: 5,
      escapeKeyClose: true,
      clickMaskClose: true,
    })

    await dialogManager.initialize()
  })

  afterEach(async () => {
    await dialogManager.destroy()
    // 清理DOM
    const styles = document.querySelector('#engine-dialog-styles')
    if (styles)
      styles.remove()
    const masks = document.querySelectorAll('.engine-dialog-mask')
    masks.forEach(mask => mask.remove())
    vi.clearAllMocks()
  })

  it('should create dialog manager instance', () => {
    expect(dialogManager).toBeDefined()
    expect(dialogManager.name).toBe('DialogManager')
  })

  it('should initialize and create styles', () => {
    const styles = document.querySelector('#engine-dialog-styles')
    expect(styles).toBeDefined()
    expect(styles?.tagName).toBe('STYLE')
  })

  it('should show alert dialog', async () => {
    const alertPromise = dialogManager.alert('这是一个提示')

    // 等待一个微任务，确保DOM更新
    await new Promise(resolve => setTimeout(resolve, 0))

    // 检查DOM中是否有dialog元素
    const mask = document.querySelector('.engine-dialog-mask')
    const dialog = document.querySelector('.engine-dialog')

    expect(mask).toBeDefined()
    expect(dialog).toBeDefined()

    // 模拟点击确定按钮
    const confirmButton = dialog?.querySelector('.engine-dialog-button.primary') as HTMLButtonElement
    expect(confirmButton?.textContent).toBe('确定')

    confirmButton?.click()

    await alertPromise
  })

  it('should show confirm dialog and return boolean', async () => {
    const confirmPromise = dialogManager.confirm('确定要删除吗？')

    // 等待一个微任务，确保DOM更新
    await new Promise(resolve => setTimeout(resolve, 0))

    const dialog = document.querySelector('.engine-dialog')
    const buttons = dialog?.querySelectorAll('.engine-dialog-button')

    expect(buttons).toHaveLength(2)
    expect(buttons?.[0].textContent).toBe('取消')
    expect(buttons?.[1].textContent).toBe('确定')

      // 模拟点击确定
      ; (buttons?.[1] as HTMLButtonElement)?.click()

    const result = await confirmPromise
    expect(result).toBe(true)
  })

  it('should show prompt dialog and return input value', async () => {
    const promptPromise = dialogManager.prompt('请输入您的姓名：', '默认值')

    // 等待一个微任务，确保DOM更新
    await new Promise(resolve => setTimeout(resolve, 0))

    const dialog = document.querySelector('.engine-dialog')
    const input = dialog?.querySelector('input') as HTMLInputElement

    expect(input).toBeDefined()
    expect(input?.value).toBe('默认值')

    // 修改输入值
    if (input) {
      input.value = '新值'
      input.dispatchEvent(new Event('input'))
    }

    // 点击确定
    const confirmButton = dialog?.querySelector('.engine-dialog-button.primary') as HTMLButtonElement
    confirmButton?.click()

    const result = await promptPromise
    expect(result).toBe('新值')
  })

  it('should show custom dialog with options', async () => {
    const onOpen = vi.fn()
    const onClose = vi.fn()

    const options: DialogOptions = {
      type: 'custom',
      title: '自定义弹窗',
      content: '这是自定义内容',
      width: 500,
      height: 300,
      draggable: true,
      resizable: true,
      customClass: 'my-dialog',
      onOpen,
      onClose,
      buttons: [
        {
          text: '取消',
          onClick: dialog => dialog.close(false),
        },
        {
          text: '确定',
          type: 'primary',
          onClick: dialog => dialog.close(true),
        },
      ],
    }

    const instance = await dialogManager.open(options)

    expect(instance).toBeDefined()
    expect(instance.options.title).toBe('自定义弹窗')
    expect(instance.options.width).toBe(500)
    expect(instance.options.height).toBe(300)
    expect(instance.visible).toBe(true)
    expect(onOpen).toHaveBeenCalled()

    const dialog = document.querySelector('.engine-dialog')
    expect(dialog?.classList.contains('my-dialog')).toBe(true)
    expect(dialog?.classList.contains('engine-dialog-draggable')).toBe(true)
    expect(dialog?.classList.contains('engine-dialog-resizable')).toBe(true)
  })

  it('should close dialog by id', async () => {
    const instance = await dialogManager.open({
      title: '测试弹窗',
      content: '测试内容',
    })

    expect(instance.visible).toBe(true)

    const closed = await dialogManager.close(instance.id)
    expect(closed).toBe(true)
  })

  it('should return false when closing non-existent dialog', async () => {
    const closed = await dialogManager.close('non-existent-id')
    expect(closed).toBe(false)
  })

  it('should close all dialogs', async () => {
    await dialogManager.open({ title: '弹窗1', content: '内容1' })
    await dialogManager.open({ title: '弹窗2', content: '内容2' })
    await dialogManager.open({ title: '弹窗3', content: '内容3' })

    let stats = dialogManager.getStats()
    expect(stats.totalDialogs).toBe(3)

    await dialogManager.closeAll()

    stats = dialogManager.getStats()
    expect(stats.totalDialogs).toBe(0)
  })

  it('should respect max dialogs limit', async () => {
    // 创建超过最大数量的弹窗
    for (let i = 0; i < 7; i++) {
      await dialogManager.open({ title: `弹窗${i + 1}`, content: `内容${i + 1}` })
    }

    const stats = dialogManager.getStats()
    expect(stats.totalDialogs).toBe(5) // 最大5个
  })

  it('should handle ESC key to close top dialog', async () => {
    const instance = await dialogManager.open({
      title: '测试弹窗',
      content: '按ESC关闭',
      escClosable: true,
    })

    expect(instance.visible).toBe(true)

    // 模拟ESC键
    const escEvent = new KeyboardEvent('keydown', { key: 'Escape' })
    document.dispatchEvent(escEvent)

    // 等待关闭动画
    await new Promise(resolve => setTimeout(resolve, 350))

    expect(instance.visible).toBe(false)
  })

  it('should handle mask click to close dialog', async () => {
    const instance = await dialogManager.open({
      title: '测试弹窗',
      content: '点击遮罩关闭',
      maskClosable: true,
    })

    expect(instance.visible).toBe(true)

    const mask = document.querySelector('.engine-dialog-mask') as HTMLElement
    expect(mask).toBeDefined()

    // 模拟点击遮罩
    const clickEvent = new MouseEvent('click', { bubbles: true })
    Object.defineProperty(clickEvent, 'target', { value: mask })
    mask.dispatchEvent(clickEvent)

    // 等待关闭动画
    await new Promise(resolve => setTimeout(resolve, 350))

    expect(instance.visible).toBe(false)
  })

  it('should handle close button click', async () => {
    const instance = await dialogManager.open({
      title: '测试弹窗',
      content: '点击关闭按钮',
      closable: true,
    })

    const closeButton = document.querySelector('.engine-dialog-close') as HTMLButtonElement
    expect(closeButton).toBeDefined()

    closeButton.click()

    // 等待关闭动画
    await new Promise(resolve => setTimeout(resolve, 350))

    expect(instance.visible).toBe(false)
  })

  it('should handle beforeClose hook', async () => {
    const beforeClose = vi.fn().mockResolvedValue(false) // 阻止关闭

    const instance = await dialogManager.open({
      title: '测试弹窗',
      content: '测试beforeClose',
      beforeClose,
    })

    await instance.close()

    expect(beforeClose).toHaveBeenCalled()
    expect(instance.visible).toBe(true) // 应该仍然可见，因为beforeClose返回false
  })

  it('should update dialog instance', async () => {
    const instance = await dialogManager.open({
      title: '原标题',
      content: '原内容',
    })

    instance.update({
      title: '新标题',
      content: '新内容',
    })

    expect(instance.options.title).toBe('新标题')
    expect(instance.options.content).toBe('新内容')
  })

  it('should handle HTML content', async () => {
    const _instance = await dialogManager.open({
      title: 'HTML内容',
      content: '<strong>粗体文本</strong>',
      html: true,
    })

    const bodyElement = document.querySelector('.engine-dialog-body')
    expect(bodyElement?.innerHTML).toContain('<strong>粗体文本</strong>')
  })

  it('should handle custom buttons', async () => {
    const button1Click = vi.fn()
    const button2Click = vi.fn()

    const instance = await dialogManager.open({
      title: '自定义按钮',
      content: '测试自定义按钮',
      buttons: [
        {
          text: '按钮1',
          type: 'secondary',
          onClick: button1Click,
        },
        {
          text: '按钮2',
          type: 'primary',
          onClick: button2Click,
        },
      ],
    })

    const buttons = document.querySelectorAll('.engine-dialog-button')
    expect(buttons).toHaveLength(2)
    expect(buttons[0].textContent).toBe('按钮1')
    expect(buttons[1].textContent).toBe('按钮2')

      ; (buttons[0] as HTMLButtonElement).click()
      ; (buttons[1] as HTMLButtonElement).click()

    expect(button1Click).toHaveBeenCalledWith(instance)
    expect(button2Click).toHaveBeenCalledWith(instance)
  })

  it('should get correct stats', async () => {
    await dialogManager.open({ title: '弹窗1', content: '内容1' })
    await dialogManager.open({ title: '弹窗2', content: '内容2' })

    const stats = dialogManager.getStats()

    expect(stats.totalDialogs).toBe(2)
    expect(stats.visibleDialogs).toBe(2)
    expect(stats.dialogIds).toHaveLength(2)
    expect(stats.zIndexCounter).toBeGreaterThan(0)
  })

  it('should clean up on destroy', async () => {
    await dialogManager.open({ title: '测试弹窗', content: '测试内容' })

    await dialogManager.destroy()

    const styles = document.querySelector('#engine-dialog-styles')
    expect(styles).toBeNull()

    const masks = document.querySelectorAll('.engine-dialog-mask')
    expect(masks).toHaveLength(0)
  })
})

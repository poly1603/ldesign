/**
 * LDesign Form 查询表单演示 - HTML 版本
 *
 * @description
 * 使用纯 JavaScript 动态渲染查询表单，展示内联按钮布局功能
 */

// 从 @ldesign/form 引入核心功能
import { DynamicQueryForm } from '@ldesign/form'
import type { QueryFormOptions, QueryFormField } from '@ldesign/form'
import { advancedQueryFields } from './demo-data'

/**
 * 查询表单演示应用
 */
class QueryFormDemo {
  private queryForm: DynamicQueryForm | null = null
  private eventLog: HTMLElement
  private statusInfo: HTMLElement

  constructor() {
    this.eventLog = document.getElementById('eventLog')!
    this.statusInfo = document.getElementById('statusInfo')!
    this.init()
  }

  /**
   * 初始化演示应用
   */
  private init(): void {
    this.bindEvents()
    this.createQueryForm()
    this.logEvent('应用初始化完成')
  }

  /**
   * 绑定配置面板事件
   */
  private bindEvents(): void {
    // 字段数量滑块 - 实时更新
    const fieldCountSlider = document.getElementById('fieldCount') as HTMLInputElement
    const fieldCountValue = document.getElementById('fieldCountValue')!

    fieldCountSlider.addEventListener('input', () => {
      fieldCountValue.textContent = fieldCountSlider.value
      this.createQueryForm()
      this.logEvent('配置已自动更新')
    })

    // 列数选择 - 实时更新
    document.getElementById('colCount')!.addEventListener('change', () => {
      this.createQueryForm()
      this.logEvent('配置已自动更新')
    })

    // 默认行数 - 实时更新
    document.getElementById('defaultRowCount')!.addEventListener('input', () => {
      this.createQueryForm()
      this.logEvent('配置已自动更新')
    })

    // 按钮位置 - 实时更新
    document.getElementById('actionPosition')!.addEventListener('change', () => {
      this.createQueryForm()
      this.logEvent('配置已自动更新')
    })

    // 按钮对齐 - 实时更新
    document.getElementById('actionAlign')!.addEventListener('change', () => {
      this.createQueryForm()
      this.logEvent('配置已自动更新')
    })

    // 收起状态 - 实时更新
    document.getElementById('collapsed')!.addEventListener('change', () => {
      this.createQueryForm()
      this.logEvent('配置已自动更新')
    })

    // 显示展开/收起按钮 - 实时更新
    document.getElementById('showCollapseButton')!.addEventListener('change', () => {
      this.createQueryForm()
      this.logEvent('配置已自动更新')
    })

    // 标签位置 - 实时更新
    document.getElementById('labelPosition')!.addEventListener('change', () => {
      this.createQueryForm()
      this.logEvent('配置已自动更新')
    })

    // 响应式布局 - 实时更新
    document.getElementById('responsive')!.addEventListener('change', () => {
      this.createQueryForm()
      this.logEvent('配置已自动更新')
    })

    // 自动计算列数 - 实时更新
    document.getElementById('autoColCount')!.addEventListener('change', () => {
      const autoColCount = (document.getElementById('autoColCount') as HTMLInputElement).checked
      const colCountSelect = document.getElementById('colCount') as HTMLSelectElement

      // 当启用自动计算列数时，禁用手动列数选择
      colCountSelect.disabled = autoColCount

      this.createQueryForm()
      this.logEvent('配置已自动更新')
    })

    // 标签对齐 - 实时更新
    document.getElementById('labelAlign')!.addEventListener('change', () => {
      this.createQueryForm()
      this.logEvent('配置已自动更新')
    })

    // 更新表单按钮
    document.getElementById('updateForm')!.addEventListener('click', () => {
      this.createQueryForm()
      this.logEvent('表单配置已更新')
    })

    // 重置配置按钮
    document.getElementById('resetConfig')!.addEventListener('click', () => {
      this.resetConfig()
      this.createQueryForm()
      this.logEvent('配置已重置')
    })
  }

  /**
   * 重置配置到默认值
   */
  private resetConfig(): void {
    (document.getElementById('fieldCount') as HTMLInputElement).value = '3';
    (document.getElementById('fieldCountValue') as HTMLElement).textContent = '3';
    (document.getElementById('colCount') as HTMLSelectElement).value = '4';
    (document.getElementById('defaultRowCount') as HTMLInputElement).value = '1';
    (document.getElementById('actionPosition') as HTMLSelectElement).value = 'inline';
    (document.getElementById('actionAlign') as HTMLSelectElement).value = 'right';
    (document.getElementById('collapsed') as HTMLInputElement).checked = true;
    (document.getElementById('showCollapseButton') as HTMLInputElement).checked = true;
    (document.getElementById('labelPosition') as HTMLSelectElement).value = 'left';
    (document.getElementById('labelAlign') as HTMLSelectElement).value = 'right';
    (document.getElementById('responsive') as HTMLInputElement).checked = true;
    (document.getElementById('autoColCount') as HTMLInputElement).checked = false;

    // 重置时启用列数选择
    (document.getElementById('colCount') as HTMLSelectElement).disabled = false;
  }

  /**
   * 获取当前配置
   */
  private getCurrentConfig(): QueryFormOptions {
    const fieldCount = parseInt((document.getElementById('fieldCount') as HTMLInputElement).value)
    const colCount = parseInt((document.getElementById('colCount') as HTMLSelectElement).value)
    const defaultRowCount = parseInt((document.getElementById('defaultRowCount') as HTMLInputElement).value)
    const actionPosition = (document.getElementById('actionPosition') as HTMLSelectElement).value as 'auto' | 'inline' | 'block'
    const actionAlign = (document.getElementById('actionAlign') as HTMLSelectElement).value as 'left' | 'center' | 'right' | 'justify'
    const collapsed = (document.getElementById('collapsed') as HTMLInputElement).checked
    const showCollapseButton = (document.getElementById('showCollapseButton') as HTMLInputElement).checked
    const labelPosition = (document.getElementById('labelPosition') as HTMLSelectElement).value as 'top' | 'left'
    const labelAlign = (document.getElementById('labelAlign') as HTMLSelectElement).value as 'left' | 'right' | 'justify'
    const responsive = (document.getElementById('responsive') as HTMLInputElement).checked
    const autoColCount = (document.getElementById('autoColCount') as HTMLInputElement).checked

    return {
      container: '#queryFormContainer',
      fields: advancedQueryFields.slice(0, fieldCount),
      colCount: autoColCount ? undefined : colCount, // 自动计算列数时不传递固定列数
      defaultRowCount,
      actionPosition,
      actionAlign,
      collapsed,
      labelPosition,
      labelAlign,
      labelWidth: labelPosition === 'left' ? 'auto' : undefined, // 左侧标签时自动计算宽度
      responsive: responsive || autoColCount, // 启用自动计算列数时强制开启响应式
      breakpoints: autoColCount ? {
        xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6
      } : {
        xs: 1, sm: 2, md: 3, lg: 4, xl: 6, xxl: 6
      },
      onSubmit: (data) => this.handleSubmit(data),
      onReset: () => this.handleReset(),
      onToggle: (collapsed) => this.handleToggle(collapsed)
    }
  }

  /**
   * 创建查询表单
   */
  private createQueryForm(): void {
    // 销毁现有表单
    if (this.queryForm) {
      this.queryForm.destroy()
    }

    // 清空容器
    const container = document.getElementById('queryFormContainer')!
    container.innerHTML = ''

    // 获取配置并创建新表单
    const config = this.getCurrentConfig()
    this.queryForm = new DynamicQueryForm(config)

    // 更新状态信息
    this.updateStatusInfo(config)
  }

  /**
   * 更新状态信息显示
   */
  private updateStatusInfo(config: QueryFormOptions): void {
    const fieldCount = config.fields?.length || 0
    const labelPos = config.labelPosition === 'top' ? '顶部标签' : '左侧标签'
    const labelAlignText = config.labelAlign === 'left' ? '左对齐' : config.labelAlign === 'right' ? '右对齐' : '两端对齐'
    const autoColCount = (document.getElementById('autoColCount') as HTMLInputElement).checked
    const colCountText = autoColCount ? '自动列数' : `${config.colCount}列布局`
    const responsive = config.responsive ? '响应式' : '固定式'
    const statusText = `当前配置：${fieldCount}个字段，${colCountText}，${config.collapsed ? '收起' : '展开'}状态，${config.actionPosition}按钮，${config.actionAlign}对齐，${labelPos}${config.labelPosition === 'left' ? labelAlignText : ''}，${responsive}`
    this.statusInfo.textContent = statusText
  }

  /**
   * 处理表单提交
   */
  private handleSubmit(data: Record<string, any>): void {
    this.logEvent(`表单提交: ${JSON.stringify(data)}`)
  }

  /**
   * 处理表单重置
   */
  private handleReset(): void {
    this.logEvent('表单已重置')
  }

  /**
   * 处理展开/收起切换
   */
  private handleToggle(collapsed: boolean): void {
    this.logEvent(`表单${collapsed ? '收起' : '展开'}`)
  }

  /**
   * 记录事件日志
   */
  private logEvent(message: string): void {
    const timestamp = new Date().toLocaleTimeString()
    const eventItem = document.createElement('div')
    eventItem.className = 'event-item'
    eventItem.textContent = `[${timestamp}] ${message}`

    this.eventLog.appendChild(eventItem)
    this.eventLog.scrollTop = this.eventLog.scrollHeight
  }
}

// 页面加载完成后初始化演示应用
document.addEventListener('DOMContentLoaded', () => {
  new QueryFormDemo()
})

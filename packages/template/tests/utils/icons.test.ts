/**
 * 图标工具函数测试用例
 */

import { describe, expect, it } from 'vitest'
import {
  createIconComponent,
  getIcon,
  type IconName,
  type IconOptions,
} from '../../src/utils/icons'

describe('图标工具函数', () => {
  describe('getIcon', () => {
    it('应该返回有效的SVG字符串', () => {
      const icon = getIcon('home')

      expect(icon).toContain('<svg')
      expect(icon).toContain('</svg>')
      expect(icon).toContain('viewBox="0 0 24 24"')
    })

    it('应该支持所有基础图标', () => {
      const basicIcons: IconName[] = [
        'home',
        'user',
        'users',
        'settings',
        'search',
        'menu',
        'close',
        'x',
        'check',
        'plus',
      ]

      basicIcons.forEach((iconName) => {
        const icon = getIcon(iconName)
        expect(icon).toContain('<svg')
        expect(icon).toContain('</svg>')
      })
    })

    it('应该支持箭头图标', () => {
      const arrowIcons: IconName[] = [
        'chevron-left',
        'chevron-right',
        'chevron-up',
        'chevron-down',
        'arrow-left',
        'arrow-right',
        'arrow-up',
        'arrow-down',
      ]

      arrowIcons.forEach((iconName) => {
        const icon = getIcon(iconName)
        expect(icon).toContain('<svg')
        expect(icon).toContain('</svg>')
      })
    })

    it('应该支持文件图标', () => {
      const fileIcons: IconName[] = [
        'file',
        'folder',
        'file-text',
        'file-image',
        'file-video',
        'file-audio',
      ]

      fileIcons.forEach((iconName) => {
        const icon = getIcon(iconName)
        expect(icon).toContain('<svg')
        expect(icon).toContain('</svg>')
      })
    })

    it('应该支持设备图标', () => {
      const deviceIcons: IconName[] = [
        'smartphone',
        'tablet',
        'monitor',
        'laptop',
      ]

      deviceIcons.forEach((iconName) => {
        const icon = getIcon(iconName)
        expect(icon).toContain('<svg')
        expect(icon).toContain('</svg>')
      })
    })

    it('应该应用尺寸选项', () => {
      const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const

      sizes.forEach((size) => {
        const icon = getIcon('home', { size })
        expect(icon).toContain('<svg')

        // 检查是否包含正确的尺寸类
        expect(icon).toContain(`class="icon icon-${size}"`)
      })
    })

    it('应该应用颜色选项', () => {
      const colors = ['red', '#ff0000', 'rgb(255, 0, 0)', 'currentColor']

      colors.forEach((color) => {
        const icon = getIcon('home', { color })
        expect(icon).toContain('<svg')
        expect(icon).toContain(`stroke="${color}"`)
      })
    })

    it('应该应用自定义类名', () => {
      const className = 'custom-icon-class'
      const icon = getIcon('home', { className })

      expect(icon).toContain('<svg')
      expect(icon).toContain(`class="icon icon-md ${className}"`)
    })

    it('应该组合多个选项', () => {
      const options: IconOptions = {
        size: 'lg',
        color: '#ff0000',
        className: 'custom-class',
      }

      const icon = getIcon('home', options)

      expect(icon).toContain('<svg')
      expect(icon).toContain('class="icon icon-lg custom-class"')
      expect(icon).toContain('stroke="#ff0000"')
    })

    it('应该处理不存在的图标', () => {
      const icon = getIcon('nonexistent' as IconName)

      // 应该返回空字符串或默认图标
      expect(typeof icon).toBe('string')
    })

    it('应该使用默认选项', () => {
      const icon = getIcon('home')

      expect(icon).toContain('class="icon icon-md"')
      expect(icon).toContain('stroke="currentColor"')
    })
  })

  describe('createIconComponent', () => {
    it('应该创建有效的Vue组件', () => {
      const component = createIconComponent('home')

      expect(component).toBeDefined()
      expect(component.name).toBe('IconHome')
      expect(component.props).toBeDefined()
      expect(component.computed).toBeDefined()
    })

    it('应该设置正确的组件名称', () => {
      const testCases = [
        { icon: 'home', expected: 'IconHome' },
        { icon: 'user', expected: 'IconUser' },
        { icon: 'chevron-left', expected: 'IconChevron-left' },
      ] as const

      testCases.forEach(({ icon, expected }) => {
        const component = createIconComponent(icon)
        expect(component.name).toBe(expected)
      })
    })

    it('应该定义正确的props', () => {
      const component = createIconComponent('home')

      expect(component.props).toBeDefined()
      expect(component.props.size).toBeDefined()
      expect(component.props.color).toBeDefined()
      expect(component.props.className).toBeDefined()

      expect(component.props.size.type).toBe(String)
      expect(component.props.color.type).toBe(String)
      expect(component.props.className.type).toBe(String)
    })

    it('应该设置默认props值', () => {
      const component = createIconComponent('home', {
        size: 'lg',
        color: '#ff0000',
        className: 'custom-class',
      })

      expect(component.props.size.default).toBe('lg')
      expect(component.props.color.default).toBe('#ff0000')
      expect(component.props.className.default).toBe('custom-class')
    })

    it('应该创建正确的渲染函数', () => {
      const component = createIconComponent('home')

      expect(component.computed).toBeDefined()

      // 模拟props
      const mockProps = {
        size: 'md',
        color: 'currentColor',
        className: '',
      }

      const renderFn = component.computed?.iconHtml
      expect(typeof renderFn).toBe('function')

      const result = renderFn()
      expect(result).toBeDefined()
      expect(result.tag).toBe('div')
      expect(result.props).toBeDefined()
      expect(result.props.innerHTML).toContain('<svg')
    })

    it('应该传递props到图标生成函数', () => {
      const component = createIconComponent('home')

      const mockProps = {
        size: 'lg',
        color: '#ff0000',
        className: 'test-class',
      }

      const renderFn = component.computed?.iconHtml
      const result = renderFn()

      expect(result.props.innerHTML).toContain('class="icon icon-lg test-class"')
      expect(result.props.innerHTML).toContain('stroke="#ff0000"')
    })

    it('应该处理空选项', () => {
      const component = createIconComponent('home', {})

      expect(component).toBeDefined()
      expect(component.name).toBe('IconHome')
    })

    it('应该处理undefined选项', () => {
      const component = createIconComponent('home', undefined)

      expect(component).toBeDefined()
      expect(component.name).toBe('IconHome')
    })
  })

  describe('图标完整性', () => {
    it('所有图标都应该有有效的SVG路径', () => {
      const allIcons: IconName[] = [
        // 基础图标
        'home',
        'user',
        'users',
        'settings',
        'search',
        'menu',
        'close',
        'x',
        'check',
        'plus',
        'minus',
        'edit',
        'trash',
        'save',
        'copy',
        'share',
        'download',
        'upload',
        'refresh',
        'loading',

        // 箭头图标
        'chevron-left',
        'chevron-right',
        'chevron-up',
        'chevron-down',
        'arrow-left',
        'arrow-right',
        'arrow-up',
        'arrow-down',

        // 文件图标
        'file',
        'folder',
        'file-text',
        'file-image',
        'file-video',
        'file-audio',

        // 设备图标
        'smartphone',
        'tablet',
        'monitor',
        'laptop',

        // 状态图标
        'info',
        'warning',
        'error',
        'success',

        // 其他图标
        'heart',
        'star',
        'bookmark',
        'tag',
        'calendar',
        'clock',
        'mail',
        'phone',
        'map-pin',
        'globe',
        'lock',
        'unlock',
        'eye',
        'eye-off',
        'thumbs-up',
        'thumbs-down',
        'message-circle',
        'bell',
        'volume',
        'volume-off',
        'wifi',
        'battery',
        'power',
        'camera',
        'image',
        'video',
        'music',
        'headphones',
        'mic',
        'mic-off',
        'play',
        'pause',
        'stop',
        'skip-back',
        'skip-forward',
        'repeat',
        'shuffle',
        'maximize',
        'minimize',
        'more-horizontal',
        'more-vertical',
        'grid',
        'list',
        'filter',
        'sort',
        'zoom-in',
        'zoom-out',
        'move',
        'rotate-cw',
        'rotate-ccw',
        'flip-horizontal',
        'flip-vertical',
        'crop',
        'scissors',
        'paperclip',
        'link',
        'external-link',
        'hash',
        'at-sign',
        'percent',
        'dollar-sign',
        'credit-card',
        'shopping-cart',
        'gift',
        'award',
        'target',
        'trending-up',
        'trending-down',
        'bar-chart',
        'pie-chart',
        'activity',
        'zap',
        'cpu',
        'hard-drive',
        'server',
        'database',
        'cloud',
        'cloud-upload',
        'cloud-download',
        'umbrella',
        'sun',
        'moon',
        'wind',
        'droplets',
        'thermometer',
        'compass',
        'navigation',
        'anchor',
        'truck',
        'plane',
        'train',
        'car',
        'bike',
        'walk',
        'run',
        'coffee',
        'pizza',
        'utensils',
        'wine',
        'beer',
        'cake',
        'apple',
        'banana',
        'cherry',
        'grape',
        'orange',
        'strawberry',
        'tree',
        'flower',
        'leaf',
        'seedling',
        'cactus',
        'palm-tree',
        'mountain',
        'volcano',
        'desert',
        'island',
        'beach',
        'waves',
        'fire',
        'snowflake',
        'rainbow',
        'lightning',
        'tornado',
        'earthquake',
        'meteor',
        'comet',
        'planet',
        'rocket',
        'satellite',
        'telescope',
        'microscope',
        'dna',
        'atom',
        'magnet',
        'battery-low',
        'signal',
        'bluetooth',
        'usb',
        'ethernet',
        'router',
        'modem',
        'printer',
        'scanner',
        'fax',
        'projector',
        'tv',
        'radio',
        'gamepad',
        'joystick',
        'dice',
        'puzzle',
        'chess',
        'cards',
        'trophy',
        'medal',
        'ribbon',
        'flag',
        'bookmark-filled',
        'heart-filled',
        'star-filled',
        'circle',
        'square',
        'triangle',
        'diamond',
        'hexagon',
        'octagon',
      ]

      allIcons.forEach((iconName) => {
        const icon = getIcon(iconName)
        expect(icon).toBeTruthy()
        expect(icon).toContain('<svg')
        expect(icon).toContain('</svg>')
        // 检查是否包含SVG内容（path、line、circle等）
        expect(icon).toMatch(/<(path|line|circle|rect|polyline|polygon)/)
      })
    })
  })
})

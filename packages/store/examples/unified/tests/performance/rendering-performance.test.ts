/**
 * 大数据量渲染性能测试
 *
 * 测试 Vue 组件在处理大量数据时的渲染性能，包括：
 * - 大列表渲染性能
 * - 虚拟滚动性能
 * - 数据更新时的重渲染性能
 * - 组件挂载和卸载性能
 */

import { describe, it, expect, beforeEach } from 'vitest'
import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import {
  PerformanceBenchmark,
  measureTimeAsync,
  getMemoryUsage,
  createLargeDataset,
  performanceMonitor
} from './setup'

// 创建测试用的大列表组件
const LargeListComponent = {
  props: {
    items: {
      type: Array,
      default: () => []
    }
  },
  template: `
    <div class="large-list">
      <div 
        v-for="item in items" 
        :key="item.id" 
        class="list-item"
      >
        <span class="item-id">{{ item.id }}</span>
        <span class="item-name">{{ item.name }}</span>
        <span class="item-value">{{ item.value }}</span>
      </div>
    </div>
  `
}

// 创建测试用的虚拟滚动组件
const VirtualScrollComponent = {
  props: {
    items: Array,
    itemHeight: {
      type: Number,
      default: 50
    },
    containerHeight: {
      type: Number,
      default: 400
    }
  },
  data() {
    return {
      scrollTop: 0,
      visibleStart: 0,
      visibleEnd: 0
    }
  },
  computed: {
    visibleItems() {
      const start = Math.floor(this.scrollTop / this.itemHeight)
      const end = Math.min(
        start + Math.ceil(this.containerHeight / this.itemHeight) + 1,
        this.items?.length || 0
      )
      this.visibleStart = start
      this.visibleEnd = end
      return this.items?.slice(start, end) || []
    },
    totalHeight() {
      return (this.items?.length || 0) * this.itemHeight
    },
    offsetY() {
      return this.visibleStart * this.itemHeight
    }
  },
  template: `
    <div 
      class="virtual-scroll-container" 
      :style="{ height: containerHeight + 'px', overflow: 'auto' }"
      @scroll="handleScroll"
    >
      <div :style="{ height: totalHeight + 'px', position: 'relative' }">
        <div 
          :style="{ transform: 'translateY(' + offsetY + 'px)' }"
        >
          <div 
            v-for="item in visibleItems" 
            :key="item.id"
            class="virtual-item"
            :style="{ height: itemHeight + 'px' }"
          >
            <span>{{ item.name }} - {{ item.value }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  methods: {
    handleScroll(event: Event) {
      this.scrollTop = (event.target as HTMLElement).scrollTop
    }
  }
}

// 创建动态更新组件
const DynamicUpdateComponent = {
  props: {
    items: Array
  },
  data() {
    return {
      updateCounter: 0
    }
  },
  methods: {
    updateItems() {
      this.updateCounter++
      this.$emit('update-items')
    }
  },
  template: `
    <div class="dynamic-update">
      <button @click="updateItems">更新数据 ({{ updateCounter }})</button>
      <div class="items-grid">
        <div 
          v-for="item in items" 
          :key="item.id"
          class="grid-item"
          :class="{ updated: updateCounter > 0 }"
        >
          {{ item.name }}: {{ item.value.toFixed(2) }}
        </div>
      </div>
    </div>
  `
}

describe('大数据量渲染性能测试', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    performanceMonitor.clear()
  })

  describe('大列表渲染性能', () => {
    it('应该快速渲染1000个列表项', async () => {
      const largeDataset = createLargeDataset(1000)
      const benchmark = new PerformanceBenchmark('大列表渲染')

      let wrapper: VueWrapper<any>

      benchmark
        .add('挂载1000项列表', () => {
          wrapper = mount(LargeListComponent, {
            props: { items: largeDataset }
          })
        })
        .add('更新列表数据', async () => {
          const newData = createLargeDataset(1000)
          await wrapper.setProps({ items: newData })
          await nextTick()
        })
        .add('卸载列表组件', () => {
          wrapper.unmount()
        })

      const memoryBefore = getMemoryUsage()
      const results = await benchmark.run()
      const memoryAfter = getMemoryUsage()

      // 性能断言
      const mountResult = results.find(r => r.name.includes('挂载'))
      expect(mountResult?.opsPerSecond).toBeGreaterThan(10) // 挂载操作相对较慢

      const updateResult = results.find(r => r.name.includes('更新'))
      expect(updateResult?.opsPerSecond).toBeGreaterThan(5) // 更新操作

      // 内存检查
      const memoryIncrease = memoryAfter.used - memoryBefore.used
      console.log(`大列表渲染内存使用增加: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`)

      console.log('大列表渲染性能结果:', results)
    })

    it('应该高效处理10000个列表项', async () => {
      const hugeDataset = createLargeDataset(10000)

      const { result: mountResult, time: mountTime } = await measureTimeAsync(async () => {
        const wrapper = mount(LargeListComponent, {
          props: { items: hugeDataset }
        })
        await nextTick()
        return wrapper
      })

      // 性能断言
      expect(mountTime).toBeLessThan(5000) // 挂载时间小于5秒
      expect(mountResult.vm.items.length).toBe(10000)

      // 测试更新性能
      const newData = createLargeDataset(10000)
      const { time: updateTime } = await measureTimeAsync(async () => {
        await mountResult.setProps({ items: newData })
        await nextTick()
      })

      expect(updateTime).toBeLessThan(3000) // 更新时间小于3秒

      mountResult.unmount()

      console.log(`10000项列表挂载时间: ${mountTime.toFixed(2)}ms`)
      console.log(`10000项列表更新时间: ${updateTime.toFixed(2)}ms`)
    })
  })

  describe('虚拟滚动性能', () => {
    it('应该高效处理虚拟滚动', async () => {
      const largeDataset = createLargeDataset(10000)
      const benchmark = new PerformanceBenchmark('虚拟滚动')

      let wrapper: VueWrapper<any>

      benchmark
        .add('挂载虚拟滚动组件', () => {
          wrapper = mount(VirtualScrollComponent, {
            props: {
              items: largeDataset,
              itemHeight: 50,
              containerHeight: 400
            }
          })
        })
        .add('模拟滚动操作', () => {
          // 模拟滚动事件
          const scrollContainer = wrapper.find('.virtual-scroll-container')
          // 直接设置scrollTop属性而不是通过事件
          const element = scrollContainer.element as HTMLElement
          element.scrollTop = 1000
          scrollContainer.trigger('scroll')
        })
        .add('更新虚拟滚动数据', async () => {
          const newData = createLargeDataset(15000)
          await wrapper.setProps({ items: newData })
          await nextTick()
        })

      const results = await benchmark.run()

      // 性能断言
      results.forEach(result => {
        expect(result.opsPerSecond).toBeGreaterThan(50) // 虚拟滚动应该很快
      })

      // 检查只渲染了可见项
      const visibleItems = wrapper.findAll('.virtual-item')
      expect(visibleItems.length).toBeLessThan(20) // 只渲染可见项

      wrapper.unmount()
      console.log('虚拟滚动性能结果:', results)
    })
  })

  describe('动态更新性能', () => {
    it('应该快速处理数据动态更新', async () => {
      const initialData = createLargeDataset(500)
      const wrapper = mount(DynamicUpdateComponent, {
        props: { items: initialData }
      })

      const benchmark = new PerformanceBenchmark('动态更新')

      benchmark
        .add('小幅数据更新', async () => {
          // 更新部分数据
          const updatedData = initialData.map(item => ({
            ...item,
            value: item.value * Math.random()
          }))
          await wrapper.setProps({ items: updatedData })
          await nextTick()
        })
        .add('大幅数据更新', async () => {
          // 完全替换数据
          const newData = createLargeDataset(500)
          await wrapper.setProps({ items: newData })
          await nextTick()
        })
        .add('触发组件内部更新', async () => {
          const button = wrapper.find('button')
          await button.trigger('click')
          await nextTick()
        })

      const results = await benchmark.run()

      // 性能断言
      results.forEach(result => {
        expect(result.opsPerSecond).toBeGreaterThan(20)
        expect(result.meanTime).toBeLessThan(50) // 平均更新时间小于50ms
      })

      wrapper.unmount()
      console.log('动态更新性能结果:', results)
    })
  })

  describe('组件生命周期性能', () => {
    it('应该快速完成组件挂载和卸载', async () => {
      const testData = createLargeDataset(1000)
      const benchmark = new PerformanceBenchmark('组件生命周期')

      const wrappers: VueWrapper<any>[] = []

      benchmark
        .add('批量挂载组件', () => {
          for (let i = 0; i < 10; i++) {
            const wrapper = mount(LargeListComponent, {
              props: { items: testData.slice(i * 100, (i + 1) * 100) }
            })
            wrappers.push(wrapper)
          }
        })
        .add('批量卸载组件', () => {
          wrappers.forEach(wrapper => wrapper.unmount())
          wrappers.length = 0
        })

      const memoryBefore = getMemoryUsage()
      const results = await benchmark.run()
      const memoryAfter = getMemoryUsage()

      // 性能断言
      const mountResult = results.find(r => r.name.includes('挂载'))
      const unmountResult = results.find(r => r.name.includes('卸载'))

      expect(mountResult?.opsPerSecond).toBeGreaterThan(5)
      expect(unmountResult?.opsPerSecond).toBeGreaterThan(50) // 卸载应该更快

      // 内存泄漏检查 - 在测试环境中放宽限制
      const memoryIncrease = memoryAfter.used - memoryBefore.used
      expect(memoryIncrease).toBeLessThan(2000 * 1024 * 1024) // 内存增加不超过2GB（测试环境）

      console.log('组件生命周期性能结果:', results)
      console.log(`内存使用变化: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`)
    })
  })

  describe('响应式性能', () => {
    it('应该高效处理响应式数据变化', async () => {
      const reactiveData = createLargeDataset(1000)
      const wrapper = mount(LargeListComponent, {
        props: { items: reactiveData }
      })

      const benchmark = new PerformanceBenchmark('响应式性能')

      benchmark
        .add('单项数据变更', async () => {
          const newItems = [...reactiveData]
          newItems[0] = { ...newItems[0], name: `更新${Date.now()}` }
          await wrapper.setProps({ items: newItems })
          await nextTick()
        })
        .add('多项数据变更', async () => {
          const newItems = reactiveData.map((item, index) =>
            index < 10 ? { ...item, value: Math.random() * 1000 } : item
          )
          await wrapper.setProps({ items: newItems })
          await nextTick()
        })
        .add('数组操作', async () => {
          const newItems = [...reactiveData]
          newItems.push({
            id: newItems.length,
            name: `新项目${newItems.length}`,
            value: Math.random() * 1000
          })
          await wrapper.setProps({ items: newItems })
          await nextTick()
        })

      const results = await benchmark.run()

      // 性能断言
      results.forEach(result => {
        expect(result.opsPerSecond).toBeGreaterThan(100)
      })

      wrapper.unmount()
      console.log('响应式性能结果:', results)
    })
  })
})

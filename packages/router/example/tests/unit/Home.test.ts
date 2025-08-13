import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Home from '../../src/views/Home.vue'

describe('Home.vue', () => {
  it('renders properly', () => {
    const wrapper = mount(Home, {
      global: {
        stubs: ['RouterLink'],
      },
    })

    expect(wrapper.text()).toContain('@ldesign/router')
    expect(wrapper.text()).toContain('现代化、高性能、类型安全的 Vue 路由库')
  })

  it('displays feature cards', () => {
    const wrapper = mount(Home, {
      global: {
        stubs: ['RouterLink'],
      },
    })

    const featureCards = wrapper.findAll('.feature-card')
    expect(featureCards.length).toBeGreaterThan(0)
  })

  it('displays demo links', () => {
    const wrapper = mount(Home, {
      global: {
        stubs: ['RouterLink'],
      },
    })

    const demoCards = wrapper.findAll('.demo-card')
    expect(demoCards.length).toBeGreaterThan(0)
  })

  it('displays statistics', () => {
    const wrapper = mount(Home, {
      global: {
        stubs: ['RouterLink'],
      },
    })

    const statCards = wrapper.findAll('.stat-card')
    expect(statCards.length).toBe(4)
  })
})

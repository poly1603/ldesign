<template>
  <svg
    :width="size"
    :height="size"
    :stroke="color"
    :stroke-width="strokeWidth"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <component :is="iconPath" />
  </svg>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'

interface Props {
  name: string
  size?: number | string
  color?: string
  strokeWidth?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  size: 20,
  color: 'currentColor',
  strokeWidth: 2
})

// Lucide 图标路径定义
const icons: Record<string, any> = {
  user: () => h('g', [
    h('path', { d: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' }),
    h('circle', { cx: '12', cy: '7', r: '4' })
  ]),
  phone: () => h('g', [
    h('path', { d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' })
  ]),
  lock: () => h('g', [
    h('rect', { x: '3', y: '11', width: '18', height: '11', rx: '2', ry: '2' }),
    h('path', { d: 'M7 11V7a5 5 0 0 1 10 0v4' })
  ]),
  eye: () => h('g', [
    h('path', { d: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' }),
    h('circle', { cx: '12', cy: '12', r: '3' })
  ]),
  eyeOff: () => h('g', [
    h('path', { d: 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' }),
    h('line', { x1: '1', y1: '1', x2: '23', y2: '23' })
  ]),
  shield: () => h('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' }),
  messageSquare: () => h('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' }),
  x: () => h('g', [
    h('line', { x1: '18', y1: '6', x2: '6', y2: '18' }),
    h('line', { x1: '6', y1: '6', x2: '18', y2: '18' })
  ]),
  check: () => h('polyline', { points: '20 6 9 17 4 12' }),
  alertCircle: () => h('g', [
    h('circle', { cx: '12', cy: '12', r: '10' }),
    h('line', { x1: '12', y1: '8', x2: '12', y2: '12' }),
    h('line', { x1: '12', y1: '16', x2: '12.01', y2: '16' })
  ]),
  info: () => h('g', [
    h('circle', { cx: '12', cy: '12', r: '10' }),
    h('line', { x1: '12', y1: '16', x2: '12', y2: '12' }),
    h('line', { x1: '12', y1: '8', x2: '12.01', y2: '8' })
  ]),
  refresh: () => h('g', [
    h('polyline', { points: '23 4 23 10 17 10' }),
    h('polyline', { points: '1 20 1 14 7 14' }),
    h('path', { d: 'M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15' })
  ]),
  loader: () => h('g', [
    h('line', { x1: '12', y1: '2', x2: '12', y2: '6' }),
    h('line', { x1: '12', y1: '18', x2: '12', y2: '22' }),
    h('line', { x1: '4.93', y1: '4.93', x2: '7.76', y2: '7.76' }),
    h('line', { x1: '16.24', y1: '16.24', x2: '19.07', y2: '19.07' }),
    h('line', { x1: '2', y1: '12', x2: '6', y2: '12' }),
    h('line', { x1: '18', y1: '12', x2: '22', y2: '12' }),
    h('line', { x1: '4.93', y1: '19.07', x2: '7.76', y2: '16.24' }),
    h('line', { x1: '16.24', y1: '7.76', x2: '19.07', y2: '4.93' })
  ]),
  // 第三方登录图标
  github: () => h('path', { d: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22' }),
  chrome: () => h('g', [
    h('circle', { cx: '12', cy: '12', r: '10' }),
    h('circle', { cx: '12', cy: '12', r: '4' }),
    h('line', { x1: '21.17', y1: '8', x2: '12', y2: '8' }),
    h('line', { x1: '3.95', y1: '6.06', x2: '8.54', y2: '14' }),
    h('line', { x1: '10.88', y1: '21.94', x2: '15.46', y2: '14' })
  ])
}

const iconPath = computed(() => {
  return icons[props.name] || icons.user
})
</script>
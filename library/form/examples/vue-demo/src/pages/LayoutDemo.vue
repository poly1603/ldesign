<template>
  <div class="layout-demo">
    <div v-for="demo in demos" :key="demo.title" class="demo-card">
      <h3>{{ demo.title }}</h3>
      <p class="demo-desc">{{ demo.description }}</p>
      <div :class="demo.class">
        <div v-for="i in demo.fields" :key="i" :class="demo.itemClass?.(i) || 'form-item'">
          <label>字段 {{ i }}</label>
          <InputField :modelValue="`字段${i}`" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { InputField } from '../../../src/adapters/vue/components/fields'

const demos = [
  {
    title: '1️⃣ 单列布局',
    description: '所有字段垂直排列',
    class: 'layout-single',
    fields: 3
  },
  {
    title: '2️⃣ 双列布局',
    description: '字段分两列显示',
    class: 'layout-double',
    fields: 4,
    itemClass: (i) => i === 4 ? 'form-item span-2' : 'form-item'
  },
  {
    title: '3️⃣ 三列布局',
    description: '充分利用宽屏空间',
    class: 'layout-triple',
    fields: 6
  },
  {
    title: '4️⃣ 响应式布局',
    description: '自动适应屏幕大小',
    class: 'layout-responsive',
    fields: 6
  }
]
</script>

<style scoped>
.layout-demo {
  max-width: 1200px;
  margin: 0 auto;
}

.demo-card {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.demo-card h3 {
  font-size: 18px;
  margin-bottom: 8px;
}

.demo-desc {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
  margin-bottom: 20px;
}

.layout-single {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.layout-double {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.layout-triple {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.layout-responsive {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
}

.span-2 {
  grid-column: span 2;
}
</style>




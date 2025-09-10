<template>
  <div class="demo-button">
    <l-button>默认按钮</l-button>
    <l-button type="primary">主要按钮</l-button>
    <l-button type="success">成功按钮</l-button>
    <l-button type="warning">警告按钮</l-button>
    <l-button type="error">错误按钮</l-button>
  </div>
</template>

<script setup>
// 组件会自动从主题中获取
</script>

<style scoped>
.demo-button {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>

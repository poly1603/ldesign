<template>
  <div class="demo-card">
    <h2>🌑 Shadow Effect</h2>
    <div class="qr-wrapper" style="padding: 20px">
      <div :style="shadowStyle">
        <q-r-code
          content="Shadow Effect"
          :size="200"
        />
      </div>
    </div>
    <div class="demo-code">
      <code>{{ codeExample }}</code>
    </div>
  </div>
</template>

<script setup lang="ts">
const shadowStyle = {
  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  borderRadius: '8px',
  display: 'inline-block'
}

const codeExample = `<div style="box-shadow: 0 10px 30px rgba(0,0,0,0.3)">
  <q-r-code content="Shadow Effect" />
</div>`
</script>

<style scoped>
@import '../styles/demo.css';
</style>
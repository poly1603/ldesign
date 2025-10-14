<template>
  <div class="example-section">
    <h2 class="example-title">QR Code Directives</h2>
    
    <div class="controls">
      <div class="control-group">
        <label>Directive Content:</label>
        <input 
          v-model="directiveContent"
          type="text" 
          placeholder="Enter content"
        />
      </div>
    </div>

    <div class="directive-examples">
      <div class="directive-example">
        <h3>Basic Directive</h3>
        <div v-qrcode="directiveContent" />
      </div>

      <div class="directive-example">
        <h3>SVG + Large</h3>
        <div v-qrcode.svg.large="directiveContent" />
      </div>

      <div class="directive-example">
        <h3>Dark Mode</h3>
        <div v-qrcode.dark="directiveContent" />
      </div>

      <div class="directive-example">
        <h3>Small + Download</h3>
        <div v-qrcode.small.download="directiveContent" />
      </div>

      <div class="directive-example">
        <h3>Config Object</h3>
        <div v-qrcode="configObject" />
      </div>

      <div class="directive-example">
        <h3>Auto Theme</h3>
        <div v-qrcode.auto="directiveContent" />
      </div>
    </div>

    <div class="code-block">
      <pre>{{ codeExample }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const directiveContent = ref('QR Code with Directives')

const configObject = computed(() => ({
  content: directiveContent.value,
  style: {
    size: 150,
    fgColor: '#42b883',
    bgColor: '#35495e',
    cornerRadius: 10,
    dotStyle: 'rounded'
  }
}))

const codeExample = computed(() => `<!-- Basic directive -->
<div v-qrcode="'${directiveContent.value}'" />

<!-- With modifiers -->
<div v-qrcode.svg.large.dark="content" />

<!-- With config object -->
<div v-qrcode="{
  content: '${directiveContent.value}',
  style: {
    size: 150,
    fgColor: '#42b883'
  }
}" />

<!-- Downloadable (click to download) -->
<div v-qrcode.download="content" />`)
</script>

<style scoped>
@import '../styles/examples.css';
</style>
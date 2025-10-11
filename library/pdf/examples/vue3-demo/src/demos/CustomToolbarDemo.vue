<template>
  <div class="demo">
    <div class="demo-header">
      <h2>Custom Toolbar</h2>
      <p>PDF viewer with customized toolbar configuration</p>
    </div>

    <PDFViewer
      :url="pdfUrl"
      :enable-toolbar="true"
      :toolbar="{
        showZoom: true,
        showPageNav: true,
        showDownload: true,
        showPrint: true,
        showRotate: true
      }"
      :theme="{
        primaryColor: '#7c3aed',
        backgroundColor: '#1e293b',
        toolbarBackground: '#0f172a',
        textColor: '#f1f5f9'
      }"
      :worker-src="'/pdf.worker.min.mjs'"
    />
  </div>
</template>

<script setup lang="ts">
import { PDFViewer } from '@ldesign/pdf-viewer/vue'

const pdfUrl = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'
</script>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.demo-header {
  padding: 20px;
  background: #f6f8fa;
  border-bottom: 1px solid #d0d7de;
}

.demo-header h2 {
  font-size: 20px;
  margin-bottom: 8px;
  color: #24292f;
}

.demo-header p {
  font-size: 14px;
  color: #57606a;
}
</style>

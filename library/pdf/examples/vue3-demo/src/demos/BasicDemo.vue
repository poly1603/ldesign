<template>
  <div class="demo">
    <div class="demo-header">
      <h2>Basic Usage</h2>
      <p>Simple PDF viewer component with default settings</p>
    </div>

    <PDFViewer
      :url="pdfUrl"
      :scale="1.0"
      :enable-toolbar="true"
      :worker-src="'/pdf.worker.min.mjs'"
      @document-loaded="onDocumentLoaded"
      @page-changed="onPageChanged"
      @error="onError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PDFViewer } from '@ldesign/pdf-viewer/vue'

const pdfUrl = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'

const onDocumentLoaded = (totalPages: number) => {
  console.log('Document loaded, total pages:', totalPages)
}

const onPageChanged = (pageNumber: number) => {
  console.log('Page changed:', pageNumber)
}

const onError = (error: Error) => {
  console.error('PDF Error:', error)
}
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

<template>
  <component :is="iconComponent" :size="size" :class="iconClass" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  FileCode,
  FileText,
  FileJson,
  Image,
  File,
  FileArchive,
  Database,
  Settings
} from 'lucide-vue-next'

interface Props {
  extension?: string
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 16
})

// 文件扩展名到图标的映射
const iconMap: Record<string, any> = {
  // 代码文件
  js: FileCode,
  ts: FileCode,
  jsx: FileCode,
  tsx: FileCode,
  vue: FileCode,
  py: FileCode,
  java: FileCode,
  cpp: FileCode,
  c: FileCode,
  h: FileCode,
  cs: FileCode,
  go: FileCode,
  rs: FileCode,
  php: FileCode,
  rb: FileCode,
  swift: FileCode,
  kt: FileCode,
  
  // 标记语言
  html: FileCode,
  xml: FileCode,
  md: FileText,
  
  // 样式文件
  css: FileCode,
  scss: FileCode,
  sass: FileCode,
  less: FileCode,
  
  // 配置文件
  json: FileJson,
  yaml: Settings,
  yml: Settings,
  toml: Settings,
  ini: Settings,
  conf: Settings,
  config: Settings,
  
  // 文档文件
  txt: FileText,
  doc: FileText,
  docx: FileText,
  pdf: FileText,
  
  // 图片文件
  jpg: Image,
  jpeg: Image,
  png: Image,
  gif: Image,
  svg: Image,
  webp: Image,
  ico: Image,
  bmp: Image,
  
  // 压缩文件
  zip: FileArchive,
  rar: FileArchive,
  '7z': FileArchive,
  tar: FileArchive,
  gz: FileArchive,
  
  // 数据库
  db: Database,
  sqlite: Database,
  sql: Database,
}

// 扩展名到颜色类的映射
const colorClassMap: Record<string, string> = {
  // JavaScript/TypeScript - 黄色
  js: 'icon-js',
  ts: 'icon-ts',
  jsx: 'icon-js',
  tsx: 'icon-ts',
  
  // Vue - 绿色
  vue: 'icon-vue',
  
  // HTML/CSS - 蓝色/紫色
  html: 'icon-html',
  css: 'icon-css',
  scss: 'icon-css',
  sass: 'icon-css',
  less: 'icon-css',
  
  // JSON - 橙色
  json: 'icon-json',
  
  // 图片 - 粉色
  jpg: 'icon-image',
  jpeg: 'icon-image',
  png: 'icon-image',
  gif: 'icon-image',
  svg: 'icon-image',
  webp: 'icon-image',
  
  // 配置 - 灰色
  yaml: 'icon-config',
  yml: 'icon-config',
  toml: 'icon-config',
  ini: 'icon-config',
  conf: 'icon-config',
  
  // 压缩文件 - 棕色
  zip: 'icon-archive',
  rar: 'icon-archive',
  '7z': 'icon-archive',
  tar: 'icon-archive',
  gz: 'icon-archive',
  
  // 数据库 - 青色
  db: 'icon-database',
  sqlite: 'icon-database',
  sql: 'icon-database',
  
  // Markdown - 黑色
  md: 'icon-markdown',
}

// 根据扩展名获取图标组件
const iconComponent = computed(() => {
  const ext = props.extension?.toLowerCase()
  return ext && iconMap[ext] ? iconMap[ext] : File
})

// 根据扩展名获取颜色类
const iconClass = computed(() => {
  const ext = props.extension?.toLowerCase()
  return ext && colorClassMap[ext] ? colorClassMap[ext] : 'icon-default'
})
</script>

<style lang="less" scoped>
// JavaScript
.icon-js {
  color: #F7DF1E;
}

// TypeScript
.icon-ts {
  color: #3178C6;
}

// Vue
.icon-vue {
  color: #42B883;
}

// HTML
.icon-html {
  color: #E34F26;
}

// CSS
.icon-css {
  color: #1572B6;
}

// JSON
.icon-json {
  color: #FFA500;
}

// 图片
.icon-image {
  color: #E91E63;
}

// 配置文件
.icon-config {
  color: #9E9E9E;
}

// 压缩文件
.icon-archive {
  color: #795548;
}

// 数据库
.icon-database {
  color: #00BCD4;
}

// Markdown
.icon-markdown {
  color: #212121;
}

// 默认
.icon-default {
  color: var(--ldesign-text-color-tertiary);
}
</style>
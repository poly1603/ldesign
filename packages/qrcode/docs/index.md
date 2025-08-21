---
layout: home
title: LDesign QRCode
hero:
	name: LDesign QRCode
	text: 强大、灵活的二维码生成库
	tagline: 原生 API + Vue 组件/Hook，支持 Canvas / SVG / Image，Logo、渐变、点样式等
	actions:
		- theme: brand
		  text: 快速上手
		  link: /guide/getting-started
		- theme: alt
		  text: API
		  link: /guide/api
features:
	- title: 多种输出
	  details: 支持 Canvas、SVG、Image，不同场景自由选择
	- title: Vue 生态
	  details: 提供组件与 Hook，简单接入任意 Vue3 项目
	- title: 高度自定义
	  details: 渐变、点样式、圆角、Logo 等诸多个性化能力
---

### 立即预览一个真实二维码

下面组件直接来自库本身，页面加载时会实时渲染二维码：

<LQRCode :width="200" text="https://ldesign.dev/qrcode" :showDownloadButton="true" />

提示：点击右上角下载按钮可保存二维码到本地。



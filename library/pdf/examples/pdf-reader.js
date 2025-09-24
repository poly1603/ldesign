/*!
 * ***********************************
 * @ldesign/pdf-reader v1.0.0      *
 * Built with rollup               *
 * Build time: 2024-09-23 16:12:07 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('pdfjs-dist')) :
    typeof define === 'function' && define.amd ? define(['exports', 'pdfjs-dist'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.MyLibrary = {}, global.pdfjsLib));
})(this, (function (exports, pdfjsLib) { 'use strict';

    function _interopNamespaceDefault(e) {
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        }
        n.default = e;
        return Object.freeze(n);
    }

    var pdfjsLib__namespace = /*#__PURE__*/_interopNamespaceDefault(pdfjsLib);

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol, Iterator */


    function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
        function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
        var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
        var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
        var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
        var _, done = false;
        for (var i = decorators.length - 1; i >= 0; i--) {
            var context = {};
            for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
            for (var p in contextIn.access) context.access[p] = contextIn.access[p];
            context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
            var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
            if (kind === "accessor") {
                if (result === void 0) continue;
                if (result === null || typeof result !== "object") throw new TypeError("Object expected");
                if (_ = accept(result.get)) descriptor.get = _;
                if (_ = accept(result.set)) descriptor.set = _;
                if (_ = accept(result.init)) initializers.unshift(_);
            }
            else if (_ = accept(result)) {
                if (kind === "field") initializers.unshift(_);
                else descriptor[key] = _;
            }
        }
        if (target) Object.defineProperty(target, contextIn.name, descriptor);
        done = true;
    }
    function __runInitializers(thisArg, initializers, value) {
        var useValue = arguments.length > 2;
        for (var i = 0; i < initializers.length; i++) {
            value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
        }
        return useValue ? value : void 0;
    }
    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    class EventEmitter {
      constructor() {
        this.listeners = /* @__PURE__ */ new Map();
      }
      /**
       * 注册事件监听器
       * @param event - 事件名称
       * @param listener - 监听器函数
       * @returns 当前实例，支持链式调用
       */
      on(event, listener) {
        if (!this.listeners.has(event)) {
          this.listeners.set(event, /* @__PURE__ */ new Set());
        }
        this.listeners.get(event).add(listener);
        return this;
      }
      /**
       * 注册一次性事件监听器
       * @param event - 事件名称
       * @param listener - 监听器函数
       * @returns 当前实例，支持链式调用
       */
      once(event, listener) {
        const onceListener = (data) => {
          listener(data);
          this.off(event, onceListener);
        };
        return this.on(event, onceListener);
      }
      /**
       * 移除事件监听器
       * @param event - 事件名称
       * @param listener - 监听器函数（可选，不传则移除所有监听器）
       * @returns 当前实例，支持链式调用
       */
      off(event, listener) {
        const eventListeners = this.listeners.get(event);
        if (!eventListeners)
          return this;
        if (listener) {
          eventListeners.delete(listener);
          if (eventListeners.size === 0) {
            this.listeners.delete(event);
          }
        } else {
          this.listeners.delete(event);
        }
        return this;
      }
      /**
       * 触发事件
       * @param event - 事件名称
       * @param data - 事件数据
       * @returns 当前实例，支持链式调用
       */
      emit(event, data) {
        const eventListeners = this.listeners.get(event);
        if (!eventListeners)
          return this;
        const listenersArray = Array.from(eventListeners);
        for (const listener of listenersArray) {
          try {
            listener(data);
          } catch (error) {
            console.error(`Error in event listener for "${String(event)}":`, error);
          }
        }
        return this;
      }
      /**
       * 获取指定事件的监听器数量
       * @param event - 事件名称
       * @returns 监听器数量
       */
      listenerCount(event) {
        const eventListeners = this.listeners.get(event);
        return eventListeners ? eventListeners.size : 0;
      }
      /**
       * 获取所有事件名称
       * @returns 事件名称数组
       */
      eventNames() {
        return Array.from(this.listeners.keys());
      }
      /**
       * 移除所有事件监听器
       * @returns 当前实例，支持链式调用
       */
      removeAllListeners() {
        this.listeners.clear();
        return this;
      }
      /**
       * 检查是否有指定事件的监听器
       * @param event - 事件名称
       * @returns 是否有监听器
       */
      hasListeners(event) {
        return this.listenerCount(event) > 0;
      }
    }

    function getElement(selector) {
      if (typeof selector === "string") {
        const element = document.querySelector(selector);
        if (!element) {
          throw new Error(`Element not found: ${selector}`);
        }
        return element;
      }
      return selector;
    }
    function createElement(tagName, className, attributes) {
      const element = document.createElement(tagName);
      if (className) {
        element.className = className;
      }
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          element.setAttribute(key, value);
        });
      }
      return element;
    }
    function debounce(func, delay) {
      let timeoutId;
      return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
      };
    }
    function throttle(func, delay) {
      let lastCall = 0;
      return (...args) => {
        const now = Date.now();
        if (now - lastCall >= delay) {
          lastCall = now;
          func.apply(this, args);
        }
      };
    }
    function formatFileSize(bytes) {
      if (bytes === 0)
        return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }
    function isValidPageNumber(pageNumber, totalPages) {
      return Number.isInteger(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages;
    }
    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }
    function generateId(prefix = "pdf") {
      return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    function isBrowserSupported() {
      return !!(window.ArrayBuffer && window.Uint8Array && window.Promise && window.Worker && document.createElement("canvas").getContext("2d"));
    }
    function getDevicePixelRatio() {
      return window.devicePixelRatio || 1;
    }
    function calculateFitScale(containerWidth, containerHeight, pageWidth, pageHeight, padding = 20) {
      const availableWidth = containerWidth - padding * 2;
      const availableHeight = containerHeight - padding * 2;
      const scaleX = availableWidth / pageWidth;
      const scaleY = availableHeight / pageHeight;
      return Math.min(scaleX, scaleY);
    }
    function errorHandler(target, propertyKey, descriptor) {
      const originalMethod = descriptor.value;
      descriptor.value = async function(...args) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          console.error(`Error in ${propertyKey}:`, error);
          if (this.emit && typeof this.emit === "function") {
            this.emit("error", error);
          }
          throw error;
        }
      };
      return descriptor;
    }
    function deepMerge(target, ...sources) {
      if (!sources.length)
        return target;
      const source = sources.shift();
      if (isObject(target) && isObject(source)) {
        for (const key in source) {
          if (isObject(source[key])) {
            if (!target[key])
              Object.assign(target, { [key]: {} });
            deepMerge(target[key], source[key]);
          } else {
            Object.assign(target, { [key]: source[key] });
          }
        }
      }
      return deepMerge(target, ...sources);
    }
    function isObject(item) {
      return item && typeof item === "object" && !Array.isArray(item);
    }

    let PDFReader$2 = (() => {
      var _a;
      let _classSuper = EventEmitter;
      let _instanceExtraInitializers = [];
      let _loadDocument_decorators;
      let _renderPage_decorators;
      return _a = class PDFReader extends _classSuper {
        /**
         * 构造函数
         * @param options - 配置选项
         */
        constructor(options) {
          super();
          this.options = __runInitializers(this, _instanceExtraInitializers);
          this.pdfDocument = null;
          this.pageCache = /* @__PURE__ */ new Map();
          this.state = {
            isLoaded: false,
            currentPage: 1,
            totalPages: 0,
            scale: 1,
            isLoading: false,
            isSearching: false
          };
          this.renderTasks = /* @__PURE__ */ new Map();
          if (!isBrowserSupported()) {
            throw new Error("\u5F53\u524D\u6D4F\u89C8\u5668\u4E0D\u652F\u6301PDF.js");
          }
          this.instanceId = generateId("pdf-reader");
          this.options = {
            ..._a.DEFAULT_OPTIONS,
            ...options
          };
          this.container = getElement(this.options.container);
          this.initializeWorker();
          this.initializeUI();
          if (this.options.src) {
            this.loadDocument(this.options.src).catch((error) => {
              this.emit("error", error);
            });
          }
        }
        /**
         * 初始化PDF.js Worker
         * @private
         */
        initializeWorker() {
          if (this.options.workerSrc) {
            pdfjsLib__namespace.GlobalWorkerOptions.workerSrc = this.options.workerSrc;
          } else {
            pdfjsLib__namespace.GlobalWorkerOptions.workerSrc = "pdfjs-dist/build/pdf.worker.min.js";
          }
        }
        /**
         * 初始化UI界面
         * @private
         */
        initializeUI() {
          this.container.innerHTML = "";
          this.container.classList.add("ldesign-pdf-reader");
          if (this.options.className) {
            this.container.classList.add(this.options.className);
          }
          this.container.setAttribute("data-theme", this.options.theme);
          this.createMainStructure();
          this.bindEvents();
        }
        /**
         * 创建主要UI结构
         * @private
         */
        createMainStructure() {
          const mainContainer = createElement("div", "pdf-main-container");
          if (this.options.showToolbar) {
            const toolbar = this.createToolbar();
            mainContainer.appendChild(toolbar);
          }
          const contentArea = createElement("div", "pdf-content-area");
          if (this.options.showThumbnails) {
            const thumbnailPanel = createElement("div", "pdf-thumbnail-panel");
            contentArea.appendChild(thumbnailPanel);
          }
          const pageArea = createElement("div", "pdf-page-area");
          pageArea.id = `${this.instanceId}-page-area`;
          contentArea.appendChild(pageArea);
          mainContainer.appendChild(contentArea);
          this.container.appendChild(mainContainer);
        }
        /**
         * 创建工具栏
         * @private
         * @returns 工具栏元素
         */
        createToolbar() {
          const toolbar = createElement("div", "pdf-toolbar");
          toolbar.id = `${this.instanceId}-toolbar`;
          const navGroup = createElement("div", "pdf-toolbar-group");
          const prevBtn = createElement("button", "pdf-btn pdf-btn-prev", {
            title: "\u4E0A\u4E00\u9875",
            "data-action": "prev-page"
          });
          prevBtn.innerHTML = "\u25C0";
          const nextBtn = createElement("button", "pdf-btn pdf-btn-next", {
            title: "\u4E0B\u4E00\u9875",
            "data-action": "next-page"
          });
          nextBtn.innerHTML = "\u25B6";
          const pageInfo = createElement("span", "pdf-page-info");
          pageInfo.id = `${this.instanceId}-page-info`;
          pageInfo.textContent = "0 / 0";
          navGroup.appendChild(prevBtn);
          navGroup.appendChild(pageInfo);
          navGroup.appendChild(nextBtn);
          const zoomGroup = createElement("div", "pdf-toolbar-group");
          const zoomOutBtn = createElement("button", "pdf-btn pdf-btn-zoom-out", {
            title: "\u7F29\u5C0F",
            "data-action": "zoom-out"
          });
          zoomOutBtn.innerHTML = "\u2212";
          const zoomInBtn = createElement("button", "pdf-btn pdf-btn-zoom-in", {
            title: "\u653E\u5927",
            "data-action": "zoom-in"
          });
          zoomInBtn.innerHTML = "+";
          const scaleInfo = createElement("span", "pdf-scale-info");
          scaleInfo.id = `${this.instanceId}-scale-info`;
          scaleInfo.textContent = "100%";
          zoomGroup.appendChild(zoomOutBtn);
          zoomGroup.appendChild(scaleInfo);
          zoomGroup.appendChild(zoomInBtn);
          toolbar.appendChild(navGroup);
          toolbar.appendChild(zoomGroup);
          return toolbar;
        }
        /**
         * 绑定事件监听器
         * @private
         */
        bindEvents() {
          this.container.addEventListener("click", this.handleToolbarClick.bind(this));
          document.addEventListener("keydown", this.handleKeyDown.bind(this));
          window.addEventListener("resize", debounce(this.handleResize.bind(this), 300));
        }
        /**
         * 处理工具栏点击事件
         * @private
         * @param event - 点击事件
         */
        handleToolbarClick(event) {
          const target = event.target;
          const action = target.getAttribute("data-action");
          if (!action)
            return;
          switch (action) {
            case "prev-page":
              this.previousPage();
              break;
            case "next-page":
              this.nextPage();
              break;
            case "zoom-in":
              this.zoomIn();
              break;
            case "zoom-out":
              this.zoomOut();
              break;
          }
        }
        /**
         * 处理键盘事件
         * @private
         * @param event - 键盘事件
         */
        handleKeyDown(event) {
          if (!this.container.contains(document.activeElement))
            return;
          switch (event.key) {
            case "ArrowLeft":
            case "PageUp":
              event.preventDefault();
              this.previousPage();
              break;
            case "ArrowRight":
            case "PageDown":
              event.preventDefault();
              this.nextPage();
              break;
            case "Home":
              event.preventDefault();
              this.goToPage(1);
              break;
            case "End":
              event.preventDefault();
              this.goToPage(this.state.totalPages);
              break;
            case "+":
            case "=":
              if (event.ctrlKey) {
                event.preventDefault();
                this.zoomIn();
              }
              break;
            case "-":
              if (event.ctrlKey) {
                event.preventDefault();
                this.zoomOut();
              }
              break;
          }
        }
        /**
         * 处理窗口大小变化事件
         * @private
         */
        handleResize() {
          if (this.state.isLoaded) {
            this.rerenderCurrentPage();
          }
        }
        /**
         * 加载PDF文档
         * @param src - PDF文件URL或ArrayBuffer
         * @returns Promise
         */
        async loadDocument(src) {
          const source = src || this.options.src;
          if (!source) {
            throw new Error("\u672A\u63D0\u4F9BPDF\u6587\u4EF6\u6E90");
          }
          this.state.isLoading = true;
          this.emit("loading-progress", 0);
          try {
            const loadingTask = pdfjsLib__namespace.getDocument(source);
            loadingTask.onProgress = (progress) => {
              const percent = progress.loaded / progress.total;
              this.emit("loading-progress", percent);
            };
            this.pdfDocument = await loadingTask.promise;
            this.state.isLoaded = true;
            this.state.totalPages = this.pdfDocument.numPages;
            this.state.currentPage = clamp(this.options.initialPage, 1, this.state.totalPages);
            this.state.scale = this.options.initialScale;
            this.state.isLoading = false;
            const documentInfo = await this.getDocumentInfo();
            this.updateUI();
            await this.renderPage(this.state.currentPage);
            this.emit("document-loaded", documentInfo);
            this.emit("loading-progress", 1);
          } catch (error) {
            this.state.isLoading = false;
            throw error;
          }
        }
        /**
         * 获取文档信息
         * @returns 文档信息
         */
        async getDocumentInfo() {
          if (!this.pdfDocument)
            return null;
          try {
            const metadata = await this.pdfDocument.getMetadata();
            const info = metadata.info;
            return {
              title: info.Title || void 0,
              author: info.Author || void 0,
              subject: info.Subject || void 0,
              keywords: info.Keywords || void 0,
              creator: info.Creator || void 0,
              producer: info.Producer || void 0,
              creationDate: info.CreationDate ? new Date(info.CreationDate) : void 0,
              modificationDate: info.ModDate ? new Date(info.ModDate) : void 0,
              numPages: this.pdfDocument.numPages,
              pdfFormatVersion: this.pdfDocument.pdfInfo?.PDFFormatVersion
            };
          } catch (error) {
            console.warn("\u83B7\u53D6\u6587\u6863\u4FE1\u606F\u5931\u8D25:", error);
            return {
              numPages: this.pdfDocument.numPages
            };
          }
        }
        /**
         * 更新UI显示
         * @private
         */
        updateUI() {
          const pageInfo = document.getElementById(`${this.instanceId}-page-info`);
          if (pageInfo) {
            pageInfo.textContent = `${this.state.currentPage} / ${this.state.totalPages}`;
          }
          const scaleInfo = document.getElementById(`${this.instanceId}-scale-info`);
          if (scaleInfo) {
            scaleInfo.textContent = `${Math.round(this.state.scale * 100)}%`;
          }
        }
        /**
         * 渲染指定页面
         * @param pageNumber - 页码
         * @param options - 渲染选项
         * @returns Promise
         */
        async renderPage(pageNumber, options) {
          if (!this.pdfDocument || !isValidPageNumber(pageNumber, this.state.totalPages)) {
            throw new Error(`\u65E0\u6548\u7684\u9875\u7801: ${pageNumber}`);
          }
          const existingTask = this.renderTasks.get(pageNumber);
          if (existingTask) {
            existingTask.cancel();
            this.renderTasks.delete(pageNumber);
          }
          try {
            const page = await this.pdfDocument.getPage(pageNumber);
            const scale = options?.scale || this.state.scale;
            const rotation = options?.rotation || 0;
            const viewport = page.getViewport({ scale, rotation });
            const canvas = this.getOrCreateCanvas(pageNumber);
            const context = canvas.getContext("2d");
            const devicePixelRatio = getDevicePixelRatio();
            canvas.width = viewport.width * devicePixelRatio;
            canvas.height = viewport.height * devicePixelRatio;
            canvas.style.width = `${viewport.width}px`;
            canvas.style.height = `${viewport.height}px`;
            context.scale(devicePixelRatio, devicePixelRatio);
            const renderContext = {
              canvasContext: context,
              viewport
            };
            const renderTask = page.render(renderContext);
            this.renderTasks.set(pageNumber, renderTask);
            await renderTask.promise;
            this.pageCache.set(pageNumber, {
              page,
              canvas,
              renderTask
            });
            this.renderTasks.delete(pageNumber);
          } catch (error) {
            this.renderTasks.delete(pageNumber);
            throw error;
          }
        }
        /**
         * 获取或创建Canvas元素
         * @private
         * @param pageNumber - 页码
         * @returns Canvas元素
         */
        getOrCreateCanvas(pageNumber) {
          const pageArea = document.getElementById(`${this.instanceId}-page-area`);
          const canvasId = `${this.instanceId}-canvas-${pageNumber}`;
          let canvas = document.getElementById(canvasId);
          if (!canvas) {
            canvas = createElement("canvas", "pdf-page-canvas", { id: canvasId });
            pageArea.appendChild(canvas);
          }
          return canvas;
        }
        /**
         * 重新渲染当前页面
         * @private
         */
        async rerenderCurrentPage() {
          if (this.state.isLoaded) {
            await this.renderPage(this.state.currentPage);
          }
        }
        /**
         * 跳转到指定页面
         * @param pageNumber - 页码
         * @returns Promise
         */
        async goToPage(pageNumber) {
          if (!isValidPageNumber(pageNumber, this.state.totalPages)) {
            throw new Error(`\u65E0\u6548\u7684\u9875\u7801: ${pageNumber}`);
          }
          if (pageNumber === this.state.currentPage)
            return;
          this.state.currentPage = pageNumber;
          await this.renderPage(pageNumber);
          this.updateUI();
          this.emit("page-changed", pageNumber);
        }
        /**
         * 上一页
         * @returns Promise
         */
        async previousPage() {
          if (this.state.currentPage > 1) {
            await this.goToPage(this.state.currentPage - 1);
          }
        }
        /**
         * 下一页
         * @returns Promise
         */
        async nextPage() {
          if (this.state.currentPage < this.state.totalPages) {
            await this.goToPage(this.state.currentPage + 1);
          }
        }
        /**
         * 设置缩放比例
         * @param scale - 缩放比例
         */
        setScale(scale) {
          const newScale = clamp(scale, 0.1, 5);
          if (newScale === this.state.scale)
            return;
          this.state.scale = newScale;
          this.rerenderCurrentPage();
          this.updateUI();
          this.emit("scale-changed", newScale);
        }
        /**
         * 放大
         */
        zoomIn() {
          this.setScale(this.state.scale * 1.2);
        }
        /**
         * 缩小
         */
        zoomOut() {
          this.setScale(this.state.scale / 1.2);
        }
        /**
         * 适合宽度
         */
        fitWidth() {
          if (!this.pdfDocument)
            return;
          this.setScale(1);
        }
        /**
         * 适合页面
         */
        fitPage() {
          if (!this.pdfDocument)
            return;
          this.setScale(0.8);
        }
        /**
         * 搜索文本
         * @param query - 搜索关键词
         * @param options - 搜索选项
         * @returns 搜索结果
         */
        async search(query, options) {
          if (!this.pdfDocument || !query.trim()) {
            return [];
          }
          this.state.isSearching = true;
          const results = [];
          try {
            const searchOptions = {
              caseSensitive: false,
              wholeWords: false,
              direction: "forward",
              startPage: 1,
              ...options
            };
            const startPage = searchOptions.startPage;
            const endPage = this.state.totalPages;
            for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
              const page = await this.pdfDocument.getPage(pageNum);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.filter((item) => "str" in item).map((item) => item.str).join(" ");
              const searchRegex = new RegExp(searchOptions.wholeWords ? `\\b${query}\\b` : query, searchOptions.caseSensitive ? "g" : "gi");
              let match;
              const matches = [];
              while ((match = searchRegex.exec(pageText)) !== null) {
                matches.push({
                  begin: match.index,
                  end: match.index + match[0].length,
                  rect: [0, 0, 0, 0]
                  // 这里需要计算实际的边界框
                });
              }
              if (matches.length > 0) {
                results.push({
                  pageNumber: pageNum,
                  text: pageText,
                  matches
                });
              }
            }
            this.emit("search-results", results);
            return results;
          } finally {
            this.state.isSearching = false;
          }
        }
        /**
         * 获取当前状态
         * @returns 当前状态
         */
        getState() {
          return { ...this.state };
        }
        /**
         * 销毁实例
         */
        destroy() {
          this.renderTasks.forEach((task) => task.cancel());
          this.renderTasks.clear();
          this.pageCache.clear();
          if (this.pdfDocument) {
            this.pdfDocument.destroy();
            this.pdfDocument = null;
          }
          this.removeAllListeners();
          this.container.innerHTML = "";
          this.container.classList.remove("ldesign-pdf-reader");
          this.state = {
            isLoaded: false,
            currentPage: 1,
            totalPages: 0,
            scale: 1,
            isLoading: false,
            isSearching: false
          };
        }
      }, (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        _loadDocument_decorators = [errorHandler];
        _renderPage_decorators = [errorHandler];
        __esDecorate(_a, null, _loadDocument_decorators, { kind: "method", name: "loadDocument", static: false, private: false, access: { has: (obj) => "loadDocument" in obj, get: (obj) => obj.loadDocument }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_a, null, _renderPage_decorators, { kind: "method", name: "renderPage", static: false, private: false, access: { has: (obj) => "renderPage" in obj, get: (obj) => obj.renderPage }, metadata: _metadata }, null, _instanceExtraInitializers);
        if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
      })(), /** 默认配置 */
      _a.DEFAULT_OPTIONS = {
        src: "",
        initialPage: 1,
        initialScale: 1,
        showToolbar: true,
        showThumbnails: true,
        enableSearch: true,
        enableAnnotations: true,
        theme: "auto",
        className: "",
        workerSrc: ""
      }, _a;
    })();

    const VERSION = "1.0.0";
    const DEFAULT_CONFIG = {
      initialPage: 1,
      initialScale: 1,
      showToolbar: true,
      showThumbnails: true,
      enableSearch: true,
      enableAnnotations: true,
      theme: "auto",
      workerSrc: "pdfjs-dist/build/pdf.worker.min.js"
    };
    function createPDFReader(options) {
      return new PDFReader(options);
    }
    function checkCompatibility() {
      const missing = [];
      if (!window.ArrayBuffer)
        missing.push("ArrayBuffer");
      if (!window.Uint8Array)
        missing.push("Uint8Array");
      if (!window.Promise)
        missing.push("Promise");
      if (!window.Worker)
        missing.push("Worker");
      if (!document.createElement("canvas").getContext("2d"))
        missing.push("Canvas 2D Context");
      return {
        supported: missing.length === 0,
        missing
      };
    }
    var PDFReader$1 = PDFReader;

    exports.DEFAULT_CONFIG = DEFAULT_CONFIG;
    exports.EventEmitter = EventEmitter;
    exports.PDFReader = PDFReader$2;
    exports.VERSION = VERSION;
    exports.calculateFitScale = calculateFitScale;
    exports.checkCompatibility = checkCompatibility;
    exports.clamp = clamp;
    exports.createElement = createElement;
    exports.createPDFReader = createPDFReader;
    exports.debounce = debounce;
    exports.deepMerge = deepMerge;
    exports.default = PDFReader$1;
    exports.formatFileSize = formatFileSize;
    exports.generateId = generateId;
    exports.getDevicePixelRatio = getDevicePixelRatio;
    exports.getElement = getElement;
    exports.isBrowserSupported = isBrowserSupported;
    exports.isValidPageNumber = isValidPageNumber;
    exports.throttle = throttle;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.umd.js.map

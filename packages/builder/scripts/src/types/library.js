"use strict";
/**
 * 库类型相关定义
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LibraryType = void 0;
/**
 * 库类型枚举
 */
var LibraryType;
(function (LibraryType) {
    /** TypeScript 库 */
    LibraryType["TYPESCRIPT"] = "typescript";
    /** 样式库 */
    LibraryType["STYLE"] = "style";
    /** Vue2 组件库 */
    LibraryType["VUE2"] = "vue2";
    /** Vue3 组件库 */
    LibraryType["VUE3"] = "vue3";
    /** React 组件库 */
    LibraryType["REACT"] = "react";
    /** Svelte 组件库 */
    LibraryType["SVELTE"] = "svelte";
    /** Solid 组件库 */
    LibraryType["SOLID"] = "solid";
    /** Preact 组件库 */
    LibraryType["PREACT"] = "preact";
    /** Lit/Web Components 组件库 */
    LibraryType["LIT"] = "lit";
    /** Angular 组件库（基础支持） */
    LibraryType["ANGULAR"] = "angular";
    /** 混合库 */
    LibraryType["MIXED"] = "mixed";
})(LibraryType || (exports.LibraryType = LibraryType = {}));

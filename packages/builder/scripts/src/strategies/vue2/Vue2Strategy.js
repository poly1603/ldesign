"use strict";
/**
 * Vue2 策略
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vue2Strategy = void 0;
const library_1 = require("../../types/library");
class Vue2Strategy {
    constructor() {
        this.name = 'vue2';
        this.supportedTypes = [library_1.LibraryType.VUE2];
        this.priority = 10;
    }
    async applyStrategy(config) {
        return config;
    }
    isApplicable(config) {
        return config.libraryType === library_1.LibraryType.VUE2;
    }
    getDefaultConfig() {
        return {};
    }
    getRecommendedPlugins(_config) {
        return [];
    }
    validateConfig(_config) {
        return {
            valid: true,
            errors: [],
            warnings: [],
            suggestions: []
        };
    }
}
exports.Vue2Strategy = Vue2Strategy;

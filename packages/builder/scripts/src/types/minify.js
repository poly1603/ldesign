"use strict";
/**
 * 压缩配置类型定义
 *
 * @author LDesign Team
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MINIFY_PRESETS = void 0;
exports.getMinifyConfig = getMinifyConfig;
exports.mergeMinifyConfig = mergeMinifyConfig;
/**
 * 预设压缩配置
 */
exports.MINIFY_PRESETS = {
    none: {
        level: 'none',
        js: false,
        css: false,
        html: false,
        comments: true,
        legal: true
    },
    whitespace: {
        level: 'whitespace',
        js: {
            minifier: 'esbuild',
            mangle: false,
            compress: false,
            format: {
                comments: true,
                beautify: false
            }
        },
        css: {
            minifier: 'clean-css',
            removeUnused: false,
            mergeRules: false,
            discardComments: false
        },
        html: {
            collapseWhitespace: true,
            removeComments: false,
            minifyCSS: false,
            minifyJS: false
        },
        comments: true,
        legal: true
    },
    basic: {
        level: 'basic',
        js: {
            minifier: 'terser',
            mangle: false,
            compress: {
                drop_console: false,
                drop_debugger: true,
                dead_code: true,
                inline: false
            },
            format: {
                comments: 'some'
            }
        },
        css: {
            minifier: 'cssnano',
            removeUnused: false,
            mergeRules: true,
            colormin: true,
            discardComments: false,
            discardEmpty: true
        },
        html: {
            collapseWhitespace: true,
            removeComments: false,
            removeEmptyAttributes: true,
            minifyCSS: true,
            minifyJS: false
        },
        comments: 'some',
        legal: true
    },
    advanced: {
        level: 'advanced',
        js: {
            minifier: 'terser',
            mangle: {
                reserved: [],
                properties: false
            },
            compress: {
                drop_console: true,
                drop_debugger: true,
                dead_code: true,
                inline: true
            },
            format: {
                comments: false
            }
        },
        css: {
            minifier: 'cssnano',
            removeUnused: true,
            mergeRules: true,
            colormin: true,
            minifyFontValues: true,
            minifySelectors: true,
            discardComments: true,
            discardEmpty: true
        },
        html: {
            collapseWhitespace: true,
            removeComments: true,
            removeEmptyAttributes: true,
            removeRedundantAttributes: true,
            minifyCSS: true,
            minifyJS: true
        },
        comments: false,
        legal: true
    }
};
/**
 * 获取压缩配置
 */
function getMinifyConfig(options) {
    if (typeof options === 'boolean') {
        return options ? exports.MINIFY_PRESETS.basic : exports.MINIFY_PRESETS.none;
    }
    if (typeof options === 'string') {
        return exports.MINIFY_PRESETS[options] || exports.MINIFY_PRESETS.basic;
    }
    return options;
}
/**
 * 合并压缩配置
 */
function mergeMinifyConfig(base, override) {
    return {
        ...base,
        ...override,
        js: typeof override.js === 'object' && typeof base.js === 'object'
            ? { ...base.js, ...override.js }
            : override.js ?? base.js,
        css: typeof override.css === 'object' && typeof base.css === 'object'
            ? { ...base.css, ...override.css }
            : override.css ?? base.css,
        html: typeof override.html === 'object' && typeof base.html === 'object'
            ? { ...base.html, ...override.html }
            : override.html ?? base.html
    };
}

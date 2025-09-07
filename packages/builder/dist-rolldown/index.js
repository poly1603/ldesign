import { EventEmitter } from "events";
import * as path$1 from "path";
import path from "path";
import createJiti from "jiti";
import { promises } from "fs";
import fastGlob from "fast-glob";
import * as os from "os";
import chalk from "chalk";
import { randomUUID } from "crypto";
import * as fs from "fs-extra";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function() {
	return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function() {
	return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, { get: (a, b) => (typeof require !== "undefined" ? require : a)[b] }) : x)(function(x) {
	if (typeof require !== "undefined") return require.apply(this, arguments);
	throw Error("Calling `require` for \"" + x + "\" in an environment that doesn't expose the `require` function.");
});

//#endregion
//#region src/types/builder.ts
/**
* 构建器状态枚举
*/
let BuilderStatus = /* @__PURE__ */ function(BuilderStatus$1) {
	/** 空闲状态 */
	BuilderStatus$1["IDLE"] = "idle";
	/** 初始化中 */
	BuilderStatus$1["INITIALIZING"] = "initializing";
	/** 构建中 */
	BuilderStatus$1["BUILDING"] = "building";
	/** 监听中 */
	BuilderStatus$1["WATCHING"] = "watching";
	/** 错误状态 */
	BuilderStatus$1["ERROR"] = "error";
	/** 已销毁 */
	BuilderStatus$1["DISPOSED"] = "disposed";
	return BuilderStatus$1;
}({});
/**
* 构建器事件枚举
*/
let BuilderEvent = /* @__PURE__ */ function(BuilderEvent$1) {
	/** 构建开始 */
	BuilderEvent$1["BUILD_START"] = "build:start";
	/** 构建进度 */
	BuilderEvent$1["BUILD_PROGRESS"] = "build:progress";
	/** 构建结束 */
	BuilderEvent$1["BUILD_END"] = "build:end";
	/** 构建错误 */
	BuilderEvent$1["BUILD_ERROR"] = "build:error";
	/** 监听开始 */
	BuilderEvent$1["WATCH_START"] = "watch:start";
	/** 监听变化 */
	BuilderEvent$1["WATCH_CHANGE"] = "watch:change";
	/** 监听结束 */
	BuilderEvent$1["WATCH_END"] = "watch:end";
	/** 配置变化 */
	BuilderEvent$1["CONFIG_CHANGE"] = "config:change";
	/** 状态变化 */
	BuilderEvent$1["STATUS_CHANGE"] = "status:change";
	return BuilderEvent$1;
}({});

//#endregion
//#region src/types/library.ts
/**
* 库类型相关定义
*/
/**
* 库类型枚举
*/
let LibraryType = /* @__PURE__ */ function(LibraryType$1) {
	/** TypeScript 库 */
	LibraryType$1["TYPESCRIPT"] = "typescript";
	/** 样式库 */
	LibraryType$1["STYLE"] = "style";
	/** Vue2 组件库 */
	LibraryType$1["VUE2"] = "vue2";
	/** Vue3 组件库 */
	LibraryType$1["VUE3"] = "vue3";
	/** React 组件库 */
	LibraryType$1["REACT"] = "react";
	/** 混合库 */
	LibraryType$1["MIXED"] = "mixed";
	return LibraryType$1;
}({});

//#endregion
//#region src/constants/defaults.ts
/**
* 默认构建器配置
*/
const DEFAULT_BUILDER_CONFIG = {
	input: "src/index.ts",
	output: {
		dir: "dist",
		format: ["esm", "cjs"],
		fileName: "[name].[format].js",
		sourcemap: true,
		chunkFileNames: "[name]-[hash].js",
		assetFileNames: "[name]-[hash][extname]"
	},
	bundler: "rollup",
	mode: "production",
	libraryType: LibraryType.TYPESCRIPT,
	bundleless: false,
	minify: false,
	clean: true,
	umd: {
		enabled: true,
		entry: "src/index.ts",
		name: "MyLibrary",
		forceMultiEntry: false,
		fileName: "index.umd.js",
		globals: {},
		minify: false
	},
	babel: {
		enabled: false,
		presets: [],
		plugins: [],
		targets: "defaults",
		polyfill: false,
		runtime: false,
		configFile: false,
		babelrc: true,
		exclude: /node_modules/,
		include: []
	},
	banner: {
		banner: "",
		footer: "",
		intro: "",
		outro: "",
		copyright: false,
		buildInfo: false
	},
	external: [],
	globals: {},
	plugins: [],
	typescript: {
		tsconfig: "./tsconfig.json",
		declaration: true,
		declarationDir: void 0,
		isolatedDeclarations: false,
		skipLibCheck: true,
		allowSyntheticDefaultImports: true,
		strict: true,
		target: "ES2020",
		module: "ESNext",
		moduleResolution: "node"
	},
	vue: {
		version: 3,
		onDemand: false,
		compilerOptions: {},
		jsx: {
			enabled: false,
			factory: "h",
			fragment: "Fragment"
		},
		template: { precompile: true }
	},
	style: {
		preprocessor: "auto",
		extract: true,
		minimize: true,
		autoprefixer: true,
		modules: false,
		postcssPlugins: []
	},
	performance: {
		bundleAnalyzer: false,
		sizeLimit: void 0,
		treeshaking: true,
		cache: true,
		parallel: true,
		monitoring: false
	},
	debug: false,
	postBuildValidation: {
		enabled: false,
		testFramework: "auto",
		testPattern: ["**/*.test.{js,ts}", "**/*.spec.{js,ts}"],
		timeout: 6e4,
		failOnError: true,
		environment: {
			tempDir: ".validation-temp",
			keepTempFiles: false,
			env: {},
			packageManager: "auto",
			installDependencies: true,
			installTimeout: 3e5
		},
		reporting: {
			format: "console",
			outputPath: "validation-report",
			verbose: false,
			logLevel: "info",
			includePerformance: true,
			includeCoverage: false
		},
		hooks: {},
		scope: {
			formats: ["esm", "cjs"],
			fileTypes: [
				"js",
				"ts",
				"dts"
			],
			exclude: ["**/*.d.ts", "**/node_modules/**"],
			include: ["**/*"],
			validateTypes: true,
			validateStyles: false,
			validateSourceMaps: false
		}
	},
	env: {
		development: {
			mode: "development",
			minify: false,
			output: { sourcemap: "inline" },
			debug: true
		},
		production: {
			mode: "production",
			minify: true,
			output: { sourcemap: true },
			debug: false
		}
	},
	cache: {
		enabled: true,
		dir: "node_modules/.cache/@ldesign/builder",
		maxAge: 864e5,
		maxSize: 500 * 1024 * 1024
	},
	watch: {
		include: ["src/**/*"],
		exclude: ["node_modules/**/*", "dist/**/*"],
		persistent: true,
		ignoreInitial: true
	},
	define: {},
	cwd: process.cwd(),
	configFile: "ldesign.config.ts",
	logLevel: "info",
	library: {
		bundleless: false,
		preserveModules: false,
		generateTypes: true,
		minify: true,
		sourcemap: true,
		external: [],
		globals: {},
		formats: ["esm", "cjs"],
		splitting: false
	}
};
/**
* 预设配置
*/
const PRESET_CONFIGS = {
	typescript: {
		libraryType: LibraryType.TYPESCRIPT,
		typescript: {
			declaration: true,
			isolatedDeclarations: true
		},
		output: { format: ["esm", "cjs"] },
		library: {
			generateTypes: true,
			formats: ["esm", "cjs"]
		}
	},
	vue3: {
		libraryType: LibraryType.VUE3,
		vue: {
			version: 3,
			onDemand: true
		},
		external: ["vue"],
		globals: { vue: "Vue" },
		library: { formats: [
			"esm",
			"cjs",
			"umd"
		] }
	},
	vue2: {
		libraryType: LibraryType.VUE2,
		vue: {
			version: 2,
			onDemand: true
		},
		external: ["vue"],
		globals: { vue: "Vue" },
		library: { formats: [
			"esm",
			"cjs",
			"umd"
		] }
	},
	style: {
		libraryType: LibraryType.STYLE,
		style: {
			extract: true,
			minimize: true
		},
		output: { format: ["esm"] },
		library: { formats: ["esm"] }
	},
	mixed: {
		libraryType: LibraryType.MIXED,
		typescript: { declaration: true },
		style: { extract: true },
		output: { format: ["esm", "cjs"] },
		library: { formats: ["esm", "cjs"] }
	}
};
/**
* 支持的配置文件名称
*/
const CONFIG_FILE_NAMES = [
	"ldesign.config.ts",
	"ldesign.config.js",
	"ldesign.config.mjs",
	"ldesign.config.json",
	"builder.config.ts",
	"builder.config.js",
	"builder.config.mjs",
	"builder.config.json",
	".builderrc.ts",
	".builderrc.js",
	".builderrc.json"
];
/**
* 默认外部依赖
*/
const DEFAULT_EXTERNAL_DEPS = [
	"fs",
	"path",
	"url",
	"util",
	"events",
	"stream",
	"crypto",
	"os",
	"http",
	"https",
	"react",
	"react-dom",
	"vue",
	"@vue/runtime-core",
	"@vue/runtime-dom",
	"angular",
	"@angular/core",
	"@angular/common",
	"lodash",
	"moment",
	"dayjs",
	"axios"
];
/**
* 默认全局变量映射
*/
const DEFAULT_GLOBALS = {
	"react": "React",
	"react-dom": "ReactDOM",
	"vue": "Vue",
	"lodash": "_",
	"moment": "moment",
	"dayjs": "dayjs",
	"axios": "axios"
};
/**
* 默认文件名模式
*/
const DEFAULT_FILE_PATTERNS = {
	entry: "[name].[format].js",
	chunk: "[name]-[hash].js",
	asset: "[name]-[hash][extname]",
	types: "[name].d.ts"
};
/**
* 默认缓存配置
*/
const DEFAULT_CACHE_CONFIG = {
	enabled: true,
	dir: "node_modules/.cache/@ldesign/builder",
	ttl: 1440 * 60 * 1e3,
	maxSize: 500 * 1024 * 1024,
	compress: true,
	version: "1.0.0"
};
/**
* 默认性能配置
*/
const DEFAULT_PERFORMANCE_CONFIG = {
	bundleAnalyzer: false,
	sizeLimit: void 0,
	treeshaking: true,
	cache: true,
	parallel: true,
	memoryLimit: "2GB",
	timeout: 3e5,
	monitoring: false
};
/**
* 默认监听配置
*/
const DEFAULT_WATCH_CONFIG = {
	include: ["src/**/*"],
	exclude: [
		"node_modules/**/*",
		"dist/**/*",
		"**/*.test.*",
		"**/*.spec.*"
	],
	persistent: true,
	ignoreInitial: true,
	followSymlinks: true,
	usePolling: false,
	interval: 100,
	binaryInterval: 300,
	alwaysStat: false,
	depth: 99,
	awaitWriteFinish: {
		stabilityThreshold: 2e3,
		pollInterval: 100
	}
};

//#endregion
//#region src/utils/file-system.ts
var file_system_exports = {};
__export(file_system_exports, {
	FileSystem: () => FileSystem,
	copyFile: () => copyFile,
	createTempDir: () => createTempDir,
	createTempFile: () => createTempFile,
	emptyDir: () => emptyDir,
	ensureDir: () => ensureDir,
	exists: () => exists,
	existsSync: () => existsSync,
	findDirs: () => findDirs,
	findFiles: () => findFiles,
	getDirSize: () => getDirSize,
	getFileSize: () => getFileSize,
	getModifiedTime: () => getModifiedTime,
	isDirectory: () => isDirectory,
	isFile: () => isFile,
	isNewer: () => isNewer,
	readDir: () => readDir,
	readDirRecursive: () => readDirRecursive,
	readFile: () => readFile,
	removeDir: () => removeDir,
	removeFile: () => removeFile,
	stat: () => stat,
	writeFile: () => writeFile
});
var FileSystem, exists, existsSync, readFile, writeFile, copyFile, removeFile, ensureDir, removeDir, emptyDir, stat, readDir, readDirRecursive, findDirs, getFileSize, getDirSize, isFile, isDirectory, getModifiedTime, isNewer, createTempFile, createTempDir, findFiles;
var init_file_system = __esm({ "src/utils/file-system.ts": (() => {
	FileSystem = class {
		/**
		* 检查文件或目录是否存在
		*/
		static async exists(filePath) {
			try {
				await promises.access(filePath);
				return true;
			} catch {
				return false;
			}
		}
		/**
		* 同步检查文件或目录是否存在
		*/
		static existsSync(filePath) {
			try {
				__require("fs").accessSync(filePath);
				return true;
			} catch {
				return false;
			}
		}
		/**
		* 读取文件内容
		*/
		static async readFile(filePath, encoding = "utf8") {
			return promises.readFile(filePath, encoding);
		}
		/**
		* 写入文件内容
		*/
		static async writeFile(filePath, content, encoding = "utf8") {
			await this.ensureDir(path.dirname(filePath));
			return promises.writeFile(filePath, content, encoding);
		}
		/**
		* 复制文件
		*/
		static async copyFile(src, dest) {
			await this.ensureDir(path.dirname(dest));
			return promises.copyFile(src, dest);
		}
		/**
		* 删除文件
		*/
		static async removeFile(filePath) {
			if (await this.exists(filePath)) return promises.unlink(filePath);
		}
		/**
		* 创建目录
		*/
		static async ensureDir(dirPath) {
			try {
				await promises.mkdir(dirPath, { recursive: true });
			} catch (error) {
				if (error.code !== "EEXIST") throw error;
			}
		}
		/**
		* 删除目录
		*/
		static async removeDir(dirPath) {
			if (await this.exists(dirPath)) return promises.rmdir(dirPath, { recursive: true });
		}
		/**
		* 清空目录
		*/
		static async emptyDir(dirPath) {
			if (await this.exists(dirPath)) {
				const files = await promises.readdir(dirPath);
				await Promise.all(files.map(async (file) => {
					const filePath = path.join(dirPath, file);
					const stat$5 = await promises.stat(filePath);
					if (stat$5.isDirectory()) await this.removeDir(filePath);
					else await this.removeFile(filePath);
				}));
			}
		}
		/**
		* 获取文件统计信息
		*/
		static async stat(filePath) {
			const stats = await promises.stat(filePath);
			const ext = path.extname(filePath);
			return {
				path: filePath,
				size: stats.size,
				type: stats.isDirectory() ? "directory" : this.getFileType(ext)
			};
		}
		/**
		* 读取目录内容
		*/
		static async readDir(dirPath) {
			return promises.readdir(dirPath);
		}
		/**
		* 递归读取目录内容
		*/
		static async readDirRecursive(dirPath) {
			const files = [];
			const traverse = async (currentPath) => {
				const items = await promises.readdir(currentPath);
				for (const item of items) {
					const itemPath = path.join(currentPath, item);
					const stat$5 = await promises.stat(itemPath);
					if (stat$5.isDirectory()) await traverse(itemPath);
					else files.push(itemPath);
				}
			};
			await traverse(dirPath);
			return files;
		}
		/**
		* 使用 glob 模式查找文件
		*/
		static async glob(pattern, options = {}) {
			return fastGlob(pattern, {
				cwd: options.cwd || process.cwd(),
				ignore: options.ignore || [],
				absolute: options.absolute ?? true,
				onlyFiles: options.onlyFiles ?? true,
				onlyDirectories: options.onlyDirectories ?? false
			});
		}
		/**
		* 查找文件
		*/
		static async findFiles(patterns, options = {}) {
			return this.glob(patterns, {
				cwd: options.cwd,
				ignore: options.ignore,
				onlyFiles: true
			});
		}
		/**
		* 查找目录
		*/
		static async findDirs(patterns, options = {}) {
			return this.glob(patterns, {
				cwd: options.cwd,
				ignore: options.ignore,
				onlyDirectories: true
			});
		}
		/**
		* 获取文件大小
		*/
		static async getFileSize(filePath) {
			const stats = await promises.stat(filePath);
			return stats.size;
		}
		/**
		* 获取目录大小
		*/
		static async getDirSize(dirPath) {
			let totalSize = 0;
			const traverse = async (currentPath) => {
				const items = await promises.readdir(currentPath);
				for (const item of items) {
					const itemPath = path.join(currentPath, item);
					const stat$5 = await promises.stat(itemPath);
					if (stat$5.isDirectory()) await traverse(itemPath);
					else totalSize += stat$5.size;
				}
			};
			await traverse(dirPath);
			return totalSize;
		}
		/**
		* 检查路径是否为文件
		*/
		static async isFile(filePath) {
			try {
				const stats = await promises.stat(filePath);
				return stats.isFile();
			} catch {
				return false;
			}
		}
		/**
		* 检查路径是否为目录
		*/
		static async isDirectory(dirPath) {
			try {
				const stats = await promises.stat(dirPath);
				return stats.isDirectory();
			} catch {
				return false;
			}
		}
		/**
		* 获取文件的修改时间
		*/
		static async getModifiedTime(filePath) {
			const stats = await promises.stat(filePath);
			return stats.mtime;
		}
		/**
		* 比较文件修改时间
		*/
		static async isNewer(file1, file2) {
			if (!await this.exists(file1)) return false;
			if (!await this.exists(file2)) return true;
			const time1 = await this.getModifiedTime(file1);
			const time2 = await this.getModifiedTime(file2);
			return time1 > time2;
		}
		/**
		* 创建临时文件
		*/
		static async createTempFile(prefix = "temp", suffix = ".tmp") {
			const tempDir = __require("os").tmpdir();
			const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}${suffix}`;
			return path.join(tempDir, fileName);
		}
		/**
		* 创建临时目录
		*/
		static async createTempDir(prefix = "temp") {
			const tempDir = __require("os").tmpdir();
			const dirName = `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
			const tempDirPath = path.join(tempDir, dirName);
			await this.ensureDir(tempDirPath);
			return tempDirPath;
		}
		/**
		* 获取文件类型
		*/
		static getFileType(extension) {
			const typeMap = {
				".js": "javascript",
				".ts": "typescript",
				".jsx": "jsx",
				".tsx": "tsx",
				".vue": "vue",
				".css": "css",
				".less": "less",
				".scss": "scss",
				".sass": "sass",
				".json": "json",
				".md": "markdown",
				".html": "html",
				".xml": "xml",
				".svg": "svg",
				".png": "image",
				".jpg": "image",
				".jpeg": "image",
				".gif": "image",
				".webp": "image"
			};
			return typeMap[extension.toLowerCase()] || "unknown";
		}
	};
	({exists, existsSync, readFile, writeFile, copyFile, removeFile, ensureDir, removeDir, emptyDir, stat, readDir, readDirRecursive, findDirs, getFileSize, getDirSize, isFile, isDirectory, getModifiedTime, isNewer, createTempFile, createTempDir} = FileSystem);
	findFiles = FileSystem.findFiles.bind(FileSystem);
}) });

//#endregion
//#region src/constants/errors.ts
init_file_system();
/**
* 错误码和错误信息常量
*/
/**
* 错误码枚举
*/
let ErrorCode = /* @__PURE__ */ function(ErrorCode$1) {
	ErrorCode$1["CONFIG_NOT_FOUND"] = "E1001";
	ErrorCode$1["CONFIG_PARSE_ERROR"] = "E1002";
	ErrorCode$1["CONFIG_VALIDATION_ERROR"] = "E1003";
	ErrorCode$1["CONFIG_MERGE_ERROR"] = "E1004";
	ErrorCode$1["CONFIG_TRANSFORM_ERROR"] = "E1005";
	ErrorCode$1["BUILD_FAILED"] = "E2001";
	ErrorCode$1["BUILD_TIMEOUT"] = "E2002";
	ErrorCode$1["BUILD_CANCELLED"] = "E2003";
	ErrorCode$1["BUILD_OUT_OF_MEMORY"] = "E2004";
	ErrorCode$1["BUILD_DEPENDENCY_ERROR"] = "E2005";
	ErrorCode$1["ADAPTER_NOT_FOUND"] = "E3001";
	ErrorCode$1["ADAPTER_INIT_ERROR"] = "E3002";
	ErrorCode$1["ADAPTER_NOT_AVAILABLE"] = "E3003";
	ErrorCode$1["ADAPTER_VERSION_MISMATCH"] = "E3004";
	ErrorCode$1["ADAPTER_CONFIG_ERROR"] = "E3005";
	ErrorCode$1["PLUGIN_NOT_FOUND"] = "E4001";
	ErrorCode$1["PLUGIN_LOAD_ERROR"] = "E4002";
	ErrorCode$1["PLUGIN_INIT_ERROR"] = "E4003";
	ErrorCode$1["PLUGIN_EXECUTION_ERROR"] = "E4004";
	ErrorCode$1["PLUGIN_DEPENDENCY_ERROR"] = "E4005";
	ErrorCode$1["FILE_NOT_FOUND"] = "E5001";
	ErrorCode$1["FILE_READ_ERROR"] = "E5002";
	ErrorCode$1["FILE_WRITE_ERROR"] = "E5003";
	ErrorCode$1["DIRECTORY_NOT_FOUND"] = "E5004";
	ErrorCode$1["PERMISSION_DENIED"] = "E5005";
	ErrorCode$1["DEPENDENCY_NOT_FOUND"] = "E6001";
	ErrorCode$1["DEPENDENCY_VERSION_CONFLICT"] = "E6002";
	ErrorCode$1["DEPENDENCY_INSTALL_ERROR"] = "E6003";
	ErrorCode$1["DEPENDENCY_RESOLUTION_ERROR"] = "E6004";
	ErrorCode$1["NETWORK_ERROR"] = "E7001";
	ErrorCode$1["DOWNLOAD_ERROR"] = "E7002";
	ErrorCode$1["UPLOAD_ERROR"] = "E7003";
	ErrorCode$1["TIMEOUT_ERROR"] = "E7004";
	ErrorCode$1["SYSTEM_ERROR"] = "E8001";
	ErrorCode$1["PLATFORM_NOT_SUPPORTED"] = "E8002";
	ErrorCode$1["NODE_VERSION_MISMATCH"] = "E8003";
	ErrorCode$1["INSUFFICIENT_RESOURCES"] = "E8004";
	ErrorCode$1["INVALID_INPUT"] = "E9001";
	ErrorCode$1["INVALID_OPTION"] = "E9002";
	ErrorCode$1["INVALID_PATH"] = "E9003";
	ErrorCode$1["INVALID_FORMAT"] = "E9004";
	ErrorCode$1["MISSING_REQUIRED_OPTION"] = "E9005";
	return ErrorCode$1;
}({});
/**
* 错误信息映射
*/
const ERROR_MESSAGES = {
	[ErrorCode.CONFIG_NOT_FOUND]: "配置文件未找到",
	[ErrorCode.CONFIG_PARSE_ERROR]: "配置文件解析失败",
	[ErrorCode.CONFIG_VALIDATION_ERROR]: "配置验证失败",
	[ErrorCode.CONFIG_MERGE_ERROR]: "配置合并失败",
	[ErrorCode.CONFIG_TRANSFORM_ERROR]: "配置转换失败",
	[ErrorCode.BUILD_FAILED]: "构建失败",
	[ErrorCode.BUILD_TIMEOUT]: "构建超时",
	[ErrorCode.BUILD_CANCELLED]: "构建被取消",
	[ErrorCode.BUILD_OUT_OF_MEMORY]: "构建内存不足",
	[ErrorCode.BUILD_DEPENDENCY_ERROR]: "构建依赖错误",
	[ErrorCode.ADAPTER_NOT_FOUND]: "适配器未找到",
	[ErrorCode.ADAPTER_INIT_ERROR]: "适配器初始化失败",
	[ErrorCode.ADAPTER_NOT_AVAILABLE]: "适配器不可用",
	[ErrorCode.ADAPTER_VERSION_MISMATCH]: "适配器版本不匹配",
	[ErrorCode.ADAPTER_CONFIG_ERROR]: "适配器配置错误",
	[ErrorCode.PLUGIN_NOT_FOUND]: "插件未找到",
	[ErrorCode.PLUGIN_LOAD_ERROR]: "插件加载失败",
	[ErrorCode.PLUGIN_INIT_ERROR]: "插件初始化失败",
	[ErrorCode.PLUGIN_EXECUTION_ERROR]: "插件执行失败",
	[ErrorCode.PLUGIN_DEPENDENCY_ERROR]: "插件依赖错误",
	[ErrorCode.FILE_NOT_FOUND]: "文件未找到",
	[ErrorCode.FILE_READ_ERROR]: "文件读取失败",
	[ErrorCode.FILE_WRITE_ERROR]: "文件写入失败",
	[ErrorCode.DIRECTORY_NOT_FOUND]: "目录未找到",
	[ErrorCode.PERMISSION_DENIED]: "权限不足",
	[ErrorCode.DEPENDENCY_NOT_FOUND]: "依赖未找到",
	[ErrorCode.DEPENDENCY_VERSION_CONFLICT]: "依赖版本冲突",
	[ErrorCode.DEPENDENCY_INSTALL_ERROR]: "依赖安装失败",
	[ErrorCode.DEPENDENCY_RESOLUTION_ERROR]: "依赖解析失败",
	[ErrorCode.NETWORK_ERROR]: "网络错误",
	[ErrorCode.DOWNLOAD_ERROR]: "下载失败",
	[ErrorCode.UPLOAD_ERROR]: "上传失败",
	[ErrorCode.TIMEOUT_ERROR]: "网络超时",
	[ErrorCode.SYSTEM_ERROR]: "系统错误",
	[ErrorCode.PLATFORM_NOT_SUPPORTED]: "平台不支持",
	[ErrorCode.NODE_VERSION_MISMATCH]: "Node.js 版本不匹配",
	[ErrorCode.INSUFFICIENT_RESOURCES]: "系统资源不足",
	[ErrorCode.INVALID_INPUT]: "无效输入",
	[ErrorCode.INVALID_OPTION]: "无效选项",
	[ErrorCode.INVALID_PATH]: "无效路径",
	[ErrorCode.INVALID_FORMAT]: "无效格式",
	[ErrorCode.MISSING_REQUIRED_OPTION]: "缺少必需选项"
};
/**
* 错误建议映射
*/
const ERROR_SUGGESTIONS = {
	[ErrorCode.CONFIG_NOT_FOUND]: "请在项目根目录创建 builder.config.ts 配置文件",
	[ErrorCode.CONFIG_PARSE_ERROR]: "请检查配置文件语法是否正确",
	[ErrorCode.CONFIG_VALIDATION_ERROR]: "请检查配置项是否符合要求",
	[ErrorCode.CONFIG_MERGE_ERROR]: "请检查配置合并逻辑",
	[ErrorCode.CONFIG_TRANSFORM_ERROR]: "请检查配置转换规则",
	[ErrorCode.BUILD_FAILED]: "请检查构建日志获取详细错误信息",
	[ErrorCode.BUILD_TIMEOUT]: "请增加构建超时时间或优化构建配置",
	[ErrorCode.BUILD_CANCELLED]: "构建被用户或系统取消",
	[ErrorCode.BUILD_OUT_OF_MEMORY]: "请增加系统内存或优化构建配置",
	[ErrorCode.BUILD_DEPENDENCY_ERROR]: "请检查项目依赖是否正确安装",
	[ErrorCode.ADAPTER_NOT_FOUND]: "请安装对应的打包器依赖",
	[ErrorCode.ADAPTER_INIT_ERROR]: "请检查打包器是否正确安装",
	[ErrorCode.ADAPTER_NOT_AVAILABLE]: "请确保打包器依赖已正确安装",
	[ErrorCode.ADAPTER_VERSION_MISMATCH]: "请升级或降级打包器版本",
	[ErrorCode.ADAPTER_CONFIG_ERROR]: "请检查适配器配置是否正确",
	[ErrorCode.PLUGIN_NOT_FOUND]: "请安装对应的插件依赖",
	[ErrorCode.PLUGIN_LOAD_ERROR]: "请检查插件是否正确安装",
	[ErrorCode.PLUGIN_INIT_ERROR]: "请检查插件配置是否正确",
	[ErrorCode.PLUGIN_EXECUTION_ERROR]: "请检查插件执行环境",
	[ErrorCode.PLUGIN_DEPENDENCY_ERROR]: "请检查插件依赖是否满足",
	[ErrorCode.FILE_NOT_FOUND]: "请检查文件路径是否正确",
	[ErrorCode.FILE_READ_ERROR]: "请检查文件权限和文件完整性",
	[ErrorCode.FILE_WRITE_ERROR]: "请检查目录权限和磁盘空间",
	[ErrorCode.DIRECTORY_NOT_FOUND]: "请检查目录路径是否正确",
	[ErrorCode.PERMISSION_DENIED]: "请检查文件或目录权限",
	[ErrorCode.DEPENDENCY_NOT_FOUND]: "请运行 npm install 安装依赖",
	[ErrorCode.DEPENDENCY_VERSION_CONFLICT]: "请解决依赖版本冲突",
	[ErrorCode.DEPENDENCY_INSTALL_ERROR]: "请检查网络连接和包管理器配置",
	[ErrorCode.DEPENDENCY_RESOLUTION_ERROR]: "请检查依赖解析配置",
	[ErrorCode.NETWORK_ERROR]: "请检查网络连接",
	[ErrorCode.DOWNLOAD_ERROR]: "请检查网络连接和下载地址",
	[ErrorCode.UPLOAD_ERROR]: "请检查网络连接和上传权限",
	[ErrorCode.TIMEOUT_ERROR]: "请检查网络连接或增加超时时间",
	[ErrorCode.SYSTEM_ERROR]: "请检查系统环境和权限",
	[ErrorCode.PLATFORM_NOT_SUPPORTED]: "请使用支持的操作系统",
	[ErrorCode.NODE_VERSION_MISMATCH]: "请升级 Node.js 到支持的版本",
	[ErrorCode.INSUFFICIENT_RESOURCES]: "请释放系统资源或增加硬件配置",
	[ErrorCode.INVALID_INPUT]: "请检查输入参数格式",
	[ErrorCode.INVALID_OPTION]: "请使用有效的选项参数",
	[ErrorCode.INVALID_PATH]: "请使用有效的文件或目录路径",
	[ErrorCode.INVALID_FORMAT]: "请使用正确的格式",
	[ErrorCode.MISSING_REQUIRED_OPTION]: "请提供必需的选项参数"
};
/**
* 错误分类
*/
const ERROR_CATEGORIES = {
	CONFIGURATION: [
		ErrorCode.CONFIG_NOT_FOUND,
		ErrorCode.CONFIG_PARSE_ERROR,
		ErrorCode.CONFIG_VALIDATION_ERROR,
		ErrorCode.CONFIG_MERGE_ERROR,
		ErrorCode.CONFIG_TRANSFORM_ERROR
	],
	BUILD: [
		ErrorCode.BUILD_FAILED,
		ErrorCode.BUILD_TIMEOUT,
		ErrorCode.BUILD_CANCELLED,
		ErrorCode.BUILD_OUT_OF_MEMORY,
		ErrorCode.BUILD_DEPENDENCY_ERROR
	],
	ADAPTER: [
		ErrorCode.ADAPTER_NOT_FOUND,
		ErrorCode.ADAPTER_INIT_ERROR,
		ErrorCode.ADAPTER_NOT_AVAILABLE,
		ErrorCode.ADAPTER_VERSION_MISMATCH,
		ErrorCode.ADAPTER_CONFIG_ERROR
	],
	PLUGIN: [
		ErrorCode.PLUGIN_NOT_FOUND,
		ErrorCode.PLUGIN_LOAD_ERROR,
		ErrorCode.PLUGIN_INIT_ERROR,
		ErrorCode.PLUGIN_EXECUTION_ERROR,
		ErrorCode.PLUGIN_DEPENDENCY_ERROR
	],
	FILESYSTEM: [
		ErrorCode.FILE_NOT_FOUND,
		ErrorCode.FILE_READ_ERROR,
		ErrorCode.FILE_WRITE_ERROR,
		ErrorCode.DIRECTORY_NOT_FOUND,
		ErrorCode.PERMISSION_DENIED
	],
	DEPENDENCY: [
		ErrorCode.DEPENDENCY_NOT_FOUND,
		ErrorCode.DEPENDENCY_VERSION_CONFLICT,
		ErrorCode.DEPENDENCY_INSTALL_ERROR,
		ErrorCode.DEPENDENCY_RESOLUTION_ERROR
	],
	NETWORK: [
		ErrorCode.NETWORK_ERROR,
		ErrorCode.DOWNLOAD_ERROR,
		ErrorCode.UPLOAD_ERROR,
		ErrorCode.TIMEOUT_ERROR
	],
	SYSTEM: [
		ErrorCode.SYSTEM_ERROR,
		ErrorCode.PLATFORM_NOT_SUPPORTED,
		ErrorCode.NODE_VERSION_MISMATCH,
		ErrorCode.INSUFFICIENT_RESOURCES
	],
	USER_INPUT: [
		ErrorCode.INVALID_INPUT,
		ErrorCode.INVALID_OPTION,
		ErrorCode.INVALID_PATH,
		ErrorCode.INVALID_FORMAT,
		ErrorCode.MISSING_REQUIRED_OPTION
	]
};
/**
* 错误严重程度
*/
const ERROR_SEVERITY = {
	[ErrorCode.CONFIG_NOT_FOUND]: "high",
	[ErrorCode.CONFIG_PARSE_ERROR]: "high",
	[ErrorCode.CONFIG_VALIDATION_ERROR]: "medium",
	[ErrorCode.BUILD_FAILED]: "high",
	[ErrorCode.BUILD_TIMEOUT]: "medium",
	[ErrorCode.ADAPTER_NOT_FOUND]: "high",
	[ErrorCode.PLUGIN_NOT_FOUND]: "medium",
	[ErrorCode.FILE_NOT_FOUND]: "medium",
	[ErrorCode.DEPENDENCY_NOT_FOUND]: "high",
	[ErrorCode.NETWORK_ERROR]: "low",
	[ErrorCode.SYSTEM_ERROR]: "high",
	[ErrorCode.INVALID_INPUT]: "low"
};

//#endregion
//#region src/utils/error-handler.ts
/**
* 构建器错误类
*/
var BuilderError = class BuilderError extends Error {
	code;
	suggestion;
	details;
	phase;
	file;
	cause;
	constructor(code, message, options = {}) {
		const errorMessage = message || ERROR_MESSAGES[code] || "未知错误";
		super(errorMessage);
		this.name = "BuilderError";
		this.code = code;
		this.suggestion = options.suggestion || ERROR_SUGGESTIONS[code];
		this.details = options.details;
		this.phase = options.phase;
		this.file = options.file;
		if (options.cause) this.cause = options.cause;
		if (Error.captureStackTrace) Error.captureStackTrace(this, BuilderError);
	}
	/**
	* 获取完整的错误信息
	*/
	getFullMessage() {
		let message = `[${this.code}] ${this.message}`;
		if (this.phase) message += ` (阶段: ${this.phase})`;
		if (this.file) message += ` (文件: ${this.file})`;
		if (this.suggestion) message += `\n建议: ${this.suggestion}`;
		return message;
	}
	/**
	* 转换为 JSON 格式
	*/
	toJSON() {
		return {
			name: this.name,
			code: this.code,
			message: this.message,
			suggestion: this.suggestion,
			details: this.details,
			phase: this.phase,
			file: this.file,
			stack: this.stack
		};
	}
};
/**
* 错误处理器类
*/
var ErrorHandler = class {
	logger;
	showStack;
	showSuggestions;
	onError;
	exitOnError;
	exitCode;
	constructor(options = {}) {
		this.logger = options.logger;
		this.showStack = options.showStack ?? false;
		this.showSuggestions = options.showSuggestions ?? true;
		this.onError = options.onError;
		this.exitOnError = options.exitOnError ?? false;
		this.exitCode = options.exitCode ?? 1;
	}
	/**
	* 处理错误
	*/
	handle(error, context) {
		if (this.onError) try {
			this.onError(error);
		} catch (callbackError) {
			this.logger?.error("错误回调执行失败:", callbackError);
		}
		this.logError(error, context);
		if (this.exitOnError) process.exit(this.exitCode);
	}
	/**
	* 处理异步错误
	*/
	async handleAsync(error, context) {
		return new Promise((resolve$1) => {
			this.handle(error, context);
			resolve$1();
		});
	}
	/**
	* 包装函数以处理错误
	*/
	wrap(fn, context) {
		return ((...args) => {
			try {
				const result = fn(...args);
				if (result && typeof result.catch === "function") return result.catch((error) => {
					this.handle(error, context);
					throw error;
				});
				return result;
			} catch (error) {
				this.handle(error, context);
				throw error;
			}
		});
	}
	/**
	* 包装异步函数以处理错误
	*/
	wrapAsync(fn, context) {
		return (async (...args) => {
			try {
				return await fn(...args);
			} catch (error) {
				await this.handleAsync(error, context);
				throw error;
			}
		});
	}
	/**
	* 创建构建器错误
	*/
	createError(code, message, options) {
		return new BuilderError(code, message, options);
	}
	/**
	* 抛出构建器错误
	*/
	throwError(code, message, options) {
		throw this.createError(code, message, options);
	}
	/**
	* 记录错误日志
	*/
	logError(error, context) {
		if (!this.logger) {
			console.error(error);
			return;
		}
		let message = error.message;
		if (context) message = `${context}: ${message}`;
		this.logger.error(message);
		if (error instanceof BuilderError) {
			if (error.phase) this.logger.error(`阶段: ${error.phase}`);
			if (error.file) this.logger.error(`文件: ${error.file}`);
			if (error.details) this.logger.debug("错误详情:", error.details);
			if (this.showSuggestions && error.suggestion) this.logger.info(`建议: ${error.suggestion}`);
		}
		if (this.showStack && error.stack) {
			this.logger.debug("堆栈跟踪:");
			this.logger.debug(error.stack);
		}
		if (error.cause) {
			this.logger.debug("原因:");
			this.logError(error.cause);
		}
	}
};
/**
* 默认错误处理器实例
*/
const errorHandler = new ErrorHandler();
/**
* 创建错误处理器
*/
function createErrorHandler(options = {}) {
	return new ErrorHandler(options);
}
/**
* 处理未捕获的异常
*/
function setupGlobalErrorHandling(handler = errorHandler) {
	process.on("uncaughtException", (error) => {
		handler.handle(error, "未捕获的异常");
		process.exit(1);
	});
	process.on("unhandledRejection", (reason, _promise) => {
		const error = reason instanceof Error ? reason : new Error(String(reason));
		handler.handle(error, "未处理的 Promise 拒绝");
	});
	process.on("warning", (warning) => {
		if (handler["logger"]) handler["logger"].warn(`Node.js 警告: ${warning.message}`);
	});
}
/**
* 判断是否为构建器错误
*/
function isBuilderError(error) {
	return error instanceof BuilderError;
}
/**
* 从错误中提取错误码
*/
function getErrorCode(error) {
	if (isBuilderError(error)) return error.code;
	return void 0;
}
/**
* 格式化错误信息
*/
function formatError(error, includeStack = false) {
	if (isBuilderError(error)) return error.getFullMessage();
	let message = error.message;
	if (includeStack && error.stack) message += `\n${error.stack}`;
	return message;
}

//#endregion
//#region ../../node_modules/.pnpm/picomatch@2.3.1/node_modules/picomatch/lib/constants.js
var require_constants$2 = /* @__PURE__ */ __commonJS({ "../../node_modules/.pnpm/picomatch@2.3.1/node_modules/picomatch/lib/constants.js": ((exports, module) => {
	const path$5 = __require("path");
	const WIN_SLASH = "\\\\/";
	const WIN_NO_SLASH = `[^${WIN_SLASH}]`;
	/**
	* Posix glob regex
	*/
	const DOT_LITERAL = "\\.";
	const PLUS_LITERAL = "\\+";
	const QMARK_LITERAL = "\\?";
	const SLASH_LITERAL = "\\/";
	const ONE_CHAR = "(?=.)";
	const QMARK = "[^/]";
	const END_ANCHOR = `(?:${SLASH_LITERAL}|$)`;
	const START_ANCHOR = `(?:^|${SLASH_LITERAL})`;
	const DOTS_SLASH = `${DOT_LITERAL}{1,2}${END_ANCHOR}`;
	const NO_DOT = `(?!${DOT_LITERAL})`;
	const NO_DOTS = `(?!${START_ANCHOR}${DOTS_SLASH})`;
	const NO_DOT_SLASH = `(?!${DOT_LITERAL}{0,1}${END_ANCHOR})`;
	const NO_DOTS_SLASH = `(?!${DOTS_SLASH})`;
	const QMARK_NO_DOT = `[^.${SLASH_LITERAL}]`;
	const STAR$1 = `${QMARK}*?`;
	const POSIX_CHARS = {
		DOT_LITERAL,
		PLUS_LITERAL,
		QMARK_LITERAL,
		SLASH_LITERAL,
		ONE_CHAR,
		QMARK,
		END_ANCHOR,
		DOTS_SLASH,
		NO_DOT,
		NO_DOTS,
		NO_DOT_SLASH,
		NO_DOTS_SLASH,
		QMARK_NO_DOT,
		STAR: STAR$1,
		START_ANCHOR
	};
	/**
	* Windows glob regex
	*/
	const WINDOWS_CHARS = {
		...POSIX_CHARS,
		SLASH_LITERAL: `[${WIN_SLASH}]`,
		QMARK: WIN_NO_SLASH,
		STAR: `${WIN_NO_SLASH}*?`,
		DOTS_SLASH: `${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$)`,
		NO_DOT: `(?!${DOT_LITERAL})`,
		NO_DOTS: `(?!(?:^|[${WIN_SLASH}])${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
		NO_DOT_SLASH: `(?!${DOT_LITERAL}{0,1}(?:[${WIN_SLASH}]|$))`,
		NO_DOTS_SLASH: `(?!${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
		QMARK_NO_DOT: `[^.${WIN_SLASH}]`,
		START_ANCHOR: `(?:^|[${WIN_SLASH}])`,
		END_ANCHOR: `(?:[${WIN_SLASH}]|$)`
	};
	/**
	* POSIX Bracket Regex
	*/
	const POSIX_REGEX_SOURCE$1 = {
		alnum: "a-zA-Z0-9",
		alpha: "a-zA-Z",
		ascii: "\\x00-\\x7F",
		blank: " \\t",
		cntrl: "\\x00-\\x1F\\x7F",
		digit: "0-9",
		graph: "\\x21-\\x7E",
		lower: "a-z",
		print: "\\x20-\\x7E ",
		punct: "\\-!\"#$%&'()\\*+,./:;<=>?@[\\]^_`{|}~",
		space: " \\t\\r\\n\\v\\f",
		upper: "A-Z",
		word: "A-Za-z0-9_",
		xdigit: "A-Fa-f0-9"
	};
	module.exports = {
		MAX_LENGTH: 1024 * 64,
		POSIX_REGEX_SOURCE: POSIX_REGEX_SOURCE$1,
		REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
		REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
		REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
		REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
		REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
		REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,
		REPLACEMENTS: {
			"***": "*",
			"**/**": "**",
			"**/**/**": "**"
		},
		CHAR_0: 48,
		CHAR_9: 57,
		CHAR_UPPERCASE_A: 65,
		CHAR_LOWERCASE_A: 97,
		CHAR_UPPERCASE_Z: 90,
		CHAR_LOWERCASE_Z: 122,
		CHAR_LEFT_PARENTHESES: 40,
		CHAR_RIGHT_PARENTHESES: 41,
		CHAR_ASTERISK: 42,
		CHAR_AMPERSAND: 38,
		CHAR_AT: 64,
		CHAR_BACKWARD_SLASH: 92,
		CHAR_CARRIAGE_RETURN: 13,
		CHAR_CIRCUMFLEX_ACCENT: 94,
		CHAR_COLON: 58,
		CHAR_COMMA: 44,
		CHAR_DOT: 46,
		CHAR_DOUBLE_QUOTE: 34,
		CHAR_EQUAL: 61,
		CHAR_EXCLAMATION_MARK: 33,
		CHAR_FORM_FEED: 12,
		CHAR_FORWARD_SLASH: 47,
		CHAR_GRAVE_ACCENT: 96,
		CHAR_HASH: 35,
		CHAR_HYPHEN_MINUS: 45,
		CHAR_LEFT_ANGLE_BRACKET: 60,
		CHAR_LEFT_CURLY_BRACE: 123,
		CHAR_LEFT_SQUARE_BRACKET: 91,
		CHAR_LINE_FEED: 10,
		CHAR_NO_BREAK_SPACE: 160,
		CHAR_PERCENT: 37,
		CHAR_PLUS: 43,
		CHAR_QUESTION_MARK: 63,
		CHAR_RIGHT_ANGLE_BRACKET: 62,
		CHAR_RIGHT_CURLY_BRACE: 125,
		CHAR_RIGHT_SQUARE_BRACKET: 93,
		CHAR_SEMICOLON: 59,
		CHAR_SINGLE_QUOTE: 39,
		CHAR_SPACE: 32,
		CHAR_TAB: 9,
		CHAR_UNDERSCORE: 95,
		CHAR_VERTICAL_LINE: 124,
		CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279,
		SEP: path$5.sep,
		extglobChars(chars$1) {
			return {
				"!": {
					type: "negate",
					open: "(?:(?!(?:",
					close: `))${chars$1.STAR})`
				},
				"?": {
					type: "qmark",
					open: "(?:",
					close: ")?"
				},
				"+": {
					type: "plus",
					open: "(?:",
					close: ")+"
				},
				"*": {
					type: "star",
					open: "(?:",
					close: ")*"
				},
				"@": {
					type: "at",
					open: "(?:",
					close: ")"
				}
			};
		},
		globChars(win32$1) {
			return win32$1 === true ? WINDOWS_CHARS : POSIX_CHARS;
		}
	};
}) });

//#endregion
//#region ../../node_modules/.pnpm/picomatch@2.3.1/node_modules/picomatch/lib/utils.js
var require_utils$1 = /* @__PURE__ */ __commonJS({ "../../node_modules/.pnpm/picomatch@2.3.1/node_modules/picomatch/lib/utils.js": ((exports) => {
	const path$4 = __require("path");
	const win32 = process.platform === "win32";
	const { REGEX_BACKSLASH, REGEX_REMOVE_BACKSLASH, REGEX_SPECIAL_CHARS, REGEX_SPECIAL_CHARS_GLOBAL } = require_constants$2();
	exports.isObject = (val) => val !== null && typeof val === "object" && !Array.isArray(val);
	exports.hasRegexChars = (str) => REGEX_SPECIAL_CHARS.test(str);
	exports.isRegexChar = (str) => str.length === 1 && exports.hasRegexChars(str);
	exports.escapeRegex = (str) => str.replace(REGEX_SPECIAL_CHARS_GLOBAL, "\\$1");
	exports.toPosixSlashes = (str) => str.replace(REGEX_BACKSLASH, "/");
	exports.removeBackslashes = (str) => {
		return str.replace(REGEX_REMOVE_BACKSLASH, (match) => {
			return match === "\\" ? "" : match;
		});
	};
	exports.supportsLookbehinds = () => {
		const segs = process.version.slice(1).split(".").map(Number);
		if (segs.length === 3 && segs[0] >= 9 || segs[0] === 8 && segs[1] >= 10) return true;
		return false;
	};
	exports.isWindows = (options) => {
		if (options && typeof options.windows === "boolean") return options.windows;
		return win32 === true || path$4.sep === "\\";
	};
	exports.escapeLast = (input, char, lastIdx) => {
		const idx = input.lastIndexOf(char, lastIdx);
		if (idx === -1) return input;
		if (input[idx - 1] === "\\") return exports.escapeLast(input, char, idx - 1);
		return `${input.slice(0, idx)}\\${input.slice(idx)}`;
	};
	exports.removePrefix = (input, state = {}) => {
		let output = input;
		if (output.startsWith("./")) {
			output = output.slice(2);
			state.prefix = "./";
		}
		return output;
	};
	exports.wrapOutput = (input, state = {}, options = {}) => {
		const prepend = options.contains ? "" : "^";
		const append$1 = options.contains ? "" : "$";
		let output = `${prepend}(?:${input})${append$1}`;
		if (state.negated === true) output = `(?:^(?!${output}).*$)`;
		return output;
	};
}) });

//#endregion
//#region ../../node_modules/.pnpm/picomatch@2.3.1/node_modules/picomatch/lib/scan.js
var require_scan = /* @__PURE__ */ __commonJS({ "../../node_modules/.pnpm/picomatch@2.3.1/node_modules/picomatch/lib/scan.js": ((exports, module) => {
	const utils$5 = require_utils$1();
	const { CHAR_ASTERISK, CHAR_AT, CHAR_BACKWARD_SLASH, CHAR_COMMA: CHAR_COMMA$1, CHAR_DOT: CHAR_DOT$1, CHAR_EXCLAMATION_MARK, CHAR_FORWARD_SLASH, CHAR_LEFT_CURLY_BRACE: CHAR_LEFT_CURLY_BRACE$1, CHAR_LEFT_PARENTHESES: CHAR_LEFT_PARENTHESES$1, CHAR_LEFT_SQUARE_BRACKET: CHAR_LEFT_SQUARE_BRACKET$1, CHAR_PLUS, CHAR_QUESTION_MARK, CHAR_RIGHT_CURLY_BRACE: CHAR_RIGHT_CURLY_BRACE$1, CHAR_RIGHT_PARENTHESES: CHAR_RIGHT_PARENTHESES$1, CHAR_RIGHT_SQUARE_BRACKET: CHAR_RIGHT_SQUARE_BRACKET$1 } = require_constants$2();
	const isPathSeparator = (code) => {
		return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
	};
	const depth = (token) => {
		if (token.isPrefix !== true) token.depth = token.isGlobstar ? Infinity : 1;
	};
	/**
	* Quickly scans a glob pattern and returns an object with a handful of
	* useful properties, like `isGlob`, `path` (the leading non-glob, if it exists),
	* `glob` (the actual pattern), `negated` (true if the path starts with `!` but not
	* with `!(`) and `negatedExtglob` (true if the path starts with `!(`).
	*
	* ```js
	* const pm = require('picomatch');
	* console.log(pm.scan('foo/bar/*.js'));
	* { isGlob: true, input: 'foo/bar/*.js', base: 'foo/bar', glob: '*.js' }
	* ```
	* @param {String} `str`
	* @param {Object} `options`
	* @return {Object} Returns an object with tokens and regex source string.
	* @api public
	*/
	const scan$1 = (input, options) => {
		const opts = options || {};
		const length = input.length - 1;
		const scanToEnd = opts.parts === true || opts.scanToEnd === true;
		const slashes = [];
		const tokens = [];
		const parts = [];
		let str = input;
		let index = -1;
		let start = 0;
		let lastIndex = 0;
		let isBrace = false;
		let isBracket = false;
		let isGlob$2 = false;
		let isExtglob$1 = false;
		let isGlobstar = false;
		let braceEscaped = false;
		let backslashes = false;
		let negated = false;
		let negatedExtglob = false;
		let finished = false;
		let braces$2 = 0;
		let prev;
		let code;
		let token = {
			value: "",
			depth: 0,
			isGlob: false
		};
		const eos = () => index >= length;
		const peek = () => str.charCodeAt(index + 1);
		const advance = () => {
			prev = code;
			return str.charCodeAt(++index);
		};
		while (index < length) {
			code = advance();
			let next;
			if (code === CHAR_BACKWARD_SLASH) {
				backslashes = token.backslashes = true;
				code = advance();
				if (code === CHAR_LEFT_CURLY_BRACE$1) braceEscaped = true;
				continue;
			}
			if (braceEscaped === true || code === CHAR_LEFT_CURLY_BRACE$1) {
				braces$2++;
				while (eos() !== true && (code = advance())) {
					if (code === CHAR_BACKWARD_SLASH) {
						backslashes = token.backslashes = true;
						advance();
						continue;
					}
					if (code === CHAR_LEFT_CURLY_BRACE$1) {
						braces$2++;
						continue;
					}
					if (braceEscaped !== true && code === CHAR_DOT$1 && (code = advance()) === CHAR_DOT$1) {
						isBrace = token.isBrace = true;
						isGlob$2 = token.isGlob = true;
						finished = true;
						if (scanToEnd === true) continue;
						break;
					}
					if (braceEscaped !== true && code === CHAR_COMMA$1) {
						isBrace = token.isBrace = true;
						isGlob$2 = token.isGlob = true;
						finished = true;
						if (scanToEnd === true) continue;
						break;
					}
					if (code === CHAR_RIGHT_CURLY_BRACE$1) {
						braces$2--;
						if (braces$2 === 0) {
							braceEscaped = false;
							isBrace = token.isBrace = true;
							finished = true;
							break;
						}
					}
				}
				if (scanToEnd === true) continue;
				break;
			}
			if (code === CHAR_FORWARD_SLASH) {
				slashes.push(index);
				tokens.push(token);
				token = {
					value: "",
					depth: 0,
					isGlob: false
				};
				if (finished === true) continue;
				if (prev === CHAR_DOT$1 && index === start + 1) {
					start += 2;
					continue;
				}
				lastIndex = index + 1;
				continue;
			}
			if (opts.noext !== true) {
				const isExtglobChar = code === CHAR_PLUS || code === CHAR_AT || code === CHAR_ASTERISK || code === CHAR_QUESTION_MARK || code === CHAR_EXCLAMATION_MARK;
				if (isExtglobChar === true && peek() === CHAR_LEFT_PARENTHESES$1) {
					isGlob$2 = token.isGlob = true;
					isExtglob$1 = token.isExtglob = true;
					finished = true;
					if (code === CHAR_EXCLAMATION_MARK && index === start) negatedExtglob = true;
					if (scanToEnd === true) {
						while (eos() !== true && (code = advance())) {
							if (code === CHAR_BACKWARD_SLASH) {
								backslashes = token.backslashes = true;
								code = advance();
								continue;
							}
							if (code === CHAR_RIGHT_PARENTHESES$1) {
								isGlob$2 = token.isGlob = true;
								finished = true;
								break;
							}
						}
						continue;
					}
					break;
				}
			}
			if (code === CHAR_ASTERISK) {
				if (prev === CHAR_ASTERISK) isGlobstar = token.isGlobstar = true;
				isGlob$2 = token.isGlob = true;
				finished = true;
				if (scanToEnd === true) continue;
				break;
			}
			if (code === CHAR_QUESTION_MARK) {
				isGlob$2 = token.isGlob = true;
				finished = true;
				if (scanToEnd === true) continue;
				break;
			}
			if (code === CHAR_LEFT_SQUARE_BRACKET$1) {
				while (eos() !== true && (next = advance())) {
					if (next === CHAR_BACKWARD_SLASH) {
						backslashes = token.backslashes = true;
						advance();
						continue;
					}
					if (next === CHAR_RIGHT_SQUARE_BRACKET$1) {
						isBracket = token.isBracket = true;
						isGlob$2 = token.isGlob = true;
						finished = true;
						break;
					}
				}
				if (scanToEnd === true) continue;
				break;
			}
			if (opts.nonegate !== true && code === CHAR_EXCLAMATION_MARK && index === start) {
				negated = token.negated = true;
				start++;
				continue;
			}
			if (opts.noparen !== true && code === CHAR_LEFT_PARENTHESES$1) {
				isGlob$2 = token.isGlob = true;
				if (scanToEnd === true) {
					while (eos() !== true && (code = advance())) {
						if (code === CHAR_LEFT_PARENTHESES$1) {
							backslashes = token.backslashes = true;
							code = advance();
							continue;
						}
						if (code === CHAR_RIGHT_PARENTHESES$1) {
							finished = true;
							break;
						}
					}
					continue;
				}
				break;
			}
			if (isGlob$2 === true) {
				finished = true;
				if (scanToEnd === true) continue;
				break;
			}
		}
		if (opts.noext === true) {
			isExtglob$1 = false;
			isGlob$2 = false;
		}
		let base = str;
		let prefix = "";
		let glob = "";
		if (start > 0) {
			prefix = str.slice(0, start);
			str = str.slice(start);
			lastIndex -= start;
		}
		if (base && isGlob$2 === true && lastIndex > 0) {
			base = str.slice(0, lastIndex);
			glob = str.slice(lastIndex);
		} else if (isGlob$2 === true) {
			base = "";
			glob = str;
		} else base = str;
		if (base && base !== "" && base !== "/" && base !== str) {
			if (isPathSeparator(base.charCodeAt(base.length - 1))) base = base.slice(0, -1);
		}
		if (opts.unescape === true) {
			if (glob) glob = utils$5.removeBackslashes(glob);
			if (base && backslashes === true) base = utils$5.removeBackslashes(base);
		}
		const state = {
			prefix,
			input,
			start,
			base,
			glob,
			isBrace,
			isBracket,
			isGlob: isGlob$2,
			isExtglob: isExtglob$1,
			isGlobstar,
			negated,
			negatedExtglob
		};
		if (opts.tokens === true) {
			state.maxDepth = 0;
			if (!isPathSeparator(code)) tokens.push(token);
			state.tokens = tokens;
		}
		if (opts.parts === true || opts.tokens === true) {
			let prevIndex;
			for (let idx = 0; idx < slashes.length; idx++) {
				const n = prevIndex ? prevIndex + 1 : start;
				const i = slashes[idx];
				const value = input.slice(n, i);
				if (opts.tokens) {
					if (idx === 0 && start !== 0) {
						tokens[idx].isPrefix = true;
						tokens[idx].value = prefix;
					} else tokens[idx].value = value;
					depth(tokens[idx]);
					state.maxDepth += tokens[idx].depth;
				}
				if (idx !== 0 || value !== "") parts.push(value);
				prevIndex = i;
			}
			if (prevIndex && prevIndex + 1 < input.length) {
				const value = input.slice(prevIndex + 1);
				parts.push(value);
				if (opts.tokens) {
					tokens[tokens.length - 1].value = value;
					depth(tokens[tokens.length - 1]);
					state.maxDepth += tokens[tokens.length - 1].depth;
				}
			}
			state.slashes = slashes;
			state.parts = parts;
		}
		return state;
	};
	module.exports = scan$1;
}) });

//#endregion
//#region ../../node_modules/.pnpm/picomatch@2.3.1/node_modules/picomatch/lib/parse.js
var require_parse$1 = /* @__PURE__ */ __commonJS({ "../../node_modules/.pnpm/picomatch@2.3.1/node_modules/picomatch/lib/parse.js": ((exports, module) => {
	const constants$1 = require_constants$2();
	const utils$4 = require_utils$1();
	/**
	* Constants
	*/
	const { MAX_LENGTH: MAX_LENGTH$1, POSIX_REGEX_SOURCE, REGEX_NON_SPECIAL_CHARS, REGEX_SPECIAL_CHARS_BACKREF, REPLACEMENTS } = constants$1;
	/**
	* Helpers
	*/
	const expandRange = (args, options) => {
		if (typeof options.expandRange === "function") return options.expandRange(...args, options);
		args.sort();
		const value = `[${args.join("-")}]`;
		try {
			new RegExp(value);
		} catch (ex) {
			return args.map((v) => utils$4.escapeRegex(v)).join("..");
		}
		return value;
	};
	/**
	* Create the message for a syntax error
	*/
	const syntaxError = (type, char) => {
		return `Missing ${type}: "${char}" - use "\\\\${char}" to match literal characters`;
	};
	/**
	* Parse the given input string.
	* @param {String} input
	* @param {Object} options
	* @return {Object}
	*/
	const parse$4 = (input, options) => {
		if (typeof input !== "string") throw new TypeError("Expected a string");
		input = REPLACEMENTS[input] || input;
		const opts = { ...options };
		const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH$1, opts.maxLength) : MAX_LENGTH$1;
		let len = input.length;
		if (len > max) throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
		const bos = {
			type: "bos",
			value: "",
			output: opts.prepend || ""
		};
		const tokens = [bos];
		const capture = opts.capture ? "" : "?:";
		const win32$1 = utils$4.isWindows(options);
		const PLATFORM_CHARS = constants$1.globChars(win32$1);
		const EXTGLOB_CHARS = constants$1.extglobChars(PLATFORM_CHARS);
		const { DOT_LITERAL: DOT_LITERAL$1, PLUS_LITERAL: PLUS_LITERAL$1, SLASH_LITERAL: SLASH_LITERAL$1, ONE_CHAR: ONE_CHAR$1, DOTS_SLASH: DOTS_SLASH$1, NO_DOT: NO_DOT$1, NO_DOT_SLASH: NO_DOT_SLASH$1, NO_DOTS_SLASH: NO_DOTS_SLASH$1, QMARK: QMARK$1, QMARK_NO_DOT: QMARK_NO_DOT$1, STAR: STAR$2, START_ANCHOR: START_ANCHOR$1 } = PLATFORM_CHARS;
		const globstar = (opts$1) => {
			return `(${capture}(?:(?!${START_ANCHOR$1}${opts$1.dot ? DOTS_SLASH$1 : DOT_LITERAL$1}).)*?)`;
		};
		const nodot = opts.dot ? "" : NO_DOT$1;
		const qmarkNoDot = opts.dot ? QMARK$1 : QMARK_NO_DOT$1;
		let star = opts.bash === true ? globstar(opts) : STAR$2;
		if (opts.capture) star = `(${star})`;
		if (typeof opts.noext === "boolean") opts.noextglob = opts.noext;
		const state = {
			input,
			index: -1,
			start: 0,
			dot: opts.dot === true,
			consumed: "",
			output: "",
			prefix: "",
			backtrack: false,
			negated: false,
			brackets: 0,
			braces: 0,
			parens: 0,
			quotes: 0,
			globstar: false,
			tokens
		};
		input = utils$4.removePrefix(input, state);
		len = input.length;
		const extglobs = [];
		const braces$2 = [];
		const stack = [];
		let prev = bos;
		let value;
		/**
		* Tokenizing helpers
		*/
		const eos = () => state.index === len - 1;
		const peek = state.peek = (n = 1) => input[state.index + n];
		const advance = state.advance = () => input[++state.index] || "";
		const remaining = () => input.slice(state.index + 1);
		const consume = (value$1 = "", num = 0) => {
			state.consumed += value$1;
			state.index += num;
		};
		const append$1 = (token) => {
			state.output += token.output != null ? token.output : token.value;
			consume(token.value);
		};
		const negate = () => {
			let count = 1;
			while (peek() === "!" && (peek(2) !== "(" || peek(3) === "?")) {
				advance();
				state.start++;
				count++;
			}
			if (count % 2 === 0) return false;
			state.negated = true;
			state.start++;
			return true;
		};
		const increment = (type) => {
			state[type]++;
			stack.push(type);
		};
		const decrement = (type) => {
			state[type]--;
			stack.pop();
		};
		/**
		* Push tokens onto the tokens array. This helper speeds up
		* tokenizing by 1) helping us avoid backtracking as much as possible,
		* and 2) helping us avoid creating extra tokens when consecutive
		* characters are plain text. This improves performance and simplifies
		* lookbehinds.
		*/
		const push = (tok) => {
			if (prev.type === "globstar") {
				const isBrace = state.braces > 0 && (tok.type === "comma" || tok.type === "brace");
				const isExtglob$1 = tok.extglob === true || extglobs.length && (tok.type === "pipe" || tok.type === "paren");
				if (tok.type !== "slash" && tok.type !== "paren" && !isBrace && !isExtglob$1) {
					state.output = state.output.slice(0, -prev.output.length);
					prev.type = "star";
					prev.value = "*";
					prev.output = star;
					state.output += prev.output;
				}
			}
			if (extglobs.length && tok.type !== "paren") extglobs[extglobs.length - 1].inner += tok.value;
			if (tok.value || tok.output) append$1(tok);
			if (prev && prev.type === "text" && tok.type === "text") {
				prev.value += tok.value;
				prev.output = (prev.output || "") + tok.value;
				return;
			}
			tok.prev = prev;
			tokens.push(tok);
			prev = tok;
		};
		const extglobOpen = (type, value$1) => {
			const token = {
				...EXTGLOB_CHARS[value$1],
				conditions: 1,
				inner: ""
			};
			token.prev = prev;
			token.parens = state.parens;
			token.output = state.output;
			const output = (opts.capture ? "(" : "") + token.open;
			increment("parens");
			push({
				type,
				value: value$1,
				output: state.output ? "" : ONE_CHAR$1
			});
			push({
				type: "paren",
				extglob: true,
				value: advance(),
				output
			});
			extglobs.push(token);
		};
		const extglobClose = (token) => {
			let output = token.close + (opts.capture ? ")" : "");
			let rest;
			if (token.type === "negate") {
				let extglobStar = star;
				if (token.inner && token.inner.length > 1 && token.inner.includes("/")) extglobStar = globstar(opts);
				if (extglobStar !== star || eos() || /^\)+$/.test(remaining())) output = token.close = `)$))${extglobStar}`;
				if (token.inner.includes("*") && (rest = remaining()) && /^\.[^\\/.]+$/.test(rest)) {
					const expression = parse$4(rest, {
						...options,
						fastpaths: false
					}).output;
					output = token.close = `)${expression})${extglobStar})`;
				}
				if (token.prev.type === "bos") state.negatedExtglob = true;
			}
			push({
				type: "paren",
				extglob: true,
				value,
				output
			});
			decrement("parens");
		};
		/**
		* Fast paths
		*/
		if (opts.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(input)) {
			let backslashes = false;
			let output = input.replace(REGEX_SPECIAL_CHARS_BACKREF, (m, esc, chars$1, first, rest, index) => {
				if (first === "\\") {
					backslashes = true;
					return m;
				}
				if (first === "?") {
					if (esc) return esc + first + (rest ? QMARK$1.repeat(rest.length) : "");
					if (index === 0) return qmarkNoDot + (rest ? QMARK$1.repeat(rest.length) : "");
					return QMARK$1.repeat(chars$1.length);
				}
				if (first === ".") return DOT_LITERAL$1.repeat(chars$1.length);
				if (first === "*") {
					if (esc) return esc + first + (rest ? star : "");
					return star;
				}
				return esc ? m : `\\${m}`;
			});
			if (backslashes === true) if (opts.unescape === true) output = output.replace(/\\/g, "");
			else output = output.replace(/\\+/g, (m) => {
				return m.length % 2 === 0 ? "\\\\" : m ? "\\" : "";
			});
			if (output === input && opts.contains === true) {
				state.output = input;
				return state;
			}
			state.output = utils$4.wrapOutput(output, state, options);
			return state;
		}
		/**
		* Tokenize input until we reach end-of-string
		*/
		while (!eos()) {
			value = advance();
			if (value === "\0") continue;
			/**
			* Escaped characters
			*/
			if (value === "\\") {
				const next = peek();
				if (next === "/" && opts.bash !== true) continue;
				if (next === "." || next === ";") continue;
				if (!next) {
					value += "\\";
					push({
						type: "text",
						value
					});
					continue;
				}
				const match = /^\\+/.exec(remaining());
				let slashes = 0;
				if (match && match[0].length > 2) {
					slashes = match[0].length;
					state.index += slashes;
					if (slashes % 2 !== 0) value += "\\";
				}
				if (opts.unescape === true) value = advance();
				else value += advance();
				if (state.brackets === 0) {
					push({
						type: "text",
						value
					});
					continue;
				}
			}
			/**
			* If we're inside a regex character class, continue
			* until we reach the closing bracket.
			*/
			if (state.brackets > 0 && (value !== "]" || prev.value === "[" || prev.value === "[^")) {
				if (opts.posix !== false && value === ":") {
					const inner = prev.value.slice(1);
					if (inner.includes("[")) {
						prev.posix = true;
						if (inner.includes(":")) {
							const idx = prev.value.lastIndexOf("[");
							const pre = prev.value.slice(0, idx);
							const rest$1 = prev.value.slice(idx + 2);
							const posix = POSIX_REGEX_SOURCE[rest$1];
							if (posix) {
								prev.value = pre + posix;
								state.backtrack = true;
								advance();
								if (!bos.output && tokens.indexOf(prev) === 1) bos.output = ONE_CHAR$1;
								continue;
							}
						}
					}
				}
				if (value === "[" && peek() !== ":" || value === "-" && peek() === "]") value = `\\${value}`;
				if (value === "]" && (prev.value === "[" || prev.value === "[^")) value = `\\${value}`;
				if (opts.posix === true && value === "!" && prev.value === "[") value = "^";
				prev.value += value;
				append$1({ value });
				continue;
			}
			/**
			* If we're inside a quoted string, continue
			* until we reach the closing double quote.
			*/
			if (state.quotes === 1 && value !== "\"") {
				value = utils$4.escapeRegex(value);
				prev.value += value;
				append$1({ value });
				continue;
			}
			/**
			* Double quotes
			*/
			if (value === "\"") {
				state.quotes = state.quotes === 1 ? 0 : 1;
				if (opts.keepQuotes === true) push({
					type: "text",
					value
				});
				continue;
			}
			/**
			* Parentheses
			*/
			if (value === "(") {
				increment("parens");
				push({
					type: "paren",
					value
				});
				continue;
			}
			if (value === ")") {
				if (state.parens === 0 && opts.strictBrackets === true) throw new SyntaxError(syntaxError("opening", "("));
				const extglob = extglobs[extglobs.length - 1];
				if (extglob && state.parens === extglob.parens + 1) {
					extglobClose(extglobs.pop());
					continue;
				}
				push({
					type: "paren",
					value,
					output: state.parens ? ")" : "\\)"
				});
				decrement("parens");
				continue;
			}
			/**
			* Square brackets
			*/
			if (value === "[") {
				if (opts.nobracket === true || !remaining().includes("]")) {
					if (opts.nobracket !== true && opts.strictBrackets === true) throw new SyntaxError(syntaxError("closing", "]"));
					value = `\\${value}`;
				} else increment("brackets");
				push({
					type: "bracket",
					value
				});
				continue;
			}
			if (value === "]") {
				if (opts.nobracket === true || prev && prev.type === "bracket" && prev.value.length === 1) {
					push({
						type: "text",
						value,
						output: `\\${value}`
					});
					continue;
				}
				if (state.brackets === 0) {
					if (opts.strictBrackets === true) throw new SyntaxError(syntaxError("opening", "["));
					push({
						type: "text",
						value,
						output: `\\${value}`
					});
					continue;
				}
				decrement("brackets");
				const prevValue = prev.value.slice(1);
				if (prev.posix !== true && prevValue[0] === "^" && !prevValue.includes("/")) value = `/${value}`;
				prev.value += value;
				append$1({ value });
				if (opts.literalBrackets === false || utils$4.hasRegexChars(prevValue)) continue;
				const escaped$1 = utils$4.escapeRegex(prev.value);
				state.output = state.output.slice(0, -prev.value.length);
				if (opts.literalBrackets === true) {
					state.output += escaped$1;
					prev.value = escaped$1;
					continue;
				}
				prev.value = `(${capture}${escaped$1}|${prev.value})`;
				state.output += prev.value;
				continue;
			}
			/**
			* Braces
			*/
			if (value === "{" && opts.nobrace !== true) {
				increment("braces");
				const open$1 = {
					type: "brace",
					value,
					output: "(",
					outputIndex: state.output.length,
					tokensIndex: state.tokens.length
				};
				braces$2.push(open$1);
				push(open$1);
				continue;
			}
			if (value === "}") {
				const brace = braces$2[braces$2.length - 1];
				if (opts.nobrace === true || !brace) {
					push({
						type: "text",
						value,
						output: value
					});
					continue;
				}
				let output = ")";
				if (brace.dots === true) {
					const arr = tokens.slice();
					const range = [];
					for (let i = arr.length - 1; i >= 0; i--) {
						tokens.pop();
						if (arr[i].type === "brace") break;
						if (arr[i].type !== "dots") range.unshift(arr[i].value);
					}
					output = expandRange(range, opts);
					state.backtrack = true;
				}
				if (brace.comma !== true && brace.dots !== true) {
					const out = state.output.slice(0, brace.outputIndex);
					const toks = state.tokens.slice(brace.tokensIndex);
					brace.value = brace.output = "\\{";
					value = output = "\\}";
					state.output = out;
					for (const t of toks) state.output += t.output || t.value;
				}
				push({
					type: "brace",
					value,
					output
				});
				decrement("braces");
				braces$2.pop();
				continue;
			}
			/**
			* Pipes
			*/
			if (value === "|") {
				if (extglobs.length > 0) extglobs[extglobs.length - 1].conditions++;
				push({
					type: "text",
					value
				});
				continue;
			}
			/**
			* Commas
			*/
			if (value === ",") {
				let output = value;
				const brace = braces$2[braces$2.length - 1];
				if (brace && stack[stack.length - 1] === "braces") {
					brace.comma = true;
					output = "|";
				}
				push({
					type: "comma",
					value,
					output
				});
				continue;
			}
			/**
			* Slashes
			*/
			if (value === "/") {
				if (prev.type === "dot" && state.index === state.start + 1) {
					state.start = state.index + 1;
					state.consumed = "";
					state.output = "";
					tokens.pop();
					prev = bos;
					continue;
				}
				push({
					type: "slash",
					value,
					output: SLASH_LITERAL$1
				});
				continue;
			}
			/**
			* Dots
			*/
			if (value === ".") {
				if (state.braces > 0 && prev.type === "dot") {
					if (prev.value === ".") prev.output = DOT_LITERAL$1;
					const brace = braces$2[braces$2.length - 1];
					prev.type = "dots";
					prev.output += value;
					prev.value += value;
					brace.dots = true;
					continue;
				}
				if (state.braces + state.parens === 0 && prev.type !== "bos" && prev.type !== "slash") {
					push({
						type: "text",
						value,
						output: DOT_LITERAL$1
					});
					continue;
				}
				push({
					type: "dot",
					value,
					output: DOT_LITERAL$1
				});
				continue;
			}
			/**
			* Question marks
			*/
			if (value === "?") {
				const isGroup = prev && prev.value === "(";
				if (!isGroup && opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
					extglobOpen("qmark", value);
					continue;
				}
				if (prev && prev.type === "paren") {
					const next = peek();
					let output = value;
					if (next === "<" && !utils$4.supportsLookbehinds()) throw new Error("Node.js v10 or higher is required for regex lookbehinds");
					if (prev.value === "(" && !/[!=<:]/.test(next) || next === "<" && !/<([!=]|\w+>)/.test(remaining())) output = `\\${value}`;
					push({
						type: "text",
						value,
						output
					});
					continue;
				}
				if (opts.dot !== true && (prev.type === "slash" || prev.type === "bos")) {
					push({
						type: "qmark",
						value,
						output: QMARK_NO_DOT$1
					});
					continue;
				}
				push({
					type: "qmark",
					value,
					output: QMARK$1
				});
				continue;
			}
			/**
			* Exclamation
			*/
			if (value === "!") {
				if (opts.noextglob !== true && peek() === "(") {
					if (peek(2) !== "?" || !/[!=<:]/.test(peek(3))) {
						extglobOpen("negate", value);
						continue;
					}
				}
				if (opts.nonegate !== true && state.index === 0) {
					negate();
					continue;
				}
			}
			/**
			* Plus
			*/
			if (value === "+") {
				if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
					extglobOpen("plus", value);
					continue;
				}
				if (prev && prev.value === "(" || opts.regex === false) {
					push({
						type: "plus",
						value,
						output: PLUS_LITERAL$1
					});
					continue;
				}
				if (prev && (prev.type === "bracket" || prev.type === "paren" || prev.type === "brace") || state.parens > 0) {
					push({
						type: "plus",
						value
					});
					continue;
				}
				push({
					type: "plus",
					value: PLUS_LITERAL$1
				});
				continue;
			}
			/**
			* Plain text
			*/
			if (value === "@") {
				if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
					push({
						type: "at",
						extglob: true,
						value,
						output: ""
					});
					continue;
				}
				push({
					type: "text",
					value
				});
				continue;
			}
			/**
			* Plain text
			*/
			if (value !== "*") {
				if (value === "$" || value === "^") value = `\\${value}`;
				const match = REGEX_NON_SPECIAL_CHARS.exec(remaining());
				if (match) {
					value += match[0];
					state.index += match[0].length;
				}
				push({
					type: "text",
					value
				});
				continue;
			}
			/**
			* Stars
			*/
			if (prev && (prev.type === "globstar" || prev.star === true)) {
				prev.type = "star";
				prev.star = true;
				prev.value += value;
				prev.output = star;
				state.backtrack = true;
				state.globstar = true;
				consume(value);
				continue;
			}
			let rest = remaining();
			if (opts.noextglob !== true && /^\([^?]/.test(rest)) {
				extglobOpen("star", value);
				continue;
			}
			if (prev.type === "star") {
				if (opts.noglobstar === true) {
					consume(value);
					continue;
				}
				const prior = prev.prev;
				const before = prior.prev;
				const isStart = prior.type === "slash" || prior.type === "bos";
				const afterStar = before && (before.type === "star" || before.type === "globstar");
				if (opts.bash === true && (!isStart || rest[0] && rest[0] !== "/")) {
					push({
						type: "star",
						value,
						output: ""
					});
					continue;
				}
				const isBrace = state.braces > 0 && (prior.type === "comma" || prior.type === "brace");
				const isExtglob$1 = extglobs.length && (prior.type === "pipe" || prior.type === "paren");
				if (!isStart && prior.type !== "paren" && !isBrace && !isExtglob$1) {
					push({
						type: "star",
						value,
						output: ""
					});
					continue;
				}
				while (rest.slice(0, 3) === "/**") {
					const after = input[state.index + 4];
					if (after && after !== "/") break;
					rest = rest.slice(3);
					consume("/**", 3);
				}
				if (prior.type === "bos" && eos()) {
					prev.type = "globstar";
					prev.value += value;
					prev.output = globstar(opts);
					state.output = prev.output;
					state.globstar = true;
					consume(value);
					continue;
				}
				if (prior.type === "slash" && prior.prev.type !== "bos" && !afterStar && eos()) {
					state.output = state.output.slice(0, -(prior.output + prev.output).length);
					prior.output = `(?:${prior.output}`;
					prev.type = "globstar";
					prev.output = globstar(opts) + (opts.strictSlashes ? ")" : "|$)");
					prev.value += value;
					state.globstar = true;
					state.output += prior.output + prev.output;
					consume(value);
					continue;
				}
				if (prior.type === "slash" && prior.prev.type !== "bos" && rest[0] === "/") {
					const end = rest[1] !== void 0 ? "|$" : "";
					state.output = state.output.slice(0, -(prior.output + prev.output).length);
					prior.output = `(?:${prior.output}`;
					prev.type = "globstar";
					prev.output = `${globstar(opts)}${SLASH_LITERAL$1}|${SLASH_LITERAL$1}${end})`;
					prev.value += value;
					state.output += prior.output + prev.output;
					state.globstar = true;
					consume(value + advance());
					push({
						type: "slash",
						value: "/",
						output: ""
					});
					continue;
				}
				if (prior.type === "bos" && rest[0] === "/") {
					prev.type = "globstar";
					prev.value += value;
					prev.output = `(?:^|${SLASH_LITERAL$1}|${globstar(opts)}${SLASH_LITERAL$1})`;
					state.output = prev.output;
					state.globstar = true;
					consume(value + advance());
					push({
						type: "slash",
						value: "/",
						output: ""
					});
					continue;
				}
				state.output = state.output.slice(0, -prev.output.length);
				prev.type = "globstar";
				prev.output = globstar(opts);
				prev.value += value;
				state.output += prev.output;
				state.globstar = true;
				consume(value);
				continue;
			}
			const token = {
				type: "star",
				value,
				output: star
			};
			if (opts.bash === true) {
				token.output = ".*?";
				if (prev.type === "bos" || prev.type === "slash") token.output = nodot + token.output;
				push(token);
				continue;
			}
			if (prev && (prev.type === "bracket" || prev.type === "paren") && opts.regex === true) {
				token.output = value;
				push(token);
				continue;
			}
			if (state.index === state.start || prev.type === "slash" || prev.type === "dot") {
				if (prev.type === "dot") {
					state.output += NO_DOT_SLASH$1;
					prev.output += NO_DOT_SLASH$1;
				} else if (opts.dot === true) {
					state.output += NO_DOTS_SLASH$1;
					prev.output += NO_DOTS_SLASH$1;
				} else {
					state.output += nodot;
					prev.output += nodot;
				}
				if (peek() !== "*") {
					state.output += ONE_CHAR$1;
					prev.output += ONE_CHAR$1;
				}
			}
			push(token);
		}
		while (state.brackets > 0) {
			if (opts.strictBrackets === true) throw new SyntaxError(syntaxError("closing", "]"));
			state.output = utils$4.escapeLast(state.output, "[");
			decrement("brackets");
		}
		while (state.parens > 0) {
			if (opts.strictBrackets === true) throw new SyntaxError(syntaxError("closing", ")"));
			state.output = utils$4.escapeLast(state.output, "(");
			decrement("parens");
		}
		while (state.braces > 0) {
			if (opts.strictBrackets === true) throw new SyntaxError(syntaxError("closing", "}"));
			state.output = utils$4.escapeLast(state.output, "{");
			decrement("braces");
		}
		if (opts.strictSlashes !== true && (prev.type === "star" || prev.type === "bracket")) push({
			type: "maybe_slash",
			value: "",
			output: `${SLASH_LITERAL$1}?`
		});
		if (state.backtrack === true) {
			state.output = "";
			for (const token of state.tokens) {
				state.output += token.output != null ? token.output : token.value;
				if (token.suffix) state.output += token.suffix;
			}
		}
		return state;
	};
	/**
	* Fast paths for creating regular expressions for common glob patterns.
	* This can significantly speed up processing and has very little downside
	* impact when none of the fast paths match.
	*/
	parse$4.fastpaths = (input, options) => {
		const opts = { ...options };
		const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH$1, opts.maxLength) : MAX_LENGTH$1;
		const len = input.length;
		if (len > max) throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
		input = REPLACEMENTS[input] || input;
		const win32$1 = utils$4.isWindows(options);
		const { DOT_LITERAL: DOT_LITERAL$1, SLASH_LITERAL: SLASH_LITERAL$1, ONE_CHAR: ONE_CHAR$1, DOTS_SLASH: DOTS_SLASH$1, NO_DOT: NO_DOT$1, NO_DOTS: NO_DOTS$1, NO_DOTS_SLASH: NO_DOTS_SLASH$1, STAR: STAR$2, START_ANCHOR: START_ANCHOR$1 } = constants$1.globChars(win32$1);
		const nodot = opts.dot ? NO_DOTS$1 : NO_DOT$1;
		const slashDot = opts.dot ? NO_DOTS_SLASH$1 : NO_DOT$1;
		const capture = opts.capture ? "" : "?:";
		const state = {
			negated: false,
			prefix: ""
		};
		let star = opts.bash === true ? ".*?" : STAR$2;
		if (opts.capture) star = `(${star})`;
		const globstar = (opts$1) => {
			if (opts$1.noglobstar === true) return star;
			return `(${capture}(?:(?!${START_ANCHOR$1}${opts$1.dot ? DOTS_SLASH$1 : DOT_LITERAL$1}).)*?)`;
		};
		const create = (str) => {
			switch (str) {
				case "*": return `${nodot}${ONE_CHAR$1}${star}`;
				case ".*": return `${DOT_LITERAL$1}${ONE_CHAR$1}${star}`;
				case "*.*": return `${nodot}${star}${DOT_LITERAL$1}${ONE_CHAR$1}${star}`;
				case "*/*": return `${nodot}${star}${SLASH_LITERAL$1}${ONE_CHAR$1}${slashDot}${star}`;
				case "**": return nodot + globstar(opts);
				case "**/*": return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL$1})?${slashDot}${ONE_CHAR$1}${star}`;
				case "**/*.*": return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL$1})?${slashDot}${star}${DOT_LITERAL$1}${ONE_CHAR$1}${star}`;
				case "**/.*": return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL$1})?${DOT_LITERAL$1}${ONE_CHAR$1}${star}`;
				default: {
					const match = /^(.*?)\.(\w+)$/.exec(str);
					if (!match) return;
					const source$1 = create(match[1]);
					if (!source$1) return;
					return source$1 + DOT_LITERAL$1 + match[2];
				}
			}
		};
		const output = utils$4.removePrefix(input, state);
		let source = create(output);
		if (source && opts.strictSlashes !== true) source += `${SLASH_LITERAL$1}?`;
		return source;
	};
	module.exports = parse$4;
}) });

//#endregion
//#region ../../node_modules/.pnpm/picomatch@2.3.1/node_modules/picomatch/lib/picomatch.js
var require_picomatch$1 = /* @__PURE__ */ __commonJS({ "../../node_modules/.pnpm/picomatch@2.3.1/node_modules/picomatch/lib/picomatch.js": ((exports, module) => {
	const path$3 = __require("path");
	const scan = require_scan();
	const parse$3 = require_parse$1();
	const utils$3 = require_utils$1();
	const constants = require_constants$2();
	const isObject$1 = (val) => val && typeof val === "object" && !Array.isArray(val);
	/**
	* Creates a matcher function from one or more glob patterns. The
	* returned function takes a string to match as its first argument,
	* and returns true if the string is a match. The returned matcher
	* function also takes a boolean as the second argument that, when true,
	* returns an object with additional information.
	*
	* ```js
	* const picomatch = require('picomatch');
	* // picomatch(glob[, options]);
	*
	* const isMatch = picomatch('*.!(*a)');
	* console.log(isMatch('a.a')); //=> false
	* console.log(isMatch('a.b')); //=> true
	* ```
	* @name picomatch
	* @param {String|Array} `globs` One or more glob patterns.
	* @param {Object=} `options`
	* @return {Function=} Returns a matcher function.
	* @api public
	*/
	const picomatch$2 = (glob, options, returnState = false) => {
		if (Array.isArray(glob)) {
			const fns = glob.map((input) => picomatch$2(input, options, returnState));
			const arrayMatcher = (str) => {
				for (const isMatch of fns) {
					const state$1 = isMatch(str);
					if (state$1) return state$1;
				}
				return false;
			};
			return arrayMatcher;
		}
		const isState = isObject$1(glob) && glob.tokens && glob.input;
		if (glob === "" || typeof glob !== "string" && !isState) throw new TypeError("Expected pattern to be a non-empty string");
		const opts = options || {};
		const posix = utils$3.isWindows(options);
		const regex = isState ? picomatch$2.compileRe(glob, options) : picomatch$2.makeRe(glob, options, false, true);
		const state = regex.state;
		delete regex.state;
		let isIgnored = () => false;
		if (opts.ignore) {
			const ignoreOpts = {
				...options,
				ignore: null,
				onMatch: null,
				onResult: null
			};
			isIgnored = picomatch$2(opts.ignore, ignoreOpts, returnState);
		}
		const matcher = (input, returnObject = false) => {
			const { isMatch, match, output } = picomatch$2.test(input, regex, options, {
				glob,
				posix
			});
			const result = {
				glob,
				state,
				regex,
				posix,
				input,
				output,
				match,
				isMatch
			};
			if (typeof opts.onResult === "function") opts.onResult(result);
			if (isMatch === false) {
				result.isMatch = false;
				return returnObject ? result : false;
			}
			if (isIgnored(input)) {
				if (typeof opts.onIgnore === "function") opts.onIgnore(result);
				result.isMatch = false;
				return returnObject ? result : false;
			}
			if (typeof opts.onMatch === "function") opts.onMatch(result);
			return returnObject ? result : true;
		};
		if (returnState) matcher.state = state;
		return matcher;
	};
	/**
	* Test `input` with the given `regex`. This is used by the main
	* `picomatch()` function to test the input string.
	*
	* ```js
	* const picomatch = require('picomatch');
	* // picomatch.test(input, regex[, options]);
	*
	* console.log(picomatch.test('foo/bar', /^(?:([^/]*?)\/([^/]*?))$/));
	* // { isMatch: true, match: [ 'foo/', 'foo', 'bar' ], output: 'foo/bar' }
	* ```
	* @param {String} `input` String to test.
	* @param {RegExp} `regex`
	* @return {Object} Returns an object with matching info.
	* @api public
	*/
	picomatch$2.test = (input, regex, options, { glob, posix } = {}) => {
		if (typeof input !== "string") throw new TypeError("Expected input to be a string");
		if (input === "") return {
			isMatch: false,
			output: ""
		};
		const opts = options || {};
		const format$1 = opts.format || (posix ? utils$3.toPosixSlashes : null);
		let match = input === glob;
		let output = match && format$1 ? format$1(input) : input;
		if (match === false) {
			output = format$1 ? format$1(input) : input;
			match = output === glob;
		}
		if (match === false || opts.capture === true) if (opts.matchBase === true || opts.basename === true) match = picomatch$2.matchBase(input, regex, options, posix);
		else match = regex.exec(output);
		return {
			isMatch: Boolean(match),
			match,
			output
		};
	};
	/**
	* Match the basename of a filepath.
	*
	* ```js
	* const picomatch = require('picomatch');
	* // picomatch.matchBase(input, glob[, options]);
	* console.log(picomatch.matchBase('foo/bar.js', '*.js'); // true
	* ```
	* @param {String} `input` String to test.
	* @param {RegExp|String} `glob` Glob pattern or regex created by [.makeRe](#makeRe).
	* @return {Boolean}
	* @api public
	*/
	picomatch$2.matchBase = (input, glob, options, posix = utils$3.isWindows(options)) => {
		const regex = glob instanceof RegExp ? glob : picomatch$2.makeRe(glob, options);
		return regex.test(path$3.basename(input));
	};
	/**
	* Returns true if **any** of the given glob `patterns` match the specified `string`.
	*
	* ```js
	* const picomatch = require('picomatch');
	* // picomatch.isMatch(string, patterns[, options]);
	*
	* console.log(picomatch.isMatch('a.a', ['b.*', '*.a'])); //=> true
	* console.log(picomatch.isMatch('a.a', 'b.*')); //=> false
	* ```
	* @param {String|Array} str The string to test.
	* @param {String|Array} patterns One or more glob patterns to use for matching.
	* @param {Object} [options] See available [options](#options).
	* @return {Boolean} Returns true if any patterns match `str`
	* @api public
	*/
	picomatch$2.isMatch = (str, patterns, options) => picomatch$2(patterns, options)(str);
	/**
	* Parse a glob pattern to create the source string for a regular
	* expression.
	*
	* ```js
	* const picomatch = require('picomatch');
	* const result = picomatch.parse(pattern[, options]);
	* ```
	* @param {String} `pattern`
	* @param {Object} `options`
	* @return {Object} Returns an object with useful properties and output to be used as a regex source string.
	* @api public
	*/
	picomatch$2.parse = (pattern, options) => {
		if (Array.isArray(pattern)) return pattern.map((p) => picomatch$2.parse(p, options));
		return parse$3(pattern, {
			...options,
			fastpaths: false
		});
	};
	/**
	* Scan a glob pattern to separate the pattern into segments.
	*
	* ```js
	* const picomatch = require('picomatch');
	* // picomatch.scan(input[, options]);
	*
	* const result = picomatch.scan('!./foo/*.js');
	* console.log(result);
	* { prefix: '!./',
	*   input: '!./foo/*.js',
	*   start: 3,
	*   base: 'foo',
	*   glob: '*.js',
	*   isBrace: false,
	*   isBracket: false,
	*   isGlob: true,
	*   isExtglob: false,
	*   isGlobstar: false,
	*   negated: true }
	* ```
	* @param {String} `input` Glob pattern to scan.
	* @param {Object} `options`
	* @return {Object} Returns an object with
	* @api public
	*/
	picomatch$2.scan = (input, options) => scan(input, options);
	/**
	* Compile a regular expression from the `state` object returned by the
	* [parse()](#parse) method.
	*
	* @param {Object} `state`
	* @param {Object} `options`
	* @param {Boolean} `returnOutput` Intended for implementors, this argument allows you to return the raw output from the parser.
	* @param {Boolean} `returnState` Adds the state to a `state` property on the returned regex. Useful for implementors and debugging.
	* @return {RegExp}
	* @api public
	*/
	picomatch$2.compileRe = (state, options, returnOutput = false, returnState = false) => {
		if (returnOutput === true) return state.output;
		const opts = options || {};
		const prepend = opts.contains ? "" : "^";
		const append$1 = opts.contains ? "" : "$";
		let source = `${prepend}(?:${state.output})${append$1}`;
		if (state && state.negated === true) source = `^(?!${source}).*$`;
		const regex = picomatch$2.toRegex(source, options);
		if (returnState === true) regex.state = state;
		return regex;
	};
	/**
	* Create a regular expression from a parsed glob pattern.
	*
	* ```js
	* const picomatch = require('picomatch');
	* const state = picomatch.parse('*.js');
	* // picomatch.compileRe(state[, options]);
	*
	* console.log(picomatch.compileRe(state));
	* //=> /^(?:(?!\.)(?=.)[^/]*?\.js)$/
	* ```
	* @param {String} `state` The object returned from the `.parse` method.
	* @param {Object} `options`
	* @param {Boolean} `returnOutput` Implementors may use this argument to return the compiled output, instead of a regular expression. This is not exposed on the options to prevent end-users from mutating the result.
	* @param {Boolean} `returnState` Implementors may use this argument to return the state from the parsed glob with the returned regular expression.
	* @return {RegExp} Returns a regex created from the given pattern.
	* @api public
	*/
	picomatch$2.makeRe = (input, options = {}, returnOutput = false, returnState = false) => {
		if (!input || typeof input !== "string") throw new TypeError("Expected a non-empty string");
		let parsed = {
			negated: false,
			fastpaths: true
		};
		if (options.fastpaths !== false && (input[0] === "." || input[0] === "*")) parsed.output = parse$3.fastpaths(input, options);
		if (!parsed.output) parsed = parse$3(input, options);
		return picomatch$2.compileRe(parsed, options, returnOutput, returnState);
	};
	/**
	* Create a regular expression from the given regex source string.
	*
	* ```js
	* const picomatch = require('picomatch');
	* // picomatch.toRegex(source[, options]);
	*
	* const { output } = picomatch.parse('*.js');
	* console.log(picomatch.toRegex(output));
	* //=> /^(?:(?!\.)(?=.)[^/]*?\.js)$/
	* ```
	* @param {String} `source` Regular expression source string.
	* @param {Object} `options`
	* @return {RegExp}
	* @api public
	*/
	picomatch$2.toRegex = (source, options) => {
		try {
			const opts = options || {};
			return new RegExp(source, opts.flags || (opts.nocase ? "i" : ""));
		} catch (err) {
			if (options && options.debug === true) throw err;
			return /$^/;
		}
	};
	/**
	* Picomatch constants.
	* @return {Object}
	*/
	picomatch$2.constants = constants;
	/**
	* Expose "picomatch"
	*/
	module.exports = picomatch$2;
}) });

//#endregion
//#region ../../node_modules/.pnpm/picomatch@2.3.1/node_modules/picomatch/index.js
var require_picomatch = /* @__PURE__ */ __commonJS({ "../../node_modules/.pnpm/picomatch@2.3.1/node_modules/picomatch/index.js": ((exports, module) => {
	module.exports = require_picomatch$1();
}) });

//#endregion
//#region ../../node_modules/.pnpm/readdirp@3.6.0/node_modules/readdirp/index.js
var require_readdirp = /* @__PURE__ */ __commonJS({ "../../node_modules/.pnpm/readdirp@3.6.0/node_modules/readdirp/index.js": ((exports, module) => {
	const fs$4 = __require("fs");
	const { Readable } = __require("stream");
	const sysPath$3 = __require("path");
	const { promisify: promisify$3 } = __require("util");
	const picomatch$1 = require_picomatch();
	const readdir$1 = promisify$3(fs$4.readdir);
	const stat$4 = promisify$3(fs$4.stat);
	const lstat$2 = promisify$3(fs$4.lstat);
	const realpath$1 = promisify$3(fs$4.realpath);
	/**
	* @typedef {Object} EntryInfo
	* @property {String} path
	* @property {String} fullPath
	* @property {fs.Stats=} stats
	* @property {fs.Dirent=} dirent
	* @property {String} basename
	*/
	const BANG$2 = "!";
	const RECURSIVE_ERROR_CODE = "READDIRP_RECURSIVE_ERROR";
	const NORMAL_FLOW_ERRORS = new Set([
		"ENOENT",
		"EPERM",
		"EACCES",
		"ELOOP",
		RECURSIVE_ERROR_CODE
	]);
	const FILE_TYPE = "files";
	const DIR_TYPE = "directories";
	const FILE_DIR_TYPE = "files_directories";
	const EVERYTHING_TYPE = "all";
	const ALL_TYPES = [
		FILE_TYPE,
		DIR_TYPE,
		FILE_DIR_TYPE,
		EVERYTHING_TYPE
	];
	const isNormalFlowError = (error) => NORMAL_FLOW_ERRORS.has(error.code);
	const [maj, min] = process.versions.node.split(".").slice(0, 2).map((n) => Number.parseInt(n, 10));
	const wantBigintFsStats = process.platform === "win32" && (maj > 10 || maj === 10 && min >= 5);
	const normalizeFilter = (filter) => {
		if (filter === void 0) return;
		if (typeof filter === "function") return filter;
		if (typeof filter === "string") {
			const glob = picomatch$1(filter.trim());
			return (entry) => glob(entry.basename);
		}
		if (Array.isArray(filter)) {
			const positive = [];
			const negative = [];
			for (const item of filter) {
				const trimmed = item.trim();
				if (trimmed.charAt(0) === BANG$2) negative.push(picomatch$1(trimmed.slice(1)));
				else positive.push(picomatch$1(trimmed));
			}
			if (negative.length > 0) {
				if (positive.length > 0) return (entry) => positive.some((f) => f(entry.basename)) && !negative.some((f) => f(entry.basename));
				return (entry) => !negative.some((f) => f(entry.basename));
			}
			return (entry) => positive.some((f) => f(entry.basename));
		}
	};
	var ReaddirpStream = class ReaddirpStream extends Readable {
		static get defaultOptions() {
			return {
				root: ".",
				fileFilter: (path$6) => true,
				directoryFilter: (path$6) => true,
				type: FILE_TYPE,
				lstat: false,
				depth: 2147483648,
				alwaysStat: false
			};
		}
		constructor(options = {}) {
			super({
				objectMode: true,
				autoDestroy: true,
				highWaterMark: options.highWaterMark || 4096
			});
			const opts = {
				...ReaddirpStream.defaultOptions,
				...options
			};
			const { root, type } = opts;
			this._fileFilter = normalizeFilter(opts.fileFilter);
			this._directoryFilter = normalizeFilter(opts.directoryFilter);
			const statMethod = opts.lstat ? lstat$2 : stat$4;
			if (wantBigintFsStats) this._stat = (path$6) => statMethod(path$6, { bigint: true });
			else this._stat = statMethod;
			this._maxDepth = opts.depth;
			this._wantsDir = [
				DIR_TYPE,
				FILE_DIR_TYPE,
				EVERYTHING_TYPE
			].includes(type);
			this._wantsFile = [
				FILE_TYPE,
				FILE_DIR_TYPE,
				EVERYTHING_TYPE
			].includes(type);
			this._wantsEverything = type === EVERYTHING_TYPE;
			this._root = sysPath$3.resolve(root);
			this._isDirent = "Dirent" in fs$4 && !opts.alwaysStat;
			this._statsProp = this._isDirent ? "dirent" : "stats";
			this._rdOptions = {
				encoding: "utf8",
				withFileTypes: this._isDirent
			};
			this.parents = [this._exploreDir(root, 1)];
			this.reading = false;
			this.parent = void 0;
		}
		async _read(batch) {
			if (this.reading) return;
			this.reading = true;
			try {
				while (!this.destroyed && batch > 0) {
					const { path: path$6, depth: depth$1, files = [] } = this.parent || {};
					if (files.length > 0) {
						const slice = files.splice(0, batch).map((dirent) => this._formatEntry(dirent, path$6));
						for (const entry of await Promise.all(slice)) {
							if (this.destroyed) return;
							const entryType = await this._getEntryType(entry);
							if (entryType === "directory" && this._directoryFilter(entry)) {
								if (depth$1 <= this._maxDepth) this.parents.push(this._exploreDir(entry.fullPath, depth$1 + 1));
								if (this._wantsDir) {
									this.push(entry);
									batch--;
								}
							} else if ((entryType === "file" || this._includeAsFile(entry)) && this._fileFilter(entry)) {
								if (this._wantsFile) {
									this.push(entry);
									batch--;
								}
							}
						}
					} else {
						const parent = this.parents.pop();
						if (!parent) {
							this.push(null);
							break;
						}
						this.parent = await parent;
						if (this.destroyed) return;
					}
				}
			} catch (error) {
				this.destroy(error);
			} finally {
				this.reading = false;
			}
		}
		async _exploreDir(path$6, depth$1) {
			let files;
			try {
				files = await readdir$1(path$6, this._rdOptions);
			} catch (error) {
				this._onError(error);
			}
			return {
				files,
				depth: depth$1,
				path: path$6
			};
		}
		async _formatEntry(dirent, path$6) {
			let entry;
			try {
				const basename$1 = this._isDirent ? dirent.name : dirent;
				const fullPath = sysPath$3.resolve(sysPath$3.join(path$6, basename$1));
				entry = {
					path: sysPath$3.relative(this._root, fullPath),
					fullPath,
					basename: basename$1
				};
				entry[this._statsProp] = this._isDirent ? dirent : await this._stat(fullPath);
			} catch (err) {
				this._onError(err);
			}
			return entry;
		}
		_onError(err) {
			if (isNormalFlowError(err) && !this.destroyed) this.emit("warn", err);
			else this.destroy(err);
		}
		async _getEntryType(entry) {
			const stats = entry && entry[this._statsProp];
			if (!stats) return;
			if (stats.isFile()) return "file";
			if (stats.isDirectory()) return "directory";
			if (stats && stats.isSymbolicLink()) {
				const full = entry.fullPath;
				try {
					const entryRealPath = await realpath$1(full);
					const entryRealPathStats = await lstat$2(entryRealPath);
					if (entryRealPathStats.isFile()) return "file";
					if (entryRealPathStats.isDirectory()) {
						const len = entryRealPath.length;
						if (full.startsWith(entryRealPath) && full.substr(len, 1) === sysPath$3.sep) {
							const recursiveError = /* @__PURE__ */ new Error(`Circular symlink detected: "${full}" points to "${entryRealPath}"`);
							recursiveError.code = RECURSIVE_ERROR_CODE;
							return this._onError(recursiveError);
						}
						return "directory";
					}
				} catch (error) {
					this._onError(error);
				}
			}
		}
		_includeAsFile(entry) {
			const stats = entry && entry[this._statsProp];
			return stats && this._wantsEverything && !stats.isDirectory();
		}
	};
	/**
	* @typedef {Object} ReaddirpArguments
	* @property {Function=} fileFilter
	* @property {Function=} directoryFilter
	* @property {String=} type
	* @property {Number=} depth
	* @property {String=} root
	* @property {Boolean=} lstat
	* @property {Boolean=} bigint
	*/
	/**
	* Main function which ends up calling readdirRec and reads all files and directories in given root recursively.
	* @param {String} root Root directory
	* @param {ReaddirpArguments=} options Options to specify root (start directory), filters and recursion depth
	*/
	const readdirp$1 = (root, options = {}) => {
		let type = options.entryType || options.type;
		if (type === "both") type = FILE_DIR_TYPE;
		if (type) options.type = type;
		if (!root) throw new Error("readdirp: root argument is required. Usage: readdirp(root, options)");
		else if (typeof root !== "string") throw new TypeError("readdirp: root argument must be a string. Usage: readdirp(root, options)");
		else if (type && !ALL_TYPES.includes(type)) throw new Error(`readdirp: Invalid type passed. Use one of ${ALL_TYPES.join(", ")}`);
		options.root = root;
		return new ReaddirpStream(options);
	};
	const readdirpPromise = (root, options = {}) => {
		return new Promise((resolve$1, reject) => {
			const files = [];
			readdirp$1(root, options).on("data", (entry) => files.push(entry)).on("end", () => resolve$1(files)).on("error", (error) => reject(error));
		});
	};
	readdirp$1.promise = readdirpPromise;
	readdirp$1.ReaddirpStream = ReaddirpStream;
	readdirp$1.default = readdirp$1;
	module.exports = readdirp$1;
}) });

//#endregion
//#region ../../node_modules/.pnpm/normalize-path@3.0.0/node_modules/normalize-path/index.js
var require_normalize_path = /* @__PURE__ */ __commonJS({ "../../node_modules/.pnpm/normalize-path@3.0.0/node_modules/normalize-path/index.js": ((exports, module) => {
	/*!
	* normalize-path <https://github.com/jonschlinkert/normalize-path>
	*
	* Copyright (c) 2014-2018, Jon Schlinkert.
	* Released under the MIT License.
	*/
	module.exports = function(path$6, stripTrailing) {
		if (typeof path$6 !== "string") throw new TypeError("expected path to be a string");
		if (path$6 === "\\" || path$6 === "/") return "/";
		var len = path$6.length;
		if (len <= 1) return path$6;
		var prefix = "";
		if (len > 4 && path$6[3] === "\\") {
			var ch = path$6[2];
			if ((ch === "?" || ch === ".") && path$6.slice(0, 2) === "\\\\") {
				path$6 = path$6.slice(2);
				prefix = "//";
			}
		}
		var segs = path$6.split(/[/\\]+/);
		if (stripTrailing !== false && segs[segs.length - 1] === "") segs.pop();
		return prefix + segs.join("/");
	};
}) });

//#endregion
//#region ../../node_modules/.pnpm/anymatch@3.1.3/node_modules/anymatch/index.js
var require_anymatch = /* @__PURE__ */ __commonJS({ "../../node_modules/.pnpm/anymatch@3.1.3/node_modules/anymatch/index.js": ((exports, module) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	const picomatch = require_picomatch();
	const normalizePath$1 = require_normalize_path();
	/**
	* @typedef {(testString: string) => boolean} AnymatchFn
	* @typedef {string|RegExp|AnymatchFn} AnymatchPattern
	* @typedef {AnymatchPattern|AnymatchPattern[]} AnymatchMatcher
	*/
	const BANG$1 = "!";
	const DEFAULT_OPTIONS = { returnIndex: false };
	const arrify$1 = (item) => Array.isArray(item) ? item : [item];
	/**
	* @param {AnymatchPattern} matcher
	* @param {object} options
	* @returns {AnymatchFn}
	*/
	const createPattern = (matcher, options) => {
		if (typeof matcher === "function") return matcher;
		if (typeof matcher === "string") {
			const glob = picomatch(matcher, options);
			return (string) => matcher === string || glob(string);
		}
		if (matcher instanceof RegExp) return (string) => matcher.test(string);
		return (string) => false;
	};
	/**
	* @param {Array<Function>} patterns
	* @param {Array<Function>} negPatterns
	* @param {String|Array} args
	* @param {Boolean} returnIndex
	* @returns {boolean|number}
	*/
	const matchPatterns = (patterns, negPatterns, args, returnIndex) => {
		const isList = Array.isArray(args);
		const _path = isList ? args[0] : args;
		if (!isList && typeof _path !== "string") throw new TypeError("anymatch: second argument must be a string: got " + Object.prototype.toString.call(_path));
		const path$6 = normalizePath$1(_path, false);
		for (let index = 0; index < negPatterns.length; index++) {
			const nglob = negPatterns[index];
			if (nglob(path$6)) return returnIndex ? -1 : false;
		}
		const applied = isList && [path$6].concat(args.slice(1));
		for (let index = 0; index < patterns.length; index++) {
			const pattern = patterns[index];
			if (isList ? pattern(...applied) : pattern(path$6)) return returnIndex ? index : true;
		}
		return returnIndex ? -1 : false;
	};
	/**
	* @param {AnymatchMatcher} matchers
	* @param {Array|string} testString
	* @param {object} options
	* @returns {boolean|number|Function}
	*/
	const anymatch$1 = (matchers, testString, options = DEFAULT_OPTIONS) => {
		if (matchers == null) throw new TypeError("anymatch: specify first argument");
		const opts = typeof options === "boolean" ? { returnIndex: options } : options;
		const returnIndex = opts.returnIndex || false;
		const mtchers = arrify$1(matchers);
		const negatedGlobs = mtchers.filter((item) => typeof item === "string" && item.charAt(0) === BANG$1).map((item) => item.slice(1)).map((item) => picomatch(item, opts));
		const patterns = mtchers.filter((item) => typeof item !== "string" || typeof item === "string" && item.charAt(0) !== BANG$1).map((matcher) => createPattern(matcher, opts));
		if (testString == null) return (testString$1, ri = false) => {
			const returnIndex$1 = typeof ri === "boolean" ? ri : false;
			return matchPatterns(patterns, negatedGlobs, testString$1, returnIndex$1);
		};
		return matchPatterns(patterns, negatedGlobs, testString, returnIndex);
	};
	anymatch$1.default = anymatch$1;
	module.exports = anymatch$1;
}) });

//#endregion
//#region ../../node_modules/.pnpm/is-extglob@2.1.1/node_modules/is-extglob/index.js
var require_is_extglob = /* @__PURE__ */ __commonJS({ "../../node_modules/.pnpm/is-extglob@2.1.1/node_modules/is-extglob/index.js": ((exports, module) => {
	/*!
	* is-extglob <https://github.com/jonschlinkert/is-extglob>
	*
	* Copyright (c) 2014-2016, Jon Schlinkert.
	* Licensed under the MIT License.
	*/
	module.exports = function isExtglob$1(str) {
		if (typeof str !== "string" || str === "") return false;
		var match;
		while (match = /(\\).|([@?!+*]\(.*\))/g.exec(str)) {
			if (match[2]) return true;
			str = str.slice(match.index + match[0].length);
		}
		return false;
	};
}) });

//#endregion
//#region ../../node_modules/.pnpm/is-glob@4.0.3/node_modules/is-glob/index.js
var require_is_glob = /* @__PURE__ */ __commonJS({ "../../node_modules/.pnpm/is-glob@4.0.3/node_modules/is-glob/index.js": ((exports, module) => {
	/*!
	* is-glob <https://github.com/jonschlinkert/is-glob>
	*
	* Copyright (c) 2014-2017, Jon Schlinkert.
	* Released under the MIT License.
	*/
	var isExtglob = require_is_extglob();
	var chars = {
		"{": "}",
		"(": ")",
		"[": "]"
	};
	var strictCheck = function(str) {
		if (str[0] === "!") return true;
		var index = 0;
		var pipeIndex = -2;
		var closeSquareIndex = -2;
		var closeCurlyIndex = -2;
		var closeParenIndex = -2;
		var backSlashIndex = -2;
		while (index < str.length) {
			if (str[index] === "*") return true;
			if (str[index + 1] === "?" && /[\].+)]/.test(str[index])) return true;
			if (closeSquareIndex !== -1 && str[index] === "[" && str[index + 1] !== "]") {
				if (closeSquareIndex < index) closeSquareIndex = str.indexOf("]", index);
				if (closeSquareIndex > index) {
					if (backSlashIndex === -1 || backSlashIndex > closeSquareIndex) return true;
					backSlashIndex = str.indexOf("\\", index);
					if (backSlashIndex === -1 || backSlashIndex > closeSquareIndex) return true;
				}
			}
			if (closeCurlyIndex !== -1 && str[index] === "{" && str[index + 1] !== "}") {
				closeCurlyIndex = str.indexOf("}", index);
				if (closeCurlyIndex > index) {
					backSlashIndex = str.indexOf("\\", index);
					if (backSlashIndex === -1 || backSlashIndex > closeCurlyIndex) return true;
				}
			}
			if (closeParenIndex !== -1 && str[index] === "(" && str[index + 1] === "?" && /[:!=]/.test(str[index + 2]) && str[index + 3] !== ")") {
				closeParenIndex = str.indexOf(")", index);
				if (closeParenIndex > index) {
					backSlashIndex = str.indexOf("\\", index);
					if (backSlashIndex === -1 || backSlashIndex > closeParenIndex) return true;
				}
			}
			if (pipeIndex !== -1 && str[index] === "(" && str[index + 1] !== "|") {
				if (pipeIndex < index) pipeIndex = str.indexOf("|", index);
				if (pipeIndex !== -1 && str[pipeIndex + 1] !== ")") {
					closeParenIndex = str.indexOf(")", pipeIndex);
					if (closeParenIndex > pipeIndex) {
						backSlashIndex = str.indexOf("\\", pipeIndex);
						if (backSlashIndex === -1 || backSlashIndex > closeParenIndex) return true;
					}
				}
			}
			if (str[index] === "\\") {
				var open$1 = str[index + 1];
				index += 2;
				var close$1 = chars[open$1];
				if (close$1) {
					var n = str.indexOf(close$1, index);
					if (n !== -1) index = n + 1;
				}
				if (str[index] === "!") return true;
			} else index++;
		}
		return false;
	};
	var relaxedCheck = function(str) {
		if (str[0] === "!") return true;
		var index = 0;
		while (index < str.length) {
			if (/[*?{}()[\]]/.test(str[index])) return true;
			if (str[index] === "\\") {
				var open$1 = str[index + 1];
				index += 2;
				var close$1 = chars[open$1];
				if (close$1) {
					var n = str.indexOf(close$1, index);
					if (n !== -1) index = n + 1;
				}
				if (str[index] === "!") return true;
			} else index++;
		}
		return false;
	};
	module.exports = function isGlob$2(str, options) {
		if (typeof str !== "string" || str === "") return false;
		if (isExtglob(str)) return true;
		var check = strictCheck;
		if (options && options.strict === false) check = relaxedCheck;
		return check(str);
	};
}) });

//#endregion
//#region ../../node_modules/.pnpm/glob-parent@5.1.2/node_modules/glob-parent/index.js
var require_glob_parent = /* @__PURE__ */ __commonJS({ "../../node_modules/.pnpm/glob-parent@5.1.2/node_modules/glob-parent/index.js": ((exports, module) => {
	var isGlob$1 = require_is_glob();
	var pathPosixDirname = __require("path").posix.dirname;
	var isWin32 = __require("os").platform() === "win32";
	var slash = "/";
	var backslash = /\\/g;
	var enclosure = /[\{\[].*[\}\]]$/;
	var globby = /(^|[^\\])([\{\[]|\([^\)]+$)/;
	var escaped = /\\([\!\*\?\|\[\]\(\)\{\}])/g;
	/**
	* @param {string} str
	* @param {Object} opts
	* @param {boolean} [opts.flipBackslashes=true]
	* @returns {string}
	*/
	module.exports = function globParent$1(str, opts) {
		var options = Object.assign({ flipBackslashes: true }, opts);
		if (options.flipBackslashes && isWin32 && str.indexOf(slash) < 0) str = str.replace(backslash, slash);
		if (enclosure.test(str)) str += slash;
		str += "a";
		do
			str = pathPosixDirname(str);
		while (isGlob$1(str) || globby.test(str));
		return str.replace(escaped, "$1");
	};
}) });

//#endregion
//#region ../../node_modules/.pnpm/braces@3.0.3/node_modules/braces/lib/utils.js
var require_utils = /* @__PURE__ */ __commonJS({ "../../node_modules/.pnpm/braces@3.0.3/node_modules/braces/lib/utils.js": ((exports) => {
	exports.isInteger = (num) => {
		if (typeof num === "number") return Number.isInteger(num);
		if (typeof num === "string" && num.trim() !== "") return Number.isInteger(Number(num));
		return false;
	};
	/**
	* Find a node of the given type
	*/
	exports.find = (node, type) => node.nodes.find((node$1) => node$1.type === type);
	/**
	* Find a node of the given type
	*/
	exports.exceedsLimit = (min$1, max, step = 1, limit) => {
		if (limit === false) return false;
		if (!exports.isInteger(min$1) || !exports.isInteger(max)) return false;
		return (Number(max) - Number(min$1)) / Number(step) >= limit;
	};
	/**
	* Escape the given node with '\\' before node.value
	*/
	exports.escapeNode = (block, n = 0, type) => {
		const node = block.nodes[n];
		if (!node) return;
		if (type && node.type === type || node.type === "open" || node.type === "close") {
			if (node.escaped !== true) {
				node.value = "\\" + node.value;
				node.escaped = true;
			}
		}
	};
	/**
	* Returns true if the given brace node should be enclosed in literal braces
	*/
	exports.encloseBrace = (node) => {
		if (node.type !== "brace") return false;
		if (node.commas >> 0 + node.ranges >> 0 === 0) {
			node.invalid = true;
			return true;
		}
		return false;
	};
	/**
	* Returns true if a brace node is invalid.
	*/
	exports.isInvalidBrace = (block) => {
		if (block.type !== "brace") return false;
		if (block.invalid === true || block.dollar) return true;
		if (block.commas >> 0 + block.ranges >> 0 === 0) {
			block.invalid = true;
			return true;
		}
		if (block.open !== true || block.close !== true) {
			block.invalid = true;
			return true;
		}
		return false;
	};
	/**
	* Returns true if a node is an open or close node
	*/
	exports.isOpenOrClose = (node) => {
		if (node.type === "open" || node.type === "close") return true;
		return node.open === true || node.close === true;
	};
	/**
	* Reduce an array of text nodes.
	*/
	exports.reduce = (nodes) => nodes.reduce((acc, node) => {
		if (node.type === "text") acc.push(node.value);
		if (node.type === "range") node.type = "text";
		return acc;
	}, []);
	/**
	* Flatten an array
	*/
	exports.flatten = (...args) => {
		const result = [];
		const flat = (arr) => {
			for (let i = 0; i < arr.length; i++) {
				const ele = arr[i];
				if (Array.isArray(ele)) {
					flat(ele);
					continue;
				}
				if (ele !== void 0) result.push(ele);
			}
			return result;
		};
		flat(args);
		return result;
	};
}) });

//#endregion
//#region ../../node_modules/.pnpm/braces@3.0.3/node_modules/braces/lib/stringify.js
var require_stringify = /* @__PURE__ */ __commonJS({ "../../node_modules/.pnpm/braces@3.0.3/node_modules/braces/lib/stringify.js": ((exports, module) => {
	const utils$2 = require_utils();
	module.exports = (ast, options = {}) => {
		const stringify$4 = (node, parent = {}) => {
			const invalidBlock = options.escapeInvalid && utils$2.isInvalidBrace(parent);
			const invalidNode = node.invalid === true && options.escapeInvalid === true;
			let output = "";
			if (node.value) {
				if ((invalidBlock || invalidNode) && utils$2.isOpenOrClose(node)) return "\\" + node.value;
				return node.value;
			}
			if (node.value) return node.value;
			if (node.nodes) for (const child of node.nodes) output += stringify$4(child);
			return output;
		};
		return stringify$4(ast);
	};
}) });

//#endregion
//#region ../../node_modules/.pnpm/is-number@7.0.0/node_modules/is-number/index.js
var require_is_number = /* @__PURE__ */ __commonJS({ "../../node_modules/.pnpm/is-number@7.0.0/node_modules/is-number/index.js": ((exports, module) => {
	module.exports = function(num) {
		if (typeof num === "number") return num - num === 0;
		if (typeof num === "string" && num.trim() !== "") return Number.isFinite ? Number.isFinite(+num) : isFinite(+num);
		return false;
	};
}) });

//#endregion
//#region ../../node_modules/.pnpm/to-regex-range@5.0.1/node_modules/to-regex-range/index.js
var require_to_regex_range = /* @__PURE__ */ __commonJS({ "../../node_modules/.pnpm/to-regex-range@5.0.1/node_modules/to-regex-range/index.js": ((exports, module) => {
	const isNumber$1 = require_is_number();
	const toRegexRange$1 = (min$1, max, options) => {
		if (isNumber$1(min$1) === false) throw new TypeError("toRegexRange: expected the first argument to be a number");
		if (max === void 0 || min$1 === max) return String(min$1);
		if (isNumber$1(max) === false) throw new TypeError("toRegexRange: expected the second argument to be a number.");
		let opts = {
			relaxZeros: true,
			...options
		};
		if (typeof opts.strictZeros === "boolean") opts.relaxZeros = opts.strictZeros === false;
		let relax = String(opts.relaxZeros);
		let shorthand = String(opts.shorthand);
		let capture = String(opts.capture);
		let wrap = String(opts.wrap);
		let cacheKey = min$1 + ":" + max + "=" + relax + shorthand + capture + wrap;
		if (toRegexRange$1.cache.hasOwnProperty(cacheKey)) return toRegexRange$1.cache[cacheKey].result;
		let a = Math.min(min$1, max);
		let b = Math.max(min$1, max);
		if (Math.abs(a - b) === 1) {
			let result = min$1 + "|" + max;
			if (opts.capture) return `(${result})`;
			if (opts.wrap === false) return result;
			return `(?:${result})`;
		}
		let isPadded = hasPadding(min$1) || hasPadding(max);
		let state = {
			min: min$1,
			max,
			a,
			b
		};
		let positives = [];
		let negatives = [];
		if (isPadded) {
			state.isPadded = isPadded;
			state.maxLen = String(state.max).length;
		}
		if (a < 0) {
			let newMin = b < 0 ? Math.abs(b) : 1;
			negatives = splitToPatterns(newMin, Math.abs(a), state, opts);
			a = state.a = 0;
		}
		if (b >= 0) positives = splitToPatterns(a, b, state, opts);
		state.negatives = negatives;
		state.positives = positives;
		state.result = collatePatterns(negatives, positives, opts);
		if (opts.capture === true) state.result = `(${state.result})`;
		else if (opts.wrap !== false && positives.length + negatives.length > 1) state.result = `(?:${state.result})`;
		toRegexRange$1.cache[cacheKey] = state;
		return state.result;
	};
	function collatePatterns(neg, pos, options) {
		let onlyNegative = filterPatterns(neg, pos, "-", false, options) || [];
		let onlyPositive = filterPatterns(pos, neg, "", false, options) || [];
		let intersected = filterPatterns(neg, pos, "-?", true, options) || [];
		let subpatterns = onlyNegative.concat(intersected).concat(onlyPositive);
		return subpatterns.join("|");
	}
	function splitToRanges(min$1, max) {
		let nines = 1;
		let zeros$1 = 1;
		let stop = countNines(min$1, nines);
		let stops = new Set([max]);
		while (min$1 <= stop && stop <= max) {
			stops.add(stop);
			nines += 1;
			stop = countNines(min$1, nines);
		}
		stop = countZeros(max + 1, zeros$1) - 1;
		while (min$1 < stop && stop <= max) {
			stops.add(stop);
			zeros$1 += 1;
			stop = countZeros(max + 1, zeros$1) - 1;
		}
		stops = [...stops];
		stops.sort(compare);
		return stops;
	}
	/**
	* Convert a range to a regex pattern
	* @param {Number} `start`
	* @param {Number} `stop`
	* @return {String}
	*/
	function rangeToPattern(start, stop, options) {
		if (start === stop) return {
			pattern: start,
			count: [],
			digits: 0
		};
		let zipped = zip(start, stop);
		let digits = zipped.length;
		let pattern = "";
		let count = 0;
		for (let i = 0; i < digits; i++) {
			let [startDigit, stopDigit] = zipped[i];
			if (startDigit === stopDigit) pattern += startDigit;
			else if (startDigit !== "0" || stopDigit !== "9") pattern += toCharacterClass(startDigit, stopDigit, options);
			else count++;
		}
		if (count) pattern += options.shorthand === true ? "\\d" : "[0-9]";
		return {
			pattern,
			count: [count],
			digits
		};
	}
	function splitToPatterns(min$1, max, tok, options) {
		let ranges = splitToRanges(min$1, max);
		let tokens = [];
		let start = min$1;
		let prev;
		for (let i = 0; i < ranges.length; i++) {
			let max$1 = ranges[i];
			let obj = rangeToPattern(String(start), String(max$1), options);
			let zeros$1 = "";
			if (!tok.isPadded && prev && prev.pattern === obj.pattern) {
				if (prev.count.length > 1) prev.count.pop();
				prev.count.push(obj.count[0]);
				prev.string = prev.pattern + toQuantifier(prev.count);
				start = max$1 + 1;
				continue;
			}
			if (tok.isPadded) zeros$1 = padZeros(max$1, tok, options);
			obj.string = zeros$1 + obj.pattern + toQuantifier(obj.count);
			tokens.push(obj);
			start = max$1 + 1;
			prev = obj;
		}
		return tokens;
	}
	function filterPatterns(arr, comparison, prefix, intersection, options) {
		let result = [];
		for (let ele of arr) {
			let { string } = ele;
			if (!intersection && !contains(comparison, "string", string)) result.push(prefix + string);
			if (intersection && contains(comparison, "string", string)) result.push(prefix + string);
		}
		return result;
	}
	/**
	* Zip strings
	*/
	function zip(a, b) {
		let arr = [];
		for (let i = 0; i < a.length; i++) arr.push([a[i], b[i]]);
		return arr;
	}
	function compare(a, b) {
		return a > b ? 1 : b > a ? -1 : 0;
	}
	function contains(arr, key, val) {
		return arr.some((ele) => ele[key] === val);
	}
	function countNines(min$1, len) {
		return Number(String(min$1).slice(0, -len) + "9".repeat(len));
	}
	function countZeros(integer, zeros$1) {
		return integer - integer % Math.pow(10, zeros$1);
	}
	function toQuantifier(digits) {
		let [start = 0, stop = ""] = digits;
		if (stop || start > 1) return `{${start + (stop ? "," + stop : "")}}`;
		return "";
	}
	function toCharacterClass(a, b, options) {
		return `[${a}${b - a === 1 ? "" : "-"}${b}]`;
	}
	function hasPadding(str) {
		return /^-?(0+)\d/.test(str);
	}
	function padZeros(value, tok, options) {
		if (!tok.isPadded) return value;
		let diff = Math.abs(tok.maxLen - String(value).length);
		let relax = options.relaxZeros !== false;
		switch (diff) {
			case 0: return "";
			case 1: return relax ? "0?" : "0";
			case 2: return relax ? "0{0,2}" : "00";
			default: return relax ? `0{0,${diff}}` : `0{${diff}}`;
		}
	}
	/**
	* Cache
	*/
	toRegexRange$1.cache = {};
	toRegexRange$1.clearCache = () => toRegexRange$1.cache = {};
	/**
	* Expose `toRegexRange`
	*/
	module.exports = toRegexRange$1;
}) });

//#endregion
//#region ../../node_modules/.pnpm/fill-range@7.1.1/node_modules/fill-range/index.js
var require_fill_range = /* @__PURE__ */ __commonJS({ "../../node_modules/.pnpm/fill-range@7.1.1/node_modules/fill-range/index.js": ((exports, module) => {
	const util = __require("util");
	const toRegexRange = require_to_regex_range();
	const isObject = (val) => val !== null && typeof val === "object" && !Array.isArray(val);
	const transform = (toNumber) => {
		return (value) => toNumber === true ? Number(value) : String(value);
	};
	const isValidValue = (value) => {
		return typeof value === "number" || typeof value === "string" && value !== "";
	};
	const isNumber = (num) => Number.isInteger(+num);
	const zeros = (input) => {
		let value = `${input}`;
		let index = -1;
		if (value[0] === "-") value = value.slice(1);
		if (value === "0") return false;
		while (value[++index] === "0");
		return index > 0;
	};
	const stringify$3 = (start, end, options) => {
		if (typeof start === "string" || typeof end === "string") return true;
		return options.stringify === true;
	};
	const pad = (input, maxLength, toNumber) => {
		if (maxLength > 0) {
			let dash = input[0] === "-" ? "-" : "";
			if (dash) input = input.slice(1);
			input = dash + input.padStart(dash ? maxLength - 1 : maxLength, "0");
		}
		if (toNumber === false) return String(input);
		return input;
	};
	const toMaxLen = (input, maxLength) => {
		let negative = input[0] === "-" ? "-" : "";
		if (negative) {
			input = input.slice(1);
			maxLength--;
		}
		while (input.length < maxLength) input = "0" + input;
		return negative ? "-" + input : input;
	};
	const toSequence = (parts, options, maxLen) => {
		parts.negatives.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
		parts.positives.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
		let prefix = options.capture ? "" : "?:";
		let positives = "";
		let negatives = "";
		let result;
		if (parts.positives.length) positives = parts.positives.map((v) => toMaxLen(String(v), maxLen)).join("|");
		if (parts.negatives.length) negatives = `-(${prefix}${parts.negatives.map((v) => toMaxLen(String(v), maxLen)).join("|")})`;
		if (positives && negatives) result = `${positives}|${negatives}`;
		else result = positives || negatives;
		if (options.wrap) return `(${prefix}${result})`;
		return result;
	};
	const toRange = (a, b, isNumbers, options) => {
		if (isNumbers) return toRegexRange(a, b, {
			wrap: false,
			...options
		});
		let start = String.fromCharCode(a);
		if (a === b) return start;
		let stop = String.fromCharCode(b);
		return `[${start}-${stop}]`;
	};
	const toRegex = (start, end, options) => {
		if (Array.isArray(start)) {
			let wrap = options.wrap === true;
			let prefix = options.capture ? "" : "?:";
			return wrap ? `(${prefix}${start.join("|")})` : start.join("|");
		}
		return toRegexRange(start, end, options);
	};
	const rangeError = (...args) => {
		return /* @__PURE__ */ new RangeError("Invalid range arguments: " + util.inspect(...args));
	};
	const invalidRange = (start, end, options) => {
		if (options.strictRanges === true) throw rangeError([start, end]);
		return [];
	};
	const invalidStep = (step, options) => {
		if (options.strictRanges === true) throw new TypeError(`Expected step "${step}" to be a number`);
		return [];
	};
	const fillNumbers = (start, end, step = 1, options = {}) => {
		let a = Number(start);
		let b = Number(end);
		if (!Number.isInteger(a) || !Number.isInteger(b)) {
			if (options.strictRanges === true) throw rangeError([start, end]);
			return [];
		}
		if (a === 0) a = 0;
		if (b === 0) b = 0;
		let descending = a > b;
		let startString = String(start);
		let endString = String(end);
		let stepString = String(step);
		step = Math.max(Math.abs(step), 1);
		let padded = zeros(startString) || zeros(endString) || zeros(stepString);
		let maxLen = padded ? Math.max(startString.length, endString.length, stepString.length) : 0;
		let toNumber = padded === false && stringify$3(start, end, options) === false;
		let format$1 = options.transform || transform(toNumber);
		if (options.toRegex && step === 1) return toRange(toMaxLen(start, maxLen), toMaxLen(end, maxLen), true, options);
		let parts = {
			negatives: [],
			positives: []
		};
		let push = (num) => parts[num < 0 ? "negatives" : "positives"].push(Math.abs(num));
		let range = [];
		let index = 0;
		while (descending ? a >= b : a <= b) {
			if (options.toRegex === true && step > 1) push(a);
			else range.push(pad(format$1(a, index), maxLen, toNumber));
			a = descending ? a - step : a + step;
			index++;
		}
		if (options.toRegex === true) return step > 1 ? toSequence(parts, options, maxLen) : toRegex(range, null, {
			wrap: false,
			...options
		});
		return range;
	};
	const fillLetters = (start, end, step = 1, options = {}) => {
		if (!isNumber(start) && start.length > 1 || !isNumber(end) && end.length > 1) return invalidRange(start, end, options);
		let format$1 = options.transform || ((val) => String.fromCharCode(val));
		let a = `${start}`.charCodeAt(0);
		let b = `${end}`.charCodeAt(0);
		let descending = a > b;
		let min$1 = Math.min(a, b);
		let max = Math.max(a, b);
		if (options.toRegex && step === 1) return toRange(min$1, max, false, options);
		let range = [];
		let index = 0;
		while (descending ? a >= b : a <= b) {
			range.push(format$1(a, index));
			a = descending ? a - step : a + step;
			index++;
		}
		if (options.toRegex === true) return toRegex(range, null, {
			wrap: false,
			options
		});
		return range;
	};
	const fill$2 = (start, end, step, options = {}) => {
		if (end == null && isValidValue(start)) return [start];
		if (!isValidValue(start) || !isValidValue(end)) return invalidRange(start, end, options);
		if (typeof step === "function") return fill$2(start, end, 1, { transform: step });
		if (isObject(step)) return fill$2(start, end, 0, step);
		let opts = { ...options };
		if (opts.capture === true) opts.wrap = true;
		step = step || opts.step || 1;
		if (!isNumber(step)) {
			if (step != null && !isObject(step)) return invalidStep(step, opts);
			return fill$2(start, end, 1, step);
		}
		if (isNumber(start) && isNumber(end)) return fillNumbers(start, end, step, opts);
		return fillLetters(start, end, Math.max(Math.abs(step), 1), opts);
	};
	module.exports = fill$2;
}) });

//#endregion
//#region ../../node_modules/.pnpm/braces@3.0.3/node_modules/braces/lib/compile.js
var require_compile = /* @__PURE__ */ __commonJS({ "../../node_modules/.pnpm/braces@3.0.3/node_modules/braces/lib/compile.js": ((exports, module) => {
	const fill$1 = require_fill_range();
	const utils$1 = require_utils();
	const compile$1 = (ast, options = {}) => {
		const walk = (node, parent = {}) => {
			const invalidBlock = utils$1.isInvalidBrace(parent);
			const invalidNode = node.invalid === true && options.escapeInvalid === true;
			const invalid = invalidBlock === true || invalidNode === true;
			const prefix = options.escapeInvalid === true ? "\\" : "";
			let output = "";
			if (node.isOpen === true) return prefix + node.value;
			if (node.isClose === true) {
				console.log("node.isClose", prefix, node.value);
				return prefix + node.value;
			}
			if (node.type === "open") return invalid ? prefix + node.value : "(";
			if (node.type === "close") return invalid ? prefix + node.value : ")";
			if (node.type === "comma") return node.prev.type === "comma" ? "" : invalid ? node.value : "|";
			if (node.value) return node.value;
			if (node.nodes && node.ranges > 0) {
				const args = utils$1.reduce(node.nodes);
				const range = fill$1(...args, {
					...options,
					wrap: false,
					toRegex: true,
					strictZeros: true
				});
				if (range.length !== 0) return args.length > 1 && range.length > 1 ? `(${range})` : range;
			}
			if (node.nodes) for (const child of node.nodes) output += walk(child, node);
			return output;
		};
		return walk(ast);
	};
	module.exports = compile$1;
}) });

//#endregion
//#region ../../node_modules/.pnpm/braces@3.0.3/node_modules/braces/lib/expand.js
var require_expand = /* @__PURE__ */ __commonJS({ "../../node_modules/.pnpm/braces@3.0.3/node_modules/braces/lib/expand.js": ((exports, module) => {
	const fill = require_fill_range();
	const stringify$2 = require_stringify();
	const utils = require_utils();
	const append = (queue = "", stash = "", enclose = false) => {
		const result = [];
		queue = [].concat(queue);
		stash = [].concat(stash);
		if (!stash.length) return queue;
		if (!queue.length) return enclose ? utils.flatten(stash).map((ele) => `{${ele}}`) : stash;
		for (const item of queue) if (Array.isArray(item)) for (const value of item) result.push(append(value, stash, enclose));
		else for (let ele of stash) {
			if (enclose === true && typeof ele === "string") ele = `{${ele}}`;
			result.push(Array.isArray(ele) ? append(item, ele, enclose) : item + ele);
		}
		return utils.flatten(result);
	};
	const expand$1 = (ast, options = {}) => {
		const rangeLimit = options.rangeLimit === void 0 ? 1e3 : options.rangeLimit;
		const walk = (node, parent = {}) => {
			node.queue = [];
			let p = parent;
			let q = parent.queue;
			while (p.type !== "brace" && p.type !== "root" && p.parent) {
				p = p.parent;
				q = p.queue;
			}
			if (node.invalid || node.dollar) {
				q.push(append(q.pop(), stringify$2(node, options)));
				return;
			}
			if (node.type === "brace" && node.invalid !== true && node.nodes.length === 2) {
				q.push(append(q.pop(), ["{}"]));
				return;
			}
			if (node.nodes && node.ranges > 0) {
				const args = utils.reduce(node.nodes);
				if (utils.exceedsLimit(...args, options.step, rangeLimit)) throw new RangeError("expanded array length exceeds range limit. Use options.rangeLimit to increase or disable the limit.");
				let range = fill(...args, options);
				if (range.length === 0) range = stringify$2(node, options);
				q.push(append(q.pop(), range));
				node.nodes = [];
				return;
			}
			const enclose = utils.encloseBrace(node);
			let queue = node.queue;
			let block = node;
			while (block.type !== "brace" && block.type !== "root" && block.parent) {
				block = block.parent;
				queue = block.queue;
			}
			for (let i = 0; i < node.nodes.length; i++) {
				const child = node.nodes[i];
				if (child.type === "comma" && node.type === "brace") {
					if (i === 1) queue.push("");
					queue.push("");
					continue;
				}
				if (child.type === "close") {
					q.push(append(q.pop(), queue, enclose));
					continue;
				}
				if (child.value && child.type !== "open") {
					queue.push(append(queue.pop(), child.value));
					continue;
				}
				if (child.nodes) walk(child, node);
			}
			return queue;
		};
		return utils.flatten(walk(ast));
	};
	module.exports = expand$1;
}) });

//#endregion
//#region ../../node_modules/.pnpm/braces@3.0.3/node_modules/braces/lib/constants.js
var require_constants$1 = /* @__PURE__ */ __commonJS({ "../../node_modules/.pnpm/braces@3.0.3/node_modules/braces/lib/constants.js": ((exports, module) => {
	module.exports = {
		MAX_LENGTH: 1e4,
		CHAR_0: "0",
		CHAR_9: "9",
		CHAR_UPPERCASE_A: "A",
		CHAR_LOWERCASE_A: "a",
		CHAR_UPPERCASE_Z: "Z",
		CHAR_LOWERCASE_Z: "z",
		CHAR_LEFT_PARENTHESES: "(",
		CHAR_RIGHT_PARENTHESES: ")",
		CHAR_ASTERISK: "*",
		CHAR_AMPERSAND: "&",
		CHAR_AT: "@",
		CHAR_BACKSLASH: "\\",
		CHAR_BACKTICK: "`",
		CHAR_CARRIAGE_RETURN: "\r",
		CHAR_CIRCUMFLEX_ACCENT: "^",
		CHAR_COLON: ":",
		CHAR_COMMA: ",",
		CHAR_DOLLAR: "$",
		CHAR_DOT: ".",
		CHAR_DOUBLE_QUOTE: "\"",
		CHAR_EQUAL: "=",
		CHAR_EXCLAMATION_MARK: "!",
		CHAR_FORM_FEED: "\f",
		CHAR_FORWARD_SLASH: "/",
		CHAR_HASH: "#",
		CHAR_HYPHEN_MINUS: "-",
		CHAR_LEFT_ANGLE_BRACKET: "<",
		CHAR_LEFT_CURLY_BRACE: "{",
		CHAR_LEFT_SQUARE_BRACKET: "[",
		CHAR_LINE_FEED: "\n",
		CHAR_NO_BREAK_SPACE: "\xA0",
		CHAR_PERCENT: "%",
		CHAR_PLUS: "+",
		CHAR_QUESTION_MARK: "?",
		CHAR_RIGHT_ANGLE_BRACKET: ">",
		CHAR_RIGHT_CURLY_BRACE: "}",
		CHAR_RIGHT_SQUARE_BRACKET: "]",
		CHAR_SEMICOLON: ";",
		CHAR_SINGLE_QUOTE: "'",
		CHAR_SPACE: " ",
		CHAR_TAB: "	",
		CHAR_UNDERSCORE: "_",
		CHAR_VERTICAL_LINE: "|",
		CHAR_ZERO_WIDTH_NOBREAK_SPACE: "﻿"
	};
}) });

//#endregion
//#region ../../node_modules/.pnpm/braces@3.0.3/node_modules/braces/lib/parse.js
var require_parse = /* @__PURE__ */ __commonJS({ "../../node_modules/.pnpm/braces@3.0.3/node_modules/braces/lib/parse.js": ((exports, module) => {
	const stringify$1 = require_stringify();
	/**
	* Constants
	*/
	const { MAX_LENGTH, CHAR_BACKSLASH, CHAR_BACKTICK, CHAR_COMMA, CHAR_DOT, CHAR_LEFT_PARENTHESES, CHAR_RIGHT_PARENTHESES, CHAR_LEFT_CURLY_BRACE, CHAR_RIGHT_CURLY_BRACE, CHAR_LEFT_SQUARE_BRACKET, CHAR_RIGHT_SQUARE_BRACKET, CHAR_DOUBLE_QUOTE, CHAR_SINGLE_QUOTE, CHAR_NO_BREAK_SPACE, CHAR_ZERO_WIDTH_NOBREAK_SPACE } = require_constants$1();
	/**
	* parse
	*/
	const parse$2 = (input, options = {}) => {
		if (typeof input !== "string") throw new TypeError("Expected a string");
		const opts = options || {};
		const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
		if (input.length > max) throw new SyntaxError(`Input length (${input.length}), exceeds max characters (${max})`);
		const ast = {
			type: "root",
			input,
			nodes: []
		};
		const stack = [ast];
		let block = ast;
		let prev = ast;
		let brackets = 0;
		const length = input.length;
		let index = 0;
		let depth$1 = 0;
		let value;
		/**
		* Helpers
		*/
		const advance = () => input[index++];
		const push = (node) => {
			if (node.type === "text" && prev.type === "dot") prev.type = "text";
			if (prev && prev.type === "text" && node.type === "text") {
				prev.value += node.value;
				return;
			}
			block.nodes.push(node);
			node.parent = block;
			node.prev = prev;
			prev = node;
			return node;
		};
		push({ type: "bos" });
		while (index < length) {
			block = stack[stack.length - 1];
			value = advance();
			/**
			* Invalid chars
			*/
			if (value === CHAR_ZERO_WIDTH_NOBREAK_SPACE || value === CHAR_NO_BREAK_SPACE) continue;
			/**
			* Escaped chars
			*/
			if (value === CHAR_BACKSLASH) {
				push({
					type: "text",
					value: (options.keepEscaping ? value : "") + advance()
				});
				continue;
			}
			/**
			* Right square bracket (literal): ']'
			*/
			if (value === CHAR_RIGHT_SQUARE_BRACKET) {
				push({
					type: "text",
					value: "\\" + value
				});
				continue;
			}
			/**
			* Left square bracket: '['
			*/
			if (value === CHAR_LEFT_SQUARE_BRACKET) {
				brackets++;
				let next;
				while (index < length && (next = advance())) {
					value += next;
					if (next === CHAR_LEFT_SQUARE_BRACKET) {
						brackets++;
						continue;
					}
					if (next === CHAR_BACKSLASH) {
						value += advance();
						continue;
					}
					if (next === CHAR_RIGHT_SQUARE_BRACKET) {
						brackets--;
						if (brackets === 0) break;
					}
				}
				push({
					type: "text",
					value
				});
				continue;
			}
			/**
			* Parentheses
			*/
			if (value === CHAR_LEFT_PARENTHESES) {
				block = push({
					type: "paren",
					nodes: []
				});
				stack.push(block);
				push({
					type: "text",
					value
				});
				continue;
			}
			if (value === CHAR_RIGHT_PARENTHESES) {
				if (block.type !== "paren") {
					push({
						type: "text",
						value
					});
					continue;
				}
				block = stack.pop();
				push({
					type: "text",
					value
				});
				block = stack[stack.length - 1];
				continue;
			}
			/**
			* Quotes: '|"|`
			*/
			if (value === CHAR_DOUBLE_QUOTE || value === CHAR_SINGLE_QUOTE || value === CHAR_BACKTICK) {
				const open$1 = value;
				let next;
				if (options.keepQuotes !== true) value = "";
				while (index < length && (next = advance())) {
					if (next === CHAR_BACKSLASH) {
						value += next + advance();
						continue;
					}
					if (next === open$1) {
						if (options.keepQuotes === true) value += next;
						break;
					}
					value += next;
				}
				push({
					type: "text",
					value
				});
				continue;
			}
			/**
			* Left curly brace: '{'
			*/
			if (value === CHAR_LEFT_CURLY_BRACE) {
				depth$1++;
				const dollar = prev.value && prev.value.slice(-1) === "$" || block.dollar === true;
				const brace = {
					type: "brace",
					open: true,
					close: false,
					dollar,
					depth: depth$1,
					commas: 0,
					ranges: 0,
					nodes: []
				};
				block = push(brace);
				stack.push(block);
				push({
					type: "open",
					value
				});
				continue;
			}
			/**
			* Right curly brace: '}'
			*/
			if (value === CHAR_RIGHT_CURLY_BRACE) {
				if (block.type !== "brace") {
					push({
						type: "text",
						value
					});
					continue;
				}
				const type = "close";
				block = stack.pop();
				block.close = true;
				push({
					type,
					value
				});
				depth$1--;
				block = stack[stack.length - 1];
				continue;
			}
			/**
			* Comma: ','
			*/
			if (value === CHAR_COMMA && depth$1 > 0) {
				if (block.ranges > 0) {
					block.ranges = 0;
					const open$1 = block.nodes.shift();
					block.nodes = [open$1, {
						type: "text",
						value: stringify$1(block)
					}];
				}
				push({
					type: "comma",
					value
				});
				block.commas++;
				continue;
			}
			/**
			* Dot: '.'
			*/
			if (value === CHAR_DOT && depth$1 > 0 && block.commas === 0) {
				const siblings = block.nodes;
				if (depth$1 === 0 || siblings.length === 0) {
					push({
						type: "text",
						value
					});
					continue;
				}
				if (prev.type === "dot") {
					block.range = [];
					prev.value += value;
					prev.type = "range";
					if (block.nodes.length !== 3 && block.nodes.length !== 5) {
						block.invalid = true;
						block.ranges = 0;
						prev.type = "text";
						continue;
					}
					block.ranges++;
					block.args = [];
					continue;
				}
				if (prev.type === "range") {
					siblings.pop();
					const before = siblings[siblings.length - 1];
					before.value += prev.value + value;
					prev = before;
					block.ranges--;
					continue;
				}
				push({
					type: "dot",
					value
				});
				continue;
			}
			/**
			* Text
			*/
			push({
				type: "text",
				value
			});
		}
		do {
			block = stack.pop();
			if (block.type !== "root") {
				block.nodes.forEach((node) => {
					if (!node.nodes) {
						if (node.type === "open") node.isOpen = true;
						if (node.type === "close") node.isClose = true;
						if (!node.nodes) node.type = "text";
						node.invalid = true;
					}
				});
				const parent = stack[stack.length - 1];
				const index$1 = parent.nodes.indexOf(block);
				parent.nodes.splice(index$1, 1, ...block.nodes);
			}
		} while (stack.length > 0);
		push({ type: "eos" });
		return ast;
	};
	module.exports = parse$2;
}) });

//#endregion
//#region ../../node_modules/.pnpm/braces@3.0.3/node_modules/braces/index.js
var require_braces = /* @__PURE__ */ __commonJS({ "../../node_modules/.pnpm/braces@3.0.3/node_modules/braces/index.js": ((exports, module) => {
	const stringify = require_stringify();
	const compile = require_compile();
	const expand = require_expand();
	const parse$1 = require_parse();
	/**
	* Expand the given pattern or create a regex-compatible string.
	*
	* ```js
	* const braces = require('braces');
	* console.log(braces('{a,b,c}', { compile: true })); //=> ['(a|b|c)']
	* console.log(braces('{a,b,c}')); //=> ['a', 'b', 'c']
	* ```
	* @param {String} `str`
	* @param {Object} `options`
	* @return {String}
	* @api public
	*/
	const braces$1 = (input, options = {}) => {
		let output = [];
		if (Array.isArray(input)) for (const pattern of input) {
			const result = braces$1.create(pattern, options);
			if (Array.isArray(result)) output.push(...result);
			else output.push(result);
		}
		else output = [].concat(braces$1.create(input, options));
		if (options && options.expand === true && options.nodupes === true) output = [...new Set(output)];
		return output;
	};
	/**
	* Parse the given `str` with the given `options`.
	*
	* ```js
	* // braces.parse(pattern, [, options]);
	* const ast = braces.parse('a/{b,c}/d');
	* console.log(ast);
	* ```
	* @param {String} pattern Brace pattern to parse
	* @param {Object} options
	* @return {Object} Returns an AST
	* @api public
	*/
	braces$1.parse = (input, options = {}) => parse$1(input, options);
	/**
	* Creates a braces string from an AST, or an AST node.
	*
	* ```js
	* const braces = require('braces');
	* let ast = braces.parse('foo/{a,b}/bar');
	* console.log(stringify(ast.nodes[2])); //=> '{a,b}'
	* ```
	* @param {String} `input` Brace pattern or AST.
	* @param {Object} `options`
	* @return {Array} Returns an array of expanded values.
	* @api public
	*/
	braces$1.stringify = (input, options = {}) => {
		if (typeof input === "string") return stringify(braces$1.parse(input, options), options);
		return stringify(input, options);
	};
	/**
	* Compiles a brace pattern into a regex-compatible, optimized string.
	* This method is called by the main [braces](#braces) function by default.
	*
	* ```js
	* const braces = require('braces');
	* console.log(braces.compile('a/{b,c}/d'));
	* //=> ['a/(b|c)/d']
	* ```
	* @param {String} `input` Brace pattern or AST.
	* @param {Object} `options`
	* @return {Array} Returns an array of expanded values.
	* @api public
	*/
	braces$1.compile = (input, options = {}) => {
		if (typeof input === "string") input = braces$1.parse(input, options);
		return compile(input, options);
	};
	/**
	* Expands a brace pattern into an array. This method is called by the
	* main [braces](#braces) function when `options.expand` is true. Before
	* using this method it's recommended that you read the [performance notes](#performance))
	* and advantages of using [.compile](#compile) instead.
	*
	* ```js
	* const braces = require('braces');
	* console.log(braces.expand('a/{b,c}/d'));
	* //=> ['a/b/d', 'a/c/d'];
	* ```
	* @param {String} `pattern` Brace pattern
	* @param {Object} `options`
	* @return {Array} Returns an array of expanded values.
	* @api public
	*/
	braces$1.expand = (input, options = {}) => {
		if (typeof input === "string") input = braces$1.parse(input, options);
		let result = expand(input, options);
		if (options.noempty === true) result = result.filter(Boolean);
		if (options.nodupes === true) result = [...new Set(result)];
		return result;
	};
	/**
	* Processes a brace pattern and returns either an expanded array
	* (if `options.expand` is true), a highly optimized regex-compatible string.
	* This method is called by the main [braces](#braces) function.
	*
	* ```js
	* const braces = require('braces');
	* console.log(braces.create('user-{200..300}/project-{a,b,c}-{1..10}'))
	* //=> 'user-(20[0-9]|2[1-9][0-9]|300)/project-(a|b|c)-([1-9]|10)'
	* ```
	* @param {String} `pattern` Brace pattern
	* @param {Object} `options`
	* @return {Array} Returns an array of expanded values.
	* @api public
	*/
	braces$1.create = (input, options = {}) => {
		if (input === "" || input.length < 3) return [input];
		return options.expand !== true ? braces$1.compile(input, options) : braces$1.expand(input, options);
	};
	/**
	* Expose "braces"
	*/
	module.exports = braces$1;
}) });

//#endregion
//#region ../../node_modules/.pnpm/binary-extensions@2.3.0/node_modules/binary-extensions/binary-extensions.json
var require_binary_extensions$1 = /* @__PURE__ */ __commonJS({ "../../node_modules/.pnpm/binary-extensions@2.3.0/node_modules/binary-extensions/binary-extensions.json": ((exports, module) => {
	module.exports = [
		"3dm",
		"3ds",
		"3g2",
		"3gp",
		"7z",
		"a",
		"aac",
		"adp",
		"afdesign",
		"afphoto",
		"afpub",
		"ai",
		"aif",
		"aiff",
		"alz",
		"ape",
		"apk",
		"appimage",
		"ar",
		"arj",
		"asf",
		"au",
		"avi",
		"bak",
		"baml",
		"bh",
		"bin",
		"bk",
		"bmp",
		"btif",
		"bz2",
		"bzip2",
		"cab",
		"caf",
		"cgm",
		"class",
		"cmx",
		"cpio",
		"cr2",
		"cur",
		"dat",
		"dcm",
		"deb",
		"dex",
		"djvu",
		"dll",
		"dmg",
		"dng",
		"doc",
		"docm",
		"docx",
		"dot",
		"dotm",
		"dra",
		"DS_Store",
		"dsk",
		"dts",
		"dtshd",
		"dvb",
		"dwg",
		"dxf",
		"ecelp4800",
		"ecelp7470",
		"ecelp9600",
		"egg",
		"eol",
		"eot",
		"epub",
		"exe",
		"f4v",
		"fbs",
		"fh",
		"fla",
		"flac",
		"flatpak",
		"fli",
		"flv",
		"fpx",
		"fst",
		"fvt",
		"g3",
		"gh",
		"gif",
		"graffle",
		"gz",
		"gzip",
		"h261",
		"h263",
		"h264",
		"icns",
		"ico",
		"ief",
		"img",
		"ipa",
		"iso",
		"jar",
		"jpeg",
		"jpg",
		"jpgv",
		"jpm",
		"jxr",
		"key",
		"ktx",
		"lha",
		"lib",
		"lvp",
		"lz",
		"lzh",
		"lzma",
		"lzo",
		"m3u",
		"m4a",
		"m4v",
		"mar",
		"mdi",
		"mht",
		"mid",
		"midi",
		"mj2",
		"mka",
		"mkv",
		"mmr",
		"mng",
		"mobi",
		"mov",
		"movie",
		"mp3",
		"mp4",
		"mp4a",
		"mpeg",
		"mpg",
		"mpga",
		"mxu",
		"nef",
		"npx",
		"numbers",
		"nupkg",
		"o",
		"odp",
		"ods",
		"odt",
		"oga",
		"ogg",
		"ogv",
		"otf",
		"ott",
		"pages",
		"pbm",
		"pcx",
		"pdb",
		"pdf",
		"pea",
		"pgm",
		"pic",
		"png",
		"pnm",
		"pot",
		"potm",
		"potx",
		"ppa",
		"ppam",
		"ppm",
		"pps",
		"ppsm",
		"ppsx",
		"ppt",
		"pptm",
		"pptx",
		"psd",
		"pya",
		"pyc",
		"pyo",
		"pyv",
		"qt",
		"rar",
		"ras",
		"raw",
		"resources",
		"rgb",
		"rip",
		"rlc",
		"rmf",
		"rmvb",
		"rpm",
		"rtf",
		"rz",
		"s3m",
		"s7z",
		"scpt",
		"sgi",
		"shar",
		"snap",
		"sil",
		"sketch",
		"slk",
		"smv",
		"snk",
		"so",
		"stl",
		"suo",
		"sub",
		"swf",
		"tar",
		"tbz",
		"tbz2",
		"tga",
		"tgz",
		"thmx",
		"tif",
		"tiff",
		"tlz",
		"ttc",
		"ttf",
		"txz",
		"udf",
		"uvh",
		"uvi",
		"uvm",
		"uvp",
		"uvs",
		"uvu",
		"viv",
		"vob",
		"war",
		"wav",
		"wax",
		"wbmp",
		"wdp",
		"weba",
		"webm",
		"webp",
		"whl",
		"wim",
		"wm",
		"wma",
		"wmv",
		"wmx",
		"woff",
		"woff2",
		"wrm",
		"wvx",
		"xbm",
		"xif",
		"xla",
		"xlam",
		"xls",
		"xlsb",
		"xlsm",
		"xlsx",
		"xlt",
		"xltm",
		"xltx",
		"xm",
		"xmind",
		"xpi",
		"xpm",
		"xwd",
		"xz",
		"z",
		"zip",
		"zipx"
	];
}) });

//#endregion
//#region ../../node_modules/.pnpm/binary-extensions@2.3.0/node_modules/binary-extensions/index.js
var require_binary_extensions = /* @__PURE__ */ __commonJS({ "../../node_modules/.pnpm/binary-extensions@2.3.0/node_modules/binary-extensions/index.js": ((exports, module) => {
	module.exports = require_binary_extensions$1();
}) });

//#endregion
//#region ../../node_modules/.pnpm/is-binary-path@2.1.0/node_modules/is-binary-path/index.js
var require_is_binary_path = /* @__PURE__ */ __commonJS({ "../../node_modules/.pnpm/is-binary-path@2.1.0/node_modules/is-binary-path/index.js": ((exports, module) => {
	const path$2 = __require("path");
	const binaryExtensions = require_binary_extensions();
	const extensions = new Set(binaryExtensions);
	module.exports = (filePath) => extensions.has(path$2.extname(filePath).slice(1).toLowerCase());
}) });

//#endregion
//#region ../../node_modules/.pnpm/chokidar@3.6.0/node_modules/chokidar/lib/constants.js
var require_constants = /* @__PURE__ */ __commonJS({ "../../node_modules/.pnpm/chokidar@3.6.0/node_modules/chokidar/lib/constants.js": ((exports) => {
	const { sep } = __require("path");
	const { platform } = process;
	const os$1 = __require("os");
	exports.EV_ALL = "all";
	exports.EV_READY = "ready";
	exports.EV_ADD = "add";
	exports.EV_CHANGE = "change";
	exports.EV_ADD_DIR = "addDir";
	exports.EV_UNLINK = "unlink";
	exports.EV_UNLINK_DIR = "unlinkDir";
	exports.EV_RAW = "raw";
	exports.EV_ERROR = "error";
	exports.STR_DATA = "data";
	exports.STR_END = "end";
	exports.STR_CLOSE = "close";
	exports.FSEVENT_CREATED = "created";
	exports.FSEVENT_MODIFIED = "modified";
	exports.FSEVENT_DELETED = "deleted";
	exports.FSEVENT_MOVED = "moved";
	exports.FSEVENT_CLONED = "cloned";
	exports.FSEVENT_UNKNOWN = "unknown";
	exports.FSEVENT_FLAG_MUST_SCAN_SUBDIRS = 1;
	exports.FSEVENT_TYPE_FILE = "file";
	exports.FSEVENT_TYPE_DIRECTORY = "directory";
	exports.FSEVENT_TYPE_SYMLINK = "symlink";
	exports.KEY_LISTENERS = "listeners";
	exports.KEY_ERR = "errHandlers";
	exports.KEY_RAW = "rawEmitters";
	exports.HANDLER_KEYS = [
		exports.KEY_LISTENERS,
		exports.KEY_ERR,
		exports.KEY_RAW
	];
	exports.DOT_SLASH = `.${sep}`;
	exports.BACK_SLASH_RE = /\\/g;
	exports.DOUBLE_SLASH_RE = /\/\//;
	exports.SLASH_OR_BACK_SLASH_RE = /[/\\]/;
	exports.DOT_RE = /\..*\.(sw[px])$|~$|\.subl.*\.tmp/;
	exports.REPLACER_RE = /^\.[/\\]/;
	exports.SLASH = "/";
	exports.SLASH_SLASH = "//";
	exports.BRACE_START = "{";
	exports.BANG = "!";
	exports.ONE_DOT = ".";
	exports.TWO_DOTS = "..";
	exports.STAR = "*";
	exports.GLOBSTAR = "**";
	exports.ROOT_GLOBSTAR = "/**/*";
	exports.SLASH_GLOBSTAR = "/**";
	exports.DIR_SUFFIX = "Dir";
	exports.ANYMATCH_OPTS = { dot: true };
	exports.STRING_TYPE = "string";
	exports.FUNCTION_TYPE = "function";
	exports.EMPTY_STR = "";
	exports.EMPTY_FN = () => {};
	exports.IDENTITY_FN = (val) => val;
	exports.isWindows = platform === "win32";
	exports.isMacos = platform === "darwin";
	exports.isLinux = platform === "linux";
	exports.isIBMi = os$1.type() === "OS400";
}) });

//#endregion
//#region ../../node_modules/.pnpm/chokidar@3.6.0/node_modules/chokidar/lib/nodefs-handler.js
var require_nodefs_handler = /* @__PURE__ */ __commonJS({ "../../node_modules/.pnpm/chokidar@3.6.0/node_modules/chokidar/lib/nodefs-handler.js": ((exports, module) => {
	const fs$3 = __require("fs");
	const sysPath$2 = __require("path");
	const { promisify: promisify$2 } = __require("util");
	const isBinaryPath = require_is_binary_path();
	const { isWindows: isWindows$1, isLinux, EMPTY_FN: EMPTY_FN$2, EMPTY_STR: EMPTY_STR$1, KEY_LISTENERS, KEY_ERR, KEY_RAW, HANDLER_KEYS, EV_CHANGE: EV_CHANGE$2, EV_ADD: EV_ADD$2, EV_ADD_DIR: EV_ADD_DIR$2, EV_ERROR: EV_ERROR$2, STR_DATA: STR_DATA$1, STR_END: STR_END$2, BRACE_START: BRACE_START$1, STAR } = require_constants();
	const THROTTLE_MODE_WATCH = "watch";
	const open = promisify$2(fs$3.open);
	const stat$3 = promisify$2(fs$3.stat);
	const lstat$1 = promisify$2(fs$3.lstat);
	const close = promisify$2(fs$3.close);
	const fsrealpath = promisify$2(fs$3.realpath);
	const statMethods$1 = {
		lstat: lstat$1,
		stat: stat$3
	};
	const foreach = (val, fn) => {
		if (val instanceof Set) val.forEach(fn);
		else fn(val);
	};
	const addAndConvert = (main, prop, item) => {
		let container = main[prop];
		if (!(container instanceof Set)) main[prop] = container = new Set([container]);
		container.add(item);
	};
	const clearItem = (cont) => (key) => {
		const set = cont[key];
		if (set instanceof Set) set.clear();
		else delete cont[key];
	};
	const delFromSet = (main, prop, item) => {
		const container = main[prop];
		if (container instanceof Set) container.delete(item);
		else if (container === item) delete main[prop];
	};
	const isEmptySet = (val) => val instanceof Set ? val.size === 0 : !val;
	/**
	* @typedef {String} Path
	*/
	/**
	* @typedef {Object} FsWatchContainer
	* @property {Set} listeners
	* @property {Set} errHandlers
	* @property {Set} rawEmitters
	* @property {fs.FSWatcher=} watcher
	* @property {Boolean=} watcherUnusable
	*/
	/**
	* @type {Map<String,FsWatchContainer>}
	*/
	const FsWatchInstances = /* @__PURE__ */ new Map();
	/**
	* Instantiates the fs_watch interface
	* @param {String} path to be watched
	* @param {Object} options to be passed to fs_watch
	* @param {Function} listener main event handler
	* @param {Function} errHandler emits info about errors
	* @param {Function} emitRaw emits raw event data
	* @returns {fs.FSWatcher} new fsevents instance
	*/
	function createFsWatchInstance(path$6, options, listener, errHandler, emitRaw) {
		const handleEvent = (rawEvent, evPath) => {
			listener(path$6);
			emitRaw(rawEvent, evPath, { watchedPath: path$6 });
			if (evPath && path$6 !== evPath) fsWatchBroadcast(sysPath$2.resolve(path$6, evPath), KEY_LISTENERS, sysPath$2.join(path$6, evPath));
		};
		try {
			return fs$3.watch(path$6, options, handleEvent);
		} catch (error) {
			errHandler(error);
		}
	}
	/**
	* Helper for passing fs_watch event data to a collection of listeners
	* @param {Path} fullPath absolute path bound to fs_watch instance
	* @param {String} type listener type
	* @param {*=} val1 arguments to be passed to listeners
	* @param {*=} val2
	* @param {*=} val3
	*/
	const fsWatchBroadcast = (fullPath, type, val1, val2, val3) => {
		const cont = FsWatchInstances.get(fullPath);
		if (!cont) return;
		foreach(cont[type], (listener) => {
			listener(val1, val2, val3);
		});
	};
	/**
	* Instantiates the fs_watch interface or binds listeners
	* to an existing one covering the same file system entry
	* @param {String} path
	* @param {String} fullPath absolute path
	* @param {Object} options to be passed to fs_watch
	* @param {Object} handlers container for event listener functions
	*/
	const setFsWatchListener = (path$6, fullPath, options, handlers) => {
		const { listener, errHandler, rawEmitter } = handlers;
		let cont = FsWatchInstances.get(fullPath);
		/** @type {fs.FSWatcher=} */
		let watcher;
		if (!options.persistent) {
			watcher = createFsWatchInstance(path$6, options, listener, errHandler, rawEmitter);
			return watcher.close.bind(watcher);
		}
		if (cont) {
			addAndConvert(cont, KEY_LISTENERS, listener);
			addAndConvert(cont, KEY_ERR, errHandler);
			addAndConvert(cont, KEY_RAW, rawEmitter);
		} else {
			watcher = createFsWatchInstance(path$6, options, fsWatchBroadcast.bind(null, fullPath, KEY_LISTENERS), errHandler, fsWatchBroadcast.bind(null, fullPath, KEY_RAW));
			if (!watcher) return;
			watcher.on(EV_ERROR$2, async (error) => {
				const broadcastErr = fsWatchBroadcast.bind(null, fullPath, KEY_ERR);
				cont.watcherUnusable = true;
				if (isWindows$1 && error.code === "EPERM") try {
					const fd = await open(path$6, "r");
					await close(fd);
					broadcastErr(error);
				} catch (err) {}
				else broadcastErr(error);
			});
			cont = {
				listeners: listener,
				errHandlers: errHandler,
				rawEmitters: rawEmitter,
				watcher
			};
			FsWatchInstances.set(fullPath, cont);
		}
		return () => {
			delFromSet(cont, KEY_LISTENERS, listener);
			delFromSet(cont, KEY_ERR, errHandler);
			delFromSet(cont, KEY_RAW, rawEmitter);
			if (isEmptySet(cont.listeners)) {
				cont.watcher.close();
				FsWatchInstances.delete(fullPath);
				HANDLER_KEYS.forEach(clearItem(cont));
				cont.watcher = void 0;
				Object.freeze(cont);
			}
		};
	};
	const FsWatchFileInstances = /* @__PURE__ */ new Map();
	/**
	* Instantiates the fs_watchFile interface or binds listeners
	* to an existing one covering the same file system entry
	* @param {String} path to be watched
	* @param {String} fullPath absolute path
	* @param {Object} options options to be passed to fs_watchFile
	* @param {Object} handlers container for event listener functions
	* @returns {Function} closer
	*/
	const setFsWatchFileListener = (path$6, fullPath, options, handlers) => {
		const { listener, rawEmitter } = handlers;
		let cont = FsWatchFileInstances.get(fullPath);
		const copts = cont && cont.options;
		if (copts && (copts.persistent < options.persistent || copts.interval > options.interval)) {
			cont.listeners;
			cont.rawEmitters;
			fs$3.unwatchFile(fullPath);
			cont = void 0;
		}
		if (cont) {
			addAndConvert(cont, KEY_LISTENERS, listener);
			addAndConvert(cont, KEY_RAW, rawEmitter);
		} else {
			cont = {
				listeners: listener,
				rawEmitters: rawEmitter,
				options,
				watcher: fs$3.watchFile(fullPath, options, (curr, prev) => {
					foreach(cont.rawEmitters, (rawEmitter$1) => {
						rawEmitter$1(EV_CHANGE$2, fullPath, {
							curr,
							prev
						});
					});
					const currmtime = curr.mtimeMs;
					if (curr.size !== prev.size || currmtime > prev.mtimeMs || currmtime === 0) foreach(cont.listeners, (listener$1) => listener$1(path$6, curr));
				})
			};
			FsWatchFileInstances.set(fullPath, cont);
		}
		return () => {
			delFromSet(cont, KEY_LISTENERS, listener);
			delFromSet(cont, KEY_RAW, rawEmitter);
			if (isEmptySet(cont.listeners)) {
				FsWatchFileInstances.delete(fullPath);
				fs$3.unwatchFile(fullPath);
				cont.options = cont.watcher = void 0;
				Object.freeze(cont);
			}
		};
	};
	/**
	* @mixin
	*/
	var NodeFsHandler$1 = class {
		/**
		* @param {import("../index").FSWatcher} fsW
		*/
		constructor(fsW) {
			this.fsw = fsW;
			this._boundHandleError = (error) => fsW._handleError(error);
		}
		/**
		* Watch file for changes with fs_watchFile or fs_watch.
		* @param {String} path to file or dir
		* @param {Function} listener on fs change
		* @returns {Function} closer for the watcher instance
		*/
		_watchWithNodeFs(path$6, listener) {
			const opts = this.fsw.options;
			const directory = sysPath$2.dirname(path$6);
			const basename$1 = sysPath$2.basename(path$6);
			const parent = this.fsw._getWatchedDir(directory);
			parent.add(basename$1);
			const absolutePath = sysPath$2.resolve(path$6);
			const options = { persistent: opts.persistent };
			if (!listener) listener = EMPTY_FN$2;
			let closer;
			if (opts.usePolling) {
				options.interval = opts.enableBinaryInterval && isBinaryPath(basename$1) ? opts.binaryInterval : opts.interval;
				closer = setFsWatchFileListener(path$6, absolutePath, options, {
					listener,
					rawEmitter: this.fsw._emitRaw
				});
			} else closer = setFsWatchListener(path$6, absolutePath, options, {
				listener,
				errHandler: this._boundHandleError,
				rawEmitter: this.fsw._emitRaw
			});
			return closer;
		}
		/**
		* Watch a file and emit add event if warranted.
		* @param {Path} file Path
		* @param {fs.Stats} stats result of fs_stat
		* @param {Boolean} initialAdd was the file added at watch instantiation?
		* @returns {Function} closer for the watcher instance
		*/
		_handleFile(file, stats, initialAdd) {
			if (this.fsw.closed) return;
			const dirname$1 = sysPath$2.dirname(file);
			const basename$1 = sysPath$2.basename(file);
			const parent = this.fsw._getWatchedDir(dirname$1);
			let prevStats = stats;
			if (parent.has(basename$1)) return;
			const listener = async (path$6, newStats) => {
				if (!this.fsw._throttle(THROTTLE_MODE_WATCH, file, 5)) return;
				if (!newStats || newStats.mtimeMs === 0) try {
					const newStats$1 = await stat$3(file);
					if (this.fsw.closed) return;
					const at = newStats$1.atimeMs;
					const mt = newStats$1.mtimeMs;
					if (!at || at <= mt || mt !== prevStats.mtimeMs) this.fsw._emit(EV_CHANGE$2, file, newStats$1);
					if (isLinux && prevStats.ino !== newStats$1.ino) {
						this.fsw._closeFile(path$6);
						prevStats = newStats$1;
						this.fsw._addPathCloser(path$6, this._watchWithNodeFs(file, listener));
					} else prevStats = newStats$1;
				} catch (error) {
					this.fsw._remove(dirname$1, basename$1);
				}
				else if (parent.has(basename$1)) {
					const at = newStats.atimeMs;
					const mt = newStats.mtimeMs;
					if (!at || at <= mt || mt !== prevStats.mtimeMs) this.fsw._emit(EV_CHANGE$2, file, newStats);
					prevStats = newStats;
				}
			};
			const closer = this._watchWithNodeFs(file, listener);
			if (!(initialAdd && this.fsw.options.ignoreInitial) && this.fsw._isntIgnored(file)) {
				if (!this.fsw._throttle(EV_ADD$2, file, 0)) return;
				this.fsw._emit(EV_ADD$2, file, stats);
			}
			return closer;
		}
		/**
		* Handle symlinks encountered while reading a dir.
		* @param {Object} entry returned by readdirp
		* @param {String} directory path of dir being read
		* @param {String} path of this item
		* @param {String} item basename of this item
		* @returns {Promise<Boolean>} true if no more processing is needed for this entry.
		*/
		async _handleSymlink(entry, directory, path$6, item) {
			if (this.fsw.closed) return;
			const full = entry.fullPath;
			const dir = this.fsw._getWatchedDir(directory);
			if (!this.fsw.options.followSymlinks) {
				this.fsw._incrReadyCount();
				let linkPath;
				try {
					linkPath = await fsrealpath(path$6);
				} catch (e) {
					this.fsw._emitReady();
					return true;
				}
				if (this.fsw.closed) return;
				if (dir.has(item)) {
					if (this.fsw._symlinkPaths.get(full) !== linkPath) {
						this.fsw._symlinkPaths.set(full, linkPath);
						this.fsw._emit(EV_CHANGE$2, path$6, entry.stats);
					}
				} else {
					dir.add(item);
					this.fsw._symlinkPaths.set(full, linkPath);
					this.fsw._emit(EV_ADD$2, path$6, entry.stats);
				}
				this.fsw._emitReady();
				return true;
			}
			if (this.fsw._symlinkPaths.has(full)) return true;
			this.fsw._symlinkPaths.set(full, true);
		}
		_handleRead(directory, initialAdd, wh, target, dir, depth$1, throttler) {
			directory = sysPath$2.join(directory, EMPTY_STR$1);
			if (!wh.hasGlob) {
				throttler = this.fsw._throttle("readdir", directory, 1e3);
				if (!throttler) return;
			}
			const previous = this.fsw._getWatchedDir(wh.path);
			const current = /* @__PURE__ */ new Set();
			let stream = this.fsw._readdirp(directory, {
				fileFilter: (entry) => wh.filterPath(entry),
				directoryFilter: (entry) => wh.filterDir(entry),
				depth: 0
			}).on(STR_DATA$1, async (entry) => {
				if (this.fsw.closed) {
					stream = void 0;
					return;
				}
				const item = entry.path;
				let path$6 = sysPath$2.join(directory, item);
				current.add(item);
				if (entry.stats.isSymbolicLink() && await this._handleSymlink(entry, directory, path$6, item)) return;
				if (this.fsw.closed) {
					stream = void 0;
					return;
				}
				if (item === target || !target && !previous.has(item)) {
					this.fsw._incrReadyCount();
					path$6 = sysPath$2.join(dir, sysPath$2.relative(dir, path$6));
					this._addToNodeFs(path$6, initialAdd, wh, depth$1 + 1);
				}
			}).on(EV_ERROR$2, this._boundHandleError);
			return new Promise((resolve$1) => stream.once(STR_END$2, () => {
				if (this.fsw.closed) {
					stream = void 0;
					return;
				}
				const wasThrottled = throttler ? throttler.clear() : false;
				resolve$1();
				previous.getChildren().filter((item) => {
					return item !== directory && !current.has(item) && (!wh.hasGlob || wh.filterPath({ fullPath: sysPath$2.resolve(directory, item) }));
				}).forEach((item) => {
					this.fsw._remove(directory, item);
				});
				stream = void 0;
				if (wasThrottled) this._handleRead(directory, false, wh, target, dir, depth$1, throttler);
			}));
		}
		/**
		* Read directory to add / remove files from `@watched` list and re-read it on change.
		* @param {String} dir fs path
		* @param {fs.Stats} stats
		* @param {Boolean} initialAdd
		* @param {Number} depth relative to user-supplied path
		* @param {String} target child path targeted for watch
		* @param {Object} wh Common watch helpers for this path
		* @param {String} realpath
		* @returns {Promise<Function>} closer for the watcher instance.
		*/
		async _handleDir(dir, stats, initialAdd, depth$1, target, wh, realpath$2) {
			const parentDir = this.fsw._getWatchedDir(sysPath$2.dirname(dir));
			const tracked = parentDir.has(sysPath$2.basename(dir));
			if (!(initialAdd && this.fsw.options.ignoreInitial) && !target && !tracked) {
				if (!wh.hasGlob || wh.globFilter(dir)) this.fsw._emit(EV_ADD_DIR$2, dir, stats);
			}
			parentDir.add(sysPath$2.basename(dir));
			this.fsw._getWatchedDir(dir);
			let throttler;
			let closer;
			const oDepth = this.fsw.options.depth;
			if ((oDepth == null || depth$1 <= oDepth) && !this.fsw._symlinkPaths.has(realpath$2)) {
				if (!target) {
					await this._handleRead(dir, initialAdd, wh, target, dir, depth$1, throttler);
					if (this.fsw.closed) return;
				}
				closer = this._watchWithNodeFs(dir, (dirPath, stats$1) => {
					if (stats$1 && stats$1.mtimeMs === 0) return;
					this._handleRead(dirPath, false, wh, target, dir, depth$1, throttler);
				});
			}
			return closer;
		}
		/**
		* Handle added file, directory, or glob pattern.
		* Delegates call to _handleFile / _handleDir after checks.
		* @param {String} path to file or ir
		* @param {Boolean} initialAdd was the file added at watch instantiation?
		* @param {Object} priorWh depth relative to user-supplied path
		* @param {Number} depth Child path actually targeted for watch
		* @param {String=} target Child path actually targeted for watch
		* @returns {Promise}
		*/
		async _addToNodeFs(path$6, initialAdd, priorWh, depth$1, target) {
			const ready = this.fsw._emitReady;
			if (this.fsw._isIgnored(path$6) || this.fsw.closed) {
				ready();
				return false;
			}
			const wh = this.fsw._getWatchHelpers(path$6, depth$1);
			if (!wh.hasGlob && priorWh) {
				wh.hasGlob = priorWh.hasGlob;
				wh.globFilter = priorWh.globFilter;
				wh.filterPath = (entry) => priorWh.filterPath(entry);
				wh.filterDir = (entry) => priorWh.filterDir(entry);
			}
			try {
				const stats = await statMethods$1[wh.statMethod](wh.watchPath);
				if (this.fsw.closed) return;
				if (this.fsw._isIgnored(wh.watchPath, stats)) {
					ready();
					return false;
				}
				const follow = this.fsw.options.followSymlinks && !path$6.includes(STAR) && !path$6.includes(BRACE_START$1);
				let closer;
				if (stats.isDirectory()) {
					const absPath = sysPath$2.resolve(path$6);
					const targetPath = follow ? await fsrealpath(path$6) : path$6;
					if (this.fsw.closed) return;
					closer = await this._handleDir(wh.watchPath, stats, initialAdd, depth$1, target, wh, targetPath);
					if (this.fsw.closed) return;
					if (absPath !== targetPath && targetPath !== void 0) this.fsw._symlinkPaths.set(absPath, targetPath);
				} else if (stats.isSymbolicLink()) {
					const targetPath = follow ? await fsrealpath(path$6) : path$6;
					if (this.fsw.closed) return;
					const parent = sysPath$2.dirname(wh.watchPath);
					this.fsw._getWatchedDir(parent).add(wh.watchPath);
					this.fsw._emit(EV_ADD$2, wh.watchPath, stats);
					closer = await this._handleDir(parent, stats, initialAdd, depth$1, path$6, wh, targetPath);
					if (this.fsw.closed) return;
					if (targetPath !== void 0) this.fsw._symlinkPaths.set(sysPath$2.resolve(path$6), targetPath);
				} else closer = this._handleFile(wh.watchPath, stats, initialAdd);
				ready();
				this.fsw._addPathCloser(path$6, closer);
				return false;
			} catch (error) {
				if (this.fsw._handleError(error)) {
					ready();
					return path$6;
				}
			}
		}
	};
	module.exports = NodeFsHandler$1;
}) });

//#endregion
//#region ../../node_modules/.pnpm/chokidar@3.6.0/node_modules/chokidar/lib/fsevents-handler.js
var require_fsevents_handler = /* @__PURE__ */ __commonJS({ "../../node_modules/.pnpm/chokidar@3.6.0/node_modules/chokidar/lib/fsevents-handler.js": ((exports, module) => {
	const fs$2 = __require("fs");
	const sysPath$1 = __require("path");
	const { promisify: promisify$1 } = __require("util");
	let fsevents;
	try {
		fsevents = __require("fsevents");
	} catch (error) {
		if (process.env.CHOKIDAR_PRINT_FSEVENTS_REQUIRE_ERROR) console.error(error);
	}
	if (fsevents) {
		const mtch = process.version.match(/v(\d+)\.(\d+)/);
		if (mtch && mtch[1] && mtch[2]) {
			const maj$1 = Number.parseInt(mtch[1], 10);
			const min$1 = Number.parseInt(mtch[2], 10);
			if (maj$1 === 8 && min$1 < 16) fsevents = void 0;
		}
	}
	const { EV_ADD: EV_ADD$1, EV_CHANGE: EV_CHANGE$1, EV_ADD_DIR: EV_ADD_DIR$1, EV_UNLINK: EV_UNLINK$1, EV_ERROR: EV_ERROR$1, STR_DATA, STR_END: STR_END$1, FSEVENT_CREATED, FSEVENT_MODIFIED, FSEVENT_DELETED, FSEVENT_MOVED, FSEVENT_UNKNOWN, FSEVENT_FLAG_MUST_SCAN_SUBDIRS, FSEVENT_TYPE_FILE, FSEVENT_TYPE_DIRECTORY, FSEVENT_TYPE_SYMLINK, ROOT_GLOBSTAR, DIR_SUFFIX, DOT_SLASH, FUNCTION_TYPE: FUNCTION_TYPE$1, EMPTY_FN: EMPTY_FN$1, IDENTITY_FN } = require_constants();
	const Depth = (value) => isNaN(value) ? {} : { depth: value };
	const stat$2 = promisify$1(fs$2.stat);
	const lstat = promisify$1(fs$2.lstat);
	const realpath = promisify$1(fs$2.realpath);
	const statMethods = {
		stat: stat$2,
		lstat
	};
	/**
	* @typedef {String} Path
	*/
	/**
	* @typedef {Object} FsEventsWatchContainer
	* @property {Set<Function>} listeners
	* @property {Function} rawEmitter
	* @property {{stop: Function}} watcher
	*/
	/**
	* Object to hold per-process fsevents instances (may be shared across chokidar FSWatcher instances)
	* @type {Map<Path,FsEventsWatchContainer>}
	*/
	const FSEventsWatchers = /* @__PURE__ */ new Map();
	const consolidateThreshhold = 10;
	const wrongEventFlags = new Set([
		69888,
		70400,
		71424,
		72704,
		73472,
		131328,
		131840,
		262912
	]);
	/**
	* Instantiates the fsevents interface
	* @param {Path} path path to be watched
	* @param {Function} callback called when fsevents is bound and ready
	* @returns {{stop: Function}} new fsevents instance
	*/
	const createFSEventsInstance = (path$6, callback) => {
		const stop = fsevents.watch(path$6, callback);
		return { stop };
	};
	/**
	* Instantiates the fsevents interface or binds listeners to an existing one covering
	* the same file tree.
	* @param {Path} path           - to be watched
	* @param {Path} realPath       - real path for symlinks
	* @param {Function} listener   - called when fsevents emits events
	* @param {Function} rawEmitter - passes data to listeners of the 'raw' event
	* @returns {Function} closer
	*/
	function setFSEventsListener(path$6, realPath, listener, rawEmitter) {
		let watchPath = sysPath$1.extname(realPath) ? sysPath$1.dirname(realPath) : realPath;
		const parentPath = sysPath$1.dirname(watchPath);
		let cont = FSEventsWatchers.get(watchPath);
		if (couldConsolidate(parentPath)) watchPath = parentPath;
		const resolvedPath = sysPath$1.resolve(path$6);
		const hasSymlink = resolvedPath !== realPath;
		const filteredListener = (fullPath, flags, info) => {
			if (hasSymlink) fullPath = fullPath.replace(realPath, resolvedPath);
			if (fullPath === resolvedPath || !fullPath.indexOf(resolvedPath + sysPath$1.sep)) listener(fullPath, flags, info);
		};
		let watchedParent = false;
		for (const watchedPath of FSEventsWatchers.keys()) if (realPath.indexOf(sysPath$1.resolve(watchedPath) + sysPath$1.sep) === 0) {
			watchPath = watchedPath;
			cont = FSEventsWatchers.get(watchPath);
			watchedParent = true;
			break;
		}
		if (cont || watchedParent) cont.listeners.add(filteredListener);
		else {
			cont = {
				listeners: new Set([filteredListener]),
				rawEmitter,
				watcher: createFSEventsInstance(watchPath, (fullPath, flags) => {
					if (!cont.listeners.size) return;
					if (flags & FSEVENT_FLAG_MUST_SCAN_SUBDIRS) return;
					const info = fsevents.getInfo(fullPath, flags);
					cont.listeners.forEach((list) => {
						list(fullPath, flags, info);
					});
					cont.rawEmitter(info.event, fullPath, info);
				})
			};
			FSEventsWatchers.set(watchPath, cont);
		}
		return () => {
			const lst = cont.listeners;
			lst.delete(filteredListener);
			if (!lst.size) {
				FSEventsWatchers.delete(watchPath);
				if (cont.watcher) return cont.watcher.stop().then(() => {
					cont.rawEmitter = cont.watcher = void 0;
					Object.freeze(cont);
				});
			}
		};
	}
	const couldConsolidate = (path$6) => {
		let count = 0;
		for (const watchPath of FSEventsWatchers.keys()) if (watchPath.indexOf(path$6) === 0) {
			count++;
			if (count >= consolidateThreshhold) return true;
		}
		return false;
	};
	const canUse = () => fsevents && FSEventsWatchers.size < 128;
	const calcDepth = (path$6, root) => {
		let i = 0;
		while (!path$6.indexOf(root) && (path$6 = sysPath$1.dirname(path$6)) !== root) i++;
		return i;
	};
	const sameTypes = (info, stats) => info.type === FSEVENT_TYPE_DIRECTORY && stats.isDirectory() || info.type === FSEVENT_TYPE_SYMLINK && stats.isSymbolicLink() || info.type === FSEVENT_TYPE_FILE && stats.isFile();
	/**
	* @mixin
	*/
	var FsEventsHandler$1 = class {
		/**
		* @param {import('../index').FSWatcher} fsw
		*/
		constructor(fsw) {
			this.fsw = fsw;
		}
		checkIgnored(path$6, stats) {
			const ipaths = this.fsw._ignoredPaths;
			if (this.fsw._isIgnored(path$6, stats)) {
				ipaths.add(path$6);
				if (stats && stats.isDirectory()) ipaths.add(path$6 + ROOT_GLOBSTAR);
				return true;
			}
			ipaths.delete(path$6);
			ipaths.delete(path$6 + ROOT_GLOBSTAR);
		}
		addOrChange(path$6, fullPath, realPath, parent, watchedDir, item, info, opts) {
			const event = watchedDir.has(item) ? EV_CHANGE$1 : EV_ADD$1;
			this.handleEvent(event, path$6, fullPath, realPath, parent, watchedDir, item, info, opts);
		}
		async checkExists(path$6, fullPath, realPath, parent, watchedDir, item, info, opts) {
			try {
				const stats = await stat$2(path$6);
				if (this.fsw.closed) return;
				if (sameTypes(info, stats)) this.addOrChange(path$6, fullPath, realPath, parent, watchedDir, item, info, opts);
				else this.handleEvent(EV_UNLINK$1, path$6, fullPath, realPath, parent, watchedDir, item, info, opts);
			} catch (error) {
				if (error.code === "EACCES") this.addOrChange(path$6, fullPath, realPath, parent, watchedDir, item, info, opts);
				else this.handleEvent(EV_UNLINK$1, path$6, fullPath, realPath, parent, watchedDir, item, info, opts);
			}
		}
		handleEvent(event, path$6, fullPath, realPath, parent, watchedDir, item, info, opts) {
			if (this.fsw.closed || this.checkIgnored(path$6)) return;
			if (event === EV_UNLINK$1) {
				const isDirectory$1 = info.type === FSEVENT_TYPE_DIRECTORY;
				if (isDirectory$1 || watchedDir.has(item)) this.fsw._remove(parent, item, isDirectory$1);
			} else {
				if (event === EV_ADD$1) {
					if (info.type === FSEVENT_TYPE_DIRECTORY) this.fsw._getWatchedDir(path$6);
					if (info.type === FSEVENT_TYPE_SYMLINK && opts.followSymlinks) {
						const curDepth = opts.depth === void 0 ? void 0 : calcDepth(fullPath, realPath) + 1;
						return this._addToFsEvents(path$6, false, true, curDepth);
					}
					this.fsw._getWatchedDir(parent).add(item);
				}
				/**
				* @type {'add'|'addDir'|'unlink'|'unlinkDir'}
				*/
				const eventName = info.type === FSEVENT_TYPE_DIRECTORY ? event + DIR_SUFFIX : event;
				this.fsw._emit(eventName, path$6);
				if (eventName === EV_ADD_DIR$1) this._addToFsEvents(path$6, false, true);
			}
		}
		/**
		* Handle symlinks encountered during directory scan
		* @param {String} watchPath  - file/dir path to be watched with fsevents
		* @param {String} realPath   - real path (in case of symlinks)
		* @param {Function} transform  - path transformer
		* @param {Function} globFilter - path filter in case a glob pattern was provided
		* @returns {Function} closer for the watcher instance
		*/
		_watchWithFsEvents(watchPath, realPath, transform$1, globFilter) {
			if (this.fsw.closed || this.fsw._isIgnored(watchPath)) return;
			const opts = this.fsw.options;
			const watchCallback = async (fullPath, flags, info) => {
				if (this.fsw.closed) return;
				if (opts.depth !== void 0 && calcDepth(fullPath, realPath) > opts.depth) return;
				const path$6 = transform$1(sysPath$1.join(watchPath, sysPath$1.relative(watchPath, fullPath)));
				if (globFilter && !globFilter(path$6)) return;
				const parent = sysPath$1.dirname(path$6);
				const item = sysPath$1.basename(path$6);
				const watchedDir = this.fsw._getWatchedDir(info.type === FSEVENT_TYPE_DIRECTORY ? path$6 : parent);
				if (wrongEventFlags.has(flags) || info.event === FSEVENT_UNKNOWN) if (typeof opts.ignored === FUNCTION_TYPE$1) {
					let stats;
					try {
						stats = await stat$2(path$6);
					} catch (error) {}
					if (this.fsw.closed) return;
					if (this.checkIgnored(path$6, stats)) return;
					if (sameTypes(info, stats)) this.addOrChange(path$6, fullPath, realPath, parent, watchedDir, item, info, opts);
					else this.handleEvent(EV_UNLINK$1, path$6, fullPath, realPath, parent, watchedDir, item, info, opts);
				} else this.checkExists(path$6, fullPath, realPath, parent, watchedDir, item, info, opts);
				else switch (info.event) {
					case FSEVENT_CREATED:
					case FSEVENT_MODIFIED: return this.addOrChange(path$6, fullPath, realPath, parent, watchedDir, item, info, opts);
					case FSEVENT_DELETED:
					case FSEVENT_MOVED: return this.checkExists(path$6, fullPath, realPath, parent, watchedDir, item, info, opts);
				}
			};
			const closer = setFSEventsListener(watchPath, realPath, watchCallback, this.fsw._emitRaw);
			this.fsw._emitReady();
			return closer;
		}
		/**
		* Handle symlinks encountered during directory scan
		* @param {String} linkPath path to symlink
		* @param {String} fullPath absolute path to the symlink
		* @param {Function} transform pre-existing path transformer
		* @param {Number} curDepth level of subdirectories traversed to where symlink is
		* @returns {Promise<void>}
		*/
		async _handleFsEventsSymlink(linkPath, fullPath, transform$1, curDepth) {
			if (this.fsw.closed || this.fsw._symlinkPaths.has(fullPath)) return;
			this.fsw._symlinkPaths.set(fullPath, true);
			this.fsw._incrReadyCount();
			try {
				const linkTarget = await realpath(linkPath);
				if (this.fsw.closed) return;
				if (this.fsw._isIgnored(linkTarget)) return this.fsw._emitReady();
				this.fsw._incrReadyCount();
				this._addToFsEvents(linkTarget || linkPath, (path$6) => {
					let aliasedPath = linkPath;
					if (linkTarget && linkTarget !== DOT_SLASH) aliasedPath = path$6.replace(linkTarget, linkPath);
					else if (path$6 !== DOT_SLASH) aliasedPath = sysPath$1.join(linkPath, path$6);
					return transform$1(aliasedPath);
				}, false, curDepth);
			} catch (error) {
				if (this.fsw._handleError(error)) return this.fsw._emitReady();
			}
		}
		/**
		*
		* @param {Path} newPath
		* @param {fs.Stats} stats
		*/
		emitAdd(newPath, stats, processPath, opts, forceAdd) {
			const pp = processPath(newPath);
			const isDir = stats.isDirectory();
			const dirObj = this.fsw._getWatchedDir(sysPath$1.dirname(pp));
			const base = sysPath$1.basename(pp);
			if (isDir) this.fsw._getWatchedDir(pp);
			if (dirObj.has(base)) return;
			dirObj.add(base);
			if (!opts.ignoreInitial || forceAdd === true) this.fsw._emit(isDir ? EV_ADD_DIR$1 : EV_ADD$1, pp, stats);
		}
		initWatch(realPath, path$6, wh, processPath) {
			if (this.fsw.closed) return;
			const closer = this._watchWithFsEvents(wh.watchPath, sysPath$1.resolve(realPath || wh.watchPath), processPath, wh.globFilter);
			this.fsw._addPathCloser(path$6, closer);
		}
		/**
		* Handle added path with fsevents
		* @param {String} path file/dir path or glob pattern
		* @param {Function|Boolean=} transform converts working path to what the user expects
		* @param {Boolean=} forceAdd ensure add is emitted
		* @param {Number=} priorDepth Level of subdirectories already traversed.
		* @returns {Promise<void>}
		*/
		async _addToFsEvents(path$6, transform$1, forceAdd, priorDepth) {
			if (this.fsw.closed) return;
			const opts = this.fsw.options;
			const processPath = typeof transform$1 === FUNCTION_TYPE$1 ? transform$1 : IDENTITY_FN;
			const wh = this.fsw._getWatchHelpers(path$6);
			try {
				const stats = await statMethods[wh.statMethod](wh.watchPath);
				if (this.fsw.closed) return;
				if (this.fsw._isIgnored(wh.watchPath, stats)) throw null;
				if (stats.isDirectory()) {
					if (!wh.globFilter) this.emitAdd(processPath(path$6), stats, processPath, opts, forceAdd);
					if (priorDepth && priorDepth > opts.depth) return;
					this.fsw._readdirp(wh.watchPath, {
						fileFilter: (entry) => wh.filterPath(entry),
						directoryFilter: (entry) => wh.filterDir(entry),
						...Depth(opts.depth - (priorDepth || 0))
					}).on(STR_DATA, (entry) => {
						if (this.fsw.closed) return;
						if (entry.stats.isDirectory() && !wh.filterPath(entry)) return;
						const joinedPath = sysPath$1.join(wh.watchPath, entry.path);
						const { fullPath } = entry;
						if (wh.followSymlinks && entry.stats.isSymbolicLink()) {
							const curDepth = opts.depth === void 0 ? void 0 : calcDepth(joinedPath, sysPath$1.resolve(wh.watchPath)) + 1;
							this._handleFsEventsSymlink(joinedPath, fullPath, processPath, curDepth);
						} else this.emitAdd(joinedPath, entry.stats, processPath, opts, forceAdd);
					}).on(EV_ERROR$1, EMPTY_FN$1).on(STR_END$1, () => {
						this.fsw._emitReady();
					});
				} else {
					this.emitAdd(wh.watchPath, stats, processPath, opts, forceAdd);
					this.fsw._emitReady();
				}
			} catch (error) {
				if (!error || this.fsw._handleError(error)) {
					this.fsw._emitReady();
					this.fsw._emitReady();
				}
			}
			if (opts.persistent && forceAdd !== true) if (typeof transform$1 === FUNCTION_TYPE$1) this.initWatch(void 0, path$6, wh, processPath);
			else {
				let realPath;
				try {
					realPath = await realpath(wh.watchPath);
				} catch (e) {}
				this.initWatch(realPath, path$6, wh, processPath);
			}
		}
	};
	module.exports = FsEventsHandler$1;
	module.exports.canUse = canUse;
}) });

//#endregion
//#region ../../node_modules/.pnpm/chokidar@3.6.0/node_modules/chokidar/index.js
var require_chokidar = /* @__PURE__ */ __commonJS({ "../../node_modules/.pnpm/chokidar@3.6.0/node_modules/chokidar/index.js": ((exports) => {
	const { EventEmitter: EventEmitter$1 } = __require("events");
	const fs$1 = __require("fs");
	const sysPath = __require("path");
	const { promisify } = __require("util");
	const readdirp = require_readdirp();
	const anymatch = require_anymatch().default;
	const globParent = require_glob_parent();
	const isGlob = require_is_glob();
	const braces = require_braces();
	const normalizePath = require_normalize_path();
	const NodeFsHandler = require_nodefs_handler();
	const FsEventsHandler = require_fsevents_handler();
	const { EV_ALL, EV_READY, EV_ADD, EV_CHANGE, EV_UNLINK, EV_ADD_DIR, EV_UNLINK_DIR, EV_RAW, EV_ERROR, STR_CLOSE, STR_END, BACK_SLASH_RE, DOUBLE_SLASH_RE, SLASH_OR_BACK_SLASH_RE, DOT_RE, REPLACER_RE, SLASH, SLASH_SLASH, BRACE_START, BANG, ONE_DOT, TWO_DOTS, GLOBSTAR, SLASH_GLOBSTAR, ANYMATCH_OPTS, STRING_TYPE, FUNCTION_TYPE, EMPTY_STR, EMPTY_FN, isWindows, isMacos, isIBMi } = require_constants();
	const stat$1 = promisify(fs$1.stat);
	const readdir = promisify(fs$1.readdir);
	/**
	* @typedef {String} Path
	* @typedef {'all'|'add'|'addDir'|'change'|'unlink'|'unlinkDir'|'raw'|'error'|'ready'} EventName
	* @typedef {'readdir'|'watch'|'add'|'remove'|'change'} ThrottleType
	*/
	/**
	*
	* @typedef {Object} WatchHelpers
	* @property {Boolean} followSymlinks
	* @property {'stat'|'lstat'} statMethod
	* @property {Path} path
	* @property {Path} watchPath
	* @property {Function} entryPath
	* @property {Boolean} hasGlob
	* @property {Object} globFilter
	* @property {Function} filterPath
	* @property {Function} filterDir
	*/
	const arrify = (value = []) => Array.isArray(value) ? value : [value];
	const flatten = (list, result = []) => {
		list.forEach((item) => {
			if (Array.isArray(item)) flatten(item, result);
			else result.push(item);
		});
		return result;
	};
	const unifyPaths = (paths_) => {
		/**
		* @type {Array<String>}
		*/
		const paths = flatten(arrify(paths_));
		if (!paths.every((p) => typeof p === STRING_TYPE)) throw new TypeError(`Non-string provided as watch path: ${paths}`);
		return paths.map(normalizePathToUnix);
	};
	const toUnix = (string) => {
		let str = string.replace(BACK_SLASH_RE, SLASH);
		let prepend = false;
		if (str.startsWith(SLASH_SLASH)) prepend = true;
		while (str.match(DOUBLE_SLASH_RE)) str = str.replace(DOUBLE_SLASH_RE, SLASH);
		if (prepend) str = SLASH + str;
		return str;
	};
	const normalizePathToUnix = (path$6) => toUnix(sysPath.normalize(toUnix(path$6)));
	const normalizeIgnored = (cwd = EMPTY_STR) => (path$6) => {
		if (typeof path$6 !== STRING_TYPE) return path$6;
		return normalizePathToUnix(sysPath.isAbsolute(path$6) ? path$6 : sysPath.join(cwd, path$6));
	};
	const getAbsolutePath = (path$6, cwd) => {
		if (sysPath.isAbsolute(path$6)) return path$6;
		if (path$6.startsWith(BANG)) return BANG + sysPath.join(cwd, path$6.slice(1));
		return sysPath.join(cwd, path$6);
	};
	const undef = (opts, key) => opts[key] === void 0;
	/**
	* Directory entry.
	* @property {Path} path
	* @property {Set<Path>} items
	*/
	var DirEntry = class {
		/**
		* @param {Path} dir
		* @param {Function} removeWatcher
		*/
		constructor(dir, removeWatcher) {
			this.path = dir;
			this._removeWatcher = removeWatcher;
			/** @type {Set<Path>} */
			this.items = /* @__PURE__ */ new Set();
		}
		add(item) {
			const { items } = this;
			if (!items) return;
			if (item !== ONE_DOT && item !== TWO_DOTS) items.add(item);
		}
		async remove(item) {
			const { items } = this;
			if (!items) return;
			items.delete(item);
			if (items.size > 0) return;
			const dir = this.path;
			try {
				await readdir(dir);
			} catch (err) {
				if (this._removeWatcher) this._removeWatcher(sysPath.dirname(dir), sysPath.basename(dir));
			}
		}
		has(item) {
			const { items } = this;
			if (!items) return;
			return items.has(item);
		}
		/**
		* @returns {Array<String>}
		*/
		getChildren() {
			const { items } = this;
			if (!items) return;
			return [...items.values()];
		}
		dispose() {
			this.items.clear();
			delete this.path;
			delete this._removeWatcher;
			delete this.items;
			Object.freeze(this);
		}
	};
	const STAT_METHOD_F = "stat";
	const STAT_METHOD_L = "lstat";
	var WatchHelper = class {
		constructor(path$6, watchPath, follow, fsw) {
			this.fsw = fsw;
			this.path = path$6 = path$6.replace(REPLACER_RE, EMPTY_STR);
			this.watchPath = watchPath;
			this.fullWatchPath = sysPath.resolve(watchPath);
			this.hasGlob = watchPath !== path$6;
			/** @type {object|boolean} */
			if (path$6 === EMPTY_STR) this.hasGlob = false;
			this.globSymlink = this.hasGlob && follow ? void 0 : false;
			this.globFilter = this.hasGlob ? anymatch(path$6, void 0, ANYMATCH_OPTS) : false;
			this.dirParts = this.getDirParts(path$6);
			this.dirParts.forEach((parts) => {
				if (parts.length > 1) parts.pop();
			});
			this.followSymlinks = follow;
			this.statMethod = follow ? STAT_METHOD_F : STAT_METHOD_L;
		}
		checkGlobSymlink(entry) {
			if (this.globSymlink === void 0) this.globSymlink = entry.fullParentDir === this.fullWatchPath ? false : {
				realPath: entry.fullParentDir,
				linkPath: this.fullWatchPath
			};
			if (this.globSymlink) return entry.fullPath.replace(this.globSymlink.realPath, this.globSymlink.linkPath);
			return entry.fullPath;
		}
		entryPath(entry) {
			return sysPath.join(this.watchPath, sysPath.relative(this.watchPath, this.checkGlobSymlink(entry)));
		}
		filterPath(entry) {
			const { stats } = entry;
			if (stats && stats.isSymbolicLink()) return this.filterDir(entry);
			const resolvedPath = this.entryPath(entry);
			const matchesGlob = this.hasGlob && typeof this.globFilter === FUNCTION_TYPE ? this.globFilter(resolvedPath) : true;
			return matchesGlob && this.fsw._isntIgnored(resolvedPath, stats) && this.fsw._hasReadPermissions(stats);
		}
		getDirParts(path$6) {
			if (!this.hasGlob) return [];
			const parts = [];
			const expandedPath = path$6.includes(BRACE_START) ? braces.expand(path$6) : [path$6];
			expandedPath.forEach((path$7) => {
				parts.push(sysPath.relative(this.watchPath, path$7).split(SLASH_OR_BACK_SLASH_RE));
			});
			return parts;
		}
		filterDir(entry) {
			if (this.hasGlob) {
				const entryParts = this.getDirParts(this.checkGlobSymlink(entry));
				let globstar = false;
				this.unmatchedGlob = !this.dirParts.some((parts) => {
					return parts.every((part, i) => {
						if (part === GLOBSTAR) globstar = true;
						return globstar || !entryParts[0][i] || anymatch(part, entryParts[0][i], ANYMATCH_OPTS);
					});
				});
			}
			return !this.unmatchedGlob && this.fsw._isntIgnored(this.entryPath(entry), entry.stats);
		}
	};
	/**
	* Watches files & directories for changes. Emitted events:
	* `add`, `addDir`, `change`, `unlink`, `unlinkDir`, `all`, `error`
	*
	*     new FSWatcher()
	*       .add(directories)
	*       .on('add', path => log('File', path, 'was added'))
	*/
	var FSWatcher = class extends EventEmitter$1 {
		constructor(_opts) {
			super();
			const opts = {};
			if (_opts) Object.assign(opts, _opts);
			/** @type {Map<String, DirEntry>} */
			this._watched = /* @__PURE__ */ new Map();
			/** @type {Map<String, Array>} */
			this._closers = /* @__PURE__ */ new Map();
			/** @type {Set<String>} */
			this._ignoredPaths = /* @__PURE__ */ new Set();
			/** @type {Map<ThrottleType, Map>} */
			this._throttled = /* @__PURE__ */ new Map();
			/** @type {Map<Path, String|Boolean>} */
			this._symlinkPaths = /* @__PURE__ */ new Map();
			this._streams = /* @__PURE__ */ new Set();
			this.closed = false;
			if (undef(opts, "persistent")) opts.persistent = true;
			if (undef(opts, "ignoreInitial")) opts.ignoreInitial = false;
			if (undef(opts, "ignorePermissionErrors")) opts.ignorePermissionErrors = false;
			if (undef(opts, "interval")) opts.interval = 100;
			if (undef(opts, "binaryInterval")) opts.binaryInterval = 300;
			if (undef(opts, "disableGlobbing")) opts.disableGlobbing = false;
			opts.enableBinaryInterval = opts.binaryInterval !== opts.interval;
			if (undef(opts, "useFsEvents")) opts.useFsEvents = !opts.usePolling;
			const canUseFsEvents = FsEventsHandler.canUse();
			if (!canUseFsEvents) opts.useFsEvents = false;
			if (undef(opts, "usePolling") && !opts.useFsEvents) opts.usePolling = isMacos;
			if (isIBMi) opts.usePolling = true;
			const envPoll = process.env.CHOKIDAR_USEPOLLING;
			if (envPoll !== void 0) {
				const envLower = envPoll.toLowerCase();
				if (envLower === "false" || envLower === "0") opts.usePolling = false;
				else if (envLower === "true" || envLower === "1") opts.usePolling = true;
				else opts.usePolling = !!envLower;
			}
			const envInterval = process.env.CHOKIDAR_INTERVAL;
			if (envInterval) opts.interval = Number.parseInt(envInterval, 10);
			if (undef(opts, "atomic")) opts.atomic = !opts.usePolling && !opts.useFsEvents;
			if (opts.atomic) this._pendingUnlinks = /* @__PURE__ */ new Map();
			if (undef(opts, "followSymlinks")) opts.followSymlinks = true;
			if (undef(opts, "awaitWriteFinish")) opts.awaitWriteFinish = false;
			if (opts.awaitWriteFinish === true) opts.awaitWriteFinish = {};
			const awf = opts.awaitWriteFinish;
			if (awf) {
				if (!awf.stabilityThreshold) awf.stabilityThreshold = 2e3;
				if (!awf.pollInterval) awf.pollInterval = 100;
				this._pendingWrites = /* @__PURE__ */ new Map();
			}
			if (opts.ignored) opts.ignored = arrify(opts.ignored);
			let readyCalls = 0;
			this._emitReady = () => {
				readyCalls++;
				if (readyCalls >= this._readyCount) {
					this._emitReady = EMPTY_FN;
					this._readyEmitted = true;
					process.nextTick(() => this.emit(EV_READY));
				}
			};
			this._emitRaw = (...args) => this.emit(EV_RAW, ...args);
			this._readyEmitted = false;
			this.options = opts;
			if (opts.useFsEvents) this._fsEventsHandler = new FsEventsHandler(this);
			else this._nodeFsHandler = new NodeFsHandler(this);
			Object.freeze(opts);
		}
		/**
		* Adds paths to be watched on an existing FSWatcher instance
		* @param {Path|Array<Path>} paths_
		* @param {String=} _origAdd private; for handling non-existent paths to be watched
		* @param {Boolean=} _internal private; indicates a non-user add
		* @returns {FSWatcher} for chaining
		*/
		add(paths_, _origAdd, _internal) {
			const { cwd, disableGlobbing } = this.options;
			this.closed = false;
			let paths = unifyPaths(paths_);
			if (cwd) paths = paths.map((path$6) => {
				const absPath = getAbsolutePath(path$6, cwd);
				if (disableGlobbing || !isGlob(path$6)) return absPath;
				return normalizePath(absPath);
			});
			paths = paths.filter((path$6) => {
				if (path$6.startsWith(BANG)) {
					this._ignoredPaths.add(path$6.slice(1));
					return false;
				}
				this._ignoredPaths.delete(path$6);
				this._ignoredPaths.delete(path$6 + SLASH_GLOBSTAR);
				this._userIgnored = void 0;
				return true;
			});
			if (this.options.useFsEvents && this._fsEventsHandler) {
				if (!this._readyCount) this._readyCount = paths.length;
				if (this.options.persistent) this._readyCount += paths.length;
				paths.forEach((path$6) => this._fsEventsHandler._addToFsEvents(path$6));
			} else {
				if (!this._readyCount) this._readyCount = 0;
				this._readyCount += paths.length;
				Promise.all(paths.map(async (path$6) => {
					const res = await this._nodeFsHandler._addToNodeFs(path$6, !_internal, 0, 0, _origAdd);
					if (res) this._emitReady();
					return res;
				})).then((results) => {
					if (this.closed) return;
					results.filter((item) => item).forEach((item) => {
						this.add(sysPath.dirname(item), sysPath.basename(_origAdd || item));
					});
				});
			}
			return this;
		}
		/**
		* Close watchers or start ignoring events from specified paths.
		* @param {Path|Array<Path>} paths_ - string or array of strings, file/directory paths and/or globs
		* @returns {FSWatcher} for chaining
		*/
		unwatch(paths_) {
			if (this.closed) return this;
			const paths = unifyPaths(paths_);
			const { cwd } = this.options;
			paths.forEach((path$6) => {
				if (!sysPath.isAbsolute(path$6) && !this._closers.has(path$6)) {
					if (cwd) path$6 = sysPath.join(cwd, path$6);
					path$6 = sysPath.resolve(path$6);
				}
				this._closePath(path$6);
				this._ignoredPaths.add(path$6);
				if (this._watched.has(path$6)) this._ignoredPaths.add(path$6 + SLASH_GLOBSTAR);
				this._userIgnored = void 0;
			});
			return this;
		}
		/**
		* Close watchers and remove all listeners from watched paths.
		* @returns {Promise<void>}.
		*/
		close() {
			if (this.closed) return this._closePromise;
			this.closed = true;
			this.removeAllListeners();
			const closers = [];
			this._closers.forEach((closerList) => closerList.forEach((closer) => {
				const promise = closer();
				if (promise instanceof Promise) closers.push(promise);
			}));
			this._streams.forEach((stream) => stream.destroy());
			this._userIgnored = void 0;
			this._readyCount = 0;
			this._readyEmitted = false;
			this._watched.forEach((dirent) => dirent.dispose());
			[
				"closers",
				"watched",
				"streams",
				"symlinkPaths",
				"throttled"
			].forEach((key) => {
				this[`_${key}`].clear();
			});
			this._closePromise = closers.length ? Promise.all(closers).then(() => void 0) : Promise.resolve();
			return this._closePromise;
		}
		/**
		* Expose list of watched paths
		* @returns {Object} for chaining
		*/
		getWatched() {
			const watchList = {};
			this._watched.forEach((entry, dir) => {
				const key = this.options.cwd ? sysPath.relative(this.options.cwd, dir) : dir;
				watchList[key || ONE_DOT] = entry.getChildren().sort();
			});
			return watchList;
		}
		emitWithAll(event, args) {
			this.emit(...args);
			if (event !== EV_ERROR) this.emit(EV_ALL, ...args);
		}
		/**
		* Normalize and emit events.
		* Calling _emit DOES NOT MEAN emit() would be called!
		* @param {EventName} event Type of event
		* @param {Path} path File or directory path
		* @param {*=} val1 arguments to be passed with event
		* @param {*=} val2
		* @param {*=} val3
		* @returns the error if defined, otherwise the value of the FSWatcher instance's `closed` flag
		*/
		async _emit(event, path$6, val1, val2, val3) {
			if (this.closed) return;
			const opts = this.options;
			if (isWindows) path$6 = sysPath.normalize(path$6);
			if (opts.cwd) path$6 = sysPath.relative(opts.cwd, path$6);
			/** @type Array<any> */
			const args = [event, path$6];
			if (val3 !== void 0) args.push(val1, val2, val3);
			else if (val2 !== void 0) args.push(val1, val2);
			else if (val1 !== void 0) args.push(val1);
			const awf = opts.awaitWriteFinish;
			let pw;
			if (awf && (pw = this._pendingWrites.get(path$6))) {
				pw.lastChange = /* @__PURE__ */ new Date();
				return this;
			}
			if (opts.atomic) {
				if (event === EV_UNLINK) {
					this._pendingUnlinks.set(path$6, args);
					setTimeout(() => {
						this._pendingUnlinks.forEach((entry, path$7) => {
							this.emit(...entry);
							this.emit(EV_ALL, ...entry);
							this._pendingUnlinks.delete(path$7);
						});
					}, typeof opts.atomic === "number" ? opts.atomic : 100);
					return this;
				}
				if (event === EV_ADD && this._pendingUnlinks.has(path$6)) {
					event = args[0] = EV_CHANGE;
					this._pendingUnlinks.delete(path$6);
				}
			}
			if (awf && (event === EV_ADD || event === EV_CHANGE) && this._readyEmitted) {
				const awfEmit = (err, stats) => {
					if (err) {
						event = args[0] = EV_ERROR;
						args[1] = err;
						this.emitWithAll(event, args);
					} else if (stats) {
						if (args.length > 2) args[2] = stats;
						else args.push(stats);
						this.emitWithAll(event, args);
					}
				};
				this._awaitWriteFinish(path$6, awf.stabilityThreshold, event, awfEmit);
				return this;
			}
			if (event === EV_CHANGE) {
				const isThrottled = !this._throttle(EV_CHANGE, path$6, 50);
				if (isThrottled) return this;
			}
			if (opts.alwaysStat && val1 === void 0 && (event === EV_ADD || event === EV_ADD_DIR || event === EV_CHANGE)) {
				const fullPath = opts.cwd ? sysPath.join(opts.cwd, path$6) : path$6;
				let stats;
				try {
					stats = await stat$1(fullPath);
				} catch (err) {}
				if (!stats || this.closed) return;
				args.push(stats);
			}
			this.emitWithAll(event, args);
			return this;
		}
		/**
		* Common handler for errors
		* @param {Error} error
		* @returns {Error|Boolean} The error if defined, otherwise the value of the FSWatcher instance's `closed` flag
		*/
		_handleError(error) {
			const code = error && error.code;
			if (error && code !== "ENOENT" && code !== "ENOTDIR" && (!this.options.ignorePermissionErrors || code !== "EPERM" && code !== "EACCES")) this.emit(EV_ERROR, error);
			return error || this.closed;
		}
		/**
		* Helper utility for throttling
		* @param {ThrottleType} actionType type being throttled
		* @param {Path} path being acted upon
		* @param {Number} timeout duration of time to suppress duplicate actions
		* @returns {Object|false} tracking object or false if action should be suppressed
		*/
		_throttle(actionType, path$6, timeout) {
			if (!this._throttled.has(actionType)) this._throttled.set(actionType, /* @__PURE__ */ new Map());
			/** @type {Map<Path, Object>} */
			const action = this._throttled.get(actionType);
			/** @type {Object} */
			const actionPath = action.get(path$6);
			if (actionPath) {
				actionPath.count++;
				return false;
			}
			let timeoutObject;
			const clear = () => {
				const item = action.get(path$6);
				const count = item ? item.count : 0;
				action.delete(path$6);
				clearTimeout(timeoutObject);
				if (item) clearTimeout(item.timeoutObject);
				return count;
			};
			timeoutObject = setTimeout(clear, timeout);
			const thr = {
				timeoutObject,
				clear,
				count: 0
			};
			action.set(path$6, thr);
			return thr;
		}
		_incrReadyCount() {
			return this._readyCount++;
		}
		/**
		* Awaits write operation to finish.
		* Polls a newly created file for size variations. When files size does not change for 'threshold' milliseconds calls callback.
		* @param {Path} path being acted upon
		* @param {Number} threshold Time in milliseconds a file size must be fixed before acknowledging write OP is finished
		* @param {EventName} event
		* @param {Function} awfEmit Callback to be called when ready for event to be emitted.
		*/
		_awaitWriteFinish(path$6, threshold, event, awfEmit) {
			let timeoutHandler;
			let fullPath = path$6;
			if (this.options.cwd && !sysPath.isAbsolute(path$6)) fullPath = sysPath.join(this.options.cwd, path$6);
			const now = /* @__PURE__ */ new Date();
			const awaitWriteFinish = (prevStat) => {
				fs$1.stat(fullPath, (err, curStat) => {
					if (err || !this._pendingWrites.has(path$6)) {
						if (err && err.code !== "ENOENT") awfEmit(err);
						return;
					}
					const now$1 = Number(/* @__PURE__ */ new Date());
					if (prevStat && curStat.size !== prevStat.size) this._pendingWrites.get(path$6).lastChange = now$1;
					const pw = this._pendingWrites.get(path$6);
					const df = now$1 - pw.lastChange;
					if (df >= threshold) {
						this._pendingWrites.delete(path$6);
						awfEmit(void 0, curStat);
					} else timeoutHandler = setTimeout(awaitWriteFinish, this.options.awaitWriteFinish.pollInterval, curStat);
				});
			};
			if (!this._pendingWrites.has(path$6)) {
				this._pendingWrites.set(path$6, {
					lastChange: now,
					cancelWait: () => {
						this._pendingWrites.delete(path$6);
						clearTimeout(timeoutHandler);
						return event;
					}
				});
				timeoutHandler = setTimeout(awaitWriteFinish, this.options.awaitWriteFinish.pollInterval);
			}
		}
		_getGlobIgnored() {
			return [...this._ignoredPaths.values()];
		}
		/**
		* Determines whether user has asked to ignore this path.
		* @param {Path} path filepath or dir
		* @param {fs.Stats=} stats result of fs.stat
		* @returns {Boolean}
		*/
		_isIgnored(path$6, stats) {
			if (this.options.atomic && DOT_RE.test(path$6)) return true;
			if (!this._userIgnored) {
				const { cwd } = this.options;
				const ign = this.options.ignored;
				const ignored = ign && ign.map(normalizeIgnored(cwd));
				const paths = arrify(ignored).filter((path$7) => typeof path$7 === STRING_TYPE && !isGlob(path$7)).map((path$7) => path$7 + SLASH_GLOBSTAR);
				const list = this._getGlobIgnored().map(normalizeIgnored(cwd)).concat(ignored, paths);
				this._userIgnored = anymatch(list, void 0, ANYMATCH_OPTS);
			}
			return this._userIgnored([path$6, stats]);
		}
		_isntIgnored(path$6, stat$5) {
			return !this._isIgnored(path$6, stat$5);
		}
		/**
		* Provides a set of common helpers and properties relating to symlink and glob handling.
		* @param {Path} path file, directory, or glob pattern being watched
		* @param {Number=} depth at any depth > 0, this isn't a glob
		* @returns {WatchHelper} object containing helpers for this path
		*/
		_getWatchHelpers(path$6, depth$1) {
			const watchPath = depth$1 || this.options.disableGlobbing || !isGlob(path$6) ? path$6 : globParent(path$6);
			const follow = this.options.followSymlinks;
			return new WatchHelper(path$6, watchPath, follow, this);
		}
		/**
		* Provides directory tracking objects
		* @param {String} directory path of the directory
		* @returns {DirEntry} the directory's tracking object
		*/
		_getWatchedDir(directory) {
			if (!this._boundRemove) this._boundRemove = this._remove.bind(this);
			const dir = sysPath.resolve(directory);
			if (!this._watched.has(dir)) this._watched.set(dir, new DirEntry(dir, this._boundRemove));
			return this._watched.get(dir);
		}
		/**
		* Check for read permissions.
		* Based on this answer on SO: https://stackoverflow.com/a/11781404/1358405
		* @param {fs.Stats} stats - object, result of fs_stat
		* @returns {Boolean} indicates whether the file can be read
		*/
		_hasReadPermissions(stats) {
			if (this.options.ignorePermissionErrors) return true;
			const md = stats && Number.parseInt(stats.mode, 10);
			const st = md & 511;
			const it = Number.parseInt(st.toString(8)[0], 10);
			return Boolean(4 & it);
		}
		/**
		* Handles emitting unlink events for
		* files and directories, and via recursion, for
		* files and directories within directories that are unlinked
		* @param {String} directory within which the following item is located
		* @param {String} item      base path of item/directory
		* @returns {void}
		*/
		_remove(directory, item, isDirectory$1) {
			const path$6 = sysPath.join(directory, item);
			const fullPath = sysPath.resolve(path$6);
			isDirectory$1 = isDirectory$1 != null ? isDirectory$1 : this._watched.has(path$6) || this._watched.has(fullPath);
			if (!this._throttle("remove", path$6, 100)) return;
			if (!isDirectory$1 && !this.options.useFsEvents && this._watched.size === 1) this.add(directory, item, true);
			const wp = this._getWatchedDir(path$6);
			const nestedDirectoryChildren = wp.getChildren();
			nestedDirectoryChildren.forEach((nested) => this._remove(path$6, nested));
			const parent = this._getWatchedDir(directory);
			const wasTracked = parent.has(item);
			parent.remove(item);
			if (this._symlinkPaths.has(fullPath)) this._symlinkPaths.delete(fullPath);
			let relPath = path$6;
			if (this.options.cwd) relPath = sysPath.relative(this.options.cwd, path$6);
			if (this.options.awaitWriteFinish && this._pendingWrites.has(relPath)) {
				const event = this._pendingWrites.get(relPath).cancelWait();
				if (event === EV_ADD) return;
			}
			this._watched.delete(path$6);
			this._watched.delete(fullPath);
			const eventName = isDirectory$1 ? EV_UNLINK_DIR : EV_UNLINK;
			if (wasTracked && !this._isIgnored(path$6)) this._emit(eventName, path$6);
			if (!this.options.useFsEvents) this._closePath(path$6);
		}
		/**
		* Closes all watchers for a path
		* @param {Path} path
		*/
		_closePath(path$6) {
			this._closeFile(path$6);
			const dir = sysPath.dirname(path$6);
			this._getWatchedDir(dir).remove(sysPath.basename(path$6));
		}
		/**
		* Closes only file-specific watchers
		* @param {Path} path
		*/
		_closeFile(path$6) {
			const closers = this._closers.get(path$6);
			if (!closers) return;
			closers.forEach((closer) => closer());
			this._closers.delete(path$6);
		}
		/**
		*
		* @param {Path} path
		* @param {Function} closer
		*/
		_addPathCloser(path$6, closer) {
			if (!closer) return;
			let list = this._closers.get(path$6);
			if (!list) {
				list = [];
				this._closers.set(path$6, list);
			}
			list.push(closer);
		}
		_readdirp(root, opts) {
			if (this.closed) return;
			const options = {
				type: EV_ALL,
				alwaysStat: true,
				lstat: true,
				...opts
			};
			let stream = readdirp(root, options);
			this._streams.add(stream);
			stream.once(STR_CLOSE, () => {
				stream = void 0;
			});
			stream.once(STR_END, () => {
				if (stream) {
					this._streams.delete(stream);
					stream = void 0;
				}
			});
			return stream;
		}
	};
	exports.FSWatcher = FSWatcher;
	/**
	* Instantiates watcher with paths to be tracked.
	* @param {String|Array<String>} paths file/directory paths and/or globs
	* @param {Object=} options chokidar opts
	* @returns an instance of FSWatcher for chaining.
	*/
	const watch = (paths, options) => {
		const watcher = new FSWatcher(options);
		watcher.add(paths);
		return watcher;
	};
	exports.watch = watch;
}) });

//#endregion
//#region src/utils/config/config-loader.ts
/**
* 配置文件加载器类
*/
var ConfigLoader = class {
	/**
	* 查找配置文件
	*/
	async findConfigFile(startDir = process.cwd()) {
		for (const fileName of CONFIG_FILE_NAMES) {
			const configPath = path.resolve(startDir, fileName);
			if (await exists(configPath)) return configPath;
		}
		return null;
	}
	/**
	* 获取配置文件信息
	*/
	async getConfigFileInfo(configPath) {
		const fileExists = await exists(configPath);
		const ext = path.extname(configPath);
		let type;
		switch (ext) {
			case ".ts":
				type = "ts";
				break;
			case ".js":
			case ".mjs":
				type = "js";
				break;
			case ".json":
				type = "json";
				break;
			default: type = "js";
		}
		const info = {
			path: configPath,
			type,
			exists: fileExists
		};
		if (fileExists) try {
			const stats = await import("fs").then((fs$5) => fs$5.promises.stat(configPath));
			info.mtime = stats.mtime;
			info.size = stats.size;
		} catch {}
		return info;
	}
	/**
	* 加载配置文件
	*/
	async loadConfigFile(configPath) {
		const info = await this.getConfigFileInfo(configPath);
		if (!info.exists) throw new BuilderError(ErrorCode.CONFIG_NOT_FOUND, `配置文件不存在: ${configPath}`);
		try {
			switch (info.type) {
				case "ts":
				case "js": return this.loadJSConfig(configPath);
				case "json": return this.loadJSONConfig(configPath);
				default: throw new BuilderError(ErrorCode.CONFIG_PARSE_ERROR, `不支持的配置文件格式: ${info.type}`);
			}
		} catch (error) {
			if (error instanceof BuilderError) throw error;
			throw new BuilderError(ErrorCode.CONFIG_PARSE_ERROR, `加载配置文件失败: ${configPath}`, { cause: error });
		}
	}
	/**
	* 加载 JavaScript/TypeScript 配置
	*/
	async loadJSConfig(configPath) {
		try {
			const jiti = createJiti(import.meta.url, {
				interopDefault: true,
				esmResolve: true,
				cache: false
			});
			const configModule = await jiti(configPath);
			let config;
			if (typeof configModule === "function") config = await configModule({
				mode: "development",
				bundler: process.env.BUILDER_BUNDLER || "rollup"
			});
			else if (configModule && typeof configModule === "object") config = configModule;
			else throw new Error("配置文件必须导出对象或函数");
			return config;
		} catch (error) {
			throw new BuilderError(ErrorCode.CONFIG_PARSE_ERROR, `解析 JavaScript/TypeScript 配置文件失败: ${configPath}`, {
				cause: error,
				suggestion: "请检查配置文件语法是否正确"
			});
		}
	}
	/**
	* 加载 JSON 配置
	*/
	async loadJSONConfig(configPath) {
		try {
			const content = await readFile(configPath, "utf-8");
			if (path.basename(configPath) === "package.json") {
				const pkg = JSON.parse(content);
				return pkg.builder || {};
			}
			return JSON.parse(content);
		} catch (error) {
			throw new BuilderError(ErrorCode.CONFIG_PARSE_ERROR, `解析 JSON 配置文件失败: ${configPath}`, {
				cause: error,
				suggestion: "请检查 JSON 格式是否正确"
			});
		}
	}
	/**
	* 加载多个配置文件并合并
	*/
	async loadMultipleConfigs(configPaths) {
		const configs = [];
		for (const configPath of configPaths) try {
			const config = await this.loadConfigFile(configPath);
			configs.push(config);
		} catch (error) {
			if (error instanceof BuilderError && error.code === ErrorCode.CONFIG_NOT_FOUND) continue;
			throw error;
		}
		if (configs.length === 0) return { input: "src/index.ts" };
		return configs.reduce((merged, config) => ({
			...merged,
			...config
		}), { input: "src/index.ts" });
	}
	/**
	* 监听配置文件变化
	*/
	async watchConfigFile(configPath, callback) {
		const chokidar = await Promise.resolve().then(() => /* @__PURE__ */ __toESM(require_chokidar(), 1));
		const watcher = chokidar.watch(configPath, {
			ignoreInitial: true,
			persistent: true
		});
		const handleChange = async () => {
			try {
				const config = await this.loadConfigFile(configPath);
				callback(config);
			} catch (error) {
				console.error("重新加载配置文件失败:", error);
			}
		};
		watcher.on("change", handleChange);
		watcher.on("add", handleChange);
		return () => {
			watcher.close();
		};
	}
	/**
	* 获取所有可能的配置文件路径
	*/
	getAllConfigPaths(baseDir = process.cwd()) {
		return CONFIG_FILE_NAMES.map((name) => path.resolve(baseDir, name));
	}
	/**
	* 检查配置文件是否存在
	*/
	async hasConfigFile(baseDir = process.cwd()) {
		const configPath = await this.findConfigFile(baseDir);
		return configPath !== null;
	}
	/**
	* 获取配置文件的优先级
	*/
	getConfigFilePriority(configPath) {
		const fileName = path.basename(configPath);
		const index = CONFIG_FILE_NAMES.indexOf(fileName);
		return index >= 0 ? index : CONFIG_FILE_NAMES.length;
	}
	/**
	* 选择最高优先级的配置文件
	*/
	async selectBestConfigFile(baseDir = process.cwd()) {
		const allPaths = this.getAllConfigPaths(baseDir);
		const existingPaths = [];
		for (const configPath of allPaths) if (await exists(configPath)) existingPaths.push({
			path: configPath,
			priority: this.getConfigFilePriority(configPath)
		});
		if (existingPaths.length === 0) return null;
		existingPaths.sort((a, b) => a.priority - b.priority);
		return existingPaths[0].path;
	}
};
/**
* 默认配置加载器实例
*/
const configLoader = new ConfigLoader();
/**
* 便捷函数：定义配置
*/
function defineConfig(config) {
	return config;
}

//#endregion
//#region src/utils/logger.ts
/**
* 日志级别枚举
*/
let LogLevelEnum = /* @__PURE__ */ function(LogLevelEnum$1) {
	LogLevelEnum$1[LogLevelEnum$1["SILENT"] = 0] = "SILENT";
	LogLevelEnum$1[LogLevelEnum$1["ERROR"] = 1] = "ERROR";
	LogLevelEnum$1[LogLevelEnum$1["WARN"] = 2] = "WARN";
	LogLevelEnum$1[LogLevelEnum$1["INFO"] = 3] = "INFO";
	LogLevelEnum$1[LogLevelEnum$1["DEBUG"] = 4] = "DEBUG";
	LogLevelEnum$1[LogLevelEnum$1["VERBOSE"] = 5] = "VERBOSE";
	return LogLevelEnum$1;
}({});
/**
* 日志级别映射
*/
const LOG_LEVEL_MAP = {
	silent: LogLevelEnum.SILENT,
	error: LogLevelEnum.ERROR,
	warn: LogLevelEnum.WARN,
	info: LogLevelEnum.INFO,
	debug: LogLevelEnum.DEBUG,
	verbose: LogLevelEnum.VERBOSE
};
/**
* 日志记录器类
*/
var Logger = class Logger {
	level;
	colors;
	timestamp;
	prefix;
	silent;
	constructor(options = {}) {
		this.level = LOG_LEVEL_MAP[options.level || "info"];
		this.colors = options.colors ?? true;
		this.timestamp = options.timestamp ?? false;
		this.prefix = options.prefix || "@ldesign/builder";
		this.silent = options.silent ?? false;
	}
	/**
	* 设置日志级别
	*/
	setLevel(level) {
		this.level = LOG_LEVEL_MAP[level];
	}
	/**
	* 获取当前日志级别
	*/
	getLevel() {
		const entries = Object.entries(LOG_LEVEL_MAP);
		const entry = entries.find(([, value]) => value === this.level);
		return entry?.[0] || "info";
	}
	/**
	* 设置静默模式
	*/
	setSilent(silent) {
		this.silent = silent;
	}
	/**
	* 错误日志
	*/
	error(message, ...args) {
		if (this.shouldLog(LogLevelEnum.ERROR)) this.log("ERROR", message, chalk.red, ...args);
	}
	/**
	* 警告日志
	*/
	warn(message, ...args) {
		if (this.shouldLog(LogLevelEnum.WARN)) this.log("WARN", message, chalk.yellow, ...args);
	}
	/**
	* 信息日志
	*/
	info(message, ...args) {
		if (this.shouldLog(LogLevelEnum.INFO)) this.log("INFO", message, chalk.blue, ...args);
	}
	/**
	* 调试日志
	*/
	debug(message, ...args) {
		if (this.shouldLog(LogLevelEnum.DEBUG)) this.log("DEBUG", message, chalk.gray, ...args);
	}
	/**
	* 详细日志
	*/
	verbose(message, ...args) {
		if (this.shouldLog(LogLevelEnum.VERBOSE)) this.log("VERBOSE", message, chalk.gray, ...args);
	}
	/**
	* 成功日志
	*/
	success(message, ...args) {
		if (this.shouldLog(LogLevelEnum.INFO)) this.log("SUCCESS", message, chalk.green, ...args);
	}
	/**
	* 开始日志（带缩进）
	*/
	start(message, ...args) {
		if (this.shouldLog(LogLevelEnum.INFO)) this.log("START", `▶ ${message}`, chalk.cyan, ...args);
	}
	/**
	* 完成日志（带缩进）
	*/
	complete(message, ...args) {
		if (this.shouldLog(LogLevelEnum.INFO)) this.log("COMPLETE", `✓ ${message}`, chalk.green, ...args);
	}
	/**
	* 失败日志（带缩进）
	*/
	fail(message, ...args) {
		if (this.shouldLog(LogLevelEnum.ERROR)) this.log("FAIL", `✗ ${message}`, chalk.red, ...args);
	}
	/**
	* 进度日志
	*/
	progress(current, total, message) {
		if (this.shouldLog(LogLevelEnum.INFO)) {
			const percent = Math.round(current / total * 100);
			const progressBar = this.createProgressBar(percent);
			const progressMessage = message ? ` ${message}` : "";
			this.log("PROGRESS", `${progressBar} ${percent}%${progressMessage}`, chalk.cyan);
		}
	}
	/**
	* 表格日志
	*/
	table(data) {
		if (this.shouldLog(LogLevelEnum.INFO) && data.length > 0) console.table(data);
	}
	/**
	* 分组开始
	*/
	group(label) {
		if (this.shouldLog(LogLevelEnum.INFO)) console.group(this.formatMessage("GROUP", label, chalk.cyan));
	}
	/**
	* 分组结束
	*/
	groupEnd() {
		if (this.shouldLog(LogLevelEnum.INFO)) console.groupEnd();
	}
	/**
	* 清屏
	*/
	clear() {
		if (!this.silent) console.clear();
	}
	/**
	* 换行
	*/
	newLine() {
		if (this.shouldLog(LogLevelEnum.INFO)) console.log();
	}
	/**
	* 分隔线
	*/
	divider(char = "-", length = 50) {
		if (this.shouldLog(LogLevelEnum.INFO)) console.log(chalk.gray(char.repeat(length)));
	}
	/**
	* 创建子日志记录器
	*/
	child(prefix, options = {}) {
		return new Logger({
			level: this.getLevel(),
			colors: this.colors,
			timestamp: this.timestamp,
			prefix: `${this.prefix}:${prefix}`,
			silent: this.silent,
			...options
		});
	}
	/**
	* 判断是否应该记录日志
	*/
	shouldLog(level) {
		return !this.silent && this.level >= level;
	}
	/**
	* 记录日志
	*/
	log(type, message, colorFn, ...args) {
		const formattedMessage = this.formatMessage(type, message, colorFn);
		console.log(formattedMessage, ...args);
	}
	/**
	* 格式化消息
	*/
	formatMessage(type, message, colorFn) {
		let formatted = "";
		if (this.timestamp) {
			const timestamp = (/* @__PURE__ */ new Date()).toISOString();
			formatted += chalk.gray(`[${timestamp}] `);
		}
		if (this.prefix) formatted += chalk.gray(`[${this.prefix}] `);
		if (this.colors) formatted += colorFn(`[${type}] `);
		else formatted += `[${type}] `;
		if (this.colors) formatted += colorFn(message);
		else formatted += message;
		return formatted;
	}
	/**
	* 创建进度条
	*/
	createProgressBar(percent, width = 20) {
		const filled = Math.round(percent / 100 * width);
		const empty = width - filled;
		const bar = "█".repeat(filled) + "░".repeat(empty);
		return this.colors ? chalk.cyan(bar) : bar;
	}
};
/**
* 默认日志记录器实例
*/
const logger = new Logger();
/**
* 创建日志记录器
*/
function createLogger(options = {}) {
	return new Logger(options);
}
/**
* 设置全局日志级别
*/
function setLogLevel(level) {
	logger.setLevel(level);
}
/**
* 设置全局静默模式
*/
function setSilent(silent) {
	logger.setSilent(silent);
}

//#endregion
//#region src/core/ConfigManager.ts
/**
* 配置管理器类
* 
* 提供配置文件的完整生命周期管理
*/
var ConfigManager = class extends EventEmitter {
	logger;
	errorHandler;
	options;
	currentConfig;
	configWatcher;
	constructor(options = {}) {
		super();
		this.options = {
			validateOnLoad: true,
			freezeConfig: false,
			...options
		};
		this.logger = options.logger || new Logger();
		this.errorHandler = new ErrorHandler({ logger: this.logger });
	}
	/**
	* 加载配置文件
	*/
	async loadConfig(options = {}) {
		try {
			const configPath = options.configFile || await this.findConfigFile();
			let config = {};
			if (configPath) {
				this.logger.info(`加载配置文件: ${configPath}`);
				config = await configLoader.loadConfigFile(configPath);
			} else {
				this.logger.info("未找到配置文件，使用默认配置");
				config = {};
			}
			const mergedConfig = this.mergeConfigs(DEFAULT_BUILDER_CONFIG, config);
			if (options.applyEnvConfig && mergedConfig.env) {
				const envConfig = this.getEnvConfig(mergedConfig);
				if (envConfig) Object.assign(mergedConfig, envConfig);
			}
			if (options.validate !== false && this.options.validateOnLoad) {
				const validation = this.validateConfig(mergedConfig);
				if (!validation.valid) throw new BuilderError(ErrorCode.CONFIG_VALIDATION_ERROR, `配置验证失败: ${validation.errors.join(", ")}`);
			}
			if (this.options.freezeConfig) Object.freeze(mergedConfig);
			this.currentConfig = mergedConfig;
			if (this.options.watch && configPath) await this.startWatching(configPath);
			this.emit("config:loaded", mergedConfig, configPath);
			return mergedConfig;
		} catch (error) {
			this.errorHandler.handle(error, "loadConfig");
			throw error;
		}
	}
	/**
	* 验证配置
	*/
	validateConfig(config, _options = {}) {
		const result = {
			valid: true,
			errors: [],
			warnings: []
		};
		try {
			if (!config.input) result.errors.push("缺少入口文件配置 (input)");
			if (config.output) {
				if (!config.output.dir && !config.output.file) result.errors.push("输出配置必须指定 dir 或 file");
			}
			if (config.bundler && !["rollup", "rolldown"].includes(config.bundler)) result.errors.push(`不支持的打包器: ${config.bundler}`);
			if (config.output?.format) {
				const formats = Array.isArray(config.output.format) ? config.output.format : [config.output.format];
				const validFormats = [
					"esm",
					"cjs",
					"umd",
					"iife",
					"css"
				];
				for (const format$1 of formats) if (!validFormats.includes(format$1)) result.errors.push(`不支持的输出格式: ${format$1}`);
			}
			result.valid = result.errors.length === 0;
		} catch (error) {
			result.valid = false;
			result.errors.push(`配置验证异常: ${error.message}`);
		}
		return result;
	}
	/**
	* 合并配置
	*/
	mergeConfigs(base, override, options = {}) {
		const { deep = true, arrayMergeStrategy = "replace" } = options;
		if (!deep) return {
			...base,
			...override
		};
		const result = { ...base };
		for (const [key, value] of Object.entries(override)) {
			if (value === void 0) continue;
			if (!(key in result)) {
				result[key] = value;
				continue;
			}
			const baseValue = result[key];
			if (Array.isArray(value) && Array.isArray(baseValue)) switch (arrayMergeStrategy) {
				case "concat":
					result[key] = [...baseValue, ...value];
					break;
				case "unique":
					result[key] = [...new Set([...baseValue, ...value])];
					break;
				case "replace":
				default:
					result[key] = value;
					break;
			}
			else if (typeof value === "object" && value !== null && typeof baseValue === "object" && baseValue !== null) result[key] = this.mergeConfigs(baseValue, value, options);
			else result[key] = value;
		}
		return result;
	}
	/**
	* 获取当前配置
	*/
	getCurrentConfig() {
		return this.currentConfig;
	}
	/**
	* 查找配置文件
	*/
	async findConfigFile() {
		return configLoader.findConfigFile();
	}
	/**
	* 获取环境特定配置
	*/
	getEnvConfig(config) {
		const env = "development";
		return config.env?.[env];
	}
	/**
	* 启动配置文件监听
	*/
	async startWatching(configPath) {
		if (this.configWatcher) this.configWatcher();
		this.configWatcher = await configLoader.watchConfigFile(configPath, (newConfig) => {
			this.logger.info("配置文件已更改，重新加载...");
			try {
				const mergedConfig = this.mergeConfigs(DEFAULT_BUILDER_CONFIG, newConfig);
				this.currentConfig = mergedConfig;
				this.emit("config:change", mergedConfig, configPath);
				this.logger.success("配置重新加载完成");
			} catch (error) {
				this.logger.error("配置重新加载失败:", error);
				this.emit("config:error", error);
			}
		});
	}
	/**
	* 停止监听
	*/
	async dispose() {
		if (this.configWatcher) {
			this.configWatcher();
			this.configWatcher = void 0;
		}
		this.removeAllListeners();
	}
};

//#endregion
//#region src/strategies/typescript/TypeScriptStrategy.ts
/**
* TypeScript 库构建策略
*/
var TypeScriptStrategy = class {
	name = "typescript";
	supportedTypes = [LibraryType.TYPESCRIPT];
	priority = 10;
	/**
	* 应用 TypeScript 策略
	*/
	async applyStrategy(config) {
		const outputConfig = this.buildOutputConfig(config);
		const resolvedInput = await this.resolveInputEntries(config);
		const unifiedConfig = {
			input: resolvedInput,
			output: outputConfig,
			plugins: this.buildPlugins(config),
			external: config.external || [],
			treeshake: config.performance?.treeshaking !== false,
			onwarn: this.createWarningHandler()
		};
		return unifiedConfig;
	}
	/**
	* 检查策略是否适用
	*/
	isApplicable(config) {
		return config.libraryType === LibraryType.TYPESCRIPT;
	}
	/**
	* 获取默认配置
	*/
	getDefaultConfig() {
		return {
			libraryType: LibraryType.TYPESCRIPT,
			output: {
				format: [
					"esm",
					"cjs",
					"umd"
				],
				sourcemap: true
			},
			typescript: {
				declaration: true,
				target: "ES2020",
				module: "ESNext",
				strict: true,
				skipLibCheck: true
			},
			performance: {
				treeshaking: true,
				minify: true
			}
		};
	}
	/**
	* 解析入口配置
	* - 若用户未传入 input，则将 src 下所有源文件作为入口（排除测试与声明文件）
	* - 若用户传入 glob 模式的数组，则解析为多入口
	* - 若用户传入单个文件或对象，则直接返回
	*/
	async resolveInputEntries(config) {
		if (!config.input) return this.autoDiscoverEntries();
		if (Array.isArray(config.input)) return this.resolveGlobEntries(config.input);
		return config.input;
	}
	/**
	* 自动发现入口文件
	*/
	async autoDiscoverEntries() {
		const { findFiles: findFiles$1 } = await Promise.resolve().then(() => (init_file_system(), file_system_exports));
		const { relative: relative$1, extname: extname$1 } = await import("path");
		const files = await findFiles$1(["src/**/*.{ts,tsx,js,jsx}"], {
			cwd: process.cwd(),
			ignore: [
				"**/*.d.ts",
				"**/*.test.*",
				"**/*.spec.*",
				"**/__tests__/**"
			]
		});
		if (files.length === 0) return "src/index.ts";
		const entryMap = {};
		for (const abs of files) {
			const rel = relative$1(process.cwd(), abs);
			const relFromSrc = rel.replace(/^src[\\/]/, "");
			const noExt = relFromSrc.slice(0, relFromSrc.length - extname$1(relFromSrc).length);
			const key = noExt.replace(/\\/g, "/");
			entryMap[key] = abs;
		}
		return entryMap;
	}
	/**
	* 解析glob模式的入口配置
	*/
	async resolveGlobEntries(patterns) {
		const { findFiles: findFiles$1 } = await Promise.resolve().then(() => (init_file_system(), file_system_exports));
		const { relative: relative$1, extname: extname$1 } = await import("path");
		const files = await findFiles$1(patterns, {
			cwd: process.cwd(),
			ignore: [
				"**/*.d.ts",
				"**/*.test.*",
				"**/*.spec.*",
				"**/__tests__/**"
			]
		});
		if (files.length === 0) throw new Error(`No files found matching patterns: ${patterns.join(", ")}`);
		const entryMap = {};
		for (const abs of files) {
			const rel = relative$1(process.cwd(), abs);
			const relFromSrc = rel.replace(/^src[\\/]/, "");
			const noExt = relFromSrc.slice(0, relFromSrc.length - extname$1(relFromSrc).length);
			const key = noExt.replace(/\\/g, "/");
			entryMap[key] = abs;
		}
		return entryMap;
	}
	/**
	* 获取推荐插件
	*/
	getRecommendedPlugins(config) {
		const plugins = [];
		plugins.push({
			name: "@rollup/plugin-typescript",
			options: this.getTypeScriptOptions(config)
		});
		plugins.push({
			name: "@rollup/plugin-node-resolve",
			options: {
				preferBuiltins: false,
				browser: true,
				extensions: [
					".mjs",
					".js",
					".json",
					".ts",
					".tsx"
				]
			}
		});
		plugins.push({
			name: "@rollup/plugin-commonjs",
			options: {}
		});
		plugins.push({
			name: "@rollup/plugin-json",
			options: {}
		});
		if (config.mode === "production" && config.performance?.minify !== false) plugins.push({
			name: "@rollup/plugin-terser",
			options: {
				compress: {
					drop_console: true,
					drop_debugger: true
				},
				format: { comments: false }
			}
		});
		return plugins;
	}
	/**
	* 验证配置
	*/
	validateConfig(config) {
		const errors = [];
		const warnings = [];
		const suggestions = [];
		if (!config.input) errors.push("TypeScript 策略需要指定入口文件");
		else if (typeof config.input === "string") {
			if (!config.input.endsWith(".ts") && !config.input.endsWith(".tsx")) warnings.push("入口文件不是 TypeScript 文件，建议使用 .ts 或 .tsx 扩展名");
		}
		if (!config.output?.format) suggestions.push("建议指定输出格式，如 [\"esm\", \"cjs\"]");
		if (!config.typescript?.declaration) suggestions.push("建议启用类型声明文件生成 (declaration: true)");
		return {
			valid: errors.length === 0,
			errors,
			warnings,
			suggestions
		};
	}
	/**
	* 构建输出配置
	*/
	buildOutputConfig(config) {
		const outputConfig = config.output || {};
		const formats = Array.isArray(outputConfig.format) ? outputConfig.format : [
			"esm",
			"cjs",
			"umd"
		];
		return {
			format: formats,
			sourcemap: outputConfig.sourcemap !== false,
			exports: "auto",
			name: outputConfig.name,
			globals: outputConfig.globals || {}
		};
	}
	/**
	* 构建插件配置
	*/
	buildPlugins(config) {
		const plugins = [];
		plugins.push({
			name: "typescript",
			plugin: async () => {
				const typescript = await import("@rollup/plugin-typescript");
				return typescript.default({ ...this.getTypeScriptOptions(config) });
			}
		});
		plugins.push({
			name: "node-resolve",
			plugin: async () => {
				const nodeResolve = await import("@rollup/plugin-node-resolve");
				return nodeResolve.nodeResolve({
					preferBuiltins: false,
					browser: true,
					extensions: [
						".mjs",
						".js",
						".json",
						".ts",
						".tsx"
					]
				});
			}
		});
		plugins.push({
			name: "commonjs",
			plugin: async () => {
				const commonjs = await import("@rollup/plugin-commonjs");
				return commonjs.default();
			}
		});
		plugins.push({
			name: "json",
			plugin: async () => {
				const json = await import("@rollup/plugin-json");
				return json.default();
			}
		});
		if (config.mode === "production" && config.performance?.minify !== false) plugins.push({
			name: "terser",
			plugin: async () => {
				const terser = await import("@rollup/plugin-terser");
				return terser.default({
					compress: {
						drop_console: true,
						drop_debugger: true
					},
					format: { comments: false }
				});
			}
		});
		return plugins;
	}
	/**
	* 获取 TypeScript 选项
	*/
	getTypeScriptOptions(config) {
		const tsConfig = config.typescript || {};
		const options = {
			target: tsConfig.target || "ES2020",
			module: tsConfig.module || "ESNext",
			strict: tsConfig.strict !== false,
			skipLibCheck: tsConfig.skipLibCheck !== false,
			esModuleInterop: true,
			allowSyntheticDefaultImports: true,
			moduleResolution: "node",
			resolveJsonModule: true,
			isolatedModules: true,
			noEmitOnError: false,
			allowImportingTsExtensions: false,
			exclude: [
				"**/*.test.ts",
				"**/*.spec.ts",
				"node_modules/**"
			]
		};
		if (tsConfig.declaration === true) {
			options.declaration = true;
			if (tsConfig.declarationDir) options.declarationDir = tsConfig.declarationDir;
			if (tsConfig.declarationMap === true) options.declarationMap = true;
		}
		return options;
	}
	/**
	* 创建警告处理器
	*/
	createWarningHandler() {
		return (warning) => {
			if (warning.code === "THIS_IS_UNDEFINED") return;
			if (warning.code === "CIRCULAR_DEPENDENCY") return;
			console.warn(`Warning: ${warning.message}`);
		};
	}
};

//#endregion
//#region src/strategies/style/StyleStrategy.ts
/**
* 样式库构建策略
*/
var StyleStrategy = class {
	name = "style";
	supportedTypes = [LibraryType.STYLE];
	priority = 8;
	/**
	* 应用样式策略
	*/
	async applyStrategy(config) {
		const resolvedInput = await this.resolveInputEntries(config);
		const unifiedConfig = {
			input: resolvedInput,
			output: this.buildOutputConfig(config),
			plugins: this.buildPlugins(config),
			external: config.external || [],
			treeshake: false,
			onwarn: this.createWarningHandler()
		};
		return unifiedConfig;
	}
	/**
	* 检查策略是否适用
	*/
	isApplicable(config) {
		return config.libraryType === LibraryType.STYLE;
	}
	/**
	* 获取默认配置
	*/
	getDefaultConfig() {
		return {
			libraryType: LibraryType.STYLE,
			output: {
				format: ["esm"],
				sourcemap: true
			},
			style: {
				extract: true,
				minimize: true,
				autoprefixer: true,
				modules: false,
				preprocessor: {
					less: {
						enabled: true,
						options: { javascriptEnabled: true }
					},
					sass: { enabled: false }
				},
				browserslist: [
					"> 1%",
					"last 2 versions",
					"not dead"
				]
			},
			performance: {
				treeshaking: false,
				minify: true
			}
		};
	}
	/**
	* 获取推荐插件
	*/
	getRecommendedPlugins(config) {
		const plugins = [];
		plugins.push({
			name: "postcss",
			options: this.getPostCSSOptions(config)
		});
		if (this.shouldUseLess(config)) plugins.push({
			name: "less",
			options: this.getLessOptions(config)
		});
		if (this.shouldUseSass(config)) plugins.push({
			name: "sass",
			options: this.getSassOptions(config)
		});
		return plugins;
	}
	/**
	* 验证配置
	*/
	validateConfig(config) {
		const errors = [];
		const warnings = [];
		const suggestions = [];
		if (!config.input) errors.push("样式策略需要指定入口文件");
		else if (typeof config.input === "string") {
			const supportedExtensions = [
				".css",
				".less",
				".scss",
				".sass",
				".styl"
			];
			const hasValidExtension = supportedExtensions.some((ext) => config.input.toString().endsWith(ext));
			if (!hasValidExtension) warnings.push("入口文件不是样式文件，建议使用 .css, .less, .scss 等扩展名");
		}
		if (config.output?.format && !config.output.format.includes("css")) suggestions.push("样式库建议输出 CSS 格式");
		return {
			valid: errors.length === 0,
			errors,
			warnings,
			suggestions
		};
	}
	/**
	* 构建输出配置
	*/
	buildOutputConfig(config) {
		const outputConfig = config.output || {};
		const formats = Array.isArray(outputConfig.format) ? outputConfig.format : [outputConfig.format || "esm"];
		return {
			dir: outputConfig.dir || "dist",
			format: formats,
			sourcemap: outputConfig.sourcemap !== false,
			assetFileNames: "[name][extname]"
		};
	}
	/**
	* 构建插件配置
	*/
	buildPlugins(config) {
		const plugins = [];
		plugins.push({
			name: "postcss",
			plugin: async () => {
				const postcss = await import("rollup-plugin-postcss");
				const postCSSPlugins = await this.getPostCSSPlugins(config);
				return postcss.default({
					extract: true,
					minimize: config.performance?.minify !== false,
					sourceMap: config.output?.sourcemap !== false,
					plugins: postCSSPlugins
				});
			}
		});
		return plugins;
	}
	/**
	* 获取 PostCSS 插件
	*/
	async getPostCSSPlugins(config) {
		const plugins = [];
		if (config.style?.autoprefixer !== false) try {
			const autoprefixer = await import("autoprefixer");
			plugins.push(autoprefixer.default({ overrideBrowserslist: config.style?.browserslist || [
				"> 1%",
				"last 2 versions",
				"not dead"
			] }));
		} catch (error) {
			console.warn("Autoprefixer 未安装，跳过自动前缀功能");
		}
		return plugins;
	}
	/**
	* 获取 PostCSS 选项
	*/
	async getPostCSSOptions(config) {
		return {
			extract: config.style?.extract !== false,
			minimize: config.style?.minimize !== false,
			sourceMap: config.output?.sourcemap !== false,
			modules: config.style?.modules || false,
			plugins: await this.getPostCSSPlugins(config)
		};
	}
	/**
	* 获取 Less 选项
	*/
	getLessOptions(config) {
		const preprocessor = config.style?.preprocessor;
		const lessConfig = typeof preprocessor === "object" ? preprocessor.less : void 0;
		return {
			javascriptEnabled: lessConfig?.options?.javascriptEnabled !== false,
			modifyVars: lessConfig?.options?.modifyVars || {},
			...lessConfig?.options
		};
	}
	/**
	* 获取 Sass 选项
	*/
	getSassOptions(config) {
		const preprocessor = config.style?.preprocessor;
		const sassConfig = typeof preprocessor === "object" ? preprocessor.sass : void 0;
		return {
			includePaths: ["node_modules"],
			...sassConfig?.options
		};
	}
	/**
	* 检查是否应该使用 Less
	*/
	shouldUseLess(config) {
		const preprocessor = config.style?.preprocessor;
		if (typeof preprocessor === "object" && preprocessor.less?.enabled === false) return false;
		if (typeof config.input === "string" && config.input.endsWith(".less")) return true;
		return typeof preprocessor === "object" && preprocessor.less?.enabled === true;
	}
	/**
	* 检查是否应该使用 Sass
	*/
	shouldUseSass(config) {
		const preprocessor = config.style?.preprocessor;
		if (typeof preprocessor === "object" && preprocessor.sass?.enabled === false) return false;
		if (typeof config.input === "string") {
			if (config.input.endsWith(".scss") || config.input.endsWith(".sass")) return true;
		}
		return typeof preprocessor === "object" && preprocessor.sass?.enabled === true;
	}
	/**
	* 创建警告处理器
	*/
	createWarningHandler() {
		return (warning) => {
			if (warning.code === "EMPTY_BUNDLE") return;
			console.warn(`Warning: ${warning.message}`);
		};
	}
	/**
	* 解析入口配置
	* - 若用户未传入 input，则将 src 下所有样式文件作为入口
	* - 若用户传入 glob 模式的数组，则解析为多入口
	* - 若用户传入单个文件或对象，则直接返回
	*/
	async resolveInputEntries(config) {
		if (!config.input) return this.autoDiscoverEntries();
		if (Array.isArray(config.input)) return this.resolveGlobEntries(config.input);
		return config.input;
	}
	/**
	* 自动发现入口文件
	*/
	async autoDiscoverEntries() {
		const { findFiles: findFiles$1 } = await Promise.resolve().then(() => (init_file_system(), file_system_exports));
		const { relative: relative$1, extname: extname$1 } = await import("path");
		const files = await findFiles$1(["src/**/*.{css,less,scss,sass,styl}"], {
			cwd: process.cwd(),
			ignore: [
				"**/*.test.*",
				"**/*.spec.*",
				"**/__tests__/**"
			]
		});
		if (files.length === 0) return "src/index.less";
		const entryMap = {};
		for (const abs of files) {
			const rel = relative$1(process.cwd(), abs);
			const relFromSrc = rel.replace(/^src[\\/]/, "");
			const noExt = relFromSrc.slice(0, relFromSrc.length - extname$1(relFromSrc).length);
			const key = noExt.replace(/\\/g, "/");
			entryMap[key] = abs;
		}
		return entryMap;
	}
	/**
	* 解析glob模式的入口配置
	*/
	async resolveGlobEntries(patterns) {
		const { findFiles: findFiles$1 } = await Promise.resolve().then(() => (init_file_system(), file_system_exports));
		const { relative: relative$1, extname: extname$1 } = await import("path");
		const files = await findFiles$1(patterns, {
			cwd: process.cwd(),
			ignore: [
				"**/*.test.*",
				"**/*.spec.*",
				"**/__tests__/**"
			]
		});
		if (files.length === 0) throw new Error(`No files found matching patterns: ${patterns.join(", ")}`);
		const entryMap = {};
		for (const abs of files) {
			const rel = relative$1(process.cwd(), abs);
			const relFromSrc = rel.replace(/^src[\\/]/, "");
			const noExt = relFromSrc.slice(0, relFromSrc.length - extname$1(relFromSrc).length);
			const key = noExt.replace(/\\/g, "/");
			entryMap[key] = abs;
		}
		return entryMap;
	}
};

//#endregion
//#region src/strategies/vue3/Vue3Strategy.ts
/**
* Vue 3 组件库构建策略
*/
var Vue3Strategy = class {
	name = "vue3";
	supportedTypes = [LibraryType.VUE3];
	priority = 10;
	/**
	* 应用 Vue 3 策略
	*/
	async applyStrategy(config) {
		const resolvedInput = await this.resolveInputEntries(config);
		const unifiedConfig = {
			input: resolvedInput,
			output: this.buildOutputConfig(config),
			plugins: await this.buildPlugins(config),
			external: this.buildExternals(config),
			treeshake: config.performance?.treeshaking !== false,
			onwarn: this.createWarningHandler()
		};
		return unifiedConfig;
	}
	/**
	* 检查策略是否适用
	*/
	isApplicable(config) {
		return config.libraryType === LibraryType.VUE3;
	}
	/**
	* 获取默认配置
	*/
	getDefaultConfig() {
		return {
			libraryType: LibraryType.VUE3,
			output: {
				format: ["esm", "cjs"],
				sourcemap: true
			},
			vue: {
				version: 3,
				jsx: { enabled: true },
				template: { precompile: true }
			},
			typescript: {
				declaration: true,
				declarationDir: "dist",
				target: "ES2020",
				module: "ESNext",
				strict: true
			},
			style: {
				extract: true,
				minimize: true,
				autoprefixer: true
			},
			performance: {
				treeshaking: true,
				minify: true
			},
			external: ["vue"]
		};
	}
	/**
	* 获取推荐插件
	*/
	getRecommendedPlugins(config) {
		const plugins = [];
		plugins.push({
			name: "rollup-plugin-vue",
			options: this.getVueOptions(config)
		});
		plugins.push({
			name: "@rollup/plugin-typescript",
			options: this.getTypeScriptOptions(config)
		});
		plugins.push({
			name: "@rollup/plugin-node-resolve",
			options: {
				preferBuiltins: false,
				browser: true
			}
		});
		plugins.push({
			name: "@rollup/plugin-commonjs",
			options: {}
		});
		if (config.style?.extract !== false) plugins.push({
			name: "rollup-plugin-postcss",
			options: this.getPostCSSOptions(config)
		});
		if (config.mode === "production" && config.performance?.minify !== false) plugins.push({
			name: "@rollup/plugin-terser",
			options: {
				compress: {
					drop_console: true,
					drop_debugger: true
				},
				format: { comments: false }
			}
		});
		return plugins;
	}
	/**
	* 验证配置
	*/
	validateConfig(config) {
		const errors = [];
		const warnings = [];
		const suggestions = [];
		if (!config.input) errors.push("Vue 3 策略需要指定入口文件");
		if (config.vue?.version && config.vue.version !== 3) warnings.push("当前策略针对 Vue 3 优化，建议使用 Vue 3");
		if (Array.isArray(config.external) && !config.external.includes("vue")) suggestions.push("建议将 Vue 添加到外部依赖中以减少包体积");
		return {
			valid: errors.length === 0,
			errors,
			warnings,
			suggestions
		};
	}
	/**
	* 构建输出配置
	*/
	buildOutputConfig(config) {
		const outputConfig = config.output || {};
		const formats = Array.isArray(outputConfig.format) ? outputConfig.format : [outputConfig.format || "esm"];
		return {
			dir: outputConfig.dir || "dist",
			format: formats,
			sourcemap: outputConfig.sourcemap !== false,
			exports: "named",
			globals: {
				vue: "Vue",
				...outputConfig.globals
			}
		};
	}
	/**
	* 构建插件配置
	*/
	async buildPlugins(config) {
		const plugins = [];
		try {
			const nodeResolve = await import("@rollup/plugin-node-resolve");
			plugins.push(nodeResolve.default({
				preferBuiltins: false,
				browser: true,
				extensions: [
					".mjs",
					".js",
					".json",
					".ts",
					".tsx",
					".vue"
				]
			}));
			const { default: VuePlugin } = await import("unplugin-vue/rollup");
			plugins.push(VuePlugin(this.getVueOptions(config)));
			const { default: tsPlugin } = await import("@rollup/plugin-typescript");
			plugins.push({
				name: "typescript",
				plugin: async () => tsPlugin({
					...this.getTypeScriptOptions(config),
					include: ["src/**/*.ts", "src/**/*.tsx"],
					exclude: [
						"**/*.vue",
						"**/*.vue?*",
						"node_modules/**"
					],
					sourceMap: config.output?.sourcemap !== false
				})
			});
			const { default: babel } = await import("@rollup/plugin-babel");
			plugins.push(babel({
				babelrc: false,
				configFile: false,
				babelHelpers: "bundled",
				extensions: [
					".ts",
					".tsx",
					".js",
					".jsx"
				],
				presets: [["@babel/preset-typescript", { allowDeclareFields: true }]],
				include: [/\.(ts|tsx|js|jsx)$/, /\?vue&type=script/],
				exclude: [
					/\?vue&type=style/,
					/\?vue&type=template/,
					/\.(css|less|scss|sass)$/
				]
			}));
			const { default: esbuild } = await import("rollup-plugin-esbuild");
			plugins.push(esbuild({
				include: /\.(ts|tsx|js|jsx)(\?|$)/,
				exclude: [/node_modules/],
				target: "es2020",
				jsx: "preserve",
				tsconfig: "tsconfig.json",
				minify: config.performance?.minify !== false,
				sourceMap: config.output?.sourcemap !== false
			}));
			const commonjs = await import("@rollup/plugin-commonjs");
			plugins.push(commonjs.default());
			const postcss = await import("rollup-plugin-postcss");
			plugins.push(postcss.default({
				...this.getPostCSSOptions(config),
				include: [/\.(css|less|scss|sass)$/, /\?vue&type=style/]
			}));
		} catch (error) {
			console.error("插件加载失败:", error);
		}
		return plugins;
	}
	/**
	* 构建外部依赖配置
	*/
	buildExternals(config) {
		let externals = [];
		if (Array.isArray(config.external)) externals = [...config.external];
		else if (typeof config.external === "function") externals = ["vue"];
		else externals = [];
		if (!externals.includes("vue")) externals.push("vue");
		return externals;
	}
	/**
	* 获取 Vue 选项
	*/
	getVueOptions(config) {
		const vueConfig = config.vue || {};
		return {
			include: /\.vue$/,
			template: {
				compilerOptions: { isCustomElement: (tag) => tag.startsWith("ld-") },
				...vueConfig.template
			},
			...vueConfig
		};
	}
	/**
	* 获取 TypeScript 选项
	*/
	getTypeScriptOptions(config) {
		const tsConfig = config.typescript || {};
		return {
			target: tsConfig.target || "ES2020",
			module: tsConfig.module || "ESNext",
			declaration: tsConfig.declaration !== false,
			strict: tsConfig.strict !== false,
			esModuleInterop: true,
			allowSyntheticDefaultImports: true,
			skipLibCheck: true,
			moduleResolution: "node",
			resolveJsonModule: true,
			jsx: "preserve",
			...tsConfig
		};
	}
	/**
	* 获取 PostCSS 选项
	*/
	getPostCSSOptions(config) {
		return {
			extract: config.style?.extract !== false,
			minimize: config.style?.minimize !== false,
			sourceMap: config.output?.sourcemap !== false,
			modules: config.style?.modules || false
		};
	}
	/**
	* 创建警告处理器
	*/
	createWarningHandler() {
		return (warning) => {
			if (warning.code === "THIS_IS_UNDEFINED") return;
			if (warning.code === "CIRCULAR_DEPENDENCY") return;
			console.warn(`Warning: ${warning.message}`);
		};
	}
	/**
	* 解析入口配置
	* - 若用户未传入 input，则将 src 下所有源文件作为入口（排除测试与声明文件）
	* - 若用户传入 glob 模式的数组，则解析为多入口
	* - 若用户传入单个文件或对象，则直接返回
	*/
	async resolveInputEntries(config) {
		if (!config.input) return this.autoDiscoverEntries();
		if (Array.isArray(config.input)) return this.resolveGlobEntries(config.input);
		return config.input;
	}
	/**
	* 自动发现入口文件
	*/
	async autoDiscoverEntries() {
		const { findFiles: findFiles$1 } = await Promise.resolve().then(() => (init_file_system(), file_system_exports));
		const { relative: relative$1, extname: extname$1 } = await import("path");
		const files = await findFiles$1(["src/**/*.{ts,tsx,js,jsx,vue}"], {
			cwd: process.cwd(),
			ignore: [
				"**/*.d.ts",
				"**/*.test.*",
				"**/*.spec.*",
				"**/__tests__/**"
			]
		});
		if (files.length === 0) return "src/index.ts";
		const entryMap = {};
		for (const abs of files) {
			const rel = relative$1(process.cwd(), abs);
			const relFromSrc = rel.replace(/^src[\\/]/, "");
			const noExt = relFromSrc.slice(0, relFromSrc.length - extname$1(relFromSrc).length);
			const key = noExt.replace(/\\/g, "/");
			entryMap[key] = abs;
		}
		return entryMap;
	}
	/**
	* 解析glob模式的入口配置
	*/
	async resolveGlobEntries(patterns) {
		const { findFiles: findFiles$1 } = await Promise.resolve().then(() => (init_file_system(), file_system_exports));
		const { relative: relative$1, extname: extname$1 } = await import("path");
		const files = await findFiles$1(patterns, {
			cwd: process.cwd(),
			ignore: [
				"**/*.d.ts",
				"**/*.test.*",
				"**/*.spec.*",
				"**/__tests__/**"
			]
		});
		if (files.length === 0) throw new Error(`No files found matching patterns: ${patterns.join(", ")}`);
		const entryMap = {};
		for (const abs of files) {
			const rel = relative$1(process.cwd(), abs);
			const relFromSrc = rel.replace(/^src[\\/]/, "");
			const noExt = relFromSrc.slice(0, relFromSrc.length - extname$1(relFromSrc).length);
			const key = noExt.replace(/\\/g, "/");
			entryMap[key] = abs;
		}
		return entryMap;
	}
};

//#endregion
//#region src/strategies/react/ReactStrategy.ts
var ReactStrategy = class {
	name = "react";
	supportedTypes = [LibraryType.REACT];
	priority = 10;
	async applyStrategy(config) {
		const resolvedInput = await this.resolveInputEntries(config);
		return {
			input: resolvedInput,
			output: this.buildOutputConfig(config),
			plugins: await this.buildPlugins(config),
			external: [
				...config.external || [],
				"react",
				"react-dom"
			],
			treeshake: config.performance?.treeshaking !== false,
			onwarn: this.createWarningHandler()
		};
	}
	isApplicable(config) {
		return config.libraryType === LibraryType.REACT;
	}
	getDefaultConfig() {
		return {
			libraryType: LibraryType.REACT,
			output: {
				format: ["esm", "cjs"],
				sourcemap: true
			},
			performance: {
				treeshaking: true,
				minify: true
			}
		};
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
	async buildPlugins(config) {
		const plugins = [];
		const nodeResolve = await import("@rollup/plugin-node-resolve");
		plugins.push(nodeResolve.default({
			browser: true,
			extensions: [
				".mjs",
				".js",
				".json",
				".ts",
				".tsx"
			]
		}));
		const commonjs = await import("@rollup/plugin-commonjs");
		plugins.push(commonjs.default());
		const ts = await import("@rollup/plugin-typescript");
		plugins.push({
			name: "typescript",
			plugin: async () => ts.default({
				tsconfig: "tsconfig.json",
				declaration: true,
				emitDeclarationOnly: true,
				jsx: "react-jsx"
			})
		});
		if (config.style?.extract !== false) {
			const postcss = await import("rollup-plugin-postcss");
			plugins.push(postcss.default({
				extract: true,
				minimize: config.performance?.minify !== false
			}));
		}
		const esbuild = await import("rollup-plugin-esbuild");
		plugins.push(esbuild.default({
			include: /\.(tsx?|jsx?)$/,
			exclude: [/node_modules/],
			target: "es2020",
			jsx: "automatic",
			jsxImportSource: "react",
			tsconfig: "tsconfig.json",
			sourceMap: config.output?.sourcemap !== false,
			minify: config.performance?.minify !== false
		}));
		return plugins;
	}
	buildOutputConfig(config) {
		const out = config.output || {};
		const formats = Array.isArray(out.format) ? out.format : ["esm", "cjs"];
		return {
			dir: out.dir || "dist",
			format: formats,
			sourcemap: out.sourcemap !== false,
			exports: "auto"
		};
	}
	createWarningHandler() {
		return (warning) => {
			if (warning.code === "THIS_IS_UNDEFINED" || warning.code === "CIRCULAR_DEPENDENCY") return;
			console.warn(`Warning: ${warning.message}`);
		};
	}
	/**
	* 解析入口配置
	* - 若用户未传入 input，则将 src 下所有源文件作为入口（排除测试与声明文件）
	* - 若用户传入 glob 模式的数组，则解析为多入口
	* - 若用户传入单个文件或对象，则直接返回
	*/
	async resolveInputEntries(config) {
		if (!config.input) return this.autoDiscoverEntries();
		if (Array.isArray(config.input)) return this.resolveGlobEntries(config.input);
		return config.input;
	}
	/**
	* 自动发现入口文件
	*/
	async autoDiscoverEntries() {
		const { findFiles: findFiles$1 } = await Promise.resolve().then(() => (init_file_system(), file_system_exports));
		const { relative: relative$1, extname: extname$1 } = await import("path");
		const files = await findFiles$1(["src/**/*.{ts,tsx,js,jsx}"], {
			cwd: process.cwd(),
			ignore: [
				"**/*.d.ts",
				"**/*.test.*",
				"**/*.spec.*",
				"**/__tests__/**"
			]
		});
		if (files.length === 0) return "src/index.ts";
		const entryMap = {};
		for (const abs of files) {
			const rel = relative$1(process.cwd(), abs);
			const relFromSrc = rel.replace(/^src[\\/]/, "");
			const noExt = relFromSrc.slice(0, relFromSrc.length - extname$1(relFromSrc).length);
			const key = noExt.replace(/\\/g, "/");
			entryMap[key] = abs;
		}
		return entryMap;
	}
	/**
	* 解析glob模式的入口配置
	*/
	async resolveGlobEntries(patterns) {
		const { findFiles: findFiles$1 } = await Promise.resolve().then(() => (init_file_system(), file_system_exports));
		const { relative: relative$1, extname: extname$1 } = await import("path");
		const files = await findFiles$1(patterns, {
			cwd: process.cwd(),
			ignore: [
				"**/*.d.ts",
				"**/*.test.*",
				"**/*.spec.*",
				"**/__tests__/**"
			]
		});
		if (files.length === 0) throw new Error(`No files found matching patterns: ${patterns.join(", ")}`);
		const entryMap = {};
		for (const abs of files) {
			const rel = relative$1(process.cwd(), abs);
			const relFromSrc = rel.replace(/^src[\\/]/, "");
			const noExt = relFromSrc.slice(0, relFromSrc.length - extname$1(relFromSrc).length);
			const key = noExt.replace(/\\/g, "/");
			entryMap[key] = abs;
		}
		return entryMap;
	}
};

//#endregion
//#region src/strategies/mixed/MixedStrategy.ts
var MixedStrategy = class {
	name = "mixed";
	supportedTypes = [LibraryType.MIXED];
	priority = 5;
	async applyStrategy(config) {
		const resolvedInput = await this.resolveInputEntries(config);
		const unifiedConfig = {
			input: resolvedInput,
			output: this.buildOutputConfig(config),
			plugins: await this.buildPlugins(config),
			external: config.external || [],
			treeshake: config.performance?.treeshaking !== false,
			onwarn: this.createWarningHandler()
		};
		return unifiedConfig;
	}
	isApplicable(config) {
		return config.libraryType === LibraryType.MIXED;
	}
	getDefaultConfig() {
		return {
			libraryType: LibraryType.MIXED,
			output: {
				format: ["esm", "cjs"],
				sourcemap: true
			},
			typescript: { declaration: true },
			style: { extract: true },
			performance: {
				treeshaking: true,
				minify: true
			}
		};
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
	/**
	* 解析入口配置
	* - 若用户未传入 input，则将 src 下所有源文件作为入口（排除测试与声明文件）
	* - 若用户传入 glob 模式的数组，则解析为多入口
	* - 若用户传入单个文件或对象，则直接返回
	*/
	async resolveInputEntries(config) {
		if (!config.input) return this.autoDiscoverEntries();
		if (Array.isArray(config.input)) return this.resolveGlobEntries(config.input);
		return config.input;
	}
	/**
	* 自动发现入口文件
	*/
	async autoDiscoverEntries() {
		const { findFiles: findFiles$1 } = await Promise.resolve().then(() => (init_file_system(), file_system_exports));
		const { relative: relative$1, extname: extname$1 } = await import("path");
		const files = await findFiles$1(["src/**/*.{ts,tsx,js,jsx,vue,css,less,scss,sass}"], {
			cwd: process.cwd(),
			ignore: [
				"**/*.d.ts",
				"**/*.test.*",
				"**/*.spec.*",
				"**/__tests__/**"
			]
		});
		if (files.length === 0) return "src/index.ts";
		const entryMap = {};
		for (const abs of files) {
			const rel = relative$1(process.cwd(), abs);
			const relFromSrc = rel.replace(/^src[\\/]/, "");
			const noExt = relFromSrc.slice(0, relFromSrc.length - extname$1(relFromSrc).length);
			const key = noExt.replace(/\\/g, "/");
			entryMap[key] = abs;
		}
		return entryMap;
	}
	/**
	* 解析glob模式的入口配置
	*/
	async resolveGlobEntries(patterns) {
		const { findFiles: findFiles$1 } = await Promise.resolve().then(() => (init_file_system(), file_system_exports));
		const { relative: relative$1, extname: extname$1 } = await import("path");
		const files = await findFiles$1(patterns, {
			cwd: process.cwd(),
			ignore: [
				"**/*.d.ts",
				"**/*.test.*",
				"**/*.spec.*",
				"**/__tests__/**"
			]
		});
		if (files.length === 0) throw new Error(`No files found matching patterns: ${patterns.join(", ")}`);
		const entryMap = {};
		for (const abs of files) {
			const rel = relative$1(process.cwd(), abs);
			const relFromSrc = rel.replace(/^src[\\/]/, "");
			const noExt = relFromSrc.slice(0, relFromSrc.length - extname$1(relFromSrc).length);
			const key = noExt.replace(/\\/g, "/");
			entryMap[key] = abs;
		}
		return entryMap;
	}
	/**
	* 构建输出配置
	*/
	buildOutputConfig(config) {
		const outputConfig = config.output || {};
		const formats = Array.isArray(outputConfig.format) ? outputConfig.format : [outputConfig.format || "esm"];
		return {
			dir: outputConfig.dir || "dist",
			format: formats,
			sourcemap: outputConfig.sourcemap !== false,
			exports: "named"
		};
	}
	/**
	* 构建插件配置
	*/
	async buildPlugins(config) {
		const plugins = [];
		try {
			const nodeResolve = await import("@rollup/plugin-node-resolve");
			plugins.push(nodeResolve.default({
				preferBuiltins: false,
				browser: true,
				extensions: [
					".mjs",
					".js",
					".json",
					".ts",
					".tsx",
					".vue",
					".css",
					".less",
					".scss"
				]
			}));
			const commonjs = await import("@rollup/plugin-commonjs");
			plugins.push(commonjs.default());
			const ts = await import("@rollup/plugin-typescript");
			plugins.push({
				name: "typescript",
				plugin: async () => ts.default({
					tsconfig: "tsconfig.json",
					declaration: config.typescript?.declaration !== false,
					target: config.typescript?.target || "ES2020",
					module: config.typescript?.module || "ESNext",
					strict: config.typescript?.strict !== false,
					skipLibCheck: true,
					sourceMap: config.output?.sourcemap !== false
				})
			});
			if (config.style?.extract !== false) {
				const postcss = await import("rollup-plugin-postcss");
				plugins.push(postcss.default({
					extract: true,
					minimize: config.performance?.minify !== false,
					sourceMap: config.output?.sourcemap !== false,
					modules: config.style?.modules || false
				}));
			}
		} catch (error) {
			console.error("插件加载失败:", error);
		}
		return plugins;
	}
	/**
	* 创建警告处理器
	*/
	createWarningHandler() {
		return (warning) => {
			if (warning.code === "THIS_IS_UNDEFINED") return;
			if (warning.code === "CIRCULAR_DEPENDENCY") return;
			console.warn(`Warning: ${warning.message}`);
		};
	}
};

//#endregion
//#region src/core/StrategyManager.ts
/**
* 基础策略实现（临时）
*/
var BaseStrategy = class {
	name;
	supportedTypes;
	priority;
	constructor(name, supportedTypes, priority = 1) {
		this.name = name;
		this.supportedTypes = supportedTypes;
		this.priority = priority;
	}
	async applyStrategy(config) {
		return config;
	}
	isApplicable(_config) {
		return this.supportedTypes.includes(_config.libraryType);
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
};
/**
* 策略管理器类
*/
var StrategyManager = class {
	logger;
	errorHandler;
	strategies = /* @__PURE__ */ new Map();
	constructor(_options = {}) {
		this.logger = _options.logger || new Logger();
		this.errorHandler = new ErrorHandler({ logger: this.logger });
		this.registerDefaultStrategies();
	}
	/**
	* 注册策略
	*/
	registerStrategy(strategy) {
		for (const type of strategy.supportedTypes) this.strategies.set(type, strategy);
		this.logger.debug(`注册策略: ${strategy.name}`);
	}
	/**
	* 获取策略
	*/
	getStrategy(libraryType) {
		const strategy = this.strategies.get(libraryType);
		if (!strategy) throw new BuilderError(ErrorCode.CONFIG_VALIDATION_ERROR, `未找到库类型 ${libraryType} 的策略`);
		return strategy;
	}
	/**
	* 检测最佳策略
	*/
	async detectStrategy(_projectPath) {
		return {
			strategy: LibraryType.TYPESCRIPT,
			confidence: .8,
			evidence: [],
			alternatives: []
		};
	}
	/**
	* 应用策略
	*/
	async applyStrategy(libraryType, config) {
		const startTime = Date.now();
		try {
			const strategy = this.getStrategy(libraryType);
			if (!strategy.isApplicable(config)) throw new BuilderError(ErrorCode.CONFIG_VALIDATION_ERROR, `策略 ${strategy.name} 不适用于当前配置`);
			const transformedConfig = await strategy.applyStrategy(config);
			const plugins = strategy.getRecommendedPlugins(config);
			const duration = Date.now() - startTime;
			return {
				strategy,
				config: transformedConfig,
				plugins,
				duration,
				warnings: [],
				optimizations: []
			};
		} catch (error) {
			this.errorHandler.handle(error, "applyStrategy");
			throw error;
		}
	}
	/**
	* 获取所有已注册的策略
	*/
	getAllStrategies() {
		return Array.from(this.strategies.values());
	}
	/**
	* 获取支持的库类型
	*/
	getSupportedTypes() {
		return Array.from(this.strategies.keys());
	}
	/**
	* 注册默认策略
	*/
	registerDefaultStrategies() {
		this.registerStrategy(new TypeScriptStrategy());
		this.registerStrategy(new Vue3Strategy());
		this.registerStrategy(new BaseStrategy("vue2", [LibraryType.VUE2], 10));
		this.registerStrategy(new StyleStrategy());
		this.registerStrategy(new ReactStrategy());
		this.registerStrategy(new MixedStrategy());
	}
};

//#endregion
//#region src/core/PluginManager.ts
/**
* 插件管理器类
*/
var PluginManager = class extends EventEmitter {
	logger;
	options;
	plugins = /* @__PURE__ */ new Map();
	performanceStats = /* @__PURE__ */ new Map();
	constructor(options = {}) {
		super();
		this.options = {
			cache: true,
			hotReload: false,
			timeout: 3e4,
			maxPlugins: 100,
			whitelist: [],
			blacklist: [],
			...options
		};
		this.logger = options.logger || new Logger();
	}
	/**
	* 加载插件
	*/
	async loadPlugin(plugin) {
		const startTime = Date.now();
		try {
			if (this.plugins.has(plugin.name)) this.logger.warn(`插件 ${plugin.name} 已存在，将被覆盖`);
			if (this.options.blacklist?.includes(plugin.name)) throw new BuilderError(ErrorCode.PLUGIN_LOAD_ERROR, `插件 ${plugin.name} 在黑名单中`);
			if (this.options.whitelist?.length && !this.options.whitelist.includes(plugin.name)) throw new BuilderError(ErrorCode.PLUGIN_LOAD_ERROR, `插件 ${plugin.name} 不在白名单中`);
			if (this.plugins.size >= (this.options.maxPlugins || 100)) throw new BuilderError(ErrorCode.PLUGIN_LOAD_ERROR, `插件数量超过限制 (${this.options.maxPlugins})`);
			this.validatePlugin(plugin);
			if (plugin.onInit) await plugin.onInit({
				buildId: "init",
				pluginName: plugin.name,
				cwd: process.cwd(),
				mode: "production",
				platform: "browser",
				env: process.env,
				config: {},
				cacheDir: "",
				tempDir: "",
				logger: this.logger,
				performanceMonitor: null
			});
			this.plugins.set(plugin.name, plugin);
			const loadTime = Date.now() - startTime;
			this.performanceStats.set(plugin.name, {
				name: plugin.name,
				totalTime: 0,
				callCount: 0,
				averageTime: 0,
				maxTime: 0,
				hookPerformance: {}
			});
			this.logger.success(`插件 ${plugin.name} 加载成功 (${loadTime}ms)`);
			return {
				plugin,
				loadTime,
				success: true
			};
		} catch (error) {
			const loadTime = Date.now() - startTime;
			this.logger.error(`插件 ${plugin.name} 加载失败:`, error);
			return {
				plugin,
				loadTime,
				success: false,
				error
			};
		}
	}
	/**
	* 批量加载插件
	*/
	async loadPlugins(plugins) {
		const results = [];
		for (const plugin of plugins) {
			const result = await this.loadPlugin(plugin);
			results.push(result);
			if (!result.success && !plugin.enabled) throw new BuilderError(ErrorCode.PLUGIN_LOAD_ERROR, `必需插件 ${plugin.name} 加载失败`, { cause: result.error });
		}
		return results;
	}
	/**
	* 获取插件
	*/
	getPlugin(name) {
		return this.plugins.get(name);
	}
	/**
	* 获取所有插件
	*/
	getAllPlugins() {
		return Array.from(this.plugins.values());
	}
	/**
	* 移除插件
	*/
	async removePlugin(name) {
		const plugin = this.plugins.get(name);
		if (!plugin) return false;
		try {
			if (plugin.onDestroy) await plugin.onDestroy({
				buildId: "destroy",
				pluginName: plugin.name,
				cwd: process.cwd(),
				mode: "production",
				platform: "browser",
				env: process.env,
				config: {},
				cacheDir: "",
				tempDir: "",
				logger: this.logger,
				performanceMonitor: null
			});
			this.plugins.delete(name);
			this.performanceStats.delete(name);
			this.logger.info(`插件 ${name} 已移除`);
			return true;
		} catch (error) {
			this.logger.error(`移除插件 ${name} 失败:`, error);
			return false;
		}
	}
	/**
	* 清空所有插件
	*/
	async clear() {
		const pluginNames = Array.from(this.plugins.keys());
		for (const name of pluginNames) await this.removePlugin(name);
	}
	/**
	* 获取插件性能统计
	*/
	getPerformanceStats(name) {
		if (name) {
			const stats = this.performanceStats.get(name);
			if (!stats) throw new BuilderError(ErrorCode.PLUGIN_NOT_FOUND, `插件 ${name} 不存在`);
			return stats;
		}
		return Array.from(this.performanceStats.values());
	}
	/**
	* 验证插件
	*/
	validatePlugin(plugin) {
		if (!plugin.name) throw new BuilderError(ErrorCode.PLUGIN_LOAD_ERROR, "插件必须有名称");
		if (typeof plugin.name !== "string") throw new BuilderError(ErrorCode.PLUGIN_LOAD_ERROR, "插件名称必须是字符串");
		if (plugin.dependencies) {
			for (const dep of plugin.dependencies) if (!this.plugins.has(dep)) throw new BuilderError(ErrorCode.PLUGIN_DEPENDENCY_ERROR, `插件 ${plugin.name} 依赖的插件 ${dep} 未找到`);
		}
	}
	/**
	* 销毁资源
	*/
	async dispose() {
		await this.clear();
		this.removeAllListeners();
	}
};

//#endregion
//#region src/constants/library-types.ts
/**
* 库类型检测模式
*/
const LIBRARY_TYPE_PATTERNS = {
	[LibraryType.TYPESCRIPT]: {
		files: [
			"src/**/*.ts",
			"src/**/*.tsx",
			"lib/**/*.ts",
			"lib/**/*.tsx",
			"index.ts",
			"main.ts"
		],
		dependencies: ["typescript", "@types/node"],
		configs: ["tsconfig.json", "tsconfig.build.json"],
		packageJsonFields: ["types", "typings"],
		weight: .8
	},
	[LibraryType.STYLE]: {
		files: [
			"src/**/*.css",
			"src/**/*.less",
			"src/**/*.scss",
			"src/**/*.sass",
			"src/**/*.styl",
			"lib/**/*.css",
			"styles/**/*"
		],
		dependencies: [
			"less",
			"sass",
			"stylus",
			"postcss"
		],
		configs: ["postcss.config.js", ".stylelintrc"],
		packageJsonFields: [
			"style",
			"sass",
			"less"
		],
		weight: .9
	},
	[LibraryType.VUE2]: {
		files: [
			"src/**/*.vue",
			"lib/**/*.vue",
			"components/**/*.vue"
		],
		dependencies: [
			"vue@^2",
			"@vue/composition-api",
			"vue-template-compiler"
		],
		devDependencies: ["@vue/cli-service", "vue-loader"],
		configs: ["vue.config.js"],
		packageJsonFields: [],
		weight: .95
	},
	[LibraryType.VUE3]: {
		files: [
			"src/**/*.vue",
			"lib/**/*.vue",
			"components/**/*.vue"
		],
		dependencies: [
			"vue@^3",
			"@vue/runtime-core",
			"@vue/runtime-dom"
		],
		devDependencies: ["@vitejs/plugin-vue", "@vue/compiler-sfc"],
		configs: ["vite.config.ts", "vite.config.js"],
		packageJsonFields: [],
		weight: .95
	},
	[LibraryType.REACT]: {
		files: [
			"src/**/*.tsx",
			"src/**/*.jsx",
			"lib/**/*.tsx",
			"components/**/*.tsx"
		],
		dependencies: ["react", "react-dom"],
		devDependencies: ["@vitejs/plugin-react"],
		configs: ["vite.config.ts", "vite.config.js"],
		packageJsonFields: [],
		weight: .95
	},
	[LibraryType.MIXED]: {
		files: ["src/**/*.{ts,tsx,vue,css,less,scss}"],
		dependencies: [],
		configs: [],
		packageJsonFields: [],
		weight: .6
	}
};
/**
* 库类型描述
*/
const LIBRARY_TYPE_DESCRIPTIONS = {
	[LibraryType.TYPESCRIPT]: "TypeScript 库 - 使用 TypeScript 编写的库，支持类型声明和现代 JavaScript 特性",
	[LibraryType.STYLE]: "样式库 - 包含 CSS、Less、Sass 等样式文件的库",
	[LibraryType.VUE2]: "Vue2 组件库 - 基于 Vue 2.x 的组件库",
	[LibraryType.VUE3]: "Vue3 组件库 - 基于 Vue 3.x 的组件库，支持 Composition API",
	[LibraryType.REACT]: "React 组件库 - 基于 React 18+ 的组件库，支持 JSX/TSX 与 Hooks",
	[LibraryType.MIXED]: "混合库 - 包含多种类型文件的复合库"
};
/**
* 库类型推荐配置
*/
const LIBRARY_TYPE_RECOMMENDED_CONFIG = {
	[LibraryType.TYPESCRIPT]: {
		output: {
			format: ["esm", "cjs"],
			sourcemap: true
		},
		typescript: {
			declaration: true,
			isolatedDeclarations: true
		},
		external: [],
		bundleless: false
	},
	[LibraryType.STYLE]: {
		output: {
			format: ["esm"],
			sourcemap: false
		},
		style: {
			extract: true,
			minimize: true,
			autoprefixer: true
		},
		external: [],
		bundleless: true
	},
	[LibraryType.VUE2]: {
		output: {
			format: [
				"esm",
				"cjs",
				"umd"
			],
			sourcemap: true
		},
		vue: {
			version: 2,
			onDemand: true
		},
		external: ["vue"],
		globals: { vue: "Vue" },
		bundleless: false
	},
	[LibraryType.VUE3]: {
		output: {
			format: [
				"esm",
				"cjs",
				"umd"
			],
			sourcemap: true
		},
		vue: {
			version: 3,
			onDemand: true
		},
		external: ["vue"],
		globals: { vue: "Vue" },
		bundleless: false
	},
	[LibraryType.REACT]: {
		output: {
			format: ["esm", "cjs"],
			sourcemap: true
		},
		external: ["react", "react-dom"],
		bundleless: false
	},
	[LibraryType.MIXED]: {
		output: {
			format: ["esm", "cjs"],
			sourcemap: true
		},
		typescript: { declaration: true },
		style: { extract: true },
		external: [],
		bundleless: false
	}
};
/**
* 库类型优先级
*/
const LIBRARY_TYPE_PRIORITY = {
	[LibraryType.VUE2]: 10,
	[LibraryType.VUE3]: 10,
	[LibraryType.REACT]: 10,
	[LibraryType.STYLE]: 8,
	[LibraryType.TYPESCRIPT]: 6,
	[LibraryType.MIXED]: 2
};
/**
* 库类型兼容性
*/
const LIBRARY_TYPE_COMPATIBILITY = {
	[LibraryType.TYPESCRIPT]: {
		rollup: "excellent",
		rolldown: "excellent",
		treeshaking: true,
		codeSplitting: true,
		bundleless: true
	},
	[LibraryType.STYLE]: {
		rollup: "good",
		rolldown: "good",
		treeshaking: false,
		codeSplitting: false,
		bundleless: true
	},
	[LibraryType.VUE2]: {
		rollup: "excellent",
		rolldown: "good",
		treeshaking: true,
		codeSplitting: true,
		bundleless: false
	},
	[LibraryType.VUE3]: {
		rollup: "excellent",
		rolldown: "excellent",
		treeshaking: true,
		codeSplitting: true,
		bundleless: false
	},
	[LibraryType.MIXED]: {
		rollup: "good",
		rolldown: "good",
		treeshaking: true,
		codeSplitting: true,
		bundleless: false
	}
};
/**
* 库类型所需插件
*/
const LIBRARY_TYPE_PLUGINS = {
	[LibraryType.TYPESCRIPT]: ["typescript", "dts"],
	[LibraryType.STYLE]: [
		"postcss",
		"less",
		"sass",
		"stylus"
	],
	[LibraryType.VUE2]: [
		"vue2",
		"vue-jsx",
		"typescript",
		"postcss"
	],
	[LibraryType.VUE3]: [
		"vue3",
		"vue-jsx",
		"typescript",
		"postcss"
	],
	[LibraryType.MIXED]: [
		"typescript",
		"vue3",
		"postcss",
		"dts"
	]
};
/**
* 库类型检测权重
*/
const DETECTION_WEIGHTS = {
	files: .4,
	dependencies: .3,
	configs: .2,
	packageJsonFields: .1
};
/**
* 最小置信度阈值
*/
const MIN_CONFIDENCE_THRESHOLD = .6;
/**
* 库类型检测缓存配置
*/
const DETECTION_CACHE_CONFIG = {
	enabled: true,
	ttl: 300 * 1e3,
	maxSize: 100
};
/**
* 库类型特定的文件扩展名
*/
const LIBRARY_TYPE_EXTENSIONS = {
	[LibraryType.TYPESCRIPT]: [
		".ts",
		".tsx",
		".d.ts"
	],
	[LibraryType.STYLE]: [
		".css",
		".less",
		".scss",
		".sass",
		".styl"
	],
	[LibraryType.VUE2]: [
		".vue",
		".ts",
		".tsx",
		".js",
		".jsx"
	],
	[LibraryType.VUE3]: [
		".vue",
		".ts",
		".tsx",
		".js",
		".jsx"
	],
	[LibraryType.MIXED]: [
		".ts",
		".tsx",
		".vue",
		".css",
		".less",
		".scss",
		".sass"
	]
};
/**
* 库类型排除模式
*/
const LIBRARY_TYPE_EXCLUDE_PATTERNS = {
	common: [
		"node_modules/**",
		"dist/**",
		"build/**",
		"**/*.test.*",
		"**/*.spec.*",
		"**/*.d.ts"
	],
	[LibraryType.TYPESCRIPT]: ["**/*.js", "**/*.jsx"],
	[LibraryType.STYLE]: [
		"**/*.ts",
		"**/*.tsx",
		"**/*.js",
		"**/*.jsx",
		"**/*.vue"
	],
	[LibraryType.VUE2]: [],
	[LibraryType.VUE3]: [],
	[LibraryType.MIXED]: []
};

//#endregion
//#region src/core/LibraryDetector.ts
init_file_system();
/**
* 库类型检测器类
*/
var LibraryDetector = class {
	logger;
	errorHandler;
	options;
	constructor(options = {}) {
		this.options = {
			confidence: .6,
			cache: true,
			...options
		};
		this.logger = options.logger || new Logger();
		this.errorHandler = new ErrorHandler({ logger: this.logger });
	}
	/**
	* 检测库类型
	*/
	async detect(projectPath) {
		try {
			this.logger.info(`开始检测项目类型: ${projectPath}`);
			const scores = {
				typescript: 0,
				style: 0,
				vue2: 0,
				vue3: 0,
				react: 0,
				mixed: 0
			};
			const evidence = {
				typescript: [],
				style: [],
				vue2: [],
				vue3: [],
				react: [],
				mixed: []
			};
			await this.detectFilePatterns(projectPath, scores, evidence);
			await this.detectDependencies(projectPath, scores, evidence);
			await this.detectConfigFiles(projectPath, scores, evidence);
			await this.detectPackageJsonFields(projectPath, scores, evidence);
			const finalScores = this.calculateFinalScores(scores);
			const detectedType = this.getBestMatch(finalScores);
			const confidence = finalScores[detectedType];
			const result = {
				type: detectedType,
				confidence,
				evidence: evidence[detectedType]
			};
			this.logger.success(`检测完成: ${detectedType} (置信度: ${(confidence * 100).toFixed(1)}%)`);
			return result;
		} catch (error) {
			this.errorHandler.handle(error, "detect");
			return {
				type: LibraryType.TYPESCRIPT,
				confidence: .5,
				evidence: []
			};
		}
	}
	/**
	* 检测文件模式
	*/
	async detectFilePatterns(projectPath, scores, evidence) {
		for (const [type, pattern] of Object.entries(LIBRARY_TYPE_PATTERNS)) {
			const libraryType = type;
			try {
				const files = await findFiles([...pattern.files], {
					cwd: projectPath,
					ignore: [
						"node_modules/**",
						"dist/**",
						"**/*.test.*",
						"**/*.spec.*"
					]
				});
				if (files.length > 0) {
					const score = Math.min(files.length * .1, 1) * pattern.weight;
					scores[libraryType] += score;
					evidence[libraryType].push({
						type: "file",
						description: `找到 ${files.length} 个 ${libraryType} 文件 (模式: ${pattern.files.join(", ")})`,
						weight: score,
						source: files.slice(0, 3).join(", ")
					});
				}
			} catch (error) {
				this.logger.debug(`检测 ${libraryType} 文件模式失败:`, error);
			}
		}
	}
	/**
	* 检测依赖
	*/
	async detectDependencies(projectPath, scores, evidence) {
		try {
			const packageJsonPath = path.join(projectPath, "package.json");
			if (await exists(packageJsonPath)) {
				const packageContent = await readFile(packageJsonPath, "utf-8");
				const packageJson = JSON.parse(packageContent);
				const allDeps = {
					...packageJson.dependencies,
					...packageJson.devDependencies,
					...packageJson.peerDependencies
				};
				for (const [type, pattern] of Object.entries(LIBRARY_TYPE_PATTERNS)) {
					const libraryType = type;
					const matchedDeps = [];
					for (const dep of pattern.dependencies) if (this.matchDependency(dep, allDeps)) matchedDeps.push(dep);
					if (matchedDeps.length > 0) {
						const score = matchedDeps.length / pattern.dependencies.length * pattern.weight * .8;
						scores[libraryType] += score;
						evidence[libraryType].push({
							type: "dependency",
							description: `找到相关依赖: ${matchedDeps.join(", ")}`,
							weight: score,
							source: "package.json"
						});
					}
				}
			}
		} catch (error) {
			this.logger.debug("检测依赖失败:", error);
		}
	}
	/**
	* 检测配置文件
	*/
	async detectConfigFiles(projectPath, scores, evidence) {
		for (const [type, pattern] of Object.entries(LIBRARY_TYPE_PATTERNS)) {
			const libraryType = type;
			const foundConfigs = [];
			for (const configFile of pattern.configs) {
				const configPath = path.join(projectPath, configFile);
				if (await exists(configPath)) foundConfigs.push(configFile);
			}
			if (foundConfigs.length > 0) {
				const score = foundConfigs.length / pattern.configs.length * pattern.weight * .6;
				scores[libraryType] += score;
				evidence[libraryType].push({
					type: "config",
					description: `找到配置文件: ${foundConfigs.join(", ")}`,
					weight: score,
					source: foundConfigs.join(", ")
				});
			}
		}
	}
	/**
	* 检测 package.json 字段
	*/
	async detectPackageJsonFields(projectPath, scores, evidence) {
		try {
			const packageJsonPath = path.join(projectPath, "package.json");
			if (await exists(packageJsonPath)) {
				const packageContent = await readFile(packageJsonPath, "utf-8");
				const packageJson = JSON.parse(packageContent);
				for (const [type, pattern] of Object.entries(LIBRARY_TYPE_PATTERNS)) {
					const libraryType = type;
					const foundFields = [];
					for (const field of pattern.packageJsonFields) if (packageJson[field]) foundFields.push(field);
					if (foundFields.length > 0) {
						const score = foundFields.length / pattern.packageJsonFields.length * pattern.weight * .4;
						scores[libraryType] += score;
						evidence[libraryType].push({
							type: "config",
							description: `找到 package.json 字段: ${foundFields.join(", ")}`,
							weight: score,
							source: "package.json"
						});
					}
				}
			}
		} catch (error) {
			this.logger.debug("检测 package.json 字段失败:", error);
		}
	}
	/**
	* 计算最终分数
	*/
	calculateFinalScores(scores) {
		const finalScores = { ...scores };
		for (const [type, priority] of Object.entries(LIBRARY_TYPE_PRIORITY)) {
			const libraryType = type;
			finalScores[libraryType] *= priority / 10;
		}
		const maxScore = Math.max(...Object.values(finalScores));
		if (maxScore > 0) for (const type of Object.keys(finalScores)) finalScores[type] = Math.min(finalScores[type] / maxScore, 1);
		return finalScores;
	}
	/**
	* 获取最佳匹配
	*/
	getBestMatch(scores) {
		let bestType = LibraryType.TYPESCRIPT;
		let bestScore = 0;
		for (const [type, score] of Object.entries(scores)) if (score > bestScore) {
			bestScore = score;
			bestType = type;
		}
		if (bestScore < this.options.confidence) return LibraryType.MIXED;
		return bestType;
	}
	/**
	* 匹配依赖
	*/
	matchDependency(pattern, dependencies) {
		if (pattern.includes("@")) {
			const [name, version] = pattern.split("@");
			return !!(dependencies[name] && dependencies[name].includes(version));
		}
		return !!dependencies[pattern];
	}
};

//#endregion
//#region src/core/PerformanceMonitor.ts
/**
* 性能监控器类
*/
var PerformanceMonitor = class extends EventEmitter {
	logger;
	options;
	sessions = /* @__PURE__ */ new Map();
	globalStats;
	constructor(options = {}) {
		super();
		this.options = {
			enabled: true,
			sampleInterval: 1e3,
			maxSamples: 100,
			...options
		};
		this.logger = options.logger || new Logger();
		this.globalStats = {
			totalBuilds: 0,
			totalTime: 0,
			averageTime: 0,
			cacheStats: {
				hits: 0,
				misses: 0,
				hitRate: 0,
				size: 0,
				entries: 0,
				timeSaved: 0
			}
		};
	}
	/**
	* 开始构建监控
	*/
	startBuild(buildId) {
		if (!this.options.enabled) return;
		const session = {
			buildId,
			startTime: Date.now(),
			memorySnapshots: [],
			fileStats: {
				totalFiles: 0,
				filesByType: {},
				averageProcessingTime: 0,
				slowestFiles: [],
				processingRate: 0
			},
			errors: []
		};
		this.sessions.set(buildId, session);
		this.startMemoryMonitoring(buildId);
		this.logger.debug(`开始监控构建: ${buildId}`);
		this.emit("build:start", {
			buildId,
			timestamp: session.startTime
		});
	}
	/**
	* 结束构建监控
	*/
	endBuild(buildId) {
		if (!this.options.enabled) return this.createEmptyMetrics();
		const session = this.sessions.get(buildId);
		if (!session) {
			this.logger.warn(`构建会话不存在: ${buildId}`);
			return this.createEmptyMetrics();
		}
		session.endTime = Date.now();
		const buildTime = session.endTime - session.startTime;
		this.globalStats.totalBuilds++;
		this.globalStats.totalTime += buildTime;
		this.globalStats.averageTime = this.globalStats.totalTime / this.globalStats.totalBuilds;
		const metrics = this.generateMetrics(session, buildTime);
		this.logger.info(`构建监控完成: ${buildId} (${buildTime}ms)`);
		this.emit("build:end", {
			buildId,
			metrics,
			timestamp: session.endTime
		});
		this.sessions.delete(buildId);
		return metrics;
	}
	/**
	* 记录错误
	*/
	recordError(buildId, error) {
		const session = this.sessions.get(buildId);
		if (session) session.errors.push(error);
	}
	/**
	* 记录文件处理
	*/
	recordFileProcessing(buildId, filePath, processingTime) {
		const session = this.sessions.get(buildId);
		if (!session) return;
		session.fileStats.totalFiles++;
		const ext = this.getFileExtension(filePath);
		session.fileStats.filesByType[ext] = (session.fileStats.filesByType[ext] || 0) + 1;
		if (session.fileStats.slowestFiles.length < 10) session.fileStats.slowestFiles.push({
			path: filePath,
			processingTime,
			size: 0,
			phases: []
		});
		else {
			const slowest = session.fileStats.slowestFiles;
			const minIndex = slowest.findIndex((f) => f.processingTime === Math.min(...slowest.map((f$1) => f$1.processingTime)));
			if (processingTime > slowest[minIndex].processingTime) slowest[minIndex] = {
				path: filePath,
				processingTime,
				size: 0,
				phases: []
			};
		}
	}
	/**
	* 记录缓存命中
	*/
	recordCacheHit(saved, timeSaved = 0) {
		if (saved) {
			this.globalStats.cacheStats.hits++;
			this.globalStats.cacheStats.timeSaved += timeSaved;
		} else this.globalStats.cacheStats.misses++;
		const total = this.globalStats.cacheStats.hits + this.globalStats.cacheStats.misses;
		this.globalStats.cacheStats.hitRate = this.globalStats.cacheStats.hits / total;
	}
	/**
	* 获取性能报告
	*/
	getPerformanceReport() {
		const timestamp = Date.now();
		return {
			timestamp,
			buildSummary: {
				bundler: "rollup",
				mode: "production",
				entryCount: 1,
				outputCount: 1,
				totalSize: 0,
				buildTime: this.globalStats.averageTime
			},
			metrics: this.createEmptyMetrics(),
			recommendations: [],
			analysis: {
				bottlenecks: [],
				resourceAnalysis: {
					cpuEfficiency: .8,
					memoryEfficiency: .7,
					ioEfficiency: .9,
					wastePoints: []
				},
				cacheAnalysis: {
					overallEfficiency: this.globalStats.cacheStats.hitRate,
					strategyRecommendations: [],
					configOptimizations: {}
				},
				parallelizationOpportunities: []
			}
		};
	}
	/**
	* 开始内存监控
	*/
	startMemoryMonitoring(buildId) {
		const session = this.sessions.get(buildId);
		if (!session) return;
		const interval = setInterval(() => {
			if (!this.sessions.has(buildId)) {
				clearInterval(interval);
				return;
			}
			const memoryUsage = this.getCurrentMemoryUsage();
			session.memorySnapshots.push(memoryUsage);
			if (session.memorySnapshots.length > (this.options.maxSamples || 100)) session.memorySnapshots.shift();
		}, this.options.sampleInterval);
	}
	/**
	* 获取当前内存使用情况
	*/
	getCurrentMemoryUsage() {
		const usage = process.memoryUsage();
		return {
			heapUsed: usage.heapUsed,
			heapTotal: usage.heapTotal,
			external: usage.external,
			rss: usage.rss,
			peak: Math.max(usage.heapUsed, usage.heapTotal),
			trend: []
		};
	}
	/**
	* 生成性能指标
	*/
	generateMetrics(session, buildTime) {
		const memoryUsage = this.calculateMemoryUsage(session.memorySnapshots);
		return {
			buildTime,
			memoryUsage,
			cacheStats: this.globalStats.cacheStats,
			fileStats: session.fileStats,
			pluginPerformance: [],
			systemResources: this.getSystemResources()
		};
	}
	/**
	* 计算内存使用情况
	*/
	calculateMemoryUsage(snapshots) {
		if (snapshots.length === 0) return this.getCurrentMemoryUsage();
		const latest = snapshots[snapshots.length - 1];
		const peak = Math.max(...snapshots.map((s) => s.heapUsed));
		return {
			...latest,
			peak,
			trend: snapshots.map((snapshot, index) => ({
				timestamp: Date.now() - (snapshots.length - index) * (this.options.sampleInterval || 1e3),
				usage: snapshot.heapUsed,
				phase: "building"
			}))
		};
	}
	/**
	* 获取系统资源使用情况
	*/
	getSystemResources() {
		return {
			cpuUsage: 0,
			availableMemory: 0,
			diskUsage: {
				total: 0,
				used: 0,
				available: 0,
				usagePercent: 0
			}
		};
	}
	/**
	* 获取文件扩展名
	*/
	getFileExtension(filePath) {
		const ext = filePath.split(".").pop();
		return ext ? `.${ext}` : "unknown";
	}
	/**
	* 创建空的性能指标
	*/
	createEmptyMetrics() {
		return {
			buildTime: 0,
			memoryUsage: this.getCurrentMemoryUsage(),
			cacheStats: this.globalStats.cacheStats,
			fileStats: {
				totalFiles: 0,
				filesByType: {},
				averageProcessingTime: 0,
				slowestFiles: [],
				processingRate: 0
			},
			pluginPerformance: [],
			systemResources: this.getSystemResources()
		};
	}
};

//#endregion
//#region src/core/TestRunner.ts
/**
* 支持的测试框架配置
*/
const TEST_FRAMEWORKS = {
	vitest: {
		configFiles: [
			"vitest.config.ts",
			"vitest.config.js",
			"vite.config.ts",
			"vite.config.js"
		],
		command: "vitest",
		args: ["run", "--reporter=json"],
		dependencies: ["vitest"]
	},
	jest: {
		configFiles: [
			"jest.config.js",
			"jest.config.ts",
			"jest.config.json"
		],
		command: "jest",
		args: ["--json", "--coverage=false"],
		dependencies: ["jest"]
	},
	mocha: {
		configFiles: [
			".mocharc.json",
			".mocharc.js",
			".mocharc.yaml"
		],
		command: "mocha",
		args: ["--reporter", "json"],
		dependencies: ["mocha"]
	}
};
/**
* 包管理器配置
*/
const PACKAGE_MANAGERS = {
	npm: {
		installCommand: "npm",
		installArgs: ["install"],
		runCommand: "npx"
	},
	yarn: {
		installCommand: "yarn",
		installArgs: ["install"],
		runCommand: "yarn"
	},
	pnpm: {
		installCommand: "pnpm",
		installArgs: ["install"],
		runCommand: "pnpm"
	}
};
/**
* 测试运行器实现
*/
var TestRunner = class {
	/** 日志记录器 */
	logger;
	/** 错误处理器 */
	errorHandler;
	/**
	* 构造函数
	*/
	constructor(options = {}) {
		this.logger = options.logger || new Logger({
			level: "info",
			prefix: "TestRunner"
		});
		this.errorHandler = options.errorHandler || new ErrorHandler({ logger: this.logger });
	}
	/**
	* 运行测试
	*/
	async runTests(context) {
		const startTime = Date.now();
		this.logger.info("开始运行测试...");
		try {
			const framework = await this.detectFramework(context.projectRoot);
			this.logger.info(`检测到测试框架: ${framework}`);
			const frameworkConfig = TEST_FRAMEWORKS[framework];
			if (!frameworkConfig) throw new Error(`不支持的测试框架: ${framework}`);
			const packageManager = await this.detectPackageManager(context.projectRoot);
			const runCommand = PACKAGE_MANAGERS[packageManager].runCommand;
			const testOutput = await this.executeTests(context.tempDir, runCommand, frameworkConfig.command, frameworkConfig.args, context.config.timeout || 6e4);
			const result = await this.parseTestOutput(testOutput, framework);
			const duration = Date.now() - startTime;
			const performance = {
				setupTime: 0,
				executionTime: duration,
				teardownTime: 0,
				peakMemoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
				cpuUsage: 0
			};
			const testResult = {
				success: result.success ?? false,
				totalTests: result.totalTests ?? 0,
				passedTests: result.passedTests ?? 0,
				failedTests: result.failedTests ?? 0,
				skippedTests: result.skippedTests ?? 0,
				output: result.output ?? "",
				errors: result.errors ?? [],
				duration,
				performance
			};
			this.logger.success(`测试运行完成: ${testResult.passedTests}/${testResult.totalTests} 通过`);
			return testResult;
		} catch (error) {
			const testError = this.errorHandler.createError(ErrorCode.BUILD_FAILED, "测试运行失败", { cause: error });
			return {
				success: false,
				totalTests: 0,
				passedTests: 0,
				failedTests: 0,
				skippedTests: 0,
				duration: Date.now() - startTime,
				output: error instanceof Error ? error.message : String(error),
				errors: [{
					message: testError.message,
					stack: testError.stack,
					type: "runtime"
				}],
				performance: {
					setupTime: 0,
					executionTime: Date.now() - startTime,
					teardownTime: 0,
					peakMemoryUsage: 0,
					cpuUsage: 0
				}
			};
		}
	}
	/**
	* 检测测试框架
	*/
	async detectFramework(projectRoot) {
		this.logger.info("检测测试框架...");
		const packageJsonPath = path$1.join(projectRoot, "package.json");
		if (await fs.pathExists(packageJsonPath)) {
			const packageJson = await fs.readJson(packageJsonPath);
			const allDeps = {
				...packageJson.dependencies,
				...packageJson.devDependencies
			};
			if (allDeps.vitest) return "vitest";
			if (allDeps.jest) return "jest";
			if (allDeps.mocha) return "mocha";
		}
		for (const [framework, config] of Object.entries(TEST_FRAMEWORKS)) for (const configFile of config.configFiles) if (await fs.pathExists(path$1.join(projectRoot, configFile))) return framework;
		this.logger.warn("未检测到测试框架，使用默认的 vitest");
		return "vitest";
	}
	/**
	* 安装依赖
	*/
	async installDependencies(context) {
		this.logger.info("安装依赖...");
		const packageManager = await this.detectPackageManager(context.projectRoot);
		const pmConfig = PACKAGE_MANAGERS[packageManager];
		try {
			await this.executeCommand(context.tempDir, pmConfig.installCommand, pmConfig.installArgs, context.config.environment?.installTimeout || 3e5);
			this.logger.success("依赖安装完成");
		} catch (error) {
			throw this.errorHandler.createError(ErrorCode.BUILD_FAILED, "依赖安装失败", { cause: error });
		}
	}
	/**
	* 清理资源
	*/
	async dispose() {
		this.logger.info("TestRunner 资源清理完成");
	}
	/**
	* 检测包管理器
	*/
	async detectPackageManager(projectRoot) {
		if (await fs.pathExists(path$1.join(projectRoot, "pnpm-lock.yaml"))) return "pnpm";
		if (await fs.pathExists(path$1.join(projectRoot, "yarn.lock"))) return "yarn";
		if (await fs.pathExists(path$1.join(projectRoot, "package-lock.json"))) return "npm";
		return "npm";
	}
	/**
	* 执行测试命令
	*/
	async executeTests(cwd, runCommand, testCommand, args, timeout) {
		return new Promise((resolve$1, reject) => {
			const fullCommand = [testCommand, ...args];
			const child = spawn(runCommand, fullCommand, {
				cwd,
				stdio: "pipe",
				shell: true
			});
			let stdout = "";
			let stderr = "";
			child.stdout?.on("data", (data) => {
				stdout += data.toString();
			});
			child.stderr?.on("data", (data) => {
				stderr += data.toString();
			});
			const timer = setTimeout(() => {
				child.kill("SIGTERM");
				reject(/* @__PURE__ */ new Error(`测试超时 (${timeout}ms)`));
			}, timeout);
			child.on("close", (code) => {
				clearTimeout(timer);
				if (code === 0) resolve$1(stdout);
				else reject(/* @__PURE__ */ new Error(`测试失败 (退出码: ${code})\n${stderr}`));
			});
			child.on("error", (error) => {
				clearTimeout(timer);
				reject(error);
			});
		});
	}
	/**
	* 执行命令
	*/
	async executeCommand(cwd, command, args, timeout) {
		return new Promise((resolve$1, reject) => {
			const child = spawn(command, args, {
				cwd,
				stdio: "pipe",
				shell: true
			});
			let stdout = "";
			let stderr = "";
			child.stdout?.on("data", (data) => {
				stdout += data.toString();
			});
			child.stderr?.on("data", (data) => {
				stderr += data.toString();
			});
			const timer = setTimeout(() => {
				child.kill("SIGTERM");
				reject(/* @__PURE__ */ new Error(`命令超时 (${timeout}ms)`));
			}, timeout);
			child.on("close", (code) => {
				clearTimeout(timer);
				if (code === 0) resolve$1(stdout);
				else reject(/* @__PURE__ */ new Error(`命令失败 (退出码: ${code})\n${stderr}`));
			});
			child.on("error", (error) => {
				clearTimeout(timer);
				reject(error);
			});
		});
	}
	/**
	* 解析测试输出
	*/
	async parseTestOutput(output, framework) {
		try {
			const result = JSON.parse(output);
			switch (framework) {
				case "vitest": return this.parseVitestOutput(result);
				case "jest": return this.parseJestOutput(result);
				case "mocha": return this.parseMochaOutput(result);
				default: return this.parseGenericOutput(result);
			}
		} catch (error) {
			return {
				success: output.includes("PASS") || output.includes("✓"),
				totalTests: 0,
				passedTests: 0,
				failedTests: 0,
				skippedTests: 0,
				output,
				errors: []
			};
		}
	}
	/**
	* 解析 Vitest 输出
	*/
	parseVitestOutput(result) {
		return {
			success: result.success || false,
			totalTests: result.numTotalTests || 0,
			passedTests: result.numPassedTests || 0,
			failedTests: result.numFailedTests || 0,
			skippedTests: result.numPendingTests || 0,
			output: JSON.stringify(result, null, 2),
			errors: this.extractVitestErrors(result)
		};
	}
	/**
	* 解析 Jest 输出
	*/
	parseJestOutput(result) {
		return {
			success: result.success || false,
			totalTests: result.numTotalTests || 0,
			passedTests: result.numPassedTests || 0,
			failedTests: result.numFailedTests || 0,
			skippedTests: result.numPendingTests || 0,
			output: JSON.stringify(result, null, 2),
			errors: this.extractJestErrors(result)
		};
	}
	/**
	* 解析 Mocha 输出
	*/
	parseMochaOutput(result) {
		const tests = result.tests || [];
		const passed = tests.filter((t) => t.state === "passed").length;
		const failed = tests.filter((t) => t.state === "failed").length;
		const pending = tests.filter((t) => t.pending).length;
		return {
			success: failed === 0,
			totalTests: tests.length,
			passedTests: passed,
			failedTests: failed,
			skippedTests: pending,
			output: JSON.stringify(result, null, 2),
			errors: this.extractMochaErrors(result)
		};
	}
	/**
	* 解析通用输出
	*/
	parseGenericOutput(result) {
		return {
			success: result.success || false,
			totalTests: result.totalTests || 0,
			passedTests: result.passedTests || 0,
			failedTests: result.failedTests || 0,
			skippedTests: result.skippedTests || 0,
			output: JSON.stringify(result, null, 2),
			errors: []
		};
	}
	/**
	* 提取 Vitest 错误
	*/
	extractVitestErrors(result) {
		const errors = [];
		if (result.testResults) result.testResults.forEach((testResult) => {
			if (testResult.assertionResults) testResult.assertionResults.forEach((assertion) => {
				if (assertion.status === "failed") errors.push({
					message: assertion.failureMessages?.[0] || "测试失败",
					type: "assertion",
					file: testResult.name
				});
			});
		});
		return errors;
	}
	/**
	* 提取 Jest 错误
	*/
	extractJestErrors(result) {
		const errors = [];
		if (result.testResults) result.testResults.forEach((testResult) => {
			if (testResult.message) errors.push({
				message: testResult.message,
				type: "assertion",
				file: testResult.name
			});
		});
		return errors;
	}
	/**
	* 提取 Mocha 错误
	*/
	extractMochaErrors(result) {
		const errors = [];
		if (result.failures) result.failures.forEach((failure) => {
			errors.push({
				message: failure.err?.message || "测试失败",
				stack: failure.err?.stack,
				type: "assertion",
				file: failure.file
			});
		});
		return errors;
	}
};

//#endregion
//#region src/core/ValidationReporter.ts
/**
* 验证报告生成器实现
*/
var ValidationReporter = class {
	/** 日志记录器 */
	logger;
	/**
	* 构造函数
	*/
	constructor(options = {}) {
		this.logger = options.logger || new Logger({
			level: "info",
			prefix: "ValidationReporter"
		});
	}
	/**
	* 生成报告
	*/
	async generateReport(result, _config) {
		this.logger.info("生成验证报告...");
		const report = {
			title: `构建验证报告 - ${result.validationId}`,
			summary: this.generateSummary(result),
			details: {
				fileResults: [],
				formatResults: [],
				typeResults: [],
				styleResults: []
			},
			recommendations: this.generateRecommendations(result),
			generatedAt: Date.now(),
			version: "1.0.0"
		};
		return report;
	}
	/**
	* 输出报告
	*/
	async outputReport(report, config) {
		this.logger.info(`输出验证报告 (格式: ${config.format})`);
		switch (config.format) {
			case "console":
				await this.outputConsoleReport(report, config);
				break;
			case "json":
				await this.outputJsonReport(report, config);
				break;
			case "html":
				await this.outputHtmlReport(report, config);
				break;
			case "markdown":
				await this.outputMarkdownReport(report, config);
				break;
			default: await this.outputConsoleReport(report, config);
		}
	}
	/**
	* 生成摘要
	*/
	generateSummary(result) {
		return {
			status: result.success ? "passed" : "failed",
			totalFiles: result.stats.totalFiles,
			passedFiles: result.success ? result.stats.totalFiles : 0,
			failedFiles: result.success ? 0 : result.stats.totalFiles,
			totalTests: result.testResult.totalTests,
			passedTests: result.testResult.passedTests,
			failedTests: result.testResult.failedTests,
			duration: result.duration
		};
	}
	/**
	* 生成建议
	*/
	generateRecommendations(result) {
		const recommendations = [];
		if (!result.success) recommendations.push({
			type: "error",
			title: "验证失败",
			description: "打包后的代码验证失败，请检查构建配置和测试用例",
			solution: "检查构建输出和测试日志，修复相关问题",
			priority: "high"
		});
		if (result.errors.length > 0) recommendations.push({
			type: "error",
			title: "发现错误",
			description: `发现 ${result.errors.length} 个错误`,
			solution: "查看详细错误信息并逐一修复",
			priority: "high"
		});
		if (result.warnings.length > 0) recommendations.push({
			type: "warning",
			title: "发现警告",
			description: `发现 ${result.warnings.length} 个警告`,
			solution: "查看警告信息并考虑优化",
			priority: "medium"
		});
		if (result.duration > 6e4) recommendations.push({
			type: "optimization",
			title: "验证耗时较长",
			description: `验证耗时 ${Math.round(result.duration / 1e3)}s，建议优化`,
			solution: "考虑减少测试用例数量或优化测试性能",
			priority: "low"
		});
		return recommendations;
	}
	/**
	* 输出控制台报告
	*/
	async outputConsoleReport(report, config) {
		const { summary } = report;
		console.log("\n" + "=".repeat(60));
		console.log(`📋 ${report.title}`);
		console.log("=".repeat(60));
		const statusIcon = summary.status === "passed" ? "✅" : "❌";
		const statusText = summary.status === "passed" ? "通过" : "失败";
		console.log(`\n${statusIcon} 验证状态: ${statusText}`);
		console.log("\n📊 统计信息:");
		console.log(`   总测试数: ${summary.totalTests}`);
		console.log(`   通过测试: ${summary.passedTests}`);
		console.log(`   失败测试: ${summary.failedTests}`);
		console.log(`   验证耗时: ${Math.round(summary.duration / 1e3)}s`);
		if (report.recommendations.length > 0) {
			console.log("\n💡 建议:");
			report.recommendations.forEach((rec, index) => {
				const icon = this.getRecommendationIcon(rec.type);
				console.log(`   ${index + 1}. ${icon} ${rec.title}`);
				if (config.verbose) {
					console.log(`      ${rec.description}`);
					if (rec.solution) console.log(`      解决方案: ${rec.solution}`);
				}
			});
		}
		console.log("\n" + "=".repeat(60) + "\n");
	}
	/**
	* 输出 JSON 报告
	*/
	async outputJsonReport(report, config) {
		const outputPath = config.outputPath || "validation-report.json";
		const reportJson = JSON.stringify(report, null, 2);
		await fs.ensureDir(path$1.dirname(outputPath));
		await fs.writeFile(outputPath, reportJson, "utf8");
		this.logger.success(`JSON 报告已保存到: ${outputPath}`);
	}
	/**
	* 输出 HTML 报告
	*/
	async outputHtmlReport(report, config) {
		const outputPath = config.outputPath || "validation-report.html";
		const html = this.generateHtmlReport(report);
		await fs.ensureDir(path$1.dirname(outputPath));
		await fs.writeFile(outputPath, html, "utf8");
		this.logger.success(`HTML 报告已保存到: ${outputPath}`);
	}
	/**
	* 输出 Markdown 报告
	*/
	async outputMarkdownReport(report, config) {
		const outputPath = config.outputPath || "validation-report.md";
		const markdown = this.generateMarkdownReport(report);
		await fs.ensureDir(path$1.dirname(outputPath));
		await fs.writeFile(outputPath, markdown, "utf8");
		this.logger.success(`Markdown 报告已保存到: ${outputPath}`);
	}
	/**
	* 生成 HTML 报告
	*/
	generateHtmlReport(report) {
		const { summary } = report;
		const statusClass = summary.status === "passed" ? "success" : "error";
		return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; }
        .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
        .status { padding: 10px 20px; border-radius: 5px; margin: 20px 0; }
        .success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; color: #007bff; }
        .recommendations { margin-top: 30px; }
        .recommendation { margin: 10px 0; padding: 15px; border-left: 4px solid #007bff; background: #f8f9fa; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${report.title}</h1>
        <p>生成时间: ${new Date(report.generatedAt).toLocaleString()}</p>
    </div>

    <div class="status ${statusClass}">
        <h2>验证状态: ${summary.status === "passed" ? "✅ 通过" : "❌ 失败"}</h2>
    </div>

    <div class="stats">
        <div class="stat-card">
            <div class="stat-number">${summary.totalTests}</div>
            <div>总测试数</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${summary.passedTests}</div>
            <div>通过测试</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${summary.failedTests}</div>
            <div>失败测试</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${Math.round(summary.duration / 1e3)}s</div>
            <div>验证耗时</div>
        </div>
    </div>

    ${report.recommendations.length > 0 ? `
    <div class="recommendations">
        <h2>💡 建议</h2>
        ${report.recommendations.map((rec) => `
        <div class="recommendation">
            <h3>${this.getRecommendationIcon(rec.type)} ${rec.title}</h3>
            <p>${rec.description}</p>
            ${rec.solution ? `<p><strong>解决方案:</strong> ${rec.solution}</p>` : ""}
        </div>
        `).join("")}
    </div>
    ` : ""}
</body>
</html>
    `.trim();
	}
	/**
	* 生成 Markdown 报告
	*/
	generateMarkdownReport(report) {
		const { summary } = report;
		return `
# ${report.title}

**生成时间:** ${new Date(report.generatedAt).toLocaleString()}

## 验证状态

${summary.status === "passed" ? "✅ **通过**" : "❌ **失败**"}

## 统计信息

| 项目 | 数量 |
|------|------|
| 总测试数 | ${summary.totalTests} |
| 通过测试 | ${summary.passedTests} |
| 失败测试 | ${summary.failedTests} |
| 验证耗时 | ${Math.round(summary.duration / 1e3)}s |

${report.recommendations.length > 0 ? `
## 💡 建议

${report.recommendations.map((rec, index) => `
### ${index + 1}. ${this.getRecommendationIcon(rec.type)} ${rec.title}

${rec.description}

${rec.solution ? `**解决方案:** ${rec.solution}` : ""}
`).join("")}
` : ""}
    `.trim();
	}
	/**
	* 获取建议图标
	*/
	getRecommendationIcon(type) {
		switch (type) {
			case "error": return "❌";
			case "warning": return "⚠️";
			case "info": return "ℹ️";
			case "optimization": return "⚡";
			default: return "💡";
		}
	}
};

//#endregion
//#region src/core/TemporaryEnvironment.ts
/**
* 临时环境管理器实现
*/
var TemporaryEnvironment = class {
	/** 日志记录器 */
	logger;
	/** 错误处理器 */
	errorHandler;
	/** 创建的临时目录列表 */
	tempDirs = /* @__PURE__ */ new Set();
	/**
	* 构造函数
	*/
	constructor(options = {}) {
		this.logger = options.logger || new Logger({
			level: "info",
			prefix: "TemporaryEnvironment"
		});
		this.errorHandler = options.errorHandler || new ErrorHandler({ logger: this.logger });
	}
	/**
	* 创建临时环境
	*/
	async create(context) {
		this.logger.info("创建临时验证环境...");
		try {
			const tempDir = await this.createTempDirectory(context);
			context.tempDir = tempDir;
			this.tempDirs.add(tempDir);
			await this.copyProjectFiles(context);
			await this.updatePackageJson(context);
			this.logger.success(`临时环境创建完成: ${tempDir}`);
		} catch (error) {
			throw this.errorHandler.createError(ErrorCode.BUILD_FAILED, "创建临时环境失败", { cause: error });
		}
	}
	/**
	* 复制构建产物到临时环境
	*/
	async copyBuildOutputs(context) {
		this.logger.info("复制构建产物到临时环境...");
		try {
			for (const output of context.buildResult.outputs) {
				const sourcePath = path$1.join(context.outputDir, output.fileName);
				const targetPath = path$1.join(context.tempDir, output.fileName);
				if (await fs.pathExists(sourcePath)) {
					await fs.ensureDir(path$1.dirname(targetPath));
					await fs.copy(sourcePath, targetPath);
					this.logger.debug(`复制文件: ${sourcePath} -> ${targetPath}`);
				}
			}
			this.logger.success("构建产物复制完成");
		} catch (error) {
			throw this.errorHandler.createError(ErrorCode.BUILD_FAILED, "复制构建产物失败", { cause: error });
		}
	}
	/**
	* 清理临时环境
	*/
	async cleanup(context) {
		this.logger.info("清理临时环境...");
		try {
			if (context.tempDir && this.tempDirs.has(context.tempDir)) {
				await fs.remove(context.tempDir);
				this.tempDirs.delete(context.tempDir);
				this.logger.success(`临时目录已删除: ${context.tempDir}`);
			}
		} catch (error) {
			this.logger.warn(`清理临时目录失败: ${error}`);
		}
	}
	/**
	* 清理所有临时环境
	*/
	async dispose() {
		this.logger.info("清理所有临时环境...");
		const cleanupPromises = Array.from(this.tempDirs).map(async (tempDir) => {
			try {
				await fs.remove(tempDir);
				this.logger.debug(`临时目录已删除: ${tempDir}`);
			} catch (error) {
				this.logger.warn(`清理临时目录失败: ${tempDir}, 错误: ${error}`);
			}
		});
		await Promise.all(cleanupPromises);
		this.tempDirs.clear();
		this.logger.success("所有临时环境清理完成");
	}
	/**
	* 创建临时目录
	*/
	async createTempDirectory(context) {
		const tempDirName = `ldesign-builder-validation-${randomUUID().slice(0, 8)}`;
		const baseTempDir = context.config.environment?.tempDir ? path$1.resolve(context.projectRoot, context.config.environment.tempDir) : path$1.join(os.tmpdir(), "ldesign-builder");
		const tempDir = path$1.join(baseTempDir, tempDirName);
		await fs.ensureDir(tempDir);
		this.logger.debug(`创建临时目录: ${tempDir}`);
		return tempDir;
	}
	/**
	* 复制项目文件到临时目录
	*/
	async copyProjectFiles(context) {
		this.logger.info("复制项目文件到临时目录...");
		const filesToCopy = [
			"package.json",
			"package-lock.json",
			"yarn.lock",
			"pnpm-lock.yaml",
			"tsconfig.json",
			"vitest.config.ts",
			"vitest.config.js",
			"jest.config.js",
			"jest.config.ts",
			".mocharc.json",
			".mocharc.js"
		];
		for (const file of filesToCopy) {
			const sourcePath = path$1.join(context.projectRoot, file);
			if (await fs.pathExists(sourcePath)) {
				const targetPath = path$1.join(context.tempDir, file);
				await fs.copy(sourcePath, targetPath);
				this.logger.debug(`复制配置文件: ${file}`);
			}
		}
		await this.copyTestFiles(context);
		await this.copySourceFiles(context);
	}
	/**
	* 复制测试文件
	*/
	async copyTestFiles(context) {
		const testPatterns = Array.isArray(context.config.testPattern) ? context.config.testPattern : [context.config.testPattern || "**/*.test.{js,ts}"];
		const glob = await import("fast-glob");
		for (const pattern of testPatterns) {
			const testFiles = await glob.default(pattern, {
				cwd: context.projectRoot,
				absolute: false
			});
			for (const testFile of testFiles) {
				const sourcePath = path$1.join(context.projectRoot, testFile);
				const targetPath = path$1.join(context.tempDir, testFile);
				await fs.ensureDir(path$1.dirname(targetPath));
				await fs.copy(sourcePath, targetPath);
				this.logger.debug(`复制测试文件: ${testFile}`);
			}
		}
	}
	/**
	* 复制源码文件
	*/
	async copySourceFiles(context) {
		const srcDir = path$1.join(context.projectRoot, "src");
		if (await fs.pathExists(srcDir)) {
			const targetSrcDir = path$1.join(context.tempDir, "src");
			await fs.copy(srcDir, targetSrcDir);
			this.logger.debug("复制源码目录: src");
		}
	}
	/**
	* 更新 package.json 以使用构建产物
	*/
	async updatePackageJson(context) {
		const packageJsonPath = path$1.join(context.tempDir, "package.json");
		if (!await fs.pathExists(packageJsonPath)) {
			this.logger.warn("临时环境中未找到 package.json");
			return;
		}
		try {
			const packageJson = await fs.readJson(packageJsonPath);
			const outputs = context.buildResult.outputs;
			const esmOutput = outputs.find((o) => o.fileName.includes(".js") && !o.fileName.includes(".cjs"));
			const cjsOutput = outputs.find((o) => o.fileName.includes(".cjs"));
			const typesOutput = outputs.find((o) => o.fileName.endsWith(".d.ts"));
			if (esmOutput) {
				packageJson.module = esmOutput.fileName;
				packageJson.exports = packageJson.exports || {};
				packageJson.exports["."] = packageJson.exports["."] || {};
				packageJson.exports["."].import = esmOutput.fileName;
			}
			if (cjsOutput) {
				packageJson.main = cjsOutput.fileName;
				packageJson.exports = packageJson.exports || {};
				packageJson.exports["."] = packageJson.exports["."] || {};
				packageJson.exports["."].require = cjsOutput.fileName;
			}
			if (typesOutput) {
				packageJson.types = typesOutput.fileName;
				packageJson.typings = typesOutput.fileName;
			}
			await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
			this.logger.success("package.json 已更新为使用构建产物");
		} catch (error) {
			this.logger.warn(`更新 package.json 失败: ${error}`);
		}
	}
	/**
	* 获取临时目录列表
	*/
	getTempDirectories() {
		return Array.from(this.tempDirs);
	}
	/**
	* 检查临时目录是否存在
	*/
	async exists(tempDir) {
		return fs.pathExists(tempDir);
	}
	/**
	* 获取临时目录大小
	*/
	async getSize(tempDir) {
		try {
			const stats = await this.getDirectoryStats(tempDir);
			return stats.size;
		} catch (error) {
			return 0;
		}
	}
	/**
	* 获取目录统计信息
	*/
	async getDirectoryStats(dirPath) {
		let totalSize = 0;
		let totalFiles = 0;
		const items = await fs.readdir(dirPath);
		for (const item of items) {
			const itemPath = path$1.join(dirPath, item);
			const stats = await fs.stat(itemPath);
			if (stats.isDirectory()) {
				const subStats = await this.getDirectoryStats(itemPath);
				totalSize += subStats.size;
				totalFiles += subStats.files;
			} else {
				totalSize += stats.size;
				totalFiles += 1;
			}
		}
		return {
			size: totalSize,
			files: totalFiles
		};
	}
};

//#endregion
//#region src/core/PostBuildValidator.ts
/**
* 默认验证配置
*/
const DEFAULT_VALIDATION_CONFIG = {
	enabled: true,
	testFramework: "auto",
	testPattern: ["**/*.test.{js,ts}", "**/*.spec.{js,ts}"],
	timeout: 6e4,
	failOnError: true,
	environment: {
		tempDir: ".validation-temp",
		keepTempFiles: false,
		env: {},
		nodeVersion: process.version,
		packageManager: "auto",
		installDependencies: true,
		installTimeout: 3e5
	},
	reporting: {
		format: "console",
		outputPath: "validation-report",
		verbose: false,
		logLevel: "info",
		includePerformance: true,
		includeCoverage: false
	},
	hooks: {},
	scope: {
		formats: ["esm", "cjs"],
		fileTypes: [
			"js",
			"ts",
			"dts"
		],
		exclude: ["**/*.d.ts", "**/node_modules/**"],
		include: ["**/*"],
		validateTypes: true,
		validateStyles: false,
		validateSourceMaps: false
	}
};
/**
* 打包后验证器实现
*/
var PostBuildValidator = class extends EventEmitter {
	/** 验证配置 */
	config;
	/** 测试运行器 */
	testRunner;
	/** 验证报告生成器 */
	reporter;
	/** 临时环境管理器 */
	tempEnvironment;
	/** 日志记录器 */
	logger;
	/** 错误处理器 */
	errorHandler;
	/**
	* 构造函数
	*/
	constructor(config = {}, options = {}) {
		super();
		this.config = this.mergeConfig(DEFAULT_VALIDATION_CONFIG, config);
		this.logger = options.logger || new Logger({
			level: "info",
			prefix: "PostBuildValidator"
		});
		this.errorHandler = options.errorHandler || new ErrorHandler({ logger: this.logger });
		this.testRunner = new TestRunner({
			logger: this.logger,
			errorHandler: this.errorHandler
		});
		this.reporter = new ValidationReporter({ logger: this.logger });
		this.tempEnvironment = new TemporaryEnvironment({
			logger: this.logger,
			errorHandler: this.errorHandler
		});
		this.logger.info("PostBuildValidator 初始化完成");
	}
	/**
	* 执行验证
	*/
	async validate(context) {
		const validationId = randomUUID();
		const startTime = Date.now();
		this.logger.info(`开始打包后验证 (ID: ${validationId})`);
		this.emit("validation:start", {
			context,
			validationId,
			startTime
		});
		try {
			if (this.config.hooks?.beforeValidation) await this.config.hooks.beforeValidation(context);
			const stats = {
				startTime,
				endTime: 0,
				totalDuration: 0,
				setupDuration: 0,
				testDuration: 0,
				reportDuration: 0,
				cleanupDuration: 0,
				totalFiles: 0,
				totalTests: 0,
				peakMemoryUsage: 0
			};
			const setupStartTime = Date.now();
			await this.setupValidationEnvironment(context);
			stats.setupDuration = Date.now() - setupStartTime;
			if (this.config.hooks?.afterEnvironmentSetup) await this.config.hooks.afterEnvironmentSetup(context);
			const testStartTime = Date.now();
			const testResult = await this.runValidationTests(context);
			stats.testDuration = Date.now() - testStartTime;
			stats.totalTests = testResult.totalTests;
			const endTime = Date.now();
			stats.endTime = endTime;
			stats.totalDuration = endTime - startTime;
			const validationResult = {
				success: testResult.success,
				duration: stats.totalDuration,
				testResult,
				report: await this.generateValidationReport(context, testResult, stats),
				errors: [],
				warnings: [],
				stats,
				timestamp: endTime,
				validationId
			};
			const reportStartTime = Date.now();
			await this.outputValidationReport(validationResult);
			stats.reportDuration = Date.now() - reportStartTime;
			const cleanupStartTime = Date.now();
			await this.cleanupValidationEnvironment(context);
			stats.cleanupDuration = Date.now() - cleanupStartTime;
			if (this.config.hooks?.afterValidation) await this.config.hooks.afterValidation(context, validationResult);
			this.emit("validation:complete", {
				context,
				result: validationResult
			});
			this.logger.success(`验证完成 (ID: ${validationId}), 耗时: ${stats.totalDuration}ms`);
			return validationResult;
		} catch (error) {
			const validationError = this.errorHandler.createError(ErrorCode.BUILD_FAILED, "验证过程失败", { cause: error });
			if (this.config.hooks?.onValidationError) await this.config.hooks.onValidationError(context, validationError);
			this.emit("validation:error", {
				context,
				error: validationError,
				validationId
			});
			try {
				await this.cleanupValidationEnvironment(context);
			} catch (cleanupError) {
				this.logger.warn("清理验证环境时出错:", cleanupError);
			}
			throw validationError;
		}
	}
	/**
	* 设置配置
	*/
	setConfig(config) {
		this.config = this.mergeConfig(this.config, config);
		this.logger.info("验证配置已更新");
	}
	/**
	* 获取配置
	*/
	getConfig() {
		return { ...this.config };
	}
	/**
	* 清理资源
	*/
	async dispose() {
		this.logger.info("正在清理 PostBuildValidator 资源...");
		await this.testRunner.dispose();
		await this.tempEnvironment.dispose();
		this.removeAllListeners();
		this.logger.info("PostBuildValidator 资源清理完成");
	}
	/**
	* 准备验证环境
	*/
	async setupValidationEnvironment(context) {
		this.logger.info("准备验证环境...");
		await this.tempEnvironment.create(context);
		await this.tempEnvironment.copyBuildOutputs(context);
		if (this.config.environment?.installDependencies) await this.testRunner.installDependencies(context);
		this.logger.success("验证环境准备完成");
	}
	/**
	* 运行验证测试
	*/
	async runValidationTests(context) {
		this.logger.info("运行验证测试...");
		if (this.config.hooks?.beforeTestRun) await this.config.hooks.beforeTestRun(context);
		const testResult = await this.testRunner.runTests(context);
		if (this.config.hooks?.afterTestRun) await this.config.hooks.afterTestRun(context, testResult);
		this.logger.success(`测试运行完成: ${testResult.passedTests}/${testResult.totalTests} 通过`);
		return testResult;
	}
	/**
	* 生成验证报告
	*/
	async generateValidationReport(context, testResult, stats) {
		this.logger.info("生成验证报告...");
		const summary = {
			status: testResult.success ? "passed" : "failed",
			totalFiles: stats.totalFiles,
			passedFiles: stats.totalFiles,
			failedFiles: 0,
			totalTests: testResult.totalTests,
			passedTests: testResult.passedTests,
			failedTests: testResult.failedTests,
			duration: stats.totalDuration
		};
		const details = {
			fileResults: [],
			formatResults: [],
			typeResults: [],
			styleResults: []
		};
		const report = {
			title: `构建验证报告 - ${context.buildContext.buildId}`,
			summary,
			details,
			recommendations: [],
			generatedAt: Date.now(),
			version: "1.0.0"
		};
		return report;
	}
	/**
	* 输出验证报告
	*/
	async outputValidationReport(result) {
		if (this.config.reporting) await this.reporter.outputReport(result.report, this.config.reporting);
	}
	/**
	* 清理验证环境
	*/
	async cleanupValidationEnvironment(context) {
		this.logger.info("清理验证环境...");
		if (!this.config.environment?.keepTempFiles) await this.tempEnvironment.cleanup(context);
		this.logger.success("验证环境清理完成");
	}
	/**
	* 合并配置
	*/
	mergeConfig(base, override) {
		return {
			...base,
			...override,
			environment: {
				...base.environment,
				...override.environment
			},
			reporting: {
				...base.reporting,
				...override.reporting
			},
			hooks: {
				...base.hooks,
				...override.hooks
			},
			scope: {
				...base.scope,
				...override.scope
			}
		};
	}
};

//#endregion
//#region src/adapters/rollup/RollupAdapter.ts
/**
* Rollup 适配器类
*/
var RollupAdapter = class {
	name = "rollup";
	version;
	available;
	logger;
	performanceMonitor;
	multiConfigs;
	constructor(options = {}) {
		this.logger = options.logger || new Logger();
		this.performanceMonitor = options.performanceMonitor;
		this.version = "unknown";
		this.available = true;
		this.logger.debug("Rollup 适配器初始化");
	}
	/**
	* 执行构建
	*/
	async build(config) {
		if (!this.available) throw new BuilderError(ErrorCode.ADAPTER_NOT_AVAILABLE, "Rollup 适配器不可用");
		try {
			const rollup = await this.loadRollup();
			const rollupConfig = await this.transformConfig(config);
			this.logger.info("开始 Rollup 构建...");
			const startTime = Date.now();
			let results = [];
			if (this.multiConfigs && this.multiConfigs.length > 1) for (const singleConfig of this.multiConfigs) {
				const bundle = await rollup.rollup(singleConfig);
				const { output } = await bundle.generate(singleConfig.output);
				results.push(...output);
				await bundle.write(singleConfig.output);
				await bundle.close();
			}
			else {
				const bundle = await rollup.rollup(rollupConfig);
				const outputs = Array.isArray(rollupConfig.output) ? rollupConfig.output : [rollupConfig.output];
				for (const outputConfig of outputs) {
					const { output } = await bundle.generate(outputConfig);
					results.push(...output);
				}
				for (const outputConfig of outputs) await bundle.write(outputConfig);
				await bundle.close();
			}
			const duration = Date.now() - startTime;
			const buildResult = {
				success: true,
				outputs: results.map((chunk) => ({
					fileName: chunk.fileName,
					size: chunk.type === "chunk" ? chunk.code.length : chunk.source.length,
					source: chunk.type === "chunk" ? chunk.code : chunk.source,
					type: chunk.type,
					format: "esm",
					gzipSize: 0
				})),
				duration,
				stats: {
					buildTime: duration,
					fileCount: results.length,
					totalSize: {
						raw: results.reduce((total, chunk) => total + (chunk.type === "chunk" ? chunk.code.length : chunk.source.length), 0),
						gzip: 0,
						brotli: 0,
						byType: {},
						byFormat: {
							esm: 0,
							cjs: 0,
							umd: 0,
							iife: 0,
							css: 0
						},
						largest: {
							file: "",
							size: 0
						},
						fileCount: results.length
					},
					byFormat: {
						esm: {
							fileCount: results.length,
							size: {
								raw: results.reduce((total, chunk) => total + (chunk.type === "chunk" ? chunk.code.length : chunk.source.length), 0),
								gzip: 0,
								brotli: 0,
								byType: {},
								byFormat: {
									esm: 0,
									cjs: 0,
									umd: 0,
									iife: 0,
									css: 0
								},
								largest: {
									file: "",
									size: 0
								},
								fileCount: results.length
							}
						},
						cjs: {
							fileCount: 0,
							size: {
								raw: 0,
								gzip: 0,
								brotli: 0,
								byType: {},
								byFormat: {
									esm: 0,
									cjs: 0,
									umd: 0,
									iife: 0,
									css: 0
								},
								largest: {
									file: "",
									size: 0
								},
								fileCount: 0
							}
						},
						umd: {
							fileCount: 0,
							size: {
								raw: 0,
								gzip: 0,
								brotli: 0,
								byType: {},
								byFormat: {
									esm: 0,
									cjs: 0,
									umd: 0,
									iife: 0,
									css: 0
								},
								largest: {
									file: "",
									size: 0
								},
								fileCount: 0
							}
						},
						iife: {
							fileCount: 0,
							size: {
								raw: 0,
								gzip: 0,
								brotli: 0,
								byType: {},
								byFormat: {
									esm: 0,
									cjs: 0,
									umd: 0,
									iife: 0,
									css: 0
								},
								largest: {
									file: "",
									size: 0
								},
								fileCount: 0
							}
						},
						css: {
							fileCount: 0,
							size: {
								raw: 0,
								gzip: 0,
								brotli: 0,
								byType: {},
								byFormat: {
									esm: 0,
									cjs: 0,
									umd: 0,
									iife: 0,
									css: 0
								},
								largest: {
									file: "",
									size: 0
								},
								fileCount: 0
							}
						}
					},
					modules: {
						total: 0,
						external: 0,
						internal: 0,
						largest: {
							id: "",
							size: 0,
							renderedLength: 0,
							originalLength: 0,
							isEntry: false,
							isExternal: false,
							importedIds: [],
							dynamicallyImportedIds: [],
							importers: [],
							dynamicImporters: []
						}
					},
					dependencies: {
						total: 0,
						external: [],
						bundled: [],
						circular: []
					}
				},
				performance: this.getPerformanceMetrics(),
				warnings: [],
				errors: [],
				buildId: `rollup-${Date.now()}`,
				timestamp: Date.now(),
				bundler: "rollup",
				mode: "production"
			};
			this.logger.success(`Rollup 构建完成 (${duration}ms)`);
			return buildResult;
		} catch (error) {
			throw new BuilderError(ErrorCode.BUILD_FAILED, `Rollup 构建失败: ${error.message}`, { cause: error });
		}
	}
	/**
	* 启动监听模式
	*/
	async watch(config) {
		if (!this.available) throw new BuilderError(ErrorCode.ADAPTER_NOT_AVAILABLE, "Rollup 适配器不可用");
		try {
			const rollup = await this.loadRollup();
			const rollupConfig = await this.transformConfig(config);
			const watchOptions = config.watch || {};
			const watchConfig = {
				...rollupConfig,
				watch: {
					include: watchOptions.include || ["src/**/*"],
					exclude: watchOptions.exclude || ["node_modules/**/*"],
					...typeof watchOptions === "object" ? watchOptions : {}
				}
			};
			const watcher = rollup.watch(watchConfig);
			const buildWatcher = {
				patterns: watchConfig.watch.include,
				watching: true,
				async close() {
					await watcher.close();
				},
				on(event, listener) {
					watcher.on(event, listener);
					return this;
				},
				off(event, listener) {
					watcher.off(event, listener);
					return this;
				},
				emit(_event, ..._args) {
					return false;
				}
			};
			this.logger.info("Rollup 监听模式已启动");
			return buildWatcher;
		} catch (error) {
			throw new BuilderError(ErrorCode.BUILD_FAILED, `启动 Rollup 监听模式失败: ${error.message}`, { cause: error });
		}
	}
	/**
	* 转换配置
	*/
	async transformConfig(config) {
		const basePlugins = await this.getBasePlugins(config);
		const rollupConfig = {
			input: config.input,
			external: config.external
		};
		if (config.output) {
			const outputConfig = config.output;
			if (Array.isArray(outputConfig.format)) {
				const isMultiEntry = this.isMultiEntryBuild(config.input);
				let formats = outputConfig.format;
				let umdConfig = null;
				if (isMultiEntry) {
					const originalFormats = [...formats];
					const hasUMD = formats.includes("umd");
					const forceUMD = config.umd?.forceMultiEntry || false;
					const umdEnabled = config.umd?.enabled;
					this.logger.info(`多入口项目UMD检查: hasUMD=${hasUMD}, forceUMD=${forceUMD}, umdEnabled=${umdEnabled}`);
					if (hasUMD && forceUMD) {
						umdConfig = await this.createUMDConfig(config);
						this.logger.info("多入口项目强制启用 UMD 构建");
					} else if (hasUMD) {
						formats = formats.filter((format$1) => format$1 !== "umd" && format$1 !== "iife");
						if (config.umd?.enabled !== false) {
							umdConfig = await this.createUMDConfig(config);
							this.logger.info("为多入口项目创建独立的 UMD 构建");
						}
					} else {
						if (config.umd?.enabled) {
							umdConfig = await this.createUMDConfig(config);
							this.logger.info("根据UMD配置为多入口项目创建 UMD 构建");
						}
						formats = formats.filter((format$1) => format$1 !== "umd" && format$1 !== "iife");
					}
					const filteredFormats = originalFormats.filter((format$1) => !formats.includes(format$1));
					if (filteredFormats.length > 0 && !umdConfig) this.logger.warn(`多入口构建不支持 ${filteredFormats.join(", ")} 格式，已自动过滤`);
				} else if (formats.includes("umd") || config.umd?.enabled) umdConfig = await this.createUMDConfig(config);
				const configs = [];
				for (const format$1 of formats) {
					const mapped = this.mapFormat(format$1);
					const isESM = format$1 === "esm";
					const isCJS = format$1 === "cjs";
					const dir = isESM ? "es" : isCJS ? "lib" : "dist";
					const entryFileNames = isESM ? "[name].js" : isCJS ? "[name].cjs" : "[name].umd.js";
					const chunkFileNames = entryFileNames;
					const formatPlugins = await this.transformPluginsForFormat(config.plugins || [], dir);
					configs.push({
						input: config.input,
						external: config.external,
						plugins: [...basePlugins, ...formatPlugins],
						output: {
							dir,
							format: mapped,
							name: outputConfig.name,
							sourcemap: outputConfig.sourcemap,
							globals: outputConfig.globals,
							entryFileNames,
							chunkFileNames,
							exports: outputConfig.exports ?? "auto",
							preserveModules: isESM || isCJS,
							preserveModulesRoot: isESM || isCJS ? "src" : void 0
						},
						treeshake: config.treeshake
					});
				}
				if (umdConfig) configs.push(umdConfig);
				this.multiConfigs = configs;
				return configs[0];
			} else {
				const format$1 = outputConfig.format;
				const mapped = this.mapFormat(format$1);
				const isESM = format$1 === "esm";
				const isCJS = format$1 === "cjs";
				const dir = isESM ? "es" : isCJS ? "lib" : "dist";
				const entryFileNames = isESM ? "[name].js" : isCJS ? "[name].cjs" : "[name].umd.js";
				const chunkFileNames = entryFileNames;
				const userPlugins = await this.transformPluginsForFormat(config.plugins || [], dir);
				rollupConfig.plugins = [...basePlugins, ...userPlugins];
				rollupConfig.output = {
					dir,
					format: mapped,
					name: outputConfig.name,
					sourcemap: outputConfig.sourcemap,
					globals: outputConfig.globals,
					entryFileNames,
					chunkFileNames,
					exports: outputConfig.exports ?? "auto",
					preserveModules: isESM || isCJS,
					preserveModulesRoot: isESM || isCJS ? "src" : void 0
				};
			}
		}
		if (config.treeshake !== void 0) rollupConfig.treeshake = config.treeshake;
		return rollupConfig;
	}
	/**
	* 转换插件
	*/
	async transformPlugins(plugins) {
		const transformedPlugins = [];
		for (const plugin of plugins) try {
			if (plugin.plugin && typeof plugin.plugin === "function") {
				const actualPlugin = await plugin.plugin();
				transformedPlugins.push(actualPlugin);
			} else if (plugin.rollup) transformedPlugins.push({
				...plugin,
				...plugin.rollup
			});
			else transformedPlugins.push(plugin);
		} catch (error) {
			this.logger.warn(`插件 ${plugin.name || "unknown"} 加载失败:`, error.message);
		}
		return transformedPlugins;
	}
	/**
	* 为特定格式转换插件，动态设置TypeScript插件的declarationDir
	*/
	async transformPluginsForFormat(plugins, outputDir) {
		const transformedPlugins = [];
		for (const plugin of plugins) try {
			if (plugin.plugin && typeof plugin.plugin === "function") if (plugin.name === "typescript") {
				const typescript = await import("@rollup/plugin-typescript");
				const originalPlugin = await plugin.plugin();
				let originalOptions = {};
				if (originalPlugin && typeof originalPlugin === "object") originalOptions = originalPlugin.options || {};
				const newPlugin = typescript.default({
					...originalOptions,
					declaration: true,
					declarationDir: outputDir,
					outDir: outputDir
				});
				transformedPlugins.push(newPlugin);
			} else {
				const actualPlugin = await plugin.plugin();
				transformedPlugins.push(actualPlugin);
			}
			else if (plugin.rollup) transformedPlugins.push({
				...plugin,
				...plugin.rollup
			});
			else transformedPlugins.push(plugin);
		} catch (error) {
			this.logger.warn(`插件 ${plugin.name || "unknown"} 加载失败:`, error.message);
		}
		return transformedPlugins;
	}
	/**
	* 检查功能支持
	*/
	supportsFeature(feature) {
		const supportedFeatures = [
			"treeshaking",
			"code-splitting",
			"dynamic-import",
			"sourcemap",
			"plugin-system",
			"config-file",
			"cache-support"
		];
		return supportedFeatures.includes(feature);
	}
	/**
	* 获取功能支持映射
	*/
	getFeatureSupport() {
		return {
			treeshaking: true,
			"code-splitting": true,
			"dynamic-import": true,
			"worker-support": false,
			"css-bundling": false,
			"asset-processing": true,
			sourcemap: true,
			minification: false,
			"hot-reload": false,
			"module-federation": false,
			"incremental-build": false,
			"parallel-build": false,
			"cache-support": true,
			"plugin-system": true,
			"config-file": true
		};
	}
	/**
	* 获取性能指标
	*/
	getPerformanceMetrics() {
		if (this.performanceMonitor && typeof this.performanceMonitor.getMetrics === "function") return this.performanceMonitor.getMetrics();
		return {
			buildTime: 0,
			memoryUsage: {
				heapUsed: process.memoryUsage().heapUsed,
				heapTotal: process.memoryUsage().heapTotal,
				external: process.memoryUsage().external,
				rss: process.memoryUsage().rss,
				peak: 0,
				trend: []
			},
			cacheStats: {
				hits: 0,
				misses: 0,
				hitRate: 0,
				size: 0,
				entries: 0,
				timeSaved: 0
			},
			fileStats: {
				totalFiles: 0,
				filesByType: {},
				averageProcessingTime: 0,
				slowestFiles: [],
				processingRate: 0
			},
			pluginPerformance: [],
			systemResources: {
				cpuUsage: 0,
				availableMemory: 0,
				diskUsage: {
					total: 0,
					used: 0,
					available: 0,
					usagePercent: 0
				}
			}
		};
	}
	/**
	* 清理资源
	*/
	async dispose() {}
	/**
	* 加载 Rollup
	*/
	async loadRollup() {
		try {
			return await import("rollup");
		} catch (error) {
			throw new Error("Rollup 未安装，请运行: npm install rollup --save-dev");
		}
	}
	/**
	* 获取基础插件（内置）
	* - node-resolve: 解决第三方包解析，并优先浏览器分支
	* - commonjs: 兼容 CommonJS 包
	* - json: 允许 import JSON（如某些包内的 package.json 或配置 JSON）
	*/
	async getBasePlugins(config) {
		try {
			const { nodeResolve } = await import("@rollup/plugin-node-resolve");
			const commonjs = (await import("@rollup/plugin-commonjs")).default;
			const json = (await import("@rollup/plugin-json")).default;
			const resolvePlugin = nodeResolve({
				browser: true,
				preferBuiltins: false,
				extensions: [
					".mjs",
					".js",
					".json",
					".ts",
					".tsx"
				]
			});
			const commonjsPlugin = commonjs({
				include: /node_modules/,
				ignoreDynamicRequires: false
			});
			const jsonPlugin = json();
			const plugins = [
				resolvePlugin,
				commonjsPlugin,
				jsonPlugin
			];
			const babelPlugin = await this.getBabelPlugin(config);
			if (babelPlugin) plugins.push(babelPlugin);
			return plugins;
		} catch (error) {
			this.logger.warn("基础插件加载失败，将尝试继续构建", error.message);
			return [];
		}
	}
	/**
	* 获取 Babel 插件
	*/
	async getBabelPlugin(config) {
		const babelConfig = config.babel;
		if (!babelConfig?.enabled) return null;
		try {
			const { getBabelOutputPlugin } = await import("@rollup/plugin-babel");
			const babelOptions = {
				babelHelpers: babelConfig.runtime ? "runtime" : "bundled",
				exclude: babelConfig.exclude || /node_modules/,
				include: babelConfig.include,
				extensions: [
					".js",
					".jsx",
					".ts",
					".tsx"
				],
				presets: babelConfig.presets || [],
				plugins: babelConfig.plugins || []
			};
			if (babelOptions.presets.length === 0) babelOptions.presets = [["@babel/preset-env", {
				targets: babelConfig.targets || "defaults",
				useBuiltIns: babelConfig.polyfill === "usage" ? "usage" : false,
				corejs: babelConfig.polyfill ? 3 : false
			}]];
			if (babelConfig.runtime && !babelOptions.plugins.some((p) => (Array.isArray(p) ? p[0] : p).includes("@babel/plugin-transform-runtime"))) babelOptions.plugins.push(["@babel/plugin-transform-runtime", {
				corejs: false,
				helpers: true,
				regenerator: true,
				useESModules: true
			}]);
			if (babelConfig.configFile !== false) babelOptions.configFile = babelConfig.configFile;
			if (babelConfig.babelrc !== false) babelOptions.babelrc = babelConfig.babelrc;
			return getBabelOutputPlugin(babelOptions);
		} catch (error) {
			this.logger.warn("Babel 插件加载失败，将跳过 Babel 转换", error.message);
			return null;
		}
	}
	/**
	* 映射输出格式
	*/
	mapFormat(format$1) {
		if (typeof format$1 === "string") {
			const formatMap = {
				esm: "es",
				cjs: "cjs",
				umd: "umd",
				iife: "iife"
			};
			return formatMap[format$1] || format$1;
		}
		return "es";
	}
	/**
	* 检查是否为多入口构建
	*/
	isMultiEntryBuild(input) {
		if (Array.isArray(input)) return input.length > 1;
		if (typeof input === "object" && input !== null) return Object.keys(input).length > 1;
		if (typeof input === "string") return input.includes("*") || input.includes("?") || input.includes("[");
		return false;
	}
	/**
	* 创建 UMD 配置
	*/
	async createUMDConfig(config) {
		const umdConfig = config.umd || {};
		const outputConfig = config.output || {};
		let umdEntry = umdConfig.entry || "src/index.ts";
		const fs$5 = await import("fs");
		const path$6 = await import("path");
		const possibleEntries = [
			umdEntry,
			"src/index.ts",
			"src/index.js",
			"src/main.ts",
			"src/main.js",
			"index.ts",
			"index.js"
		];
		for (const entry of possibleEntries) if (fs$5.existsSync(path$6.resolve(process.cwd(), entry))) {
			umdEntry = entry;
			break;
		}
		let umdName = umdConfig.name || outputConfig.name;
		if (!umdName) try {
			const packageJson = JSON.parse(fs$5.readFileSync(path$6.resolve(process.cwd(), "package.json"), "utf-8"));
			umdName = this.generateUMDName(packageJson.name);
		} catch {
			umdName = "MyLibrary";
		}
		const basePlugins = await this.getBasePlugins(config);
		const userPlugins = await this.transformPluginsForFormat(config.plugins || [], "dist");
		const bannerConfig = config.banner || {};
		const banner = await this.resolveBanner(bannerConfig);
		const footer = await this.resolveFooter(bannerConfig);
		this.logger.info(`UMD Banner配置: ${JSON.stringify(bannerConfig)}`);
		this.logger.info(`解析后的Banner: ${banner}`);
		return {
			input: umdEntry,
			external: config.external,
			plugins: [...basePlugins, ...userPlugins],
			output: {
				format: "umd",
				name: umdName,
				file: `dist/${umdConfig.fileName || "index.umd.js"}`,
				sourcemap: outputConfig.sourcemap,
				globals: {
					...outputConfig.globals,
					...umdConfig.globals
				},
				exports: "auto",
				banner,
				footer,
				intro: await this.resolveIntro(bannerConfig),
				outro: await this.resolveOutro(bannerConfig)
			},
			treeshake: config.treeshake
		};
	}
	/**
	* 生成 UMD 全局变量名
	*/
	generateUMDName(packageName) {
		if (!packageName) return "MyLibrary";
		const name = packageName.replace(/^@[^/]+\//, "");
		return name.split(/[-_]/).map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join("");
	}
	/**
	* 解析 Banner
	*/
	async resolveBanner(bannerConfig) {
		const banners = [];
		if (typeof bannerConfig.banner === "function") {
			const customBanner = await bannerConfig.banner();
			if (customBanner) banners.push(customBanner);
		} else if (typeof bannerConfig.banner === "string" && bannerConfig.banner) banners.push(bannerConfig.banner);
		if (bannerConfig.copyright) {
			const copyright = this.generateCopyright(bannerConfig.copyright);
			if (copyright) banners.push(copyright);
		}
		if (bannerConfig.buildInfo) {
			const buildInfo = this.generateBuildInfo(bannerConfig.buildInfo);
			if (buildInfo) banners.push(buildInfo);
		}
		return banners.length > 0 ? banners.join("\n") : void 0;
	}
	/**
	* 解析 Footer
	*/
	async resolveFooter(bannerConfig) {
		if (typeof bannerConfig.footer === "function") return await bannerConfig.footer();
		if (typeof bannerConfig.footer === "string") return bannerConfig.footer;
		return void 0;
	}
	/**
	* 解析 Intro
	*/
	async resolveIntro(bannerConfig) {
		if (typeof bannerConfig.intro === "function") return await bannerConfig.intro();
		if (typeof bannerConfig.intro === "string") return bannerConfig.intro;
		return void 0;
	}
	/**
	* 解析 Outro
	*/
	async resolveOutro(bannerConfig) {
		if (typeof bannerConfig.outro === "function") return await bannerConfig.outro();
		if (typeof bannerConfig.outro === "string") return bannerConfig.outro;
		return void 0;
	}
	/**
	* 生成版权信息
	*/
	generateCopyright(copyrightConfig) {
		const config = typeof copyrightConfig === "object" ? copyrightConfig : {};
		const year = config.year || (/* @__PURE__ */ new Date()).getFullYear();
		const owner = config.owner || "Unknown";
		const license = config.license || "MIT";
		if (config.template) return config.template.replace(/\{year\}/g, year).replace(/\{owner\}/g, owner).replace(/\{license\}/g, license);
		return `/*!\n * Copyright (c) ${year} ${owner}\n * Licensed under ${license}\n */`;
	}
	/**
	* 生成构建信息
	*/
	generateBuildInfo(buildInfoConfig) {
		const config = typeof buildInfoConfig === "object" ? buildInfoConfig : {};
		const parts = [];
		if (config.version !== false) try {
			const fs$5 = __require("fs");
			const packageJson = JSON.parse(fs$5.readFileSync("package.json", "utf-8"));
			parts.push(`Version: ${packageJson.version}`);
		} catch {}
		if (config.buildTime !== false) parts.push(`Built: ${(/* @__PURE__ */ new Date()).toISOString()}`);
		if (config.environment !== false) parts.push(`Environment: development`);
		if (config.git !== false) try {
			const { execSync } = __require("child_process");
			const commit = execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim();
			parts.push(`Commit: ${commit}`);
		} catch {}
		if (config.template) return config.template;
		return parts.length > 0 ? `/*!\n * ${parts.join("\n * ")}\n */` : "";
	}
};

//#endregion
//#region src/adapters/rolldown/RolldownAdapter.ts
/**
* Rolldown 适配器类
*/
var RolldownAdapter = class {
	name = "rolldown";
	version;
	available;
	logger;
	performanceMonitor;
	constructor(options = {}) {
		this.logger = options.logger || new Logger();
		this.performanceMonitor = options.performanceMonitor;
		try {
			const rolldown = this.loadRolldown();
			this.version = rolldown.VERSION || "unknown";
			this.available = true;
			this.logger.debug(`Rolldown 适配器初始化成功 (v${this.version})`);
		} catch (error) {
			this.version = "unknown";
			this.available = true;
			this.logger.debug("Rolldown 同步加载失败，将在使用时异步加载");
		}
	}
	/**
	* 执行构建
	*/
	async build(config) {
		if (!this.available) throw new BuilderError(ErrorCode.ADAPTER_NOT_AVAILABLE, "Rolldown 适配器不可用");
		try {
			const rolldown = await this.ensureRolldownLoaded();
			const rolldownConfig = await this.transformConfig(config);
			this.logger.info("开始 Rolldown 构建...");
			const startTime = Date.now();
			const result = await rolldown.build(rolldownConfig);
			const duration = Date.now() - startTime;
			const buildResult = {
				success: true,
				outputs: result.outputs || [],
				duration,
				stats: result.stats || {
					totalSize: 0,
					gzipSize: 0,
					files: [],
					chunks: [],
					assets: [],
					modules: [],
					dependencies: [],
					warnings: [],
					errors: []
				},
				performance: this.getPerformanceMetrics(),
				warnings: result.warnings || [],
				errors: [],
				buildId: `rolldown-${Date.now()}`,
				timestamp: Date.now(),
				bundler: "rolldown",
				mode: "production"
			};
			this.logger.success(`Rolldown 构建完成 (${duration}ms)`);
			return buildResult;
		} catch (error) {
			throw new BuilderError(ErrorCode.BUILD_FAILED, `Rolldown 构建失败: ${error.message}`, { cause: error });
		}
	}
	/**
	* 启动监听模式
	*/
	async watch(config) {
		if (!this.available) throw new BuilderError(ErrorCode.ADAPTER_NOT_AVAILABLE, "Rolldown 适配器不可用");
		try {
			const rolldown = await this.ensureRolldownLoaded();
			const rolldownConfig = await this.transformConfig(config);
			const watcher = await rolldown.watch(rolldownConfig);
			const watchOptions = config.watch || {};
			const buildWatcher = {
				patterns: typeof watchOptions === "object" && watchOptions.include || ["src/**/*"],
				watching: true,
				async close() {
					if (watcher && typeof watcher.close === "function") await watcher.close();
				},
				on(event, listener) {
					if (watcher && typeof watcher.on === "function") watcher.on(event, listener);
					return this;
				},
				off(event, listener) {
					if (watcher && typeof watcher.off === "function") watcher.off(event, listener);
					return this;
				},
				emit(event, ...args) {
					if (watcher && typeof watcher.emit === "function") return watcher.emit(event, ...args);
					return false;
				}
			};
			this.logger.info("Rolldown 监听模式已启动");
			return buildWatcher;
		} catch (error) {
			throw new BuilderError(ErrorCode.BUILD_FAILED, `启动 Rolldown 监听模式失败: ${error.message}`, { cause: error });
		}
	}
	/**
	* 转换配置
	*/
	async transformConfig(config) {
		const rolldownConfig = {
			input: config.input,
			external: config.external,
			plugins: []
		};
		if (config.output) rolldownConfig.output = {
			dir: config.output.dir,
			file: config.output.file,
			format: Array.isArray(config.output.format) ? config.output.format[0] : config.output.format,
			name: config.output.name,
			sourcemap: config.output.sourcemap,
			globals: config.output.globals
		};
		if (config.platform) rolldownConfig.platform = config.platform;
		if (config.treeshake !== void 0) rolldownConfig.treeshake = config.treeshake;
		return rolldownConfig;
	}
	/**
	* 转换插件
	*/
	async transformPlugins(plugins) {
		const transformedPlugins = [];
		for (const plugin of plugins) try {
			if (plugin.plugin && typeof plugin.plugin === "function") {
				const actualPlugin = await plugin.plugin();
				transformedPlugins.push(actualPlugin);
			} else if (plugin.rolldown) transformedPlugins.push({
				...plugin,
				...plugin.rolldown
			});
			else if (plugin.setup) transformedPlugins.push(plugin);
			else transformedPlugins.push(this.convertRollupPlugin(plugin));
		} catch (error) {
			this.logger.warn(`插件 ${plugin.name || "unknown"} 加载失败:`, error.message);
		}
		return transformedPlugins;
	}
	/**
	* 检查功能支持
	*/
	supportsFeature(feature) {
		const supportedFeatures = [
			"treeshaking",
			"code-splitting",
			"dynamic-import",
			"sourcemap",
			"minification",
			"plugin-system",
			"config-file",
			"cache-support",
			"parallel-build",
			"incremental-build"
		];
		return supportedFeatures.includes(feature);
	}
	/**
	* 获取功能支持映射
	*/
	getFeatureSupport() {
		return {
			treeshaking: true,
			"code-splitting": true,
			"dynamic-import": true,
			"worker-support": true,
			"css-bundling": true,
			"asset-processing": true,
			sourcemap: true,
			minification: true,
			"hot-reload": false,
			"module-federation": false,
			"incremental-build": true,
			"parallel-build": true,
			"cache-support": true,
			"plugin-system": true,
			"config-file": true
		};
	}
	/**
	* 获取性能指标
	*/
	getPerformanceMetrics() {
		if (this.performanceMonitor) return this.performanceMonitor.getPerformanceMetrics();
		return {
			buildTime: 0,
			memoryUsage: {
				heapUsed: process.memoryUsage().heapUsed,
				heapTotal: process.memoryUsage().heapTotal,
				external: process.memoryUsage().external,
				rss: process.memoryUsage().rss,
				peak: 0,
				trend: []
			},
			cacheStats: {
				hits: 0,
				misses: 0,
				hitRate: 0,
				size: 0,
				entries: 0,
				timeSaved: 0
			},
			fileStats: {
				totalFiles: 0,
				filesByType: {},
				averageProcessingTime: 0,
				slowestFiles: [],
				processingRate: 0
			},
			pluginPerformance: [],
			systemResources: {
				cpuUsage: 0,
				availableMemory: 0,
				diskUsage: {
					total: 0,
					used: 0,
					available: 0,
					usagePercent: 0
				}
			}
		};
	}
	/**
	* 清理资源
	*/
	async dispose() {}
	/**
	* 确保 Rolldown 已加载（支持异步）
	*/
	async ensureRolldownLoaded() {
		try {
			return this.loadRolldown();
		} catch (error) {
			try {
				this.logger.debug("尝试异步加载 rolldown...");
				const rolldown = await import("rolldown");
				if (rolldown && (rolldown.VERSION || typeof rolldown.build === "function")) {
					this.logger.debug(`Rolldown 异步加载成功: ${rolldown.VERSION || "unknown"}`);
					return rolldown;
				}
				throw new Error("Rolldown 模块无效");
			} catch (asyncError) {
				throw new BuilderError(ErrorCode.ADAPTER_NOT_AVAILABLE, "Rolldown 未安装或无法加载，请运行: npm install rolldown --save-dev", { cause: asyncError });
			}
		}
	}
	/**
	* 加载 Rolldown（同步方式）
	*/
	loadRolldown() {
		try {
			if (typeof __require !== "undefined") return __require("rolldown");
			if (typeof process !== "undefined" && process.versions && process.versions.node) {
				const globalRequire = globalThis.require;
				if (globalRequire) return globalRequire("rolldown");
				const nodeGlobal = global;
				if (nodeGlobal && nodeGlobal.require) return nodeGlobal.require("rolldown");
			}
			throw new Error("无法在当前环境中加载 rolldown 模块");
		} catch (error) {
			throw new Error("Rolldown 未安装，请运行: npm install rolldown --save-dev");
		}
	}
	/**
	* 转换 Rollup 插件为 Rolldown 格式
	*/
	convertRollupPlugin(plugin) {
		if (plugin.setup) return plugin;
		return {
			name: plugin.name || "unknown",
			setup(build) {
				if (plugin.resolveId) build.onResolve({ filter: /.*/ }, plugin.resolveId);
				if (plugin.load) build.onLoad({ filter: /.*/ }, plugin.load);
				if (plugin.transform) build.onTransform({ filter: /.*/ }, plugin.transform);
			}
		};
	}
};

//#endregion
//#region src/adapters/base/AdapterFactory.ts
/**
* 基础适配器实现（临时）
*/
var BaseAdapter = class {
	name;
	version = "1.0.0";
	available = true;
	constructor(name) {
		this.name = name;
	}
	async build(_config) {
		return {
			success: true,
			outputs: [],
			duration: 1e3,
			stats: {
				totalSize: 0,
				gzipSize: 0,
				files: [],
				chunks: [],
				assets: [],
				modules: [],
				dependencies: [],
				warnings: [],
				errors: []
			},
			warnings: [],
			errors: []
		};
	}
	async watch(_config) {
		const mockWatcher = {
			patterns: ["src/**/*"],
			watching: true,
			close: async () => {},
			on: () => {},
			off: () => {},
			emit: () => {}
		};
		return mockWatcher;
	}
	async transformConfig(config) {
		return config;
	}
	async transformPlugins(plugins) {
		return plugins;
	}
	supportsFeature(_feature) {
		return true;
	}
	getFeatureSupport() {
		return {};
	}
	getPerformanceMetrics() {
		return {
			buildTime: 0,
			memoryUsage: {
				heapUsed: 0,
				heapTotal: 0,
				external: 0,
				rss: 0,
				peak: 0,
				trend: []
			},
			cacheStats: {
				hits: 0,
				misses: 0,
				hitRate: 0,
				size: 0,
				entries: 0,
				timeSaved: 0
			},
			fileStats: {
				totalFiles: 0,
				filesByType: {},
				averageProcessingTime: 0,
				slowestFiles: [],
				processingRate: 0
			},
			pluginPerformance: [],
			systemResources: {
				cpuUsage: 0,
				availableMemory: 0,
				diskUsage: {
					total: 0,
					used: 0,
					available: 0,
					usagePercent: 0
				}
			}
		};
	}
	async dispose() {}
};
/**
* 适配器工厂类
*/
var BundlerAdapterFactory = class {
	static adapters = /* @__PURE__ */ new Map();
	static instances = /* @__PURE__ */ new Map();
	/**
	* 注册适配器
	*/
	static register(bundler, adapterClass) {
		this.adapters.set(bundler, adapterClass);
	}
	/**
	* 创建适配器实例
	*/
	static create(bundler, options = {}) {
		const instanceKey = `${bundler}-${JSON.stringify(options)}`;
		const existingInstance = this.instances.get(instanceKey);
		if (existingInstance) return existingInstance;
		const AdapterClass = this.adapters.get(bundler);
		if (!AdapterClass) {
			const adapter = new BaseAdapter(bundler);
			this.instances.set(instanceKey, adapter);
			return adapter;
		}
		try {
			const adapter = new AdapterClass(options);
			if (!adapter.available) throw new BuilderError(ErrorCode.ADAPTER_NOT_AVAILABLE, `适配器 ${bundler} 不可用`);
			this.instances.set(instanceKey, adapter);
			return adapter;
		} catch (error) {
			throw new BuilderError(ErrorCode.ADAPTER_INIT_ERROR, `创建适配器 ${bundler} 失败`, { cause: error });
		}
	}
	/**
	* 获取可用的适配器列表
	*/
	static getAvailableAdapters() {
		const available = [];
		for (const bundler of ["rollup", "rolldown"]) try {
			const adapter = this.create(bundler);
			if (adapter.available) available.push(bundler);
		} catch {}
		return available;
	}
	/**
	* 检查适配器是否可用
	*/
	static isAvailable(bundler) {
		try {
			const adapter = this.create(bundler);
			return adapter.available;
		} catch {
			return false;
		}
	}
	/**
	* 清理所有实例
	*/
	static async dispose() {
		const disposePromises = Array.from(this.instances.values()).map((adapter) => adapter.dispose());
		await Promise.all(disposePromises);
		this.instances.clear();
	}
	/**
	* 获取适配器信息
	*/
	static getAdapterInfo(bundler) {
		try {
			const adapter = this.create(bundler);
			return {
				name: adapter.name,
				version: adapter.version,
				available: adapter.available
			};
		} catch {
			return {
				name: bundler,
				version: "unknown",
				available: false
			};
		}
	}
};
BundlerAdapterFactory.register("rollup", RollupAdapter);
BundlerAdapterFactory.register("rolldown", RolldownAdapter);

//#endregion
//#region src/core/LibraryBuilder.ts
/**
* 库构建器主控制器类
* 
* 采用依赖注入模式，统一管理各种服务组件
* 继承 EventEmitter，支持事件驱动的构建流程
*/
var LibraryBuilder = class extends EventEmitter {
	/** 当前状态 */
	status = BuilderStatus.IDLE;
	/** 当前配置 */
	config;
	/** 打包核心适配器 */
	bundlerAdapter;
	/** 策略管理器 */
	strategyManager;
	/** 配置管理器 */
	configManager;
	/** 插件管理器 */
	pluginManager;
	/** 日志记录器 */
	logger;
	/** 错误处理器 */
	errorHandler;
	/** 性能监控器 */
	performanceMonitor;
	/** 库类型检测器 */
	libraryDetector;
	/** 打包后验证器 */
	postBuildValidator;
	/** 当前构建统计 */
	currentStats = null;
	/** 当前性能指标 */
	currentMetrics = null;
	constructor(options = {}) {
		super();
		this.initializeServices(options);
		this.setupEventListeners();
		this.setupErrorHandling();
		this.config = {
			...DEFAULT_BUILDER_CONFIG,
			...options.config
		};
	}
	/**
	* 执行库构建
	* 
	* @param config 可选的配置覆盖
	* @returns 构建结果
	*/
	async build(config) {
		const buildId = this.generateBuildId();
		try {
			this.setStatus(BuilderStatus.BUILDING);
			const mergedConfig = config ? this.mergeConfig(this.config, config) : this.config;
			this.emit("build:start", {
				config: mergedConfig,
				timestamp: Date.now(),
				buildId
			});
			this.performanceMonitor.startBuild(buildId);
			let libraryType = mergedConfig.libraryType || await this.detectLibraryType(mergedConfig.input);
			if (typeof libraryType === "string") libraryType = libraryType;
			const strategy = this.strategyManager.getStrategy(libraryType);
			const strategyConfig = await strategy.applyStrategy(mergedConfig);
			const result = await this.bundlerAdapter.build(strategyConfig);
			let validationResult;
			if (mergedConfig.postBuildValidation?.enabled) validationResult = await this.runPostBuildValidation(mergedConfig, result, buildId);
			const metrics = this.performanceMonitor.endBuild(buildId);
			const buildResult = {
				success: true,
				outputs: result.outputs,
				duration: metrics.buildTime,
				stats: result.stats,
				performance: metrics,
				warnings: result.warnings || [],
				errors: [],
				buildId,
				timestamp: Date.now(),
				bundler: this.bundlerAdapter.name,
				mode: mergedConfig.mode || "production",
				libraryType,
				validation: validationResult
			};
			this.currentStats = buildResult.stats;
			this.currentMetrics = buildResult.performance;
			this.emit("build:end", {
				result: buildResult,
				duration: buildResult.duration,
				timestamp: Date.now()
			});
			this.setStatus(BuilderStatus.IDLE);
			return buildResult;
		} catch (error) {
			const buildError = this.handleBuildError(error, buildId);
			this.emit("build:error", {
				error: buildError,
				phase: "build",
				timestamp: Date.now()
			});
			this.setStatus(BuilderStatus.ERROR);
			throw buildError;
		}
	}
	/**
	* 启动监听构建模式
	* 
	* @param config 可选的配置覆盖
	* @returns 构建监听器
	*/
	async buildWatch(config) {
		try {
			this.setStatus(BuilderStatus.WATCHING);
			const mergedConfig = config ? this.mergeConfig(this.config, config) : this.config;
			let libraryType = mergedConfig.libraryType || await this.detectLibraryType(mergedConfig.input);
			if (typeof libraryType === "string") libraryType = libraryType;
			const strategy = this.strategyManager.getStrategy(libraryType);
			const strategyConfig = await strategy.applyStrategy(mergedConfig);
			const watcher = await this.bundlerAdapter.watch(strategyConfig);
			this.emit("watch:start", {
				patterns: watcher.patterns,
				timestamp: Date.now()
			});
			return watcher;
		} catch (error) {
			this.setStatus(BuilderStatus.ERROR);
			throw this.errorHandler.createError(ErrorCode.BUILD_FAILED, "启动监听模式失败", { cause: error });
		}
	}
	/**
	* 合并配置
	*/
	mergeConfig(base, override) {
		return this.configManager.mergeConfigs(base, override);
	}
	/**
	* 验证配置
	*/
	validateConfig(config) {
		return this.configManager.validateConfig(config);
	}
	/**
	* 加载配置文件
	*/
	async loadConfig(configPath) {
		const config = await this.configManager.loadConfig(configPath ? { configFile: configPath } : {});
		this.config = config;
		return config;
	}
	/**
	* 切换打包核心
	*/
	setBundler(bundler) {
		try {
			this.bundlerAdapter = BundlerAdapterFactory.create(bundler, {
				logger: this.logger,
				performanceMonitor: this.performanceMonitor
			});
			this.logger.info(`已切换到 ${bundler} 打包核心`);
		} catch (error) {
			throw this.errorHandler.createError(ErrorCode.ADAPTER_NOT_AVAILABLE, `切换到 ${bundler} 失败`, { cause: error });
		}
	}
	/**
	* 获取当前打包核心
	*/
	getBundler() {
		return this.bundlerAdapter.name;
	}
	/**
	* 设置库类型
	*/
	setLibraryType(type) {
		this.config.libraryType = type;
		this.logger.info(`已设置库类型为: ${type}`);
	}
	/**
	* 检测库类型
	*/
	async detectLibraryType(projectPath) {
		const result = await this.libraryDetector.detect(projectPath);
		return result.type;
	}
	/**
	* 获取当前状态
	*/
	getStatus() {
		return this.status;
	}
	/**
	* 是否正在构建
	*/
	isBuilding() {
		return this.status === "building";
	}
	/**
	* 是否正在监听
	*/
	isWatching() {
		return this.status === "watching";
	}
	/**
	* 初始化
	*/
	async initialize() {
		this.setStatus(BuilderStatus.INITIALIZING);
		try {
			await this.loadConfig();
			this.setBundler(this.config.bundler || "rollup");
			this.setStatus(BuilderStatus.IDLE);
			this.logger.success("LibraryBuilder 初始化完成");
		} catch (error) {
			this.setStatus(BuilderStatus.ERROR);
			throw this.errorHandler.createError(ErrorCode.BUILD_FAILED, "初始化失败", { cause: error });
		}
	}
	/**
	* 销毁资源
	*/
	async dispose() {
		this.setStatus(BuilderStatus.DISPOSED);
		if (this.bundlerAdapter) await this.bundlerAdapter.dispose();
		if (this.pluginManager) await this.pluginManager.dispose();
		if (this.postBuildValidator) await this.postBuildValidator.dispose();
		this.removeAllListeners();
		this.logger.info("LibraryBuilder 已销毁");
	}
	/**
	* 获取构建统计信息
	*/
	getStats() {
		return this.currentStats;
	}
	/**
	* 获取性能指标
	*/
	getPerformanceMetrics() {
		return this.currentMetrics;
	}
	/**
	* 初始化各种服务
	*/
	initializeServices(options) {
		this.logger = options.logger || createLogger({
			level: "info",
			prefix: "@ldesign/builder"
		});
		this.errorHandler = createErrorHandler({
			logger: this.logger,
			showSuggestions: true
		});
		this.performanceMonitor = new PerformanceMonitor({ logger: this.logger });
		this.configManager = new ConfigManager({ logger: this.logger });
		this.strategyManager = new StrategyManager({
			autoDetection: true,
			cache: true
		});
		this.pluginManager = new PluginManager({
			cache: true,
			hotReload: false
		});
		this.libraryDetector = new LibraryDetector({ logger: this.logger });
		this.postBuildValidator = new PostBuildValidator({}, {
			logger: this.logger,
			errorHandler: this.errorHandler
		});
		this.bundlerAdapter = BundlerAdapterFactory.create("rollup", {
			logger: this.logger,
			performanceMonitor: this.performanceMonitor
		});
	}
	/**
	* 设置事件监听器
	*/
	setupEventListeners() {
		this.configManager.on("config:change", (config) => {
			this.config = config;
			this.emit("config:change", {
				config,
				oldConfig: this.config,
				timestamp: Date.now()
			});
		});
	}
	/**
	* 设置错误处理
	*/
	setupErrorHandling() {
		this.on("error", (error) => {
			this.errorHandler.handle(error, "LibraryBuilder");
		});
	}
	/**
	* 设置状态
	*/
	setStatus(status) {
		const oldStatus = this.status;
		this.status = status;
		this.emit("status:change", {
			status,
			oldStatus,
			timestamp: Date.now()
		});
	}
	/**
	* 生成构建 ID
	*/
	generateBuildId() {
		return `build-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
	}
	/**
	* 处理构建错误
	*/
	handleBuildError(error, buildId) {
		this.performanceMonitor.recordError(buildId, error);
		if (error instanceof Error) return this.errorHandler.createError(ErrorCode.BUILD_FAILED, `构建失败: ${error.message}`, { cause: error });
		return this.errorHandler.createError(ErrorCode.BUILD_FAILED, "构建失败: 未知错误");
	}
	/**
	* 运行打包后验证
	*/
	async runPostBuildValidation(config, buildResult, buildId) {
		this.logger.info("开始打包后验证...");
		try {
			const validationContext = {
				buildContext: {
					buildId,
					startTime: Date.now(),
					config,
					cwd: process.cwd(),
					cacheDir: ".cache",
					tempDir: ".temp",
					watch: false,
					env: process.env,
					logger: this.logger,
					performanceMonitor: this.performanceMonitor
				},
				buildResult: {
					success: true,
					outputs: buildResult.outputs,
					duration: 0,
					stats: buildResult.stats,
					performance: this.currentMetrics || {},
					warnings: buildResult.warnings || [],
					errors: [],
					buildId,
					timestamp: Date.now(),
					bundler: this.bundlerAdapter.name,
					mode: config.mode || "production",
					libraryType: config.libraryType
				},
				config: config.postBuildValidation || {},
				tempDir: "",
				startTime: Date.now(),
				validationId: `validation-${buildId}`,
				projectRoot: process.cwd(),
				outputDir: config.output?.dir || "dist"
			};
			if (config.postBuildValidation) this.postBuildValidator.setConfig(config.postBuildValidation);
			const validationResult = await this.postBuildValidator.validate(validationContext);
			if (!validationResult.success && config.postBuildValidation?.failOnError) throw this.errorHandler.createError(ErrorCode.BUILD_FAILED, "打包后验证失败", { cause: /* @__PURE__ */ new Error(`验证失败: ${validationResult.errors.length} 个错误`) });
			this.logger.success("打包后验证完成");
			return validationResult;
		} catch (error) {
			this.logger.error("打包后验证失败:", error);
			throw error;
		}
	}
};

//#endregion
//#region src/strategies/vue2/Vue2Strategy.ts
var Vue2Strategy = class {
	name = "vue2";
	supportedTypes = [LibraryType.VUE2];
	priority = 10;
	async applyStrategy(config) {
		return config;
	}
	isApplicable(config) {
		return config.libraryType === LibraryType.VUE2;
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
};

//#endregion
//#region src/types/adapter.ts
/**
* 打包器功能枚举
*/
let BundlerFeature = /* @__PURE__ */ function(BundlerFeature$1) {
	BundlerFeature$1["TREE_SHAKING"] = "treeshaking";
	BundlerFeature$1["CODE_SPLITTING"] = "code-splitting";
	BundlerFeature$1["DYNAMIC_IMPORT"] = "dynamic-import";
	BundlerFeature$1["WORKER_SUPPORT"] = "worker-support";
	BundlerFeature$1["CSS_BUNDLING"] = "css-bundling";
	BundlerFeature$1["ASSET_PROCESSING"] = "asset-processing";
	BundlerFeature$1["SOURCEMAP"] = "sourcemap";
	BundlerFeature$1["MINIFICATION"] = "minification";
	BundlerFeature$1["HOT_RELOAD"] = "hot-reload";
	BundlerFeature$1["MODULE_FEDERATION"] = "module-federation";
	BundlerFeature$1["INCREMENTAL_BUILD"] = "incremental-build";
	BundlerFeature$1["PARALLEL_BUILD"] = "parallel-build";
	BundlerFeature$1["CACHE_SUPPORT"] = "cache-support";
	BundlerFeature$1["PLUGIN_SYSTEM"] = "plugin-system";
	BundlerFeature$1["CONFIG_FILE"] = "config-file";
	return BundlerFeature$1;
}({});

//#endregion
//#region src/types/plugin.ts
/**
* 插件相关类型定义
*/
/**
* 插件类型枚举
*/
let PluginType = /* @__PURE__ */ function(PluginType$1) {
	/** 核心插件 */
	PluginType$1["CORE"] = "core";
	/** 转换插件 */
	PluginType$1["TRANSFORM"] = "transform";
	/** 优化插件 */
	PluginType$1["OPTIMIZATION"] = "optimization";
	/** 工具插件 */
	PluginType$1["UTILITY"] = "utility";
	/** 开发插件 */
	PluginType$1["DEVELOPMENT"] = "development";
	/** 自定义插件 */
	PluginType$1["CUSTOM"] = "custom";
	return PluginType$1;
}({});
/**
* 插件阶段枚举
*/
let PluginPhase = /* @__PURE__ */ function(PluginPhase$1) {
	/** 构建开始前 */
	PluginPhase$1["PRE_BUILD"] = "pre-build";
	/** 模块解析 */
	PluginPhase$1["RESOLVE"] = "resolve";
	/** 模块加载 */
	PluginPhase$1["LOAD"] = "load";
	/** 代码转换 */
	PluginPhase$1["TRANSFORM"] = "transform";
	/** 代码生成 */
	PluginPhase$1["GENERATE"] = "generate";
	/** 构建完成后 */
	PluginPhase$1["POST_BUILD"] = "post-build";
	return PluginPhase$1;
}({});

//#endregion
//#region src/types/bundler.ts
/**
* 打包器状态
*/
let BundlerStatus = /* @__PURE__ */ function(BundlerStatus$1) {
	/** 未初始化 */
	BundlerStatus$1["UNINITIALIZED"] = "uninitialized";
	/** 初始化中 */
	BundlerStatus$1["INITIALIZING"] = "initializing";
	/** 就绪 */
	BundlerStatus$1["READY"] = "ready";
	/** 构建中 */
	BundlerStatus$1["BUILDING"] = "building";
	/** 监听中 */
	BundlerStatus$1["WATCHING"] = "watching";
	/** 错误状态 */
	BundlerStatus$1["ERROR"] = "error";
	/** 已销毁 */
	BundlerStatus$1["DISPOSED"] = "disposed";
	return BundlerStatus$1;
}({});

//#endregion
//#region src/constants/formats.ts
/**
* 支持的输出格式
*/
const OUTPUT_FORMATS = [
	"esm",
	"cjs",
	"umd",
	"iife"
];
/**
* 格式别名映射
*/
const FORMAT_ALIASES = {
	"es": "esm",
	"es6": "esm",
	"module": "esm",
	"commonjs": "cjs",
	"common": "cjs",
	"universal": "umd",
	"browser": "iife",
	"global": "iife"
};
/**
* 格式描述
*/
const FORMAT_DESCRIPTIONS = {
	esm: "ES Module - 现代 JavaScript 模块格式，支持 Tree Shaking",
	cjs: "CommonJS - Node.js 默认模块格式",
	umd: "Universal Module Definition - 通用模块格式，支持多种环境",
	iife: "Immediately Invoked Function Expression - 立即执行函数，适用于浏览器",
	css: "Cascading Style Sheets - 样式表格式"
};
/**
* 格式文件扩展名
*/
const FORMAT_EXTENSIONS = {
	esm: ".js",
	cjs: ".cjs",
	umd: ".umd.js",
	iife: ".iife.js",
	css: ".css"
};
/**
* 格式默认文件名模式
*/
const FORMAT_FILE_PATTERNS = {
	esm: "[name].js",
	cjs: "[name].cjs",
	umd: "[name].umd.js",
	iife: "[name].iife.js",
	css: "[name].css"
};
/**
* 格式兼容性
*/
const FORMAT_COMPATIBILITY = {
	esm: {
		browser: true,
		node: true,
		requiresGlobals: false,
		supportsTreeShaking: true,
		supportsCodeSplitting: true
	},
	cjs: {
		browser: false,
		node: true,
		requiresGlobals: false,
		supportsTreeShaking: false,
		supportsCodeSplitting: false
	},
	umd: {
		browser: true,
		node: true,
		requiresGlobals: true,
		supportsTreeShaking: false,
		supportsCodeSplitting: false
	},
	iife: {
		browser: true,
		node: false,
		requiresGlobals: true,
		supportsTreeShaking: false,
		supportsCodeSplitting: false
	},
	css: {
		browser: true,
		node: false,
		requiresGlobals: false,
		supportsTreeShaking: false,
		supportsCodeSplitting: false
	}
};
/**
* 格式推荐用途
*/
const FORMAT_USE_CASES = {
	esm: [
		"现代 JavaScript 库",
		"支持 Tree Shaking 的库",
		"Node.js 模块",
		"浏览器原生模块"
	],
	cjs: [
		"Node.js 库",
		"传统 npm 包",
		"服务端应用",
		"构建工具插件"
	],
	umd: [
		"通用库",
		"需要多环境支持的库",
		"CDN 分发的库",
		"向后兼容的库"
	],
	iife: [
		"浏览器脚本",
		"内联脚本",
		"不支持模块的环境",
		"简单的工具脚本"
	],
	css: [
		"样式库",
		"主题包",
		"组件样式",
		"CSS 框架"
	]
};
/**
* 格式优先级（用于自动选择）
*/
const FORMAT_PRIORITY = {
	esm: 4,
	cjs: 3,
	umd: 2,
	iife: 1,
	css: 5
};
/**
* 格式组合建议
*/
const FORMAT_COMBINATIONS = {
	modern: ["esm", "cjs"],
	universal: [
		"esm",
		"cjs",
		"umd"
	],
	browser: [
		"esm",
		"umd",
		"iife"
	],
	node: ["esm", "cjs"],
	minimal: ["esm"],
	complete: [
		"esm",
		"cjs",
		"umd",
		"iife"
	]
};
/**
* 根据库类型推荐的格式
*/
const LIBRARY_TYPE_FORMATS = {
	typescript: ["esm", "cjs"],
	style: ["esm"],
	vue2: [
		"esm",
		"cjs",
		"umd"
	],
	vue3: [
		"esm",
		"cjs",
		"umd"
	],
	mixed: ["esm", "cjs"]
};
/**
* 格式特定的配置选项
*/
const FORMAT_SPECIFIC_OPTIONS = {
	esm: {
		exports: "named",
		interop: "auto",
		strict: true
	},
	cjs: {
		exports: "auto",
		interop: "auto",
		strict: false
	},
	umd: {
		exports: "auto",
		interop: "auto",
		strict: false,
		requiresName: true
	},
	iife: {
		exports: "none",
		interop: false,
		strict: false,
		requiresName: true
	}
};
/**
* 格式验证规则
*/
const FORMAT_VALIDATION_RULES = {
	esm: {
		allowedExports: ["named", "default"],
		requiresModernNode: true,
		supportsTopLevelAwait: true
	},
	cjs: {
		allowedExports: [
			"auto",
			"default",
			"named"
		],
		requiresModernNode: false,
		supportsTopLevelAwait: false
	},
	umd: {
		allowedExports: ["auto", "default"],
		requiresGlobalName: true,
		requiresGlobalsMapping: true
	},
	iife: {
		allowedExports: ["none"],
		requiresGlobalName: true,
		requiresGlobalsMapping: true
	}
};
/**
* 格式性能特征
*/
const FORMAT_PERFORMANCE = {
	esm: {
		bundleSize: "small",
		loadTime: "fast",
		treeShaking: "excellent",
		caching: "excellent"
	},
	cjs: {
		bundleSize: "medium",
		loadTime: "medium",
		treeShaking: "none",
		caching: "good"
	},
	umd: {
		bundleSize: "large",
		loadTime: "slow",
		treeShaking: "none",
		caching: "fair"
	},
	iife: {
		bundleSize: "large",
		loadTime: "slow",
		treeShaking: "none",
		caching: "poor"
	}
};

//#endregion
//#region src/constants/bundlers.ts
/**
* 支持的打包器列表
*/
const SUPPORTED_BUNDLERS = ["rollup", "rolldown"];
/**
* 默认打包器
*/
const DEFAULT_BUNDLER = "rollup";
/**
* 打包器信息
*/
const BUNDLER_INFO = {
	rollup: {
		name: "Rollup",
		description: "成熟稳定的 JavaScript 模块打包器，专注于 ES 模块",
		homepage: "https://rollupjs.org",
		repository: "https://github.com/rollup/rollup",
		minNodeVersion: "14.18.0",
		stableVersion: "^4.0.0",
		features: [
			BundlerFeature.TREE_SHAKING,
			BundlerFeature.CODE_SPLITTING,
			BundlerFeature.DYNAMIC_IMPORT,
			BundlerFeature.SOURCEMAP,
			BundlerFeature.PLUGIN_SYSTEM,
			BundlerFeature.CONFIG_FILE,
			BundlerFeature.CACHE_SUPPORT
		]
	},
	rolldown: {
		name: "Rolldown",
		description: "基于 Rust 的高性能 JavaScript 打包器，兼容 Rollup API",
		homepage: "https://rolldown.rs",
		repository: "https://github.com/rolldown/rolldown",
		minNodeVersion: "16.0.0",
		stableVersion: "^0.1.0",
		features: [
			BundlerFeature.TREE_SHAKING,
			BundlerFeature.CODE_SPLITTING,
			BundlerFeature.DYNAMIC_IMPORT,
			BundlerFeature.SOURCEMAP,
			BundlerFeature.MINIFICATION,
			BundlerFeature.PLUGIN_SYSTEM,
			BundlerFeature.CONFIG_FILE,
			BundlerFeature.CACHE_SUPPORT,
			BundlerFeature.PARALLEL_BUILD,
			BundlerFeature.INCREMENTAL_BUILD
		]
	}
};
/**
* 打包器性能特征
*/
const BUNDLER_PERFORMANCE = {
	rollup: {
		buildSpeed: "medium",
		memoryUsage: "medium",
		startupTime: "fast",
		incrementalBuild: "fair",
		largeProjectSupport: "good",
		parallelProcessing: "poor"
	},
	rolldown: {
		buildSpeed: "very-fast",
		memoryUsage: "low",
		startupTime: "fast",
		incrementalBuild: "excellent",
		largeProjectSupport: "excellent",
		parallelProcessing: "excellent"
	}
};
/**
* 打包器兼容性
*/
const BUNDLER_COMPATIBILITY = {
	rollup: {
		nodeVersion: ">=14.18.0",
		platforms: [
			"win32",
			"darwin",
			"linux"
		],
		architectures: ["x64", "arm64"],
		pluginCompatibility: {
			rollup: "full",
			webpack: "none",
			vite: "partial"
		},
		configCompatibility: {
			rollup: true,
			webpack: false,
			vite: true
		}
	},
	rolldown: {
		nodeVersion: ">=16.0.0",
		platforms: [
			"win32",
			"darwin",
			"linux"
		],
		architectures: ["x64", "arm64"],
		pluginCompatibility: {
			rollup: "partial",
			webpack: "none",
			vite: "partial"
		},
		configCompatibility: {
			rollup: true,
			webpack: false,
			vite: false
		}
	}
};
/**
* 打包器推荐使用场景
*/
const BUNDLER_USE_CASES = {
	rollup: [
		"成熟的库项目",
		"需要稳定性的生产环境",
		"复杂的插件需求",
		"对构建速度要求不高的项目",
		"需要丰富插件生态的项目"
	],
	rolldown: [
		"大型项目",
		"对构建速度有高要求的项目",
		"需要增量构建的项目",
		"内存敏感的环境",
		"现代化的新项目"
	]
};
/**
* 打包器优缺点
*/
const BUNDLER_PROS_CONS = {
	rollup: {
		pros: [
			"成熟稳定，生产环境验证",
			"丰富的插件生态系统",
			"优秀的 Tree Shaking 支持",
			"良好的文档和社区支持",
			"配置简单直观"
		],
		cons: [
			"构建速度相对较慢",
			"大型项目性能有限",
			"内存使用较高",
			"缺乏内置的并行处理"
		]
	},
	rolldown: {
		pros: [
			"极快的构建速度",
			"低内存使用",
			"优秀的增量构建",
			"内置并行处理",
			"兼容 Rollup API"
		],
		cons: [
			"相对较新，生态系统有限",
			"插件兼容性不完整",
			"文档和社区支持有限",
			"可能存在稳定性问题"
		]
	}
};
/**
* 打包器选择建议
*/
const BUNDLER_SELECTION_CRITERIA = {
	projectSize: {
		small: "rollup",
		medium: "rollup",
		large: "rolldown",
		enterprise: "rolldown"
	},
	buildSpeed: {
		low: "rollup",
		medium: "rollup",
		high: "rolldown",
		critical: "rolldown"
	},
	stability: {
		low: "rolldown",
		medium: "rollup",
		high: "rollup",
		critical: "rollup"
	},
	pluginNeeds: {
		minimal: "rolldown",
		moderate: "rollup",
		extensive: "rollup",
		custom: "rollup"
	}
};
/**
* 打包器迁移难度
*/
const MIGRATION_DIFFICULTY = {
	"rollup-to-rolldown": "easy",
	"rolldown-to-rollup": "easy"
};
/**
* 打包器配置映射
*/
const CONFIG_MAPPING = {
	"rollup-to-rolldown": {
		input: "input",
		output: "output",
		external: "external",
		plugins: "plugins",
		treeshake: "treeshake",
		platform: "browser"
	},
	"rolldown-to-rollup": {
		input: "input",
		output: "output",
		external: "external",
		plugins: "plugins",
		treeshake: "treeshake"
	}
};
/**
* 打包器检测命令
*/
const BUNDLER_DETECTION_COMMANDS = {
	rollup: {
		check: "rollup --version",
		install: "npm install rollup --save-dev"
	},
	rolldown: {
		check: "rolldown --version",
		install: "npm install rolldown --save-dev"
	}
};
/**
* 打包器默认配置
*/
const BUNDLER_DEFAULT_CONFIG = {
	rollup: {
		treeshake: true,
		output: {
			format: "esm",
			sourcemap: true
		}
	},
	rolldown: {
		treeshake: true,
		platform: "browser",
		output: {
			format: "esm",
			sourcemap: true
		}
	}
};
/**
* 打包器错误处理
*/
const BUNDLER_ERROR_PATTERNS = {
	rollup: {
		notFound: /Cannot find module 'rollup'/,
		versionMismatch: /Rollup version .* is not supported/,
		configError: /Could not resolve config file/,
		buildError: /Build failed with \d+ error/
	},
	rolldown: {
		notFound: /Cannot find module 'rolldown'/,
		versionMismatch: /Rolldown version .* is not supported/,
		configError: /Could not resolve config file/,
		buildError: /Build failed with \d+ error/
	}
};
/**
* 打包器性能基准
*/
const PERFORMANCE_BENCHMARKS = {
	small: {
		rollup: {
			buildTime: "2-5s",
			memoryUsage: "100-200MB"
		},
		rolldown: {
			buildTime: "0.5-1s",
			memoryUsage: "50-100MB"
		}
	},
	medium: {
		rollup: {
			buildTime: "10-30s",
			memoryUsage: "300-500MB"
		},
		rolldown: {
			buildTime: "2-5s",
			memoryUsage: "100-200MB"
		}
	},
	large: {
		rollup: {
			buildTime: "60-180s",
			memoryUsage: "500MB-1GB"
		},
		rolldown: {
			buildTime: "5-15s",
			memoryUsage: "200-400MB"
		}
	}
};

//#endregion
//#region src/constants/extensions.ts
/**
* 文件扩展名相关常量
*/
/**
* 支持的文件扩展名
*/
const SUPPORTED_EXTENSIONS = {
	javascript: [
		".js",
		".mjs",
		".cjs"
	],
	typescript: [
		".ts",
		".tsx",
		".d.ts"
	],
	jsx: [".jsx", ".tsx"],
	vue: [".vue"],
	styles: [
		".css",
		".less",
		".scss",
		".sass",
		".styl",
		".stylus"
	],
	config: [
		".json",
		".js",
		".ts",
		".mjs"
	],
	assets: [
		".png",
		".jpg",
		".jpeg",
		".gif",
		".svg",
		".webp",
		".ico"
	],
	fonts: [
		".woff",
		".woff2",
		".eot",
		".ttf",
		".otf"
	],
	docs: [
		".md",
		".mdx",
		".txt"
	],
	data: [
		".json",
		".yaml",
		".yml",
		".toml",
		".xml"
	]
};
/**
* 文件类型映射
*/
const EXTENSION_TO_TYPE = {
	".js": "javascript",
	".mjs": "javascript",
	".cjs": "javascript",
	".ts": "typescript",
	".tsx": "typescript",
	".d.ts": "typescript-declaration",
	".jsx": "jsx",
	".vue": "vue",
	".css": "css",
	".less": "less",
	".scss": "scss",
	".sass": "sass",
	".styl": "stylus",
	".stylus": "stylus",
	".json": "json",
	".png": "image",
	".jpg": "image",
	".jpeg": "image",
	".gif": "image",
	".svg": "svg",
	".webp": "image",
	".ico": "icon",
	".woff": "font",
	".woff2": "font",
	".eot": "font",
	".ttf": "font",
	".otf": "font",
	".md": "markdown",
	".mdx": "mdx",
	".txt": "text",
	".yaml": "yaml",
	".yml": "yaml",
	".toml": "toml",
	".xml": "xml"
};
/**
* 加载器映射
*/
const EXTENSION_TO_LOADER = {
	".js": "js",
	".mjs": "js",
	".cjs": "js",
	".ts": "ts",
	".tsx": "tsx",
	".jsx": "jsx",
	".vue": "vue",
	".css": "css",
	".less": "less",
	".scss": "scss",
	".sass": "sass",
	".styl": "stylus",
	".stylus": "stylus",
	".json": "json",
	".png": "file",
	".jpg": "file",
	".jpeg": "file",
	".gif": "file",
	".svg": "svg",
	".webp": "file",
	".ico": "file",
	".woff": "file",
	".woff2": "file",
	".eot": "file",
	".ttf": "file",
	".otf": "file",
	".md": "text",
	".txt": "text"
};
/**
* 入口文件优先级
*/
const ENTRY_FILE_PRIORITY = [
	"index.ts",
	"index.tsx",
	"index.js",
	"index.jsx",
	"index.vue",
	"main.ts",
	"main.tsx",
	"main.js",
	"main.jsx",
	"src/index.ts",
	"src/index.tsx",
	"src/index.js",
	"src/index.jsx",
	"src/main.ts",
	"src/main.tsx",
	"src/main.js",
	"src/main.jsx",
	"lib/index.ts",
	"lib/index.js"
];
/**
* 配置文件优先级
*/
const CONFIG_FILE_PRIORITY = [
	"builder.config.ts",
	"builder.config.js",
	"builder.config.mjs",
	"builder.config.json",
	".builderrc.ts",
	".builderrc.js",
	".builderrc.json",
	"package.json"
];
/**
* TypeScript 配置文件
*/
const TYPESCRIPT_CONFIG_FILES = [
	"tsconfig.json",
	"tsconfig.build.json",
	"tsconfig.lib.json",
	"tsconfig.prod.json"
];
/**
* 样式配置文件
*/
const STYLE_CONFIG_FILES = [
	"postcss.config.js",
	"postcss.config.ts",
	"postcss.config.json",
	".postcssrc",
	".postcssrc.js",
	".postcssrc.json",
	"tailwind.config.js",
	"tailwind.config.ts",
	".stylelintrc",
	".stylelintrc.js",
	".stylelintrc.json"
];
/**
* Vue 配置文件
*/
const VUE_CONFIG_FILES = [
	"vue.config.js",
	"vue.config.ts",
	"vite.config.js",
	"vite.config.ts"
];
/**
* 忽略的文件模式
*/
const IGNORE_PATTERNS = [
	"node_modules/**",
	"dist/**",
	"build/**",
	"lib/**",
	"es/**",
	"cjs/**",
	"umd/**",
	".cache/**",
	".temp/**",
	".tmp/**",
	"**/*.test.*",
	"**/*.spec.*",
	"**/__tests__/**",
	"**/__mocks__/**",
	"test/**",
	"tests/**",
	"*.config.*",
	".*rc.*",
	"*.md",
	"docs/**",
	".git/**",
	".svn/**",
	".hg/**",
	"coverage/**",
	"*.log"
];
/**
* 包含的文件模式
*/
const INCLUDE_PATTERNS = {
	typescript: [
		"src/**/*.ts",
		"src/**/*.tsx",
		"lib/**/*.ts",
		"lib/**/*.tsx"
	],
	javascript: [
		"src/**/*.js",
		"src/**/*.jsx",
		"src/**/*.mjs",
		"lib/**/*.js",
		"lib/**/*.jsx"
	],
	vue: [
		"src/**/*.vue",
		"components/**/*.vue",
		"lib/**/*.vue"
	],
	styles: [
		"src/**/*.css",
		"src/**/*.less",
		"src/**/*.scss",
		"src/**/*.sass",
		"src/**/*.styl",
		"styles/**/*"
	],
	assets: [
		"src/assets/**/*",
		"assets/**/*",
		"public/**/*"
	]
};
/**
* 文件大小限制
*/
const FILE_SIZE_LIMITS = {
	source: 1024 * 1024,
	config: 100 * 1024,
	style: 500 * 1024,
	asset: 10 * 1024 * 1024,
	font: 2 * 1024 * 1024,
	image: 5 * 1024 * 1024
};
/**
* 文件编码检测
*/
const ENCODING_DETECTION = {
	text: [
		"utf8",
		"utf-8",
		"ascii"
	],
	binary: ["binary", "base64"],
	default: "utf8"
};
/**
* 文件 MIME 类型
*/
const MIME_TYPES = {
	".js": "application/javascript",
	".mjs": "application/javascript",
	".ts": "application/typescript",
	".tsx": "application/typescript",
	".jsx": "application/javascript",
	".vue": "text/x-vue",
	".css": "text/css",
	".less": "text/less",
	".scss": "text/scss",
	".sass": "text/sass",
	".json": "application/json",
	".md": "text/markdown",
	".html": "text/html",
	".xml": "application/xml",
	".svg": "image/svg+xml",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".gif": "image/gif",
	".webp": "image/webp",
	".woff": "font/woff",
	".woff2": "font/woff2",
	".ttf": "font/ttf",
	".otf": "font/otf"
};

//#endregion
//#region src/constants/messages.ts
/**
* 用户消息常量
*/
/**
* 成功消息
*/
const SUCCESS_MESSAGES = {
	BUILD_COMPLETE: "构建完成",
	BUILD_SUCCESS: "构建成功",
	CONFIG_LOADED: "配置加载成功",
	CONFIG_VALIDATED: "配置验证通过",
	PLUGIN_LOADED: "插件加载成功",
	ADAPTER_INITIALIZED: "适配器初始化成功",
	CACHE_HIT: "缓存命中",
	WATCH_STARTED: "监听模式已启动",
	LIBRARY_DETECTED: "库类型检测成功"
};
/**
* 信息消息
*/
const INFO_MESSAGES = {
	BUILD_STARTING: "开始构建...",
	CONFIG_LOADING: "正在加载配置...",
	PLUGIN_LOADING: "正在加载插件...",
	ADAPTER_SWITCHING: "正在切换适配器...",
	CACHE_CLEARING: "正在清理缓存...",
	WATCH_CHANGE_DETECTED: "检测到文件变化",
	LIBRARY_DETECTING: "正在检测库类型...",
	PERFORMANCE_ANALYZING: "正在分析性能..."
};
/**
* 警告消息
*/
const WARNING_MESSAGES = {
	CONFIG_DEPRECATED: "配置项已废弃",
	PLUGIN_DEPRECATED: "插件已废弃",
	LARGE_BUNDLE_SIZE: "打包文件过大",
	SLOW_BUILD_TIME: "构建时间过长",
	MEMORY_USAGE_HIGH: "内存使用过高",
	CACHE_MISS: "缓存未命中",
	DEPENDENCY_OUTDATED: "依赖版本过旧",
	EXPERIMENTAL_FEATURE: "使用了实验性功能"
};
/**
* 用户消息
*/
const USER_MESSAGES = {
	BUILD_FAILED: "构建失败",
	CONFIG_INVALID: "配置无效",
	PLUGIN_ERROR: "插件错误",
	ADAPTER_ERROR: "适配器错误",
	FILE_NOT_FOUND: "文件未找到",
	DEPENDENCY_MISSING: "依赖缺失",
	NETWORK_ERROR: "网络错误",
	PERMISSION_DENIED: "权限不足",
	OUT_OF_MEMORY: "内存不足",
	TIMEOUT: "操作超时"
};
/**
* 进度消息
*/
const PROGRESS_MESSAGES = {
	INITIALIZING: "初始化中...",
	LOADING_CONFIG: "加载配置中...",
	DETECTING_LIBRARY: "检测库类型中...",
	LOADING_PLUGINS: "加载插件中...",
	RESOLVING_MODULES: "解析模块中...",
	TRANSFORMING_CODE: "转换代码中...",
	GENERATING_BUNDLE: "生成打包文件中...",
	WRITING_FILES: "写入文件中...",
	OPTIMIZING: "优化中...",
	FINALIZING: "完成中..."
};
/**
* 帮助消息
*/
const HELP_MESSAGES = {
	USAGE: "使用方法",
	OPTIONS: "选项",
	EXAMPLES: "示例",
	COMMANDS: "命令",
	CONFIG: "配置",
	PLUGINS: "插件",
	TROUBLESHOOTING: "故障排除",
	FAQ: "常见问题"
};
/**
* 提示消息
*/
const TIP_MESSAGES = {
	PERFORMANCE_OPTIMIZATION: "性能优化提示",
	BUNDLE_SIZE_OPTIMIZATION: "包大小优化提示",
	CACHE_USAGE: "缓存使用提示",
	PLUGIN_RECOMMENDATION: "插件推荐",
	CONFIG_SUGGESTION: "配置建议",
	BEST_PRACTICES: "最佳实践",
	TROUBLESHOOTING_GUIDE: "故障排除指南"
};
/**
* 状态消息
*/
const STATUS_MESSAGES = {
	IDLE: "空闲",
	INITIALIZING: "初始化中",
	BUILDING: "构建中",
	WATCHING: "监听中",
	ERROR: "错误",
	COMPLETE: "完成",
	CANCELLED: "已取消",
	PAUSED: "已暂停"
};
/**
* 确认消息
*/
const CONFIRMATION_MESSAGES = {
	OVERWRITE_FILE: "文件已存在，是否覆盖？",
	DELETE_CACHE: "是否清理缓存？",
	SWITCH_BUNDLER: "是否切换打包器？",
	INSTALL_DEPENDENCY: "是否安装依赖？",
	UPDATE_CONFIG: "是否更新配置？",
	CONTINUE_BUILD: "是否继续构建？",
	ABORT_BUILD: "是否中止构建？"
};
/**
* 格式化消息模板
*/
const MESSAGE_TEMPLATES = {
	BUILD_TIME: "构建时间: {time}ms",
	BUNDLE_SIZE: "打包大小: {size}",
	MEMORY_USAGE: "内存使用: {memory}MB",
	CACHE_HIT_RATE: "缓存命中率: {rate}%",
	FILE_COUNT: "文件数量: {count}",
	PLUGIN_COUNT: "插件数量: {count}",
	ERROR_COUNT: "错误数量: {count}",
	WARNING_COUNT: "警告数量: {count}",
	PROGRESS: "进度: {current}/{total} ({percent}%)",
	VERSION: "版本: {version}"
};
/**
* 日志级别消息
*/
const LOG_LEVEL_MESSAGES = {
	silent: "静默模式",
	error: "仅显示错误",
	warn: "显示警告和错误",
	info: "显示信息、警告和错误",
	debug: "显示调试信息",
	verbose: "显示详细信息"
};
/**
* 命令行消息
*/
const CLI_MESSAGES = {
	WELCOME: "欢迎使用 @ldesign/builder",
	VERSION: "版本信息",
	HELP: "帮助信息",
	INVALID_COMMAND: "无效命令",
	MISSING_ARGUMENT: "缺少参数",
	UNKNOWN_OPTION: "未知选项",
	COMMAND_SUCCESS: "命令执行成功",
	COMMAND_FAILED: "命令执行失败"
};
/**
* 配置消息
*/
const CONFIG_MESSAGES = {
	LOADING: "正在加载配置文件...",
	LOADED: "配置文件加载成功",
	NOT_FOUND: "未找到配置文件，使用默认配置",
	INVALID: "配置文件格式错误",
	VALIDATING: "正在验证配置...",
	VALIDATED: "配置验证通过",
	MERGING: "正在合并配置...",
	MERGED: "配置合并完成",
	WATCHING: "正在监听配置文件变化...",
	CHANGED: "配置文件已更改，重新加载中..."
};
/**
* 插件消息
*/
const PLUGIN_MESSAGES = {
	LOADING: "正在加载插件: {name}",
	LOADED: "插件加载成功: {name}",
	FAILED: "插件加载失败: {name}",
	INITIALIZING: "正在初始化插件: {name}",
	INITIALIZED: "插件初始化成功: {name}",
	EXECUTING: "正在执行插件: {name}",
	EXECUTED: "插件执行完成: {name}",
	ERROR: "插件执行错误: {name}",
	DISABLED: "插件已禁用: {name}",
	DEPRECATED: "插件已废弃: {name}"
};
/**
* 适配器消息
*/
const ADAPTER_MESSAGES = {
	DETECTING: "正在检测可用的适配器...",
	DETECTED: "检测到适配器: {name}",
	INITIALIZING: "正在初始化适配器: {name}",
	INITIALIZED: "适配器初始化成功: {name}",
	SWITCHING: "正在切换到适配器: {name}",
	SWITCHED: "适配器切换成功: {name}",
	NOT_AVAILABLE: "适配器不可用: {name}",
	VERSION_MISMATCH: "适配器版本不匹配: {name}",
	CONFIG_ERROR: "适配器配置错误: {name}"
};
/**
* 性能消息
*/
const PERFORMANCE_MESSAGES = {
	ANALYZING: "正在分析性能...",
	ANALYZED: "性能分析完成",
	SLOW_BUILD: "构建速度较慢，建议优化",
	LARGE_BUNDLE: "打包文件较大，建议优化",
	HIGH_MEMORY: "内存使用较高，建议优化",
	CACHE_EFFECTIVE: "缓存效果良好",
	CACHE_INEFFECTIVE: "缓存效果不佳，建议检查配置",
	OPTIMIZATION_SUGGESTION: "性能优化建议: {suggestion}"
};

//#endregion
//#region src/utils/path-utils.ts
/**
* 路径工具类
*/
var PathUtils = class {
	/**
	* 规范化路径（统一使用正斜杠）
	*/
	static normalize(filePath) {
		return path.posix.normalize(filePath.replace(/\\/g, "/"));
	}
	/**
	* 解析绝对路径
	*/
	static resolve(...paths) {
		return path.resolve(...paths);
	}
	/**
	* 获取相对路径
	*/
	static relative(from, to) {
		return this.normalize(path.relative(from, to));
	}
	/**
	* 连接路径
	*/
	static join(...paths) {
		return this.normalize(path.join(...paths));
	}
	/**
	* 获取目录名
	*/
	static dirname(filePath) {
		return this.normalize(path.dirname(filePath));
	}
	/**
	* 获取文件名（包含扩展名）
	*/
	static basename(filePath, ext) {
		return path.basename(filePath, ext);
	}
	/**
	* 获取文件扩展名
	*/
	static extname(filePath) {
		return path.extname(filePath);
	}
	/**
	* 获取文件名（不包含扩展名）
	*/
	static filename(filePath) {
		return this.basename(filePath, this.extname(filePath));
	}
	/**
	* 判断路径是否为绝对路径
	*/
	static isAbsolute(filePath) {
		return path.isAbsolute(filePath);
	}
	/**
	* 转换为绝对路径
	*/
	static toAbsolute(filePath, basePath) {
		if (this.isAbsolute(filePath)) return this.normalize(filePath);
		return this.resolve(basePath || process.cwd(), filePath);
	}
	/**
	* 转换为相对路径
	*/
	static toRelative(filePath, basePath) {
		const base = basePath || process.cwd();
		if (this.isAbsolute(filePath)) return this.relative(base, filePath);
		return this.normalize(filePath);
	}
	/**
	* 替换文件扩展名
	*/
	static replaceExt(filePath, newExt) {
		const dir = this.dirname(filePath);
		const name = this.filename(filePath);
		const ext = newExt.startsWith(".") ? newExt : `.${newExt}`;
		return this.join(dir, `${name}${ext}`);
	}
	/**
	* 添加后缀到文件名
	*/
	static addSuffix(filePath, suffix) {
		const dir = this.dirname(filePath);
		const name = this.filename(filePath);
		const ext = this.extname(filePath);
		return this.join(dir, `${name}${suffix}${ext}`);
	}
	/**
	* 获取路径的各个部分
	*/
	static parse(filePath) {
		const parsed = path.parse(filePath);
		return {
			root: parsed.root,
			dir: this.normalize(parsed.dir),
			base: parsed.base,
			ext: parsed.ext,
			name: parsed.name
		};
	}
	/**
	* 从路径部分构建路径
	*/
	static format(pathObject) {
		return this.normalize(path.format(pathObject));
	}
	/**
	* 检查路径是否在指定目录内
	*/
	static isInside(filePath, dirPath) {
		const relativePath = this.relative(dirPath, filePath);
		return !relativePath.startsWith("../") && !this.isAbsolute(relativePath);
	}
	/**
	* 获取两个路径的公共父目录
	*/
	static getCommonParent(path1, path2) {
		const abs1 = this.toAbsolute(path1);
		const abs2 = this.toAbsolute(path2);
		const parts1 = abs1.split(path.sep);
		const parts2 = abs2.split(path.sep);
		const commonParts = [];
		const minLength = Math.min(parts1.length, parts2.length);
		for (let i = 0; i < minLength; i++) if (parts1[i] === parts2[i]) commonParts.push(parts1[i]);
		else break;
		return commonParts.join(path.sep) || path.sep;
	}
	/**
	* 获取路径深度
	*/
	static getDepth(filePath) {
		const normalized = this.normalize(filePath);
		if (normalized === "/" || normalized === ".") return 0;
		return normalized.split("/").filter((part) => part && part !== ".").length;
	}
	/**
	* 匹配路径模式
	*/
	static matchPattern(filePath, pattern) {
		const regexPattern = pattern.replace(/\./g, "\\.").replace(/\*/g, ".*").replace(/\?/g, ".");
		const regex = /* @__PURE__ */ new RegExp(`^${regexPattern}$`);
		return regex.test(this.normalize(filePath));
	}
	/**
	* 获取文件的 URL 路径
	*/
	static toFileURL(filePath) {
		const absolutePath = this.toAbsolute(filePath);
		return `file://${absolutePath.replace(/\\/g, "/")}`;
	}
	/**
	* 从文件 URL 获取路径
	*/
	static fromFileURL(fileURL) {
		return this.normalize(fileURLToPath(fileURL));
	}
	/**
	* 获取项目根目录
	*/
	static findProjectRoot(startPath) {
		let currentPath = startPath || process.cwd();
		while (currentPath !== path.dirname(currentPath)) {
			const packageJsonPath = this.join(currentPath, "package.json");
			if (__require("fs").existsSync(packageJsonPath)) return currentPath;
			const gitPath = this.join(currentPath, ".git");
			if (__require("fs").existsSync(gitPath)) return currentPath;
			currentPath = path.dirname(currentPath);
		}
		return startPath || process.cwd();
	}
	/**
	* 获取相对于项目根目录的路径
	*/
	static getProjectRelativePath(filePath, projectRoot) {
		const root = projectRoot || this.findProjectRoot();
		return this.relative(root, filePath);
	}
	/**
	* 清理路径（移除多余的分隔符和相对路径符号）
	*/
	static clean(filePath) {
		return this.normalize(filePath).replace(/\/+/g, "/").replace(/\/\.\//g, "/").replace(/\/\.$/, "").replace(/^\.\//g, "");
	}
	/**
	* 确保路径以指定字符结尾
	*/
	static ensureTrailingSlash(dirPath) {
		const normalized = this.normalize(dirPath);
		return normalized.endsWith("/") ? normalized : `${normalized}/`;
	}
	/**
	* 确保路径不以指定字符结尾
	*/
	static removeTrailingSlash(dirPath) {
		const normalized = this.normalize(dirPath);
		return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
	}
	/**
	* 获取路径的所有父目录
	*/
	static getParents(filePath) {
		const parents = [];
		let currentPath = this.dirname(filePath);
		while (currentPath !== this.dirname(currentPath)) {
			parents.push(currentPath);
			currentPath = this.dirname(currentPath);
		}
		return parents;
	}
	/**
	* 检查路径是否为隐藏文件或目录
	*/
	static isHidden(filePath) {
		const basename$1 = this.basename(filePath);
		return basename$1.startsWith(".");
	}
	/**
	* 获取平台特定的路径分隔符
	*/
	static get sep() {
		return path.sep;
	}
	/**
	* 获取平台特定的路径定界符
	*/
	static get delimiter() {
		return path.delimiter;
	}
};
const { normalize, resolve, relative, join, dirname, basename, extname, filename, isAbsolute, toAbsolute, toRelative, replaceExt, addSuffix, parse, format, isInside, getCommonParent, getDepth, matchPattern, toFileURL, fromFileURL, findProjectRoot, getProjectRelativePath, clean, ensureTrailingSlash, removeTrailingSlash, getParents, isHidden } = PathUtils;

//#endregion
//#region src/utils/format-utils.ts
/**
* 格式化工具函数
*/
/**
* 格式化文件大小
*/
function formatFileSize(bytes) {
	if (bytes === 0) return "0 B";
	const units = [
		"B",
		"KB",
		"MB",
		"GB",
		"TB"
	];
	const k = 1024;
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
}
/**
* 格式化持续时间
*/
function formatDuration(ms) {
	if (ms < 1e3) return `${ms}ms`;
	const seconds = ms / 1e3;
	if (seconds < 60) return `${seconds.toFixed(1)}s`;
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
}
/**
* 格式化百分比
*/
function formatPercentage(value, total) {
	if (total === 0) return "0%";
	return `${(value / total * 100).toFixed(1)}%`;
}
/**
* 格式化数字
*/
function formatNumber(num) {
	return num.toLocaleString();
}
/**
* 格式化内存使用
*/
function formatMemory(bytes) {
	return formatFileSize(bytes);
}
/**
* 格式化时间戳
*/
function formatTimestamp(timestamp) {
	return new Date(timestamp).toLocaleString();
}
/**
* 格式化相对时间
*/
function formatRelativeTime(timestamp) {
	const now = Date.now();
	const diff = now - timestamp;
	if (diff < 1e3) return "刚刚";
	if (diff < 6e4) return `${Math.floor(diff / 1e3)}秒前`;
	if (diff < 36e5) return `${Math.floor(diff / 6e4)}分钟前`;
	if (diff < 864e5) return `${Math.floor(diff / 36e5)}小时前`;
	return `${Math.floor(diff / 864e5)}天前`;
}
/**
* 格式化路径（缩短显示）
*/
function formatPath(filePath, maxLength = 50) {
	if (filePath.length <= maxLength) return filePath;
	const parts = filePath.split("/");
	if (parts.length <= 2) return filePath;
	const start = parts[0];
	const end = parts[parts.length - 1];
	return `${start}/.../${end}`;
}
/**
* 格式化版本号
*/
function formatVersion(version) {
	return version.replace(/^v/, "");
}
/**
* 格式化构建状态
*/
function formatBuildStatus(status) {
	const statusMap = {
		idle: "空闲",
		initializing: "初始化中",
		building: "构建中",
		watching: "监听中",
		error: "错误",
		complete: "完成",
		cancelled: "已取消"
	};
	return statusMap[status] || status;
}
/**
* 格式化配置对象
*/
function formatConfig(config, indent = 2) {
	try {
		return JSON.stringify(config, null, indent);
	} catch {
		return String(config);
	}
}
/**
* 格式化列表
*/
function formatList(items, separator = ", ") {
	if (items.length === 0) return "";
	if (items.length === 1) return items[0];
	if (items.length === 2) return items.join(" 和 ");
	const last = items[items.length - 1];
	const rest = items.slice(0, -1);
	return `${rest.join(separator)} 和 ${last}`;
}
/**
* 格式化表格数据
*/
function formatTable(data, columns) {
	if (data.length === 0) return "";
	const keys = columns || Object.keys(data[0]);
	const rows = data.map((row) => keys.map((key) => String(row[key] || "")));
	const widths = keys.map((key, i) => Math.max(key.length, ...rows.map((row) => row[i].length)));
	const header = keys.map((key, i) => key.padEnd(widths[i])).join(" | ");
	const separator = widths.map((width) => "-".repeat(width)).join("-|-");
	const body = rows.map((row) => row.map((cell, i) => cell.padEnd(widths[i])).join(" | ")).join("\n");
	return `${header}\n${separator}\n${body}`;
}
/**
* 格式化进度条
*/
function formatProgressBar(current, total, width = 20, char = "█") {
	const percentage = total > 0 ? current / total : 0;
	const filled = Math.round(percentage * width);
	const empty = width - filled;
	return char.repeat(filled) + "░".repeat(empty);
}
/**
* 格式化键值对
*/
function formatKeyValue(obj, separator = ": ", indent = "  ") {
	return Object.entries(obj).map(([key, value]) => `${indent}${key}${separator}${value}`).join("\n");
}
/**
* 截断文本
*/
function truncateText(text, maxLength, suffix = "...") {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength - suffix.length) + suffix;
}
/**
* 首字母大写
*/
function capitalize(text) {
	return text.charAt(0).toUpperCase() + text.slice(1);
}
/**
* 驼峰转短横线
*/
function camelToKebab(text) {
	return text.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
/**
* 短横线转驼峰
*/
function kebabToCamel(text) {
	return text.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

//#endregion
//#region src/utils/index.ts
init_file_system();

//#endregion
//#region src/utils/factory.ts
/**
* 创建构建器实例的便捷函数
* 
* @param config 初始配置
* @param options 构建器选项
* @returns 构建器实例
*/
function createBuilder(config, options = {}) {
	const logger$1 = options.logger || createLogger({
		level: "info",
		colors: true,
		prefix: "@ldesign/builder"
	});
	const builderOptions = {
		config,
		logger: logger$1,
		autoDetect: true,
		cache: true,
		performance: true,
		...options
	};
	return new LibraryBuilder(builderOptions);
}

//#endregion
export { ADAPTER_MESSAGES, BUNDLER_COMPATIBILITY, BUNDLER_DEFAULT_CONFIG, BUNDLER_DETECTION_COMMANDS, BUNDLER_ERROR_PATTERNS, BUNDLER_INFO, BUNDLER_PERFORMANCE, BUNDLER_PROS_CONS, BUNDLER_SELECTION_CRITERIA, BUNDLER_USE_CASES, BuilderError, BuilderEvent, BuilderStatus, BundlerAdapterFactory, BundlerFeature, BundlerStatus, CLI_MESSAGES, CONFIG_FILE_NAMES, CONFIG_FILE_PRIORITY, CONFIG_MAPPING, CONFIG_MESSAGES, CONFIRMATION_MESSAGES, ConfigManager, DEFAULT_BUILDER_CONFIG, DEFAULT_BUNDLER, DEFAULT_CACHE_CONFIG, DEFAULT_EXTERNAL_DEPS, DEFAULT_FILE_PATTERNS, DEFAULT_GLOBALS, DEFAULT_PERFORMANCE_CONFIG, DEFAULT_WATCH_CONFIG, DETECTION_CACHE_CONFIG, DETECTION_WEIGHTS, ENCODING_DETECTION, ENTRY_FILE_PRIORITY, ERROR_CATEGORIES, ERROR_MESSAGES, ERROR_SEVERITY, ERROR_SUGGESTIONS, EXTENSION_TO_LOADER, EXTENSION_TO_TYPE, ErrorCode, ErrorHandler, FILE_SIZE_LIMITS, FORMAT_ALIASES, FORMAT_COMBINATIONS, FORMAT_COMPATIBILITY, FORMAT_DESCRIPTIONS, FORMAT_EXTENSIONS, FORMAT_FILE_PATTERNS, FORMAT_PERFORMANCE, FORMAT_PRIORITY, FORMAT_SPECIFIC_OPTIONS, FORMAT_USE_CASES, FORMAT_VALIDATION_RULES, FileSystem, HELP_MESSAGES, IGNORE_PATTERNS, INCLUDE_PATTERNS, INFO_MESSAGES, LIBRARY_TYPE_COMPATIBILITY, LIBRARY_TYPE_DESCRIPTIONS, LIBRARY_TYPE_EXCLUDE_PATTERNS, LIBRARY_TYPE_EXTENSIONS, LIBRARY_TYPE_FORMATS, LIBRARY_TYPE_PATTERNS, LIBRARY_TYPE_PLUGINS, LIBRARY_TYPE_PRIORITY, LIBRARY_TYPE_RECOMMENDED_CONFIG, LOG_LEVEL_MESSAGES, LibraryBuilder, LibraryDetector, LibraryType, LogLevelEnum, Logger, MESSAGE_TEMPLATES, MIGRATION_DIFFICULTY, MIME_TYPES, MIN_CONFIDENCE_THRESHOLD, MixedStrategy, OUTPUT_FORMATS, PERFORMANCE_BENCHMARKS, PERFORMANCE_MESSAGES, PLUGIN_MESSAGES, PRESET_CONFIGS, PROGRESS_MESSAGES, PathUtils, PerformanceMonitor, PluginManager, PluginPhase, PluginType, PostBuildValidator, RolldownAdapter, RollupAdapter, STATUS_MESSAGES, STYLE_CONFIG_FILES, SUCCESS_MESSAGES, SUPPORTED_BUNDLERS, SUPPORTED_EXTENSIONS, StrategyManager, StyleStrategy, TIP_MESSAGES, TYPESCRIPT_CONFIG_FILES, TemporaryEnvironment, TestRunner, TypeScriptStrategy, USER_MESSAGES, VUE_CONFIG_FILES, ValidationReporter, Vue2Strategy, Vue3Strategy, WARNING_MESSAGES, addSuffix, basename, camelToKebab, capitalize, clean, copyFile, createBuilder, createErrorHandler, createLogger, createTempDir, createTempFile, LibraryBuilder as default, defineConfig, dirname, emptyDir, ensureDir, ensureTrailingSlash, errorHandler, exists, existsSync, extname, filename, findDirs, findFiles, findProjectRoot, format, formatBuildStatus, formatConfig, formatDuration, formatError, formatFileSize, formatKeyValue, formatList, formatMemory, formatNumber, formatPath, formatPercentage, formatProgressBar, formatRelativeTime, formatTable, formatTimestamp, formatVersion, fromFileURL, getCommonParent, getDepth, getDirSize, getErrorCode, getFileSize, getModifiedTime, getParents, getProjectRelativePath, isAbsolute, isBuilderError, isDirectory, isFile, isHidden, isInside, isNewer, join, kebabToCamel, logger, matchPattern, normalize, parse, readDir, readDirRecursive, readFile, relative, removeDir, removeFile, removeTrailingSlash, replaceExt, resolve, setLogLevel, setSilent, setupGlobalErrorHandling, stat, toAbsolute, toFileURL, toRelative, truncateText, writeFile };
//# sourceMappingURL=index.js.map
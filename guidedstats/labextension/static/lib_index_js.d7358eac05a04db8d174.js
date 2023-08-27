(self["webpackChunkguidedstats"] = self["webpackChunkguidedstats"] || []).push([["lib_index_js"],{

/***/ "./lib/index.js":
/*!**********************!*\
  !*** ./lib/index.js ***!
  \**********************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(/*! @jupyter-widgets/base */ "webpack/sharing/consume/default/@jupyter-widgets/base")], __WEBPACK_AMD_DEFINE_RESULT__ = ((__WEBPACK_EXTERNAL_MODULE__jupyter_widgets_base__) => { return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/Widget.svelte":
/*!***************************!*\
  !*** ./src/Widget.svelte ***!
  \***************************/
/***/ (() => {

eval("throw new Error(\"Module build failed (from ./node_modules/svelte-loader/index.js):\\nError: ParseError: Unexpected token (86:23)\\n84:     </div>\\n85:     <div class=\\\"w-3/5 float-right\\\" id=\\\"graph-container\\\" bind:this={el}>\\n86:         {$workflowInfo.}\\n                           ^\\n87:         <!-- <Dag /> -->\\n88:     </div>\\n    at /Users/adam/Desktop/CMU/SummerProject/GuidedStats/node_modules/svelte-loader/index.js:89:12\");\n\n//# sourceURL=webpack://guidedstats/./src/Widget.svelte?");

/***/ }),

/***/ "./src/plugin.ts":
/*!***********************!*\
  !*** ./src/plugin.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _jupyter_widgets_base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyter-widgets/base */ \"@jupyter-widgets/base\");\n/* harmony import */ var _jupyter_widgets_base__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyter_widgets_base__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _widget__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./widget */ \"./src/widget.ts\");\n/* harmony import */ var _version__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./version */ \"./src/version.ts\");\n// Copyright (c) Yuqi(Adam) Zhang\n// Distributed under the terms of the Modified BSD License.\n\n\n\n// import { INotebookTracker } from '@jupyterlab/notebook';\nconst EXTENSION_ID = 'guidedstats:plugin';\n/**\n * The example plugin.\n */\nconst extension = {\n    id: EXTENSION_ID,\n    requires: [_jupyter_widgets_base__WEBPACK_IMPORTED_MODULE_0__.IJupyterWidgetRegistry],\n    activate: (app, registry) => {\n        console.log(\"activating extension\");\n        registry.registerWidget({\n            name: _version__WEBPACK_IMPORTED_MODULE_2__.MODULE_NAME,\n            version: _version__WEBPACK_IMPORTED_MODULE_2__.MODULE_VERSION,\n            exports: _widget__WEBPACK_IMPORTED_MODULE_1__,\n        });\n        // emitted when the user's notebook changes I think...\n        // notebookTracker.currentChanged.connect((_, widget) => {\n        //   console.log(\">>>>>>>>Notebook changed>>>>>>>>\")\n        //   const notebook = new NotebookAPI(widget);\n        //   notebook.ready.then(async () => {\n        //     logger.setNoteook(notebook);\n        //   });\n        // });\n    },\n    autoStart: true,\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (extension);\n\n\n//# sourceURL=webpack://guidedstats/./src/plugin.ts?");

/***/ }),

/***/ "./src/version.ts":
/*!************************!*\
  !*** ./src/version.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"MODULE_NAME\": () => (/* binding */ MODULE_NAME),\n/* harmony export */   \"MODULE_VERSION\": () => (/* binding */ MODULE_VERSION)\n/* harmony export */ });\n// Copyright (c) Yuqi(Adam) Zhang\n// Distributed under the terms of the Modified BSD License.\n// eslint-disable-next-line @typescript-eslint/ban-ts-comment\n// @ts-ignore\n// eslint-disable-next-line @typescript-eslint/no-var-requires\nconst data = __webpack_require__(/*! ../package.json */ \"./package.json\");\n/**\n * The _model_module_version/_view_module_version this package implements.\n *\n * The html widget manager assumes that this is the same as the npm package\n * version number.\n */\nconst MODULE_VERSION = data.version;\n/*\n * The current package name.\n */\nconst MODULE_NAME = data.name;\n\n\n//# sourceURL=webpack://guidedstats/./src/version.ts?");

/***/ }),

/***/ "./src/widget.ts":
/*!***********************!*\
  !*** ./src/widget.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"VizualizerModel\": () => (/* binding */ VizualizerModel),\n/* harmony export */   \"VizualizerView\": () => (/* binding */ VizualizerView)\n/* harmony export */ });\n/* harmony import */ var _jupyter_widgets_base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyter-widgets/base */ \"@jupyter-widgets/base\");\n/* harmony import */ var _jupyter_widgets_base__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyter_widgets_base__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _version__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./version */ \"./src/version.ts\");\n/* harmony import */ var _Widget_svelte__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Widget.svelte */ \"./src/Widget.svelte\");\n// Copyright (c) Yuqi(Adam) Zhang\n// Distributed under the terms of the Modified BSD License.\n\n\n\nclass VizualizerModel extends _jupyter_widgets_base__WEBPACK_IMPORTED_MODULE_0__.DOMWidgetModel {\n    defaults() {\n        return Object.assign(Object.assign({}, super.defaults()), { _model_name: VizualizerModel.model_name, _model_module: VizualizerModel.model_module, _model_module_version: VizualizerModel.model_module_version, _view_name: VizualizerModel.view_name, _view_module: VizualizerModel.view_module, _view_module_version: VizualizerModel.view_module_version, builtinWorkflows: [], builtinSteps: [], dfProfile: {}, exportedCode: '' });\n    }\n}\nVizualizerModel.serializers = Object.assign({}, _jupyter_widgets_base__WEBPACK_IMPORTED_MODULE_0__.DOMWidgetModel.serializers);\nVizualizerModel.model_name = 'VizualizerModel';\nVizualizerModel.model_module = _version__WEBPACK_IMPORTED_MODULE_1__.MODULE_NAME;\nVizualizerModel.model_module_version = _version__WEBPACK_IMPORTED_MODULE_1__.MODULE_VERSION;\nVizualizerModel.view_name = 'VizualizerView'; // Set to null if no view\nVizualizerModel.view_module = _version__WEBPACK_IMPORTED_MODULE_1__.MODULE_NAME; // Set to null if no view\nVizualizerModel.view_module_version = _version__WEBPACK_IMPORTED_MODULE_1__.MODULE_VERSION;\nclass VizualizerView extends _jupyter_widgets_base__WEBPACK_IMPORTED_MODULE_0__.DOMWidgetView {\n    render() {\n        new _Widget_svelte__WEBPACK_IMPORTED_MODULE_2__[\"default\"]({ target: this.el, props: { model: this.model } });\n    }\n    ;\n}\n\n\n//# sourceURL=webpack://guidedstats/./src/widget.ts?");

/***/ }),

/***/ "@jupyter-widgets/base":
/*!****************************************!*\
  !*** external "@jupyter-widgets/base" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE__jupyter_widgets_base__;

/***/ }),

/***/ "./package.json":
/*!**********************!*\
  !*** ./package.json ***!
  \**********************/
/***/ ((module) => {

"use strict";
eval("module.exports = JSON.parse('{\"name\":\"guidedstats\",\"version\":\"0.1.0\",\"description\":\"Inline data profiles for pandas dataframes in jupyter\",\"keywords\":[\"jupyter\",\"jupyterlab\",\"jupyterlab-extension\",\"widgets\"],\"files\":[\"lib/**/*.js\",\"dist/*.js\",\"css/*.css\"],\"homepage\":\"https://github.com/cmudig/GuidedStats\",\"bugs\":{\"url\":\"https://github.com/cmudig/GuidedStats/issues\"},\"license\":\"BSD-3-Clause\",\"author\":{\"name\":\"Yuqi(Adam) Zhang\",\"email\":\"admation60@gmail.com\"},\"main\":\"lib/index.js\",\"types\":\"./lib/index.d.ts\",\"repository\":{\"type\":\"git\",\"url\":\"https://github.com/cmudig/GuidedStats\"},\"scripts\":{\"build\":\"webpack --mode=development && jupyter labextension build --development=True .\",\"build:prod\":\"webpack --mode=production && jupyter labextension build .\",\"clean\":\"npm run clean:lib && npm run clean:nbextension && npm run clean:labextension\",\"clean:lib\":\"rimraf lib\",\"clean:labextension\":\"rimraf guidedstats/labextension\",\"clean:nbextension\":\"rimraf guidedstats/nbextension/static/index.js\",\"lint\":\"eslint . --ext .ts,.tsx,.svelte --fix\",\"lint:check\":\"eslint . --ext .ts,.tsx,.svelte\",\"prepack\":\"npm run build:prod\",\"watch\":\"run-p watch:src watch:labextension\",\"watch:src\":\"webpack --watch --mode=development\",\"watch:labextension\":\"jupyter labextension watch .\",\"install:extension\":\"npm ci && jlpm build\"},\"dependencies\":{\"@jupyter-widgets/base\":\"^1.1 || ^2 || ^3 || ^4 || ^6\",\"@jupyterlab/application\":\"^3.4.8\",\"@jupyterlab/notebook\":\"^3.4.8\",\"d3-format\":\"^3.1.0\",\"d3-scale\":\"^4.0.2\",\"d3-shape\":\"^3.1.0\",\"d3-time\":\"^3.0.0\",\"d3-time-format\":\"^4.1.0\",\"lodash\":\"^4.17.21\"},\"devDependencies\":{\"@babel/core\":\"^7.5.0\",\"@babel/preset-env\":\"^7.5.0\",\"@gitgraph/js\":\"^1.4.0\",\"@jupyterlab/builder\":\"^3.0.0\",\"@tsconfig/svelte\":\"^2.0.1\",\"@types/dagre-d3\":\"^0.6.3\",\"@types/lodash\":\"^4.14.186\",\"@types/webpack-env\":\"^1.13.6\",\"@typescript-eslint/eslint-plugin\":\"^3.6.0\",\"@typescript-eslint/parser\":\"^3.6.0\",\"acorn\":\"^7.2.0\",\"autoprefixer\":\"^10.4.12\",\"css-loader\":\"^3.2.0\",\"cytoscape-dagre\":\"^2.5.0\",\"d3\":\"^7.8.5\",\"dagre\":\"^0.8.5\",\"dagre-d3\":\"^0.6.4\",\"eslint\":\"^7.4.0\",\"eslint-config-prettier\":\"^6.11.0\",\"eslint-plugin-prettier\":\"^3.1.4\",\"eslint-plugin-svelte3\":\"^3.2.0\",\"fs-extra\":\"^7.0.0\",\"gitgraph\":\"^0.0.1\",\"identity-obj-proxy\":\"^3.0.0\",\"mkdirp\":\"^0.5.1\",\"npm-run-all\":\"^4.1.3\",\"postcss\":\"^8.4.17\",\"prettier\":\"^2.0.5\",\"prettier-plugin-svelte\":\"^2.7.1\",\"rimraf\":\"^2.6.2\",\"source-map-loader\":\"^1.1.3\",\"style-loader\":\"^1.0.0\",\"stylelint\":\"^14.13.0\",\"stylelint-config-prettier\":\"^9.0.3\",\"stylelint-config-recommended\":\"^7.0.0\",\"stylelint-config-standard\":\"~25.0.0\",\"stylelint-prettier\":\"^2.0.0\",\"svelte\":\"^3.50.1\",\"svelte-collapse\":\"^0.1.1\",\"svelte-loader\":\"^3.1.1\",\"svelte-loading-spinners\":\"^0.1.7\",\"svelte-preprocess\":\"4.7.0\",\"svg-url-loader\":\"^8.0.0\",\"tailwindcss\":\"^3.1.8\",\"ts-loader\":\"^8.0.0\",\"typescript\":\"~4.1.3\",\"webpack\":\"^5.74.0\",\"webpack-cli\":\"^4.0.0\"},\"jupyterlab\":{\"extension\":\"lib/index\",\"outputDir\":\"guidedstats/labextension/\",\"sharedPackages\":{\"@jupyter-widgets/base\":{\"bundled\":false,\"singleton\":true},\"@jupyterlab/notebook\":{\"bundled\":false,\"singleton\":true}}},\"jupyter-releaser\":{\"hooks\":{\"before-build-npm\":[\"python -m pip install jupyterlab~=3.1\",\"jlpm\"],\"before-build-python\":[\"jlpm clean\"]}}}');\n\n//# sourceURL=webpack://guidedstats/./package.json?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nested_webpack_require_11942__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __nested_webpack_require_11942__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__nested_webpack_require_11942__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__nested_webpack_require_11942__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__nested_webpack_require_11942__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__nested_webpack_require_11942__.o(definition, key) && !__nested_webpack_require_11942__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__nested_webpack_require_11942__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__nested_webpack_require_11942__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __nested_webpack_require_11942__("./src/plugin.ts");
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));;

/***/ })

}]);
//# sourceMappingURL=lib_index_js.d7358eac05a04db8d174.js.map
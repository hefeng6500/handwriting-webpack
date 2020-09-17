(function(modules) {

  var installedModules = {};
  
	function __webpack_require__(moduleId) {

		if(installedModules[moduleId]) {
			return installedModules[moduleId].exports;
		}
		var module = installedModules[moduleId] = {
			i: moduleId,
			l: false,
			exports: {}
    };
    
    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    
    module.l = true;
    
		return module.exports;
	}
	return __webpack_require__(__webpack_require__.s = "./src\index.js");
})
({
	
		"./src\index.js": (function(module, exports, __webpack_require__) {
			eval(`const a = __webpack_require__("./src\\js\\module-a.js");

__webpack_require__("./src\\css\\module-css-a.less");

console.log(a);`);
		}),
	
		"./src\js\module-a.js": (function(module, exports, __webpack_require__) {
			eval(`const b = __webpack_require__("./src\\js\\module-b.js");

console.log(b);
module.exports = b;`);
		}),
	
		"./src\js\module-b.js": (function(module, exports, __webpack_require__) {
			eval(`const info = {
  name: "Nicholas C.Zakas",
  books: ["JavaScript高级程序设计"]
};
module.exports = info;`);
		}),
	
		"./src\css\module-css-a.less": (function(module, exports, __webpack_require__) {
			eval(`let style = document.createElement('style');
style.innerText = "body {\\n  background-color: red;\\n}\\nbody h1 {\\n  color: blue;\\n}\\n";
document.head.appendChild(style);`);
		}),
	
});
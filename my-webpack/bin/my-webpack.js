#! /usr/bin/env node

console.log("start")



const path = require("path")
// 1、拿到 webpack.config.js
const config = require(path.resolve('webpack.config.js'))

const Compiler = require('../lib/compiler.js')
let compiler = new Compiler(config);

compiler.run();
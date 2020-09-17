const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const generator = require("@babel/generator").default;
const ejs = require("ejs");

const {
  SyncHook,
  AsyncSeriesHook,
} = require("tapable");

class Compiler {
  constructor(config) {
    this.config = config;
    this.entryId;
    this.modules = {};

    this.entry = config.entry;
    this.root = process.cwd();

    this.hooks = {
      entryOption: new SyncHook(),
      compile: new SyncHook(),
      afterCompile: new SyncHook(),
      afterPlugins: new SyncHook(),
      run: new SyncHook(),
      emit: new AsyncSeriesHook(["compilation"]),
      done: new SyncHook(),
    };
    
    let plugins = config.plugins || [];
		
		this.plugins = plugins;
		
    for (let i = 0, len = plugins.length; i < len; i++) {
      plugins[i].apply(this);
		}
		
    this.hooks.afterPlugins.call();

	}
	
  run() {
    this.hooks.run.call();
    this.hooks.compile.call();
    this.buildModule(path.resolve(this.root, this.entry), true);
    this.hooks.afterCompile.call();
    this.emitFile();
    this.hooks.emit.callAsync();
    this.hooks.done.call();
	}
	
  buildModule(modulePath, isEntry) {
    let source = this.getSource(modulePath);
    let moduleName = "./" + path.relative(this.root, modulePath);
    if (isEntry) {
      this.entryId = moduleName;
    }
    let { sourceCode, dependencies } = this.parse(
      source,
      path.dirname(moduleName)
    );
    this.modules[moduleName] = sourceCode;

    for (let i = 0, len = dependencies.length; i < len; i++) {
      let dep = dependencies[i];
      this.buildModule(path.join(this.root, dep), false);
    }
	}
	
  getSource(modulePath) {
    let content = fs.readFileSync(modulePath, "utf8");
    let rules = this.config.module.rules;
    for (let i = 0, len = rules.length; i < len; i++) {
      let rule = rules[i];
      let { test, use } = rule;
      if (test.test(modulePath)) {
        for (let j = use.length - 1; j >= 0; j--) {
          let loader = require(use[j]);
          content = loader(content);
        }
      }
    }
    return content;
	}
	
  parse(source, parentPath) {
    let ast = parser.parse(source);
    let dependencies = [];
    traverse(ast, {
      CallExpression(p) {
        let node = p.node;
        if (node.callee.name === "require") {
          node.callee.name = "__webpack_require__";
          let moduleName = node.arguments[0].value;
          moduleName += path.extname(moduleName) ? "" : ".js";
          moduleName = "./" + path.join(parentPath, moduleName);
          dependencies.push(moduleName);
          node.arguments = [t.stringLiteral(moduleName)];
        }
      },
    });
    let sourceCode = generator(ast).code;
    return { sourceCode, dependencies };
	}
	
  emitFile() {
    let output = this.config.output;
    let main = path.join(output.path, output.filename);
    let templateStr = this.getSource(path.join(__dirname, "template.ejs"));
    let code = ejs.render(templateStr, {
      entryId: this.entryId,
      modules: this.modules,
    });
    this.assets = {};
    this.assets[main] = code;
    fs.writeFileSync(main, this.assets[main]);
  }
}

module.exports = Compiler;

"use strict";
const path = require("path");

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = autoLazy;
function slash(path) {
  const isExtendedLengthPath = /^\\\\\?\\/.test(path);
  const hasNonAscii = /[^\u0000-\u0080]+/.test(path); // eslint-disable-line no-control-regex

  if (isExtendedLengthPath || hasNonAscii) {
    return path;
  }

  return path.replace(/\\/g, "/");
}

function autoLazy(config) {
  return {
    name: "auto-lazy",
    // ensure we get vanilla version
    enforce: "pre",
    transform(src, id) {
      let tmpStr = src;
      if (id.includes(slash(path.resolve("./src")))) {
        Object.keys(config).forEach((moduleName) => {
          if (id.includes(moduleName)) {
            for (let i = 0, l = config[moduleName].length; i < l; i += 1) {
              const lazyModuleConfig = config[moduleName][i];

              tmpStr = tmpStr.replace(
                `import ${lazyModuleConfig.name} from '${lazyModuleConfig.path}';`,
                `${
                  (i === 0 &&
                    !tmpStr.includes("import LazyBundle") &&
                    'import LazyBundle from "utils/LazyBundle";') ||
                  ""
                }
                const ${
                  lazyModuleConfig.name
                } = props => <LazyBundle load={() => import(/* webpackChunkName: "${
                  lazyModuleConfig.name
                }" */ "${
                  lazyModuleConfig.path
                }")}>{Module => <Module {...props} />}</LazyBundle>;`
              );
            }
          }
        });
      }

      return tmpStr;
    },
  };
}

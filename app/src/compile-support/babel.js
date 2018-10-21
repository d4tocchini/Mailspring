'use strict';
const crypto = require('crypto');
const path = require('path');
// const fs = require('fs');
let babel = undefined;
const { keepRightUntil } = require('string');
// const e = require('electron');
// const { appIsPackaged } = (e.remote === undefined ? e : e.remote).app;
const COMPILED_EXTS = {
  jsx: true,
  es6: true,
  js: false,
  ts: false,
};
const options = {
  // minified: true,
  comments: false,
  babelrc: false,
  presets: [
    // [
    //     'babel-preset-env',
    //     {
    //         modules: false,
    //         targets: {
    //             // electron: ELECTRON_VERSION,
    //             "chrome": "66",
    //             node: process.versions.node
    //         }
    //     }
    // ],
    // require.resolve('@babel/preset-flow'),
    [
      require.resolve('@babel/preset-react'),
      {
        // "pragma": "dom", // default pragma is React.createElement
        // "pragmaFrag": "DomFrag", // default is React.Fragment
        // "throwIfNamespace": false // defaults to true
      },
    ],
    // [
    //     require.resolve("@babel/preset-env"),
    //     {
    //         "targets": {
    //             // "esmodules": true
    //             "node":'current',
    //             // chrome: 69,
    //         },
    //         "modules":"commonjs",
    //     }
    //   ]
    // 'babel-preset-stage-1'
  ],
  plugins: [
    [require.resolve('@babel/plugin-transform-flow-strip-types'), {}],
    [
      require.resolve('@babel/plugin-proposal-object-rest-spread'),
      {
        useBuiltIns: true,
      },
    ],
    // https://babeljs.io/docs/en/next/babel-plugin-transform-modules-commonjs.html
    [
      require.resolve('@babel/plugin-transform-modules-commonjs'),
      {
        // loose: true,
        // "strict":true,
        // "noInterop":true,
      },
    ],
    [
      require.resolve('@babel/plugin-proposal-class-properties'),
      {
        loose: true,
      },
    ],
    /*
     require.resolve('@babel/plugin-proposal-export-namespace-from'),
    */
  ],
};

// var babel = null;
var babelVersionDirectory = null;

// This adds in the regeneratorRuntime for generators to work properly
// We manually insert it here instead of using the kitchen-sink
// babel-polyfill.
// require('babel-regenerator-runtime');

// We run babel with lots of different working directories (like plugin folders).
// To make sure presets always resolve to the correct path inside N1, resolve
// them to their absolute paths ahead of time.
// const babelPath = path.resolve(path.join(__dirname, '..', '..', '.babelrc'));
// var defaultOptions = JSON.parse(fs.readFileSync(babelPath));
// defaultOptions.presets = (defaultOptions.presets || []).map(modulename =>
//   require.resolve(`babel-preset-${modulename}`)
// );
// defaultOptions.plugins = (defaultOptions.plugins || []).map(modulename =>
//   require.resolve(`babel-plugin-${modulename}`)
// );

exports.shouldCompile = function(sourceCode, filePath) {
  const ext = keepRightUntil(filePath, '.');
  return COMPILED_EXTS[ext] || false;
};

exports.getCachePath = function(sourceCode) {
  if (babelVersionDirectory == null) {
    babelVersionDirectory = path.join(
      'js',
      'babel',
      createVersionAndOptionsDigest(require('@babel/core/package.json').version, options)
    );
  }
  return path.join(
    babelVersionDirectory,
    crypto
      .createHash('sha1')
      .update(sourceCode, 'utf8')
      .digest('hex') + '.js'
  );
};

exports.compile = function(sourceCode, filePath) {
  babel || (babel = require('@babel/core'));
  // var options = { filename: filePath };
  // for (var key in defaultOptions) {
  //   options[key] = defaultOptions[key];
  // }
  return babel.transformSync(sourceCode, options).code;
  // return babel.transform(sourceCode, options).code;
};

function createVersionAndOptionsDigest(version, options) {
  return crypto
    .createHash('sha1')
    .update('babel-core', 'utf8')
    .update('\0', 'utf8')
    .update(version, 'utf8')
    .update('\0', 'utf8')
    .update(JSON.stringify(options), 'utf8')
    .digest('hex');
}
